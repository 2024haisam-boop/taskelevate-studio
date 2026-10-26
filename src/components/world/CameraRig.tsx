"use client";

/* eslint-disable react-hooks/immutability -- R3F render loop: the camera and shared uniforms are mutated every frame. */

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { projects } from "@/data/projects";
import { useWorld, type Story } from "./context";
import { CAROUSEL, EYE_Y, HALL, POOL_Y, PORTAL_R, PORTAL_Z, RADIUS, hallZ } from "./layout";
import { ACTS, band, cameraProgress, clamp01, smooth01, stepped, trackProgress, world } from "./world";

/** Entrance length (ms) once the intro gate opens. */
export const INTRO_MS = 2600;

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIn = (x: number) => x * x * x;

/** Desktop shifts the carousel right so the service copy can sit on the left. */
export const carouselShift = (aspect: number) => (aspect > 1.15 ? 1.3 : 0);
export const hallSide = (i: number) => (i % 2 === 0 ? -1 : 1);
export const hallX = (aspect: number) => HALL.x * (aspect < 0.8 ? 0.72 : 1);

interface Pose {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  up: THREE.Vector3;
  fov: number;
}
const pose = (): Pose => ({ pos: V(), look: V(), up: V(0, 1, 0), fov: 45 });
const lerpPose = (out: Pose, a: Pose, b: Pose, t: number) => {
  out.pos.lerpVectors(a.pos, b.pos, t);
  out.look.lerpVectors(a.look, b.look, t);
  out.up.lerpVectors(a.up, b.up, t).normalize();
  out.fov = a.fov + (b.fov - a.fov) * t;
  return out;
};

/** Distance at which a w×h rectangle fills `fw` of the viewport width or `fh` of its height (whichever binds). */
function fitDistance(w: number, h: number, fw: number, fh: number, fov: number, aspect: number) {
  const tv = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
  return Math.max(w / (fw * 2 * tv * aspect), h / (fh * 2 * tv));
}

/**
 * Turns scroll into the journey: story time, camera path per act, entrance, fog/exposure per place and the
 * flash when the camera plunges through the pool. Uses its own damped copy of the scroll position so the
 * camera glides even with notchy mouse wheels (the page itself scrolls natively).
 */
export function CameraRig() {
  const { story, common, pool, compact } = useWorld();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const s = useRef({ smooth: -1, prev: 0, fov: 0 });

  const k = useMemo(() => {
    const p0 = compact ? V(0, 6.2, 12.5) : V(0, 4.9, 9.8);
    return {
      heroCurve: new THREE.CatmullRomCurve3([p0, V(0, 3.9, 5.0), V(0, 2.9, 1.4), V(0, 1.6, 0)], false, "centripetal"),
      fov0: compact ? 58 : 42,
      fovShaft: compact ? 84 : 70,
      fovRoom: compact ? 56 : 44,
      introFrom: V(0, 0, RADIUS + (compact ? 2.1 : 1.3)),
      a: pose(),
      b: pose(),
      c: pose(),
      out: pose(),
      intro: pose(),
      down: V(0, 0, -1),
      upY: V(0, 1, 0),
      tmp: V(),
      n: V(),
    };
  }, [compact]);

  /* ----------------------------------------------------------- act poses */

  const hero = (c: number, split: number, out: Pose) => {
    const kk = band(c, 0.03, split * 0.98);
    const ex = clamp01((c - split) / (1 - split));
    k.heroCurve.getPoint(easeInOut(kk), out.pos);
    out.pos.y -= ex * 1.4;
    const lk = band(kk, 0.45, 1);
    out.look.set(0, THREE.MathUtils.lerp(0.1, out.pos.y - 12, lk), 0);
    out.up.lerpVectors(k.upY, k.down, lk).normalize();
    out.fov = THREE.MathUtils.lerp(k.fov0, k.fovShaft, band(kk, 0.55, 1));
    const par = 1 - lk;
    out.pos.x += world.px * 0.7 * par;
    out.pos.y += -world.py * 0.35 * par;
    return lk;
  };

  const descent = (c: number, out: Pose) => {
    const y = THREE.MathUtils.lerp(0.2, POOL_Y + 7, (1 - Math.cos(Math.PI * c)) / 2);
    const x = Math.sin(c * Math.PI * 2) * 0.3;
    const z = (Math.cos(c * Math.PI * 2) - 1) * 0.3;
    const roll = c * Math.PI * 1.5;
    out.pos.set(x, y, z);
    out.look.set(x * 0.3, y - 12, z * 0.3);
    out.up.set(Math.sin(roll), 0, -Math.cos(roll));
    out.fov = k.fovShaft + Math.min(7, Math.abs(story.speed) * 4);
  };

  const services = (c: number, split: number, aspect: number, out: Pose) => {
    const fov = k.fovRoom;
    const portrait = aspect < 0.9;
    const d = fitDistance(CAROUSEL.w, CAROUSEL.h, portrait ? 0.84 : 0.44, 0.6, fov, aspect);
    const front = CAROUSEL.z + CAROUSEL.r;
    const shift = carouselShift(aspect);
    const t = band(c, 0, split);
    out.pos.set(shift * 0.15 + Math.sin(story.time * 0.3) * 0.08, EYE_Y + 0.25, front + d - t * 0.6);
    // portrait: aim below the carousel so it sits in the upper half, clear of the copy
    out.look.set(shift, EYE_Y - (portrait ? 1.45 : 0.05), CAROUSEL.z + CAROUSEL.r * 0.3);
    out.up.set(0, 1, 0);
    out.fov = fov;
  };

  const hallFocus = (i: number, aspect: number, out: Pose) => {
    const fov = k.fovRoom;
    const side = hallSide(i);
    const turn = -side * HALL.turn;
    const d = fitDistance(HALL.w, HALL.h, aspect < 0.9 ? 0.8 : 0.5, 0.6, fov, aspect);
    k.n.set(Math.sin(turn), 0, Math.cos(turn));
    out.look.set(side * hallX(aspect), EYE_Y + 0.15, hallZ(i));
    out.pos.copy(out.look).addScaledVector(k.n, d);
    out.pos.y = EYE_Y + 0.3;
    if (aspect < 0.9) out.look.y -= 1.25;
    out.up.set(0, 1, 0);
    out.fov = fov;
  };

  const work = (ap: number, aspect: number, out: Pose) => {
    const n = projects.length;
    const f = stepped(ap * (n - 1) * 0.999);
    const i = Math.floor(f);
    hallFocus(i, aspect, k.c);
    hallFocus(Math.min(n - 1, i + 1), aspect, k.out);
    lerpPose(out, k.c, k.out, f - i);
  };

  const finale = (c: number, split: number, aspect: number, out: Pose) => {
    const fov = k.fovRoom;
    const d = fitDistance(PORTAL_R * 2, PORTAL_R * 2, aspect < 0.9 ? 0.9 : 0.6, 0.62, fov, aspect);
    const start = hallZ(projects.length - 1) - 4;
    const end = PORTAL_Z + d;
    const t = easeOut(band(c, 0, split));
    const ex = clamp01((c - split) / (1 - split));
    out.pos.set(world.px * 0.6, EYE_Y + 0.4 - world.py * 0.3, THREE.MathUtils.lerp(start, end, t) - ex * 2.5);
    out.look.set(0, EYE_Y + 0.4 - (aspect < 0.9 ? 0.4 : 0), PORTAL_Z);
    out.up.set(0, 1, 0);
    out.fov = fov;
  };

  /* ----------------------------------------------------------- frame */

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const now = performance.now();
    pool.flush(now);
    const st = s.current;
    const y = window.scrollY;
    if (st.smooth < 0 || Math.abs(y - st.smooth) > world.vh * 6) {
      st.smooth = y;
      st.prev = y;
    }
    st.smooth = THREE.MathUtils.damp(st.smooth, y, 5.5, dt);
    const v = (st.smooth - st.prev) / Math.max(dt, 1e-3) / Math.max(1, world.vh);
    st.prev = st.smooth;
    story.speed = THREE.MathUtils.damp(story.speed, v, 6, dt);
    story.time = frame.clock.elapsedTime;

    const splits = story.split;
    let T = 0;
    ACTS.forEach((name, i) => {
      story.c[i] = cameraProgress(name, st.smooth);
      story.ap[i] = trackProgress(name, st.smooth);
      const r = world.ranges[name];
      splits[i] = r ? clamp01(1 - world.vh / Math.max(1, r.height)) : 0.5;
      if (r && st.smooth >= r.top) T = i + story.c[i];
    });
    story.T = T;

    const intro = world.introAt === null ? 0 : clamp01((now - world.introAt) / INTRO_MS);
    story.intro = intro;

    // Row spin: idle drift + entrance whirl + scroll-speed boost + drag inertia
    world.dragVel *= Math.pow(0.04, dt);
    const whirl = (1 - smooth01(intro)) * 1.4;
    const boost = Math.min(2.5, Math.abs(story.speed) * 2.5) * 0.08;
    story.spinA += (0.055 + whirl + boost + world.dragVel) * dt;
    story.spinB -= (0.055 + whirl + boost + world.dragVel * 0.85) * dt;

    const aspect = Math.max(0.3, world.vw / Math.max(1, world.vh));
    const out = k.out;
    let inside = 1;
    let flash = 0;

    story.dive = 1;
    if (T < 1) {
      inside = hero(story.c[0], splits[0], k.a);
      story.dive = inside;
      lerpPose(out, k.a, k.a, 0);
    } else if (T < 2) {
      descent(story.c[1], k.a);
      lerpPose(out, k.a, k.a, 0);
    } else if (T < 3) {
      const c = story.c[2];
      const sp = splits[2];
      descent(1, k.a);
      const dFill = (RADIUS - 0.08) / (Math.tan(THREE.MathUtils.degToRad(k.fovShaft) / 2) * Math.max(1, aspect));
      const a = band(c, 0, sp);
      const yA = THREE.MathUtils.lerp(POOL_Y + 7, POOL_Y + dFill * 1.08, easeOut(a));
      const plunge = band(c, sp, sp + (1 - sp) * 0.45);
      const yB = THREE.MathUtils.lerp(yA, POOL_Y - 1.4, easeIn(plunge));
      const roll = Math.PI * (1.5 + 0.5 * band(c, 0, sp * 0.8));
      k.b.pos.set(0, yB, 0);
      k.b.look.set(0, yB - 12, 0);
      k.b.up.set(Math.sin(roll), 0, -Math.cos(roll));
      k.b.fov = k.fovShaft;
      services(0, splits[3], aspect, k.c);
      const ch = easeInOut(band(c, sp + (1 - sp) * 0.45, 1));
      lerpPose(out, k.b, k.c, ch);
      flash = (1 - smooth01(Math.abs(yB - POOL_Y) / 1.8)) * (plunge > 0 && ch < 0.5 ? 1 : 0);
    } else if (T < 4) {
      const c = story.c[3];
      const sp = splits[3];
      services(c, sp, aspect, k.a);
      work(0, aspect, k.b);
      lerpPose(out, k.a, k.b, easeInOut(clamp01((c - sp) / (1 - sp))));
    } else if (T < 5) {
      const c = story.c[4];
      const sp = splits[4];
      work(story.ap[4], aspect, k.a);
      finale(0, splits[5], aspect, k.b);
      const e = easeInOut(clamp01((c - sp) / (1 - sp)));
      lerpPose(out, k.a, k.b, e);
      // turn toward the portal early so the walk past the last screen reads as "onward", not a near-miss
      out.look.lerpVectors(k.a.look, k.b.look, Math.min(1, e * 2.4));
    } else {
      finale(story.c[5], splits[5], aspect, out);
    }

    // Entrance: start ON a screen of the middle row and zoom out to wherever the scroll pose is
    if (intro < 1) {
      const e = 1 - Math.pow(1 - band(intro, 0.02, 1), 3.2);
      const ip = k.intro;
      ip.pos.lerpVectors(k.introFrom, out.pos, e);
      const swing = Math.sin(e * Math.PI);
      ip.pos.x += swing * (compact ? 1.2 : 2.2) * (1 - e * 0.3);
      ip.pos.y += swing * 0.7;
      ip.look.lerpVectors(k.tmp.set(0, 0, 0), out.look, e);
      const roll = (1 - e) * 0.32;
      ip.up.set(Math.sin(roll), Math.cos(roll), 0).lerp(out.up, e).normalize();
      ip.fov = THREE.MathUtils.lerp(compact ? 46 : 30, out.fov, e);
      lerpPose(out, ip, ip, 0);
    }

    camera.position.copy(out.pos);
    camera.up.copy(out.up);
    camera.lookAt(out.look);
    if (Math.abs(camera.fov - out.fov) > 0.01 || Math.abs(camera.aspect - aspect) > 0.001) {
      camera.fov = out.fov;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    }

    // Atmosphere per place
    const inRooms = band(T, 2.72, 3.0);
    common.uInside.value = inside;
    const heroExp = THREE.MathUtils.lerp(0.72, 1.05, band(story.c[0], 0.05, 0.4));
    const introExp = THREE.MathUtils.lerp(1.05, 1, smooth01(intro));
    common.uExposure.value = (T < 1 ? heroExp : 1.05 - inRooms * 0.05) * (intro < 1 ? introExp * (0.75 + 0.25 * smooth01(intro * 3)) : 1);
    common.uFogNear.value = THREE.MathUtils.lerp(T < 1 ? THREE.MathUtils.lerp(9, 3, inside) : 3, 7, inRooms);
    common.uFogFar.value = THREE.MathUtils.lerp(T < 1 ? THREE.MathUtils.lerp(24, 21, inside) : 21, 38, inRooms);

    if (world.flashEl) {
      const o = flash.toFixed(3);
      if (world.flashEl.style.opacity !== o) world.flashEl.style.opacity = o;
    }
  });

  return null;
}

export type { Story };
