'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { budgetsFor } from '@/lib/budgets';

const BUY_PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'builder-floor', label: 'Builder Floor' },
  { value: 'independent-villa', label: 'Independent Villa' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
];

const RENT_PROPERTY_TYPES = [
  { value: '1-rk', label: '1 RK' },
  { value: 'studio', label: 'Studio Apartment' },
  { value: '1-bhk', label: '1 BHK' },
  { value: '2-bhk', label: '2 BHK' },
  { value: '3-bhk', label: '3 BHK' },
  { value: 'builder-floor', label: 'Builder Floor' },
  { value: 'independent-villa', label: 'Independent Villa' },
  { value: 'pre-occupied-room', label: 'Pre-occupied Room' },
  { value: 'commercial', label: 'Commercial' },
];

type LeadFormProps = {
  compact?: boolean;
  defaultIntent?: 'rent' | 'buy';
  defaultType?: string;
  defaultArea?: string;
  defaultBudget?: string;
  formSource?: string; // 'homepage' | 'property_detail'
};

export function LeadForm({
  compact = false,
  defaultIntent = 'buy',
  defaultType = '',
  defaultArea = '',
  defaultBudget = '',
  formSource = 'general',
}: LeadFormProps) {
  const [intent, setIntent] = useState<'buy' | 'rent'>(defaultIntent);
  const [type, setType] = useState<string>(defaultType);
  const [area, setArea] = useState<string>(defaultArea);
  const [budget, setBudget] = useState<string>(defaultBudget);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [timeline, setTimeline] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const hasStarted = useRef<boolean>(false);

  // Sync types lists when intent changes
  useEffect(() => {
    const validTypes = intent === 'buy' ? BUY_PROPERTY_TYPES : RENT_PROPERTY_TYPES;
    if (type !== '' && !validTypes.some((t) => t.value === type)) {
      setType('');
    }
  }, [intent, type]);

  const trackFormStart = () => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_start', {
          form_id: 'mr_homes_lead_form',
          form_name: 'Premium Lead Form',
          form_source: formSource,
        });
      }
    }
  };

  const trackFormSubmit = (data: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'form_submit', {
        form_id: 'mr_homes_lead_form',
        form_name: 'Premium Lead Form',
        form_source: formSource,
        requirement_type: data.intent,
        property_type: data.type,
        budget: data.budget,
      });
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError('Please provide your name.');
      setSubmitting(false);
      return;
    }

    if (!trimmedPhone || trimmedPhone.length < 8) {
      setError('Please provide a valid phone number.');
      setSubmitting(false);
      return;
    }

    const payload = {
      name: trimmedName,
      phone: trimmedPhone,
      intent,
      type,
      area: area.trim(),
      budget,
      timeline,
      notes: notes.trim(),
      source: formSource,
      timestamp: new Date().toISOString(),
    };

    // Track submission in GA4
    trackFormSubmit(payload);

    fetch('/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Submission failed. Please try again.');
        }
        setSuccess(true);
      })
      .catch((err) => {
        console.error('Lead Form Submission Error:', err);
        setError(err.message || 'An error occurred. Please try again.');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const BUDGETS = budgetsFor({ intent, type });
  const PROPERTY_TYPES = intent === 'buy' ? BUY_PROPERTY_TYPES : RENT_PROPERTY_TYPES;

  if (success) {
    return (
      <div className="border border-line bg-paper p-8 md:p-10 text-center max-w-xl mx-auto my-6">
        <p className="eyebrow text-ink">Thank you</p>
        <h3 className="font-display text-2xl mt-4">We've received your requirements</h3>
        <p className="mt-4 text-muted text-sm leading-relaxed">
          One of our senior Gurgaon advisors will curate verified options matching your brief and get in touch within one working day.
        </p>
      </div>
    );
  }

  const selectCls = `
    w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 transition-colors
    appearance-none cursor-pointer text-ink pr-6
  `;

  const inputCls = `
    w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 transition-colors
    text-ink
  `;

  return (
    <div className={`bg-paper border border-line ${compact ? 'p-6' : 'p-8 md:p-12'}`}>
      {!compact && (
        <div className="mb-10 max-w-prose">
          <p className="eyebrow">Personal Advisory</p>
          <h2 className="font-display text-display-md mt-4">Find Your Next Home</h2>
          <p className="mt-4 text-muted">
            Share your detailed requirements below and let our experts shortlist verified options from our offline network.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={`grid gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          <label className="block">
            <span className="eyebrow block text-xs">Your Name *</span>
            <input
              type="text"
              required
              placeholder="e.g. Rohan Sharma"
              value={name}
              onFocus={trackFormStart}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="eyebrow block text-xs">Phone Number *</span>
            <input
              type="tel"
              required
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onFocus={trackFormStart}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="eyebrow block text-xs">Looking to</span>
            <div className="relative">
              <select
                value={intent}
                onFocus={trackFormStart}
                onChange={(e) => setIntent(e.target.value as 'buy' | 'rent')}
                className={selectCls}
              >
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>
              <span className="pointer-events-none absolute right-2 bottom-4 w-1.5 h-1.5 border-r border-b border-ink rotate-45" />
            </div>
          </label>

          <label className="block">
            <span className="eyebrow block text-xs">Property Type</span>
            <div className="relative">
              <select
                value={type}
                onFocus={trackFormStart}
                onChange={(e) => setType(e.target.value)}
                className={selectCls}
              >
                <option value="">Any Type</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 bottom-4 w-1.5 h-1.5 border-r border-b border-ink rotate-45" />
            </div>
          </label>

          <label className="block">
            <span className="eyebrow block text-xs">Preferred Area / Sector</span>
            <input
              type="text"
              placeholder="e.g. Sector 43, DLF Phase 5"
              value={area}
              onFocus={trackFormStart}
              onChange={(e) => setArea(e.target.value)}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="eyebrow block text-xs">Budget Range</span>
            <div className="relative">
              <select
                value={budget}
                onFocus={trackFormStart}
                onChange={(e) => setBudget(e.target.value)}
                className={selectCls}
              >
                <option value="">Any Budget</option>
                {BUDGETS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 bottom-4 w-1.5 h-1.5 border-r border-b border-ink rotate-45" />
            </div>
          </label>

          <label className="block">
            <span className="eyebrow block text-xs">Move-in Timeline</span>
            <div className="relative">
              <select
                value={timeline}
                onFocus={trackFormStart}
                onChange={(e) => setTimeline(e.target.value)}
                className={selectCls}
              >
                <option value="">Select Timeline</option>
                <option value="immediate">Immediately</option>
                <option value="15-days">Within 15 Days</option>
                <option value="30-days">Within 30 Days</option>
                <option value="flexible">Flexible</option>
              </select>
              <span className="pointer-events-none absolute right-2 bottom-4 w-1.5 h-1.5 border-r border-b border-ink rotate-45" />
            </div>
          </label>

          <label className={`block ${compact ? '' : 'md:col-span-2 lg:col-span-2'}`}>
            <span className="eyebrow block text-xs">Additional Notes (Optional)</span>
            <input
              type="text"
              placeholder="e.g. Prefer gated community, high floor, Vaastu compliant"
              value={notes}
              onFocus={trackFormStart}
              onChange={(e) => setNotes(e.target.value)}
              className={inputCls}
            />
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-2 font-medium">
            {error}
          </p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full sm:w-auto min-h-[44px] justify-center"
          >
            {submitting ? 'Submitting...' : 'Get Verified Options'}
          </button>
        </div>
      </form>
    </div>
  );
}
