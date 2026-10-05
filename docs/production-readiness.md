# Production readiness — LIT website

Last updated: 2026-09-21

## Product structure (PASS)

```
AI Agent (/products/ai-website-agents + /ai assistant)
AI Voice Agent (/products/ai-voice-agents)
VoiceShield (/voice-shield) — LIT product, not a separate company
```

## Email (IMPLEMENTED — verify credentials live)

- Central path: `sendEmail` → outbox → Zoho SMTP
- Admin triggers: `/api/admin/send-trigger`
- Admin compose: `/admin/emails/new` → type `broadcast` (single recipient)
- Errors surface `errorCategory` / `errorCode` (incl. SMTP_535)

### Required env (server-only)

| Key | Purpose |
|-----|---------|
| SMTP_HOST | e.g. smtp.zoho.in |
| SMTP_PORT | 587 or 465 |
| SMTP_USER | mailbox |
| SMTP_PASS | Zoho **app password** |
| SMTP_FROM | verified from |
| SMTP_SECURE | true if 465 |

### QA checklist (admin session)

1. Login with `profiles.role` = `admin` or `super_admin`
2. `GET /api/admin/smtp-verify` → `{ ok: true }`
3. Manual Email Triggers → send to **your** inbox
4. `/admin/emails/new` → single message to your inbox
5. Confirm mailbox delivery

## Liquid glass

- Tokens: `src/app/styles/glass.css`
- Component: `GlassSurface`
- Homepage product band + shell marker ready
- Deeper per-page card migration continues incrementally

## Deferred

- Twilio / STT / TTS voice runtime
- THROUGHPUTS model IDs
- VoiceShield AASIST host (non-Vercel)

## Tests

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:e2e
```
