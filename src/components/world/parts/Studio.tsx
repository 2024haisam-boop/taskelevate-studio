"use client";

/* eslint-disable react-hooks/immutability -- R3F render loop: Three.js objects and uniforms are mutated every frame. */

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getClip } from "@/data/media";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { useWorld } from "../context";
import { carouselShift, hallSide, hallX } from "../CameraRig";
import { createBeamMaterial, createScreenMaterial } from "../materials";
import { CAROUSEL, EYE_Y, FLOOR_Y, HALL, PORTAL_Z, VIOLET, hallZ } from "../layout";
import { floorFragment, floorVertex } from "../shaders";
import { band, clamp01, stepped } from "../world";

/** Service → studio clip shown on its carousel screen. */
export const SERVICE_CLIP: Record<string, string> = {
  "saas-animation": "saas-dashboard",
  "3d-animation": "product-turntable",
  "interactive-websites": "web-layers",
  "video-editing": "edit-timeline",
};

const easeIn = (x: number) => x * x * x;

interface Screen {
  src: string;
  material: THREE.ShaderMaterial;
  reflection: THREE.ShaderMaterial;
}

function useScreens(clipIds: string[], aspect: number): Screen[] {
  const { pool, common } = useWorld();
  const screens = useMemo(
    () =>
      clipIds.map((id) => {
        const clip = getClip(id);
        const entry = pool.get(clip.src, clip.poster, { mipmaps: true });
        return {
          src: entry.src,
          material: createScreenMaterial(common, entry, aspect),
          reflection: createScreenMaterial(common, entry, aspect, true),
        };
      }),
    [clipIds, aspect, pool, common],
  );
  useEffect(
    () => () =>
      screens.forEach((s) => {
        s.material.dispose();
        s.reflection.dispose();
      }),
    [screens],
  );
  return screens;
}

/**
 * THE STUDIO — a dark glossy floor (grid, pools of light, light strips that lead to the portal), the services
 * carousel lit by a spotlight, and the gallery hall of project screens. Every screen has a mirrored twin under
 * the semi-transparent floor, which reads as a reflection.
 */
export function Studio() {
  const { story, common, pool } = useWorld();
  const root = useRef<THREE.Group>(null);
  const carousel = useRef<THREE.Group>(null);
  const carouselRefl = useRef<THREE.Group>(null);
  const spot = useRef<THREE.Mesh>(null);

  const serviceClips = useMemo(() => services.map((s) => SERVICE_CLIP[s.slug] ?? "saas-dashboard"), []);
  const projectClips = useMemo(() => projects.map((p) => p.clip ?? "saas-dashboard"), []);
  const cScreens = useScreens(serviceClips, CAROUSEL.w / CAROUSEL.h);
  const hScreens = useScreens(projectClips, HALL.w / HALL.h);

  const geo = useMemo(
    () => ({
      carousel: new THREE.PlaneGeometry(CAROUSEL.w, CAROUSEL.h),
      hall: new THREE.PlaneGeometry(HALL.w, HALL.h),
      floor: new THREE.PlaneGeometry(44, 110),
      spot: new THREE.CylinderGeometry(0.22, 2.3, EYE_Y + 5.5 - FLOOR_Y, 48, 1, true),
      hallSpot: new THREE.CylinderGeometry(0.1, 1.7, 5.4, 32, 1, true),
    }),
    [],
  );

  const floor = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: floorVertex,
        fragmentShader: floorFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uFogNear: common.uFogNear,
          uFogFar: common.uFogFar,
          uFogColor: common.uFogColor,
          uBase: { value: new THREE.Color("#06070b") },
          uTint: { value: new THREE.Color(VIOLET) },
          uPoolA: { value: new THREE.Vector4(0, 0, 4.6, 0) },
          uPoolB: { value: new THREE.Vector4(0, CAROUSEL.z + CAROUSEL.r, 2.4, 0) },
          uPoolC: { value: new THREE.Vector4(0, HALL.z0, 2.2, 0) },
          uStripX: { value: 3.7 },
          uStripZ: { value: new THREE.Vector2(HALL.z0 + 6, PORTAL_Z + 3) },
          uTime: { value: 0 },
          uFade: { value: 0 },
        },
      }),
    [common],
  );
  const spotMat = useMemo(() => createBeamMaterial({ color: "#d9ccff", intensity: 0 }), []);
  const hallSpotMats = useMemo(() => projects.map(() => createBeamMaterial({ color: "#c8b6ff", intensity: 0 })), []);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      floor.dispose();
      spotMat.dispose();
      hallSpotMats.forEach((m) => m.dispose());
    },
    [geo, floor, spotMat, hallSpotMats],
  );

  const hallMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const hallRefl = useRef<(THREE.Mesh | null)[]>([]);
  const hallSpots = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const T = story.T;
    const visible = T > 2.55 && T < 5.9;
    if (root.current) root.current.visible = visible;
    if (!visible) return;
    const aspect = Math.max(0.3, window.innerWidth / Math.max(1, window.innerHeight));

    floor.uniforms.uTime!.value = story.time;
    floor.uniforms.uFade!.value = band(T, 2.7, 2.95);
    (floor.uniforms.uPoolA!.value as THREE.Vector4).w = band(T, 2.75, 3.05) * 0.9;

    /* ---- services carousel */
    const cVisible = T < 4.4;
    if (carousel.current) carousel.current.visible = cVisible;
    if (carouselRefl.current) carouselRefl.current.visible = cVisible;
    if (spot.current) spot.current.visible = cVisible;
    if (cVisible) {
      if (T > 2.5 && T < 4.2) cScreens.forEach((s) => pool.want(s.src));
      const n = cScreens.length;
      const x = stepped(story.ap[3] * (n - 1) * 0.999);
      const sp = story.split[3];
      const ex = clamp01((story.c[3] - sp) / Math.max(0.01, 1 - sp));
      const shift = carouselShift(aspect);
      const lift = easeIn(ex) * 6.5;
      const rot = -x * (Math.PI / 2);
      for (const g of [carousel.current, carouselRefl.current]) {
        if (!g) continue;
        g.position.x = shift;
        g.rotation.y = rot;
      }
      if (carousel.current) carousel.current.position.y = EYE_Y + lift;
      if (carouselRefl.current) carouselRefl.current.position.y = 2 * FLOOR_Y - EYE_Y - lift;
      const front = Math.round(x) % n;
      const f = x - Math.floor(x);
      const moving = band(f, 0.28, 0.5) * (1 - band(f, 0.5, 0.72));
      cScreens.forEach((s, i) => {
        const active = i === front ? 1 : 0;
        const ub = s.material.uniforms.uBoost!;
        ub.value = THREE.MathUtils.damp(ub.value as number, active * (1 - moving), 6, dt);
        const fade = (0.55 + (ub.value as number) * 0.45) * (1 - ex * 0.9) * band(T, 2.65, 2.95);
        s.material.uniforms.uFade!.value = fade;
        s.reflection.uniforms.uFade!.value = fade * (1 - ex);
      });
      if (spot.current) spot.current.position.x = shift;
      spotMat.uniforms.uIntensity!.value = (0.5 - moving * 0.3) * band(T, 2.8, 3.1) * (1 - ex);
      spotMat.uniforms.uTime!.value = story.time;
      const pb = floor.uniforms.uPoolB!.value as THREE.Vector4;
      pb.x = shift;
      pb.w = (0.75 - moving * 0.35) * band(T, 2.8, 3.1) * (1 - ex);
    }

    /* ---- gallery hall */
    const hVisible = T > 3.45;
    const n = hScreens.length;
    if (hVisible && T < 5.4) hScreens.forEach((s) => pool.want(s.src));
    const focus = stepped(story.ap[4] * (n - 1) * 0.999);
    const hx = hallX(aspect);
    const pc = floor.uniforms.uPoolC!.value as THREE.Vector4;
    hScreens.forEach((s, i) => {
      const m = hallMeshes.current[i];
      const rm = hallRefl.current[i];
      const sp = hallSpots.current[i];
      if (m) m.visible = hVisible;
      if (rm) rm.visible = hVisible;
      if (sp) sp.visible = hVisible;
      if (!hVisible) return;
      const side = hallSide(i);
      if (m) m.position.x = side * hx;
      if (rm) rm.position.x = side * hx;
      if (sp) sp.position.x = side * hx;
      const near = Math.max(0, 1 - Math.abs(focus - i));
      const ub = s.material.uniforms.uBoost!;
      ub.value = THREE.MathUtils.damp(ub.value as number, near, 6, dt);
      const fade = (0.5 + near * 0.5) * band(T, 3.5, 3.9);
      s.material.uniforms.uFade!.value = fade;
      s.reflection.uniforms.uFade!.value = fade;
      hallSpotMats[i]!.uniforms.uIntensity!.value = near * 0.45 * band(T, 3.6, 4.0);
      hallSpotMats[i]!.uniforms.uTime!.value = story.time;
    });
    const fi = Math.round(focus);
    pc.x = hallSide(fi) * hx * 0.8;
    pc.y = hallZ(fi) + 1.2;
    pc.w = band(T, 3.6, 4.0) * 0.6;
  });

  const hy = EYE_Y + 0.15;
  return (
    <group ref={root} visible={false}>
      <mesh geometry={geo.floor} material={floor} position={[0, FLOOR_Y, -40]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2} />

      {/* services carousel + its reflection + spotlight on the front slot */}
      <group ref={carousel} position={[0, EYE_Y, CAROUSEL.z]}>
        {cScreens.map((s, i) => {
          const a = (i * Math.PI) / 2;
          return <mesh key={i} geometry={geo.carousel} material={s.material} position={[Math.sin(a) * CAROUSEL.r, 0, Math.cos(a) * CAROUSEL.r]} rotation={[0, a, 0]} />;
        })}
      </group>
      <group ref={carouselRefl} position={[0, 2 * FLOOR_Y - EYE_Y, CAROUSEL.z]} scale={[1, -1, 1]}>
        {cScreens.map((s, i) => {
          const a = (i * Math.PI) / 2;
          return (
            <mesh key={i} geometry={geo.carousel} material={s.reflection} position={[Math.sin(a) * CAROUSEL.r, 0, Math.cos(a) * CAROUSEL.r]} rotation={[0, a, 0]} renderOrder={1} />
          );
        })}
      </group>
      <mesh ref={spot} geometry={geo.spot} material={spotMat} position={[0, (EYE_Y + 5.5 + FLOOR_Y) / 2, CAROUSEL.z + CAROUSEL.r]} />

      {/* gallery hall */}
      {hScreens.map((s, i) => {
        const side = hallSide(i);
        const rot = -side * HALL.turn;
        return (
          <group key={i}>
            <mesh ref={(m) => void (hallMeshes.current[i] = m)} geometry={geo.hall} material={s.material} position={[side * HALL.x, hy, hallZ(i)]} rotation={[0, rot, 0]} />
            <mesh
              ref={(m) => void (hallRefl.current[i] = m)}
              geometry={geo.hall}
              material={s.reflection}
              position={[side * HALL.x, 2 * FLOOR_Y - hy, hallZ(i)]}
              rotation={[0, rot, 0]}
              scale={[1, -1, 1]}
              renderOrder={1}
            />
            <mesh ref={(m) => void (hallSpots.current[i] = m)} geometry={geo.hallSpot} material={hallSpotMats[i]} position={[side * HALL.x, FLOOR_Y + 2.7, hallZ(i) + 0.4]} />
          </group>
        );
      })}
    </group>
  );
}
