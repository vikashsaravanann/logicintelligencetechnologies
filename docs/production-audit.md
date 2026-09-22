# LIT Corporate Platform — Production Audit

**Repository A only:** `vikashsaravanann/logicintelligencetechnologies`  
**Site:** https://www.logicintelligencetechnologies.in/  
**Date:** 2026-09-22  
**Scope:** Corporate website + admin + email + CRM. **Not** VoiceShield product repo (`voiceshield-sih-2026`).

VoiceShield product app: https://voiceshield.logicintelligencetechnologies.in/  
LIT owns only corporate `/voice-shield` landing + request access → approved console URL.

---

## 1. Product architecture (canonical)

| Product | Route(s) | Notes |
|---------|----------|-------|
| **AI Agent** | `/ai`, `/products/ai-website-agents` | Assistant experience = AI Agent, not a 4th product |
| **AI Voice Agent** | `/products/ai-voice-agents` | Separate product |
| **VoiceShield** | `/voice-shield`, `/voice-shield/request` | Corporate intro; console is external domain |

Pricing source of truth: `src/config/pricing.ts` (matches approved commercial figures).

---

## 2. Stack

| Layer | Status |
|-------|--------|
| Next.js 16 + React 19 | IMPLEMENTED |
| Supabase auth/DB | IMPLEMENTED (code); live RLS REQUIRES MANUAL VERIFICATION |
| Nodemailer + outbox + SMTP | IMPLEMENTED |
| Admin Command Center | IMPLEMENTED (UI + APIs); full QA REQUIRES ADMIN SESSION |
| Playwright / unit tests | PARTIALLY IMPLEMENTED (scripts present) |
| THROUGHPUTS / Twilio production | BLOCKED BY EXTERNAL CREDENTIALS |

---

## 3. Email system (P0)

**Path:** Admin UI → `POST /api/admin/send-trigger` → `requireAdminApi` → `sendEmail` → outbox → SMTP → status.

| Piece | Status |
|-------|--------|
| Central `sendEmail()` | IMPLEMENTED |
| Outbox + idempotency | IMPLEMENTED |
| Admin auth on trigger | IMPLEMENTED |
| Error surfacing (535, unconfigured) | IMPLEMENTED |
| Live SMTP delivery | REQUIRES MANUAL CONFIGURATION (Zoho app password in Vercel) |
| Fake “Sent” when only queued | FIXED in UI messaging this pass (status-aware) |

**Root cause of historical “button doesn’t send”:**  
Almost always **SMTP configuration** (535 auth / missing `SMTP_*`), not missing button handlers. Code returns `success: false` with `errorCategory` when provider fails. Production must set valid Zoho app password; dry-run must not be mistaken for delivery.

---

## 4. Admin Command Center

Routes under `/admin/*`: leads, bookings, proposals, support, emails, emails/new, invoices, analytics, status, voiceshield-requests, ai-leads, command-center.

| Item | Status |
|------|--------|
| Server-side admin gate | IMPLEMENTED (`requireAdminApi`) |
| Manual email triggers | IMPLEMENTED |
| Broadcast single-recipient form | IMPLEMENTED |
| Metrics from real DB | REQUIRES MANUAL VERIFICATION per widget |
| CRON_SECRET ≠ admin session | IMPLEMENTED (separate machine auth path) |

---

## 5. Forms → DB → email

Contact/leads pipeline uses `/api/contact` and related routes (prior work). Full live smoke still needs one production submission per form type.

---

## 6. VoiceShield corporate integration

| Item | Status |
|------|--------|
| `/voice-shield` product page | IMPLEMENTED |
| `/voice-shield/request` gated form | IMPLEMENTED |
| Console URL only post-approval | DESIGNED (`COMPANY.products.voiceShield.consoleUrl`) |
| No full VS app in this repo | CORRECT |

---

## 7. Readiness matrix

| AREA | STATUS |
|------|--------|
| Three-product naming in nav/pricing | IMPLEMENTED |
| Email code path | IMPLEMENTED |
| Email production SMTP proof | REQUIRES MANUAL CONFIGURATION |
| Admin Command Center | IMPLEMENTED / REQUIRES MANUAL QA |
| AI Agent runtime providers | BLOCKED BY API KEYS |
| AI Voice Agent (Twilio/STT/TTS) | BLOCKED BY API KEYS |
| Full E2E suite green | REQUIRES MANUAL VERIFICATION |
| Liquid-glass all marketing routes | PARTIAL |

**Do not claim PRODUCTION VERIFIED** until SMTP live proof + admin session QA + provider keys where claimed live.
