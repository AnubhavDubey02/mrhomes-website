// scratch/crm-inventory-analysis.js — READ ONLY
const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.readFile(path.join(__dirname, '..', 'crm', 'MrHomes_CRM.xlsx'));
const consolidatedSheet = wb.SheetNames.find(n => n.toLowerCase().includes('consolidated'));
const wsRows = XLSX.utils.sheet_to_json(wb.Sheets[consolidatedSheet], { defval: '' });
const crmRows = wsRows.filter(r => r['PublicRef'] && String(r['PublicRef']).startsWith('MRH-'));

// Print all records with key fields — sorted by PublicRef
const sorted = [...crmRows].sort((a, b) => {
  const aNum = parseInt(String(a['PublicRef']).replace('MRH-', ''));
  const bNum = parseInt(String(b['PublicRef']).replace('MRH-', ''));
  return aNum - bNum;
});

console.log('PublicRef,Source,Sector,PropertyNo,RoomNo,Type,Rent,Availability,WebsiteStatus,PhotoFolder,MediaFolderLink,VerificationStatus,SourceInventoryRef');
for (const r of sorted) {
  const cols = [
    r['PublicRef'],
    r['Source'],
    r['Sector'],
    r['Property No'],
    r['Room No'],
    r['Type'],
    r['Rent'],
    r['Availability'],
    r['WebsiteStatus'],
    r['PhotoFolder'],
    (r['MediaFolderLink'] || '').substring(0, 60),
    r['VerificationStatus'],
    r['SourceInventoryRef'],
  ].map(v => `"${String(v).replace(/"/g, '""')}"`);
  console.log(cols.join(','));
}
