-- Lead Engine (Phase 1) assertions: the DB-enforced outreach gate —
-- jurisdiction allowlist + suppression — plus provenance defaults.
-- Runs in a rolled-back transaction.
\set ON_ERROR_STOP on
BEGIN;

DO $$
DECLARE
  biz_zz uuid; biz_null uuid; biz_in uuid;
  o uuid; cleared boolean; checked boolean;
BEGIN
  -- Seed posture: nothing is 'allowed'. IN is seeded 'review_required'.
  SELECT count(*) INTO cleared FROM lead_jurisdictions WHERE outreach_status = 'allowed';
  IF (SELECT count(*) FROM lead_jurisdictions WHERE outreach_status = 'allowed') <> 0 THEN
    RAISE EXCEPTION 'seed posture wrong: some jurisdiction is allowed by default';
  END IF;

  -- Business in an UNLISTED country.
  INSERT INTO lead_businesses (company_name, country_code, domain)
    VALUES ('Acme ZZ', 'ZZ', 'acme-zz.example') RETURNING id INTO biz_zz;

  -- Gate: outreach to an unlisted jurisdiction is rejected by the DB.
  BEGIN
    INSERT INTO lead_outreach (business_id) VALUES (biz_zz);
    RAISE EXCEPTION 'GATE FAIL: outreach to unlisted jurisdiction was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;  -- re-raise our own marker
  END;

  -- Flip ZZ to allowed → outreach now inserts and is stamped cleared/checked.
  INSERT INTO lead_jurisdictions (country_code, outreach_status) VALUES ('ZZ','allowed');
  INSERT INTO lead_outreach (business_id) VALUES (biz_zz) RETURNING id, jurisdiction_cleared, suppression_checked
    INTO o, cleared, checked;
  IF NOT cleared OR NOT checked THEN
    RAISE EXCEPTION 'gate did not stamp jurisdiction_cleared/suppression_checked';
  END IF;

  -- Suppression on the business blocks a further outreach insert.
  INSERT INTO lead_suppressions (business_id, reason) VALUES (biz_zz, 'manual');
  BEGIN
    INSERT INTO lead_outreach (business_id) VALUES (biz_zz);
    RAISE EXCEPTION 'GATE FAIL: outreach to a suppressed business was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
  END;

  -- Business with NULL country is rejected (cannot clear jurisdiction).
  INSERT INTO lead_businesses (company_name, country_code) VALUES ('No Country', NULL)
    RETURNING id INTO biz_null;
  BEGIN
    INSERT INTO lead_outreach (business_id) VALUES (biz_null);
    RAISE EXCEPTION 'GATE FAIL: outreach with null country was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
  END;

  -- A 'review_required' country (IN) is NOT 'allowed' → blocked.
  INSERT INTO lead_businesses (company_name, country_code, domain)
    VALUES ('Acme IN', 'IN', 'acme-in.example') RETURNING id INTO biz_in;
  BEGIN
    INSERT INTO lead_outreach (business_id) VALUES (biz_in);
    RAISE EXCEPTION 'GATE FAIL: outreach to review_required jurisdiction was accepted';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'GATE FAIL%' THEN RAISE; END IF;
  END;

  -- Provenance defaults to an empty object (never null).
  IF (SELECT provenance FROM lead_businesses WHERE id = biz_zz) IS NULL THEN
    RAISE EXCEPTION 'provenance default missing';
  END IF;

  RAISE NOTICE 'lead_engine assertions passed';
END $$;

ROLLBACK;
