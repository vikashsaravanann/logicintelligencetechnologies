-- Batch 3 assertions: client/contract/document core, append-only versions with
-- SHA-256 + size + path guards, idempotent contract signature, document
-- transitions with four-eyes, and the render-job claim. Runs in a transaction
-- that is rolled back; any failure raises an exception.
\set ON_ERROR_STOP on
BEGIN;

DO $$
DECLARE
  cli uuid; doc uuid; ctr uuid; res jsonb; n int;
  a_author uuid := '11111111-1111-4111-8111-111111111111';
  a_other  uuid := '22222222-2222-4222-8222-222222222222';
  h1 text := repeat('a',64);
  h2 text := repeat('b',64);
BEGIN
  -- ── clients: status check ──────────────────────────────────────────────────
  INSERT INTO public.clients (client_code, legal_name, status)
    VALUES ('LIT-CLI-2026-0001','Acme Pvt','prospect') RETURNING id INTO cli;
  BEGIN
    UPDATE public.clients SET status = 'bogus' WHERE id = cli;
    RAISE EXCEPTION 'client bad status accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;

  -- ── projects: one project per proposal ─────────────────────────────────────
  INSERT INTO public.projects (project_code, client_name, name, proposal_id)
    VALUES ('LIT-PRJ-1','Acme','P1','33333333-3333-4333-8333-333333333333');
  BEGIN
    INSERT INTO public.projects (project_code, client_name, name, proposal_id)
      VALUES ('LIT-PRJ-2','Acme','P2','33333333-3333-4333-8333-333333333333');
    RAISE EXCEPTION 'duplicate project-per-proposal accepted';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  -- NULL proposal_id is exempt from the partial unique index.
  INSERT INTO public.projects (project_code, client_name, name) VALUES ('LIT-PRJ-3','Acme','P3');
  INSERT INTO public.projects (project_code, client_name, name) VALUES ('LIT-PRJ-4','Acme','P4');

  -- ── documents + append-only versions ───────────────────────────────────────
  INSERT INTO public.client_documents (client_id, doc_type, title, author_id)
    VALUES (cli, 'sow', 'SOW for Acme', a_author) RETURNING id INTO doc;

  INSERT INTO public.client_document_versions (document_id, version_no, sha256, size_bytes, storage_path, author_id)
    VALUES (doc, 1, h1, 1024, 'acme/sow/v1.pdf', a_author);

  -- immutable: update/delete blocked
  BEGIN
    UPDATE public.client_document_versions SET note = 'x' WHERE document_id = doc;
    RAISE EXCEPTION 'version UPDATE allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    DELETE FROM public.client_document_versions WHERE document_id = doc;
    RAISE EXCEPTION 'version DELETE allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  -- bad sha256 format
  BEGIN
    INSERT INTO public.client_document_versions (document_id, version_no, sha256, size_bytes, storage_path)
      VALUES (doc, 2, 'nothex', 10, 'acme/sow/v2.pdf');
    RAISE EXCEPTION 'bad sha256 accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  -- oversize
  BEGIN
    INSERT INTO public.client_document_versions (document_id, version_no, sha256, size_bytes, storage_path)
      VALUES (doc, 2, h2, 4194305, 'acme/sow/v2.pdf');
    RAISE EXCEPTION 'oversize version accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  -- traversal path
  BEGIN
    INSERT INTO public.client_document_versions (document_id, version_no, sha256, size_bytes, storage_path)
      VALUES (doc, 2, h2, 10, '../etc/passwd.pdf');
    RAISE EXCEPTION 'traversal path accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  -- non-pdf mime
  BEGIN
    INSERT INTO public.client_document_versions (document_id, version_no, sha256, size_bytes, mime, storage_path)
      VALUES (doc, 2, h2, 10, 'text/plain', 'acme/sow/v2.txt');
    RAISE EXCEPTION 'non-pdf mime accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;

  -- ── contracts: signed-completeness + idempotent signature ──────────────────
  -- direct signed insert without fields fails
  BEGIN
    INSERT INTO public.client_contracts (client_id, status) VALUES (cli, 'signed');
    RAISE EXCEPTION 'signed-without-fields accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;

  INSERT INTO public.client_contracts (client_id, contract_type, status) VALUES (cli, 'SOW', 'draft') RETURNING id INTO ctr;

  SELECT public.record_contract_signature(ctr, h1, 'Jane Doe', 'jane@acme.test', 'acme/contracts/sow.pdf', 'manual_upload', a_author, 'jane@x', 'req-1') INTO res;
  IF (res->>'reason') <> 'signed' THEN RAISE EXCEPTION 'first signature not recorded: %', res; END IF;

  -- idempotent for the same hash
  SELECT public.record_contract_signature(ctr, h1, 'Jane Doe', 'jane@acme.test', 'acme/contracts/sow.pdf', 'manual_upload', a_author, 'jane@x', 'req-2') INTO res;
  IF (res->>'reason') <> 'already_signed' THEN RAISE EXCEPTION 'idempotent signature failed: %', res; END IF;

  -- a different hash is a conflict, not a silent overwrite
  SELECT public.record_contract_signature(ctr, h2, 'Jane Doe', 'jane@acme.test', 'acme/contracts/sow.pdf', 'manual_upload', a_author, 'jane@x', 'req-3') INTO res;
  IF (res->>'reason') <> 'already_signed_other_hash' THEN RAISE EXCEPTION 'different-hash not rejected: %', res; END IF;

  -- contract.signed automation event was emitted exactly once
  SELECT count(*) INTO n FROM public.automation_events WHERE event_type = 'contract.signed';
  IF n <> 1 THEN RAISE EXCEPTION 'expected one contract.signed event, got %', n; END IF;

  -- ── document transitions + four-eyes ───────────────────────────────────────
  SELECT public.transition_document(doc, 'in_review', a_author, 'a@x', 'r1') INTO res;
  IF (res->>'ok') <> 'true' THEN RAISE EXCEPTION 'draft->in_review failed: %', res; END IF;
  -- author cannot approve their own document
  SELECT public.transition_document(doc, 'approved', a_author, 'a@x', 'r2') INTO res;
  IF (res->>'reason') <> 'approver_is_author' THEN RAISE EXCEPTION 'four-eyes not enforced: %', res; END IF;
  -- another actor can
  SELECT public.transition_document(doc, 'approved', a_other, 'b@x', 'r3') INTO res;
  IF (res->>'ok') <> 'true' THEN RAISE EXCEPTION 'approval by other failed: %', res; END IF;
  -- illegal transition
  SELECT public.transition_document(doc, 'draft', a_other, 'b@x', 'r4') INTO res;
  IF (res->>'ok') <> 'true' THEN RAISE EXCEPTION 'approved->draft should be allowed: %', res; END IF;
  SELECT public.transition_document(doc, 'issued', a_other, 'b@x', 'r5') INTO res;
  IF (res->>'reason') <> 'illegal_transition' THEN RAISE EXCEPTION 'draft->issued should be illegal: %', res; END IF;

  -- ── render job claim ───────────────────────────────────────────────────────
  INSERT INTO public.document_render_jobs (document_id) VALUES (doc);
  SELECT count(*) INTO n FROM public.claim_render_job();
  IF n <> 1 THEN RAISE EXCEPTION 'claim_render_job did not return the queued job'; END IF;
  SELECT count(*) INTO n FROM public.claim_render_job();
  IF n <> 0 THEN RAISE EXCEPTION 'claim_render_job returned an already-claimed job'; END IF;

  -- ── storage bucket is private, pdf-only ────────────────────────────────────
  SELECT count(*) INTO n FROM storage.buckets WHERE id = 'lit-documents' AND public = false;
  IF n <> 1 THEN RAISE EXCEPTION 'lit-documents bucket missing or not private'; END IF;

  RAISE NOTICE 'batch3 assertions passed';
END $$;

ROLLBACK;
