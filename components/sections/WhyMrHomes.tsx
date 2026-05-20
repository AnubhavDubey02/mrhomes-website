import {
  ShieldCheck,
  MapPin,
  KeyRound,
  Layers,
  Handshake,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';

type Item = {
  icon: LucideIcon;
  title: string;
  body: string;
};

// Editorial trust signals. No numbers, no claims that can't be substantiated.
const ITEMS: Item[] = [
  {
    icon: ShieldCheck,
    title: 'Verified property options',
    body: 'Every option we share is checked for ownership, RERA where applicable, and society clearances before it reaches you.',
  },
  {
    icon: MapPin,
    title: 'Gurgaon expertise',
    body: 'We work a focused set of micro-markets — from DLF Phase 5 to the Dwarka Expressway — and know each by street, not just by name.',
  },
  {
    icon: KeyRound,
    title: 'Site visit assistance',
    body: 'We plan visits around your day, drive you between options, and answer questions on site so you can decide with clarity.',
  },
  {
    icon: Layers,
    title: 'Multiple options shared quickly',
    body: 'A shortlist that matches your brief — usually within a day — so you compare like-for-like rather than scrolling endlessly.',
  },
  {
    icon: Handshake,
    title: 'Support after deal closure',
    body: 'Paperwork, registration, society onboarding, and move-in coordination — we stay involved until you are settled.',
  },
  {
    icon: Eye,
    title: 'Transparent process',
    body: 'Honest pricing, written terms, and no pressure. If something is not right for you, we will say so.',
  },
];

export function WhyMrHomes() {
  return (
    <section aria-labelledby="why-heading" className="py-[var(--section-y)]">
      <Container>
        <div className="max-w-3xl">
          <p className="eyebrow">Why Mr Homes</p>
          <h2
            id="why-heading"
            className="font-display text-display-lg mt-6 max-w-[20ch]"
          >
            A quieter, more considered way to work with a broker.
          </h2>
          <p className="mt-8 text-lg text-muted max-w-prose">
            We are a small team focused on doing fewer things well. Below is how
            we work — not a list of claims, but a list of habits.
          </p>
        </div>

        <ul
          role="list"
          className="mt-16 lg:mt-20 grid gap-px bg-line hairline sm:grid-cols-2 lg:grid-cols-3"
        >
          {ITEMS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="bg-paper p-8 md:p-10 flex flex-col gap-5"
            >
              <Icon
                aria-hidden
                strokeWidth={1}
                className="w-6 h-6 text-ink"
              />
              <h3 className="font-display text-2xl md:text-[1.65rem] leading-snug">
                {title}
              </h3>
              <p className="text-muted text-[0.95rem] leading-relaxed">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
