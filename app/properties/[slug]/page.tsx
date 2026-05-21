import { notFound } from 'next/navigation';
import { Section } from '@/components/layout/Container';
import { getProperty, PROPERTIES } from '@/lib/properties';
import { buildMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getProperty(params.slug);
  if (!p) return buildMetadata({ title: 'Property', description: '', path: `/properties/${params.slug}` });
  return buildMetadata({ title: p.title, description: p.description, path: `/properties/${p.slug}` });
}

export default function PropertyPage({ params }: { params: { slug: string } }) {
  const property = getProperty(params.slug);
  if (!property) notFound();

  const hasImages = property.images.length > 0;
  const hasVideo  = !!property.videoTour;

  return (
    <Section className="pt-24">
      <p className="eyebrow">{property.configuration}</p>
      <h1 className="font-display text-display-lg mt-6">{property.title}</h1>
      <p className="mt-6 text-muted">{property.priceLabel}</p>

      {/* Media: image carousel when images exist, video player when only video */}
      {hasImages ? (
        <div className="mt-12 grid gap-2 sm:grid-cols-2">
          {property.images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`${property.title} — photo ${i + 1}`}
              className="w-full aspect-[4/3] object-cover bg-bone"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      ) : hasVideo ? (
        <div className="mt-12 w-full max-w-4xl">
          <video
            src={property.videoTour}
            controls
            playsInline
            className="w-full aspect-video bg-bone"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : null}

      {/* Highlights */}
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

      {/* Description */}
      {property.description && (
        <p className="mt-10 max-w-prose text-lg text-muted leading-relaxed">
          {property.description}
        </p>
      )}
    </Section>
  );
}
