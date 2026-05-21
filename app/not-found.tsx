import Link from 'next/link';
import { Section } from '@/components/layout/Container';
import { whatsappLink, waMessages } from '@/lib/whatsapp';

export default function NotFound() {
  const waHref = whatsappLink(waMessages.general);

  return (
    <Section className="pt-24 min-h-[60vh] flex flex-col justify-center">
      <p className="eyebrow">404</p>
      <h1 className="font-display text-display-lg mt-6 max-w-[18ch]">
        This page does not exist.
      </h1>
      <p className="mt-8 max-w-prose text-lg text-muted leading-relaxed">
        The address you followed may have changed or been removed. If you were
        looking for a property or a service, the links below should help.
      </p>

      <div className="mt-12 grid gap-px bg-line hairline sm:grid-cols-3 max-w-[56rem]">
        {[
          { href: '/properties', label: 'Properties', note: 'Browse current inventory' },
          { href: '/services', label: 'Services', note: 'Rentals, sales, commercial' },
          { href: '/contact', label: 'Contact', note: 'Share your brief directly' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-paper p-6 md:p-8 flex flex-col gap-2 group hover:bg-bone/60 transition-colors duration-300 ease-editorial"
          >
            <span className="eyebrow">Go to</span>
            <span className="font-display text-2xl leading-tight group-hover:opacity-80 transition-opacity">
              {item.label}
            </span>
            <span className="text-muted text-sm">{item.note}</span>
          </Link>
        ))}
      </div>

      <div className="mt-16 border-t border-line pt-12 max-w-prose">
        <p className="eyebrow">Or reach us directly</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            WhatsApp Mr Homes
          </a>
        </div>
      </div>
    </Section>
  );
}
