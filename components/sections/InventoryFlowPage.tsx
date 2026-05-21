import Link from 'next/link';
import { Section } from '@/components/layout/Container';
import { PropertyGrid } from '@/components/ui/PropertyCard';
import {
  categoriesFor,
  categoryPath,
  listingsFor,
  type InventoryIntent,
} from '@/lib/inventory-flows';
import { whatsappLink } from '@/lib/whatsapp';

type SearchParams = { [key: string]: string | string[] | undefined };

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const labels: Record<InventoryIntent, string> = {
  rent: 'Rent',
  buy: 'Buy',
  commercial: 'Commercial',
};

export function InventoryFlowPage({
  intent,
  searchParams,
}: {
  intent: InventoryIntent;
  searchParams?: SearchParams;
}) {
  const label = labels[intent];
  const selectedType = first(searchParams?.type);
  const sector = first(searchParams?.sector)?.trim().toLowerCase();
  const listings = listingsFor(intent, selectedType).filter((property) => {
    if (!sector) return true;
    return property.sector.toLowerCase().includes(sector);
  });
  const hasFilters = Boolean(
    selectedType ||
      first(searchParams?.areaSize) ||
      first(searchParams?.budget) ||
      first(searchParams?.sector),
  );

  return (
    <Section className="pt-24">
      <p className="eyebrow">{label}</p>
      <h1 className="font-display text-display-lg mt-6">
        {label === 'Rent'
          ? 'Rental inventory'
          : label === 'Commercial'
            ? 'Commercial inventory'
            : 'Buying inventory'}
      </h1>
      <p className="mt-8 max-w-prose text-lg text-muted">
        Choose a category to see what is currently available.
      </p>

      <ul
        role="list"
        className="mt-12 grid gap-px bg-line hairline sm:grid-cols-2 lg:grid-cols-3"
      >
        {categoriesFor(intent).map((category) => (
          <li key={category.slug} className="bg-paper">
            <Link
              href={categoryPath(category)}
              className="block p-6 md:p-8 hover:opacity-70 transition-opacity"
            >
              <span className="font-display text-2xl leading-tight">
                {category.label}
              </span>
              <span className="mt-3 block text-sm text-muted leading-relaxed">
                {category.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <InventoryFilters intent={intent} searchParams={searchParams} />

      <div className="mt-16">
        <PropertyGrid
          items={listings}
          empty={
            <NoMatchingResults
              intent={intent}
              hasFilters={hasFilters}
            />
          }
        />
      </div>
    </Section>
  );
}

function InventoryFilters({
  intent,
  searchParams,
}: {
  intent: InventoryIntent;
  searchParams?: SearchParams;
}) {
  const type = first(searchParams?.type) ?? '';
  const areaSize = first(searchParams?.areaSize) ?? '';
  const budget = first(searchParams?.budget) ?? '';
  const sector = first(searchParams?.sector) ?? '';
  const action = `/${intent}`;
  const isCommercial = intent === 'commercial';

  return (
    <form method="get" action={action} className="mt-12 border-y border-line">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <FilterField label="Property type" name="type">
          <select name="type" defaultValue={type} className={selectCls}>
            <option value="">Any</option>
            {categoriesFor(intent).map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </FilterField>
        {isCommercial && (
          <FilterField label="Area size" name="areaSize">
            <select name="areaSize" defaultValue={areaSize} className={selectCls}>
              <option value="">Any</option>
              <option value="under-500">Under 500 sq ft</option>
              <option value="500-1000">500 - 1,000 sq ft</option>
              <option value="1000-2500">1,000 - 2,500 sq ft</option>
              <option value="2500-plus">2,500 sq ft +</option>
            </select>
          </FilterField>
        )}
        <FilterField label="Budget" name="budget">
          <select name="budget" defaultValue={budget} className={selectCls}>
            <option value="">Any</option>
            {budgetOptions(intent).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Sector" name="sector">
          <input
            name="sector"
            type="text"
            defaultValue={sector}
            placeholder="Any in Gurgaon"
            className={`${selectCls} placeholder:text-muted`}
          />
        </FilterField>
      </div>
      <div className="border-t border-line p-5 md:p-6">
        <button type="submit" className="btn btn-primary">
          Search {labels[intent]}
        </button>
      </div>
    </form>
  );
}

function NoMatchingResults({
  intent,
  hasFilters,
}: {
  intent: InventoryIntent;
  hasFilters: boolean;
}) {
  const label = labels[intent].toLowerCase();
  const href = `/${intent}`;
  const waHref = whatsappLink(
    `Hi Mr Homes Realtors, I am looking for ${label} options in Gurgaon. Please help me with matching properties.`,
  );

  return (
    <div className="border-t border-b border-line py-16 md:py-20">
      <div className="max-w-prose">
        <p className="eyebrow">Inventory</p>
        <h2 className="font-display text-display-md mt-4 max-w-[22ch]">
          No matching properties found right now
        </h2>
        <p className="mt-6 text-muted leading-relaxed">
          Adjust filters or broaden your search
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href={href} className="btn btn-primary justify-center">
            Clear Filters
          </Link>
          <Link
            href={href}
            className="btn btn-ghost justify-center"
            aria-disabled={!hasFilters}
          >
            Browse All Listings
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost justify-center"
          >
            WhatsApp Requirement
          </a>
        </div>
      </div>
    </div>
  );
}

function budgetOptions(intent: InventoryIntent) {
  if (intent === 'rent') {
    return [
      { value: 'under-25k', label: 'Under 25k' },
      { value: '25k-50k', label: '25k - 50k' },
      { value: '50k-1l', label: '50k - 1L' },
      { value: '1l-plus', label: '1L +' },
    ];
  }
  if (intent === 'commercial') {
    return [
      { value: 'under-50k', label: 'Under 50k' },
      { value: '50k-1l', label: '50k - 1L' },
      { value: '1l-3l', label: '1L - 3L' },
      { value: '3l-plus', label: '3L +' },
    ];
  }
  return [
    { value: 'under-1cr', label: 'Under 1 Cr' },
    { value: '1cr-2cr', label: '1 - 2 Cr' },
    { value: '2cr-5cr', label: '2 - 5 Cr' },
    { value: '5cr-plus', label: '5 Cr +' },
  ];
}

const selectCls = `
  mt-2 w-full bg-transparent appearance-none outline-none
  font-display text-xl md:text-[1.35rem] leading-tight
  text-ink cursor-pointer pr-6
`;

function FilterField({
  label,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block px-5 md:px-6 py-5 md:py-6 border-b md:border-b-0 md:border-r border-line last:border-b-0 last:border-r-0">
      <span className="eyebrow block">{label}</span>
      {children}
    </label>
  );
}
