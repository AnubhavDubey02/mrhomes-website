import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Section } from '@/components/layout/Container';
import { LOCATIONS } from '@/lib/locations';
import { PROPERTIES } from '@/lib/properties';
import { buildMetadata } from '@/lib/seo';
import { PropertyGrid } from '@/components/ui/PropertyCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { getLocationGuide } from '@/lib/location-guides';

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ area: l.slug }));
}

export function generateMetadata({ params }: { params: { area: string } }) {
  const loc = LOCATIONS.find((l) => l.slug === params.area);
  if (!loc)
    return buildMetadata({
      title: 'Location',
      description: '',
      path: `/locations/${params.area}`,
    });
  const guide = getLocationGuide(loc.slug);
  const description = guide
    ? `${loc.name}, Gurgaon — ${guide.overview[0].slice(0, 150)}`
    : loc.blurb;
  return buildMetadata({
    title: `${loc.name} — Properties & Guide`,
    description,
    path: `/locations/${loc.slug}`,
  });
}

export default function LocationPage({ params }: { params: { area: string } }) {
  const loc = LOCATIONS.find((l) => l.slug === params.area);
  if (!loc) notFound();

  const guide = getLocationGuide(loc!.slug);
  const inArea = PROPERTIES.filter((p) => p.locationSlug === loc!.slug);
  const waHref = whatsappLink(waMessages.location(loc!.name));

  return (
    <>
      {/* Hero */}
      <Section className="pt-24">
        <p className="eyebrow">Location · Gurgaon</p>
        <h1 className="font-display text-display-lg mt-6 max-w-[20ch]">
          {loc!.name}
        </h1>
        <p className="mt-8 max-w-prose text-lg text-muted leading-relaxed">
          {loc!.blurb}
        </p>
      </Section>

      {/* 1 — Area overview */}
      {guide && (
        <Section>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Area overview</p>
              <h2 className="font-display text-display-md mt-3 max-w-[20ch]">
                What {loc!.name} actually is.
              </h2>
            </div>
            <div className="lg:col-span-8 max-w-prose">
              {guide.overview.map((para, i) => (
                <p
                  key={i}
                  className={`text-lg text-muted leading-relaxed ${
                    i === 0 ? '' : 'mt-6'
                  }`}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* 2 — Who this area suits */}
      {guide && (
        <Section>
          <p className="eyebrow">Who this area suits</p>
          <h2 className="font-display text-display-md mt-3 max-w-[24ch]">
            The kinds of briefs that tend to land here.
          </h2>

          <ul
            role="list"
            className="mt-12 grid gap-px bg-line hairline sm:grid-cols-2 lg:grid-cols-3"
          >
            {guide.suits.map((s) => (
              <li
                key={s}
                className="bg-paper p-6 md:p-7 flex items-baseline gap-4"
              >
                <span
                  aria-hidden
                  className="block w-2 h-px bg-ink translate-y-[-0.4rem]"
                />
                <span className="font-display text-xl md:text-[1.4rem] leading-snug">
                  {s}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 3 — Property landscape */}
      {guide && (
        <Section>
          <p className="eyebrow">Property landscape</p>
          <h2 className="font-display text-display-md mt-3 max-w-[24ch]">
            The stock you will actually see.
          </h2>

          <ol
            role="list"
            className="mt-12 grid gap-px bg-line hairline sm:grid-cols-2"
          >
            {guide.landscape.map((item, i) => (
              <li
                key={item.kind}
                className="bg-paper p-6 md:p-8 flex flex-col gap-3"
              >
                <span className="eyebrow">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-2xl leading-tight">
                  {item.kind}
                </h3>
                <p className="text-muted leading-relaxed">{item.note}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* 4 — Rental & buying considerations */}
      {guide && (
        <Section>
          <p className="eyebrow">Considerations</p>
          <h2 className="font-display text-display-md mt-3 max-w-[24ch]">
            What to weigh before signing.
          </h2>

          <div className="mt-12 grid gap-px bg-line hairline md:grid-cols-2">
            <div className="bg-paper p-6 md:p-10 flex flex-col gap-4">
              <span className="eyebrow">For renters</span>
              <h3 className="font-display text-2xl leading-tight">
                Rental considerations
              </h3>
              <p className="text-muted leading-relaxed">
                {guide.considerations.rentals}
              </p>
            </div>
            <div className="bg-paper p-6 md:p-10 flex flex-col gap-4">
              <span className="eyebrow">For buyers</span>
              <h3 className="font-display text-2xl leading-tight">
                Buying considerations
              </h3>
              <p className="text-muted leading-relaxed">
                {guide.considerations.buying}
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* Inventory */}
      <Section>
        <p className="eyebrow">Currently in {loc!.name}</p>
        <h2 className="font-display text-display-md mt-3 max-w-[24ch]">
          Active listings in this micro-market.
        </h2>

        <div className="mt-12">
          <PropertyGrid
            items={inArea}
            empty={
              <EmptyState
                eyebrow="Inventory"
                title={`Nothing live in ${loc!.name} right now.`}
                body={`We are not currently carrying public stock in ${loc!.name}. Share your brief and we will reach out the moment a matching option opens.`}
                whatsappMessage={waMessages.location(loc!.name)}
              />
            }
          />
        </div>
      </Section>

      {/* 5 — Closing CTA */}
      <Section>
        <div className="border-t border-line pt-16 md:pt-20 max-w-prose">
          <p className="eyebrow">Next step</p>
          <h2 className="font-display text-display-md mt-3 max-w-[22ch]">
            Tell us what you are looking for in {loc!.name}.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-primary">
              Share your requirement
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
