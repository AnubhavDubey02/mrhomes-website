import { Hero } from '@/components/sections/Hero';
import { SmartSearch } from '@/components/sections/SmartSearch';
import { WhyMrHomes } from '@/components/sections/WhyMrHomes';
import { RequirementEngine } from '@/components/sections/RequirementEngine';
import { PropertyCategories } from '@/components/sections/PropertyCategories';
import { AreasWeServe } from '@/components/sections/AreasWeServe';
import { BUSINESS } from '@/lib/business';

export default function HomePage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    'name': BUSINESS.brand,
    'image': `${BUSINESS.website.url}/brand/logo-header.png`,
    '@id': `${BUSINESS.website.url}/#agent`,
    'url': BUSINESS.website.url,
    'telephone': BUSINESS.phone.e164,
    'priceRange': '$$$',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Golf Course Road',
      'addressLocality': 'Gurgaon',
      'addressRegion': 'Haryana',
      'postalCode': '122002',
      'addressCountry': 'IN',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 28.4595,
      'longitude': 77.0266,
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      'opens': '10:00',
      'closes': '19:00',
    },
    'sameAs': [
      BUSINESS.social.instagram.url,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Hero />
      <SmartSearch />
      <PropertyCategories />
      <AreasWeServe />
      <WhyMrHomes />
      <RequirementEngine />
    </>
  );
}
