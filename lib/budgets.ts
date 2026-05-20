// Neutral budget brackets — kept independent of property type / configuration
// so we never filter out a lead by inferring "what budget should buy what".
// Three mode-keyed sets: rent (residential), buy (residential), commercial.

export type BudgetOption = { value: string; label: string };

const toSlug = (s: string) =>
  s.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');

const make = (labels: readonly string[]): BudgetOption[] =>
  labels.map((label) => ({ value: toSlug(label), label }));

export const RENT_BUDGET_LABELS = [
  'Under ₹20k',
  '₹20k – 30k',
  '₹30k – 40k',
  '₹40k – 60k',
  '₹60k – 1 L',
  '₹1 L +',
] as const;

export const BUY_BUDGET_LABELS = [
  'Under ₹50 L',
  '₹50 L – 1 Cr',
  '₹1 – 2 Cr',
  '₹2 – 5 Cr',
  '₹5 – 10 Cr',
  '₹10 Cr +',
] as const;

export const COMMERCIAL_BUDGET_LABELS = [
  'Under ₹50k',
  '₹50k – 1 L',
  '₹1 – 2 L',
  '₹2 – 5 L',
  '₹5 L +',
] as const;

export const RENT_BUDGETS = make(RENT_BUDGET_LABELS);
export const BUY_BUDGETS = make(BUY_BUDGET_LABELS);
export const COMMERCIAL_BUDGETS = make(COMMERCIAL_BUDGET_LABELS);

/**
 * Pick the appropriate budget set based on user choices.
 * Commercial property type takes precedence regardless of buy/rent intent.
 */
export function budgetsFor(opts: {
  intent?: 'buy' | 'rent';
  type?: string;
}): BudgetOption[] {
  const t = (opts.type || '').toLowerCase();
  if (t === 'commercial') return COMMERCIAL_BUDGETS;
  if (opts.intent === 'rent') return RENT_BUDGETS;
  return BUY_BUDGETS;
}

export function budgetLabelsFor(opts: {
  intent?: 'buy' | 'rent';
  type?: string;
}): readonly string[] {
  const t = (opts.type || '').toLowerCase();
  if (t === 'commercial') return COMMERCIAL_BUDGET_LABELS;
  if (opts.intent === 'rent') return RENT_BUDGET_LABELS;
  return BUY_BUDGET_LABELS;
}
