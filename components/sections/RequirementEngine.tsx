'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { LOCATIONS } from '@/lib/locations';
import {
  whatsappLink,
  requirementMessage,
  type RequirementAnswers,
} from '@/lib/whatsapp';
import { budgetLabelsFor } from '@/lib/budgets';
import { cn } from '@/lib/utils';

// Top-level types align with SmartSearch. BHK variants for apartment are kept
// inline so the message reads naturally (e.g. "a 2 BHK Apartment").
const PROPERTY_TYPES = [
  '1 BHK Apartment',
  '2 BHK Apartment',
  '3 BHK Apartment',
  '4 BHK Apartment',
  'Builder Floor',
  'Independent Villa',
  'Plot',
  'Commercial',
  'Studio',
  '1 RK',
  'Pre-occupied Room',
];

const PRE_OCCUPIED_ROOM = 'Pre-occupied Room';

const PURPOSES = ['Family', 'Bachelor', 'Corporate', 'Airbnb', 'Investment'];

const FURNISHING_CHOICES = [
  'Furnished',
  'Semi Furnished',
  'Unfurnished',
  'No preference',
];

const ROOM_PREFERENCES = [
  'Male',
  'Female',
  'Any',
  'Working Professional',
  'Student',
];

// Step 7 (Room preference) only appears when type === Pre-occupied Room.
// Numeric step ids stay stable; navigation skips the conditional step when
// it does not apply, and the visible "Step X of Y" indicator counts only
// the steps that actually render for the current answer set.
const ROOM_PREF_STEP = 7;
const REVIEW_STEP = 10;

export function RequirementEngine() {
  const [step, setStep] = useState(1);            // 1..5 questions, 6 = review
  const [answers, setAnswers] = useState<RequirementAnswers>({});

  const set = (patch: Partial<RequirementAnswers>) =>
    setAnswers((a) => ({ ...a, ...patch }));

  // Whether the conditional Room-preference step participates in the flow.
  const includeRoomPref = answers.type === PRE_OCCUPIED_ROOM;

  // Ordered list of *visible* step ids (excluding review).
  const flow: number[] = [1, 2, 3, 4, 5, 6];
  if (includeRoomPref) flow.push(ROOM_PREF_STEP);
  flow.push(8, 9);

  const next = () =>
    setStep((s) => {
      if (s >= REVIEW_STEP) return REVIEW_STEP;
      const idx = flow.indexOf(s);
      // Step not in current flow (e.g. roomPref after type change) → fall through.
      if (idx === -1) return flow[0];
      return idx === flow.length - 1 ? REVIEW_STEP : flow[idx + 1];
    });

  const back = () =>
    setStep((s) => {
      if (s === REVIEW_STEP) return flow[flow.length - 1];
      const idx = flow.indexOf(s);
      if (idx <= 0) return flow[0];
      return flow[idx - 1];
    });

  // Auto-advance helper used by tile-choice steps.
  const choose = (patch: Partial<RequirementAnswers>) => {
    set(patch);
    // small timeout for a perceptible state change before moving on
    setTimeout(next, 120);
  };

  const message = useMemo(() => requirementMessage(answers), [answers]);
  const waHref = useMemo(() => whatsappLink(message), [message]);

  return (
    <section
      aria-labelledby="requirement-heading"
      className="py-[var(--section-y)] bg-bone/40"
    >
      <Container>
        <div className="max-w-3xl">
          <p className="eyebrow">Smart Requirement Engine</p>
          <h2
            id="requirement-heading"
            className="font-display text-display-lg mt-6 max-w-[20ch]"
          >
            Tell us your brief in five short steps.
          </h2>
          <p className="mt-8 text-lg text-muted max-w-prose">
            Answer a few questions and we will assemble a WhatsApp message you
            can review and send. No account, no spam — just a clean handover of
            your requirement.
          </p>
        </div>

        <div className="mt-14 lg:mt-20 border border-line bg-paper">
          {step !== REVIEW_STEP && <Progress step={step} flow={flow} />}

          <div className="p-6 sm:p-10 md:p-14 min-h-[420px] md:min-h-[460px] flex flex-col">
            {step === 1 && (
              <Question
                index={1}
                prompt="Are you looking to buy or rent?"
              >
                <TileGrid cols={2}>
                  {(['buy', 'rent'] as const).map((v) => (
                    <Tile
                      key={v}
                      active={answers.intent === v}
                      onClick={() => choose({ intent: v, budget: undefined })}
                    >
                      {v === 'buy' ? 'Buy' : 'Rent'}
                    </Tile>
                  ))}
                </TileGrid>
              </Question>
            )}

            {step === 2 && (
              <Question index={2} prompt="What kind of property?">
                <TileGrid cols={2} md={4}>
                  {PROPERTY_TYPES.map((t) => (
                    <Tile
                      key={t}
                      active={answers.type === t}
                      onClick={() => choose({ type: t })}
                    >
                      {t}
                    </Tile>
                  ))}
                </TileGrid>
              </Question>
            )}

            {step === 3 && (
              <Question
                index={visibleIndex(flow, 3)}
                prompt={budgetPrompt(answers)}
              >
                <TileGrid cols={1} md={3}>
                  {budgetLabelsFor({
                    intent: answers.intent,
                    type: budgetTypeKey(answers.type),
                  }).map((b) => (
                    <Tile
                      key={b}
                      active={answers.budget === b}
                      onClick={() => choose({ budget: b })}
                    >
                      {b}
                    </Tile>
                  ))}
                </TileGrid>
              </Question>
            )}

            {step === 4 && (
              <Question
                index={4}
                prompt="Which area or sector in Gurgaon?"
                hint="Type a sector, society, or micro-market — e.g., Sector 43, DLF Phase 5, Golf Course Road."
              >
                <input
                  type="text"
                  list="mrhomes-areas"
                  autoFocus
                  value={answers.area ?? ''}
                  onChange={(e) => set({ area: e.target.value })}
                  placeholder="e.g., Sector 43"
                  className="
                    w-full bg-transparent border-b border-line focus:border-ink
                    outline-none py-3 font-display text-2xl md:text-3xl
                    transition-colors
                  "
                />
                <datalist id="mrhomes-areas">
                  {LOCATIONS.map((l) => (
                    <option key={l.slug} value={l.name} />
                  ))}
                </datalist>
                <Footer
                  onBack={back}
                  onNext={next}
                  nextDisabled={!answers.area?.trim()}
                />
              </Question>
            )}

            {step === 5 && (
              <Question index={5} prompt="Who is this home for?">
                <TileGrid cols={1} md={5}>
                  {PURPOSES.map((p) => (
                    <Tile
                      key={p}
                      active={answers.purpose === p}
                      onClick={() => choose({ purpose: p })}
                    >
                      {p}
                    </Tile>
                  ))}
                </TileGrid>
              </Question>
            )}

            {step === 6 && (
              <Question
                index={visibleIndex(flow, 6)}
                prompt="Furnishing preference?"
              >
                <TileGrid cols={2} md={4}>
                  {FURNISHING_CHOICES.map((f) => (
                    <Tile
                      key={f}
                      active={answers.furnishing === f}
                      onClick={() => choose({ furnishing: f })}
                    >
                      {f}
                    </Tile>
                  ))}
                </TileGrid>
              </Question>
            )}

            {step === ROOM_PREF_STEP && includeRoomPref && (
              <Question
                index={visibleIndex(flow, ROOM_PREF_STEP)}
                prompt="Room preference?"
                hint="Helps us shortlist rooms that suit you and align with the host's preferences."
              >
                <TileGrid cols={2} md={5}>
                  {ROOM_PREFERENCES.map((r) => (
                    <Tile
                      key={r}
                      active={answers.roomPreference === r}
                      onClick={() => choose({ roomPreference: r })}
                    >
                      {r}
                    </Tile>
                  ))}
                </TileGrid>
              </Question>
            )}

            {step === 8 && (
              <Question
                index={visibleIndex(flow, 8)}
                prompt="Any additional preferences?"
                hint="Optional. E.g., high floor, pet-friendly, ready to move, society with park."
              >
                <textarea
                  autoFocus
                  rows={4}
                  value={answers.prefs ?? ''}
                  onChange={(e) => set({ prefs: e.target.value })}
                  placeholder="Optional preferences"
                  className="
                    w-full bg-transparent border border-line focus:border-ink
                    outline-none p-4 text-base leading-relaxed transition-colors
                    resize-none
                  "
                />
                <Footer onBack={back} onNext={next} />
              </Question>
            )}

            {step === 9 && (
              <Question
                index={visibleIndex(flow, 9)}
                prompt="How can we reach you?"
                hint="We respond within a working day. We do not share your number."
              >
                <div className="grid gap-6 sm:grid-cols-2 max-w-xl">
                  <TextField
                    label="Your name"
                    value={answers.name ?? ''}
                    onChange={(v) => set({ name: v })}
                    autoFocus
                    autoComplete="name"
                  />
                  <TextField
                    label="Phone number"
                    value={answers.phone ?? ''}
                    onChange={(v) => set({ phone: v })}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+91 "
                  />
                </div>
                <Footer
                  onBack={back}
                  onNext={next}
                  nextDisabled={
                    !answers.name?.trim() ||
                    !answers.phone?.trim() ||
                    answers.phone.replace(/\D/g, '').length < 10
                  }
                  nextLabel="Review message"
                />
              </Question>
            )}

            {step === REVIEW_STEP && (
              <Review
                answers={answers}
                message={message}
                waHref={waHref}
                onEdit={(s) => setStep(s)}
                onRestart={() => {
                  setAnswers({});
                  setStep(1);
                }}
              />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function Progress({
  step,
  flow,
}: {
  step: number;
  flow: number[];
}) {
  const total = flow.length;
  const idx = flow.indexOf(step);
  const visible = idx === -1 ? 1 : idx + 1;
  return (
    <div className="flex items-center justify-between border-b border-line px-6 sm:px-10 md:px-14 py-4">
      <span className="eyebrow">
        Step {visible} of {total}
      </span>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-px w-8 transition-colors duration-500',
              i < visible ? 'bg-ink' : 'bg-line',
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Display index of a numeric step within the *current* flow (1-based).
function visibleIndex(flow: number[], step: number): number {
  const i = flow.indexOf(step);
  return i === -1 ? 1 : i + 1;
}

function budgetTypeKey(type?: string): string | undefined {
  if (!type) return undefined;
  return type.toLowerCase().includes('commercial') ? 'commercial' : type;
}

function budgetPrompt(a: RequirementAnswers): string {
  if (a.type === PRE_OCCUPIED_ROOM) return 'What is your monthly rent budget?';
  if (budgetTypeKey(a.type) === 'commercial') return 'What is your commercial budget?';
  return a.intent === 'rent'
    ? 'What is your monthly rent budget?'
    : 'What is your purchase budget?';
}

function Question({
  index,
  prompt,
  hint,
  children,
}: {
  index: number;
  prompt: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <p className="eyebrow">Question {index}</p>
      <h3 className="font-display text-display-md mt-3 max-w-[22ch]">
        {prompt}
      </h3>
      {hint && (
        <p className="mt-3 text-muted text-sm max-w-prose">{hint}</p>
      )}
      <div className="mt-10 md:mt-12 flex-1 flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}

function TileGrid({
  cols = 2,
  md,
  children,
}: {
  cols?: number;
  md?: number;
  children: React.ReactNode;
}) {
  const grid = cn(
    'grid gap-3 md:gap-4',
    cols === 1 && 'grid-cols-1',
    cols === 2 && 'grid-cols-2',
    md === 3 && 'md:grid-cols-3',
    md === 4 && 'md:grid-cols-4',
    md === 5 && 'md:grid-cols-5',
    md === 6 && 'md:grid-cols-6',
  );
  return <div className={grid}>{children}</div>;
}

function Tile({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group text-left p-5 md:p-6 border transition-colors duration-300 ease-editorial',
        active
          ? 'bg-ink text-paper border-ink'
          : 'border-line hover:border-ink',
      )}
    >
      <span className="font-display text-xl md:text-[1.4rem] leading-tight block">
        {children}
      </span>
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  autoComplete,
  autoFocus,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  autoComplete?: string;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full bg-transparent border-b border-line focus:border-ink
          outline-none py-3 font-display text-2xl transition-colors
        "
      />
    </label>
  );
}

function Footer({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = 'Continue',
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-auto pt-10 flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors min-h-[44px] px-1"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.25} />
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {nextLabel}
        <ArrowRight className="w-4 h-4" strokeWidth={1.25} />
      </button>
    </div>
  );
}

function Review({
  answers,
  message,
  waHref,
  onEdit,
  onRestart,
}: {
  answers: RequirementAnswers;
  message: string;
  waHref: string;
  onEdit: (step: number) => void;
  onRestart: () => void;
}) {
  const isPreOccupiedRoom = answers.type === 'Pre-occupied Room';
  const rows: { label: string; value?: string; step: number }[] = [
    { label: 'Looking to', value: answers.intent, step: 1 },
    { label: 'Property type', value: answers.type, step: 2 },
    { label: 'Budget', value: answers.budget, step: 3 },
    { label: 'Area', value: answers.area, step: 4 },
    { label: 'Purpose', value: answers.purpose, step: 5 },
    { label: 'Furnishing', value: answers.furnishing, step: 6 },
    ...(isPreOccupiedRoom
      ? [{
          label: 'Room preference',
          value: answers.roomPreference,
          step: ROOM_PREF_STEP,
        }]
      : []),
    { label: 'Preferences', value: answers.prefs, step: 8 },
    { label: 'Name', value: answers.name, step: 9 },
    { label: 'Phone', value: answers.phone, step: 9 },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <p className="eyebrow">Your brief</p>
      <h3 className="font-display text-display-md mt-3 max-w-[24ch]">
        Review your message before sending.
      </h3>

      <dl className="mt-10 grid gap-px bg-line hairline sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="bg-paper p-5 md:p-6 flex items-start justify-between gap-6">
            <div className="min-w-0">
              <dt className="eyebrow">{r.label}</dt>
              <dd className="mt-2 font-display text-xl leading-snug break-words">
                {r.value && r.value.trim() ? (
                  <span className="capitalize">{r.value}</span>
                ) : (
                  <span className="text-muted italic text-base font-sans">
                    Not specified
                  </span>
                )}
              </dd>
            </div>
            <button
              type="button"
              onClick={() => onEdit(r.step)}
              aria-label={`Edit ${r.label}`}
              className="text-muted hover:text-ink transition-colors shrink-0 mt-1"
            >
              <Pencil className="w-4 h-4" strokeWidth={1.25} />
            </button>
          </div>
        ))}
      </dl>

      <blockquote className="mt-10 border-l border-ink pl-5 md:pl-6 text-lg md:text-xl leading-relaxed font-display max-w-prose">
        {message}
      </blockquote>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Send on WhatsApp
          <ArrowRight className="w-4 h-4" strokeWidth={1.25} />
        </a>
        <button type="button" onClick={onRestart} className="btn btn-ghost">
          Start over
        </button>
      </div>
    </div>
  );
}
