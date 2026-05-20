import Link from 'next/link';
import { cn } from '@/lib/utils';

// Placeholder mark + wordmark. Designed to be replaced with a vector logo
// without changing layout. Mark = square-in-square (hairlines only).
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Mr Homes Realtors — home"
      className={cn('inline-flex items-center gap-3 group', className)}
    >
      <span
        aria-hidden
        className="relative inline-block w-5 h-5 border border-ink"
      >
        <span className="absolute inset-[3px] border border-ink" />
      </span>
      <span className="font-display text-[1.35rem] leading-none tracking-tight">
        Mr Homes
      </span>
    </Link>
  );
}
