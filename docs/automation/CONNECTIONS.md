# External Systems, Connectors & Secret Management Architecture

**Platform:** Logic Intelligence Technologies (LIT)  
**Classification:** Enterprise Confidential / Infrastructure Architecture  
**Document Reference:** `LIT-SEC-CON-003`  
**Version:** 1.0.0  
**Effective Date:** October 2026  
**Status:** Approved & Enforced  

---

## 1. System Overview & Architecture

The Logic Intelligence Technologies (LIT) ecosystem integrates with specialized third-party services and infrastructure connectors to execute automated workflows, communication dispatches, AI inference, and database synchronization.

In accordance with **Zero-Trust Architecture (NIST SP 800-207)**, all external connections are mutually authenticated, encrypted via TLS 1.3 in transit, strictly rate-limited, and governed by a tiered credential resolution hierarchy.

```
┌────────────────────────────────────────────────────────────────────────┐
│               EXTERNAL CONNECTORS & INTEGRATION TOPOLOGY               │
└────────────────────────────────────────────────────────────────────────┘

                           ┌───────────────────────────────┐
                           │      LIT APPLICATION CORE     │
                           │     (Next.js App Router)      │
                           └───────────────┬───────────────┘
                                           │
         ┌───────────────────┬─────────────┼─────────────┬───────────────────┐
         │                   │             │             │                   │
         ▼                   ▼             ▼             ▼                   ▼
  [ n8n Engine ]       [ Supabase ]   [ Resend/SMTP ] [ Groq AI ]     [ Gateways ]
  - Automation Host    - Corporate DB - Trans. Email  - LLM Inference - WhatsApp / SMS
  - Port 443 / TLS 1.3 - Healthcare DB- SPF/DKIM/BIMI - Zero Retent.  - DLT Registered
  - HMAC Webhooks      - Forced RLS   - Webhook Sync  - Token Bucket  - Opaque Alerts
```

---

## 2. Connector Specifications & Inventory

### 2.1 n8n Automation Engine

| Property | Specification |
|---|---|
| **Canonical Endpoint** | `https://automation.logicintelligencetechnologies.in` |
| **Instance Health Probe** | `GET https://automation.logicintelligencetechnologies.in/healthz` |
| **REST API Base** | `https://automation.logicintelligencetechnologies.in/api/v1` |
| **Outbound Webhooks** | `/webhook/lit-*` (e.g., `/webhook/lit-contract-signed`, `/webhook/lit-onboarding-submitted`) |
| **Completion Callback** | `POST https://logicintelligencetechnologies.in/api/automation/callback` |
| **Authentication Scheme** | Dual-Layer: Bearer API Key for REST management; HMAC-SHA256 (`v1=<hex>`) for webhooks |
| **Request Timeout** | 8,000 ms strict timeout (`AbortSignal.timeout(8000)`) |
| **Access Invariant** | n8n has **zero** direct database access, zero Supabase service-role keys, and no persistent patient data. |

#### Operational Behavior
The LIT application communicates with n8n via two channels:
1. **Management Channel (REST API)**: Synchronizes workflow JSON definitions (`src/lib/automation/n8n/*.json`), queries instance health, and verifies active workflow states. Authenticated via `X-N8N-API-KEY` and `Authorization: Bearer <key>`.
2. **Event Channel (Signed Webhooks)**: Dispatches business events using cryptographic HMAC-SHA256 signatures (`x-lit-signature`). Upon completion, n8n issues a signed callback to LIT's callback endpoint.

---

### 2.2 Supabase PostgreSQL (Corporate & Healthcare Databases)

To maintain regulatory isolation (HIPAA & DPDP Act 2023), the Corporate and Healthcare data planes reside in distinct Supabase projects:

| Parameter | Corporate Database | Healthcare Database |
|---|---|---|
| **Target Application** | `logicintelligencetechnologies` | `lit-smart-hospital-platform` |
| **Data Scope** | CRM, leads, contracts, onboarding, client portal, platform settings, audit logs. | Organizations, facilities, clinical staff, EHR, lab orders, pharmacy, beds, billing. |
| **Connection Pooling** | Supabase Transaction Pooler (Port 6543 / PgBouncer) | Supabase Transaction Pooler (Port 6543 / PgBouncer) |
| **Direct DB URL** | `DATABASE_URL` (Port 5432, migrations only) | `HEALTHCARE_DATABASE_URL` (Port 5432, migrations only) |
| **Client Secrets** | `NEXT_PUBLIC_SUPABASE_URL`<br>`NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_HEALTHCARE_SUPABASE_URL`<br>`NEXT_PUBLIC_HEALTHCARE_SUPABASE_ANON_KEY` |
| **Server Secrets** | `SUPABASE_SERVICE_ROLE_KEY` | `HEALTHCARE_SUPABASE_SERVICE_ROLE_KEY` |
| **Security Invariant** | Forced RLS on all public tables; `platform_settings` restricted to `service_role`. | Forced RLS; sensitive review queues locked in `lit_private` schema (deny-all). |

---

### 2.3 Resend & Transactional SMTP Email Delivery

| Parameter | Resend Connector (Corporate) | SMTP Connector (Healthcare) |
|---|---|---|
| **Primary Use** | Client onboarding, contract confirmations, newsletter double opt-in, magic links. | Appointment receipts, staff onboarding invitations, payment receipts, patient portal alerts. |
| **Provider** | Resend Inc. (`https://api.resend.com`) | Zoho ZeptoMail / Custom Enterprise SMTP |
| **Credentials** | `RESEND_API_KEY` | `SMTP_HOST`, `SMTP_PORT` (587/465), `SMTP_USERNAME`, `SMTP_PASSWORD` |
| **Authorized From** | `LIT Team <support@logicintelligencetechnologies.in>` | `LIT Smart Hospital <notifications@logicintelligencetechnologies.in>` |
| **DNS Hygiene** | SPF (`v=spf1 include:resend.com ~all`), DKIM (2048-bit), DMARC (`p=reject`), BIMI | SPF (`v=spf1 include:zoho.in ~all`), DKIM, DMARC (`p=reject`), BIMI |
| **Delivery Tracking** | Webhook verification via Svix (`RESEND_WEBHOOK_SECRET`) | Outbox retry worker with status recording in `email_audit_log` |
| **Content Guard** | Automated PII redaction on metadata | Absolute prohibition of PHI, diagnostic results, or physician notes in email copy |

---

### 2.4 Groq AI / LLM APIs

| Property | Specification |
|---|---|
| **Target Endpoint** | `https://api.groq.com/openai/v1/chat/completions` |
| **Supported Models** | `llama-3.3-70b-versatile`, `mixtral-8x7b-32768` |
| **Primary Use** | Natural language lead extraction, outreach copy adaptation, knowledge base RAG query expansion. |
| **Authentication** | `GROQ_API_KEY` via HTTP header `Authorization: Bearer <GROQ_API_KEY>` |
| **Data Protection** | Ephemeral inference processing; zero customer prompt retention by provider agreement. |
| **Rate Limiting** | Sliding window rate limiting: max 30 requests/minute per client IP via Upstash Redis. |
| **Strict Boundary** | **NO PHI or clinical records are ever transmitted to Groq AI.** AI operations are strictly restricted to the Corporate platform. |

---

### 2.5 GitHub Actions & Vercel Deployment Webhooks

| Connector | Mechanism & Endpoints | Security Controls |
|---|---|---|
| **GitHub Actions** | Automated CI/CD runner executing tests, secret scans, Ruff, ESLint, and Docker image builds. | Scoped `GITHUB_TOKEN` with read permissions; deployment secrets stored in GitHub encrypted environment secrets; force pushes prohibited. |
| **Vercel Deploy Webhook** | `POST https://api.vercel.com/v1/integrations/deploy/...` | Triggers production deployment; URL contains high-entropy secret token; accessible only to authorized CI runners. |
| **Vercel Inbound Webhooks** | `POST https://logicintelligencetechnologies.in/api/webhooks/vercel` | Receives deployment state notifications (`deployment.succeeded`, `deployment.error`); verified via `x-vercel-signature` HMAC. |

---

### 2.6 Twilio, WhatsApp & SMS Messaging Gateways

| Provider / Channel | Integration Endpoint & Auth | Regulatory & Security Constraints |
|---|---|---|
| **Authkey WhatsApp** | `https://console.authkey.io/restapi/requestjson.php`<br>`AUTHKEY_API_KEY` | Explicit opt-in verification required; pre-approved Meta message templates only; zero diagnostic information in message text. |
| **textbee.dev SMS** | `https://api.textbee.dev/api/v1/gateway/devices`<br>`TEXTBEE_API_KEY`, `TEXTBEE_DEVICE_ID` | India Telecom Commercial Communications Customer Preference Regulations (TCCCPR) DLT compliance; registered Principal Entity (PE) ID and Sender ID. |
| **Twilio (Fallback)** | `https://api.twilio.com/2010-04-01/Accounts/...`<br>`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Inbound delivery receipts validated using Twilio cryptographic signature header `X-Twilio-Signature`. |

---

## 3. Credential Resolution Hierarchy

To provide enterprise resilience, zero-downtime key rotation, and seamless operational continuity, Logic Intelligence Technologies implements a **Two-Tier Credential Resolution Hierarchy**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                    CREDENTIAL RESOLUTION FLOWCHART                     │
└────────────────────────────────────────────────────────────────────────┘

               Incoming Request / Automation Worker Task
                                   │
                                   ▼
                  [ 1. Query Supabase Database ]
                  SELECT key, value FROM public.platform_settings
                  WHERE key IN ('n8n_base_url', 'n8n_api_key')
                  (Executed via supabaseAdmin / service_role)
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
          [ Keys Found in DB ]          [ Empty / DB Error ]
                    │                             │
                    ▼                             ▼
       Validate & Sanitize Values      [ 2. Fallback to Environment ]
         (cleanUrl / cleanKey)         process.env.N8N_BASE_URL
                    │                  process.env.N8N_API_KEY
                    │                             │
                    ├─────────────────────────────┘
                    │
                    ▼
       Check Completeness: Base URL & API Key present?
                    │
         ┌──────────┴──────────┐
         │                     │
      [ YES ]                [ NO ]
         │                     │
         ▼                     ▼
  Normalize Base URL     Return State:
  (HTTPS check in prod)  "NOT CONFIGURED"
         │               (Fails Closed)
         ▼
  Ready for Dispatch
```

### 3.1 Tier 1: Supabase `platform_settings` Table (Primary)

The application first attempts to load credentials dynamically from the database:

- **Storage Table**: `public.platform_settings`
- **Schema**:
  ```sql
  CREATE TABLE public.platform_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    updated_by text
  );
  ```
- **Access Control**: Table has forced Row-Level Security (`ALTER TABLE public.platform_settings FORCE ROW LEVEL SECURITY`). Privileges are revoked from `PUBLIC`, `anon`, and `authenticated`. Only the backend `service_role` can access or modify settings.
- **Administrative Interface**: Configurable by authenticated Super Admins via the protected modal at `/admin/automations` (invoking `POST /api/admin/automations/import`).
- **Advantage**: Permits instant key rotation and instance URL updates without requiring a full code redeployment or container restart.

### 3.2 Tier 2: Server Environment Variables (Fallback)

If the database table returns null or the database is undergoing maintenance, the resolution logic seamlessly falls back to the hosting platform's environment variables:

```typescript
// Canonical resolution implementation (src/lib/automations/n8n-client.ts)
export async function resolveN8nCreds(): Promise<{ base: string; apiKey: string } | null> {
  // 1. Check platform_settings in Supabase first
  try {
    const { data } = await supabaseAdmin
      .from("platform_settings")
      .select("key, value")
      .in("key", ["n8n_base_url", "n8n_api_key"]);

    if (data && data.length > 0) {
      const map = new Map(data.map((d) => [d.key, d.value]));
      const dbBase = cleanUrl(map.get("n8n_base_url"));
      const dbKey = cleanKey(map.get("n8n_api_key"));
      if (dbBase && dbKey) {
        return { base: dbBase, apiKey: dbKey };
      }
    }
  } catch {
    // Non-fatal fallback to environment variables
  }

  // 2. Fallback to process.env
  const base = cleanUrl(process.env.N8N_BASE_URL);
  const apiKey = cleanKey(process.env.N8N_API_KEY);
  if (!base || !apiKey) return null;
  return { base, apiKey };
}
```

### 3.3 Sanity & Sanitization Rules

To prevent misconfigurations, whitespace corruption, or trailing slash mismatches:
1. **Quote Stripping (`cleanKey`, `cleanUrl`)**: Trims leading/trailing whitespace and removes enclosing single or double quotes introduced during copy-paste.
2. **URL Normalization (`normalizeN8nBase`)**: Strips trailing slashes, removes accidental `/api/v1` path suffixes, and enforces HTTPS in production environments.

---

## 4. Credential Rotation & Secret Hygiene Procedures

All operational secrets are subject to strict lifecycle controls. Routine rotation is executed every **90 days**, while emergency rotation must be completed within **1 hour** of any suspected credential exposure.

### 4.1 Rotation Cadence Matrix

| Secret / Credential | Rotation Cadence | Rotation Authority | Impact Window |
|---|---|---|---|
| `N8N_API_KEY` | 90 days | Super Admin | Zero downtime via `platform_settings` |
| `N8N_WEBHOOK_SECRET` | 90 days | Security Lead | Dual-verification window (5 minutes) |
| `SUPABASE_SERVICE_ROLE_KEY` | 180 days | Cloud SecOps | Brief redeploy required |
| `RESEND_API_KEY` | 90 days | Platform Lead | Zero downtime (atomic cutover) |
| `GROQ_API_KEY` | 90 days | Platform Lead | Zero downtime (atomic cutover) |
| `RAZORPAY_WEBHOOK_SECRET` | 90 days | Finance / SecOps | Updated simultaneously in dashboard & env |

---

### 4.2 Standard Runbooks for Credential Rotation

#### Runbook A: Rotating the n8n API Key (Zero Downtime)
1. **Generate New Key**: Log into n8n Admin Console (`https://automation.logicintelligencetechnologies.in`) -> *Settings* -> *n8n API* -> *Create API Key*.
2. **Update Platform Settings**: Navigate to LIT Admin (`https://logicintelligencetechnologies.in/admin/automations`), open *Configure Engine*, paste the new key, and save.
3. **Verify Liveness**: Check that the automation engine badge immediately transitions to `"CONNECTED"` with active workflow counts.
4. **Revoke Old Key**: In the n8n Admin Console, delete the deprecated API key.
5. **Update Environment**: Update `N8N_API_KEY` in Vercel Project Settings for consistency.

#### Runbook B: Rotating the Webhook HMAC Shared Secret (`N8N_WEBHOOK_SECRET`)
To prevent dropping webhooks during rotation, use an overlapping grace window:
1. **Generate High-Entropy Secret**: Execute `openssl rand -hex 32` to produce a 256-bit cryptographically secure secret.
2. **Update n8n Container**: Inject the new secret into the n8n Docker environment (`N8N_WEBHOOK_SECRET=new_secret`) and restart the container.
3. **Update Application Secret**: Immediately update `N8N_WEBHOOK_SECRET` in Vercel environment variables and trigger an instantaneous production promotion.
4. **Validate Test Webhook**: Dispatch a synthetic health check event and assert `200 OK` from `/api/automation/callback`.

#### Runbook C: Rotating Database Service-Role Keys
1. **Generate New Secret**: In Supabase Dashboard -> *Project Settings* -> *API*, click *Generate New JWT Secret* / *Rotate service_role Key*.
2. **Update Hosting Environments**: Simultaneously update `SUPABASE_SERVICE_ROLE_KEY` across Vercel production environments and local `.env.local` files for engineering leads.
3. **Redeploy Application**: Trigger a production deployment on Vercel.
4. **Audit DB Connections**: Inspect `pg_stat_activity` to verify all legacy connections have terminated and new sessions utilize the rotated credentials.

---

## 5. Emergency Revocation & Incident Playbook

In the event of an inadvertent git commit, unauthorized access alert, or suspected token exfiltration:

```
[ EMERGENCY RESPONSE PROTOCOL (SEV-1) ]
1. IMMEDIATE REVOCATION: Revoke compromised token in provider dashboard (< 15 mins).
2. ROTATE CREDENTIAL: Generate replacement token and apply via platform_settings or Vercel.
3. PURGE COMMIT HISTORY: If committed to git, execute `git filter-repo` or BFG Repo-Cleaner
   and force-push sanitized refs. Invalidate all local clones.
4. AUDIT COMPROMISE WINDOW: Query `admin_audit_log` and provider access logs for the
   duration between token exposure and revocation. Identify all IP addresses and actions.
5. FILE COMPLIANCE REPORT: If healthcare databases were exposed, initiate HIPAA Breach
   Notification Assessment (45 CFR § 164.400-414) within 24 hours.
```

---

## 6. Secret Hygiene Commandments for Developers

1. **Never Commit Secrets**: Do not commit `.env`, `.env.local`, `.pem`, `.key`, or credentials to source control.
2. **Never Echo Secrets in Logs**: Use `redactMetadata()` for all logging; never print raw request headers or database query strings containing tokens.
3. **No Secrets in Client Code**: Never prefix private API keys or database secrets with `NEXT_PUBLIC_`.
4. **Restrict Scopes**: Always provision API tokens with the minimum necessary permissions (Principle of Least Privilege).
5. **Mandatory Secret Scanning**: All pull requests must pass automated CI secret scanning before merge approval.
