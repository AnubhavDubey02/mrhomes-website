#!/usr/bin/env npx tsx
// ─────────────────────────────────────────────────────────────────
// Mr Homes — CRM CSV → data/properties.json transform
//
// Reads a CSV export from the Google Sheet CRM (Consolidated Inventory),
// filters to WebsiteStatus Live|Featured, maps to the website Property
// type, resolves local media from public/listings/{PublicRef}/, and
// writes data/properties.json.
//
// Usage:
//   npx tsx scripts/transform-inventory.ts <path-to-csv>
//
// The output is consumed by lib/properties.ts at build time.
// ─────────────────────────────────────────────────────────────────

import fs from 'node:fs';
import path from 'node:path';
import { resolveLocationSlug } from './sector-map';

// ── Types ──────────────────────────────────────────────────────────

/** Mirrors the Property type in lib/properties.ts */
interface Property {
  mhId: string;
  slug: string;
  title: string;
  locationSlug: string;
  sector: string;
  propertyRef: string;
  roomNo: string;
  type: string;
  rent: string;
  mediaPath: string;
  intent: 'rent' | 'buy' | 'commercial';
  category: string;
  configuration: string;
  area: string;
  floor: string;
  societyBuilding: string;
  availableFrom: string;
  deposit: string;
  furnishing: string;
  carpetAreaSqft: number;
  priceLabel: string;
  status: 'available' | 'featured' | 'under-offer' | 'sold';
  highlights: string[];
  images: string[];
  videoTour?: string;
  description: string;
}

type CRMRow = Record<string, string>;

// ── CSV Parser ─────────────────────────────────────────────────────

function parseLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseCSV(content: string): CRMRow[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]).map((h) => h.trim());
  const rows: CRMRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseLine(line);
    const row: CRMRow = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] ?? '').trim();
    });
    rows.push(row);
  }

  return rows;
}

// ── Field helpers ──────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateSlug(sector: string, type: string, publicRef: string): string {
  return [slugify(sector), slugify(type), publicRef.toLowerCase()].join('-');
}

function normaliseIntent(raw: string): Property['intent'] {
  const lower = raw.toLowerCase().trim();
  if (lower === 'buy' || lower === 'sale' || lower === 'sales') return 'buy';
  if (lower === 'commercial') return 'commercial';
  return 'rent';
}

function deriveCategory(type: string, intent: Property['intent']): string {
  const t = type.toLowerCase().replace(/\s+/g, '');

  if (t === '1rk') return '1rk';
  if (t === 'studio') return 'studio';
  if (t === '1bhk') return '1bhk';
  if (t === '2bhk') return '2bhk';
  if (t === '3bhk') return '3bhk';
  if (t === '4bhk' || t.startsWith('4bhk')) return '3bhk'; // rolls into 3BHK+ bucket
  if (t.includes('preoccupied') || t.includes('pre-occupied') || t === 'room') return 'pre-occupied-rooms';
  if (t.includes('villa') || t.includes('airbnb')) return intent === 'rent' ? 'villas-airbnb' : 'villas';

  // Buy categories
  if (t.includes('highrise') || t.includes('high-rise') || t.includes('apartment')) return 'high-rise';
  if (t.includes('builder') || t.includes('floor')) return 'builder-floors';
  if (t.includes('plot')) return 'plots';

  // Commercial categories
  if (t.includes('shop')) return 'shops';
  if (t.includes('office')) return 'offices';
  if (t.includes('sco')) return 'sco';
  if (t.includes('retail')) return 'retail';
  if (t.includes('cowork') || t.includes('co-work')) return 'co-working';

  return slugify(type);
}

function formatConfiguration(type: string): string {
  const match = type.trim().match(/^(\d+)\s*(BHK|RK)/i);
  if (match) return `${match[1]} ${match[2].toUpperCase()}`;
  return type.trim().charAt(0).toUpperCase() + type.trim().slice(1);
}

function formatPriceLabel(rent: string, intent: Property['intent']): string {
  if (!rent || rent.toLowerCase() === 'on request') return 'On request';

  const suffix = intent === 'rent' ? '/month' : '';

  // Normalize all range separators (hyphen, en-dash, em-dash, corrupted , "to") to en-dash (–)
  const normalized = rent
    .replace(/\s+to\s+/gi, '–')
    .replace(/\bto\b/gi, '–')
    .replace(/[\uFFFD\u2013\u2014-]/g, '–');

  const cleaned = normalized.replace(/[₹,\s]/g, '');

  // Detect and format ranges (e.g. 18K–21K)
  const rangeMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*(K|L|Cr)?–(\d+(?:\.\d+)?)\s*(K|L|Cr)?$/i);
  if (rangeMatch) {
    const lowVal = rangeMatch[1];
    const lowUnit = (rangeMatch[2] ?? '').toUpperCase();
    const highVal = rangeMatch[3];
    const highUnit = (rangeMatch[4] ?? '').toUpperCase();
    return `₹${lowVal}${lowUnit}–${highVal}${highUnit}${suffix}`;
  }

  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*(K|L|Cr)?$/i);
  if (!match) return `₹ ${rent.trim()}${suffix}`;

  const num = parseFloat(match[1]);
  const unit = (match[2] ?? '').toUpperCase();

  if (unit === 'K') {
    const full = num * 1000;
    return `₹ ${full.toLocaleString('en-IN')}${suffix}`;
  }
  if (unit === 'L') return `₹ ${num} Lakh${suffix}`;
  if (unit === 'CR') return `₹ ${num} Cr${suffix}`;

  return `₹ ${num.toLocaleString('en-IN')}${suffix}`;
}

function mapWebsiteStatus(raw: string): Property['status'] | null {
  const lower = raw.toLowerCase().trim();
  if (lower === 'featured') return 'featured';
  if (lower === 'live') return 'available';
  // Hidden, Reserved, Closed → excluded
  return null;
}

function deriveHighlights(row: CRMRow, intent: Property['intent']): string[] {
  const highlights: string[] = [];

  const availability = row['Availability'] || row['AvailableFrom'] || '';
  if (availability.toLowerCase().includes('immediate')) {
    highlights.push('Immediate Availability');
  }

  return highlights;
}


// ── Media resolver ─────────────────────────────────────────────────

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.ogg']);

function resolveMedia(
  publicRef: string,
  projectRoot: string,
): { images: string[]; videoTour?: string } {
  const dir = path.join(projectRoot, 'public', 'listings', publicRef);
  const images: string[] = [];
  let videoTour: string | undefined;

  if (!fs.existsSync(dir)) return { images, videoTour };

  function scan(currentDir: string, relativePathPrefix: string) {
    if (!fs.existsSync(currentDir)) return;
    const items = fs.readdirSync(currentDir).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );

    for (const item of items) {
      if (item.startsWith('.')) continue; // Skip hidden/system files
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      const relativePath = relativePathPrefix ? `${relativePathPrefix}/${item}` : item;

      if (stat.isDirectory()) {
        // Scan subdirectories up to 1 level deep
        if (!relativePathPrefix) {
          scan(fullPath, relativePath);
        }
      } else {
        const ext = path.extname(item).toLowerCase();
        const publicPath = `/listings/${publicRef}/${relativePath}`;

        if (IMAGE_EXTS.has(ext)) {
          images.push(publicPath);
        } else if (VIDEO_EXTS.has(ext) && !videoTour) {
          videoTour = publicPath;
        }
      }
    }
  }

  scan(dir, '');
  return { images, videoTour };
}


// ── Row transform ──────────────────────────────────────────────────

function transformRow(row: CRMRow, projectRoot: string): Property | null {
  const publicRef = (row['PublicRef'] ?? '').trim();
  const sector = (row['Sector'] ?? '').trim();
  const type = (row['Type'] ?? '').trim();
  const websiteStatus = (row['WebsiteStatus'] ?? '').trim();

  // Filter: only Live / Featured
  const status = mapWebsiteStatus(websiteStatus);
  if (!status) return null;

  // Skip rows missing required fields
  if (!publicRef || !type) {
    console.warn(`⚠ Skipping row: missing PublicRef or Type (PublicRef="${publicRef}", Type="${type}")`);
    return null;
  }

  const intent = normaliseIntent(row['ListingIntent'] || 'rent');
  const rent = (row['Rent'] || '').trim();
  const media = resolveMedia(publicRef, projectRoot);

  return {
    mhId: publicRef,
    slug: generateSlug(sector || 'gurgaon', type, publicRef),
    title: `${formatConfiguration(type)} \u00b7 ${sector || 'Gurgaon'}`,
    locationSlug: resolveLocationSlug(sector) || '',
    sector: sector,
    propertyRef: (row['Property No'] || '').trim(),
    roomNo: (row['Room No'] || '').trim(),
    type: type,
    rent: rent,
    mediaPath: (row['MediaFolderLink'] || '').trim(),
    intent: intent,
    category: deriveCategory(type, intent),
    configuration: formatConfiguration(type),
    // Future CRM fields — use when present, default when absent
    area: (row['Area'] || '').trim() || 'Available on request',
    floor: (row['Floor'] || '').trim() || 'Available on request',
    societyBuilding: (row['SocietyBuilding'] || '').trim() || 'Available on request',
    availableFrom: (row['Availability'] || row['AvailableFrom'] || '').trim() || 'Available on request',
    deposit: (row['Deposit'] || '').trim() || 'As per owner terms',
    furnishing: (row['Furnishing'] || '').trim() || 'Available on request',
    carpetAreaSqft: parseInt(row['CarpetArea'] || '0', 10) || 0,
    priceLabel: formatPriceLabel(rent, intent),
    status: status,
    highlights: deriveHighlights(row, intent),
    images: media.images,
    videoTour: media.videoTour,
    description: (row['WebsiteDescription'] || '').trim() || '',
  };

}

// ── Main ───────────────────────────────────────────────────────────

function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    console.error(
      `Mr Homes — CRM → Website Transform

Usage:
  npx tsx scripts/transform-inventory.ts <path-to-csv>

The CSV should be exported from the Google Sheet CRM
(Consolidated Inventory tab).

Required columns:
  PublicRef, Type, Sector, Rent, ListingIntent,
  WebsiteStatus, WebsiteDescription

Optional columns (used when present):
  Property No, Room No, Availability, MediaFolderLink,
  PhotoFolder, Furnishing, Floor, Area, SocietyBuilding,
  Deposit, AvailableFrom, CarpetArea

Output:
  data/properties.json`
    );
    process.exit(1);
  }

  const resolvedCSV = path.resolve(csvPath);
  if (!fs.existsSync(resolvedCSV)) {
    console.error(`✗ File not found: ${resolvedCSV}`);
    process.exit(1);
  }

  const projectRoot = path.resolve(__dirname, '..');
  const content = fs.readFileSync(resolvedCSV, 'utf-8');
  const rows = parseCSV(content);

  console.log(`  Read ${rows.length} rows from CSV`);

  const properties: Property[] = [];
  let skipped = 0;

  for (const row of rows) {
    const prop = transformRow(row, projectRoot);
    if (prop) {
      properties.push(prop);
    } else {
      const status = (row['WebsiteStatus'] ?? '').trim().toLowerCase();
      if (status !== 'hidden' && status !== 'reserved' && status !== 'closed') {
        skipped++;
      }
    }
  }

  // Sort: featured first, then by publicRef
  properties.sort((a, b) => {
    if (a.status === 'featured' && b.status !== 'featured') return -1;
    if (b.status === 'featured' && a.status !== 'featured') return 1;
    return a.mhId.localeCompare(b.mhId);
  });

  const outPath = path.join(projectRoot, 'data', 'properties.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(properties, null, 2) + '\n');

  const featured = properties.filter((p) => p.status === 'featured').length;
  const live = properties.filter((p) => p.status === 'available').length;

  console.log(`\n  ✓ ${properties.length} properties written to data/properties.json`);
  console.log(`    Featured: ${featured}`);
  console.log(`    Live:     ${live}`);
  if (skipped > 0) {
    console.log(`    Skipped (missing data): ${skipped}`);
  }
  console.log(`    Excluded (Hidden/Reserved/Closed): ${rows.length - properties.length - skipped}`);
}

main();
