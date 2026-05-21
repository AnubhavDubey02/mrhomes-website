import { Section } from '@/components/layout/Container';
import { PROPERTIES } from '@/lib/properties';
import { PropertyGrid } from '@/components/ui/PropertyCard';

/**
 * Featured Properties — renders available inventory on the home page.
 * Returns null when there are no available listings, so the home page
 * layout remains unchanged when inventory is empty.
 */
export function FeaturedProperties() {
  const featured = PROPERTIES.filter((p) => p.status === 'available');
  if (featured.length === 0) return null;

  return (
    <Section>
      <p className="eyebrow">Featured Properties</p>
      <h2 className="font-display text-display-lg mt-6">Currently available</h2>
      <div className="mt-12">
        <PropertyGrid items={featured} empty={null} />
      </div>
    </Section>
  );
}
