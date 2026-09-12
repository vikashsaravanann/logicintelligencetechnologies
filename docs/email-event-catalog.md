# Email event catalog

Only events that exist in the repository. PDFs found: `public/checklist.pdf`, `public/docs/jobs-leadership.pdf`. There are not twelve gated PDFs.

| Event | Exists | Template | Recipient | From | Category | Idempotency | Suppression |
| ----- | ------ | -------- | --------- | ---- | -------- | ----------- | ----------- |
| Contact confirmation | Yes | lead-confirmation-email | submitter | hello | transactional | contact-confirmation:{leadId} | No |
| Contact internal | Yes | new-lead-notification-email | LEAD_NOTIFICATION_EMAIL | noReply | transactional | contact-internal:{leadId} | No |
| Demo confirmation | Yes | free-demo-confirmation-email | submitter | hello | transactional | demo-confirmation:{leadId} | No |
| Demo internal | Yes | new-lead-notification-email | LEAD_NOTIFICATION_EMAIL | noReply | transactional | demo-internal:{leadId} | No |
| Discovery confirmation | Yes | lead-confirmation-email | submitter | noReply | transactional | discovery-confirmation:{leadId} | No |
| Discovery internal | Yes | checklist-submission-email | LEAD_NOTIFICATION_EMAIL | noReply | transactional | discovery-internal:{leadId} | No |
| Checklist PDF | Yes | checklist-download-email | submitter | noReply | transactional | resource-confirmation:{leadId} | No |
| Checklist internal | Yes | new-lead-notification-email | LEAD_NOTIFICATION_EMAIL | noReply | transactional | resource-internal:{leadId} | No |
| Career confirmation | Yes | job-application-email | applicant | noReply | transactional | career-confirmation:{leadId} | No |
| Career internal | Yes | new-lead-notification-email | LEAD_NOTIFICATION_EMAIL | noReply | transactional | career-internal:{leadId} | No |
| Newsletter confirmation | Yes | newsletter-confirmation-email | subscriber | hello | transactional + List-Unsubscribe | newsletter-confirmation:{email}:{day} | Bounce/complaint blocked |
| Weekly recognition | Yes | weekly-recognition-email | selected profiles | hello | marketing | weekly:{isoWeek}:{userId} | Yes |
| Welcome | Yes | welcome-email | new user | noReply | transactional | welcome:{userId} | No |
| Login alert | Yes | login-notification-email | ADMIN_ALERT_EMAIL | noReply | security | login:{email}:{hour} | No |
| AI human handoff | Yes | new-lead-notification-email | LEAD_NOTIFICATION_EMAIL | noReply | transactional | ai-handoff:{email}:{hour} | No |
| Invoice | Yes | invoice-email | client | vikash/admin | transactional | invoice:{invoiceId} | No |
| Payment received | Yes | payment-received-email | client | vikash | transactional | payment-received:{stripeSessionId} | No |
| Admin manual triggers | Yes | matching template | operator-supplied | varies | transactional/marketing | admin-trigger:{type}:{email}:{hour} | List-unsub on testimonial |
| Password reset / magic link / signup confirm | Supabase Auth | password-reset-email.tsx unused | user | Supabase | security | Supabase-owned | N/A |
| Discovery calendar / Zoom | No | — | — | — | — | — | Not applicable |
| Twelve-PDF catalogue | No | — | — | — | — | — | Not applicable — two PDFs exist |

Auth emails are sent by **Supabase Auth**, not this app. Do not duplicate them.
