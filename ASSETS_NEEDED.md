# ASSETS NEEDED — Taskelevate Studios

Everything below is genuinely missing. The site already works without it — each item's UI stays hidden or shows a
clearly-labelled placeholder until you supply the real thing.

| # | Asset / credential | Where it goes | Until then |
|---|---|---|---|
| 1 | **Portfolio projects** — title, category, short description, hero image (~2400px), optional 6–10s muted preview loop (≤ 4 MB MP4), full video + captions (.vtt), gallery images, services, year, client name **with permission**, objectives, process, real outcomes | `public/projects/<slug>/`, `public/posters/`, entries in `src/data/projects.ts` | 8 generated "Example" slots (badged, noindex) |
| 2 | **Resend account** + verified sending domain, API key, receiving inbox | Vercel env: `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Form shows "Online inquiries are temporarily unavailable"; API returns 503 |
| 3 | **Calendly link** (real scheduling URL) | `NEXT_PUBLIC_BOOKING_URL` | All "Book a Discovery Call" buttons hidden |
| 4 | **Public contact email** | `NEXT_PUBLIC_CONTACT_EMAIL` | Email links hidden (footer, CTA, fallbacks) |
| 5 | **Instagram + LinkedIn URLs** | `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_LINKEDIN_URL` | Social links hidden |
| 6 | **Showreel** video (+ poster) | `public/media/` + `NEXT_PUBLIC_SHOWREEL_PATH` / `_POSTER` (or a URL) | No "Watch Reel" button |
| 7 | **Vector logo source** (SVG/AI/Figma) for the icon and both wordmarks | `public/brand/` | Using the supplied 800px PNGs (crisp up to ~260px wide). Fine for nav/footer/OG; needed for very large or print use |
| 8 | **Team photos + names/roles** (optional) | `public/team/` + `siteConfig.proof.team` | Team sections hidden |
| 9 | **Client references** with written permission (optional) | `siteConfig.proof.clientReferences` | Testimonial blocks hidden — none are invented |
| 10 | **Analytics decision** (Plausible recommended — cookie-less) | `NEXT_PUBLIC_ANALYTICS_PROVIDER` (+ domain / GA4 id) | No trackers load; events log in dev only |
| 11 | **Legal review** of `/privacy` and `/terms` | `src/app/privacy/page.tsx`, `src/app/terms/page.tsx` | Template text that accurately describes the site's behaviour |
| 12 | **Upstash Redis** (optional, recommended for production rate limiting) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | In-memory limiter per serverless instance |

## Logo usages already produced (from the real supplied files — not redrawn)
- `public/brand/taskelevate-logo-white.png` — white wordmark + original gradient icon (dark backgrounds)
- `public/brand/taskelevate-logo-dark.png` — original dark wordmark (light backgrounds)
- `public/brand/taskelevate-icon.png` — icon only; `src/app/icon.png`, `apple-icon.png`, `favicon.ico`
- "STUDIOS" is set as live text beside (nav) or beneath (footer, OG image) the wordmark.
- Originals preserved untouched in `public/brand/source/`.
