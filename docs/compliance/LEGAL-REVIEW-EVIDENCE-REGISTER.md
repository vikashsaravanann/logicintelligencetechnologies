# Legal Review & Evidence Register
**Organization:** Logic Intelligence Technologies (LIT)  
**Date:** October 11, 2026  
**Document:** `docs/compliance/LEGAL-REVIEW-EVIDENCE-REGISTER.md`  

---

## 1. Compliance Review Standard & Approver Authority

Under Logic Intelligence Technologies Compliance Policy:
1. **Zero Automated Legal Approvals:** Neither Groq nor any AI component possesses authority to create, approve, or loosen compliance rules.
2. **Qualified Reviewers Only:** Every policy rule must be authored and signed by an authorized Legal & Regulatory Compliance Officer holding jurisdiction-appropriate legal qualifications (e.g. Bar Admission, Solicitor Practicing Certificate, or certified Data Protection Officer status).
3. **Strict Rule Expiry:** All legal approvals expire after a maximum of **180 days (6 months)**. Expired rules automatically revert the system to `review_required` / default-deny.
4. **Immutable Audit Trail:** Approvals and revocations are persisted to the database table `outreach_policy_approvals` with cryptographic hash digests of the evidence documentation.

---

## 2. Review Record Schema

Every compliance review requires the following structured metadata:
- `rule_id`: Unique identifier referencing the normalized policy rule.
- `jurisdiction`: ISO 3166-1 alpha-2 country code.
- `channel`: Specific channel (`email`, `sms`, `whatsapp`, `call`, `social_dm`).
- `recipient_class`: Recipient classification (`corporate_subscriber`, `sole_trader`, `individual_consumer`, `existing_customer`).
- `purpose`: Direct marketing classification (`cold_outreach`, `inbound_followup`, `transactional_service`).
- `legal_basis`: Documented legal ground (e.g. `PECR_REG22_CORPORATE_LIA`, `CAN_SPAM_COMMERCIAL_OPTOUT`, `INBOUND_EXPRESS_CONSENT`).
- `statutory_citation`: Dated authoritative reference (e.g. "ICO B2B Guidance v3.2, Section 4.1").
- `reviewer_name`: Full legal name of reviewing compliance counsel.
- `reviewer_role`: Specific title and authority level.
- `approval_date`: Timestamp of formal signoff.
- `expiry_date`: Timestamp after which the rule automatically deactivates.
- `decision`: `PERMITTED_WITH_CONDITIONS`, `RESTRICTED_EVIDENCE_REQUIRED`, or `PROHIBITED`.
- `mandatory_conditions`: Technical requirements (e.g., physical postal address, one-click opt-out header, cooldown window).

---

## 3. Seeded Compliance Evidence Register (Initial Baseline)

| Rule Reference | Country | Channel | Recipient Class | Documented Legal Ground | Status | Expiry Date | Conditions / Restrictions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `RULE-US-EMAIL-B2B` | US | Email | Corporate | CAN-SPAM Act (15 U.S.C. 7701) | `PENDING_PILOT_APPROVAL` | 2027-04-11 | Physical postal address mandatory; functioning List-Unsubscribe; opt-out honored within 10 days; no misleading headers. |
| `RULE-GB-EMAIL-B2B` | GB | Email | Corporate Subscriber | PECR Reg 22(1) exception + UK GDPR Art 6(1)(f) | `PENDING_PILOT_APPROVAL` | 2027-04-11 | Must verify target is registered corporate body (Companies House); documented LIA; clear sender identity; opt-out link. |
| `RULE-IN-EMAIL-B2B` | IN | Email | Corporate | DPDP Act 2023 Sec 4 / TRAI Commercial Guidelines | `PENDING_PILOT_APPROVAL` | 2027-04-11 | Home jurisdiction; verified business entity; clear purpose; no misleading claims; opt-out honoring. |
| `RULE-DE-EMAIL-ALL` | DE | Email | All | UWG § 7(2) No. 3 | `RESTRICTED` | Indefinite | Unsolicited cold marketing prohibited without prior express consent. Solicited inbound replies permitted only. |
| `RULE-FR-EMAIL-B2B` | FR | Email | Professional Box | CPCE Art. L. 34-5 / CNIL Professional Exception | `LEGAL_REVIEW_REQUIRED` | 2027-04-11 | Must be directly related to recipient's professional specialty; opt-out provided; LIA on file. |
| `RULE-CA-EMAIL-ALL` | CA | Email | All | CASL (S.C. 2010, c. 23) | `RESTRICTED` | Indefinite | Strict opt-in regime. Only permitted where express consent or Section 10(9) conspicuous publication conditions are proven in writing. |
| `RULE-AU-EMAIL-B2B` | AU | Email | Business | Spam Act 2003 (Cth) Section 16 | `LEGAL_REVIEW_REQUIRED` | 2027-04-11 | Inferred consent via conspicuous publication requires direct work-related relevance and no non-solicitation notice. |
| `RULE-AE-EMAIL-B2B` | AE | Email | Business | UAE PDPL / TDRA Electronic Marketing Framework | `LEGAL_REVIEW_REQUIRED` | 2027-04-11 | Corporate email only; commercial disclosure mandatory; cold telephone calls strictly prohibited under Cab. Res. 56/2024. |
| `RULE-GLOBAL-SOLICITED`| ALL | Email | Any Inbound Lead | Contract performance / Express consent | `PERMITTED` | Indefinite | Applies strictly to inbound demo requests, booking forms, support tickets, and contact form submissions. |

---

## 4. Consent Proof Collection Standards

Where a communication relies on prior consent (`requires_consent = true`), the following proof points must be captured in `outreach_consent_evidence`:
1. **Timestamp:** Exact UTC timestamp of submission.
2. **IP & User Agent:** Submitting IP address and client device identifier.
3. **Form URI & Copy:** Exact URL where the consent was given and verbatim copy of the consent notice shown to the user.
4. **Checkbox State:** Proof that the opt-in was active (pre-ticked boxes are strictly invalid across GDPR, CASL, and PECR).
5. **Double Opt-In Verification:** For newsletter and promotional subscriptions, tokenized email verification confirmation.

---

## 5. Review Expiry & Re-validation Workflow

```mermaid
sequenceDiagram
    participant Scheduler as System Cron
    participant DB as Supabase DB
    participant n8n as n8n Review Reminder
    participant Admin as Compliance Counsel

    Scheduler->>DB: Query rules where expires_at <= now() + 14 days
    DB-->>Scheduler: Return expiring rules
    Scheduler->>n8n: Dispatch LIT-COMPLIANCE-REVIEW-REMINDER
    n8n->>Admin: Alert: Rule review expiring in 14 days
    alt Admin Approves Renewal
        Admin->>DB: Record approval in outreach_policy_approvals + extend expires_at
    else Expiry Passes Without Action
        DB->>DB: Rule state drops to 'review_required'; dispatches automatically blocked
    end
```
