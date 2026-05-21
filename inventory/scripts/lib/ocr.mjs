/**
 * ocr.mjs
 * Two-backend OCR module for inventory extraction.
 *
 * ── DEFAULT: Tesseract ────────────────────────────────────────────────────────
 *   OCR_BACKEND=tesseract  (no API key required)
 *   1. Runs tesseract.js locally on the image
 *   2. Saves raw OCR text to processed/raw-ocr/<source>_<basename>.txt
 *   3. Lightweight, conservative field extraction from each text line
 *   4. Overall confidence below OCR_CONFIDENCE_THRESHOLD (default 60)?
 *      → All fields left blank, record flagged Review_Status=Needs Review
 *
 * ── OPTIONAL: OpenAI ─────────────────────────────────────────────────────────
 *   OCR_BACKEND=openai  (requires OPENAI_API_KEY)
 *   Falls back to Tesseract automatically if OPENAI_API_KEY is not set.
 *
 * ── Accuracy policy ──────────────────────────────────────────────────────────
 *   Never invent or guess values.
 *   Ambiguous tokens (e.g. standalone "FF" / "SF") are left blank — they are
 *   captured verbatim in the notes field for human review.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { extname, basename, join, dirname }        from 'path';
import { fileURLToPath }                            from 'url';
import { preprocessImage }                          from './preprocess.mjs';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const ROOT        = join(__dirname, '../../');
const RAW_OCR_DIR = join(ROOT, 'processed', 'raw-ocr');

const CONF_THRESHOLD = parseInt(process.env.OCR_CONFIDENCE_THRESHOLD ?? '60', 10);

// ─── Raw-text save ────────────────────────────────────────────────────────────

function rawOCRPath(imagePath, source) {
  const base = basename(imagePath, extname(imagePath)).replace(/[^a-zA-Z0-9_-]/g, '_');
  return join(RAW_OCR_DIR, `${source}_${base}.txt`);
}

function saveRawText(text, outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, text, 'utf8');
}

// ─── Lightweight field extractor ─────────────────────────────────────────────
// Only patterns that are clear and unambiguous. When in doubt → null.
//
// Mr Homes / DORE floor abbreviation mapping (authoritative):
//   GF = Ground Floor   FF = First Floor   SF = Second Floor
//   TF = Third Floor    4F = Fourth Floor  5F = Fifth Floor
//
// Furnishing is extracted ONLY from fully-spelled words.
// Abbreviations FF / SF are reserved exclusively for Floor and will NEVER
// be interpreted as furnishing values.
//
// When a line contains both (e.g. "SF, Fully Furnished"):
//   Floor      = Second Floor  (from FF/SF abbreviation)
//   Furnishing = Fully Furnished  (from explicit full word)
// Both fields are extracted correctly with no conflict.

const RE = {
  sector:      /\bsec(?:tor)?[\s\-]?(\d+[A-Z]?)\b/i,
  bhk:         /\b([1-9]\s*(?:bhk|rk))\b/i,
  studio:      /\bstudio\b/i,
  preoccupied: /\bpre[\s\-]?occupied\b/i,
  rent:        /\b(\d[\d,]*(?:\.\d+)?)\s*([KkLlCc][Rr]?)\b/,
  avail_date:  /\b(\d{1,2}[-\/](?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[-\/]\d{2,4})\b/i,
  avail_immed: /\bimm?e?d?i?a?t?e?(?:ly)?\b/i,
  // Floor: full Mr Homes mapping — GF FF SF TF 4F 5F 6F … 19F
  // Note: FF = First Floor, SF = Second Floor (business rule)
  floor:       /\b(GF|FF|SF|TF|[4-9]F|1[0-9]F)\b/,
  // Furnishing: ONLY explicit full words — abbreviations alone are never accepted
  furn_full:   /\b(fully[\s\-]?furnished|semi[\s\-]?furnished|unfurnished)\b/i,
  // Room code: single letter + 3 or more digits  e.g. G001, A102, B005
  room_no:     /\b([A-Za-z]\d{3,})\b/,
};

/** Returns a blank raw record skeleton. */
function blankRaw() {
  return {
    source_property_ref: null,
    source_room_no:      null,
    sector:              null,
    locality:            null,
    property_type:       null,
    rent:                null,
    availability:        null,
    furnishing:          null,
    floor:               null,
    balcony:             null,
    lift:                null,
    notes:               null,
  };
}

function extractFields(line) {
  const r = blankRaw();

  const secM = line.match(RE.sector);
  if (secM) r.sector = `Sec ${secM[1].toUpperCase()}`;

  const bhkM = line.match(RE.bhk);
  if (bhkM)                              r.property_type = bhkM[1].replace(/\s/g, '').toLowerCase();
  else if (RE.studio.test(line))         r.property_type = 'studio';
  else if (RE.preoccupied.test(line))    r.property_type = 'preoccupied';

  const rentM = line.match(RE.rent);
  if (rentM) r.rent = `${rentM[1].replace(/,/g, '')}${rentM[2].toUpperCase()}`;

  const dateM = line.match(RE.avail_date);
  if (dateM)                             r.availability = dateM[1];
  else if (RE.avail_immed.test(line))    r.availability = 'Immediate';

  // Furnishing extracted first (full words only) — must run before floor so the
  // explicit furnishing word is claimed before the floor abbreviation scanner runs.
  const furnM = line.match(RE.furn_full);
  if (furnM) {
    const v = furnM[1].toLowerCase().replace(/[\s\-]/g, '');
    if (v.startsWith('fully'))     r.furnishing = 'Fully Furnished';
    else if (v.startsWith('semi')) r.furnishing = 'Semi Furnished';
    else                           r.furnishing = 'Unfurnished';
  }

  // Floor: abbreviation-based — safe now because furnishing only uses full words
  const floorM = line.match(RE.floor);
  if (floorM) r.floor = floorM[1];

  const roomM = line.match(RE.room_no);
  if (roomM) r.source_room_no = roomM[1].toUpperCase();

  // Always capture raw line for traceability; reviewer can resolve ambiguous tokens
  r.notes = `Raw OCR line: ${line}`;

  return r;
}

function hasMinimumFields(r) {
  return !!(r.sector || r.property_type || r.rent);
}

/**
 * Parse raw Tesseract text into lightweight record candidates.
 * Lines that yield no recognisable fields are silently dropped.
 * Low-confidence pages produce blank records flagged for review.
 */
function extractRecordsFromText(text, confidence) {
  const low     = confidence < CONF_THRESHOLD;
  const lines   = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
  const records = [];

  for (const line of lines) {
    if (low) {
      const r   = blankRaw();
      r.notes   = `Low OCR confidence (${Math.round(confidence)}%). Manual review required. Raw line: ${line}`;
      records.push(r);
      continue;
    }

    const r = extractFields(line);
    if (!hasMinimumFields(r)) continue;
    records.push(r);
  }

  return records;
}

// ─── Tesseract backend ────────────────────────────────────────────────────────

async function extractWithTesseract(imagePath, source) {
  // 1. Preprocess: grayscale → 2× upscale → normalise contrast → sharpen → denoise
  //    Saves result to processed/preprocessed/ — original image is never modified.
  let ocrInput = imagePath;
  try {
    ocrInput = await preprocessImage(imagePath, source);
  } catch (prepErr) {
    const msg = prepErr instanceof Error ? prepErr.message : String(prepErr);
    console.warn(`[ocr] Preprocessing failed (${msg}) — falling back to original image.`);
  }

  // 2. Run Tesseract on the preprocessed image
  const Tesseract = await import('tesseract.js');
  const recognize = Tesseract.default?.recognize ?? Tesseract.recognize;

  const { data } = await recognize(ocrInput, 'eng', { logger: () => {} });

  // 3. Save raw OCR text — keyed to original filename for traceability
  const rawPath = rawOCRPath(imagePath, source);
  saveRawText(data.text, rawPath);

  const records = extractRecordsFromText(data.text, data.confidence ?? 0);
  return { records, rawTextPath: rawPath };
}

// ─── OpenAI backend (optional) ────────────────────────────────────────────────

const OAI_SYSTEM = `You are an expert data extraction AI for a real estate CRM.
Extract property inventory rows from images with maximum precision.
Never invent or infer values. Use null for any field not explicitly visible.
Flag any uncertainty in the notes field.`;

const OAI_USER = `Extract ALL property inventory rows visible in this image.

Return a JSON object with key "records" — an array where each element is one unit.

Required keys per record:
  source_property_ref, source_room_no, sector, locality, property_type,
  rent, availability, furnishing, floor, balcony, lift, notes

Rules: null for missing fields. Preserve codes exactly. Room codes are NOT floors.
Return ONLY the JSON object.`;

async function extractWithOpenAI(imagePath) {
  const { default: OpenAI } = await import('openai');
  const client  = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model   = process.env.OPENAI_MODEL || 'gpt-4o';
  const ext     = extname(imagePath).toLowerCase();
  const mime    = { '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.gif':'image/gif' }[ext] ?? 'image/jpeg';
  const base64  = readFileSync(imagePath).toString('base64');

  const res     = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: OAI_SYSTEM },
      { role: 'user',   content: [
        { type: 'text',      text: OAI_USER },
        { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}`, detail: 'high' } },
      ]},
    ],
    max_tokens:      4096,
    temperature:     0,
    response_format: { type: 'json_object' },
  });

  const parsed = JSON.parse(res.choices[0]?.message?.content ?? '{}');
  return Array.isArray(parsed) ? parsed : (parsed.records ?? parsed.data ?? []);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Extract raw inventory records from a single image file.
 *
 * Backend resolution order:
 *   mock      → empty array (pipeline testing)
 *   openai    → OpenAI GPT-4 Vision; auto-falls back to Tesseract if key missing
 *   tesseract → local Tesseract.js (default)
 *
 * @param {string} imagePath  Absolute path to the image
 * @param {string} source     Source id: dore | fnf | s2l | local-brokers
 * @returns {Promise<{ records: object[], error: string|null }>}
 */
export async function extractFromImage(imagePath, source) {
  const backend = (process.env.OCR_BACKEND ?? 'tesseract').toLowerCase();

  if (backend === 'mock') {
    return { records: [], error: null };
  }

  if (backend === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[ocr] OPENAI_API_KEY not set — falling back to Tesseract.');
    } else {
      try {
        const records = await extractWithOpenAI(imagePath);
        return { records, error: null };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[ocr] OpenAI failed (${msg}) — falling back to Tesseract.`);
      }
    }
  }

  // Tesseract — default and fallback
  try {
    const { records } = await extractWithTesseract(imagePath, source);
    return { records, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { records: [], error: msg };
  }
}
