# Admin Production Verification

**Date:** 2026-09-16

## A. Canonical dashboard
- `/admin` → `/admin/command-center` (`ADMIN_DASHBOARD_PATH`)
- Shell: `layout.tsx` + `AdminNav`

## B. Routes
`/admin`, `/admin/command-center`, `/admin/leads`, `/admin/leads/[id]`, `/admin/ai-leads`, `/admin/bookings`, `/admin/proposals`, `/admin/proposals/new`, `/admin/proposals/[id]`, `/admin/support`, `/admin/outreach`

## C. Email CTAs
| Template | Primary | Secondary |
|----------|---------|-----------|
| new-lead-notification-email | Open Admin Dashboard → command-center | Open Leads |
| checklist-submission-email | Open Admin Dashboard | Open Leads |

## D. Security (production HTTP)
| Endpoint | Unauthenticated |
|----------|-----------------|
| POST /api/admin/invoices | 401 |
| POST /api/admin/send-trigger | 401 |
| GET /api/admin/outreach/campaigns | 401 |
| GET /admin/* | 307 auth redirect |

AdminTriggers: no CRON_SECRET in browser. Support: no public ticket deep-link.

## E. NOT VERIFIED
- Logged-in browser E2E
- Invoice/SMTP end-to-end
- Email client pixel render
