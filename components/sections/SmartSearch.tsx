'use client';

import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { LOCATIONS } from '@/lib/locations';
import { budgetsFor } from '@/lib/budgets';

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'builder-floor', label: 'Builder Floor' },
  { value: 'independent-villa', label: 'Independent Villa' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'studio', label: 'Studio' },
  { value: '1-rk', label: '1 RK' },
  { value: 'pre-occupied-room', label: 'Pre-occupied Room' },
];

const APARTMENT_SUBTYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK +'];

const COMMERCIAL_SUBTYPES = ['Shop', 'Office', 'SCO', 'Warehouse'];

const FURNISHING = ['Furnished', 'Semi Furnished', 'Unfurnished'];

const ROOM_PREFERENCES = [
  'Male',
  'Female',
  'Any',
  'Working Professional',
  'Student',
];

/**
 * Editorial search bar with progressive conditional fields.
 *
 *  - Apartment selected         → adds a "Configuration" sub-row (1–4 BHK+)
 *  - Commercial selected        → adds a "Sub-type" sub-row (Shop/Office/SCO/Warehouse)
 *  - Rent selected              → adds a "Furnishing" cell
 *  - Pre-occupied Room selected → adds a "Room preference" cell
 *
 * Budget brackets are neutral (set in `lib/budgets.ts`) and switch by mode
 * — commercial type → commercial brackets; otherwise rent or buy. We do not
 * filter brackets by configuration so leads outside expectations still land.
 *
 * The form still submits as a standard GET to `/properties`, so server-side
 * filtering can read every parameter without bespoke client wiring.
 */
export function SmartSearch() {
  const [intent, setIntent] = useState<'buy' | 'rent'>('buy');
  const [type, setType] = useState<string>('');

  const showApartmentSub = type === 'apartment';
  const showCommercialSub = type === 'commercial';
  const showFurnishing = intent === 'rent';
  const showRoomPref = type === 'pre-occupied-room';
  const hasSecondRow =
    showApartmentSub || showCommercialSub || showFurnishing || showRoomPref;

  const BUDGETS = budgetsFor({ intent, type });

  return (
    <section aria-label="Search properties" className="pb-20 md:pb-28">
      <Container>
        <form method="get" action="/properties" className="border-y border-line">
          {/* Primary row — unchanged in shape */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_1.3fr_1.3fr_1.2fr_auto]">
            <Field label="Looking to" name="intent">
              <select
                name="intent"
                value={intent}
                onChange={(e) => setIntent(e.target.value as 'buy' | 'rent')}
                className={selectCls}
              >
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </Field>

            <Field label="Property type" name="type">
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={selectCls}
              >
                <option value="">Any</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Area" name="area">
              <select name="area" defaultValue="" className={selectCls}>
                <option value="">Any in Gurgaon</option>
                {LOCATIONS.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Budget" name="budget">
              <select name="budget" defaultValue="" className={selectCls}>
                <option value="">Any</option>
                {BUDGETS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
            </Field>

            <button
              type="submit"
              className="btn btn-primary rounded-none h-full px-8 py-6 md:py-0 md:min-h-[5.5rem] justify-center tracking-[0.08em] uppercase text-xs"
            >
              Search
            </button>
          </div>

          {/* Secondary row — only renders when a conditional applies */}
          {hasSecondRow && (
            <div
              className="
                grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
                border-t border-line
              "
            >
              {showApartmentSub && (
                <Field label="Configuration" name="apartmentType">
                  <select
                    name="apartmentType"
                    defaultValue=""
                    className={selectCls}
                  >
                    <option value="">Any</option>
                    {APARTMENT_SUBTYPES.map((s) => (
                      <option key={s} value={s.toLowerCase().replace(/\s+/g, '-')}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {showCommercialSub && (
                <Field label="Sub-type" name="commercialType">
                  <select
                    name="commercialType"
                    defaultValue=""
                    className={selectCls}
                  >
                    <option value="">Any</option>
                    {COMMERCIAL_SUBTYPES.map((s) => (
                      <option key={s} value={s.toLowerCase()}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {showFurnishing && (
                <Field label="Furnishing" name="furnishing">
                  <select
                    name="furnishing"
                    defaultValue=""
                    className={selectCls}
                  >
                    <option value="">Any</option>
                    {FURNISHING.map((f) => (
                      <option key={f} value={f.toLowerCase().replace(/\s+/g, '-')}>
                        {f}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {showRoomPref && (
                <Field label="Room preference" name="roomPreference">
                  <select
                    name="roomPreference"
                    defaultValue=""
                    className={selectCls}
                  >
                    <option value="">Any</option>
                    {ROOM_PREFERENCES.map((r) => (
                      <option key={r} value={r.toLowerCase().replace(/\s+/g, '-')}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
          )}
        </form>
      </Container>
    </section>
  );
}

const selectCls = `
  mt-2 w-full bg-transparent appearance-none outline-none
  font-display text-xl md:text-[1.35rem] leading-tight
  text-ink cursor-pointer pr-6
`;

function Field({
  label,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className="
        relative block px-5 md:px-6 py-5 md:py-6
        border-b md:border-b-0 md:border-r border-line
        last:border-b-0 last:border-r-0
      "
    >
      <span className="eyebrow block">{label}</span>
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute right-5 md:right-6 bottom-6 md:bottom-7 w-2 h-2 border-r border-b border-ink rotate-45"
      />
    </label>
  );
}
