/**
 * Service content — single source of truth for the homepage service rows,
 * navigation dropdown, footer, contact form options and the four service pages.
 *
 * Headline strings use a tiny markup:  "\n" = line break,  *word* = violet italic emphasis.
 */

import type { ProjectCategory } from "./projects";

export type ServiceSlug = "saas-animation" | "3d-animation" | "interactive-websites" | "video-editing";
export type ServiceVisual = "saas" | "product" | "web" | "edit";
export type ServiceIcon = "layout-dashboard" | "box" | "mouse-pointer-click" | "clapperboard";

export interface ServiceStep {
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface Service {
  slug: ServiceSlug;
  href: `/services/${ServiceSlug}`;
  index: string;
  /** Short label used in nav, footer and filters */
  label: string;
  /** Title of the homepage service row */
  rowTitle: string;
  /** Exact homepage description from the brief */
  rowDescription: string;
  capabilities: string[];
  /** One-line blurb in the Services dropdown */
  blurb: string;
  icon: ServiceIcon;
  visual: ServiceVisual;
  projectCategory: ProjectCategory;
  /** Value pre-selected in the contact form when arriving from this service */
  inquiryValue: InquiryService;
  page: {
    headline: string;
    subheading: string;
    metaTitle: string;
    metaDescription: string;
    intro: string[];
    deliverables: ServiceStep[];
    process: ServiceStep[];
    faqs: ServiceFaq[];
    visualCaption: string;
  };
}

export const inquiryServices = [
  "SaaS Animation",
  "3D Product Animation",
  "Interactive Website",
  "Video Editing",
  "Other Creative Project",
] as const;
export type InquiryService = (typeof inquiryServices)[number];

export const services: Service[] = [
  {
    slug: "saas-animation",
    href: "/services/saas-animation",
    index: "01",
    label: "SaaS Animation",
    rowTitle: "SAAS ANIMATION",
    rowDescription:
      "Turn complex software into clear, compelling stories through sophisticated motion design.",
    capabilities: ["Product explainers", "Feature animations", "Launch videos", "UI motion"],
    blurb: "Explainers, feature films and UI motion",
    icon: "layout-dashboard",
    visual: "saas",
    projectCategory: "saas-animation",
    inquiryValue: "SaaS Animation",
    page: {
      headline: "MAKE COMPLEX\nLOOK *SIMPLE.*",
      subheading:
        "Premium SaaS explainers, UI animations, and product stories that help audiences understand what makes your software valuable.",
      metaTitle: "SaaS Animation & Product Explainer Videos",
      metaDescription:
        "Premium SaaS explainer videos, feature animations, launch films and UI motion design by Taskelevate Studios.",
      intro: [
        "Software is abstract. Your audience can't touch it, and a screen recording rarely shows why it matters. We translate products into motion: the problem, the moment of clarity, and the interface doing exactly what it promises.",
        "Every piece starts from your real product — its UI, its language, its edge — and is rebuilt as clean, precise animation that works on a landing page, in a launch thread, inside onboarding, or on a sales call.",
      ],
      deliverables: [
        { title: "Product explainers", description: "Narrative videos that frame the problem and walk through how your product solves it." },
        { title: "Feature animations", description: "Short, focused clips that show a single capability — ideal for release notes and social." },
        { title: "Launch videos", description: "High-energy films built around a release moment, with cutdowns for every channel." },
        { title: "UI motion systems", description: "Reusable interface animation — transitions, micro-interactions and hero loops for your site and app." },
        { title: "Platform cutdowns", description: "Vertical, square and widescreen versions so one production covers web, Instagram and LinkedIn." },
        { title: "Source & handoff", description: "Organised project files and exports, delivered in the formats your team actually uses." },
      ],
      process: [
        { title: "Product deep-dive", description: "We learn the product, the audience and the one idea the video must land." },
        { title: "Script & storyboard", description: "A tight script and frame-by-frame board, so the story is right before anything moves." },
        { title: "Style frames", description: "Key frames that lock the visual language — type, colour, UI treatment and pacing." },
        { title: "Animation & sound", description: "Full animation, refined across review rounds, finished with sound design and music." },
        { title: "Delivery", description: "Final masters and channel-specific cutdowns, optimised and ready to publish." },
      ],
      faqs: [
        {
          question: "Do you need access to our product?",
          answer:
            "Screenshots, design files (Figma is ideal) or a demo account all work. We rebuild the interface in animation, so it stays crisp and on-brand rather than relying on screen recordings.",
        },
        {
          question: "How long does a SaaS explainer take?",
          answer:
            "It depends on length, complexity and how quickly feedback comes back. After a discovery call we share a production schedule with clear review points before any work begins.",
        },
        {
          question: "Can you write the script?",
          answer:
            "Yes. Scriptwriting and storyboarding are part of the process — or we can work from a script your team has already approved.",
        },
        {
          question: "Which formats will we receive?",
          answer:
            "Typically a widescreen master plus vertical and square cutdowns. Exact formats, lengths and resolutions are agreed up front.",
        },
      ],
      visualCaption: "Layered UI composition — rebuilt from product design, not screen-recorded.",
    },
  },
  {
    slug: "3d-animation",
    href: "/services/3d-animation",
    index: "02",
    label: "3D Animation",
    rowTitle: "3D ANIMATION",
    rowDescription: "Bring products and ideas to life through cinematic lighting, materials, and motion.",
    capabilities: ["Product commercials", "Blender animation", "3D visualization", "Brand visuals"],
    blurb: "Blender product films and 3D visualisation",
    icon: "box",
    visual: "product",
    projectCategory: "3d-animation",
    inquiryValue: "3D Product Animation",
    page: {
      headline: "REALISM.\n*REIMAGINED.*",
      subheading:
        "Cinematic 3D product visuals, precise materials, and compelling motion for brands that want to stand apart.",
      metaTitle: "3D Product Animation & Blender Visualisation",
      metaDescription:
        "Cinematic Blender product animation, 3D visualisation, product commercials and brand visuals by Taskelevate Studios.",
      intro: [
        "A product film should feel like holding the product. We model, light and animate with physical accuracy — real materials, believable reflections, deliberate camera work — so every surface reads exactly as it should.",
        "Because everything is built in 3D, one production keeps paying off: hero films, stills for your store, exploded views for features, and assets your web team can reuse in real time.",
      ],
      deliverables: [
        { title: "Product commercials", description: "Cinematic hero films with considered camera moves, lighting and sound." },
        { title: "Blender animation", description: "Modelling, look development and animation produced in Blender." },
        { title: "3D visualisation", description: "Photoreal stills and turntables for e-commerce, decks and press." },
        { title: "Exploded & feature views", description: "Technical breakdowns that show what's inside and how it works." },
        { title: "Brand visuals", description: "Abstract and product-led 3D loops that extend your visual identity." },
        { title: "Real-time ready assets", description: "Optimised models that can move into interactive web experiences." },
      ],
      process: [
        { title: "Reference & intent", description: "CAD, photos or samples — plus the feeling the film needs to create." },
        { title: "Modelling", description: "Accurate geometry built from your references, checked against the real thing." },
        { title: "Look development", description: "Materials, lighting and camera tests until the product looks unmistakably right." },
        { title: "Animation & render", description: "Choreographed motion, rendered at final quality, then graded and sound-designed." },
        { title: "Delivery", description: "Masters, cutdowns and stills — plus models prepared for any real-time use." },
      ],
      faqs: [
        {
          question: "What do you need from us to start?",
          answer:
            "CAD or existing 3D files are ideal. If they don't exist, detailed photos, dimensions or a physical sample let us model the product accurately.",
        },
        {
          question: "Do you work in Blender only?",
          answer:
            "Blender is our core production tool. If your team needs specific formats for other software or real-time engines, we'll agree on exports at the start.",
        },
        {
          question: "Can the 3D assets be used on our website?",
          answer:
            "Yes — models can be optimised for real-time WebGL, which pairs naturally with our interactive website service.",
        },
        {
          question: "How many revisions are included?",
          answer:
            "Review rounds are defined in the proposal for each stage, so feedback happens where it is cheapest to change — before final rendering.",
        },
      ],
      visualCaption: "Real-time product study — switch between wireframe, clay and final materials.",
    },
  },
  {
    slug: "interactive-websites",
    href: "/services/interactive-websites",
    index: "03",
    label: "Interactive Websites",
    rowTitle: "INTERACTIVE WEBSITES",
    rowDescription: "Transform conventional websites into memorable, responsive digital experiences.",
    capabilities: ["Creative development", "WebGL experiences", "Interactive storytelling", "3D product showcases"],
    blurb: "Creative development, WebGL and 3D web",
    icon: "mouse-pointer-click",
    visual: "web",
    projectCategory: "web-experiences",
    inquiryValue: "Interactive Website",
    page: {
      headline: "THE WEB,\n*REINVENTED.*",
      subheading:
        "Immersive, responsive websites that combine outstanding design with meaningful real-time interaction.",
      metaTitle: "Interactive 3D Websites & Creative Development",
      metaDescription:
        "Interactive websites, WebGL experiences, 3D product showcases and creative development by Taskelevate Studios.",
      intro: [
        "Most websites are read. The best ones are explored. We design and engineer sites where interaction carries the story — products you can turn, interfaces that respond, and scroll sequences that reveal rather than decorate.",
        "Performance is part of the design. Every experience is built to be fast, accessible and fully responsive, with graceful fallbacks so the message lands on every device.",
      ],
      deliverables: [
        { title: "Creative development", description: "Custom front-end engineering for sites that don't fit a template." },
        { title: "WebGL experiences", description: "Real-time 3D built with Three.js and React Three Fiber." },
        { title: "Interactive storytelling", description: "Scroll-driven narratives and motion that guide attention." },
        { title: "3D product showcases", description: "Configurable, rotatable products directly in the browser." },
        { title: "Design systems", description: "Components, motion rules and tokens your team can extend." },
        { title: "Performance & accessibility", description: "Core Web Vitals, reduced-motion support and keyboard access built in." },
      ],
      process: [
        { title: "Strategy", description: "Audience, goals and the interactions that will genuinely help them." },
        { title: "Design", description: "Layouts, motion principles and prototypes for the key moments." },
        { title: "Engineering", description: "Production code, real-time 3D and content structure." },
        { title: "Testing", description: "Real devices, performance budgets, accessibility and fallbacks." },
        { title: "Launch", description: "Deployment, analytics and a handover your team can run with." },
      ],
      faqs: [
        {
          question: "Will a 3D website be slow?",
          answer:
            "It shouldn't be. We load 3D only when it's needed, adapt quality to the device, and provide lightweight fallbacks — the rest of the site stays fast and fully usable.",
        },
        {
          question: "Which stack do you use?",
          answer:
            "Typically Next.js, React and TypeScript, with Three.js / React Three Fiber for real-time 3D and GSAP for motion. We're happy to discuss your existing stack.",
        },
        {
          question: "Can you work with our existing design team?",
          answer:
            "Yes. We can take designs through to production, or collaborate on the interactive and motion layers while your team leads the brand.",
        },
        {
          question: "Do you handle hosting?",
          answer:
            "We can deploy to platforms like Vercel and configure your domain, or hand over to your team's infrastructure.",
        },
      ],
      visualCaption: "Spatial interface study — layers respond to your pointer and settle into place.",
    },
  },
  {
    slug: "video-editing",
    href: "/services/video-editing",
    index: "04",
    label: "Video Editing",
    rowTitle: "VIDEO PRODUCTION",
    rowDescription:
      "Create polished video content designed to capture attention and communicate clearly.",
    capabilities: ["Long-form editing", "Talking-head editing", "Commercial editing", "Motion graphics"],
    blurb: "Long-form, talking-head and commercial edits",
    icon: "clapperboard",
    visual: "edit",
    projectCategory: "video-editing",
    inquiryValue: "Video Editing",
    page: {
      headline: "EVERY FRAME\n*MATTERS.*",
      subheading:
        "Thoughtful long-form editing, short-form content, and brand videos crafted for clarity, pacing, and impact.",
      metaTitle: "Video Editing — Long-form, Talking-head & Commercial",
      metaDescription:
        "Long-form, talking-head, short-form and commercial video editing with motion graphics by Taskelevate Studios.",
      intro: [
        "Editing is where a video finds its rhythm. We shape raw footage into something people actually finish watching — tight structure, deliberate pacing, clean sound and graphics that clarify instead of distract.",
        "From long-form interviews to short-form social and commercial spots, every edit is built around the platform it lives on and the action you want viewers to take.",
      ],
      deliverables: [
        { title: "Long-form editing", description: "Interviews, podcasts and YouTube content with strong structure and pacing." },
        { title: "Talking-head editing", description: "Clean cuts, framing, captions and B-roll that keep attention on the message." },
        { title: "Short-form content", description: "Vertical edits designed for the first second, not the last." },
        { title: "Commercial editing", description: "Brand spots and product videos with polished grade and sound." },
        { title: "Motion graphics", description: "Titles, lower thirds, callouts and animated explainers inside the edit." },
        { title: "Colour & sound", description: "Consistent grading, audio clean-up and mixing for a finished feel." },
      ],
      process: [
        { title: "Brief & footage", description: "Goals, references and organised source files — we'll guide the handover." },
        { title: "Structure", description: "A first assembly that locks the story and the pacing." },
        { title: "Refinement", description: "Cuts, graphics, captions and B-roll refined across review rounds." },
        { title: "Finishing", description: "Colour, sound and platform-specific exports." },
        { title: "Delivery", description: "Final files, named and organised, ready to publish." },
      ],
      faqs: [
        {
          question: "How do we send footage?",
          answer:
            "Any reliable file-transfer or cloud storage link works. We'll share a simple checklist so files arrive organised.",
        },
        {
          question: "Can you edit recurring content?",
          answer:
            "Yes. Ongoing editing for regular long-form or short-form output is a natural fit — we'll agree on a workflow and turnaround together.",
        },
        {
          question: "Do you add captions and graphics?",
          answer:
            "Captions, titles, lower thirds and motion graphics can all be included, styled to match your brand.",
        },
        {
          question: "Which platforms do you edit for?",
          answer:
            "YouTube, Instagram, TikTok, LinkedIn, websites and paid ads — each export is formatted for where it will be watched.",
        },
      ],
      visualCaption: "Multi-track edit study — pacing, structure and finish, frame by frame.",
    },
  },
];

export function getService(slug: ServiceSlug): Service {
  const service = services.find((s) => s.slug === slug);
  if (!service) throw new Error(`Unknown service: ${slug}`);
  return service;
}

export function getServiceByInquiryParam(param: string | null | undefined): Service | undefined {
  if (!param) return undefined;
  return services.find((s) => s.slug === param);
}
