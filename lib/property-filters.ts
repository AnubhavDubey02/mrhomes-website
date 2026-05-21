// Parses /properties query params (set by SmartSearch) into normalized,
// display-ready filters and provides the helpers used by the results page:
// summary chips, contextual empty-state copy, contextual WhatsApp message,
// and inventory filtering.
//
// Architecture is kept open: the filter object is the single source of truth;
// PropertyGrid + EmptyState are unchanged.

import { LOCATIONS } from './locations';
import { PROPERTIES, type Property } from './properties';
import {
  RENT_BUDGET_LABELS,
  BUY_BUDGET_LABELS,
  COMMERCIAL_BUDGET_LABELS,
} from './budgets';

export type Labelled = { value: string; label: string };

export type PropertyFilters = {
  intent?: 'buy' | 'rent';
  type?: Labelled;
  apartmentType?: Labelled;
  commercialType?: Labelled;
  area?: { slug: string; name: string };
  budget?: Labelled;
  furnishing?: Labelled;
  roomPreference?: Labelled;
};

/* ------------------------------------------------------------------ */
/* Label maps — mirror the SmartSearch option lists                    */
/* ------------------------------------------------------------------ */

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  'builder-floor': 'Builder Floor',
  'independent-villa': 'Independent Villa',
  plot: 'Plot',
  commercial: 'Commercial',
  studio: 'Studio',
  '1-rk': '1 RK',
  'pre-occupied-room': 'Pre-occupied Room',
};

const APARTMENT_LABELS: Record<string, string> = {
  '1-bhk': '1 BHK',
  '2-bhk': '2 BHK',
  '3-bhk': '3 BHK',
  '4-bhk-': '4 BHK +',
};

const COMMERCIAL_LABELS: Record<string, string> = {
  shop: 'Shop',
  office: 'Office',
  sco: 'SCO',
  warehouse: 'Warehouse',
};

const FURNISHING_LABELS: Record<string, string> = {
  furnished: 'Furnished',
  'semi-furnished': 'Semi Furnished',
  unfurnished: 'Unfurnished',
};

const ROOM_PREF_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  any: 'Any',
  'working-professional': 'Working Professional',
  student: 'Student',
};

// Build budget label lookup from the canonical lists in lib/budgets.ts.
// Keys are slugs, values are the display labels.
const BUDGET_LABELS: Record<string, string> = (() => {
  const slug = (s: string) =>
    s.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
  const out: Record<string, string> = {};
  for (const labels of [
    RENT_BUDGET_LABELS,
    BUY_BUDGET_LABELS,
    COMMERCIAL_BUDGET_LABELS,
  ]) {
    for (const l of labels) out[slug(l)] = l;
  }
  return out;
})();

/* ------------------------------------------------------------------ */
/* Parsing                                                              */
/* ------------------------------------------------------------------ */

type RawParams = { [k: string]: string | string[] | undefined };

const first = (v: string | string[] | undefined): string | undefined => {
  if (Array.isArray(v)) return v[0];
  return v;
};

const labelled = (
  value: string | undefined,
  map: Record<string, string>,
): Labelled | undefined => {
  if (!value) return undefined;
  const label = map[value];
  if (!label) return undefined;
  return { value, label };
};

export function parseFilters(sp: RawParams): PropertyFilters {
  const intentRaw = first(sp.intent);
  const intent: PropertyFilters['intent'] =
    intentRaw === 'buy' || intentRaw === 'rent' ? intentRaw : undefined;

  const areaSlug = first(sp.area);
  const area = areaSlug
    ? LOCATIONS.find((l) => l.slug === areaSlug)
    : undefined;

  return {
    intent,
    type: labelled(first(sp.type), TYPE_LABELS),
    apartmentType: labelled(first(sp.apartmentType), APARTMENT_LABELS),
    commercialType: labelled(first(sp.commercialType), COMMERCIAL_LABELS),
    area: area ? { slug: area.slug, name: area.name } : undefined,
    budget: labelled(first(sp.budget), BUDGET_LABELS),
    furnishing: labelled(first(sp.furnishing), FURNISHING_LABELS),
    roomPreference: labelled(first(sp.roomPreference), ROOM_PREF_LABELS),
  };
}

export function hasAnyFilter(f: PropertyFilters): boolean {
  return Boolean(
    f.intent ||
      f.type ||
      f.apartmentType ||
      f.commercialType ||
      f.area ||
      f.budget ||
      f.furnishing ||
      f.roomPreference,
  );
}

/* ------------------------------------------------------------------ */
/* Summary chips                                                       */
/* ------------------------------------------------------------------ */

/**
 * Ordered list of chips for the summary bar. Only present fields render.
 * Example: ["Buy", "Apartment", "2 BHK", "DLF Phase 3", "₹1 – 2 Cr"]
 */
export function summaryChips(f: PropertyFilters): string[] {
  const chips: string[] = [];
  if (f.intent) chips.push(f.intent === 'buy' ? 'Buy' : 'Rent');
  if (f.type) chips.push(f.type.label);
  if (f.apartmentType) chips.push(f.apartmentType.label);
  if (f.commercialType) chips.push(f.commercialType.label);
  if (f.area) chips.push(f.area.name);
  if (f.budget) chips.push(f.budget.label);
  if (f.furnishing) chips.push(f.furnishing.label);
  if (f.roomPreference) chips.push(f.roomPreference.label);
  return chips;
}

/* ------------------------------------------------------------------ */
/* Contextual empty-state copy                                         */
/* ------------------------------------------------------------------ */

/** A natural noun phrase like "2 BHK apartment" or "pre-occupied room" or "office". */
function describeKind(f: PropertyFilters): string {
  const lower = (s: string) => s.toLowerCase();
  // Apartment + configuration
  if (f.type?.value === 'apartment' && f.apartmentType) {
    return `${f.apartmentType.label} apartment`;
  }
  // Commercial + sub-type
  if (f.type?.value === 'commercial' && f.commercialType) {
    return lower(f.commercialType.label);
  }
  if (f.type) return lower(f.type.label);
  return 'property';
}

export function emptyStateCopy(f: PropertyFilters): {
  title: string;
  body: string;
} {
  const kind = describeKind(f);
  const where = f.area ? ` in ${f.area.name}` : '';
  const title = `No public ${kind} listings are currently shown${where}.`;
  const body =
    'We may still have off-market or recently added options matching your requirement.';
  return { title, body };
}

/* ------------------------------------------------------------------ */
/* Contextual WhatsApp message                                         */
/* ------------------------------------------------------------------ */

/**
 * Example outputs:
 *   "Hi Mr Homes, I am looking for a 2 BHK apartment to buy in DLF Phase 3 with a budget of ₹1 – 2 Cr."
 *   "Hi Mr Homes, I am looking for a pre-occupied room to rent in Sector 43."
 */
export function whatsappFromFilters(f: PropertyFilters): string {
  if (!hasAnyFilter(f)) {
    return 'Hi Mr Homes, I would like to discuss a property requirement.';
  }

  const kind = describeKind(f);
  const article = /^[aeiou]/i.test(kind) ? 'an' : 'a';
  let s = `Hi Mr Homes, I am looking for ${article} ${kind}`;
  if (f.intent) s += ` to ${f.intent}`;
  if (f.area) s += ` in ${f.area.name}`;
  if (f.budget) s += ` with a budget of ${f.budget.label}`;
  s += '.';

  const tail: string[] = [];
  if (f.furnishing) tail.push(`Furnishing: ${f.furnishing.label}.`);
  if (f.roomPreference) tail.push(`Room preference: ${f.roomPreference.label}.`);
  return tail.length ? `${s} ${tail.join(' ')}` : s;
}

/* ------------------------------------------------------------------ */
/* Inventory filtering                                                 */
/* ------------------------------------------------------------------ */

/**
 * Filter live inventory against the parsed filters. Conservative by design:
 * we only narrow on dimensions the data actually carries (currently
 * locationSlug). Soft filters (intent, budget, furnishing, etc.) shape the
 * summary and CTA but do not prune cards — the goal is to never drop a
 * relevant lead because of an over-eager filter.
 */
export function filterProperties(f: PropertyFilters): Property[] {
  return PROPERTIES.filter((p) => {
    if (f.intent && p.intent !== f.intent) return false;
    if (f.area && p.locationSlug !== f.area.slug) return false;
    if (f.apartmentType && p.category !== f.apartmentType.value.replace('-', '')) {
      return false;
    }
    if (f.type?.value === '1-rk' && p.category !== '1rk') return false;
    if (f.type?.value === 'pre-occupied-room' && p.category !== 'pre-occupied-rooms') {
      return false;
    }
    if (f.type?.value === 'independent-villa' && !['villas', 'villas-airbnb'].includes(p.category)) {
      return false;
    }
    if (f.type?.value === 'builder-floor' && p.category !== 'builder-floors') return false;
    if (f.type?.value === 'plot' && p.category !== 'plots') return false;
    if (f.type?.value === 'commercial' && p.category !== 'commercial') return false;
    return true;
  });
}
