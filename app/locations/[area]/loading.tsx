import { Section } from '@/components/layout/Container';

export default function LocationLoading() {
  return (
    <>
      <Section className="pt-24">
        <div className="animate-pulse space-y-6 max-w-prose">
          <div className="h-3 w-32 bg-line rounded-sm" />
          <div className="h-10 w-2/3 bg-line rounded-sm" />
          <div className="h-5 w-full bg-line rounded-sm" />
          <div className="h-5 w-4/5 bg-line rounded-sm" />
        </div>
      </Section>

      <Section>
        <div className="animate-pulse grid gap-px bg-line hairline lg:grid-cols-12">
          <div className="lg:col-span-4 bg-paper p-8 space-y-4">
            <div className="h-3 w-20 bg-line rounded-sm" />
            <div className="h-6 w-2/3 bg-line rounded-sm" />
            <div className="h-4 w-full bg-line rounded-sm" />
          </div>
          <div className="lg:col-span-8 bg-paper p-8 grid gap-px bg-line hairline sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 space-y-3">
                <div className="h-3 w-12 bg-line rounded-sm" />
                <div className="h-5 w-3/4 bg-line rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
