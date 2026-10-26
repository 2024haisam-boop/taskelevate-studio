/** Minimal WebGL2 plumbing shared by the studio layer (fluid, figure, composite). */

export type GL = WebGL2RenderingContext;

/** Full-screen triangle, no attributes; passes uv (0..1, origin bottom-left). */
export const FULLSCREEN_VERT = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export function program(gl: GL, vs: string, fs: string): WebGLProgram | null {
  const p = gl.createProgram();
  if (!p) return null;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, vs],
    [gl.FRAGMENT_SHADER, fs],
  ] as const) {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS) && process.env.NODE_ENV !== "production") console.warn(gl.getShaderInfoLog(sh));
    gl.attachShader(p, sh);
  }
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}

/** Uniform locations by name, looked up once. */
export function locations<K extends string>(gl: GL, p: WebGLProgram, names: readonly K[]) {
  return Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)])) as Record<K, WebGLUniformLocation | null>;
}

export interface Target {
  tex: WebGLTexture;
  fb: WebGLFramebuffer;
  w: number;
  h: number;
}

export function texture(gl: GL, w: number, h: number, internal: number, filter: number, data: Float32Array | null = null) {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, gl.RGBA, gl.FLOAT, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return t;
}

export function target(gl: GL, w: number, h: number, internal: number, filter: number): Target {
  const tex = texture(gl, w, h, internal, filter);
  const fb = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0, 0, w, h);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { tex, fb, w, h };
}

export function freeTarget(gl: GL, t: Target) {
  gl.deleteTexture(t.tex);
  gl.deleteFramebuffer(t.fb);
}

/** Ping-pong pair. */
export function double(gl: GL, w: number, h: number, internal: number, filter: number) {
  const pair = { read: target(gl, w, h, internal, filter), write: target(gl, w, h, internal, filter) };
  return {
    get read() {
      return pair.read;
    },
    get write() {
      return pair.write;
    },
    swap() {
      [pair.read, pair.write] = [pair.write, pair.read];
    },
    free() {
      freeTarget(gl, pair.read);
      freeTarget(gl, pair.write);
    },
  };
}
export type Double = ReturnType<typeof double>;

/** Float render-target formats this device can draw into: full (RGBA32F) for the particle state, half (RGBA16F,
 *  filterable) for the fluid. null when the device can't. */
export function floatFormats(gl: GL) {
  const test = (internal: number) => {
    const t = texture(gl, 4, 4, internal, gl.NEAREST);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);
    gl.deleteTexture(t);
    return ok;
  };
  const full = gl.getExtension("EXT_color_buffer_float") !== null;
  const half = full || gl.getExtension("EXT_color_buffer_half_float") !== null;
  const half16 = half && test(gl.RGBA16F) ? gl.RGBA16F : null;
  const full32 = full && test(gl.RGBA32F) ? gl.RGBA32F : half16;
  return half16 && full32 ? { full: full32, half: half16 } : null;
}

export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
