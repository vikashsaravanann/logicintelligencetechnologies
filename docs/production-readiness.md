# LIT Production Readiness

## CODE COMPLETE vs EXTERNAL vs VERIFIED

| Layer | State |
|-------|--------|
| Corporate UI + routes | CODE COMPLETE (incremental glass still open) |
| Email architecture | CODE COMPLETE |
| Admin email trigger | CODE COMPLETE |
| SMTP production delivery | EXTERNAL PROVIDER READY only after Zoho app password |
| AI / Voice providers | EXTERNAL — keys + model IDs |
| Full production gate | NOT VERIFIED end-to-end in this environment |

## Activation checklist (you)

1. Vercel env: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (Zoho **app** password), `SMTP_PORT`  
2. Confirm `EMAIL_DRY_RUN` is **not** true in production  
3. Admin login → Command Center → send test → expect status `sent` + inbox  
4. Supabase: profile `role` = `admin` or `super_admin` for your user  
5. Provider keys only when ready — no architecture rewrite

## Admin email status vocabulary

| Status | Meaning |
|--------|---------|
| `queued` | Accepted for processing / in progress |
| `sent` | Provider accepted message (messageId present) |
| `skipped` | Dry-run, preview isolation, or suppressed |
| `failed` / `retrying` / `dead_letter` | Delivery problem — surface errorCategory |

Never label UI “Sent” solely because the HTTP request returned 200 without checking `status`.
