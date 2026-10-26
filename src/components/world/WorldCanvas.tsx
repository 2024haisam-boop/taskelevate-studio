"use client";

/* eslint-disable react-hooks/immutability -- the world store is a mutable, non-React object by design. */

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { MediaClip } from "@/data/media";
import { CameraRig } from "./CameraRig";
import { WorldContext, createCommonUniforms, type WorldCtx } from "./context";
import { BG } from "./layout";
import { Dust } from "./parts/Dust";
import { Pool } from "./parts/Pool";
import { Portal } from "./parts/Portal";
import { Shaft } from "./parts/Shaft";
import { Studio } from "./parts/Studio";
import { WellRows } from "./parts/WellRows";
import { VideoPool } from "./videoPool";
import { world } from "./world";

interface Props {
  compact: boolean;
  quality: "high" | "low";
  /** render + decode only while true (tab visible, world on screen) */
  active: boolean;
  /** element that receives pointer events for the scene (the DOM sits on top of the canvas) */
  eventSource: HTMLElement;
  onHover?: (clip: MediaClip | null) => void;
  onSelect?: (clip: MediaClip) => void;
}

/**
 * The home page's one WebGL world (lazy chunk). Fixed behind the page; the camera rig reads scroll from the
 * shared store and every part decides for itself when it is visible and which footage it needs.
 */
export default function WorldCanvas({ compact, quality, active, eventSource, onHover, onSelect }: Props) {
  const ctx = useMemo<WorldCtx>(
    () => ({
      pool: new VideoPool(),
      common: createCommonUniforms(),
      story: {
        T: 0,
        c: [0, 0, 0, 0, 0, 0],
        ap: [0, 0, 0, 0, 0, 0],
        split: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
        dive: 0,
        intro: 0,
        speed: 0,
        time: 0,
        spinA: 0,
        spinB: 0,
      },
      compact,
      quality,
      reducedMotion: false,
    }),
    [compact, quality],
  );

  useEffect(() => () => ctx.pool.dispose(), [ctx]);
  useEffect(() => {
    ctx.pool.enabled = active;
    if (!active) ctx.pool.pauseAll();
  }, [ctx, active]);

  const perRow = compact ? 7 : 9;

  return (
    <Canvas
      dpr={[1, quality === "low" ? 1.25 : 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 42, position: [0, 0, 6], near: 0.08, far: 140 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", stencil: false }}
      eventSource={eventSource}
      eventPrefix="client"
      onCreated={({ gl }) => gl.setClearColor(BG, 1)}
      aria-hidden="true"
    >
      <WorldContext.Provider value={ctx}>
        <CameraRig />
        <WellRows perRow={perRow} onHover={onHover} onSelect={onSelect} />
        <Shaft perRow={perRow} />
        <Pool />
        <Studio />
        <Portal />
        <Dust />
        <ReadyProbe ctx={ctx} />
      </WorldContext.Provider>
    </Canvas>
  );
}

/** Reports loading progress (posters) and flips `world.ready` after the first real frames. */
function ReadyProbe({ ctx }: { ctx: WorldCtx }) {
  const frames = useRef(0);
  useFrame(() => {
    if (world.ready) return;
    frames.current += 1;
    const { postersLoaded, postersTotal } = ctx.pool;
    const posters = postersTotal ? postersLoaded / postersTotal : 1;
    world.loaded = Math.max(world.loaded, 0.55 + posters * 0.4);
    if (frames.current > 3 && posters >= 1) {
      world.loaded = 1;
      world.ready = true;
    }
  });
  return null;
}
