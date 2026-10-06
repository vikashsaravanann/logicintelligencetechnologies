-- Batch 2 assertions: invoice/proposal columns + status checks, the
-- invoices updated_at trigger, idempotent approve_proposal, and GET-safe
-- record_proposal_view. Runs in a transaction that is rolled back; any
-- failure raises an exception.
\set ON_ERROR_STOP on
BEGIN;

-- Helper seed values reused below.
DO $$
DECLARE
  res jsonb;
  r public.proposals%ROWTYPE;
  inv_updated timestamptz;
BEGIN
  -- ── invoices ──────────────────────────────────────────────────────────────
  -- New columns exist and a clean status inserts.
  INSERT INTO public.invoices(invoice_code, client_name, amount, status, client_email, description, currency, updated_at)
    VALUES ('LIT-INV-2026-0001','Acme', 1000, 'Pending', 'a@acme.test', 'Work', 'INR', TIMESTAMPTZ '2000-01-01');

  -- status CHECK rejects an unknown / lowercase value.
  BEGIN
    INSERT INTO public.invoices(invoice_code, client_name, amount, status)
      VALUES ('LIT-INV-2026-0002','Bad', 1, 'paid');
    RAISE EXCEPTION 'invoice bad status accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;

  -- BEFORE UPDATE trigger stamps updated_at = now() (past value set on insert).
  UPDATE public.invoices SET status = 'Paid', paid_at = now() WHERE invoice_code = 'LIT-INV-2026-0001';
  SELECT updated_at INTO inv_updated FROM public.invoices WHERE invoice_code = 'LIT-INV-2026-0001';
  IF inv_updated < now() - interval '1 minute' THEN
    RAISE EXCEPTION 'invoices updated_at trigger did not fire: %', inv_updated;
  END IF;

  -- ── proposals: status check + reference uniqueness ─────────────────────────
  INSERT INTO public.proposals(secure_token, client_name, client_email, title, scope, deliverables, timeline, pricing, status)
    VALUES ('tok-sent','Jane','jane@c.test','Build', ARRAY['x'], ARRAY['y'], '4 weeks', 50000, 'Sent');

  BEGIN
    UPDATE public.proposals SET status = 'Bogus' WHERE secure_token = 'tok-sent';
    RAISE EXCEPTION 'proposal bad status accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;

  UPDATE public.proposals SET reference = 'LIT-PROP-2026-0001' WHERE secure_token = 'tok-sent';
  INSERT INTO public.proposals(secure_token, client_name, client_email, title, scope, deliverables, timeline, pricing, status, reference)
    VALUES ('tok-dup','D','d@c.test','D', ARRAY['x'], ARRAY['y'], '1 week', 1, 'Draft', NULL); -- NULL reference is fine
  BEGIN
    UPDATE public.proposals SET reference = 'LIT-PROP-2026-0001' WHERE secure_token = 'tok-dup';
    RAISE EXCEPTION 'duplicate reference accepted';
  EXCEPTION WHEN unique_violation THEN NULL; END;

  -- ── approve_proposal: idempotent, provenance recorded ──────────────────────
  SELECT public.approve_proposal('tok-sent','  Jane Doe  ','iphash','UA/1.0') INTO res;
  IF (res->>'reason') <> 'approved' THEN RAISE EXCEPTION 'approve not approved: %', res; END IF;
  SELECT * INTO r FROM public.proposals WHERE secure_token = 'tok-sent';
  IF r.status <> 'Approved' THEN RAISE EXCEPTION 'status not Approved'; END IF;
  IF r.signer_name <> 'Jane Doe' THEN RAISE EXCEPTION 'signer_name not trimmed/stored: %', r.signer_name; END IF;
  IF r.approved_at IS NULL OR r.accepted_ip_hash <> 'iphash' THEN RAISE EXCEPTION 'provenance missing'; END IF;

  -- Second call is idempotent.
  SELECT public.approve_proposal('tok-sent','Someone Else','other','UA') INTO res;
  IF (res->>'reason') <> 'already_approved' THEN RAISE EXCEPTION 'second approve not idempotent: %', res; END IF;
  SELECT signer_name INTO r.signer_name FROM public.proposals WHERE secure_token = 'tok-sent';
  IF r.signer_name <> 'Jane Doe' THEN RAISE EXCEPTION 'idempotent approve overwrote provenance'; END IF;

  -- Draft is not acceptable.
  INSERT INTO public.proposals(secure_token, client_name, client_email, title, scope, deliverables, timeline, pricing, status)
    VALUES ('tok-draft','K','k@c.test','K', ARRAY['x'], ARRAY['y'], '1 week', 1, 'Draft');
  SELECT public.approve_proposal('tok-draft','x','i','u') INTO res;
  IF (res->>'reason') <> 'not_acceptable' THEN RAISE EXCEPTION 'draft approve not rejected: %', res; END IF;

  -- Expired is rejected.
  INSERT INTO public.proposals(secure_token, client_name, client_email, title, scope, deliverables, timeline, pricing, status, expires_at)
    VALUES ('tok-exp','E','e@c.test','E', ARRAY['x'], ARRAY['y'], '1 week', 1, 'Sent', now() - interval '1 day');
  SELECT public.approve_proposal('tok-exp','x','i','u') INTO res;
  IF (res->>'reason') <> 'expired' THEN RAISE EXCEPTION 'expired approve not rejected: %', res; END IF;

  -- Unknown token.
  SELECT public.approve_proposal('nope','x','i','u') INTO res;
  IF (res->>'reason') <> 'not_found' THEN RAISE EXCEPTION 'unknown token not reported: %', res; END IF;

  -- ── record_proposal_view: first view only, GET-safe ────────────────────────
  INSERT INTO public.proposals(secure_token, client_name, client_email, title, scope, deliverables, timeline, pricing, status)
    VALUES ('tok-view','V','v@c.test','V', ARRAY['x'], ARRAY['y'], '1 week', 1, 'Sent');
  SELECT public.record_proposal_view('tok-view') INTO res;
  IF (res->>'changed') <> 'true' THEN RAISE EXCEPTION 'first view not recorded: %', res; END IF;
  SELECT * INTO r FROM public.proposals WHERE secure_token = 'tok-view';
  IF r.status <> 'Viewed' OR r.viewed_at IS NULL THEN RAISE EXCEPTION 'view did not promote to Viewed'; END IF;

  -- Second view is a no-op.
  SELECT public.record_proposal_view('tok-view') INTO res;
  IF (res->>'changed') <> 'false' THEN RAISE EXCEPTION 'second view changed state: %', res; END IF;

  -- Approved proposal is never touched by a view.
  SELECT public.record_proposal_view('tok-sent') INTO res;
  IF (res->>'changed') <> 'false' THEN RAISE EXCEPTION 'view touched Approved proposal: %', res; END IF;

  RAISE NOTICE 'batch2 assertions passed';
END $$;

ROLLBACK;
