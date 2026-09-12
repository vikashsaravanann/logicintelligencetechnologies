# Email architecture

```
Public form / webhook / cron
        │
        ▼
Validate + rate limit + sanitize headers
        │
        ▼
Persist lead / invoice / subscriber   ← must succeed independently of SMTP
        │
        ▼
claimOutbox(idempotency_key unique)
        │
        ├─ duplicate + already sent → return skipped
        │
        ▼
Render React Email (HTML + plain text)
        │
        ▼
Zoho SMTP (STARTTLS 587 or TLS 465)
        │
        ├─ temporary error → optional noReply fallback once → retrying/dead_letter
        ├─ permanent error → failed (no retry loop)
        └─ accepted → status=sent + provider message id
```

Provider: **Zoho Mail India SMTP**. Not migrated.

Serverless constraints:

- No in-process queue. Durability is `email_outbox`.
- SMTP connections are cached per instance only.
- `sendMail` is bounded by a 28s timeout.
- Vercel Hobby cron is daily; `/api/cron/email-outbox` drains retries once per day. Immediate retry is the in-request fallback sender.

Preview isolation: `VERCEL_ENV=preview` drops recipients that are not `@logicintelligencetechnologies.in` unless `EMAIL_ALLOW_PREVIEW=true`.
