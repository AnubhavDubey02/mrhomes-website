// scratch/read-consolidated.js  — read-only, extract Consolidated Inventory only
const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.readFile(path.join(__dirname, '..', 'crm', 'MrHomes_CRM.xlsx'));

// First show sheet names
console.log('SHEET_NAMES:', JSON.stringify(wb.SheetNames));

// Find the consolidated inventory sheet
const targetSheets = ['Consolidated Inventory', 'Consolidated', 'Inventory', 'Master'];
let found = null;
for (const name of wb.SheetNames) {
  if (targetSheets.some(t => name.toLowerCase().includes(t.toLowerCase()))) {
    found = name;
    break;
  }
}

if (!found) {
  // Print all sheet names so we can pick the right one
  console.log('Target sheet not found. All sheets:', wb.SheetNames);
  process.exit(1);
}

console.log(`\nReading sheet: "${found}"`);
const ws = wb.Sheets[found];
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
console.log(`Row count: ${rows.length}`);

// Show headers (from first row)
if (rows.length > 0) {
  console.log('\nCOLUMNS:', JSON.stringify(Object.keys(rows[0])));
}

// Print all rows as compact JSON lines (easier to parse)
for (const row of rows) {
  console.log('ROW:' + JSON.stringify(row));
}
