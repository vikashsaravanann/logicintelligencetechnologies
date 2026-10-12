# Legally Approvable Outreach Scenarios & Signoff Catalog
**Project:** Logic Intelligence Technologies (LIT) — Global Outreach Compliance & Regulatory Gate  
**Date:** October 12, 2026  
**Auditor:** A00 Master Compliance Engineering Orchestrator  
**Status:** Canonical Reference Specification  

---

## 1. Executive Summary

Under LIT's **default-deny** compliance architecture, no marketing or promotional outreach may be dispatched to any recipient in any jurisdiction unless a specific, unexpired policy rule is enacted and backed by documented legal signoff from a qualified reviewer (`legal_counsel`, `compliance_officer`, or `dpo`).

This document catalogs the narrow, legally permissible outreach scenarios that **CAN** receive documented authorization when all statutory criteria, evidence requirements, and technical safeguards are satisfied.

---

## 2. Statutory Criteria for Approvable Scenarios

Every approvable scenario must fulfill four core pillars before legal signoff can be executed:
1. **Jurisdictional Legal Basis:** Grounded in specific statutory exemptions or explicit consent provisions of the recipient's home jurisdiction.
2. **Channel & Recipient Class Specificity:** Restricted to corporate subscribers / business entities (`corporate_subscriber`) on corporate email addresses; personal/consumer email and mobile channels require strict prior opt-in.
3. **Mandatory Sender Identification & Unsubscribe:** Authoritative physical address, registered company details, and a functional 1-click unsubscribe mechanism that writes immediately to both `email_suppressions` and `lead_suppressions`.
4. **Time-Bounded Authorization (Max 180 Days):** No indefinite approvals; all reviews expire at or before 180 days and must be actively re-certified.

---

## 3. Approved Scenario Catalog

### Scenario SC-01: United States (US) — B2B Cold Email Outreach
- **Governing Law:** CAN-SPAM Act (15 U.S.C. 7701 et seq.)
- **Allowed Channel:** `email`
- **Allowed Recipient Class:** `corporate_subscriber`
- **Allowed Purpose:** `cold_outreach`, `b2b_direct_marketing`
- **Mandatory Requirements:**
  - Clear, non-deceptive email subject lines.
  - Transparent disclosure that the message is an advertisement / commercial inquiry.
  - Valid physical postal address of Logic Intelligence Technologies.
  - Conspicuous, functional opt-out mechanism (processed within 10 business days).
  - Absence of recipient in `email_suppressions` or `lead_suppressions`.
- **Review Expiry Limit:** Maximum 180 days.
- **Reviewer Qualification:** `legal_counsel` or `compliance_officer`.

---

### Scenario SC-02: United Kingdom (GB) — Corporate Subscriber B2B Email Outreach
- **Governing Law:** Privacy and Electronic Communications Regulations (PECR) Regulation 22; UK GDPR
- **Allowed Channel:** `email`
- **Allowed Recipient Class:** `corporate_subscriber` (limited companies, LLPs, government bodies)
- **Allowed Purpose:** `cold_outreach`, `b2b_direct_marketing`
- **Mandatory Requirements:**
  - Legitimate Interest Assessment (LIA) documented and on file.
  - Outreach relevant to the recipient's professional role.
  - Transparent opt-out instructions in every communication.
  - **Exclusion:** Sole traders and unincorporated partnerships are treated as individual consumers and **STRICTLY EXCLUDED** without prior opt-in consent.
- **Review Expiry Limit:** Maximum 180 days.
- **Reviewer Qualification:** `legal_counsel` or `dpo`.

---

### Scenario SC-03: India (IN) — Controlled B2B Pilot Demonstration Outreach
- **Governing Law:** Digital Personal Data Protection Act 2023 (DPDP Act); TRAI TCCCPR Guidelines
- **Allowed Channel:** `email`
- **Allowed Recipient Class:** `corporate_subscriber`
- **Allowed Purpose:** `b2b_pilot_demonstration`
- **Mandatory Requirements:**
  - Limited strictly to enterprise software evaluation and pilot partner engagement.
  - Sent exclusively to registered corporate domains.
  - Fully transparent sender identity (`logicintelligencetechnologies.in`).
  - Active suppression sync across dual suppression stores.
  - Explicit isolation from general cold mass mailing.
- **Review Expiry Limit:** Maximum 180 days.
- **Reviewer Qualification:** `legal_counsel` or `compliance_officer`.

---

### Scenario SC-04: Canada (CA) — Prior Opt-In Consent or Existing Business Relationship
- **Governing Law:** Canada's Anti-Spam Legislation (CASL, S.C. 2010, c. 23)
- **Allowed Channel:** `email`
- **Allowed Recipient Class:** `corporate_subscriber`, `existing_customer`
- **Allowed Purpose:** `cold_outreach`, `inbound_followup`
- **Mandatory Requirements:**
  - **Prior Express Consent:** Recorded in `outreach_consent_evidence` with proof reference, timestamp, and IP/source; OR
  - **Implied Consent via Existing Business Relationship (EBR):** Documented contract or inquiry within 2 years / 6 months.
  - CASL-compliant identification information (LIT legal name, postal address, contact phone/email).
  - Working unsubscribe mechanism valid for at least 60 days post-dispatch.
- **Review Expiry Limit:** Maximum 180 days.
- **Reviewer Qualification:** `legal_counsel` or `compliance_officer`.

---

### Scenario SC-05: Germany (DE) & EU — Inbound Inquiries & Explicit Opt-In Follow-up
- **Governing Law:** EU GDPR (Regulation 2016/679); German UWG (§ 7 Abs. 2 Nr. 3 UWG)
- **Allowed Channel:** `email`
- **Allowed Recipient Class:** `corporate_subscriber`, `existing_customer`
- **Allowed Purpose:** `inbound_followup`, `transactional_service`
- **Mandatory Requirements:**
  - Double opt-in (DOI) evidence recorded in `outreach_consent_evidence` OR an active inbound commercial inquiry.
  - Full GDPR Article 13 disclosures (identity of controller, data protection officer contact, purpose of processing, right to object).
  - Impressum details included in email footer.
- **Review Expiry Limit:** Maximum 180 days.
- **Reviewer Qualification:** `dpo` or `legal_counsel`.

---

### Scenario SC-06: Universal — Transactional, Security & Operational Service Communications
- **Governing Law:** CAN-SPAM Section 7702(2)(B); GDPR Recital 47; PECR Regulation 22; DPDP Act Section 7
- **Allowed Channel:** `email`, `sms`
- **Allowed Recipient Class:** `existing_customer`, `corporate_subscriber`, `individual_consumer`
- **Allowed Purpose:** `transactional_service`
- **Categories:** `transactional`, `security`, `operational`
- **Scope:** Password resets, security breach notices, contract execution milestones, billing receipts, account provisioning notices.
- **Exemption:** Statutory exemption from promotional marketing opt-in and consent gates.
- **Protection:** Cannot be spoofed for marketing purposes (content safety scanner & classification guard strictly verify body text).

---

## 4. Operational Signoff Procedure in LIT Admin Console

1. **Navigate to Compliance Center:** Access `/admin/outreach/compliance`.
2. **Locate Target Policy Rule:** Identify the scoped rule matching `country_code`, `channel`, `recipient_class`, and `purpose`.
3. **Open Legal Approval Modal:** Click **"Review / Authorize Policy"**.
4. **Select Qualified Reviewer Role:** Choose `legal_counsel`, `compliance_officer`, or `dpo`.
5. **Set Expiry Duration:** Select between 30 and 180 days (system hard-blocks any value > 180 days).
6. **Enter Legal Signoff Notes & Evidence Reference:** Detail the legal rationale, regulatory statutory citation, and documentation reference.
7. **Submit Authorization:** Action synchronously records the approval in `outreach_policy_approvals`, updates `outreach_policy_rules` to `permitted`, and logs an immutable audit event in `admin_audit_log`.
