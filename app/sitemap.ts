import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';
import { LOCATIONS } from '@/lib/locations';
import { PROPERTIES } from '@/lib/properties';
import { INSIGHTS } from '@/lib/insights';
import {
  RENT_CATEGORIES,
  BUY_CATEGORIES,
  COMMERCIAL_CATEGORIES,
} from '@/lib/inventory-flows';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;

  const staticRoutes = [
    '',
    '/about',
    '/services',
    '/services/rentals',
    '/services/sales',
    '/services/commercial',
    '/services/airbnb-assistance',
    '/properties',
    '/rent',
    '/buy',
    '/commercial',
    '/insights',
    '/contact',
  ];

  const categoryRoutes = [
    ...RENT_CATEGORIES.map((c) => `/rent/${c.slug}`),
    ...BUY_CATEGORIES.map((c) => `/buy/${c.slug}`),
    ...COMMERCIAL_CATEGORIES.map((c) => `/commercial/${c.slug}`),
  ];

  return [
    ...staticRoutes.map((p) => ({
      url: `${base}${p}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...categoryRoutes.map((p) => ({
      url: `${base}${p}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...LOCATIONS.map((l) => ({
      url: `${base}/locations/${l.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...PROPERTIES.map((p) => ({
      url: `${base}/properties/${p.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...INSIGHTS.map((a) => ({
      url: `${base}/insights/${a.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
