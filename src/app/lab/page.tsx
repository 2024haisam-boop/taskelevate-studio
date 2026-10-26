import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabStage } from "./LabStage";

export const metadata: Metadata = { title: "Lab", robots: { index: false, follow: false } };

/**
 * Internal recording stage: renders ONE scene fullscreen so `scripts/record-clip.mjs` can capture
 * studio footage (product turntables, UI motion…). Disabled in production unless ENABLE_LAB=1.
 */
export default function LabPage() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_LAB !== "1") notFound();
  return <LabStage />;
}
