# Form Architecture

```
Frontend → client validation → POST /api/{form}
  → rateLimit → zod → sanitize
  → insertLead (supabaseAdmin)
  → sendEmail internal + customer (idempotencyKey)
  → { success: true }
Outbox cron → SMTP provider
```

Rules: no success UI without server success; DB failure = 503 no email; email failure after DB still returns success + outbox retry; no browser email; single sendEmail stack.
