import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section } from '@/components/layout/Container';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Services',
  description:
    'Rentals, sales, commercial and Airbnb assistance across Gurgaon — a boutique real estate advisory.',
  path: '/services',
});

const SERVICES = [
  {
    href: '/services/rentals',
    title: 'Rentals',
    body: 'From 1 RK and studios to family-sized apartments, builder floors, villas and pre-occupied rooms — curated rental shortlists across Gurgaon.',
  },
  {
    href: '/services/sales',
    title: 'Sales',
    body: 'Buying or selling high-rise apartments, builder floors, villas and investment-grade residences — with honest commentary throughout.',
  },
  {
    href: '/services/commercial',
    title: 'Commercial',
    body: 'Shops, offices, SCO plots and other commercial spaces — chosen on fundamentals, structured around the business use-case.',
  },
  {
    href: '/services/airbnb-assistance',
    title: 'Airbnb Assistance',
    body: 'Sourcing villas and apartments for short-stay, structuring business-use rentals, and supporting ongoing operations.',
  },
];

export default function ServicesPage() {
  return (
    <Section className="pt-24">
      <p className="eyebrow">Services</p>
      <h1 className="font-display text-display-lg mt-6 max-w-[18ch]">
        Four practices, one considered approach.
      </h1>
      <p className="mt-8 max-w-prose text-lg text-muted leading-relaxed">
        Each practice runs on the same idea: understand the brief first, share
        a small set of relevant options, and stay involved through closure and
        after. Choose the one closest to what you need.
      </p>

      <div className="mt-16 grid gap-px bg-line hairline md:grid-cols-2">
        {SERVICES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-paper p-8 md:p-10 group flex flex-col gap-4 transition-colors duration-300 ease-editorial hover:bg-bone/60"
          >
            <span className="eyebrow">Practice</span>
            <h3 className="font-display text-display-md leading-tight group-hover:opacity-80 transition-opacity">
              {s.title}
            </h3>
            <p className="text-muted max-w-prose leading-relaxed">{s.body}</p>
            <span className="mt-auto inline-flex items-center gap-2 eyebrow pt-4">
              Read more
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.25} />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
