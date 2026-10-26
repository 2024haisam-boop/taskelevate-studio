# REDESIGN v2 — "3D & alive" (started 2026-10-24)

> Client direction (2026-10-24, overrides the original brief where they conflict): the v1 site feels "text only".
> Make it **short, playful, alive, 3D** and **easy to understand**. Wanted explicitly: things grow/shrink on scroll,
> text reveals, service cards that reveal, a "popup rotator", a **video gallery shaped like a well — a cylinder of
> moving videos**, moving 3D elements; responsive and fast. Goal: award-level (Awwwards SOTD standard).
> Still in force from the brief: no fabricated work/clients/stats, real logo only, accessibility, reduced-motion,
> performance, no scroll-jacking (native scroll, sticky stages only).

## 1. Research — what award winners actually do

Sources: Awwwards Sites of the Year 2025 (Messenger by abeto, Lando Norris by OFF+BRAND), 2026 SOTD/Developer award
studios (Lusion, Active Theory, Noomo, makemepulse, Igloo Inc), plus long-standing references (Basement, Locomotive,
Unseen, Obys). Headless captures of the heaviest sites only showed their preloaders (they stream 10–30 MB of 3D).

Recurring structure / devices:

| Device | Seen on | Why it works |
|---|---|---|
| Full-viewport **WebGL hero** that IS the content (product, world, work) | Lusion, Igloo, Lando Norris, Messenger | Instant "wow", shows capability rather than describing it |
| **Scroll = camera move** through a 3D space (dive in / fly through) | Igloo, Messenger, Active Theory | Turns scrolling into exploration; one continuous story |
| **Big statement with word-by-word scroll reveal**, often with **inline media pills** in the text | Basement, Locomotive, countless SOTDs | Readable, fast, feels editorial and alive |
| **Showreel that grows to fullscreen** as you scroll + circular rotating "Play reel" badge | Unseen, Obys, most studio sites | The single most effective "grow on scroll" moment |
| **Stacked / sticky service cards** that pile up | many 2025–26 SOTDs | Easy to understand: one service per card, still cinematic |
| **Horizontal work gallery** with depth (cards rotate/scale toward centre), hover video, custom "View/Drag" cursor | Lusion, Unseen, Active Theory | Large cinematic media, playful interaction |
| **Velocity marquee** (huge type that skews with scroll speed) | Basement, Obys | Energy between sections, nearly free performance-wise |
| **Playful physics footer/CTA** (things you can throw around) | Lusion, many portfolios | Memorable ending, invites interaction |
| Custom cursor, magnetic buttons, grain, fine UI chrome (corners, coordinates) | almost all | "Crafted" feel |

Engineering notes from these builds: one shared WebGL canvas (not one per section); video textures shared across
meshes; DOM for text (crisp, accessible, SEO); GSAP ScrollTrigger scrubs; textures/videos lazy and small
(480–720p H.264 ~0.5–1.5 MB); mobile gets fewer meshes, lower DPR, posters instead of extra videos.

## 2. New homepage (short: 7 beats)

1. **THE WELL (hero, WebGL)** — a cylinder of curved video panels (3 rows, alternating rotation) seen from above like a
   well. Headline "CRAFTING THE UNEXPECTED." over it. Mouse tilts, drag spins (inertia). **Scroll dives the camera down
   into the well** — panels surround you — then releases into the page. Headline scales up and fades as you dive.
2. **STATEMENT** — huge sentence that lights up word by word on scroll, with inline video pills that grow:
   "We make software feel ⟨pill⟩ simple, products feel ⟨pill⟩ real, websites feel ⟨pill⟩ alive."
3. **SHOWREEL** — a small rounded video that scales to full screen while scrolling (sticky), with a rotating circular
   "PLAY REEL" badge (the popup rotator); click → accessible dialog player.
4. **SERVICES STACK** — 4 large cards that stack on scroll (each previous card scales back/dims). Each card = number,
   title, one line, capabilities, and a live visual/video for that service. Click → service page.
5. **WORK RAIL** — horizontal gallery driven by vertical scroll on desktop (sticky, native scroll), drag/swipe on mobile.
   Cards rotate/scale toward the centre (3D coverflow), video/scroll previews, custom "View" cursor.
6. **MARQUEE** — "SAAS ANIMATION ✦ 3D ✦ WEBSITES ✦ VIDEO ✦" that skews with scroll velocity.
7. **PLAY CTA** — "LET'S CREATE SOMETHING EXTRAORDINARY." + a box of physics service chips you can grab and throw
   (Matter.js, lazy-loaded) + Start a Project / Book a call.

Kept elsewhere: Creative Engine and Spatial Experience move to service pages / a "Lab" area (not deleted).

## 3. Media pipeline (until real client videos are supplied)

- `src/data/media.ts` — one manifest for every video/poster used by the Well, pills, reel, cards and rail.
- Initial clips are **our own real-time renders** (camera product turntable & wireframe→final scan, SaaS UI, motion
  comp, edit timeline, spatial UI) recorded with `scripts/record-clip.mjs` (headless Chrome screencast → ffmpeg),
  plus scrolling captures of Taskelevate's real website builds (from the parent site's portfolio screenshots).
- Swap in real work by replacing files in `public/media/` and entries in `media.ts` — no component changes.

## 4. Performance budget
- One WebGL canvas on the home page (the Well). Everything else DOM/CSS/GSAP.
- Hero LCP = DOM headline (SSR). Canvas mounts after first paint; poster grid shows before it.
- ≤ 6 unique videos in the Well, 480p, shared textures; pause when off-screen/hidden tab; mobile: 2 rows, DPR ≤ 1.25.
- Matter.js and the reel player load only when their sections approach.
- Reduced motion: static Well (no auto-rotation, no dive), no marquee motion, no physics (chips laid out statically).
