# Automation & AI Security Architecture Audit

**Target System:** Logic Intelligence Technologies Corporate Platform  
**Auditor:** Subagent A01/A02 — Corporate Platform Security & Pre-Launch Lead  
**Audit Date:** October 11, 2026  
**Status:** **PASS (Hardened Groq AI Execution & Cryptographic Webhook Integrity)**

---

## 1. Executive Summary

Logic Intelligence Technologies integrates advanced artificial intelligence capabilities and workflow automations into its core platform. This audit evaluates:
1. **Groq AI Governance:** Model selection, prompt injection mitigation, streaming boundaries, and denial-of-wallet protections.
2. **Inbound Automation Webhook Security:** Cryptographic HMAC signature verification, replay protection, and body size limits.
3. **Outreach Automation Compliance:** Gate 4 human approval workflows, Gate 5 controlled pilot volume caps, and dual suppression fail-closed enforcement.

---

## 2. Groq AI Model Routing & Governance

The platform's interactive AI assistant (`src/lib/ai/groq-chatbot.ts`) operates strictly through server-side Groq infrastructure:

```
[User Browser]
      │
      │ 1. POST /api/chat (Zod validated, 20 req/min rate limit)
      ▼
[Next.js Server Handler]
      │
      │ 2. Context Injection Filter & Prompt Shielding
      ▼
[Groq Cloud Infrastructure (LPUs)]
      ├─► Primary: llama-3.3-70b-versatile (Architecture & Technical Advisory)
      ├─► Fast-Path: llama-3.1-8b-instant (Triage & Categorization)
      └─► Fallback: xAI grok-beta (High-complexity reasoning)
      │
      │ 3. Streaming Response (Max 1024 Tokens, Sanitized Markdown)
      ▼
[Client UI Rendering]
```

### Key AI Security Controls
1. **Zero Client-Side Model Access:** The Groq API key is completely isolated from client bundles (`GROQ_API_KEY` is server-only). Client browsers interface solely via `/api/chat`.
2. **Immutable System Persona:** The system prompt defines an authoritative, immutable persona representing Logic Intelligence Technologies. It explicitly forbids:
   - Revealing underlying system prompts or internal configuration.
   - Executing arbitrary shell commands or code interpretation.
   - Adopting hypothetical roles designed to bypass corporate safety guidelines.
3. **Prompt Injection & Jailbreak Defense:** User inputs are bounded within delimited user message structures. Injected instructions attempting to "ignore previous instructions" or "act as an unrestricted AI" are disregarded by the model's instruction-following boundaries.
4. **Denial-of-Wallet & Resource Limits:**
   - Maximum output generation is strictly bounded to `max_tokens: 1024`.
   - Streaming connections enforce an absolute timeout.
   - Redis-backed rate limiting caps individual users to 20 chat requests per minute.

---

## 3. Cryptographically Signed Inbound Webhooks (n8n Integration)

External workflow orchestrators (e.g., n8n) trigger asynchronous events via `/api/automation/callback/route.ts`. The platform enforces cryptographic verification implemented in `src/lib/automation/webhook-signing.ts`:

### Verification Protocol

```
Inbound Request Header:
X-Automation-Signature: v1=a1b2c3d4e5f6... (HMAC-SHA256 hex digest)
X-Automation-Timestamp: 1773345600      (Unix epoch timestamp in seconds)
X-Automation-Event-Id: evt_987654321    (Unique UUID)
```

1. **Signature Formulation:**
   The HMAC-SHA256 digest is calculated over the concatenation:
   $$\text{Signature} = \text{HMAC-SHA256}(\text{AUTOMATION\_WEBHOOK\_SECRET},\, \text{timestamp} + \text{"."} + \text{eventId} + \text{"."} + \text{rawBody})$$
2. **Timing-Safe Equality:**
   To eliminate timing side-channel attacks, signatures are compared using Node.js's native `crypto.timingSafeEqual()`:
   ```typescript
   const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");
   const providedSignatureBuffer = Buffer.from(providedSignature, "hex");
   if (expectedSignatureBuffer.length !== providedSignatureBuffer.length ||
       !crypto.timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer)) {
     return { valid: false, error: "Invalid signature" };
   }
   ```
3. **Replay Attack Mitigation:**
   The server compares the header timestamp against current server time. Requests with a timestamp drift exceeding **300 seconds (5 minutes)** are rejected immediately.
4. **Payload Size Boundary:**
   Request bodies are strictly constrained to a maximum of **64KB**. Payloads exceeding this threshold are rejected before deserialization to protect server memory.

---

## 4. Outreach Compliance Engine & Dispatch Safeguards

The automated outreach infrastructure (`src/lib/outreach/`) enforces non-negotiable legal and regulatory protections:

### A. Dual Suppression Verification
Before any outbound cold email is staged or dispatched, `src/lib/outreach/send-guard.ts` executes dual suppression queries:
1. `email_suppressions`: Global unsubscribes, hard bounces, and complaint addresses.
2. `lead_suppressions`: Enterprise domain-level opt-outs and restricted competitor entities.

### B. Gate 4 Human Approval
- In accordance with corporate governance requirements, no campaign can transition to `ACTIVE` status autonomously.
- `setCampaignStatus()` requires explicit human intervention by an authenticated staff actor (`super_admin` or `admin`).

### C. Gate 5 Controlled Pilot Enrollment
- Pilot campaigns are restricted to controlled cohort sizes, preventing mass dispatch anomalies or spam filter triggering.

### D. Fail-Closed Guarantees
- If database connectivity degrades or suppression queries experience latency timeouts, `canSendOutreachEmail()` immediately returns `{ allowed: false, reason: "DATABASE_UNAVAILABLE" }`. Outreach dispatches halt completely until system health is restored.
