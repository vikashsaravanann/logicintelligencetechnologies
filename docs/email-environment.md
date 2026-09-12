# Email environment variables

Never commit real secrets. Never put SMTP passwords in `NEXT_PUBLIC_*`.

| Variable | Required | Where | Notes |
| -------- | -------- | ----- | ----- |
| SMTP_NOREPLY_HOST/PORT/USER/PASS/FROM | Production | Vercel Production | Zoho no-reply mailbox |
| SMTP_HELLO_* | Optional | Vercel | Falls back to no-reply |
| SMTP_ADMIN_* | Optional | Vercel | Falls back to no-reply |
| SMTP_SUPPORT_* | Optional | Vercel | Falls back to no-reply |
| SMTP_VIKASH_* | Optional | Vercel | Falls back to no-reply |
| SMTP_HOST/USER/PASS | Legacy fallback | Vercel | Keep until per-mailbox vars are complete |
| LEAD_NOTIFICATION_EMAIL | Recommended | Vercel | Internal To: for leads. Comma-separated allowed |
| ADMIN_ALERT_EMAIL | Optional | Vercel | Login notifications |
| CRON_SECRET | Production | Vercel | Cron + admin fallback |
| EMAIL_UNSUBSCRIBE_SECRET | Production | Vercel | HMAC for unsubscribe tokens |
| EMAIL_DRY_RUN | Dev | local | `true` skips provider |
| EMAIL_PROVIDER | Optional | local | `mock` skips provider |
| EMAIL_ALLOW_PREVIEW | Optional | Vercel Preview | Default false |
| NEXT_PUBLIC_SITE_URL | Production | Vercel | Canonical https://www.logicintelligencetechnologies.in |
| SUPABASE_SERVICE_ROLE_KEY | Production | Vercel | Outbox/suppression. Server only |
| SUPABASE_WEBHOOK_SECRET | If signup webhook used | Vercel + Supabase | |
| STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET | If invoicing used | Vercel | |

Missing SMTP credentials return `SMTP not configured`. They are **not** treated as a successful send.

Public env placeholders exist only so `next build` can complete on Vercel when build-time env is incomplete. Runtime email/lead paths call `isSupabaseLive()` and `isSmtpConfigured()`.
