// Single source of truth for live business details.
// Update values here; every page reads from this module.

export const BUSINESS = {
  brand: 'Mr Homes Realtors',
  shortBrand: 'Mr Homes',

  // Primary phone is also the WhatsApp number.
  phone: {
    display: '+91 98701 91004',
    e164: '+919870191004',
    digits: '919870191004',     // for wa.me
    tel: '+919870191004',       // for tel: links
  },

  email: 'mrhomesrealtors1@gmail.com',

  website: {
    display: 'mrhomesrealtors.com',
    url: 'https://mrhomesrealtors.com',
  },

  social: {
    instagram: {
      handle: 'mrhomesrealtors',
      url: 'https://instagram.com/mrhomesrealtors',
    },
  },

  city: 'Gurgaon, Haryana',
  hours: 'Mon – Sat, 10:00 – 19:00 IST',
} as const;

// Mailto helper that prefills subject/body for the enquiry form.
export function mailtoLink(opts?: { subject?: string; body?: string }) {
  const params = new URLSearchParams();
  if (opts?.subject) params.set('subject', opts.subject);
  if (opts?.body) params.set('body', opts.body);
  const qs = params.toString();
  return `mailto:${BUSINESS.email}${qs ? `?${qs}` : ''}`;
}

// Used as `tel:` href. Already E.164 with +.
export const telLink = `tel:${BUSINESS.phone.tel}`;
