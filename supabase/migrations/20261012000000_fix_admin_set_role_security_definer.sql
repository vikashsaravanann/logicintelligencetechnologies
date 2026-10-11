-- Fix admin_set_role to use SECURITY DEFINER so that it has permission to query auth.users
-- and provide platform_settings table for configurable engine credentials.

BEGIN;

CREATE OR REPLACE FUNCTION public.admin_set_role(
  p_target uuid, p_role text, p_actor uuid, p_actor_email text, p_request_id text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Configurable platform settings store (service_role only)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_settings_service ON public.platform_settings;
CREATE POLICY platform_settings_service ON public.platform_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

REVOKE ALL ON public.platform_settings FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.platform_settings TO service_role;

COMMIT;
