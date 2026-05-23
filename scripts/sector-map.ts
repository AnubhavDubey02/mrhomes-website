// Sector → locationSlug resolver.
// Maps free-text CRM Sector values to the canonical location slugs
// defined in lib/locations.ts.
//
// Usage:
//   import { resolveLocationSlug } from './sector-map';
//   resolveLocationSlug('Sector 52')   → 'sector-52'
//   resolveLocationSlug('DLF Phase 3') → 'dlf-phase-3'

type PatternEntry = { pattern: RegExp; slug: string };

const PATTERNS: PatternEntry[] = [
  // DLF Phases — Phase 3 has its own slug; 2/4/5 share one
  { pattern: /dlf\s*phase\s*3/i, slug: 'dlf-phase-3' },
  { pattern: /dlf\s*phase\s*[245]/i, slug: 'dlf-phase-2-5' },
  { pattern: /dlf/i, slug: 'dlf-phase-2-5' },

  // Golf Course corridors
  { pattern: /golf\s*course\s*ext/i, slug: 'golf-course-extension' },
  { pattern: /gc\s*ext/i, slug: 'golf-course-extension' },
  { pattern: /gcer/i, slug: 'golf-course-extension' },
  { pattern: /golf\s*course/i, slug: 'golf-course-road' },
  { pattern: /gcr/i, slug: 'golf-course-road' },

  // Named corridors
  { pattern: /dwarka\s*exp/i, slug: 'dwarka-expressway' },
  { pattern: /sohna/i, slug: 'sohna-road' },

  // Numbered sectors
  { pattern: /sector\s*43/i, slug: 'sector-43' },
  { pattern: /sector\s*52/i, slug: 'sector-52' },
  { pattern: /sector\s*56/i, slug: 'sector-56' },
];

/**
 * Resolve a free-text CRM Sector value to a website locationSlug.
 * Returns `undefined` when no known mapping exists — the caller should
 * use a sensible default or skip the location association.
 */
export function resolveLocationSlug(sector: string): string | undefined {
  const trimmed = sector.trim();
  if (!trimmed) return undefined;

  for (const { pattern, slug } of PATTERNS) {
    if (pattern.test(trimmed)) return slug;
  }

  // Fallback: try to auto-generate a slug from "Sector NN" pattern
  const sectorMatch = trimmed.match(/^sector\s+(\d+)$/i);
  if (sectorMatch) {
    return `sector-${sectorMatch[1]}`;
  }

  return undefined;
}
