import { Hero } from '@/components/sections/Hero';
import { SmartSearch } from '@/components/sections/SmartSearch';
import { WhyMrHomes } from '@/components/sections/WhyMrHomes';
import { RequirementEngine } from '@/components/sections/RequirementEngine';
import { PropertyCategories } from '@/components/sections/PropertyCategories';
import { AreasWeServe } from '@/components/sections/AreasWeServe';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SmartSearch />
      <PropertyCategories />
      <AreasWeServe />
      <WhyMrHomes />
      <RequirementEngine />
    </>
  );
}
