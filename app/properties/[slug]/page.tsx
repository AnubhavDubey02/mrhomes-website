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

  return (
    <Section className="pt-24">
      <p className="eyebrow">{property.configuration}</p>
      <h1 className="font-display text-display-lg mt-6">{property.title}</h1>
      <p className="mt-6 text-muted">{property.priceLabel}</p>
      {/* P2: gallery, specs, location map, enquiry block */}
    </Section>
  );
}
