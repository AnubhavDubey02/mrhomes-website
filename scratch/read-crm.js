// scratch/read-crm.js  — read-only, no file modifications
const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.readFile(path.join(__dirname, '..', 'crm', 'MrHomes_CRM.xlsx'));

console.log('=== SHEET NAMES ===');
console.log(JSON.stringify(wb.SheetNames));

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  console.log(`\n=== SHEET: ${name} (${rows.length} rows) ===`);
  console.log(JSON.stringify(rows, null, 2));
}
