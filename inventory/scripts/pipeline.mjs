/**
 * pipeline.mjs  —  Full inventory pipeline orchestrator
 *
 * Runs all three steps in sequence:
 *   1. extract   — OCR raw images → processed JSON
 *   2. normalise — processed JSON → master + review records
 *   3. export    — master records → XLSX + CSV outputs
 *
 * Usage:
 *   node pipeline.mjs                    # run all 3 steps
 *   node pipeline.mjs --step extract     # run only step 1
 *   node pipeline.mjs --step normalise   # run only step 2
 *   node pipeline.mjs --step export      # run only step 3
 *
 * Environment:
 *   Copy .env.example to .env before first run.
 *   Requires OPENAI_API_KEY unless OCR_BACKEND=mock.
 *
 * Setup (first run):
 *   cd inventory/scripts
 *   npm install
 *   cp .env.example .env
 *   # Edit .env and add OPENAI_API_KEY
 *   node pipeline.mjs
 */

import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname }        from 'path';

import { runExtract }   from './extract.mjs';
import { runNormalise } from './normalise.mjs';
import { runExport }    from './export.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Argument parsing ─────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const stepIdx   = args.indexOf('--step');
const stepArg   = stepIdx >= 0 ? args[stepIdx + 1]?.toLowerCase() : null;
const VALID_STEPS = ['extract', 'normalise', 'export'];

if (stepArg && !VALID_STEPS.includes(stepArg)) {
  console.error(`Unknown step "${stepArg}". Valid: ${VALID_STEPS.join(', ')}`);
  process.exit(1);
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function run() {
  const start = Date.now();
  console.log('\n══════════════════════════════════════════════════');
  console.log('  Mr Homes Realtors — Inventory Pipeline');
  console.log(`  Started: ${new Date().toLocaleString()}`);
  console.log('══════════════════════════════════════════════════\n');

  const results = {};

  try {
    if (!stepArg || stepArg === 'extract') {
      console.log('▶ Step 1 / 3 — Extract\n');
      results.extract = await runExtract();
      console.log('');
    }

    if (!stepArg || stepArg === 'normalise') {
      console.log('▶ Step 2 / 3 — Normalise\n');
      results.normalise = await runNormalise();
      console.log('');
    }

    if (!stepArg || stepArg === 'export') {
      console.log('▶ Step 3 / 3 — Export\n');
      results.export = await runExport();
      console.log('');
    }
  } catch (err) {
    console.error('\n✖ Pipeline failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('══════════════════════════════════════════════════');
  console.log('  Pipeline Complete');
  console.log(`  Elapsed: ${elapsed}s`);

  if (results.extract) {
    console.log(`  Images processed : ${results.extract.totalImages}`);
    console.log(`  Raw records      : ${results.extract.totalRecords}`);
  }
  if (results.normalise) {
    console.log(`  Master records   : ${results.normalise.master}`);
    console.log(`  Review flags     : ${results.normalise.review}`);
  }
  if (results.export) {
    console.log('  Output files:');
    console.log('    output/master/master_inventory.xlsx');
    console.log('    output/exports/master_inventory.csv');
    console.log('    output/exports/master_inventory.xlsx');
    console.log('    output/review/review_flags.xlsx');
    console.log('    output/logs/extraction_log.txt');
  }
  console.log('══════════════════════════════════════════════════\n');
}

// Run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
