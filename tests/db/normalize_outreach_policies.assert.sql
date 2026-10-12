-- Tests for 20261012110000_normalize_outreach_policies.sql
-- Verifies:
--   1. Clean seed state (exactly 9 rules: 8 macro + 1 India pilot).
--   2. Unique composite constraints prevent duplicate rules.
--   3. India dual-state distinction by purpose and rule_version.
--   4. Specific-over-broad precedence: macro 'allowed' cannot override 'review_required' rule.
--   5. Approval and decision audit trail schema enhancements.
-- Runs in a rolled-back transaction.
\set ON_ERROR_STOP on
BEGIN;

DO $$
DECLARE
  v_rule_count integer;
  v_in_count integer;
  v_biz_us uuid;
  v_biz_in uuid;
  v_rule_us uuid;
  v_approval_id uuid;
  v_decision_id uuid;
  v_outreach_id uuid;
BEGIN
  -- 1. Assert exactly 9 rules exist after migration
  SELECT count(*) INTO v_rule_count FROM outreach_policy_rules;
  IF v_rule_count <> 9 THEN
    RAISE EXCEPTION 'ASSERT FAIL: Expected exactly 9 rules, got %', v_rule_count;
  END IF;

  -- 2. Assert India has exactly 2 distinct non-conflicting rules
  SELECT count(*) INTO v_in_count FROM outreach_policy_rules WHERE country_code = 'IN';
  IF v_in_count <> 2 THEN
    RAISE EXCEPTION 'ASSERT FAIL: Expected exactly 2 India rules, got %', v_in_count;
  END IF;

  -- Verify India rules have distinct purposes
  IF NOT EXISTS (SELECT 1 FROM outreach_policy_rules WHERE country_code = 'IN' AND purpose = 'cold_outreach' AND rule_version = '1.0') THEN
    RAISE EXCEPTION 'ASSERT FAIL: India macro baseline cold_outreach rule missing';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM outreach_policy_rules WHERE country_code = 'IN' AND purpose = 'b2b_pilot_demonstration' AND rule_version = '1.0-pilot') THEN
    RAISE EXCEPTION 'ASSERT FAIL: India controlled pilot demonstration rule missing';
  END IF;

  -- 3. Assert duplicate insertion is rejected by unique constraint
  BEGIN
    INSERT INTO outreach_policy_rules (
      country_code, channel, recipient_class, purpose, policy_status, rule_version
    ) VALUES (
      'US', 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', '1.0'
    );
    RAISE EXCEPTION 'GATE FAIL: Duplicate rule was accepted';
  EXCEPTION WHEN unique_violation THEN
    -- Expected unique violation
    NULL;
  END;

  -- 4. Test Specific-over-Broad Precedence
  -- Create business in US
  INSERT INTO lead_businesses (company_name, country_code, domain)
    VALUES ('Pioneer US Inc', 'US', 'pioneer-us.example') RETURNING id INTO v_biz_us;

  -- Try to force macro allowlist on US
  INSERT INTO lead_jurisdictions (country_code, outreach_status)
    VALUES ('US', 'allowed')
    ON CONFLICT (country_code) DO UPDATE SET outreach_status = 'allowed';

  -- Even though US is 'allowed' in lead_jurisdictions, outreach is BLOCKED
  -- because US email rule is 'review_required' (specific-over-broad precedence)!
  BEGIN
    INSERT INTO lead_outreach (business_id, channel) VALUES (v_biz_us, 'email');
    RAISE EXCEPTION 'GATE FAIL: Broad jurisdiction allowlist bypassed review_required rule';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
  END;

  -- 5. Test Approval audit trail enhancement
  SELECT id INTO v_rule_us FROM outreach_policy_rules WHERE country_code = 'US' AND channel = 'email';

  INSERT INTO outreach_policy_approvals (
    rule_id, reviewer_user_id, reviewer_email, reviewer_role, qualification_or_authority,
    decision_reason, expiry_time, reviewer_qualification, evidence_hash, scope_limitations,
    dual_signoff_by, dual_signoff_at, status
  ) VALUES (
    v_rule_us, 'usr_legal_01', 'legal@logicintelligence.com', 'legal_counsel',
    'Admitted to Bar (New York)', 'Approved CAN-SPAM B2B enterprise outreach protocol',
    now() + interval '90 days', 'Bar Admission #NY-489102', 'sha256:abcd1234ef5678',
    '{"max_daily_volume": 50, "prohibited_verticals": ["healthcare_consumer"]}'::jsonb,
    'compliance_officer@logicintelligence.com', now(), 'active'
  ) RETURNING id INTO v_approval_id;

  IF v_approval_id IS NULL THEN
    RAISE EXCEPTION 'ASSERT FAIL: Failed to insert enhanced outreach_policy_approvals';
  END IF;

  -- 6. Test Decision log audit trail enhancement
  INSERT INTO outreach_eligibility_decisions (
    country_code, channel, rule_id, rule_version, result, policy_fingerprint,
    effective_rule_id, effective_approval_id, evaluated_purpose, evaluated_channel
  ) VALUES (
    'US', 'email', v_rule_us, '1.0', 'permitted', 'fp_us_b2b_2026',
    v_rule_us, v_approval_id, 'cold_outreach', 'email'
  ) RETURNING id INTO v_decision_id;

  IF v_decision_id IS NULL THEN
    RAISE EXCEPTION 'ASSERT FAIL: Failed to insert enhanced outreach_eligibility_decisions';
  END IF;

  RAISE NOTICE 'normalize_outreach_policies assertions passed successfully';
END $$;

ROLLBACK;
