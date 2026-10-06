-- Command Center Batch 3: client + contract + document core.
-- Clients, the project lifecycle links, append-only document versions with
-- SHA-256 integrity, manually-recorded contract signatures, a render-job queue,
-- and the automation tables Batch 4 builds on. Additive and idempotent; new
-- tables are service_role-only RLS, matching the earlier hardening migrations.
BEGIN;

-- ── clients ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code        text NOT NULL UNIQUE,
  legal_name         text NOT NULL,
  display_name       text,
  contact_name       text,
  contact_email      text,
  status             text NOT NULL DEFAULT 'prospect'
                       CHECK (status IN ('prospect','active','paused','closed')),
  user_id            uuid,
  source_proposal_id uuid UNIQUE,
  is_fixture         boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS clients_service ON public.clients;
CREATE POLICY clients_service ON public.clients FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.clients FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.clients TO service_role;
DROP TRIGGER IF EXISTS clients_set_updated_at ON public.clients;
CREATE TRIGGER clients_set_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- ── projects: lifecycle links ───────────────────────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS client_id        uuid,
  ADD COLUMN IF NOT EXISTS proposal_id      uuid,
  ADD COLUMN IF NOT EXISTS contract_id      uuid,
  ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'draft';

-- One project per proposal / per contract (closes the double-project race).
CREATE UNIQUE INDEX IF NOT EXISTS projects_proposal_uniq ON public.projects (proposal_id) WHERE proposal_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS projects_contract_uniq ON public.projects (contract_id) WHERE contract_id IS NOT NULL;

-- ── client_contracts ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_contracts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL,
  project_id       uuid,
  reference        text UNIQUE,
  contract_type    text NOT NULL DEFAULT 'SOW',
  status           text NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','sent','signed','void')),
  -- Provenance is only meaningful once signed; manual_upload is labelled in the
  -- UI as "manually recorded, not provider-verified".
  provenance       text CHECK (provenance IN ('manual_upload','provider')),
  signatory_name   text,
  signatory_email  text,
  signed_at        timestamptz,
  signed_sha256    text CHECK (signed_sha256 IS NULL OR signed_sha256 ~ '^[0-9a-f]{64}$'),
  signed_storage_path text,
  created_by       uuid,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  -- A signed contract must carry its provenance + signatory + hash + date.
  CONSTRAINT client_contracts_signed_complete CHECK (
    status <> 'signed' OR (
      provenance IS NOT NULL AND signatory_name IS NOT NULL
      AND signed_at IS NOT NULL AND signed_sha256 IS NOT NULL
    )
  )
);
ALTER TABLE public.client_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contracts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS client_contracts_service ON public.client_contracts;
CREATE POLICY client_contracts_service ON public.client_contracts FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.client_contracts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.client_contracts TO service_role;
DROP TRIGGER IF EXISTS client_contracts_set_updated_at ON public.client_contracts;
CREATE TRIGGER client_contracts_set_updated_at BEFORE UPDATE ON public.client_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- ── client_documents ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_documents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          uuid NOT NULL,
  project_id         uuid,
  contract_id        uuid,
  doc_type           text NOT NULL,
  reference          text UNIQUE,
  title              text NOT NULL,
  status             text NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','in_review','approved','issued','superseded','void')),
  classification     text NOT NULL DEFAULT 'client_confidential'
                       CHECK (classification IN ('internal','client_confidential')),
  current_version_id uuid,
  author_id          uuid,
  approver_id        uuid,
  is_fixture         boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS client_documents_service ON public.client_documents;
CREATE POLICY client_documents_service ON public.client_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.client_documents FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.client_documents TO service_role;
DROP TRIGGER IF EXISTS client_documents_set_updated_at ON public.client_documents;
CREATE TRIGGER client_documents_set_updated_at BEFORE UPDATE ON public.client_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- ── client_document_versions (append-only) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_document_versions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid NOT NULL,
  version_no   int  NOT NULL,
  sha256       text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  size_bytes   int  NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 4194304),
  mime         text NOT NULL DEFAULT 'application/pdf' CHECK (mime = 'application/pdf'),
  -- No absolute paths, no traversal.
  storage_path text NOT NULL CHECK (storage_path !~ '\.\.' AND left(storage_path,1) <> '/'),
  author_id    uuid,
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, version_no)
);
CREATE INDEX IF NOT EXISTS client_document_versions_doc_idx
  ON public.client_document_versions (document_id, version_no DESC);
ALTER TABLE public.client_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_document_versions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cdv_service_insert ON public.client_document_versions;
CREATE POLICY cdv_service_insert ON public.client_document_versions FOR INSERT TO service_role WITH CHECK (true);
DROP POLICY IF EXISTS cdv_service_select ON public.client_document_versions;
CREATE POLICY cdv_service_select ON public.client_document_versions FOR SELECT TO service_role USING (true);
REVOKE ALL ON public.client_document_versions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.client_document_versions TO service_role;
REVOKE UPDATE, DELETE, TRUNCATE ON public.client_document_versions FROM service_role;

CREATE OR REPLACE FUNCTION public.cdv_block_mutate()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $fn$
BEGIN
  RAISE EXCEPTION 'client_document_versions is append-only' USING ERRCODE = '42501';
END $fn$;
DROP TRIGGER IF EXISTS cdv_immutable ON public.client_document_versions;
CREATE TRIGGER cdv_immutable BEFORE UPDATE OR DELETE ON public.client_document_versions
  FOR EACH ROW EXECUTE FUNCTION public.cdv_block_mutate();
DROP TRIGGER IF EXISTS cdv_no_truncate ON public.client_document_versions;
CREATE TRIGGER cdv_no_truncate BEFORE TRUNCATE ON public.client_document_versions
  FOR EACH STATEMENT EXECUTE FUNCTION public.cdv_block_mutate();

-- ── document_render_jobs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.document_render_jobs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id  uuid,
  status       text NOT NULL DEFAULT 'queued'
                 CHECK (status IN ('queued','claimed','rendering','succeeded','failed','dead_letter')),
  attempts     int  NOT NULL DEFAULT 0,
  max_attempts int  NOT NULL DEFAULT 3,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  error        text,
  claimed_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS document_render_jobs_queue_idx
  ON public.document_render_jobs (status, created_at) WHERE status = 'queued';
ALTER TABLE public.document_render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_render_jobs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS drj_service ON public.document_render_jobs;
CREATE POLICY drj_service ON public.document_render_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.document_render_jobs FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.document_render_jobs TO service_role;
DROP TRIGGER IF EXISTS drj_set_updated_at ON public.document_render_jobs;
CREATE TRIGGER drj_set_updated_at BEFORE UPDATE ON public.document_render_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- ── automation_events + provisioning_steps (used by Batch 4) ────────────────
CREATE TABLE IF NOT EXISTS public.automation_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  payload    jsonb NOT NULL DEFAULT '{}'::jsonb,
  status     text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','dispatched','processed','failed','dead_letter')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_events FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS automation_events_service ON public.automation_events;
CREATE POLICY automation_events_service ON public.automation_events FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.automation_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.automation_events TO service_role;
DROP TRIGGER IF EXISTS automation_events_set_updated_at ON public.automation_events;
CREATE TRIGGER automation_events_set_updated_at BEFORE UPDATE ON public.automation_events
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TABLE IF NOT EXISTS public.provisioning_steps (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  step       text NOT NULL,
  status     text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','running','succeeded','failed','skipped','not_configured')),
  detail     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, step)
);
ALTER TABLE public.provisioning_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provisioning_steps FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS provisioning_steps_service ON public.provisioning_steps;
CREATE POLICY provisioning_steps_service ON public.provisioning_steps FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.provisioning_steps FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.provisioning_steps TO service_role;
DROP TRIGGER IF EXISTS provisioning_steps_set_updated_at ON public.provisioning_steps;
CREATE TRIGGER provisioning_steps_set_updated_at BEFORE UPDATE ON public.provisioning_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- ── transition_document: allowed transitions + approver<>author ─────────────
CREATE OR REPLACE FUNCTION public.transition_document(
  p_doc uuid, p_to_status text, p_actor uuid, p_actor_email text, p_request_id text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $fn$
DECLARE
  cur text;
  author uuid;
  allowed boolean := false;
BEGIN
  SELECT status, author_id INTO cur, author FROM public.client_documents WHERE id = p_doc FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;

  -- Allowed transition table.
  allowed := (cur = 'draft'     AND p_to_status = 'in_review')
          OR (cur = 'in_review' AND p_to_status IN ('approved','draft'))
          OR (cur = 'approved'  AND p_to_status IN ('issued','draft'))
          OR (cur = 'issued'    AND p_to_status = 'superseded')
          OR (p_to_status = 'void' AND cur <> 'void');
  IF NOT allowed THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'illegal_transition', 'from', cur, 'to', p_to_status);
  END IF;

  -- Four-eyes: the approver cannot be the author.
  IF p_to_status = 'approved' AND author IS NOT NULL AND author = p_actor THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'approver_is_author');
  END IF;

  UPDATE public.client_documents
     SET status = p_to_status,
         approver_id = CASE WHEN p_to_status = 'approved' THEN p_actor ELSE approver_id END
   WHERE id = p_doc;

  INSERT INTO public.admin_audit_log
    (actor_user_id, actor_email, actor_role, action, capability, target_type, target_id, outcome, request_id, metadata)
  VALUES
    (p_actor, p_actor_email, NULL, 'document.transition', 'documents.review', 'document', p_doc::text,
     'succeeded', p_request_id, jsonb_build_object('from', cur, 'to', p_to_status));

  RETURN jsonb_build_object('ok', true, 'from', cur, 'to', p_to_status);
END $fn$;

-- ── record_contract_signature: idempotent per sha256 ────────────────────────
CREATE OR REPLACE FUNCTION public.record_contract_signature(
  p_contract uuid, p_sha256 text, p_signatory_name text, p_signatory_email text,
  p_storage_path text, p_provenance text, p_actor uuid, p_actor_email text, p_request_id text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $fn$
DECLARE
  rec public.client_contracts%ROWTYPE;
BEGIN
  IF p_sha256 !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid signature hash' USING ERRCODE = '22023';
  END IF;
  IF p_provenance NOT IN ('manual_upload','provider') THEN
    RAISE EXCEPTION 'Invalid provenance' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO rec FROM public.client_contracts WHERE id = p_contract FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;

  IF rec.status = 'signed' THEN
    -- Idempotent only for the same document hash; a different hash is a conflict.
    IF rec.signed_sha256 = p_sha256 THEN
      RETURN jsonb_build_object('ok', true, 'reason', 'already_signed');
    END IF;
    RETURN jsonb_build_object('ok', false, 'reason', 'already_signed_other_hash');
  END IF;

  UPDATE public.client_contracts
     SET status = 'signed', provenance = p_provenance,
         signatory_name = p_signatory_name, signatory_email = p_signatory_email,
         signed_at = now(), signed_sha256 = p_sha256, signed_storage_path = p_storage_path
   WHERE id = p_contract;

  INSERT INTO public.automation_events (event_type, payload)
  VALUES ('contract.signed', jsonb_build_object('contract_id', p_contract, 'provenance', p_provenance));

  INSERT INTO public.admin_audit_log
    (actor_user_id, actor_email, actor_role, action, capability, target_type, target_id, outcome, request_id, metadata)
  VALUES
    (p_actor, p_actor_email, NULL, 'contract.record_signature', 'contracts.record_signature',
     'contract', p_contract::text, 'succeeded', p_request_id,
     jsonb_build_object('provenance', p_provenance, 'sha256', p_sha256));

  RETURN jsonb_build_object('ok', true, 'reason', 'signed');
END $fn$;

-- ── claim_render_job: one queued job, FOR UPDATE SKIP LOCKED ─────────────────
CREATE OR REPLACE FUNCTION public.claim_render_job()
RETURNS SETOF public.document_render_jobs
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $fn$
DECLARE
  job_id uuid;
BEGIN
  SELECT id INTO job_id FROM public.document_render_jobs
   WHERE status = 'queued'
   ORDER BY created_at
   FOR UPDATE SKIP LOCKED
   LIMIT 1;
  IF job_id IS NULL THEN RETURN; END IF;
  RETURN QUERY
    UPDATE public.document_render_jobs
       SET status = 'claimed', attempts = attempts + 1, claimed_at = now()
     WHERE id = job_id
     RETURNING *;
END $fn$;

REVOKE ALL ON FUNCTION public.transition_document(uuid, text, uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.transition_document(uuid, text, uuid, text, text) TO service_role;
REVOKE ALL ON FUNCTION public.record_contract_signature(uuid, text, text, text, text, text, uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_contract_signature(uuid, text, text, text, text, text, uuid, text, text) TO service_role;
REVOKE ALL ON FUNCTION public.claim_render_job() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_render_job() TO service_role;

-- ── private storage bucket for documents ────────────────────────────────────
-- Private (public = false), 4 MB cap, PDF only. No object policies are created
-- for anon/authenticated, so only the service role (which bypasses storage RLS)
-- can read or write objects; downloads are handed out as short-lived signed URLs.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('lit-documents', 'lit-documents', false, 4194304, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET public = false, file_size_limit = 4194304, allowed_mime_types = ARRAY['application/pdf'];

COMMIT;
