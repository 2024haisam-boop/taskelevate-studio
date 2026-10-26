"use client";

/* eslint-disable react-hooks/immutability -- R3F render loop: Three.js objects are mutated every frame. */

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clips, type MediaClip } from "@/data/media";
import { useWorld } from "../context";
import { PANEL_H, RADIUS, ROW_STEP, VIOLET, WELL_HALF, WELL_ROWS } from "../layout";
import { createGlowMaterial } from "../materials";
import { screenFragment, screenVertex } from "../shaders";
import { band, clamp01 } from "../world";

interface Props {
  perRow: number;
  onHover?: (clip: MediaClip | null) => void;
  onSelect?: (clip: MediaClip) => void;
}

const easeOutBack = (x: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** Row r of the whole well (hero rows 0–2, shaft rows continue the pattern). */
export const rowDir = (r: number) => (r % 2 === 0 ? 1 : -1);
export const rowOffset = (r: number) => r * 0.35;

/**
 * THE WELL — three rows of curved, clickable video screens (the hero). During the entrance the camera starts
 * on one screen of the middle row; the top row drops in from above, the bottom row rises from below, and the
 * rims ignite with a shockwave of light.
 */
export function WellRows({ perRow, onHover, onSelect }: Props) {
  const { pool, common, story } = useWorld();
  const root = useRef<THREE.Group>(null);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const panels = useRef<{ mesh: THREE.Mesh; boost: number; target: number; clip: MediaClip; row: number; i: number }[]>([]);

  const thetaLength = ((Math.PI * 2) / perRow) * 0.9;
  const panelAspect = (RADIUS * thetaLength) / PANEL_H;
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(RADIUS, RADIUS, PANEL_H, 24, 1, true, -thetaLength / 2, thetaLength),
    [thetaLength],
  );

  const media = useMemo(
    () =>
      clips.map((clip) => {
        const entry = pool.get(clip.srcSmall, clip.poster, { mipmaps: true });
        const material = new THREE.ShaderMaterial({
          vertexShader: screenVertex,
          fragmentShader: screenFragment,
          defines: { CURVED: "" },
          side: THREE.DoubleSide,
          uniforms: {
            ...common,
            uMap: entry.map,
            uPanelAspect: { value: panelAspect },
            uMapAspect: { value: entry.aspect },
            uRadius: { value: 0.09 },
            uBoost: { value: 0 },
            uFade: { value: 1 },
          },
        });
        return { clip, entry, material };
      }),
    [pool, common, panelAspect],
  );

  useEffect(
    () => () => {
      media.forEach((m) => m.material.dispose());
      geometry.dispose();
    },
    [media, geometry],
  );

  const rows = useMemo(
    () =>
      Array.from({ length: WELL_ROWS }, (_, r) => ({
        y: WELL_HALF - PANEL_H / 2 - r * ROW_STEP,
        panels: Array.from({ length: perRow }, (_, i) => ({
          angle: (i / perRow) * Math.PI * 2,
          media: media[(i + r * 2) % media.length]!,
        })),
      })),
    [perRow, media],
  );

  // Rims, their soft halos and the entrance shockwave
  const rimGeo = useMemo(() => new THREE.RingGeometry(RADIUS + 0.02, RADIUS + 0.06, 160), []);
  const rimMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(VIOLET),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const haloGeo = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const haloMat = useMemo(() => createGlowMaterial({ color: VIOLET, ring: RADIUS / (RADIUS + 1.4), width: 0.05 }), []);
  const shockMat = useMemo(() => createGlowMaterial({ color: VIOLET, ring: 0.9, width: 0.035 }), []);
  const shock = useRef<THREE.Mesh>(null);
  useEffect(
    () => () => {
      rimGeo.dispose();
      rimMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      shockMat.dispose();
    },
    [rimGeo, rimMat, haloGeo, haloMat, shockMat],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const visible = story.T < 1.6;
    if (root.current) root.current.visible = visible;
    if (!visible) return;
    if (story.T < 1.25) media.forEach((m) => pool.want(m.entry.src));

    const intro = story.intro;
    rows.forEach((row, r) => {
      const g = groups.current[r];
      if (!g) return;
      g.rotation.y = rowOffset(r) + (rowDir(r) > 0 ? story.spinA : story.spinB);
    });

    // Entrance: outer rows assemble around the middle one (staggered, slight overshoot)
    panels.current.forEach((p) => {
      p.boost = THREE.MathUtils.damp(p.boost, p.target, 10, dt);
      let drop = 0;
      let grow = 1;
      if (p.row !== 1 && intro < 1) {
        const delay = 0.1 + (p.i / perRow) * 0.32 + (p.row === 2 ? 0.06 : 0);
        const e = easeOutBack(clamp01((intro - delay) / 0.42));
        drop = (1 - e) * (p.row === 0 ? 7 : -7);
        grow = 0.55 + 0.45 * Math.min(1, e);
      }
      p.mesh.position.y = drop;
      const sc = grow * (1 + p.boost * 0.045);
      p.mesh.scale.set(sc, grow * (1 + p.boost * 0.03), sc);
    });

    const speedBoost = Math.min(1, Math.abs(story.speed) * 0.6);
    media.forEach((m) => {
      const hovered = panels.current.some((x) => x.clip === m.clip && x.target > 0);
      const u = m.material.uniforms.uBoost!;
      u.value = THREE.MathUtils.damp(u.value as number, hovered ? 1 : speedBoost * 0.5, 8, dt);
    });

    // Rims ignite (flash → settle), halo glow, shockwave ring
    const ignite = band(intro, 0.48, 0.58);
    const flash = band(intro, 0.48, 0.56) * (1 - band(intro, 0.58, 0.9));
    rimMat.opacity = ignite * 0.6 + flash * 0.9;
    haloMat.uniforms.uIntensity!.value = ignite * 0.35 + flash * 0.9;
    const w = band(intro, 0.5, 0.95);
    if (shock.current) {
      shock.current.visible = w > 0 && w < 1;
      const s = (RADIUS * 2 + w * 16) / 0.9;
      shock.current.scale.set(s, s, 1);
      shockMat.uniforms.uIntensity!.value = (1 - w) * 1.4;
    }
  });

  const register = (mesh: THREE.Mesh | null, clip: MediaClip, row: number, i: number) => {
    if (!mesh || panels.current.some((m) => m.mesh === mesh)) return;
    panels.current.push({ mesh, boost: 0, target: 0, clip, row, i });
  };
  const interactive = (e: ThreeEvent<PointerEvent | MouseEvent>) =>
    story.T < 0.45 && story.intro >= 1 && !(e.nativeEvent.target as Element | null)?.closest?.("a,button,input,textarea,select,[data-no-3d]");
  const setHover = (e: ThreeEvent<PointerEvent>, on: boolean, clip: MediaClip) => {
    if (on && !interactive(e)) return;
    e.stopPropagation();
    const entry = panels.current.find((m) => m.mesh === e.object);
    if (entry) entry.target = on ? 1 : 0;
    onHover?.(on ? clip : null);
  };

  const rimY = WELL_HALF + 0.12;
  const haloSize = (RADIUS + 1.4) * 2;

  return (
    <group ref={root}>
      {rows.map((row, r) => (
        <group key={r} position={[0, row.y, 0]} ref={(g) => void (groups.current[r] = g)}>
          {row.panels.map((panel, i) => (
            <mesh
              key={i}
              ref={(m) => register(m, panel.media.clip, r, i)}
              geometry={geometry}
              material={panel.media.material}
              rotation={[0, panel.angle, 0]}
              onPointerOver={(e) => setHover(e, true, panel.media.clip)}
              onPointerOut={(e) => setHover(e, false, panel.media.clip)}
              onClick={(e) => {
                if (!interactive(e)) return;
                e.stopPropagation();
                onSelect?.(panel.media.clip);
              }}
            />
          ))}
        </group>
      ))}
      {[rimY, -rimY].map((y) => (
        <group key={y} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh geometry={rimGeo} material={rimMat} />
          <mesh geometry={haloGeo} material={haloMat} scale={[haloSize, haloSize, 1]} />
        </group>
      ))}
      <mesh ref={shock} geometry={haloGeo} material={shockMat} position={[0, rimY, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false} />
    </group>
  );
}
