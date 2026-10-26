import "server-only";
import { createHash } from "node:crypto";

/**
 * Configurable rate limiting for the inquiry endpoint.
 * - Default: in-memory sliding window (per server instance — fine for local / low traffic).
 * - Production: set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN for a shared,
 *   distributed fixed-window limit (REST API, no extra dependency).
 * IPs are hashed before being used as keys.
 */

const MAX = Math.max(1, Number(process.env.CONTACT_RATE_LIMIT_MAX ?? 5));
const WINDOW_S = Math.max(10, Number(process.env.CONTACT_RATE_LIMIT_WINDOW_SECONDS ?? 600));

const memory = new Map<string, number[]>();

function hashKey(ip: string) {
  return createHash("sha256").update(`tes-inquiry:${ip}`).digest("hex").slice(0, 32);
}

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number;
}

export async function rateLimit(ip: string): Promise<RateLimitResult> {
  const key = hashKey(ip || "unknown");
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["INCR", `rl:${key}`],
          ["EXPIRE", `rl:${key}`, String(WINDOW_S), "NX"],
          ["TTL", `rl:${key}`],
        ]),
        cache: "no-store",
      });
      if (res.ok) {
        const out = (await res.json()) as { result: number }[];
        const count = Number(out[0]?.result ?? 0);
        const ttl = Number(out[2]?.result ?? WINDOW_S);
        return { ok: count <= MAX, retryAfter: ttl > 0 ? ttl : WINDOW_S };
      }
    } catch {
      /* fall through to the in-memory limiter */
    }
  }

  const now = Date.now();
  const windowMs = WINDOW_S * 1000;
  const hits = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= MAX) {
    const retryAfter = Math.ceil((windowMs - (now - (hits[0] ?? now))) / 1000);
    memory.set(key, hits);
    return { ok: false, retryAfter };
  }
  hits.push(now);
  memory.set(key, hits);
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (!v.some((t) => now - t < windowMs)) memory.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}
