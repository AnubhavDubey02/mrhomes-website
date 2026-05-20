import Link from 'next/link';
import { Section } from '@/components/layout/Container';
import { whatsappLink, waMessages } from '@/lib/whatsapp';

export type ProcessStep = { title: string; body: string };

export type ServicePageProps = {
  eyebrow: string;
  title: string;
  intro: string;

  helpWith: {
    title: string;
    items: string[];
  };

  process: {
    title: string;
    steps: ProcessStep[];
  };

  /** Optional closing note above the CTA buttons. */
  closingNote?: string;
  /** Optional context-aware WhatsApp message; falls back to `waMessages.service(eyebrow)`. */
  whatsappMessage?: string;
  /** Primary CTA destination. Defaults to /contact. */
  primaryHref?: string;
  /** Primary CTA label. Defaults to "Share your brief". */
  primaryLabel?: string;
};

/**
 * Editorial layout for /services/* pages. All four service pages share the
 * same vertical rhythm and hairline patterns; only copy and items differ.
 */
export function ServicePageLayout(props: ServicePageProps) {
  const {
    eyebrow,
    title,
    intro,
    helpWith,
    process,
    closingNote,
    whatsappMessage,
    primaryHref = '/contact',
    primaryLabel = 'Share your brief',
  } = props;

  const waHref = whatsappLink(whatsappMessage ?? waMessages.service(eyebrow));

  return (
    <>
      {/* Intro */}
      <Section className="pt-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display text-display-lg mt-6 max-w-[20ch]">
          {title}
        </h1>
        <p className="mt-8 max-w-prose text-lg text-muted leading-relaxed">
          {intro}
        </p>
      </Section>

      {/* What we help with */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">What we help with</p>
            <h2 className="font-display text-display-md mt-3 max-w-[20ch]">
              {helpWith.title}
            </h2>
          </div>
          <ul
            role="list"
            className="lg:col-span-8 grid gap-px bg-line hairline sm:grid-cols-2"
          >
            {helpWith.items.map((item) => (
              <li
                key={item}
                className="bg-paper p-6 md:p-7 flex items-baseline gap-4"
              >
                <span
                  aria-hidden
                  className="block w-2 h-px bg-ink translate-y-[-0.4rem]"
                />
                <span className="font-display text-xl md:text-[1.4rem] leading-snug">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Process */}
      <Section>
        <p className="eyebrow">Process</p>
        <h2 className="font-display text-display-md mt-3 max-w-[24ch]">
          {process.title}
        </h2>

        <ol
          role="list"
          className="mt-12 grid gap-px bg-line hairline sm:grid-cols-2"
        >
          {process.steps.map((step, i) => (
            <li
              key={step.title}
              className="bg-paper p-6 md:p-8 flex flex-col gap-3"
            >
              <span className="eyebrow">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-2xl leading-tight">
                {step.title}
              </h3>
              <p className="text-muted leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* CTA */}
      <Section>
        <div className="border-t border-line pt-16 md:pt-20 max-w-prose">
          <p className="eyebrow">Next step</p>
          <h2 className="font-display text-display-md mt-3 max-w-[22ch]">
            {closingNote ?? 'Tell us what you are looking for.'}
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryHref} className="btn btn-primary">
              {primaryLabel}
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
    </>
  );
}
