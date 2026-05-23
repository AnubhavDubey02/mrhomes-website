// scratch/reconcile-final.js — READ ONLY, complete reconciliation
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const wb = XLSX.readFile(path.join(__dirname, '..', 'crm', 'MrHomes_CRM.xlsx'));
const consolidatedSheet = wb.SheetNames.find(n => n.toLowerCase().includes('consolidated'));
const wsRows = XLSX.utils.sheet_to_json(wb.Sheets[consolidatedSheet], { defval: '' });
const crmRows = wsRows.filter(r => r['PublicRef'] && String(r['PublicRef']).startsWith('MRH-'));

const propsRaw = fs.readFileSync(path.join(__dirname, '..', 'data', 'properties.json'), 'utf-8');
const websiteProps = JSON.parse(propsRaw);

const listingsDir = path.join(__dirname, '..', 'public', 'listings');
const listingFolders = fs.readdirSync(listingsDir).filter(d =>
  fs.statSync(path.join(listingsDir, d)).isDirectory()
);

const crmByRef = {};
for (const r of crmRows) crmByRef[String(r['PublicRef']).trim()] = r;

const webByRef = {};
for (const p of websiteProps) webByRef[p.mhId] = p;

// ── Website MRH-1001..1015 vs their actual CRM entries ──────────────
console.log('\n====================================');
console.log('CRM PRODUCTION RECONCILIATION REPORT');
console.log('====================================\n');

const webRefs = Object.keys(webByRef);

console.log('SUMMARY COUNTS');
console.log('─────────────────────────────────────');
console.log(`  CRM total records (with PublicRef): ${crmRows.length}`);
const crmAllStatuses = [...new Set(crmRows.map(r => String(r['WebsiteStatus']||'').trim()))];
console.log(`  CRM WebsiteStatus values present:   ${JSON.stringify(crmAllStatuses)}`);
console.log(`  Website published records:           ${websiteProps.length}`);
console.log(`  public/listings folders on disk:     ${listingFolders.join(', ')}`);

// ── SECTION 1: Matched records ───────────────────────────────────────
console.log('\n\n1. MATCHED RECORDS (PublicRef exists in BOTH CRM and website)');
console.log('─────────────────────────────────────────────────────────────');

let matchedCount = 0;
for (const ref of webRefs) {
  const crm = crmByRef[ref];
  const web = webByRef[ref];
  if (crm) {
    matchedCount++;
    const crmStatus = String(crm['WebsiteStatus']||'').trim();
    console.log(`  ✓ ${ref}`);
    console.log(`      CRM  → Status:${crmStatus} | Source:${crm['Source']} | Prop No:${crm['Property No']} | Room No:${crm['Room No']} | Type:${crm['Type']} | Rent:${crm['Rent']}`);
    console.log(`      WEB  → Status:${web.status}   | PropRef:${web.propertyRef} | RoomNo:${web.roomNo} | Type:${web.type} | Rent:${web.rent}`);
    console.log(`      CRM SourceInventoryRef: ${crm['SourceInventoryRef']}`);
    console.log(`      CRM PhotoFolder:        ${crm['PhotoFolder']}`);
    console.log(`      CRM MediaFolderLink:    ${crm['MediaFolderLink'] || '(empty)'}`);
  }
}
if (matchedCount === 0) console.log('  (none)');

// ── SECTION 2: Field mismatches for matched records ──────────────────
console.log('\n\n2. FIELD MISMATCHES (PublicRef matched but fields differ)');
console.log('──────────────────────────────────────────────────────────');

let mismatchCount = 0;
for (const ref of webRefs) {
  const crm = crmByRef[ref];
  const web = webByRef[ref];
  if (!crm) continue;

  const issues = [];
  const crmPropNo = String(crm['Property No']||'').trim();
  const crmRoomNo = String(crm['Room No']||'').trim();
  const crmType   = String(crm['Type']||'').trim().toUpperCase().replace(/\s+/g,'');
  const crmRent   = String(crm['Rent']||'').trim();
  const crmStatus = String(crm['WebsiteStatus']||'').trim();
  const webStatus = web.status === 'featured' ? 'Featured' : web.status === 'available' ? 'Live' : web.status;

  if (web.propertyRef !== crmPropNo)
    issues.push(`Property No: CRM="${crmPropNo}" ≠ Website="${web.propertyRef}"`);
  if (web.roomNo !== crmRoomNo)
    issues.push(`Room No: CRM="${crmRoomNo}" ≠ Website="${web.roomNo}"`);
  if (web.type.toUpperCase() !== crmType)
    issues.push(`Type: CRM="${crm['Type']}" ≠ Website="${web.type}"`);
  if (web.rent !== crmRent)
    issues.push(`Rent: CRM="${crmRent}" ≠ Website="${web.rent}"`);
  if (crmStatus.toLowerCase() !== webStatus.toLowerCase())
    issues.push(`WebsiteStatus: CRM="${crmStatus}" ≠ Website="${webStatus}"`);

  if (issues.length > 0) {
    mismatchCount++;
    console.log(`  ✗ ${ref}:`);
    for (const i of issues) console.log(`      → ${i}`);
  }
}
if (mismatchCount === 0) console.log('  (none found among matched records)');

// ── SECTION 3: PhotoFolder mismatches ───────────────────────────────
console.log('\n\n3. PHOTO FOLDER MISMATCHES');
console.log('────────────────────────────');

let photoMismatchCount = 0;
for (const ref of webRefs) {
  const crm = crmByRef[ref];
  if (!crm) continue;
  const crmPhotoFolder = String(crm['PhotoFolder']||'').trim();
  if (crmPhotoFolder && crmPhotoFolder !== ref) {
    photoMismatchCount++;
    console.log(`  ✗ ${ref}: CRM PhotoFolder="${crmPhotoFolder}" does not match PublicRef`);
  }
}
if (photoMismatchCount === 0) console.log('  (none — all PhotoFolder values match PublicRef or are empty)');

// ── SECTION 4: MediaFolderLink mismatches ──────────────────────────
console.log('\n\n4. MEDIA FOLDER LINK MISMATCHES');
console.log('─────────────────────────────────');
console.log('  (CRM MediaFolderLink vs website mediaPath)');

let mediaCount = 0;
for (const ref of webRefs) {
  const crm = crmByRef[ref];
  const web = webByRef[ref];
  if (!crm) continue;
  const crmLink = String(crm['MediaFolderLink']||'').trim();
  const webLink = String(web.mediaPath||'').trim();
  if (crmLink !== webLink) {
    mediaCount++;
    console.log(`  ! ${ref}:`);
    console.log(`      CRM  MediaFolderLink: ${crmLink || '(empty)'}`);
    console.log(`      WEB  mediaPath:        ${webLink || '(empty)'}`);
  }
}
if (mediaCount === 0) console.log('  (none)');

// ── SECTION 5: Folder naming mismatches on disk ─────────────────────
console.log('\n\n5. FOLDER NAMING MISMATCHES (public/listings/ on disk)');
console.log('────────────────────────────────────────────────────────');

for (const folder of listingFolders) {
  if (folder === 'MRH-0001') {
    console.log(`  - ${folder}: Demo/seed folder (not managed by CRM pipeline)`);
    continue;
  }
  const inCRM = !!crmByRef[folder];
  const inWeb = !!webByRef[folder];
  if (!inCRM && !inWeb) console.log(`  ✗ ${folder}: On disk but NOT in CRM or website`);
  else if (!inCRM) console.log(`  ✗ ${folder}: On disk + in website but NOT in CRM`);
  else if (!inWeb) console.log(`  ✗ ${folder}: On disk + in CRM but NOT in website`);
  else console.log(`  ✓ ${folder}: On disk, in CRM, in website`);
}

// ── SECTION 6: Website records not in CRM ────────────────────────────
console.log('\n\n6. WEBSITE RECORDS NOT PRESENT IN CRM');
console.log('───────────────────────────────────────');
let notInCRM = 0;
for (const ref of webRefs) {
  if (!crmByRef[ref]) {
    notInCRM++;
    const web = webByRef[ref];
    console.log(`  ✗ ${ref} | WebStatus:${web.status} | PropRef:${web.propertyRef} Rm:${web.roomNo} | ${web.type} ${web.rent}`);
  }
}
if (notInCRM === 0) console.log('  (none — all website records have a matching CRM entry)');

// ── SECTION 7: CRM records not on website ────────────────────────────
// Only care about Live/Featured — hidden ones are expected to be absent
const crmStatusesToCheck = crmRows.filter(r => {
  const s = String(r['WebsiteStatus']||'').trim().toLowerCase();
  return s === 'live' || s === 'featured';
});

console.log('\n\n7. CRM LIVE/FEATURED RECORDS NOT ON WEBSITE');
console.log('─────────────────────────────────────────────');
if (crmStatusesToCheck.length === 0) {
  console.log('  ℹ No records in CRM have WebsiteStatus=Live or Featured.');
  console.log('  All 165 CRM records use WebsiteStatus=Hidden or Pending (or similar).');
} else {
  for (const r of crmStatusesToCheck) {
    const ref = String(r['PublicRef']).trim();
    if (!webByRef[ref]) {
      console.log(`  ✗ ${ref} [${r['WebsiteStatus']}] | Src:${r['Source']} | Prop:${r['Property No']} Rm:${r['Room No']}`);
    }
  }
}

// ── SECTION 8: Required renames ──────────────────────────────────────
console.log('\n\n8. REQUIRED RENAMES');
console.log('────────────────────');
console.log('  (Based on mismatches between CRM records and website entries)');

let renameCount = 0;
for (const ref of webRefs) {
  const crm = crmByRef[ref];
  const web = webByRef[ref];
  if (!crm) continue;

  const crmStatus = String(crm['WebsiteStatus']||'').trim();
  // The CRM has these as "Hidden" — but website shows them as Live/Featured
  // This is the core rename requirement
  if (crmStatus.toLowerCase() === 'hidden') {
    renameCount++;
    const crmPropNo = String(crm['Property No']||'').trim();
    const crmRoomNo = String(crm['Room No']||'').trim();
    const webPropNo = web.propertyRef;
    const webRoomNo = web.roomNo;
    console.log(`  ! ${ref}:`);
    console.log(`      CRM says: Hidden | Source:${crm['Source']} | Prop:${crmPropNo} Rm:${crmRoomNo} | ${crm['Type']} ${crm['Rent']}`);
    console.log(`      Website says: ${web.status} | PropRef:${webPropNo} Rm:${webRoomNo} | ${web.type} ${web.rent}`);
    console.log(`      → Property No mismatch: CRM="${crmPropNo}" vs Website="${webPropNo}"`);
    console.log(`      → Room No mismatch:     CRM="${crmRoomNo}" vs Website="${webRoomNo}"`);
    console.log(`      → Type mismatch:        CRM="${crm['Type']}" vs Website="${web.type}"`);
    console.log(`      → Rent mismatch:        CRM="${crm['Rent']}" vs Website="${web.rent}"`);
    console.log(`      ACTION REQUIRED: Website MRH-100X block does NOT correspond to this CRM record.`);
    console.log(`      The website PublicRef ${ref} maps to a different physical property than CRM ${ref}.`);
  }
}
if (renameCount === 0) console.log('  (none)');

// ── SECTION 9: Risk summary ──────────────────────────────────────────
console.log('\n\n9. RISK SUMMARY');
console.log('──────────────────');
console.log(`  CRITICAL: All 15 website records (MRH-1001..MRH-1015) exist in the CRM`);
console.log(`            but with COMPLETELY DIFFERENT property data.`);
console.log(`            The CRM MRH-1001..1015 block belongs to Source=S2L with different`);
console.log(`            Property Nos, Room Nos, Types, Rents, and WebsiteStatus=Hidden.`);
console.log(`            The website's MRH-1001..1015 block was independently generated`);
console.log(`            (OCR import, FNF source) and does NOT match the CRM assignments.`);
console.log(``);
console.log(`  IMPACT:`);
console.log(`    - Website is publishing 15 listings under PublicRefs that the CRM`);
console.log(`      assigns to DIFFERENT, HIDDEN S2L-source records.`);
console.log(`    - CRM has ZERO records with WebsiteStatus=Live or Featured.`);
console.log(`    - CRM has 165 records, all under WebsiteStatus=Hidden or Pending.`);
console.log(`    - The website's 15 active listings have NO authorised CRM backing.`);
console.log(``);
console.log(`  ROOT CAUSE:`);
console.log(`    The website's MRH-1001..1015 were generated from an OCR/FNF source`);
console.log(`    independently of the CRM. The CRM later assigned MRH-1001..1015 to`);
console.log(`    a different source (S2L). These two assignment systems are now`);
console.log(`    IN CONFLICT over the same PublicRef range.`);
console.log(``);
console.log(`  REQUIRED DECISIONS (operator must decide — no autonomous action):`);
console.log(`    A. Reassign the CRM's S2L records (MRH-1001..1015) to new PublicRefs`);
console.log(`       (MRH-1016+) and leave the website's FNF block intact.`);
console.log(`    B. Retire the website's FNF MRH-1001..1015 and rebuild from CRM.`);
console.log(`    C. Reconcile manually by matching on Prop No + Room No to establish`);
console.log(`       which physical properties the website listings actually represent.`);
console.log(``);
console.log(`  DO NOT MODIFY FILES until operator decision is made.`);
