-- Command Center Batch 4: secure onboarding sessions + consume RPC.
-- Hashed single-use onboarding tokens, an intake submission that is invisible to
-- clients (no owning user), and an atomic consume that records the submission,
-- advances the project, and emits an automation event. Additive + idempotent;
-- new objects are service_role-only RLS.
BEGIN;

-- ── onboarding_sessions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.onboarding_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  text NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  client_id   uuid,
  project_id  uuid,
  contract_id uuid,
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  revoked_at  timestamptz,
  consumed_at timestamptz,
  last_seen_at timestamptz,
  -- Tokens live at most 30 days.
  CONSTRAINT onboarding_sessions_expiry CHECK (expires_at <= created_at + interval '30 days')
);
-- At most one active (not revoked, not consumed) session per contract.
CREATE UNIQUE INDEX IF NOT EXISTS onboarding_sessions_active_contract
  ON public.onboarding_sessions (contract_id)
  WHERE contract_id IS NOT NULL AND revoked_at IS NULL AND consumed_at IS NULL;

ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_sessions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS onboarding_sessions_service ON public.onboarding_sessions;
CREATE POLICY onboarding_sessions_service ON public.onboarding_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.onboarding_sessions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.onboarding_sessions TO service_role;

-- ── onboarding_submissions: decouple from a user, add intake links ──────────
-- Existing columns: id, user_id (was NOT NULL), answers_json, status, created_at.
ALTER TABLE public.onboarding_submissions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.onboarding_submissions
  ADD COLUMN IF NOT EXISTS session_id uuid,
  ADD COLUMN IF NOT EXISTS client_id  uuid,
  ADD COLUMN IF NOT EXISTS project_id uuid,
  ADD COLUMN IF NOT EXISTS intake     jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ip_hash    text;

-- ── consume_onboarding_session: atomic, single-use ─────────────────────────
CREATE OR REPLACE FUNCTION public.consume_onboarding_session(
  p_token_hash text, p_intake jsonb, p_ip_hash text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $fn$
DECLARE
  s public.onboarding_sessions%ROWTYPE;
BEGIN
  IF p_token_hash !~ '^[0-9a-f]{64}$' THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid');
  END IF;
  SELECT * INTO s FROM public.onboarding_sessions WHERE token_hash = p_token_hash FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid'); END IF;
  IF s.revoked_at IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'revoked'); END IF;
  IF s.consumed_at IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'consumed'); END IF;
  IF s.expires_at < now() THEN RETURN jsonb_build_object('ok', false, 'reason', 'expired'); END IF;

  INSERT INTO public.onboarding_submissions (user_id, session_id, client_id, project_id, intake, status, ip_hash, answers_json)
  VALUES (NULL, s.id, s.client_id, s.project_id, p_intake, 'Submitted', p_ip_hash, p_intake);

  UPDATE public.onboarding_sessions SET consumed_at = now() WHERE id = s.id;

  IF s.project_id IS NOT NULL THEN
    UPDATE public.projects SET lifecycle_status = 'onboarding_received' WHERE id = s.project_id;
  END IF;

  INSERT INTO public.automation_events (event_type, payload)
  VALUES ('onboarding.submitted', jsonb_build_object('session_id', s.id, 'client_id', s.client_id, 'project_id', s.project_id));

  RETURN jsonb_build_object('ok', true, 'session_id', s.id, 'client_id', s.client_id, 'project_id', s.project_id);
END $fn$;

-- Touch last_seen for a valid, unconsumed session (rate-limited GET validation).
CREATE OR REPLACE FUNCTION public.touch_onboarding_session(p_token_hash text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $fn$
DECLARE s public.onboarding_sessions%ROWTYPE;
BEGIN
  SELECT * INTO s FROM public.onboarding_sessions WHERE token_hash = p_token_hash;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid'); END IF;
  IF s.revoked_at IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'revoked'); END IF;
  IF s.consumed_at IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'consumed'); END IF;
  IF s.expires_at < now() THEN RETURN jsonb_build_object('ok', false, 'reason', 'expired'); END IF;
  UPDATE public.onboarding_sessions SET last_seen_at = now() WHERE id = s.id;
  RETURN jsonb_build_object('ok', true);
END $fn$;

REVOKE ALL ON FUNCTION public.consume_onboarding_session(text, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_onboarding_session(text, jsonb, text) TO service_role;
REVOKE ALL ON FUNCTION public.touch_onboarding_session(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touch_onboarding_session(text) TO service_role;

COMMIT;
