import "server-only";
import type { InquiryPayload } from "./inquiry-schema";

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Builds the internal notification email for a new project inquiry. */
export function buildInquiryEmail(p: InquiryPayload, meta: { receivedAt: string; userAgent?: string }) {
  const a = p.attribution ?? {};
  const rows: [string, string | undefined][] = [
    ["Name", p.name],
    ["Email", p.email],
    ["Company / Brand", p.company || undefined],
    ["Service", p.service],
    ["Budget", p.budget || undefined],
    ["Timeline", p.timeline || undefined],
  ];
  const attribution: [string, string | undefined][] = [
    ["utm_source", a.utm_source],
    ["utm_medium", a.utm_medium],
    ["utm_campaign", a.utm_campaign],
    ["utm_content", a.utm_content],
    ["utm_term", a.utm_term],
    ["Landing page", a.landingPath],
    ["Referrer", a.referrerHost],
    ["Submitted from", p.pagePath],
  ];

  const campaign = a.utm_campaign ? ` · ${a.utm_campaign}` : "";
  const subject = `New inquiry — ${p.service} — ${p.name}${campaign}`;

  const tr = ([k, v]: [string, string | undefined]) =>
    v
      ? `<tr><td style="padding:8px 16px 8px 0;color:#777C8D;font:12px/1.4 monospace;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:8px 0;color:#0E1017;font:15px/1.5 -apple-system,Segoe UI,sans-serif">${esc(v)}</td></tr>`
      : "";

  const html = `<!doctype html><html><body style="margin:0;background:#F4F5F8;padding:32px 16px">
  <table role="presentation" width="100%" style="max-width:640px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #E6E7EC">
    <tr><td>
      <p style="margin:0 0 4px;color:#8755E8;font:12px monospace;letter-spacing:.14em;text-transform:uppercase">Taskelevate Studios · New project inquiry</p>
      <h1 style="margin:0 0 24px;font:700 24px/1.2 -apple-system,Segoe UI,sans-serif;color:#08090D">${esc(p.service)} — ${esc(p.name)}</h1>
      <table role="presentation">${rows.map(tr).join("")}</table>
      <h2 style="margin:28px 0 8px;font:600 14px -apple-system,Segoe UI,sans-serif;color:#08090D">Project description</h2>
      <p style="margin:0;white-space:pre-wrap;color:#0E1017;font:15px/1.6 -apple-system,Segoe UI,sans-serif">${esc(p.message)}</p>
      <h2 style="margin:28px 0 8px;font:600 14px -apple-system,Segoe UI,sans-serif;color:#08090D">Attribution</h2>
      <table role="presentation">${attribution.map(tr).join("") || tr(["Source", "Direct / not tagged"])}</table>
      <p style="margin:28px 0 0;color:#777C8D;font:12px monospace">Received ${esc(meta.receivedAt)} · Reply to this email to answer ${esc(p.name)} directly.</p>
    </td></tr>
  </table></body></html>`;

  const text = [
    `New project inquiry — Taskelevate Studios`,
    ``,
    ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    ``,
    `Project description:`,
    p.message,
    ``,
    `Attribution:`,
    ...(attribution.some(([, v]) => v) ? attribution.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`) : ["Direct / not tagged"]),
    ``,
    `Received ${meta.receivedAt}`,
  ].join("\n");

  return { subject, html, text };
}
