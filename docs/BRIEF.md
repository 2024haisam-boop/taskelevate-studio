# MASTER BUILD DIRECTIVE — TASKELEVATE STUDIOS

> Original client brief, saved verbatim on 2026-10-21 as the source of truth for all agents.

You are acting simultaneously as:

- Award-level digital creative director
- Principal frontend engineer
- Senior interaction designer
- Senior 3D/WebGL engineer
- Premium brand website designer
- Motion design director
- Mobile UX specialist
- Accessibility and performance engineer
- Conversion-focused website strategist

Your job is to DESIGN, ENGINEER, TEST, AND DELIVER a complete, working, production-quality creative agency website from scratch.

This is a NEW PROJECT.

There is no existing website implementation to preserve.
Initialize the project yourself.
Do not ask me to choose frameworks, layout patterns, colors, typography, animation libraries, or UI components. All creative and technical decisions are specified below.

The expected result is a visually extraordinary, fast, fully responsive, interactive website that looks like it was developed by a world-class digital experience agency.

Do not stop after writing a plan.
Implement the website and verify it works.

==================================================
01. PROJECT IDENTITY
==================================================

COMPANY NAME:
Taskelevate Studios

PARENT BRAND:
Taskelevate

MAIN COMPANY WEBSITE:
https://taskelevate.com

STUDIO WEBSITE:
https://studio.taskelevate.com

BUSINESS TYPE:
International digital creative production studio.

SERVICES:
1. SaaS animation and product explainers
2. Blender / 3D product animation
3. Interactive 3D websites and web experiences
4. Long-form, talking-head, and commercial video editing

TARGET CUSTOMERS:
- SaaS founders
- Technology companies
- Startup teams
- Established brands
- E-commerce companies
- Marketing directors
- Creative agencies
- Business owners seeking premium digital production

PRIMARY GOAL:
Convert qualified website visitors into project inquiries and scheduled meetings.

SECONDARY GOAL:
Establish Taskelevate Studios as a technically capable, visually sophisticated, premium creative production business.

SITE LANGUAGE:
English.

BRAND PERSONALITY:
Confident.
Futuristic.
Sophisticated.
Technically precise.
Creative.
Premium.
Modern.
Minimal where necessary.
Experimental where appropriate.

BRAND TAGLINE:
CRAFTING THE UNEXPECTED.

DO NOT create a generic marketing agency website.

==================================================
02. DESIGN PHILOSOPHY
==================================================

DESIGN DIRECTION:
DARK CINEMATIC TECHNOLOGY LUXURY.

Combine:

- The visual precision and navigational polish associated with premium Apple interfaces.
- Elegant liquid-glass materials.
- Editorial Swiss-inspired typography.
- Creative technology laboratory aesthetics.
- Sophisticated WebGL/3D engineering.
- Carefully choreographed kinetic typography.
- Large immersive portfolio experiences.
- Minimal, technically refined user interfaces.
- Responsive layouts with exceptional mobile attention.

IMPORTANT:
Do not copy Apple's website, proprietary graphics, icons, layouts, or protected brand elements.

Take inspiration from its interaction quality, clean hierarchy, premium materials, and visual restraint.

Create an ORIGINAL Taskelevate Studios visual identity.

THE WEBSITE SHOULD FEEL LIKE:
A fusion of a premium technology product experience, an experimental creative studio, and an advanced design laboratory.

THE WEBSITE SHOULD NOT FEEL LIKE:
- A cheap SaaS template
- A cryptocurrency landing page
- A WordPress agency template
- A generic AI-generated website
- A gamer dashboard
- A neon nightclub
- A portfolio packed with random spinning 3D objects

==================================================
03. ABSOLUTELY FORBIDDEN DESIGN ELEMENTS
==================================================

DO NOT USE:

- Giant abstract chrome knots
- Twisted metallic ribbons
- Generic 3D torus sculptures
- Random floating spheres
- Gratuitous glass cubes
- Oversized glowing blobs
- Constantly spinning abstract objects
- Heavy particle backgrounds
- Unnecessary digital rain
- Fake terminal screens
- Fake system loading sequences
- Generic purple gradient hero backgrounds
- Stock agency illustrations
- Excessive neon outlines
- Glassmorphism on every single element
- Aggressive scroll-jacking
- Heavy full-screen canvas effects on every section
- Fake award badges
- Fake reviews
- Fake client statistics
- Fabricated portfolio projects

3D must demonstrate actual creative and engineering capability.

Every animation must have a reason to exist.

==================================================
04. BRAND ASSETS AND LOGO
==================================================

Use the existing Taskelevate logo.

The existing icon is a distinctive geometric mark with a blue-to-purple gradient.

CRITICAL:
Do not redesign, redraw, replace, or geometrically modify the original icon.

Use the real supplied logo file.

The dark portion of the Taskelevate wordmark should be white for dark website backgrounds.

Keep the original gradient icon unchanged.

Add a small, elegantly letter-spaced STUDIO or STUDIOS label beneath the main wordmark only where appropriate.

Create three approved logo usages:

1. Full horizontal Taskelevate Studios lockup.
2. Icon-only version for favicon and compact UI.
3. White wordmark plus unchanged gradient icon for dark backgrounds.

If an editable source logo isn't supplied, create clearly identified asset placeholders and document which logo exports must be provided.

Never substitute an AI-generated icon for the original.

Use CSS or SVG only for surrounding effects, not to recreate the original brand mark.

==================================================
05. EXACT DESIGN TOKENS
==================================================

COLOR PALETTE:

Primary background:
#08090D

Secondary background:
#0E1017

Elevated background:
#151720

Primary text:
#F8F9FD

Secondary text:
#AFB3C1

Muted text:
#777C8D

Brand violet:
#8755E8

Bright violet:
#A855F7

Brand blue:
#189BE8

Borders:
rgba(255,255,255,0.09)

Glass surface:
rgba(255,255,255,0.055)

Glass border:
rgba(255,255,255,0.14)

Use violet-blue gradients only where they meaningfully improve the composition.

Do not fill the entire website with gradient backgrounds.

TYPOGRAPHY:

Headings:
Space Grotesk

Body:
Inter

Technical labels:
JetBrains Mono

Use next/font for font optimization.

HEADLINE RULES:

- Bold, editorial, premium.
- Tight but readable letter spacing.
- Oversized on desktop.
- Responsive fluid scaling.
- Strong contrast.
- Carefully controlled line breaks.
- Purple italic emphasis only for selected important words.
- No cheap default gradient-text effect everywhere.

DESKTOP LAYOUT:

Maximum content width:
1440px

Default horizontal padding:
64px on large desktop.

Tablet padding:
32px.

Mobile padding:
20px.

Section vertical rhythm:
Approximately 110–160px on desktop.
Approximately 70–100px on mobile.

RESPONSIVE BREAKPOINTS:
Use a coherent Tailwind-based responsive system.

Support:
320px phones through large desktop displays.

Use fluid typography with clamp().

Use modern CSS Grid and Flexbox.

No fixed-width sections that break on smaller screens.

==================================================
06. APPLE-INSPIRED LIQUID GLASS SYSTEM
==================================================

This is a defining visual feature.

Create a refined LIQUID GLASS component system inspired by premium modern operating-system interfaces.

It must feel physically believable, lightweight, and sophisticated.

GLASS PROPERTIES:

- Background transparency
- Backdrop blur
- Subtle saturation
- Thin translucent border
- Soft directional highlight
- Slight internal lighting
- Gentle shadow separation
- Extremely subtle cursor-responsive reflection
- Graceful fallback when backdrop-filter isn't supported

Use CSS backdrop-filter and layered CSS backgrounds for primary glass effects.

Where appropriate, use CSS masks and pseudo-elements to simulate edge reflections and liquid-like highlights.

Do not depend on expensive WebGL refraction for navigation.

Use composited transforms and opacity for interaction animations.

DESIGN A REUSABLE GLASS COMPONENT SYSTEM:

- GlassNavbar
- GlassButton
- GlassDropdown
- GlassMobileMenu
- GlassTooltip
- GlassMediaControls
- GlassProjectPanel
- GlassContactPanel

Each component must have:
- Normal state
- Hover state
- Focus-visible state
- Active state
- Reduced-motion behavior
- Mobile behavior

Glass must be elegant and readable.

Avoid extreme blur that makes text muddy.

Never sacrifice accessibility or contrast for visual effects.

==================================================
07. NAVIGATION — CRITICAL
==================================================

Build a premium, Apple-inspired FLOATING LIQUID GLASS NAVIGATION BAR.

DESKTOP NAVIGATION:

A floating rounded capsule positioned near the top center.

It should feel suspended above the content.

Not edge-to-edge.

Desktop maximum width:
Approximately 1120px.

Height:
Approximately 64–70px.

Top offset:
16px.

Display:
- Taskelevate Studios logo on the left
- Work
- Services
- Studio
- Contact
- Start a Project button on the right

Navbar glass properties:
- Semi-transparent charcoal material
- High-quality backdrop blur
- Soft white edge highlight
- Subtle internal reflections
- Thin border
- Premium shadow
- Smooth 3D-free composited transitions

ON SCROLL:
The navbar remains fixed.
Its surface becomes slightly more opaque.
The top offset may reduce subtly.
The shadow becomes slightly more defined.

Do not use aggressive shrinking.

HOVER:
Navigation items receive a small liquid-style pill highlight.
Transition should feel polished and responsive.

SERVICES DROPDOWN:
Create a clean glass dropdown with:

- SaaS Animation
- 3D Animation
- Interactive Websites
- Video Editing

Add small understated icons.

Use accessible button and menu behavior.
Ensure keyboard navigation works.

MOBILE NAVIGATION:

Do not squeeze desktop links into the screen.

Use:
- Small logo on left
- Glass menu button on right
- Compact floating navigation capsule

On tapping menu:
Open a beautiful full-width glass menu panel below the navbar.

Animate with a gentle opacity and vertical movement.

No giant covering animation.

Include:
Work
Services
Studio
Contact
Start a Project

Close menu on:
- Link selection
- Escape key
- Outside click
- Route change

Respect safe-area insets and prevent horizontal overflow.

==================================================
08. HOMEPAGE — SECTION 1: CINEMATIC HERO
==================================================

The hero is TYPOGRAPHY FIRST.

NO SPINNING ABSTRACT 3D OBJECT IN THE HERO.

BACKGROUND:
Deep near-black.

Add a subtle technical grid or noise treatment only if it enhances the composition.

It should be almost invisible.

COMPOSITION:

Desktop:
Centered headline with generous surrounding space.

Small upper label:
INDEPENDENT CREATIVE TECHNOLOGY STUDIO

MAIN HEADLINE:

CRAFTING THE
UNEXPECTED.

The first line:
White.

The second line:
Bright violet.
Italic.
Bold.
Oversized.

Do not alter the exact headline wording.

The second line should carry greater visual energy.

SUPPORTING TEXT:

"We craft striking SaaS animations, cinematic 3D visuals, and immersive digital experiences for brands that refuse to blend in."

Center aligned.
Max width about 660px.
Comfortable readable line height.

CTA BUTTONS:

Primary:
Explore Our Work
Links to /work

Secondary:
Start a Project
Links to /contact

Optional showreel control:
Only show if an actual showreel video is provided.

Do not create a dead Watch Reel button.

HERO ENTRY ANIMATION:

Timeline:

0.00s:
Background and small upper label appear.

0.15s:
CRAFTING THE reveals using upward masked character or word movement.

0.55s:
UNEXPECTED reveals with a more expressive but controlled animation.

0.90s:
A narrow moving highlight sweeps across the purple lettering.

1.05s:
Supporting paragraph reveals.

1.20s:
CTA buttons reveal.

Target full entrance duration:
About 1.6 seconds.

Keep the main headline readable almost immediately.

Use GSAP and SplitText where licensing and package compatibility permit, or a reliable accessible equivalent.

Avoid DOM duplication that harms screen readers.

No loader that delays content.

No typewriter effect.
No dramatic text shaking.
No spinning heading.
No excessive glitch effects.

HERO BOTTOM:

Small label on bottom left:
DESIGN / MOTION / TECHNOLOGY

Small label on bottom right:
SCROLL TO EXPLORE

Subtle animated downward indicator.

MOBILE:

Keep the headline centered.

Use fluid sizing.

Ensure no letter clipping.

Allow deliberate line wrapping when required at narrow widths.

CTAs stack if necessary.

Keep the entire experience visually balanced on a 375px phone.

==================================================
09. HOMEPAGE — SECTION 2: CREATIVE ENGINE
==================================================

SECTION HEADING:

BUILT TO
MOVE MINDS.

Small label:
01 / OUR CAPABILITIES

Description:
"Four disciplines. One obsession: making digital experiences unforgettable."

Create a signature INTERACTIVE CREATIVE ENGINE.

This is where our real 3D engineering begins.

It must be interactive and visually meaningful.

Do not use a decorative sphere as a placeholder for the final experience.

DESIGN:

Large dark technical viewport.

Subtle coordinate lines.
Precision labels.
Tiny technical indicators.
Clear visual depth.
Elegant framing.

Four selectable modes:

01 — SAAS
02 — 3D
03 — WEB
04 — MOTION

MODE 1: SAAS

Display a sophisticated layered SaaS application interface.

Include:
- Floating product dashboard
- Charts
- Navigation elements
- Data cards
- Animated feature markers
- Depth-separated panels

Pointer movement creates controlled parallax.

Small interface elements animate when selected.

MODE 2: 3D PRODUCT

Display a bespoke product visualization.

Use a custom-designed minimal tech object rather than a generic geometric primitive.

Interaction:
- Wireframe mode
- Material mode
- Final rendered mode

Animate smoothly between representations.

Allow gentle pointer-based rotation.

Avoid physically inaccurate reflections or heavy assets.

MODE 3: INTERACTIVE WEB

Display layered spatial website panels.

Different interface elements occupy different depths.

Simulate page interaction:
- Cards respond to pointer
- Interface panels slide
- Depth responds to movement
- Elements settle naturally

MODE 4: MOTION

Create an interactive motion-design environment.

Visual components:
- Preview viewport
- Animated keyframe timeline
- Motion paths
- Floating editing controls

Show an elegant animated composition.

Each mode must look materially different.

MODE TRANSITIONS:
350–650ms.

Do not destroy and rebuild the entire 3D canvas unnecessarily.

Use smooth composited or 3D transitions.

DESKTOP:
Wide interactive experience.

MOBILE:
A touch-friendly, simplified version.
Use tap controls.
Reduce geometry and materials.
Preserve the core interaction.

If WebGL is unsupported:
Render attractive static visual previews with functional mode selection.

This section must not compromise site performance.

==================================================
10. HOMEPAGE — SECTION 3: SELECTED WORK
==================================================

Small label:
02 / SELECTED WORK

MAIN HEADLINE:

PROOF IS
IN THE PIXELS.

Supporting text:

"Every frame, every interaction, every detail—crafted with intention."

Create a premium portfolio experience.

LAYOUT:
Large editorial masonry-inspired grid with controlled card dimensions.

Desktop:
Alternating large and medium project tiles.

Tablet:
Two-column grid where appropriate.

Mobile:
Single-column, edge-to-edge-feeling cards with safe padding.

PROJECT CARD CONTENT:

- Project thumbnail
- Video preview when provided
- Project name
- Service category
- Short description
- Explore Project arrow

HOVER:
- Gentle media scale of about 1.03
- Video plays muted when possible
- Project information rises slightly
- Arrow moves diagonally
- Optional subtle lighting effect

MOBILE:
No hover dependency.
Tap opens project.
Video previews should not all autoplay simultaneously.

CATEGORY FILTERS:

All
SaaS Animation
3D Animation
Web Experiences
Video Editing

PORTFOLIO INTEGRITY:

Only use authentic supplied project materials or assets with proper permission.

Since client project files may not initially exist, implement editable project data and polished placeholders clearly marked as examples.

Do not invent client names, performance statistics, or ownership claims.

Project data must support:
slug
title
category
description
thumbnail
previewVideo
fullVideo
gallery
services
year
client
objectives
process
outcome

Optional fields should be omitted elegantly when unavailable.

Do not fill the portfolio with repeated generic stock images.

Provide a straightforward /data/projects.ts file for content management.

==================================================
11. HOMEPAGE — SECTION 4: SERVICES
==================================================

Small label:
03 / WHAT WE DO

Headline:

CREATIVITY,
ENGINEERED.

Introduce four dedicated capabilities.

SERVICE 01:

SAAS ANIMATION

Description:
"Turn complex software into clear, compelling stories through sophisticated motion design."

Capabilities:
- Product explainers
- Feature animations
- Launch videos
- UI motion

SERVICE 02:

3D ANIMATION

Description:
"Bring products and ideas to life through cinematic lighting, materials, and motion."

Capabilities:
- Product commercials
- Blender animation
- 3D visualization
- Brand visuals

SERVICE 03:

INTERACTIVE WEBSITES

Description:
"Transform conventional websites into memorable, responsive digital experiences."

Capabilities:
- Creative development
- WebGL experiences
- Interactive storytelling
- 3D product showcases

SERVICE 04:

VIDEO PRODUCTION

Description:
"Create polished video content designed to capture attention and communicate clearly."

Capabilities:
- Long-form editing
- Talking-head editing
- Commercial editing
- Motion graphics

DESIGN:

Not four boring identical cards.

Use an elegant sequence of large full-width service rows.

Each row contains:
- Number
- Service title
- Description
- Explore arrow
- Contextual preview

On hover:
The associated visual reveals or animates.

On mobile:
Stack content cleanly with an always-visible service link.

Every service must link to a real dedicated service page.

==================================================
12. HOMEPAGE — SECTION 5: SIGNATURE EXPERIENCE
==================================================

Small label:
04 / IMMERSIVE TECHNOLOGY

HEADLINE:

BEYOND THE
FLAT SCREEN.

Description:

"We create interactive experiences that transform passive viewing into active exploration."

Build one exceptional 3D demonstration.

CONCEPT:
A digital product interface transforming from a flat 2D design into a spatial interactive composition.

SEQUENCE:

Stage 1:
A realistic flat interface.

Stage 2:
UI layers separate through depth.

Stage 3:
Perspective becomes visible.

Stage 4:
Components become interactive.

Stage 5:
The composition settles into a polished dimensional layout.

Allow user-controlled exploration after the initial transformation.

Use scroll progress only while the section is in view.

DO NOT:
- Lock scrolling
- Force scroll snapping
- Hijack touch gestures
- Require several seconds before visitors can proceed

The section must have graceful mobile and reduced-motion alternatives.

This should feel like a genuine interactive portfolio capability demonstration.

==================================================
13. HOMEPAGE — SECTION 6: STUDIO PROCESS
==================================================

Small label:
05 / OUR APPROACH

HEADLINE:

FROM IDEA
TO IMPACT.

INTRODUCTION:
"A thoughtful creative process, from the first conversation to the final delivery."

PROCESS:

01 / DISCOVER
We understand your business, audience, objectives, and creative requirements.

02 / CONCEPT
We establish the visual direction, narrative, and production approach.

03 / CREATE
Our team develops, animates, refines, and tests the experience.

04 / DELIVER
We finalize, optimize, and prepare your creative assets for launch.

VISUAL DESIGN:

Thin animated technical timeline.

Large stage numbers.

Precise typography.

Progressive line illumination.

Subtle reveal animations.

No complex 3D required here.

Mobile:
Vertical timeline with clear content hierarchy.

==================================================
14. HOMEPAGE — SECTION 7: STUDIO PHILOSOPHY
==================================================

Small label:
06 / THE STUDIO

HEADLINE:

DETAIL IS
EVERYTHING.

BODY:

"We believe great creative work comes from the intersection of strategy, design, and technology. Every project is approached with a clear purpose: to create something memorable, functional, and beautifully executed."

Include a premium editorial layout.

Large type.
Generous whitespace.
Technical micro-labels.
Restrained graphic elements.

Provide areas for:
- Real team photographs
- Studio information
- Genuine client references
- Verified case studies

Until actual proof is supplied, omit testimonial and statistics components.

Never fabricate trust indicators.

CTA:
More About the Studio

Links to /about.

==================================================
15. HOMEPAGE — SECTION 8: CONTACT CTA
==================================================

This must be visually exceptional.

Small label:
07 / NEXT PROJECT

GIANT HEADLINE:

LET'S CREATE
SOMETHING
EXTRAORDINARY.

Use large responsive typography.

Emphasize EXTRAORDINARY with a subtle violet treatment.

Background:
Deep black with restrained blue/violet ambient lighting.

A premium glass contact panel should appear beneath the headline.

CTA 1:
Start Your Project

CTA 2:
Book a Discovery Call

Show the booking CTA only when a valid booking URL is configured.

The first CTA must always go to /contact.

Add a small supportive sentence:

"Tell us what you're building. We'll help you explore what's possible."

Avoid fake scarcity or unsupported promises.

==================================================
16. FOOTER
==================================================

Create a premium dark footer.

Include:

Taskelevate Studios logo

Short description:
"Creative technology, motion, and digital experiences."

Columns:

EXPLORE:
Work
Studio
Contact

SERVICES:
SaaS Animation
3D Animation
Interactive Websites
Video Editing

CONNECT:
Instagram
LinkedIn
Email

COMPANY:
Taskelevate
Privacy Policy
Terms

Only display social links with actual configured URLs.

Link parent brand:
https://taskelevate.com

Add a large low-contrast TASKELEVATE STUDIO wordmark-style typographic treatment in the bottom background.

Keep it understated and non-interfering.

Copyright:
Dynamic current year.

==================================================
17. DEDICATED SERVICE PAGES
==================================================

Create all four production-ready service pages:

/services/saas-animation
/services/3d-animation
/services/interactive-websites
/services/video-editing

Each service page must have:

1. Dedicated large hero
2. Specific service description
3. Real work or clearly labeled portfolio placeholders
4. Service deliverables
5. Process explanation
6. FAQ
7. Start a Project CTA
8. Related service navigation

EXACT PAGE HERO COPY:

SAAS ANIMATION:

Headline:
MAKE COMPLEX
LOOK SIMPLE.

Subheading:
"Premium SaaS explainers, UI animations, and product stories that help audiences understand what makes your software valuable."

3D ANIMATION:

Headline:
REALISM.
REIMAGINED.

Subheading:
"Cinematic 3D product visuals, precise materials, and compelling motion for brands that want to stand apart."

INTERACTIVE WEBSITES:

Headline:
THE WEB,
REINVENTED.

Subheading:
"Immersive, responsive websites that combine outstanding design with meaningful real-time interaction."

VIDEO EDITING:

Headline:
EVERY FRAME
MATTERS.

Subheading:
"Thoughtful long-form editing, short-form content, and brand videos crafted for clarity, pacing, and impact."

Service pages should be visually related but not repetitive clones.

Give each service an appropriate signature visual.

==================================================
18. PORTFOLIO ROUTES
==================================================

Create:

/work
/work/[slug]

WORK INDEX:

Filterable project gallery.

Category filters.

Large thumbnails.

Responsive layout.

Attractive loading states.

PROJECT DETAIL PAGE:

- Project hero
- Title
- Category
- Overview
- Visual media
- Creative approach
- Final showcase
- Related projects
- Inquiry CTA

Optional content should disappear elegantly if absent.

Never fabricate case study outcomes.

Provide a clean system for adding projects without editing page components.

==================================================
19. ABOUT PAGE
==================================================

Route:
/about

Headline:

WHERE CREATIVITY
MEETS ENGINEERING.

Content:
- Studio philosophy
- Core disciplines
- Design methodology
- Production approach
- Team section when real assets are provided
- Project CTA

The About page should feel like a premium brand story, not a corporate brochure.

==================================================
20. CONTACT PAGE
==================================================

Route:
/contact

Headline:

TELL US
WHAT'S NEXT.

Description:

"Share your idea, challenge, or upcoming project. We'll take it from there."

Design a polished contact form.

FIELDS:

Full Name — required
Work Email — required
Company / Brand — optional
Service — required
Estimated Budget — optional
Project Timeline — optional
Project Description — required

SERVICE OPTIONS:

SaaS Animation
3D Product Animation
Interactive Website
Video Editing
Other Creative Project

BUDGET OPTIONS:

Under $1,000
$1,000–$2,500
$2,500–$5,000
$5,000–$10,000
$10,000+
Not sure yet

TIMELINE OPTIONS:

As soon as possible
Within 2–4 weeks
Within 1–3 months
Flexible

FORM STYLE:

Large clean inputs.

Subtle glass surfaces.

Clear labels.

Excellent mobile usability.

Visible focus states.

Inline validation.

Premium success and error states.

FUNCTIONAL REQUIREMENTS:

Use a real server-side submission endpoint.

Use Zod validation.

Include honeypot spam protection.

Implement configurable rate limiting for production.

Integrate a transactional email provider such as Resend using environment variables.

Do not expose API keys client-side.

Do not pretend submissions succeed when email delivery is not configured.

If the required environment variables are absent, clearly indicate that submission delivery is unavailable and offer a configured email or booking fallback when available.

Use helpful, nontechnical user-facing error messages.

After real successful delivery:
Show confirmation state.

Avoid duplicate submissions.

==================================================
21. INSTAGRAM CLIENT ACQUISITION
==================================================

The website will receive visitors from multiple Instagram creator accounts.

It must track which service and campaign produced an inquiry.

Support URL parameters:

utm_source
utm_medium
utm_campaign
utm_content
utm_term

Example:

/services/saas-animation?utm_source=instagram&utm_medium=organic&utm_campaign=saas_creator_01

Preserve campaign attribution during navigation to the contact page.

Include these values in the contact form submission.

Store attribution only with appropriate privacy practices.

Add configurable analytics support.

Track events:

- work_viewed
- service_viewed
- project_opened
- project_inquiry_started
- project_inquiry_submitted
- booking_clicked

Do not install unnecessary trackers.

Analytics should be configurable and respect applicable consent requirements.

==================================================
22. MOTION DESIGN LANGUAGE
==================================================

Motion is one of our strongest selling points.

The animation must feel engineered, not randomly generated.

MOTION PRINCIPLES:

Purposeful.
Fast.
Fluid.
Elegant.
Precise.
Natural.

USE:

- Kinetic masked text reveals
- Staggered typography
- Scroll-triggered entrances
- Refined interface transitions
- Premium hover animation
- Controlled parallax
- Animated technical lines
- Subtle lighting responses
- Smooth mode switching
- Scroll-driven 3D transformations
- High-quality loading skeletons where needed

DO NOT USE:

- Scroll hijacking
- Constant page movement
- Random bouncing components
- Multi-second forced loaders
- Dramatic zoom on every section
- Heavy effects on small text
- Continuous layout recalculations
- Animation that blocks navigation
- Animations that replay aggressively on minor scroll changes

Default animation durations:

Microinteractions:
120–220ms.

Card reveals:
250–450ms.

Section transitions:
450–750ms.

Hero sequence:
About 1600ms maximum.

Use GSAP ScrollTrigger where precise timeline control is necessary.

Use Motion for simple React microinteractions.

Avoid giving multiple animation libraries control of the same DOM property.

Always clean up ScrollTrigger instances and listeners.

Respect prefers-reduced-motion.

==================================================
23. SCROLLING EXPERIENCE
==================================================

Scrolling must be incredibly smooth, native-feeling, and comfortable.

Do not intercept or hijack every wheel or touch event.

Prefer native browser scrolling.

Use CSS scroll behavior only where appropriate.

If a smooth scrolling library is considered, only use it when actual device testing demonstrates a clear improvement.

Avoid Lenis by default unless required.

Do not introduce scroll lag to achieve a cinematic effect.

Maintain 60fps interactions on capable devices.

Scroll animations should degrade gracefully under load.

Content must be readable even when JavaScript animation fails.

==================================================
24. TRUE RESPONSIVE DESIGN
==================================================

MOBILE DESIGN IS AS IMPORTANT AS DESKTOP DESIGN.

Do not create a desktop website and merely shrink it.

Build all sections intentionally for mobile.

TEST VIEWPORTS:

320 x 568
360 x 800
375 x 812
390 x 844
430 x 932
768 x 1024
1024 x 768
1280 x 800
1440 x 900
1920 x 1080

IMPORTANT:

- No horizontal scrolling
- No clipped headlines
- No overlapping CTAs
- No unreadable labels
- No broken navigation
- No hover-only functionality
- No giant empty sections
- No excessive animation stutter
- No fixed-height containers that clip content

Touch targets:
At least 44 x 44px.

Respect iOS safe-area insets.

Handle mobile Safari address-bar viewport changes.

Use appropriate dvh/svh units.

Prioritize perceived speed on mobile.

MEDIA:

Use next/image or suitable responsive image components.

Use compressed AVIF/WebP where appropriate.

Use correctly sized video posters.

Lazy-load below-the-fold media.

Do not autoplay six HD videos on mobile.

==================================================
25. 3D PERFORMANCE STRATEGY
==================================================

Our 3D must look sophisticated without becoming heavy.

Use:

Three.js
React Three Fiber
Drei

Do not use WebGL for ordinary buttons, navigation, or simple visual cards.

Prefer CSS transforms for 2D and lightweight depth effects.

Limit the page to the meaningful 3D experiences defined earlier.

Use dynamic imports for 3D modules.

Load heavyweight 3D only when approaching the viewport or requested by user interaction.

Set adaptive DPR based on device capability.

Use efficient geometry.

Reuse materials.

Avoid unnecessary shadow maps.

Avoid expensive postprocessing on mobile.

Avoid huge environment textures.

Minimize draw calls.

Dispose of textures, geometries, and resources properly.

Pause or reduce animation when content is outside the viewport.

Use IntersectionObserver as appropriate.

Respect tab visibility.

Support graceful fallback when WebGL is unavailable.

Do not block the main thread with expensive asset processing.

If a 3D feature is too expensive, implement a lighter alternative instead of compromising the entire page.

==================================================
26. PERFORMANCE TARGETS
==================================================

The website must feel extremely fast.

Target Core Web Vitals:

LCP:
2.5 seconds or better at the 75th percentile.

INP:
200ms or better at the 75th percentile.

CLS:
0.1 or lower at the 75th percentile.

These are target thresholds, not promises for every network or device.

Aim for:
Lighthouse Performance 90+ on representative desktop and mobile tests.

Accessibility 95+.

Best Practices 95+.

SEO 95+.

Do not manipulate or fake Lighthouse scores.

Keep first-load JavaScript minimal.

Do not put the primary above-the-fold content behind WebGL initialization.

Load fonts efficiently.

Avoid large layout shifts.

Preload only truly critical resources.

Reduce hydration overhead.

Make server-rendered content the default where possible.

==================================================
27. ACCESSIBILITY
==================================================

Implement:

- Semantic HTML
- Clear heading structure
- Keyboard navigation
- Visible focus indicators
- Accessible dropdowns
- Accessible modal dialogs
- Reduced motion support
- Sufficient color contrast
- Proper form labels
- Meaningful alternative text
- Accessible video controls
- Screen reader friendly animated text
- ARIA only where necessary

Aim for WCAG 2.2 AA.

Do not use animation as the only way to communicate meaning.

==================================================
28. TECHNICAL STACK
==================================================

Initialize a fresh Next.js project.

Use:

Next.js App Router
React
TypeScript
Tailwind CSS
Three.js
@react-three/fiber
@react-three/drei
GSAP with ScrollTrigger
Motion
Lucide React
Zod
React Hook Form
Resend integration
Vercel hosting

Choose currently stable, mutually compatible versions.

Use the modern established APIs for each dependency.

Do not rely on deprecated packages.

Use strict TypeScript.

Use functional React components.

Use server components by default.

Add "use client" only where necessary.

Use reusable design components.

Keep content separate from presentation.

Avoid large monolithic page components.

Do not install an entire UI component library merely to get basic cards and buttons.

Build distinctive custom components.

==================================================
29. PROJECT ARCHITECTURE
==================================================

Use a clean, maintainable project structure approximately like:

```
src/
  app/
    page.tsx
    layout.tsx
    globals.css
    work/
      page.tsx
      [slug]/
        page.tsx
    services/
      saas-animation/page.tsx
      3d-animation/page.tsx
      interactive-websites/page.tsx
      video-editing/page.tsx
    about/page.tsx
    contact/page.tsx
    api/contact/route.ts
  components/
    layout/   Navbar.tsx, MobileMenu.tsx, Footer.tsx
    glass/    GlassSurface.tsx, GlassButton.tsx, GlassPanel.tsx
    hero/     Hero.tsx, KineticHeadline.tsx
    three/    CreativeEngine.tsx, SaaSScene.tsx, ProductScene.tsx, WebScene.tsx, MotionScene.tsx, SpatialExperience.tsx
    work/     ProjectCard.tsx, ProjectGallery.tsx, ProjectFilters.tsx
    sections/ ServicesSection.tsx, ProcessSection.tsx, StudioSection.tsx, ContactCTA.tsx
    forms/    ProjectInquiryForm.tsx
    ui/       SectionHeading.tsx, RevealText.tsx, AnimatedButton.tsx
  data/       projects.ts, services.ts, navigation.ts, site-config.ts
  lib/        animations/, analytics/, forms/, utils/
  hooks/      useReducedMotion.ts, useMediaQuery.ts
public/
  brand/ projects/ textures/ models/ posters/
```

You may improve this structure where technically justified, but retain the clear separation of concerns.

==================================================
30. SEO AND SHARING
==================================================

Implement full metadata.

HOME TITLE:
Taskelevate Studios | SaaS Animation, 3D & Creative Technology

HOME DESCRIPTION:
Taskelevate Studios creates premium SaaS animations, cinematic 3D visuals, interactive websites, and professional video content for ambitious brands.

Provide unique metadata for each service page.

Implement:
- Canonical URLs
- Open Graph metadata
- Twitter/X preview metadata
- robots.txt
- sitemap.xml
- Correct heading hierarchy
- Descriptive project URLs
- Organization structured data using verified details only

Generate an original social preview composition using the approved brand assets.

No fake rankings or unverified claims.

==================================================
31. BOOKING AND CONTACT
==================================================

The business currently uses Calendly.

Create a configurable booking URL in site-config.ts or environment variables.

Do not invent a Calendly link.

When configured:
The Book a Call button must open the genuine scheduling destination.

Without a configured booking URL:
Hide that button and keep the project inquiry CTA functioning.

All CTAs must have genuine destinations.

No empty href values.

No placeholder buttons that pretend to work.

==================================================
32. DEPLOYMENT
==================================================

Target deployment:
Vercel.

Production hostname:
studio.taskelevate.com

Provide:

- Working build scripts
- Environment variable example
- Deployment instructions
- Vercel configuration if necessary
- DNS instructions for subdomain connection
- Guidance for SSL verification

The parent website taskelevate.com must remain untouched.

Do not modify its existing DNS records unnecessarily.

Only add the records required for studio.taskelevate.com, based on the actual Vercel project configuration.

==================================================
33. DELIVERABLES
==================================================

You must provide:

1. Fully initialized application
2. Responsive homepage
3. All four service pages
4. Portfolio index
5. Dynamic project pages
6. About page
7. Contact page
8. Liquid-glass navigation system
9. Kinetic typography
10. Interactive 3D creative engine
11. Signature scroll-based visual experience
12. Reusable components
13. Fully configured responsive styles
14. Media placeholder and asset management system
15. SEO metadata
16. Accessible UI
17. Contact backend integration scaffold
18. Environment configuration example
19. README
20. Vercel deployment guidance

Do not report that a feature is complete if it is still only a placeholder.

==================================================
34. QUALITY CONTROL
==================================================

After implementation:

Run:
- TypeScript checks
- ESLint
- Production build

Use an available browser automation tool to inspect the actual rendered pages.

Check:
- Navigation
- Dropdowns
- Responsive layouts
- Mobile menus
- CTA destinations
- 3D scene loading
- Fallback states
- Portfolio filtering
- Contact form validation
- Page transitions
- Reduced motion
- Keyboard navigation

Check mobile Safari-specific behavior where tooling permits.

Fix any discovered issues.

If browser automation isn't available, say so clearly and provide a manual verification checklist instead of claiming successful browser QA.

Capture screenshots if screenshot tooling is available.

Do not invent benchmark numbers or test results.

==================================================
35. IMPLEMENTATION ORDER
==================================================

Work in this exact sequence:

STEP 1: Initialize project and dependencies.
STEP 2: Create global design tokens, fonts, and responsive layout system.
STEP 3: Implement original-logo integration and the liquid-glass navigation.
STEP 4: Implement the cinematic typography-first hero.
STEP 5: Implement homepage content sections and functional navigation.
STEP 6: Create the interactive 3D Creative Engine.
STEP 7: Build the featured spatial experience.
STEP 8: Build the full portfolio and service pages.
STEP 9: Build contact form, booking integration hooks, and attribution capture.
STEP 10: Optimize motion, responsiveness, accessibility, and performance.
STEP 11: Run all available tests and correct failures.
STEP 12: Provide launch and deployment documentation.

Do not skip directly into giant WebGL scenes before the page layout and visual foundation are correct.

==================================================
36. CREATIVE QUALITY BAR
==================================================

The final website should feel as if a multidisciplinary team spent significant effort polishing every section.

The best visual qualities should be:

- Confident oversized typography
- Extremely refined navigation
- Sophisticated liquid-glass surfaces
- Technically meaningful 3D
- Beautifully choreographed text reveals
- Smooth, natural interactions
- Large cinematic project showcases
- Excellent mobile composition
- Exceptional attention to spacing
- Strong contrast and readability
- Minimal visual clutter
- Clear conversion paths

THE MOST IMPORTANT RULE:

Do not confuse complexity with quality.

A beautiful, fast, carefully polished interaction is better than a heavy and complicated effect.

If a proposed feature sacrifices performance or usability, simplify it while preserving visual sophistication.

This should be a creative studio website that visitors remember because the design, storytelling, and engineering work together.

Not because everything is moving all the time.

==================================================
37. FINAL EXECUTION INSTRUCTION
==================================================

Begin now.

Assume the working directory is the root of a new project.

First inspect the environment and identify available tools.

Then implement the website.

Do not stop at design descriptions, mockups, TODO lists, or component skeletons.

Write actual code.

Use the exact copy, design directions, and interactions specified in this brief.

Use clearly identified placeholders only where required business assets or credentials are genuinely unavailable.

For those missing assets, create a concise ASSETS_NEEDED.md file.

Do not ask for aesthetic preferences already specified in this prompt.

Make reasonable engineering decisions within the approved architecture.

Run the application.

Verify the available functionality.

Fix build and type errors.

At completion, provide:

- A concise implementation summary
- Local preview instructions
- What is fully working
- What requires real assets or credentials
- Any incomplete features
- Actual test results
- Deployment instructions

START BUILDING TASKELEVATE STUDIOS.

CRAFTING THE UNEXPECTED.
