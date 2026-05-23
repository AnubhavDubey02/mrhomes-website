import Image from 'next/image';
import Link from 'next/link';
import { Container } from './Container';
import { LOCATIONS } from '@/lib/locations';
import { BUSINESS, telLink, mailtoLink } from '@/lib/business';
import { whatsappLink, waMessages } from '@/lib/whatsapp';

export function Footer() {
  return (
    <footer className="border-t border-line mt-[var(--section-y)]">
      <Container className="py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" aria-label="Mr Homes Realtors — home" className="inline-block">
            <span
              className="inline-block"
              style={{
                width: 98,
                height: 104,
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-stacked.png"
                alt="Mr Homes Realtors"
                width={199}
                height={147}
                style={{
                  width: 199,
                  height: 147,
                  marginTop: -18,
                  marginLeft: -53,
                  maxWidth: 'none',
                  flexShrink: 0,
                }}
              />
            </span>
          </Link>
          <p className="mt-3 text-muted max-w-prose text-sm">
            A boutique advisory for buying, selling and renting premium homes
            in Gurgaon.
          </p>
          <a
            href={BUSINESS.website.url}
            className="link text-sm mt-6 inline-block"
          >
            {BUSINESS.website.display}
          </a>
        </div>

        <div className="lg:col-span-2">
          <div className="eyebrow mb-3">Explore</div>
          <ul className="space-y-2 text-sm">
            <li><Link className="link" href="/properties">Properties</Link></li>
            <li><Link className="link" href="/services">Services</Link></li>
            <li><Link className="link" href="/insights">Insights</Link></li>
            <li><Link className="link" href="/about">About</Link></li>
            <li><Link className="link" href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <div className="eyebrow mb-3">Coverage</div>
          <ul className="space-y-2 text-sm">
            {LOCATIONS.map((l) => (
              <li key={l.slug}>
                <Link className="link" href={`/locations/${l.slug}`}>{l.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <div className="eyebrow mb-3">Connect</div>
          <ul className="space-y-2 text-sm">
            <li>
              <a className="link" href={telLink}>{BUSINESS.phone.display}</a>
            </li>
            <li>
              <a
                className="link"
                href={whatsappLink(waMessages.general)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a className="link break-all" href={mailtoLink()}>
                {BUSINESS.email}
              </a>
            </li>
            <li>
              <a
                className="link"
                href={BUSINESS.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram · @{BUSINESS.social.instagram.handle}
              </a>
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted">
            {BUSINESS.city} · {BUSINESS.hours}
          </p>
        </div>
      </Container>
      <Container className="py-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-xs text-muted border-t border-line">
        <span>© {new Date().getFullYear()} {BUSINESS.brand}. All rights reserved.</span>
        <span>{BUSINESS.city} · RERA details on request</span>
      </Container>
    </footer>
  );
}
