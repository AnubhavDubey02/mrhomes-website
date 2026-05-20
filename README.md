# Mr Homes Realtors

Premium real-estate website for Gurgaon. Built for trust, restraint, and lead generation.

## Stack
- Next.js 14 (App Router) + TypeScript
- TailwindCSS (design tokens in `app/globals.css`)
- Framer Motion (subtle motion only)
- Deploys to Netlify/Vercel as static-first SSG

## Principles
1. **Luxury through minimalism** — whitespace, typography, restraint over decoration.
2. **No fake signals** — no invented stats, testimonials, or inventory. Empty states are intentional.
3. **Mobile-first** — every layout designed at 375px first.
4. **Fast** — static rendering, `next/image`, no client JS for content pages.
5. **SEO-native** — metadata, JSON-LD, sitemap, location landing pages.

## Folder Structure
```
app/
  layout.tsx              Root layout, fonts, header/footer, WhatsApp FAB
  page.tsx                Home
  globals.css             Design tokens + base styles
  about/page.tsx
  services/page.tsx
  properties/
    page.tsx              Curated listings index
    [slug]/page.tsx       Property detail
  locations/
    [area]/page.tsx       SEO landing per micro-market
  insights/
    page.tsx
    [slug]/page.tsx
  contact/page.tsx
  sitemap.ts
  robots.ts

components/
  layout/                 Header, Footer, Container, Section
  ui/                     Button, Input, Field, Card, Badge (primitives)
  sections/               Hero, ValueProps, FeaturedProperties, ProcessSteps, InsightsTeaser, ContactBlock
  lead/                   WhatsAppFloat, EnquiryForm, EnquiryDialog

lib/
  properties.ts           Typed property data (real only)
  locations.ts            Gurgaon micro-markets
  insights.ts             Insight metadata + content pillars
  seo.ts                  Metadata + JSON-LD helpers
  whatsapp.ts             Deep-link builder with context
  utils.ts

content/
  properties/             (optional MDX later)
  insights/               (MDX bodies, authored later)

public/
  images/
  favicon.svg
```

## Page Map
| Route | Purpose | Primary CTA |
|---|---|---|
| `/` | Brand positioning, philosophy, featured inventory, insights teaser | Enquire / WhatsApp |
| `/about` | Founder story, approach, why us (process, not stats) | Book a consultation |
| `/services` | Buy / Sell / Rent / Investment advisory | Enquire |
| `/properties` | Curated current inventory; empty state if none | Enquire on listing |
| `/properties/[slug]` | Full listing with gallery, specs, location, agent | WhatsApp on this property |
| `/locations/[area]` | SEO landing: DLF Phase 5, Golf Course Rd, Golf Course Ext, Sohna Rd, Dwarka Expressway | Enquire about area |
| `/insights` | Long-form SEO content across four pillars (see below) | Subscribe / Enquire |
| `/insights/[slug]` | Article | Inline CTA |
| `/contact` | Office, map, form, WhatsApp, hours | Form + WhatsApp |

## Design System (summary — full tokens in `app/globals.css`)
- **Palette (warm neutrals, no gold):**
  - Ink `#14130F` — primary text
  - Paper `#F6F3EC` — primary background
  - Bone `#ECE6D9` — secondary surface
  - Stone `#8C7E66` — *reserved* muted accent. Used very sparingly (e.g., a single underline or marker on a key page). Not present in default chrome.
  - Muted `#6F6B62` — secondary text
  - Line `rgba(20,19,15,0.08)` — hairlines
- **Type:** Display — `"Cormorant Garamond", serif` · Body — `Inter, system-ui`
- **Scale:** Mobile-first fluid `clamp()` headings; body 16px / 1.6
- **Spacing:** Sections use `clamp(4rem, 8vw, 9rem)` vertical rhythm
- **Radius:** 2px primary; large surfaces square (editorial)
- **Motion:** 400ms `cubic-bezier(0.2, 0.7, 0.2, 1)`, opacity + small translate only; respects `prefers-reduced-motion`
- **Shadows:** none; hairline borders only
- **Accent discipline:** if you reach for `stone`, ask whether the layout fails without it. Default is no accent at all.

## Content Pillars (`/insights`)
Future editorial output is organised under four pillars (see `lib/insights.ts`):
1. **Area Guides** — Gurgaon micro-market deep dives (DLF Phase 5, Golf Course Rd/Ext, Sohna Rd, Dwarka Expressway).
2. **Rental Insights** — yields, tenant trends, lease structuring.
3. **Buyer Guides** — diligence checklists, finance, RERA, society approvals.
4. **Market Updates** — quarterly notes on supply, pricing and policy.

## Lead Channels
- **WhatsApp FAB** (always visible, bottom-right) → `wa.me/<number>?text=...` with page/property context auto-injected via `lib/whatsapp.ts`.
- **Inline enquiry form** on every page footer + property/location pages.
- Form submissions post to a serverless route (P4) → email + CRM webhook.

## Status
P0 scaffold in place. Ready for P1 (content + page builds).
