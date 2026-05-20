// Real inventory only. Leave this array empty until verified listings exist —
// the UI is designed to render a dignified empty state rather than show fake stock.
export type Property = {
  slug: string;
  title: string;
  locationSlug: string;     // references LOCATIONS in ./locations.ts
  configuration: string;    // e.g., "4 BHK + Servant"
  carpetAreaSqft: number;
  priceLabel: string;       // e.g., "On request" or "₹ 8.5 Cr"
  status: 'available' | 'under-offer' | 'sold';
  highlights: string[];
  images: string[];
  description: string;
};

export const PROPERTIES: Property[] = [];

export function getProperty(slug: string) {
  return PROPERTIES.find((p) => p.slug === slug);
}
