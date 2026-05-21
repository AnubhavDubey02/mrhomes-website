/**
 * history.mjs
 * Append-only inventory history tracker.
 *
 * Responsibilities:
 *   1. Load existing history from inventory_history.csv
 *   2. Match incoming records against history via composite key
 *   3. Classify each record: NEW | UPDATED | UNCHANGED | REMOVED
 *   4. Reuse existing MH_IDs for returning records (ID stability across runs)
 *   5. Detect stale records (not seen for >= stale_after_days)
 *   6. Append new history rows — NEVER overwrite existing rows
 *
 * History CSV is append-only. The current state of any listing is always
 * the LATEST row for that History_Key.
 */

import {
  readFileSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  mkdirSync,
} from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath }  from 'url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = join(__dirname, '../../config');

// ─── Config ───────────────────────────────────────────────────────────────────

let _cfg = null;
function cfg() {
  if (!_cfg) _cfg = JSON.parse(readFileSync(join(CONFIG_DIR, 'history-config.json'), 'utf8'));
  return _cfg;
}

// ─── Run ID ───────────────────────────────────────────────────────────────────

/**
 * Generate a human-readable, sortable run identifier.
 * Format: RUN-YYYYMMDD-HHmmss
 */
export function generateRunId() {
  const n   = new Date();
  const pad = v => String(v).padStart(2, '0');
  return `RUN-${n.getFullYear()}${pad(n.getMonth() + 1)}${pad(n.getDate())}-${pad(n.getHours())}${pad(n.getMinutes())}${pad(n.getSeconds())}`;
}

// ─── History key ──────────────────────────────────────────────────────────────

/**
 * Build the composite lookup key for a record.
 * Matches records across extraction runs without depending on MH_ID.
 */
export function buildHistoryKey(record) {
  const fields = cfg().history_key_fields ?? [
    'Source', 'Source_Property_Ref', 'Source_Room_No', 'Property_Type', 'Sector',
  ];
  return fields
    .map(f => (record[f] ?? '').toString().trim().toLowerCase())
    .join('::');
}

// ─── Minimal CSV helpers (no external dependency) ────────────────────────────

const HISTORY_COLUMNS = [
  'Run_ID',
  'MH_ID',
  'History_Key',
  'Screenshot_File',
  'Source_Folder',
  'Processed_At',
  'Created_At',
  'Updated_At',
  'Last_Seen',
  'Change_Type',
  'Changed_Fields',
  'Snapshot_Rent',
  'Snapshot_Availability',
  'Snapshot_Furnishing',
  'Snapshot_Floor',
];

function escCSV(v) {
  const s = v == null ? '' : String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

/** Parses a single RFC-4180 CSV line into fields. */
function parseCSVLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) {
      out.push(cur); cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

// ─── Load history ─────────────────────────────────────────────────────────────

/**
 * Load the history CSV and return a Map<History_Key → latest row object>.
 * Since the file is append-only, iterating all rows and overwriting the map
 * entry gives us the latest state for each key automatically.
 *
 * @param {string} historyFile  Absolute path to inventory_history.csv
 * @returns {Map<string, object>}
 */
export function loadHistory(historyFile) {
  const map = new Map();
  if (!existsSync(historyFile)) return map;

  const lines = readFileSync(historyFile, 'utf8').split('\n').filter(l => l.trim());
  if (lines.length < 2) return map;

  const headers = parseCSVLine(lines[0]);

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row    = Object.fromEntries(headers.map((h, idx) => [h, values[idx] ?? '']));
    if (row.History_Key) map.set(row.History_Key, row);
  }

  return map;
}

// ─── Snapshot helpers ─────────────────────────────────────────────────────────

function snapshot(record) {
  const tracked = cfg().tracked_fields ?? ['Rent', 'Availability_Status', 'Furnishing', 'Floor'];
  return Object.fromEntries(tracked.map(f => [f, (record[f] ?? '').toString()]));
}

function prevSnapshot(row) {
  return {
    Rent:                row.Snapshot_Rent         ?? '',
    Availability_Status: row.Snapshot_Availability ?? '',
    Furnishing:          row.Snapshot_Furnishing   ?? '',
    Floor:               row.Snapshot_Floor        ?? '',
  };
}

function changedFields(prev, curr) {
  return Object.keys(curr).filter(k => (prev[k] ?? '') !== (curr[k] ?? ''));
}

// ─── Main batch processor ─────────────────────────────────────────────────────

/**
 * Process a batch of normalised records against existing history.
 *
 * For each record:
 *   - Looks up history via composite key
 *   - Attaches: Created_At, Updated_At, Last_Seen, Change_Type, traceability fields
 *   - Reuses the existing MH_ID if one exists (ID stability across runs)
 *
 * After processing all records, sweeps history for entries not seen in this run
 * and flags listings stale for >= stale_after_days as REMOVED.
 *
 * @param {object[]} records      Normalised records (mutated in-place)
 * @param {string}   runId        Current run identifier
 * @param {string}   historyFile  Absolute path to history CSV
 * @returns {{ newEntries: object[], staleKeys: string[] }}
 */
export function processHistoryBatch(records, runId, historyFile) {
  const now        = new Date().toISOString();
  const staleDays  = cfg().stale_detection?.stale_after_days ?? 30;
  const historyMap = loadHistory(historyFile);
  const newEntries = [];
  const seenKeys   = new Set();

  for (const record of records) {
    const key      = buildHistoryKey(record);
    const existing = historyMap.get(key);
    const snap     = snapshot(record);

    seenKeys.add(key);

    let changeType, createdAt, updatedAt, changed = [];

    if (!existing) {
      changeType = 'NEW';
      createdAt  = now;
      updatedAt  = now;
    } else {
      changed    = changedFields(prevSnapshot(existing), snap);
      changeType = changed.length > 0 ? 'UPDATED' : 'UNCHANGED';
      createdAt  = existing.Created_At || now;
      updatedAt  = changed.length > 0 ? now : (existing.Updated_At || now);

      // Reuse existing MH_ID for record stability (only if our record has none yet)
      if (existing.MH_ID && !record.MH_ID) {
        record.MH_ID = existing.MH_ID;
      }
    }

    // Attach history fields to the record
    record.Created_At        = createdAt;
    record.Updated_At        = updatedAt;
    record.Last_Seen         = now;
    record.Change_Type       = changeType;
    record.Extraction_Run_ID = record.Extraction_Run_ID ?? runId;

    // Queue a history entry (MH_ID may still be null if NEW — filled in after ID assignment)
    newEntries.push({
      Run_ID:                runId,
      MH_ID:                 record.MH_ID ?? '',
      History_Key:           key,
      Screenshot_File:       record.Screenshot_File ?? '',
      Source_Folder:         record.Source_Folder   ?? '',
      Processed_At:          record.Processed_At    ?? now,
      Created_At:            createdAt,
      Updated_At:            updatedAt,
      Last_Seen:             now,
      Change_Type:           changeType,
      Changed_Fields:        changed.join('; '),
      Snapshot_Rent:         snap.Rent                ?? '',
      Snapshot_Availability: snap.Availability_Status ?? '',
      Snapshot_Furnishing:   snap.Furnishing          ?? '',
      Snapshot_Floor:        snap.Floor               ?? '',
      _record_ref:           record, // back-pointer for MH_ID fill-in; stripped before write
    });
  }

  // ── Stale sweep: history entries not seen in this run ─────────────────────
  const staleKeys = [];

  for (const [key, row] of historyMap.entries()) {
    if (seenKeys.has(key))           continue; // appeared in this run
    if (row.Change_Type === 'REMOVED') continue; // already removed

    const lastSeen  = new Date(row.Last_Seen || row.Processed_At || 0);
    const daysSince = (Date.now() - lastSeen.getTime()) / 86_400_000;

    if (daysSince >= staleDays) {
      staleKeys.push(key);
      newEntries.push({
        Run_ID:                runId,
        MH_ID:                 row.MH_ID,
        History_Key:           key,
        Screenshot_File:       '',
        Source_Folder:         '',
        Processed_At:          now,
        Created_At:            row.Created_At,
        Updated_At:            now,
        Last_Seen:             row.Last_Seen,
        Change_Type:           'REMOVED',
        Changed_Fields:        `Stale: absent for ${Math.floor(daysSince)} days (threshold: ${staleDays})`,
        Snapshot_Rent:         row.Snapshot_Rent,
        Snapshot_Availability: row.Snapshot_Availability,
        Snapshot_Furnishing:   row.Snapshot_Furnishing,
        Snapshot_Floor:        row.Snapshot_Floor,
      });
    }
  }

  return { newEntries, staleKeys };
}

// ─── Append to history CSV ────────────────────────────────────────────────────

/**
 * Append new history entries to inventory_history.csv.
 * Creates the file with a header row if it does not yet exist.
 * MH_IDs are synced from their record back-pointers before writing.
 *
 * @param {object[]} entries  Output of processHistoryBatch().newEntries
 * @param {string}   historyFile
 */
export function appendHistoryCSV(entries, historyFile) {
  if (entries.length === 0) return;

  mkdirSync(dirname(historyFile), { recursive: true });

  // Sync any newly assigned MH_IDs from back-pointers, then strip the ref
  for (const e of entries) {
    if (e._record_ref?.MH_ID && !e.MH_ID) {
      e.MH_ID = e._record_ref.MH_ID;
    }
    delete e._record_ref;
  }

  const rows = entries.map(e => HISTORY_COLUMNS.map(c => escCSV(e[c])).join(','));

  if (!existsSync(historyFile)) {
    writeFileSync(
      historyFile,
      [HISTORY_COLUMNS.join(','), ...rows].join('\r\n') + '\r\n',
      'utf8',
    );
  } else {
    appendFileSync(historyFile, rows.join('\r\n') + '\r\n', 'utf8');
  }
}
