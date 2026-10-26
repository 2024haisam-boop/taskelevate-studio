"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MotionScene } from "@/components/three/MotionScene";
import { ProductStage } from "@/components/three/ProductStage";
import type { PointerState, ProductView } from "@/components/three/ProductScene";
import { SaaSScene } from "@/components/three/SaaSScene";
import { WebScene } from "@/components/three/WebScene";
import { EditScene } from "@/components/services/EditScene";
import s from "@/components/three/engine.module.css";

const noop = () => () => {};
const readScene = () => new URLSearchParams(window.location.search).get("scene") ?? "product-turntable";
/** Clip length in seconds (?dur=8) — the turntable does exactly one revolution per clip so it loops seamlessly. */
const readDuration = () => Number(new URLSearchParams(window.location.search).get("dur") ?? 8);

/** Fullscreen single-scene stage used only for recording footage. */
export function LabStage() {
  const scene = useSyncExternalStore(noop, readScene, () => "");
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0, dragYaw: 0 });
  const [active, setActive] = useState(false);
  const [view, setView] = useState<ProductView>("final");

  // Entrance replay + gentle scripted "camera" drift so UI scenes move like a real hand-held demo
  useEffect(() => {
    if (!scene) return;
    const t = window.setTimeout(() => setActive(true), 250);
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const time = (performance.now() - start) / 1000;
      const el = rootRef.current;
      if (el) {
        el.style.setProperty("--px", (Math.sin(time * 0.6) * 0.55).toFixed(4));
        el.style.setProperty("--py", (Math.cos(time * 0.45) * 0.35).toFixed(4));
        el.style.setProperty("--spread", (1.15 + Math.sin(time * 0.8) * 0.2).toFixed(3));
      }
      pointer.current.dragYaw = scene === "product-scan" ? time * 0.18 : 0.62 + (time / readDuration()) * Math.PI * 2;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [scene]);

  // Scripted representation cycle for the "scan" clip: wireframe → clay → final, every 2 s, forever
  useEffect(() => {
    if (scene !== "product-scan") return;
    const order: ProductView[] = ["wireframe", "clay", "final"];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % order.length;
      setView(order[i]!);
    }, 2000);
    return () => window.clearInterval(id);
  }, [scene]);

  if (!scene) return null;
  const isProduct = scene.startsWith("product");

  return (
    <div className="fixed inset-0 z-[200] bg-bg">
      {/* hide the Next.js dev badge in recordings */}
      <style>{"nextjs-portal{display:none!important}"}</style>
      {/* wrapper: the module's .viewport sets position:relative, which would beat Tailwind's absolute */}
      <div className="absolute inset-0">
      <div ref={rootRef} className={`${s.viewport} h-full w-full`} data-paused="false">
        <div className={s.grid} aria-hidden="true" />
        {isProduct && (
          <ProductStage
            selected
            running
            mount
            pointer={pointer}
            reducedMotion={false}
            quality="high"
            showControls={false}
            initialView={scene === "product-scan" ? "wireframe" : "final"}
            view={scene === "product-scan" ? view : "final"}
            zoom={1.55}
          />
        )}
        {(scene === "saas" || scene === "web") && (
          <div className={s.mode} data-active={active}>
            {scene === "saas" ? <SaaSScene /> : <WebScene />}
          </div>
        )}
        {scene === "motion" && (
          <div className={s.mode} data-active="true">
            <MotionScene active playing onTogglePlay={() => undefined} />
          </div>
        )}
        {scene === "edit" && (
          <div className="absolute inset-0 flex items-center justify-center p-[3vw] [&_figure>div:last-child]:hidden">
            <div className="w-full max-w-[1400px]">
              <EditScene />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
