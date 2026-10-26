"use client";

import { useEffect, useRef, type ElementType } from "react";
import { decodeTo } from "@/lib/animations/decode";

/** A short label that decodes from scrambled glyphs each time it scrolls into view (screen readers get the
 *  plain text). Reduced motion: plain text. */
export function DecodeText({ text, as: Tag = "span", className }: { text: string; as?: ElementType; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancel = () => {};
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        cancel();
        cancel = decodeTo(el, text, 650);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancel();
    };
  }, [text]);

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </Tag>
  );
}
