// scratch/crm-s2l-dore-full.js — READ ONLY
const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.readFile(path.join(__dirname, '..', 'crm', 'MrHomes_CRM.xlsx'));
const consolidatedSheet = wb.SheetNames.find(n => n.toLowerCase().includes('consolidated'));
const wsRows = XLSX.utils.sheet_to_json(wb.Sheets[consolidatedSheet], { defval: '' });
const crmRows = wsRows.filter(r => r['PublicRef'] && String(r['PublicRef']).startsWith('MRH-'));

// Group by source
const bySource = {};
for (const r of crmRows) {
  const src = String(r['Source'] || 'Unknown');
  if (!bySource[src]) bySource[src] = [];
  bySource[src].push(r);
}

for (const [src, rows] of Object.entries(bySource)) {
  console.log(`\n=== SOURCE: ${src} (${rows.length} records) ===`);
  for (const r of rows) {
    const avail = String(r['Availability'] || '');
    const isImmediate = avail.toLowerCase().includes('immediately') || avail.toLowerCase().includes('immediate');
    console.log(`  ${r['PublicRef']} | ${r['Sector']} | Prop:${r['Property No']} Rm:${r['Room No']} | ${r['Type']} | Rent:${r['Rent']} | Avail:${avail} ${isImmediate ? '[IMMEDIATE]' : ''}`);
  }
}

// Summary of unique sectors
const sectors = [...new Set(crmRows.map(r => String(r['Sector'] || '')))].sort();
console.log('\n=== UNIQUE SECTORS ===');
console.log(sectors.join(', '));

// Summary by type
const byType = {};
for (const r of crmRows) {
  const t = String(r['Type'] || '');
  if (!byType[t]) byType[t] = [];
  byType[t].push(r);
}
console.log('\n=== COUNT BY TYPE ===');
for (const [t, rows] of Object.entries(byType).sort()) {
  const rents = rows.map(r => r['Rent']).join(', ');
  console.log(`  ${t}: ${rows.length} records | Rents: ${rents}`);
}
