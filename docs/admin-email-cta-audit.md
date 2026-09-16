# Admin Email CTA Audit

| Email | Primary CTA | Destination |
|-------|-------------|-------------|
| New Lead (`new-lead-notification-email`) | Open Admin Dashboard | `/admin/command-center` |
| New Lead | Open Leads (secondary) | `/admin/leads` |

Canonical site URL: `EMAIL.siteUrl` → `https://www.logicintelligencetechnologies.in`

Client transactional emails (invoice, payment, kickoff) continue to use client portal URLs (`/client/dashboard` or `/dashboard` where intentional for customers). Admin internal notifications use `/admin/*` only.
