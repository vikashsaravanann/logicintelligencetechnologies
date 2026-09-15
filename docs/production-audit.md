# LIT production audit

**Commit:** `361e09e` (+ local: dashboard Back to Home, test:e2e → smoke:test)  
**Date:** 2026-09-15  
**Canonical:** https://www.logicintelligencetechnologies.in/

## Classification legend

WORKING | PARTIALLY WORKING | BROKEN | DUPLICATED | OBSOLETE | INSECURE | MISWIRED | NEEDS TESTING

## Architecture (WORKING)

- Next.js 16 App Router + TypeScript
- Supabase Postgres + Auth (Google + GitHub OAuth enabled)
- Zoho SMTP via centralized `sendEmail` + `email_outbox`
- Vercel production; CI typecheck/lint/build on main
- Middleware: `/` public; all other page routes require session; `/api/*` open at edge with route-level rules

## Forms (WORKING)

| Form | Path | Table | DB-first | Idempotency | Rate limit |
|---|---|---|---|---|---|
| Contact | POST /api/contact | contact_leads | yes → 503 | contact:{id}:* | 8/15m |
| Free demo | POST /api/free-demo | demo_leads | yes | demo:{id}:* | 8/15m |
| Checklist | POST /api/checklist | checklist_leads | yes | resource/discovery | 10/15m |
| Newsletter | POST /api/newsletter | newsletter_subscribers | yes | DOI | 8/15m |
| Jobs | POST /api/jobs/apply | contact_leads | yes | career:{id}:* | 5/15m |
| Booking | POST /api/booking | bookings | yes | outbox | 8/15m |
| Support | POST /api/support | support_tickets | yes | support:{id}:* | 8/15m |
| AI handoff | POST /api/ai/lead | capture | yes | existing | 8/10m |

Fake success on DB failure: **fixed** (architecture). Email failure keeps lead: **WORKING**.

## Auth (WORKING / NEEDS TESTING)

- Homepage public; marketing + AI protected — **live HTTP PASS**
- `safeNextPath` — WORKING
- Name/avatar resolution priority profiles → metadata → email — WORKING (code)
- Google OAuth config on Supabase — **PASS (API)**; interactive browser round-trip — **NEEDS TESTING** (human)

## Domain (WORKING)

- www + apex verified on Vercel; apex → www 301
- DNS: www CNAME vercel-dns; apex A Vercel
- Supabase site_url + redirect allow-list = www (and apex callback)
- /api/health: database ok, smtp ok, production delivery mode

## AI (WORKING / PARTIALLY WORKING)

- Home `/api/chat` vs Full `/api/ai` separated
- RAG + company knowledge block
- Server-only provider keys
- Live model reply: **NEEDS TESTING** (human)

## UI (WORKING / minor fixes)

- Login horizontal `lg:grid-cols-2` + Back to Home — WORKING
- Industries 6 JPGs 16:9 — WORKING
- Breadcrumbs component unused on marketing pages (no Solutions breadcrumb) — WORKING
- Primary h1 uppercase on major pages — WORKING
- Dashboard nav "Back to Website" → **fixed to "Back to Home"** this pass
- CHECKLIST_ITEMS_31_50 is data export only; not dumped as raw UI on free-demo

## Email (WORKING / NEEDS TESTING)

- Outbox + attempts + idempotency + suppression
- /api/health/email operational, queue 0
- Live inbox delivery: **NEEDS TESTING** (human one-shot)

## Tests / CI (WORKING)

- CI on 361e09e: typecheck, lint, build **success**
- test:e2e was placeholder → **now runs `npm run smoke:test`**
- Full Playwright suite still not present (smoke is production HTTP)

## Security (WORKING)

- No NEXT_PUBLIC service-role / SMTP / AI keys in client patterns
- RLS company-read policies on contact_leads
- Rate limits on public forms

## Remaining manual

1. Google login in browser once
2. One contact form → confirm email + admin lead row
3. One homepage AI message
