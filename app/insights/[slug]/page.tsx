import { notFound } from 'next/navigation';
import { Section } from '@/components/layout/Container';
import { INSIGHTS, INSIGHT_CATEGORIES } from '@/lib/insights';

export function generateStaticParams() {
  return INSIGHTS.map((a) => ({ slug: a.slug }));
}

export default function InsightPage({ params }: { params: { slug: string } }) {
  const a = INSIGHTS.find((x) => x.slug === params.slug);
  if (!a) notFound();
  const category = INSIGHT_CATEGORIES.find((c) => c.id === a!.category);
  return (
    <Section className="pt-24">
      <p className="eyebrow">{category?.label ?? 'Insights'}</p>
      <h1 className="font-display text-display-lg mt-6 max-w-[22ch]">{a!.title}</h1>
      <p className="mt-8 max-w-prose text-muted">{a!.excerpt}</p>
    </Section>
  );
}
