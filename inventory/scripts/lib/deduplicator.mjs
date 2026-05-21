/**
 * deduplicator.mjs
 * Detects exact and soft-match duplicate records across all sources.
 *
 * RULES (from business spec):
 *   Composite key for exact duplicate:
 *     Source_Property_Ref + Source_Room_No + Property_Type + Sector
 *
 *   Multiple rooms within the same property are NOT duplicates:
 *     (SC-42, G001, 2bhk, Sector 52) ≠ (SC-42, G002, 2bhk, Sector 52)
 *
 *   Cross-source soft match (→ "Possible Duplicate", sent to review):
 *     Sector + Property_Type + Floor + Furnishing, rent within ±5%
 *
 * Priority: when a hard duplicate exists, the record from the lower-priority
 * number source (higher authority) is kept; the other is marked Duplicate.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG    = join(__dirname, '../../config');

const { sources, deduplication } = JSON.parse(
  readFileSync(join(CONFIG, 'source-priority.json'), 'utf8'),
);

/** Map source id → priority number (lower = higher authority). */
const SOURCE_PRIORITY = Object.fromEntries(sources.map(s => [s.id, s.priority]));
const RENT_TOLERANCE  = (deduplication.rent_tolerance_pct ?? 5) / 100;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function normalize(v) {
  return (v ?? '').toString().trim().toLowerCase();
}

/**
 * Hard-duplicate key: property_ref + room_no + property_type + sector.
 * Empty / null components contribute empty strings so records with null
 * references are not spuriously grouped.
 */
function hardKey(r) {
  return [
    normalize(r.Source_Property_Ref),
    normalize(r.Source_Room_No),
    normalize(r.Property_Type),
    normalize(r.Sector),
  ].join('::');
}

/**
 * Soft-match key: sector + property_type + floor + furnishing.
 * Rent is checked separately with a tolerance band.
 */
function softKey(r) {
  return [
    normalize(r.Sector),
    normalize(r.Property_Type),
    normalize(r.Floor),
    normalize(r.Furnishing),
  ].join('::');
}

function rentClose(a, b) {
  if (a == null || b == null) return false;
  const diff = Math.abs(a - b) / Math.max(a, b);
  return diff <= RENT_TOLERANCE;
}

function sourcePriority(r) {
  return SOURCE_PRIORITY[r.Source] ?? 99;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Run deduplication across a flat array of normalised records.
 * Mutates each record's Duplicate_Check field in-place.
 *
 * @param {object[]} records  Array of normalised inventory records
 * @returns {object[]} Same array with Duplicate_Check and Review_Status populated
 */
export function deduplicateRecords(records) {
  // ── Pass 1: Hard duplicates ─────────────────────────────────────────────────
  // Group by hard key; within each group keep the highest-authority source.
  const hardGroups = new Map(); // key → [record, ...]

  for (const r of records) {
    const k = hardKey(r);
    if (!hardGroups.has(k)) hardGroups.set(k, []);
    hardGroups.get(k).push(r);
  }

  for (const group of hardGroups.values()) {
    if (group.length === 1) {
      group[0].Duplicate_Check = 'Unique';
      continue;
    }
    // Sort by source priority ascending (lower number = higher authority first)
    group.sort((a, b) => sourcePriority(a) - sourcePriority(b));
    group[0].Duplicate_Check = 'Unique'; // winner
    for (let i = 1; i < group.length; i++) {
      group[i].Duplicate_Check = 'Duplicate';
      group[i].Review_Status   = 'Needs Review';
      group[i].Notes = appendNote(
        group[i].Notes,
        `Exact duplicate of ${group[0].MH_ID ?? 'a higher-priority record'} (source: ${group[0].Source}).`,
      );
    }
  }

  // ── Pass 2: Soft / cross-source matches (flag only, do not auto-reject) ─────
  const softGroups = new Map(); // key → [record, ...]

  for (const r of records) {
    if (r.Duplicate_Check === 'Duplicate') continue; // already resolved
    const k = softKey(r);
    if (!softGroups.has(k)) softGroups.set(k, []);
    softGroups.get(k).push(r);
  }

  for (const group of softGroups.values()) {
    if (group.length < 2) continue;

    // Check each pair for rent proximity
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i], b = group[j];
        if (a.Source === b.Source) continue; // same-source handled in pass 1
        if (!rentClose(a.Rent, b.Rent))      continue;

        // Flag both as possible duplicate — human review required
        if (a.Duplicate_Check !== 'Duplicate') {
          a.Duplicate_Check = 'Possible Duplicate';
          a.Review_Status   = a.Review_Status ?? 'Needs Review';
          a.Notes = appendNote(a.Notes, `Possible cross-source duplicate with ${b.Source}.`);
        }
        if (b.Duplicate_Check !== 'Duplicate') {
          b.Duplicate_Check = 'Possible Duplicate';
          b.Review_Status   = b.Review_Status ?? 'Needs Review';
          b.Notes = appendNote(b.Notes, `Possible cross-source duplicate with ${a.Source}.`);
        }
      }
    }
  }

  // ── Ensure all untouched records have Unique status ─────────────────────────
  for (const r of records) {
    if (!r.Duplicate_Check) r.Duplicate_Check = 'Unique';
  }

  return records;
}

function appendNote(existing, addition) {
  if (!existing) return addition;
  return `${existing} | ${addition}`;
}
