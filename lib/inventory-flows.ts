import { PROPERTIES, type Property } from './properties';

export type InventoryIntent = 'rent' | 'buy' | 'commercial';

export type InventoryCategory = {
  intent: InventoryIntent;
  slug: string;
  label: string;
  description: string;
};

export const RENT_CATEGORIES: InventoryCategory[] = [
  { intent: 'rent', slug: '1rk', label: '1RK', description: 'Compact rental options for individual stays.' },
  { intent: 'rent', slug: '1bhk', label: '1BHK', description: 'Single-bedroom homes and serviced rental options.' },
  { intent: 'rent', slug: '2bhk', label: '2BHK', description: 'Two-bedroom homes for families, couples, and professionals.' },
  { intent: 'rent', slug: '3bhk', label: '3BHK', description: 'Larger rental homes across Gurgaon micro-markets.' },
  { intent: 'rent', slug: 'pre-occupied-rooms', label: 'Pre-occupied Rooms', description: 'Room-led inventory for shared and managed stays.' },
  { intent: 'rent', slug: 'villas-airbnb', label: 'Villas / Airbnb', description: 'Independent villas and short-stay friendly homes.' },
];

export const BUY_CATEGORIES: InventoryCategory[] = [
  { intent: 'buy', slug: 'high-rise', label: 'High-rise', description: 'Apartment residences in established and emerging societies.' },
  { intent: 'buy', slug: 'builder-floors', label: 'Builder Floors', description: 'Independent floor options in plotted Gurgaon sectors.' },
  { intent: 'buy', slug: 'villas', label: 'Villas', description: 'Independent villas and low-density private residences.' },
  { intent: 'buy', slug: 'plots', label: 'Plots', description: 'Land and plotted development opportunities.' },
];

export const COMMERCIAL_CATEGORIES: InventoryCategory[] = [
  { intent: 'commercial', slug: 'shops', label: 'Shops', description: 'Retail shops and shopfront inventory across Gurgaon.' },
  { intent: 'commercial', slug: 'offices', label: 'Offices', description: 'Office spaces for teams, consultants, and growing businesses.' },
  { intent: 'commercial', slug: 'sco', label: 'SCO', description: 'Shop-cum-office options for retail and mixed commercial use.' },
  { intent: 'commercial', slug: 'retail', label: 'Retail', description: 'High-street and neighborhood retail opportunities.' },
  { intent: 'commercial', slug: 'co-working', label: 'Co-working', description: 'Flexible and managed workspace options.' },
];

export function categoriesFor(intent: InventoryIntent) {
  if (intent === 'rent') return RENT_CATEGORIES;
  if (intent === 'commercial') return COMMERCIAL_CATEGORIES;
  return BUY_CATEGORIES;
}

export function categoryPath(category: InventoryCategory) {
  return `/${category.intent}/${category.slug}`;
}

export function getCategory(intent: InventoryIntent, slug: string) {
  return categoriesFor(intent).find((category) => category.slug === slug);
}

export function listingsFor(intent: InventoryIntent, category?: string): Property[] {
  return PROPERTIES.filter((property) => {
    if (property.intent !== intent) return false;
    if (category && property.category !== category) return false;
    return true;
  });
}
