/**
 * MEDIA MANIFEST — every video/poster used by the Well, statement pills, showreel, service cards and work rail.
 * Swap in real client work by replacing files in /public/media and editing these entries — no component changes.
 *
 * `kind`:
 *   "studio-render" — footage the studio produced in-house (our real-time 3D/motion studies, recorded with
 *                     scripts/record-all-clips.sh). Honest to show as studio capability, never as client work.
 *   "client-work"   — real client projects (only with permission to publish).
 */
import type { ServiceSlug } from "./services";

export interface MediaClip {
  id: string;
  /** H.264 MP4, ~960×540, muted loop, < 1.5 MB */
  src: string;
  /** 512px variant for small/texture use (the Well, inline pills) — avoids aliasing + saves bandwidth */
  srcSmall: string;
  /** First-frame poster (same aspect) */
  poster: string;
  label: string;
  service: ServiceSlug;
  kind: "studio-render" | "client-work";
}

export const clips: MediaClip[] = [
  {
    id: "product-turntable",
    src: "/media/clips/product-turntable.mp4",
    srcSmall: "/media/clips/product-turntable-sm.mp4",
    poster: "/media/clips/product-turntable.jpg",
    label: "Product study · real-time 3D",
    service: "3d-animation",
    kind: "studio-render",
  },
  {
    id: "saas-dashboard",
    src: "/media/clips/saas-dashboard.mp4",
    srcSmall: "/media/clips/saas-dashboard-sm.mp4",
    poster: "/media/clips/saas-dashboard.jpg",
    label: "Layered UI · SaaS motion",
    service: "saas-animation",
    kind: "studio-render",
  },
  {
    id: "edit-timeline",
    src: "/media/clips/edit-timeline.mp4",
    srcSmall: "/media/clips/edit-timeline-sm.mp4",
    poster: "/media/clips/edit-timeline.jpg",
    label: "Edit & reframe · video",
    service: "video-editing",
    kind: "studio-render",
  },
  {
    id: "web-layers",
    src: "/media/clips/web-layers.mp4",
    srcSmall: "/media/clips/web-layers-sm.mp4",
    poster: "/media/clips/web-layers.jpg",
    label: "Spatial website · WebGL",
    service: "interactive-websites",
    kind: "studio-render",
  },
  {
    id: "product-scan",
    src: "/media/clips/product-scan.mp4",
    srcSmall: "/media/clips/product-scan-sm.mp4",
    poster: "/media/clips/product-scan.jpg",
    label: "Wireframe → final render",
    service: "3d-animation",
    kind: "studio-render",
  },
  {
    id: "motion-comp",
    src: "/media/clips/motion-comp.mp4",
    srcSmall: "/media/clips/motion-comp-sm.mp4",
    poster: "/media/clips/motion-comp.jpg",
    label: "Keyframes & easing · motion",
    service: "saas-animation",
    kind: "studio-render",
  },
];

export function getClip(id: string): MediaClip {
  const c = clips.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown clip: ${id}`);
  return c;
}

/** Showreel — a crossfaded montage of real project films (public/media/reel/work-reel.mp4, cut from the
 *  /public/media/work sources). The earlier studio-render montage is kept at studio-reel.mp4. */
export const reel = {
  src: "/media/reel/work-reel.mp4",
  poster: "/media/reel/work-reel.jpg",
  label: "Showreel — selected work",
};
