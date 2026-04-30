# Portfolio Redesign Spec — Anthropic-Style Editorial

This document is the source of truth for redesigning this portfolio in the visual language of [anthropic.com](https://www.anthropic.com). Treat it as a brief, not a script: hold the line on the tokens and principles, but use judgment on layout details.

The current site is a dark "soft-neon cyberpunk" theme. The target is the opposite: a warm, paper-feeling, editorial site that reads like a thoughtful publication — restrained, typographic, confident.

---

## 1. Files in this repo

```
index.html          # Projects grid (home)
about.html          # About page
current.html        # Current Work
experience.html     # Experience / resume
contact.html        # Contact
assets/styles.css   # Global stylesheet (rewrite end-to-end)
assets/script.js    # Theme toggle, project rendering, modal
assets/projects.json# Project data consumed by script.js
assets/images/...   # Project thumbnails + me.png
```

Keep the file structure, page set, and data contract (`projects.json`) the same. The redesign is a CSS rewrite plus targeted markup tweaks — not a framework migration. Do not introduce React, a build step, Tailwind, or new dependencies. Plain HTML + CSS + a single `script.js`.

---

## 2. Design principles

1. **Paper, not screen.** The page should feel like premium matte stock under warm light, not a glowing display. No glow effects, no neon, no glass blur, no heavy drop shadows.
2. **Typography is the design.** Serif display type carries the page. Imagery and color are accents.
3. **Editorial whitespace.** Generous vertical rhythm. Sections breathe. Margins are large at desktop, never cramped on mobile.
4. **Restraint over ornament.** One accent color, used sparingly. Hairline borders, not boxes-within-boxes.
5. **Calm motion.** Hover states are subtle (color shift, underline reveal, 1–2px translate). No scale-bounces, no glow pulses, no parallax.
6. **Accessible by default.** All interactive elements meet WCAG AA contrast against the cream background. Focus rings are visible. Skip-to-content link in the header.

If a change makes the site louder, it's wrong.

---

## 3. Color tokens

Replace the existing `:root` palette with a warm paper palette inspired by Anthropic's "Book Cloth / Slate / Crail" system. Names are descriptive — keep them.

```css
:root {
  /* Surfaces */
  --paper:        #F5F4EE; /* page background — warm cream */
  --paper-deep:   #EFEBE0; /* alternating section / footer */
  --card:         #FAF9F4; /* card surface, slightly lifted */
  --rule:         #1F1E1D1A; /* hairline borders, ~10% slate */

  /* Ink */
  --ink:          #191919; /* primary text */
  --ink-soft:     #3D3D3A; /* secondary text */
  --ink-muted:    #6B6A65; /* tertiary, captions, meta */

  /* Accent — used sparingly */
  --crail:        #CC785C; /* warm clay/coral — links on hover, key CTAs */
  --crail-deep:   #B8553B; /* pressed / active */
  --kraft:        #BFA98A; /* secondary muted accent for tags */

  /* Type */
  --font-serif:   'Fraunces', 'Tiempos Text', Georgia, 'Times New Roman', serif;
  --font-sans:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

**No dark mode in v1.** Remove the `data-theme` toggle and the `light`/`dark` variable blocks. Anthropic's site is single-theme; the redesign should be too. Delete the `#themeToggle` button from every page header and the related JS in `script.js`.

If a dark mode is added later, it should mirror the paper feel (deep ink background, warm off-white text), not the current neon scheme.

---

## 4. Typography

Load these from Google Fonts in place of the current Inter Tight / Inter / JetBrains Mono trio:

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Fraunces is the practical stand-in for Anthropic's Tiempos/Styrene-Serif feel: warm, slightly humanist, excellent at large sizes. Use the variable `opsz` axis so display sizes get the proper optical weight.

**Type scale (desktop → mobile clamps):**

| Token | Use | Spec |
| --- | --- | --- |
| `--t-display`  | Hero h1                | `clamp(2.75rem, 5.5vw, 4.75rem)` Fraunces 500, line-height 1.05, letter-spacing -0.02em |
| `--t-h1`       | Page h1                | `clamp(2.25rem, 4vw, 3.25rem)` Fraunces 500, lh 1.1 |
| `--t-h2`       | Section heading        | `clamp(1.625rem, 2.4vw, 2.125rem)` Fraunces 500, lh 1.2 |
| `--t-h3`       | Card / sub heading     | `1.25rem` Fraunces 500, lh 1.3 |
| `--t-eyebrow`  | All-caps section label | `0.75rem` Inter 500, letter-spacing 0.12em, uppercase, color `--ink-muted` |
| `--t-lead`     | Intro paragraph        | `clamp(1.125rem, 1.6vw, 1.375rem)` Inter 400, lh 1.55 |
| `--t-body`     | Body                   | `1.0625rem` (17px) Inter 400, lh 1.65 |
| `--t-meta`     | Meta, captions         | `0.875rem` Inter 500, color `--ink-muted` |
| `--t-mono`     | Code, kbd              | `0.875rem` JetBrains Mono 400 |

Body copy uses Inter. **All headings (h1–h3) use Fraunces.** Eyebrows above sections use uppercase Inter — they stand in for Anthropic's small-caps label style. Body should have `font-feature-settings: "ss01", "cv11";` enabled on Inter for the more humanist forms.

---

## 5. Layout & spacing

- Container max-width: **1120px**. Add a wider variant `--container-wide: 1280px` for hero/feature sections.
- Outer page padding: `clamp(20px, 4vw, 48px)`.
- Section vertical padding: `clamp(64px, 9vw, 128px)`.
- Grid gutter: `32px` desktop, `20px` mobile.
- 12-column implicit grid is fine; use CSS grid with `repeat(12, 1fr)` only where asymmetric layouts help (about page, current work).
- Hairline rules (`1px solid var(--rule)`) separate major sections — these are part of the editorial feel. No card borders should glow or animate.

---

## 6. Components

### 6.1 Header / nav

- Background: `--paper` (no transparency, no blur).
- A single hairline rule along the bottom edge.
- Brand: drop the two-line "name + tagline" treatment. Use just the name in Fraunces 500 at ~20px. Tagline moves to the homepage hero.
- Nav links: Inter 500 at 15px, color `--ink-soft`. On hover: color flips to `--ink`, with a 1px underline that animates in from the left over 180ms. Active page: solid underline.
- Right side: a single `Get in touch` link styled as the primary button (see 6.5). No theme toggle.
- Sticky on scroll, but **no shrink animation** — height stays constant.

### 6.2 Hero (index.html)

- Replace the current "Projects" h1 with a confident editorial hero:
  - Eyebrow: `PORTFOLIO — 2026`
  - Display headline: a single declarative sentence about the work, e.g. *"Building AI systems that explain themselves."* Use the `--t-display` token. Max-width ~18ch so it wraps into 2–3 lines.
  - Lead paragraph below at `--t-lead`, max-width ~58ch, color `--ink-soft`.
  - Two CTAs side-by-side: primary (`View projects` → scrolls to grid) and secondary (`Read about me` → about.html).
- Hero spans the full container width with generous top/bottom padding (`128px` desktop). No background image, no gradient — just paper.

### 6.3 Project cards (the grid on index.html)

Anthropic uses calm, almost archival cards. Aim for that.

- Card surface: `--card`, hairline border `1px solid var(--rule)`, radius `10px`. **No drop shadow.** On hover: border deepens to `#1F1E1D33`, card translates up `2px` over 200ms ease-out.
- Image area at the top, full-bleed within the card, aspect ratio `16/10`, `object-fit: cover`, slight desaturation by default (`filter: saturate(0.85);`) that returns to full saturation on card hover.
- Below the image, padding `28px`:
  - Eyebrow row: small all-caps tag pills (max 3 visible, "+N" overflow). Pills are `--ink` text on transparent background with a hairline border, `4px 10px` padding, `999px` radius. No fill color.
  - h3 title in Fraunces 500.
  - 2–3 line description in `--t-body`, color `--ink-soft`. Clamp to 3 lines (`-webkit-line-clamp: 3`).
  - Footer row: meta (year / role) on the left in `--t-meta`; an arrow-link on the right (`Read more →`) that slides the arrow `4px` right on hover.
- Grid: `repeat(auto-fill, minmax(340px, 1fr))`, `gap: 32px`.
- The "featured" first card may span 2 columns at desktop with a larger image — pick the most substantive project for this slot.

### 6.4 Search & filter controls

- Search input: full-width on its own row, `1px` bottom border only (no box), Fraunces-adjacent placeholder in `--ink-muted`. Icon to the left in `--ink-muted`. On focus: bottom border thickens to 2px and shifts to `--crail`.
- Filter chips: same style as card tag pills. Active chip fills with `--ink` and uses `--paper` text. Avoid using `--crail` as a fill — keep it for links and primary CTAs.

### 6.5 Buttons

Two variants only.

- **Primary:** `background: var(--ink); color: var(--paper);` border-radius `999px`, padding `12px 22px`, Inter 500 at 15px. Hover: background shifts to `--crail-deep`. Active: background `--crail`. No shadow.
- **Secondary:** transparent background, `1px solid var(--ink)`, `color: var(--ink)`. Hover: background `--ink`, color `--paper`.
- Inline text links in body copy: `color: var(--ink); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px;`. On hover, color shifts to `--crail` and the underline thickens to 2px. **This is the only place `--crail` appears as text color.**

### 6.6 Modal (project detail)

- Backdrop: `rgba(25, 25, 25, 0.4)` — warm, not black.
- Card: `--card` background, max-width 720px, radius `12px`, padding `40px`. Hairline border. Title in Fraunces.
- Close button: text `Close` with an `×` glyph, top-right, styled as a secondary button at smaller size.
- Open/close motion: 180ms ease-out on opacity + 8px translate. No scale.

### 6.7 Footer

- Background: `--paper-deep` to subtly demarcate from page body.
- Top hairline rule.
- Three columns at desktop, stacks at mobile:
  1. Name + one-line bio in `--ink-soft`.
  2. Nav (mirrors header).
  3. Social links — text only, underlined on hover. No icons.
- Bottom row: copyright in `--t-meta`, plus a small "Built by hand in 2026" right-aligned.

---

## 7. Page-specific direction

### index.html
Hero (6.2) → controls (6.4) → grid (6.3). Drop the "AI • RAG • XAI • Multi-Agent Systems" tagline from the brand and re-use it as the lead under the hero headline.

### about.html
Two-column editorial layout at desktop (`grid-template-columns: 5fr 7fr`, gap `64px`). Left: portrait photo (`me.png`) at full column width, with a small caption below in `--t-meta`. Right: long-form prose. Use real h2s to break the bio into sections (e.g. *Background*, *What I'm thinking about*, *Outside of work*). Body in `--t-body` with `max-width: 65ch`. Drop-cap optional but tasteful: first paragraph's first letter in Fraunces at `4.5rem`, floated, with proper baseline alignment.

### current.html
This is where the editorial style shines. Treat each ongoing project as a "field note":
- Eyebrow with date range (`APR 2026 — PRESENT`).
- h2 title.
- Lead paragraph.
- Optional inline image, full container width, with a small italic caption.
- Body prose.
- A horizontal rule (`<hr>` styled as a hairline) between entries, with `96px` vertical spacing.

### experience.html
Resume-style timeline. Each role is a row in a 2-column layout: left column (3fr) holds the date range as `--t-meta`; right column (9fr) holds the role, company, and 2–4 bullet accomplishments in body type. Hairline between rows. No icons, no logos.

### contact.html
Simple, generous. Centered single column, max-width 540px. Hero h1 (`Get in touch.`), lead paragraph, then a list of contact methods rendered as large text links (Fraunces 500 at h3 size) — each on its own line, with a small `--t-meta` label above (`EMAIL`, `LINKEDIN`, `GITHUB`, `X`). No form in v1.

---

## 8. Motion

Keep a single shared transition token: `--ease: cubic-bezier(0.2, 0.6, 0.2, 1);` and `--dur: 200ms;`.

- All hover transitions use these.
- Page-load: a single 320ms opacity fade on `<main>` is fine. Nothing else animates on load.
- Respect `prefers-reduced-motion: reduce` — disable all transitions and translates.

---

## 9. Accessibility

- Maintain the existing skip-link pattern (add one if missing) — `Skip to content` link, visually hidden until focused, lands on `#main`.
- All headings in document order, no skipped levels.
- Focus rings: `outline: 2px solid var(--crail); outline-offset: 3px;` on all interactive elements. Do not remove default outlines without replacing them.
- Tag pills, filter chips, and the close button must have `aria-pressed` / `aria-label` as appropriate (most of this is already in the existing markup — preserve it).
- Body text contrast ratio against `--paper` must be ≥ 7:1 (passes AAA at the chosen `--ink`).

---

## 10. JavaScript changes

`assets/script.js` currently handles: theme toggle, year stamping, project rendering from `projects.json`, search/filter, modal.

Required edits:
1. Remove the theme-toggle code path entirely (the button is gone).
2. Project rendering: update the card template string to match the new card structure in 6.3 (eyebrow tags row, image-first, arrow link in footer).
3. Filter chip rendering: update class names / structure to match 6.4.
4. Modal: update inner template to the new typography and structure.
5. Keep `projects.json` as the single source of truth — do not hardcode project data into HTML.

Do not introduce a framework, bundler, or TypeScript. Plain ES module-free script, same as today.

---

## 11. Implementation order

Suggested sequence — each step should leave the site in a working state.

1. **Tokens & typography.** Replace `:root`, swap font imports, set base body styles. Site will look unstyled in places — that's expected.
2. **Header & footer.** Get the chrome right first; it sets the tone.
3. **Index hero & buttons.** Establish the hero pattern; reuse on other pages.
4. **Project cards & grid.** Most visible component; iterate until it feels editorial.
5. **Search / filter controls.**
6. **Modal.**
7. **About, Current, Experience, Contact** — apply the established patterns.
8. **Pass for motion, focus states, reduced-motion.**
9. **Accessibility audit** — keyboard tab order, contrast, screen-reader labels.
10. **Remove dead code** — old theme toggle, old CSS variables, unused classes.

---

## 12. What "done" looks like

- Open the site with no preconceptions and the first impression is *publication*, not *product demo*.
- A reader could screenshot any page, drop it into a magazine layout, and it would not look out of place.
- The accent color appears on roughly 1–3% of the visible pixels at any time.
- There are no glows, neon strokes, glassmorphism panels, gradient text, or animated backgrounds anywhere on the site.
- Every page renders cleanly at 360px, 768px, 1024px, and 1440px viewports without horizontal scroll or layout breakage.

If something in this spec conflicts with making the site feel calmer and more editorial, the calmer choice wins.
