import * as THREE from "three";
import type { CommonUniforms } from "./context";
import type { PoolEntry } from "./videoPool";
import { beamFragment, fresnelVertex, glowFragment, glowVertex, screenFragment, screenVertex } from "./shaders";

/** Deterministic PRNG (mulberry32) — particle layouts are stable across renders and identical every visit. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const additive = {
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
} as const;

/** Radial halo (ring = 0) or soft ring (ring = radius 0..1) on a unit plane. */
export function createGlowMaterial(o: { color: string; ring?: number; width?: number; power?: number; intensity?: number }) {
  return new THREE.ShaderMaterial({
    vertexShader: glowVertex,
    fragmentShader: glowFragment,
    ...additive,
    uniforms: {
      uColor: { value: new THREE.Color(o.color) },
      uIntensity: { value: o.intensity ?? 0 },
      uPower: { value: o.power ?? 2 },
      uRing: { value: o.ring ?? 0 },
      uWidth: { value: o.width ?? 0.05 },
    },
  });
}

/** Volumetric light cone (open CylinderGeometry; uv.y = 1 at the source). */
export function createBeamMaterial(o: { color: string; intensity?: number }) {
  return new THREE.ShaderMaterial({
    vertexShader: fresnelVertex,
    fragmentShader: beamFragment,
    ...additive,
    uniforms: {
      uColor: { value: new THREE.Color(o.color) },
      uIntensity: { value: o.intensity ?? 1 },
      uTime: { value: 0 },
    },
  });
}

/** Flat rounded video screen; `reflect` builds the mirrored copy that lies under the floor. */
export function createScreenMaterial(common: CommonUniforms, entry: PoolEntry, panelAspect: number, reflect = false) {
  return new THREE.ShaderMaterial({
    vertexShader: screenVertex,
    fragmentShader: screenFragment,
    defines: reflect ? { REFLECT: "" } : {},
    side: THREE.DoubleSide,
    transparent: reflect,
    depthWrite: !reflect,
    uniforms: {
      ...common,
      uMap: entry.map,
      uPanelAspect: { value: panelAspect },
      uMapAspect: { value: entry.aspect },
      uRadius: { value: 0.07 },
      uBoost: { value: 0 },
      uFade: { value: 1 },
    },
  });
}

/** Builds a canvas texture with one line of display type repeated around a band (alpha = glyphs). */
export function createTypeTexture(text: string, family: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 4096;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    let size = 176;
    ctx.font = `700 ${size}px ${family}`;
    const w = ctx.measureText(text).width;
    if (w > canvas.width * 0.98) {
      size = Math.floor((size * canvas.width * 0.98) / w);
      ctx.font = `700 ${size}px ${family}`;
    }
    const tw = ctx.measureText(text).width;
    ctx.fillText(text, (canvas.width - tw) / 2, canvas.height / 2 + size * 0.04);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}
