# n8n Compliance Workflow Registry & Specifications
**Organization:** Logic Intelligence Technologies (LIT)  
**Date:** October 11, 2026  
**Document:** `docs/compliance/N8N-COMPLIANCE-WORKFLOW-REGISTRY.md`  
**Host URL:** `https://automation.logicintelligencetechnologies.in/`  
**Protocol:** HMAC SHA-256 Signed Webhook Payloads (`x-lit-signature`)  

---

## 1. Compliance Automation Architecture

All automation flows connecting the Next.js application to the n8n automation engine adhere to strict security boundaries:
1. **Cryptographic Authentication:** Every outbound event is signed using `signV1(secret, timestamp, eventId, rawBody)` from `src/lib/automation/webhook-signing.ts`. The signature covers timestamp, event ID, and the exact JSON payload.
2. **Replay Protection:** Timestamps older than 300 seconds (5 minutes) are rejected by webhook listeners.
3. **Fail-Closed Execution:** If n8n or the signing secret is unconfigured, dispatches return `{ state: "not_configured" }` and zero untracked messages are emitted.
4. **Groq-Only AI Boundary:** Groq may summarize legal research or draft communications. **Groq is never an approver, legal authority, or autonomous dispatcher.**
5. **No Authoritative Data in n8n:** n8n data tables are restricted to operational routing state. Authoritative consent proofs, legal basis records, and suppression lists remain solely in Supabase PostgreSQL.

---

## 2. Nine Specialized Compliance Workflows

### 1. `LIT-COMPLIANCE-RESEARCH-DRAFT`
- **Identifier:** `lit_compliance_research_draft`
- **Webhook Path:** `/webhook/lit-compliance-research-draft`
- **Event Type:** `compliance.research_drafted`
- **Purpose:** Ingests official regulator update feeds (e.g. FTC, ICO, CNIL, ACMA, TRAI); invokes Groq to produce a structured summary of changes.
- **Output:** Posts a formatted research memo to compliance counsel for review. **Never updates policy status autonomously.**

---

### 2. `LIT-COMPLIANCE-REVIEW-REMINDER`
- **Identifier:** `lit_compliance_review_reminder`
- **Webhook Path:** `/webhook/lit-compliance-review-reminder`
- **Event Type:** `compliance.review_reminder`
- **Schedule:** Daily 08:00 UTC query for rules expiring within 30 days.
- **Action:** Alerts compliance officers via Slack/email with rule references and statutory citation links.

---

### 3. `LIT-CONSENT-RECEIVED`
- **Identifier:** `lit_consent_received`
- **Webhook Path:** `/webhook/lit-consent-received`
- **Event Type:** `compliance.consent_received`
- **Purpose:** Ingests inbound lead opt-in events; validates IP, timestamp, and scope; records immutable proof in `outreach_consent_evidence`.

---

### 4. `LIT-UNSUBSCRIBE-SYNC`
- **Identifier:** `lit_unsubscribe_sync`
- **Webhook Path:** `/webhook/lit-unsubscribe-sync`
- **Event Type:** `compliance.unsubscribe_synced`
- **Trigger:** RFC 8058 One-Click unsubscribe, preference center opt-out, or manual admin entry.
- **Action:** Propagates the suppression synchronously across `email_suppressions`, `lead_suppressions`, `profiles`, and `contact_leads`. Emits audit confirmation.

---

### 5. `LIT-OUTREACH-PREVIEW`
- **Identifier:** `lit_outreach_preview`
- **Webhook Path:** `/webhook/lit-outreach-preview`
- **Event Type:** `compliance.outreach_previewed`
- **Purpose:** Dry-run audience simulation. Evaluates `evaluateOutreachEligibility()` for an audience cohort without calling SMTP transport or sending external messages.

---

### 6. `LIT-OUTREACH-APPROVAL`
- **Identifier:** `lit_outreach_approval`
- **Webhook Path:** `/webhook/lit-outreach-approval`
- **Event Type:** `compliance.outreach_approved`
- **Purpose:** Captures human compliance officer signoff for a campaign cohort. Requires explicit officer credentials, decision rationale, and target country.

---

### 7. `LIT-OUTREACH-DISPATCH`
- **Identifier:** `lit_outreach_dispatch`
- **Webhook Path:** `/webhook/lit-outreach-dispatch`
- **Event Type:** `compliance.outreach_dispatched`
- **Safeguard:** Executes final pre-flight eligibility check immediately prior to provider dispatch. If eligibility status has changed or a suppression was logged in the interim, halts dispatch immediately.

---

### 8. `LIT-OUTREACH-DELIVERY-RECONCILIATION`
- **Identifier:** `lit_outreach_delivery_reconciliation`
- **Webhook Path:** `/webhook/lit-outreach-delivery-reconciliation`
- **Event Type:** `compliance.delivery_reconciled`
- **Purpose:** Reconciles SMTP provider feedback webhooks (delivered, hard bounce, spam complaint). Hard bounces and complaints automatically trigger `LIT-UNSUBSCRIBE-SYNC`.

---

### 9. `LIT-COMPLIANCE-FAILURE-ALERT`
- **Identifier:** `lit_compliance_failure_alert`
- **Webhook Path:** `/webhook/lit-compliance-failure-alert`
- **Event Type:** `compliance.failure_alerted`
- **Trigger:** Policy bypass attempt, unexpected database exception, or unverified country dispatch attempt.
- **Action:** Raises high-priority engineering alerts and locks affected campaign queues.

---

## 3. Staging and Activation Protocol

1. All nine workflows are committed in versioned JSON format in `src/lib/automation/n8n/`.
2. Workflows operate in test/staging sandbox mode.
3. No workflow may be activated in live production without end-to-end cryptographic signature validation and compliance officer authorization.
