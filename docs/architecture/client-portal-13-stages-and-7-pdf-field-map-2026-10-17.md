# Client Portal 13-Stage Lifecycle & 7-PDF Interactive Field Registry

**Date:** 2026-10-17  
**Repository:** `vikashsaravanann/logicintelligencetechnologies`

---

## 1. Canonical 13-Stage Client Portal Lifecycle

| Ordinal | Stage Key | Title | Primary Document / Artifact | Gate & Progression Rule |
|---|---|---|---|---|
| 01 | `checklist` | 50-Point Enterprise Deployment Checklist | `LIT-00-CHECKLIST` | Unlocked at engagement creation; client submits Sections 1–10; Super Admin approval unlocks Stage 02. |
| 02 | `discovery` | Discovery & Requirements Architecture | Discovery Dossier | Client submits business/technical discovery; Super Admin approval unlocks Stage 03. |
| 03 | `nda` | Mutual Non-Disclosure Agreement | `LIT-02-NDA` | Auto-populated from Checklist/Discovery; client e-signs; Super Admin approval unlocks Stage 04. |
| 04 | `proposal` | Project Proposal & Commercial Quotation | `LIT-QUOTATION` | Staff prepares technical draft; Super Admin approves pricing & publishes; client accepts to unlock Stage 05. |
| 05 | `sow` | Statement of Work & Service Agreement | `LIT-01-SOW` | Auto-populated from Proposal & NDA; client e-signs; unlocks Stage 06. |
| 06 | `initial-invoice` | Initial Deposit Invoice & Payment (50%) | `LIT-INVOICE` / `LIT-RECEIPT` | Super Admin issues 50% invoice; client submits UTR; **only Super Admin bank verification** (`payments.reconcile`) unlocks Stage 07. |
| 07 | `onboarding` | Client Onboarding & Access Provisioning | `LIT-03-ONBOARDING` | Client submits DNS, Git, brand & stakeholder coordinates; Super Admin approval unlocks Stage 08. |
| 08 | `technical-spec` | Technical Specification & Architecture Sign-Off | `LIT-04-TECH-SPEC` | LIT engineering prepares spec; client signs off; Super Admin approval unlocks Stage 09. |
| 09 | `development` | Active Engineering & Change Control | `LIT-05-CHANGE-REQUEST` | Sprint tracking & optional RFCs (commercial delta requires Super Admin approval); unlocks Stage 10. |
| 10 | `delivery-acceptance` | Delivery Review & UAT Sign-Off | UAT Acceptance Record | Client verifies staging deliverables and submits UAT sign-off; unlocks Stage 11. |
| 11 | `final-payment` | Final 50% Settlement Invoice & Payment | `LIT-INVOICE` / `LIT-RECEIPT` | Super Admin issues final 50% invoice; client submits UTR; **only Super Admin bank verification** unlocks Stage 12. |
| 12 | `handover` | Final Handover, Credentials & IP Transfer | `LIT-06-HANDOVER` | Unlocked only after 100% verified settlement; client signs final handover certificate; unlocks Stage 13. |
| 13 | `maintenance` | Post-Launch Warranty & Optional Retainer | `LIT-07-MAINTENANCE` | Client elects or declines optional retainer; completes engagement lifecycle. |

---

## 2. Master Document Field Registry (`src/lib/documents/master-field-registry.ts`)

All 7 corporate PDFs (`LIT-01-SOW` through `LIT-07-MAINTENANCE`) plus `LIT-00-CHECKLIST`, `LIT-QUOTATION`, `LIT-INVOICE`, and `LIT-RECEIPT` are registered in `MASTER_DOCUMENT_FIELD_REGISTRY` with:
- **Explicit Field Ownership (`FieldOwner`):**
  - `system`: Immutable system-generated references, dates, governing law (`Chennai, Tamil Nadu`), and statutory IP assignment clauses.
  - `client`: Client legal entity details, technical inputs, checklist selections, UAT sign-offs, and authorized signatory fields.
  - `lit_staff_technical`: Architecture overviews, scope deliverables, sprint milestones, and technical impact assessments (editable by `super_admin`, `admin`, `operations` prior to approval).
  - `super_admin_commercial`: Contract subtotals, GST breakdowns, 50%/50% milestone amounts, RFC commercial deltas, retainer fees, and verified bank UTRs (editable and viewable **only** by `super_admin` and the authenticated owning client).
  - `legal_review`: Confidentiality survival terms and legal review metadata.
- **Auto-Population Lineage (`resolveAutoPopulatedDocumentFields`):**
  - Eliminates repetitive data entry across stages by propagating `companyName`, `contactName`, `contactEmail`, `registeredAddress`, `selectedChecklistItems`, `approvedScopeModules`, and `approvedTotalPaise` across downstream documents while respecting `redactFinancials: true` in Staff Support View.
