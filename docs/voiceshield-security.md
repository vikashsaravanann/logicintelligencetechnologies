# VoiceShield Security Posture

This document outlines the security posture of the VoiceShield integration into Logic Intelligence Technologies.

## 1. Zero Trust Architecture

VoiceShield assumes that both the client environment (browser) and the network are untrusted.

- **Authentication:** Every WebSocket session requires a valid JWT signed by Supabase.
- **Authorisation:** The FastAPI backend decodes the JWT using `SUPABASE_JWT_SECRET` to verify identity and role.
- **Transport Security:** All connections require TLS 1.3 (WSS for WebSockets, HTTPS for REST API).

## 2. API Key Management

- **THROUGHPUTS_API_KEY:** This is the most sensitive credential. It is injected via environment variables only on the Vercel server and the FastAPI backend. It is **never** prefixed with `NEXT_PUBLIC_` and never transmitted to the browser.
- **FASTAPI_INTERNAL_API_KEY:** Used for server-to-server communication (Next.js -> FastAPI) for tasks like submitting forensic files. It bypasses WebSocket overhead but remains strongly authenticated.

## 3. Rate Limiting and DDoS Protection

- **Vercel Edge:** All public API routes (e.g., `/api/contact`, `/api/ai`) are protected by Upstash Redis distributed sliding-window rate limiters.
- **FastAPI Backend:** The WebSocket endpoint imposes a strict quota on the number of active connections per IP and limits the payload size per chunk to prevent buffer overflow attacks.

## 4. Remediation of Legacy Vulnerabilities

During the integration audit, a critical vulnerability was identified in the original VoiceShield codebase: a hardcoded NVIDIA Nemotron API key within the source code.

**Remediation Applied (2026-09-19):**
1. The hardcoded key was completely purged from the codebase.
2. The `nvidia_service.py` was replaced with `inference_service.py`.
3. The application now uses the `THROUGHPUTS` provider via the `THROUGHPUTS_API_KEY` environment variable.

## 5. Transparency Statement

VoiceShield does **not** claim to possess SOC 2, ISO 27001, or military-grade certifications. It relies on the robust infrastructure of its hosting providers (Vercel, Supabase, Railway) and implements standard industry best practices for application security.
