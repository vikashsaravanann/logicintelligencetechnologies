# Email implementation report

Project: Logic Intelligence Technologies  
Website: https://www.logicintelligencetechnologies.in/  
Date: 12 September 2026

## Executive summary

The existing Zoho + Nodemailer + React Email stack was audited and upgraded in place. This is not a provider migration and not a website rewrite.

P0 work shipped in code: header-injection protection, canonical send path with timeouts, durable outbox + unique idempotency keys, marketing suppression/unsubscribe, lead-first form semantics, form rate limits, admin/cron auth, PDF attachment checks, logo-left/banner-right header.

Items that cannot be completed from this environment are marked with the required status words below.

## Existing architecture

- Next.js App Router, Vercel, Supabase, Zoho SMTP (`smtp.zoho.in`).
- `sendEmail()` already centralized sending.
- Lead inserts already preceded some sends.
- CRON_SECRET already gated weekly recognition.
- Templates already used `@react-email/components`.

## Problems found

1. Subjects/reply-to accepted CR/LF (header injection).
2. Welcome email used check-then-send (race).
3. Newsletter ignored unsubscribed_at / had no unsubscribe link.
4. Form APIs claimed “email sent” after a database write.
5. `/api/admin/invoices` and `/admin` were unauthenticated.
6. `/api/admin/smtp-verify` was public when CRON_SECRET was unset.
7. noReply fallback hid broken mailbox config.
8. No outbox, no suppression table, no tests.
9. Email header was logo + wordmark, not logo left / banner right.
10. `env.ts` / admin client used placeholder credentials so a misconfigured deploy could look healthy.

## Architecture

See `docs/email-architecture.md`. One provider: Zoho SMTP. One sender: `src/lib/email/send-email.ts`.

## Templates

Existing templates kept. Header/footer shared. Newsletter + weekly recognition gained unsubscribe. Lead confirmation no longer promises a 24-hour reply (that SLA was not verified).

## Database

Migration: `supabase/migrations/20260912000000_email_outbox.sql`

Tables: `email_outbox` (unique `idempotency_key`), `email_attempts`, `email_suppressions`. Newsletter consent columns. RLS enabled; service role writes; authenticated admin read on outbox.

**Requires company verification** — apply this SQL in the production Supabase project. This environment cannot reach Supabase.

## Testing

Command: `npm test`  
Scope: validation + retry classification.  
Result: 13 pass, 0 fail (2026-09-12).

`npm ci` / `next build` in this sandbox: **Blocked** on prior npm registry 502s. Vercel must compile the production build.

Controlled Zoho inbox delivery: **Requires manual testing.**

## Deployment

Push to `main` triggers the existing Vercel project. No GitHub Pages.

## Manual actions

1. Apply the outbox migration in Supabase.
2. Set `EMAIL_UNSUBSCRIBE_SECRET` and confirm `CRON_SECRET` in Vercel Production.
3. Confirm Zoho SPF/DKIM/DMARC from the Zoho dashboard (**Requires DNS configuration**).
4. Send one controlled test from `/contact` to a company mailbox (**Requires manual testing**).
5. Do not run weekly recognition against customers until (3) is done.

## Known limitations

- Zoho SMTP has no verified bounce/complaint webhook in this repo. **Requires provider configuration.**
- Hobby cron is daily; outbox drain is therefore daily plus in-request fallback.
- Password reset remains Supabase Auth. **Requires company verification** of Site URL + redirect allow list.
- Two PDFs exist, not twelve. Extra brochure files were **not** invented.
- Unsubscribe mutates on POST only. Browser form redirects to a confirmation page. One-click `List-Unsubscribe=One-Click` returns JSON.

## Rollback

Revert the git commit on `main`. Leave additive SQL tables. Do not revert DNS without approval.

## Final status

| Item | Status |
| ---- | ------ |
| Repository audit | Completed |
| Canonical send path | Completed |
| Header injection protection | Completed |
| Outbox + unique idempotency | Completed |
| Marketing unsubscribe/suppression | Completed |
| Lead-first form APIs | Completed |
| Rate limits on public forms | Completed |
| Admin/cron authorization | Completed |
| Logo left / banner right | Completed |
| React Email templates preserved | Completed |
| Zoho retained | Completed |
| Unit tests | Completed |
| Production build in this sandbox | Blocked |
| Live SMTP delivery | Requires manual testing |
| SPF/DKIM/DMARC | Requires DNS configuration |
| Supabase migration apply | Requires company verification |
| Bounce/complaint webhooks | Requires provider configuration |
| Twelve-PDF portal | Not applicable |
| Provider migration off Zoho | Not applicable |
