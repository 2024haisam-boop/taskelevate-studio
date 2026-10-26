"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MediaClip } from "@/data/media";
import { getService } from "@/data/services";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageVisible } from "@/hooks/usePageVisible";
import { setCursor } from "@/components/ui/CustomCursor";
import { detectWebGL } from "@/components/three/ProductStage";
import { startWorldDriver, world } from "@/components/world/world";
import { REENTER_EVENT } from "./acts/FinaleAct";
import { ChapterRail } from "./ChapterRail";
import { IntroGate } from "./IntroGate";

const WorldCanvas = dynamic(
  () =>
    import("@/components/world/WorldCanvas").then((m) => {
      world.loaded = Math.max(world.loaded, 0.5);
      return m;
    }),
  { ssr: false },
);

/**
 * HOME v3 — "ENTER THE STUDIO" (docs/REDESIGN-v3.md). One fixed WebGL world behind the whole page; the acts
 * (children) are tall DOM tracks whose sticky overlays carry all the real content. This component owns the
 * scroll driver, the canvas mount, pointer input, the intro gate, the chapter rail, film grain and the
 * "Re-enter" loop. No WebGL or reduced motion → `html[data-world="off"]`: no canvas, acts collapse to a
 * normal page with inline media.
 */
export function HomeExperience({ children }: { children: ReactNode }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState<HTMLElement | null>(null);
  const [mode, setMode] = useState<"pending" | "on" | "off">("pending");
  const [ready, setReady] = useState(false);
  const [footerCovers, setFooterCovers] = useState(false);
  const compact = useMediaQuery("(max-width: 767px)");
  const coarse = useMediaQuery("(pointer: coarse)");
  const visible = usePageVisible();

  // the one scroll driver for every act
  useEffect(() => startWorldDriver(), []);

  // decide on the world right after first paint
  useEffect(() => {
    // (world.introAt belongs to the intro gate, whose effect runs before this one)
    world.ready = false;
    world.loaded = Math.max(0.05, world.loaded);
    const html = document.documentElement;
    const id = requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const ok = !reduce && detectWebGL();
      html.dataset.world = ok ? "on" : "off";
      if (!ok) {
        world.ready = true;
        world.loaded = 1;
      }
      setSource(rootRef.current);
      setMode(ok ? "on" : "off");
    });
    return () => {
      cancelAnimationFrame(id);
      delete html.dataset.world;
    };
  }, []);

  // reveal the canvas once the scene reports its first real frame
  useEffect(() => {
    if (mode !== "on" || ready) return;
    let raf = 0;
    const poll = () => {
      if (world.ready) setReady(true);
      else raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  }, [mode, ready]);

  // pause rendering while the footer fills the screen
  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;
    const io = new IntersectionObserver(
      ([e]) => setFooterCovers(Boolean(e && e.intersectionRect.height >= window.innerHeight * 0.96)),
      { threshold: [0, 0.25, 0.5, 0.75, 0.9, 1] },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  // pointer parallax (mouse) + drag-to-spin on the hero (mouse drag or horizontal swipe)
  useEffect(() => {
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        world.px = (e.clientX / window.innerWidth) * 2 - 1;
        world.py = (e.clientY / window.innerHeight) * 2 - 1;
      }
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max(1, now - lastT) / 1000;
      world.dragVel = Math.max(-6, Math.min(6, ((dx / window.innerWidth) * 6) / dt * 0.12));
      lastX = e.clientX;
      lastT = now;
    };
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest("[data-drag-zone]") || t.closest("a,button")) return;
      dragging = true;
      lastX = e.clientX;
      lastT = performance.now();
    };
    const up = () => (dragging = false);
    const leave = () => {
      world.px = 0;
      world.py = 0;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  // the flash element is driven by the camera rig
  useEffect(() => {
    world.flashEl = flashRef.current;
    return () => {
      world.flashEl = null;
    };
  }, []);

  // "Re-enter the studio": flash → back to the entrance → replay the zoom-out + headline
  useEffect(() => {
    const loop = () => {
      const el = loopRef.current;
      const html = document.documentElement;
      el?.classList.remove("is-on");
      void el?.offsetWidth;
      el?.classList.add("is-on");
      window.setTimeout(() => {
        html.classList.add("intro-hold");
        window.scrollTo({ top: 0, behavior: "instant" });
        void html.offsetWidth;
        html.classList.remove("intro-hold");
        world.introAt = performance.now();
        document.getElementById("main-content")?.focus({ preventScroll: true });
      }, 320);
    };
    window.addEventListener(REENTER_EVENT, loop);
    return () => window.removeEventListener(REENTER_EVENT, loop);
  }, []);

  const onHover = (clip: MediaClip | null) => setCursor(clip ? { label: clip.label, hint: "Open" } : null);
  const onSelect = (clip: MediaClip) => {
    setCursor(null);
    router.push(getService(clip.service).href);
  };

  const active = mode === "on" && visible && !footerCovers;

  return (
    <div ref={rootRef} className="home-world relative">
      <IntroGate />
      {mode === "on" && source && (
        <div aria-hidden="true" className={`fixed inset-0 z-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <WorldCanvas compact={compact} quality={compact || coarse ? "low" : "high"} active={active} eventSource={source} onHover={onHover} onSelect={onSelect} />
        </div>
      )}
      <div ref={flashRef} aria-hidden="true" className="world-flash" />
      <div ref={loopRef} aria-hidden="true" className="loop-flash" />
      <div aria-hidden="true" className="film-grain" />
      <ChapterRail />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
