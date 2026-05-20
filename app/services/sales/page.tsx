import { buildMetadata } from '@/lib/seo';
import { ServicePageLayout } from '@/components/sections/ServicePageLayout';

export const metadata = buildMetadata({
  title: 'Sales',
  description:
    'Buy and sell premium residences across Gurgaon — high-rise apartments, builder floors, villas and investment-grade homes. A boutique sales advisory.',
  path: '/services/sales',
});

export default function SalesServicePage() {
  return (
    <ServicePageLayout
      eyebrow="Sales"
      title="Buying or selling, with a clear head."
      intro="Sales decisions deserve more than a forwarded listing. We work with buyers and sellers in Gurgaon on residences that are worth the time — and we are equally comfortable saying when a home is not the right fit."
      helpWith={{
        title: 'What we transact across.',
        items: [
          'High-rise apartments',
          'Builder floors',
          'Independent villas',
          'Investment opportunities',
          'Residential properties',
        ],
      }}
      process={{
        title: 'How a sale or purchase moves with us.',
        steps: [
          {
            title: 'Discovery conversation',
            body: 'For buyers — lifestyle, intent, horizon, ticket size. For sellers — the home, its history and the right pricing approach.',
          },
          {
            title: 'Market view',
            body: 'A first-hand read of the relevant micro-market — current supply, recent transactions, build quality and resale signals.',
          },
          {
            title: 'Shortlist or outreach',
            body: 'Buyers receive a focused shortlist with honest commentary. For sellers, we identify and reach out to qualified, intent-led buyers.',
          },
          {
            title: 'Site visits and diligence',
            body: 'Visits, layout checks, society and title basics, and a structured comparison across options before offers are made.',
          },
          {
            title: 'Negotiation and closure',
            body: 'Disciplined back-and-forth on price and terms, agreement reviews, registration coordination and a clean handover.',
          },
          {
            title: 'After the deal',
            body: 'Paperwork follow-through, move-in coordination, and access to the team for anything that comes up later.',
          },
        ],
      }}
      closingNote="Tell us what you are buying or selling — we will start from a clean brief."
    />
  );
}
