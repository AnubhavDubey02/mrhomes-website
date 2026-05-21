/**
 * normalizers.mjs
 * Field-by-field normalization functions for raw OCR output.
 *
 * Rules:
 *   - Never silently correct ambiguous values — return raw and set flagged=true.
 *   - Never invent a value — use null when a field is not determinable.
 *   - Room codes (G001, A102, etc.) are unit identifiers, NOT floor descriptors.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG = join(__dirname, '../../config');

function loadJSON(name) {
  return JSON.parse(readFileSync(join(CONFIG, name), 'utf8'));
}

const PROPERTY_TYPES  = loadJSON('property-types.json');
const SECTOR_MAPPING  = loadJSON('sector-mapping.json');
const NORM_RULES      = loadJSON('normalization-rules.json');

// ─── Ordinal suffix helper ────────────────────────────────────────────────────
function ordSuffix(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  return ['th', 'st', 'nd', 'rd', 'th'][Math.min(n % 10, 4)];
}

// ─── FLOOR ────────────────────────────────────────────────────────────────────
/**
 * Normalize a floor value extracted from OCR.
 *
 * CRITICAL: Room codes like G001, G002, G005, A101 etc. are unit identifiers.
 * They must NEVER be converted into floor values.
 *
 * @param {string|null} raw
 * @returns {{ value: string|null, flagged: boolean }}
 */
export function normalizeFloor(raw) {
  if (raw == null || String(raw).trim() === '') return { value: null, flagged: false };

  const s = String(raw).trim();

  // Room code pattern: single letter followed by 3+ digits (e.g. G001, A102, B005)
  if (/^[A-Za-z]\d{3,}$/.test(s)) {
    return { value: s, flagged: false }; // return unchanged — this is a unit identifier
  }

  const FLOOR_MAP = {
    'GF':    'Ground Floor',
    'G/F':   'Ground Floor',
    'FF':    'First Floor',
    'F/F':   'First Floor',
    '1F':    'First Floor',
    '1ST':   'First Floor',
    'SF':    'Second Floor',
    'S/F':   'Second Floor',
    '2F':    'Second Floor',
    '2ND':   'Second Floor',
    'TF':    'Third Floor',
    'T/F':   'Third Floor',
    '3F':    'Third Floor',
    '3RD':   'Third Floor',
    '4F':    'Fourth Floor',
    '4TH':   'Fourth Floor',
    '5F':    'Fifth Floor',
    '5TH':   'Fifth Floor',
    '6F':    'Sixth Floor',
    '7F':    'Seventh Floor',
    '8F':    'Eighth Floor',
    '9F':    'Ninth Floor',
    '10F':   'Tenth Floor',
  };

  const upper = s.toUpperCase().replace(/\s+/g, '');
  if (FLOOR_MAP[upper]) return { value: FLOOR_MAP[upper], flagged: false };

  // Numeric: "6", "6th", "6th floor", "6 floor"
  const nm = s.match(/^(\d+)(?:st|nd|rd|th)?(?:\s*floor)?$/i);
  if (nm) {
    const n = parseInt(nm[1], 10);
    return { value: `${n}${ordSuffix(n)} Floor`, flagged: false };
  }

  // Could not map — return raw and flag for review
  return { value: s, flagged: true };
}

// ─── AVAILABILITY ─────────────────────────────────────────────────────────────
/**
 * Normalize availability string.
 * @param {string|null} raw
 * @returns {{ status: string|null, date: string|null, flagged: boolean }}
 */
export function normalizeAvailability(raw) {
  if (raw == null || String(raw).trim() === '') {
    return { status: null, date: null, flagged: false };
  }

  const s = String(raw).trim();

  // Immediate variants (handles typos: "Immidiately", "Immediatly", etc.)
  if (/^imm?e?d?i?a?t?e?l?y?$/i.test(s.replace(/\s+/g, ''))) {
    return { status: 'Immediate', date: null, flagged: false };
  }
  if (/^immediate$/i.test(s.trim())) {
    return { status: 'Immediate', date: null, flagged: false };
  }

  // Occupied variants
  if (/^(occupied|on[\s-]rent|rented|not[\s-]available)$/i.test(s.trim())) {
    return { status: 'Occupied', date: null, flagged: false };
  }

  const MONTH = {
    jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06',
    jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12',
  };

  // DD-MMM-YY or DD-MMM-YYYY  e.g. "31-May-26", "01-Jun-2026"
  const m1 = s.match(/^(\d{1,2})[-\/\s](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[-\/\s](\d{2}|\d{4})$/i);
  if (m1) {
    const day   = m1[1].padStart(2, '0');
    const month = MONTH[m1[2].toLowerCase()];
    const year  = m1[3].length === 2 ? `20${m1[3]}` : m1[3];
    return { status: 'Vacating', date: `${year}-${month}-${day}`, flagged: false };
  }

  // DD/MM/YY or DD/MM/YYYY
  const m2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (m2) {
    const day   = m2[1].padStart(2, '0');
    const month = m2[2].padStart(2, '0');
    const year  = m2[3].length === 2 ? `20${m2[3]}` : m2[3];
    return { status: 'Vacating', date: `${year}-${month}-${day}`, flagged: false };
  }

  // Already ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return { status: 'Vacating', date: s, flagged: false };
  }

  // Unknown — flag for review
  return { status: 'Unknown', date: null, flagged: true };
}

// ─── SECTOR ───────────────────────────────────────────────────────────────────
/**
 * Normalize sector/area string.
 * "Sec52", "Sec-52", "Sec 52", "S-52" → "Sector 52"
 * @param {string|null} raw
 * @returns {{ value: string|null, flagged: boolean }}
 */
export function normalizeSector(raw) {
  if (raw == null || String(raw).trim() === '') return { value: null, flagged: false };

  const s = String(raw).trim();

  // "Sec 52", "Sec-52", "Sec52", "Sector52", "S-52"
  const secMatch = s.match(/^(?:sec(?:tor)?[\s\-]?)(\d+[A-Z]?)$/i);
  if (secMatch) {
    return { value: `Sector ${secMatch[1].toUpperCase()}`, flagged: false };
  }

  // Check against sector-mapping.json canonical names and aliases
  const lower = s.toLowerCase();
  for (const [canonical, data] of Object.entries(SECTOR_MAPPING.sectors || {})) {
    if (
      canonical.toLowerCase() === lower ||
      (data.aliases || []).some(a => a.toLowerCase() === lower)
    ) {
      return { value: canonical, flagged: false };
    }
  }

  // Return cleaned string — flag for review
  return { value: s, flagged: true };
}

// ─── RENT ─────────────────────────────────────────────────────────────────────
/**
 * Normalize rent to a plain integer (INR).
 * "25K" → 25000, "35,000" → 35000, "1.5L" → 150000
 * @param {string|number|null} raw
 * @returns {{ value: number|null, flagged: boolean }}
 */
export function normalizeRent(raw) {
  if (raw == null || String(raw).trim() === '') return { value: null, flagged: false };

  const s = String(raw).trim().replace(/[₹,\s]/g, '').toUpperCase();

  const match = s.match(/^([\d.]+)\s*([KLCkc][rR]?)?$/);
  if (!match) return { value: null, flagged: true };

  const num = parseFloat(match[1]);
  if (isNaN(num)) return { value: null, flagged: true };

  const suffix = (match[2] || '').toUpperCase();
  let mult = 1;
  if (suffix === 'K')  mult = 1_000;
  if (suffix === 'L')  mult = 100_000;
  if (suffix === 'CR') mult = 10_000_000;

  return { value: Math.round(num * mult), flagged: false };
}

// ─── PROPERTY TYPE ────────────────────────────────────────────────────────────
/**
 * Normalize property type to canonical key.
 * "2 BHK", "2-BHK", "2bhk" → "2bhk"
 * @param {string|null} raw
 * @returns {{ value: string|null, flagged: boolean }}
 */
export function normalizePropertyType(raw) {
  if (raw == null || String(raw).trim() === '') return { value: null, flagged: false };

  const s = String(raw).trim().toLowerCase().replace(/[\s\-]/g, '');

  for (const [canonical, aliases] of Object.entries(PROPERTY_TYPES)) {
    if (canonical.startsWith('_')) continue; // skip _comment keys
    const norm = aliases.map(a => a.toLowerCase().replace(/[\s\-]/g, ''));
    if (norm.includes(s)) return { value: canonical, flagged: false };
  }

  // Return cleaned raw — flag for review
  return { value: raw.trim(), flagged: true };
}

// ─── FURNISHING ───────────────────────────────────────────────────────────────
/**
 * Normalize furnishing status.
 * Note: "FF" in furnishing context = "Fully Furnished" (not First Floor).
 *       "SF" in furnishing context = "Semi-Furnished" (not Second Floor).
 * @param {string|null} raw
 * @returns {{ value: string|null, flagged: boolean }}
 */
export function normalizeFurnishing(raw) {
  if (raw == null || String(raw).trim() === '') return { value: null, flagged: false };

  const s = String(raw).trim().toLowerCase().replace(/[\s\-]/g, '');

  const MAP = {
    ff:                        'Fully Furnished',
    fullyfurnished:            'Fully Furnished',
    furnished:                 'Fully Furnished',
    fullfurnished:             'Fully Furnished',
    fnf:                       'Fully Furnished & Fitted',
    fullyfurnishedfitted:      'Fully Furnished & Fitted',
    'fullyfurnished&fitted':   'Fully Furnished & Fitted',
    sf:                        'Semi-Furnished',
    semifurnished:             'Semi-Furnished',
    partlyfurnished:           'Semi-Furnished',
    partialfurnished:          'Semi-Furnished',
    uf:                        'Unfurnished',
    unfurnished:               'Unfurnished',
    bare:                      'Unfurnished',
    bareshell:                 'Unfurnished',
  };

  if (MAP[s]) return { value: MAP[s], flagged: false };

  // Return raw — flag for review
  return { value: raw.trim(), flagged: true };
}
