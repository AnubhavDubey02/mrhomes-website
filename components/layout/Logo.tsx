'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Responsive logo.
 *
 * logo-header-tight.png: 500x137px (tightly cropped, no padding)
 * logo-symbol.png: 283×297px (symbol only, crops padding in code)
 */

// ── logo-symbol.png geometry ──────────────────────────────────────────────
const SYMBOL_CANVAS_W   = 283;
const SYMBOL_CANVAS_H   = 297;
const SYMBOL_INK_W      = 237;
const SYMBOL_INK_H      = 230;
const SYMBOL_PAD_TOP    = 40;
const SYMBOL_PAD_LEFT   = 23;

// ── Rendering targets ─────────────────────────────────────────────────────
const MOBILE_INK_H  = 38;   // px — target visible symbol ink height on mobile

// Derived: mobile logo parameters
const mobileCanvasH    = Math.round(MOBILE_INK_H * (SYMBOL_CANVAS_H / SYMBOL_INK_H));    // 49px
const mobileCanvasW    = Math.round(mobileCanvasH * (SYMBOL_CANVAS_W / SYMBOL_CANVAS_H)); // 47px
const mobileTopOffset  = Math.round(SYMBOL_PAD_TOP * (mobileCanvasH / SYMBOL_CANVAS_H));  // 7px
const mobileLeftOffset = Math.round(SYMBOL_PAD_LEFT * (mobileCanvasH / SYMBOL_CANVAS_H)); // 4px
const mobileVisibleW   = Math.round(MOBILE_INK_H * (SYMBOL_INK_W / SYMBOL_INK_H)) + 1;   // 40px

const DESKTOP_SRCS = ['/brand/logo-header-tight.png', '/brand/logo-dark.png'] as const;
const MOBILE_SRCS  = ['/brand/logo-symbol.png', '/brand/logo-header-tight.png'] as const;

export function Logo({ className }: { className?: string }) {
  const [dIdx, setDIdx] = useState(0);
  const [mIdx, setMIdx] = useState(0);

  const desktopSrc = dIdx < DESKTOP_SRCS.length ? DESKTOP_SRCS[dIdx] : null;
  const mobileSrc  = mIdx < MOBILE_SRCS.length  ? MOBILE_SRCS[mIdx]  : null;

  return (
    <Link
      href="/"
      aria-label="Mr Homes Realtors — home"
      className={cn('inline-flex items-center gap-2.5 py-1', className)}
    >
      {/* ── Desktop / tablet ≥ 640 px ─────────────────────────────────────
          Render tightly-cropped header logo at exactly 59px height.    ── */}
      {desktopSrc ? (
        <span className="hidden sm:flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={desktopSrc}
            alt="Mr Homes Realtors"
            width={215}
            height={59}
            style={{
              height: '59px',
              width: 'auto',
              display: 'block',
            }}
            onError={() => setDIdx((i) => i + 1)}
          />
        </span>
      ) : (
        <span className="hidden sm:block font-display text-[1.5rem] leading-none tracking-tight">
          Mr Homes
        </span>
      )}

      {/* ── Mobile < 640 px: symbol mark ──────────────────────────────────
          Same clip approach for the symbol PNG.                      ── */}
      {mobileSrc ? (
        <span className="sm:hidden inline-flex items-center gap-2">
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: mobileVisibleW,
              height: MOBILE_INK_H,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mobileSrc}
              alt=""
              width={mobileCanvasW}
              height={mobileCanvasH}
              style={{
                width: mobileCanvasW,
                height: mobileCanvasH,
                marginTop: -mobileTopOffset,
                marginLeft: -mobileLeftOffset,
                display: 'block',
              }}
              onError={() => setMIdx((i) => i + 1)}
            />
          </span>
          <span className="font-display text-[1.2rem] leading-none tracking-tight">
            Mr Homes
          </span>
        </span>
      ) : (
        <span className="sm:hidden font-display text-[1.2rem] leading-none tracking-tight">
          Mr Homes
        </span>
      )}
    </Link>
  );
}
