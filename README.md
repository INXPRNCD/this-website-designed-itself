# FABLE·5 — The Website That Designed Itself

A state-of-the-art showcase website built end-to-end by **Claude Fable 5** in a single
conversation: research, art direction, copy, design system and every line of code.

## Run it

The site uses ES modules, so it needs any static server (double-clicking `index.html` won't work):

```bash
cd "Showcase Webseite"
python3 -m http.server 8141
# → http://localhost:8141
```

## What's inside

| | |
|---|---|
| `index.html` | Semantic single page — hero + four acts + finale |
| `css/main.css` | OKLCH/P3 design tokens, fluid type scale, all 2026-platform demos |
| `js/shader.js` | Raw WebGL aurora (domain-warped simplex noise, cursor- & scroll-reactive) |
| `js/scenes.js` | GSAP scroll choreography (pinned horizontal act, masked reveals, counters) |
| `js/scroll.js` | Lenis smooth scroll synced into GSAP's single ticker |
| `js/cursor.js` | Difference-blend cursor + magnetic elements (fine pointers only) |
| `js/main.js` | Preloader → hero intro orchestration |

## Industry templates (Act V)

Six complete, conversion-optimized landing page templates — each a self-contained
single HTML file in [templates/](templates/), each with its own art direction, brand,
typography and copy. The showcase gallery embeds them as **live scaled iframes**.

| Template | Industry | Conversion architecture |
|---|---|---|
| `saas.html` — Loopline | SaaS | Trial-first hero, CSS-drawn product frame, bento features, anchored 3-tier pricing, billing toggle |
| `ecommerce.html` — Aurel | D2C / E-commerce | Shipping-threshold bar, ★4.9-in-hero, variant buttons, bundle anchoring, 60-day guarantee, sticky add-to-bag |
| `fintech.html` — Brightvault | Fintech | Regulation line in hero, badges near CTA, live yield calculator, specific security copy |
| `healthcare.html` — Halden Dental | Healthcare | Booking-first, click-to-call, insurance clarity, multi-step form (contact last), WCAG-minded |
| `realestate.html` — Meridian Estates | Real estate | Valuation lead magnet (multi-step), "no sale, no fee", market-stat counters, quiet-luxury serif |
| `restaurant.html` — Ember & Rye | Restaurant | Reserve-first, HTML menu with dot leaders, honest scarcity, hours/address/phone in thumb zone |

Built on 2025/26 CRO research: single conversion goal per page, doubt-remover microcopy
under every primary CTA, social proof adjacent to CTAs, objection-phrased FAQs,
sticky mobile CTA bars, ≤4-field forms, no dark patterns.

## Techniques showcased

- **WebGL hero** — ~150 lines of GLSL, no Three.js, DPR-capped, paused off-screen
- **Scroll choreography** — GSAP ScrollTrigger pinning/scrubbing + Lenis (one rAF loop)
- **2026 CSS, live** — scroll-driven animations (`animation-timeline: view()`), anchor
  positioning, popover + `@starting-style`, animated `::details-content`, `@property`
  animated gradients, OKLCH relative color, `corner-shape: squircle`, `linear()` springs,
  `text-wrap: balance/pretty`
- **Variable-font kinetics** — scroll-scrubbed weight, cursor-proximity letterforms
- **Craft details** — film grain, velocity-reactive marquee, custom cursor, preloader
  choreography, tabular-numeral count-ups

## Accessibility & performance

- `prefers-reduced-motion` → complete static experience (no preloader, no smooth scroll,
  single shader frame, final values everywhere)
- Touch devices: no custom cursor or magnetism, vertical layout for the horizontal act
- Transform/opacity-only animation, `content-visibility`-friendly structure,
  zero images (every visual is computed), two runtime dependencies (GSAP, Lenis via CDN)

Built 06/2026. No templates. No stock. View source — that's the point of it.
