# Environment Configuration & Secrets Management

**Company:** Logic Intelligence Technologies  
**Target Domain:** https://www.logicintelligencetechnologies.in  

---

## 1. Environment Classification

| Variable Name | Environment | Exposure | Required | Purpose & Notes |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | All | Public | No (Default: `https://www.logicintelligencetechnologies.in`) | Canonical root URL for metadata, sitemaps, and redirects |
| `NEXT_PUBLIC_SUPABASE_URL` | All | Public | Yes | Supabase Project API endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Public | Yes | Supabase Anonymous Client Key (governed strictly by PostgreSQL RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Server Only | Production | Elevated database client key for cron workers and admin endpoints. **Never exposed to client bundles.** |
| `SMTP_HOST` | Server | Server Only | Optional | Default: `smtppro.zoho.in` |
| `SMTP_PORT` | Server | Server Only | Optional | Default: `465` (SSL) |
| `SMTP_USER` | Server | Server Only | Optional | Zoho Mail sender account (e.g. `no-reply@logicintelligencetechnologies.in`) |
| `SMTP_PASSWORD` | Server | Server Only | Optional | Application-specific secure password |
| `STRIPE_SECRET_KEY` | Server | Server Only | Optional | Stripe billing secret (when payments active) |
| `STRIPE_WEBHOOK_SECRET` | Server | Server Only | Optional | Stripe webhook signature verification |
| `XAI_API_KEY` | Server | Server Only | Optional | Grok/xAI inference API key for `/ai` assistant |
| `CRON_SECRET` | Server | Server Only | Optional | Bearer token required to trigger `/api/cron/*` endpoints |

---

## 2. Security Verification Checklist

- [x] **No Secrets in Source:** Scanned code base with regex rules detecting AWS keys, Stripe live keys, and private certificates.
- [x] **Safe Validation:** `npm run verify:environment` validates variable presence without ever printing values in logs or CI outputs.
- [x] **Safe Edge Fallbacks:** API endpoints fail closed or provide safe development mocks when external credentials are not present.
- [x] **Zero Client Exposure:** Client components only read `NEXT_PUBLIC_` prefixed variables.
