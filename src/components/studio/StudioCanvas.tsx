"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { FULLSCREEN_VERT, floatFormats, locations, program, smooth } from "@/lib/gl/core";
import { Figure, SHAPES, sampleMark, type ShapeName } from "@/lib/gl/figure";
import { Fluid } from "@/lib/gl/fluid";

/* THE STUDIO LAYER — one WebGL2 canvas under the whole page (sticky inside the page sheet, so it never covers the
   footer curtain). It runs:
     · a fluid simulation the pointer (and scrolling) stirs — soft violet ink, and the "liquid glass" that bends the
       picture along the flow with a little colour split; a click drops a ring of water;
     · THE FIGURE (lib/gl/figure): a particle sculpture that follows the page. Any element with `data-figure="<shape>"`
       is an anchor — the figure flies to the one nearest the middle of the screen, takes its shape and fits its box.
       Optional: data-figure-spread (0..1, blow apart), data-figure-reflect (water reflection under it),
       data-figure-scale, data-figure-env (the landscape: sky, low-poly ranges, a lake) and data-figure-cam
       ("yaw,pitch,dist,shiftX,shiftY": a drone camera orbiting the figure, which then sits at the screen point
       given by the shift). data-figure="dust" spreads it thin across the screen; "none" or no anchor → it fades;
     · the composite: landscape + ink + refracted figure + rippling reflection.
   Every few seconds a settled figure breathes out in a soft burst. Sets html[data-studio="on"|"off"] (off: reduced
   motion, no WebGL2 / float targets) and fires "studio:state". */

const FOV = (35 * Math.PI) / 180;
const TAN = Math.tan(FOV / 2);
const DIST = 6;
const LOGO_SRC = "/brand/taskelevate-logo-dark.png";
const INK = [
  [0.53, 0.33, 0.91],
  [0.09, 0.61, 0.91],
  [0.78, 0.55, 0.96],
] as const;

const COMPOSITE = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uDye, uVel, uFig;
uniform vec2 uVelToUv, uShift;
uniform float uTime, uHorizon, uReflect, uInk, uEnv, uAspect, uTanH, uYaw, uSideX;
uniform vec3 uCamR, uCamU, uCamF;

float h1(float x) { return fract(sin(x * 127.1) * 43758.5453); }
float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
// piecewise-linear noise: jagged, low-poly ridgelines
float ridge(float x) { float i = floor(x); return mix(h1(i), h1(i + 1.0), fract(x)); }
float range(float x) { return ridge(x) * 0.62 + ridge(x * 2.13 + 7.0) * 0.26 + ridge(x * 4.7 + 3.0) * 0.12; }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1.0, 0.0)), f.x), mix(h2(i + vec2(0.0, 1.0)), h2(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int k = 0; k < 4; k++) { v += vnoise(p) * a; p = p * 2.03 + 11.0; a *= 0.5; } return v; }

const vec3 ZENITH = vec3(0.55, 0.45, 0.88);
const vec3 HORIZON = vec3(0.86, 0.79, 0.98);

vec3 sky(float az, float el) {
  vec3 col = mix(HORIZON, ZENITH, smoothstep(0.0, 0.6, el));
  col += vec3(1.0, 0.93, 1.0) * exp(-(az * az * 4.0 + (el - 0.12) * (el - 0.12) * 20.0)) * 0.4; // light behind the figure
  float cl = fbm(vec2(az * 1.8 + uTime * 0.006, el * 5.0 - 0.7));
  float c2 = fbm(vec2(az * 3.6 - uTime * 0.004 + 9.0, el * 9.0 + 2.0));
  vec3 cloud = mix(vec3(0.97, 0.80, 0.96), vec3(0.88, 0.81, 1.0), c2);
  return mix(col, cloud, smoothstep(0.5, 0.78, cl) * 0.6 * smoothstep(0.04, 0.3, el));
}

// one row of low-poly rocks: each cell holds a rock of its own width, height and peak; the face left of the peak
// catches the light. par: how fast the row pans with the orbit (parallax)
vec3 rocks(float az, float el, vec3 col, float freq, float off, float par, vec3 lit, vec3 shade, float hMax) {
  float rx = az * freq + uYaw * par + off;
  float ci = floor(rx), cf = fract(rx);
  float w = 0.55 + 0.45 * h1(ci + 1.3);
  float x = (cf - (0.5 + (h1(ci + 4.1) - 0.5) * (1.0 - w))) / (w * 0.5);
  if (abs(x) < 1.0 && h1(ci + 3.1) > 0.16) {
    float peak = (h1(ci + 6.2) - 0.5) * 0.8;
    float k = 1.2 + h1(ci + 8.4) * 2.6;
    float top = hMax * (0.35 + 0.65 * h1(ci)) * (1.0 - pow(min(1.0, abs(x - peak) / (1.0 + abs(peak))), k));
    if (el < top) col = mix(shade, lit, step(x, peak)) * (0.92 + 0.16 * h1(ci + 9.9));
  }
  return col;
}

// the landscape along a view direction: azimuth / elevation in radians
vec3 scene(float az, float el) {
  vec3 col = sky(az, el);
  // far range: misty mountains
  float fx = az * 4.0 + 4.0;
  float farH = 0.035 + range(fx) * 0.1;
  if (el < farH) col = mix(vec3(0.70, 0.63, 0.90), HORIZON, 0.3 + 0.3 * smoothstep(farH, 0.0, el));
  // two rows of low-poly rocks, the nearer one darker and panning faster
  col = rocks(az, el, col, 11.0, 0.0, 2.4, vec3(0.60, 0.54, 0.76), vec3(0.48, 0.43, 0.64), 0.11);
  col = rocks(az, el, col, 18.0, 5.5, 3.4, vec3(0.50, 0.44, 0.64), vec3(0.32, 0.27, 0.46), 0.075);
  // the far shore: rolling purple meadow in front of the stones
  float m = 0.012 + (vnoise(vec2(az * 6.0 + uYaw * 3.2, 1.0)) * 0.6 + vnoise(vec2(az * 17.0 + uYaw * 3.2, 3.0)) * 0.4) * 0.03;
  if (el < m) col = mix(vec3(0.33, 0.15, 0.60), vec3(0.48, 0.26, 0.77), vnoise(vec2(az * 70.0, el * 400.0)) * 0.7 + 0.15);
  return mix(col, HORIZON, exp(-abs(el) * 90.0) * 0.22);
}

void main() {
  vec2 v = texture(uVel, vUv).xy;
  float sp = length(v);
  vec2 off = -v * uVelToUv;                       // liquid: the picture is pulled along the flow
  off *= min(1.0, 0.012 / max(length(off), 1e-5));

  vec3 col = vec3(0.965, 0.953, 0.996); // the page's lilac paper (--color-bg)
  if (uEnv > 0.001) {
    vec2 ndc = (vUv + off) * 2.0 - 1.0 - uShift;
    vec3 dir = normalize(uCamF + uCamR * ndc.x * uTanH * uAspect + uCamU * ndc.y * uTanH);
    float az = atan(dir.x, -dir.z), el = asin(clamp(dir.y, -1.0, 1.0));
    vec3 env;
    if (el >= 0.0) env = scene(az, el);
    else {
      // the lake: the landscape mirrored (two taps a little apart read as a soft reflection), gentle ripples,
      // deeper toward the viewer, a bright waterline and glints under the light
      float d = -el;
      float rip = sin(d * 220.0 - uTime * 1.6) * 0.0012 + (vnoise(vec2(az * 30.0, d * 70.0 - uTime * 0.5)) - 0.5) * 0.004;
      vec3 r1 = scene(az + rip * 2.0, d + rip);
      vec3 r2 = scene(az - rip * 2.0 + 0.004, d + 0.006 + rip);
      env = (r1 + r2) * 0.5 * vec3(0.80, 0.76, 0.94);
      env = mix(env, vec3(0.30, 0.20, 0.58), smoothstep(0.0, 0.35, d) * 0.62);
      env += vec3(0.9, 0.86, 1.0) * exp(-d * 380.0) * 0.16;
      env += pow(vnoise(vec2(az * 90.0, d * 300.0 - uTime * 2.0)), 14.0) * exp(-az * az * 6.0) * exp(-d * 5.0);
    }
    // drifting petals in the air
    vec2 pq = vec2(vUv.x * uAspect, vUv.y) * 9.0 + vec2(uTime * 0.05 + uYaw * 4.0, -uTime * 0.03);
    vec2 pc = floor(pq), pf = fract(pq);
    float petal = smoothstep(0.035, 0.0, length(pf - vec2(h2(pc), h2(pc + 5.3)))) * step(0.72, h2(pc + 1.7)) * smoothstep(0.42, 0.62, vUv.y);
    env = mix(env, vec3(0.36, 0.28, 0.52), petal * 0.6);
    // foreground meadow: three layers of blades along the bottom of the frame (two interleaved blade rows per layer,
    // each blade with its own width, height and lean), swaying, panning with the orbit, lighter at the tips
    for (int L = 0; L < 3; L++) {
      float fl = float(L);
      float base = 0.1 - fl * 0.038, amp = 0.1 - fl * 0.018;
      float u = vUv.x * uAspect * (52.0 + fl * 30.0) + uYaw * (7.0 + fl * 6.0) + fl * 13.7;
      float rise = clamp((vUv.y - base) / amp, 0.0, 1.0);
      float top = base;
      for (int B = 0; B < 2; B++) {
        float fb = float(B);
        float ub = u * (1.0 + fb * 0.63) + fb * 0.37;
        float i = floor(ub), fu = fract(ub);
        float seed = fl * 31.0 + fb * 11.0;
        float lean = sin(uTime * (0.9 + h1(i + seed) * 0.8) + i * 0.7) * 0.2 * rise;
        float width = 0.16 + 0.26 * h1(i + seed + 5.0);
        float tip = clamp(1.0 - abs(fu - (0.5 + (h1(i + seed + 2.0) - 0.5) * 0.5) - lean) / width, 0.0, 1.0);
        top = max(top, base + amp * (0.3 + 0.7 * h1(i + seed)) * (1.0 - fb * 0.15) * pow(tip, 1.1));
      }
      if (vUv.y < top) {
        vec3 dark = mix(vec3(0.38, 0.19, 0.68), vec3(0.17, 0.06, 0.37), fl / 2.0);
        vec3 tipC = mix(vec3(0.62, 0.42, 0.90), vec3(0.42, 0.22, 0.70), fl / 2.0);
        env = mix(dark, tipC, smoothstep(base - 0.03, top + 0.01, vUv.y) * 0.75);
      }
    }
    // scrims where the copy sits: the bottom, and the side opposite the figure
    env *= mix(1.0, 0.8, smoothstep(0.42, 0.0, vUv.y));
    env *= mix(1.0, 0.74, smoothstep(0.62, 0.0, vUv.x) * clamp(uSideX / 0.42, 0.0, 1.0));
    env *= mix(1.0, 0.74, smoothstep(0.38, 1.0, vUv.x) * clamp(-uSideX / 0.42, 0.0, 1.0));
    col = mix(col, env, uEnv);
  }

  vec4 d = texture(uDye, vUv + off * 0.5);
  col = mix(col, d.rgb / max(d.a, 1e-4), clamp(d.a, 0.0, 1.0) * uInk);

  // the figure, refracted by the flow with a little colour split
  vec2 dir2 = v / max(sp, 1e-4);
  float ca = min(length(off) * 0.8, 0.01);
  vec2 fu = vUv + off;
  vec4 fg = texture(uFig, fu);
  vec4 fig = vec4(texture(uFig, fu + dir2 * ca).r, fg.g, texture(uFig, fu - dir2 * ca).b, fg.a);

  // water: below the horizon, a mirrored, rippling reflection of the figure and a faint sheen
  if (uReflect > 0.001 && vUv.y < uHorizon) {
    float dy = uHorizon - vUv.y;
    float wob = sin(dy * 110.0 - uTime * 2.2) * 0.0035 + sin(dy * 47.0 + vUv.x * 9.0 - uTime * 1.3) * 0.0025;
    vec2 ruv = vec2(vUv.x + wob * min(dy * 14.0, 1.0) + off.x * 2.0, uHorizon + dy * 1.2 + off.y * 2.0);
    vec4 rf = texture(uFig, ruv);
    col = mix(col, rf.rgb / max(rf.a, 1e-4), rf.a * exp(-dy * 6.0) * 0.4 * uReflect);
    col = mix(col, vec3(0.93, 0.92, 0.99), uReflect * (1.0 - uEnv) * 0.35 * smoothstep(0.0, 0.01, dy) * exp(-dy * 4.0));
  }
  o = vec4(col * (1.0 - fig.a) + fig.rgb, 1.0);
}`;

type V3 = [number, number, number];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

interface Cam {
  yaw: number;
  pitch: number;
  dist: number;
  sx: number;
  sy: number;
}
const REST: Cam = { yaw: 0, pitch: 0, dist: DIST, sx: 0, sy: 0 };

/** Orbit camera around the origin: view-projection (with lens shift), axes and eye. */
function camera(c: Cam, aspect: number) {
  const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch), cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
  const F: V3 = [sy * cp, -sp, -cy * cp];
  const R: V3 = [cy, 0, sy];
  const U = cross(R, F);
  const eye: V3 = [-F[0] * c.dist, -F[1] * c.dist, -F[2] * c.dist];
  const f = 1 / TAN, near = 0.05, far = 60, nf = 1 / (near - far);
  const P = [f / aspect, 0, 0, 0, 0, f, 0, 0, -c.sx, -c.sy, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  const V = [R[0], U[0], -F[0], 0, R[1], U[1], -F[1], 0, R[2], U[2], -F[2], 0, -dot(R, eye), -dot(U, eye), dot(F, eye), 1];
  const vp = new Float32Array(16);
  for (let col = 0; col < 4; col++)
    for (let row = 0; row < 4; row++) vp[col * 4 + row] = P[row]! * V[col * 4]! + P[4 + row]! * V[col * 4 + 1]! + P[8 + row]! * V[col * 4 + 2]! + P[12 + row]! * V[col * 4 + 3]!;
  // where the horizon (elevation 0) crosses the screen, in uv
  const horizon = (c.sy + Math.tan(c.pitch) / TAN) * 0.5 + 0.5;
  return { vp, R, U, F, eye, horizon };
}

/** Ry(yaw) · Rx(tilt), column-major */
function rotation(yaw: number, tilt: number) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(tilt), sx = Math.sin(tilt);
  return new Float32Array([cy, 0, -sy, sy * sx, cx, cy * sx, sy * cx, -sx, cy * cx]);
}

interface Pose {
  shape: ShapeName | "none";
  x: number;
  y: number;
  s: number;
  spread: number;
  reflect: number;
  horizon: number;
  env: number;
  cam: Cam | null;
  fade: number;
}
const NONE: Pose = { shape: "none", x: 0, y: 0, s: 1, spread: 0, reflect: 0, horizon: 0, env: 0, cam: null, fade: 1 };

export function StudioCanvas() {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const rescanRef = useRef<() => void>(() => undefined);

  useEffect(() => rescanRef.current(), [pathname]);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const html = document.documentElement;
    const announce = (state: "on" | "off") => {
      html.dataset.studio = state;
      window.dispatchEvent(new Event("studio:state"));
    };
    if (!box || !canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return announce("off");
    const ctx = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false, powerPreference: "high-performance" });
    const formats = ctx && floatFormats(ctx);
    if (!ctx || !formats) return announce("off");
    const gl: WebGL2RenderingContext = ctx;
    const boxEl: HTMLDivElement = box;
    const canvasEl: HTMLCanvasElement = canvas;

    const small = Math.min(window.innerWidth, window.innerHeight) < 640;
    const wide = window.innerWidth >= 1024;
    let fluid: Fluid, figure: Figure;
    const comp = program(gl, FULLSCREEN_VERT, COMPOSITE);
    try {
      if (!comp) throw new Error("composite");
      fluid = new Fluid(gl, formats.half, { simShort: small ? 96 : 128, dyeShort: small ? 320 : 540 });
      figure = new Figure(gl, formats.full, wide ? 256 : window.innerWidth >= 640 ? 192 : 128);
    } catch {
      return announce("off");
    }
    const cu = locations(gl, comp, ["uDye", "uVel", "uFig", "uVelToUv", "uShift", "uTime", "uHorizon", "uReflect", "uInk", "uEnv", "uAspect", "uTanH", "uYaw", "uSideX", "uCamR", "uCamU", "uCamF"] as const);
    figure.ensure("sphere");
    figure.prebuild(SHAPES);
    let disposed = false;
    // shapes are built in spare moments — never during the intro (its curtain animates on the main thread in Safari)
    const idle = (fn: () => void): unknown =>
      html.classList.contains("preloading")
        ? window.setTimeout(() => idle(fn), 300)
        : typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback(fn, { timeout: 1200 })
          : window.setTimeout(fn, 150);
    const build = () => !disposed && figure.buildNext() && idle(build);
    idle(build);

    // the brand mark, sampled from the official artwork
    const logo = new Image();
    logo.src = LOGO_SRC;
    logo
      .decode()
      .then(() => {
        if (disposed) return;
        const c = document.createElement("canvas");
        c.width = logo.naturalWidth;
        c.height = logo.naturalHeight;
        const g = c.getContext("2d", { willReadFrequently: true });
        if (!g) return;
        g.drawImage(logo, 0, 0);
        const mark = sampleMark(g.getImageData(0, 0, c.width, c.height), figure.count);
        if (mark) figure.setCustom("logo", mark.pos, mark.tint);
        wake();
      })
      .catch(() => undefined);

    // ---- loop state
    const pose = { x: 0, y: 0, s: 1, spread: 0, reflect: 0, horizon: 0, alpha: 0, dust: 0, env: 0, tint: 0 };
    const cam: Cam = { ...REST };
    let yaw = 0, clock = 0, last = performance.now(), raf = 0, running = false, quietFor = 0, inkHue = 0;
    let introDone = !html.classList.contains("preloading");
    let burstAt = performance.now() + 2600, burstStart = -1e9;
    // adaptive resolution: `refresh` tracks the display's frame interval (60/120/144 Hz), `fastFor`/`slowFor` how long
    // frames have kept up with it; `ceiling` stops it climbing back to a level it could not hold
    let frameAvg = 1 / 60, slowFor = 0, fastFor = 0, refresh = 1 / 60, ceiling = 1, raisedAt = -1e9, settleAt = 0, hadCam = false;
    const STEP = 1 / 60;
    let acc = 0;

    // ---- figure render target (RGBA8 + depth), canvas-sized
    let figTex: WebGLTexture | null = null, figFb: WebGLFramebuffer | null = null, figDepth: WebGLRenderbuffer | null = null;
    const hh = DIST * TAN; // half view height at the figure's depth, resting camera
    let W = 1, H = 1, aspect = 1, hw = hh;
    let quality = 1; // drops when frames run slow (adaptive resolution)
    const resize = () => {
      const dpr = Math.max(0.75, Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75) * quality);
      const w = Math.max(1, boxEl.clientWidth), h = Math.max(1, boxEl.clientHeight);
      W = Math.round(w * dpr);
      H = Math.round(h * dpr);
      canvasEl.width = W;
      canvasEl.height = H;
      aspect = w / h;
      hw = hh * aspect;
      fluid.resize(aspect);
      if (figTex) gl.deleteTexture(figTex);
      if (figFb) gl.deleteFramebuffer(figFb);
      if (figDepth) gl.deleteRenderbuffer(figDepth);
      figTex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, figTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      figDepth = gl.createRenderbuffer()!;
      gl.bindRenderbuffer(gl.RENDERBUFFER, figDepth);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, W, H);
      figFb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, figFb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, figTex, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, figDepth);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      wake();
    };

    // ---- anchors
    let anchors: HTMLElement[] = [];
    const rescan = () => {
      anchors = Array.from(document.querySelectorAll<HTMLElement>("[data-figure]"));
      wake();
    };
    rescanRef.current = rescan;
    const scanTimer = window.setInterval(rescan, 1200);
    rescan();

    const readPose = (): Pose => {
      const vh = window.innerHeight, vw = window.innerWidth;
      let best: HTMLElement | null = null, bestW = 0, rect: DOMRect | null = null;
      for (const a of anchors) {
        const r = a.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh || r.width === 0) continue;
        const w = 1 - Math.min(1, Math.abs(r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2));
        if (w > bestW) [best, bestW, rect] = [a, w, r];
      }
      if (!best || !rect) return NONE;
      const shape = (best.dataset.figure as ShapeName | "none") || "sphere";
      if (shape === "none") return NONE;
      if (shape === "dust") return { ...NONE, shape };
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      const rpx = (Math.min(rect.width, rect.height) / 2) * Number(best.dataset.figureScale ?? 1);
      const env = best.dataset.figureEnv !== undefined;
      const c = best.dataset.figureCam?.split(",").map(Number);
      const camT = c && c.length === 5 && c.every(Number.isFinite) ? { yaw: c[0]!, pitch: c[1]!, dist: c[2]!, sx: c[3]!, sy: c[4]! } : null;
      return {
        shape: shape === "logo" || (SHAPES as readonly string[]).includes(shape) ? shape : "sphere",
        // with a drone camera the figure stands at the orbit centre and the camera frames it
        x: camT ? 0 : (cx / vw) * 2 * hw - hw,
        y: camT ? 0 : hh - (cy / vh) * 2 * hh,
        s: (rpx / vh) * 2 * hh,
        spread: Number(best.dataset.figureSpread ?? 0),
        reflect: best.dataset.figureReflect !== undefined ? 1 : 0,
        horizon: 1 - (cy + rpx * 1.12) / vh,
        env: env ? 1 : 0,
        cam: camT,
        // an immediate fade the anchor controls (the hero's hand-over), not eased
        fade: clamp01(Number(best.dataset.figureFade ?? 1)),
      };
    };

    // ---- pointer + scroll → fluid
    const ptr = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, moved: false, last: -1e9, touch: false };
    const toUv = (cx: number, cy: number) => {
      const b = boxEl.getBoundingClientRect();
      return [(cx - b.left) / b.width, 1 - (cy - b.top) / b.height] as const;
    };
    const onMove = (cx: number, cy: number, touch: boolean) => {
      const [x, y] = toUv(cx, cy);
      ptr.x = x;
      ptr.y = y;
      ptr.moved = true;
      ptr.touch = touch;
      ptr.last = performance.now();
      wake();
    };
    const onPointer = (e: PointerEvent) => e.pointerType !== "touch" && onMove(e.clientX, e.clientY, false);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY, true);
    };
    const drops: [number, number][] = [];
    const onDown = (e: PointerEvent) => {
      const [x, y] = toUv(e.clientX, e.clientY);
      drops.push([x, y]);
      wake();
    };
    let lastScroll = window.scrollY, scrollV = 0;
    const onScroll = () => wake();
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    function frame(now: number) {
      raf = running ? requestAnimationFrame(frame) : 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += dt;
      if (!introDone && !html.classList.contains("preloading")) {
        introDone = true;
        figure.changedAt = now;
        burstAt = now + 2600;
        settleAt = now + 1500;
      }
      // adaptive resolution: frames that keep missing the display's refresh → render fewer pixels; long headroom →
      // a step back up (once per level). Not judged during the intro or right after it (loading work).
      if (dt > 0.0055) refresh = Math.min(1 / 30, Math.max(1 / 144, refresh + (dt - refresh) * (dt < refresh ? 0.5 : 0.002)));
      frameAvg += (dt - frameAvg) * 0.05;
      if (introDone && now > settleAt) {
        slowFor = frameAvg > Math.max(refresh * 1.22, 1 / 75) ? slowFor + dt : 0;
        fastFor = frameAvg < refresh * 1.06 ? fastFor + dt : 0;
        if (slowFor > 1.5 && quality > 0.55) {
          if (now - raisedAt < 5000) ceiling = quality * 0.999;
          quality *= 0.85;
          slowFor = fastFor = 0;
          settleAt = now + 600;
          resize();
        } else if (fastFor > 6 && quality < ceiling - 0.01) {
          quality = Math.min(ceiling, quality / 0.85);
          fastFor = 0;
          raisedAt = now;
          settleAt = now + 600;
          resize();
        }
      }

      // pointer → velocity + ink
      if (ptr.moved) {
        const dx = ptr.x - ptr.px, dy = ptr.y - ptr.py;
        if (Math.abs(dx) + Math.abs(dy) > 1e-5 && dt > 0) {
          const speed = Math.hypot(dx, dy) / dt;
          inkHue = (inkHue + dt * 0.25) % INK.length;
          const a = INK[Math.floor(inkHue)]!, b = INK[(Math.floor(inkHue) + 1) % INK.length]!, t = inkHue % 1;
          const color: V3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
          const force = ptr.touch ? 0.6 : 1;
          const vx = Math.max(-900, Math.min(900, (dx / dt) * fluid.simW * 0.9 * force));
          const vy = Math.max(-900, Math.min(900, (dy / dt) * fluid.simH * 0.9 * force));
          fluid.splat(ptr.x, ptr.y, vx, vy, color, Math.min(0.32, speed * 0.05) * (1 - pose.env * 0.5), small ? 0.0032 : 0.0016);
        }
        ptr.px = ptr.x;
        ptr.py = ptr.y;
        ptr.moved = false;
      }
      // a click is a drop of water: a ring pushed outward
      while (drops.length) {
        const [x, y] = drops.shift()!;
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2, r = 0.02;
          fluid.splat(x + (Math.cos(a) * r) / fluid.aspect, y + Math.sin(a) * r, Math.cos(a) * 260, Math.sin(a) * 260, [0.6, 0.45, 0.95], 0.05, 0.0006);
        }
      }
      // scrolling pushes the liquid a little, with the page
      const sy = window.scrollY, sv = (sy - lastScroll) / Math.max(dt, 1e-3);
      lastScroll = sy;
      scrollV += (sv - scrollV) * Math.min(1, dt * 8);
      if (Math.abs(scrollV) > 30) {
        const push = Math.max(-160, Math.min(160, (scrollV / window.innerHeight) * fluid.simH * 0.18));
        fluid.splat(Math.random(), Math.random(), 0, push, [0.7, 0.6, 0.97], 0.006, 0.01);
      }

      // figure pose + camera from the anchors
      const target = readPose();
      const rate = 1 - Math.exp(-dt * 3.2);
      const visible = target.shape !== "none" && introDone;
      const dustT = target.shape === "dust" ? 1 : 0;
      pose.dust += (dustT - pose.dust) * rate;
      if (target.shape !== "none") {
        pose.x += (target.x - pose.x) * rate;
        pose.y += (target.y - pose.y) * rate;
        pose.s += (target.s - pose.s) * rate;
        if (target.shape !== figure.current && introDone) figure.setShape(target.shape, now);
      }
      // leaving a drone-camera scene (the hero hands over under its white halo): drop it at once, no ghost
      if (!target.cam && hadCam) {
        pose.env = 0;
        pose.alpha = 0;
      }
      hadCam = Boolean(target.cam);
      const camT = target.cam ?? REST;
      const crate = 1 - Math.exp(-dt * (target.cam ? 9 : 3));
      cam.yaw += (camT.yaw - cam.yaw) * crate;
      cam.pitch += (camT.pitch - cam.pitch) * crate;
      cam.sx += (camT.sx - cam.sx) * crate;
      cam.sy += (camT.sy - cam.sy) * crate;
      cam.dist = target.cam ? camT.dist : cam.dist + (camT.dist - cam.dist) * crate; // the hero's zoom is exact
      const C = camera(cam, aspect);
      pose.env += (target.env - pose.env) * Math.min(1, dt * 3);
      pose.horizon += ((target.cam ? C.horizon : target.horizon) - pose.horizon) * (target.cam ? 1 : rate);
      pose.spread += (target.spread - pose.spread) * Math.min(1, dt * 8);
      pose.reflect += ((visible ? target.reflect : 0) * (1 - pose.spread) - pose.reflect) * rate;
      pose.tint += ((figure.current === "logo" ? 1 : 0) - pose.tint) * Math.min(1, dt * 3);
      const zoomFade = smooth(0.35, 1.1, cam.dist);
      const alphaT = visible && figure.current ? (1 - smooth(0.12, 0.6, pose.spread)) * (dustT ? 0.75 : 1) * zoomFade : 0;
      pose.alpha += (alphaT - pose.alpha) * Math.min(1, dt * 4);
      const figureOn = pose.alpha > 0.004;

      // a settled form breathes out every few seconds
      const settled = figureOn && !dustT && pose.spread < 0.02 && now - figure.changedAt > 2200;
      if (settled && now >= burstAt) {
        burstStart = now;
        burstAt = now + 7000 + Math.random() * 2500;
      } else if (!settled && now >= burstAt) burstAt = now + 1500;
      const bt = (now - burstStart) / 1500;
      const burst = bt >= 0 && bt <= 1 ? Math.pow(Math.sin(Math.PI * bt), 2) : 0;

      // quiet page (no motion left, nothing on screen to animate) → rest
      const busy = fluid.energy > 0.02 || figureOn || pose.env > 0.004 || Math.abs(scrollV) > 1;
      quietFor = busy ? 0 : quietFor + dt;
      if (quietFor > 0.5) {
        running = false;
        raf = 0;
        return;
      }

      // physics
      const halfH = cam.dist * TAN, halfW = halfH * aspect;
      acc += dt;
      let steps = 0;
      while (acc >= STEP && steps < 3) {
        fluid.step(STEP);
        if (figure.current && (figureOn || visible)) {
          const facing = figure.current === "play" || figure.current === "dust" || figure.current === "wave" || figure.current === "ring" || figure.current === "logo";
          if (facing) {
            const goal = Math.round(yaw / (Math.PI * 2)) * Math.PI * 2;
            yaw += (goal - yaw) * Math.min(1, STEP * 3);
          } else yaw += STEP * 0.22;
          const mx = ptr.x * 2 - 1, my = ptr.y * 2 - 1, act = now - ptr.last < 2500 ? 1 : 0;
          const tilt = figure.current === "wave" ? 0.55 : facing ? 0 : 0.2 - my * 0.15 * act;
          const sway = figure.current === "logo" ? Math.sin(clock * 0.6) * 0.22 : 0;
          const dustScale: V3 = [hw * 1.08, hh * 1.08, 1.4];
          const s = pose.s;
          figure.step({
            dt: STEP,
            time: clock,
            kMul: 0.18 + 0.82 * smooth(0, 1.4, (now - figure.changedAt) / 1000),
            spread: pose.spread,
            burst,
            wave: figure.current === "wave" ? 1 : 0,
            rot: rotation(yaw + sway + mx * 0.25 * act * (1 - pose.dust), tilt * (1 - pose.dust)),
            offset: [pose.x * (1 - pose.dust), pose.y * (1 - pose.dust), 0],
            scale: [s + (dustScale[0] - s) * pose.dust, s + (dustScale[1] - s) * pose.dust, s + (dustScale[2] - s) * pose.dust],
            camR: C.R,
            camU: C.U,
            half: [halfW, halfH],
            viewProj: C.vp,
            aspect,
            mouse: [mx, my],
            active: act,
            fluid: fluid.velocity.read.tex,
            fluidToNdc: [2 / fluid.simW, 2 / fluid.simH],
          });
        }
        acc -= STEP;
        steps++;
      }
      if (steps === 3) acc = 0;

      // figure → its own target
      gl.bindFramebuffer(gl.FRAMEBUFFER, figFb);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      if (figureOn) {
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        const sizeWorld = (small ? 0.04 : 0.034) * Math.pow(Math.min(1.3, Math.max(0.3, pose.s)), 0.55) * (1 - pose.dust * 0.45) * (1 - pose.spread * 0.5);
        const keep = 1 - pose.dust * (1 - (small ? 0.07 : 0.035));
        const maxPx = 40 + Math.max(0, 3 - cam.dist) * 45;
        figure.render(C.vp, C.eye, (sizeWorld * H) / (2 * TAN), pose.alpha * target.fade, keep, pose.tint, maxPx);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
      }

      // composite
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(comp);
      const bind = (unit: number, tex: WebGLTexture, loc: WebGLUniformLocation | null) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(loc, unit);
      };
      bind(0, fluid.dye.read.tex, cu.uDye);
      bind(1, fluid.velocity.read.tex, cu.uVel);
      bind(2, figTex!, cu.uFig);
      gl.uniform2f(cu.uVelToUv, 0.0035 / fluid.simW, 0.0035 / fluid.simH);
      gl.uniform2f(cu.uShift, cam.sx, cam.sy);
      gl.uniform1f(cu.uTime, clock);
      gl.uniform1f(cu.uHorizon, pose.horizon);
      gl.uniform1f(cu.uReflect, pose.reflect * pose.alpha * target.fade);
      gl.uniform1f(cu.uInk, 0.5 - pose.env * 0.2);
      gl.uniform1f(cu.uEnv, pose.env * target.fade);
      gl.uniform1f(cu.uAspect, aspect);
      gl.uniform1f(cu.uTanH, TAN);
      gl.uniform1f(cu.uYaw, cam.yaw);
      gl.uniform1f(cu.uSideX, cam.sx);
      gl.uniform3f(cu.uCamR, ...C.R);
      gl.uniform3f(cu.uCamU, ...C.U);
      gl.uniform3f(cu.uCamF, ...C.F);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function wake() {
      quietFor = 0;
      if (running || disposed || document.visibilityState !== "visible") return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    const onVis = () => (document.visibilityState === "visible" ? wake() : ((running = false), cancelAnimationFrame(raf)));
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(resize);
    ro.observe(boxEl);
    const onLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(raf);
      announce("off");
    };
    canvasEl.addEventListener("webglcontextlost", onLost);
    resize();
    announce("on");

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      window.clearInterval(scanTimer);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll", onScroll);
      canvasEl.removeEventListener("webglcontextlost", onLost);
      fluid.dispose();
      figure.dispose();
      if (figTex) gl.deleteTexture(figTex);
      if (figFb) gl.deleteFramebuffer(figFb);
      if (figDepth) gl.deleteRenderbuffer(figDepth);
      gl.deleteProgram(comp);
      rescanRef.current = () => undefined;
    };
  }, []);

  return (
    <div aria-hidden="true" className="studio-layer">
      <div ref={boxRef} className="studio-pin">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  );
}
