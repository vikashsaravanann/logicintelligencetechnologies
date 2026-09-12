# Email runbook

## SMTP not configured / delivery failed

Symptoms: forms return “Request received” but no mail arrives; logs show `smtp_unconfigured` or `delivery_failed`.

1. Confirm Vercel Production has `SMTP_NOREPLY_PASS` (and other mailbox app passwords).
2. `GET /api/admin/smtp-verify` with an admin session.
3. Check Zoho mailbox sending limits and app-password status.
4. Do not rotate DNS blindly.

Leads remain in `contact_leads` / `demo_leads` / `checklist_leads` even when mail fails.

## Duplicate emails

Idempotency is `email_outbox.idempotency_key` unique. If duplicates still appear, the migration has not been applied.

## Unsubscribe complaints

`/unsubscribe` → `email_suppressions`. Weekly recognition skips suppressed rows. Re-subscribe from the site clears `reason=unsubscribe` only, not bounce/complaint.

## Outbox backlog

`GET /api/cron/email-outbox` with `Authorization: Bearer $CRON_SECRET`. Hobby plan runs this daily at 10:00 UTC. Temporary failures retry with backoff; permanent 5xx/5.5.0 class errors go to `failed`.

## Rollback

1. Revert the GitHub commit on `main` (Vercel redeploys).
2. Leave the SQL tables in place — they are additive.
3. Do not roll back DNS without company approval.

## Auth emails

Password reset and magic links are sent by Supabase Auth. Misconfigured Site URL / redirect allow list is a Supabase dashboard issue, not this SMTP path.
