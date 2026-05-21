// Real inventory only. Leave this array empty until verified listings exist —
// the UI is designed to render a dignified empty state rather than show fake stock.
export type Property = {
  mhId: string;              // internal only; never render publicly
  slug: string;
  title: string;
  locationSlug: string;     // references LOCATIONS in ./locations.ts
  sector: string;           // internal traceability
  propertyRef: string;      // internal traceability
  roomNo: string;           // internal traceability
  type: string;             // internal traceability
  rent: string;             // internal traceability
  mediaPath: string;        // internal traceability
  intent: 'rent' | 'buy' | 'commercial';
  category: string;
  configuration: string;    // e.g., "4 BHK + Servant"
  carpetAreaSqft: number;
  priceLabel: string;       // e.g., "On request" or "₹ 8.5 Cr"
  status: 'available' | 'under-offer' | 'sold';
  highlights: string[];
  images: string[];
  videoTour?: string;       // path to video tour, e.g. "/listings/MRH-0001/tour.mp4"
  description: string;
};

const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.ogg']);

/** Detect whether a media path points to a video file. */
export function isVideoPath(path: string): boolean {
  const ext = path.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';
  return VIDEO_EXTS.has(ext);
}

export const PROPERTIES: Property[] = [
  {
    mhId: 'MRH-0001',
    slug: 'sector-52-1bhk-room-402',
    title: '1 BHK · Sector 52, Gurgaon',
    locationSlug: 'sector-52',
    sector: 'Sec 52',
    propertyRef: 'Property 1197',
    roomNo: 'Room 402',
    type: '1BHK',
    rent: '\u20b925K',
    mediaPath: '/listings/MRH-0001/tour.mp4',
    intent: 'rent',
    category: '1bhk',
    configuration: '1 BHK',
    carpetAreaSqft: 0,
    priceLabel: '₹ 25,000/month',
    status: 'available',
    highlights: ['Fully Furnished', 'Immediate Availability'],
    images: [],
    videoTour: '/listings/MRH-0001/tour.mp4',
    description:
      'Fully furnished 1 BHK available for immediate occupancy in Sector 52, Gurgaon. Monthly rent ₹25,000.',
  },
];

export function getProperty(slug: string) {
  return PROPERTIES.find((p) => p.slug === slug);
}
