# VoiceShield Artificial Intelligence Architecture

VoiceShield utilises a bifurcated AI architecture: **Deterministic Edge ML** for real-time detection, and **Generative LLM (THROUGHPUTS)** for asynchronous forensic intelligence.

## 1. Deterministic Edge ML (AASIST)

The core anti-spoofing engine is based on **AASIST** (Audio Anti-Spoofing using Integrated Spectro-Temporal graph attention networks).

- **Why AASIST?** Large Language Models (LLMs) cannot process raw audio features deterministically in under 50ms. AASIST is a dedicated, highly optimised PyTorch model explicitly trained on the ASVspoof datasets to detect vocoder artefacts, synthetic frequencies, and phase irregularities.
- **Inference Speed:** Executed on CPU via TorchScript, the inference latency per 333ms chunk is typically 10–25ms.
- **Features Extracted:** LFCC (Linear Frequency Cepstral Coefficients) and Mel-spectrograms.

## 2. Generative Forensic Intelligence (THROUGHPUTS)

While AASIST provides a numerical probability (e.g., `0.85`), humans require context. We use **THROUGHPUTS** (an OpenAI-compatible LLM provider) to generate Explainable AI (XAI) summaries.

- **Trigger Condition:** LLM inference is NEVER triggered in the hot real-time WebSocket path. It is only invoked asynchronously after a session concludes, or via the `/api/forensics/analyze` batch endpoint.
- **Provider Migration:** VoiceShield previously hardcoded an NVIDIA Nemotron API key. This was removed. The application now uses the `THROUGHPUTS_API_KEY` and routes requests through `THROUGHPUTS_BASE_URL` (`https://api.throughputs.in/v1`).
- **Graceful Fallback:** If the THROUGHPUTS API is unreachable or times out, the backend gracefully falls back to deterministic rule-based text generation based on the feature metrics.

## 3. LIT Unified AI Abstraction

VoiceShield's generative AI needs are integrated into the LIT unified AI architecture (`src/lib/ai/providers.ts`).

1. **Exact-Request Caching:** All `THROUGHPUTS` requests for the same telemetry data are cached in Upstash Redis using a SHA-256 hash of the prompt. This prevents redundant LLM billing for identical forensic reports.
2. **Provider Hierarchy:**
   - **Primary:** THROUGHPUTS (`throughputs-core-latest`)
   - **Fallback 1:** xAI (`grok-3-mini`)
   - **Fallback 2:** Groq (`llama-3.1-8b-instant`)

## 4. VoiceShield AI Assistant (Chatbot)

The VoiceShield product pages can leverage the global LIT AI assistant. The AI assistant context window should be augmented with VoiceShield's product marketing and technical details, allowing it to answer customer questions about voice security automatically.
