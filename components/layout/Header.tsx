'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Container } from './Container';
import { Logo } from './Logo';
import { whatsappLink, waMessages } from '@/lib/whatsapp';

type NavItem = { href: string; label: string; external?: boolean };

const NAV: NavItem[] = [
  { href: '/buy', label: 'Buy' },
  { href: '/rent', label: 'Rent' },
  { href: '/commercial', label: 'Commercial' },
  { href: '/#areas', label: 'Areas' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close the mobile panel on route change / escape, and lock scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('nav-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('nav-open');
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      document.body.classList.remove('nav-open');
    };
  }, [open]);

  const waHref = whatsappLink(waMessages.general);

  return (
    <>
      <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur border-b border-line">
        <Container className="flex items-center justify-between h-[4.5rem] md:h-[5.5rem]">
          <Logo />

          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-10 text-[0.9rem]"
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
            className="lg:hidden inline-flex flex-col justify-center items-center gap-[5px] w-11 h-11 -mr-3"
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
      </header>

      {/* Mobile panel - True fixed overlay */}
      <div
        id="mobile-nav"
        className={`fixed top-[4.5rem] md:top-[5.5rem] left-0 right-0 bottom-0 z-30 lg:hidden overflow-y-auto bg-paper transition-[opacity,visibility] duration-300 ease-editorial ${
          open ? 'opacity-100 visible border-b border-line' : 'opacity-0 invisible pointer-events-none'
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
    </>
  );
}
