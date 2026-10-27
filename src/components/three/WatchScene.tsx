"use client";

/* eslint-disable react-hooks/immutability --
 * React Three Fiber's render loop is imperative by design: Three.js objects (groups, materials) are created once
 * and mutated every frame inside useFrame. They are GPU resources, not React state.
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/* A WEBSITE YOU CAN PLAY WITH — the Interactive Websites service page's live demo: a luxury watch modelled
   entirely in code (lathe, extrude and tube geometry, canvas textures; no downloaded model or HDR), lit by a
   procedural studio environment. The hands keep the visitor's real time; the configurator swaps finishes with eased
   material transitions; "explode" lifts the layers apart and reveals the turning movement. Demo product. */

import { EXPLODE, HOTSPOTS, type CaseFinish, type DialColor, type DragState, type StrapColor, type WatchConfig } from "./watchConfig";

interface Props {
  config: WatchConfig;
  exploded: boolean;
  active: boolean;
  quality: "high" | "low";
  reducedMotion: boolean;
  drag: RefObject<DragState>;
  /** the exploded view's label elements (rendered by the page, positioned here every frame) */
  labels: RefObject<(HTMLElement | null)[]>;
  onReady?: () => void;
}

const FINISH: Record<CaseFinish, { color: string; metalness: number; roughness: number; clearcoat: number; bezel: string; index: string }> = {
  steel: { color: "#d6d9e0", metalness: 1, roughness: 0.2, clearcoat: 0, bezel: "#1b1d26", index: "#eef0f4" },
  gold: { color: "#e6b866", metalness: 1, roughness: 0.24, clearcoat: 0, bezel: "#2a1f12", index: "#f4d79a" },
  ceramic: { color: "#17171d", metalness: 0.12, roughness: 0.26, clearcoat: 1, bezel: "#0d0d12", index: "#e9e4ff" },
};
const DIAL: Record<DialColor, { color: string; text: string }> = {
  midnight: { color: "#1b2a6b", text: "#e9ecf5" },
  ivory: { color: "#efe6d2", text: "#2a2433" },
  emerald: { color: "#0f6a50", text: "#eef6f1" },
  violet: { color: "#5b2bd0", text: "#f1eaff" },
};
const STRAP: Record<StrapColor, { color: string; roughness: number; sheen: number }> = {
  tan: { color: "#7a4524", roughness: 0.55, sheen: 0.25 },
  rubber: { color: "#18181d", roughness: 0.86, sheen: 0 },
  lilac: { color: "#c3adf0", roughness: 0.9, sheen: 0.8 },
};

export default function WatchScene(props: Props) {
  const [dprMax, setDprMax] = useState(props.quality === "high" ? 1.75 : 1.3);
  return (
    <Canvas
      dpr={[1, dprMax]}
      frameloop={props.active ? "always" : "never"}
      camera={{ position: [0, 0.2, 7.4], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        props.onReady?.();
      }}
      style={{ touchAction: "pan-y" }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDprMax(1)} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[3, 5, 6]} intensity={2.2} />
      <directionalLight position={[-5, 2, -2]} intensity={1.1} color="#a78bfa" />
      <Environment resolution={props.quality === "high" ? 256 : 128} frames={1}>
        <Lightformer form="rect" intensity={3.2} position={[0, 5, 2]} scale={[10, 2.4, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2.1} position={[-5, 1, 2]} scale={[2.4, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.7} color="#a855f7" position={[5, 0.5, -1]} scale={[2, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1.3} color="#7dd3fc" position={[0, -2, -5]} scale={3} />
        <Lightformer form="rect" intensity={0.8} position={[0, -4, 3]} scale={[8, 1.5, 1]} rotation-x={-Math.PI / 2} />
      </Environment>
      <Watch {...props} />
    </Canvas>
  );
}

/* ------------------------------------------------------------------------------------------------ textures */

/** Sunray dial: a grey radial gradient with fine radial streaks (tinted by the material colour). */
function sunrayTexture(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const m = size / 2;
  const grad = g.createRadialGradient(m, m, 0, m, m, m);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.7, "#c9c9c9");
  grad.addColorStop(1, "#8a8a8a");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  g.globalCompositeOperation = "overlay";
  for (let i = 0; i < 720; i++) {
    const a = (i / 720) * Math.PI * 2;
    g.strokeStyle = i % 2 ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)";
    g.lineWidth = size / 900;
    g.beginPath();
    g.moveTo(m, m);
    g.lineTo(m + Math.cos(a) * m, m + Math.sin(a) * m);
    g.stroke();
  }
  g.globalCompositeOperation = "source-over";
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Radial brushing directions for the dial's anisotropic sheen (RG = direction, B = strength). */
function radialAnisotropy(size: number) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = x / (size - 1) - 0.5, dy = y / (size - 1) - 0.5, l = Math.hypot(dx, dy) || 1;
      const i = (y * size + x) * 4;
      // tangent to the circle: the sheen sweeps around like a real sunray finish
      data[i] = Math.round((-dy / l) * 127 + 128);
      data[i + 1] = Math.round((dx / l) * 127 + 128);
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  const t = new THREE.DataTexture(data, size, size);
  t.needsUpdate = true;
  return t;
}

/** Printing on the dial (white, tinted per dial): name, the minute track, a small line of text. */
function dialPrintTexture(size: number, serif: string, mono: string) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const m = size / 2;
  g.fillStyle = "#fff";
  g.strokeStyle = "#fff";
  // minute track
  g.lineWidth = size * 0.0022;
  g.beginPath();
  g.arc(m, m, m * 0.93, 0, Math.PI * 2);
  g.stroke();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, r0 = m * (i % 5 ? 0.895 : 0.875), r1 = m * 0.93;
    g.lineWidth = size * (i % 5 ? 0.0024 : 0.004);
    g.beginPath();
    g.moveTo(m + Math.sin(a) * r0, m - Math.cos(a) * r0);
    g.lineTo(m + Math.sin(a) * r1, m - Math.cos(a) * r1);
    g.stroke();
  }
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `italic ${Math.round(size * 0.075)}px ${serif}`;
  g.fillText("Orbit", m, m - size * 0.2);
  g.font = `500 ${Math.round(size * 0.026)}px ${mono}`;
  g.fillText("TASKELEVATE  STUDIOS", m, m - size * 0.135);
  g.fillText("LIVE  WEBGL  ·  DEMO", m, m + size * 0.2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Engraving on the case back. */
function backTexture(size: number, mono: string) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const m = size / 2;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, size, size);
  for (let r = 0.2; r < 0.95; r += 0.012) {
    g.strokeStyle = r % 0.024 < 0.012 ? "#8c8c8c" : "#747474";
    g.lineWidth = size * 0.006;
    g.beginPath();
    g.arc(m, m, m * r, 0, Math.PI * 2);
    g.stroke();
  }
  g.fillStyle = "#3a3a3a";
  g.font = `500 ${Math.round(size * 0.042)}px ${mono}`;
  g.textAlign = "center";
  const text = "TASKELEVATE STUDIOS  ·  ORBIT 01  ·  MODELLED IN CODE  ·  ";
  const chars = text.split("");
  chars.forEach((ch, i) => {
    const a = (i / chars.length) * Math.PI * 2;
    g.save();
    g.translate(m + Math.sin(a) * m * 0.78, m - Math.cos(a) * m * 0.78);
    g.rotate(a);
    g.fillText(ch, 0, 0);
    g.restore();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ------------------------------------------------------------------------------------------------ geometry */

function lathe(points: [number, number][], segments: number) {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments);
}

function gearGeometry(teeth: number, rOuter: number, rInner: number, depth: number, holes = 0) {
  const s = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [rInner, a],
      [rOuter, a + step * 0.18],
      [rOuter, a + step * 0.5],
      [rInner, a + step * 0.68],
    ];
    pts.forEach(([r, t], k) => (i === 0 && k === 0 ? s.moveTo(Math.cos(t) * r, Math.sin(t) * r) : s.lineTo(Math.cos(t) * r, Math.sin(t) * r)));
  }
  s.closePath();
  const hub = new THREE.Path();
  hub.absarc(0, 0, rInner * 0.16, 0, Math.PI * 2, true);
  s.holes.push(hub);
  for (let k = 0; k < holes; k++) {
    const a = (k / holes) * Math.PI * 2, p = new THREE.Path();
    p.absarc(Math.cos(a) * rInner * 0.55, Math.sin(a) * rInner * 0.55, rInner * 0.22, 0, Math.PI * 2, true);
    s.holes.push(p);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 });
  g.rotateX(-Math.PI / 2); // lie flat in the dial plane (Y up)
  return g;
}

function handGeometry(length: number, width: number, tail: number) {
  const s = new THREE.Shape();
  s.moveTo(-width * 0.5, -tail);
  s.lineTo(width * 0.5, -tail);
  s.lineTo(width * 0.42, length * 0.82);
  s.lineTo(0, length);
  s.lineTo(-width * 0.42, length * 0.82);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 });
  g.rotateX(-Math.PI / 2); // pointing toward −Z (12 o'clock), lying in the dial plane
  return g;
}

function strapGeometry(dir: 1 | -1, segments: number) {
  // one side of the strap: from the lugs, over the curve of a wrist and away behind the watch
  const pts = [
    [0, -0.02, 0.98],
    [0, -0.05, 1.42],
    [0, -0.26, 1.92],
    [0, -0.72, 2.32],
    [0, -1.32, 2.52],
  ].map(([x, y, z]) => new THREE.Vector3(x!, y!, z! * dir));
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segments, 0.042, 18, false);
  g.scale(9.6, 1, 1); // a flat, soft-edged band
  return g;
}

/* ------------------------------------------------------------------------------------------------ the watch */

const tmp = new THREE.Vector3();

function Watch({ config, exploded, quality, reducedMotion, drag, labels }: Props) {
  const root = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Group>(null);
  const bezelRef = useRef<THREE.Group>(null);
  const handsRef = useRef<THREE.Group>(null);
  const dialRef = useRef<THREE.Group>(null);
  const movementRef = useRef<THREE.Group>(null);
  const backRef = useRef<THREE.Group>(null);
  const hourHand = useRef<THREE.Mesh>(null);
  const minuteHand = useRef<THREE.Mesh>(null);
  const secondHand = useRef<THREE.Group>(null);
  const gears = useRef<THREE.Mesh[]>([]);
  const balance = useRef<THREE.Group>(null);
  const anchors = useRef<(THREE.Object3D | null)[]>([]);
  const ex = useRef(0);
  const hi = quality === "high";
  const seg = hi ? 128 : 72;

  const fonts = useMemo(() => {
    const css = getComputedStyle(document.documentElement);
    return {
      serif: css.getPropertyValue("--font-display").trim() || "Georgia, serif",
      mono: css.getPropertyValue("--font-mono").trim() || "monospace",
    };
  }, []);

  const geo = useMemo(() => {
    const caseBody = lathe(
      [
        [0, -0.17],
        [0.8, -0.17],
        [0.92, -0.15],
        [0.98, -0.1],
        [1.01, -0.03],
        [1.01, 0.05],
        [0.99, 0.1],
        [0.95, 0.125],
        [0.87, 0.125],
      ],
      seg,
    );
    const bezel = lathe(
      [
        [0.86, 0.12],
        [0.955, 0.125],
        [0.985, 0.15],
        [0.97, 0.19],
        [0.9, 0.205],
        [0.865, 0.2],
        [0.86, 0.12],
      ],
      seg,
    );
    const back = lathe(
      [
        [0.62, -0.2],
        [0.74, -0.185],
        [0.8, -0.165],
      ],
      seg,
    );
    const backFace = new THREE.CircleGeometry(0.62, seg);
    backFace.rotateX(Math.PI / 2); // facing −Y (away from the dial)
    const dial = new THREE.CylinderGeometry(0.865, 0.865, 0.02, seg);
    const print = new THREE.CircleGeometry(0.865, seg);
    print.rotateX(-Math.PI / 2);
    const crystal = new THREE.CylinderGeometry(0.87, 0.87, 0.035, seg);
    const marker = new RoundedBoxGeometry(0.05, 0.022, 0.15, 2, 0.012);
    const markerWide = new RoundedBoxGeometry(0.1, 0.022, 0.16, 2, 0.012);
    const lug = new RoundedBoxGeometry(0.16, 0.13, 0.36, 3, 0.05);
    const crown = new THREE.CylinderGeometry(0.085, 0.085, 0.15, 36);
    const crownCap = new THREE.SphereGeometry(0.045, 20, 12);
    const hour = handGeometry(0.44, 0.07, 0.08);
    const minute = handGeometry(0.66, 0.055, 0.1);
    const second = new THREE.BoxGeometry(0.012, 0.008, 0.84);
    second.translate(0, 0, -0.27);
    const secondTail = new THREE.CylinderGeometry(0.035, 0.035, 0.01, 24);
    secondTail.translate(0, 0, 0.16);
    const cap = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 24);
    const plate = new THREE.CylinderGeometry(0.8, 0.8, 0.03, seg);
    const gearA = gearGeometry(28, 0.34, 0.31, 0.025, 4);
    const gearB = gearGeometry(18, 0.22, 0.195, 0.025, 3);
    const gearC = gearGeometry(14, 0.15, 0.13, 0.025, 0);
    const wheel = new THREE.TorusGeometry(0.17, 0.012, 8, 48);
    wheel.rotateX(Math.PI / 2);
    const spoke = new THREE.BoxGeometry(0.34, 0.01, 0.012);
    const jewel = new THREE.SphereGeometry(0.018, 12, 8);
    const strapA = strapGeometry(1, hi ? 72 : 40);
    const strapB = strapGeometry(-1, hi ? 72 : 40);
    const bezelMark = new THREE.BoxGeometry(0.012, 0.006, 0.05);
    return { caseBody, bezel, back, backFace, dial, print, crystal, marker, markerWide, lug, crown, crownCap, hour, minute, second, secondTail, cap, plate, gearA, gearB, gearC, wheel, spoke, jewel, strapA, strapB, bezelMark };
  }, [seg, hi]);

  const tex = useMemo(
    () => ({
      sunray: sunrayTexture(hi ? 1024 : 512),
      aniso: radialAnisotropy(hi ? 256 : 128),
      print: dialPrintTexture(hi ? 1024 : 512, fonts.serif, fonts.mono),
      back: backTexture(hi ? 1024 : 512, fonts.mono),
    }),
    [hi, fonts],
  );

  const mat = useMemo(() => {
    const metal = new THREE.MeshPhysicalMaterial({ color: FINISH.steel.color, metalness: 1, roughness: 0.2, envMapIntensity: 1.25, side: THREE.DoubleSide });
    const bezel = new THREE.MeshPhysicalMaterial({ color: FINISH.steel.bezel, metalness: 0.2, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.1, side: THREE.DoubleSide });
    const lume = new THREE.MeshStandardMaterial({ color: "#f3f1ff", emissive: "#cfc4ff", emissiveIntensity: 0.25, roughness: 0.4 });
    const index = new THREE.MeshPhysicalMaterial({ color: FINISH.steel.index, metalness: 1, roughness: 0.12, envMapIntensity: 1.4 });
    const dial = new THREE.MeshPhysicalMaterial({
      color: DIAL.midnight.color,
      map: tex.sunray,
      metalness: 0.55,
      roughness: 0.32,
      clearcoat: 0.6,
      clearcoatRoughness: 0.12,
      anisotropy: 0.85,
      anisotropyMap: tex.aniso,
      envMapIntensity: 1.2,
    });
    const print = new THREE.MeshBasicMaterial({ color: DIAL.midnight.text, map: tex.print, transparent: true, depthWrite: false });
    const glass = hi
      ? new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: 0, roughness: 0.02, transmission: 1, thickness: 0.35, ior: 1.55, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.4, transparent: true })
      : new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: 0, roughness: 0.02, transparent: true, opacity: 0.12, clearcoat: 1, envMapIntensity: 2 });
    const accent = new THREE.MeshStandardMaterial({ color: "#a855f7", emissive: "#8b3dff", emissiveIntensity: 0.8, roughness: 0.3, metalness: 0.3 });
    const brass = new THREE.MeshPhysicalMaterial({ color: "#d8ad62", metalness: 1, roughness: 0.3, envMapIntensity: 1.2 });
    const plate = new THREE.MeshPhysicalMaterial({ color: "#9aa0ab", metalness: 1, roughness: 0.42, envMapIntensity: 1 });
    const ruby = new THREE.MeshPhysicalMaterial({ color: "#d01b4c", metalness: 0, roughness: 0.1, clearcoat: 1, emissive: "#5a0718", emissiveIntensity: 0.5 });
    const back = new THREE.MeshPhysicalMaterial({ color: FINISH.steel.color, map: tex.back, metalness: 1, roughness: 0.35, envMapIntensity: 1.1, side: THREE.DoubleSide });
    const strap = new THREE.MeshPhysicalMaterial({ color: STRAP.tan.color, roughness: 0.62, metalness: 0, sheen: 0.3, sheenColor: new THREE.Color("#ffffff"), envMapIntensity: 0.7 });
    return { metal, bezel, lume, index, dial, print, glass, accent, brass, plate, ruby, back, strap };
  }, [tex, hi]);

  // free GPU resources when the scene goes
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(tex).forEach((t) => t.dispose());
      Object.values(mat).forEach((m) => m.dispose());
    },
    [geo, tex, mat],
  );

  // the configurator's targets; materials ease toward them every frame
  const target = useMemo(() => {
    const f = FINISH[config.finish], d = DIAL[config.dial], s = STRAP[config.strap];
    return {
      metal: new THREE.Color(f.color),
      metalness: f.metalness,
      roughness: f.roughness,
      clearcoat: f.clearcoat,
      bezel: new THREE.Color(f.bezel),
      index: new THREE.Color(f.index),
      dial: new THREE.Color(d.color),
      text: new THREE.Color(d.text),
      strap: new THREE.Color(s.color),
      strapRough: s.roughness,
      sheen: s.sheen,
    };
  }, [config]);

  const bezelMarks = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const hourMarks = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  useFrame((state, delta) => {
    const dt = Math.min(0.05, delta);
    const t = state.clock.elapsedTime;
    const k = 1 - Math.exp(-dt * 6);

    // materials toward the chosen finish
    mat.metal.color.lerp(target.metal, k);
    mat.back.color.lerp(target.metal, k);
    mat.metal.metalness += (target.metalness - mat.metal.metalness) * k;
    mat.metal.roughness += (target.roughness - mat.metal.roughness) * k;
    mat.metal.clearcoat += (target.clearcoat - mat.metal.clearcoat) * k;
    mat.bezel.color.lerp(target.bezel, k);
    mat.index.color.lerp(target.index, k);
    mat.dial.color.lerp(target.dial, k);
    mat.print.color.lerp(target.text, k);
    mat.strap.color.lerp(target.strap, k);
    mat.strap.roughness += (target.strapRough - mat.strap.roughness) * k;
    mat.strap.sheen += (target.sheen - mat.strap.sheen) * k;

    // the visitor's local time; the seconds hand sweeps
    const now = new Date();
    const sec = now.getSeconds() + now.getMilliseconds() / 1000, min = now.getMinutes() + sec / 60, hr = (now.getHours() % 12) + min / 60;
    if (hourHand.current) hourHand.current.rotation.y = -(hr / 12) * Math.PI * 2;
    if (minuteHand.current) minuteHand.current.rotation.y = -(min / 60) * Math.PI * 2;
    if (secondHand.current) secondHand.current.rotation.y = -(sec / 60) * Math.PI * 2;

    // the movement turns
    const spin = reducedMotion ? 0 : t;
    gears.current.forEach((g, i) => g && (g.rotation.y = spin * (i === 0 ? 0.35 : i === 1 ? -0.55 : 0.9)));
    if (balance.current) balance.current.rotation.y = reducedMotion ? 0 : Math.sin(t * 6.2) * 1.1;

    // explode: layers lift apart along the watch's axis
    ex.current += ((exploded ? 1 : 0) - ex.current) * (1 - Math.exp(-dt * 3.2));
    const e = ex.current * ex.current * (3 - 2 * ex.current);
    const layers: [THREE.Group | null, number][] = [
      [crystalRef.current, EXPLODE.crystal],
      [bezelRef.current, EXPLODE.bezel],
      [handsRef.current, EXPLODE.hands],
      [dialRef.current, EXPLODE.dial],
      [movementRef.current, EXPLODE.movement],
      [backRef.current, EXPLODE.back],
    ];
    layers.forEach(([g, off]) => g && (g.position.y = off * e));
    // labels: each layer's anchor projected to the screen
    const op = Math.max(0, e * 1.4 - 0.4);
    labels.current?.forEach((el, i) => {
      const a = anchors.current[i];
      if (!el || !a) return;
      el.style.opacity = op.toFixed(3);
      if (op <= 0) return;
      a.getWorldPosition(tmp).project(state.camera);
      const W = state.size.width, w = el.offsetWidth, right = el.dataset.side === "right";
      // beside its anchor, but always inside the frame (narrow phones)
      const x = Math.min(right ? W - 22 - w : W - 8, Math.max(right ? 8 : 22 + w, (tmp.x * 0.5 + 0.5) * W));
      const y = (-tmp.y * 0.5 + 0.5) * state.size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });

    // pose: the visitor's drag, an idle sway, and a three-quarter view of the stack when exploded
    const g = root.current;
    if (g) {
      const d = drag.current;
      const idle = reducedMotion ? 0 : Math.min(1, Math.max(0, (performance.now() - d.last - 2500) / 2000));
      const yaw = d.yaw + Math.sin(t * 0.32) * 0.42 * idle - 0.42 + e * 0.5;
      const pitch = d.pitch + Math.PI / 2 - 0.32 - e * 0.72;
      g.rotation.set(0, 0, 0);
      g.rotateY(yaw);
      g.rotateX(pitch);
      // framed above the configurator bar (more room on portrait screens, where the bar takes two rows)
      const portrait = state.size.width < state.size.height;
      g.position.y = (portrait ? 0.62 : 0.4) + Math.sin(t * 0.8) * 0.04 * idle;
      const cam = state.camera;
      cam.position.z += ((portrait ? 9.4 : 8) + e * 0.9 - cam.position.z) * k;
    }
  });

  // a layer's label anchor rides with its layer (the label itself is DOM, positioned in useFrame)
  const tag = (key: keyof typeof EXPLODE) => {
    const i = HOTSPOTS.findIndex((h) => h.key === key);
    return <object3D ref={(o) => void (anchors.current[i] = o)} position={HOTSPOTS[i]!.at} />;
  };

  return (
    <group ref={root}>
      {/* case, lugs, crown */}
      <mesh geometry={geo.caseBody} material={mat.metal} />
      {[
        [0.42, 0.0, 0.88],
        [-0.42, 0.0, 0.88],
        [0.42, 0.0, -0.88],
        [-0.42, 0.0, -0.88],
      ].map((p, i) => (
        <mesh key={i} geometry={geo.lug} material={mat.metal} position={p as [number, number, number]} />
      ))}
      <group position={[1.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={geo.crown} material={mat.metal} />
        <mesh geometry={geo.crownCap} material={mat.accent} position={[0, -0.075, 0]} />
      </group>
      {/* strap */}
      <mesh geometry={geo.strapA} material={mat.strap} />
      <mesh geometry={geo.strapB} material={mat.strap} />

      <group ref={backRef}>
        <mesh geometry={geo.back} material={mat.metal} />
        <mesh geometry={geo.backFace} material={mat.back} position={[0, -0.2, 0]} />
        {tag("back")}
      </group>

      <group ref={movementRef}>
        <mesh geometry={geo.plate} material={mat.plate} position={[0, -0.04, 0]} />
        <mesh ref={(m) => void (m && (gears.current[0] = m))} geometry={geo.gearA} material={mat.brass} position={[-0.18, -0.02, 0.12]} />
        <mesh ref={(m) => void (m && (gears.current[1] = m))} geometry={geo.gearB} material={mat.brass} position={[0.32, -0.02, 0.16]} />
        <mesh ref={(m) => void (m && (gears.current[2] = m))} geometry={geo.gearC} material={mat.brass} position={[0.18, -0.015, -0.3]} />
        <group ref={balance} position={[-0.3, 0.005, -0.34]}>
          <mesh geometry={geo.wheel} material={mat.brass} />
          <mesh geometry={geo.spoke} material={mat.brass} />
          <mesh geometry={geo.spoke} material={mat.brass} rotation={[0, Math.PI / 2, 0]} />
        </group>
        {[
          [-0.18, 0.012, 0.12],
          [0.32, 0.012, 0.16],
          [0.18, 0.017, -0.3],
          [-0.3, 0.012, -0.34],
          [0.5, -0.005, -0.1],
        ].map((p, i) => (
          <mesh key={i} geometry={geo.jewel} material={mat.ruby} position={p as [number, number, number]} />
        ))}
        {tag("movement")}
      </group>

      <group ref={dialRef}>
        <mesh geometry={geo.dial} material={mat.dial} position={[0, 0.1, 0]} />
        <mesh geometry={geo.print} material={mat.print} position={[0, 0.111, 0]} />
        {hourMarks.map((i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh
              key={i}
              geometry={i === 0 ? geo.markerWide : geo.marker}
              material={mat.index}
              position={[Math.sin(a) * 0.66, 0.12, -Math.cos(a) * 0.66]}
              rotation={[0, -a, 0]}
            />
          );
        })}
        {tag("dial")}
      </group>

      <group ref={handsRef}>
        <group position={[0, 0.13, 0]}>
        <mesh ref={hourHand} geometry={geo.hour} material={mat.index} />
        <mesh ref={minuteHand} geometry={geo.minute} material={mat.index} position={[0, 0.016, 0]} />
        <group ref={secondHand} position={[0, 0.034, 0]}>
          <mesh geometry={geo.second} material={mat.accent} />
          <mesh geometry={geo.secondTail} material={mat.accent} />
        </group>
        <mesh geometry={geo.cap} material={mat.metal} position={[0, 0.04, 0]} />
        </group>
        {tag("hands")}
      </group>

      <group ref={bezelRef}>
        <mesh geometry={geo.bezel} material={mat.bezel} />
        {bezelMarks.map((i) => {
          const a = (i / 60) * Math.PI * 2, long = i % 5 === 0;
          return (
            <mesh
              key={i}
              geometry={geo.bezelMark}
              material={mat.lume}
              position={[Math.sin(a) * 0.925, 0.203, -Math.cos(a) * 0.925]}
              rotation={[0, -a, 0]}
              scale={long ? [1.6, 1, 1.5] : [1, 1, 1]}
            />
          );
        })}
        {tag("bezel")}
      </group>

      <group ref={crystalRef}>
        <mesh geometry={geo.crystal} material={mat.glass} position={[0, 0.215, 0]} />
        {tag("crystal")}
      </group>

    </group>
  );
}
