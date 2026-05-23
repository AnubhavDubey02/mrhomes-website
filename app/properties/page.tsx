import Link from 'next/link';
import { Section } from '@/components/layout/Container';
import { PROPERTIES } from '@/lib/properties';
import { buildMetadata } from '@/lib/seo';
import { PropertyGrid } from '@/components/ui/PropertyCard';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  parseFilters,
  hasAnyFilter,
  summaryChips,
  emptyStateCopy,
  whatsappFromFilters,
  filterProperties,
} from '@/lib/property-filters';

export const metadata = buildMetadata({
  title: 'Properties',
  description: 'Current curated inventory across Gurgaon.',
  path: '/properties',
});

type SearchParams = { [k: string]: string | string[] | undefined };

export default function PropertiesPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const filters = parseFilters(searchParams ?? {});
  const filtered = filterProperties(filters);
  const filtersActive = hasAnyFilter(filters);
  const chips = filtersActive ? summaryChips(filters) : [];

  // Default empty-state copy when no filters are present.
  const defaultEmpty = {
    title: 'No public listings at the moment.',
    body: "Share your requirement and we'll match verified options from our Gurgaon network.",
  };
  const empty = filtersActive ? emptyStateCopy(filters) : defaultEmpty;

  // WhatsApp message: contextual when filters present, generic otherwise.
  const waMessage = filtersActive ? whatsappFromFilters(filters) : undefined;

  return (
    <Section className="pt-24">
      <p className="eyebrow">Properties</p>
      <h1 className="font-display text-display-lg mt-6">Currently with us</h1>
      <p className="mt-8 max-w-prose text-lg text-muted">
        A small, current shortlist. We add and remove discreetly — what you see
        here is what is actively available.
      </p>

      {/* Search summary bar — only when filters are present */}
      {filtersActive && (
        <div className="mt-12 border-y border-line py-5 md:py-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <div className="min-w-0">
              <p className="eyebrow">Showing results for</p>
              <p className="font-display text-xl md:text-2xl mt-2 leading-tight">
                {chips.join(' · ')}
              </p>
            </div>
            <div className="flex items-baseline gap-6">
              {filtered.length > 0 && (
                <span className="eyebrow">
                  {filtered.length}{' '}
                  {filtered.length === 1 ? 'match' : 'matches'}
                </span>
              )}
              <Link
                href="/properties"
                className="eyebrow hover:text-ink transition-colors"
              >
                Clear
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className={filtersActive ? 'mt-12' : 'mt-16'}>
        <PropertyGrid
          items={filtered}
          empty={
            <EmptyState
              eyebrow="Inventory"
              title={empty.title}
              body={empty.body}
              whatsappMessage={waMessage}
            />
          }
        />
      </div>
    </Section>
  );
}
