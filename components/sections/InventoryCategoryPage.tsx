import Link from 'next/link';
import { Section } from '@/components/layout/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyGrid } from '@/components/ui/PropertyCard';
import {
  listingsFor,
  type InventoryCategory,
  type InventoryIntent,
} from '@/lib/inventory-flows';

export function InventoryCategoryPage({
  intent,
  category,
}: {
  intent: InventoryIntent;
  category: InventoryCategory;
}) {
  const listings = listingsFor(intent, category.slug);
  const parentLabel =
    intent === 'rent' ? 'Rent' : intent === 'commercial' ? 'Commercial' : 'Buy';

  return (
    <Section className="pt-24">
      <p className="eyebrow">
        {parentLabel} Â· {category.label}
      </p>
      <h1 className="font-display text-display-lg mt-6">{category.label}</h1>
      <p className="mt-8 max-w-prose text-lg text-muted">
        {category.description}
      </p>

      <div className="mt-12">
        <PropertyGrid
          items={listings}
          empty={
            <EmptyState
              eyebrow="Inventory"
              title={`No public ${category.label.toLowerCase()} listings are currently shown.`}
              body="Share your brief and we will respond with current matching options."
            />
          }
        />
      </div>

      <div className="mt-10">
        <Link
          href={`/${intent}`}
          className="eyebrow hover:text-ink transition-colors"
        >
          Back to {parentLabel}
        </Link>
      </div>
    </Section>
  );
}
