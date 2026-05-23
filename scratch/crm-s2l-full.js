// scratch/crm-s2l-full.js — READ ONLY, show all S2L records
const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.readFile(path.join(__dirname, '..', 'crm', 'MrHomes_CRM.xlsx'));
const consolidatedSheet = wb.SheetNames.find(n => n.toLowerCase().includes('consolidated'));
const wsRows = XLSX.utils.sheet_to_json(wb.Sheets[consolidatedSheet], { defval: '' });
const crmRows = wsRows.filter(r => r['PublicRef'] && String(r['PublicRef']).startsWith('MRH-'));

const s2l = crmRows.filter(r => r['Source'] === 'S2L');
console.log(`S2L records: ${s2l.length}\n`);
for (const r of s2l) {
  const avail = String(r['Availability'] || '');
  const isImm = avail.toLowerCase().includes('immediately') || avail.toLowerCase().includes('immediate');
  console.log(`${r['PublicRef']} | ${r['Sector']} | Prop:${r['Property No']} Rm:${r['Room No']} | ${r['Type']} | Rent:${r['Rent']} | Avail:${avail}${isImm?' [IMM]':''}`);
}
