-- Outreach Compliance & Normalized Policy Engine Assertions
-- Tests:
--   1. Default-deny posture (0 allowed jurisdictions).
--   2. Granular rule permissions for scoped scenario without carte blanche country allowlist.
--   3. Rule expiration enforcement (expired rule reverts to blocked).
--   4. Message studio approval gate trigger on lead_outreach_messages.
--   5. Legacy enrollment gate trigger on outreach_enrollments.
--   6. Bi-directional suppression synchronization.
-- Runs in a rolled-back transaction.
\set ON_ERROR_STOP on
BEGIN;

DO $$
DECLARE
  v_biz_us uuid; v_biz_de uuid; v_msg uuid;
  v_rule uuid; v_outreach uuid;
  v_supp_count integer;
BEGIN
  -- 1. Default seed posture: exactly 0 jurisdictions allowed.
  IF (SELECT count(*) FROM lead_jurisdictions WHERE outreach_status = 'allowed') <> 0 THEN
    RAISE EXCEPTION 'COMPLIANCE ASSERT FAIL: Some jurisdiction is allowed by default';
  END IF;

  -- 2. Create target businesses: US (review_required) and DE (restricted/blocked).
  INSERT INTO lead_businesses (company_name, country_code, domain)
    VALUES ('Acme US Corp', 'US', 'acme-us.example') RETURNING id INTO v_biz_us;

  INSERT INTO lead_businesses (company_name, country_code, domain)
    VALUES ('Berlin Tech GmbH', 'DE', 'berlin-tech.example') RETURNING id INTO v_biz_de;

  -- 3. Gate on lead_outreach: inserting for US is blocked by default because US is review_required.
  BEGIN
    INSERT INTO lead_outreach (business_id, channel) VALUES (v_biz_us, 'email');
    RAISE EXCEPTION 'GATE FAIL: outreach to review_required US without approved rule was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
  END;

  -- 4. Scope-Specific Approval: Add an active, permitted rule in outreach_policy_rules for US B2B email.
  INSERT INTO outreach_policy_rules (
    country_code, channel, recipient_class, purpose, policy_status, requires_consent, rule_version
  ) VALUES (
    'US', 'email', 'corporate_subscriber', 'cold_outreach', 'permitted', false, '1.1'
  ) RETURNING id INTO v_rule;

  -- Now outreach for US email clears via the granular rule!
  INSERT INTO lead_outreach (business_id, channel) VALUES (v_biz_us, 'email')
    RETURNING id INTO v_outreach;

  IF v_outreach IS NULL THEN
    RAISE EXCEPTION 'COMPLIANCE ASSERT FAIL: Scoped rule did not clear US outreach';
  END IF;

  -- But outreach for phone/SMS to the same US business remains BLOCKED!
  BEGIN
    INSERT INTO lead_outreach (business_id, channel) VALUES (v_biz_us, 'phone');
    RAISE EXCEPTION 'GATE FAIL: phone outreach to US was accepted without phone rule';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
  END;

  -- 5. Expiration Gate: Expire the US rule → subsequent outreach is blocked again.
  UPDATE outreach_policy_rules SET expires_at = now() - interval '1 hour' WHERE id = v_rule;
  BEGIN
    INSERT INTO lead_outreach (business_id, channel) VALUES (v_biz_us, 'email');
    RAISE EXCEPTION 'GATE FAIL: outreach under expired rule was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
  END;

  -- 6. Message Studio Gate on lead_outreach_messages:
  -- Draft can be inserted in 'draft' or 'needs_review' status.
  INSERT INTO lead_outreach_messages (
    business_id, version, channel, body, blockers_pass, status
  ) VALUES (
    v_biz_us, 1, 'email', 'Hello from LIT', true, 'draft'
  ) RETURNING id INTO v_msg;

  -- But approving the draft is rejected because US rule is expired / not permitted!
  BEGIN
    UPDATE lead_outreach_messages SET status = 'approved', approved_by = 'test@lit.in', approved_at = now()
      WHERE id = v_msg;
    RAISE EXCEPTION 'GATE FAIL: message approval to unpermitted jurisdiction was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
  END;

  -- 7. Bi-directional Suppression Sync:
  -- Insert into email_suppressions → syncs to lead_suppressions.
  INSERT INTO email_suppressions (email, reason, source)
    VALUES ('prospect@acme-us.example', 'unsubscribe', 'one_click');

  SELECT count(*) INTO v_supp_count FROM lead_suppressions
    WHERE lower(email) = 'prospect@acme-us.example' AND active = true;

  IF v_supp_count <> 1 THEN
    RAISE EXCEPTION 'COMPLIANCE ASSERT FAIL: email_suppressions did not sync to lead_suppressions';
  END IF;

  -- 8. Legacy Enrollment Gate on outreach_enrollments:
  -- Attempting to enroll a suppressed email is rejected by DB trigger!
  BEGIN
    INSERT INTO outreach_enrollments (
      campaign_id, email, status
    ) VALUES (
      gen_random_uuid(), 'prospect@acme-us.example', 'ACTIVE'
    );
    RAISE EXCEPTION 'GATE FAIL: suppressed email was enrolled into legacy campaign';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
  END;

  RAISE NOTICE 'outreach_compliance assertions passed successfully';
END $$;

ROLLBACK;
