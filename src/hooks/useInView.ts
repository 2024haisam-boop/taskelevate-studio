"use client";

import { useEffect, useState, type RefObject } from "react";

interface Options {
  rootMargin?: string;
  threshold?: number;
  /** Stop observing after the first time the element enters. */
  once?: boolean;
}

/** IntersectionObserver hook. Returns whether the element is currently in view. */
export function useInView<T extends Element>(ref: RefObject<T | null>, options: Options = {}): boolean {
  const { rootMargin = "0px", threshold = 0, once = false } = options;
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return inView;
}
