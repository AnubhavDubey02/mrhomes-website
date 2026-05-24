'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Section } from '@/components/layout/Container';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Runtime error:', error);
  }, [error]);

  return (
    <Section className="pt-24 min-h-[60vh] flex flex-col justify-center">
      <p className="eyebrow text-stone">Error</p>
      <h1 className="font-display text-display-lg mt-6 max-w-[18ch]">
        Something went wrong.
      </h1>
      <p className="mt-8 max-w-prose text-lg text-muted leading-relaxed">
        An unexpected error occurred while loading this page. We have logged the error
        and will look into it immediately.
      </p>

      <div className="mt-12 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="btn btn-primary"
        >
          Try again
        </button>
        <Link href="/" className="btn btn-ghost">
          Go to home
        </Link>
      </div>
    </Section>
  );
}
