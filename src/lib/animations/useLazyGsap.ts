"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

export interface GsapModules {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
}

type Setup = (mods: GsapModules) => void | (() => void);

/**
 * Loads GSAP + ScrollTrigger only when the element approaches the viewport, then runs
 * `setup` inside a gsap.context scoped to the element. Everything (tweens, ScrollTriggers,
 * matchMedia) is reverted on unmount. Keeps ~110 KB of animation code out of the initial load.
 */
export function useLazyGsap<T extends Element>(ref: RefObject<T | null>, setup: Setup, rootMargin = "100% 0px") {
  const setupRef = useRef(setup);
  useLayoutEffect(() => {
    setupRef.current = setup;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let ctx: { revert: () => void } | null = null;
    let cleanup: void | (() => void);

    const start = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        cleanup = setupRef.current({ gsap, ScrollTrigger });
      }, el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void start();
        }
      },
      { rootMargin },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      if (typeof cleanup === "function") cleanup();
      ctx?.revert();
    };
  }, [ref, rootMargin]);
}
