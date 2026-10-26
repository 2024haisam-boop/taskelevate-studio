"use client";

/* eslint-disable react-hooks/immutability -- R3F render loop: Three.js objects and uniforms are mutated every frame. */

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useWorld } from "../context";
import { createGlowMaterial, createTypeTexture, seeded } from "../materials";
import { BLUE, EYE_Y, PORTAL_R, PORTAL_Z, VIOLET } from "../layout";
import { bandFragment, coreFragment, dustFragment, fresnelVertex, glowVertex, ringFragment, spiralVertex } from "../shaders";
import { band } from "../world";
import { projScale } from "./Dust";

const BAND_A = "SAAS ANIMATION  ✦  3D PRODUCT FILMS  ✦  INTERACTIVE WEBSITES  ✦  VIDEO EDITING  ✦  ";
const BAND_B = "TASKELEVATE STUDIOS  ✦  CRAFTING THE UNEXPECTED  ✦  ";

const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide } as const;

/**
 * THE PORTAL — the end of the hall: a ring of light with a swirling core, particles spiralling in, and two
 * bands of kinetic type orbiting it in opposite directions.
 */
export function Portal() {
  const { story, quality } = useWorld();
  const root = useRef<THREE.Group>(null);
  const bandA = useRef<THREE.Mesh>(null);
  const bandB = useRef<THREE.Mesh>(null);

  const parts = useMemo(() => {
    const ring = new THREE.ShaderMaterial({
      vertexShader: fresnelVertex,
      fragmentShader: ringFragment,
      ...additive,
      uniforms: {
        uA: { value: new THREE.Color(VIOLET) },
        uB: { value: new THREE.Color(BLUE) },
        uTime: { value: 0 },
        uIntensity: { value: 0 },
      },
    });
    const core = new THREE.ShaderMaterial({
      vertexShader: glowVertex,
      fragmentShader: coreFragment,
      ...additive,
      uniforms: {
        uA: { value: new THREE.Color("#7b4dff") },
        uB: { value: new THREE.Color("#2f7dff") },
        uTime: { value: 0 },
        uIntensity: { value: 0 },
      },
    });
    const halo = createGlowMaterial({ color: VIOLET, ring: 1 / 1.9, width: 0.09 });
    const haze = createGlowMaterial({ color: "#6a45ff", power: 2.4 });
    const empty = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
    empty.needsUpdate = true;
    const makeBand = (repeat: number, color: string) =>
      new THREE.ShaderMaterial({
        vertexShader: fresnelVertex,
        fragmentShader: bandFragment,
        ...additive,
        uniforms: {
          uMap: { value: empty as THREE.Texture },
          uRepeat: { value: repeat },
          uOffset: { value: 0 },
          uColor: { value: new THREE.Color(color) },
          uIntensity: { value: 0 },
        },
      });
    const bandMatA = makeBand(2, "#efe7ff");
    const bandMatB = makeBand(4, "#b79bff");

    const rand = seeded(37);
    const n = quality === "low" ? 260 : 620;
    const seeds = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) seeds[i] = rand();
    const spiralGeo = new THREE.BufferGeometry();
    spiralGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    spiralGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
    const spiral = new THREE.ShaderMaterial({
      vertexShader: spiralVertex,
      fragmentShader: dustFragment,
      ...additive,
      uniforms: {
        uTime: { value: 0 },
        uPixel: { value: 1 },
        uSize: { value: 0.07 },
        uColor: { value: new THREE.Color("#cdb8ff") },
        uOpacity: { value: 0 },
      },
    });

    return {
      ring,
      core,
      halo,
      haze,
      empty,
      bandMatA,
      bandMatB,
      spiral,
      spiralGeo,
      torus: new THREE.TorusGeometry(PORTAL_R, 0.055, 20, 240),
      disc: new THREE.CircleGeometry(PORTAL_R * 0.97, 96),
      plane: new THREE.PlaneGeometry(1, 1),
      bandGeoA: new THREE.CylinderGeometry(4.8, 4.8, 0.9, 160, 1, true),
      bandGeoB: new THREE.CylinderGeometry(5.6, 5.6, 0.5, 160, 1, true),
    };
  }, [quality]);

  // Kinetic type needs the brand display face → build the textures once fonts are ready
  useEffect(() => {
    let cancelled = false;
    const textures: THREE.Texture[] = [];
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-space-grotesk").trim() || "sans-serif";
    void (document.fonts?.load(`700 120px ${family}`) ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      const a = createTypeTexture(BAND_A, family);
      const b = createTypeTexture(BAND_B, family);
      textures.push(a, b);
      parts.bandMatA.uniforms.uMap!.value = a;
      parts.bandMatB.uniforms.uMap!.value = b;
    });
    return () => {
      cancelled = true;
      textures.forEach((t) => t.dispose());
    };
  }, [parts]);

  useEffect(
    () => () => {
      const p = parts;
      [p.ring, p.core, p.halo, p.haze, p.bandMatA, p.bandMatB, p.spiral].forEach((m) => m.dispose());
      [p.torus, p.disc, p.plane, p.bandGeoA, p.bandGeoB, p.spiralGeo].forEach((g) => g.dispose());
      p.empty.dispose();
    },
    [parts],
  );

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const T = story.T;
    const visible = T > 4.3;
    if (root.current) root.current.visible = visible;
    if (!visible) return;
    const on = band(T, 4.4, 5.25);
    const surge = band(story.c[5], story.split[5], 1);
    const t = story.time;
    parts.ring.uniforms.uTime!.value = t;
    parts.ring.uniforms.uIntensity!.value = on * (0.9 + surge * 0.6);
    parts.core.uniforms.uTime!.value = t;
    parts.core.uniforms.uIntensity!.value = on * (0.55 + surge * 0.5);
    parts.halo.uniforms.uIntensity!.value = on * (0.7 + surge * 0.5);
    parts.haze.uniforms.uIntensity!.value = on * 0.2;
    parts.spiral.uniforms.uTime!.value = t;
    parts.spiral.uniforms.uPixel!.value = projScale(frame);
    parts.spiral.uniforms.uOpacity!.value = on * 0.9;
    const spin = 0.1 + Math.min(1.2, Math.abs(story.speed)) * 0.25;
    if (bandA.current) bandA.current.rotation.y += spin * dt;
    if (bandB.current) bandB.current.rotation.y -= spin * 0.8 * dt;
    parts.bandMatA.uniforms.uIntensity!.value = on * 1.1;
    parts.bandMatB.uniforms.uIntensity!.value = on * 0.7;
  });

  const halo = PORTAL_R * 2 * 1.9;
  return (
    <group ref={root} position={[0, EYE_Y + 0.4, PORTAL_Z]} visible={false}>
      <mesh geometry={parts.plane} material={parts.haze} scale={[30, 30, 1]} position={[0, 0, -1.5]} />
      <mesh geometry={parts.disc} material={parts.core} />
      <mesh geometry={parts.torus} material={parts.ring} />
      <mesh geometry={parts.plane} material={parts.halo} scale={[halo, halo, 1]} position={[0, 0, 0.05]} />
      <points geometry={parts.spiralGeo} material={parts.spiral} frustumCulled={false} />
      {/* the type orbits below the ring's centre so it never crosses the closing headline */}
      <mesh ref={bandA} geometry={parts.bandGeoA} material={parts.bandMatA} position={[0, -2.75, 0]} rotation={[0.1, 0, -0.05]} />
      <mesh ref={bandB} geometry={parts.bandGeoB} material={parts.bandMatB} position={[0, -3.75, 0]} rotation={[-0.06, 0, 0.04]} />
    </group>
  );
}
