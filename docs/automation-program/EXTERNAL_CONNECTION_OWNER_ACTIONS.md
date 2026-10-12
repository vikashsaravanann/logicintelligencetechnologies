# External Connection Status, Required Permissions & Operator Action Runbook

**Program:** Logic Intelligence Technologies (LIT) Four-Website Unified Automation Command Center  
**Document ID:** `LIT-OPS-EXTERNAL-007`  
**Classification:** Provider Integration, Credential Audit & Operator Provisioning Guide  
**Owner:** Worker 4 (Technical SEO, Infrastructure & Multi-Site Specialist / A24, A25)  
**Last Revised:** 2026-10-12  
**Status:** ACTIVE OPERATOR RUNBOOK  

---

## 1. Executive Summary

This document provides a comprehensive audit of all external third-party cloud integrations, API providers, credential states, and required operator provisioning actions across the four LIT properties.

Under program security policies, **all secret keys, tokens, and credentials are cryptographically masked** (e.g., `whsec_*****`). In compliance with **Gate G0 and Gate G5**, any connection requiring external human provisioning is explicitly designated as `BLOCKED_AWAITING_OWNER_ACTION` rather than falsely displayed as operational.

---

## 2. External Provider Connection Status Matrix

| Provider / Service | Environment | Credential Type | Verification State | Active Blocker / Action Required |
|---|---|---|---|---|
| **Vercel CLI (Local Workstation)** | Local / CLI | Scoped Session Token | **VERIFIED (Active)** | Authenticated as `logicintelligencetechnologies-1801` (Team: `logic-9ed4`). |
| **Vercel CLI (GitHub Actions)** | CI/CD | `VERCEL_TOKEN` Secret | **BLOCKED** | Repository secret invalid or expired; requires owner token update in GitHub Secrets. |
| **Google Search Console** | Multi-Site | OAuth 2.0 Refresh Token | **BLOCKED** | Requires operator OAuth authorization code grant for corporate GSC account. |
| **Cal.com Cloud** | Corporate | API Key & Webhook Secret | **STAGING MOCKED** | Staging HMAC verified; live corporate Cal.com account secret requires owner entry. |
| **Google Gmail API** | Corporate | OAuth 2.0 / Service Account | **STAGING TESTED** | Staging `TEST-DAY5` mailbox verified; production mailbox delegation pending owner grant. |
| **Google Gemini API** | Multi-Site | `GEMINI_API_KEY` | **CONFIGURED** | Google Cloud API key provisioned for `gemini-2.5-flash-lite`. |
| **n8n Automation Engine** | Self-Hosted | `N8N_API_KEY` & Basic Auth | **VERIFIED** | Connected to `https://automation.logicintelligencetechnologies.in`. |
| **Supabase (PostgreSQL)** | Multi-Site | `SUPABASE_SERVICE_ROLE_KEY` | **VERIFIED** | Database migration schemas applied; RLS policies active. |

---

## 3. Step-by-Step Operator Action Runbooks

### 3.1. Vercel CI/CD Production Token Repair (Immediate Action)
To unblock automated GitHub Actions deployments on `.github/workflows/production.yml` (QA-77):
1. **Access Vercel Console:** Navigate to `https://vercel.com/account/tokens`.
2. **Generate Token:**
   - Click **Create Token**.
   - Name: `gh-actions-lit-automation-prod`
   - Scope: Select Team **Logic** (`team_mmKBzYcmZkj4Y6aELMLU3Jen`).
   - Expiration: 90 Days.
3. **Update GitHub Repository Secret:**
   - Navigate to `https://github.com/logicintelligencetechnologies/settings/secrets/actions`.
   - Update Secret Name: `VERCEL_TOKEN` with the newly generated token (`vercel_tok_*****`).
   - Verify `VERCEL_ORG_ID` is set to `team_mmKBzYcmZkj4Y6aELMLU3Jen`.
   - Verify `VERCEL_PROJECT_ID` is set to `prj_Oij4lC7BxRmiAcxim3REtNuNms0y`.
4. **Trigger Verification Build:** Run `workflow_dispatch` on `production.yml` to confirm successful build and deploy.

### 3.2. Google Search Console Multi-Property Authorization
To enable the 72-hour SEO inspection and sitemap submission engine across all 4 hostnames:
1. **Domain Ownership Verification:**
   - In Google Search Console (`https://search.google.com/search-console`), add the 4 URL-prefix properties:
     - `https://www.logicintelligencetechnologies.in/`
     - `https://healthcare.logicintelligencetechnologies.in/`
     - `https://logicvoice.logicintelligencetechnologies.in/`
     - `https://voiceshield.logicintelligencetechnologies.in/`
   - Verify ownership via DNS TXT record on apex domain `logicintelligencetechnologies.in` or via HTML tag in Next.js `<head>`.
2. **Google Cloud OAuth 2.0 Client Setup:**
   - Navigate to Google Cloud Console (`https://console.cloud.google.com/apis/credentials`).
   - Create OAuth 2.0 Client ID (Application Type: Web Application).
   - Authorized Redirect URI: `https://www.logicintelligencetechnologies.in/api/seo/gsc/oauth/callback`.
   - Required Scopes:
     - `https://www.googleapis.com/auth/webmasters`
     - `https://www.googleapis.com/auth/webmasters.readonly`
3. **Authorize in Admin Console:**
   - Open Corporate Admin: `/admin/seo/gsc`.
   - Click **Connect Google Search Console**.
   - Authenticate with authorized Google Account holding Owner permissions on the 4 properties.
   - The system stores the encrypted refresh token in `public.automation_credentials`.

### 3.3. Cal.com Enterprise Webhook Configuration
To enable bi-directional booking confirmation and cancellation synchronization:
1. **Access Cal.com Settings:** Log into `https://app.cal.com/settings/developer/webhooks`.
2. **Create Webhook:**
   - Subscriber URL: `https://www.logicintelligencetechnologies.in/api/webhooks/calcom`
   - Secret: Generate a 32-byte cryptographic string (`whsec_*****`).
   - Triggers: Select `BOOKING_CREATED`, `BOOKING_RESCHEDULED`, and `BOOKING_CANCELLED`.
3. **Configure Environment Secrets:**
   - Set in Vercel / Corporate Environment:
     - `CALCOM_WEBHOOK_SECRET=whsec_*****`
     - `CALCOM_API_KEY=cal_live_*****`
     - `CALCOM_CONSULTATION_URL=https://cal.com/lit-technologies/consultation`
4. **Verify Endpoint:** Send a test ping from Cal.com and verify HTTP 200 OK receipt in `/admin/automations/events`.

### 3.4. Gmail API Production Delegation
To transition from the staging `TEST-DAY5` filter to corporate inquiry handling:
1. **Designate Support Mailbox:** Confirm official corporate receiving address (e.g., `contact@logicintelligencetechnologies.in`).
2. **Enable Gmail API in Google Cloud:**
   - Enable Gmail API on project `lit-infrastructure-prod`.
   - Create Service Account with Domain-Wide Delegation.
   - Authorize Scopes in Google Workspace Admin Console:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/gmail.modify`
3. **Configure Environment Variables:**
   - `GMAIL_SERVICE_ACCOUNT_EMAIL=lit-automation-mailer@lit-infrastructure-prod.iam.gserviceaccount.com`
   - `GMAIL_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"`
   - `GMAIL_IMPERSONATED_USER=contact@logicintelligencetechnologies.in`

---

## 4. Credential Masking & Audit Trail Invariants

1. **Zero Cleartext Logging:** Under no circumstances may raw API keys, OAuth access tokens, client secrets, or private keys be printed in terminal standard output, browser consoles, or database error traces.
2. **Vault Segregation:** Production keys are stored strictly in Vercel Encrypted Environment Variables or Supabase Vault.
3. **Least Privilege Principle:** Service accounts are restricted strictly to authorized operations. The Gmail integration is scoped solely to the designated customer inquiry inbox and cannot inspect employee personal email.
