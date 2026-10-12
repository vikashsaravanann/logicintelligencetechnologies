# Strictly Blocked & Prohibited Outreach Scenarios
**Project:** Logic Intelligence Technologies (LIT) — Global Outreach Compliance & Regulatory Gate  
**Date:** October 12, 2026  
**Auditor:** A00 Master Compliance Engineering Orchestrator  
**Status:** Absolute Compliance Directives  

---

## 1. Executive Summary

LIT enforces an unyielding **default-deny** architecture. Under no circumstances may frontend operators, backend APIs, automated cron jobs, database triggers, or n8n workflow nodes override, bypass, or circumvent the prohibitions documented in this specification.

Any attempt to dispatch outreach under the following scenarios will fail closed and be blocked synchronously by the eligibility engine, preflight gate API, and database triggers.

---

## 2. Catalog of Strictly Blocked Scenarios

### BLK-01: Direct Cold Outreach to Individual Consumers (B2C)
- **Target Channels:** `email`, `sms`, `whatsapp`, `call`, `social_dm`
- **Recipient Class:** `individual_consumer`, `sole_trader`
- **Applicable Jurisdictions:** Universal (EU/EEA, UK, Canada, Australia, India, US, etc.)
- **Statutory Grounds:**
  - EU GDPR Art. 6 & ePrivacy Directive (Directive 2002/58/EC)
  - UK PECR Regulation 22
  - Canada's CASL Section 6
  - Australia Spam Act 2003
  - US TCPA (47 U.S.C. § 227)
- **Engine Behavior:** Automatically evaluated as `state: "blocked"`, `reason_codes: ["consumer_cold_outreach_prohibited"]`.
- **Policy Overridable:** **NO.** No human operator, legal counsel, or administrator may authorize cold outreach to consumers.

---

### BLK-02: Cold SMS, MMS, or WhatsApp Marketing
- **Target Channels:** `sms`, `whatsapp`
- **Recipient Class:** Any (`corporate_subscriber`, `sole_trader`, `individual_consumer`)
- **Applicable Jurisdictions:** Universal
- **Statutory Grounds:**
  - FCC TCPA Rules & CTIA Messaging Principles
  - TRAI Telecom Commercial Communications Customer Preference Regulations (TCCCPR 2018)
  - WhatsApp Business Policy Section 1 (Opt-in Requirement)
- **Engine Behavior:** Evaluated as `state: "blocked"` unless express, verifiable written opt-in consent exists in `outreach_consent_evidence` within the statutory validity period.
- **Policy Overridable:** **NO.** Requires physical, verifiable consent proof.

---

### BLK-03: Germany (DE) Unsolicited B2B Cold Email
- **Target Channel:** `email`
- **Recipient Class:** `corporate_subscriber`, `sole_trader`
- **Applicable Jurisdiction:** Germany (`DE`)
- **Statutory Grounds:** German Act Against Unfair Competition (UWG) § 7 Abs. 2 Nr. 3.
- **Legal Context:** Unlike UK PECR, German jurisprudence consistently interprets UWG § 7 to require prior express consent for electronic mail advertising, even towards business enterprises.
- **Engine Behavior:** Evaluated as `state: "restricted"`, `reason_codes: ["mandatory_consent_evidence_missing"]`.
- **Policy Overridable:** Only permissible when an explicit opt-in or documented inbound commercial inquiry is registered in `outreach_consent_evidence`.

---

### BLK-04: Recipient Suppression Matches (Dual-Database Check)
- **Target Channels:** All
- **Applicable Jurisdictions:** Universal
- **Trigger:** Recipient email, phone, or business ID present in either `email_suppressions` or `lead_suppressions` (with `active = true`).
- **Engine Behavior:** Evaluated as `state: "suppressed"`, `reason_codes: ["active_suppression_found"]`.
- **Policy Overridable:** **NO.** Suppression records take absolute precedence over all policy rules, approvals, and campaign configurations.

---

### BLK-05: Unlisted or Undefined Jurisdictions
- **Target Channels:** All
- **Applicable Jurisdictions:** Any country code outside verified jurisdiction records.
- **Rationale:** Absence of documented legal assessment creates unmitigated regulatory exposure.
- **Engine Behavior:** Evaluated as `state: "blocked"`, `reason_codes: ["unlisted_jurisdiction_default_deny"]`.
- **Policy Overridable:** Requires formal legal review, baseline entry in `lead_jurisdictions`, and an active scoped rule in `outreach_policy_rules`.

---

### BLK-06: Expired Legal Review Policies
- **Target Channels:** All
- **Applicable Jurisdictions:** Universal
- **Trigger:** Any rule where `expires_at <= NOW()` or whose linked approval row in `outreach_policy_approvals` has passed its expiration timestamp.
- **Engine Behavior:** Evaluated as `state: "needs_review"`, `reason_codes: ["legal_approval_expired"]`.
- **Policy Overridable:** Requires explicit re-certification by `legal_counsel`, `compliance_officer`, or `dpo` via `/admin/outreach/compliance`.

---

### BLK-07: Simulated or Fake Automation Statuses in n8n
- **Trigger:** Dispatch events containing legacy pseudo-status `compliance_event_processed` or attempting to bypass the `/api/admin/outreach/preflight` gate.
- **Engine Behavior:** All 9 n8n workflows have been refactored to query the preflight API synchronously. Without an authoritative `eligible: true` signed preflight response, the n8n dispatch node branches to the Failure Handler and terminates immediately.
- **Policy Overridable:** **NO.** Hardcoded into workflow architecture.

---

### BLK-08: Transactional Classification Spoofing
- **Trigger:** Marketing, sales promotional, or lead nurturing copy disguised under `category: "transactional"` or `category: "operational"`.
- **Engine Behavior:** Inbound dispatch payloads are checked for email syntax, recipient resolution, and body content scanning. Suspected commercial solicitations submitted as transactional are flagged and halted.
- **Policy Overridable:** **NO.**
