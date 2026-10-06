-- Batch 4 assertions: onboarding session guards, single-active-per-contract,
-- and the atomic single-use consume. Runs in a rolled-back transaction.
\set ON_ERROR_STOP on
BEGIN;

DO $$
DECLARE
  res jsonb; n int; proj uuid;
  ctr uuid := '44444444-4444-4444-8444-444444444444';
  h  text := repeat('c',64);
  h2 text := repeat('d',64);
  h3 text := repeat('e',64);
BEGIN
  INSERT INTO public.projects (project_code, client_name, name) VALUES ('LIT-PRJ-OB','Acme','P') RETURNING id INTO proj;

  -- token_hash format enforced
  BEGIN
    INSERT INTO public.onboarding_sessions (token_hash, expires_at) VALUES ('nothex', now() + interval '7 days');
    RAISE EXCEPTION 'bad token_hash accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;

  -- expiry cap (>30d) rejected
  BEGIN
    INSERT INTO public.onboarding_sessions (token_hash, expires_at) VALUES (h, now() + interval '40 days');
    RAISE EXCEPTION 'over-long expiry accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;

  -- a valid active session
  INSERT INTO public.onboarding_sessions (token_hash, contract_id, project_id, expires_at)
    VALUES (h, ctr, proj, now() + interval '7 days');

  -- only one active session per contract
  BEGIN
    INSERT INTO public.onboarding_sessions (token_hash, contract_id, expires_at)
      VALUES (h2, ctr, now() + interval '7 days');
    RAISE EXCEPTION 'second active session per contract accepted';
  EXCEPTION WHEN unique_violation THEN NULL; END;

  -- consume the valid session
  SELECT public.consume_onboarding_session(h, jsonb_build_object('company','Acme'), 'iphash') INTO res;
  IF (res->>'ok') <> 'true' THEN RAISE EXCEPTION 'consume failed: %', res; END IF;

  -- a submission with no owning user was recorded
  SELECT count(*) INTO n FROM public.onboarding_submissions WHERE session_id IS NOT NULL AND user_id IS NULL;
  IF n <> 1 THEN RAISE EXCEPTION 'expected one ownerless submission, got %', n; END IF;

  -- project advanced + event emitted
  SELECT count(*) INTO n FROM public.projects WHERE id = proj AND lifecycle_status = 'onboarding_received';
  IF n <> 1 THEN RAISE EXCEPTION 'project not advanced to onboarding_received'; END IF;
  SELECT count(*) INTO n FROM public.automation_events WHERE event_type = 'onboarding.submitted';
  IF n <> 1 THEN RAISE EXCEPTION 'onboarding.submitted event not emitted'; END IF;

  -- second consume of the same token is rejected (single use)
  SELECT public.consume_onboarding_session(h, '{}'::jsonb, 'iphash') INTO res;
  IF (res->>'reason') <> 'consumed' THEN RAISE EXCEPTION 'double consume not blocked: %', res; END IF;

  -- unknown token → generic invalid
  SELECT public.consume_onboarding_session(h3, '{}'::jsonb, NULL) INTO res;
  IF (res->>'reason') <> 'invalid' THEN RAISE EXCEPTION 'unknown token not generic: %', res; END IF;

  -- revoked session → revoked
  INSERT INTO public.onboarding_sessions (token_hash, expires_at, revoked_at)
    VALUES (h2, now() + interval '7 days', now());
  SELECT public.consume_onboarding_session(h2, '{}'::jsonb, NULL) INTO res;
  IF (res->>'reason') <> 'revoked' THEN RAISE EXCEPTION 'revoked not blocked: %', res; END IF;

  -- expired session → expired (bypass the 30d CHECK via a past created_at)
  INSERT INTO public.onboarding_sessions (token_hash, created_at, expires_at)
    VALUES (h3, now() - interval '10 days', now() - interval '1 day');
  SELECT public.consume_onboarding_session(h3, '{}'::jsonb, NULL) INTO res;
  IF (res->>'reason') <> 'expired' THEN RAISE EXCEPTION 'expired not blocked: %', res; END IF;

  RAISE NOTICE 'batch4 assertions passed';
END $$;

ROLLBACK;
