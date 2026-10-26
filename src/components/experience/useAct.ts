"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { registerAct, type ActName } from "@/components/world/world";

/**
 * Registers a tall act track with the world driver. The driver writes `--ap` (sticky progress 0..1) on the
 * element and calls `onProgress(ap, c)` — c = camera progress, which keeps running through the hand-over
 * to the next act — whenever the page scrolls.
 */
export function useAct<T extends HTMLElement>(name: ActName, ref: RefObject<T | null>, onProgress?: (ap: number, c: number) => void) {
  const cb = useRef(onProgress);
  useLayoutEffect(() => {
    cb.current = onProgress;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerAct(name, el, (ap, c) => cb.current?.(ap, c));
  }, [name, ref]);
}
