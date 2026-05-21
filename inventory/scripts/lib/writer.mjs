/**
 * writer.mjs
 * Generates XLSX (ExcelJS), CSV, and log output files.
 *
 * Colour conventions (using brand palette):
 *   Header row : ink  (#14130F) background, paper (#F6F3EC) text
 *   Needs Review rows : amber  (#FFF3CD) background
 *   Duplicate rows    : red-tint (#FFE5E5) background
 *   Admin columns (Source, Refs, Notes) : light grey (#F5F5F5) background
 */

import ExcelJS     from 'exceljs';
import { writeFileSync, appendFileSync, mkdirSync } from 'fs';
import { dirname }  from 'path';

// ─── Colour constants ──────────────────────────────────────────────────────────
const C_HEADER_BG    = 'FF14130F';
const C_HEADER_FG    = 'FFF6F3EC';
const C_REVIEW_BG    = 'FFFFF3CD';
const C_DUPLICATE_BG = 'FFFFCCCC';
const C_ADMIN_BG     = 'FFF5F5F5';

// ─── Column definitions ────────────────────────────────────────────────────────
const MASTER_COLS = [
  { header: 'MH ID',            key: 'MH_ID',               width: 12 },
  { header: 'Property Type',    key: 'Property_Type',        width: 14 },
  { header: 'Sector',           key: 'Sector',               width: 16 },
  { header: 'Locality',         key: 'Locality',             width: 22 },
  { header: 'Rent (₹)',         key: 'Rent',                 width: 13, numFmt: '#,##0' },
  { header: 'Availability',     key: 'Availability_Status',  width: 16 },
  { header: 'Avail. Date',      key: 'Availability_Date',    width: 14 },
  { header: 'Furnishing',       key: 'Furnishing',           width: 26 },
  { header: 'Floor',            key: 'Floor',                width: 16 },
  { header: 'Balcony',          key: 'Balcony',              width: 10 },
  { header: 'Lift',             key: 'Lift',                 width: 10 },
  { header: 'Listing Status',   key: 'Listing_Status',       width: 15 },
  { header: 'Website Show',     key: 'Website_Show',         width: 14 },
  { header: 'Duplicate',        key: 'Duplicate_Check',      width: 20 },
  { header: 'Review Status',    key: 'Review_Status',        width: 22 },
  { header: 'Score',            key: 'Confidence_Score',     width: 10 },
  { header: 'Photos',           key: 'Photos',               width: 28 },
  { header: 'Source ⚙',        key: 'Source',               width: 16, admin: true },
  { header: 'Prop. Ref ⚙',     key: 'Source_Property_Ref',  width: 20, admin: true },
  { header: 'Room No ⚙',       key: 'Source_Room_No',       width: 16, admin: true },
  { header: 'Notes',            key: 'Notes',                width: 42, admin: true },
  // ── History & traceability ⚙ ────────────────────────────────────────────────
  { header: 'Change Type ⚙',   key: 'Change_Type',          width: 14, admin: true },
  { header: 'Created At ⚙',    key: 'Created_At',           width: 22, admin: true },
  { header: 'Updated At ⚙',    key: 'Updated_At',           width: 22, admin: true },
  { header: 'Last Seen ⚙',     key: 'Last_Seen',            width: 22, admin: true },
  { header: 'Screenshot ⚙',    key: 'Screenshot_File',      width: 30, admin: true },
  { header: 'Source Folder ⚙', key: 'Source_Folder',        width: 18, admin: true },
  { header: 'Processed At ⚙',  key: 'Processed_At',         width: 22, admin: true },
  { header: 'Run ID ⚙',        key: 'Extraction_Run_ID',    width: 22, admin: true },
];

const REVIEW_EXTRA_COL = { header: 'Review Reason', key: 'Review_Reason', width: 50 };

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Serialize a field value for output.
 * Arrays (e.g. Photos) are joined with a semicolon separator.
 */
function serializeField(v, separator = '; ') {
  if (v == null)          return '';
  if (Array.isArray(v))   return v.join(separator);
  return String(v);
}

function ensureDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function applyHeaderStyle(ws, colCount) {
  const row = ws.getRow(1);
  row.height = 22;
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c);
    cell.font      = { bold: true, color: { argb: C_HEADER_FG }, size: 10 };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_HEADER_BG } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
    cell.border    = { bottom: { style: 'thin', color: { argb: 'FF888888' } } };
  }
}

function applyRowStyle(row, record, adminColIndices) {
  const isManual    = record.Review_Status   === 'Needs Manual Review';
  const isReview    = record.Review_Status   === 'Needs Review';
  const duplicateBg = record.Duplicate_Check === 'Duplicate';

  if (isManual || isReview || duplicateBg) {
    const bgColor = duplicateBg ? C_DUPLICATE_BG : isManual ? 'FFFFD580' : C_REVIEW_BG;
    row.eachCell({ includeEmpty: true }, cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    });
  }

  // Confidence_Score cell: green / amber / red independent of row colour
  const scoreColIdx = MASTER_COLS.findIndex(c => c.key === 'Confidence_Score');
  if (scoreColIdx >= 0) {
    const score = record.Confidence_Score;
    if (score != null) {
      const scoreCell = row.getCell(scoreColIdx + 1);
      const bg = score >= 85 ? 'FFD4EDDA' : score >= 60 ? 'FFFFF3CD' : 'FFFFCCCC';
      scoreCell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      scoreCell.font      = { bold: true, size: 10 };
      scoreCell.alignment = { horizontal: 'center' };
    }
  }

  // Admin columns always get grey tint (even on coloured rows)
  for (const idx of adminColIndices) {
    const cell = row.getCell(idx);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C_ADMIN_BG } };
    cell.font = { color: { argb: 'FF888888' }, size: 9 };
  }
}

function buildWorksheet(wb, sheetName, columns, records) {
  const ws = wb.addWorksheet(sheetName);
  ws.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width }));

  applyHeaderStyle(ws, columns.length);

  const adminIndices = columns
    .map((c, i) => (c.admin ? i + 1 : null))
    .filter(Boolean);

  records.forEach(record => {
    const values = columns.map(c => {
      const v = record[c.key];
      // Photos are stored as arrays; join with newline for XLSX cell display
      if (Array.isArray(v)) return v.join('\n');
      return v == null ? '' : v;
    });
    const row = ws.addRow(values);

    // Apply Rent number format
    const rentColIdx = columns.findIndex(c => c.key === 'Rent');
    if (rentColIdx >= 0 && record.Rent != null) {
      row.getCell(rentColIdx + 1).numFmt = '#,##0';
    }

    applyRowStyle(row, record, adminIndices);
  });

  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: 'A1', to: { row: 1, column: columns.length } };

  return ws;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Write master_inventory.xlsx with all canonical fields.
 * @param {object[]} records
 * @param {string}   outputPath  Absolute path
 */
export async function writeMasterXLSX(records, outputPath) {
  ensureDir(outputPath);
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Mr Homes Inventory Pipeline';
  wb.created  = new Date();
  buildWorksheet(wb, 'Master Inventory', MASTER_COLS, records);
  await wb.xlsx.writeFile(outputPath);
}

/**
 * Write review_flags.xlsx — same columns + Review_Reason column.
 * @param {object[]} records   Records with a Review_Reason field
 * @param {string}   outputPath
 */
export async function writeReviewXLSX(records, outputPath) {
  ensureDir(outputPath);
  const wb   = new ExcelJS.Workbook();
  wb.creator = 'Mr Homes Inventory Pipeline';
  wb.created = new Date();
  const cols = [...MASTER_COLS, { ...REVIEW_EXTRA_COL, admin: true }];
  buildWorksheet(wb, 'Review Flags', cols, records);
  await wb.xlsx.writeFile(outputPath);
}

/**
 * Write master_inventory.csv — RFC 4180 compliant.
 * @param {object[]} records
 * @param {string}   outputPath
 */
export function writeCSV(records, outputPath) {
  ensureDir(outputPath);
  const fields = MASTER_COLS.map(c => c.key);
  const escape = v => {
    // Serialize arrays (Photos) with semicolon before CSV-escaping
    const s = serializeField(v, '; ');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const header = fields.join(',');
  const rows   = records.map(r => fields.map(f => escape(r[f])).join(','));
  writeFileSync(outputPath, [header, ...rows].join('\r\n'), 'utf8');
}

/**
 * Append a timestamped line to the extraction log.
 * @param {string} message
 * @param {string} logPath
 */
export function appendLog(message, logPath) {
  ensureDir(logPath);
  const ts = new Date().toISOString();
  appendFileSync(logPath, `[${ts}] ${message}\n`, 'utf8');
}
