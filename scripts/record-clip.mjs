#!/usr/bin/env node
/**
 * Record a page (e.g. /lab?scene=product-turntable) to a web-ready MP4 + poster.
 * Headless Chrome, deterministic virtual-time capture (or real-time) → frames → ffmpeg (H.264, faststart).
 *
 *   node scripts/record-clip.mjs <url> <out-basename> [--seconds=6] [--size=960x540] [--warmup=2500] [--fps=30] [--mode=virtual|realtime]
 *
 * Produces <out-basename>.mp4 and <out-basename>.jpg. One Chrome at a time — WebGL pages are memory-heavy.
 */
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

const [, , url, outBase, ...rest] = process.argv;
if (!url || !outBase) {
  console.error("usage: node scripts/record-clip.mjs <url> <out-basename> [--seconds=6] [--size=960x540] [--warmup=2500] [--fps=30]");
  process.exit(1);
}
const opts = Object.fromEntries(rest.map((a) => a.replace(/^--/, "").split("=")));
const seconds = Number(opts.seconds ?? 6);
const fps = Number(opts.fps ?? 30);
const warmup = Number(opts.warmup ?? 2500);
const [width, height] = (opts.size ?? "960x540").split("x").map(Number);
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9800 + Math.floor(Math.random() * 150);
const profile = mkdtempSync(join(tmpdir(), "tes-rec-"));
const frameDir = mkdtempSync(join(tmpdir(), "tes-frames-"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn(
  chrome,
  ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "--no-first-run", "--enable-webgl", "--use-angle=metal", "--autoplay-policy=no-user-gesture-required", `--window-size=${width},${height}`, "about:blank"],
  { stdio: "ignore" },
);

let ws;
let id = 0;
const pending = new Map();
const handlers = new Map();
const send = (method, params = {}) => {
  const msgId = ++id;
  ws.send(JSON.stringify({ id: msgId, method, params }));
  return new Promise((resolve, reject) => pending.set(msgId, { resolve, reject }));
};

try {
  let wsUrl;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      wsUrl = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
    } catch {}
    if (!wsUrl) await sleep(150);
  }
  if (!wsUrl) throw new Error("Chrome did not start");
  ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
    } else if (msg.method && handlers.has(msg.method)) handlers.get(msg.method)(msg.params);
  });

  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  // Headless pages only stream compositor frames when they believe they are visible + focused
  await send("Emulation.setFocusEmulationEnabled", { enabled: true }).catch(() => {});
  await send("Page.bringToFront").catch(() => {});
  const loaded = new Promise((r) => handlers.set("Page.loadEventFired", r));
  await send("Page.navigate", { url });
  await loaded;
  await sleep(warmup);

  const frames = [];
  const total = Math.round(seconds * fps);
  const mode = opts.mode ?? "virtual";
  if (mode === "virtual") {
    // Deterministic capture: freeze the page clock, advance exactly one frame, screenshot, repeat.
    await send("Emulation.setVirtualTimePolicy", { policy: "pause" });
    for (let i = 0; i < total; i++) {
      const expired = new Promise((r) => handlers.set("Emulation.virtualTimeBudgetExpired", r));
      await send("Emulation.setVirtualTimePolicy", { policy: "advance", budget: 1000 / fps });
      await expired;
      const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 92 });
      frames.push({ data: shot.data, ts: i / fps });
    }
  } else {
    // Real-time fallback: screenshot as fast as possible, keep true timestamps.
    const begin = performance.now();
    while (performance.now() - begin < seconds * 1000) {
      const t = (performance.now() - begin) / 1000;
      const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 90 });
      frames.push({ data: shot.data, ts: t });
    }
  }
  if (frames.length < 5) throw new Error(`only ${frames.length} frames captured`);

  // Write frames + a concat list that preserves real timing, then resample to constant fps.
  const t0 = frames[0].ts;
  let list = "";
  frames.forEach((f, i) => {
    const file = join(frameDir, `f${String(i).padStart(5, "0")}.jpg`);
    writeFileSync(file, Buffer.from(f.data, "base64"));
    const next = frames[i + 1];
    const dur = next ? Math.max(0.001, next.ts - f.ts) : 1 / fps;
    list += `file '${file}'\nduration ${dur.toFixed(4)}\n`;
  });
  list += `file '${join(frameDir, `f${String(frames.length - 1).padStart(5, "0")}.jpg`)}'\n`;
  writeFileSync(join(frameDir, "list.txt"), list);
  const span = frames[frames.length - 1].ts - t0;
  console.log(`captured ${frames.length} frames over ${span.toFixed(2)}s (~${(frames.length / span).toFixed(1)} fps)`);

  mkdirSync(dirname(outBase), { recursive: true });
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(frameDir, "list.txt"),
    "-t", String(seconds), "-vf", `fps=${fps},scale=${width}:${height}:flags=lanczos,format=yuv420p`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-profile:v", "high", "-movflags", "+faststart", "-an",
    `${outBase}.mp4`,
  ]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "0.6", "-i", `${outBase}.mp4`, "-frames:v", "1", "-q:v", "4", `${outBase}.jpg`]);
  const size = Number(execFileSync("stat", ["-f", "%z", `${outBase}.mp4`]).toString().trim());
  console.log(`saved ${outBase}.mp4 (${(size / 1024).toFixed(0)} KB) + poster`);
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  try {
    ws?.close();
  } catch {}
  proc.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
  rmSync(frameDir, { recursive: true, force: true });
}
