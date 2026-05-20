import { Hero } from '@/components/sections/Hero';
import { SmartSearch } from '@/components/sections/SmartSearch';
import { WhyMrHomes } from '@/components/sections/WhyMrHomes';
import { RequirementEngine } from '@/components/sections/RequirementEngine';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SmartSearch />
      <WhyMrHomes />
      <RequirementEngine />
    </>
  );
}
