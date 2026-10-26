"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe media query hook. Returns `serverFallback` during SSR/hydration,
 * then the live value.
 */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}
