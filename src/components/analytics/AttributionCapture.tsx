"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { captureAttribution } from "@/lib/analytics/attribution";

/** Captures UTM attribution on every route change (sessionStorage only). */
export function AttributionCapture() {
  const pathname = usePathname();
  useEffect(() => {
    captureAttribution(window.location.href);
  }, [pathname]);
  return null;
}
