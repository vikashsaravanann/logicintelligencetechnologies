# VoiceShield Deployment Architecture

## 1. Top-Level Overview

VoiceShield operates across an unbundled architecture, separating the stateless user interface from the stateful, compute-intensive ML pipeline.

```mermaid
graph TD
    Client((Browser / Client))
    
    subgraph "Vercel (Stateless)"
        Next[Next.js 16 App Router]
        Pages[Marketing / Demo Pages]
        ContactAPI[/api/contact]
    end
    
    subgraph "Persistent Host (Railway/Render)"
        FastAPI[FastAPI Backend]
        WSEndpoint[/ws/audio]
        ML[AASIST TorchScript Model]
        DSP[LFCC Extractor]
    end
    
    subgraph "Data & AI Providers"
        Supabase[(LIT Supabase)]
        Upstash[(Upstash Redis)]
        Throughputs[THROUGHPUTS AI]
    end

    Client -->|HTTPS| Next
    Next -->|HTTPS| ContactAPI
    ContactAPI -->|PostgreSQL| Supabase
    
    Client -.->|WSS (Raw PCM16)| WSEndpoint
    WSEndpoint --> DSP
    DSP --> ML
    ML -->|Events| Supabase
    
    FastAPI -->|Async XAI| Throughputs
    Next -->|Rate Limits| Upstash
```

## 2. The Next.js Frontend (Vercel)

The frontend is integrated directly into the `logicintelligencetechnologies` repository. It is deployed to Vercel via standard Git push.

**Key constraints:**
- **No WebSocket hosting:** Vercel serverless functions time out after 10–60 seconds and do not support inbound WebSocket connections.
- **No Heavy ML loading:** Vercel function limits (50MB zipped) prevent loading large PyTorch models or DSP libraries.

## 3. The FastAPI Backend (Persistent)

The `apps/voiceshield-api/` directory contains the FastAPI application. This must be deployed to a provider that supports long-running processes (e.g., Railway, Render, AWS ECS, or a VPS).

**Deployment Steps (Railway example):**
1. Connect the repository to Railway.
2. Set the Root Directory to `apps/voiceshield-api/`.
3. Railway will auto-detect the `requirements.txt` and `Procfile` / `main.py`.
4. Inject all Environment Variables listed in `voiceshield-environment.md`.
5. **Model Provisioning:** You must provide the `aasist.pt` file. Use a custom Dockerfile with a `wget` step to download the model from a private bucket during the build, or attach a persistent volume.

## 4. Database Layer (Supabase)

VoiceShield shares the LIT Supabase project but namespaces its tables using the `vs_` prefix.

**Migration execution:**
1. Ensure the `supabase CLI` is installed.
2. Run `supabase db push` to apply the `20260919000000_voiceshield_demo_requests.sql` (and other VoiceShield migrations) to the production database.

## 5. Reverse Proxy / CORS Requirements

- The FastAPI backend must have `NEXT_PUBLIC_SITE_URL` set to the exact domain of the Next.js frontend to allow WebSocket connections.
- The WSS connection requires a valid Supabase JWT passed as an initial JSON handshake message (`{"event":"session.start", "token":"<jwt>"}`) before raw PCM bytes are accepted.
