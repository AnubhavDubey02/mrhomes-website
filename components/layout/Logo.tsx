'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Responsive logo — padding-aware rendering.
 *
 * logo-header.png intrinsic: 607×300px canvas
 *   Visible ink box: x=40–538, y=95–231 → 499×137px of actual logo
 *   Transparent padding: top=95px, bottom=68px, left=40px, right=68px
 *   This wastes 54.3% of canvas height — at naïve height: 42px, only ~19px
 *   of visible ink renders. Fix: render at canvas_H that yields target ink_H,
 *   then clip the transparent surround with an overflow:hidden wrapper.
 *
 * logo-symbol.png intrinsic: 283×297px canvas
 *   Visible ink box: x=23–259, y=40–269 → 237×230px
 *   Top padding: 40px (13.5% of canvas)
 *
 * Desktop target: 54px visible ink height
 *   canvas_H = 54 × (300/137) = 118.2px → use 118px
 *   top_offset = 95 × (118/300) = 37.3px → margin-top: -37px
 *   canvas_W at 118px = 118 × (607/300) = 238.9px → wrapper width: auto (unconstrained)
 *   visible_W at 54px = 54 × (499/137) = 196.7px → wrapper width: 197px
 *
 * Mobile symbol target: 34px visible ink height
 *   canvas_H = 34 × (297/230) = 43.9px → use 44px
 *   top_offset = 40 × (44/297) = 5.9px → margin-top: -6px
 *   visible_W at 34px = 34 × (237/230) = 35px → wrapper width: 35px
 */

// ── logo-header.png geometry ──────────────────────────────────────────────
const HEADER_CANVAS_W   = 607;
const HEADER_CANVAS_H   = 300;
const HEADER_INK_W      = 499;  // visible content width in source px
const HEADER_INK_H      = 137;  // visible content height in source px
const HEADER_PAD_TOP    = 95;   // transparent top padding in source px
const HEADER_PAD_LEFT   = 40;   // transparent left padding in source px

// ── logo-symbol.png geometry ──────────────────────────────────────────────
const SYMBOL_CANVAS_W   = 283;
const SYMBOL_CANVAS_H   = 297;
const SYMBOL_INK_W      = 237;
const SYMBOL_INK_H      = 230;
const SYMBOL_PAD_TOP    = 40;

// ── Rendering targets ─────────────────────────────────────────────────────
const DESKTOP_INK_H = 54;   // px — target visible logo ink height on desktop
const MOBILE_INK_H  = 34;   // px — target visible symbol ink height on mobile

// Derived: canvas height needed to produce the target ink height
const desktopCanvasH = Math.round(DESKTOP_INK_H * (HEADER_CANVAS_H / HEADER_INK_H));     // 118px
const desktopCanvasW = Math.round(desktopCanvasH * (HEADER_CANVAS_W / HEADER_CANVAS_H)); // 239px
const desktopTopOffset = Math.round(HEADER_PAD_TOP * (desktopCanvasH / HEADER_CANVAS_H)); // 37px
const desktopVisibleW  = Math.round(DESKTOP_INK_H * (HEADER_INK_W / HEADER_INK_H));      // 197px
// Left padding offset (crops left transparent space)
const desktopLeftOffset = Math.round(HEADER_PAD_LEFT * (desktopCanvasH / HEADER_CANVAS_H)); // 13px

const mobileCanvasH    = Math.round(MOBILE_INK_H * (SYMBOL_CANVAS_H / SYMBOL_INK_H));    // 44px
const mobileCanvasW    = Math.round(mobileCanvasH * (SYMBOL_CANVAS_W / SYMBOL_CANVAS_H)); // 42px
const mobileTopOffset  = Math.round(SYMBOL_PAD_TOP * (mobileCanvasH / SYMBOL_CANVAS_H));  // 6px
const mobileVisibleW   = Math.round(MOBILE_INK_H * (SYMBOL_INK_W / SYMBOL_INK_H));       // 35px

const DESKTOP_SRCS = ['/brand/logo-header.png', '/brand/logo-dark.png'] as const;
const MOBILE_SRCS  = ['/brand/logo-symbol.png', '/brand/logo-header.png'] as const;

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
          Clip the transparent padding from the PNG using overflow:hidden.
          The wrapper is exactly DESKTOP_INK_H × desktopVisibleW.
          The image is rendered at desktopCanvasH and shifted up/left to
          align the ink with the top-left of the wrapper.            ── */}
      {desktopSrc ? (
        <span
          className="hidden sm:flex items-center"
          style={{
            width: desktopVisibleW,
            height: DESKTOP_INK_H,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={desktopSrc}
            alt="Mr Homes Realtors"
            width={desktopCanvasW}
            height={desktopCanvasH}
            style={{
              width: desktopCanvasW,
              height: desktopCanvasH,
              marginTop: -desktopTopOffset,
              marginLeft: -desktopLeftOffset,
              flexShrink: 0,
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
