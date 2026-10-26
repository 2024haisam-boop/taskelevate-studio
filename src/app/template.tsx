"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

// Module-level: false until the first route has mounted in this browser session.
let hasNavigated = false;

/**
 * Subtle page transition for client-side navigations only.
 * The initial load is never animated (protects LCP and avoids a flash).
 */
export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (hasNavigated) ref.current?.classList.add("page-enter");
    hasNavigated = true;
  }, []);

  return <div ref={ref}>{children}</div>;
}
