# Final forms / backend / AI audit

**Branch:** `main`  
**Base SHA audited:** `4e4a24669f8998ec53b53d35a2068fcc6a966c1d`  
**Date:** 2026-09-15

## Architecture found

- Next.js 16 App Router, Supabase Postgres + Auth, Zoho SMTP via `sendEmail` + `email_outbox`.
- Marketing site was **public**; only `/dashboard`, `/admin`, `/client`, `/profile`, `/omni` required a session.
- Contact / demo / checklist / jobs logged DB errors then still returned `{ success: true }` and sent email. That is now treated as a production defect and fixed.
- Homepage chatbot: `/api/chat`. Full workspace: `/api/ai`. RAG uses `knowledge_chunks` / `match_knowledge_chunks`.
- Industries: six verticals (healthcare, education, retail, manufacturing, finance, startups) previously used SVG placeholders.

## Forms (after this change)

| Form | Route | Table | DB mandatory | Email keys | Rate limit |
|---|---|---|---|---|---|
| Contact | `POST /api/contact` | `contact_leads` | yes → 503 | `contact:{id}:internal/customer` | 8 / 15m |
| Free demo | `POST /api/free-demo` | `demo_leads` | yes | `demo:{id}:*` | 8 / 15m |
| Checklist / discovery | `POST /api/checklist` | `checklist_leads` | yes | `resource|discovery:{id}:*` | 10 / 15m |
| Newsletter | `POST /api/newsletter` | `newsletter_subscribers` | yes | daily DOI | 8 / 15m |
| Jobs | `POST /api/jobs/apply` | `contact_leads` | yes | `career:{id}:*` | 5 / 15m |
| Booking | `POST /api/booking` | `bookings` | yes | outbox | 8 / 15m |
| Support | `POST /api/support` | `support_tickets` | yes | `support:{id}:*` | 8 / 15m |
| AI handoff | `POST /api/ai/lead` | existing capture | existing | existing | 8 / 10m |

Email failure after a stored lead still returns success for the **lead**. Delivery is retried via outbox/idempotency. Fake success on DB failure is removed.

## Auth

- `/` remains public.
- All other page routes require login with `?next=` restore.
- `/api/*`, `/auth/*`, `/login`, assets stay unblocked by middleware (API has its own rules).
- Google OAuth callback now carries `next`.

## Not verified (external)

- Live Google OAuth round-trip: **NOT VERIFIED — OAuth dashboard access required**
- SMTP live send: **NOT VERIFIED — mailbox credentials not used in this session**
- Vercel CLI token supplied was **invalid** (`User not found`). Domain/DNS dashboard: **NOT VERIFIED — VERCEL ACCESS REQUIRED**
