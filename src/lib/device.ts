/* A rough device class for sizing the WebGL effects: the same effects everywhere, rendered with fewer pixels,
   particles and solver passes on weak hardware (and adaptive resolution on top of that).
   Chrome on Android reports memory (`deviceMemory`, GB, rounded down to a power of two); Safari reports none, so
   Apple devices are judged by screen size only. */

export type Tier = "low" | "mid" | "high";

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

let cached: Tier | null = null;

export function deviceTier(): Tier {
  if (cached) return cached;
  // (servers can have a `navigator` too — Node 21+ — but never a window)
  if (typeof window === "undefined" || typeof navigator === "undefined") return "high";
  const nav = navigator as Nav;
  const mem = nav.deviceMemory;
  const cores = nav.hardwareConcurrency || 8;
  const android = /Android/i.test(nav.userAgent);
  const phone = Math.min(window.screen.width, window.screen.height) < 640;
  if ((mem !== undefined && mem <= 2) || (android && cores <= 4) || nav.connection?.saveData) cached = "low";
  else if ((mem !== undefined && mem <= 4) || phone) cached = "mid";
  else cached = "high";
  return cached;
}

/** Entry-level mobile GPUs (when the browser names the GPU) — treated as low tier whatever the memory says. */
export function weakGpu(gl: WebGL2RenderingContext) {
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  const name = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
  return /Mali-(T|G3|G5[0-9])|Adreno \(TM\) ([2-5]\d\d|6[0-1]\d)|PowerVR|IMG BXM|Vivante|SwiftShader/i.test(name);
}

/** Call once a weak GPU has been detected, so every later effect sizes itself for it. */
export function demoteTier() {
  cached = "low";
}
