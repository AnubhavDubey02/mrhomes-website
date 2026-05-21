/**
 * export.mjs  —  Step 3 of the inventory pipeline
 *
 * Reads:
 *   output/master/master_records.json
 *   output/review/review_records.json
 *
 * Generates:
 *   output/master/master_inventory.xlsx     — full inventory with admin columns
 *   output/exports/master_inventory.csv     — flat CSV for CRM / spreadsheet use
 *   output/exports/master_inventory.xlsx    — shareable copy (same as master XLSX)
 *   output/review/review_flags.xlsx         — flagged records for human review
 *   output/logs/extraction_log.txt          — appended run summary
 *
 * Usage:
 *   node export.mjs
 */

import 'dotenv/config';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath }  from 'url';

import { writeMasterXLSX, writeReviewXLSX, writeCSV, appendLog } from './lib/writer.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');

const MASTER_JSON  = join(ROOT, 'output', 'master', 'master_records.json');
const REVIEW_JSON  = join(ROOT, 'output', 'review', 'review_records.json');
const LOG_FILE     = join(ROOT, 'output', 'logs', 'extraction_log.txt');

const OUT_MASTER_XLSX  = join(ROOT, 'output', 'master',  'master_inventory.xlsx');
const OUT_EXPORTS_XLSX = join(ROOT, 'output', 'exports', 'master_inventory.xlsx');
const OUT_EXPORTS_CSV  = join(ROOT, 'output', 'exports', 'master_inventory.csv');
const OUT_REVIEW_XLSX  = join(ROOT, 'output', 'review',  'review_flags.xlsx');

// ─── Utilities ────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(msg);
  appendLog(msg, LOG_FILE);
}

function loadJSON(path, fallback = []) {
  if (!existsSync(path)) {
    log(`Warning: ${path} not found — using empty array.`);
    return fallback;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    log(`Error reading ${path}: ${err.message}`);
    return fallback;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function runExport() {
  log('=== EXPORT STEP START ===');

  const masterRecords = loadJSON(MASTER_JSON);
  const reviewRecords = loadJSON(REVIEW_JSON);

  log(`Loaded ${masterRecords.length} master record(s) and ${reviewRecords.length} review record(s).`);

  // Ensure output directories exist
  for (const dir of [
    join(ROOT, 'output', 'master'),
    join(ROOT, 'output', 'exports'),
    join(ROOT, 'output', 'review'),
  ]) {
    mkdirSync(dir, { recursive: true });
  }

  // ── master_inventory.xlsx (output/master/) ───────────────────────────────
  log('Writing output/master/master_inventory.xlsx ...');
  await writeMasterXLSX(masterRecords, OUT_MASTER_XLSX);
  log(`✓ master_inventory.xlsx — ${masterRecords.length} row(s)`);

  // ── master_inventory.xlsx (output/exports/) — shareable copy ────────────
  log('Writing output/exports/master_inventory.xlsx ...');
  await writeMasterXLSX(masterRecords, OUT_EXPORTS_XLSX);
  log(`✓ exports/master_inventory.xlsx — ${masterRecords.length} row(s)`);

  // ── master_inventory.csv (output/exports/) ───────────────────────────────
  log('Writing output/exports/master_inventory.csv ...');
  writeCSV(masterRecords, OUT_EXPORTS_CSV);
  log(`✓ master_inventory.csv — ${masterRecords.length} row(s)`);

  // ── review_flags.xlsx (output/review/) ───────────────────────────────────
  log('Writing output/review/review_flags.xlsx ...');
  await writeReviewXLSX(reviewRecords, OUT_REVIEW_XLSX);
  log(`✓ review_flags.xlsx — ${reviewRecords.length} row(s)`);

  const summary = `=== EXPORT COMPLETE | master: ${masterRecords.length} | review: ${reviewRecords.length} ===`;
  log(summary);

  return { master: masterRecords.length, review: reviewRecords.length };
}

// Run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runExport().catch(err => {
    console.error('Fatal error in export step:', err);
    process.exit(1);
  });
}
