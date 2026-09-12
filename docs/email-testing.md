# Email testing

## Automated (this repository)

```bash
npm test
```

Runs header-injection, recipient, URL, filename, and retry classification tests. They use synthetic addresses only (`a@lit.dev`, `jane@example.com`).

## Not run in this change

- `npm ci` / `npm run build` / `npm run typecheck` in the implementation sandbox: npm registry 502s have blocked a clean install here before. GitHub/Vercel must run the production build.
- Controlled live Zoho delivery: SMTP passwords are not available in this environment. **Requires manual testing.**
- Gmail/Outlook/Apple Mail rendering: **Requires manual testing.**
- Concurrent duplicate welcome emails against production Postgres: unit-level unique key is in the migration; live concurrency **Requires manual testing.**

## Manual production checks (company)

Use a company mailbox or an approved test address:

1. Submit `/contact` — lead appears in Supabase; two emails (internal + confirmation).
2. Submit `/free-demo`, `/checklist`, `/jobs`.
3. Subscribe + unsubscribe from the footer.
4. `GET /api/admin/smtp-verify` while signed in as a company user.
5. Do not blast weekly recognition at production users until DNS is verified.

Local development: set `EMAIL_DRY_RUN=true` so real customers are never mailed.
