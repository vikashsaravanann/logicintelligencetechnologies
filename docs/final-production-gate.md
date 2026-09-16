# Final Production Gate — 2026-09-16

**HEAD at docs write:** post-`51db1c0` (+ access-token harden)
**Production deploy verified READY:** `dpl_4UwiATYaoLYeYjV2x1utGHExN6ud` @ `51db1c0`

## Build
Vercel production build **READY** (authoritative). Local sandbox npm registry intermittent.

## Checklist PDF identity
| File | Bytes | ~Pages | SHA-256 |
|------|------:|-------:|--------|
| `public/checklist.pdf` | 463613 | 4 | `5be436e8e0d740e8ec9d1e41cf2432ea0246b6d5c0e620091924dd7663df5227` |
| `public/resources/website-development-checklist.pdf` | 61456 | 5 | `9975b71dadec65717d11a5a5034f3a54b2063fcee05dbcb0efc350e12935a325` |

Public paths **404**. No post-submit `window.open("/checklist.pdf")`.

## Live probes
- Gated PDFs 404; download API without token 401; press-kit 200
- Admin routes 307; admin APIs 401; cron without secret 401

## Env
`CRON_SECRET`, `RESOURCE_ACCESS_SECRET`, Supabase, SMTP keys present on Vercel.

## Supabase
Outreach tables applied. CRM zeroed for fresh start.

## Remaining human-only
Logged-in admin smoke; inbox confirmation after Zoho SMTP app-password verified if 535 persists.
