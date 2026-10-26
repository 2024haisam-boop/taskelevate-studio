import { NextResponse } from "next/server";
import { Resend } from "resend";
import * as z from "zod/mini";
import { buildInquiryEmail } from "@/lib/forms/email";
import { getDeliveryConfig } from "@/lib/forms/delivery";
import { inquiryPayloadSchema } from "@/lib/forms/inquiry-schema";
import { rateLimit } from "@/lib/forms/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ErrorCode = "invalid_request" | "validation" | "rate_limited" | "delivery_unavailable" | "delivery_failed" | "forbidden";

const MAX_BYTES = 24_000;
// Successful results by idempotency key — duplicate submits return the same answer, no second email.
const recent = new Map<string, { at: number }>();
const IDEMPOTENCY_TTL = 15 * 60 * 1000;

function fail(status: number, code: ErrorCode, message: string, extra: Record<string, unknown> = {}, headers?: HeadersInit) {
  return NextResponse.json({ ok: false, code, message, ...extra }, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "").trim();
}

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; still rate limited + validated
  try {
    const o = new URL(origin);
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return o.host === host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "forbidden", "This request isn't allowed.");

  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) return fail(413, "invalid_request", "That message is too large to send.");

  const limit = await rateLimit(clientIp(req));
  if (!limit.ok) {
    return fail(429, "rate_limited", "You've sent a few requests in a short time. Please wait a few minutes and try again.", {}, {
      "Retry-After": String(limit.retryAfter),
    });
  }

  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BYTES) return fail(413, "invalid_request", "That message is too large to send.");
    body = JSON.parse(raw);
  } catch {
    return fail(400, "invalid_request", "We couldn't read that submission. Please try again.");
  }

  const parsed = inquiryPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "validation", "Please check the highlighted fields.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    });
  }
  const data = parsed.data;

  // Spam traps: honeypot filled, or submitted faster than a human could type.
  // Respond neutrally so bots learn nothing; nothing is sent.
  const tooFast = typeof data.startedAt === "number" && Date.now() - data.startedAt < 2500;
  if ((data.website && data.website.trim() !== "") || tooFast) {
    return NextResponse.json({ ok: true }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }

  const config = getDeliveryConfig();
  if (!config) {
    // Never pretend: tell the visitor online delivery is unavailable.
    return fail(503, "delivery_unavailable", "Online inquiries aren't available right now.");
  }

  const now = Date.now();
  for (const [k, v] of recent) if (now - v.at > IDEMPOTENCY_TTL) recent.delete(k);
  if (recent.has(data.idempotencyKey)) {
    return NextResponse.json({ ok: true, duplicate: true }, { headers: { "Cache-Control": "no-store" } });
  }

  const email = buildInquiryEmail(data, {
    receivedAt: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  try {
    const resend = new Resend(config.apiKey);
    const { error } = await resend.emails.send(
      {
        from: config.from,
        to: config.to,
        replyTo: data.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
        tags: [{ name: "type", value: "project_inquiry" }],
      },
      { idempotencyKey: `inquiry-${data.idempotencyKey}` },
    );
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("[contact] delivery failed:", err instanceof Error ? err.message : err);
    return fail(502, "delivery_failed", "Your message couldn't be delivered just now. Please try again in a moment.");
  }

  recent.set(data.idempotencyKey, { at: now });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
