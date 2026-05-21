import { Section } from '@/components/layout/Container';

/**
 * Root-level loading UI — shown by Next.js during any page navigation
 * that triggers a server render. Matches the editorial skeleton pattern:
 * hairline placeholder bars in place of content, no spinners.
 */
export default function Loading() {
  return (
    <Section className="pt-24">
      <div className="animate-pulse space-y-6 max-w-prose">
        <div className="h-3 w-20 bg-line rounded-sm" />
        <div className="h-8 w-3/4 bg-line rounded-sm" />
        <div className="h-5 w-full bg-line rounded-sm" />
        <div className="h-5 w-5/6 bg-line rounded-sm" />
      </div>
      <div className="mt-16 grid gap-px bg-line hairline sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-paper p-8 space-y-4">
            <div className="h-3 w-16 bg-line rounded-sm" />
            <div className="h-6 w-2/3 bg-line rounded-sm" />
            <div className="h-4 w-full bg-line rounded-sm" />
            <div className="h-4 w-4/5 bg-line rounded-sm" />
          </div>
        ))}
      </div>
    </Section>
  );
}
