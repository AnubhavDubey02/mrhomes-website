import { buildMetadata } from '@/lib/seo';
import { ServicePageLayout } from '@/components/sections/ServicePageLayout';

export const metadata = buildMetadata({
  title: 'Airbnb Assistance',
  description:
    'Short-stay and Airbnb assistance in Gurgaon — sourcing the right property, business-use rentals, and ongoing operational help for villas and apartments.',
  path: '/services/airbnb-assistance',
});

export default function AirbnbServicePage() {
  return (
    <ServicePageLayout
      eyebrow="Airbnb Assistance"
      title="Short-stay homes, set up to run well."
      intro="Short-stay works when the property, the paperwork and the day-to-day are all in order. We help owners and operators source the right property in Gurgaon for short-stay use, structure business-use rentals, and keep operations clean."
      helpWith={{
        title: 'Where Airbnb assistance is most useful.',
        items: [
          'Villas',
          'Apartments',
          'Business-use rentals',
          'Short-stay operations',
        ],
      }}
      process={{
        title: 'From sourcing the property to a working short-stay.',
        steps: [
          {
            title: 'Define the intent',
            body: 'Owner-let or operator-led, expected occupancy, target guest profile, ticket size, and how hands-on you want to be.',
          },
          {
            title: 'Property sourcing',
            body: 'Villas and apartments suited to short-stay — micro-market, society policies, layout, parking and serviceability are all weighed before we shortlist.',
          },
          {
            title: 'Diligence and documentation',
            body: 'Society and RWA approvals, lease terms that permit short-stay or business-use, and a clear understanding of local regulations.',
          },
          {
            title: 'Set-up support',
            body: 'Furnishing direction, photography, listing positioning and pricing benchmarks aligned to the micro-market.',
          },
          {
            title: 'Operations and ongoing help',
            body: 'Connections to vetted housekeeping, maintenance and check-in teams; periodic reviews on performance and pricing.',
          },
        ],
      }}
      closingNote="Tell us what you have, or what you want to build — we will take it from there."
    />
  );
}
