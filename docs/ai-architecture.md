# AI architecture

Two products, one knowledge layer:

1. **Home chatbot** (`/api/chat`) — short, conversion-oriented, RAG-grounded, 1–4 short replies, one follow-up question. Handoff via `capture_lead` once per conversation + `[HUMAN_HANDOFF]`.
2. **Full `/ai` workspace** (`/api/ai`) — authenticated, longer technical answers, existing RAG and tools preserved.

Provider keys remain server-only (`GROQ_API_KEY` / `GROK_API_KEY` / `XAI_API_KEY`). Never `NEXT_PUBLIC_*`.

Telegram sources with embedded keys must be rotated outside this repo. Those secrets were **not** copied here.

Live model calls: **NOT VERIFIED — provider key not exercised in this session**.
