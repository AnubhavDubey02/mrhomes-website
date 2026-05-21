/**
 * preprocess.mjs
 * Image preprocessing for WhatsApp / broker inventory screenshots.
 * Improves Tesseract OCR accuracy before text extraction.
 *
 * Pipeline (applied in this order):
 *   1. Grayscale           — eliminate colour noise
 *   2. 2x upscale          — more pixels for Tesseract to analyse (aspect ratio preserved)
 *   3. Contrast normalise  — auto-stretch histogram (adaptive contrast)
 *   4. Sharpen             — crisp text edges via unsharp mask
 *   5. Median filter       — remove salt-and-pepper noise
 *
 * Note: hard binary threshold is intentionally avoided because it is a global
 * operation that can destroy text on images with uneven lighting or shadows.
 * `normalize()` + Tesseract's built-in binarisation produces better results.
 *
 * Outputs:
 *   processed image  → inventory/processed/preprocessed/<source>_<basename>.png
 *   debug comparison → inventory/processed/preprocessed/comparison/<source>_<basename>/
 *                        original.jpg
 *                        processed.jpg
 *     (debug saved for first MAX_COMPARISON_IMAGES images only)
 */

import { mkdirSync, existsSync }  from 'fs';
import { extname, basename, join, dirname } from 'path';
import { fileURLToPath }          from 'url';

const __dirname        = dirname(fileURLToPath(import.meta.url));
const ROOT             = join(__dirname, '../../');
const PREPROCESSED_DIR = join(ROOT, 'processed', 'preprocessed');
const COMPARISON_DIR   = join(ROOT, 'processed', 'preprocessed', 'comparison');

const MAX_COMPARISON_IMAGES = 5;

// Module-level counter — tracks how many comparison sets have been saved this run
let comparisonCount = 0;

// ─── Path helpers ─────────────────────────────────────────────────────────────

function preprocessedPath(imagePath, source) {
  const base = basename(imagePath, extname(imagePath)).replace(/[^a-zA-Z0-9_-]/g, '_');
  return join(PREPROCESSED_DIR, `${source}_${base}.png`);
}

// ─── Core preprocessing ───────────────────────────────────────────────────────

/**
 * Apply the full preprocessing pipeline to a single image.
 *
 * @param {string} imagePath  Absolute path to the original image
 * @param {string} source     Source id (dore | fnf | s2l | local-brokers)
 * @returns {Promise<string>} Absolute path to the preprocessed PNG
 */
export async function preprocessImage(imagePath, source) {
  const { default: sharp } = await import('sharp');

  mkdirSync(PREPROCESSED_DIR, { recursive: true });

  const outPath = preprocessedPath(imagePath, source);

  // Read original dimensions so we can do an exact 2× upscale
  const meta = await sharp(imagePath).metadata();

  await sharp(imagePath)
    .grayscale()
    .resize({
      width:              (meta.width ?? 800) * 2,
      withoutEnlargement: false,   // always upscale even if image is already large
      fit:                'inside', // preserve aspect ratio
    })
    .normalize()      // auto-stretch histogram → adaptive contrast enhancement
    .sharpen(1.5)     // unsharp mask (sigma=1.5) — crisp text edges
    .median(3)        // 3×3 median filter — noise reduction
    .png()            // lossless output for Tesseract
    .toFile(outPath);

  // ── Debug comparison (first MAX_COMPARISON_IMAGES images only) ──────────────
  if (comparisonCount < MAX_COMPARISON_IMAGES) {
    comparisonCount++;
    await saveComparison(imagePath, outPath, source);
  }

  return outPath;
}

/**
 * Reset the comparison counter — call at the start of each pipeline run
 * if you want exactly the first 5 images of every run to be saved.
 */
export function resetComparisonCounter() {
  comparisonCount = 0;
}

// ─── Debug comparison ─────────────────────────────────────────────────────────

async function saveComparison(originalPath, processedPath, source) {
  const { default: sharp } = await import('sharp');

  const base    = basename(originalPath, extname(originalPath)).replace(/[^a-zA-Z0-9_-]/g, '_');
  const compDir = join(COMPARISON_DIR, `${source}_${base}`);
  mkdirSync(compDir, { recursive: true });

  // Save original as JPEG (convert from whatever format it was)
  await sharp(originalPath)
    .jpeg({ quality: 90 })
    .toFile(join(compDir, 'original.jpg'));

  // Save processed as JPEG (for easy side-by-side viewing)
  await sharp(processedPath)
    .jpeg({ quality: 90 })
    .toFile(join(compDir, 'processed.jpg'));
}
