# Email security

## Threat model

Public forms can be used to inject headers, spam SMTP, or turn LIT into an open relay. Internal recipients are never taken from the request body.

## Controls implemented

| Area | Status | Evidence |
| ---- | ------ | -------- |
| Secrets | Server-only env. No NEXT_PUBLIC SMTP vars. | `.env.example`, `smtp.ts` |
| Placeholder env | Runtime treats placeholder Supabase as not live | `isSupabaseLive()` |
| Header injection | CR/LF/%0a rejected | `src/lib/email/validation.ts` + tests |
| HTML injection | User strings passed as React text, not raw HTML | templates |
| Arbitrary recipient | Internal To: from env/COMPANY only | `recipients.ts` |
| Rate limit | Contact, demo, jobs, newsletter, checklist, AI ticket | `src/lib/ai/rate-limit.ts` |
| Attachments | PDF magic bytes, 2 MB, sanitized filename | `attachments.ts` |
| Admin APIs | Company session or CRON_SECRET | `require-admin.ts` |
| /admin pages | Middleware requires company email | `src/middleware.ts` |
| Cron | Bearer CRON_SECRET, timing-safe compare | cron routes |
| Stripe webhook | Signature verification (existing) | `webhooks/stripe` |
| Signup webhook | Bearer SUPABASE_WEBHOOK_SECRET | `webhooks/signup` |
| Unsubscribe | HMAC token, POST mutation | `unsubscribe.ts` |
| RLS | Outbox/attempts/suppressions service-role only | migration |
| Preview | Non-company recipients dropped | `isPreviewEmailIsolation()` |
| Logs | Recipients masked; no SMTP passwords | `logger.ts` |

## Not implemented (honest)

- Zoho does not expose a signed bounce/complaint webhook comparable to SES/Postmark. Bounce ingestion is **Requires provider configuration**.
- CAPTCHA was not added. Current volume does not justify it; rate limits + honeypot-free forms remain.
- SSRF: checklist attaches a local `public/checklist.pdf` path only. User URLs in admin triggers must be `http(s)`.
