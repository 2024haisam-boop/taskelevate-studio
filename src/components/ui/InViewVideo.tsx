"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

interface Props {
  src: string;
  poster: string;
  className?: string;
  /** Play only while hovered on fine pointers (still plays in view on touch) */
  hoverOnly?: boolean;
  rootMargin?: string;
}

/**
 * Muted looping video that loads only when it approaches the viewport and plays only while visible.
 * Reduced motion → stays on its poster. Never more than what's on screen is decoding.
 * The poster isn't in the markup either (a `poster` attribute downloads at once, wherever the card is): it is set
 * once the card is within a couple of screens, so on a slow connection the first bytes go to what's on screen.
 */
export function InViewVideo({ src, poster, className, hoverOnly = false, rootMargin = "200px" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || !poster) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        v.poster = poster;
        io.disconnect();
      },
      { rootMargin: "200% 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [poster]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const hoverMode = hoverOnly && fine;
    let visible = false;
    let hovering = false;
    const sync = () => {
      if (reduce) return;
      if (visible && (!hoverMode || hovering)) void v.play().catch(() => undefined);
      else v.pause();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = Boolean(e?.isIntersecting);
        if (visible && !v.src) {
          v.src = src;
          v.load();
        }
        sync();
      },
      { rootMargin },
    );
    io.observe(v);
    const host = v.closest<HTMLElement>("[data-card]") ?? v;
    const enter = () => {
      hovering = true;
      sync();
    };
    const leave = () => {
      hovering = false;
      sync();
    };
    if (hoverMode) {
      host.addEventListener("pointerenter", enter);
      host.addEventListener("pointerleave", leave);
    }
    return () => {
      io.disconnect();
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
    };
  }, [src, hoverOnly, rootMargin]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      className={cn("block h-full w-full object-cover", className)}
    />
  );
}
