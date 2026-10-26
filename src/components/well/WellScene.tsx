"use client";

/* eslint-disable react-hooks/immutability --
 * R3F's render loop is imperative by design: Three.js objects (camera, groups, uniforms, video textures)
 * are created once and mutated every frame inside useFrame. They are GPU/media resources, not React state.
 */

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { MediaClip } from "@/data/media";
import { wellFragment, wellVertex } from "./wellShader";

/** Shared, mutable state written by the DOM (scroll/pointer) and read every frame by the scene. */
export interface WellState {
  /** Scroll progress through the hero track, 0 (above the well) → 1 (inside it) */
  progress: number;
  /** Smoothed scroll velocity (progress units / s) */
  velocity: number;
  /** Pointer position over the hero, -1..1 */
  px: number;
  py: number;
  /** Drag spin velocity (rad/s), decays for inertia */
  dragVel: number;
}

interface Props {
  state: RefObject<WellState>;
  clips: MediaClip[];
  /** Render + play videos only while true */
  active: boolean;
  compact: boolean;
  reducedMotion: boolean;
  onReady?: () => void;
  onHover?: (clip: MediaClip | null) => void;
  onSelect?: (clip: MediaClip) => void;
}

const RADIUS = 4.1;
const PANEL_H = 1.32;
const ROW_GAP = 0.18;

export default function WellScene(props: Props) {
  const { compact, active, onReady } = props;
  return (
    <Canvas
      dpr={[1, compact ? 1.25 : 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: compact ? 58 : 42, position: [0, 5.4, 11.5], near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.setClearColor("#08090d", 1);
        onReady?.();
      }}
      aria-hidden="true"
    >
      <Well {...props} />
    </Canvas>
  );
}

/* -------------------------------------------------------------------------- */

interface MediaEntry {
  clip: MediaClip;
  video: HTMLVideoElement;
  videoTex: THREE.VideoTexture;
  posterTex: THREE.Texture;
  material: THREE.ShaderMaterial;
}

function Well({ state, clips, active, compact, reducedMotion, onHover, onSelect }: Props) {
  const rows = compact ? 2 : 3;
  const perRow = compact ? 7 : 9;
  const camera = useThree((s) => s.camera);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const meshes = useRef<{ mesh: THREE.Mesh; boost: number; target: number; clip: MediaClip }[]>([]);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  // Camera path keyframes (allocated once — nothing is created per frame)
  const path = useMemo(
    () => ({
      from: new THREE.Vector3(0, compact ? 6.2 : 4.9, compact ? 12.5 : 9.8),
      mid: new THREE.Vector3(0, 2.4, 6.2),
      inside: new THREE.Vector3(0, 0.05, 0.05),
      lookOutside: new THREE.Vector3(0, 0.1, 0),
      lookInside: new THREE.Vector3(0, 0, -4),
    }),
    [compact],
  );

  const thetaLength = ((Math.PI * 2) / perRow) * 0.9;
  const panelAspect = (RADIUS * thetaLength) / PANEL_H;

  // One shared curved-panel geometry for every screen.
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(RADIUS, RADIUS, PANEL_H, 24, 1, true, -thetaLength / 2, thetaLength),
    [thetaLength],
  );

  // Uniforms shared by every material (one write updates all screens).
  const common = useMemo(
    () => ({
      uInside: { value: 0 },
      uExposure: { value: 0.72 },
      uFogNear: { value: 9 },
      uFogFar: { value: 24 },
      uFogColor: { value: new THREE.Color("#08090d") },
      uRim: { value: new THREE.Color("#8f5cff").multiplyScalar(0.55) },
    }),
    [],
  );

  // One <video> + texture + material per unique clip; panels reuse them.
  const media = useMemo<MediaEntry[]>(() => {
    const loader = new THREE.TextureLoader();
    return clips.map((clip) => {
      const video = document.createElement("video");
      video.src = clip.srcSmall;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      video.preload = "auto";
      video.setAttribute("playsinline", "");
      video.setAttribute("muted", "");
      const videoTex = new THREE.VideoTexture(video);
      videoTex.colorSpace = THREE.SRGBColorSpace;
      // mipmaps: screens are drawn much smaller than the video → avoid moiré on fine UI lines
      videoTex.minFilter = THREE.LinearMipmapLinearFilter;
      videoTex.generateMipmaps = true;
      videoTex.anisotropy = 4;
      const posterTex = loader.load(clip.poster);
      posterTex.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.ShaderMaterial({
        vertexShader: wellVertex,
        fragmentShader: wellFragment,
        side: THREE.DoubleSide,
        uniforms: {
          ...common,
          uMap: { value: posterTex },
          uPanelAspect: { value: panelAspect },
          uMapAspect: { value: 16 / 9 },
          uRadius: { value: 0.09 },
          uBoost: { value: 0 },
        },
      });
      return { clip, video, videoTex, posterTex, material };
    });
  }, [clips, common, panelAspect]);

  // Swap poster → live video once frames are flowing; play only while active; dispose everything.
  useEffect(() => {
    const cleanups = media.map((m) => {
      const onPlaying = () => {
        m.material.uniforms.uMap!.value = m.videoTex;
      };
      m.video.addEventListener("playing", onPlaying);
      return () => m.video.removeEventListener("playing", onPlaying);
    });
    return () => cleanups.forEach((c) => c());
  }, [media]);

  useEffect(() => {
    media.forEach((m) => {
      if (active && !reducedMotion) void m.video.play().catch(() => undefined);
      else m.video.pause();
    });
  }, [media, active, reducedMotion]);

  useEffect(
    () => () => {
      media.forEach((m) => {
        m.video.pause();
        m.video.removeAttribute("src");
        m.video.load();
        m.videoTex.dispose();
        m.posterTex.dispose();
        m.material.dispose();
      });
      geometry.dispose();
    },
    [media, geometry],
  );

  // Layout: rows of panels, each row offset so the same clip never stacks vertically.
  const layout = useMemo(() => {
    const total = rows * PANEL_H + (rows - 1) * ROW_GAP;
    return Array.from({ length: rows }, (_, r) => ({
      y: total / 2 - PANEL_H / 2 - r * (PANEL_H + ROW_GAP),
      dir: r % 2 === 0 ? 1 : -1,
      offset: r * 0.35,
      panels: Array.from({ length: perRow }, (_, i) => ({
        angle: (i / perRow) * Math.PI * 2,
        media: media[(i + r * 2) % media.length]!,
      })),
    }));
  }, [rows, perRow, media]);

  const rimY = (rows * PANEL_H + (rows - 1) * ROW_GAP) / 2 + 0.12;

  useFrame((frame, delta) => {
    const s = state.current;
    if (!s) return;
    const dt = Math.min(delta, 1 / 20);
    const t = frame.clock.elapsedTime;

    // Drag inertia (velocity decays smoothly)
    s.dragVel *= Math.pow(0.04, dt);

    // Rows: slow counter-rotation + scroll-velocity boost + drag
    const auto = reducedMotion ? 0 : 0.055;
    const boost = Math.min(2.5, Math.abs(s.velocity) * 6);
    layout.forEach((row, r) => {
      const g = groups.current[r];
      if (!g) return;
      g.rotation.y += (row.dir * (auto + boost * 0.08) + s.dragVel * (r % 2 === 0 ? 1 : 0.85)) * dt;
    });

    // Camera: above the rim → descends → inside the well
    const p = reducedMotion ? 0 : THREE.MathUtils.clamp(s.progress, 0, 1);
    const k1 = THREE.MathUtils.smoothstep(p, 0, 0.6);
    const k2 = THREE.MathUtils.smoothstep(p, 0.45, 1);
    camera.position.lerpVectors(path.from, path.mid, k1);
    camera.position.lerp(path.inside, k2);
    // Pointer parallax (fades as we go inside)
    const par = 1 - k2 * 0.7;
    camera.position.x += s.px * 0.7 * par;
    camera.position.y += -s.py * 0.35 * par;
    path.lookInside.set(Math.sin(s.px * 0.6 + t * 0.05) * 4, -s.py * 0.6, -Math.cos(s.px * 0.6) * 4);
    lookTarget.lerpVectors(path.lookOutside, path.lookInside, k2);
    camera.lookAt(lookTarget);

    // Inside factor drives back-face treatment
    const inside = THREE.MathUtils.smoothstep(p, 0.7, 0.95);
    common.uInside.value = inside;
    common.uExposure.value = THREE.MathUtils.lerp(0.72, 1.05, THREE.MathUtils.smoothstep(p, 0.1, 0.7));
    common.uFogFar.value = THREE.MathUtils.lerp(24, 14, inside);
    common.uFogNear.value = THREE.MathUtils.lerp(9, 3, inside);

    // Hover pop
    meshes.current.forEach((m) => {
      m.boost = THREE.MathUtils.damp(m.boost, m.target, 10, dt);
      const sc = 1 + m.boost * 0.045;
      m.mesh.scale.set(sc, 1 + m.boost * 0.03, sc);
    });
    media.forEach((m) => {
      const hovered = meshes.current.some((x) => x.clip === m.clip && x.target > 0);
      m.material.uniforms.uBoost!.value = THREE.MathUtils.damp(m.material.uniforms.uBoost!.value as number, hovered ? 1 : Math.min(1, boost * 0.25), 8, dt);
    });
  });

  const registerMesh = (mesh: THREE.Mesh | null, clip: MediaClip) => {
    if (!mesh || meshes.current.some((m) => m.mesh === mesh)) return;
    meshes.current.push({ mesh, boost: 0, target: 0, clip });
  };
  const setHover = (e: ThreeEvent<PointerEvent>, on: boolean, clip: MediaClip) => {
    e.stopPropagation();
    const entry = meshes.current.find((m) => m.mesh === e.object);
    if (entry) entry.target = on ? 1 : 0;
    onHover?.(on ? clip : null);
  };

  return (
    <group>
      {layout.map((row, r) => (
        <group
          key={r}
          position={[0, row.y, 0]}
          ref={(g) => {
            groups.current[r] = g;
            if (g && g.userData.init === undefined) {
              g.rotation.y = row.offset;
              g.userData.init = true;
            }
          }}
        >
          {row.panels.map((panel, i) => (
            <mesh
              key={i}
              ref={(m) => registerMesh(m, panel.media.clip)}
              geometry={geometry}
              material={panel.media.material}
              rotation={[0, panel.angle, 0]}
              onPointerOver={(e) => setHover(e, true, panel.media.clip)}
              onPointerOut={(e) => setHover(e, false, panel.media.clip)}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(panel.media.clip);
              }}
            />
          ))}
        </group>
      ))}
      {/* the well's rims */}
      <Rim y={rimY} />
      <Rim y={-rimY} />
    </group>
  );
}

function Rim({ y }: { y: number }) {
  const geo = useMemo(() => new THREE.RingGeometry(RADIUS + 0.02, RADIUS + 0.06, 160), []);
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color("#a77bff"), transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }),
    [],
  );
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat],
  );
  return <mesh geometry={geo} material={mat} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} />;
}
