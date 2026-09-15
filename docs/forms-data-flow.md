# Forms data flow

```
VALIDATE → STORE LEAD (mandatory) → EMAIL OUTBOX / sendEmail (idempotent) → ADMIN
```

If store fails: HTTP 503, no success UI, no customer “we got it” email.

If store succeeds and email fails: lead remains; keys are `{workflow}:{lead_id}:internal|customer` so retries do not duplicate.

Field map (contact): `fullName` → `name`, `companyName` → `company`, plus `phone`, `project_type`, `budget`, `timeline`, `source`, `page_url` (migration `20260915120000`). Extra detail still copied into `message` for older admin views.
