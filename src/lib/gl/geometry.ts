/** Small geometry helpers shared by the WebGL pieces (ProcessVisual, the studio figure). */

/** Seeded PRNG (mulberry32) so generated shapes are identical on every load. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type V3 = [number, number, number];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** (2,3) torus knot centre line, ~1.08 across. */
export const TUBE = 0.2;
export function knot(u: number): V3 {
  const r = 2 + Math.cos(3 * u);
  return [r * Math.cos(2 * u) * 0.36, r * Math.sin(2 * u) * 0.36, -Math.sin(3 * u) * 0.36];
}
function tubeFrame(u: number) {
  const e = 0.002;
  const c = knot(u), a = knot(u + e), b = knot(u - e);
  const T = norm(sub(a, b));
  const B = norm(cross(T, norm([a[0] + b[0] - 2 * c[0], a[1] + b[1] - 2 * c[1], a[2] + b[2] - 2 * c[2]])));
  const N = cross(B, T);
  return { c, N, B };
}
/** A point (and its normal) on the knot's tube at length u, angle v, radius r. */
export function onTube(u: number, v: number, r: number): { p: V3; n: V3 } {
  const { c, N, B } = tubeFrame(u);
  const n: V3 = [Math.cos(v) * N[0] + Math.sin(v) * B[0], Math.cos(v) * N[1] + Math.sin(v) * B[1], Math.cos(v) * N[2] + Math.sin(v) * B[2]];
  return { p: [c[0] + r * n[0], c[1] + r * n[1], c[2] + r * n[2]], n };
}
