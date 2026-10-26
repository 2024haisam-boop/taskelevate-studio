"use client";

import { useEffect, useRef } from "react";
import { world } from "@/components/world/world";

const SEEN_KEY = "tes-intro";
/** doors start parting this long after the filament flares */
const FLARE_MS = 280;
/** gate fully gone */
const DONE_MS = 1500;

/**
 * THE ENTRANCE. Black screen, a light filament that fills with REAL loading progress (fonts → 3D chunk →
 * posters → first frame), then it flares and the screen splits open like a door onto the 3D world while the
 * camera zooms out from a single screen. First visit per session gets the full gate; later visits a quick
 * flare; client-side navigations and reduced motion skip the gate (the 3D zoom-out still plays).
 * Any wheel / key / tap opens it early. Decorative (aria-hidden); content underneath is always in the DOM.
 *
 * The gate is visible before hydration only because the inline head script adds `intro` / `intro-short` to
 * <html> on the home page — CSS failsafes hide it after a few seconds even if JavaScript never runs.
 */
export function IntroGate() {
  const numRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const full = html.classList.contains("intro");
    const short = html.classList.contains("intro-short");
    let raf = 0;
    const timers: number[] = [];
    let opened = false;

    const release = () => {
      html.classList.remove("intro-hold");
    };
    const finish = () => {
      html.classList.remove("intro", "intro-short", "intro-open", "intro-hold");
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* private mode */
      }
    };

    if (!full && !short) {
      // client-side navigation / reduced motion: no gate, just the camera's zoom-out
      world.introAt = performance.now() + 150;
      return;
    }
    if (window.scrollY > window.innerHeight * 0.5) {
      // restored mid-page: skip the entrance entirely
      world.introAt = performance.now() - 10_000;
      release();
      finish();
      return;
    }

    const start = performance.now();
    const minMs = full ? 1500 : 380;
    const maxMs = full ? 6500 : 4000;
    let shown = 0;

    const open = () => {
      if (opened) return;
      opened = true;
      cancelAnimationFrame(raf);
      html.classList.add("intro-open");
      timers.push(
        window.setTimeout(() => {
          world.introAt = performance.now();
          release();
        }, FLARE_MS),
        window.setTimeout(finish, DONE_MS),
      );
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", skip);
    };

    const tick = () => {
      const now = performance.now();
      const target = world.ready ? 1 : Math.min(0.96, world.loaded);
      const pace = Math.min(1, (now - start) / minMs);
      shown += (Math.min(target, pace) - shown) * 0.14;
      if (world.ready && pace >= 1 && shown > 0.985) shown = 1;
      if (numRef.current) numRef.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${shown.toFixed(4)})`;
      if (shown >= 1 || now - start > maxMs) {
        open();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    function skip(e: Event) {
      if (e.cancelable) e.preventDefault();
      open();
    }
    function onKey(e: KeyboardEvent) {
      if ([" ", "ArrowDown", "PageDown", "End", "ArrowUp", "PageUp", "Home"].includes(e.key)) e.preventDefault();
      open();
    }
    window.addEventListener("wheel", skip, { passive: false });
    window.addEventListener("touchmove", skip, { passive: false });
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", onKey);

    // fonts are the first, cheapest step of "loading"
    void document.fonts?.ready.then(() => (world.loaded = Math.max(world.loaded, 0.18)));
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", skip);
      if (!opened) {
        release();
        finish();
      }
    };
  }, []);

  return (
    <div className="intro-gate" aria-hidden="true">
      <div className="gate-door gate-door-top" />
      <div className="gate-door gate-door-bottom" />
      <span className="gate-flare" />
      <div className="gate-core">
        <p className="gate-label label-mono">Taskelevate Studios</p>
        <div className="gate-filament">
          <span ref={fillRef} className="gate-fill" />
        </div>
        <p className="gate-meta label-mono">
          <span>Entering the studio</span>
          <span ref={numRef} className="tabular-nums">
            000
          </span>
        </p>
      </div>
      <p className="gate-hint label-mono">Scroll or tap to skip</p>
    </div>
  );
}
