import Link from 'next/link';
import { Section } from '@/components/layout/Container';
import { LOCATIONS } from '@/lib/locations';

export function AreasWeServe() {
  return (
    <Section id="areas">
      <p className="eyebrow">Areas We Serve</p>
      <h2 className="font-display text-display-lg mt-6">
        Focused Gurgaon micro-markets.
      </h2>

      <ul
        role="list"
        className="mt-12 grid gap-px bg-line hairline sm:grid-cols-2 lg:grid-cols-3"
      >
        {LOCATIONS.map((area) => (
          <li key={area.slug} className="bg-paper">
            <Link
              href={`/locations/${area.slug}`}
              className="block p-6 md:p-8 hover:opacity-70 transition-opacity"
            >
              <span className="font-display text-2xl leading-tight">
                {area.name}
              </span>
              <span className="mt-3 block text-sm text-muted leading-relaxed">
                {area.blurb}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
