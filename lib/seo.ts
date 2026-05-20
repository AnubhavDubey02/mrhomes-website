import type { Metadata } from 'next';

export const SITE = {
  name: 'Mr Homes Realtors',
  tagline: 'Curated luxury real estate in Gurgaon.',
  url: 'https://mrhomesrealtors.com',
  locale: 'en_IN',
  twitter: '',
};

export function buildMetadata(input: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): Metadata {
  const url = `${SITE.url}${input.path ?? ''}`;
  return {
    title: `${input.title} — ${SITE.name}`,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type: 'website',
      images: input.image ? [{ url: input.image }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: input.title, description: input.description },
  };
}
