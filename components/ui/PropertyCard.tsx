import Link from 'next/link';
import type { Property } from '@/lib/properties';
import { LOCATIONS } from '@/lib/locations';

const STATUS_LABEL: Record<Property['status'], string> = {
  available: 'Available',
  'under-offer': 'Under offer',
  sold: 'Sold',
};

/**
 * Editorial inventory card. One property = one tall figure + meta.
 * Designed to live in a hairline grid (gap-px on parent + bg-line).
 *
 * Image is rendered as a `next/image` when sources exist; otherwise a
 * neutral `bg-bone` placeholder so the card holds shape pre-photography.
 */
export function PropertyCard({
  property,
  className = '',
}: {
  property: Property;
  className?: string;
}) {
  const area = LOCATIONS.find((l) => l.slug === property.locationSlug)?.name;
  const cover = property.images?.[0];

  return (
    <Link
      href={`/properties/${property.slug}`}
      className={`bg-paper p-6 md:p-8 group block ${className}`}
    >
      <figure className="relative aspect-[4/3] w-full bg-bone overflow-hidden mb-6">
        {cover ? (
          // Plain <img> avoids next/image domain config for this card.
          // Swap to next/image when remote loaders are configured.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={property.title}
            className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-90"
            loading="lazy"
          />
        ) : null}
        {property.status !== 'available' && (
          <span className="absolute top-3 left-3 bg-paper text-ink text-[0.7rem] tracking-[0.14em] uppercase px-2 py-1 border border-line">
            {STATUS_LABEL[property.status]}
          </span>
        )}
      </figure>

      <div className="eyebrow">{property.configuration}</div>
      <h3 className="font-display text-2xl md:text-[1.65rem] leading-snug mt-2 group-hover:opacity-70 transition-opacity">
        {property.title}
      </h3>

      <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted">
        {area && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Area</dt>
            <dd>{area}</dd>
          </div>
        )}
        {property.carpetAreaSqft > 0 && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Carpet area</dt>
            <dd>{property.carpetAreaSqft.toLocaleString('en-IN')} sq ft</dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <dt className="sr-only">Price</dt>
          <dd className="text-ink">{property.priceLabel}</dd>
        </div>
      </dl>
    </Link>
  );
}

/**
 * Grid wrapper that renders cards in the editorial hairline pattern.
 * Falls back to <EmptyState> when the list is empty.
 */
export function PropertyGrid({
  items,
  empty,
}: {
  items: Property[];
  empty: React.ReactNode;
}) {
  if (items.length === 0) return <>{empty}</>;
  return (
    <div className="grid gap-px bg-line hairline sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <PropertyCard key={p.slug} property={p} />
      ))}
    </div>
  );
}
