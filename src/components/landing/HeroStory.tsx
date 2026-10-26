"use client";

import { useEffect, useRef } from "react";
import { decodeTo } from "@/lib/animations/decode";

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

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
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
 * `.hero-figure` is the figure's anchor (its size sets the figure's size). Reduced motion: the first block, static.
 */
export function HeroStory() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current, stage = stageRef.current, anchor = figureRef.current, wrap = blocksRef.current, count = countRef.current;
    if (!track || !stage || !anchor || !wrap || !count) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const blocks = Array.from(wrap.children) as HTMLElement[];
    const warps = [0, 1].map((k) => document.getElementById(`hero-warp-${k}`)?.querySelector("feDisplacementMap"));
    const noise = [0, 1].map((k) => document.getElementById(`hero-warp-${k}`)?.querySelector("feTurbulence"));
    let active = 0;
    let cancel = () => {};
    let raf = 0;

    // Entering the studio plays by itself: once you scroll into the fly-through, the page glides through the ring
    // and the halo straight into the next section (and back out to the ring when you scroll up into it). Input is
    // held for the moment it plays.
    let auto: { from: number; to: number; start: number; dur: number } | null = null;
    let autoRaf = 0;
    let lastY = window.scrollY;
    const glide = (to: number, dur: number) => {
      auto = { from: window.scrollY, to, start: performance.now(), dur };
      const step = (now: number) => {
        if (!auto) return;
        const t = clamp01((now - auto.start) / auto.dur);
        window.scrollTo({ top: auto.from + (auto.to - auto.from) * ease(t), behavior: "instant" });
        if (t < 1) autoRaf = requestAnimationFrame(step);
        else {
          auto = null;
          lastY = window.scrollY;
        }
      };
      cancelAnimationFrame(autoRaf);
      autoRaf = requestAnimationFrame(step);
    };
    const hold = (e: Event) => auto && e.cancelable && e.preventDefault();
    const holdKeys = (e: KeyboardEvent) => auto && [" ", "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].includes(e.key) && e.preventDefault();

    const update = () => {
      raf = 0;
      if (!motion.matches) return;
      const vh = window.innerHeight, vw = window.innerWidth;
      const phone = vw < 768;
      const total = Math.max(1, track.offsetHeight - vh);
      const p = clamp01(-track.getBoundingClientRect().top / total);

      const y = window.scrollY, dir = y - lastY;
      lastY = y;
      const trackTop = track.getBoundingClientRect().top + y, landing = trackTop + track.offsetHeight;
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
      if (now !== active) {
        active = now;
        anchor.dataset.figure = PHASES[now]!.shape;
        const s = blocks[now]?.querySelector<HTMLElement>("[data-sentence]");
        cancel();
        if (s) cancel = decodeTo(s, PHASES[now]!.sentence, 650);
        count.textContent = `${String(now + 1).padStart(2, "0")} / ${String(PHASES.length).padStart(2, "0")}`;
      }

      // copy blocks: warp out to the left, warp in from the right
      blocks.forEach((b, i) => {
        const d = f - i;
        const a = Math.abs(d);
        if (a >= 1) {
          b.style.visibility = "hidden";
          return;
        }
        b.style.visibility = "visible";
        const w = smooth(0.04, 0.7, a);
        b.style.opacity = (1 - smooth(0.2, 0.75, a)).toFixed(3);
        b.style.transform = `translate3d(${(-d * (phone ? 55 : 32)).toFixed(2)}vw, 0, 0)`;
        b.style.setProperty("--split", `${(w * 12).toFixed(1)}px`);
        b.style.setProperty("--blur", `${(w * 5).toFixed(1)}px`);
        b.style.setProperty("--sa", (w * 0.75).toFixed(3));
        const slot = i % 2;
        warps[slot]?.setAttribute("scale", (w * 70).toFixed(1));
        noise[slot]?.setAttribute("baseFrequency", `${(0.006 + w * 0.01).toFixed(4)} ${(0.02 + w * 0.03).toFixed(4)}`);
        b.style.filter = w > 0.01 ? `url(#hero-warp-${slot}) blur(var(--blur))` : "none";
      });

      // drone camera: orbit while the copy plays, the figure on the open side; then fly through the ring
      const r = anchor.getBoundingClientRect();
      const rpx = Math.min(r.width, r.height) / 2;
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
      stage.style.setProperty("--hole", `${hole.toFixed(1)}px`);
      stage.style.setProperty("--cx", `${((0.5 + sx / 2) * 100).toFixed(2)}%`);
      stage.style.setProperty("--cy", `${((0.5 - sy / 2) * 100).toFixed(2)}%`);
      stage.style.setProperty("--h", p.toFixed(4));
      // the copy leaves as the camera goes in; the scene is gone once the halo has flooded the screen
      wrap.style.opacity = (1 - smooth(ZOOM_FROM, ZOOM_FROM + 0.06, p)).toFixed(3);
      anchor.dataset.figureFade = (1 - smooth(0.95, 0.985, p)).toFixed(3);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("wheel", hold, { passive: false });
    window.addEventListener("touchmove", hold, { passive: false });
    window.addEventListener("keydown", holdKeys);
    motion.addEventListener("change", kick);
    return () => {
      cancel();
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("wheel", hold);
      window.removeEventListener("touchmove", hold);
      window.removeEventListener("keydown", holdKeys);
      cancelAnimationFrame(autoRaf);
      motion.removeEventListener("change", kick);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={trackRef} aria-labelledby="hero-title" className="hero-track relative">
      {/* liquid warp for the copy in transition (two, so the leaving and arriving blocks warp independently) */}
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

        <p aria-hidden="true" className="hero-meta label-mono">
          <span className="hero-hint">Move to stir · Scroll ↓</span>
          <span ref={countRef}>01 / {String(PHASES.length).padStart(2, "0")}</span>
        </p>
        <div aria-hidden="true" className="hero-flash" />
      </div>
    </section>
  );
}
