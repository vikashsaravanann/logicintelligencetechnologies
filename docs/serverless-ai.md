# Serverless AI Integration (LIT)

## Architecture

```
Client (browser)
  → POST /api/serverless-ai | /api/chat | /api/ai
      → runServerlessAI()  [src/lib/ai/serverless.ts]
          → RAG grounding (optional)
          → completeWithProviders()  [xAI + Groq race]
      → JSON { reply, provider, model, grounded, latency_ms }
```

## Environment

| Variable | Purpose |
|----------|---------|
| `XAI_API_KEY` | Primary Grok chat |
| `XAI_MODEL` | e.g. `grok-3` |
| `GROQ_API_KEY` | Fallback / race partner |
| `GROQ_MODEL` | e.g. `llama-3.3-70b-versatile` |
| `GROQ_API_KEY` + embed model | Optional dense RAG |

## Endpoints

- `POST /api/serverless-ai` — unified entry (portfolio + external)
- `POST /api/chat` — site widget (tools + memory)
- `POST /api/ai` — full AI page (tools + memory)

## Deploy

Vercel deploys these as Node serverless functions (`export const runtime = "nodejs"`).
