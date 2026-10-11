# Global Outreach Compliance System — Current-State Audit Report
**Organization:** Logic Intelligence Technologies (LIT)  
**Date:** October 11, 2026  
**Auditor:** Master Compliance Engineering Coordinator  
**Branch:** `audit/global-outreach-compliance`  
**Repository:** `vikashsaravanann/logicintelligencetechnologies`  
**Execution Environment:** Isolated Staging & Codebase Audit  

---

## 1. Executive Summary

This audit assesses the technical architecture, legal posture, and operational safeguards of all outreach communication mechanisms in Logic Intelligence Technologies' web and backend infrastructure. 

Prior to this audit, a significant architectural discrepancy existed between two parallel outreach subsystems:
1. **Newer Lead Intelligence Engine (`lead_*` tables):** Enforced a strict PostgreSQL row-level trigger (`lead_enforce_outreach_gates()`) on table `lead_outreach` that blocked any insert or update if a business's country was not explicitly marked `'allowed'` in `lead_jurisdictions` or if an active suppression existed in `lead_suppressions`.
2. **Legacy Campaign Outreach Pipeline (`contact_leads` & `outreach_*` tables):** Dispatched multi-step automated sequences via the cron worker `/api/cron/outreach-followups/route.ts` using `marketingSendGuard()`. This legacy pathway inspected email format, cooldown period, and the separate `email_suppressions` table, but **completely bypassed** country jurisdiction checks, legal basis verification, and the `lead_suppressions` table.

Furthermore, the default database posture seeded across all eight configured countries (IN, US, GB, AE, AU, DE, FR, CA) strictly configured **zero** jurisdictions as `'allowed'`. 

---

## 2. Explanation of the `/admin/outreach/analytics` State

In the administrative console (`/admin/outreach/analytics`), the dashboard displays:
- **8 Jurisdictions Seeded**
- **0 Target Businesses Indexed**
- **0 Draft Messages Generated**
- **0 Active Global Suppressions**

### Root Cause Analysis:
1. **Conservative Default Seeding:** The migration `20261010090000_lead_engine_phase1.sql` explicitly seeded:
   - `IN`, `US`, `GB`, `AE`, `AU`: status `'review_required'`
   - `DE`, `FR`, `CA`: status `'blocked'`
   - **Allowed count: 0**
2. **Absence of Staging Lead Discovery Runs:** No crawler or licensed API batch import (`lead_import_batches`) had yet been executed in the staging database environment. Consequently, `lead_businesses` contained 0 rows.
3. **Database Trigger Rejection:** Even if an automated script or operator attempted to insert an outreach draft for a business located in any of the 8 jurisdictions, the database trigger `lead_enforce_outreach_gates()` would immediately reject the transaction with:
   ```sql
   Outreach blocked: jurisdiction [CC] is not on the outreach allowlist (status: [status])
   ```
4. **UI Display Flaw:** The analytics page lacked explicit empty-state explanations, causing operators to mistake a clean, unseeded database for a broken integration. Additionally, the page failed to render a prominent warning banner if the underlying Supabase query failed or timed out (`s.error === true`), masking database connection states.

---

## 3. Detailed Component Audit

| Component | Path / Location | Current Role | Compliance Findings & Vulnerabilities |
| :--- | :--- | :--- | :--- |
| **Lead Engine Migration** | `supabase/migrations/20261010090000_lead_engine_phase1.sql` | Schema for lead intelligence, jurisdictions, suppressions, audits. | **Defensive but Incomplete:** Enforces trigger on `lead_outreach`, but `lead_outreach_messages` (added in next migration) and legacy `outreach_enrollments` lacked this trigger. |
| **Lead Messages Migration** | `supabase/migrations/20261011090000_lead_outreach_messages.sql` | Structured draft versions & approvals for Message Studio. | **Trigger Gap:** Table lacked the DB-level trigger `lead_enforce_outreach_gates()`, relying solely on application-layer logic in `store.ts`. |
| **Legacy Outreach Schema** | `supabase/migrations/20260916140000_outreach_pipeline.sql` | Campaigns, steps, enrollments, activity events. | **Zero Compliance Enforced:** No country column on `contact_leads` or `outreach_enrollments`. No foreign key or trigger link to `lead_jurisdictions`. |
| **Legacy Send Guard** | `src/lib/outreach/send-guard.ts` | Final gate for campaign cron dispatches. | **Major Gap:** Only checked `isSuppressed()` against `email_suppressions` and `contact_leads` lifecycle stages. Ignored country, consent evidence, and `lead_suppressions`. |
| **Campaign Manager** | `src/lib/outreach/campaigns.ts` | Audience preview and lead enrollment. | **Bypass Vulnerability:** `enrollEligibleLeads()` enrolled leads regardless of jurisdiction or legal basis. |
| **Campaign Follow-up Cron** | `src/app/api/cron/outreach-followups/route.ts` | Periodic sequence sender. | **Direct Dispatch Risk:** Calls `sendEmail()` directly once `marketingSendGuard()` passes. If dry run is false, live email dispatches to any country without legal verification. |
| **Email Transport Engine** | `src/lib/email/send-email.ts` | Centralized Nodemailer SMTP transport. | **Suppression Isolation:** Checked `email_suppressions`, but not `lead_suppressions`. Did not verify country compliance or consent proof. |
| **Unsubscribe Handler** | `src/app/api/unsubscribe/route.ts` | RFC 8058 One-Click and web opt-out handler. | **Split-Brain Suppression:** Wrote to `email_suppressions`, `newsletter_subscribers`, and `profiles`, but did **not** sync to `lead_suppressions` or update `contact_leads.communication_status`. |
| **Message Studio Actions** | `src/app/admin/outreach/studio/actions.ts` | Draft generation and human approval. | **Safe but Partial:** Enforces QA blockers and checks `lead.compliance.cleared` in application code. However, dispatch action was completely unimplemented. |
| **Suppression Actions** | `src/app/admin/outreach/suppression/actions.ts` | Admin manual suppression list. | **Split-Brain Suppression:** Wrote to `lead_suppressions` only; legacy `email_suppressions` remained unaware of manually added suppressions. |
| **Analytics UI** | `src/app/admin/outreach/analytics/page.tsx` | Telemetry & jurisdiction matrix. | **Inaccurate Terminology & Missing States:** Labeled all blocked countries as "Blocked by Law" (overly categorical); failed to show error banner when `s.error` was true; not optimized for mobile viewports (390px). |
| **n8n Automation Dispatch** | `src/lib/automation/dispatch.ts` & `src/config/automation.ts` | Signed webhook event dispatcher. | **Unconnected Workflows:** Workflows for compliance reminders, consent intake, and unsubscribe synchronization were not registered or standardized. |

---

## 4. Verification Register

- **Verified Working:**
  - Database trigger `lead_enforce_outreach_gates()` on `lead_outreach` successfully halts unauthorized inserts for `review_required`, `blocked`, and unlisted countries.
  - Test suite `lead_engine.assert.sql` executes and validates default-deny posture.
  - Message Studio QA gates (`qa-gates.ts`) successfully block unsupported outcome claims, aggressive CTAs, and invented names.
  - HMAC webhook signing (`webhook-signing.ts`) ensures cryptographically secure payloads to n8n.
- **Failing / Insecure Discrepancies:**
  - Legacy campaign cron (`/api/cron/outreach-followups`) can send outreach to any country without checking `lead_jurisdictions`.
  - Disconnect between `email_suppressions` and `lead_suppressions` creates split-brain opt-out vulnerability.
  - Inaccurate UI label "Blocked by Law" obscures scenarios where lawful B2B communications or solicited replies are permitted.
- **Blocked by Access / Staging Context:**
  - Live external SMTP delivery and live n8n cloud instances are intentionally isolated in dry-run mode to prevent unauthorized communications during audit.

---

## 5. Required Remediations
1. **Unify Eligibility Logic:** Create `src/lib/outreach/eligibility.ts` providing deterministic `evaluateOutreachEligibility()`.
2. **Hook Final Dispatch Points:** Wire `evaluateOutreachEligibility()` into both `marketingSendGuard()` and `sendEmail()`, ensuring zero bypass.
3. **Harmonize Suppression Databases:** Synchronize `email_suppressions` and `lead_suppressions` bidirectionally so any opt-out is universally honored.
4. **Deploy Database Trigger Protection:** Extend DB triggers to `outreach_enrollments` and `lead_outreach_messages`.
5. **Normalize Legal Policy Rules:** Deploy migration introducing `outreach_policy_rules`, `outreach_policy_approvals`, `outreach_consent_evidence`, and `outreach_eligibility_decisions`.
6. **Update Admin Console:** Replace "Blocked by Law" with nuanced statuses, add error banners, and make analytics mobile-responsive.
