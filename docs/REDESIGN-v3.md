# HOME v3 — "ENTER THE STUDIO" (one continuous 3D world)

User feedback on v2 (2026-10-25): hero is liked, everything after it still felt "cheap" — flat black sections, DOM cards.
Ask: strategic, fully 3D, cinematic entrance (start effect, light, glow, drop, zoom-out — "entering Taskelevate
Studio"), and a scroll journey that keeps people hooked ("looped").

## What the best award sites do (research summary, v2 + v3)
- The whole site is ONE 3D space; scrolling moves a camera through it (Lusion, Igloo Inc., Messenger/abeto,
  Lando Norris/OFF+BRAND, Active Theory). Sections are *places*, not boxes.
- A short, honest loader that turns into the first shot (light filament → reveal → camera move). No fake progress.
- Light carries the story: volumetric beams, glows, fog, dust in the air; darkness between lit objects.
- Chapter rail / progress indicator so long journeys stay easy to follow.
- A loop at the end (back to the start) so the journey feels endless.

## The journey (top → bottom; every act = a tall DOM track with a sticky overlay over ONE fixed canvas)
| Act | DOM overlay (accessible content) | 3D (camera) |
|---|---|---|
| 0 Intro gate | counter 000→100 from REAL loading, light filament | filament flares → doors split → camera starts ON one screen and zooms out; rows drop into place; rims ignite (shockwave) |
| 1 hero | "CRAFTING THE UNEXPECTED." + CTAs | the Well from above (v2 hero, kept) → camera flies over the rim and tips down into the shaft |
| 2 descent | statement words light up one by one | falling down a shaft lined with video screens, camera roll, speed lines, glow growing below |
| 3 reel | rotating "Play reel" badge (opens <dialog>) | the bottom of the well is a glowing pool that plays the reel; camera plunges through (flash) |
| 4 services | 01–04: title, description, capabilities, link | studio chamber: carousel of 4 service screens, spotlight on the front one, light column from the hole above |
| 5 work | project title/category/Example chip, links | gallery hall: project screens on both walls, light strips on the floor, camera dollies forward |
| 6 finale | "LET'S CREATE SOMETHING EXTRAORDINARY." + physics chips + CTA + "Re-enter ↺" | portal ring of light with two counter-rotating text bands; camera flies toward it |

Re-enter ↺ = flash, jump to top, replay the zoom-out intro → the loop.

## Architecture
- `components/world/world.ts` — mutable store (scroll, smoothed scroll, act ranges in px, pointer, intro clock,
  ready flag). Act ranges are measured once per resize (no layout reads while scrolling); progress is arithmetic.
- `components/experience/HomeExperience.tsx` — mounts the fixed canvas after first paint (WebGL detect), runs the
  single scroll driver that writes `--ap` (act progress) onto each act section, the intro gate, chapter rail,
  grain overlay. Sets `html[data-world="on|off"]` (CSS fallbacks key off it — no hydration mismatch).
- `components/world/WorldCanvas.tsx` (lazy chunk) — one <Canvas>, camera rig, parts in `components/world/parts/*`.
  Videos come from one shared pool (`videoPool.ts`): a clip is decoded once and only plays while its act is near.
- No postprocessing: glow = additive geometry (beams, sprites, fresnel rings) → cheap on phones.
- Reduced motion or no WebGL → `data-world="off"`: no canvas, tracks collapse to normal flow, DOM fallback media.

## Rules kept
One canvas per page · native scroll (no hijack; camera is damped instead) · SSR'd text for SEO/LCP · intro max ~3 s,
skippable (wheel/key/click), first visit per session only (short flare afterwards) · videos are studio renders,
labelled as such · logo never redrawn · all CTAs real.
