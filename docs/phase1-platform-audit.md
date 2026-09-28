# Phase 1 — Platform audit (2026-09-21)

## Repositories

| Product | Live | GitHub |
|---------|------|--------|
| LIT corporate | https://www.logicintelligencetechnologies.in | `vikashsaravanann/Logic-Intelligence` |
| Logic Voice | https://logicvoice.logicintelligencetechnologies.in | `vikashsaravanann/logic-voice` |
| VoiceShield | https://voiceshield.logicintelligencetechnologies.in | `vikashsaravanann/voice-shield` (formerly `voiceshield-sih-2026`) |

## Product structure

| Product | Company routes | Status |
|---------|----------------|--------|
| Logic Voice | `/products/logic-voice` | Flagship personal AI assistant; live product |
| VoiceShield | `/voice-shield`, `/voice-shield/request` | Flagship voice security & risk intelligence product |
| AI Agent | `/products/ai-website-agents`, assistant `/ai` | Knowledge workspace / interactive assistant |
| AI Voice Agent | `/products/ai-voice-agents` | Business call automation |

VoiceShield and Logic Voice are **products of Logic Intelligence Technologies** Neither product is an independent legal entity.

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
