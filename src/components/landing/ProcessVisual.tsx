"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { getClip } from "@/data/media";
import { cn } from "@/lib/utils/cn";
import { InViewVideo } from "@/components/ui/InViewVideo";
import { TUBE, knot, norm, onTube, rng, type V3 } from "@/lib/gl/geometry";

/* Live process render for the pinned "Our approach" section. One particle field, four states, scrubbed by the
   section's scroll progress (0 → 1):
     01 Discover  scattered input drifting in clusters
     02 Concept   a wireframe sketch of the form (centre line, sections, guides)
     03 Create    the lit, shaded object
     04 Deliver   the same object cut into 16:9, 1:1 and 9:16 frames
   Plain WebGL (no library), additive points; the cursor pushes particles around. Runs only while on screen.
   Without WebGL it falls back to the studio clips. */

const HUD = [
  { mode: "Input", line: "Gathering the brief" },
  { mode: "Wireframe", line: "Sketching the form" },
  { mode: "Render", line: "Light, material, motion" },
  { mode: "Export", line: "16:9 · 1:1 · 9:16" },
];
const FALLBACK_CLIPS = ["saas-dashboard", "motion-comp", "product-scan", "edit-timeline"];

const VERT = `
attribute vec3 aP0; attribute vec3 aP1; attribute vec3 aP2; attribute vec3 aN2;
attribute vec3 aL3; attribute vec3 aC3; attribute vec4 aSeed; attribute vec3 aDir;
uniform mat4 uProj; uniform mat3 uRot; uniform vec2 uField; uniform vec2 uMouse;
uniform float uTime, uMorph, uKnot, uFit, uHover, uAspect, uDpr, uSize, uScan;
varying vec3 vColor; varying float vAlpha;

float st(float m, float k, float s) { float t = clamp((m - k) * 1.7 - s * 0.7, 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }

void main() {
  float s = aSeed.x;
  bool outline = aSeed.y > 0.5;
  float t1 = st(uMorph, 0.0, s), t2 = st(uMorph, 1.0, s), t3 = st(uMorph, 2.0, s);
  float burst = sin(3.14159 * t1) + sin(3.14159 * t2) + sin(3.14159 * t3);

  vec3 drift = vec3(sin(uTime * 0.6 + s * 40.0), cos(uTime * 0.5 + s * 31.0), sin(uTime * 0.4 + s * 17.0)) * 0.07 * (1.0 - t1);
  vec3 p = mix(aP0 * vec3(uField, 1.0) + drift, aP1 * uKnot, t1);
  p = mix(p, aP2 * uKnot, t2) + aDir * burst * 0.3;
  vec3 world = uRot * p;

  mat3 local = rotY(sin(uTime * 0.7 + aC3.x) * 0.6) * rotZ(uTime * 0.35);
  vec3 p3 = (aC3 + (outline ? aL3 : local * aL3)) * uFit;
  world = mix(world, p3, t3);

  // light: the object (and its copies) is shaded, the rest glows flat
  vec3 n = normalize(mix(uRot * aN2, local * aN2, outline ? 0.0 : t3));
  vec3 L = normalize(vec3(-0.45, 0.6, 0.75));
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 24.0);
  float lit = t2 * (outline ? 1.0 - t3 : 1.0);
  float facing = smoothstep(-0.35, 0.35, n.z);
  float rim = pow(1.0 - abs(n.z), 2.0);
  // 03: a render pass sweeps top → bottom through the object while you scroll the step
  float scanY = mix(1.5, -1.5, uScan);
  float band = exp(-pow((world.y - scanY) * 5.0, 2.0)) * step(0.001, uScan) * step(uScan, 0.999) * t2 * (1.0 - t3);
  float done = mix(0.55, 1.0, smoothstep(scanY - 0.05, scanY + 0.05, world.y) * step(0.001, uScan) + step(0.999, uScan));
  float lum = mix(1.0, (0.5 + 1.05 * diff + rim * 0.7) * mix(1.0, done, t2 * (1.0 - t3)) + band * 1.6, lit);

  vec3 violet = vec3(0.53, 0.33, 0.91), blue = vec3(0.09, 0.61, 0.91), ice = vec3(0.62, 0.80, 1.0);
  vec3 base = mix(violet, blue, aSeed.z);
  base = mix(base, ice, t1 * (1.0 - t2) * 0.55);
  base = mix(base, vec3(0.92), outline ? t3 : 0.0);
  vColor = mix(base * lum, vec3(1.0), band * 0.7) + vec3(spec * 0.9 * lit);

  float twinkle = 0.62 + 0.38 * sin(uTime * 2.2 + s * 53.0);
  vAlpha = mix(twinkle, 1.0, t1) * mix(1.0, 0.3 + 0.7 * facing, lit) * 0.95;

  vec4 clip = uProj * vec4(world.x, world.y, world.z - 4.2, 1.0);
  vec2 ndc = clip.xy / clip.w;
  vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
  float l = length(d);
  float f = uHover * smoothstep(0.38, 0.0, l);
  ndc += (d / max(l, 0.0001)) * f * 0.14 / vec2(uAspect, 1.0);
  clip.xy = ndc * clip.w;
  vAlpha += f * 0.35 + band * 0.5;
  gl_Position = clip;
  gl_PointSize = uSize * uDpr * (4.2 / max(0.5, 4.2 - world.z)) * mix(1.35, 1.0, t1) * (1.0 + band * 0.9);
}`;

const FRAG = `
precision mediump float;
varying vec3 vColor; varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.1, d);
  gl_FragColor = vec4(vColor * a * vAlpha, 1.0);
}`;

// ---------------------------------------------------------------- geometry

// delivery frames (16:9, 1:1, 9:16), bottoms aligned, 3.82 wide in total
const FRAMES = [
  { w: 1.6, h: 0.9, x: -1.11 },
  { w: 1.0, h: 1.0, x: 0.49 },
  { w: 0.62, h: 1.1, x: 1.6 },
].map((f) => ({ ...f, y: -0.55 + f.h / 2, scale: (Math.min(f.w, f.h) * 0.42) / 1.28 }));
const FRAMES_W = 3.82;

function build(count: number) {
  const r = rng(7);
  const gauss = () => Math.sqrt(-2 * Math.log(r() || 1e-6)) * Math.cos(2 * Math.PI * r());
  const A = {
    aP0: new Float32Array(count * 3),
    aP1: new Float32Array(count * 3),
    aP2: new Float32Array(count * 3),
    aN2: new Float32Array(count * 3),
    aL3: new Float32Array(count * 3),
    aC3: new Float32Array(count * 3),
    aSeed: new Float32Array(count * 4),
    aDir: new Float32Array(count * 3),
  };
  const clusters = Array.from({ length: 7 }, () => [r() * 1.7 - 0.85, r() * 1.5 - 0.75, r() * 1.2 - 0.6]);
  const perims = FRAMES.map((f) => 2 * (f.w + f.h));
  const perimTotal = perims.reduce((a, b) => a + b, 0);
  const put = (arr: Float32Array, i: number, v: V3 | number[]) => arr.set(v, i * 3);

  for (let i = 0; i < count; i++) {
    // 01 — input: clusters + loose scatter, in a unit box scaled to the view in the shader
    if (r() < 0.7) {
      const c = clusters[i % clusters.length]!;
      put(A.aP0, i, [c[0]! + gauss() * 0.11, c[1]! + gauss() * 0.11, c[2]! + gauss() * 0.15]);
    } else put(A.aP0, i, [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1]);

    // 02 — wireframe: centre line, cross-sections, construction guides
    const k = r();
    if (k < 0.48) {
      const c = knot(r() * Math.PI * 2);
      put(A.aP1, i, [c[0] + gauss() * 0.006, c[1] + gauss() * 0.006, c[2] + gauss() * 0.006]);
    } else if (k < 0.8) {
      put(A.aP1, i, onTube((Math.floor(r() * 20) / 20) * Math.PI * 2, r() * Math.PI * 2, TUBE).p);
    } else if (k < 0.92) {
      const a = r() * Math.PI * 2;
      put(A.aP1, i, [Math.cos(a) * 1.46, Math.sin(a) * 1.46, 0]);
    } else {
      const t = r() * 3.2 - 1.6;
      put(A.aP1, i, r() < 0.5 ? [t, 0, 0] : [0, t, 0]);
    }

    // 03 — the object's surface (with normals for shading)
    const s = onTube(r() * Math.PI * 2, r() * Math.PI * 2, TUBE);
    put(A.aP2, i, s.p);
    put(A.aN2, i, s.n);

    // 04 — frame outlines, or a copy of this surface point inside one of the frames
    const outline = r() < 0.2;
    if (outline) {
      let d = r() * perimTotal;
      let fi = 0;
      while (d > perims[fi]! && fi < 2) d -= perims[fi++]!;
      const f = FRAMES[fi]!;
      const hw = f.w / 2, hh = f.h / 2;
      let x: number, y: number;
      if (d < f.w) [x, y] = [-hw + d, hh];
      else if (d < f.w + f.h) [x, y] = [hw, hh - (d - f.w)];
      else if (d < 2 * f.w + f.h) [x, y] = [hw - (d - f.w - f.h), -hh];
      else [x, y] = [-hw, -hh + (d - 2 * f.w - f.h)];
      put(A.aC3, i, [f.x, f.y, 0]);
      put(A.aL3, i, [x, y, 0]);
    } else {
      const f = FRAMES[i % 3]!;
      put(A.aC3, i, [f.x, f.y, 0]);
      put(A.aL3, i, [s.p[0] * f.scale, s.p[1] * f.scale, s.p[2] * f.scale]);
    }

    A.aSeed.set([r(), outline ? 1 : 0, r(), 0], i * 4);
    put(A.aDir, i, norm([gauss(), gauss(), gauss()]));
  }
  return A;
}

// ---------------------------------------------------------------- maths

function perspective(fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}
/** Ry(yaw) · Rx(tilt) · Rz(spin), column-major for uniformMatrix3fv */
function rotation(yaw: number, tilt: number, spin: number) {
  const [cy, sy, cx, sx, cz, sz] = [Math.cos(yaw), Math.sin(yaw), Math.cos(tilt), Math.sin(tilt), Math.cos(spin), Math.sin(spin)];
  const m = [
    [cy * cz + sy * sx * sz, -cy * sz + sy * sx * cz, sy * cx],
    [cx * sz, cx * cz, -sx],
    [-sy * cz + cy * sx * sz, sy * sz + cy * sx * cz, cy * cx],
  ];
  return new Float32Array([m[0]![0]!, m[1]![0]!, m[2]![0]!, m[0]![1]!, m[1]![1]!, m[2]![1]!, m[0]![2]!, m[1]![2]!, m[2]![2]!]);
}
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** scroll progress → morph 0..3, each change centred on the step boundary where the copy changes */
const morphFor = (p: number) => smooth(0.19, 0.31, p) + smooth(0.44, 0.56, p) + smooth(0.69, 0.81, p);

function timecode(p: number) {
  const f = Math.round(p * 24 * 24); // 24 s at 24 fps across the section
  const pad = (n: number) => String(n).padStart(2, "0");
  return `00:00:${pad(Math.floor(f / 24))}:${pad(f % 24)}`;
}

// ---------------------------------------------------------------- component

export function ProcessVisual({ progress, step, steps }: { progress: RefObject<number>; step: number; steps: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) {
      setFailed(true);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const shader = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);

    const count = box.clientWidth >= 640 ? 14000 : 7500;
    const data = build(count);
    const buffers: WebGLBuffer[] = [];
    (Object.keys(data) as (keyof typeof data)[]).forEach((name) => {
      const loc = gl.getAttribLocation(prog, name);
      if (loc < 0) return;
      const buf = gl.createBuffer()!;
      buffers.push(buf);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data[name], gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, name === "aSeed" ? 4 : 3, gl.FLOAT, false, 0, 0);
    });
    const U = (name: string) => gl.getUniformLocation(prog, name);
    const u = {
      proj: U("uProj"), rot: U("uRot"), field: U("uField"), mouse: U("uMouse"), time: U("uTime"), morph: U("uMorph"),
      knot: U("uKnot"), fit: U("uFit"), hover: U("uHover"), aspect: U("uAspect"), dpr: U("uDpr"), size: U("uSize"), scan: U("uScan"),
    };
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(0.031, 0.031, 0.051, 1);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, box.clientWidth < 640 ? 1.75 : 2);
      const w = Math.max(1, box.clientWidth), h = Math.max(1, box.clientHeight);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const aspect = w / h;
      const hh = 4.2 * Math.tan((35 * Math.PI) / 360); // half the visible height at the object's depth
      const hw = hh * aspect;
      gl.uniformMatrix4fv(u.proj, false, perspective((35 * Math.PI) / 180, aspect, 0.1, 20));
      gl.uniform2f(u.field, hw * 1.04, hh * 1.04);
      gl.uniform1f(u.knot, Math.min(1.05, (hh * 0.78) / 1.28, (hw * 0.86) / 1.28));
      gl.uniform1f(u.fit, Math.min(1, (hw * 2 * 0.88) / FRAMES_W, (hh * 2 * 0.62) / 1.1));
      gl.uniform1f(u.aspect, aspect);
      gl.uniform1f(u.dpr, dpr);
      gl.uniform1f(u.size, w < 640 ? 2.0 : 2.3);
      dirty = true;
    };

    // pointer: target + eased values; touch only while dragging
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, hover: 0, th: 0 };
    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
      mouse.th = 1;
    };
    const onLeave = () => (mouse.th = 0);
    const onUp = (e: PointerEvent) => e.pointerType !== "mouse" && onLeave();
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerdown", onMove);
    box.addEventListener("pointerleave", onLeave);
    box.addEventListener("pointerup", onUp);

    let raf = 0;
    let running = false;
    let dirty = true;
    let morph = morphFor(progress.current ?? 0);
    let last = performance.now();
    let clock = 0;
    let lastP = -1;

    const frame = (now: number) => {
      raf = running ? requestAnimationFrame(frame) : 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = progress.current ?? 0;
      const target = morphFor(p);
      if (reduce) {
        morph = Math.round(target);
        mouse.hover = 0;
      } else {
        clock += dt;
        morph += (target - morph) * Math.min(1, dt * 5);
        mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 6);
        mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 6);
        mouse.hover += (mouse.th - mouse.hover) * Math.min(1, dt * 4);
      }
      if (reduce && !dirty && p === lastP) return;
      lastP = p;
      dirty = false;

      const yaw = Math.sin(clock * 0.25) * 0.28 + mouse.x * 0.35 * mouse.hover + (p - 0.5) * 0.9;
      const tilt = -0.22 + mouse.y * 0.25 * mouse.hover;
      const spin = clock * 0.12 + p * 2.6;
      gl.uniformMatrix3fv(u.rot, false, rotation(yaw, tilt, spin));
      gl.uniform1f(u.time, clock);
      gl.uniform1f(u.morph, morph);
      gl.uniform1f(u.scan, Math.min(1, Math.max(0, (p - 0.53) / 0.2)));
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.hover, mouse.hover);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);

      // HUD readouts (no React render per frame)
      const k = Math.min(steps - 1, Math.floor(p * steps));
      const local = Math.min(1, Math.max(0, p * steps - k));
      if (tcRef.current) tcRef.current.textContent = timecode(p);
      if (pctRef.current) pctRef.current.textContent = `${HUD[k]!.mode} ${String(Math.round(local * 100)).padStart(3, " ")}%`;
      if (headRef.current) headRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    let inView = false;
    const sync = () => (inView && document.visibilityState === "visible" ? start() : stop());
    const io = new IntersectionObserver(([e]) => {
      inView = Boolean(e?.isIntersecting);
      sync();
    });
    io.observe(box);
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    document.addEventListener("visibilitychange", sync);
    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
      setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    resize();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerdown", onMove);
      box.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("webglcontextlost", onLost);
      buffers.forEach((b) => gl.deleteBuffer(b));
      gl.deleteProgram(prog);
    };
  }, [progress, steps]);

  const hud = HUD[step]!;

  return (
    <div ref={boxRef} aria-hidden="true" className="relative h-full w-full touch-pan-y overflow-hidden bg-[#08080d] text-white">
      {failed ? (
        FALLBACK_CLIPS.map((c, k) => {
          const clip = getClip(c);
          return (
            <div key={c} className={cn("absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none", k === step ? "opacity-100" : "opacity-0")}>
              <InViewVideo src={clip.srcSmall} poster={clip.poster} />
            </div>
          );
        })
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      )}

      {/* viewfinder */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgb(0_0_0/0.55))]" />
      {(["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"] as const).map((c) => (
        <span key={c} className={cn("pointer-events-none absolute size-4 border-white/45 md:size-5", c)} />
      ))}

      <div className="pointer-events-none absolute inset-x-5 top-5 flex items-start justify-between gap-3 font-mono text-[0.68rem] uppercase tracking-[0.02em] md:inset-x-7 md:top-7 md:text-[0.72rem]">
        <span className="flex items-center gap-2">
          <span className="relative inline-flex size-2">
            <span className="absolute inset-0 rounded-full bg-[#ff4d4d] motion-safe:animate-ping motion-safe:opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-[#ff4d4d]" />
          </span>
          Live render
          <span className="text-white/45">·</span>
          <span key={step} className="approach-text text-white/80">
            {String(step + 1).padStart(2, "0")} {hud.mode}
          </span>
        </span>
        <span ref={tcRef} className="tabular-nums text-white/70">
          00:00:00:00
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-5 bottom-5 md:inset-x-7 md:bottom-7">
        <div className="flex items-end justify-between gap-3 font-mono text-[0.68rem] uppercase tracking-[0.02em] md:text-[0.72rem]">
          <span key={step} className="approach-text text-white/80">
            {hud.line}
          </span>
          <span ref={pctRef} className="tabular-nums text-white/60">
            {hud.mode}
          </span>
        </div>
        {/* timeline: playhead follows the scroll, ticks mark the steps */}
        <div className="relative mt-3 h-[3px] rounded-full bg-white/15">
          <span ref={headRef} className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-[#8755e8] to-[#189be8]" style={{ transform: "scaleX(0)" }} />
          {Array.from({ length: steps - 1 }, (_, k) => (
            <span key={k} className="absolute -top-[3px] h-[9px] w-px bg-white/50" style={{ left: `${((k + 1) / steps) * 100}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
