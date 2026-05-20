import { Phone, MessageCircle, Mail, Instagram, Globe, type LucideIcon } from 'lucide-react';
import { Section, Container } from '@/components/layout/Container';
import { buildMetadata } from '@/lib/seo';
import { whatsappLink, waMessages } from '@/lib/whatsapp';
import { BUSINESS, telLink, mailtoLink } from '@/lib/business';
import { LOCATIONS } from '@/lib/locations';
import { ContactForm } from '@/components/lead/ContactForm';

export const metadata = buildMetadata({
  title: 'Contact',
  description:
    'Call, WhatsApp or email Mr Homes Realtors to discuss buying, selling or renting premium homes in Gurgaon.',
  path: '/contact',
});

export default function ContactPage() {
  const waHref = whatsappLink(waMessages.general);

  return (
    <>
      {/* Header */}
      <Section className="pt-24">
        <p className="eyebrow">Contact</p>
        <h1 className="font-display text-display-lg mt-6 max-w-[18ch]">
          Tell us what you’re looking for.
        </h1>
        <p className="mt-8 max-w-prose text-lg text-muted">
          The fastest way to reach us is WhatsApp. Calls, email and the form
          below all reach the same team.
        </p>
      </Section>

      {/* Action tiles */}
      <section aria-label="Direct channels">
        <Container>
          <div className="grid gap-px bg-line hairline sm:grid-cols-3">
            <ActionTile
              icon={Phone}
              eyebrow="Call"
              line={BUSINESS.phone.display}
              href={telLink}
            />
            <ActionTile
              icon={MessageCircle}
              eyebrow="WhatsApp"
              line={BUSINESS.phone.display}
              href={waHref}
              external
            />
            <ActionTile
              icon={Mail}
              eyebrow="Email"
              line={BUSINESS.email}
              href={mailtoLink()}
            />
          </div>
        </Container>
      </section>

      {/* Form + business info */}
      <Section>
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">Enquiry form</p>
            <h2 className="font-display text-display-md mt-3 max-w-[20ch]">
              Share your brief and we’ll reply within a day.
            </h2>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>

          <aside className="lg:col-span-5 lg:pl-8 lg:border-l lg:border-line space-y-10">
            <InfoBlock label="Office">
              {BUSINESS.city}
              <br />
              By appointment
            </InfoBlock>

            <InfoBlock label="Hours">{BUSINESS.hours}</InfoBlock>

            <InfoBlock label="Web">
              <InfoLink href={BUSINESS.website.url} icon={Globe}>
                {BUSINESS.website.display}
              </InfoLink>
              <InfoLink
                href={BUSINESS.social.instagram.url}
                icon={Instagram}
                external
              >
                @{BUSINESS.social.instagram.handle}
              </InfoLink>
            </InfoBlock>
          </aside>
        </div>
      </Section>

      {/* Service coverage */}
      <Section>
        <p className="eyebrow">Service coverage</p>
        <h2 className="font-display text-display-md mt-3 max-w-[22ch]">
          Where we work in Gurgaon.
        </h2>

        <ul
          role="list"
          className="mt-12 grid gap-px bg-line hairline sm:grid-cols-2 lg:grid-cols-4"
        >
          {LOCATIONS.map((l) => (
            <li
              key={l.slug}
              className="bg-paper p-6 md:p-7 flex flex-col gap-2"
            >
              <span className="eyebrow">Area</span>
              <span className="font-display text-xl md:text-2xl leading-tight">
                {l.name}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------------ */

function ActionTile({
  icon: Icon,
  eyebrow,
  line,
  href,
  external,
}: {
  icon: LucideIcon;
  eyebrow: string;
  line: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="
        bg-paper p-8 md:p-10 group
        transition-colors duration-300 ease-editorial
        hover:bg-bone/60
      "
    >
      <Icon aria-hidden strokeWidth={1} className="w-6 h-6 text-ink" />
      <div className="eyebrow mt-6">{eyebrow}</div>
      <div className="font-display text-2xl md:text-[1.6rem] leading-tight mt-2 break-words">
        {line}
      </div>
    </a>
  );
}

function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="eyebrow mb-3">{label}</div>
      <div className="text-base text-ink/90 leading-relaxed flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

function InfoLink({
  href,
  icon: Icon,
  external,
  children,
}: {
  href: string;
  icon: LucideIcon;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center gap-2 link w-fit"
    >
      <Icon strokeWidth={1.25} className="w-4 h-4" aria-hidden />
      {children}
    </a>
  );
}
