'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export function ScrollToResults() {
  const ref = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only scroll if there are filters active
    if (searchParams.toString()) {
      const timer = setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return <div ref={ref} className="scroll-mt-24" />;
}
