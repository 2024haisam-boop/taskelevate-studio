#!/usr/bin/env node
/**
 * Captures the home page's 3D journey in ONE headless Chrome (cheap on memory):
 *  1. the entrance — frames at given ms after load (fresh profile → full intro gate)
 *  2. stops along the journey — "act:fraction" of each act's track (camera progress)
 *
 *   node scripts/qa-journey.mjs <outdir> [WxH] [--intro=300,1200,2200,3200,4200,5600] [--stops=hero:0.3,descent:0.5]
 *                               [--url=http://localhost:3000/] [--settle=1600] [--no-webgl] [--reduced-motion] [--full]
 *
 * Scrolls in small steps (like a person) so the camera's damped scroll and sticky tracks behave for real.
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [, , outDir = "qa-journey", size = "1440x900", ...rest] = process.argv;
const opts = Object.fromEntries(
  rest.map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.length ? v.join("=") : true];
  }),
);
const url = opts.url ?? "http://localhost:3000/";
const settle = Number(opts.settle ?? 1600);
const intro = String(opts.intro ?? "300,1300,2300,3100,3900,5200").split(",").filter(Boolean).map(Number);
const stops = String(
  opts.stops ??
    "hero:0.25,hero:0.5,hero:0.8,descent:0.3,descent:0.7,reel:0.25,reel:0.62,reel:0.9,services:0.05,services:0.3,services:0.55,services:0.9,work:0.1,work:0.45,work:0.85,finale:0.3,finale:0.7,finale:1.2",
)
  .split(",")
  .filter(Boolean)
  .map((s) => {
    const [act, f] = s.split(":");
    return { act, f: Number(f) };
  });

const [width, height] = size.split("x").map(Number);
mkdirSync(outDir, { recursive: true });
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), "tes-journey-"));
const proc = spawn(
  chrome,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--autoplay-policy=no-user-gesture-required",
    ...(opts["no-webgl"] ? ["--disable-3d-apis", "--disable-webgl", "--disable-webgl2"] : ["--enable-webgl", "--use-angle=metal"]),
    "about:blank",
  ],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws;
let id = 0;
const pending = new Map();
const listeners = [];
const problems = [];
const send = (method, params = {}) => {
  const msgId = ++id;
  ws.send(JSON.stringify({ id: msgId, method, params }));
  return new Promise((resolve, reject) => pending.set(msgId, { resolve, reject }));
};
const once = (method) => new Promise((resolve) => listeners.push({ method, resolve }));
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.value;
const shot = async (name) => {
  const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 82 });
  writeFileSync(join(outDir, `${name}.jpg`), Buffer.from(s.data, "base64"));
  console.log("saved", name);
};

try {
  for (let i = 0; i < 60 && !ws; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
    } catch {}
    if (!ws) await sleep(150);
  }
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
    } else if (msg.method) {
      if (msg.method === "Runtime.exceptionThrown") problems.push("exception: " + (msg.params.exceptionDetails?.exception?.description ?? msg.params.exceptionDetails?.text));
      if (msg.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(msg.params.type))
        problems.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 300)}`);
      for (let i = listeners.length - 1; i >= 0; i--) if (listeners[i].method === msg.method) listeners.splice(i, 1)[0].resolve(msg.params);
    }
  });
  await send("Page.enable");
  await send("Runtime.enable");
  const mobile = width < 768;
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  if (mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  if (opts["reduced-motion"]) await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });

  const loaded = once("Page.loadEventFired");
  const t0 = Date.now();
  await send("Page.navigate", { url });
  await loaded;
  for (const ms of intro) {
    const wait = ms - (Date.now() - t0);
    if (wait > 0) await sleep(wait);
    await shot(`intro-${String(ms).padStart(5, "0")}`);
  }
  await sleep(1500);

  for (const { act, f } of stops) {
    const target = await evaluate(`(() => { const el = document.querySelector('[data-act="${act}"]'); if (!el) return -1;
      return Math.round(el.getBoundingClientRect().top + scrollY + el.offsetHeight * ${f}); })()`);
    if (target < 0) {
      console.log("missing act", act);
      continue;
    }
    await evaluate(`(async () => { const to = ${target}; let y = scrollY; const step = Math.sign(to - y) * 140;
      while (Math.abs(to - y) > 140) { y += step; scrollTo(0, y); await new Promise(r => setTimeout(r, 16)); }
      scrollTo(0, to); return 1; })()`);
    await sleep(settle);
    await shot(`${act}-${String(f).replace(".", "_")}`);
  }
  if (opts.full) {
    await evaluate(`scrollTo(0, 0)`);
    await sleep(800);
    const { cssContentSize } = await send("Page.getLayoutMetrics");
    const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 70, captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: Math.min(cssContentSize.height, 16000), scale: 0.5 } });
    writeFileSync(join(outDir, "full.jpg"), Buffer.from(s.data, "base64"));
    console.log("saved full");
  }
  const uniq = [...new Set(problems)];
  console.log(uniq.length ? `console problems (${uniq.length}):\n  ` + uniq.slice(0, 15).join("\n  ") : "console: clean");
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
}
