#!/usr/bin/env node
/**
 * Zero-dependency visual QA: drives a local headless Chrome over the DevTools Protocol.
 *
 *   node scripts/qa-screenshot.mjs <url> <width>x<height> <out.png> [options]
 *
 * Options:
 *   --scroll=<px|selector>   scroll before capture (number or CSS selector)
 *   --full                   capture the full page height
 *   --reveal                 force all scroll-reveal elements visible (for full-page captures)
 *   --wait=<ms>              wait after load / scroll (default 1800)
 *   --reduced-motion         emulate prefers-reduced-motion: reduce
 *   --eval="<js>"            run JS in the page before capture (e.g. click a tab)
 *   --metrics                print overflow/clipping metrics as JSON
 *   --no-webgl               launch Chrome with 3D APIs disabled (tests the WebGL fallback)
 *
 * Requires Google Chrome at the default macOS path, or set CHROME_PATH.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [, , url, size = "1440x900", out = "shot.png", ...rest] = process.argv;
if (!url) {
  console.error("usage: node scripts/qa-screenshot.mjs <url> <w>x<h> <out.png> [--full] [--scroll=..] [--reveal] [--wait=ms]");
  process.exit(1);
}
const opts = Object.fromEntries(
  rest.map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.length ? v.join("=") : true];
  }),
);
const [width, height] = size.split("x").map(Number);
const wait = Number(opts.wait ?? 1800);
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9300 + Math.floor(Math.random() * 500);
const profile = mkdtempSync(join(tmpdir(), "tes-qa-"));

const proc = spawn(chrome, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  ...(opts["no-webgl"] ? ["--disable-3d-apis", "--disable-webgl", "--disable-webgl2"] : ["--enable-webgl", "--use-angle=metal"]),
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(150);
  }
  throw new Error("Chrome did not start");
}

let ws;
let id = 0;
const pending = new Map();
const listeners = [];
function send(method, params = {}) {
  const msgId = ++id;
  ws.send(JSON.stringify({ id: msgId, method, params }));
  return new Promise((resolve, reject) => pending.set(msgId, { resolve, reject }));
}
function once(method) {
  return new Promise((resolve) => listeners.push({ method, resolve }));
}

try {
  ws = new WebSocket(await getWsUrl());
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
    } else if (msg.method) {
      for (let i = listeners.length - 1; i >= 0; i--) {
        if (listeners[i].method === msg.method) {
          listeners[i].resolve(msg.params);
          listeners.splice(i, 1);
        }
      }
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");
  const mobile = width < 768;
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  if (mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  if (opts["reduced-motion"]) {
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  }
  const loaded = once("Page.loadEventFired");
  await send("Page.navigate", { url });
  await loaded;
  await sleep(wait);

  const evaluate = async (expression) =>
    (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result?.value;

  if (opts.reveal) {
    await evaluate(`document.querySelectorAll('[data-reveal]').forEach(e => e.setAttribute('data-revealed',''));`);
    await sleep(1400); // let reveal transitions finish before capturing
  }
  if (opts.eval) {
    const value = await evaluate(String(opts.eval));
    if (value !== undefined) console.log("eval:", typeof value === "string" ? value : JSON.stringify(value));
    await sleep(wait);
  }
  if (opts.scroll) {
    const target = String(opts.scroll);
    await evaluate(
      /^\d+$/.test(target)
        ? `window.scrollTo({ top: ${target}, behavior: 'instant' })`
        : `document.querySelector(${JSON.stringify(target)})?.scrollIntoView({ block: 'start', behavior: 'instant' })`,
    );
    await sleep(wait);
  }

  if (opts.metrics) {
    const metrics = await evaluate(`(() => {
      const doc = document.documentElement;
      const overflowX = doc.scrollWidth - doc.clientWidth;
      const wide = [...document.querySelectorAll('body *')].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > doc.clientWidth + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed';
      }).slice(0, 12).map(el => (el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + [...el.classList].slice(0,3).join('.')) + ' ' + Math.round(el.getBoundingClientRect().left) + '→' + Math.round(el.getBoundingClientRect().right));
      const clipped = [...document.querySelectorAll('.line-mask')].filter(m => m.scrollWidth > m.clientWidth + 1).map(m => m.textContent.trim().slice(0, 40));
      return { viewport: [innerWidth, innerHeight], docWidth: doc.scrollWidth, overflowX, offenders: wide, clippedHeadlines: clipped, height: doc.scrollHeight };
    })()`);
    console.log(JSON.stringify(metrics, null, 2));
  }

  let clip;
  if (opts.full) {
    const { cssContentSize } = await send("Page.getLayoutMetrics");
    clip = { x: 0, y: 0, width, height: Math.min(cssContentSize.height, 16000), scale: 1 };
  }
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: Boolean(clip), ...(clip ? { clip } : {}) });
  writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log(`saved ${out}`);
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  try {
    ws?.close();
  } catch {}
  proc.kill();
  await sleep(200);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}
}
