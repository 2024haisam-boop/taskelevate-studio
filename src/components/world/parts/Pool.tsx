"use client";

/* eslint-disable react-hooks/immutability -- R3F render loop: uniforms are mutated every frame. */

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { reel } from "@/data/media";
import { useWorld } from "../context";
import { createBeamMaterial, createGlowMaterial } from "../materials";
import { FLOOR_Y, POOL_Y, RADIUS, VIOLET } from "../layout";
import { glowVertex, poolFragment } from "../shaders";
import { band } from "../world";

/**
 * THE POOL — the bottom of the well. From above it plays the studio reel with ripples and a glowing rim;
 * the camera plunges through it into the studio, where it becomes the bright hole in the ceiling that
 * pours a column of light onto the floor.
 */
export function Pool() {
  const { pool, story } = useWorld();
  const root = useRef<THREE.Group>(null);
  const R = RADIUS - 0.08;

  const parts = useMemo(() => {
    const entry = pool.get(reel.src, reel.poster, { mipmaps: false });
    const discGeo = new THREE.CircleGeometry(R, 96);
    const discMat = new THREE.ShaderMaterial({
      vertexShader: glowVertex,
      fragmentShader: poolFragment,
      side: THREE.DoubleSide,
      uniforms: {
        uMap: entry.map,
        uMapAspect: { value: entry.aspect },
        uTime: { value: 0 },
        uExposure: { value: 0.6 },
        uRipple: { value: 1 },
        uRim: { value: new THREE.Color(VIOLET) },
      },
    });
    const plane = new THREE.PlaneGeometry(1, 1);
    const rim = createGlowMaterial({ color: VIOLET, ring: R / (R + 1.6), width: 0.04, intensity: 0.9 });
    const haze = createGlowMaterial({ color: "#8f6bff", power: 1.6, intensity: 0.35 });
    const columnGeo = new THREE.CylinderGeometry(R * 0.96, R + 1.8, POOL_Y - FLOOR_Y, 64, 1, true);
    const column = createBeamMaterial({ color: "#b49bff", intensity: 0 });
    const floorGlow = createGlowMaterial({ color: "#7f5cff", power: 1.8, intensity: 0 });
    return { entry, discGeo, discMat, plane, rim, haze, columnGeo, column, floorGlow };
  }, [pool, R]);

  useEffect(
    () => () => {
      const p = parts;
      [p.discGeo, p.plane, p.columnGeo].forEach((g) => g.dispose());
      [p.discMat, p.rim, p.haze, p.column, p.floorGlow].forEach((m) => m.dispose());
    },
    [parts],
  );

  useFrame(() => {
    const T = story.T;
    const visible = T > 0.6 && T < 4.2;
    if (root.current) root.current.visible = visible;
    if (!visible) return;
    if (T > 1.45 && T < 3.6) pool.want(parts.entry.src);
    const near = band(T, 1.6, 2.35);
    const u = parts.discMat.uniforms;
    u.uTime!.value = story.time;
    u.uExposure!.value = 0.55 + near * 0.5;
    u.uRipple!.value = 0.6 + near * 0.8 + Math.min(1.5, Math.abs(story.speed));
    parts.rim.uniforms.uIntensity!.value = 0.5 + near * 0.9;
    parts.haze.uniforms.uIntensity!.value = 0.22 + near * 0.25;
    const below = band(T, 2.72, 3.1);
    parts.column.uniforms.uIntensity!.value = below * 0.55;
    parts.column.uniforms.uTime!.value = story.time;
    parts.floorGlow.uniforms.uIntensity!.value = below * 0.55;
  });

  const rimSize = (R + 1.6) * 2;
  return (
    <group ref={root} visible={false}>
      <group position={[0, POOL_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={parts.discGeo} material={parts.discMat} />
        <mesh geometry={parts.plane} material={parts.rim} scale={[rimSize, rimSize, 1]} position={[0, 0, 0.02]} />
        <mesh geometry={parts.plane} material={parts.haze} scale={[R * 3.2, R * 3.2, 1]} position={[0, 0, 0.6]} />
      </group>
      <mesh geometry={parts.columnGeo} material={parts.column} position={[0, (POOL_Y + FLOOR_Y) / 2, 0]} />
      <mesh geometry={parts.plane} material={parts.floorGlow} position={[0, FLOOR_Y + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[(R + 2.4) * 2, (R + 2.4) * 2, 1]} />
    </group>
  );
}
