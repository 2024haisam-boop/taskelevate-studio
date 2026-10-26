# Taskelevate Studios — studio.taskelevate.com

**CRAFTING THE UNEXPECTED.**

The website for Taskelevate Studios: SaaS animation, Blender/3D product animation, interactive 3D websites
and video editing. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Three.js / React
Three Fiber, GSAP and Motion.

> **Working on this project as an agent?** Start with [`AGENT_INSTRUCTIONS.md`](AGENT_INSTRUCTIONS.md),
> then [`PLAN.md`](PLAN.md) and the latest entries in [`LOG.md`](LOG.md). The original brief is
> [`docs/BRIEF.md`](docs/BRIEF.md).

---

## Quick start

Requirements: Node.js ≥ 20.9 (developed on 24.x), npm. Project location: `~/Developer/taskelevate-studio`
(keep it out of iCloud-synced Desktop/Documents folders).

```bash
npm install
cp .env.example .env.local   # then fill in what you have (all optional for local dev)
npm run dev                  # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (flat config, Next core-web-vitals + TypeScript) |
| `npm run check` | typecheck + lint + build — run before shipping |

Visual QA helpers (use your local Chrome, no extra dependencies):

```bash
node scripts/qa-screenshot.mjs http://localhost:3000/ 375x812 shot.png --full --reveal --metrics
node scripts/qa-matrix.mjs http://localhost:3000   # every route × the 10 viewports from the brief
```

---

## What's in the site

| Route | Notes |
|---|---|
| `/` | Hero (CSS kinetic type) · Creative Engine (4 interactive modes, real WebGL in "3D") · Selected work · Services · Spatial experience (scroll-driven) · Process · Studio · Contact CTA |
| `/work`, `/work/[slug]` | Filterable portfolio (deep link `?category=`) and statically generated case studies |
| `/services/saas-animation` · `/services/3d-animation` · `/services/interactive-websites` · `/services/video-editing` | Each with its own signature visual, deliverables, process, FAQ, CTA, related services |
| `/about`, `/contact` | Brand story · project inquiry form (Zod + Resend) |
| `/privacy`, `/terms` | Accurate to what the code does — **have them legally reviewed** |
| `/api/contact` | Inquiry endpoint: same-origin check, size cap, rate limit, validation, honeypot, idempotency |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | Generated |

### Honesty rules built into the code
- Booking buttons, social links, email links and the showreel button **render only when configured**.
- The contact form **never fakes success**: without Resend credentials the API returns `503` and the page shows
  an upfront notice plus any configured email/booking fallback.
- Portfolio entries marked `isExample` show an **Example** badge, an on-page notice, are `noindex`, and are left
  out of the sitemap. Testimonials, team and statistics blocks stay hidden until real content is added.

---

## Managing content

All content lives in `src/data/` — no page component needs editing.

| File | Controls |
|---|---|
| `src/data/projects.ts` | Portfolio. Add an object per project; optional fields (client, year, objectives, process, outcome, gallery, video) simply disappear when absent. |
| `src/data/services.ts` | Homepage service rows, nav dropdown, footer, contact options and all four service pages (copy, deliverables, process, FAQ). |
| `src/data/site-config.ts` | URLs, booking, socials, analytics, and the `proof` blocks (team, client references). |
| `src/data/navigation.ts` | Nav + footer structure. |

**Adding a real project**
1. Put media in `public/projects/<slug>/` (hero image ~2400px wide, AVIF/WebP/JPG; optional `preview.mp4`
   muted 6–10s loop ≤ 4 MB; posters in `public/posters/`).
2. Add an entry to `projects.ts` with `thumbnail`, optional `previewVideo`, `fullVideo` (+ captions `.vtt`), `gallery`.
3. Remove `isExample` (or delete the example entries). Only publish work you have permission to show.

Headline strings use a tiny markup: `"\n"` = line break, `*word*` = violet italic emphasis.

---

## Campaign attribution (Instagram creators)

Any page accepts `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, e.g.

```
https://studio.taskelevate.com/services/saas-animation?utm_source=instagram&utm_medium=organic&utm_campaign=saas_creator_01
```

Values (plus landing page and referrer hostname) are kept in **sessionStorage** for the visit, survive navigation,
and are attached to the inquiry email. No cookies, no personal data.

**Analytics events:** `work_viewed`, `service_viewed`, `project_opened`, `project_inquiry_started`,
`project_inquiry_submitted`, `booking_clicked` — sent to the provider chosen in `NEXT_PUBLIC_ANALYTICS_PROVIDER`
(`none` default · `plausible` cookie-less · `ga4` only after consent). In development they're logged to the console.

---

## Architecture notes

- Server components by default; client islands only for interaction (nav, engine, gallery filters, form, scenes).
- **Animation ownership:** CSS = entrances/micro-interactions (hero starts at first paint) · GSAP ScrollTrigger =
  scrubbed timelines (process line, spatial experience) · Motion = gallery layout/presence only. Never two systems on
  one property.
- **3D:** only the Creative Engine "3D" mode and the 3D Animation page hero. Dynamically imported, prefetched near the
  viewport, mounted on demand, never rebuilt, paused off-screen/in background tabs, adaptive DPR, disposed on unmount,
  static fallback when WebGL is unavailable. The product is modelled in code (lathe + rounded-box geometry) —
  no downloads, no HDRs.
- Scrolling is native everywhere. The spatial section uses `position: sticky` over a tall track — nothing is pinned
  or locked; a skip link is provided.
- `prefers-reduced-motion`: entrances become fades, loops stop, scroll scenes jump to their final state with controls.

Deployment: see **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)**. Missing business assets: **[`ASSETS_NEEDED.md`](ASSETS_NEEDED.md)**.
