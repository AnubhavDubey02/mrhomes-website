import Link from 'next/link';
import { Suspense } from 'react';
import { Section } from '@/components/layout/Container';
import { buildMetadata } from '@/lib/seo';
import { PropertyGrid } from '@/components/ui/PropertyCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SmartSearch } from '@/components/sections/SmartSearch';
import { ScrollToResults } from '@/components/ui/ScrollToResults';
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
    <>
      <Section className="pt-24 pb-0">
        <p className="eyebrow">Properties</p>
        <h1 className="font-display text-display-lg mt-6">Currently with us</h1>
        <p className="mt-8 max-w-prose text-lg text-muted">
          A small, current shortlist. We add and remove discreetly — what you see
          here is what is actively available.
        </p>
      </Section>

      <Suspense fallback={<div className="h-24 bg-bone/10 animate-pulse" />}>
        <SmartSearch />
      </Suspense>

      <Section className="pt-0">
        <Suspense fallback={null}>
          <ScrollToResults />
        </Suspense>

        {filtersActive && (
          <h2 className="font-display text-2xl md:text-3xl text-ink mb-6">
            Search Results
          </h2>
        )}

        {/* Search summary bar — only when filters are present */}
        {filtersActive && (
          <div className="border-y border-line py-5 md:py-6 mb-12">
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

        <div className={filtersActive ? '' : 'mt-16'}>
          <PropertyGrid
            items={filtered}
            empty={
              filtersActive ? (
                <div className="border-t border-b border-line py-16 md:py-20">
                  <div className="max-w-prose">
                    <p className="eyebrow">Search Results</p>
                    <h2 className="font-display text-display-md mt-4 max-w-[22ch]">
                      No matching properties found
                    </h2>
                    <p className="mt-6 text-muted leading-relaxed">
                      We couldn't find any listings that match your search. Try resetting your search filters or browse all our available properties.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link href="/properties" className="btn btn-primary">
                        Clear Search
                      </Link>
                      <Link href="/properties" className="btn btn-ghost">
                        Browse All Properties
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  eyebrow="Inventory"
                  title={empty.title}
                  body={empty.body}
                  whatsappMessage={waMessage}
                />
              )
            }
          />
        </div>
      </Section>
    </>
  );
}

