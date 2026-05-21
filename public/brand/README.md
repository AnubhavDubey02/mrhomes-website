# Mr Homes Realtors — Brand Assets

## Current source file

| File | Status | Notes |
|------|--------|-------|
| `logo-current.png` | ✅ In use | 1024 × 1024 px, square canvas. Flower mark left, white wordmark right. |

## How the logo is rendered on the website

The website derives all brand display from `logo-current.png` using CSS — no separate
exports are required for normal use.

| Surface | Technique | Result |
|---------|-----------|--------|
| Light backgrounds (header, footer, body) | `mix-blend-mode: multiply` on the mark crop | White areas become invisible; coloured flower mark preserved. HTML wordmark in `--ink` sits next to it. |
| Dark backgrounds / CTAs | Full PNG, no blend | White mark + white wordmark both readable on `--ink` (#14130F). |
| Browser favicon / tab icon | `logo-current.png` referenced in metadata | Works with the square PNG. |
| Apple touch icon (home screen) | `logo-current.png` at 180 × 180 | Works with the square PNG. |
| Open Graph / social share | `logo-current.png` | Acceptable; can be replaced with `og-image.png` (1200 × 630). |

## Optional future exports (from designer / Figma)

These files will be used **automatically** when placed here — no code changes needed.

| File | Spec | Use |
|------|------|-----|
| `logo-mark-transparent.png` | 512 × 512 px, RGBA transparent background, flower mark only | Favicon, PWA icon, embossing |
| `logo-dark-text-transparent.png` | ~600 × 200 px, RGBA transparent background, mark + dark (`#14130F`) wordmark | Light-bg contexts, email, print |
| `logo-light-text-transparent.png` | ~600 × 200 px, RGBA transparent background, mark + white wordmark | Dark-bg contexts, overlays |
| `og-image.png` | 1200 × 630 px | Social share / Open Graph preview |
| `favicon.ico` | 16 × 16 + 32 × 32 multi-size ICO | Legacy browser tab icon |

## Crop constants (Logo.tsx)

If `logo-current.png` is re-exported at a different size, update these constants in
`components/layout/Logo.tsx`:

```
SRC      = source image dimension (assumed square)
MARK_X1  = flower mark left edge in source px
MARK_Y1  = flower mark top  edge in source px
MARK_H   = flower mark height in source px
```

Current values assume a 1024 × 1024 source with the mark at approximately
x: 95–380, y: 375–655.
