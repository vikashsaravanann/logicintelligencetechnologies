# Infrastructure Ecosystem — Logic Intelligence Technologies

This document outlines the authoritative infrastructure ecosystem, repository separation model, cloud deployments, and services across **Logic Intelligence Technologies** and its products.

---

## 1. Repository Separation Model

Logic Intelligence Technologies operates a strict multi-repository architecture. Product implementations **MUST NOT** be merged into the corporate website repository.

```
┌────────────────────────────────────────────────────────────────────────┐
│               Logic Intelligence Technologies                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  1. Corporate Website Repo                                             │
│     GitHub: vikashsaravanann/Logic-Intelligence                        │
│     Role: Corporate identity, marketing, product hub, client portal   │
│     Deploy: Vercel                                                     │
│                                                                        │
│  2. Logic Voice Repo                                                   │
│     GitHub: vikashsaravanann/logic-voice                               │
│     Role: Voice-first personal AI assistant client & orchestrator      │
│     Deploy: Vercel (frontend) + Render (backend)                       │
│                                                                        │
│  3. VoiceShield Repo                                                   │
│     GitHub: vikashsaravanann/voice-shield                              │
│     Role: Voice security & risk intelligence platform                  │
│     Deploy: Vercel (console) + Render (analysis engine)                │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure Inventory Matrix

| Resource | Logic Intelligence (Corporate) | Logic Voice | VoiceShield |
|---|---|---|---|
| **Public Website** | `https://www.logicintelligencetechnologies.in/` | `https://logicvoice.logicintelligencetechnologies.in/` | `https://voiceshield.logicintelligencetechnologies.in/` |
| **GitHub Repository** | `vikashsaravanann/Logic-Intelligence` | `vikashsaravanann/logic-voice` | `vikashsaravanann/voice-shield` |
| **Vercel Project** | `vikashsaravananns-projects/logic-intelligence-technologies` | `vikashsaravananns-projects/logic-voice` | `vikashsaravananns-projects/voice-shield` |
| **Render Backend URL** | *N/A (Next.js serverless)* | `https://logicvoice-backend.onrender.com` | `https://voiceshield-sih-2026.onrender.com` |
| **Render Service ID** | *N/A* | `srv-daropnvavr4c73fimjvg` | `srv-dagt0u142hec73evfifg` |
| **Supabase Instance** | `https://dzvy8s93j.supabase.co` | `https://xdsdghywxvdbbtnwwxpi.supabase.co` | `https://ynxmidkzwxhsvoyqmpsh.supabase.co` |

> **IMPORTANT INFRASTRUCTURE NOTE (VOICESHIELD RENDER URL):**  
> Although the VoiceShield GitHub repository was renamed from `voiceshield-sih-2026` to `voice-shield`, its Render backend remains **`https://voiceshield-sih-2026.onrender.com`**. Do not modify the Render URL.

---

## 3. Technology Ecosystem & Roles

- **GitHub:** Source code management across segregated repositories.
- **Vercel:** Edge and serverless hosting for frontends and marketing applications.
- **Render:** Containerized Python / FastAPI backends handling compute-intensive tasks, WebSocket connections, and voice pipelines.
- **Supabase:** PostgreSQL database, authentication, row-level security (RLS), and real-time data sync.
- **Python / FastAPI / SQLAlchemy / Alembic:** Backend service stack used for API servers, database migrations, and pipeline orchestration.
- **DeepSeek & NVIDIA API:** Specialized inference and LLM endpoints for contextual reasoning and analysis tasks.
- **Next.js & Tailwind CSS:** Frontend application framework powering responsive, accessible, and fast web interfaces.
