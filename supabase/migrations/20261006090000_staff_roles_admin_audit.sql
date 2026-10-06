-- Command Center Batch 1: staff roles, capabilities enforcement support,
-- append-only admin audit log, server-generated reference numbers.
-- Additive and idempotent. Applied to prod via Supabase SQL after review.
BEGIN;

-- ── Staff roles ────────────────────────────────────────────────────────────
-- Extend the allowed profiles.role set. Live values are only user/client/
-- super_admin (prechecks), so NOT VALID + VALIDATE is safe. guard_profile_role
-- already blocks a user changing their own role with the anon key.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_role_check' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('user','client','super_admin','admin','operations','support','developer','viewer'))
      NOT VALID;
    ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_role_check;
  END IF;
END $$;

-- Never leave the platform with zero super_admins. Blocks the demotion or
-- deletion of the last super_admin. The advisory lock serialises concurrent
-- role changes so two demotions cannot race past the count.
CREATE OR REPLACE FUNCTION public.protect_last_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  remaining int;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;
  IF OLD.role <> 'super_admin' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('lit.super_admin'));
  SELECT count(*) INTO remaining
  FROM public.profiles
  WHERE role = 'super_admin' AND id <> OLD.id;
  IF remaining = 0 THEN
    RAISE EXCEPTION 'Cannot remove the last super_admin' USING ERRCODE = '42501';
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS protect_last_super_admin ON public.profiles;
CREATE TRIGGER protect_last_super_admin
  BEFORE UPDATE OF role OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_last_super_admin();

-- ── Append-only admin audit log ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at   timestamptz NOT NULL DEFAULT now(),
  actor_user_id uuid,
  actor_email   text,
  actor_role    text,
  action        text NOT NULL CHECK (action ~ '^[a-z_]+\.[a-z_.]+$'),
  capability    text,
  target_type   text,
  target_id     text,
  outcome       text NOT NULL CHECK (outcome IN ('succeeded','failed','denied')),
  request_id    text NOT NULL,
  correlation_id text,
  ip_hash       text,
  user_agent    text CHECK (user_agent IS NULL OR length(user_agent) <= 300),
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb
                  CHECK (jsonb_typeof(metadata) = 'object' AND octet_length(metadata::text) <= 8192),
  error_code    text
);

CREATE INDEX IF NOT EXISTS admin_audit_log_recent_idx ON public.admin_audit_log (occurred_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_actor_idx ON public.admin_audit_log (actor_user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_target_idx ON public.admin_audit_log (target_type, target_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_action_idx ON public.admin_audit_log (action, occurred_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_request_idx ON public.admin_audit_log (request_id);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_audit_service_insert ON public.admin_audit_log;
CREATE POLICY admin_audit_service_insert ON public.admin_audit_log
  FOR INSERT TO service_role WITH CHECK (true);
DROP POLICY IF EXISTS admin_audit_service_select ON public.admin_audit_log;
CREATE POLICY admin_audit_service_select ON public.admin_audit_log
  FOR SELECT TO service_role USING (true);

REVOKE ALL ON public.admin_audit_log FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.admin_audit_log TO service_role;
REVOKE UPDATE, DELETE, TRUNCATE ON public.admin_audit_log FROM service_role;

-- No UPDATE/DELETE/TRUNCATE, for anyone, ever (owner/postgres included).
-- Empty search_path: the body references no objects, and this keeps the
-- function off the mutable-search_path advisor.
CREATE OR REPLACE FUNCTION public.admin_audit_log_block_mutate()
RETURNS trigger LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'admin_audit_log is append-only' USING ERRCODE = '42501';
END $$;

DROP TRIGGER IF EXISTS admin_audit_log_immutable ON public.admin_audit_log;
CREATE TRIGGER admin_audit_log_immutable
  BEFORE UPDATE OR DELETE ON public.admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.admin_audit_log_block_mutate();

DROP TRIGGER IF EXISTS admin_audit_log_no_truncate ON public.admin_audit_log;
CREATE TRIGGER admin_audit_log_no_truncate
  BEFORE TRUNCATE ON public.admin_audit_log
  FOR EACH STATEMENT EXECUTE FUNCTION public.admin_audit_log_block_mutate();

-- ── Server-generated reference numbers (LIT-SOW-2026-0001) ──────────────────
CREATE TABLE IF NOT EXISTS public.reference_counters (
  prefix     text NOT NULL,
  year       int  NOT NULL,
  last_value int  NOT NULL DEFAULT 0,
  PRIMARY KEY (prefix, year)
);
ALTER TABLE public.reference_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_counters FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reference_counters_service ON public.reference_counters;
CREATE POLICY reference_counters_service ON public.reference_counters
  FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.reference_counters FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.reference_counters TO service_role;

CREATE OR REPLACE FUNCTION public.next_reference(p_prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  y int := extract(year FROM (now() AT TIME ZONE 'Asia/Kolkata'))::int;
  n int;
BEGIN
  IF p_prefix !~ '^LIT-[A-Z]{2,5}$' THEN
    RAISE EXCEPTION 'Invalid reference prefix: %', p_prefix USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.reference_counters (prefix, year, last_value)
  VALUES (p_prefix, y, 1)
  ON CONFLICT (prefix, year) DO UPDATE SET last_value = public.reference_counters.last_value + 1
  RETURNING last_value INTO n;
  RETURN p_prefix || '-' || y::text || '-' || lpad(n::text, 4, '0');
END $$;

REVOKE ALL ON FUNCTION public.next_reference(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_reference(text) TO service_role;

-- ── Role assignment RPC (super_admin only; upserts missing profile rows) ────
CREATE OR REPLACE FUNCTION public.admin_set_role(
  p_target uuid, p_role text, p_actor uuid, p_actor_email text, p_request_id text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  actor_role text;
  target_email text;
  old_role text;
BEGIN
  IF p_role NOT IN ('user','client','super_admin','admin','operations','support','developer','viewer') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role USING ERRCODE = '22023';
  END IF;
  SELECT role INTO actor_role FROM public.profiles WHERE id = p_actor;
  IF actor_role IS DISTINCT FROM 'super_admin' THEN
    RAISE EXCEPTION 'Only a super_admin may assign roles' USING ERRCODE = '42501';
  END IF;
  SELECT email INTO target_email FROM auth.users WHERE id = p_target;
  IF target_email IS NULL THEN
    RAISE EXCEPTION 'Target user not found' USING ERRCODE = 'P0002';
  END IF;
  SELECT role INTO old_role FROM public.profiles WHERE id = p_target;

  INSERT INTO public.profiles (id, email, role)
  VALUES (p_target, target_email, p_role)
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  INSERT INTO public.admin_audit_log
    (actor_user_id, actor_email, actor_role, action, capability, target_type, target_id, outcome, request_id, metadata)
  VALUES
    (p_actor, p_actor_email, 'super_admin', 'team.role_change', 'team.manage', 'user', p_target::text,
     'succeeded', p_request_id,
     jsonb_build_object('old_role', old_role, 'new_role', p_role, 'target_email', target_email));

  RETURN jsonb_build_object('old_role', old_role, 'new_role', p_role);
END $$;

REVOKE ALL ON FUNCTION public.admin_set_role(uuid, text, uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, text, uuid, text, text) TO service_role;

COMMIT;
