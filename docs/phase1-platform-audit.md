# Phase 1 — Platform audit (2026-09-21)

## Repositories

| Product | Live | GitHub |
|---------|------|--------|
| LIT corporate | https://www.logicintelligencetechnologies.in | `vikashsaravanann/logicintelligencetechnologies` (same tip as `Logic-Intelligence`) |
| VoiceShield console | https://voiceshield.logicintelligencetechnologies.in | `vikashsaravanann/voiceshield-sih-2026` |

## Product structure

| Product | Company routes | Status |
|---------|----------------|--------|
| AI Agent | `/products/ai-website-agents`, assistant `/ai` | Routes live; naming = AI Agent |
| AI Voice Agent | `/products/ai-voice-agents` | Routes live; personal-assistant immersive UX **not yet full redesign** |
| VoiceShield | `/voice-shield`, `/voice-shield/request` | Public overview on company site; console on subdomain |

VoiceShield is **not** a separate legal entity. Wording: product of Logic Intelligence Technologies Pvt. Ltd.

## Verified production

- SMTP: Zoho STARTTLS verified (`smtp-verify` ok; broadcast `messageId` issued)
- Admin API auth aligned with company-domain middleware
- Homepage 3-product band present
- Pricing SOT in `src/config/pricing.ts`

## Claim cleanup (this pass)

Company `/voice-shield`: removed unverified public metrics (`<250ms`, `<5.4% EER`, `0 BYTES`, `100% audit`, `269ms`, CERT-IN tags) → capability labels only.

## VoiceShield repo (this pass)

Residual SIH / judge / AICTE copy removed from privacy, terms, demo, chat route.

## Deferred / next phases

- Immersive AI Voice Agent personal-assistant UX
- Full pricing page redesign to enterprise comparison layout
- VoiceShield console sections with explicit mock/awaiting-provider states
- Provider adapters + mock mode for STT/TTS/telephony
- Full E2E/security test gate

## Blockers

- Real API keys (Twilio, Deepgram, TTS, THROUGHPUTS model IDs)
- AASIST runtime needs non-Vercel host
