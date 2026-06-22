# How an AI built this site — and what it means for the AI-era web

*Field notes · Published 16 June 2026 · By Özden Erdinc (AI & Semantic SEO)*

This website was built end-to-end by **Claude Fable 5**, Anthropic's newest model, in a single conversation. A human set the direction; the model did the research, design, copy and every line of code. The one hard rule: no images. These are the sourced, technical notes.

## Can you build a cursor-reactive WebGL hero without Three.js?

Yes — the hero on this site is 88 lines of GLSL running on raw WebGL, with no Three.js and no 3D library. Three.js is convenient but ships hundreds of kilobytes for work a single shader can do. When the goal is one full-screen effect rather than a 3D scene, raw WebGL is smaller and faster.

The technique: render one full-screen triangle, then do all the work in the fragment shader. The aurora is fractal Brownian motion over simplex noise, domain-warped for an organic drift, and driven by three uniforms — elapsed time, the cursor position, and scroll progress. Device-pixel-ratio is capped at 2 (1.5 on mobile) and the render loop pauses when the canvas leaves the viewport, which keeps it at 60 frames per second. The full shader is in `js/shader.js` in the public repository.

## Does banning stock images make AI-generated design more original?

In this build, removing every image forced the model to create rather than assemble — and that produced a more distinctive result than unlimited resources would have. The finished site contains zero images, zero video and zero stock assets; the only file on disk is one hand-drawn SVG favicon. Every visual is computed: WebGL shaders, pure CSS, and hand-drawn SVG.

The mechanism: given unconstrained choices, a generative model drifts toward its most probable output, which is also the most generic — the texture people now recognize as "AI slop." A hard constraint removes the easy average and pushes the model off that mean. The model could not drop in a hero photo, so it computed an aurora; it could not source product mockups for six landing-page templates, so it drew them as SVG. The constraint is the craft. Many complaints that "AI output is too generic" are really briefs that were too open.

## Which 2026 CSS features does this site use in production?

The site ships eight recently-shipped CSS platform features as live, progressively-enhanced production code:

- **OKLCH & wide-gamut P3 color** — a perceptual color space; on a P3 display the accent sits outside sRGB.
- **Scroll-driven animations** (`animation-timeline`) — progress and reveals run on the compositor, off the main thread.
- **Anchor positioning** — tooltips tether to their trigger in pure CSS, no positioning library.
- **Popover & invoker commands** — top-layer panels with light-dismiss and focus handling, zero JavaScript.
- **`@property` animated gradients** — a registered `<angle>` makes a conic gradient animatable.
- **Container queries** — components respond to their own width.
- **`@starting-style`** — entry animations for elements arriving in the top layer.
- **`interpolate-size` & `::details-content`** — native accordions that animate to `height: auto`.

All eight degrade safely. Support can be verified on caniuse.com (June 2026).

## Which conversion patterns held across all six industry templates?

Across SaaS, e-commerce, fintech, healthcare, real estate and restaurant templates, six conversion patterns recurred regardless of industry:

1. **One conversion goal per page, repeated, with no competing call to action.** In Unbounce's analysis of 18,639 landing pages, single-CTA pages converted higher than pages with several competing actions.
2. **A doubt-remover directly under the primary button** — "no credit card", "free cancellation", "no obligation".
3. **Social proof adjacent to each call to action**, not quarantined in one carousel.
4. **Objection-phrased FAQs** written as the questions a skeptic actually asks.
5. **A sticky mobile call-to-action bar.** Contentsquare's 2026 mobile study reported sticky bottom CTAs lifting mobile conversions materially; the effect is mobile-specific.
6. **No dark patterns** — no fake countdowns, no fake scarcity, no confirmshaming; transparency used as the conversion tactic.

The pattern, not the palette, is what transfers between industries.

## Why does a showcase site publish machine-readable notes at all?

Because a beautiful site that an AI engine cannot read does not exist in an answer. A large share of AI crawlers do not execute JavaScript, so content that appears only after scripts run is invisible to them. This site keeps all meaning in the first HTML payload, mirrors it in `llms.txt` and markdown, and aligns its structured data with the visible text. The human layer — motion, shaders, 3D — is progressive enhancement; the machine layer carries the meaning.

## Glossary

- **Generative Engine Optimization (GEO):** structuring content so AI answer engines quote and cite it inside a generated answer. The unit of success is a citation, not a ranked position.
- **Cost of Retrieval:** the computational effort an agent or search engine spends to discover, read and trust a site's content.
- **Agent-readiness:** the degree to which a website is legible to machines — discoverable, readable without JavaScript, and trustworthy via structured data.
- **Regression to the mean (in generative models):** given unconstrained choices, a model tends toward its most probable, most generic output; a hard constraint pushes it toward a more distinctive result.

---

*Built end-to-end by Claude Fable 5 · directed by Özden Erdinc · Source: https://github.com/INXPRNCD/this-website-designed-itself*
