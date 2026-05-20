'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { mailtoLink } from '@/lib/business';

/**
 * Editorial enquiry form. Until a serverless submission endpoint exists,
 * we compose the user's input into a `mailto:` and open it in their client.
 * This keeps the form *honest* — it actually delivers a message today.
 */
export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const message = String(fd.get('message') || '').trim();

    const subject = `Enquiry from ${name || 'website visitor'}`;
    const body = [
      `Name: ${name || '-'}`,
      `Phone: ${phone || '-'}`,
      `Email: ${email || '-'}`,
      '',
      'Message:',
      message || '-',
      '',
      '— Sent from mrhomesrealtors.com',
    ].join('\n');

    window.location.href = mailtoLink({ subject, body });
    // Re-enable after a short delay; if the mail client opens, navigation freezes anyway.
    setTimeout(() => setSubmitting(false), 1200);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <Field label="Your name" name="name" required autoComplete="name" />
      <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field label="What can we help with?" name="message" textarea required />
      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary disabled:opacity-50"
      >
        {submitting ? 'Opening mail…' : 'Send enquiry'}
        <ArrowRight className="w-4 h-4" strokeWidth={1.25} />
      </button>
      <p className="text-xs text-muted">
        Submitting opens your email client with the message pre-filled — we
        reply within one working day.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  textarea,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
  autoComplete?: string;
}) {
  const base =
    'w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 transition-colors';
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={4}
          required={required}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          autoComplete={autoComplete}
          className={base}
        />
      )}
    </label>
  );
}
