# HOME v4 — editorial (the afternow.co format, our own content) — 2026-10-26

Client request: "https://afternow.co/ same to same". afternow.co was studied (structure, grid, type scale, motion)
and rebuilt with Taskelevate's logo, copy and footage. Their text, images, code and commercial font are NOT copied.
v3's 3D world is kept in the repo (components/world, components/experience; CSS in docs/archive/home-v3-world.css).
The physics chips were kept by request ("some things are cool, don't remove them").

## Landing intro (components/landing/Preloader + globals.css "LANDING INTRO")
Hard load of "/" only: logo (12 masked slices of the real artwork) + black dot at mid-screen → glide up as the white
curtain retracts → menu dots land, nav links expand out of the dot, pill wipes in → reel opens from a sliver, title rises,
content fades in. Total ≈2.4 s. `html.intro` / `html.preloading` come from the head script in app/layout.tsx.

## Page (src/app/page.tsx → components/landing/*)
1. **HeroReel** — headline bottom-left; the studio reel starts at 35% in the centre and grows to full screen on scroll
   (pinned, native scroll); violet + lilac "echo" layers run ahead while it grows. Custom cursor "Play" → <dialog> with sound.
   Phones / reduced motion: static stack.
2. **IntroStatement** — large statement + "Explore our work ▸" pill (SectionHead, 12-col).
3. **WorkGrid** — staggered 12-col grid (6/3/3, 4/4/4, 6/6), service tags on media, "Example" honesty tags.
4. **ApproachSlider** — in the reference's testimonial slot: the brief's real 4-step process (no fake quotes/stats);
   "Built with" row in the logo-wall slot (tools named in our own service copy, as plain type).
5. **ServiceCards** — 4 tall paper cards; hover widens a card, turns it black, fades in its footage.
6. **PlayChips** — Matter.js physics chips (kept from v2/v3).
7. **StudioNotes** — 4 pastel cards framing real studio renders (in the reference's journal slot; we have no articles).
8. **NewsToast** — dismissible announcement card under the header (≥md).
Global: light tokens (globals.css), Inter Tight display / Inter body / JetBrains Mono labels, mono pill buttons,
header (logo + mono nav + black pill + dot menu sheet), black footer revealed from under the rounded page sheet.
Dark media panels on inner pages keep the old palette via `.theme-dark` (tokens re-scoped).
