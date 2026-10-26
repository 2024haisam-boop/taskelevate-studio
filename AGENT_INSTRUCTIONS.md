# AGENT INSTRUCTIONS — Taskelevate Studios

> Every agent (human or AI) working on this project MUST read this file first.
> This project is built in relay: when one agent runs out of usage, the next one
> continues. These rules make the hand-off seamless.

---

## 1. Read order (do this before touching any code)

1. **`AGENT_INSTRUCTIONS.md`** (this file) — the rules.
2. **`PLAN.md`** — architecture, design decisions, and the master checklist with status.
3. **`LOG.md`** — read the **latest 2–3 entries** at minimum. They tell you exactly
   where the previous agent stopped and what's next.
4. **`docs/BRIEF.md`** — the full, original client brief (the "Master Build Directive").
   It is the source of truth for copy, design tokens, and requirements. Read the
   section relevant to what you're working on.
5. **`ASSETS_NEEDED.md`** — what the business still needs to supply.

## 2. Logging rules (mandatory)

- After every meaningful unit of work (a component, a section, a fix, a test run),
  **append an entry to `LOG.md`**. Never rewrite or delete previous entries.
- If you are about to run out of usage/context, **stop and write a LOG entry first**
  with a precise "NEXT STEPS" list. A half-finished feature with a good log is better
  than a finished feature nobody can find.
- Use this template:

```md
## [YYYY-MM-DD HH:MM] — <Agent name/model> — <short title>
**Status:** in-progress | done | blocked
**What I did:**
- ...
**Files touched:**
- `src/...`
**Verified:** (what you actually ran: tsc / eslint / build / browser QA — with real results)
**Known issues:**
- ...
**NEXT STEPS:**
1. ...
```

- Update the checklist in **`PLAN.md` §6** when a step changes status
  (`[ ]` todo → `[~]` in progress → `[x]` done).
- If you make an architectural decision, add it to **`PLAN.md` §4 Decisions** with a reason.

## 3. Non-negotiable project rules (from the brief)

- **Never fabricate** client names, testimonials, reviews, statistics, awards, case-study
  outcomes, or portfolio projects. Placeholders must be **clearly labelled as examples**.
- **Never redraw, recolor, or geometrically modify the Taskelevate logo icon.** Use the
  real files in `public/brand/`. Effects around it may be CSS/SVG only.
- **Never create dead CTAs.** Every button/link must have a genuine destination.
  Booking button only renders when `NEXT_PUBLIC_BOOKING_URL` is configured.
  Social links only render when their URLs are configured.
- **Never pretend the contact form succeeded** when email delivery isn't configured.
- **Project location: `~/Developer/taskelevate-studio`** (moved here on 2026-10-22).
  Keep it OUT of iCloud-synced folders (Desktop/Documents): macOS "Optimize Mac Storage"
  offloaded the files to iCloud and the dev server hung reading them. The old copy at
  `~/Desktop/vibe code/Taskelevate agency web/taskelevate studio/` is superseded — don't edit it.
- **Do not touch the parent site.** `~/Desktop/vibe code/Taskelevate agency web/` contains the
  existing taskelevate.com site and archives. Do not edit, move, or delete anything there.
- Forbidden visuals: chrome knots, twisted ribbons, torus sculptures, random floating
  spheres, glowing blobs, constant spinning objects, heavy particles, digital rain,
  fake terminals/loaders, generic purple gradient heroes, neon overload, glass on
  everything, scroll-jacking. (Full list: `docs/BRIEF.md` §03.)
- Respect `prefers-reduced-motion` in every animation.
- Mobile is as important as desktop. Test at 320px wide minimum. No horizontal scroll.
- **Smooth on iPhone (Safari renders filters and text shadows on the CPU):** per scroll frame, write only
  `transform` / `opacity` (or WebGL uniforms); never animate SVG `filter: url()`, `text-shadow`, `blur()` or
  gradients on large elements — the hero copy warps on the GPU (`lib/gl/heroCopy.ts`) for this reason. No
  non-passive `touchmove`/`wheel` listeners except for the moment they must block (HeroStory's glide). Scroll
  handlers do nothing while their section is off screen (IntersectionObserver), read layout first, write after,
  and skip writes that don't change. Chrome headless can't show Safari's cost — reason about it, then verify.

## 4. Code conventions

- **Next.js App Router + TypeScript strict.** Server components by default; add
  `"use client"` only where interaction/animation requires it.
- **Content lives in `src/data/`** (projects, services, navigation, site-config).
  Pages/components must not hard-code content that belongs in data files.
- Styling: **Tailwind CSS v4** (CSS-first config in `src/app/globals.css` → `@theme`).
  Design tokens are defined there — use them, don't invent new hex values.
- Animation ownership: **GSAP** owns scroll-scrubbed timelines (ScrollTrigger),
  **CSS** owns entrance reveals + micro-interactions, **Motion** is used only for React
  layout/presence animation (work filter grid, form states). Never let two systems
  animate the same property on the same element. Always clean up ScrollTriggers
  (`gsap.context().revert()` / `useGSAP`).
- **Home page = v4 editorial** (`components/landing/`, read `docs/REDESIGN-v4.md` first). Light theme site-wide;
  wrap dark media panels in `.theme-dark`. Keep the PhysicsChips (client likes them).
- **3D (Three.js / R3F)** lives in: the v3 home **WORLD** (kept but not mounted: `components/world/` + DOM acts in
  `components/experience/`, CSS in `docs/archive/home-v3-world.css`, see `docs/REDESIGN-v3.md`), the Creative Engine
  "3D" mode and the 3D Animation service hero. Always dynamically imported, `ssr: false`, paused off-screen, with a
  non-WebGL fallback. ONE WebGL canvas per page. The whole home camera path is in `world/CameraRig.tsx`; world
  geometry constants in `world/layout.ts`; never import three.js into DOM components (use `world/world.ts`).
  Visual QA of the journey: `node scripts/qa-journey.mjs <outdir> [WxH] [--url=…]` (one headless Chrome).
- **Media** lives in `src/data/media.ts` + `public/media/`. Studio footage is recorded from `/lab` with
  `scripts/record-all-clips.sh` (dev server on :3000). Never label studio renders as client work.
- Imports use the `@/` alias → `src/`.
- Keep components small and focused; no monolithic page files.

## 5. Commands

Run from inside `taskelevate studio/`:

```bash
npm install          # install deps
npm run dev          # local dev → http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # production build
npm run start        # serve production build
npm run check        # typecheck + lint + build (run before claiming "done")
```

## 6. Definition of done (for any task)

1. `npm run check` passes (typecheck, lint, build) — paste real results in LOG.md.
2. Visually checked in a browser at mobile (375px) and desktop (1440px) if UI changed.
3. Reduced-motion behaviour considered.
4. LOG.md entry written; PLAN.md checklist updated.
5. Do **not** report a feature as complete if it is a placeholder. Say so explicitly.
