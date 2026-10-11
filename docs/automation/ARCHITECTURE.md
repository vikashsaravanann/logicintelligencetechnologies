# ARCHITECTURE.md — Master n8n Automation Architecture

**Organization:** Logic Intelligence Technologies (LIT)  
**Lead System Engineer:** Vikash Saravanan  
**Document Version:** 2.0 (Enterprise Production Standard)

---

## 1. Architectural Philosophy & Responsibility Boundaries

Logic Intelligence Technologies operates on a **Decoupled Orchestration Architecture**:
- **Application Core (Next.js / TypeScript App Router):** Authoritative gatekeeper for authentication, role-based access control, cryptographic signing, financial transaction validation, and business rule enforcement.
- **Authoritative Data Layer (Supabase PostgreSQL):** Single source of truth for leads, projects, client records, audit snapshots, suppression lists, and compliance logs. Enforces Row-Level Security (RLS).
- **Orchestration Layer (n8n v2.1.4 Container):** Asynchronous workflow pipeline executor. Responsible for orchestrating multi-step API integrations, AI enrichment, calendar scheduling, notification routing, and monitoring.
- **Healthcare Perimeter (FastAPI + Isolated PostgreSQL):** Strictly isolated HIPAA/DPDP perimeter. Zero Protected Health Information (PHI) enters general orchestration payloads or execution logs.

```mermaid
flowchart TD
    subgraph Client ["Client / Partner / Inbound Traffic"]
        A1["Website Inbound / Booking Form"]
        A2["Apify / Permitted Directory Lead"]
        A3["Healthcare Demo Request"]
    end

    subgraph CorePlatform ["LIT Core Web Platform (Next.js 15)"]
        B1["API Route Handlers (/api/contact, /api/booking)"]
        B2["HMAC-SHA256 Signer (webhook-signing.ts)"]
        B3["Event Dispatcher (dispatch.ts)"]
        B4["Signed Callback Handler (/api/automation/callback)"]
        B5["Cron Retry Engine (/api/cron/automation-retry)"]
    end

    subgraph AuthoritativeDB ["Authoritative State (Supabase PostgreSQL)"]
        C1["automation_events Table"]
        C2["leads & lead_scoring Tables"]
        C3["lead_suppression_list Table"]
        C4["platform_settings (Encrypted Secrets)"]
    end

    subgraph n8nInstance ["n8n Orchestration Layer (lit_n8n Docker)"]
        D1["Webhook Trigger Node"]
        D2["Verify Signature Node (HMAC v1)"]
        D3["Enrichment & Business Execution"]
        D4["Sign Callback Node (v1=HMAC)"]
        D5["Callback Node (HTTP Request)"]
    end

    A1 -->|POST /api/contact| B1
    A2 -->|Authorized Import| B1
    A3 -->|B2B Inquiry| B1

    B1 -->|Insert event status='pending'| C1
    B1 --> B2
    B2 --> B3
    B3 -->|POST /webhook/lit-* with HMAC Headers| D1

    D1 --> D2
    D2 -->|Valid Signature & <300s Skew| D3
    D2 -->|Invalid Signature| D6["Reject Execution (403)"]
    D3 --> D4
    D4 --> D5

    D5 -->|POST /api/automation/callback with HMAC Headers| B4
    B4 -->|Verify HMAC & Update status='completed'| C1
    B4 -->|Update Lead / Project Record| C2

    B5 -->|Poll status='error' & retry_count < 5| C1
    B5 -->|Re-dispatch with backoff| B3
```

---

## 2. Cryptographic Security & Zero-Trust Protocol

### 2.1 HMAC-SHA256 Payload Signature Scheme
Every outbound event dispatched from Next.js to n8n, and every inbound callback dispatched from n8n to Next.js, is signed using HMAC-SHA256:

$$\text{Signature} = \text{"v1="} + \text{HMAC-SHA256}(K_{\text{secret}}, \, T \,\|\, \text{"."} \,\|\, E_{\text{id}} \,\|\, \text{"."} \,\|\, R_{\text{body}})$$

Where:
- $K_{\text{secret}}$: Shared 256-bit secret stored in `platform_settings` / `$env.N8N_WEBHOOK_SECRET`.
- $T$: Unix timestamp in integer seconds (`x-lit-timestamp`).
- $E_{\text{id}}$: Unique event correlation UUID (`x-lit-event-id`).
- $R_{\text{body}}$: Exact UTF-8 stringified JSON payload.

### 2.2 Replay Protection Window
Both Next.js and n8n enforce a strict clock skew tolerance of **300 seconds** ($\pm 5 \text{ minutes}$):
```javascript
const nowSec = Math.floor(Date.now() / 1000);
if (Math.abs(nowSec - Number(ts)) > 300) {
  throw new Error('Signature timestamp outside tolerance window');
}
```
Any webhook with a timestamp older than 300 seconds or in the future by more than 300 seconds is rejected immediately without processing.

### 2.3 Constant-Time Comparison
To prevent timing side-channel attacks, signatures are compared strictly using constant-time byte buffers:
```typescript
crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(receivedSignature));
```

---

## 3. Reliability, Idempotency & Dead-Letter Handling

### 3.1 Idempotency Key Guarantees
Every event generated in the system receives a deterministic UUID `eventId`. The database enforces uniqueness on `eventId` in `automation_events`:
- If n8n attempts to submit the same callback multiple times, the database ignores subsequent mutations or marks them as idempotent acknowledgments.
- No duplicate emails or project tasks can be created from repeated webhook delivery.

### 3.2 State Machine
Every automation event transitions through an audited lifecycle:
```
[PENDING] 
   │
   ├──> [DISPATCHED] (HTTP 2xx received from n8n webhook)
   │        │
   │        ├──> [PROCESSED / COMPLETED] (Signed callback received)
   │        └──> [ERROR] (Timeout or failure reported)
   │
   └──> [FAILED_TO_DISPATCH] (Network error or n8n unreachable)
            │
            └──> [RETRY_LOOP] (Automated cron re-drive, max 5 attempts)
                     │
                     └──> [DEAD_LETTER] (Escalated to admin dashboard)
```

### 3.3 Dead-Letter Queue & Automated Recovery
1. The cron runner at `/api/cron/automation-retry` executes every 5 minutes.
2. It queries `automation_events` for rows where `status IN ('error', 'failed_to_dispatch')` and `retry_count < 5`.
3. An exponential backoff calculation ($2^{\text{retry\_count}} \times 60 \text{ seconds}$) ensures struggling downstream services are not hammered.
4. Once `retry_count >= 5`, the event transitions to `DEAD_LETTER` state, triggering `OPS-04` reliability alerting.
5. Administrators can inspect payload details, examine error stacks, and manually re-drive failed events directly from `/admin/automations`.

---

## 4. Multi-Service Lead Intelligence Pipeline

Rather than assuming every lead is seeking a website, the platform evaluates incoming opportunities across **15 Technical Service Categories**:

```mermaid
flowchart LR
    Inbound["Lead Inbound Payload"] --> Tax["Service Taxonomy Engine"]
    Tax --> Score["Evidence-Based Scoring Engine"]
    
    subgraph Categories ["15 Service Domains"]
        C1["WEB_DEVELOPMENT"]
        C2["APP_DEVELOPMENT"]
        C3["GAME_DEVELOPMENT"]
        C4["AI_AUTOMATION"]
        C5["SAAS_DEVELOPMENT"]
        C6["HEALTHCARE_TECH"]
        C7["CYBERSECURITY"]
        C8["+ 8 Other Categories"]
    end
    
    Tax --> Categories
    Categories --> Score

    subgraph ScoringWeights ["0–100 Evidence Dimensions"]
        W1["Technical Need (0-25)"]
        W2["Service Fit (0-20)"]
        W3["Commercial Intent (0-15)"]
        W4["Verified Contactability (0-15)"]
        W5["Industry & Scale (0-15)"]
        W6["Geographic Clearance (0-10)"]
    end

    Score --> ScoringWeights
    ScoringWeights --> Decision{"Score Evaluation"}
    Decision -->|>= 80| P1["Priority P1 (Immediate Architecture Review)"]
    Decision -->|60 - 79| P2["Priority P2 (Standard High-Fit Lead)"]
    Decision -->|40 - 59| P3["Priority P3 (Nurture Sequence)"]
    Decision -->|< 40| P4["Priority P4 (Low Fit)"]
    Decision -->|Missing Facts| IE["INSUFFICIENT_EVIDENCE (Awaiting Data)"]
    Decision -->|Burner Domain| DQ["DISQUALIFIED (Suppressed)"]
```

---

## 5. Non-PHI Healthcare Isolation Boundary

```mermaid
flowchart TD
    subgraph CorporateDomain ["Corporate Automation Perimeter"]
        LIT01["LIT-01 Lead Capture"]
        HLT01["HLT-01 Healthcare Demo Inquiry"]
        CorpDB["Corporate Supabase DB"]
    end

    subgraph SecurityFirewall ["Strict Non-PHI Boundary (HIPAA / DPDP)"]
        FW1["Payload Scrubber & PHI Keyword Gate"]
        FW2["Zero Clinical Notes / Prescriptions Allowed"]
        FW3["Separate Service Roles & Database Clusters"]
    end

    subgraph HealthcareDomain ["Restricted Healthcare Platform (/lit-smart-hospital-platform)"]
        FastAPI["FastAPI Backend (Python 3.11)"]
        HospitalDB["Clinical PostgreSQL Database (RLS Enforced)"]
        ABHA["ABHA / Ayushman Bharat Digital Gateway"]
    end

    HLT01 --> FW1
    FW1 -->|Validated B2B Commercial Data Only| CorpDB
    FW1 -.->|BLOCKED if PHI detected| Reject["Immediate Rejection (400)"]

    CorporateDomain -.->|NO ACCESS TO CLINICAL DATA| HospitalDB
    FastAPI --> HospitalDB
    FastAPI --> ABHA
```
