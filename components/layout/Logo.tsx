import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Brand logo — built on /public/brand/logo-current.png (1024 × 1024 source).
 *
 * TWO DISPLAY MODES
 * -----------------
 * onDark=false  (default, header / light surfaces)
 *   The flower mark is extracted via CSS background-image crop and rendered
 *   with mix-blend-mode:multiply. On the warm paper background (#F6F3EC),
 *   multiply causes:
 *     • White areas  → become paper-coloured (invisible) — hides the PNG's
 *                      white wordmark which would otherwise be illegible.
 *     • Coloured mark → multiply with near-white ≈ original colours (preserved).
 *   An HTML wordmark in --ink sits next to the mark for full legibility.
 *
 * onDark=true   (dark / ink surfaces, CTAs)
 *   The full PNG is shown without blending. White mark + white wordmark are
 *   both readable on dark backgrounds.
 *
 * CROP CONSTANTS
 * --------------
 * These assume the source PNG is 1024 × 1024 with the flower mark occupying
 * approximately x: 95–380 px, y: 375–655 px. Adjust MARK_* values if your
 * source file's mark position differs.
 */

// ── source dimensions ─────────────────────────────────────────────────────
const SRC = 1024;          // source image is square
const MARK_X1 = 95;        // mark left edge in source px
const MARK_Y1 = 375;       // mark top  edge in source px
const MARK_H  = 280;       // mark height in source px

// ── light-bg mark variant (44 px display height) ─────────────────────────
const MARK_PX   = 44;
const SCALE_M   = MARK_PX / MARK_H;                     // 0.157
const BG_SIZE_M = `${Math.round(SRC * SCALE_M)}px`;     // ≈ 161 px
const BG_POS_M  = `${-Math.round(MARK_X1 * SCALE_M)}px ${-Math.round(MARK_Y1 * SCALE_M)}px`;

// ── dark-bg full-logo variant (50 px display height) ─────────────────────
// Content area in source: x 95–950, y 375–655  (855 × 280 px)
const LOGO_H    = 50;
const SCALE_L   = LOGO_H / 280;                          // 0.179
const BG_SIZE_L = `${Math.round(SRC * SCALE_L)}px`;     // ≈ 183 px
const BG_POS_L  = `${-Math.round(95 * SCALE_L)}px ${-Math.round(375 * SCALE_L)}px`;
const LOGO_W    = Math.round(855 * SCALE_L);             // ≈ 153 px

export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Mr Homes Realtors — home"
      className={cn('inline-flex items-center gap-3 group', className)}
    >
      {onDark ? (
        /* Dark surfaces — full PNG: mark + white wordmark both readable */
        <span
          aria-label="Mr Homes Realtors"
          style={{
            display: 'inline-block',
            width: LOGO_W,
            height: LOGO_H,
            backgroundImage: "url('/brand/logo-current.png')",
            backgroundSize: BG_SIZE_L,
            backgroundPosition: BG_POS_L,
            backgroundRepeat: 'no-repeat',
          }}
        />
      ) : (
        /* Light surfaces — mark crop + blend, HTML wordmark in ink */
        <>
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              flexShrink: 0,
              width: MARK_PX,
              height: MARK_PX,
              backgroundImage: "url('/brand/logo-current.png')",
              backgroundSize: BG_SIZE_M,
              backgroundPosition: BG_POS_M,
              backgroundRepeat: 'no-repeat',
              mixBlendMode: 'multiply',
            }}
          />
          <span className="font-display text-[1.35rem] leading-none tracking-tight">
            Mr Homes
          </span>
        </>
      )}
    </Link>
  );
}
