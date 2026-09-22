# Email Audit — Corporate Platform

## Architecture

```
AdminTriggers / BroadcastForm
  → POST /api/admin/send-trigger
  → requireAdminApi | CRON_SECRET (machine)
  → sendEmail() [src/lib/email/send-email.ts]
  → claimOutbox → SMTP (Nodemailer) → markOutboxSent | Failure
  → writeAdminAudit
```

Public forms use the same `sendEmail` path via contact and related APIs.

## Findings

1. **Handlers exist** — button → fetch → route is wired.  
2. **Auth is server-side** — session admin or timed CRON secret.  
3. **Failures are classified** — 535 auth maps to configuration error message for admin UI.  
4. **Production blocker** — invalid/missing Zoho credentials in Vercel env (external).  
5. **Idempotency** — hourly key on admin triggers reduces double-send risk.

## Regression expectations

- Invalid email → 400  
- Non-admin → 401/403  
- SMTP unconfigured → 500 + `SMTP_UNCONFIGURED`  
- Success payload includes `status`, `outboxId`, optional `messageId`, `skipped`
