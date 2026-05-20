import Link from 'next/link';
import { Section } from '@/components/layout/Container';
import { buildMetadata } from '@/lib/seo';
import { LOCATIONS } from '@/lib/locations';
import { whatsappLink, waMessages } from '@/lib/whatsapp';

export const metadata = buildMetadata({
  title: 'About',
  description:
    'Mr Homes is a boutique advisory for buying, selling and renting premium homes in Gurgaon — built around informed, transparent, personal decisions.',
  path: '/about',
});

const HOW_WE_WORK = [
  {
    title: 'Understanding the requirement first',
    body: 'Before any options, we listen. Lifestyle, budget, timelines, intent — the brief shapes everything that follows.',
  },
  {
    title: 'Sharing multiple relevant options quickly',
    body: 'A small, considered shortlist of homes that genuinely fit — not a forwarded inventory dump.',
  },
  {
    title: 'Site visit assistance',
    body: 'Coordinated tours with context — neighbourhood, build quality, layouts, what to compare, what to question.',
  },
  {
    title: 'Transparent discussions',
    body: 'Honest views on pricing, condition and trade-offs. If a home is not right, we will say so.',
  },
  {
    title: 'Support after deal closure',
    body: 'Paperwork, handover, move-in coordination and the small things — we stay engaged after the agreement is signed.',
  },
];

export default function AboutPage() {
  const waHref = whatsappLink(waMessages.general);

  return (
    <>
      {/* 1 — Intro */}
      <Section className="pt-24">
        <p className="eyebrow">About Mr Homes</p>
        <h1 className="font-display text-display-lg mt-6 max-w-[22ch]">
          A More Considered Way to Navigate Gurgaon Real Estate
        </h1>
        <p className="mt-10 max-w-prose text-lg text-muted leading-relaxed">
          Mr Homes is built around a simple idea: property decisions should
          feel informed, transparent, and personal. Whether someone is
          searching for a home, an investment, or a business opportunity, our
          role is to simplify the process and help people make confident
          decisions.
        </p>
      </Section>

      {/* 2 — Why Mr Homes Exists */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Why Mr Homes exists</p>
          </div>
          <div className="lg:col-span-8 max-w-prose">
            <h2 className="font-display text-display-md max-w-[22ch]">
              The idea was straightforward.
            </h2>
            <p className="mt-8 text-lg text-muted leading-relaxed">
              Mr Homes began with a simple belief: finding the right property
              should feel more informed, more transparent, and more personal.
              We saw how people often spend weeks navigating irrelevant
              options and unnecessary complexity.
            </p>
            <p className="mt-6 text-lg text-muted leading-relaxed">
              The goal was to create a more considered experience —
              understanding requirements first and helping people make
              confident decisions.
            </p>
          </div>
        </div>
      </Section>

      {/* 3 — How We Work */}
      <Section>
        <p className="eyebrow">How we work</p>
        <h2 className="font-display text-display-md mt-3 max-w-[24ch]">
          Five things we do, on every brief.
        </h2>

        <ol
          role="list"
          className="mt-14 grid gap-px bg-line hairline sm:grid-cols-2 lg:grid-cols-3"
        >
          {HOW_WE_WORK.map((step, i) => (
            <li
              key={step.title}
              className="bg-paper p-6 md:p-8 flex flex-col gap-3"
            >
              <span className="eyebrow">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-2xl leading-tight">
                {step.title}
              </h3>
              <p className="text-muted leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 4 — Gurgaon expertise */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Where we work</p>
            <h2 className="font-display text-display-md mt-3 max-w-[18ch]">
              Gurgaon, in depth.
            </h2>
            <p className="mt-8 text-muted leading-relaxed max-w-prose">
              Our focus is narrow by design. Working across a defined set of
              Gurgaon micro-markets lets us speak to inventory, pricing and
              build quality with first-hand context.
            </p>
          </div>

          <ul
            role="list"
            className="lg:col-span-8 grid gap-px bg-line hairline sm:grid-cols-2"
          >
            {LOCATIONS.map((l) => (
              <li
                key={l.slug}
                className="bg-paper p-6 md:p-7 flex flex-col gap-2"
              >
                <span className="eyebrow">Area</span>
                <Link
                  href={`/locations/${l.slug}`}
                  className="font-display text-xl md:text-2xl leading-tight hover:opacity-70 transition-opacity"
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 5 — Closing CTA */}
      <Section>
        <div className="border-t border-line pt-16 md:pt-20 max-w-prose">
          <p className="eyebrow">Begin</p>
          <h2 className="font-display text-display-md mt-3 max-w-[22ch]">
            Start with a brief — we take it from there.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/properties" className="btn btn-primary">
              Start Your Search
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              WhatsApp Mr Homes
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
