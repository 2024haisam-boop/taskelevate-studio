"use client";

import { useEffect, useRef } from "react";
import { decodeTo, prepareDecode } from "@/lib/animations/decode";
import { HeroCopyGL, type CopyDraw } from "@/lib/gl/heroCopy";
import { deviceTier } from "@/lib/device";

type Pos = "bottom" | "left" | "right";

/* One block per phase; sentences are our own service descriptions. Each phase gives the studio figure a shape and
   a place on screen (opposite the copy); the last is a ring the camera flies through. */
const PHASES: { shape: string; pos: Pos; pill: string; sentence: string; word: string; line: string }[] = [
  { shape: "logo", pos: "bottom", pill: "Taskelevate Studios", sentence: "The creative arm of Taskelevate — animation, 3D, websites and video under one roof", word: "We", line: "Craft the unexpected" },
  { shape: "knot", pos: "left", pill: "SaaS animation", sentence: "Turn complex software into clear, compelling stories through sophisticated motion design", word: "Motion", line: "That makes products make sense" },
  { shape: "cube", pos: "right", pill: "3D animation", sentence: "Bring products and ideas to life through cinematic lighting, materials and motion", word: "Products", line: "In light, material and motion" },
  { shape: "wave", pos: "bottom", pill: "Interactive websites", sentence: "Transform conventional websites into memorable, responsive digital experiences", word: "Websites", line: "People want to play with" },
  { shape: "play", pos: "left", pill: "Video editing", sentence: "Polished video content designed to capture attention and communicate clearly", word: "Stories", line: "That hold attention" },
  { shape: "ring", pos: "bottom", pill: "Next", sentence: "Keep scrolling — this is where it starts", word: "Step", line: "Inside the studio" },
];
const PHASE_AT = [0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72];
const ZOOM_FROM = 0.74;
const ZOOM_TO = 0.985;
const HOLE = 0.64; // the ring's inner radius, relative to the figure's radius
const DIST = 6;
const SHIFT: Record<Pos, number> = { bottom: 0, left: 0.42, right: -0.42 };
const HOLD_KEYS = [" ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"];
const STEP_MS = 1250; // one section: the warp out, the warp in, the camera settling
const WHEEL_GAP = 220; // ms without wheel events that ends a gesture (trackpad momentum keeps one going)
const SWIPE_PX = 14;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);

/** A step's timing: the warp (between distance fractions a and b of the glide) plays across the middle of it —
 *  starting soon after the gesture, never rushed — with a smooth start and finish (monotone cubic through four
 *  points, zero speed at both ends). */
function stepCurve(a: number, b: number) {
  const T = [0, 0.16, 0.62, 1];
  const X = [0, clamp01(a), Math.max(clamp01(a), clamp01(b)), 1];
  const d = [0, 1, 2].map((k) => (X[k + 1]! - X[k]!) / (T[k + 1]! - T[k]!));
  const m = [0, 0, 0, 0];
  for (let k = 1; k < 3; k++) {
    const d0 = d[k - 1]!, d1 = d[k]!;
    if (d0 <= 0 || d1 <= 0) continue;
    const h0 = T[k]! - T[k - 1]!, h1 = T[k + 1]! - T[k]!;
    const w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
    m[k] = Math.min((w1 + w2) / (w1 / d0 + w2 / d1), 3 * Math.min(d0, d1));
  }
  return (t: number) => {
    const k = t < T[1]! ? 0 : t < T[2]! ? 1 : 2;
    const h = T[k + 1]! - T[k]!, u = (t - T[k]!) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * X[k]! + (u3 - 2 * u2 + u) * h * m[k]! + (3 * u2 - 2 * u3) * X[k + 1]! + (u3 - u2) * h * m[k + 1]!;
  };
}
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * HERO — a pinned, drone-shot scroll story over the studio layer (StudioCanvas). The Taskelevate mark, made of
 * particles sampled from the logo artwork, stands over a lake below a ridge of rocks; stir it with the cursor or a
 * finger, and it breathes out every few seconds. Scrolling orbits the camera (the ridges pan like a drone shot);
 * each copy block holds while you read, then warps away to the left — liquid displacement, a colour split, blur —
 * as the next one warps in, and the figure takes the next shape on the open side of the screen. Last, a ring: the
 * camera flies through it into a white halo that floods the screen and hands over to the page below — that last part
 * plays by itself once you scroll into it (and reverses back to the ring if you scroll up into it).
 * It moves ONE SECTION PER GESTURE: a wheel or trackpad flick however hard, a swipe or a key glides to the next
 * section's resting place and the rest of that gesture is spent (see "one section per gesture" below).
 * The warps and the halo run on the GPU (lib/gl/heroCopy: the blocks are rasterised once, the DOM copy shows at
 * rest); without it they fall back to SVG filters on the DOM copy. Per frame the only layout read is the track's
 * position, and only compositor-friendly properties are written.
 * `.hero-figure` is the figure's anchor (its size sets the figure's size). Reduced motion: the first block, static.
 */
export function HeroStory() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLParagraphElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const track = trackRef.current, stage = stageRef.current, anchor = figureRef.current, wrap = blocksRef.current, count = countRef.current;
    const meta = metaRef.current, flash = flashRef.current, glCanvas = glRef.current;
    if (!track || !stage || !anchor || !wrap || !count || !meta || !flash || !glCanvas) return;
    const html = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const blocks = Array.from(wrap.children) as HTMLElement[];
    const sentences = blocks.map((b) => b.querySelector<HTMLElement>("[data-sentence]"));
    const warps = [0, 1].map((k) => document.getElementById(`hero-warp-${k}`)?.querySelector("feDisplacementMap"));
    const noise = [0, 1].map((k) => document.getElementById(`hero-warp-${k}`)?.querySelector("feTurbulence"));
    let active = 0;
    let cancel = () => {};
    let raf = 0;
    let disposed = false;

    // writes only when the value changes (no style invalidation for nothing)
    const last = new WeakMap<Element, Record<string, string>>();
    const set = (el: HTMLElement, prop: string, value: string) => {
      let m = last.get(el);
      if (!m) last.set(el, (m = {}));
      if (m[prop] === value) return;
      m[prop] = value;
      if (prop.startsWith("--")) el.style.setProperty(prop, value);
      else el.style[prop as "opacity"] = value;
    };

    // ---- the copy on the GPU — set up just after the intro (it is first needed at the first section change), so
    // its shader compiles never compete with loading on slow phones
    let copy: HeroCopyGL | null = null;
    let copyTried = false;
    const makeCopy = () => {
      if (copyTried || !motion.matches) return;
      copyTried = true;
      try {
        copy = new HeroCopyGL(glCanvas, PHASES.length);
      } catch {
        copy = null;
        return;
      }
      copy.resize(stageW, stageH);
      const bg = getComputedStyle(html).getPropertyValue("--color-bg").trim();
      if (bg) copy.paper = copy.rgba(bg).slice(0, 3) as [number, number, number];
      sentences.forEach((s) => s && mo.observe(s, { attributes: true, attributeFilter: ["class", "data-g"], subtree: true }));
    };
    // the sentences as decode letters from the start, so they never move (the GPU copy draws them letter by letter)
    if (motion.matches) sentences.forEach((s, i) => s && prepareDecode(s, PHASES[i]!.sentence));
    let fontsReady = false;
    const gpu = () => Boolean(copy && !copy.lost && fontsReady && html.dataset.studio === "on");
    const domTx = PHASES.map(() => 0); // each block's slide as last written to the DOM, px
    const onGpu = PHASES.map(() => false);

    // layout that only changes on resize
    let rpx = 1, trackH = 1, stageW = 1, stageH = 1, docTop = 0;
    const measure = () => {
      const r = anchor.getBoundingClientRect();
      rpx = Math.max(1, Math.min(r.width, r.height) / 2);
      trackH = track.offsetHeight;
      docTop = track.getBoundingClientRect().top + window.scrollY;
      stageW = stage.clientWidth;
      stageH = stage.clientHeight;
      copy?.resize(stageW, stageH);
    };

    // snapshots of the blocks around the current one, between frames (not during the intro: its curtain animates on
    // the main thread in Safari)
    const queue: number[] = [];
    let prefetchT = 0;
    const runPrefetch = () => {
      prefetchT = 0;
      if (html.classList.contains("preloading")) {
        prefetchT = window.setTimeout(runPrefetch, 300);
        return;
      }
      makeCopy();
      if (!copy || !gpu()) return;
      const i = queue.shift();
      if (i !== undefined && !copy.fresh(i)) copy.snap(i, blocks[i]!, domTx[i]!);
      else copy.warm();
      if (queue.length) prefetchT = window.setTimeout(runPrefetch, 40);
      else if (i !== undefined)
        prefetchT = window.setTimeout(() => {
          prefetchT = 0;
          copy?.warm();
        }, 40);
    };
    const prefetch = (...ids: number[]) => {
      ids.forEach((i) => i >= 0 && i < PHASES.length && !queue.includes(i) && queue.push(i));
      if (!prefetchT) prefetchT = window.setTimeout(runPrefetch, 40);
    };

    // Entering the studio plays by itself: once you scroll into the fly-through, the page glides through the ring
    // and the halo straight into the next section (and back out to the ring when you scroll up into it). Input is
    // held while any glide plays.
    let auto: { from: number; to: number; start: number; dur: number; fn: (x: number) => number } | null = null;
    let autoRaf = 0;
    let lastY = window.scrollY;
    const hold = (e: Event) => auto && e.cancelable && e.preventDefault();
    const holdOn = () => window.addEventListener("touchmove", hold, { passive: false });
    const holdOff = () => window.removeEventListener("touchmove", hold);
    const glide = (to: number, dur: number, fn = ease) => {
      auto = { from: window.scrollY, to, start: performance.now(), dur, fn };
      holdOn();
      wheel(true);
      wheelSpent = true; // whatever wheel gesture is under way ends here
      wheelAt = performance.now();
      const step = (now: number) => {
        if (!auto) return;
        const t = clamp01((now - auto.start) / auto.dur);
        window.scrollTo({ top: auto.from + (auto.to - auto.from) * auto.fn(t), behavior: "instant" });
        if (t < 1) autoRaf = requestAnimationFrame(step);
        else {
          auto = null;
          holdOff();
          lastY = window.scrollY;
          if (queued) {
            const d = queued;
            queued = 0;
            go(d);
          }
        }
      };
      cancelAnimationFrame(autoRaf);
      autoRaf = requestAnimationFrame(step);
    };

    // ---- one section per gesture. Each section has a resting place (the middle of its hold; the first is the top
    // of the page, the ring is framed just before the fly-through). A gesture glides to the next one — through the
    // warp — and whatever else that gesture does is ignored: wheel/trackpad events count as one gesture until they
    // pause (momentum included), a swipe is one gesture, held keys don't repeat. Past the ring, the next gesture is
    // the fly-through. On touch, native panning is off inside the hero only (`[data-steps]` → touch-action), so a
    // swipe never waits on JS; the wheel listener, which has to be able to block, is attached only while the hero
    // is on screen. If anything else leaves the page between sections (scrollbar, find-in-page), it settles on the
    // nearest one.
    const span = () => Math.max(1, trackH - window.innerHeight);
    const rest = (i: number) => (i === 0 ? 0 : i === PHASES.length - 1 ? ZOOM_FROM - 0.015 : PHASE_AT[i]! + 0.275 * (PHASE_AT[i + 1]! - PHASE_AT[i]!));
    const progress = () => (window.scrollY - docTop) / span();
    const stepping = () => {
      const p = progress();
      return motion.matches && !html.classList.contains("preloading") && p >= -0.002 && p <= ZOOM_FROM + 0.004;
    };
    const nearest = (p: number) => {
      let best = 0;
      for (let i = 1; i < PHASES.length; i++) if (Math.abs(rest(i) - p) < Math.abs(rest(best) - p)) best = i;
      return best;
    };
    const go = (dir: 1 | -1) => {
      if (auto) return;
      const from = progress(), cur = nearest(from), next = cur + dir;
      if (next >= PHASES.length) return glide(docTop + trackH, 1900); // past the ring: the fly-through
      if (next < 0) return;
      // the warp between the two sections sits between q0 and q1
      const m = Math.min(cur, next), len = PHASE_AT[m + 1]! - PHASE_AT[m]!;
      const q0 = PHASE_AT[m]! + 0.55 * len, q1 = PHASE_AT[m + 1]!;
      const to = rest(next), dist = to - from;
      const [a, b] = dir > 0 ? [(q0 - from) / dist, (q1 - from) / dist] : [(q1 - from) / dist, (q0 - from) / dist];
      glide(docTop + to * span(), STEP_MS * Math.min(1.35, Math.max(1, Math.sqrt(Math.abs(dist) / len))), stepCurve(a, b));
    };

    // A gesture that arrives while a section is still gliding isn't lost: it is queued and plays as soon as the
    // glide lands (one at a time — the latest wins).
    let queued: 1 | -1 | 0 = 0;
    const ask = (dir: 1 | -1) => {
      if (auto) queued = dir;
      else go(dir);
    };

    // Wheel / trackpad. One gesture = everything until a pause — or, on top of a dying momentum tail, a real new
    // flick (the event rate jumping well above the fading tail, once the gesture is past its own acceleration).
    // Rates, not raw deltas, so coalesced events from a busy frame don't look like a new flick.
    let wheelAt = 0, wheelSum = 0, wheelSpent = false, wheelOn = false, gStart = 0, gPeak = 0, tail = 0, gSign = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // a pinch-zoom
      // input time, not handling time: a busy frame mustn't look like a pause and split one gesture in two
      const now = e.timeStamp || performance.now();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      const gap = now - wheelAt;
      const rate = Math.abs(dy) / Math.min(120, Math.max(8, gap));
      const flick = now - gStart > 300 && tail < gPeak * 0.5 && rate > tail * 2.5 && Math.abs(dy) > 14;
      const turn = gSign !== 0 && Math.sign(dy) !== gSign && Math.abs(dy) > 6;
      if (gap > WHEEL_GAP || flick || turn) {
        wheelSum = 0;
        wheelSpent = false;
        gStart = now;
        gPeak = 0;
        tail = rate;
      }
      wheelAt = now;
      gPeak = Math.max(gPeak, rate);
      tail = tail * 0.6 + rate * 0.4;
      if (dy !== 0) gSign = Math.sign(dy);
      // a gesture that already moved the page is spent to its end — even once the fly-through has landed below
      if (!auto && !wheelSpent && !stepping()) return;
      e.preventDefault();
      if (wheelSpent) return;
      if (Math.abs(e.deltaX) > Math.abs(dy)) return;
      wheelSum += dy;
      if (Math.abs(wheelSum) >= 12) {
        wheelSpent = true;
        ask(wheelSum > 0 ? 1 : -1);
      }
    };
    function wheel(on: boolean) {
      if (on === wheelOn) return;
      wheelOn = on;
      if (on) window.addEventListener("wheel", onWheel, { passive: false });
      else window.removeEventListener("wheel", onWheel);
    }

    // Touch: a swipe anywhere on screen (the hero, or the header over it) — not in the open menu sheet. Short quick
    // flicks count too.
    let touchY0 = 0, touchY = 0, touchT = 0, touching = false, onControl = false;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.target instanceof Element ? e.target : null;
      touching = e.touches.length === 1 && stepping() && !t?.closest("#site-menu, input, textarea, select");
      onControl = Boolean(t?.closest("a, button")); // a tap on the menu button must stay a tap
      if (touching) {
        touchY0 = touchY = e.touches[0]!.clientY;
        touchT = e.timeStamp;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) touching = false;
      else if (touching && e.touches[0]) touchY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touching) return;
      touching = false;
      const end = e.changedTouches[0]?.clientY ?? touchY; // the lift point (tiny moves may never reach touchmove)
      const d = touchY0 - end, quick = e.timeStamp - touchT < 180;
      if (Math.abs(d) >= (onControl ? 24 : SWIPE_PX) || (!onControl && quick && Math.abs(d) >= 8)) ask(d > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (!auto && !stepping()) return;
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === " " && el?.closest("button, a, summary")) return;
      const down = e.key === "ArrowDown" || e.key === "PageDown" || (e.key === " " && !e.shiftKey);
      const up = e.key === "ArrowUp" || e.key === "PageUp" || (e.key === " " && e.shiftKey);
      if (!down && !up) {
        if (auto && HOLD_KEYS.includes(e.key)) e.preventDefault();
        return;
      }
      e.preventDefault();
      if (!e.repeat) ask(down ? 1 : -1);
    };

    let settleT = 0;
    const settle = () => {
      settleT = 0;
      if (auto || !stepping()) return;
      const p = progress(), to = rest(nearest(p));
      if (Math.abs(to - p) * span() > 2) glide(docTop + to * span(), 700, sine);
    };

    const update = () => {
      raf = 0;
      if (!motion.matches) return;
      const vh = window.innerHeight, vw = window.innerWidth;
      const phone = vw < 768;
      const y = window.scrollY;
      const top = track.getBoundingClientRect().top; // the one layout read per frame
      const total = Math.max(1, trackH - vh);
      const p = clamp01(-top / total);

      const dir = y - lastY;
      lastY = y;
      const trackTop = top + y, landing = trackTop + trackH;
      docTop = trackTop;
      wheel(Boolean(auto) || y < landing - 1 || performance.now() - wheelAt < WHEEL_GAP);
      const inSteps = (y - trackTop) / total <= ZOOM_FROM + 0.004 ? "on" : "off";
      if (html.dataset.heroSteps !== inSteps) html.dataset.heroSteps = inSteps;
      // moved by something other than a step (scrollbar, find-in-page…): settle on a section once it stops
      if (!auto && dir !== 0 && (y - trackTop) / total <= ZOOM_FROM + 0.004) {
        window.clearTimeout(settleT);
        settleT = window.setTimeout(settle, 200);
      }
      // anywhere between the start of the fly-through and the next section: finish the move, whichever way you went
      if (!auto && dir !== 0 && (y - trackTop) / total > ZOOM_FROM + 0.004 && y < landing - 2) {
        if (dir > 0) glide(landing, 1900);
        else glide(trackTop + total * (ZOOM_FROM - 0.015), 1300);
      }

      // float phase: holds while you read, then moves on
      let k = 0;
      for (let i = 0; i < PHASES.length; i++) if (p >= PHASE_AT[i]!) k = i;
      const local = clamp01((p - PHASE_AT[k]!) / (PHASE_AT[k + 1]! - PHASE_AT[k]!));
      const f = Math.min(PHASES.length - 1, k + (k < PHASES.length - 1 ? smooth(0.55, 1, local) : 0));
      const now = Math.round(f);
      const useGpu = gpu();
      if ((stage.dataset.gl === "on") !== useGpu) stage.dataset.gl = useGpu ? "on" : "off";

      // per block: distance from the current phase and warp amount; snapshot what is about to play (layout reads,
      // before any write this frame)
      const state = blocks.map((_, i) => {
        const d = f - i, a = Math.abs(d);
        return { d, a, w: smooth(0.04, 0.7, a) };
      });
      if (useGpu) state.forEach((s, i) => s.a < 1 && s.w > 0.01 && !copy!.fresh(i) && copy!.snap(i, blocks[i]!, domTx[i]!));

      if (now !== active) {
        active = now;
        anchor.dataset.figure = PHASES[now]!.shape;
        const s = sentences[now];
        cancel();
        if (s) {
          cancel = decodeTo(s, PHASES[now]!.sentence, 650);
          copy?.letters(now);
        }
        count.textContent = `${String(now + 1).padStart(2, "0")} / ${String(PHASES.length).padStart(2, "0")}`;
        if (deviceTier() === "low") copy?.keep([now - 1, now, now + 1]); // weak devices: only the blocks around this one
        prefetch(now - 1, now + 1);
      }

      // copy blocks: warp out to the left, warp in from the right
      const wrapA = 1 - smooth(ZOOM_FROM, ZOOM_FROM + 0.06, p);
      const draws: CopyDraw[] = [];
      blocks.forEach((b, i) => {
        const { d, a, w } = state[i]!;
        onGpu[i] = false;
        if (a >= 1) {
          set(b, "visibility", "hidden");
          return;
        }
        const op = 1 - smooth(0.2, 0.75, a);
        const tx = (-d * (phone ? 55 : 32) * vw) / 100;
        const slot = i % 2;
        if (useGpu && w > 0.01 && copy!.fresh(i)) {
          // the texture plays the transition; the DOM copy waits, hidden
          onGpu[i] = true;
          set(b, "visibility", "hidden");
          draws.push({ i, tx, alpha: op * wrapA, warp: w * 70, freq: [0.006 + w * 0.01, 0.02 + w * 0.03], seed: slot * 7 + 3, split: w * 12, sa: w * 0.75, blur: w * 5 });
          return;
        }
        set(b, "visibility", "visible");
        set(b, "opacity", op.toFixed(3));
        b.style.transform = `translate3d(${tx.toFixed(1)}px, 0, 0)`;
        domTx[i] = tx;
        set(b, "--split", `${(w * 12).toFixed(1)}px`);
        set(b, "--blur", `${(w * 5).toFixed(1)}px`);
        set(b, "--sa", (w * 0.75).toFixed(3));
        if (!useGpu) {
          warps[slot]?.setAttribute("scale", (w * 70).toFixed(1));
          noise[slot]?.setAttribute("baseFrequency", `${(0.006 + w * 0.01).toFixed(4)} ${(0.02 + w * 0.03).toFixed(4)}`);
        }
        set(b, "filter", !useGpu && w > 0.01 ? `url(#hero-warp-${slot}) blur(var(--blur))` : "none");
      });

      // drone camera: orbit while the copy plays, the figure on the open side; then fly through the ring
      const rNdc = rpx / (vh / 2);
      const from = PHASES[Math.floor(f)]!.pos, to = PHASES[Math.ceil(f)]!.pos;
      const sx = phone ? 0 : SHIFT[from] + (SHIFT[to] - SHIFT[from]) * (f - Math.floor(f));
      const sy = phone ? 0.36 : 0.2;
      const orbit = Math.min(p, ZOOM_FROM) / ZOOM_FROM;
      const yaw = -0.35 + orbit * 1.05;
      const pitch = Math.atan(-rNdc * 0.92 * Math.tan((35 * Math.PI) / 360));
      const z = ease(clamp01((p - ZOOM_FROM) / (ZOOM_TO - ZOOM_FROM)));
      const dist = DIST - (DIST - 0.8) * z; // the halo fills the screen just as the hero ends
      anchor.dataset.figureCam = [yaw, pitch, dist, sx, sy].map((n) => n.toFixed(4)).join(",");

      // through the ring: a white halo floods the screen
      const hole = p < ZOOM_FROM ? 0 : HOLE * rpx * (DIST / Math.max(dist, 0.05)) * smooth(ZOOM_FROM, ZOOM_FROM + 0.05, p);
      const cx = 0.5 + sx / 2, cy = 0.5 - sy / 2;
      if (useGpu) copy!.render(draws, hole > 0.5 ? { r: hole, x: cx * stageW, y: cy * stageH } : null);
      else {
        set(flash, "--hole", `${hole.toFixed(1)}px`);
        set(flash, "--cx", `${(cx * 100).toFixed(2)}%`);
        set(flash, "--cy", `${(cy * 100).toFixed(2)}%`);
      }
      set(meta, "--h", p.toFixed(3));
      // the copy leaves as the camera goes in; the scene is gone once the halo has flooded the screen
      set(wrap, "opacity", wrapA.toFixed(3));
      anchor.dataset.figureFade = (1 - smooth(0.95, 0.985, p)).toFixed(3);
    };
    const kick = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(update);
    };

    measure();
    const ro = new ResizeObserver(() => {
      measure();
      kick();
    });
    ro.observe(stage);

    // the decode changes letters: redraw them on the texture while that block is playing there
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        const i = sentences.findIndex((s) => s?.contains(r.target));
        if (i < 0) continue;
        copy?.letters(i);
        if (onGpu[i]) kick();
      }
    });

    const onStudio = () => {
      prefetch(active, active + 1, active - 1);
      kick();
    };
    const onFonts = () => {
      copy?.stale();
      onStudio();
    };
    if (motion.matches) {
      document.fonts.ready.then(() => {
        if (disposed) return;
        fontsReady = true;
        onStudio();
      });
      document.fonts.addEventListener("loadingdone", onFonts);
    }

    if (motion.matches) track.dataset.steps = "on";
    const onMotion = () => {
      if (motion.matches) track.dataset.steps = "on";
      else delete track.dataset.steps;
      kick();
    };
    update();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("studio:state", onStudio);
    motion.addEventListener("change", onMotion);
    return () => {
      disposed = true;
      cancel();
      holdOff();
      wheel(false);
      window.clearTimeout(settleT);
      delete track.dataset.steps;
      delete html.dataset.heroSteps;
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      ro.disconnect();
      mo.disconnect();
      window.clearTimeout(prefetchT);
      document.fonts.removeEventListener("loadingdone", onFonts);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("studio:state", onStudio);
      cancelAnimationFrame(autoRaf);
      motion.removeEventListener("change", onMotion);
      cancelAnimationFrame(raf);
      copy?.dispose();
    };
  }, []);

  return (
    <section ref={trackRef} aria-labelledby="hero-title" className="hero-track relative">
      {/* liquid warp for the copy in transition when the GPU copy is unavailable (two, so the leaving and arriving
          blocks warp independently) */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        {[0, 1].map((k) => (
          <filter key={k} id={`hero-warp-${k}`} x="-20%" y="-30%" width="140%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="2" seed={k * 7 + 3} />
            <feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
      </svg>

      <div ref={stageRef} className="hero-stage">
        <div ref={figureRef} aria-hidden="true" className="hero-figure" data-figure="logo" data-figure-env="" data-figure-reflect="" />
        <h1 id="hero-title" className="sr-only">
          Taskelevate Studios — we craft the unexpected
        </h1>

        <div ref={blocksRef} aria-hidden="true" className="hero-blocks">
          {PHASES.map((ph, i) => (
            <div key={ph.line} className="hero-block" data-pos={ph.pos} style={{ visibility: i === 0 ? "visible" : "hidden" }}>
              <p className="hero-meta-row">
                <span className="tag-pill">{ph.pill}</span>
                <span data-sentence="" className="hero-sentence label-mono">
                  {ph.sentence}
                </span>
              </p>
              <p className="hero-lines font-display">
                <span className="hero-word">{ph.word}</span>
                <span className="hero-arrow" aria-hidden="true">
                  ↳
                </span>
                <span className="hero-big">{ph.line}</span>
              </p>
            </div>
          ))}
        </div>

        <p ref={metaRef} aria-hidden="true" className="hero-meta label-mono">
          <span className="hero-hint">Move to stir · Scroll ↓</span>
          <span ref={countRef}>01 / {String(PHASES.length).padStart(2, "0")}</span>
        </p>
        <div ref={flashRef} aria-hidden="true" className="hero-flash" />
        <canvas ref={glRef} aria-hidden="true" className="hero-gl" />
      </div>
    </section>
  );
}
