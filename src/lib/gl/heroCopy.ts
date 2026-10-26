import { FULLSCREEN_VERT, locations, program } from "./core";

/* THE HERO COPY ON THE GPU. The hero's copy blocks warp in and out — a liquid displacement, a colour split and a
   blur. Done with an SVG filter on live text, that means re-rendering big type through a CPU filter every frame
   (the slow path on Safari / iOS). Instead each block is rasterised once — every word drawn exactly where the
   browser laid it out — into a texture, and the warp runs in a shader. The DOM copy stays the source of truth: it
   is shown whenever a block is at rest, so what you read is always the real text; the texture only plays the
   transitions (and follows the sentence decode, letter by letter). The same canvas draws the white halo of the ring
   fly-through. Mirrors the `.hero-block` look in globals.css (text-shadow, colour split) — change both together. */

const MARGIN = 64; // CSS px around the content: room for the shadow, the displacement and the blur
const SHADOW_SCALE = 0.5; // the soft shadow is blurred anyway: rasterise it at half a pixel per CSS px
const SHADOW = { dy: 2, blur: 30, color: "rgb(30 10 70 / 0.35)" }; // = the last `.hero-block` text-shadow

const VERT = `#version 300 es
uniform vec4 uQuad;   // x, y, w, h in stage CSS px (before the slide)
uniform vec2 uView;   // stage size, CSS px
uniform float uTx;    // the slide, CSS px
out vec2 vLocal;
void main() {
  vec2 c = vec2(gl_VertexID & 1, (gl_VertexID >> 1) & 1);
  vLocal = c * uQuad.zw;
  vec2 p = uQuad.xy + vLocal + vec2(uTx, 0.0);
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vLocal;
out vec4 o;
uniform sampler2D uGlyph, uShadow;
uniform vec2 uSize, uFreq, uSeed;
uniform vec4 uPill, uPillColor;
uniform float uRadius, uScale, uSplit, uSA, uAlpha, uPx;
const vec3 CYAN = vec3(64.0, 255.0, 214.0) / 255.0;
const vec3 MAGENTA = vec3(255.0, 72.0, 196.0) / 255.0;
const vec4 SHADE = vec4(30.0 / 255.0, 10.0 / 255.0, 70.0 / 255.0, 1.0) * 0.35;

vec2 grad(vec2 i) {
  float a = fract(sin(dot(i, vec2(127.1, 311.7))) * 43758.5453) * 6.2831853;
  return vec2(cos(a), sin(a));
}
float gnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  float a = dot(grad(i), f), b = dot(grad(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(grad(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), d = dot(grad(i + 1.0), f - 1.0);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
bool outside(vec2 uv) { return any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0))); }
vec4 glyph(vec2 q) {
  vec2 uv = q / uSize;
  return outside(uv) ? vec4(0.0) : textureLod(uGlyph, uv, 0.0);
}
float pill(vec2 q) {
  vec2 h = uPill.zw * 0.5;
  vec2 d = abs(q - uPill.xy - h) - h + uRadius;
  float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - uRadius;
  return clamp(0.5 - dist * uPx, 0.0, 1.0);
}
// what the block paints at q: pill, soft shadow, magenta + cyan copies of the glyphs, the glyphs (= the CSS order)
vec4 layer(vec2 q) {
  vec4 col = uPillColor * pill(q);
  vec2 uv = q / uSize;
  float s = outside(uv) ? 0.0 : texture(uShadow, uv).a;
  col = SHADE * s + col * (1.0 - SHADE.a * s);
  float m = glyph(q - vec2(uSplit, 0.0)).a * uSA;
  col = vec4(MAGENTA * m, m) + col * (1.0 - m);
  float c = glyph(q + vec2(uSplit, 0.0)).a * uSA;
  col = vec4(CYAN * c, c) + col * (1.0 - c);
  vec4 g = glyph(q);
  return g + col * (1.0 - g.a);
}
void main() {
  vec2 p = vLocal;
  // two-octave fractal noise per channel, as feTurbulence(fractalNoise) → feDisplacementMap: p + scale·(C − ½)
  vec2 f = p * uFreq + uSeed;
  vec2 n = vec2(gnoise(f), gnoise(f + vec2(31.7, 17.3))) + 0.5 * vec2(gnoise(f * 2.0 + 7.1), gnoise(f * 2.0 + vec2(53.9, 3.4)));
  o = layer(p + n * 0.5 * uScale) * uAlpha;
}`;

// then the blur, as in the filter chain (displace → blur): a gaussian over a golden-angle spiral of taps, read from
// the displaced block (rendered upside down into an offscreen target, mipmapped so the taps don't grain)
const BLUR = `#version 300 es
precision highp float;
in vec2 vLocal;
out vec4 o;
uniform sampler2D uSrc;
uniform vec2 uSize, uFit;
uniform float uBlur, uLod, uAlpha;
vec4 at(vec2 p) { return textureLod(uSrc, vec2(p.x / uSize.x, 1.0 - p.y / uSize.y) * uFit, uLod); }
void main() {
  vec4 acc = vec4(0.0);
  float ws = 0.0;
  for (int i = 0; i < 16; i++) {
    float fi = float(i);
    float r = sqrt((fi + 0.5) / 16.0) * 2.4;
    float a = fi * 2.39996;
    float w = exp(-0.5 * r * r);
    acc += at(vLocal + vec2(cos(a), sin(a)) * r * uBlur) * w;
    ws += w;
  }
  o = acc / ws * uAlpha;
}`;

// the ring fly-through: paper inside, a white glow at the rim, fading out (= `.hero-flash` in globals.css)
const HALO = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform vec2 uView, uCenter;
uniform float uHole;
uniform vec3 uPaper;
void main() {
  float r = length(vec2(vUv.x, 1.0 - vUv.y) * uView - uCenter), h = uHole;
  vec4 paper = vec4(uPaper, 1.0), white = vec4(0.95);
  o = r <= 0.7 * h ? paper : r <= 0.92 * h ? mix(paper, white, (r - 0.7 * h) / (0.22 * h)) : mix(white, vec4(0.0), clamp((r - 0.92 * h) / (0.43 * h), 0.0, 1.0));
}`;

interface Item {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  font: string;
  color: string;
  base: number; // baseline, stage CSS px
  sx: number; // horizontal fit to the laid-out width (letter-spacing)
  dc?: { el: HTMLElement; font: string; color: string; base: number }; // a decode letter and its scramble glyph
}

interface Snap {
  tex: WebGLTexture;
  shadow: WebGLTexture;
  x: number;
  y: number;
  w: number;
  h: number;
  items: Item[];
  pill: [number, number, number, number, number] | null;
  pillColor: [number, number, number, number];
  dcBox: [number, number, number, number] | null;
  fresh: boolean;
  letters: boolean; // the decode letters changed since the texture was drawn
}

export interface CopyDraw {
  i: number;
  tx: number; // slide, CSS px
  alpha: number;
  warp: number; // displacement scale (feDisplacementMap scale)
  freq: [number, number];
  seed: number;
  split: number;
  sa: number;
  blur: number;
}

export class HeroCopyGL {
  private gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private blurProg: WebGLProgram;
  private haloProg: WebGLProgram;
  private u;
  private bu;
  private hu;
  private fbo: { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number } | null = null;
  private snaps: (Snap | null)[];
  private S = 1;
  private W = 1;
  private H = 1;
  private paint = document.createElement("canvas");
  private region = document.createElement("canvas");
  private probe: CanvasRenderingContext2D;
  private drew = false;
  private warmed = false;
  paper: [number, number, number] = [0.965, 0.953, 0.996];

  constructor(private canvas: HTMLCanvasElement, count: number) {
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) throw new Error("webgl2");
    const prog = program(gl, VERT, FRAG), blurProg = program(gl, VERT, BLUR), haloProg = program(gl, FULLSCREEN_VERT, HALO);
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    if (!prog || !blurProg || !haloProg || !probe) throw new Error("hero copy");
    this.gl = gl;
    this.prog = prog;
    this.blurProg = blurProg;
    this.haloProg = haloProg;
    this.probe = probe;
    this.u = locations(gl, prog, ["uQuad", "uView", "uTx", "uGlyph", "uShadow", "uSize", "uFreq", "uSeed", "uPill", "uPillColor", "uRadius", "uScale", "uSplit", "uSA", "uAlpha", "uPx"] as const);
    this.bu = locations(gl, blurProg, ["uQuad", "uView", "uTx", "uSrc", "uSize", "uFit", "uBlur", "uLod", "uAlpha"] as const);
    this.hu = locations(gl, haloProg, ["uView", "uCenter", "uHole", "uPaper"] as const);
    this.snaps = Array.from({ length: count }, () => null);
  }

  /** CSS colour → premultiplied RGBA 0..1 (any syntax the browser understands) */
  rgba(css: string): [number, number, number, number] {
    const g = this.probe;
    g.clearRect(0, 0, 1, 1);
    g.fillStyle = "#000";
    g.fillStyle = css;
    g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    const a = d[3]! / 255;
    return [(d[0]! / 255) * a, (d[1]! / 255) * a, (d[2]! / 255) * a, a];
  }

  resize(w: number, h: number) {
    this.S = Math.min(window.devicePixelRatio || 1, 2);
    this.W = Math.max(1, w);
    this.H = Math.max(1, h);
    this.canvas.width = Math.round(this.W * this.S);
    this.canvas.height = Math.round(this.H * this.S);
    this.snaps.forEach((s) => s && (s.fresh = false));
    this.drew = true; // the resize cleared it; make sure the next empty frame is clean too
  }

  fresh(i: number) {
    return Boolean(this.snaps[i]?.fresh);
  }
  stale(i?: number) {
    if (i === undefined) this.snaps.forEach((s) => s && (s.fresh = false));
    else if (this.snaps[i]) this.snaps[i]!.fresh = false;
  }
  letters(i: number) {
    if (this.snaps[i]) this.snaps[i]!.letters = true;
  }

  /** Measure block `i` as laid out (it may be hidden, and slid by `tx` CSS px) and rasterise it. Reads layout.
   *  Positions are taken relative to the blocks' wrapper (which covers the stage like this canvas), so a transform
   *  on the wrapper — the intro's slide-in — never ends up baked into the texture. */
  snap(i: number, block: HTMLElement, tx: number) {
    const o = (block.parentElement ?? this.canvas).getBoundingClientRect();
    const ox = o.left + tx, oy = o.top;
    const items: Item[] = [];
    const g = this.probe;
    const range = document.createRange();
    const css = new Map<Element, { font: string; color: string; upper: boolean }>();
    const style = (el: Element) => {
      let s = css.get(el);
      if (!s) {
        const c = getComputedStyle(el);
        s = { font: `${c.fontStyle} ${c.fontWeight} ${c.fontSize} ${c.fontFamily}`, color: c.color, upper: c.textTransform === "uppercase" };
        css.set(el, s);
      }
      return s;
    };
    const metrics = (font: string, text: string) => {
      g.font = font;
      const m = g.measureText(text);
      const a = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent, d = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
      return { a, d, w: m.width };
    };
    const push = (r: DOMRect, text: string, font: string, color: string, fit: boolean) => {
      const m = metrics(font, text);
      const sx = fit && m.w > 0 ? r.width / m.w : 1;
      items.push({ x: r.left - ox, y: r.top - oy, w: r.width, h: r.height, text, font, color, base: r.top - oy + (r.height - (m.a + m.d)) / 2 + m.a, sx: sx > 0.8 && sx < 1.25 ? sx : 1 });
      return items[items.length - 1]!;
    };

    let violet = "";
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n as Text, el = t.parentElement;
      if (!el) continue;
      const st = style(el);
      if (el.classList.contains("dc")) {
        // a decode letter: its own box; the scramble glyph sits on it (".label-mono .dc-s::after": top 0, line-height inherit)
        const r = el.getBoundingClientRect();
        if (!r.width) continue;
        const word = el.parentElement ?? el, ws = style(word);
        const it = push(r, ws.upper ? t.data.toUpperCase() : t.data, st.font, ws.color, false);
        if (!violet) violet = getComputedStyle(document.documentElement).getPropertyValue("--color-violet").trim() || "#6d3fd6";
        const c = getComputedStyle(el);
        const lh = parseFloat(c.lineHeight) || r.height;
        const gFont = `normal 400 ${c.fontSize} ${c.fontFamily}`;
        const m = metrics(gFont, "M");
        it.dc = { el, font: gFont, color: violet, base: r.top - oy + (lh - (m.a + m.d)) / 2 + m.a };
        continue;
      }
      const re = /\S+/g;
      for (let m = re.exec(t.data); m; m = re.exec(t.data)) {
        range.setStart(t, m.index);
        range.setEnd(t, m.index + m[0].length);
        const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0);
        const word = st.upper ? m[0].toUpperCase() : m[0];
        if (rects.length === 1) push(rects[0]!, word, st.font, st.color, true);
        else if (rects.length > 1)
          // broken across lines: letter by letter
          for (let k = 0; k < m[0].length; k++) {
            range.setStart(t, m.index + k);
            range.setEnd(t, m.index + k + 1);
            const r = range.getClientRects()[0];
            if (r && r.width > 0) push(r, word[k]!, st.font, st.color, false);
          }
      }
    }
    range.detach();

    const pillEl = block.querySelector<HTMLElement>(".tag-pill");
    let pill: Snap["pill"] = null, pillColor: Snap["pillColor"] = [0, 0, 0, 0];
    if (pillEl) {
      const r = pillEl.getBoundingClientRect(), c = getComputedStyle(pillEl);
      if (r.width) {
        pill = [r.left - ox, r.top - oy, r.width, r.height, Math.min(parseFloat(c.borderTopLeftRadius) || 0, r.height / 2)];
        pillColor = this.rgba(c.backgroundColor);
      }
    }

    // the texture covers the content plus a margin
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const grow = (x: number, y: number, w: number, h: number) => {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x + w);
      y1 = Math.max(y1, y + h);
    };
    items.forEach((it) => grow(it.x, it.y, it.w, it.h));
    if (pill) grow(pill[0], pill[1], pill[2], pill[3]);
    if (!Number.isFinite(x0)) return false;
    x0 = Math.floor(x0 - MARGIN);
    y0 = Math.floor(y0 - MARGIN);
    const w = Math.ceil(x1 + MARGIN - x0), h = Math.ceil(y1 + MARGIN - y0);
    const dcs = items.filter((it) => it.dc);
    let dcBox: Snap["dcBox"] = null;
    if (dcs.length) {
      const bx = Math.min(...dcs.map((d) => d.x)) - 2, by = Math.min(...dcs.map((d) => d.y)) - 2;
      dcBox = [bx, by, Math.max(...dcs.map((d) => d.x + d.w)) + 2 - bx, Math.max(...dcs.map((d) => d.y + d.h)) + 2 - by];
    }

    const gl = this.gl;
    const prev = this.snaps[i];
    const snap: Snap = {
      tex: prev?.tex ?? gl.createTexture()!,
      shadow: prev?.shadow ?? gl.createTexture()!,
      x: x0,
      y: y0,
      w,
      h,
      items,
      pill: pill && [pill[0] - x0, pill[1] - y0, pill[2], pill[3], pill[4]],
      pillColor,
      dcBox,
      fresh: true,
      letters: false,
    };
    this.snaps[i] = snap;

    // glyphs, crisp
    const S = this.S;
    const c = this.paint;
    c.width = Math.ceil(w * S);
    c.height = Math.ceil(h * S);
    const p = c.getContext("2d")!;
    p.setTransform(S, 0, 0, S, -x0 * S, -y0 * S);
    items.forEach((it) => this.drawItem(p, it));
    this.upload(snap.tex, c, true);

    // the soft shadow, from the same glyphs, at low resolution
    const sw = Math.max(1, Math.ceil(w * SHADOW_SCALE)), sh = Math.max(1, Math.ceil(h * SHADOW_SCALE));
    c.width = sw;
    c.height = sh;
    const q = c.getContext("2d")!;
    q.setTransform(SHADOW_SCALE, 0, 0, SHADOW_SCALE, -x0 * SHADOW_SCALE, -y0 * SHADOW_SCALE);
    // (glyphs drawn in the shadow colour with their shadow: under the opaque type only the shadow shows)
    q.shadowColor = SHADOW.color;
    q.shadowBlur = SHADOW.blur * SHADOW_SCALE;
    q.shadowOffsetY = SHADOW.dy * SHADOW_SCALE;
    items.forEach((it) => this.drawItem(q, it, SHADOW.color));
    this.upload(snap.shadow, c, false);
    c.width = c.height = 1;
    return true;
  }

  private drawItem(g: CanvasRenderingContext2D, it: Item, fill?: string) {
    const scramble = it.dc && it.dc.el.classList.contains("dc-s");
    const text = scramble ? (it.dc!.el.dataset.g ?? "") : it.text;
    g.font = scramble ? it.dc!.font : it.font;
    g.fillStyle = fill ?? (scramble ? it.dc!.color : it.color);
    const base = scramble ? it.dc!.base : it.base;
    if (it.sx !== 1) {
      g.save();
      g.translate(it.x, base);
      g.scale(it.sx, 1);
      g.fillText(text, 0, 0);
      g.restore();
    } else g.fillText(text, it.x, base);
  }

  private upload(tex: WebGLTexture, src: HTMLCanvasElement, mips: boolean) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (mips) gl.generateMipmap(gl.TEXTURE_2D);
  }

  /** Redraw just the decode letters of block `i` (no layout reads — they never move). */
  private refresh(s: Snap) {
    s.letters = false;
    if (!s.dcBox) return;
    const S = this.S;
    const [bx, by, bw, bh] = s.dcBox;
    const tx = Math.max(0, Math.floor((bx - s.x) * S)), ty = Math.max(0, Math.floor((by - s.y) * S));
    const tw = Math.min(Math.ceil(s.w * S), Math.ceil((bx + bw - s.x) * S)) - tx, th = Math.min(Math.ceil(s.h * S), Math.ceil((by + bh - s.y) * S)) - ty;
    if (tw <= 0 || th <= 0) return;
    const rx = s.x + tx / S, ry = s.y + ty / S, rx1 = rx + tw / S, ry1 = ry + th / S;
    const c = this.region;
    c.width = tw;
    c.height = th;
    const g = c.getContext("2d")!;
    g.setTransform(S, 0, 0, S, -rx * S, -ry * S);
    for (const it of s.items) if (it.x < rx1 && it.x + it.w > rx && it.y < ry1 && it.y + it.h > ry) this.drawItem(g, it);
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, s.tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, tx, ty, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  /** Draw the blocks in transition and the halo; an empty frame clears once and then costs nothing. */
  render(list: CopyDraw[], halo: { r: number; x: number; y: number } | null) {
    const gl = this.gl;
    const todo = list.filter((d) => this.snaps[d.i]?.fresh && d.alpha > 0.002);
    if (!todo.length && !halo) {
      if (this.drew) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.drew = false;
        this.canvas.style.visibility = "hidden"; // nothing to show: out of compositing altogether
      }
      return;
    }
    if (!this.drew) this.canvas.style.visibility = "visible";
    this.drew = true;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    for (const d of todo) {
      const s = this.snaps[d.i]!;
      if (s.letters) this.refresh(s);
      // a blurred frame goes through an offscreen target (at half resolution once the blur hides it); otherwise the
      // displaced block goes straight to the screen
      const blur = d.blur >= 0.4;
      const F = blur && d.blur * this.S > 3 ? this.S / 2 : this.S;
      const fw = Math.ceil(s.w * F), fh = Math.ceil(s.h * F);
      const u = this.u;
      gl.useProgram(this.prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, s.tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, s.shadow);
      gl.uniform1i(u.uGlyph, 0);
      gl.uniform1i(u.uShadow, 1);
      gl.uniform2f(u.uSize, s.w, s.h);
      const pl = s.pill ?? [0, 0, 0, 0, 0];
      gl.uniform4f(u.uPill, pl[0], pl[1], pl[2], pl[3]);
      gl.uniform1f(u.uRadius, pl[4]);
      const pc = s.pill ? s.pillColor : [0, 0, 0, 0];
      gl.uniform4f(u.uPillColor, pc[0]!, pc[1]!, pc[2]!, pc[3]!);
      gl.uniform2f(u.uFreq, d.freq[0], d.freq[1]);
      gl.uniform2f(u.uSeed, d.seed * 17.31, d.seed * 9.17);
      gl.uniform1f(u.uScale, d.warp);
      gl.uniform1f(u.uSplit, d.split);
      gl.uniform1f(u.uSA, d.sa);
      if (!blur) {
        gl.uniform4f(u.uQuad, s.x, s.y, s.w, s.h);
        gl.uniform2f(u.uView, this.W, this.H);
        gl.uniform1f(u.uTx, Math.round(d.tx * this.S) / this.S); // on the pixel grid: as crisp as the DOM copy
        gl.uniform1f(u.uAlpha, d.alpha);
        gl.uniform1f(u.uPx, this.S);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        continue;
      }
      const t = this.target(fw, fh);
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
      gl.viewport(0, 0, fw, fh);
      gl.disable(gl.BLEND);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform4f(u.uQuad, 0, 0, s.w, s.h);
      gl.uniform2f(u.uView, s.w, s.h);
      gl.uniform1f(u.uTx, 0);
      gl.uniform1f(u.uAlpha, 1);
      gl.uniform1f(u.uPx, F);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.generateMipmap(gl.TEXTURE_2D);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.enable(gl.BLEND);
      const b = this.bu;
      gl.useProgram(this.blurProg);
      gl.uniform1i(b.uSrc, 0);
      gl.uniform4f(b.uQuad, s.x, s.y, s.w, s.h);
      gl.uniform2f(b.uView, this.W, this.H);
      gl.uniform1f(b.uTx, d.tx);
      gl.uniform2f(b.uSize, s.w, s.h);
      gl.uniform2f(b.uFit, fw / t.w, fh / t.h);
      gl.uniform1f(b.uBlur, d.blur);
      gl.uniform1f(b.uLod, Math.max(0, Math.log2(Math.max(1, d.blur * F * 0.9))));
      gl.uniform1f(b.uAlpha, d.alpha);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    if (halo && halo.r > 0.5) {
      const hu = this.hu;
      gl.useProgram(this.haloProg);
      gl.uniform2f(hu.uView, this.W, this.H);
      gl.uniform2f(hu.uCenter, halo.x, halo.y);
      gl.uniform1f(hu.uHole, halo.r);
      gl.uniform3f(hu.uPaper, ...this.paper);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    gl.disable(gl.BLEND);
  }

  /** Run every program once and size the offscreen target, between frames, so the first transition doesn't pay for
   *  pipeline compilation and allocation. Needs a snapshot (its textures stand in as inputs). */
  warm() {
    const s = this.snaps.find((x) => x?.fresh);
    if (this.warmed || !s) return;
    this.warmed = true;
    const gl = this.gl;
    const t = this.target(Math.ceil(s.w * this.S), Math.ceil(s.h * this.S));
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
    gl.viewport(0, 0, 2, 2);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, s.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, s.shadow);
    for (const p of [this.prog, this.blurProg, this.haloProg]) {
      gl.useProgram(p);
      gl.drawArrays(p === this.haloProg ? gl.TRIANGLES : gl.TRIANGLE_STRIP, 0, p === this.haloProg ? 3 : 4);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** The offscreen target for blurred frames (grows as needed, mipmapped) */
  private target(w: number, h: number) {
    const gl = this.gl;
    if (this.fbo && this.fbo.w >= w && this.fbo.h >= h) return this.fbo;
    const W = Math.max(w, this.fbo?.w ?? 0), H = Math.max(h, this.fbo?.h ?? 0);
    if (this.fbo) {
      gl.deleteFramebuffer(this.fbo.fb);
      gl.deleteTexture(this.fbo.tex);
    }
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texStorage2D(gl.TEXTURE_2D, Math.floor(Math.log2(Math.max(W, H))) + 1, gl.RGBA8, W, H);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    this.fbo = { fb, tex, w: W, h: H };
    return this.fbo;
  }

  dispose() {
    const gl = this.gl;
    this.snaps.forEach((s) => {
      if (!s) return;
      gl.deleteTexture(s.tex);
      gl.deleteTexture(s.shadow);
    });
    if (this.fbo) {
      gl.deleteFramebuffer(this.fbo.fb);
      gl.deleteTexture(this.fbo.tex);
    }
    gl.deleteProgram(this.prog);
    gl.deleteProgram(this.blurProg);
    gl.deleteProgram(this.haloProg);
    // (the context is kept: a remount gets the same canvas, and so the same context, back)
  }
}
