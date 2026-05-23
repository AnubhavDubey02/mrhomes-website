// scratch/reconcile-crm.js  — READ ONLY, no file modifications
// Compares CRM Consolidated Inventory against data/properties.json
// Matching keys: PublicRef, SourceInventoryRef, Property No + Room No + Source

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// ── 1. Load CRM Consolidated Inventory ──────────────────────────────
const wb = XLSX.readFile(path.join(__dirname, '..', 'crm', 'MrHomes_CRM.xlsx'));
const consolidatedSheet = wb.SheetNames.find(n => n.toLowerCase().includes('consolidated'));
if (!consolidatedSheet) {
  console.error('ERROR: Could not find Consolidated Inventory sheet');
  process.exit(1);
}

const wsRows = XLSX.utils.sheet_to_json(wb.Sheets[consolidatedSheet], { defval: '' });

// Filter to only rows that have a PublicRef (real listings)
const crmRows = wsRows.filter(r => r['PublicRef'] && String(r['PublicRef']).startsWith('MRH-'));

// ── 2. Load website properties.json ─────────────────────────────────
const propsRaw = fs.readFileSync(path.join(__dirname, '..', 'data', 'properties.json'), 'utf-8');
const websiteProps = JSON.parse(propsRaw);

// ── 3. Load public/listings folder names ────────────────────────────
const listingsDir = path.join(__dirname, '..', 'public', 'listings');
const listingFolders = fs.readdirSync(listingsDir).filter(d =>
  fs.statSync(path.join(listingsDir, d)).isDirectory()
);

// ── 4. Index for fast lookup ─────────────────────────────────────────
// CRM: keyed by PublicRef
const crmByRef = {};
for (const r of crmRows) {
  const ref = String(r['PublicRef']).trim();
  crmByRef[ref] = r;
}

// Website: keyed by mhId
const webByRef = {};
for (const p of websiteProps) {
  webByRef[p.mhId] = p;
}

// ── 5. Collect all PublicRefs ────────────────────────────────────────
const allCrmRefs  = new Set(Object.keys(crmByRef));
const allWebRefs  = new Set(Object.keys(webByRef));
const allFolders  = new Set(listingFolders);

// ── 6. Matched records ───────────────────────────────────────────────
const matched = [];
const mismatches = [];
const requiredRenames = [];

for (const ref of allCrmRefs) {
  const crm = crmByRef[ref];
  const web = webByRef[ref];
  const crmStatus = String(crm['WebsiteStatus'] || '').trim();
  const isPublished = ['live', 'featured'].includes(crmStatus.toLowerCase());

  if (!isPublished) continue; // Only care about published records for website comparison

  if (web) {
    // Record exists on both sides — check for field mismatches
    const issues = [];

    // Property No / Room No
    const crmPropNo = String(crm['Property No'] || '').trim();
    const crmRoomNo = String(crm['Room No'] || '').trim();
    if (web.propertyRef !== crmPropNo) {
      issues.push(`Property No: CRM="${crmPropNo}" vs Website="${web.propertyRef}"`);
    }
    if (web.roomNo !== crmRoomNo) {
      issues.push(`Room No: CRM="${crmRoomNo}" vs Website="${web.roomNo}"`);
    }

    // Type
    const crmType = String(crm['Type'] || '').trim().toUpperCase().replace(/\s+/g,'');
    const webType = String(web.type || '').trim().toUpperCase().replace(/\s+/g,'');
    if (crmType !== webType) {
      issues.push(`Type: CRM="${crm['Type']}" vs Website="${web.type}"`);
    }

    // Rent
    const crmRent = String(crm['Rent'] || '').trim();
    const webRent = String(web.rent || '').trim();
    if (crmRent !== webRent) {
      issues.push(`Rent: CRM="${crmRent}" vs Website="${webRent}"`);
    }

    // PhotoFolder vs listing folder presence
    const crmPhotoFolder = String(crm['PhotoFolder'] || '').trim();
    const hasFolderOnDisk = allFolders.has(ref);
    const folderMatchesCRM = !crmPhotoFolder || crmPhotoFolder === ref;

    if (crmPhotoFolder && crmPhotoFolder !== ref) {
      issues.push(`PhotoFolder mismatch: CRM PhotoFolder="${crmPhotoFolder}" but PublicRef="${ref}"`);
      requiredRenames.push({ ref, crmPhotoFolder, action: `PhotoFolder in CRM should be "${ref}" (or folder renamed to match)` });
    }

    // MediaFolderLink — just flag if present in CRM but empty on website
    const crmMedia = String(crm['MediaFolderLink'] || '').trim();
    const webMedia = String(web.mediaPath || '').trim();
    if (crmMedia && !webMedia) {
      issues.push(`MediaFolderLink in CRM ("${crmMedia}") not reflected on website (mediaPath is empty)`);
    }

    if (issues.length > 0) {
      mismatches.push({ ref, status: crmStatus, issues });
    } else {
      matched.push({
        ref,
        status: crmStatus,
        source: crm['Source'],
        propertyNo: crmPropNo,
        roomNo: crmRoomNo,
        type: crm['Type'],
        rent: crm['Rent'],
        photoFolder: crmPhotoFolder,
        hasFolder: hasFolderOnDisk,
        sourceInventoryRef: crm['SourceInventoryRef'],
      });
    }
  }
}

// ── 7. Missing: CRM Live/Featured records NOT on website ─────────────
const missingFromWebsite = [];
for (const ref of allCrmRefs) {
  const crm = crmByRef[ref];
  const crmStatus = String(crm['WebsiteStatus'] || '').trim();
  const isPublished = ['live', 'featured'].includes(crmStatus.toLowerCase());
  if (isPublished && !webByRef[ref]) {
    missingFromWebsite.push({
      ref,
      status: crmStatus,
      source: crm['Source'],
      propertyNo: crm['Property No'],
      roomNo: crm['Room No'],
      type: crm['Type'],
      rent: crm['Rent'],
      sourceInventoryRef: crm['SourceInventoryRef'],
    });
  }
}

// ── 8. Missing: Website records NOT in CRM ───────────────────────────
const missingFromCRM = [];
for (const ref of allWebRefs) {
  if (!crmByRef[ref]) {
    const web = webByRef[ref];
    missingFromCRM.push({
      ref,
      propertyRef: web.propertyRef,
      roomNo: web.roomNo,
      type: web.type,
      rent: web.rent,
      status: web.status,
    });
  }
}

// ── 9. Folder naming mismatches ──────────────────────────────────────
const folderMismatches = [];
for (const folder of allFolders) {
  if (folder === 'MRH-0001') continue; // demo folder, known
  if (!crmByRef[folder] && !webByRef[folder]) {
    folderMismatches.push({ folder, issue: 'Folder exists on disk but no matching CRM or website record' });
  } else if (!crmByRef[folder] && webByRef[folder]) {
    folderMismatches.push({ folder, issue: 'Folder exists on disk and matches website, but NOT in CRM' });
  }
}

// ── 10. CRM Live/Featured without a media folder on disk ─────────────
const noFolderOnDisk = [];
for (const ref of allCrmRefs) {
  const crm = crmByRef[ref];
  const crmStatus = String(crm['WebsiteStatus'] || '').trim().toLowerCase();
  if (['live', 'featured'].includes(crmStatus)) {
    if (!allFolders.has(ref)) {
      noFolderOnDisk.push({
        ref,
        status: crm['WebsiteStatus'],
        photoFolder: crm['PhotoFolder'],
        mediaFolderLink: crm['MediaFolderLink'],
      });
    }
  }
}

// ── 11. Output ───────────────────────────────────────────────────────
console.log('\n==========================================');
console.log('CRM PRODUCTION RECONCILIATION REPORT');
console.log('==========================================\n');

console.log(`CRM Total Records (with PublicRef): ${crmRows.length}`);
console.log(`CRM Live/Featured Records: ${crmRows.filter(r => ['live','featured'].includes(String(r['WebsiteStatus']||'').trim().toLowerCase())).length}`);
console.log(`Website Published Records: ${websiteProps.length}`);
console.log(`Disk Listing Folders: ${listingFolders.join(', ')}`);

console.log('\n--- MATCHED RECORDS (CRM Live/Featured ↔ Website, no issues) ---');
if (matched.length === 0) {
  console.log('  (none)');
} else {
  for (const m of matched) {
    console.log(`  ✓ ${m.ref} | ${m.status} | Source:${m.source} | Prop:${m.propertyNo} Rm:${m.roomNo} | ${m.type} ${m.rent} | SourceRef:${m.sourceInventoryRef} | PhotoFolder:${m.photoFolder || '(empty)'} | FolderOnDisk:${m.hasFolder}`);
  }
}

console.log('\n--- MISMATCHES (CRM Live/Featured fields differ from website) ---');
if (mismatches.length === 0) {
  console.log('  (none)');
} else {
  for (const m of mismatches) {
    console.log(`  ✗ ${m.ref} [${m.status}]:`);
    for (const issue of m.issues) {
      console.log(`      → ${issue}`);
    }
  }
}

console.log('\n--- REQUIRED RENAMES (PhotoFolder ≠ PublicRef) ---');
if (requiredRenames.length === 0) {
  console.log('  (none)');
} else {
  for (const r of requiredRenames) {
    console.log(`  ! ${r.ref}: ${r.action}`);
  }
}

console.log('\n--- MISSING FROM WEBSITE (CRM Live/Featured not in properties.json) ---');
if (missingFromWebsite.length === 0) {
  console.log('  (none)');
} else {
  for (const m of missingFromWebsite) {
    console.log(`  ✗ ${m.ref} | ${m.status} | Source:${m.source} | Prop:${m.propertyNo} Rm:${m.roomNo} | ${m.type} ${m.rent} | SourceRef:${m.sourceInventoryRef}`);
  }
}

console.log('\n--- MISSING FROM CRM (Website records with no CRM entry) ---');
if (missingFromCRM.length === 0) {
  console.log('  (none)');
} else {
  for (const m of missingFromCRM) {
    console.log(`  ✗ ${m.ref} | Website status:${m.status} | Prop:${m.propertyRef} Rm:${m.roomNo} | ${m.type} ${m.rent}`);
  }
}

console.log('\n--- FOLDER NAMING MISMATCHES (disk folders with no matching CRM/website record) ---');
if (folderMismatches.length === 0) {
  console.log('  (none)');
} else {
  for (const f of folderMismatches) {
    console.log(`  ! ${f.folder}: ${f.issue}`);
  }
}

console.log('\n--- LIVE/FEATURED CRM RECORDS WITH NO MEDIA FOLDER ON DISK ---');
if (noFolderOnDisk.length === 0) {
  console.log('  (none)');
} else {
  for (const n of noFolderOnDisk) {
    console.log(`  - ${n.ref} [${n.status}] | CRM PhotoFolder:${n.photoFolder} | DriveLink:${n.mediaFolderLink || '(empty)'}`);
  }
}

console.log('\n==========================================');
console.log('END OF REPORT');
console.log('==========================================');
