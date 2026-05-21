import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { whatsappLink, waMessages } from '@/lib/whatsapp';

/**
 * Editorial split hero.
 *
 * Visual direction (per brief): cinematic Gurgaon lifestyle with restrained
 * temporary brand visuals until dedicated photography is ready.
 */
export function Hero() {
  return (
    <section aria-label="Introduction" className="pt-10 md:pt-14 lg:pt-20 pb-14 md:pb-20">
      <Container>
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-12 items-end">
          <div className="lg:col-span-7 lg:pt-8">
            <p className="eyebrow animate-rise">
              Gurgaon · Real Estate Advisory
            </p>
            <h1 className="font-display text-display-xl mt-6 lg:mt-8 max-w-[16ch] animate-rise animate-rise-1">
              Find the right place for the life you're building.
            </h1>
            <p className="mt-8 max-w-prose text-lg leading-relaxed text-muted animate-rise animate-rise-2">
              Premium homes, smart investments, and trusted Gurgaon expertise -
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

          <figure className="lg:col-span-5 animate-rise animate-rise-2">
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-line bg-bone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/placeholders/gurgaon-skyline.webp"
                alt="Gurgaon skyline"
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute right-4 top-4 hidden w-32 overflow-hidden border border-paper/80 bg-paper md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/placeholders/minimal-luxury-interior.webp"
                  alt="Minimal luxury interior"
                  className="aspect-[4/3] w-full object-cover opacity-90"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 border-t border-line bg-paper/80 px-4 py-3 backdrop-blur">
                <p className="eyebrow">Current Gurgaon inventory</p>
              </div>
            </div>
            <figcaption className="eyebrow mt-3">High-rise residences</figcaption>
          </figure>
        </div>

        <div className="mt-8 lg:mt-12 grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 lg:ml-auto lg:max-w-[58%] animate-rise animate-rise-4">
          <figure>
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-bone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/placeholders/builder-floor-exterior.webp"
                alt="Builder floor exterior"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-4 border border-paper/70" />
            </div>
            <figcaption className="eyebrow mt-3">Builder floors</figcaption>
          </figure>
          <figure>
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-bone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/placeholders/modern-villa-exterior.webp"
                alt="Premium modern villa exterior"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 border-t border-line bg-paper/35" />
            </div>
            <figcaption className="eyebrow mt-3">Independent villas</figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}
