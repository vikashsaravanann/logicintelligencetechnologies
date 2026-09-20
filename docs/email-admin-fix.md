# Admin Email Root-Cause Fix (2026-09-20)

## Architecture (unchanged — no duplicate system)

```
AdminTriggers UI
  → POST /api/admin/send-trigger
  → requireAdminApi (session + profiles.role admin|super_admin)
  → React Email template
  → sendEmail()
  → claimOutbox (email_outbox)
  → nodemailer SMTP (Zoho)
  → markOutboxSent / markOutboxFailure
  → writeAdminAudit
```

## Root causes fixed

1. **Opaque 500** — Admin UI only saw "Failed to send email".
   Now returns `error`, `errorCategory`, `errorCode`, `outboxId`.

2. **SMTP 535** — Classified as `configuration` / `SMTP_535` with actionable message
   (Zoho app password / env vars). Not treated as retryable.

3. **CRON `timingSafeEqual` crash** — Unequal secret lengths threw before auth failed cleanly.
   Length-checked compare.

4. **requireAdminApi** — Returns `userId`, `email`, `role` for audit; documents that
   CRON_SECRET is NOT accepted on this helper (cron stays on send-trigger only).

5. **AdminTriggers UX** — Surfaces category/code; labels dry-run/skipped correctly.

## Production blockers (external)

| Item | Action |
|------|--------|
| SMTP_HOST | e.g. `smtp.zoho.in` |
| SMTP_PORT | `587` (STARTTLS) or `465` (TLS) |
| SMTP_USER | mailbox / Zoho user |
| SMTP_PASS | **Zoho app password** (not account password if 2FA) |
| SMTP_FROM | verified sender |
| profiles.role | set your user to `admin` or `super_admin` |

Verify: `GET /api/admin/smtp-verify` while logged in as admin.

## Broadcast page

`/admin/emails/new` remains a UI shell (no send handler). Use **Manual Email Triggers**
on Command Center / AdminTriggers for transactional sends until broadcast is scoped.
