# VoiceShield ↔ Logic Intelligence Technologies — Integration Audit

> **Audit date:** 2026-09-19  
> **Auditor:** Principal AI Solutions Architect, Logic Intelligence Technologies  
> **Status:** IMPLEMENTATION IN PROGRESS

---

## 1. VoiceShield Architecture

### 1.1 Frontend (Next.js 15 — separate repo)

| Layer | Technology | Files |
|-------|-----------|-------|
| Framework | Next.js 15 App Router | `app/`, `next.config.ts` |
| Auth | Supabase SSR (`@supabase/ssr`) | `lib/supabase/` |
| Audio pipeline | Web Audio API + AudioWorklet | `public/audio-processor.js`, `lib/audio/` |
| WebSocket client | Native WebSocket + ring-buffer | `components/AudioStreamer.tsx` |
| State | React hooks, render-prop pattern | `components/` |
| Charts | Recharts | Dashboard |
| PDF export | jsPDF | `lib/exportSection65B.ts` |
| Styling | Tailwind CSS v3 + dark slate theme | `app/globals.css` |

**Key frontend pages:**
- `/` — Marketing homepage (SIH-2026 branding)
- `/demo` — Live detection demo with AudioStreamer
- `/dashboard` — SOC (Security Operations Center) view
- `/report` — Forensic analysis report
- `/sandbox` — Splicing heatmap experiment
- `/architecture` — Technical architecture page
- `/brief`, `/docs` — Documentation pages
- `/login`, `/auth/callback` — Supabase auth

### 1.2 Backend (FastAPI — `apps/api/`)

| Component | Description |
|-----------|-------------|
| Framework | FastAPI 0.115 + Uvicorn |
| WebSocket | `/ws/audio` — raw PCM16 streaming |
| ML | AASIST/TorchScript via `SpoofModel` |
| Feature extraction | LFCC + mel-spectrogram + phase inconsistency (Python/librosa + optional Rust extension) |
| Decision engine | Threshold-based risk classifier (low/medium/high) |
| Session lifecycle | create → active → finalize |
| Audit logging | `connection_audit_logs`, `auth_audit_logs` |
| Challenge-response | `/api/challenges/` |
| Forensic analysis | `/api/forensics/analyze` — file upload + slice analysis |
| AI XAI summary | NVIDIA Nemotron-4 (`nvidia_service.py`) — **hardcoded API key** (CRITICAL security issue) |
| Alerts | Twilio WhatsApp/SMS on high-risk detection |
| Deployment target | Render.com (free tier with sleep) + Railway |

### 1.3 Database (Supabase/PostgreSQL)

VoiceShield tables:
- `profiles` — user profiles (with `role` column)
- `sessions` — voice detection sessions
- `detection_events` — per-chunk detection results
- `challenge_responses` — challenge-response records
- `connection_audit_logs` — WebSocket connection events
- `auth_audit_logs` — authentication events

14 migration files present (`0001_extensions.sql` → `0014_fix_rls_recursion.sql`)

### 1.4 ML Pipeline

```
PCM16 bytes
  → numpy float32 normalization
  → LFCC (80 features via librosa MFCC + delta, or Rust voiceshield_dsp)
  → mel-spectrogram (64 bins)
  → phase inconsistency
  → SpoofModel.predict() [TorchScript or heuristic fallback]
  → sigmoid → spoof_probability [0,1]
  → classify_risk() → (low|medium|high, action)
```

---

## 2. Logic Intelligence Technologies Architecture

### 2.1 Frontend (Next.js 16 — production)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 App Router |
| Auth | `@supabase/auth-helpers-nextjs` + custom middleware |
| Forms | `react-hook-form` + Zod |
| Email | `nodemailer` + custom `src/lib/email/` abstraction |
| Styling | Tailwind CSS v4 + glassmorphism system |
| UI primitives | `GlassSurface`, `PageHero`, `FeatureGrid`, etc. |
| Navigation | `PRIMARY_NAV` + `MORE_NAV_GROUPS` in `src/config/navigation.ts` |
| Company config | `src/config/company.ts` (COMPANY object) |
| AI | `src/lib/ai/providers.ts` — xAI (primary) + Groq (fallback) |
| Rate limiting | In-memory `Map`-based sliding window (**not distributed**) |
| RAG | `src/lib/ai/rag.ts`, `src/lib/ai/knowledge.ts` |
| Analytics | Vercel Analytics + Speed Insights |

### 2.2 Backend API Routes (Next.js)

Key routes:
- `POST /api/contact` — lead capture → DB + email
- `POST /api/ai` — streaming AI chat
- `POST /api/booking` — consultation booking
- `POST /api/newsletter` — newsletter subscription
- `POST /api/auth/send-welcome` — welcome email
- `GET/POST /api/admin/*` — admin endpoints (agent metrics, invoices)

### 2.3 Database (Supabase/PostgreSQL)

LIT tables (20+ migrations):
- `contact_leads`, `demo_leads`, `checklist_leads`
- `client_files`, `profiles`, `bookings`
- `newsletter_subscribers`
- `ai_chats`, `ai_memory`, `ai_captured_leads`
- `agent_runs`
- `knowledge_chunks` (RAG with pgvector)
- `omni_pages`, `proposals`, `invoices`
- `support_tickets`

### 2.4 Email System

Full-featured: `src/lib/email/`
- SMTP via nodemailer
- outbox with retry logic
- suppression list
- double opt-in
- audit trail
- dry-run/preview isolation

### 2.5 AI Providers

Current: xAI (primary) + Groq (fallback), OpenAI-compatible API, **NOT** THROUGHPUTS yet.

Rate limiter: **in-memory `Map`** — not production-safe for distributed deployments.

---

## 3. Architecture Overlap Analysis

### 3.1 Frontend Overlap

| Concern | VoiceShield | LIT | Resolution |
|---------|------------|-----|------------|
| Next.js version | 15.5.2 | 16.2.4 | Use LIT v16 — VoiceShield frontend components must be migrated |
| React version | 19.1.1 | 19.2.4 | Compatible |
| Tailwind | v3 | v4 | **Breaking difference** — VoiceShield classes need v4 audit |
| Supabase client | `@supabase/ssr ^0.5.2` | `@supabase/auth-helpers-nextjs ^0.8.7` | LIT pattern takes precedence |
| framer-motion | ^13 | ^12 | **Minor conflict** — stick with LIT v12 |
| Auth middleware | `lib/supabase/middleware.ts` | `src/middleware.ts` | Use LIT middleware |
| Styling system | Dark slate (`slate-950`) | Dark navy (`#0A0F1E`) with glassmorphism | VoiceShield page adopts LIT system |

### 3.2 Backend Overlap

| Concern | VoiceShield | LIT | Resolution |
|---------|------------|-----|------------|
| AI provider | NVIDIA Nemotron (hardcoded key!) + Groq | xAI + Groq | Replace NVIDIA with THROUGHPUTS; add to LIT providers abstraction |
| Database | Supabase (separate project likely) | Supabase (production) | **Extend LIT Supabase** with VoiceShield-namespaced tables |
| Auth | Supabase JWT in FastAPI headers | Supabase via Next.js | FastAPI validates Supabase JWT from LIT auth |
| Email | None | Full nodemailer system | Use LIT email |
| Rate limiting | None in FastAPI | In-memory Map in LIT | Add FastAPI rate limiting; upgrade LIT to Redis-based |
| Celery | Not present | Not present | N/A |
| Redis | Not present | Not present | Add Redis for distributed rate limiting |

### 3.3 Database Overlap

VoiceShield uses its own Supabase project. **Decision:** Extend the LIT Supabase project with VoiceShield tables prefixed with `vs_` to avoid conflicts.

LIT `profiles` table exists. VoiceShield `profiles` table also exists — **collision**. Resolution: Map VoiceShield user identity to existing LIT `profiles`.

### 3.4 Authentication Overlap

Both use Supabase. VoiceShield FastAPI validates Supabase JWT via `SUPABASE_JWT_SECRET`. This is compatible — FastAPI can validate the same JWT issued by LIT's Supabase project.

**Decision:** Unified auth — LIT Supabase issues JWT, FastAPI validates it.

### 3.5 Redis/Upstash Overlap

Neither project currently has Redis. Both need it:
- LIT: distributed rate limiting (current in-memory Map is not production-safe)
- VoiceShield: session coordination, future exact-request cache

**Decision:** Single Redis instance for both, configured via `REDIS_URL`.

### 3.6 AI Provider Overlap

| Provider | VoiceShield | LIT | Plan |
|----------|------------|-----|------|
| NVIDIA | `nvidia_service.py` (hardcoded key) | Not present | **Replace with THROUGHPUTS** |
| Groq | `groq_service.py` (unused in main flow) | Secondary provider | Keep as fallback |
| xAI | Not present | Primary provider | Keep as primary |
| THROUGHPUTS | Not present | Not yet configured | **Add as primary LLM layer** |

### 3.7 Storage Overlap

Neither uses R2 currently. VoiceShield uses Supabase Storage (`challenge-audio` bucket). `STORE_RAW_AUDIO=false` by default.

**Decision:** Keep audio storage in Supabase Storage (already configured). Add R2 only if forensic upload volumes require it — document as future infrastructure.

---

## 4. Dependency Conflicts

| Package | VoiceShield | LIT | Action |
|---------|------------|-----|--------|
| `next` | ^15.5.2 | 16.2.4 | LIT version wins |
| `tailwindcss` | ^3.4.17 | ^4 | LIT v4 — migrate VoiceShield classes |
| `framer-motion` | ^13.2.0 | ^12.43.0 | LIT v12 — check API compat |
| `lucide-react` | ^0.510.0 | ^1.37.0 | LIT version wins |
| `@supabase/ssr` | ^0.5.2 | Not used | Use LIT pattern (`auth-helpers-nextjs`) |
| `recharts` | ^3.10.1 | ^3.10.1 | ✅ Compatible |
| `date-fns` | ^4.4.0 | Not present | Add to LIT if needed |
| `jspdf` | ^4.2.1 | Not present | Add only if forensic PDF export is included |

---

## 5. Security Concerns

### CRITICAL
1. **NVIDIA API key hardcoded** in `apps/api/services/nvidia_service.py` — key visible in source code. Must be removed, replaced with `THROUGHPUTS_API_KEY` environment variable.
2. **`SUPABASE_SERVICE_ROLE_KEY` with default `"mock-service-role-key"`** in `config.py` — acceptable for tests but must be verified in production.
3. **CORS regex `https://.*\\.vercel\\.app`** — overly permissive in production; must be tightened.

### HIGH
4. Anonymous users can create sessions (`0010_allow_anonymous_demo_sessions.sql`) — verify RLS policies protect data correctly.
5. I4C report endpoint is a **mock** (`/api/report-i4c`) but returns authoritative-sounding messages — must be clearly documented as demonstration only.
6. LIT rate limiter is **in-memory `Map`** — not distributed, resets on server restart, bypassed under multiple Vercel instances.

### MEDIUM
7. Twilio credentials stored as optional empty strings — alert service silently fails if unconfigured; needs clear error handling.
8. `STORE_RAW_AUDIO=false` is correct but must be verified on production config.

---

## 6. Integration Approach — Final Decision

```
logicintelligencetechnologies (LIT) — main repo
│
├── src/app/voice-shield/page.tsx           ← NEW: Product landing page
├── src/app/voice-shield/demo/page.tsx      ← NEW: Demo page (links to VoiceShield API)
├── src/app/api/voice-shield/demo-request/  ← NEW: Demo request form API
├── src/components/voice-shield/            ← NEW: VoiceShield UI components
├── src/lib/voice-shield/                   ← NEW: Client bridge + types
├── src/config/navigation.ts                ← MODIFIED: Add VoiceShield to nav
├── src/config/company.ts                   ← MODIFIED: Add VoiceShield product config
├── src/lib/visuals/page-visuals.ts         ← MODIFIED: Add /voice-shield visual entry
├── supabase/migrations/                    ← NEW: vs_* table migrations
└── docs/                                   ← NEW: All VoiceShield docs
│
apps/voiceshield-api/                       ← SEPARATE SERVICE (FastAPI)
├── (copy of apps/api from VS repo)         ← Modified for LIT auth + THROUGHPUTS
├── config.py                               ← Updated: add THROUGHPUTS_API_KEY
├── services/inference_service.py          ← NEW: Replaces nvidia_service.py
└── Dockerfile                              ← Existing, minor updates
```

### What is NOT copied
- VoiceShield's `app/` (Next.js pages) — replaced by LIT pages
- VoiceShield's `middleware.ts` — use LIT's
- VoiceShield's auth flow — use LIT's Supabase
- VoiceShield's Supabase project config — extend LIT's
- VoiceShield's logo/banner — use LIT branding

### What IS preserved
- All `apps/api/` FastAPI backend (with modifications)
- All ML code (`app/ml/`, `core/dsp.py`)
- All WebSocket logic (`app/websocket/audio_endpoint.py`)
- All services (`session_service.py`, `audit_service.py`, `decision_engine.py`, `challenge_service.py`)
- All database schemas (migrated into LIT Supabase with `vs_` prefix)
- Frontend audio pipeline components (adapted to LIT design system)
- `public/audio-processor.js` (AudioWorklet)

---

## 7. Environment Variables Required

See `docs/voiceshield-environment.md` for the complete table.

---

## 8. Implementation Status

| Item | Status |
|------|--------|
| This audit document | ✅ COMPLETE |
| `/voice-shield` product page | 🔄 IN PROGRESS |
| Navigation update | 🔄 IN PROGRESS |
| Demo request API route | 🔄 IN PROGRESS |
| Database migration (`vs_demo_requests`) | 🔄 IN PROGRESS |
| `apps/voiceshield-api/` copy + modifications | 🔄 IN PROGRESS |
| THROUGHPUTS provider adapter | 🔄 IN PROGRESS |
| NVIDIA key removal | 🔄 IN PROGRESS |
| Environment documentation | 🔄 IN PROGRESS |
| Security documentation | 🔄 IN PROGRESS |
| Deployment documentation | 🔄 IN PROGRESS |

---

*Document maintained by Logic Intelligence Technologies. Last updated: 2026-09-19.*
