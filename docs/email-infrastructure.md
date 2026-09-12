# Email infrastructure

Logic Intelligence Technologies sends mail through **Zoho SMTP** (`smtp.zoho.in`) with **Nodemailer**. Resend, SendGrid, Postmark, SES, and Gmail are not used.

Canonical sender: `src/lib/email/send-email.ts`. Routes must not create their own transporters.

## Mailboxes

Configured via per-sender env vars (`SMTP_<NAME>_HOST/PORT/USER/PASS/FROM`):

- `no-reply@logicintelligencetechnologies.in`
- `hello@logicintelligencetechnologies.in`
- `admin@logicintelligencetechnologies.in`
- `support@logicintelligencetechnologies.in`
- `vikash@logicintelligencetechnologies.in`

Legacy fallback: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`.

## Delivery path

```
validate → persist business record → claim outbox (idempotency_key) → render → Zoho SMTP → status
```

If SMTP fails after a lead write, the lead is kept. API responses say **request received**, not **email sent**, unless the caller is an admin tool.

## Marketing vs transactional

- Transactional: contact, demo, discovery, jobs, welcome, invoices, login alert, AI handoff.
- Marketing: weekly recognition. Suppression and unsubscribe are required.
- Newsletter confirmation is transactional (user-initiated) but still includes List-Unsubscribe.

## Operator actions

1. Apply `supabase/migrations/20260912000000_email_outbox.sql`.
2. Set `CRON_SECRET` and `EMAIL_UNSUBSCRIBE_SECRET` in Vercel.
3. Confirm Zoho SPF/DKIM/DMARC in DNS. Values must come from the Zoho admin — they are not stored in this repository.
4. Call `GET /api/admin/smtp-verify` with admin session or `x-cron-secret`.

This file is the current architecture. Historical notes that mention Resend or GitHub Pages mail are obsolete.
