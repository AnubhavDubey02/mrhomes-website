import { notFound } from 'next/navigation';
import { Section } from '@/components/layout/Container';
import { PropertyGrid } from '@/components/ui/PropertyCard';
import { getProperty, PROPERTIES, type Property } from '@/lib/properties';
import { buildMetadata } from '@/lib/seo';
import { telLink } from '@/lib/business';
import { whatsappLink } from '@/lib/whatsapp';

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getProperty(params.slug);
  if (!p) {
    return buildMetadata({
      title: 'Property',
      description: '',
      path: `/properties/${params.slug}`,
    });
  }
  return buildMetadata({
    title: p.title,
    description: p.description,
    path: `/properties/${p.slug}`,
  });
}

export default function PropertyPage({ params }: { params: { slug: string } }) {
  const property = getProperty(params.slug);
  if (!property) notFound();

  const hasImages = property.images.length > 0;
  const hasVideo = !!property.videoTour;
  const propertyWaMessage = `Hi Mr Homes,
I'm interested in:
Ref: ${property.mhId}
${property.type} | ${property.sector} | ${property.rent}
Please share more details.`;
  const visitWaMessage = `Hi Mr Homes,
I would like to schedule a site visit for:
Ref: ${property.mhId}
${property.type} | ${property.sector} | ${property.rent}.`;
  const details = [
    ['Area', property.area || property.sector || 'Available on request'],
    ['Floor', property.floor || 'Available on request'],
    ['Society/Building', property.societyBuilding || 'Available on request'],
    ['Available from', property.availableFrom || 'Available on request'],
    ['Deposit', property.deposit || 'Available on request'],
    ['Furnishing', property.furnishing || 'Available on request'],
  ];
  const related = similarProperties(property);

  return (
    <Section className="pt-24 pb-28 sm:pb-[var(--section-y)]">
      <p className="eyebrow">{property.configuration}</p>
      <h1 className="font-display text-display-lg mt-6">{property.title}</h1>
      <p className="mt-6 text-muted">{property.priceLabel}</p>
      <p className="mt-3 text-sm text-muted">
        Property Ref: <span className="tracking-[0.08em]">{property.mhId}</span>
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={whatsappLink(propertyWaMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary justify-center"
        >
          WhatsApp About Property
        </a>
        <a
          href={whatsappLink(visitWaMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost justify-center"
        >
          Schedule Site Visit
        </a>
        <a href={telLink} className="btn btn-ghost justify-center">
          Call Now
        </a>
      </div>

      {hasImages && (
        <div className="mt-12 grid gap-2 sm:grid-cols-2">
          {property.images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`${property.title} - photo ${i + 1}`}
              className="w-full aspect-[4/3] object-cover bg-bone"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      )}

      {hasVideo && (
        <div className={hasImages ? 'mt-6 mx-auto w-full max-w-[780px]' : 'mt-12 mx-auto w-full max-w-[780px]'}>
          <div className="relative overflow-hidden bg-bone">
            <video
              src={property.videoTour}
              muted
              autoPlay
              loop
              playsInline
              aria-hidden
              className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-20 blur-xl sm:block"
            />
            <video
              src={property.videoTour}
              controls
              playsInline
              className="relative z-10 mx-auto block w-full bg-bone sm:w-auto sm:max-w-full sm:max-h-[720px]"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {!hasImages && !hasVideo && (
        <div className="mt-12 border border-line bg-paper p-8 md:p-12 text-center max-w-3xl mx-auto">
          <p className="eyebrow text-muted">Visuals coming soon</p>
          <h2 className="font-display text-2xl mt-4">Photography in progress</h2>
          <p className="mt-4 text-muted max-w-md mx-auto text-sm leading-relaxed">
            We are currently photographing this property to ensure our standards of realism.
            Contact us below to request early photos or schedule a private showing.
          </p>
        </div>
      )}


      {property.description && (
        <div className="mt-10 max-w-prose">
          <p className="text-lg text-muted leading-relaxed">
            {property.description}
          </p>
        </div>
      )}


      {property.highlights.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-3">
          {property.highlights.map((h) => (
            <li
              key={h}
              className="text-sm tracking-[0.08em] uppercase border border-line px-3 py-1.5"
            >
              {h}
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-10 grid gap-px bg-line hairline sm:grid-cols-2 lg:grid-cols-3">
        {details.map(([label, value]) => (
          <div key={label} className="bg-paper p-5 md:p-6">
            <dt className="eyebrow">{label}</dt>
            <dd className="mt-2 font-display text-xl leading-snug">{value}</dd>
          </div>
        ))}
      </dl>

      {related.length > 0 && (
        <div className="mt-16">
          <p className="eyebrow">Similar Properties</p>
          <h2 className="font-display text-display-md mt-3">
            Similar Properties
          </h2>
          <div className="mt-10">
            <PropertyGrid items={related} empty={null} />
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-px border-t border-line bg-line p-px sm:hidden">
        <a
          href={whatsappLink(propertyWaMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-ink px-4 py-4 text-center text-sm tracking-[0.04em] text-paper"
        >
          WhatsApp
        </a>
        <a
          href={telLink}
          className="bg-paper px-4 py-4 text-center text-sm tracking-[0.04em] text-ink"
        >
          Call
        </a>
      </div>
    </Section>
  );
}

function similarProperties(property: Property) {
  const baseBudget = budgetValue(property);

  return PROPERTIES.filter((candidate) => candidate.slug !== property.slug)
    .map((candidate) => {
      let score = 0;
      if (candidate.type === property.type) score += 4;
      if (candidate.category === property.category) score += 3;
      if (candidate.sector === property.sector) score += 3;
      if (candidate.locationSlug === property.locationSlug) score += 2;

      const candidateBudget = budgetValue(candidate);
      if (baseBudget > 0 && candidateBudget > 0) {
        const gap = Math.abs(candidateBudget - baseBudget) / baseBudget;
        if (gap <= 0.15) score += 3;
        else if (gap <= 0.3) score += 2;
        else if (gap <= 0.5) score += 1;
      }

      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ candidate }) => candidate);
}

function budgetValue(property: Property) {
  const normalized = (property.rent || property.priceLabel).toLowerCase().replace(/,/g, '');
  const match = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;

  const value = Number(match[1]);
  if (normalized.includes('cr')) return value * 10000000;
  if (normalized.includes('l')) return value * 100000;
  if (normalized.includes('k')) return value * 1000;
  return value;
}
