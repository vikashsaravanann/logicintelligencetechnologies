# Form audit — Logic Intelligence Technologies

**Date:** 2026-09-16  
**Commit base:** 5947e2d + booking email wiring fix

## Matrix

| Form | Route | API | Table | Internal email | Customer email | Reply-To | Rate limit | Idempotency | Status |
|---|---|---|---|---|---|---|---|---|---|
| Book Consultation | /book-consultation | POST /api/booking | bookings | yes (sendEmail) | yes | customer email | 8/15m | booking:{id}:* | FIXED (code) |
| Contact | /contact | POST /api/contact | contact_leads | yes | yes | customer | 8/15m | contact:{id}:* | PASS (code) |
| Free Demo | /free-demo | POST /api/free-demo | demo_leads | yes | yes | customer | 8/15m | demo:{id}:* | PASS (code) |
| Discovery | /discovery | POST /api/checklist | checklist_leads | yes | yes | — | 10/15m | discovery/resource | PASS (code) |
| Checklist | /checklist | POST /api/checklist | checklist_leads | yes | yes | — | 10/15m | resource:* | PASS (code) |
| Newsletter | — | POST /api/newsletter | newsletter_subscribers | DOI | DOI | — | 8/15m | DOI keys | PASS (code) |
| Jobs | /jobs | POST /api/jobs/apply | contact_leads | yes | yes | — | 5/15m | career:{id}:* | PASS (code) |
| Support | /support | POST /api/support | support_tickets | yes | yes | customer | 8/15m | support:{id}:* | PASS (code) |
| AI handoff | Home AI / /ai | POST /api/ai/lead | capture | existing | existing | — | 8/10m | existing | PASS (code) |
| Resource download | resources/[slug] | POST /api/contact | contact_leads | via contact | via contact | — | contact | contact | PASS (code) |

## Book Consultation — root cause

**DB path was working** (live POST returned 201 + bookingId).

**Email path was incomplete:**
1. Used `enqueueEmail` with only a JSON dump HTML body (no React template).
2. **No internal LIT notification** was created.
3. Outbox row left in `processing` without the full `sendEmail` SMTP path used by contact/demo.
4. Frontend read `data.error` while API returned `data.message` → generic client errors.

**Fix applied:**
- Persist via `insertLead("bookings", …)`.
- `sendEmail` internal (`booking:{id}:internal`) with Reply-To = customer.
- `sendEmail` customer confirmation (`booking:{id}:customer`).
- Frontend uses `data.message || data.error`.
- DB failure → 503; email failure does not drop the booking.

## Contract

```
VALIDATE → RATE LIMIT → SANITIZE → insertLead → sendEmail×2 (idempotent) → 201
DB fail → 503, no success UI
Email fail → lead kept, logged
```
