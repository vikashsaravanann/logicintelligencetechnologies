# Admin Navigation Audit

## Canonical dashboard

`/admin/command-center` is the Admin Dashboard / Executive Command Center.

`/admin` redirects to `/admin/command-center`.

## Primary nav (`src/config/admin-nav.ts` + `AdminNav`)

| Label | Path |
|-------|------|
| Command Center | `/admin/command-center` |
| Leads | `/admin/leads` |
| AI Leads | `/admin/ai-leads` |
| Bookings | `/admin/bookings` |
| Proposals | `/admin/proposals` |
| Support | `/admin/support` |
| Exit | `/` |

## Routes inventory (`src/config/routes.ts`)

Includes: adminRoot, adminCommandCenter, adminLeads, adminAiLeads, adminBookings, adminProposals, adminProposalNew, adminSupport.

## Operational tools on Command Center

- Create Invoice (`CreateInvoiceForm`)
- Manual Email Triggers (`AdminTriggers`) — session auth only, no CRON_SECRET in browser
