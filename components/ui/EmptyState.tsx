import Link from 'next/link';
import { whatsappLink, waMessages } from '@/lib/whatsapp';

/**
 * Dignified empty state used wherever inventory is intentionally absent.
 * No fake stock, no apologetic tone — invite a brief instead.
 */
export function EmptyState({
  eyebrow = 'Inventory',
  title,
  body,
  ctaHref = '/contact',
  ctaLabel = 'Share your brief',
  whatsappMessage,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
  whatsappMessage?: string;
}) {
  const waHref = whatsappLink(whatsappMessage ?? waMessages.general);
  return (
    <div className="border-t border-b border-line py-16 md:py-20">
      <div className="max-w-prose">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="font-display text-display-md mt-4 max-w-[22ch]">
          {title}
        </h2>
        <p className="mt-6 text-muted leading-relaxed">{body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={ctaHref} className="btn btn-primary">
            {ctaLabel}
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
