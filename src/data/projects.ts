/**
 * PORTFOLIO CONTENT
 * -----------------
 * Add, edit or remove projects here — no page component needs to change.
 *
 * ⚠️ INTEGRITY RULES
 *  - Only publish real projects you own or have written permission to show.
 *  - Never invent clients, metrics or outcomes. Omit a field rather than guess.
 *  - Entries with `isExample: true` are layout placeholders. They render with an
 *    "Example" badge and an on-page notice. Replace or delete them before launch
 *    (see ASSETS_NEEDED.md).
 *
 * MEDIA
 *  - Real footage: run scripts/encode-work.sh "<source>" <slug> <start> <seconds> → /public/media/work/<slug>/
 *    (preview.mp4 muted loop, poster.jpg, full.mp4 with sound), then spread workMedia(...) into the entry.
 *  When `thumbnail` is absent, the generated `art` composition is shown instead.
 */

export type ProjectCategory = "saas-animation" | "3d-animation" | "web-experiences" | "video-editing";

export const projectCategories: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "saas-animation", label: "SaaS Animation" },
  { id: "3d-animation", label: "3D Animation" },
  { id: "web-experiences", label: "Web Experiences" },
  { id: "video-editing", label: "Video Editing" },
];

export function categoryLabel(id: ProjectCategory): string {
  return projectCategories.find((c) => c.id === id)?.label ?? id;
}

/** Generated placeholder compositions (see components/work/ProjectArt.tsx). */
export type ProjectArtVariant =
  | "saas-dashboard"
  | "saas-flow"
  | "product-studio"
  | "product-exploded"
  | "web-configurator"
  | "web-layers"
  | "edit-interview"
  | "edit-vertical";

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProjectVideo {
  src: string;
  poster?: string;
  /** WebVTT captions track, strongly recommended for accessibility */
  captions?: string;
}

export interface ProjectStep {
  title: string;
  description: string;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  description: string;
  /** Layout placeholder — renders an "Example" badge + notice. */
  isExample?: boolean;
  featured?: boolean;
  thumbnail?: ProjectImage;
  art?: ProjectArtVariant;
  /** id from src/data/media.ts — moving footage shown when there is no thumbnail/preview */
  clip?: string;
  /** Muted hover/in-view preview loop */
  previewVideo?: string;
  fullVideo?: ProjectVideo;
  gallery?: ProjectImage[];
  services?: string[];
  year?: number;
  client?: string;
  overview?: string;
  objectives?: string[];
  process?: ProjectStep[];
  /** Only real, verifiable results. Never estimate. */
  outcome?: string;
  /** A film library shown on the case-study page (see src/data/saas-films.ts). */
  films?: "saas";
}

/** Real footage, encoded by scripts/encode-work.sh into /public/media/work/<slug>/ (preview loop, poster, full cut). */
function workMedia(slug: string, width: number, height: number, alt: string): Pick<Project, "thumbnail" | "previewVideo" | "fullVideo"> {
  const base = `/media/work/${slug}`;
  return {
    thumbnail: { src: `${base}/poster.jpg`, alt, width, height },
    previewVideo: `${base}/preview.mp4`,
    fullVideo: { src: `${base}/full.mp4`, poster: `${base}/poster.jpg` },
  };
}

// Write-ups describe what each film shows. Client names, tools and results are added only when confirmed.
export const projects: Project[] = [
  {
    slug: "saas-animation-films",
    title: "SaaS Animation — Selected Films",
    category: "saas-animation",
    featured: true,
    art: "saas-flow",
    ...workMedia("saas-animation-films", 1280, 720, "SaaS animation reel — product interfaces in motion across launch films and teasers"),
    description: "Twenty-five product films — launch films, explainers, teasers and vertical spots for AI, fintech and software products.",
    overview:
      "A library of the studio's SaaS animation: product interfaces rebuilt as motion, launch films and explainers that walk through a workflow, short teasers and vertical spots for social. Concept pieces built around well-known brands are marked as concepts.",
    services: ["Launch films", "Explainers", "UI animation", "Vertical spots"],
    films: "saas",
  },
  {
    slug: "saas-launch-explainer",
    title: "SaaS Launch Explainer",
    category: "saas-animation",
    featured: true,
    art: "saas-dashboard",
    ...workMedia("saas-launch-explainer", 1276, 720, "SaaS explainer — retail scenes and the product's animated interface"),
    description: "A product explainer that moves from real-world retail scenes into the platform's own animated interface.",
    overview:
      "A launch explainer for a retail-operations platform: on-location scenes set up the problem, the product's interface is rebuilt as clean, animated UI, and the integrations it connects close the story — paced for clarity from the first frame.",
    services: ["Script", "Storyboard", "UI animation", "Sound design"],
    process: [
      { title: "Product deep-dive", description: "Map the workflow and find the single idea the film must land." },
      { title: "Storyboard", description: "Frame-by-frame plan pairing narration with interface moments." },
      { title: "Animation", description: "Rebuild the UI as vector layers and choreograph every transition." },
    ],
  },
  {
    slug: "product-hero-film",
    title: "Product Hero Film",
    category: "3d-animation",
    featured: true,
    art: "product-studio",
    ...workMedia("product-hero-film", 1280, 720, "Product hero film — a street at golden hour, the product in motion"),
    description: "A cinematic product film built on mood, light and a single confident step.",
    overview:
      "A short hero film that sells the feeling before the features: golden-hour light on an old-town street, slow camera moves and close details that keep the product at the centre of every frame.",
    services: ["Concept", "Art direction", "Animation", "Grade"],
    process: [
      { title: "Reference", description: "Gather references and the feeling the film should create." },
      { title: "Look development", description: "Light, colour and material studies until every surface reads correctly." },
      { title: "Camera & motion", description: "Choreograph reveals that guide the eye to what matters." },
    ],
  },
  {
    slug: "interactive-product-configurator",
    title: "Interactive 3D Configurator",
    category: "web-experiences",
    featured: true,
    art: "web-configurator",
    ...workMedia("interactive-product-configurator", 1280, 960, "Interactive 3D configurator — an exhibition booth assembled live in the browser"),
    description: "A real-time WebGL configurator: choose a layout, add fittings, and watch the booth build itself live.",
    overview:
      "A browser-based 3D configurator for exhibition stands. Visitors pick a floor plan, then add and arrange walls, furniture and displays while the booth updates in real time — a sales conversation turned into something people can explore themselves.",
    services: ["Creative development", "WebGL", "3D optimisation", "UX design"],
    process: [
      { title: "Interaction design", description: "Decide what visitors can touch, and why it helps them choose." },
      { title: "Real-time build", description: "Optimised geometry, materials and adaptive rendering quality." },
      { title: "Performance pass", description: "Lazy loading, device testing and accessible fallbacks." },
    ],
  },
  {
    slug: "founder-story-edit",
    title: "Founder Story Edit",
    category: "video-editing",
    featured: true,
    art: "edit-interview",
    ...workMedia("founder-story-edit", 540, 960, "Founder story edit — vertical talking-head video with kinetic captions"),
    description: "A vertical founder edit with kinetic captions, cinematic inserts and on-screen UI moments.",
    overview:
      "A talking-head piece shaped for social: a strong cold open, captions that move with the voice, cinematic inserts and screen moments that show instead of tell — so the message lands without sound and holds attention with it.",
    services: ["Editing", "Kinetic captions", "Colour", "Sound mix"],
    process: [
      { title: "Assembly", description: "Find the story inside the footage and lock its structure." },
      { title: "Pacing", description: "Tighten every beat; add inserts and graphics where they clarify." },
      { title: "Finishing", description: "Grade, mix and export for each platform." },
    ],
  },
  {
    slug: "feature-motion-series",
    title: "Feature Motion Series",
    category: "saas-animation",
    featured: true,
    art: "saas-flow",
    ...workMedia("feature-motion-series", 1280, 720, "Feature motion series — soft, colourful UI animation"),
    description: "Short UI animations, each spotlighting a single feature for release notes and social.",
    overview:
      "A feature-animation series with one consistent motion language: soft colour, crisp interface elements and small, satisfying interactions — each clip focused on a single capability.",
    services: ["Motion system", "UI animation", "Platform cutdowns"],
  },
  {
    slug: "exploded-view-study",
    title: "Exploded View Study",
    category: "3d-animation",
    featured: true,
    art: "product-exploded",
    ...workMedia("exploded-view-study", 540, 960, "Exploded view study — a camera separating into its components"),
    description: "A 3D breakdown that separates a camera into its parts to show how it is built.",
    overview:
      "A technical product visualisation: the camera turns, then separates layer by layer — lens elements, body and electronics floating apart and holding in space — to explain the build in a few seconds.",
    services: ["Modelling", "Technical animation", "Rendering"],
  },
  {
    slug: "short-form-campaign-cutdowns",
    title: "Short-form Campaign Cutdowns",
    category: "video-editing",
    art: "edit-vertical",
    ...workMedia("short-form-campaign-cutdowns", 540, 960, "Short-form cutdowns — vertical edits with captions and motion graphics"),
    description: "Vertical edits built for the first second, with captions and motion graphics that keep people watching.",
    overview:
      "Short-form editing for a campaign: hook-first openings, captions timed to the voice, and motion-graphic inserts that turn one production into platform-native vertical videos.",
    services: ["Short-form editing", "Motion graphics", "Captions"],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getRelatedProjects(project: Project, limit = 3): Project[] {
  const sameCategory = projects.filter((p) => p.slug !== project.slug && p.category === project.category);
  const others = projects.filter((p) => p.slug !== project.slug && p.category !== project.category);
  return [...sameCategory, ...others].slice(0, limit);
}

export function getProjectsByCategory(category: ProjectCategory): Project[] {
  return projects.filter((p) => p.category === category);
}

export const hasOnlyExampleProjects = projects.every((p) => p.isExample);
