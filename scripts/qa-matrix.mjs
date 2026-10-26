#!/usr/bin/env node
/**
 * Layout regression sweep: every route × every viewport from the brief (§24).
 * Reports horizontal overflow and clipped (masked) headlines. Uses qa-screenshot.mjs.
 *   node scripts/qa-matrix.mjs [baseUrl]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const base = process.argv[2] ?? "http://localhost:3100";
const routes = ["/", "/work", "/work/saas-launch-explainer", "/services/saas-animation", "/services/3d-animation", "/services/interactive-websites", "/services/video-editing", "/about", "/contact", "/privacy", "/terms", "/does-not-exist"];
const viewports = process.env.VIEWPORTS ? process.env.VIEWPORTS.split(",") : ["320x568", "360x800", "375x812", "390x844", "430x932", "768x1024", "1024x768", "1280x800", "1440x900", "1920x1080"];
const dir = mkdtempSync(join(tmpdir(), "tes-matrix-"));
let failures = 0;

for (const vp of viewports) {
  for (const r of routes) {
    const out = execFileSync(process.execPath, [join(import.meta.dirname, "qa-screenshot.mjs"), base + r, vp, join(dir, "x.png"), "--reveal", "--metrics", "--wait=2200"], { encoding: "utf8" });
    const json = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
    const bad = json.overflowX > 0 || json.clippedHeadlines.length > 0;
    if (bad) failures++;
    console.log(`${bad ? "✗" : "✓"} ${vp.padEnd(10)} ${r.padEnd(34)} overflowX=${json.overflowX} clipped=${JSON.stringify(json.clippedHeadlines)}`);
  }
}
console.log(failures ? `\n${failures} problem(s)` : "\nAll clear");
process.exitCode = failures ? 1 : 0;
