// Central place to build WhatsApp deep links so every CTA carries page context.
// The number lives in `lib/business.ts` (single source of truth).
import { BUSINESS } from './business';

export const WHATSAPP_NUMBER = BUSINESS.phone.digits; // E.164 without '+'

export function whatsappLink(message: string) {
  const text = encodeURIComponent(message.trim());
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export const waMessages = {
  general: 'Hi Mr Homes Realtors, I would like to know more about your services in Gurgaon.',
  property: (title: string) =>
    `Hi Mr Homes Realtors, I am interested in the property "${title}". Could you share details?`,
  location: (area: string) =>
    `Hi Mr Homes Realtors, I am exploring ${area}. Can you share current options?`,
  service: (name: string) =>
    `Hi Mr Homes Realtors, I would like to know more about your ${name} services in Gurgaon.`,
};

// Inputs from the Smart Requirement Engine.
export type RequirementAnswers = {
  intent?: 'buy' | 'rent';
  type?: string;       // e.g., "2 BHK Apartment"
  budget?: string;     // e.g., "₹45k – 55k" or "₹2 – 5 Cr"
  area?: string;          // free text, e.g., "Sector 43" or "DLF Phase 5"
  purpose?: string;       // Family / Bachelor / Corporate / Airbnb / Investment
  furnishing?: string;    // Furnished / Semi Furnished / Unfurnished / No preference
  roomPreference?: string;// Male / Female / Any / Working Professional / Student
                          // Only relevant when type === "Pre-occupied Room".
  prefs?: string;         // free-text additional preferences
  name?: string;          // contact name
  phone?: string;         // contact phone
};

/**
 * Composes a natural-sounding WhatsApp message from progressive answers.
 * Sentences only render when the underlying fields are present, so an
 * incomplete brief still reads cleanly.
 *
 * Example output:
 *   "Hi Mr Homes, this is Aarav. I am looking for a 2 BHK Apartment on rent
 *    in Sector 43 with a budget of ₹45k – 55k. Purpose: family use.
 *    Furnishing: Furnished. Additional notes: high floor preferred.
 *    You can reach me at +91 98xxxxxx12."
 */
export function requirementMessage(a: RequirementAnswers): string {
  const out: string[] = [];

  // Greeting + identification
  const name = a.name?.trim();
  out.push(name ? `Hi Mr Homes, this is ${name}.` : 'Hi Mr Homes.');

  // Pre-occupied Room is its own special case: it implies rent, takes a
  // lower-cased phrasing, and never gets the "Apartment" article treatment.
  const isRoom = a.type === 'Pre-occupied Room';

  // Core requirement sentence
  if (a.intent || a.type || a.area || a.budget) {
    const verb =
      a.intent === 'rent' || isRoom ? 'looking for' : 'looking to buy';
    const article = a.type ? ' a' : '';
    const onRent = a.intent === 'rent' && !isRoom ? ' on rent' : '';
    let core = `I am ${verb}${article}`;
    if (a.type) core += ` ${isRoom ? 'pre-occupied room' : a.type}`;
    core += onRent;
    if (a.area) core += ` in ${a.area}`;
    if (a.budget) core += ` with a budget of ${a.budget}`;
    out.push(`${core}.`);
  }

  // Purpose — suppressed for pre-occupied room (room preference covers it).
  if (a.purpose && !isRoom) {
    const p = a.purpose.toLowerCase();
    if (p === 'investment') out.push('This is for investment.');
    else if (p === 'airbnb') out.push('Intended use: short-stay / Airbnb.');
    else out.push(`Purpose: ${p} use.`);
  }

  // Room preference + furnishing — combined into a single "Preference:" line
  // when the type is Pre-occupied Room, matching the brief's example phrasing.
  const room = a.roomPreference?.trim();
  const furnishing =
    a.furnishing && a.furnishing.toLowerCase() !== 'no preference'
      ? a.furnishing
      : '';

  if (isRoom) {
    const bits: string[] = [];
    if (room) bits.push(room.toLowerCase());
    if (furnishing) bits.push(furnishing.toLowerCase());
    if (bits.length) out.push(`Preference: ${bits.join(', ')}.`);
  } else {
    if (room) out.push(`Room preference: ${room}.`);
    if (furnishing) out.push(`Furnishing: ${furnishing}.`);
  }

  // Free-text additions
  const prefs = a.prefs?.trim();
  if (prefs) out.push(`Additional notes: ${prefs}.`);

  // Contact
  const phone = a.phone?.trim();
  if (phone) out.push(`You can reach me at ${phone}.`);

  return out.join(' ');
}
