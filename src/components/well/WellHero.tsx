"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { clips, type MediaClip } from "@/data/media";
import { getService } from "@/data/services";
import { siteConfig } from "@/data/site-config";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageVisible } from "@/hooks/usePageVisible";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { setCursor } from "@/components/ui/CustomCursor";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { KineticHeadline } from "@/components/hero/KineticHeadline";
import { ShowreelButton } from "@/components/hero/ShowreelButton";
import { detectWebGL } from "@/components/three/ProductStage";
import type { WellState } from "./WellScene";

const WellScene = dynamic(() => import("./WellScene"), { ssr: false });

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * HERO — "THE WELL". A cylinder of moving work screens seen from above like a well; scrolling dives the camera
 * inside it. Native scroll over a tall track with a sticky stage (nothing pinned or hijacked). The headline is
 * server-rendered DOM (LCP), the WebGL scene mounts right after first paint.
 */
export function WellHero() {
  const router = useRouter();
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const state = useRef<WellState>({ progress: 0, velocity: 0, px: 0, py: 0, dragVel: 0 });
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  const reduce = useReducedMotion();
  const compact = useMediaQuery("(max-width: 767px)");
  const inView = useInView(trackRef, { rootMargin: "80px" });
  const visible = usePageVisible();
  const active = mount && inView && visible;
  const sceneClips = compact ? clips.slice(0, 4) : clips;

  // Mount WebGL right after first paint (idle), never before the headline is on screen.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const go = () => {
      const ok = detectWebGL();
      setWebgl(ok);
      if (ok) setMount(true);
    };
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 900 });
    else window.setTimeout(go, 300);
  }, []);

  // Scroll progress + velocity → shared state + CSS vars (one passive listener, rAF-batched)
  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    let raf = 0;
    let last = 0;
    let lastT = performance.now();
    const read = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const total = Math.max(1, track.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / total));
      const now = performance.now();
      const v = (p - last) / Math.max(0.001, (now - lastT) / 1000);
      state.current.velocity += (v - state.current.velocity) * 0.25;
      state.current.progress = p;
      last = p;
      lastT = now;
      stage.style.setProperty("--p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // decay velocity when scrolling stops
    const decay = window.setInterval(() => {
      state.current.velocity *= 0.6;
    }, 120);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearInterval(decay);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Pointer parallax + drag-to-spin (touch: horizontal swipes; vertical still scrolls the page)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.pointerType === "mouse") {
        state.current.px = ((e.clientX - r.left) / r.width) * 2 - 1;
        state.current.py = ((e.clientY - r.top) / r.height) * 2 - 1;
      }
      if (dragging) {
        const now = performance.now();
        const dx = e.clientX - lastX;
        const dt = Math.max(1, now - lastT) / 1000;
        state.current.dragVel = Math.max(-6, Math.min(6, (dx / r.width) * 6 / dt * 0.12));
        lastX = e.clientX;
        lastT = now;
      }
    };
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button")) return;
      dragging = true;
      lastX = e.clientX;
      lastT = performance.now();
    };
    const up = () => {
      dragging = false;
    };
    const leave = () => {
      state.current.px = 0;
      state.current.py = 0;
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const onHover = (clip: MediaClip | null) => {
    setCursor(clip ? { label: clip.label, hint: "Open" } : null);
  };
  const onSelect = (clip: MediaClip) => {
    setCursor(null);
    router.push(getService(clip.service).href);
  };

  return (
    <section
      ref={trackRef}
      aria-labelledby="hero-title"
      className="relative h-[190svh] md:h-[220svh] motion-reduce:h-[100svh]"
    >
      <div
        ref={stageRef}
        className="sticky top-0 isolate h-[100svh] touch-pan-y overflow-hidden [--p:0]"
        data-cursor-zone="well"
      >
        {/* WebGL well */}
        {mount && (
          <div className={`absolute inset-0 -z-10 transition-opacity duration-[1200ms] ${ready ? "opacity-100" : "opacity-0"}`}>
            <WellScene
              state={state}
              clips={sceneClips}
              active={active}
              compact={compact}
              reducedMotion={reduce}
              onReady={() => setReady(true)}
              onHover={onHover}
              onSelect={onSelect}
            />
          </div>
        )}

        {/* No-WebGL fallback only (rendering it for everyone would make a decorative image the LCP element) */}
        {webgl === false && <PosterRing hidden={false} strong />}

        {/* Legibility: dark core behind the type + soft floor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-[5] bg-[radial-gradient(ellipse_52%_46%_at_50%_54%,rgb(8_9_13/0.86),rgb(8_9_13/0.4)_58%,transparent_82%)]"
          style={{ opacity: "calc(1 - var(--p) * 1.6)" }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-[5] h-1/3 bg-gradient-to-t from-bg to-transparent" />

        {/* Headline — grows and lifts away as you dive in */}
        <div
          className="container-x pointer-events-none relative flex h-full flex-col items-center justify-center pt-[calc(var(--nav-top)+var(--nav-h))] text-center"
          style={{
            transform: "translate3d(0, calc(var(--p) * -9vh), 0) scale(calc(1 + var(--p) * 0.55))",
            opacity: "clamp(0, calc(1 - var(--p) * 2.6), 1)",
          }}
        >
          <p className="hero-fade label-mono flex items-center gap-2.5 whitespace-nowrap text-[10px] tracking-[0.13em] text-fg-2 sm:gap-3 sm:text-micro sm:tracking-[0.16em]" style={d(0)}>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-violet-bright shadow-[0_0_10px_2px_rgb(168_85_247/0.6)]" />
            Independent Creative Technology Studio
          </p>
          <div className="mt-6 md:mt-8">
            <KineticHeadline />
          </div>
          <p className="hero-fade-up mt-6 max-w-[600px] text-lead text-fg-2 md:mt-8" style={d(1050)}>
            We craft striking SaaS animations, cinematic 3D visuals, and immersive digital experiences for brands that
            refuse to blend in.
          </p>
          <div className="hero-fade-up pointer-events-auto mt-8 flex w-full flex-col items-stretch justify-center gap-3 xs:w-auto xs:flex-row xs:items-center" style={d(1200)}>
            <ButtonLink href="/work" size="lg">
              Explore Our Work
            </ButtonLink>
            <ButtonLink href="/contact" variant="glass" size="lg">
              Start a Project
            </ButtonLink>
            {siteConfig.showreel.src && <ShowreelButton src={siteConfig.showreel.src} poster={siteConfig.showreel.poster} />}
          </div>
        </div>

        {/* Inside the well */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[16%] text-center"
          style={{ opacity: "clamp(0, calc((var(--p) - 0.62) * 4), 1)", transform: "translate3d(0, calc((1 - var(--p)) * 40px), 0)" }}
        >
          <p className="font-display text-[clamp(2rem,7vw,5.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.045em] text-fg">
            Step inside <em className="text-violet-em">the work.</em>
          </p>
          <p className="label-mono mt-4 text-fg-2">
            <span className="hidden md:inline">Drag to spin · Click a screen</span>
            <span className="md:hidden">Swipe to spin · Tap a screen</span>
          </p>
        </div>

        {/* Bottom chrome */}
        <div className="hero-fade container-x absolute inset-x-0 bottom-0 flex items-end justify-center pb-[calc(env(safe-area-inset-bottom,0px)+22px)] sm:justify-between md:pb-8" style={{ ...d(1300), opacity: "clamp(0, calc(1 - var(--p) * 3), 1)" }}>
          <p className="label-mono hidden text-fg-3 sm:block">Design / Motion / Technology</p>
          <a href="#statement" className="label-mono group pointer-events-auto flex min-h-11 items-center gap-3 rounded-full text-fg-3 transition-colors hover:text-fg">
            Scroll to dive in
            <span aria-hidden="true" className="scroll-cue-track block h-9 w-px bg-white/10" />
          </a>
        </div>

        <p className="sr-only">
          Behind the headline, an interactive 3D well of studio footage — SaaS motion, 3D product renders, interactive web
          and video edits. Selecting a screen opens the matching service page; all services are also linked below.
        </p>
      </div>
    </section>
  );
}

/** Lightweight instant stand-in (and no-WebGL fallback): a tilted ring of posters in CSS 3D. */
function PosterRing({ hidden, strong }: { hidden: boolean; strong: boolean }) {
  const items = [...clips, ...clips].slice(0, 10);
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 flex items-center justify-center transition-opacity duration-[1200ms] [perspective:1400px] ${hidden ? "opacity-0" : strong ? "opacity-70" : "opacity-35"}`}
    >
      <div className="relative h-[40vh] w-[min(1100px,140vw)] [transform-style:preserve-3d] [transform:rotateX(58deg)_translateY(-6vh)]">
        {items.map((c, i) => {
          const a = (i / items.length) * 360;
          return (
            // eslint-disable-next-line @next/next/no-img-element -- decorative, tiny posters
            <img
              key={i}
              src={c.poster}
              alt=""
              loading="eager"
              decoding="async"
              className="absolute left-1/2 top-1/2 h-[22vh] w-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 object-cover"
              style={{ transform: `rotateZ(${a}deg) translateY(-34vh) rotateX(-90deg)` }}
            />
          );
        })}
      </div>
    </div>
  );
}
