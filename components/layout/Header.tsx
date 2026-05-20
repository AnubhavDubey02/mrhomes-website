'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Container } from './Container';
import { Logo } from './Logo';
import { whatsappLink, waMessages } from '@/lib/whatsapp';

type NavItem = { href: string; label: string; external?: boolean };

// Buy / Rent / Commercial map to /properties with an `intent` query param.
// Filtering is wired in a later phase; the routes are stable today.
const NAV: NavItem[] = [
  { href: '/properties?intent=buy', label: 'Buy' },
  { href: '/properties?intent=rent', label: 'Rent' },
  { href: '/properties?intent=commercial', label: 'Commercial' },
  { href: '/#areas', label: 'Areas' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  // Close the mobile panel on route change / escape, and lock scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const waHref = whatsappLink(waMessages.general);

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur border-b border-line">
      <Container className="flex items-center justify-between h-16 md:h-20">
        <Logo />

        <nav
          aria-label="Primary"
          className="hidden lg:flex items-center gap-9 text-[0.86rem]"
        >
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="link text-ink/80 hover:text-ink">
              {n.label}
            </Link>
          ))}
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            WhatsApp
          </a>
        </nav>

        {/* Mobile / tablet trigger */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden inline-flex flex-col justify-center gap-[5px] w-9 h-9 -mr-2"
        >
          <span
            className={`block h-px w-6 bg-ink transition-transform duration-300 ease-editorial ${
              open ? 'translate-y-[6px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-px w-6 bg-ink transition-transform duration-300 ease-editorial ${
              open ? '-translate-y-[6px] -rotate-45' : ''
            }`}
          />
        </button>
      </Container>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        className={`lg:hidden overflow-hidden border-t border-line transition-[max-height,opacity] duration-500 ease-editorial ${
          open ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <Container className="py-8">
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.href} className="border-b border-line">
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-3xl py-5 block"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="btn btn-primary mt-8 w-full justify-center"
          >
            WhatsApp
          </a>
        </Container>
      </div>
    </header>
  );
}
