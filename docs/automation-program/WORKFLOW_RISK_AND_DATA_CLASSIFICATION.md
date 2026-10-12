# Data Classification, Privacy, and Tenant Isolation
**Program:** LIT Four-Site Unified Automation Command Center  
**Coordinator:** A00 Master Orchestrator | A22 Security & Privacy Reviewer  

## 1. Data Classification Tiers

| Data Class | Description | Permitted Systems | Strict Restrictions |
|---|---|---|---|
| **Class 0 (Public)** | Public website text, pricing plans, blogs, robots.txt, sitemaps | Any / n8n / CDN / GSC | None |
| **Class 1 (Operational)** | Aggregate counts, workflow execution durations, error categories, commit SHAs | Corporate Admin & DB | Retain for 90-365 days; no PII |
| **Class 2 (Commercial PII)** | Customer names, business emails, contract titles, invoices | Corporate Product DB | Masked in logs; consent required for comms |
| **Class 3 (Voice & Biometrics)** | Audio snippets, voiceprints, acoustic embeddings, transcription text | VoiceShield / Logic Voice DB ONLY | **NEVER send to n8n or central admin console** |
| **Class 4 (Healthcare PHI)** | Patient MRNs, clinical notes, diagnosis codes, prescription data | Healthcare Platform DB ONLY | **NEVER send to n8n or central admin console** |
| **Class 5 (Credentials/Keys)** | API keys, OAuth tokens, private certificates, DB connection strings | Secret Vault / KMS ONLY | Never committed to Git; never displayed in UI |

---

## 2. Hard Security Blocks
1. **Zero PHI in Central Operations:** The Corporate Admin dashboard at `www.logicintelligencetechnologies.in/admin` provides an operational projection. Under no circumstances are hospital patient records, MRNs, doctor notes, or appointment transcripts stored in corporate databases or displayed in corporate UI.
2. **Zero Raw Audio in Central Operations:** VoiceShield call stream audio, biometric embeddings, and raw spectrograms remain strictly isolated within VoiceShield runtime infrastructure. Central telemetry receives only event counters and risk category codes.
3. **Fail-Closed Webhook Verification:** Any incoming event without a valid, fresh HMAC SHA-256 signature is rejected immediately with HTTP 401/403. Fallback secrets are eliminated.
4. **Idempotency Guarantee:** Every external business action (sending email, issuing invoice, inviting operator) uses an idempotent lock keyed on `(product_code, event_id, workflow_key)`. Retries never double-charge, double-send, or double-invite.
