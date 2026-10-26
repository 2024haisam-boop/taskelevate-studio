# PLAN — Taskelevate Studios website

> Master plan. Read `AGENT_INSTRUCTIONS.md` first, then this, then the latest `LOG.md` entries.
> Full original brief: `docs/BRIEF.md`.

---

## 1. Project summary

| | |
|---|---|
| Company | **Taskelevate Studios** (parent brand: Taskelevate — https://taskelevate.com) |
| Site | https://studio.taskelevate.com (Vercel) |
| Tagline | **CRAFTING THE UNEXPECTED.** |
| Services | SaaS animation · 3D/Blender product animation · Interactive 3D websites · Video editing |
| Goal | Convert qualified visitors (many from Instagram creator accounts) into inquiries & booked calls |
| Direction | **Dark cinematic technology luxury** — liquid glass, Swiss editorial type, meaningful 3D, precise motion |

## 2. Tech stack (pinned, verified compatible on 2026-10-21)

| Package | Version | Why |
|---|---|---|
| next | 16.4.2 | App Router, Turbopack, `next/font`, `next/og` |
| react / react-dom | 19.3.1 | R3F 9 supports `>=19 <19.4` |
| typescript | 5.9.3 | TS 7 (native Go port) not yet safe for Next's type-checker |
| tailwindcss + @tailwindcss/postcss | 4.3.3 | CSS-first tokens via `@theme` |
| three / @react-three/fiber / @react-three/drei | 0.186 / 9.8 / 10.7 | 3D product scene |
| gsap + @gsap/react | 3.15 / 2.1 | ScrollTrigger scrub timelines (GSAP is free incl. plugins) |
| motion | 14.x | React presence/layout animation (work filters, form states) |
| lucide-react | 1.x | Icons |
| zod / react-hook-form / @hookform/resolvers | 4 / 7 / 6 | Shared client+server validation |
| resend | 6.x | Transactional email for inquiries |
| eslint + eslint-config-next | 9.39 / 16.4 | ESLint 10 not yet supported by react plugins |

## 3. Architecture

```
taskelevate studio/
├── AGENT_INSTRUCTIONS.md   ← rules for every agent
├── PLAN.md                 ← this file
├── LOG.md                  ← append-only work log
├── ASSETS_NEEDED.md        ← what the business must supply
├── README.md               ← setup + deployment
├── docs/BRIEF.md           ← original master brief (source of truth)
├── public/brand/           ← REAL logo files (never modify)
└── src/
    ├── app/                ← routes (App Router)
    │   ├── page.tsx                    home
    │   ├── work/ + work/[slug]/        portfolio
    │   ├── services/<4 slugs>/         service pages
    │   ├── about/  contact/            pages
    │   ├── privacy/  terms/            legal (template — needs legal review)
    │   ├── api/contact/route.ts        inquiry endpoint (Zod + honeypot + rate limit + Resend)
    │   ├── opengraph-image.tsx         generated social preview
    │   ├── robots.ts  sitemap.ts  icon.png  apple-icon.png
    ├── components/
    │   ├── layout/   Navbar, ServicesDropdown, MobileMenu, Footer, BrandLogo, PageTransition
    │   ├── glass/    GlassSurface, GlassButton, GlassPanel, GlassTooltip, GlassMediaControls
    │   ├── hero/     Hero, KineticHeadline (CSS-driven, SSR, a11y)
    │   ├── three/    CreativeEngine (+ SaaSScene, ProductScene[R3F], WebScene, MotionScene), SpatialExperience
    │   ├── work/     ProjectCard, ProjectGallery, ProjectFilters, ProjectArt (placeholder visuals)
    │   ├── sections/ ServicesSection, ProcessSection, StudioSection, ContactCTA, SelectedWork
    │   ├── services/ ServicePageTemplate, service signature visuals, FAQ
    │   ├── forms/    ProjectInquiryForm
    │   ├── analytics/ AttributionCapture, AnalyticsProvider, ConsentBanner, TrackView
    │   └── ui/       SectionHeading, Reveal, RevealText, AnimatedButton, Container, Label
    ├── data/         projects.ts, services.ts, navigation.ts, site-config.ts
    ├── lib/          animations/, analytics/, forms/ (schema, rate-limit, email), utils/
    └── hooks/        useReducedMotion, useMediaQuery, useInView
```

## 4. Key decisions (append new ones with a reason)

1. **Hero animation is pure CSS keyframes on server-rendered split text**, not GSAP.
   Reason: runs on first paint without waiting for hydration → best LCP; deterministic
   timeline matches the brief's 0.00→1.6s schedule exactly. Screen readers get one
   `sr-only` copy; the split glyphs are `aria-hidden`. (Brief allows "a reliable accessible equivalent".)
2. **Creative Engine: DOM/CSS-3D for SaaS, Web, Motion modes; real WebGL (R3F) only for the 3D product mode.**
   Reason: crisp text, tiny cost, and the brief says "prefer CSS transforms for 2D and lightweight depth".
   The R3F bundle is dynamically imported only when the engine nears the viewport / 3D tab is chosen.
   All four layers stay mounted (no canvas rebuild); the canvas frameloop pauses when hidden/off-screen.
3. **3D product = custom "studio camera" object built from lathe/extrude geometry** (no downloaded model).
   Three representations: Wireframe (edges) → Clay material → Final (physical materials + procedural
   Lightformer environment, no HDR download). Transitions use a moving clipping plane "render scan" + material lerp.
4. **Spatial Experience ("Beyond the flat screen") uses CSS 3D + GSAP ScrollTrigger scrub on a sticky stage.**
   No pinning/scroll-jacking — native scroll on a tall section with `position: sticky`. After the sequence
   completes, user controls (pointer tilt + depth slider + stage buttons) allow exploration. Reduced motion →
   final state + controls, no scrub.
5. **Portfolio placeholders are generated art (CSS/SVG), clearly badged "Example".** No stock images, no invented
   clients. The parent agency's Shopify store screenshots are NOT reused (different business, permissions unknown).
6. **Navbar animations are CSS-only** (data-state attributes) so Motion stays out of the shared bundle.
7. **Attribution in `sessionStorage`** (UTM params + landing path, first-touch per session, no cookies, no PII).
8. **Analytics provider-agnostic `track()`**: `none` (default, dev console), `plausible` (cookie-less), `ga4`
   (loads only after consent banner acceptance).
9. **Contact delivery**: Resend via server route. Missing env vars → API returns 503 `delivery_unavailable`
   and the page shows an upfront notice + email/booking fallbacks when configured. Never fakes success.
10. **Rate limiting**: in-memory sliding window by default; Upstash Redis REST if `UPSTASH_*` env vars set.
11. **Faux-italic emphasis**: Space Grotesk has no italic; we use synthesized oblique (`font-synthesis: style`).
13. **Startup JS diet (measured with Lighthouse):** three.js is prefetched only after the visitor's first interaction;
    GSAP + ScrollTrigger load on demand via `lib/animations/useLazyGsap.ts` when their section is within one viewport;
    Motion's features load async via `<LazyMotion>`; the form schema uses `zod/mini`. Home page weight 895 → ~590 KiB.
14. **Pre-hydration reveal**: an inline script at the end of `<body>` marks `[data-reveal]` elements already in the
    viewport as revealed (no fade) before first paint, and again on `document.fonts.ready`. Protects LCP; elements
    carry `suppressHydrationWarning` because the attribute is added before React hydrates.
15. **3D service-page hero mounts WebGL on first interaction or after 2.5 s** — keeps WebGL init off the load path.
16. `@gsap/react` removed (no longer needed). Visibility transitions on menus are instant on open (so focus can move in).
17. **Home v2 (2026-10-24, client request): 3D-first, short, playful** — see `docs/REDESIGN.md`. WebGL "Well" hero
    (cylinder of video screens, scroll dives inside), word-reveal statement, showreel zoom, stacking service cards,
    3D work rail, velocity marquee, Matter.js chips CTA. One canvas per page; studio clips 60–270 KB (+512px `-sm`).
18. **Layout switches that differ by breakpoint must be CSS (media queries), not JS** — a JS-chosen layout rendered
    differently on server vs client caused CLS 0.75 on mobile (WorkRail).
19. **Decorative images must not be LCP candidates** — the poster ring now renders only for no-WebGL devices.
20. **Home v3 (2026-10-25, client request): ONE continuous 3D world** — see `docs/REDESIGN-v3.md`. The home page is a
    fixed WebGL canvas (`components/world/`) behind tall DOM acts (`components/experience/acts/`); the camera travels
    Well → shaft → reel pool → studio carousel → gallery hall → portal. v2 components (`components/home`, `components/well`)
    are no longer used on the home page (PhysicsChips was extracted and is shared).
21. **Scroll is native; the camera is damped** (its own smoothed scroll in `CameraRig`). Act offsets are measured on
    resize only; progress is arithmetic (`world.ts`) → no layout reads while scrolling. Overlays read `--ap` / `--ac`.
22. **Entrance gate**: real loading progress, first visit per session (sessionStorage `tes-intro`), quick flare after
    that, none on client navigation / reduced motion. The hero copy is painted UNDER the gate (`intro-hold` disables its
    animations) so LCP stays at first paint (observed 75 ms). CSS failsafes hide the gate after 7.5 s without JS.
23. **No postprocessing** — glow is additive geometry (beams, halos, fresnel rings, mirrored screens under a
    semi-transparent floor). Keeps phones fast. `three-free` modules (`world.ts`) are the only world code the DOM imports.
24. **`html[data-world="off"]`** (no WebGL / reduced motion) collapses every act to a normal readable page with inline
    media — keep that fallback working when adding acts.
25. **v4 (2026-10-26, client request): editorial light site in the afternow.co format** — see `docs/REDESIGN-v4.md`.
    Supersedes decisions 17 and 20–24 for the home page (the 3D world is kept in the repo, unused). Light theme everywhere;
    dark media panels via `.theme-dark`. Headline content stays in CAPS in data files; `toSentenceCase` renders it.
26. **Never clone third-party assets** — reference sites are studied for layout/motion only; copy, images, code and
    commercial fonts are our own or free substitutes (Messina Sans → Inter Tight + JetBrains Mono).
12. **Location:** originally built in `Desktop/…/taskelevate studio/`; **moved to `~/Developer/taskelevate-studio` on
    2026-10-22** because iCloud Drive (Desktop sync + Optimize Mac Storage, disk 92% full) offloaded the files and the
    dev server hung reading cloud placeholders. Package name `taskelevate-studios`. `turbopack.root` /
    `outputFileTracingRoot` stay pinned to the project folder.

## 5. Design tokens (from brief §05 — implemented in `src/app/globals.css`)

- bg `#08090D` · bg-2 `#0E1017` · bg-3 `#151720`
- text `#F8F9FD` · text-2 `#AFB3C1` · text-3 `#777C8D` (only on bg `#08090D`; 4.8:1)
- violet `#8755E8` · violet-bright `#A855F7` (use bright for text; 5:1 on bg) · blue `#189BE8`
- line `rgba(255,255,255,.09)` · glass `rgba(255,255,255,.055)` · glass-line `rgba(255,255,255,.14)`
- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (labels) via `next/font`
- Container 1440px; padding 20 / 32 / 64px; section rhythm `clamp(72px, 10vw, 150px)`

## 6. Master checklist (brief §35 order)

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked/needs client

- [x] **S1** Initialize project & dependencies
- [x] **S2** Global tokens, fonts, responsive layout system
- [x] **S3** Logo integration + liquid-glass navigation (desktop, dropdown, mobile menu)
- [x] **S4** Cinematic typography-first hero
- [x] **S5** Homepage sections (Work, Services, Process, Studio, Contact CTA, Footer)
- [x] **S6** Interactive 3D Creative Engine (4 modes + fallback)
- [x] **S7** Spatial Experience (scroll-driven, user-explorable)
- [x] **S8** Portfolio (/work, /work/[slug]) + 4 service pages + About
- [x] **S9** Contact form + API + booking hooks + UTM attribution + analytics events
- [x] **S10** Motion / responsive / a11y / performance pass
- [x] **S11** Typecheck, lint, build, browser QA (all viewports) — fix issues
- [x] **S12** README, deployment + DNS docs, ASSETS_NEEDED.md

## 7. Pages & exact copy reference

All exact headline/body copy is in `docs/BRIEF.md` §08–§20. Content data files mirror it:
`src/data/services.ts` (service pages + homepage rows), `src/data/projects.ts` (portfolio),
`src/data/navigation.ts`, `src/data/site-config.ts` (URLs, booking, socials, analytics, feature flags).

## 8. Environment variables (see `.env.example`)

| Var | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (`https://studio.taskelevate.com`) | yes (has default) |
| `RESEND_API_KEY` | Email delivery | for form delivery |
| `CONTACT_TO_EMAIL` | Inbox receiving inquiries | for form delivery |
| `CONTACT_FROM_EMAIL` | Verified sender (e.g. `Studio <studio@taskelevate.com>`) | for form delivery |
| `NEXT_PUBLIC_BOOKING_URL` | Real Calendly link — Book-a-call buttons hidden when absent | optional |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public email shown in footer/fallbacks | optional |
| `NEXT_PUBLIC_INSTAGRAM_URL` / `NEXT_PUBLIC_LINKEDIN_URL` | Footer social links | optional |
| `NEXT_PUBLIC_SHOWREEL_URL` / `_PATH` / `_POSTER` | Hero "Watch Reel" (hidden until set) | optional |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | `none` \| `plausible` \| `ga4` | optional |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` / `NEXT_PUBLIC_GA4_ID` | Analytics IDs | optional |
| `CONTACT_RATE_LIMIT_MAX` / `CONTACT_RATE_LIMIT_WINDOW_SECONDS` | Rate limit tuning | optional |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Distributed rate limiting | optional (recommended in prod) |
