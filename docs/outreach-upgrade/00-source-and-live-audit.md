# Phase 0: Source Code & Live Environment Reconciliation Audit
**Project:** Logic Intelligence Technologies (LIT) — Global Outreach Compliance & Regulatory Gate  
**Date:** October 12, 2026  
**Auditor:** A00 Master Compliance Engineering Orchestrator  
**Branch:** `feat/global-outreach-compliance-reconciliation`  
**Base Commit:** `073524ffa9450210dc762921c50d32a83fcbe7a0`  
**Repository:** `vikashsaravanann/logicintelligencetechnologies`  

---

## 1. Executive Summary & Screenshot Reconciliation

### Screenshot #1 Analysis: "Global Outreach Compliance & Regulatory Gate"
The screenshot captured at 2026-10-12 shows:
- **16 Rules Registered** in the granular policy table.
- Country rows displayed for: `AE`, `AU`, `CA`, `DE`, `FR`, `GB`, `IN`, `US`.
- **India (`IN`) anomaly:** A green row labeled `Permitted for verified scenario` appears alongside an amber row labeled `Legal review required`.
- **Review Expiry column:** Displays `"180 days default"` across all rows where `expires_at` was `NULL`.
- **Obscured / Missing Dimensions:** The UI table does NOT render `purpose` (`cold_outreach` vs `inbound_followup`), `region`, `rule_version`, `reviewer`, or `approval_id`.

#### Root Cause of the 16 Rows:
In `supabase/migrations/20261012090000_global_outreach_compliance.sql`, the `outreach_policy_rules` table was defined with `id uuid primary key default gen_random_uuid()` without a logical composite unique constraint on `(country_code, COALESCE(region,''), channel, recipient_class, purpose, rule_version)`.
Lines 430–464 contained an `INSERT INTO outreach_policy_rules (...) ON CONFLICT DO NOTHING;`.
Because `ON CONFLICT` without target columns only conflicts on the primary key, and each row generated a new UUID, re-running the migration or executing a seed script created exactly 8 duplicate rows, totaling **16 rows** (2 rows per jurisdiction).

#### Root Cause of the Dual India Rows:
1. One row represents the baseline country posture for cold outreach (`review_required`).
2. The other row represents a narrow, controlled pilot scenario (B2B corporate subscriber email with verified unsubscribe and sender identity under DPDP Act 2023 / TRAI guidelines).
Without displaying `purpose`, `rule_version`, or the linked legal review approval, the table appears contradictory.

#### Root Cause of "180 days default":
`src/app/admin/outreach/compliance/page.tsx` line 240 rendered:
`{r.expires_at ? r.expires_at.slice(0, 10) : "180 days default"}`
This was an unverified UI placeholder; `NULL` in the database indicates that no human legal review has taken place and no actual expiry has been scheduled, NOT that a 180-day review was approved.

---

### Screenshot #2 Analysis: "Outreach Conversion Analytics & Funnel"
The screenshot shows:
- **0 Scored Leads**, **0 Messages Drafted**, **0 Awaiting Approval**, **0 Authorized / Scheduled**, **0 Dispatched (Sent)**.
- **Conversion Funnel:** All steps show `0` count and `(0%)` or `0% Human Authorization Rate`.
- **International Jurisdictions Compliance Matrix:** 8 countries listed (`AE`, `AU`, `CA`, `DE`, `FR`, `GB`, `IN`, `US`), with India listed as `review_required` (amber).

#### Root Cause of Zero Funnel Figures:
1. `lead_businesses` and `lead_scores` tables in the staging/production database have not been seeded or crawled with live production prospects.
2. In `src/lib/outreach/intelligence/queues.ts`:
   - `outreachStats()` sums records from `lead_outreach_messages`, `lead_businesses`, and `lead_jurisdictions`.
   - When no messages or businesses exist, it returns `0`.
   - The UI correctly displays `0` for an unseeded database, but lacks context distinguishing **authoritative zero** from **data load errors**, and displays `0%` for division where denominator is zero (`0/0` should display `N/A`).

#### Reconciliation between Compliance Page and Analytics Page:
- The Analytics country table reads `lead_jurisdictions.outreach_status` (the macro country stance where India is `review_required`).
- The Compliance page reads both `lead_jurisdictions` AND `outreach_policy_rules` (where a narrow pilot rule exists).
- Both pages are technically querying different tables with different grains. The UI must explicitly distinguish the **Macro Country Baseline** from the **Scoped Scenario Policy**.

---

## 2. Codebase Audit & Defect Catalog

| ID | File | Defect Identified | Remediation Required |
|---|---|---|---|
| DEF-01 | `supabase/migrations/20261012090000_global_outreach_compliance.sql` | Missing unique constraint on logical scope key `(country_code, region, channel, recipient_class, purpose, rule_version)`. | Create migration `20261012110000_normalize_outreach_policies.sql` with unique index, deduplication, and scope fingerprint. |
| DEF-02 | `src/lib/outreach/eligibility.ts` | Line 214–216: `isPermittedByRule \|\| isPermittedByBroadJur` allows broad `allowed` country status to override specific prohibitions or missing approvals. | Remove broad override; enforce strict specific-over-broad precedence; require unexpired row in `outreach_policy_approvals`. |
| DEF-03 | `src/lib/outreach/eligibility.ts` | Active rule selection uses `.find()` without deterministic sorting by specificity and version. | Order rules by specificity, precedence, and version desc before selecting. |
| DEF-04 | `src/lib/outreach/eligibility.ts` | Decision logging is fire-and-forget (`void supabaseAdmin...insert()`), failing closed only on synchronous code exceptions. | Make decision persistence synchronous and verifiable before returning `eligible: true`. |
| DEF-05 | `src/app/admin/outreach/compliance/page.tsx` | Matrix hides `purpose`, `region`, `rule_version`, `approval_id`, and displays `"180 days default"` when `expires_at` is NULL. | Redesign table with all 5 dimensions, approval lineage, true expiry (`"Approval not recorded / expiry not assigned"`), and India pilot banner. |
| DEF-06 | `src/app/admin/outreach/analytics/page.tsx` | Reads only macro `lead_jurisdictions`; shows `0%` for `0/0` conversions; does not distinguish authoritative zero from query failure. | Upgrade `outreachStats()` to return scoped policy metrics and query health; display `N/A` for zero denominator; provide clear zero-state guidance. |
| DEF-07 | `src/app/admin/outreach/queue/approve-button.tsx` | Button labeled `Approve Dispatch` when backend action `approveDraft()` only authorizes content review without dispatching. | Relabel to `Approve Draft Content` and clarify operator workflow. |
| DEF-08 | `src/lib/automation/n8n/LIT-OUTREACH-*.json` | Workflows contain dummy `compliance_event_processed` Code nodes that return simulated success without backend preflight verification. | Refactor workflows to call `/api/admin/outreach/preflight` with HMAC validation, replay protection, and fail-closed dispatch denial. |
| DEF-09 | `supabase/migrations/20261012090000_global_outreach_compliance.sql` | SQL trigger `lead_enforce_outreach_gates()` allows send if `outreach_status = 'allowed'` without matching recipient class, purpose, or approval evidence. | Align database trigger with canonical evaluation contract and signed decision ID. |

---

## 3. Five-Dimension Status State Machine Alignment

The system enforces five independent, non-overlapping dimensions:

1. **Jurisdiction Baseline:** Conservative macro stance (`unknown`, `review_required`, `restricted`, `blocked`, `baseline_evidence_recorded`).
2. **Scoped Legal Policy:** Channel, recipient class, purpose, and legal basis (`draft`, `pending_legal_review`, `approved_for_scoped_scenario`, `restricted`, `prohibited`, `expired`, `revoked`).
3. **Recipient Eligibility:** Temporal determination for a specific contact at send time (`eligible`, `needs_evidence`, `suppressed`, `not_eligible`, `uncertain`).
4. **Message Human Review:** Content QA and operator signoff (`draft`, `qa_failed`, `awaiting_human_approval`, `approved_for_dispatch_review`, `rejected`).
5. **Delivery / Transport:** Live provider events (`not_scheduled`, `scheduled`, `queued`, `provider_accepted`, `delivered`, `bounced`, `complained`, `unsubscribed`, `failed`).

---

## 4. Safety & Authorization Constraints
- Work strictly in `logicintelligencetechnologies`.
- Default-deny architecture enforced across UI, API, cron, database triggers, and n8n.
- Zero outbound marketing sends during testing.
- No synthetic approvals or simulated legal authorizations.
