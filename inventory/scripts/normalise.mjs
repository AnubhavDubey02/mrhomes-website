/**
 * normalise.mjs  —  Step 2 of the inventory pipeline
 *
 * Reads all processed/<source>/*.json files produced by extract.mjs,
 * applies field normalization and deduplication, then writes:
 *
 *   output/master/master_records.json   — approved records (all required fields present)
 *   output/review/review_records.json   — flagged records (missing fields or uncertain values)
 *
 * MH_IDs are sequential and persisted in output/master/id-counter.json
 * so IDs remain stable across incremental pipeline runs.
 *
 * Usage:
 *   node normalise.mjs
 */

import 'dotenv/config';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { blankRecord, validateRecord, CONFIDENCE_WEIGHTS, CONFIDENCE_TIERS } from './lib/schema.mjs';
import {
  normalizeFloor,
  normalizeAvailability,
  normalizeSector,
  normalizeRent,
  normalizePropertyType,
  normalizeFurnishing,
} from './lib/normalizers.mjs';
import { deduplicateRecords }                               from './lib/deduplicator.mjs';
import { appendLog }                                        from './lib/writer.mjs';
import { generateRunId, processHistoryBatch, appendHistoryCSV } from './lib/history.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');

const PROCESSED_ROOT  = join(ROOT, 'processed');
const MASTER_DIR      = join(ROOT, 'output', 'master');
const REVIEW_DIR      = join(ROOT, 'output', 'review');
const LOG_FILE        = join(ROOT, 'output', 'logs', 'extraction_log.txt');
const COUNTER_FILE    = join(MASTER_DIR, 'id-counter.json');
const MASTER_JSON     = join(MASTER_DIR, 'master_records.json');
const REVIEW_JSON     = join(REVIEW_DIR, 'review_records.json');
const HISTORY_FILE    = join(ROOT, 'output', 'logs', 'inventory_history.csv');

const SOURCES = ['dore', 'fnf', 's2l', 'local-brokers'];

// ─── Utilities ────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(msg);
  appendLog(msg, LOG_FILE);
}

function loadCounter() {
  if (!existsSync(COUNTER_FILE)) return 0;
  try { return JSON.parse(readFileSync(COUNTER_FILE, 'utf8')).last_id ?? 0; }
  catch { return 0; }
}

function saveCounter(n) {
  mkdirSync(MASTER_DIR, { recursive: true });
  writeFileSync(COUNTER_FILE, JSON.stringify({ last_id: n }, null, 2), 'utf8');
}

function nextId(counter) {
  return `MRH-${String(counter).padStart(4, '0')}`;
}

/** Collect all .json files (non-recursive) from a directory. */
function collectJSON(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => join(dir, f));
}

// ─── Confidence scoring

function scoreConfidence(record) {
  return Object.entries(CONFIDENCE_WEIGHTS).reduce((acc, [field, weight]) => {
    const v = record[field];
    return acc + (v != null && v !== '' ? weight : 0);
  }, 0);
}

// ─── Field normalisation ──────────────────────────────────────────────────────

/**
 * Normalise a single raw OCR record into the canonical schema.
 * Returns { record, flags } where flags is an array of field-level issues.
 *
 * @param {object} raw     Raw record from OCR
 * @param {string} source  Source identifier
 * @returns {{ record: object, flags: string[] }}
 */
function normaliseRecord(raw, source) {
  const record = blankRecord();
  const flags  = [];

  record.Source               = source;
  record.Source_Property_Ref  = raw.source_property_ref ?? null;
  record.Source_Room_No       = raw.source_room_no       ?? null;

  // Property Type
  const pt = normalizePropertyType(raw.property_type);
  record.Property_Type = pt.value;
  if (pt.flagged) flags.push(`Property_Type: could not map "${raw.property_type}"`);

  // Sector
  const sec = normalizeSector(raw.sector);
  record.Sector = sec.value;
  if (sec.flagged) flags.push(`Sector: could not map "${raw.sector}"`);

  // Locality
  record.Locality = raw.locality ?? null;

  // Rent
  const rent = normalizeRent(raw.rent);
  record.Rent = rent.value;
  if (rent.flagged) flags.push(`Rent: could not parse "${raw.rent}"`);

  // Availability
  const avail = normalizeAvailability(raw.availability);
  record.Availability_Status = avail.status;
  record.Availability_Date   = avail.date ?? null;
  if (avail.flagged) flags.push(`Availability: could not parse "${raw.availability}"`);

  // Furnishing
  const furn = normalizeFurnishing(raw.furnishing);
  record.Furnishing = furn.value;
  if (furn.flagged) flags.push(`Furnishing: could not map "${raw.furnishing}"`);

  // Floor
  const floor = normalizeFloor(raw.floor);
  record.Floor = floor.value;
  if (floor.flagged) flags.push(`Floor: could not map "${raw.floor}"`);

  // Booleans
  record.Balcony = raw.balcony ?? null;
  record.Lift    = raw.lift    ?? null;

  // Photos
  record.Photos = null; // populated separately via photos/ folder

  // Defaults
  record.Website_Show   = false;
  record.Listing_Status = 'Draft';

  // Notes — merge OCR notes with pipeline flags
  const ocrNotes = raw.notes ?? null;
  record.Notes   = flags.length > 0
    ? [ocrNotes, `[Pipeline flags: ${flags.join('; ')}]`].filter(Boolean).join(' | ')
    : ocrNotes;

  return { record, flags };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function runNormalise() {
  log('=== NORMALISE STEP START ===');

  const runId  = generateRunId();
  log(`Run ID: ${runId}`);

  let counter      = loadCounter();
  const allRecords = [];

  // Collect and normalise all processed records, respecting source priority
  // (dore first → fnf → s2l → local-brokers, so higher-authority records
  // are assigned earlier IDs and win in deduplication)
  for (const source of SOURCES) {
    const sourceDir = join(PROCESSED_ROOT, source);
    const files     = collectJSON(sourceDir);

    if (files.length === 0) {
      log(`[${source}] No processed files found.`);
      continue;
    }

    for (const file of files) {
      let payload;
      try {
        payload = JSON.parse(readFileSync(file, 'utf8'));
      } catch (err) {
        log(`[${source}] Could not parse ${file}: ${err.message}`);
        continue;
      }

      // Pull provenance from _meta — propagated to every record from this file
      const meta = payload._meta ?? {};

      for (const raw of (payload.records ?? [])) {
        const { record, flags } = normaliseRecord(raw, source);

        // Attach screenshot / run provenance
        record.Screenshot_File   = meta.raw_file            ?? null;
        record.Source_Folder     = meta.source_folder       ?? `raw/${source}`;
        record.Processed_At      = meta.extracted_at        ?? new Date().toISOString();
        record.Extraction_Run_ID = meta.extraction_run_id   ?? runId;

        // Confidence score (0-100)
        const score = scoreConfidence(record);
        record.Confidence_Score = score;

        // Hard validation: only 3 core fields (Sector, Property_Type, Rent)
        const { missing, invalid } = validateRecord(record);

        const reviewReasons = [
          missing.length ? `Missing core: ${missing.join(', ')}` : null,
          invalid.length ? `Invalid enum: ${invalid.join(', ')}` : null,
          flags.length   ? `Field issues: ${flags.join('; ')}`   : null,
        ].filter(Boolean);

        // Tier routing
        if (missing.length > 0) {
          record.Review_Status = score >= CONFIDENCE_TIERS.LOW ? 'Needs Review' : 'Needs Manual Review';
          record.Review_Reason = reviewReasons.join(' | ');
        } else if (score >= CONFIDENCE_TIERS.HIGH) {
          record.Review_Status = 'Approved';
          record.Review_Reason = reviewReasons.length ? reviewReasons.join(' | ') : null;
        } else if (score >= CONFIDENCE_TIERS.LOW) {
          record.Review_Status = 'Needs Review';
          record.Review_Reason = [`Score ${score}/100 (master threshold: ${CONFIDENCE_TIERS.HIGH})`, ...reviewReasons].join(' | ');
        } else {
          record.Review_Status = 'Needs Manual Review';
          record.Review_Reason = [`Score ${score}/100 (low confidence threshold: ${CONFIDENCE_TIERS.LOW})`, ...reviewReasons].join(' | ');
        }

        if (record.Review_Reason) {
          record.Notes = record.Notes ? `${record.Notes} | ${record.Review_Reason}` : record.Review_Reason;
        }

        allRecords.push(record);
      }
    }
  }

  log(`Normalised ${allRecords.length} total record(s). Running deduplication...`);

  allRecords.forEach((r, i) => { r._tmp_idx = i; });
  const deduped = deduplicateRecords(allRecords);

  // ── History: match records against history, reuse existing MH_IDs ─────────
  log('Running history comparison...');
  const { newEntries, staleKeys } = processHistoryBatch(deduped, runId, HISTORY_FILE);
  if (staleKeys.length > 0) {
    log(`Stale listings flagged for removal: ${staleKeys.length}`);
  }

  // ── Assign MH_IDs ─────────────────────────────────────────────────────────
  // Records returning from history already have their MH_ID reattached by
  // processHistoryBatch. Only truly NEW records need a fresh sequential ID.
  for (const r of deduped) {
    if (r.Duplicate_Check !== 'Duplicate' && !r.MH_ID) {
      counter++;
      r.MH_ID = nextId(counter);
    }
  }
  saveCounter(counter);

  // ── Write history CSV (append-only) ────────────────────────────────────────
  appendHistoryCSV(newEntries, HISTORY_FILE);
  log(`History entries appended: ${newEntries.length}`);

  // Split master vs review
  const master = deduped.filter(
    r => r.Review_Status === 'Approved' && r.Duplicate_Check !== 'Duplicate',
  );
  const review = deduped.filter(
    r => r.Review_Status !== 'Approved' || r.Duplicate_Check === 'Duplicate',
  );

  const tierCounts = deduped.reduce((acc, r) => { acc[r.Review_Status] = (acc[r.Review_Status] ?? 0) + 1; return acc; }, {});
  const scores = deduped.map(r => r.Confidence_Score ?? 0);
  log(`Tier breakdown: ${JSON.stringify(tierCounts)}`);
  log(`Score range: min=${Math.min(...scores)} max=${Math.max(...scores)} avg=${Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)}`);

  // Clean up temp field
  [...master, ...review].forEach(r => { delete r._tmp_idx; });

  // Write outputs
  mkdirSync(MASTER_DIR, { recursive: true });
  mkdirSync(REVIEW_DIR,  { recursive: true });
  writeFileSync(MASTER_JSON, JSON.stringify(master, null, 2), 'utf8');
  writeFileSync(REVIEW_JSON, JSON.stringify(review, null, 2), 'utf8');

  const summary = `=== NORMALISE COMPLETE | total: ${allRecords.length} | master: ${master.length} | review: ${review.length} ===`;
  log(summary);
  return { total: allRecords.length, master: master.length, review: review.length };
}

// Run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runNormalise().catch(err => {
    console.error('Fatal error in normalise step:', err);
    process.exit(1);
  });
}
