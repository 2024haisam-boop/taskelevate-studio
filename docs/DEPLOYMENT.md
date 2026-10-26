# Deployment — Vercel + studio.taskelevate.com

The parent site **taskelevate.com must remain untouched.** You only add the record(s) Vercel asks for on the
`studio` subdomain. Do not change the apex (`@`), `www`, MX or other existing records.

## 1. Push the code

The project root is `~/Developer/taskelevate-studio`, pushed to GitHub as
`github.com/2024haisam-boop/taskelevate-studio` (branch `main`, repo root = project root, so Vercel's **Root
Directory** stays empty). Import that repository in Vercel → Add New → Project, or deploy with the Vercel CLI:

```bash
npm i -g vercel
vercel          # first run links/creates the project (framework is auto-detected as Next.js)
vercel --prod
```

Build settings (defaults are correct): Install `npm install` · Build `npm run build` · Output: Next.js default ·
Node.js 20.x or newer.

## 2. Environment variables

Vercel → Project → Settings → Environment Variables. Copy keys from [`.env.example`](../.env.example).

Minimum for a fully working launch:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://studio.taskelevate.com` |
| `RESEND_API_KEY` | from resend.com → API keys (server-only) |
| `CONTACT_TO_EMAIL` | the inbox that should receive inquiries |
| `CONTACT_FROM_EMAIL` | e.g. `Taskelevate Studios <studio@taskelevate.com>` (domain verified in Resend) |
| `NEXT_PUBLIC_BOOKING_URL` | your real Calendly link (optional — button hidden if empty) |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_LINKEDIN_URL` | optional |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | recommended: shared rate limit across serverless instances |

`NEXT_PUBLIC_*` values are inlined at build time — **redeploy after changing them**.

## 3. Connect the subdomain

1. Vercel → Project → Settings → **Domains** → Add `studio.taskelevate.com`.
2. Vercel shows the exact record to create. For a subdomain this is normally a **CNAME**:

   | Type | Host / Name | Value |
   |---|---|---|
   | CNAME | `studio` | *the target Vercel displays* (e.g. `cname.vercel-dns.com` or a project-specific `…vercel-dns-0xx.com`) |

   Use the value shown in **your** dashboard — don't copy one from documentation.
3. Add it at the DNS provider that currently manages taskelevate.com (e.g. Hostinger → Domains → DNS / Nameservers →
   Manage DNS records). If a `studio` record already exists, replace only that record.
4. If Vercel asks for ownership verification (domain used in another Vercel account), add the `TXT` record it shows
   (`_vercel` host). Remove nothing else.

## 4. SSL

Vercel issues the certificate automatically once the CNAME resolves (usually minutes; DNS propagation can take up
to 48 h). Check:

```bash
dig +short studio.taskelevate.com CNAME
curl -sI https://studio.taskelevate.com | head -1
```

If the certificate stays pending, check for **CAA** records on taskelevate.com. If any exist they must allow
Vercel's CA, e.g. add `0 issue "letsencrypt.org"` (keep existing CAA entries).

## 5. Email delivery (Resend)

1. resend.com → Domains → Add `taskelevate.com` (or a sending subdomain such as `mail.taskelevate.com`).
2. Add the DKIM/SPF records Resend displays. Resend uses its own sub-hosts (e.g. `resend._domainkey`, `send`) so the
   existing MX records for your mailbox are not affected — do **not** edit the apex MX.
3. Once verified, set `CONTACT_FROM_EMAIL` to an address on that domain and redeploy.
4. Test: submit the form on production; the email arrives with Reply-To set to the visitor.

## 6. Post-launch checklist

- [ ] `/contact` form delivers (and the "unavailable" notice is gone)
- [ ] Book-a-call button opens the real Calendly page
- [ ] Footer social/email links are correct
- [ ] Replace or delete every `isExample` project
- [ ] `/sitemap.xml` and `/robots.txt` reference `https://studio.taskelevate.com`
- [ ] Share a link in a messaging app to confirm the Open Graph preview
- [ ] Run Lighthouse (mobile + desktop) on `/` and one service page; record real results in LOG.md
- [ ] Privacy policy & terms reviewed for your jurisdiction
