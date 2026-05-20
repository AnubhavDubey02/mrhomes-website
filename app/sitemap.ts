import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/seo';
import { LOCATIONS } from '@/lib/locations';
import { PROPERTIES } from '@/lib/properties';
import { INSIGHTS } from '@/lib/insights';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticRoutes = ['', '/about', '/services', '/properties', '/insights', '/contact'];
  return [
    ...staticRoutes.map((p) => ({ url: `${base}${p}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...LOCATIONS.map((l) => ({ url: `${base}/locations/${l.slug}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...PROPERTIES.map((p) => ({ url: `${base}/properties/${p.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...INSIGHTS.map((a) => ({ url: `${base}/insights/${a.slug}`, changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}
