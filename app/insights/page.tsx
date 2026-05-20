import { Section } from '@/components/layout/Container';
import { INSIGHTS, INSIGHT_CATEGORIES } from '@/lib/insights';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Insights',
  description:
    'Area guides, rental insights, buyer guides and market updates for Gurgaon real estate.',
  path: '/insights',
});

export default function InsightsPage() {
  return (
    <Section className="pt-24">
      <p className="eyebrow">Insights</p>
      <h1 className="font-display text-display-lg mt-6 max-w-[18ch]">
        Considered writing on Gurgaon real estate.
      </h1>

      <ul className="mt-12 grid gap-px bg-line hairline sm:grid-cols-2">
        {INSIGHT_CATEGORIES.map((c) => (
          <li key={c.id} className="bg-paper p-8">
            <div className="eyebrow">Pillar</div>
            <div className="font-display text-2xl mt-2">{c.label}</div>
          </li>
        ))}
      </ul>

      {INSIGHTS.length === 0 ? (
        <p className="mt-16 max-w-prose text-muted">
          New writing is in preparation. Subscribe via our contact page to receive it first.
        </p>
      ) : null}
    </Section>
  );
}
