import { createContext, useContext } from "react";
import * as THREE from "three";
import { BG, VIOLET } from "./layout";
import type { VideoPool } from "./videoPool";

/** Per-frame story state computed by the camera rig and read by every part. */
export interface Story {
  /** story time: act index + camera progress in that act (0 → 6) */
  T: number;
  /** camera progress per act (0..1) */
  c: [number, number, number, number, number, number];
  /** sticky-track progress per act (0..1) */
  ap: [number, number, number, number, number, number];
  /** camera progress at which each act's sticky part ends and its exit (hand-over to the next act) begins */
  split: [number, number, number, number, number, number];
  /** 0 → 1 as the camera tips over the rim to look straight down the well */
  dive: number;
  /** 0 → 1 entrance animation (1 = finished) */
  intro: number;
  /** smoothed scroll speed, viewport heights per second (signed, + = down) */
  speed: number;
  time: number;
  /** accumulated spin of the even / odd rows of the well + shaft (radians) */
  spinA: number;
  spinB: number;
}

/** Uniforms shared by every screen/floor material — one write per frame updates the whole world. */
export function createCommonUniforms() {
  return {
    uFogNear: { value: 9 },
    uFogFar: { value: 24 },
    uFogColor: { value: new THREE.Color(BG) },
    uInside: { value: 0 },
    uExposure: { value: 0.72 },
    uRim: { value: new THREE.Color(VIOLET).multiplyScalar(0.5) },
  };
}
export type CommonUniforms = ReturnType<typeof createCommonUniforms>;

export interface WorldCtx {
  pool: VideoPool;
  common: CommonUniforms;
  story: Story;
  compact: boolean;
  /** "low" on small/touch devices: fewer rows, particles and reflections */
  quality: "high" | "low";
  reducedMotion: boolean;
}

export const WorldContext = createContext<WorldCtx | null>(null);

export function useWorld(): WorldCtx {
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error("useWorld must be used inside <WorldCanvas>");
  return ctx;
}

export const ACT_INDEX = { hero: 0, descent: 1, reel: 2, services: 3, work: 4, finale: 5 } as const;
