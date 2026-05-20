import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { whatsappLink, waMessages } from '@/lib/whatsapp';

/**
 * Editorial split hero.
 *
 * Visual direction (per brief): cinematic Gurgaon lifestyle — high-rise
 * dominant, builder floors + villas supporting. We intentionally use neutral
 * placeholder figures (no fake imagery) ready for the team's real photography
 * at the paths noted below. Composition holds even before images land.
 */
export function Hero() {
  return (
    <section aria-label="Introduction" className="pt-10 md:pt-16 lg:pt-24 pb-16 md:pb-24">
      <Container>
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-12 items-end">
          {/* Copy */}
          <div className="lg:col-span-7 lg:pt-8">
            <p className="eyebrow animate-rise">
              Gurgaon · Real Estate Advisory
            </p>
            <h1 className="font-display text-display-xl mt-6 lg:mt-8 max-w-[16ch] animate-rise animate-rise-1">
              Find the right place for the life you’re building.
            </h1>
            <p className="mt-8 max-w-prose text-lg leading-relaxed text-muted animate-rise animate-rise-2">
              Premium homes, smart investments, and trusted Gurgaon expertise —
              all under one roof.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 animate-rise animate-rise-3">
              <Link href="/properties" className="btn btn-primary">
                Explore Properties
              </Link>
              <a
                href={whatsappLink(waMessages.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                WhatsApp Now
              </a>
            </div>
          </div>

          {/* Dominant high-rise frame */}
          <figure className="lg:col-span-5 animate-rise animate-rise-2">
            <div
              className="aspect-[3/4] w-full bg-bone"
              role="img"
              aria-label="High-rise residence — image placeholder"
              // Replace with <Image src="/images/hero-tower.jpg" .../> when ready
            />
            <figcaption className="eyebrow mt-3">High-rise residences</figcaption>
          </figure>
        </div>

        {/* Supporting frames: builder floors + villas */}
        <div className="mt-10 lg:mt-14 grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 lg:ml-auto lg:max-w-[58%] animate-rise animate-rise-4">
          <figure>
            <div
              className="aspect-[4/3] w-full bg-bone"
              role="img"
              aria-label="Builder floor — image placeholder"
              // Replace with <Image src="/images/hero-builderfloor.jpg" .../>
            />
            <figcaption className="eyebrow mt-3">Builder floors</figcaption>
          </figure>
          <figure>
            <div
              className="aspect-[4/3] w-full bg-bone"
              role="img"
              aria-label="Independent villa — image placeholder"
              // Replace with <Image src="/images/hero-villa.jpg" .../>
            />
            <figcaption className="eyebrow mt-3">Independent villas</figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}
