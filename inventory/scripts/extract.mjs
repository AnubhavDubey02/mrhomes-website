/**
 * extract.mjs  —  Step 1 of the inventory pipeline
 *
 * Recursively scans inventory/raw/<source>/ for image files,
 * calls GPT-4 Vision OCR on each, and writes the raw extracted
 * records to inventory/processed/<source>/<filename>.json
 *
 * Usage:
 *   node extract.mjs
 *
 * Environment variables (set in .env):
 *   OPENAI_API_KEY   Required for OpenAI backend
 *   OPENAI_MODEL     Default: gpt-4o
 *   OCR_BACKEND      Default: openai  |  use "mock" for dry-runs
 */

import 'dotenv/config';
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { join, relative, extname, basename, dirname } from 'path';
import { fileURLToPath }  from 'url';
import { extractFromImage } from './lib/ocr.mjs';
import { appendLog }        from './lib/writer.mjs';
import { generateRunId }    from './lib/history.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');

const RAW_ROOT       = join(ROOT, 'raw');
const PROCESSED_ROOT = join(ROOT, 'processed');
const LOG_FILE       = join(ROOT, 'output', 'logs', 'extraction_log.txt');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

// Source folders exactly matching raw/ subdirectory names
const SOURCES = ['dore', 'fnf', 's2l', 'local-brokers'];

// ─── Utilities ────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(msg);
  appendLog(msg, LOG_FILE);
}

/** Recursively collect image file paths under a directory. */
function collectImages(dir) {
  const results = [];
  if (!statSync(dir, { throwIfNoEntry: false })) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImages(full));
    } else if (IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

/** Derive a processed output path for a given raw image path. */
function processedPath(imagePath, source) {
  const rel  = relative(join(RAW_ROOT, source), imagePath);
  const base = rel.replace(/\//g, '_').replace(/\\/g, '_');
  return join(PROCESSED_ROOT, source, `${base}.json`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function runExtract() {
  log('=== EXTRACT STEP START ===');
  const runId = generateRunId();
  log(`Run ID: ${runId}`);

  let totalImages  = 0;
  let totalRecords = 0;
  let totalErrors  = 0;

  for (const source of SOURCES) {
    const sourceDir = join(RAW_ROOT, source);
    const images    = collectImages(sourceDir);

    if (images.length === 0) {
      log(`[${source}] No images found — skipping.`);
      continue;
    }

    log(`[${source}] Found ${images.length} image(s).`);

    for (const imagePath of images) {
      const rel = relative(RAW_ROOT, imagePath);
      log(`[${source}] Processing: ${rel}`);

      const { records, error } = await extractFromImage(imagePath, source);

      const outPath = processedPath(imagePath, source);
      mkdirSync(dirname(outPath), { recursive: true });

      const payload = {
        _meta: {
          source,
          raw_file:            rel,
          source_folder:       `raw/${source}`,
          extraction_run_id:   runId,
          extracted_at:        new Date().toISOString(),
          record_count:        records.length,
          error:               error ?? null,
        },
        records,
      };

      writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');

      if (error) {
        log(`[${source}] ERROR on ${rel}: ${error}`);
        totalErrors++;
      } else {
        log(`[${source}] Extracted ${records.length} record(s) from ${rel}`);
        totalRecords += records.length;
      }

      totalImages++;
    }
  }

  const summary = `=== EXTRACT COMPLETE | images: ${totalImages} | records: ${totalRecords} | errors: ${totalErrors} ===`;
  log(summary);
  return { totalImages, totalRecords, totalErrors };
}

// Run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runExtract().catch(err => {
    console.error('Fatal error in extract step:', err);
    process.exit(1);
  });
}
