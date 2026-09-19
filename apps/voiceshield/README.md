# VoiceShield — LIT Product Integration

**VoiceShield**  
AI Security & Voice Fraud Intelligence  
**A Logic Intelligence Technologies product.**

## Architecture (do not merge FastAPI into Vercel)

```text
logicintelligencetechnologies/          # this repo — company website (Vercel)
├── src/app/voice-shield/               # PUBLIC product page + demo gate
├── src/components/voice-shield/        # marketing sections
├── apps/voiceshield/                   # THIS FOLDER — gated UI only (admin / post-demo)
└── (no Torch / WebSocket server here)

voiceshield-sih-2026/                   # separate repo — deploy FastAPI elsewhere
└── apps/api/                           # WebSocket + AASIST + Torch (Railway/Render/VPS)
```

## Access model

| Audience | Route | Behavior |
|----------|--------|----------|
| Public | `/voice-shield` | Product marketing + **Request Demo** |
| Public | `/voice-shield/demo` | Coming soon / backend dependency gate |
| Admin / approved demo | Future: gated app under admin or tokenized link | Full UI only after auth or demo approval |
| Live mic detection | Requires `FASTAPI_INFERENCE_URL` | Not hosted on Vercel |

## What belongs here vs SIH repo

**Copy into LIT (this monorepo area) only:**
- Marketing-aligned UI components (already under `src/components/voice-shield`)
- Docs, env variable names, integration notes
- Optional future gated Next.js client pages (no long-lived WebSocket server)

**Keep in VoiceShield SIH repo / separate host:**
- FastAPI
- AASIST / TorchScript
- WebSocket PCM pipeline
- Celery workers (if used)

## Required env (set in Vercel / host — never commit secrets)

```text
THROUGHPUTS_API_KEY=
THROUGHPUTS_BASE_URL=https://api.throughputs.in/v1
THROUGHPUTS_INFERENCE_MODEL=
THROUGHPUTS_EXTRACTION_MODEL=
THROUGHPUTS_FRAUD_MODEL=

FASTAPI_INFERENCE_URL=
FASTAPI_INTERNAL_API_KEY=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

R2_ENDPOINT_URL=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=

TRANSCRIPTION_URL=
TRANSCRIPTION_API_KEY=
```

## Status

- Public product page: live on company domain
- Live AASIST demo: blocked until FastAPI is deployed and `FASTAPI_INFERENCE_URL` is set
- This folder is the integration home for gated UI work — not a full dump of the SIH monorepo
