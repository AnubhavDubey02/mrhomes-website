// scratch/crm-deep-inspect.js — read only
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const wb = XLSX.readFile(path.join(__dirname, '..', 'crm', 'MrHomes_CRM.xlsx'));

console.log('ALL SHEET NAMES:', JSON.stringify(wb.SheetNames));

// Find consolidated sheet
const consolidatedSheet = wb.SheetNames.find(n => n.toLowerCase().includes('consolidated'));
const ws = wb.Sheets[consolidatedSheet];
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

console.log(`\nTotal rows in "${consolidatedSheet}": ${rows.length}`);

// Show all unique WebsiteStatus values
const statusValues = [...new Set(rows.map(r => String(r['WebsiteStatus'] || '(empty)')))];
console.log('\nAll WebsiteStatus values in CRM:', JSON.stringify(statusValues));

// Show all unique PublicRef patterns
const publicRefs = [...new Set(rows.map(r => String(r['PublicRef'] || '(empty)')))];
console.log(`\nAll PublicRef values (${publicRefs.length}):`, JSON.stringify(publicRefs.slice(0, 30)));

// Show rows with each status
for (const status of statusValues) {
  const matching = rows.filter(r => String(r['WebsiteStatus'] || '') === status);
  console.log(`\n--- WebsiteStatus="${status}" (${matching.length} rows) ---`);
  for (const r of matching) {
    console.log(`  ${r['PublicRef']} | Src:${r['Source']} | Prop:${r['Property No']} Rm:${r['Room No']} | ${r['Type']} ${r['Rent']} | PhotoFolder:${r['PhotoFolder']} | MediaFolderLink:${r['MediaFolderLink'] ? r['MediaFolderLink'].substring(0,50) : '(empty)'}`);
  }
}

// Check what the website's 15 records (MRH-1001 to MRH-1015) look like in CRM
const webRefs = ['MRH-1001','MRH-1002','MRH-1003','MRH-1004','MRH-1005','MRH-1006',
                 'MRH-1007','MRH-1008','MRH-1009','MRH-1010','MRH-1011','MRH-1012',
                 'MRH-1013','MRH-1014','MRH-1015'];
console.log('\n--- CRM records for website MRH-1001 to MRH-1015 ---');
for (const ref of webRefs) {
  const found = rows.find(r => r['PublicRef'] === ref);
  if (found) {
    console.log(`  FOUND: ${ref} | Status:${found['WebsiteStatus']} | Src:${found['Source']} | Prop:${found['Property No']} Rm:${found['Room No']} | ${found['Type']} ${found['Rent']}`);
  } else {
    console.log(`  NOT IN CRM: ${ref}`);
  }
}
