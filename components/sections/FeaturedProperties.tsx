import { Section } from '@/components/layout/Container';
import { PROPERTIES } from '@/lib/properties';
import { PropertyGrid } from '@/components/ui/PropertyCard';

/**
 * Featured Properties — renders inventory on the home page.
 *
 * Priority: show `featured` listings if any exist.
 * Fallback: show all `available` listings.
 * Returns null when neither set has entries, so the home page
 * layout remains unchanged when inventory is empty.
 */
export function FeaturedProperties() {
  const featuredSet = PROPERTIES.filter((p) => p.status === 'featured');
  const live =
    featuredSet.length > 0
      ? featuredSet
      : PROPERTIES.filter((p) => p.status === 'available');

  if (live.length === 0) return null;

  return (
    <Section>
      <p className="eyebrow">Featured Properties</p>
      <h2 className="font-display text-display-lg mt-6">Currently available</h2>
      <div className="mt-12">
        <PropertyGrid items={live} empty={null} />
      </div>
    </Section>
  );
}
