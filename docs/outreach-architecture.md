# Outreach Architecture

Lead sources → contact_leads → campaign DRAFT → activate → enrollments → cron `/api/cron/outreach-followups` → marketingSendGuard → sendEmail.

Tables: outreach_campaigns, outreach_sequence_steps, outreach_enrollments, lead_activity_events.

Admin UI: `/admin/outreach`. Cron auth: Bearer CRON_SECRET only.
