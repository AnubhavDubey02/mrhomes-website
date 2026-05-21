import Link from 'next/link';
import { Section } from '@/components/layout/Container';
import {
  BUY_CATEGORIES,
  RENT_CATEGORIES,
  categoryPath,
  type InventoryCategory,
} from '@/lib/inventory-flows';

export function PropertyCategories() {
  return (
    <Section>
      <p className="eyebrow">Property Categories</p>
      <h2 className="font-display text-display-lg mt-6">
        Start with the flow that fits your brief.
      </h2>

      <div className="mt-12 grid gap-5 md:gap-6 lg:grid-cols-2">
        <CategoryGroup title="Rent" href="/rent" items={RENT_CATEGORIES} />
        <CategoryGroup title="Buy" href="/buy" items={BUY_CATEGORIES} />
      </div>
    </Section>
  );
}

function CategoryGroup({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: InventoryCategory[];
}) {
  return (
    <div className="border border-line bg-paper p-6 md:p-8 transition-colors duration-300 ease-editorial hover:border-ink/20">
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="font-display text-2xl md:text-[1.65rem] leading-snug">
          {title}
        </h3>
        <Link href={href} className="eyebrow hover:text-ink transition-colors">
          View all
        </Link>
      </div>
      <ul role="list" className="mt-8 grid gap-3">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={categoryPath(item)}
              className="group block border border-line bg-bone/35 p-5 md:p-6 transition-[transform,border-color,background] duration-300 ease-editorial hover:-translate-y-0.5 hover:border-ink/25 hover:bg-paper"
            >
              <span className="flex items-baseline justify-between gap-4">
                <span className="font-display text-xl md:text-[1.4rem] leading-tight">
                  {item.label}
                </span>
                <span
                  aria-hidden
                  className="h-px w-6 bg-line transition-colors duration-300 group-hover:bg-ink"
                />
              </span>
              <span className="mt-2 block text-sm text-muted leading-relaxed">
                {item.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
