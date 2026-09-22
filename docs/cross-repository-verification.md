# Cross-Repository Verification Report

**Date:** 2026-09-22  
**Repositories:** Logic-Intelligence (A) · voiceshield-sih-2026 (B)

## 1. Integration boundary

| Concern | Owner | Method |
|---------|-------|--------|
| Corporate site, CRM, leads, admin email | LIT | Self |
| VoiceShield marketing intro + Request Access | LIT `/voice-shield*` | Public HTTPS |
| VoiceShield product console + detection UI | VoiceShield subdomain | Separate deploy |
| Auth | **Separate** (no SSO claimed) | Clear boundary |
| Pricing source of truth | LIT `src/config/pricing.ts` | Display on LIT |
| Console URL after approval | `COMPANY.products.voiceShield.consoleUrl` | Manual share |

**Do not merge repos. Do not monorepo.**

## 2. Navigation contract

| Flow | Expected | Status |
|------|----------|--------|
| LIT `/voice-shield` public | No login gate | **FIXED** (middleware was gating all marketing) |
| LIT `/voice-shield/request` public | Request workflow | **FIXED** |
| LIT → `https://voiceshield.logicintelligencetechnologies.in` | HTTPS product site | Configured in company.ts |
| VS → LIT corporate | Footer / Company link | **IMPLEMENTED** this pass |
| Localhost in production links | None | VERIFIED in configs |

## 3. Product naming

| Name | Status |
|------|--------|
| AI Agent | IMPLEMENTED (pricing id `ai-agent`) |
| AI Voice Agent | IMPLEMENTED |
| VoiceShield | IMPLEMENTED |
| AI Website Agent | REMOVED as commercial name |

## 4. Pricing (canonical USD)

| Product | Setup | Monthly | Usage |
|---------|-------|---------|-------|
| AI Agent Free | — | $0 | 100 interactions |
| AI Agent Pro | $199 | $39 | 5,000 incl. |
| AI Voice Agent | $599 | $149 | 1,000 min |
| VoiceShield | $999 | $349 | $0.05 / analyzed call |

VoiceShield product site does not publish a second price table (good).

## 5. Request Access

| Step | Owner | Status |
|------|-------|--------|
| Form UI | LIT `/voice-shield/request` | IMPLEMENTED (code) |
| Persist + notify | LIT leads/API + email | REQUIRES MANUAL SMTP proof |
| Approval → console URL | Operational process | REQUIRES MANUAL |
| VS homepage CTA | Points to corporate request | IMPLEMENTED |

## 6. Authentication

| System | Model | Status |
|--------|-------|--------|
| LIT admin/dashboard | Supabase session + role | IMPLEMENTED |
| VS login | Separate Supabase/app auth | IMPLEMENTED (UI) |
| Shared SSO | Not designed | NOT IMPLEMENTED (correct) |

## 7. Provider readiness

| Provider | Repo | State |
|----------|------|-------|
| Zoho SMTP | LIT | REQUIRES MANUAL CONFIGURATION |
| THROUGHPUTS | VS abstraction | MOCK / CONFIGURED when keys set |
| Transcription | VS | MOCK default |
| FastAPI AASIST | VS apps/api | BLOCKED — separate host |
| Twilio / Deepgram / TTS | LIT Voice Agent | BLOCKED BY API KEYS |

## 8. Quality gate (honest)

| Check | Result |
|-------|--------|
| LIT marketing public | PASS after middleware fix |
| VS site HTTPS | VERIFIED 200 |
| Cross-nav contract code | IMPLEMENTED |
| Full E2E suite both repos | NOT RUN in this environment |
| Live SMTP proof | BLOCKED / manual |
| RLS live matrix | REQUIRES MANUAL VERIFICATION |
| No secrets in NEXT_PUBLIC | Design rule — ongoing review |

## 9. Activation procedure (keys arrive)

1. LIT: Zoho app password in Vercel → one form submit → inbox proof.  
2. VS: host FastAPI + weights; set `THROUGHPUTS_*` only with verified model ID.  
3. Keep real-time detector free of LLM.  
4. Approve access requests on LIT; share console URL only after approval.

## 10. Remaining blockers

- Live SMTP / admin email end-to-end  
- FastAPI production host  
- Provider keys  
- Full automated test gate  
- Optional: product page content parity pass after middleware deploy

**PRODUCTION VERIFIED** is **not** claimed for either repository.
