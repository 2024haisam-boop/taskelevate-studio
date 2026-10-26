/**
 * THE WORLD — shared, mutable state for the home page's single WebGL world (docs/REDESIGN-v3.md).
 *
 * DOM acts register their tall tracks here; one rAF-batched scroll driver turns window.scrollY into
 * per-act progress with plain arithmetic (act offsets are measured on resize only → no layout reads
 * while scrolling) and writes it to CSS (`--ap`) for the overlays. The R3F scene reads the same store
 * every frame (with its own damped scroll) — nothing here is React state.
 */

export const ACTS = ["hero", "descent", "reel", "services", "work", "finale"] as const;
export type ActName = (typeof ACTS)[number];

export interface ActRange {
  /** document-space top of the track (px) */
  top: number;
  /** track height (px) */
  height: number;
}

type ActListener = (ap: number, c: number) => void;

interface ActEntry {
  name: ActName;
  el: HTMLElement;
  listener?: ActListener;
  last: number;
  lastC: number;
}

export interface WorldStore {
  ranges: Partial<Record<ActName, ActRange>>;
  /** raw window.scrollY */
  scroll: number;
  vh: number;
  vw: number;
  /** pointer over the viewport, -1..1 (fine pointers only) */
  px: number;
  py: number;
  /** drag-to-spin velocity for the Well (rad/s), decays in the scene */
  dragVel: number;
  /** performance.now() at which the 3D entrance starts; null while the intro gate is still closed */
  introAt: number | null;
  /** scene has rendered its first frame with posters loaded */
  ready: boolean;
  /** 0..1 loading progress reported by the scene (chunk, posters, first frame) */
  loaded: number;
  /** overlay element the camera rig flashes when it plunges through the pool */
  flashEl: HTMLElement | null;
}

export const world: WorldStore = {
  ranges: {},
  scroll: 0,
  vh: 800,
  vw: 1280,
  px: 0,
  py: 0,
  dragVel: 0,
  introAt: null,
  ready: false,
  loaded: 0,
  flashEl: null,
};

const entries = new Map<ActName, ActEntry>();

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth01 = (v: number) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};
/** remap v from [a,b] → [0,1] (clamped, smoothstepped) */
export const band = (v: number, a: number, b: number) => smooth01((v - a) / (b - a));
/** hold → move → hold between integer steps (services carousel, gallery focus) */
export const stepped = (x: number) => {
  const f = Math.floor(x);
  return f + smooth01((x - f - 0.28) / 0.44);
};

/** Sticky-track progress: 0 when the track top reaches the viewport top, 1 when its bottom reaches the viewport bottom. */
export function trackProgress(name: ActName, y = world.scroll): number {
  const r = world.ranges[name];
  if (!r) return 0;
  return clamp01((y - r.top) / Math.max(1, r.height - world.vh));
}

/** Camera progress: 0 when the track top reaches the viewport top, 1 when the NEXT track does (acts tile seamlessly). */
export function cameraProgress(name: ActName, y = world.scroll): number {
  const r = world.ranges[name];
  if (!r) return 0;
  return clamp01((y - r.top) / Math.max(1, r.height));
}

/** Converts a sticky-track progress value to the matching scroll position (for keyboard focus → scroll). */
export function scrollForTrack(name: ActName, ap: number): number {
  const r = world.ranges[name];
  if (!r) return 0;
  return r.top + ap * Math.max(1, r.height - world.vh);
}

export function registerAct(name: ActName, el: HTMLElement, listener?: ActListener) {
  entries.set(name, { name, el, listener, last: -1, lastC: -1 });
  measure();
  update();
  return () => {
    if (entries.get(name)?.el === el) entries.delete(name);
    delete world.ranges[name];
  };
}

function measure() {
  world.vh = window.innerHeight;
  world.vw = window.innerWidth;
  const sy = window.scrollY;
  entries.forEach((e) => {
    const r = e.el.getBoundingClientRect();
    world.ranges[e.name] = { top: r.top + sy, height: e.el.offsetHeight };
  });
}

function update() {
  world.scroll = window.scrollY;
  entries.forEach((e) => {
    const ap = trackProgress(e.name);
    const c = cameraProgress(e.name);
    if (Math.abs(ap - e.last) < 0.0002 && Math.abs(c - e.lastC) < 0.0002) return;
    e.last = ap;
    e.lastC = c;
    e.el.style.setProperty("--ap", ap.toFixed(4));
    e.el.style.setProperty("--ac", c.toFixed(4));
    e.listener?.(ap, c);
  });
}

/** Starts the single scroll/resize driver. Call once from the page experience; returns a cleanup. */
export function startWorldDriver() {
  let raf = 0;
  const onScroll = () => {
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
  };
  const remeasure = () => {
    measure();
    entries.forEach((e) => {
      e.last = -1;
      e.lastC = -1;
    });
    update();
  };
  const ro = new ResizeObserver(remeasure);
  ro.observe(document.body);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", remeasure);
  void document.fonts?.ready.then(remeasure);
  remeasure();
  return () => {
    ro.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", remeasure);
    cancelAnimationFrame(raf);
  };
}
