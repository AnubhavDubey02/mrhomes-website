'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Responsive logo — two display modes from a single source file:
 *
 *  Desktop / tablet (≥ 640 px)
 *    Full logo-web.png at 48 px height, width auto (preserves aspect ratio).
 *
 *  Mobile (< 640 px)
 *    Flower mark crop + "Mr Homes" HTML text.
 *    The mark is extracted by setting the image as a CSS background scaled to
 *    36 px height (backgroundSize: 'auto 36px') and clipping the container to
 *    36 px width — this shows roughly the left 30 % of a typical horizontal
 *    logo, which is where the flower sits.
 *    Adjust MARK_CLIP_W (px) if the crop shows too much or too little of the mark.
 *
 *  Fallback chain:
 *    /brand/logo-web.png → /brand/logo-current.png → plain HTML wordmark
 */

const SRCS = ['/brand/logo-web.png', '/brand/logo-current.png'] as const;

const DESKTOP_H = 48; // px — desktop logo height
const MOBILE_H  = 36; // px — mobile mark height
const MARK_CLIP_W = 36; // px — container width that crops the mark on mobile

export function Logo({ className }: { className?: string }) {
  const [idx, setIdx] = useState(0);
  const src = idx < SRCS.length ? SRCS[idx] : null;

  return (
    <Link
      href="/"
      aria-label="Mr Homes Realtors — home"
      className={cn('inline-flex items-center gap-2.5 py-2', className)}
    >
      {!src ? (
        /* Ultimate fallback — both images failed */
        <span className="font-display text-[1.35rem] leading-none tracking-tight">
          Mr Homes
        </span>
      ) : (
        <>
          {/* ── Desktop / tablet ≥ 640 px ───────────────────────────────── */}
          <Image
            src={src}
            alt="Mr Homes Realtors"
            width={400}
            height={128}
            className="hidden sm:block w-auto"
            style={{ height: DESKTOP_H }}
            priority
            onError={() => setIdx((i) => i + 1)}
          />

          {/* ── Mobile < 640 px: mark crop + abbreviated wordmark ────────── */}
          <span className="sm:hidden inline-flex items-center gap-2">
            {/*
             * Scale image height to MOBILE_H px, let width follow aspect ratio,
             * then clip the container to MARK_CLIP_W px — reveals only the
             * flower mark on the left edge of the image.
             */}
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: MARK_CLIP_W,
                height: MOBILE_H,
                backgroundImage: `url('${src}')`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `auto ${MOBILE_H}px`,
                backgroundPosition: 'left center',
                flexShrink: 0,
              }}
            />
            <span className="font-display text-[1.2rem] leading-none tracking-tight">
              Mr Homes
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
