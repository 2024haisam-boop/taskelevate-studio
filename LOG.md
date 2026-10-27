# LOG — Taskelevate Studios

> Append-only work log. Newest entries at the **bottom**. Never delete entries.
> Template + rules: `AGENT_INSTRUCTIONS.md` §2.

---

## [2026-10-21 15:10] — Claude (Opus 5.5) — Project kickoff
**Status:** in-progress
**What I did:**
- Inspected environment: Node 24.15, npm 11.12, ffmpeg + Python PIL available, no git repo in parent.
- Found the REAL Taskelevate logo files in the parent site's `public/`:
  `logo.png` (256² icon, transparent), `logo-header.png` (800×266, dark "Task"),
  `logo-footer.png` (800×266, WHITE "Task" + purple "elevate" — the dark-background version the brief asks for).
- Created project folder `taskelevate studio/` (name per client request).
- Wrote coordination docs: `AGENT_INSTRUCTIONS.md`, `PLAN.md`, `LOG.md`, `docs/BRIEF.md` (full original brief).
- Verified current npm versions + peer ranges; pinned a compatible stack (see PLAN.md §2).
**Files touched:**
- `AGENT_INSTRUCTIONS.md`, `PLAN.md`, `LOG.md`, `docs/BRIEF.md`
**Verified:** n/a (docs only)
**Known issues:** none yet
**NEXT STEPS:**
1. S1: write package.json/configs, `npm install`.
2. Copy logo files into `public/brand/` (unchanged), generate favicon/apple icon from the real icon.
3. S2: globals.css tokens, fonts, layout.

## [2026-10-21 15:45] — Claude (Opus 5.5) — S1–S4: init, design system, logo, glass nav, hero
**Status:** done (S1–S4), moving to S5
**What I did:**
- S1: package.json (pinned exact versions), tsconfig (strict + noUncheckedIndexedAccess), next.config.ts
  (turbopack.root + outputFileTracingRoot pinned to this folder; security headers), postcss, eslint flat config, .gitignore.
  `@hookform/resolvers@6` had an npm peer conflict → pinned 5.9.2 (supports zod 4).
  `npm audit`: 5 high, all dev-only (eslint-config-next → fast-glob → micromatch → braces; no patched version exists). Not shipped.
- Brand: copied REAL logos to `public/brand/source/` (untouched originals) + pure crops in `public/brand/`
  (`taskelevate-logo-white.png` 789×228, `taskelevate-logo-dark.png`, `taskelevate-icon.png`).
  `src/app/icon.png` = original icon; `apple-icon.png` + `favicon.ico` = icon scaled/centred only.
  Fonts for OG image (OFL): `src/assets/fonts/*.woff` (from @fontsource via npm pack).
- S2: `src/app/globals.css` — tokens (@theme), fluid display scale (sized from MEASURED glyph advances of
  Space Grotesk Bold), liquid-glass system (.glass/.glass-strong/.glass-subtle + edge reflection + cursor glow +
  no-backdrop fallback + reduced-transparency), buttons, reveal system, hero CSS timeline, page transition.
- Data: `src/data/{site-config,services,projects,navigation}.ts` (all exact brief copy; 8 projects are `isExample`).
- S3: `BrandLogo` (inline / stacked / icon usages), `Navbar` (floating capsule, scroll state, sliding liquid pill),
  `ServicesDropdown` (disclosure pattern, hover intent, arrow-key nav, Escape), `MobileMenu` (inert background,
  scroll lock, Escape/outside/route-change close), `Footer` (configured links only, giant low-contrast wordmark).
- S4: `Hero` + `KineticHeadline` (server-rendered split glyphs, sr-only sentence, CSS timeline 0→1.6s with sweep).
- Infra: RevealObserver (single IO for all [data-reveal]), GlassPointerTracker, AttributionCapture (UTM → sessionStorage),
  AnalyticsScripts (none/plausible/ga4+consent banner), TrackView, template.tsx page transition (client navs only).
**IMPORTANT gotchas found:**
- Tailwind v4 uses individual `translate`/`scale` CSS properties → use `transition-[translate,scale,opacity]`, not `transform`.
- A `backdrop-filter` element is a backdrop root: glass nested in glass won't blur the page. The nav's glass is
  therefore a background `<span>` layer, not on `<nav>` itself. Fade opacity on the glass element itself, not a parent.
- Unlayered CSS beats Tailwind utilities — custom classes that utilities must override go in `@layer components`.
- Preview tool needs `../.claude/launch.json` (session root). Added configs `studio-dev` (port 3100) & `studio-prod` (3200).
**Verified:** dev server renders hero + nav + footer at 1440 and 375 (screenshots), no horizontal overflow at 375.
**NEXT STEPS:**
1. S5: SelectedWork + ProjectCard/ProjectArt, ServicesSection, ProcessSection, StudioSection, ContactCTA.
2. S6: CreativeEngine (SaaS/Web/Motion in CSS 3D, Product in R3F) — S7 SpatialExperience.

## [2026-10-21 17:05] — Claude (Opus 5.5) — S5–S7: homepage sections, Creative Engine, Spatial Experience
**Status:** done (S5–S7), moving to S8
**What I did:**
- S5: `ProjectArt` (8 generated SVG placeholder compositions; full-bleed backdrop + "meet" composition so any tile
  aspect works), `ProjectCard`, `HoverVideo` (fine pointers only), `ProjectFilters` (toggle group + sliding indicator),
  `ProjectGallery` (Motion layout/exit on outer li only; CSS reveal on inner), `SelectedWork`, `ServiceRows`
  (cursor-follow preview desktop / inline preview mobile), `ServicesSection`, `ProcessTimeline` (GSAP scrub, h/v rails),
  `StudioSection` (proof blocks hidden until real data), `ContactCTA` (+ `AmbientLight` via @property --lx/--ly),
  `BookingLink` (renders only with NEXT_PUBLIC_BOOKING_URL), `ButtonLink`, `GlassMediaControls`, `GlassTooltip`.
- S6: `three/CreativeEngine` (tablist w/ roving tabindex; all 4 panels always mounted, inactive = inert; rAF pointer
  parallax → CSS vars; live coordinate readout; global pause; pauses off-screen/hidden tab), `SaaSScene`, `WebScene`,
  `MotionScene` (timecode synced to the real CSS animation clock via WAAPI), `engine.module.css` (cqw units),
  `ProductStage` (WebGL detect, chunk prefetch near viewport, mount on first 3D select, touch drag, static fallback),
  `ProductScene` (R3F: custom lathe/rounded-box camera; wireframe/clay/final via clipping-plane scan + material lerp;
  Lightformer env, blob shadow, PerformanceMonitor DPR, disposal).
- S7: `SpatialExperience` + `spatial.module.css` — sticky stage over a 240–300vh native-scroll track, GSAP scrub through
  5 stages, explore controls (depth slider, layer focus, tilt, reset), working accent swatches, skip link, reduced-motion final state.
- QA tool: `scripts/qa-screenshot.mjs` (headless Chrome via CDP, no deps) — full-res screenshots + overflow metrics.
**Verified:** `tsc --noEmit` passes. Headless-Chrome screenshots at 1440×900: hero, all sections, engine 3D mode in
all three representations (WebGL renders), spatial sequence at 5 scroll positions. docWidth == viewport (no x-overflow).
Fixed: hydration mismatch (float rounding in SVG), chart line (pathLength+non-scaling-stroke bug → clip-path reveal),
marker overlap, art cropping in portrait tiles, product proportions/lighting, spatial framing.
**Known issues:** footer logo is lazy (doesn't appear in non-scrolled full-page captures — expected).
**NEXT STEPS:**
1. S8: /work, /work/[slug], 4 service pages (ServicePageTemplate + signature visuals), /about, /privacy, /terms.
2. S9: /contact form + /api/contact (Zod, honeypot, rate limit, Resend) + attribution.
3. Lint/build, mobile QA (320–430), reduced motion, keyboard.

## [2026-10-21 18:10] — Claude (Opus 5.5) — S8–S9: pages, contact backend, SEO; first green build
**Status:** done (S8, S9), now QA (S10–S11)
**What I did:**
- S8: `PageHero` (CSS entrance h1 for LCP), `ServicePageTemplate` (hero+signature visual, description, deliverables,
  work, process, FAQ (native details), CTA, related services, Service + FAQPage JSON-LD), 4 service routes,
  signature visuals: `SceneViewport` (SaaS/Web CSS-3D), `ProductShowcase` (R3F), `EditScene` (program monitor with
  real 16:9/9:16/1:1 reframing + multi-track timeline). `/work` (filters, ?category= deep link, loading skeleton),
  `/work/[slug]` (SSG, dynamicParams=false, examples are noindex + flagged, optional sections vanish),
  `/about`, `/privacy`, `/terms` (accurate to what the code does — needs legal review), `not-found`, `error`.
- S9: `lib/forms/inquiry-schema.ts` (shared Zod 4 schema), `delivery.ts`, `rate-limit.ts` (memory / Upstash REST,
  hashed IPs), `email.ts` (escaped HTML + text), `app/api/contact/route.ts` (same-origin check, size cap, rate limit,
  Zod, honeypot + timing trap, 503 when Resend env missing, idempotency map + Resend idempotencyKey),
  `ProjectInquiryForm` (RHF + zodResolver, chip radios, inline errors, honeypot, attribution, success/error/unavailable states),
  `/contact` page. SEO: robots.ts, sitemap.ts (excludes example projects), opengraph-image.tsx (real logo + OFL fonts).
  `.env.example` documented. Consent now via useSyncExternalStore.
**Verified:** `tsc` 0 errors · `eslint .` 0 problems · `next build` ✓ (26 routes; all static except /api/contact).
**NEXT STEPS:** browser QA of all pages at 320/375/768/1440, form + API behaviour, menus/keyboard, reduced motion; docs.

## [2026-10-21 19:20] — Claude (Opus 5.5) — S10–S12: QA, performance, accessibility, docs — v1 COMPLETE
**Status:** done
**What I did:**
- Layout QA: `scripts/qa-matrix.mjs` (12 routes × 10 brief viewports, overflow + clipped-headline detection).
  Fixed: FAQ/process headings clipping at 1024–1280 (display-xl now scales 9.2vw ≥ lg), Studio column width,
  spatial sticky box (`min-h` + `overflow-x-clip` so controls are reachable on 320×568), nav label threshold, mobile toast.
- Interaction QA (live browser): mobile menu (focus moves in, Escape returns focus, link closes, inert + scroll lock,
  route change closes), Services dropdown keyboard (ArrowDown/arrows/End/Escape), engine tablist arrows/End,
  UTM capture on a service page → preserved to /contact → included in the API payload. Fixed: visibility transition
  blocked focus on open; rAF-based focus didn't run in background tabs → setTimeout.
- Form/API QA (curl): 422 validation w/ field messages · honeypot → silent 200 · no Resend env → 503 · cross-origin
  → 403 · bad JSON → 400 · GET → 405 · 6th request/IP → 429 + Retry-After. Client shows honest unavailable state.
- Fallbacks: no-WebGL (Chrome `--disable-3d-apis`) → static product preview, toggle still works. Reduced motion → hero
  visible immediately, spatial final state.
- Performance (real Lighthouse 12, production build, localhost — see table): deferred three.js prefetch, lazy GSAP,
  LazyMotion, zod/mini, preloaded single-weight mono font, pre-hydration reveal, deferred 3D page WebGL mount.
- A11y: footer inline link underline (link-in-text-block), swatch targets ≥ 26px, stage list contrast (no opacity dimming).
- Glass components completed: GlassSurface, GlassPanel, GlassContactPanel, GlassProjectPanel, GlassButton, GlassTooltip (used on engine pause).
- Docs: README.md, docs/DEPLOYMENT.md (Vercel, CNAME for `studio` only, SSL/CAA, Resend DNS), ASSETS_NEEDED.md,
  public/brand/README.md, media folder READMEs, .env.example. OG image fixed (label overlap).
**Verified (real results):**
- `npm run check` → tsc 0 errors · eslint 0 problems · `next build` ✓ 26 routes (all static except /api/contact)
- qa-matrix: 120/120 combinations — no horizontal overflow; no clipped headlines in settled state
- Lighthouse (mobile, simulated throttling): / 89–90 · /work 92 · /services/* 94 · /about 95 · /contact 94 ·
  example case study 94 (SEO 66 by design: example pages are noindex). Accessibility 100, Best Practices 100,
  SEO 100 on all indexable pages. Desktop: /, /services/3d-animation, /contact → 100/100/100/100. CLS 0 everywhere.
  Observed (unthrottled) LCP 90–150 ms on localhost.
- Dev console clean (no hydration warnings) after full scroll on / and /about.
**Not verified / limits:**
- Real Safari/iOS devices (no tooling) — svh/dvh, safe-area insets and backdrop-filter fallbacks are implemented but untested on iOS.
- Real email delivery (needs Resend key + verified domain). Vercel deployment/DNS (needs account access).
- Lighthouse numbers are localhost; production CDN numbers will differ — re-run after deploy.
**NEXT STEPS (for the business / next agent):**
1. Supply items in ASSETS_NEEDED.md (projects, Resend, Calendly, socials, showreel, vector logo).
2. Deploy per docs/DEPLOYMENT.md; add env vars; verify the form end-to-end on production.
3. Replace `isExample` projects with real case studies; re-run `node scripts/qa-matrix.mjs` + Lighthouse.
4. Optional polish: test on physical iPhone/Android; consider Upstash for distributed rate limiting.

## [2026-10-22 12:00] — Claude (Opus 5.5) — Moved project out of iCloud; dev server restored
**Status:** done
**What happened:** `npm run dev` hung with no output (user saw ERR_CONNECTION_REFUSED on localhost:3000). Diagnosis:
the Desktop is synced to iCloud Drive with "Optimize Mac Storage", and the disk is 92% full (18 GB free), so macOS
had evicted 109/137 source files and 34,688/34,692 node_modules files to iCloud (`stat` flags `compressed,dataless`).
Node blocked in `pread()` waiting for iCloud downloads. (The user's own terminal was also running `npm run dev` in the
PARENT folder — that's the old taskelevate.com site, not this one.)
**What I did:**
- Forced downloads of the project files (parallel reads), waited until 0 dataless files remained.
- `rsync` to `~/Developer/taskelevate-studio` (excluding node_modules/.next) — 140 files, `diff -rq` identical, 0 dataless.
- `npm ci --prefer-offline` (438 packages, 5 s from local cache). `npm run check` ✓. Dev server on :3000 ✓ (all pages 200).
- Updated AGENT_INSTRUCTIONS.md, PLAN.md (#12), README.md, docs/DEPLOYMENT.md with the new location.
- Left `MOVED.md` in the old Desktop folder; updated the preview `launch.json` in the parent `.claude/`.
**Notes:** eslint 9.39 now reports "no longer supported" at install — upgrade to ESLint 10 once eslint-config-next's
plugins support it. The old Desktop copy can be deleted by the user once they're happy (not done — their call).
**NEXT STEPS:** continue with the user's enhancement prompt from `~/Developer/taskelevate-studio`.

## [2026-10-24 12:30] — Claude (Opus 5.5) — v2 "3D & alive" redesign: research started
**Status:** in-progress
**User request (2026-10-24):** the site feels "text only". Wants a SHORT but playful, alive, 3D, award-level site that's
easy to understand: scroll makes things grow/shrink, text reveals, service cards reveal, a "popup rotator", a 3D
**video gallery shaped like a well / cylinder of moving videos**, moving 3D elements; responsive + fast. Asked for deep
research + reverse-engineering of top award sites, then implementation. This OVERRIDES the original brief's
"typography-only hero / no 3D in hero" rule — 3D must still be meaningful (show work), not random blobs.
**Research so far:** Awwwards SOTY 2025 = Messenger (abeto) + Lando Norris (OFF+BRAND); 2026 standouts: Lusion,
Active Theory, Noomo, makemepulse, Igloo Inc. Common pattern: the site is a 3D space you scroll through.
**Gotcha:** running several headless Chromes on heavy WebGL sites in parallel ran out of memory (exit 137) and the
app quit. Capture ONE site at a time.
**NEXT STEPS:** finish visual reverse-engineering (sequential), write docs/REDESIGN.md blueprint, then build.

## [2026-10-24 14:10] — Claude (Opus 5.5) — v2: blueprint + media pipeline done
**Status:** in-progress (building the new homepage next)
**What I did:**
- `docs/REDESIGN.md` — research summary + new 7-beat homepage blueprint (THE WELL hero, statement reveal, showreel
  zoom, services stack, work rail, velocity marquee, physics CTA) + perf budget. READ THIS before touching the home page.
- Media pipeline: `src/app/lab/` (dev-only fullscreen scene stage, 404 in prod unless ENABLE_LAB=1),
  `scripts/record-clip.mjs` (headless Chrome real-time capture → ffmpeg H.264; `--mode=virtual` stalls on dev HMR,
  use `--mode=realtime`; needs ~10 s warmup in a fresh profile), `scripts/record-all-clips.sh` (all 6 clips).
  Output: `public/media/clips/*.mp4|jpg` (60–270 KB each) + `public/media/reel/studio-reel.mp4` (37 s, 1.1 MB, xfade montage).
  Manifest: `src/data/media.ts` (kind "studio-render" vs "client-work").
- ProductStage/ProductScene: controlled `view` + `zoom` props.
- **Bug fixed (affects live site):** `.page-enter` (template.tsx) animated `transform`; an identity transform on the
  wrapper turns every `position:fixed` descendant into wrapper-relative (collapsed to 0×0). Now opacity-only, fill backwards.
- **Integrity flag:** the 10 screenshots in the parent site's portfolio include major brands (L'Agence, Premiata,
  Shop Horne…). Ownership unconfirmed → copied to `assets-src/websites/` (NOT public) until the user confirms.
**NEXT STEPS:** build `components/well/*` (R3F cylinder of video panels + scroll dive), then statement, reel zoom,
services stack, work rail, marquee, physics CTA, custom cursor; swap home page; QA + Lighthouse.

## [2026-10-24 16:20] — Claude (Opus 5.5) — v2 homepage built (7 beats)
**Status:** in-progress (QA/perf next)
**What I did:** new `src/app/page.tsx` = WellHero → Statement → ShowreelZoom → ServiceStack → WorkRail → VelocityMarquee → PlayCTA.
- `components/well/` — `WellScene` (R3F: 3 rows × 9 curved screens on one shared CylinderGeometry, 6 shared VideoTextures
  from 512px `-sm` clips with mipmaps, custom shader `wellShader.ts`: rounded-corner discard, inside/outside UV flip,
  violet rim, depth fog, exposure ramp; scroll dives the camera inside; drag inertia; hover pop; click → service page),
  `WellHero` (sticky track, CSS-var-driven headline grow/fade, "Step inside the work", poster-ring fallback).
- `components/home/` — `Statement` (word-by-word light-up + inline video pills, fixed footprint → no reflow),
  `ShowreelZoom` (card → fullscreen via transform, rotating badge, <dialog> player), `ServiceStack` (sticky stacking
  cards, opacity overlay dimming), `WorkRail` (vertical-scroll-driven horizontal track desktop / snap swipe mobile,
  coverflow rotateY via --o), `VelocityMarquee` (skew from scroll velocity), `PlayCTA` (Matter.js chips, lazy, drag only
  when the gesture starts on a chip).
- `components/ui/` — `CustomCursor` (+ `setCursor()` for WebGL labels, `data-cursor` attr), `InViewVideo`, `RotatingBadge`;
  `hooks/useScrollProgress`. Projects got a `clip` field. Old home sections kept (not deleted) for other pages.
**Bugs hit & fixed:** rows lost their y-offset after a refactor → z-fighting stripes (now declarative `position`);
video moiré in small screens → `-sm` clips + mipmaps.
**Verified:** tsc ✓ eslint ✓; headless captures at 1440: hero rest / mid-dive / inside, statement, reel small/full,
services stack, work rail, CTA physics pile.
**NEXT STEPS:** mobile QA (390/320), layout matrix, build, Lighthouse, then report to user.

## [2026-10-25 10:30] — Claude (Opus 5.5) — v2 QA, perf & a11y — DONE
**Status:** done (v2 homepage live in dev)
**What I did:**
- Mobile QA at 390×844: hero well, statement, reel small/full, services stack, work rail (swipe), CTA physics — all good.
- `qa-matrix` (12 routes × 6 viewports incl. 320 & 1920): all clear (no x-overflow, no clipped headlines).
- Fixed: WorkRail CLS 0.75 (JS-chosen layout → CSS media queries), statement dim-word contrast (min 40% → ≥3:1 large
  text), marquee outline stroke contrast, reel button label-in-name, poster-ring becoming LCP (now no-WebGL only),
  physics drop starts at 60% visibility so visitors see it fall.
**Verified (real, localhost production build, Lighthouse 12):**
home desktop 100/100/100/100 · home mobile 87/100/100/100 (LCP sim 4.0 s, observed 95 ms; three.js now on home) ·
/services/3d-animation mobile 93/100/100/100 · /work mobile 92/100/100/100 · CLS 0 everywhere. tsc ✓ eslint ✓ build ✓.
`/lab` → 404 in production ✓.
**Open:** confirm which website screenshots in `assets-src/websites/` are genuinely Taskelevate builds (L'Agence,
Premiata, Shop Horne… are major brands) before showing any; replace studio-render clips with real client videos via
`src/data/media.ts`. Other pages (services/about/work detail) still use v1 styling — candidates for the v2 treatment.

## [2026-10-25 11:00] — Claude (Opus 5.5) — v3 "ENTER THE STUDIO" started
**Status:** in-progress
**User feedback:** hero is liked; the rest still feels "cheap". Wants a strategic, fully-3D journey: cinematic
entrance (light filament, glow, drop, zoom-out — "entering Taskelevate Studio") and a hooking, looping scroll.
**Plan:** `docs/REDESIGN-v3.md` — one fixed WebGL world for the whole home page; acts: intro gate → Well (hero) →
descent down the shaft (statement) → reel pool → studio chamber (services carousel) → gallery hall (work) → portal
finale (CTA) → "Re-enter" loop. v2 components stay in `components/home|well` until v3 is verified.
**NEXT STEPS:** world store + canvas + parts, DOM acts, intro gate, then QA/perf.

## [2026-10-25 15:40] — Claude (Opus 5.5) — v3 built, QA in progress
**Status:** in-progress (final checks + docs)
**What I did:** home page = `HomeExperience` (fixed WebGL world + scroll driver + intro gate + chapter rail + grain +
"Re-enter" loop) wrapping 6 acts in `components/experience/acts/` (Hero, Descent, Reel, Services, Work, Finale).
3D lives in `components/world/` — `world.ts` (three-free store/driver), `CameraRig.tsx` (whole camera path),
`parts/` (WellRows, Shaft, Pool, Studio, Portal, Dust), `shaders.ts`, `materials.ts`, `videoPool.ts`, `layout.ts`.
Head script in layout.tsx adds `intro`/`intro-short` + `intro-hold` (home only) and `data-world="off"` for reduced motion.
`scripts/qa-journey.mjs` = one-Chrome capture of the entrance + journey stops (`--no-webgl`, `--reduced-motion`, `--full`).
**Bugs fixed on the way:** parent effect reset the intro clock after the gate set it (camera stuck on a close-up);
shaft faded in too late on phones (now tied to `story.dive`); portal too close with 8 projects (PORTAL_Z derives from
project count); 3D text bands crossed the finale headline (moved below the ring); drop-shadow on the hero headline drew a
full-width band (removed); floor light strips ended in a hard edge (faded).
**Verified:** tsc ✓ eslint ✓ build ✓; screen click in the well → service page ✓; Re-enter loop ✓; no-WebGL fallback page ✓;
qa-matrix (5 viewports × 12 routes) all clear; Lighthouse prod home desktop 97/100/100/100, mobile 84/100/100/100
(observed LCP 75 ms; speed index is the cost of the ~2 s cinematic entrance).
**NEXT STEPS:** rebuild with latest polish, final captures, update PLAN/AGENT_INSTRUCTIONS, report to user.

## [2026-10-25 16:10] — Claude (Opus 5.5) — v3 "ENTER THE STUDIO" — DONE
**Status:** done (live in dev on :3000; prod build verified on :3200)
**Final checks:** `npm run check` ✓ (tsc, eslint clean, build); final prod captures desktop + 390 phone; PLAN decisions
20–24 and AGENT_INSTRUCTIONS updated for the world architecture.
**Open (unchanged):** real client videos to replace studio renders (`src/data/media.ts`); confirm which website
screenshots in `assets-src/websites/` are genuinely Taskelevate builds; inner pages still v1 styling.

## [2026-10-26] — Claude (Opus 5.5) — v4 editorial redesign (afternow.co format) — DONE
**Status:** done (dev :3000; prod build verified :3200)
**User request:** after v3 the user asked for "https://afternow.co/ same to same", then: keep the cool bits (physics chips).
**What I did:** studied afternow.co (headless captures desktop + phone, computed styles, structure) — it is a white,
editorial WordPress+GSAP site, not 3D. Rebuilt the format with our content: `docs/REDESIGN-v4.md`.
- Whole site → light theme: tokens, `.glass` → paper surface, mono pill `.btn`, `.chip` → mono tag, `label-mono`,
  editorial display sizes, sentence-case headlines (`toSentenceCase` in lib/utils/headline.ts converts the CAPS content),
  emphasis = quiet grey, `.theme-dark` scope for dark media panels, new Navbar/MobileMenu(menu sheet)/Footer,
  `.site-sheet` + sticky `.footer-reveal`, BrandLogo `tone` prop (dark artwork in header, white in footer).
- New home: `components/landing/*` (HeroReel, IntroStatement, WorkGrid, ApproachSlider, ServiceCards, PlayChips,
  StudioNotes, NewsToast, SectionHead, PillLink, RevealWords). PhysicsChips extracted to components/experience.
- v3 world code kept (unused); its CSS archived to docs/archive/home-v3-world.css; intro head script removed.
**Integrity:** no copied text/images/code/font from afternow; no invented testimonials, stats, clients or articles.
**Verified:** tsc ✓ eslint ✓ build ✓; qa-matrix 12 routes × 6 viewports all clear (fixed footer overflow at 768);
Lighthouse prod: home desktop 100/100/100/100, mobile 89/100/100/100; /services/3d-animation and /contact desktop
100s, mobile 93/100/100/100 (fixed fg-3 contrast: #77786d → #6b6c62). Menu sheet, dropdown, reel dialog checked.
**Open:** real client videos/case studies; about/work-detail could get more editorial polish; deployment.

## [2026-10-26] — Claude (Opus 5.5) — landing intro (afternow.co preloader sequence) — DONE
**User request:** the reference's landing animation — logo + icon in the middle, glide up to the top, the menu icon
expands into the navigation (laptop), then the content fades in.
**Studied:** afternow.co real-time frame captures + their DOM/CSS/GSAP timeline (behaviour only, no code copied).
**Built:** `components/landing/Preloader.tsx` (rendered in the root layout, shown only with `html.intro`) + CSS timeline
in globals.css "LANDING INTRO": logo artwork assembles in 12 masked slices (never redrawn) + STUDIOS label, black dot
slides in, 1.5–2.4s row glides up while the white curtain retracts, 2.25s menu dots land, links expand right→left,
pill wipes in, hero reel opens from a centre sliver (echo burst held until then), title rises, page content fades up.
Head script (layout.tsx): `intro` + `preloading` on a hard load of "/" (scrollY<10, motion allowed); `preloading`
(scroll lock + held hero/content) released at 2250 ms. Client-side navigation never replays it; reduced motion skips it.
**Verified:** frame-stepped (all animations paused + seeked) and real-time captures at 1440 and 390; build ✓.
Lighthouse prod home: desktop 98/92*/100/100, mobile 78/96*/100/100 (observed LCP 189 ms; simulated LCP/speed index pay
for the ~2.4 s intro). *a11y flags are mid-fade samples (semi-transparent text during the entrance); at rest the same
colours scored 100.
**Tools:** scratch capture scripts (timeline + seek) live in the session scratchpad, not the repo.

## [2026-10-26] — Claude (Opus 5.5) — real project footage + scroll reveal — DONE
**User request:** put the real assets (folder `Desktop/…/taskelevate studio/real asset/`, more coming) on the site and
make the work reveal top → bottom while scrolling.
**What I did:**
- `scripts/encode-work.sh "<source>" <slug> <start> <seconds> [posterOffset]` → `public/media/work/<slug>/`
  preview.mp4 (muted ~12 s loop), poster.jpg, full.mp4 (with sound). All 8 projects encoded (originals untouched).
  Configurator: used `intractive 3d configurator for webgl.mp4` (40 s); the "copy" (35 s) is not used.
- `src/data/projects.ts`: `workMedia()` helper; every project now has real thumbnail/preview/full video; `isExample`
  removed; write-ups rewritten to describe what each film shows (no client names / tools / results invented).
- Hero reel → `public/media/reel/work-reel.mp4` (18 s crossfade montage of real work; studio-reel.mp4 kept).
- Home WorkGrid: real footage playing in view, orientation-aware slots (portrait footage never in a landscape slot);
  /work ProjectCard: real previews, portrait frame for vertical footage; case-study player sized to the footage.
- Service cards show real project footage on hover.
- `components/ui/ScrubReveal.tsx` (+ pre-paint state in layout script, "SCRUB REVEAL" CSS): `[data-scrub]` media unmasks
  top → bottom with a settling zoom, scrubbed by scroll both ways (work grid, /work cards, studio notes).
**Verified:** captures at several scroll positions (mid-reveal states), /work, portrait + landscape case studies;
qa-matrix (3 viewports × 12 routes) all clear; tsc ✓ eslint ✓ build ✓.
**Open:** confirm/correct the case-study write-ups (client names, tools, results); add the next assets with encode-work.sh.

## [2026-10-26] — Claude (Opus 5.5) — process steps driven by scroll — DONE
**User request:** the "Our approach" process card should move to the next step while scrolling, not by clicking arrows.
**What I did:**
- `components/landing/ApproachSlider.tsx`: auto-advance timer and ◂ ▸ arrows removed. The cards sit in
  `.approach-track` and pin (`.approach-stage`, sticky); progress through the track (`--ap`, 0 → 1) picks the step, so
  each step gets an equal stretch of scroll (55svh each) and scrolling up steps back. Tabs became 4 progress bars
  that fill during their step; clicking a tab scrolls to that step. Corner label reads "Scroll ↓" until the last step.
- `globals.css` (near `.approach-text`): `.approach-track` spacer, `.approach-stage` sticky offsets (phones under the
  nav bar; desktop roughly centred), `.approach-bar` scaleX from `--ap`.
**Verified:** pinned position constant through the track, steps 01→04 at 1440×900 and 390×844, bars fill per step;
tsc ✓ eslint ✓ build ✓.

## [2026-10-26] — Claude (Opus 5.5) — live process render in the pinned approach section — DONE
**User request:** the clip next to the scroll-driven process card was dull for a section people sit in while
scrolling — "make your own … very cool".
**What I did:**
- New `components/landing/ProcessVisual.tsx`: a plain-WebGL particle render (no library; 14k points desktop / 7.5k
  phones, additive glow) scrubbed by the section's scroll progress. One field, four states, each change centred on
  the step boundary where the copy changes: 01 scattered input clusters → 02 wireframe sketch of a (2,3) torus knot
  (centre line, sections, guides) → 03 lit, shaded knot with a render pass sweeping top → bottom through the step →
  04 the knot cut into 16:9 / 1:1 / 9:16 frames. Cursor pushes particles; scroll also turns the object.
  HUD: "Live render" + step mode, timecode, per-step %, timeline playhead with step ticks. Runs only on screen;
  reduced motion → no time-based motion, snaps between states; no WebGL / context lost → the old studio clips.
- `ApproachSlider.tsx`: the render replaces the small clip panel; desktop (lg) is card 5 cols + render 7 cols at the
  same height; phones/tablets stack card → render (`.approach-visual` aspect rules in globals.css). Sticky centring
  moved to lg.
**Verified:** captures 1440×900, 1280×720, 768×1024, 390×844, 375×667 at each step; no console errors; tsc ✓
eslint ✓ build ✓.

## [2026-10-26] — Claude (Opus 5.5) — interactive particle sculpture in the hero — DONE
**User request:** "emotion-agency.com … when we touch mouse here they move … reverse engineer it … fit something in
our website" (hero).
**What I did:**
- Studied the reference (notes: `docs/REFERENCE-emotion-particles.md` — technique only, nothing copied).
- New `components/landing/HeroParticles.tsx`: WebGL2 GPU particle sim (float ping-pong targets, MRT), 65k particles
  desktop / 37k tablet / 16k phones, spring-to-shape + swirl + cursor carry/push/scatter + glow, sphere-shaded
  points. Shapes cycle sphere → rounded cube → torus knot → play button; scroll → play button facing you → blown
  apart across the screen + fade while the reel grows from the middle. Waits for the landing intro curtain.
- `HeroReel.tsx`: renders the sculpture in the stage; reel now starts at scale 0 (hidden in the sculpture) and grows
  on scroll; if particles can't run (`onFail`) it starts at 0.35 like before. Hint label "Move to stir · Scroll for
  the reel ↓" (desktop, fades on scroll).
- `globals.css` (hero block): `.hero-particles` (phones: a block above the headline; desktop: the whole stage above
  the reel, pointer-events none), `.hero-hint`, `.js .hero-stage` start scales 0.
- `lib/gl/geometry.ts`: shared rng + torus-knot helpers (ProcessVisual now imports them).
**Verified:** captures 1440×900 + 390×844 (each shape, cursor stir, scroll 0.12/0.22/0.32/0.45); 60 fps desktop and
phone (headless, worst frame 17 ms); tsc ✓ eslint ✓ build ✓; qa-matrix.

## [2026-10-26] — Claude (Opus 5.5) — the studio layer: liquid, figure, drone-shot hero — DONE
**User request:** the particle hero looked stand-alone; sync it with the whole site, emotion-agency style (liquid,
glass, water, text that changes on scroll); then: the T in the middle, text left + below, lower text sliding left,
background rotating like a drone shot, zoom through a ring at the end, soft bursts — on mobile too.
**Integrity fix:** `real asset/scroll story microsite.mov` is a screen recording of emotion-agency.com (their logo is
in it). Removed the project, its web copies (`public/media/work/scroll-story-microsite/`) and its clip in the reel
(re-cut: second Paris shot instead). Do not re-add it unless the user shows it is their own work.
**What I did:**
- `components/studio/StudioCanvas.tsx` (mounted in `layout.tsx`, first child of the page sheet; `.studio-layer` is
  sticky, z -1): one WebGL2 canvas for every page — fluid sim (`lib/gl/fluid.ts`, pointer/touch/scroll/click-drop),
  liquid-glass refraction + colour split, the figure (`lib/gl/figure.ts`, 65k/37k/16k GPU particles) posed by DOM
  anchors (`[data-figure]`, see the file header), the landscape (sky, faceted ranges with parallax, lake with
  ripples/glints, all reflecting), drone camera (yaw/pitch/dist/lens shift from `data-figure-cam`), soft bursts,
  adaptive resolution, rests when nothing moves. Off for reduced motion / no float targets (html[data-studio]).
- Logo T: `sampleMark()` samples the coloured pixels of `/brand/taskelevate-logo-dark.png` at runtime (leftmost
  coloured run = the mark; nothing redrawn), extruded, with the mark's own gradient per particle.
- `HeroReel.tsx`: 6 phases (logo → knot → cube → wave → play → ring; copy from our service descriptions), kicker +
  word decode (`lib/animations/decode.ts`), big lines slide left, ring → reel inside the hole (clip circle synced to
  the camera distance) → fly-through to the full reel. Track 820svh, all sizes.
- Anchors elsewhere: intro statement seat (knot), work grid / services / notes / inner-page heroes = dust,
  approach + physics chips = none. Section eyebrows + page labels decode (`ui/DecodeText.tsx`). Glass nav pill.
- Home grid: 7 projects → the vertical film is a 4-col portrait card next to a "start a project" tile.
**Verified:** captures 1440×900 / 1920×1080 / 390×844 (every phase, zoom, intro timeline, inner pages, reduced
motion, no-WebGL); 60 fps headless; tsc ✓ eslint ✓ build ✓.

## [2026-10-26] — Claude (Opus 5.5) — emotion-grade pass: type, hero story, what-we-do wheel, footer, entry — DONE
**User request:** hero text unreadable / service label tiny / scroll text animation not good / mobile; no video after
the ring (start with text); verify the original (how it enters, animates); fix the rocks/water; dots + figure off
the rest of the site (water effect only); intro paragraph fills black on scroll; premium fonts everywhere; a
what-we-do services scroll like the original; fix the footer.
**Reference verified** (headless capture with a normal UA — their CDN blocks HeadlessChrome): loader → "enter" →
white liquid circle reveal; pill + mono line + italic serif word + condensed serif caps, blocks alternating
bottom/left/right while the camera travels; ring → white halo → lilac "What we do" (word fill + service wheel);
footer "Let's BUILD ↳ SOMETHING MEANINGFUL" + mono columns. Notes in docs/REFERENCE-emotion-particles.md.
**What I did:**
- Type: Instrument Serif (display, roman + italic), Instrument Sans (text), IBM Plex Mono (labels) via next/font;
  palette → lilac paper `#f6f3fe` + deep violet ink `#160c2b`; serif-tuned display scale; buttons = glassy lilac
  pills with ↳; `.tag-pill` purple labels.
- `landing/HeroStory.tsx` replaces HeroReel (no video in the hero): 6 blocks (pill, mono sentence from our service
  descriptions, italic word, caps line) alternating bottom/left/right; scroll-scrubbed transitions — hold, then
  SVG displacement warp + RGB split + blur out to the left / in from the right; figure moves to the open side (lens
  shift); ring → white halo floods into the next section (`data-figure-fade` hands the layer off with no ghost).
- Landscape: two rows of low-poly rocks (lit/shadow faces, parallax), purple meadow shore, softer two-tap lake
  reflection + waterline, three layers of swaying grass blades, petals, pink clouds, side/bottom scrims for copy.
- `landing/WhatWeDo.tsx`: pinned; statement fills faint → ink word by word; 16 capabilities on a wheel (active line
  dark with ↳, others fade), each linking to its service. Replaces IntroStatement (deleted) + ServiceCards on home
  (ServiceCards kept, unused).
- Figure/dust removed everywhere except the hero; the liquid stays site-wide. Studio layer is now an absolute layer
  spanning the sheet with a sticky canvas inside (the old negative-margin sticky hung past the sheet and covered the
  footer).
- Footer: lilac, pill + "*Let's* EXPLORE ↳ WHAT'S NEXT", mono intro line, numbered mono columns, logo + legal row.
- Entry: the preloader paper now opens as a circle with a white glowing edge (`pl-open`, @property --pr).
**Verified:** desktop 1440×900 + phone 390×844 captures (phases, mid-warp, halo hand-over, what-we-do, footer,
intro timeline); tsc ✓ eslint ✓ build ✓.

## [2026-10-26] — Claude (Opus 5.5) — the fly-through plays by itself — DONE
**User request:** at the ring, "it automatically enter — we don't need to scroll the white screen manually".
**What I did:** `HeroStory.tsx` — once you scroll into the fly-through (anywhere between ZOOM_FROM and the next
section), the page glides on its own (1.9 s, eased) through the ring and the halo and lands with "What we do" at the
top; scrolling up into that stretch glides back out to the ring (1.3 s). Wheel/touch/scroll keys are held while it
plays. Footer link columns: 2-up between lg and xl (the 4-up grid overflowed by 19px at 1024px).
**Verified:** headless wheel test desktop + phone (forward lands at wwd top 0, reverse returns to p≈0.725);
qa-matrix all clear; tsc ✓ eslint ✓ build ✓.

## [2026-10-26] — Claude (Opus 5.5) — pushed to GitHub — DONE
**User request:** move toward finalization — push to GitHub (`2024haisam-boop/taskelevate-studio`), then host on Vercel;
real portfolio assets still to come.
**What I did:** `git init` on `main`, one initial commit, remote `origin` → https://github.com/2024haisam-boop/taskelevate-studio.git,
pushed. Kept out of the repo (`.gitignore`): `/assets-src/` (the parent site's brand screenshots — ownership unconfirmed) and
`docs/previews/v4-vs-afternow.jpg` (contains afternow.co's site). No `.env*` secrets exist/are committed (only `.env.example`).
`docs/DEPLOYMENT.md` now points at the repo (Root Directory stays empty in Vercel).
**Next:** user imports the repo in Vercel; set env vars from `.env.example` (form needs the three Resend keys); add the
`studio` CNAME. Then real portfolio assets → `scripts/encode-work.sh`, check each for third-party branding.

## [2026-10-26] — Claude (Opus 5.5) — iPhone smoothness pass (same site, same animations) — DONE
**User request:** "very slow on my iPhone 17 Pro Max … hero lags … don't remove anything … optimise through code,
super smooth".
**Found (Safari/WebKit specifics; Chrome headless holds 60 fps at 4× throttle so it can't show them):**
1. HeroStory kept a non-passive `touchmove`/`wheel` listener on window permanently → every touch scroll waited on JS.
2. Hero copy transitions = SVG `feTurbulence`+`feDisplacementMap` + `blur()` + animated `text-shadow` on big type,
   re-rendered on the CPU every frame (Safari has no GPU path for these).
3. The ring halo = a full-screen radial gradient repainted every frame of the fly-through.
4. WhatWeDo (56 elements) and ApproachSlider ran their scroll work on every frame site-wide, even off screen, with
   layout reads after writes.
5. Shape building + hero snapshots competed with the intro's main-thread curtain animation; intro curtain painted two
   full-screen gradients + a mask per frame.
**What I did:**
- `lib/gl/heroCopy.ts` (new): each copy block is rasterised once (every word at its laid-out position, decode letters
  individually, soft shadow at half res, pill as an SDF) → the warp runs in a shader: displacement (own 2-octave
  gradient noise, same params as the SVG filter) → offscreen target → 16-tap mipmapped gaussian (displace → blur, as
  the filter chain) with the colour split in between, CSS paint order. Also draws the halo. The DOM copy shows at rest
  (crisp, real text); the texture only plays transitions; the SVG filter path stays as the fallback. Snapshots are
  relative to `.hero-blocks` (the intro slide-in can't bake in), prefetched between frames, never during the intro.
  Canvas hidden when idle. Verified side by side vs the previous build: rest, mid-warp, decode, glide, desktop L/R.
- `decode.ts`: `prepareDecode` builds the letter spans once; `decodeTo` reuses them (letters never move).
- HeroStory: blocking listeners only during the glide; one layout read per frame (track top), anchor/track/stage
  sizes cached on resize; `set()` skips unchanged writes; `--h`/`--hole` set on the elements that use them.
- WhatWeDo / ApproachSlider: IntersectionObserver-gated, cached sizes, unchanged writes skipped; `.wwd-row`
  `will-change: opacity`, `.hero-meta` `will-change: opacity`.
- StudioCanvas: shape builds wait for the intro; adaptive resolution now tracks the display's refresh (60/120/144 Hz),
  steps back up after sustained headroom (with a ceiling so it can't oscillate), ignores the intro.
- Preloader: mask + `::after` ring merged into one pre-multiplied radial gradient (same look, one paint, no mask).
- AGENT_INSTRUCTIONS §3: the smoothness rules above.
**Measured (Chrome, iPhone 440×956@3x, CPU 6×, prod, previous commit vs now):** glide 57→60 fps, dropped frames
7→0 (worst 50→17 ms), style 210→37 ms, layout 69→30; hero scroll script 279→105 ms, style 121→48, prepaint 193→57;
page scroll 3→0 dropped, style 217→44, layerize 219→96. Intro: the old build's curtain circle stalled behind JS
(stayed a dot while the logo rose); now it opens in step. Fly-through test (wheel, desktop + phone) unchanged;
qa-matrix all clear; reduced-motion / no-WebGL fallbacks render; `npm run check` ✓.
**Note:** iPhone ProMotion is 120 Hz (not 144); iOS Safari runs page animation frames at 60 fps by default (Apple's
setting) while native scrolling is 120 Hz.

## [2026-10-26] — Claude (Opus 5.5) — hero: one section per gesture — DONE
**User request:** "the hero must be scrolled one section at a time no matter how hard we scroll".
**What I did (`HeroStory.tsx`):** each phase has a resting place (top of page; the middle of each hold; the ring at
ZOOM_FROM − 0.015). A gesture glides to the next one (1.25 s, longer for longer stretches) and the rest of that
gesture is spent:
- wheel / trackpad: events are one gesture until a 220 ms pause (timed by `e.timeStamp`, so a busy frame can't split
  one); momentum tails are swallowed, also past the fly-through landing. The blocking wheel listener is attached only
  while the hero (or a glide) is on screen.
- touch: native panning is off inside the hero only (`.hero-track[data-steps="on"] .hero-stage { touch-action:
  pinch-zoom }`); a swipe ≥ 24 px that starts on the stage is one step (passive listeners — nothing waits on JS).
- keys: ↓ / ↑ / PageDown / PageUp / Space (Shift = up), no auto-repeat; not in fields or on buttons.
- past the ring the next gesture is the fly-through (as before); scrolling up from What-we-do returns to the ring.
- anything else that leaves the page between sections (scrollbar, find-in-page, restored scroll) settles on the
  nearest one after 200 ms.
- `stepCurve(a, b)`: monotone cubic timing so each step's warp plays from ~0.2 s to ~0.85 s, smooth start and finish.
**Verified (headless, desktop wheel with 1.1 s and 2.7 s momentum flicks + phone swipes):** every hard flick / swipe =
exactly one section (01→02→03→04, back to 03, key → 04), three violent swipes in a row = one section, ring → fly-through
lands on What-we-do with no overshoot, swipe back returns to the ring; repeated runs stable. In-page timing: warp
217→867 ms, settled 1366 ms (step 1); 183→750 / 1183 ms (step 2).

## [2026-10-26] — Claude (Opus 5.5) — footer reveal on mobile too — DONE
**User request:** "the footer on mobile is not like on laptop — the reveal of footer, I need the same".
**Why it was laptop-only:** `position: sticky; bottom: 0` pins the footer's *bottom* to the screen; on phones the
footer (1025 px at 390×844) is taller than the screen, so its top would never have been reachable.
**What I did:** `.site-sheet` rounded bottom + shadow and `.footer-reveal` sticky on every size, with
`bottom: min(0px, 100svh − var(--footer-h))`: a short footer waits pinned to the bottom (laptop, unchanged), a tall
one waits with its top at the top of the screen, is uncovered as the sheet lifts, then scrolls on normally.
`components/layout/FooterReveal.tsx` (client, inside Footer) publishes `--footer-h` (ResizeObserver) and sets
`data-far` (→ opacity 0) while the sheet's end (`[data-sheet-end]`, last child of `<main>`) is more than a screen
below, so an iOS overscroll bounce at the top can't show the parked footer. `.studio-layer` now `border-radius:
inherit; overflow: clip` — the opaque studio canvas was painting square corners over the sheet's rounded bottom
(laptop too); `clip` keeps the canvas sticky.
**Verified:** phone /about: footer top stays at 0 while the sheet's bottom rises 464 → 253 → 0, then scrolls with it;
rounded corners + shadow on both sizes; home hero canvas still pinned.

## [2026-10-27] — Claude (Opus 5.5) — low-end devices + header stays clean through the hero — DONE
**User request:** smooth and quick to open on every device incl. low-RAM Android; on the home page the header
coating must not change during the six hero sections — the glass appears only once you are inside the studio.
**Header (refined after the user's screenshot):** laptops+ keep the glass menu pill from the first scroll (hero
included) with the plain logo, as before; phones keep logo + menu button clear through the home hero and get the
glass bar + pill once the hero has scrolled away (`data-solid`; other pages: after 24 px). CSS: `.nav-group[data-glass]`
(Navbar sets it from `scrolled` on ≥48rem, `solid` below). Re-reads on route change.
**Device tier (`lib/device.ts`):** low = deviceMemory ≤ 2 GB, Android with ≤ 4 cores, Save-Data, or an entry-level GPU
(`weakGpu`: Mali-T/G3x/G5x, Adreno 2xx–61x, PowerVR, …, via the renderer string). iPhones: no change.
Low tier keeps every effect, with fewer pixels / particles / passes:
- StudioCanvas: 96² particles on phones (128² larger), fluid sim 64 / dye 224 (phones), 10 pressure passes, render
  scale ≤ 1.0 on phones (1.25 larger), adaptive floor 0.6.
- HeroCopyGL: texture scale 1.25 (the DOM copy is shown at rest, so reading stays crisp); keeps only the blocks around
  the current one; webglcontextlost → falls back to the DOM copy.
- ProcessVisual: canvas scale ≤ 1.25 phones / 1.5 (point sizes follow).
**Opening / no hitches (all devices):** HeroCopyGL is now created just after the intro (its 3 shader programs no longer
compile during load); ProcessVisual sets up only when its section is ~a screen away (no compile + 7.5k-point build at
load); PhysicsChips fetches/parses matter-js in idle time ~1.5 screens before, starts on arrival as before.
**Measured (Chrome, simulated 2 GB / 4-core Android 412×915@2.625, CPU 6×, prod):** studio canvas 618×1373 → 412×915,
hero texture 824×1830 → 515×1144; page scroll 0 dropped frames (was one 83 ms hitch from the chips' library parse);
hero / glide 1–3 slow frames each. Header: laptop — clear at the top, glass pill in the hero and after; phone — clear
through the hero, glass once in the studio; /about after 24 px. Process render + chips verified on arrival.

## [2026-10-27] — Claude (Opus 5.5) — SaaS animation library (25 real films) — DONE
**User request:** attach the SaaS animation work — folder `real asset/Saas Animation/` (32 numbered MP4s, 96 MB).
**Reviewed every film** (5-frame strips + last 3 s of each, for logos / credits):
- 26.mp4 = byte-identical to the existing `saas-launch-explainer` → skipped.
- Signed by other creators/studios → **left out (user: "not ours")**: 21 (Perspective Motion promo), 24 (Lovable ×
  joemotions), 25 (dnyxstudios), 35 (@arpan.motions), and 14 (Byshub.exe end card), 20 (avatar end card).
- Built around big brands → **user: concept pieces** → shown with a "Concept" tag + "self-initiated, not made for
  <brand>": 01 Google Drive, 07 Notion, 17 Perplexity, 19 Framer, 22 Stripe, 33 Spotify, 37 ChatGPT; also 04 Flaticon
  (not in the user's list — tagged Concept to be safe; confirm).
- The other 17 end on their own product's logo → shown as studio work, **no client names in copy** (titles = the
  films' own taglines; the "kind" lines describe the product category as seen on screen — confirm/correct).
**Encoded** (`scripts/encode-work.sh`, new env knobs PREVIEW_W/PREVIEW_CRF/FULL_CRF/FULL_PRESET/X264_TUNE/AUDIO_KBPS/
OUT_ROOT): `public/media/work/saas/<nn>/` — 6 s muted previews ≤854 px (5.1 MB total), posters (1 MB), full films
CRF 31 slow + tune animation, AAC 96k (55 MB, loaded only on play). Montage reel for the collection card:
`public/media/work/saas-animation-films/` (12 product-UI moments, no end cards).
**Site:** `src/data/saas-films.ts` (the list + integrity notes); `components/work/FilmWall.tsx` — columns of mixed-shape
cards (preview loops in view, "Concept" tag, duration) + a native <dialog> player with sound (Esc / ← → / prev-next,
focus returns); new project `saas-animation-films` (first card on home + work page SaaS filter) whose page shows the
whole wall; SaaS service page: 6 films + "All 25 SaaS films". WorkGrid layout now adapts to any project count (rows of
three after the feature row; the start-a-project tile completes an unfinished last row).
**Verified:** trusted click → film plays with sound (desktop 1068×601, phone 358×201), next/close/focus OK; home grid
balanced (8 projects + tile); service page strip.
**QA:** overflow + clipped-headline sweep, 13 routes (incl. /work/saas-animation-films) × 10 viewports = 130 checks, 0
problems (run in one Chrome session — launching a fresh headless Chrome per page stalled intermittently on this Mac;
`scripts/qa-matrix.mjs` now gives each page 45 s and one retry). `npm run check` ✓.

## [2026-10-27] — Claude (Opus 5.5) — hero steps never miss + emotion-style burst — DONE
**User:** "sometimes it doesn't scroll" (one section per gesture) and "the burst is like a heartbeat — make it like the
site I gave you".
**Why steps were missed:** a new trackpad flick made while the previous one's momentum was still fading counted as the
same gesture (no 220 ms pause); any gesture during the 1.25 s glide was dropped; on phones swipes starting on the
header were ignored and short quick flicks (< 24 px) didn't count.
**Fix (HeroStory):** wheel gestures split on a pause OR on a real new flick over a dying tail (event *rate* jumping
> 2.5× the fading tail, once the gesture is 300 ms old — rates, so coalesced events can't fake it) OR a direction change;
a gesture during a glide is queued (latest wins) and plays as the glide lands — still one section at a time; swipes
count anywhere on screen (header included: `html[data-hero-steps="on"] [data-site-nav]` gets touch-action too) except
the menu sheet; quick flicks ≥ 8 px count (not when the touch starts on a button/link — a tap stays a tap); the lift
point comes from `changedTouches`. Tests: long 2.7 s-tail flick = 1 step; flick + new flick in its tail = 2; mouse
wheel spun 1.6 s = 1; swipe during a glide = queued; header swipe ✓; shaky tap on the menu = no step.
**Burst (studied emotion-agency.com live: 26 s idle + scroll transitions, frame by frame):** theirs never breathes — at
a change of shape (and now and then) the form flashes pink-white for ~0.5 s and a light spray of edge particles shoots
out like sparks and is pulled back; the silhouette stays crisp. Ours now: `figure.ts` — one-step kick (`uKick`) to
1.5–5.5 % of particles (edge-weighted), 2–5.5 × scale outward+random, spring eased (scatter 0.6) then home; `uFlash`
(up in 50 ms, e^(−t/0.36 s)) drives glow; glow lifts colour toward pink-white keeping the shading, points grow ≤ 22 %.
StudioCanvas fires it on every shape change (each hero section) and every 6–9.5 s at rest. The old envelope (target
pushed out + in = the "heartbeat") is gone.

## [2026-10-27] — Claude (Opus 5.5) — glitter beads like the reference + a live 3D configurator on Interactive Websites — DONE
**User:** "the dots still not smooth like the original — our beads need a lot of improvement, make it very similar";
"on Interactive Websites this is so dumb — put something that proves we build 3D, million-dollar branded websites".
**Beads (compared side by side with emotion-agency.com frames):** theirs are small soft glossy beads, glowing where
dense, white glitter, a few floaters, smooth settling; ours were opaque, depth-tested, hard-edged balls. Now
(`figure.ts` + StudioCanvas): soft-edged bead sprite drawn partly additive (alpha × 0.7) with no depth test → dense
parts glow toward pink-white; 14 % of beads twinkle (`uTime` sparkle); 0.6 % floaters hover near the surface; a soft
"lit from within" core (`uCore`); palette leans violet / magenta / pink-lilac (+ a touch of brand blue; the logo keeps
its own colours); damping 5 → 7 and slower swirl so forms settle without wobble; size 0.031 world (phones 0.038).
**Interactive Websites:** the CSS "spatial web / depth study" mock-up (kept as the no-WebGL fallback) is replaced by
`components/services/WebShowcase.tsx` + `components/three/WatchScene.tsx` (+ `watchConfig.ts`, shared data so the page
doesn't pull three.js into its main bundle): a luxury watch modelled in code (lathe case + bezel with 60 marks, sunray
dial with radial anisotropy + printed track, applied indices, extruded hands on the visitor's local time with a
sweeping seconds hand, transmission crystal on capable devices, crown with a gem, lugs, tube strap, hidden movement
with turning gears + swinging balance wheel, engraved case back), procedural studio light (drei Lightformers, no HDR).
Configurator: case Steel / Gold / Ceramic, dial Midnight / Ivory / Emerald / Violet, strap Tan / Rubber / Lilac (eased
material transitions), Explode (layers lift, three-quarter view, labels projected per frame), drag to turn with
inertia (touch: horizontal only, vertical keeps scrolling), full screen (Esc), "Demo product · modelled & rendered live
in your browser". Mounts after first interaction or 1.2 s, renders only in view; low tier / phones: no transmission,
lower DPR.
**Bug found + fixed:** `deviceTier()` ran during render on the server (Node 24 has `navigator`, not `window`) → the
service page fell back to client rendering (React "script tag" warning). Guarded; only effects/client code call it.
