# Project Rules — NebulaPlan

This file captures the rules we follow when building and changing this project.
**Iterate on it**: any time we make a meaningful change, add or adjust a rule here
so the next edit starts from a known baseline.

---

## Rule 1 — Writing: no em dashes, jargon, AI buzzwords, or sparkle icons

When writing copy (UI, headings, marketing, docs, code comments that a user reads):

- **No em dashes (—).** Use a comma, a full stop, or a parenthetical. Rewrite instead of reaching for the dash.
- **No jargon** the reader has to decode.
- **No AI buzzwords** (`reimagined`, `revolutionize`, `seamless`, `supercharge`, `unlock`, `leverage`, `empower`, `next-generation`, `cutting-edge`, `state-of-the-art`, etc.). Say what it actually does in plain facts.
- **No sparkle/✨-style decorative icons.** Icons must carry meaning, not decoration.

**Checklist when writing:**
- Could a non-technical founder read this in one pass? If not, simplify.
- Is every word pulling its weight, or is it filler?
- Does this state a fact, a number, or a concrete action instead of a vibe?

---

## Rule 2 — Components & centralized theme (never hardcode)

- **Always use a component, even for a small button.** Render buttons, links-that-look-like-buttons, badges, and other controls through a shared component (e.g. `Button` / `NebulaButton` / a link variant). Never write raw `<button>`/`<a>` with direct styles in pages. This way a change to a control's look lives in one place and updates everywhere.
- **Never hardcode colors, sizes, radii, or motion.** Read everything from the theme tokens in `globals.css` (`--color-*`, `--space-*`, `--r-*`, `--nebula-*`). No literal hex/rem/Tailwind `text-blue-500`-style inline values in components.
- **Centralized palette.** All visual decisions live in the theme (`@theme` block) — if you must change a color, change the token, not the component.
- Use the shared components: `Button`, `Section`/`Container`/`SectionHeader`, `NebulaCard`, `CodeWindow`, `BrowserMock`, and the motion-* primitives — compose, don't re-implement.

---

## Rule 3 — Minimalism: add nothing unnecessary

- **Don't add anything the user doesn't need.** No decorative text, no filler components, no icons that don't carry meaning, no extra "features" that distract.
- Every element on screen must earn its place: it either informs, enables an action, or clarifies. If it does none of those, cut it.
- **Avoid whitespace as much as possible.** Tighten padding and gaps; don't stretch sections just to fill a screen. Compact is better than airy.
- Prefer fewer, more meaningful elements over many small ones. A single clear statement beats three vague ones.
- Don't add "polish" elements (badges, pills, decorative panels, mockups) unless they genuinely help the user understand or act.

---

## Rule 4 — Reuse, don't fix; lean on UI libraries

- **Don't try to patch or fix something you can replace entirely.** If a component/section/flow is fighting you, replace it with a clean version rather than accumulating fixes.
- **Delegate new UI tasks to the best reference available on the internet.** Before hand-building a new UI pattern, find a proven, high-quality reference (design system, component library, or well-reviewed open-source component) and adapt it. Don't reinvent the wheel.
- **Use CSS/UI libraries liberally** (Tailwind, component libraries, design tokens, utility patterns) to spend less time writing CSS. We focus effort on logic, not styling.
- Prefer composition from existing primitives (`NebulaButton`, `Section`, `Container`, `NebulaCard`, etc.) and well-known libraries over bespoke CSS.

---

## Rule 5 — Design system: "Kinetic Orange" brutalist

- Three-color system only: electric orange `#FF4D00`, black `#000000`, white `#FFFFFF`. No gradients, no soft pastels, no drop shadows (except nav depth).
- Display type in **Archivo Black**, uppercase, tight tracking (`-0.04em`), tight line-height (`0.85–0.9`). Metadata/labels in **Space Mono**. Body in **Inter**.
- Sharp 2px borders; no rounded corners except pill-shaped buttons and the floating nav.
- **No trailing punctuation on display headings** — display words/headlines never end in a period, dot, or decorative mark (e.g. `PLAN.` → `PLAN`; the orange dot after each hero word is removed). Keep the type clean.
- **No trailing punctuation on UI copy lines** — subheadings, labels, subtitles, button text, and short UI lines never end with a period (e.g. `Welcome back, Test.` → `Welcome back, Test`; `One place for every plan.` → `One place for every plan`). Save periods for full paragraph/body sentences that contain multiple clauses; a single sentence presented as a UI line still omits the trailing period.
- **No eyebrows** — do not add a small standalone uppercase label *above* a heading (e.g. a tiny `DASHBOARD` / `PROJECT` / `REFINE` mono line). Headings already carry the meaning; if context is needed, fold it into the heading or subtitle text instead. Exception: real status labels on error/404 pages and inline form errors are fine.
- On black surfaces, display/heading type flips to white via `.bg-black .type-display/…` overrides in `globals.css` (unlayered `type-*` color rules otherwise beat the `text-white` utility).
- Marquee + rotating circular indicator use the linear/slide keyframes in `animations.css` (`animate-marquee`, `animate-marquee-reverse`, `animate-spin-12`).

---

## Rule 6 — Layout & Taste Skill standards

- Every `landing` section after the hero is exactly one screen (`Section fill` → `min-h-[100svh]`, vertically centered). Keep sections one screen or two.
- One consistent container everywhere (`container mx-auto px-6 max-w-[1200px]`) — no per-section `max-w-*xl` overrides that break the grid.
- Content starts on the container lines; no off-grid indents.
- Every section needs a visual (product mockup, real screenshot, icon set, or a concrete UI fragment). No text-only blocks.
- Focus-visible ring must never be removed without a replacement. Buttons/links keep the global outline. Form inputs intentionally use a **focus border** (e.g. `KineticField` `focus:border-[#FF4D00]`) instead of an outline — no ring/outline on input boxes (see `globals.css` `:focus-visible` which excludes `input`/`select`/`textarea`).
- Tap targets ≥ 44px on mobile.

---

## Rule 7 — Motion

- No scroll-reveal animations that start content hidden (opacity 0) — content must be visible at rest. If an entrance is needed, it must not hide content without JS.
- Respect `prefers-reduced-motion`. Keep motion quiet and fast.

---

## Rule 8 — Copy & facts

- First screen of any landing page must carry a hard fact (a number, a price, a platform, a place).
- Headings name the thing — the product, a part, the place, or a section noun. No vague fillers.
- Footer links must point somewhere real (a route, an anchor, or a real URL). Never `href="#"`.

---

## Rule 9 — Architecture

- Keep the page semantic: `<header>`/`<nav>` outside `<main>`, sections inside `<main>`, `<footer>` outside.
- Never hardcode colors/sizes/motion in components — read from `globals.css` tokens.
- Reuse `Section`/`Container`/`SectionHeader` primitives rather than restyling in each component.

---

## Rule 10 — Editing workflow

- We iterate in **dev mode** (`npm run dev`, hot reload at `:3002`) — changes apply without rebuilds.
- After a batch of changes, run the Taste Skill gate to check the frontend against the design standard.
- Update this file when a rule changes or a new one is accepted.
