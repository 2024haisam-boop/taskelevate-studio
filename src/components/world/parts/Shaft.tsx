"use client";

/* eslint-disable react-hooks/immutability -- R3F render loop: uniforms are mutated every frame. */

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clips } from "@/data/media";
import { useWorld } from "../context";
import { seeded } from "../materials";
import { PANEL_H, RADIUS, ROW_STEP, SHAFT_BOTTOM, SHAFT_ROWS, SHAFT_TOP, VIOLET, WELL_ROWS } from "../layout";
import { screenFragment, shaftVertex, streakFragment, streakVertex } from "../shaders";
import { band } from "../world";
import { rowDir, rowOffset } from "./WellRows";

const backdropVertex = /* glsl */ `
  varying float vY;
  varying float vA;
  void main() {
    vY = position.y;
    vA = atan(position.z, position.x);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
/** Behind the screens: the well's wall glows brighter toward the pool, so light leaks between the screens. */
const backdropFragment = /* glsl */ `
  uniform float uTop;
  uniform float uBottom;
  uniform float uFade;
  uniform float uTime;
  uniform vec3 uColor;
  varying float vY;
  varying float vA;
  void main() {
    float k = clamp((uTop - vY) / (uTop - uBottom), 0.0, 1.0);
    float seams = pow(0.5 + 0.5 * sin(vA * 18.0 + uTime * 0.25), 18.0);
    vec3 col = vec3(0.031, 0.035, 0.051) + uColor * (0.025 + pow(k, 2.2) * 0.32 + seams * 0.05 * k);
    gl_FragColor = vec4(col * uFade, 1.0);
    #include <colorspace_fragment>
  }
`;

/**
 * THE SHAFT — the well keeps going down: 14 more rows of screens (one instanced draw per clip, rows spun on the
 * GPU in step with the hero rows), a glowing wall behind them, and light streaks that stretch with fall speed.
 */
export function Shaft({ perRow }: { perRow: number }) {
  const { pool, common, story, quality } = useWorld();
  const root = useRef<THREE.Group>(null);

  const thetaLength = ((Math.PI * 2) / perRow) * 0.9;
  const panelAspect = (RADIUS * thetaLength) / PANEL_H;
  const shared = useMemo(() => ({ uFade: { value: 0 }, uSpinA: { value: 0 }, uSpinB: { value: 0 } }), []);

  const meshes = useMemo(() => {
    const base = new THREE.CylinderGeometry(RADIUS, RADIUS, PANEL_H, 20, 1, true, -thetaLength / 2, thetaLength);
    const lists = clips.map(() => ({ angle: [] as number[], y: [] as number[], dir: [] as number[] }));
    for (let r = 0; r < SHAFT_ROWS; r++) {
      const row = r + WELL_ROWS;
      for (let i = 0; i < perRow; i++) {
        const l = lists[(i + row * 2) % clips.length]!;
        l.angle.push((i / perRow) * Math.PI * 2 + rowOffset(row));
        l.y.push(SHAFT_TOP - r * ROW_STEP);
        l.dir.push(rowDir(row));
      }
    }
    const out = clips.map((clip, ci) => {
      const g = new THREE.InstancedBufferGeometry().copy(base as unknown as THREE.InstancedBufferGeometry);
      const l = lists[ci]!;
      g.setAttribute("aAngle", new THREE.InstancedBufferAttribute(new Float32Array(l.angle), 1));
      g.setAttribute("aY", new THREE.InstancedBufferAttribute(new Float32Array(l.y), 1));
      g.setAttribute("aDir", new THREE.InstancedBufferAttribute(new Float32Array(l.dir), 1));
      g.instanceCount = l.angle.length;
      const entry = pool.get(clip.srcSmall, clip.poster, { mipmaps: true });
      const material = new THREE.ShaderMaterial({
        vertexShader: shaftVertex,
        fragmentShader: screenFragment,
        defines: { CURVED: "" },
        side: THREE.DoubleSide,
        uniforms: {
          ...common,
          ...shared,
          uMap: entry.map,
          uPanelAspect: { value: panelAspect },
          uMapAspect: { value: entry.aspect },
          uRadius: { value: 0.09 },
          uBoost: { value: 0 },
        },
      });
      return { geometry: g, material, src: entry.src };
    });
    base.dispose();
    return out;
  }, [pool, common, shared, perRow, thetaLength, panelAspect]);

  const length = SHAFT_TOP - SHAFT_BOTTOM + PANEL_H;
  const backdrop = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(RADIUS + 0.45, RADIUS + 0.45, length + 1, 48, 1, true);
    const material = new THREE.ShaderMaterial({
      vertexShader: backdropVertex,
      fragmentShader: backdropFragment,
      side: THREE.BackSide,
      uniforms: {
        uTop: { value: length / 2 },
        uBottom: { value: -length / 2 },
        uFade: shared.uFade,
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(VIOLET) },
      },
    });
    return { geometry, material };
  }, [length, shared]);

  const streaks = useMemo(() => {
    const rand = seeded(11);
    const n = quality === "low" ? 160 : 320;
    const seeds = new Float32Array(n * 2 * 3);
    const ends = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      const sx = rand();
      const sy = rand();
      const sz = rand();
      for (let e = 0; e < 2; e++) {
        seeds.set([sx, sy, sz], (i * 2 + e) * 3);
        ends[i * 2 + e] = e;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 2 * 3), 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
    geometry.setAttribute("aEnd", new THREE.BufferAttribute(ends, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader: streakVertex,
      fragmentShader: streakFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTop: { value: SHAFT_TOP + 1 },
        uSpan: { value: length + 1 },
        uStretch: { value: 0 },
        uColor: { value: new THREE.Color("#c9b4ff") },
        uOpacity: { value: 0 },
      },
    });
    return { geometry, material };
  }, [quality, length]);

  useEffect(
    () => () => {
      meshes.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
      backdrop.geometry.dispose();
      backdrop.material.dispose();
      streaks.geometry.dispose();
      streaks.material.dispose();
    },
    [meshes, backdrop, streaks],
  );

  useFrame(() => {
    const T = story.T;
    const visible = story.dive > 0.02 && T < 2.78;
    if (root.current) root.current.visible = visible;
    if (!visible) return;
    if (T < 2.6) meshes.forEach((m) => pool.want(m.src));
    shared.uFade.value = band(story.dive, 0, 0.3);
    shared.uSpinA.value = story.spinA;
    shared.uSpinB.value = story.spinB;
    backdrop.material.uniforms.uTime!.value = story.time;
    const fall = Math.min(1, Math.abs(story.speed) * 0.7);
    streaks.material.uniforms.uOpacity!.value = fall * band(T, 0.8, 1.1) * (1 - band(T, 2.3, 2.6)) * 0.9;
    streaks.material.uniforms.uStretch!.value = -story.speed * 2.2;
  });

  return (
    <group ref={root} visible={false}>
      {meshes.map((m) => (
        <mesh key={m.src} geometry={m.geometry} material={m.material} frustumCulled={false} />
      ))}
      <mesh geometry={backdrop.geometry} material={backdrop.material} position={[0, (SHAFT_TOP + SHAFT_BOTTOM) / 2 - 0.2, 0]} />
      <lineSegments geometry={streaks.geometry} material={streaks.material} frustumCulled={false} />
    </group>
  );
}
