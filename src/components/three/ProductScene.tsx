"use client";

/* eslint-disable react-hooks/immutability --
 * React Three Fiber's render loop is imperative by design: Three.js objects (camera,
 * materials, clipping planes) are created once and mutated every frame inside useFrame.
 * They are GPU resources, not React state, so the compiler's immutability rule doesn't apply.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type ProductView = "wireframe" | "clay" | "final";

export interface PointerState {
  /** Normalised pointer position over the viewport, [-1, 1] */
  x: number;
  y: number;
  /** Accumulated horizontal drag (touch) in radians */
  dragYaw: number;
}

interface SceneProps {
  view: ProductView;
  /** Render loop runs only while true (mode visible + on screen + tab visible) */
  active: boolean;
  pointer: RefObject<PointerState>;
  reducedMotion: boolean;
  quality: "high" | "low";
  onReady?: () => void;
  /** Framing multiplier: >1 moves the camera closer (close-up footage) */
  zoom?: number;
}

/**
 * Real-time product study — a custom-designed minimal camera built from lathe and
 * rounded-box geometry (no downloaded model, no HDR). Three representations:
 *   wireframe → topology + hard edges
 *   clay      → neutral sculpt material for reading form
 *   final     → physically-based materials, procedural studio lighting, coated lens
 * Wireframe ⇄ solid uses a world-space clipping plane "render scan"; clay ⇄ final
 * lerps material parameters. Everything is disposed on unmount.
 */
export default function ProductScene({ view, active, pointer, reducedMotion, quality, onReady, zoom = 1 }: SceneProps) {
  const [dprMax, setDprMax] = useState(quality === "high" ? 1.75 : 1.3);

  return (
    <Canvas
      dpr={[1, dprMax]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0.4, 9.2], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        gl.setClearColor(0x000000, 0);
        onReady?.();
      }}
      style={{ touchAction: "pan-y" }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDprMax(1)} />
      <FitCamera zoom={zoom} />
      <ambientLight intensity={0.32} />
      <directionalLight position={[4, 6, 6]} intensity={2.3} />
      <directionalLight position={[-6, 1.5, -3]} intensity={0.9} color="#9b86ff" />
      <Environment resolution={quality === "high" ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={2.6} position={[0, 5, 1.5]} scale={[9, 2.4, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.8} position={[-5.5, 1, 1.5]} scale={[2.5, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.4} color="#a855f7" position={[5.5, 0.5, -1]} scale={[2, 5, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="rect" intensity={0.9} color="#189be8" position={[0, -1, -6]} scale={[8, 2, 1]} />
      </Environment>
      <CameraProduct view={view} pointer={pointer} reducedMotion={reducedMotion} quality={quality} />
    </Canvas>
  );
}

/** Keep the product comfortably framed on any aspect ratio (portrait phones included). */
function FitCamera({ zoom }: { zoom: number }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    camera.position.z = Math.max(10.2, 11.2 / aspect) / zoom;
    camera.updateProjectionMatrix();
  }, [camera, size, zoom]);
  return null;
}

/* -------------------------------------------------------------------------- */

type MatKey = "body" | "grip" | "alu" | "barrel" | "glass" | "accent" | "led";

interface FinishSpec {
  color: string;
  roughness: number;
  metalness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  iridescence?: number;
  emissive?: string;
  emissiveIntensity?: number;
  envMapIntensity?: number;
}

const FINAL: Record<MatKey, FinishSpec> = {
  body: { color: "#2b2e38", roughness: 0.46, metalness: 0.18, clearcoat: 0.4, clearcoatRoughness: 0.4, envMapIntensity: 1.25 },
  grip: { color: "#1a1b21", roughness: 0.86, metalness: 0, envMapIntensity: 0.8 },
  alu: { color: "#c9cdd6", roughness: 0.27, metalness: 1, envMapIntensity: 1.1 },
  barrel: { color: "#1b1d24", roughness: 0.34, metalness: 0.6, clearcoat: 0.3, envMapIntensity: 1.2 },
  glass: { color: "#07070d", roughness: 0.05, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03, iridescence: 0.45, envMapIntensity: 0.9 },
  accent: { color: "#a855f7", roughness: 0.32, metalness: 0.55, emissive: "#7c3aed", emissiveIntensity: 0.55, envMapIntensity: 1 },
  led: { color: "#a855f7", roughness: 0.4, metalness: 0, emissive: "#b06cff", emissiveIntensity: 2.4, envMapIntensity: 0.3 },
};

const CLAY: FinishSpec = { color: "#bdc0c9", roughness: 0.82, metalness: 0, clearcoat: 0, iridescence: 0, emissiveIntensity: 0, envMapIntensity: 0.5 };

interface Part {
  key: string;
  geometry: THREE.BufferGeometry;
  mat: MatKey;
  position: [number, number, number];
  rotation?: [number, number, number];
  /** Draw full triangle wireframe (topology) in addition to hard edges */
  topology?: boolean;
}

const Y_MIN = -1.25;
const Y_MAX = 1.45;

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function CameraProduct({
  view,
  pointer,
  reducedMotion,
  quality,
}: {
  view: ProductView;
  pointer: RefObject<PointerState>;
  reducedMotion: boolean;
  quality: "high" | "low";
}) {
  const root = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const state = useRef({ reveal: view === "wireframe" ? 0 : 1, finish: view === "final" ? 1 : 0, yaw: 0, pitch: 0 });
  const hi = quality === "high";

  // --- Clipping planes (world space): solid shows below the scan, lines above ---
  const planes = useMemo(
    () => ({
      solid: new THREE.Plane(new THREE.Vector3(0, -1, 0), Y_MAX),
      lines: new THREE.Plane(new THREE.Vector3(0, 1, 0), -Y_MAX),
    }),
    [],
  );

  // --- Geometry (built once per quality level) ---
  const lensGroupParts = useMemo<Part[]>(() => {
    const profile: [number, number][] = [
      [0.98, 0],
      [0.98, 0.08],
      [0.92, 0.1],
      [0.92, 0.36],
      [0.97, 0.38],
      [0.97, 0.66],
      [0.9, 0.68],
      [0.9, 0.9],
      [0.86, 0.92],
      [0.86, 1.0],
      [0.8, 1.04],
      [0.63, 1.04],
      [0.6, 0.99],
      [0.0, 0.99],
    ];
    const lathe = new THREE.LatheGeometry(
      profile.map(([r, y]) => new THREE.Vector2(r, y)),
      hi ? 96 : 48,
    );
    const glass = new THREE.SphereGeometry(1.4, hi ? 64 : 32, hi ? 16 : 10, 0, Math.PI * 2, 0, 0.45);
    const ring = new THREE.TorusGeometry(0.975, 0.022, 8, hi ? 128 : 64);
    return [
      { key: "barrel", geometry: lathe, mat: "barrel", position: [0, 0, 0], topology: true },
      { key: "glass", geometry: glass, mat: "glass", position: [0, -0.27, 0] },
      { key: "accent", geometry: ring, mat: "accent", position: [0, 0.37, 0], rotation: [Math.PI / 2, 0, 0] },
    ];
  }, [hi]);

  const bodyParts = useMemo<Part[]>(() => {
    const seg = hi ? 5 : 3;
    return [
      { key: "body", geometry: new RoundedBoxGeometry(3.4, 2.0, 1.2, seg, 0.26), mat: "body", position: [0, 0, 0], topology: true },
      { key: "grip", geometry: new RoundedBoxGeometry(0.58, 1.74, 0.28, seg, 0.13), mat: "grip", position: [-1.33, -0.05, 0.62] },
      { key: "deck", geometry: new RoundedBoxGeometry(2.1, 0.14, 0.9, 2, 0.06), mat: "alu", position: [-0.42, 1.06, 0] },
      { key: "dial", geometry: new THREE.CylinderGeometry(0.3, 0.3, 0.2, hi ? 40 : 24), mat: "alu", position: [-1.0, 1.22, 0.02], topology: true },
      { key: "shutter", geometry: new THREE.CylinderGeometry(0.16, 0.17, 0.12, 32), mat: "alu", position: [0.98, 1.06, 0.16] },
      { key: "led", geometry: new THREE.SphereGeometry(0.035, 12, 8), mat: "led", position: [1.38, 0.72, 0.6] },
      { key: "lugL", geometry: new THREE.CylinderGeometry(0.07, 0.07, 0.16, 16), mat: "alu", position: [-1.74, 0.62, 0], rotation: [0, 0, Math.PI / 2] },
      { key: "lugR", geometry: new THREE.CylinderGeometry(0.07, 0.07, 0.16, 16), mat: "alu", position: [1.74, 0.62, 0], rotation: [0, 0, Math.PI / 2] },
    ];
  }, [hi]);

  const allParts = useMemo(() => [...bodyParts, ...lensGroupParts], [bodyParts, lensGroupParts]);

  const edges = useMemo(() => {
    const map = new Map<string, { edges: THREE.EdgesGeometry; wire?: THREE.WireframeGeometry }>();
    for (const p of allParts) {
      map.set(p.key, {
        edges: new THREE.EdgesGeometry(p.geometry, 24),
        wire: p.topology ? new THREE.WireframeGeometry(p.geometry) : undefined,
      });
    }
    return map;
  }, [allParts]);

  // --- Materials (shared, lerped between clay and final) ---
  const [initialFinish] = useState(() => (view === "final" ? 1 : 0));
  const materials = useMemo(() => {
    const make = (k: MatKey) => {
      const m = new THREE.MeshPhysicalMaterial({
        clippingPlanes: [planes.solid],
        side: k === "barrel" ? THREE.DoubleSide : THREE.FrontSide,
        iridescenceIOR: 1.32,
        iridescenceThicknessRange: [180, 460],
      });
      return m;
    };
    const keys: MatKey[] = ["body", "grip", "alu", "barrel", "glass", "accent", "led"];
    const created = Object.fromEntries(keys.map((k) => [k, make(k)])) as Record<MatKey, THREE.MeshPhysicalMaterial>;
    applyFinish(created, initialFinish, hi);
    return created;
  }, [planes, initialFinish, hi]);

  const lineMats = useMemo(
    () => ({
      edges: new THREE.LineBasicMaterial({ color: "#b3a6ff", transparent: true, opacity: 0.85, clippingPlanes: [planes.lines], depthWrite: false }),
      wire: new THREE.LineBasicMaterial({ color: "#5fb8ff", transparent: true, opacity: 0.13, clippingPlanes: [planes.lines], depthWrite: false }),
    }),
    [planes],
  );

  const scanMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#c9a4ff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    [],
  );
  const scanGeo = useMemo(() => new THREE.RingGeometry(2.05, 2.12, 128), []);

  const shadow = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (g) {
      const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
      grd.addColorStop(0, "rgba(0,0,0,0.85)");
      grd.addColorStop(0.55, "rgba(0,0,0,0.35)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
    }
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.6 });
    const geo = new THREE.PlaneGeometry(5.4, 2.4);
    return { tex, mat, geo };
  }, []);

  // Dispose GPU resources on unmount / quality change
  useEffect(() => {
    return () => {
      allParts.forEach((p) => p.geometry.dispose());
      edges.forEach((e) => {
        e.edges.dispose();
        e.wire?.dispose();
      });
    };
  }, [allParts, edges]);

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((m) => m.dispose());
      lineMats.edges.dispose();
      lineMats.wire.dispose();
      scanMat.dispose();
      scanGeo.dispose();
      shadow.tex.dispose();
      shadow.mat.dispose();
      shadow.geo.dispose();
    };
  }, [materials, lineMats, scanMat, scanGeo, shadow]);

  const targets = useRef({ reveal: 1, finish: 1 });
  useEffect(() => {
    targets.current = { reveal: view === "wireframe" ? 0 : 1, finish: view === "final" ? 1 : 0 };
  }, [view]);

  useFrame((frame, delta) => {
    const s = state.current;
    const dt = Math.min(delta, 1 / 20);
    const speed = reducedMotion ? 100 : 1 / 0.7; // full sweep ≈ 700ms

    // Render scan
    const prevReveal = s.reveal;
    s.reveal = moveTowards(s.reveal, targets.current.reveal, speed * dt);
    const h = THREE.MathUtils.lerp(Y_MIN, Y_MAX, easeInOut(s.reveal));
    planes.solid.constant = h;
    planes.lines.constant = -h;

    // Material finish
    const prevFinish = s.finish;
    s.finish = moveTowards(s.finish, targets.current.finish, (reducedMotion ? 100 : 1 / 0.65) * dt);
    if (s.finish !== prevFinish) applyFinish(materials, easeInOut(s.finish), hi);

    // Visibility culling for fully hidden representations
    const solidVisible = s.reveal > 0.001;
    const linesVisible = s.reveal < 0.999;
    root.current?.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && o.userData.solid) o.visible = solidVisible;
      if ((o as THREE.LineSegments).isLineSegments) o.visible = linesVisible;
    });

    // Scan ring
    if (scanRef.current) {
      const scanning = s.reveal > 0.002 && s.reveal < 0.998 && s.reveal !== prevReveal;
      scanMat.opacity = THREE.MathUtils.damp(scanMat.opacity, scanning ? 0.9 : 0, 10, dt);
      scanRef.current.position.y = h;
      scanRef.current.visible = scanMat.opacity > 0.01;
    }
    if (shadowRef.current) {
      shadow.mat.opacity = THREE.MathUtils.lerp(0.18, 0.62, s.reveal) * THREE.MathUtils.lerp(0.75, 1, s.finish);
    }

    // Orientation: three-quarter view + pointer/drag, with gentle idle sway (never a spin)
    const p = pointer.current;
    const sway = reducedMotion ? 0 : Math.sin(frame.clock.elapsedTime * 0.45) * 0.05;
    const targetYaw = -0.62 + (p?.x ?? 0) * 0.45 + (p?.dragYaw ?? 0) + sway;
    const targetPitch = 0.1 + (p?.y ?? 0) * 0.16;
    s.yaw = THREE.MathUtils.damp(s.yaw, targetYaw, 4, dt);
    s.pitch = THREE.MathUtils.damp(s.pitch, targetPitch, 4, dt);
    if (root.current) {
      root.current.rotation.y = s.yaw;
      root.current.rotation.x = s.pitch;
    }
  });

  const renderPart = (p: Part) => {
    const e = edges.get(p.key);
    return (
      <group key={p.key} position={p.position} rotation={p.rotation}>
        <mesh geometry={p.geometry} material={materials[p.mat]} userData={{ solid: true }} />
        {e && <lineSegments geometry={e.edges} material={lineMats.edges} />}
        {e?.wire && <lineSegments geometry={e.wire} material={lineMats.wire} />}
      </group>
    );
  };

  return (
    <group position={[0, 0.05, 0]}>
      <group ref={root}>
        {bodyParts.map(renderPart)}
        {/* Lens assembly — lathe axis (Y) rotated to face forward (+Z) */}
        <group position={[0.28, -0.06, 0.6]} rotation={[Math.PI / 2, 0, 0]} scale={0.74}>
          {lensGroupParts.map(renderPart)}
        </group>
      </group>
      <mesh ref={scanRef} geometry={scanGeo} material={scanMat} rotation={[-Math.PI / 2, 0, 0]} visible={false} />
      <mesh ref={shadowRef} geometry={shadow.geo} material={shadow.mat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.32, 0.1]} />
    </group>
  );
}

const scratch = { a: new THREE.Color(), b: new THREE.Color(), e: new THREE.Color(), black: new THREE.Color("#000000") };

/** Lerp every material between the clay sculpt state (t=0) and final finish (t=1). */
function applyFinish(materials: Record<MatKey, THREE.MeshPhysicalMaterial>, t: number, hi: boolean) {
  (Object.keys(materials) as MatKey[]).forEach((k) => {
    const m = materials[k];
    const f = FINAL[k];
    scratch.a.set(CLAY.color);
    scratch.b.set(f.color);
    m.color.copy(scratch.a.lerp(scratch.b, t));
    m.roughness = THREE.MathUtils.lerp(CLAY.roughness, f.roughness, t);
    m.metalness = THREE.MathUtils.lerp(CLAY.metalness, f.metalness, t);
    m.clearcoat = THREE.MathUtils.lerp(0, f.clearcoat ?? 0, t);
    m.clearcoatRoughness = f.clearcoatRoughness ?? 0.3;
    m.iridescence = hi ? THREE.MathUtils.lerp(0, f.iridescence ?? 0, t) : 0;
    m.envMapIntensity = THREE.MathUtils.lerp(CLAY.envMapIntensity ?? 0.5, f.envMapIntensity ?? 1, t);
    if (f.emissive) {
      scratch.e.set(f.emissive);
      m.emissive.copy(scratch.black).lerp(scratch.e, t);
      m.emissiveIntensity = (f.emissiveIntensity ?? 0) * t;
    }
  });
}

function moveTowards(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}
