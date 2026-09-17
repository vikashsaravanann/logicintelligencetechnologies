# Form Audit — Logic Intelligence Technologies

**Branch:** main  
**Audit date:** 2026-09-17

## Inventory

| Form | Route | Backend | DB Table | Internal Email | Submitter Email | Status |
|------|-------|---------|----------|----------------|-----------------|--------|
| Contact | `/contact` | `POST /api/contact` | `contact_leads` | yes | yes | PASS (code) |
| Free Demo | `/free-demo` | `POST /api/free-demo` | `demo_leads` | yes | yes | PASS (code) |
| Discovery | `/discovery` | `POST /api/checklist` | `checklist_leads` | yes | yes | PASS (fixed silent errors) |
| Checklist | `/checklist` | `POST /api/checklist` | `checklist_leads` | yes | yes | PASS (code) |
| Book Consultation | `/book-consultation` | `POST /api/booking` | `bookings` | yes | yes | PASS (code) |
| Support | `/support/new` | `POST /api/support` | `support_tickets` | yes | yes | FIXED (user_id NOT NULL) |
| Jobs Apply | `/jobs` | `POST /api/jobs/apply` | `contact_leads` | yes | yes | PASS (code) |
| Resource Access | `/resources/[slug]` | `POST /api/resources/[slug]/request-access` | `contact_leads` | yes | yes | PASS (code) |
| Newsletter | Footer | `POST /api/newsletter` | `newsletter_subscribers` | N/A | double opt-in | PASS (code) |

Canonical path: Form → zod → rateLimit → insertLead (supabaseAdmin) → sendEmail (outbox + idempotencyKey) → success JSON.

Critical fix: support_tickets.user_id nullable + requester_* columns. Apply migration before production support form use.
