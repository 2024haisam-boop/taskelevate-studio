import { onTube, rng } from "./geometry";
import { FULLSCREEN_VERT, locations, program, texture, type GL } from "./core";

/* THE FIGURE — a cloud of lit particles simulated on the GPU (position + velocity texels, ping-pong float targets
   with two attachments). Every particle springs toward its spot in the current shape; the shape is posed in world
   space by uniforms (offset, scale, turntable rotation), so moving the figure between sections drags the particles
   along like liquid instead of moving them rigidly. The fluid's velocity field (sampled where each particle sits on
   screen) carries particles, a divergence-free swirl keeps the form breathing, and the cursor opens a little room.
   "Scatter" loosens the spring after a push; "glow" brightens moving particles. Drawn as shaded sphere sprites. */

export const SHAPES = ["sphere", "cube", "knot", "play", "dust", "wave", "ring"] as const;
/** built-in shapes, plus "logo" (sampled from the brand artwork at runtime, see sampleMark) */
export type ShapeName = (typeof SHAPES)[number] | "logo";

const SIM = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uPos, uVel, uTarget, uFluid;
uniform float uDt, uTime, uK, uDamp, uFlow, uSpread, uActive, uAspect, uWave, uKick, uFlash;
uniform mat3 uRot;
uniform vec3 uOffset, uScale;  // world pose of the shape
uniform vec3 uCamR, uCamU;     // camera right / up in world space (pushes happen in the screen plane)
uniform vec2 uHalf;            // half view size (world units) at the figure's depth
uniform vec2 uFluidToNdc;      // fluid texels/s → NDC/s
uniform mat4 uViewProj;
uniform vec2 uMouse;
layout(location = 0) out vec4 oPos;
layout(location = 1) out vec4 oVel;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
// each component depends only on the other two axes: no divergence, so it swirls and never bunches
vec3 swirl(vec3 p, float t) {
  return 0.5 * vec3(
    sin(p.y * 1.7 + t) + sin(p.z * 2.9 - t * 0.6),
    sin(p.z * 1.9 + t * 0.8) + sin(p.x * 2.6 + t * 0.4),
    sin(p.x * 1.6 - t * 0.7) + sin(p.y * 2.3 + t * 0.9));
}

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec4 P = texelFetch(uPos, c, 0);
  vec4 V = texelFetch(uVel, c, 0);
  vec3 pos = P.xyz, vel = V.xyz;
  float glow = P.w, scatter = V.w;

  vec3 base = texelFetch(uTarget, c, 0).xyz;
  // water: rings travel out across the wave sheet
  float rr = length(base.xz);
  base.y += sin(rr * 8.0 - uTime * 2.6) * 0.085 * max(0.0, 1.35 - rr) * uWave;
  vec3 rel = uRot * (base * uScale);
  vec3 outward = normalize(rel + 1e-4);
  // spread: blow the form apart across the screen, each particle along its own line
  vec2 fc = vec2(c);
  float h = hash(fc);
  vec2 jitter = vec2(hash(fc + 1.3), hash(fc + 7.1)) - 0.5;
  vec2 sc = vec2(dot(rel, uCamR), dot(rel, uCamU));
  vec2 blown = sc * uSpread * (1.5 + h * 3.5) + jitter * uSpread * (2.0 + h * 3.0) * uHalf.y;
  rel += uCamR * blown.x + uCamU * blown.y;
  vec3 tgt = uOffset + rel;
  // a few floaters hover loosely around the form (a living edge, like dust in light)
  float loose = step(hash(fc + 21.3), 0.006);
  vec3 lr = normalize(vec3(hash(fc + 31.7), hash(fc + 33.9), hash(fc + 35.3)) - 0.5 + 1e-4);
  tgt += (outward * 0.7 + lr * 0.6) * loose * (0.08 + 0.2 * hash(fc + 23.1)) * max(uScale.y, 0.3);

  // where am I on screen?
  vec4 clip = uViewProj * vec4(pos, 1.0);
  vec2 ndc = clip.xy / max(clip.w, 1e-3);

  // the liquid carries me
  vec2 fv = texture(uFluid, ndc * 0.5 + 0.5).xy * uFluidToNdc * uHalf;
  float fs = length(fv);
  vec3 flowW = uCamR * fv.x + uCamU * fv.y;
  vel += (flowW * 1.1 - vel) * clamp(fs * 0.5, 0.0, 0.8) * min(1.0, uDt * 6.0);

  // and the cursor makes a little room
  vec2 d = (ndc - uMouse) * vec2(uAspect, 1.0);
  float l = length(d);
  float m = (1.0 - smoothstep(0.02, 0.2, l)) * uActive;
  vec2 away = d / max(l, 1e-4);
  vel += (uCamR * away.x + uCamU * away.y) * m * 4.0 * uDt * uHalf.y;

  // burst (on a change of shape, and now and then): the form flashes and a spray of its outer particles shoots out
  // like sparks — one kick, the spring eased off for a moment, then they are pulled home
  float rim = smoothstep(0.6, 1.1, length(base));
  float spray = step(hash(fc + 3.7), 0.015 + 0.04 * rim);
  vec3 rnd = normalize(vec3(hash(fc + 11.1), hash(fc + 12.7), hash(fc + 14.3)) - 0.5 + 1e-4);
  vel += normalize(outward * 0.8 + rnd * 0.6) * (2.0 + 3.5 * hash(fc + 5.9)) * max(uScale.y, 0.3) * uKick * spray;

  float k = uK * (1.0 - 0.82 * scatter) * mix(1.0, 0.16, loose);
  vel += (tgt - pos) * k * uDt;
  vel += swirl(pos * 1.4 / max(uScale.y, 0.3), uTime * 0.5) * uFlow * max(uScale.y, 0.3) * (1.0 + 2.0 * uSpread + 1.5 * loose) * uDt;
  vel *= exp(-uDamp * uDt);
  float sp = length(vel);
  vel *= min(1.0, 12.0 / max(sp, 1e-4));
  pos += vel * uDt;

  scatter = max(max(scatter - uDt * 1.8, clamp(fs * 0.22 + m * 0.3, 0.0, 1.0)), uKick * spray * 0.6);
  float g = clamp(sp * 0.2 + scatter * 0.75 + uFlash * (0.75 + 0.25 * h), 0.0, 1.0);
  glow += (g - glow) * min(1.0, uDt * (g > glow ? 14.0 : 2.5));

  oPos = vec4(pos, glow);
  oVel = vec4(vel, scatter);
}`;

const DRAW_VERT = `#version 300 es
in vec4 aColor; // rgb + size seed
in vec3 aTint;  // the logo's own colour at this particle's spot
uniform sampler2D uPos;
uniform int uW;
uniform mat4 uViewProj;
uniform float uPx, uKeep, uTint, uMaxPx, uTime;
uniform vec4 uCore; // the form's centre (world) + radius: a soft light inside it
uniform vec3 uEye;
out vec3 vColor;
out float vGlow;
out float vVis;
out float vSpark;
void main() {
  // uKeep < 1 thins the cloud (ambient dust): particles above the threshold fade out
  float h = fract(sin(float(gl_VertexID) * 12.9898) * 43758.5453);
  vVis = 1.0 - smoothstep(uKeep - 0.03, uKeep + 0.03, h);
  // glitter: one particle in seven catches the light now and then
  float sh = fract(sin(float(gl_VertexID) * 78.233) * 43758.5453);
  vSpark = sh < 0.14 ? pow(max(0.0, sin(uTime * (1.2 + sh * 14.0) + sh * 90.0)), 28.0) : 0.0;
  if (vVis < 0.004) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }
  vec4 P = texelFetch(uPos, ivec2(gl_VertexID % uW, gl_VertexID / uW), 0);
  gl_Position = uViewProj * vec4(P.xyz, 1.0);
  float depth = max(0.2, length(P.xyz - uEye));
  gl_PointSize = clamp(uPx * (0.7 + aColor.w * 0.6) * (1.0 + P.w * 0.22) / depth, 1.0, uMaxPx);
  vColor = mix(aColor.rgb, aTint, uTint);
  // lit from within: beads near the centre of the form warm toward magenta (kept saturated, never white)
  float core = exp(-pow(length(P.xyz - uCore.xyz) / max(uCore.w, 1e-3), 2.0) * 2.2);
  vColor = mix(vColor, vec3(0.86, 0.36, 0.92), core * 0.22);
  vGlow = P.w;
}`;

const DRAW_FRAG = `#version 300 es
precision mediump float;
in vec3 vColor;
in float vGlow;
in float vVis;
in float vSpark;
uniform float uAlpha;
out vec4 outColor;
// a small glossy bead with a soft edge; drawn slightly additive, so dense parts of the form glow a little without
// washing out to white
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(c, c);
  if (r2 > 1.0) discard;
  float r = sqrt(r2);
  vec3 n = vec3(c.x, -c.y, sqrt(1.0 - r2));
  vec3 L = normalize(vec3(-0.45, 0.7, 0.6));
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0), 40.0);
  float rim = pow(1.0 - n.z, 2.0);
  vec3 col = vColor * (0.5 + 0.5 * diff) + vec3(0.5, 0.4, 1.0) * rim * 0.18 + vec3(spec * 0.45);
  // glow → a bright magenta flash that keeps the shading (lifted, not flattened)
  col = mix(col, vec3(0.95, 0.55, 0.98), vGlow * 0.4) + vec3(0.18, 0.06, 0.16) * vGlow * (0.5 + 0.5 * diff);
  col += vec3(1.0, 0.92, 1.0) * vSpark * (1.0 - r) * 1.1;
  float a = (1.0 - smoothstep(0.42, 1.0, r)) * uAlpha * vVis;
  outColor = vec4(min(col, vec3(1.0)) * a, a * 0.9);
}`;

const PALETTE: [number, number, number, number][] = [
  // r, g, b, weight — deep violet, magenta and lilac glitter, a touch of brand blue, a rare white
  [0.5, 0.24, 0.9, 0.32],
  [0.68, 0.22, 0.86, 0.25],
  [0.74, 0.44, 0.94, 0.16],
  [0.36, 0.16, 0.8, 0.14],
  [0.2, 0.5, 0.94, 0.08],
  [0.95, 0.9, 1.0, 0.03],
];

// ---------------------------------------------------------------- shapes, ~unit radius, centred

type Gen = (n: number, r: () => number) => Float32Array;

const sphere: Gen = (n, r) => {
  const out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const z = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - z * z), rad = 1.0 + (r() - 0.5) * 0.035;
    out.set([s * Math.cos(a) * rad, z * rad, s * Math.sin(a) * rad, 1], i * 4);
  }
  return out;
};

const cube: Gen = (n, r) => {
  const h = 0.78, round = 0.2, inner = h - round;
  const out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const face = Math.floor(r() * 6), u = (r() * 2 - 1) * h, v = (r() * 2 - 1) * h, s = face % 2 ? -h : h;
    const p = face < 2 ? [s, u, v] : face < 4 ? [u, s, v] : [u, v, s];
    const q = p.map((x) => Math.max(-inner, Math.min(inner, x!)));
    const d = [p[0]! - q[0]!, p[1]! - q[1]!, p[2]! - q[2]!];
    const l = Math.hypot(d[0]!, d[1]!, d[2]!) || 1;
    out.set([q[0]! + (d[0]! / l) * round, q[1]! + (d[1]! / l) * round, q[2]! + (d[2]! / l) * round, 1], i * 4);
  }
  return out;
};

const knotShape: Gen = (n, r) => {
  const out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const { p } = onTube(r() * Math.PI * 2, r() * Math.PI * 2, 0.24);
    out.set([p[0] * 0.86, p[1] * 0.86, p[2] * 0.86, 1], i * 4);
  }
  return out;
};

/** play button: a triangular prism pointing right, faces + walls by area */
const play: Gen = (n, r) => {
  const R = 1.0, depth = 0.46;
  const pts = [0, 1, 2].map((k) => [Math.cos((k * 2 * Math.PI) / 3) * R + 0.08, Math.sin((k * 2 * Math.PI) / 3) * R] as const);
  const faceArea = ((3 * Math.sqrt(3)) / 4) * R * R, wallArea = 3 * Math.sqrt(3) * R * depth;
  const out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    if (r() < (2 * faceArea) / (2 * faceArea + wallArea)) {
      let a = r(), b = r();
      if (a + b > 1) [a, b] = [1 - a, 1 - b];
      const [p0, p1, p2] = pts;
      out.set([p0![0] + a * (p1![0] - p0![0]) + b * (p2![0] - p0![0]), p0![1] + a * (p1![1] - p0![1]) + b * (p2![1] - p0![1]), (r() < 0.5 ? -0.5 : 0.5) * depth, 1], i * 4);
    } else {
      const k = Math.floor(r() * 3), t = r(), a = pts[k]!, b = pts[(k + 1) % 3]!;
      out.set([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (r() - 0.5) * depth, 1], i * 4);
    }
  }
  return out;
};

/** ambient dust: a unit box (scaled to the view by the pose) */
const dust: Gen = (n, r) => {
  const out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) out.set([r() * 2 - 1, r() * 2 - 1, r() * 2 - 1, 1], i * 4);
  return out;
};

/** a rippling water sheet: rings on a disc, seen at an angle */
const wave: Gen = (n, r) => {
  const out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const rad = Math.sqrt(r()) * 1.25, a = r() * Math.PI * 2;
    const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
    out.set([x, Math.sin(rad * 7) * 0.09 * (1.3 - rad), z, 1], i * 4);
  }
  return out;
};

/** a ring in the screen plane — the hole the camera flies through */
const ring: Gen = (n, r) => {
  const out = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    const u = r() * Math.PI * 2, v = r() * Math.PI * 2, tube = 0.3 * Math.sqrt(0.55 + 0.45 * r());
    const k = 1 + tube * Math.cos(v);
    out.set([k * Math.cos(u), k * Math.sin(u), tube * Math.sin(v), 1], i * 4);
  }
  return out;
};

const GENERATORS: Record<(typeof SHAPES)[number], Gen> = { sphere, cube, knot: knotShape, play, dust, wave, ring };

/** The brand mark as particles: sample the coloured pixels of the official logo artwork (the wordmark is black, so
 *  colour alone isolates the mark — nothing is redrawn), extrude it a little, and keep each spot's own colour.
 *  Returns unit-height positions and per-particle tints. */
export function sampleMark(img: ImageData, n: number) {
  const { width: w, height: h, data } = img;
  const inside = new Uint8Array(w * h);
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, r = data[i]!, g = data[i + 1]!, b = data[i + 2]!, a = data[i + 3]!;
      if (a > 110 && Math.max(r, g, b) - Math.min(r, g, b) > 70) {
        inside[y * w + x] = 1;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  // the mark is the leftmost coloured run of columns ("elevate" in the wordmark is coloured too, further right)
  let runEnd = minX, gap = 0;
  for (let x = minX; x <= maxX && gap <= 4; x++) {
    let any = false;
    for (let y = minY; y <= maxY && !any; y++) any = inside[y * w + x] === 1;
    if (any) {
      runEnd = x;
      gap = 0;
    } else gap++;
  }
  maxX = runEnd;
  minY = h;
  maxY = 0;
  for (let y = 0; y < h; y++)
    for (let x = minX; x <= maxX; x++)
      if (inside[y * w + x]) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
  const cells: number[] = [], edges: number[] = [];
  for (let y = minY; y <= maxY; y++)
    for (let x = minX; x <= maxX; x++) {
      if (!inside[y * w + x]) continue;
      cells.push(y * w + x);
      if (!inside[y * w + x - 1] || !inside[y * w + x + 1] || !inside[(y - 1) * w + x] || !inside[(y + 1) * w + x]) edges.push(y * w + x);
    }
  const r = rng(31);
  const pos = new Float32Array(n * 4), tint = new Float32Array(n * 3);
  if (!cells.length) return null;
  const scale = 2 / (maxY - minY + 1), cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, depth = 0.16;
  for (let k = 0; k < n; k++) {
    const onEdge = edges.length > 0 && r() < 0.3;
    const list = onEdge ? edges : cells;
    const c = list[Math.floor(r() * list.length)]!;
    const x = (c % w) + r() - 0.5, y = Math.floor(c / w) + r() - 0.5;
    const z = onEdge ? (r() * 2 - 1) * depth : (r() < 0.5 ? -1 : 1) * depth;
    pos.set([(x - cx) * scale, -(y - cy) * scale, z, 1], k * 4);
    const i = c * 4;
    tint.set([data[i]! / 255, data[i + 1]! / 255, data[i + 2]! / 255], k * 3);
  }
  return { pos, tint };
}

// ---------------------------------------------------------------- engine

export interface FigureStep {
  dt: number;
  time: number;
  kMul: number;
  spread: number;
  kick: number; // 1 on the step a burst starts (the spray), else 0
  flash: number; // 0..1, the burst's light
  wave: number; // 0..1, animate the wave sheet
  camR: [number, number, number];
  camU: [number, number, number];
  rot: Float32Array; // mat3, column-major
  offset: [number, number, number];
  scale: [number, number, number];
  half: [number, number];
  viewProj: Float32Array;
  aspect: number;
  mouse: [number, number];
  active: number;
  fluid: WebGLTexture;
  fluidToNdc: [number, number];
}

export class Figure {
  readonly size: number;
  readonly count: number;
  private gl: GL;
  private fmt: number;
  private sim: WebGLProgram;
  private draw: WebGLProgram;
  private us;
  private ud;
  private states: { pos: WebGLTexture; vel: WebGLTexture; fb: WebGLFramebuffer }[];
  private read = 0;
  private target: WebGLTexture;
  private vao: WebGLVertexArrayObject;
  private colorBuf: WebGLBuffer;
  private tintBuf: WebGLBuffer;
  private shapes = new Map<ShapeName, Float32Array>();
  private queue: ShapeName[] = [];
  current: ShapeName | null = null;
  changedAt = 0;

  constructor(gl: GL, fullFormat: number, size: number) {
    this.gl = gl;
    this.fmt = fullFormat;
    this.size = size;
    this.count = size * size;
    const sim = program(gl, FULLSCREEN_VERT, SIM);
    const draw = program(gl, DRAW_VERT, DRAW_FRAG);
    if (!sim || !draw) throw new Error("figure shader");
    this.sim = sim;
    this.draw = draw;
    this.us = locations(gl, sim, ["uPos", "uVel", "uTarget", "uFluid", "uDt", "uTime", "uK", "uDamp", "uFlow", "uSpread", "uActive", "uAspect", "uWave", "uKick", "uFlash", "uRot", "uOffset", "uScale", "uCamR", "uCamU", "uHalf", "uFluidToNdc", "uViewProj", "uMouse"] as const);
    this.ud = locations(gl, draw, ["uPos", "uW", "uViewProj", "uPx", "uKeep", "uTint", "uMaxPx", "uEye", "uAlpha", "uTime", "uCore"] as const);

    const N = this.count, r = rng(11);
    // start as a loose swarm far behind, so the first thing you see is it gathering
    const start = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) {
      const z = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - z * z), d = 3 + r() * 5;
      start.set([s * Math.cos(a) * d * 1.4, z * d * 0.8, -Math.abs(s * Math.sin(a)) * d - 2, 0], i * 4);
    }
    const still = new Float32Array(N * 4);
    this.states = [0, 1].map(() => {
      const pos = texture(gl, size, size, fullFormat, gl.NEAREST, start);
      const vel = texture(gl, size, size, fullFormat, gl.NEAREST, still);
      const fb = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pos, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, vel, 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      return { pos, vel, fb };
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.target = texture(gl, size, size, fullFormat, gl.NEAREST, null);

    const colors = new Float32Array(N * 4);
    const total = PALETTE.reduce((a, c) => a + c[3], 0);
    for (let i = 0; i < N; i++) {
      let pick = r() * total, k = 0;
      while (pick > PALETTE[k]![3] && k < PALETTE.length - 1) pick -= PALETTE[k++]![3];
      const c = PALETTE[k]!;
      colors.set([c[0], c[1], c[2], r()], i * 4);
    }
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.colorBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuf);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(draw, "aColor");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
    // tints default to the palette colour, so mixing toward them is a no-op until the logo arrives
    const tints = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) tints.set([colors[i * 4]!, colors[i * 4 + 1]!, colors[i * 4 + 2]!], i * 3);
    this.tintBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tintBuf);
    gl.bufferData(gl.ARRAY_BUFFER, tints, gl.STATIC_DRAW);
    const tloc = gl.getAttribLocation(draw, "aTint");
    gl.enableVertexAttribArray(tloc);
    gl.vertexAttribPointer(tloc, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  /** Add a shape made elsewhere (the logo), optionally with per-particle tints. */
  setCustom(name: ShapeName, data: Float32Array, tint?: Float32Array) {
    this.shapes.set(name, data);
    if (tint) {
      const gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.tintBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, tint);
    }
    if (this.current === name) this.current = null; // re-upload on next setShape
  }
  has(name: ShapeName) {
    return this.shapes.has(name);
  }

  /** Build a shape now (if missing). */
  ensure(name: ShapeName): Float32Array {
    if (!this.shapes.has(name)) {
      if (name === "logo") return this.ensure("sphere"); // until the artwork has been sampled
      this.shapes.set(name, GENERATORS[name](this.count, rng(20 + SHAPES.indexOf(name))));
    }
    return this.shapes.get(name)!;
  }
  /** Queue shapes to build when the browser is idle. */
  prebuild(names: readonly (typeof SHAPES)[number][]) {
    this.queue.push(...names.filter((n) => !this.shapes.has(n)));
  }
  /** Build one queued shape; returns false when nothing is left. */
  buildNext() {
    const n = this.queue.shift();
    if (n) this.ensure(n);
    return this.queue.length > 0;
  }

  setShape(name: ShapeName, now: number) {
    if (name === this.current) return;
    if (name === "logo" && !this.shapes.has("logo")) return; // wait for the artwork
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.target);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.fmt, this.size, this.size, 0, gl.RGBA, gl.FLOAT, this.ensure(name));
    this.current = name;
    this.changedAt = now;
  }

  step(s: FigureStep) {
    const gl = this.gl, u = this.us;
    gl.useProgram(this.sim);
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.viewport(0, 0, this.size, this.size);
    gl.uniform1f(u.uDt, s.dt);
    gl.uniform1f(u.uTime, s.time);
    gl.uniform1f(u.uK, 38 * s.kMul);
    gl.uniform1f(u.uDamp, 7); // near-critical: forms settle smoothly instead of wobbling
    gl.uniform1f(u.uFlow, 1.1);
    gl.uniform1f(u.uSpread, s.spread);
    gl.uniform1f(u.uWave, s.wave);
    gl.uniform1f(u.uKick, s.kick);
    gl.uniform1f(u.uFlash, s.flash);
    gl.uniform3f(u.uCamR, ...s.camR);
    gl.uniform3f(u.uCamU, ...s.camU);
    gl.uniform1f(u.uActive, s.active);
    gl.uniform1f(u.uAspect, s.aspect);
    gl.uniformMatrix3fv(u.uRot, false, s.rot);
    gl.uniform3f(u.uOffset, ...s.offset);
    gl.uniform3f(u.uScale, ...s.scale);
    gl.uniform2f(u.uHalf, ...s.half);
    gl.uniform2f(u.uFluidToNdc, ...s.fluidToNdc);
    gl.uniformMatrix4fv(u.uViewProj, false, s.viewProj);
    gl.uniform2f(u.uMouse, ...s.mouse);
    const cur = this.states[this.read]!, next = this.states[1 - this.read]!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, next.fb);
    const bind = (unit: number, tex: WebGLTexture, loc: WebGLUniformLocation | null) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(loc, unit);
    };
    bind(0, cur.pos, u.uPos);
    bind(1, cur.vel, u.uVel);
    bind(2, this.target, u.uTarget);
    bind(3, s.fluid, u.uFluid);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.read = 1 - this.read;
  }

  /** keep: fraction of particles drawn (1 = all; ambient dust thins it out); tint: 0..1 toward the logo colours */
  render(viewProj: Float32Array, eye: [number, number, number], px: number, alpha: number, keep = 1, tint = 0, maxPx = 40, time = 0, core: [number, number, number, number] = [0, 0, 0, 0]) {
    const gl = this.gl, u = this.ud;
    gl.useProgram(this.draw);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.states[this.read]!.pos);
    gl.uniform1i(u.uPos, 0);
    gl.uniform1i(u.uW, this.size);
    gl.uniformMatrix4fv(u.uViewProj, false, viewProj);
    gl.uniform1f(u.uPx, px);
    gl.uniform3f(u.uEye, ...eye);
    gl.uniform1f(u.uTint, tint);
    gl.uniform1f(u.uMaxPx, maxPx);
    gl.uniform1f(u.uAlpha, alpha);
    gl.uniform1f(u.uKeep, keep);
    gl.uniform1f(u.uTime, time);
    gl.uniform4f(u.uCore, ...core);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.POINTS, 0, this.count);
    gl.bindVertexArray(null);
  }

  dispose() {
    const gl = this.gl;
    this.states.forEach((s) => {
      gl.deleteTexture(s.pos);
      gl.deleteTexture(s.vel);
      gl.deleteFramebuffer(s.fb);
    });
    gl.deleteTexture(this.target);
    gl.deleteBuffer(this.colorBuf);
    gl.deleteBuffer(this.tintBuf);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.sim);
    gl.deleteProgram(this.draw);
  }
}
