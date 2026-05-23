// Real inventory only — loaded from data/properties.json which is generated
// by scripts/transform-inventory.ts from a CRM CSV export.
// Do NOT edit the JSON file manually; run the transform script instead.

import propertiesData from '@/data/properties.json';

export type Property = {
  mhId: string;              // PublicRef from CRM (MRH-XXXX)
  slug: string;
  title: string;
  locationSlug: string;      // references LOCATIONS in ./locations.ts
  sector: string;
  propertyRef: string;       // internal traceability
  roomNo: string;            // internal traceability
  type: string;              // internal traceability
  rent: string;              // internal traceability
  mediaPath: string;         // MediaFolderLink from CRM
  intent: 'rent' | 'buy' | 'commercial';
  category: string;
  configuration: string;     // e.g., "4 BHK + Servant"
  area: string;
  floor: string;
  societyBuilding: string;
  availableFrom: string;
  deposit: string;
  furnishing: string;
  carpetAreaSqft: number;
  priceLabel: string;        // e.g., "On request" or "₹ 8.5 Cr"
  status: 'available' | 'featured' | 'under-offer' | 'sold';
  highlights: string[];
  images: string[];
  videoTour?: string;        // path to video tour, e.g. "/listings/MRH-0001/tour.mp4"
  description: string;
};

const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.ogg']);

/** Detect whether a media path points to a video file. */
export function isVideoPath(path: string): boolean {
  const ext = path.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';
  return VIDEO_EXTS.has(ext);
}

export const PROPERTIES: Property[] = propertiesData as Property[];

export function getProperty(slug: string) {
  return PROPERTIES.find((p) => p.slug === slug);
}
