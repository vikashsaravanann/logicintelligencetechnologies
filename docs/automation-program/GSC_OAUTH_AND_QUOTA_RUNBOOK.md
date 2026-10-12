# Google Search Console OAuth & Quota Operations Runbook

**Program:** Logic Intelligence Technologies (LIT) Four-Website Unified Automation Command Center  
**Document ID:** `LIT-SEO-RUNBOOK-004`  
**Classification:** Operational Runbook & Credential Guide  
**Owner:** A16 (Google Search Console Client) / A25 (Operations)  
**Last Revised:** 2026-10-12  
**Status:** ACTIVE RUNBOOK  

---

## 1. Authentication Architecture & Credential Model

LIT interacts with Google Search Console via the official **Google Webmaster Tools v1 API** (`searchconsole.googleapis.com`).

To support non-interactive background scheduling every 72 hours, LIT uses a **Google Cloud Service Account with delegated owner permissions**, with optional support for User OAuth 2.0 where interactive authorization is required.

```mermaid
flowchart LR
    subgraph LIT ["LIT Corporate Backend"]
        ENV["Vault / Environment Variables"]
        JWT["Google Auth Client (JWT / OAuth)"]
        GSC_CLIENT["gsc-client.ts"]
    end

    subgraph GoogleCloud ["Google Cloud & Search Console"]
        IAM["GCP IAM Service Account"]
        GSC_PERMS["Search Console Property: Users & Permissions"]
        API["Search Console API Endpoints"]
    end

    ENV --> JWT
    JWT --> GSC_CLIENT
    GSC_CLIENT -->|Bearer Token with webmasters scope| API
    IAM -.->|Delegated Owner Role| GSC_PERMS
    GSC_PERMS --> API
```

### Required OAuth Scopes
- Read-Only Operations: `https://www.googleapis.com/auth/webmasters.readonly`
- Sitemap Management: `https://www.googleapis.com/auth/webmasters`

---

## 2. Environment Variables & Secret Configuration

The service account credentials must be configured securely in production (Vercel Project Environment Settings or encrypted secret manager).

| Variable Name | Description | Example / Format | Sensitivity |
|---|---|---|---|
| `GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL` | Service account email address | `lit-seo-bot@lit-platform-prod.iam.gserviceaccount.com` | Internal ID |
| `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY` | PEM-encoded RSA private key | `-----BEGIN PRIVATE KEY-----\nMIIEvgIB...-----END PRIVATE KEY-----\n` | **HIGH (Secret)** |
| `GOOGLE_SEARCH_CONSOLE_PROJECT_ID` | GCP Project ID | `lit-platform-prod` | Internal ID |

> [!CAUTION]
> **Credential Masking Rule:** Raw private keys or client secrets must NEVER be printed to application logs, returned to client browser sessions, or committed to Git. `gsc-client.ts` sanitizes client email output to `lit-***@***.iam.gserviceaccount.com`.

---

## 3. Step-by-Step Operator Setup Guide

### Step 1: Create Google Cloud Service Account
1. Open Google Cloud Console: `https://console.cloud.google.com/`
2. Select or create project: `lit-platform-prod`
3. Navigate to **APIs & Services > Library** and enable **Google Search Console API**.
4. Navigate to **IAM & Admin > Service Accounts**.
5. Click **Create Service Account**:
   - Name: `lit-search-console-agent`
   - ID: `lit-seo-bot`
   - Description: `Automated 72-hour SEO inspection and sitemap verification agent for LIT 4 sites.`
6. Click **Done** (no project-level IAM roles are required; permissions are granted directly inside Search Console).
7. Under the created service account, go to **Keys > Add Key > Create New Key > JSON**.
8. Store the generated JSON key in the corporate 1Password vault. Extract `client_email` and `private_key` for environment configuration.

### Step 2: Delegate Permissions in Google Search Console
For each of the four properties in Google Search Console:
1. Open `https://search.google.com/search-console`
2. Select the property (e.g., `https://www.logicintelligencetechnologies.in/`).
3. In the left navigation, click **Settings > Users and permissions**.
4. Click **Add User**:
   - Email address: `lit-seo-bot@lit-platform-prod.iam.gserviceaccount.com`
   - Permission: **Owner** (or Full Permission). Owner permission is required to query URL Inspection API on behalf of the domain.
5. Repeat for:
   - `https://healthcare.logicintelligencetechnologies.in/`
   - `https://logicvoice.logicintelligencetechnologies.in/`
   - `https://voiceshield.logicintelligencetechnologies.in/`

---

## 4. Quota Budgeting & Safety Architecture

Google Search Console enforces hard limits per GCP project and per verified property:

```mermaid
flowchart TD
    Req[Incoming URL Inspection / Sitemap Request] --> QuotaCheck{Daily Quota < 2,000?}
    QuotaCheck -->|Yes| RateLimitCheck{Minute Rate < 600/min?}
    QuotaCheck -->|No| Degradation[Return BLOCKED_BY_QUOTA Status & Alert]
    RateLimitCheck -->|Yes| Execute[Dispatch to Google Search Console API]
    RateLimitCheck -->|No| Backoff[Exponential Backoff 1s, 2s, 4s]
    Backoff --> RateLimitCheck
    Execute --> Response{HTTP Status}
    Response -->|200 OK| Cache[Cache Inspection Result]
    Response -->|429 Rate Limit| DegradeSite[Throttle Site, Preserve Other Sites]
    Response -->|403 Forbidden| PermissionAlert[Flag GSC Permission Defect]
```

### Quota Safety Rules:
1. **Daily Budget Cap:** 2,000 requests per day across all four sites.
2. **Per-Cycle Allocation:** LIT's 72-hour cycle inspects at most 10 sampled URLs per site (= 40 requests per 72h cycle), using less than 2% of the daily quota.
3. **Emergency Rate Limiting:** `getRemainingDailyQuota()` checks remaining requests before every outbound call. If quota drops below 50, further non-critical inspections are paused.
4. **Site Isolation (QA-48):** Each site executes in an isolated try/catch context. If Site A exhausts its quota or encounters a 403, Sites B, C, and D continue processing unaffected.

---

## 5. Error Code Catalog & Troubleshooting Runbook

| HTTP Code | Error Message / Cause | Automated LIT Response | On-Call Operator Action |
|---|---|---|---|
| **`400 Bad Request`** | Malformed URL or non-matching site prefix | Marks URL as `MALFORMED_URL` anomaly. Skips URL. | Check URL parameter format in `gsc-client.ts`. Ensure URL belongs to canonical property. |
| **`401 Unauthorized`** | JWT token expired or private key rejected | Degrades to `UNCONFIGURED` state. Raises alert. | Re-check `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY` formatting in Vercel. Ensure `\n` newlines are unescaped. |
| **`403 Forbidden`** | Service account email not added as Owner in GSC property | Marks site property as `BLOCKED`. | Log in to Search Console, verify service account email is listed under Users & Permissions with Owner status. |
| **`404 Not Found`** | Sitemap URL or property does not exist in GSC | Marks sitemap as `NOT_FOUND`. | Verify property URL prefix matches exactly (including trailing slash). |
| **`429 Too Many Requests`** | Google project rate limit exceeded | Backs off exponentially; stops further inspections for active cycle. | Check whether another tool or manual user is querying GSC simultaneously. Quota resets at 00:00 Pacific Time. |
| **`500 / 503 Backend Error`** | Google internal service transient error | Retries up to 3 times with exponential backoff (10s, 30s, 90s). | If all retries fail, cycle marks site as `PARTIAL` and defers to next scheduled 72h run. No manual action needed unless persistent across 2 cycles. |

---

## 6. Verification Commands

To verify GSC connectivity and property status without modifying any data:

```bash
# In corporate app root:
node -e '
const { getGscSiteProperties } = require("./dist/lib/seo/gsc-client");
getGscSiteProperties().then(console.log).catch(console.error);
'
```

Expected output:
```json
[
  { "siteCode": "LIT-CORP", "status": "VERIFIED", "propertyType": "URL_PREFIX" },
  { "siteCode": "LIT-HC", "status": "VERIFIED", "propertyType": "URL_PREFIX" },
  { "siteCode": "LIT-LV", "status": "VERIFIED", "propertyType": "URL_PREFIX" },
  { "siteCode": "LIT-VS", "status": "VERIFIED", "propertyType": "URL_PREFIX" }
]
```
