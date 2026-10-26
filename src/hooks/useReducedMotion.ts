"use client";

import { useMediaQuery } from "./useMediaQuery";

/** True when the visitor prefers reduced motion. Defaults to false on the server. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True on devices with a precise hovering pointer (mouse/trackpad). */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
