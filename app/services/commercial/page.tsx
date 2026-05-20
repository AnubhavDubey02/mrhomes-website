import { buildMetadata } from '@/lib/seo';
import { ServicePageLayout } from '@/components/sections/ServicePageLayout';

export const metadata = buildMetadata({
  title: 'Commercial',
  description:
    'Commercial real estate advisory in Gurgaon — shops, offices, SCO plots and other commercial spaces. Lease or buy with a clear, informed read.',
  path: '/services/commercial',
});

export default function CommercialServicePage() {
  return (
    <ServicePageLayout
      eyebrow="Commercial"
      title="Commercial spaces, chosen on fundamentals."
      intro="The right commercial address is about visibility, footfall, build quality and total cost — not just rent or price. We help businesses and investors find, evaluate and close on commercial spaces across Gurgaon."
      helpWith={{
        title: 'Where we work in commercial.',
        items: [
          'Shops',
          'Offices',
          'SCO plots',
          'Commercial spaces',
        ],
      }}
      process={{
        title: 'How a commercial requirement comes together.',
        steps: [
          {
            title: 'Use-case first',
            body: 'Format, footfall expectations, team size, customer profile, fit-out plans and budget — the brief drives the search, not the inventory.',
          },
          {
            title: 'Micro-market read',
            body: 'A grounded view on the corridors and clusters that make sense — Golf Course Road, Sohna Road, SCO belts, high-street markets and grade-A office parks.',
          },
          {
            title: 'Curated shortlist',
            body: 'A focused set of options with floor plates, frontage, parking, power and total occupancy cost — laid out for an apples-to-apples comparison.',
          },
          {
            title: 'Site visits and diligence',
            body: 'On-site walk-throughs, building checks, society or management conversations, and clarity on common-area and tax components.',
          },
          {
            title: 'Negotiation and documentation',
            body: 'Lease or sale terms negotiated in detail — rent escalations, lock-ins, fit-out periods, security deposits, registration and stamp duty.',
          },
          {
            title: 'Handover and beyond',
            body: 'Coordinated handover, utility and licence basics, and ongoing support as the business settles into the address.',
          },
        ],
      }}
      closingNote="Share the use-case — we will scope the options."
    />
  );
}
