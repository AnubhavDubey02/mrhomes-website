'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  const [error, setError] = useState(false);

  return (
    <Link
      href="/"
      aria-label="Mr Homes Realtors — home"
      className={cn('inline-flex items-center', className)}
    >
      {error ? (
        <span className="font-display text-[1.35rem] leading-none tracking-tight">
          Mr Homes
        </span>
      ) : (
        <Image
          src="/brand/logo-current.png"
          alt="Mr Homes Realtors"
          width={1024}
          height={1024}
          className="h-8 md:h-10 w-auto"
          priority
          onError={() => setError(true)}
        />
      )}
    </Link>
  );
}
