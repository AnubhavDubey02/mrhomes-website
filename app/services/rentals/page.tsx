import { buildMetadata } from '@/lib/seo';
import { ServicePageLayout } from '@/components/sections/ServicePageLayout';

export const metadata = buildMetadata({
  title: 'Rentals',
  description:
    'Rental advisory in Gurgaon — apartments, builder floors, villas, studios, 1 RK and pre-occupied rooms. Considered shortlists, transparent process.',
  path: '/services/rentals',
});

export default function RentalsServicePage() {
  return (
    <ServicePageLayout
      eyebrow="Rentals"
      title="Renting in Gurgaon, without the noise."
      intro="From a first 1 RK to a long-term family home, we help renters find the right place quickly and quietly. Our brief is to filter — share fewer, better options, and stay involved until you have the keys."
      helpWith={{
        title: 'What we help renters move into.',
        items: [
          '1 RK',
          'Studio',
          '1 BHK',
          '2 BHK',
          '3 BHK',
          'Builder floors',
          'Villas',
          'Pre-occupied rooms',
        ],
      }}
      process={{
        title: 'A short, clear path from brief to move-in.',
        steps: [
          {
            title: 'Understand the brief',
            body: 'Budget, area, configuration, furnishing, timelines and any non-negotiables. The clearer the brief, the shorter the search.',
          },
          {
            title: 'Curated shortlist',
            body: 'A small set of genuinely matching options — not a forwarded inventory list. We share floor plans, photos and honest notes.',
          },
          {
            title: 'Site visits with context',
            body: 'We accompany visits where useful — point out trade-offs, compare specs, and answer the questions that owners often skip.',
          },
          {
            title: 'Negotiation and paperwork',
            body: 'Rent, deposit, brokerage clarity, lock-in, maintenance. The rent agreement is reviewed before signing.',
          },
          {
            title: 'Move-in and after',
            body: 'Handover checks, utility transfers, society formalities. We stay reachable after you move in.',
          },
        ],
      }}
      closingNote="Share a brief — we will revert with a considered shortlist."
    />
  );
}
