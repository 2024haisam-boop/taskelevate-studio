# Reference study — emotion-agency.com particle figure (2026-10-26)

The user asked for the "particles that move when you touch them with the mouse" from emotion-agency.com. We studied
how it behaves and how it is built, then wrote **our own** implementation (`src/components/landing/HeroParticles.tsx`).
No code, shaders, models, textures or copy from that site are in this repo — keep it that way.

## How theirs works (observed)
- Nuxt site, three.js scene (terrain, grass, water, sky, bloom). The figure is a `THREE.Points` cloud of ~78k
  particles (280² texture, lower on a "low" quality tier).
- **GPU simulation**: two float render targets ping-pong, each with two attachments (position + a glow value,
  velocity + a "scatter" value). A full-screen pass integrates every particle each fixed step.
- **Shapes** are a "target" texture: points sampled on a GLB logo or procedural shapes (cube, sphere, heart,
  torus) built in a web worker. Changing shape = swapping that texture; the spring is briefly softened so the
  particles swirl into the new form. Scroll progress picks the shape.
- **Forces**: spring toward the target, curl-noise flow (organic wobble), weak neighbour repulsion and viscosity,
  damping, a speed cap.
- **Cursor**: each particle is projected to the screen; those near the pointer are pushed along the pointer's
  (smoothed) velocity in the camera plane and enter "scatter" (spring weakened) for a fraction of a second, then
  return. Glow rises with speed/scatter (fast attack, slow decay).
- **Look**: every point is shaded as a tiny sphere (fake normal from the sprite coordinate: diffuse, rim, specular),
  purple/violet/pink palette, plus scene bloom.

## How ours differs
- Plain WebGL2, no three.js on the home page (keeps the bundle small). Float targets RGBA32F, or RGBA16F where only
  half-float rendering is available; neither → `onFail` and the hero falls back to the small growing reel.
- 256² particles on wide screens, 192² tablets, 128² phones; fixed 1/60 s steps, ≤3 per frame.
- Our own force model: spring + a cheap divergence-free sine swirl (no noise texture), cursor "carry" plus a small
  push that opens room around the pointer, scatter + glow channels.
- Shapes: sphere → rounded cube → (2,3) torus knot → play button (procedural, seeded). Auto-cycle every 5.2 s at the
  top; scrolling turns it into the play button facing the viewer, then blows it apart across the screen while the
  reel grows out of the middle (HeroReel). Fully reversible on scroll up.
- Brand palette (violet → blue, lilac, a little white), sphere-impostor shading drawn premultiplied on the light page.
- Off screen / hidden tab / fully dispersed → no work. Reduced motion → not shown.

## Round 2 — the rest of their system (studied 2026-10-26)
- **Liquid**: a 2D stable-fluids sim driven by the cursor, applied as a post effect: the rendered frame's UVs are
  pushed along the fluid velocity, with chromatic aberration on the fast parts (plus optional tint/ASCII).
- **Text**: DOM text is mirrored into WebGL (rasterised to canvas textures, planes matched to DOM rects); titles
  reveal with a ripple/dissolve/radial wipe, paragraphs "decode" from a glyph atlas, per scroll.
- **Media**: project images/videos are WebGL planes with edge fisheye on fast scroll and a hover ripple.
- **Scene**: terrain, grass, water with reflections, sky; the camera orbits the figure with scroll and finally
  flies through a ring.

Ours (all own code): fluid + refraction in `lib/gl/fluid.ts` + the composite in `StudioCanvas`; text decode in the
DOM (`lib/animations/decode.ts`, nothing reflows); a procedural landscape shader instead of meshes; the same orbit +
ring fly-through idea, ending in our showreel. Their art (grass, rocks, duck, serif type) is not used.

## Round 3 — verified end to end (headless, normal UA; their CDN serves nothing to HeadlessChrome)
Loader (logo + "Enter with / without audio") → a white liquid circle opens onto the scene, text arriving with a
colour split → blocks: purple pill + mono line + italic serif word + condensed serif caps, alternating
bottom-left / right / bottom, while the camera travels and the figure changes (logo → cube → sphere → heart → ring)
→ a white glowing ring halo floods into a lilac page: "What we do" (statement fills word by word, a service wheel
turns) → projects → awards → footer "Let's BUILD ↳ SOMETHING MEANINGFUL" with mono columns → a "next page" strip.
Ours follows the same rhythm with our copy, our free fonts (Instrument Serif/Sans, IBM Plex Mono) and our own
procedural scene; no assets, copy or code from theirs.
