"use client";

import { useEffect, useRef } from "react";

/**
 * Muted preview loop that plays only while its card is hovered — and only on
 * fine-pointer devices. Touch devices never autoplay previews (brief §10/§24).
 */
export function HoverVideo({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    const card = video?.closest<HTMLElement>("[data-card]");
    if (!video || !card) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const play = () => {
      video.preload = "auto";
      void video.play().catch(() => undefined);
    };
    const pause = () => video.pause();
    card.addEventListener("pointerenter", play);
    card.addEventListener("pointerleave", pause);
    card.addEventListener("focusin", play);
    card.addEventListener("focusout", pause);
    return () => {
      card.removeEventListener("pointerenter", play);
      card.removeEventListener("pointerleave", pause);
      card.removeEventListener("focusin", play);
      card.removeEventListener("focusout", pause);
    };
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
    />
  );
}
