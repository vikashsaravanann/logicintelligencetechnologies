# Security & Bypass Test Register
**Organization:** Logic Intelligence Technologies (LIT)  
**Date:** October 11, 2026  
**Document:** `docs/compliance/SECURITY-AND-BYPASS-TESTS.md`  

---

## 1. Threat Model & Bypass Vectors Evaluated

The Global Outreach Compliance System was tested against 8 primary adversarial bypass vectors:

| Attack Vector | Simulated Scenario | Enforcement Layer | Result |
| :--- | :--- | :--- | :--- |
| **Direct SQL Insert** | Worker or leaked service_role attempts `INSERT INTO lead_outreach` for an unlisted country (`ZZ`). | PostgreSQL Trigger `trg_outreach_gate` | **BLOCKED:** Transaction aborted with PostgreSQL exception. |
| **Legacy Cron Bypass** | `/api/cron/outreach-followups` attempts to dispatch to an unlisted or restricted country. | `marketingSendGuard()` calling `evaluateOutreachEligibility()` | **BLOCKED:** `guard.ok = false`, enrollment marked `STOPPED`. |
| **Message Studio Approval Bypass** | Operator attempts to approve a draft to a restricted country or with failed QA blockers. | PostgreSQL Trigger `trg_outreach_message_gate` | **BLOCKED:** Transaction aborted with exception. |
| **Transport Injection Bypass** | Code calls `sendEmail({ category: 'marketing' })` with an unverified recipient. | Centralized gate in `sendEmail()` | **BLOCKED:** Recipient scrubbed; delivery aborted. |
| **Suppression Split-Brain** | Recipient unsubscribes via web link (`email_suppressions`); cron checks `lead_suppressions`. | Bi-directional synchronization triggers | **BLOCKED:** Suppression mirrored synchronously across both tables. |
| **Expired Rule Bypass** | A previously permitted rule surpasses its `expires_at` date. | PostgreSQL Trigger + Eligibility Engine temporal check | **BLOCKED:** System reverts to default-deny (`review_required`). |
| **Unsolicited Phone/SMS Bypass** | An email rule is permitted; script attempts to dispatch an SMS to the same recipient. | Channel isolation in rule key `(country, channel)` | **BLOCKED:** Email permission strictly denies phone/SMS dispatches. |
| **Database Failure Bypass** | Supabase is unreachable or credentials are lost. | Fail-closed gate in `evaluateOutreachEligibility()` | **BLOCKED:** Returns `{ eligible: false, state: 'unknown' }`. |

---

## 2. Test Suites Executed & Results

### 1. Database-Level Tests (`bash scripts/db-test.sh`)
- **Harness:** Isolated PostgreSQL container running full schema, stubs, and migrations twice (idempotency verification).
- **Assertions Executed:**
  - `tests/db/batch1.assert.sql`: Passed.
  - `tests/db/batch2.assert.sql`: Passed.
  - `tests/db/batch3.assert.sql`: Passed.
  - `tests/db/batch4.assert.sql`: Passed.
  - `tests/db/lead_engine.assert.sql`: Passed.
  - `tests/db/outreach_compliance.assert.sql`: Passed.
- **Outcome:** `db-test OK` (Exit code 0).

### 2. Application Unit & Integration Tests (`npm test`)
- **Harness:** Node.js v24 native test runner (`node --import tsx --test`).
- **Total Tests:** 331 tests across 20 suites.
- **Passed:** 331 (100%).
- **Failed:** 0.
- **Cancelled / Skipped:** 0.

### 3. TypeScript Type Safety (`npm run typecheck`)
- **Compiler:** `tsc --noEmit`.
- **Errors Found:** 0.

---

## 3. Negative Assertion Evidence

From `tests/db/outreach_compliance.assert.sql`:
```sql
-- Asserting that unlisted jurisdiction outreach is rejected:
BEGIN
  INSERT INTO lead_outreach (business_id, channel) VALUES (v_biz_us, 'email');
  RAISE EXCEPTION 'GATE FAIL: outreach to review_required US without approved rule was accepted';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
END;

-- Asserting that channel elevation (email -> phone) is rejected:
BEGIN
  INSERT INTO lead_outreach (business_id, channel) VALUES (v_biz_us, 'phone');
  RAISE EXCEPTION 'GATE FAIL: phone outreach to US was accepted without phone rule';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
END;

-- Asserting that expired legal review is rejected:
UPDATE outreach_policy_rules SET expires_at = now() - interval '1 hour' WHERE id = v_rule;
BEGIN
  INSERT INTO lead_outreach (business_id, channel) VALUES (v_biz_us, 'email');
  RAISE EXCEPTION 'GATE FAIL: outreach under expired rule was accepted';
EXCEPTION WHEN raise_exception THEN
  IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
END;
```
All negative assertions passed successfully.
