"use client";

/* eslint-disable react-hooks/immutability -- R3F render loop: uniforms are mutated every frame. */

import { useFrame, type RootState } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useWorld } from "../context";
import { seeded } from "../materials";
import { dustFragment, dustVertex } from "../shaders";
import { band } from "../world";

/** Pixels per world unit at distance 1 (for size-attenuated points). */
export function projScale(frame: RootState) {
  const cam = frame.camera as THREE.PerspectiveCamera;
  return (frame.size.height * frame.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov || 45) / 2));
}

/** Dust motes hanging in the air around the camera everywhere in the world — they catch the light. */
export function Dust() {
  const { story, quality } = useWorld();
  const { geometry, material } = useMemo(() => {
    const rand = seeded(23);
    const n = quality === "low" ? 260 : 650;
    const seeds = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) seeds[i] = rand();
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 3));
    const material = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uCam: { value: new THREE.Vector3() },
        uBox: { value: new THREE.Vector3(16, 12, 16) },
        uTime: { value: 0 },
        uSize: { value: 0.028 },
        uPixel: { value: 1 },
        uColor: { value: new THREE.Color("#d6c8ff") },
        uOpacity: { value: 0 },
      },
    });
    return { geometry, material };
  }, [quality]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((frame) => {
    const u = material.uniforms;
    (u.uCam!.value as THREE.Vector3).copy(frame.camera.position);
    u.uTime!.value = story.time;
    u.uPixel!.value = projScale(frame);
    // more motes in the lit studio than in the open well
    u.uOpacity!.value = band(story.intro, 0.3, 0.9) * (0.55 + band(story.T, 2.7, 3.2) * 0.45);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
