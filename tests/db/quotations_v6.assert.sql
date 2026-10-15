-- Assertions for V6 Quotations & Service Catalog Migration
-- Tests table schemas, canonical 77 services, default pricing invariant,
-- inactive coupon seed, and atomic RPC acceptance flow.
\set ON_ERROR_STOP on
BEGIN;

DO $$
DECLARE
  v_cnt int;
  v_fe01_price bigint;
  v_null_price_cnt int;
  v_zero_price_cnt int;
  v_cat_a int; v_cat_b int; v_cat_c int; v_cat_d int;
  v_cat_e int; v_cat_f int; v_cat_g int; v_cat_h int;
  v_coupon RECORD;
  v_quote_id uuid;
  v_client_id uuid;
  v_eng_id uuid;
  v_sec_token text := 'tok_test_v6_quotation_abc123';
  v_res jsonb;
  v_audit_cnt int;
  v_accept_cnt int;
BEGIN
  -- 1. Assert exactly 77 canonical services
  SELECT count(*) INTO v_cnt FROM public.quotation_services_catalog;
  IF v_cnt <> 77 THEN
    RAISE EXCEPTION 'Expected 77 canonical services in catalog, found %', v_cnt;
  END IF;

  -- 2. Assert Category counts: A=8, B=12, C=12, D=8, E=8, F=10, G=11, H=8
  SELECT count(*) INTO v_cat_a FROM public.quotation_services_catalog WHERE category_code = 'A';
  SELECT count(*) INTO v_cat_b FROM public.quotation_services_catalog WHERE category_code = 'B';
  SELECT count(*) INTO v_cat_c FROM public.quotation_services_catalog WHERE category_code = 'C';
  SELECT count(*) INTO v_cat_d FROM public.quotation_services_catalog WHERE category_code = 'D';
  SELECT count(*) INTO v_cat_e FROM public.quotation_services_catalog WHERE category_code = 'E';
  SELECT count(*) INTO v_cat_f FROM public.quotation_services_catalog WHERE category_code = 'F';
  SELECT count(*) INTO v_cat_g FROM public.quotation_services_catalog WHERE category_code = 'G';
  SELECT count(*) INTO v_cat_h FROM public.quotation_services_catalog WHERE category_code = 'H';

  IF v_cat_a <> 8 OR v_cat_b <> 12 OR v_cat_c <> 12 OR v_cat_d <> 8
     OR v_cat_e <> 8 OR v_cat_f <> 10 OR v_cat_g <> 11 OR v_cat_h <> 8 THEN
    RAISE EXCEPTION 'Category counts mismatch: A=%, B=%, C=%, D=%, E=%, F=%, G=%, H=%',
      v_cat_a, v_cat_b, v_cat_c, v_cat_d, v_cat_e, v_cat_f, v_cat_g, v_cat_h;
  END IF;

  -- 3. Assert PRICING INVARIANT:
  -- Only FE-01 has default_unit_price_paise = 5000000 (₹50,000)
  -- ALL other 76 services have default_unit_price_paise IS NULL
  -- ZERO services have default_unit_price_paise = 0
  SELECT default_unit_price_paise INTO v_fe01_price
  FROM public.quotation_services_catalog WHERE code = 'FE-01';

  IF v_fe01_price <> 5000000 THEN
    RAISE EXCEPTION 'FE-01 price must be 5000000 paise (₹50,000), got %', v_fe01_price;
  END IF;

  SELECT count(*) INTO v_null_price_cnt
  FROM public.quotation_services_catalog
  WHERE default_unit_price_paise IS NULL;

  IF v_null_price_cnt <> 76 THEN
    RAISE EXCEPTION 'Expected 76 services with NULL default price, found %', v_null_price_cnt;
  END IF;

  SELECT count(*) INTO v_zero_price_cnt
  FROM public.quotation_services_catalog
  WHERE default_unit_price_paise = 0;

  IF v_zero_price_cnt <> 0 THEN
    RAISE EXCEPTION 'Zero prices not allowed in catalog, found % rows', v_zero_price_cnt;
  END IF;

  -- 4. Assert Default Coupon: WAKEUPINDIA exists and is disabled
  SELECT * INTO v_coupon FROM public.quotation_coupons WHERE code = 'WAKEUPINDIA';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Default coupon WAKEUPINDIA not found';
  END IF;
  IF v_coupon.is_active = true THEN
    RAISE EXCEPTION 'Default coupon WAKEUPINDIA must be disabled (is_active = false)';
  END IF;

  -- 5. Test Quotation creation and accept_quotation_v6 RPC
  INSERT INTO public.clients (client_code, legal_name, contact_name, contact_email)
  VALUES ('CL-V6-TEST', 'Test Corp V6', 'Jane Doe', 'jane@testcorp.com')
  RETURNING id INTO v_client_id;

  INSERT INTO public.client_engagements (
    engagement_ref, client_id, company_name, contact_name, contact_email, current_stage
  ) VALUES (
    'ENG-V6-TEST-001', v_client_id, 'Test Corp V6', 'Jane Doe', 'jane@testcorp.com', 'proposal'
  ) RETURNING id INTO v_eng_id;

  INSERT INTO public.quotations (
    quotation_ref, client_id, engagement_id, company_name, contact_name, contact_email,
    project_title, status, subtotal_paise, total_payable_paise, milestone1_paise, milestone2_paise,
    secure_token, valid_until
  ) VALUES (
    'LIT-QT-TEST-0001', v_client_id, v_eng_id, 'Test Corp V6', 'Jane Doe', 'jane@testcorp.com',
    'Enterprise Frontend Engineering', 'published', 5000000, 5000000, 2500000, 2500000,
    v_sec_token, now() + interval '14 days'
  ) RETURNING id INTO v_quote_id;

  -- Insert matching line item
  INSERT INTO public.quotation_line_items (
    quotation_id, service_code, category_code, category_name, title, public_scope,
    quantity, quoted_unit_price_paise, extended_amount_paise, is_selected
  ) VALUES (
    v_quote_id, 'FE-01', 'B', 'Frontend & Interactive Web Application Engineering',
    'Enterprise Frontend Engineering — Next.js 16, React 19 & TypeScript',
    'Client-approved frontend interface implementation', 1, 5000000, 5000000, true
  );

  -- 6. RPC test: reject invalid expected total
  SELECT public.accept_quotation_v6(
    p_secure_token := v_sec_token,
    p_signer_name := 'Jane Doe',
    p_signer_email := 'jane@testcorp.com',
    p_expected_total_paise := 4000000 -- wrong!
  ) INTO v_res;

  IF (v_res->>'success')::boolean <> false OR (v_res->>'error') <> 'PRICE_MISMATCH' THEN
    RAISE EXCEPTION 'Expected PRICE_MISMATCH failure, got %', v_res;
  END IF;

  -- 7. RPC test: accept with correct total
  SELECT public.accept_quotation_v6(
    p_secure_token := v_sec_token,
    p_signer_name := 'Jane Doe',
    p_signer_email := 'jane@testcorp.com',
    p_signer_title := 'Chief Technology Officer',
    p_signer_company := 'Test Corp V6',
    p_expected_total_paise := 5000000,
    p_terms_hash := 'sha256_mock_hash_terms_123',
    p_client_ip := '127.0.0.1',
    p_user_agent := 'Mozilla/5.0 Test Suite'
  ) INTO v_res;

  IF (v_res->>'success')::boolean <> true THEN
    RAISE EXCEPTION 'accept_quotation_v6 failed: %', v_res;
  END IF;

  -- Verify quotation status updated to accepted
  IF NOT EXISTS (SELECT 1 FROM public.quotations WHERE id = v_quote_id AND status = 'accepted' AND accepted_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Quotation status was not updated to accepted';
  END IF;

  -- Verify acceptance record created
  SELECT count(*) INTO v_accept_cnt FROM public.quotation_acceptances WHERE quotation_id = v_quote_id;
  IF v_accept_cnt <> 1 THEN
    RAISE EXCEPTION 'Expected 1 acceptance record, found %', v_accept_cnt;
  END IF;

  -- Verify audit log entry created
  SELECT count(*) INTO v_audit_cnt FROM public.quotation_audit_logs WHERE quotation_id = v_quote_id AND action = 'quotation_accepted';
  IF v_audit_cnt <> 1 THEN
    RAISE EXCEPTION 'Expected 1 audit log entry for quotation_accepted, found %', v_audit_cnt;
  END IF;

  -- Verify linked engagement stage advanced
  IF NOT EXISTS (SELECT 1 FROM public.client_engagements WHERE id = v_eng_id AND current_stage = 'acceptance') THEN
    RAISE EXCEPTION 'Client engagement current_stage was not advanced to acceptance';
  END IF;

  RAISE NOTICE 'quotations_v6 assertions passed successfully';
END $$;

ROLLBACK;
