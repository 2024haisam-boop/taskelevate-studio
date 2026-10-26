import { FULLSCREEN_VERT, double, locations, program, target, freeTarget, type Double, type GL, type Target } from "./core";

/* Stable-fluids solver on the GPU (velocity, curl, vorticity confinement, divergence, Jacobi pressure, projection,
   semi-Lagrangian advection) with a dye layer. Velocity is in velocity-grid texels per second; points are uv
   (0..1, origin bottom-left). The studio layer feeds it the pointer and reads `velocity` / `dye` back. */

const HEAD = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform vec2 uTexel;
`;
const NEIGHBOURS = `
vec2 dl = vec2(uTexel.x, 0.0), db = vec2(0.0, uTexel.y);
`;

const SPLAT = `${HEAD}
uniform sampler2D uTarget;
uniform float uAspect, uRadius;
uniform vec2 uPoint;
uniform vec4 uValue;
void main() {
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  o = texture(uTarget, vUv) + uValue * exp(-dot(p, p) / uRadius);
}`;

const ADVECT = `${HEAD}
uniform sampler2D uVelocity, uSource;
uniform float uDt, uDissipation;
void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;
  o = texture(uSource, coord) / (1.0 + uDissipation * uDt);
}`;

const CURL = `${HEAD}
uniform sampler2D uVelocity;
void main() {${NEIGHBOURS}
  float L = texture(uVelocity, vUv - dl).y, R = texture(uVelocity, vUv + dl).y;
  float B = texture(uVelocity, vUv - db).x, T = texture(uVelocity, vUv + db).x;
  o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const VORTICITY = `${HEAD}
uniform sampler2D uVelocity, uCurl;
uniform float uStrength, uDt;
void main() {${NEIGHBOURS}
  float L = texture(uCurl, vUv - dl).x, R = texture(uCurl, vUv + dl).x;
  float B = texture(uCurl, vUv - db).x, T = texture(uCurl, vUv + db).x;
  float C = texture(uCurl, vUv).x;
  vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f = f / (length(f) + 1e-4) * uStrength * C;
  f.y = -f.y;
  vec2 v = texture(uVelocity, vUv).xy + f * uDt;
  o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`;

const DIVERGENCE = `${HEAD}
uniform sampler2D uVelocity;
void main() {${NEIGHBOURS}
  vec2 C = texture(uVelocity, vUv).xy;
  float L = texture(uVelocity, vUv - dl).x, R = texture(uVelocity, vUv + dl).x;
  float B = texture(uVelocity, vUv - db).y, T = texture(uVelocity, vUv + db).y;
  // closed walls: reflect the velocity at the edges
  if (vUv.x - uTexel.x < 0.0) L = -C.x;
  if (vUv.x + uTexel.x > 1.0) R = -C.x;
  if (vUv.y - uTexel.y < 0.0) B = -C.y;
  if (vUv.y + uTexel.y > 1.0) T = -C.y;
  o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const PRESSURE = `${HEAD}
uniform sampler2D uPressure, uDivergence;
void main() {${NEIGHBOURS}
  float L = texture(uPressure, vUv - dl).x, R = texture(uPressure, vUv + dl).x;
  float B = texture(uPressure, vUv - db).x, T = texture(uPressure, vUv + db).x;
  o = vec4((L + R + B + T - texture(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `${HEAD}
uniform sampler2D uPressure, uVelocity;
void main() {${NEIGHBOURS}
  float L = texture(uPressure, vUv - dl).x, R = texture(uPressure, vUv + dl).x;
  float B = texture(uPressure, vUv - db).x, T = texture(uPressure, vUv + db).x;
  o = vec4(texture(uVelocity, vUv).xy - vec2(R - L, T - B), 0.0, 1.0);
}`;

const SCALE = `${HEAD}
uniform sampler2D uSource;
uniform float uValue;
void main() { o = texture(uSource, vUv) * uValue; }`;

export interface FluidOptions {
  simShort: number; // velocity grid resolution on the short side
  dyeShort: number;
}

export class Fluid {
  private gl: GL;
  private fmt: number;
  private opts: FluidOptions;
  private p;
  private u;
  velocity!: Double;
  dye!: Double;
  private curl!: Target;
  private divergence!: Target;
  private pressure!: Double;
  aspect = 1;
  simW = 1;
  simH = 1;
  /** rough measure of motion left in the system, so the loop can rest */
  energy = 0;

  constructor(gl: GL, halfFormat: number, opts: FluidOptions) {
    this.gl = gl;
    this.fmt = halfFormat;
    this.opts = opts;
    const make = (fs: string) => {
      const prog = program(gl, FULLSCREEN_VERT, fs);
      if (!prog) throw new Error("fluid shader");
      return prog;
    };
    this.p = {
      splat: make(SPLAT),
      advect: make(ADVECT),
      curl: make(CURL),
      vorticity: make(VORTICITY),
      divergence: make(DIVERGENCE),
      pressure: make(PRESSURE),
      gradient: make(GRADIENT),
      scale: make(SCALE),
    };
    this.u = {
      splat: locations(gl, this.p.splat, ["uTexel", "uTarget", "uAspect", "uRadius", "uPoint", "uValue"] as const),
      advect: locations(gl, this.p.advect, ["uTexel", "uVelocity", "uSource", "uDt", "uDissipation"] as const),
      curl: locations(gl, this.p.curl, ["uTexel", "uVelocity"] as const),
      vorticity: locations(gl, this.p.vorticity, ["uTexel", "uVelocity", "uCurl", "uStrength", "uDt"] as const),
      divergence: locations(gl, this.p.divergence, ["uTexel", "uVelocity"] as const),
      pressure: locations(gl, this.p.pressure, ["uTexel", "uPressure", "uDivergence"] as const),
      gradient: locations(gl, this.p.gradient, ["uTexel", "uPressure", "uVelocity"] as const),
      scale: locations(gl, this.p.scale, ["uTexel", "uSource", "uValue"] as const),
    };
  }

  resize(aspect: number) {
    const gl = this.gl;
    const dims = (short: number) => (aspect >= 1 ? [Math.round(short * aspect), short] : [short, Math.round(short / aspect)]) as [number, number];
    const [sw, sh] = dims(this.opts.simShort);
    const [dw, dh] = dims(this.opts.dyeShort);
    if (this.velocity && sw === this.simW && sh === this.simH) return;
    this.free();
    this.aspect = aspect;
    this.simW = sw;
    this.simH = sh;
    this.velocity = double(gl, sw, sh, this.fmt, gl.LINEAR);
    this.dye = double(gl, dw, dh, this.fmt, gl.LINEAR);
    this.pressure = double(gl, sw, sh, this.fmt, gl.NEAREST);
    this.curl = target(gl, sw, sh, this.fmt, gl.NEAREST);
    this.divergence = target(gl, sw, sh, this.fmt, gl.NEAREST);
  }

  private pass(prog: WebGLProgram, out: Target, texel: [number, number], set: () => void, texelLoc: WebGLUniformLocation | null) {
    const gl = this.gl;
    gl.useProgram(prog);
    gl.bindFramebuffer(gl.FRAMEBUFFER, out.fb);
    gl.viewport(0, 0, out.w, out.h);
    gl.uniform2f(texelLoc, texel[0], texel[1]);
    set();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  private bind(unit: number, tex: WebGLTexture, loc: WebGLUniformLocation | null) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(loc, unit);
  }

  /** Push velocity (texels/s) and dye (premultiplied rgb + amount) at uv point, radius in uv² units. */
  splat(x: number, y: number, vx: number, vy: number, color: [number, number, number], amount: number, radius: number) {
    const u = this.u.splat;
    const run = (dst: Double, value: [number, number, number, number]) => {
      this.pass(this.p.splat, dst.write, [1 / dst.read.w, 1 / dst.read.h], () => {
        this.bind(0, dst.read.tex, u.uTarget);
        this.gl.uniform1f(u.uAspect, this.aspect);
        this.gl.uniform1f(u.uRadius, radius);
        this.gl.uniform2f(u.uPoint, x, y);
        this.gl.uniform4f(u.uValue, ...value);
      }, u.uTexel);
      dst.swap();
    };
    run(this.velocity, [vx, vy, 0, 0]);
    if (amount > 0) run(this.dye, [color[0] * amount, color[1] * amount, color[2] * amount, amount]);
    this.energy = Math.max(this.energy, 1);
  }

  step(dt: number) {
    const gl = this.gl;
    gl.disable(gl.BLEND);
    const vt: [number, number] = [1 / this.simW, 1 / this.simH];
    const { u, p } = this;

    this.pass(p.curl, this.curl, vt, () => this.bind(0, this.velocity.read.tex, u.curl.uVelocity), u.curl.uTexel);
    this.pass(p.vorticity, this.velocity.write, vt, () => {
      this.bind(0, this.velocity.read.tex, u.vorticity.uVelocity);
      this.bind(1, this.curl.tex, u.vorticity.uCurl);
      gl.uniform1f(u.vorticity.uStrength, 16);
      gl.uniform1f(u.vorticity.uDt, dt);
    }, u.vorticity.uTexel);
    this.velocity.swap();

    this.pass(p.divergence, this.divergence, vt, () => this.bind(0, this.velocity.read.tex, u.divergence.uVelocity), u.divergence.uTexel);

    this.pass(p.scale, this.pressure.write, vt, () => {
      this.bind(0, this.pressure.read.tex, u.scale.uSource);
      gl.uniform1f(u.scale.uValue, 0.8);
    }, u.scale.uTexel);
    this.pressure.swap();
    for (let i = 0; i < 18; i++) {
      this.pass(p.pressure, this.pressure.write, vt, () => {
        this.bind(0, this.pressure.read.tex, u.pressure.uPressure);
        this.bind(1, this.divergence.tex, u.pressure.uDivergence);
      }, u.pressure.uTexel);
      this.pressure.swap();
    }

    this.pass(p.gradient, this.velocity.write, vt, () => {
      this.bind(0, this.pressure.read.tex, u.gradient.uPressure);
      this.bind(1, this.velocity.read.tex, u.gradient.uVelocity);
    }, u.gradient.uTexel);
    this.velocity.swap();

    this.pass(p.advect, this.velocity.write, vt, () => {
      this.bind(0, this.velocity.read.tex, u.advect.uVelocity);
      this.bind(1, this.velocity.read.tex, u.advect.uSource);
      gl.uniform1f(u.advect.uDt, dt);
      gl.uniform1f(u.advect.uDissipation, 0.8);
    }, u.advect.uTexel);
    this.velocity.swap();

    this.pass(p.advect, this.dye.write, vt, () => {
      this.bind(0, this.velocity.read.tex, u.advect.uVelocity);
      this.bind(1, this.dye.read.tex, u.advect.uSource);
      gl.uniform1f(u.advect.uDt, dt);
      gl.uniform1f(u.advect.uDissipation, 1.3);
    }, u.advect.uTexel);
    this.dye.swap();

    this.energy *= Math.exp(-dt * 0.9);
  }

  free() {
    if (!this.velocity) return;
    this.velocity.free();
    this.dye.free();
    this.pressure.free();
    freeTarget(this.gl, this.curl);
    freeTarget(this.gl, this.divergence);
  }

  dispose() {
    this.free();
    Object.values(this.p).forEach((prog) => this.gl.deleteProgram(prog));
  }
}
