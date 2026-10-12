# Automation Credential, Key Management, and Signature Review
**Program:** LIT Four-Site Unified Automation Command Center  
**Coordinator:** A00 Master Orchestrator | A21 Security & Signatures Lead  

## 1. Webhook Signature Specification
All inter-service and n8n webhook dispatches use HMAC SHA-256 signatures computed across:
`timestamp + "." + raw_body_bytes`

### 1.1 Ingress Verification Algorithm
1. Extract `X-LIT-Signature` (hex-encoded string) and `X-LIT-Timestamp`.
2. Parse `X-LIT-Timestamp`. If `|current_time - timestamp| > 300 seconds`, reject with `401 Request Stale`.
3. Retrieve secret key for the target product from server-side environment (`N8N_WEBHOOK_SECRET_CORP`, `N8N_WEBHOOK_SECRET_HC`, `N8N_WEBHOOK_SECRET_LV`, `N8N_WEBHOOK_SECRET_VS`).
4. If secret key is empty, undefined, or matches known development defaults (`"dev-secret"`, `"secret"`), **FAIL CLOSED immediately with 500 Misconfigured**.
5. Compute expected signature = `HMAC_SHA256(secret, timestamp + "." + raw_body)`.
6. Compare expected signature and received signature using constant-time equality check (`crypto.timingSafeEqual`).
7. Check event ID in replay cache / database table. If already processed, reject or return cached response (idempotent ack).

---

## 2. Credential Health & Masking Standards
- **Secret Masking:** In all admin UI tables and API responses, credentials must be masked as `********` or `prefix_****...****_suffix`.
- **API Keys:**
  - n8n API Key: Stored in server environment or encrypted `platform_settings` table.
  - Vercel API Token: Scoped to specific team and projects; never exposed to browser.
  - Render API Key: Scoped to service monitoring; never exposed to browser.
  - Google OAuth / Service Account: Client secrets and refresh tokens reside only in server environment; access via Google Webmasters API.
