-- Harden Row Level Security (security audit, 2026-10-05).
--
-- Policies created without a TO clause apply to every role, including anon.
-- "Service role full access" policies written that way were therefore open to
-- the public anon key. Each fix below either scopes such a policy to
-- service_role or removes a policy whose USING (true) exposed every row.
-- Application code that needs these tables already uses the service-role key
-- on the server, so no legitimate path loses access.
--
-- Idempotent: every DROP is IF EXISTS and each block skips missing tables.

-- 1. support_tickets: "FOR ALL USING (true)" with no role gave anon full access.
DO $$ BEGIN
  IF to_regclass('public.support_tickets') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Allow service role full access on support_tickets" ON public.support_tickets;
    DROP POLICY IF EXISTS "Service role tickets" ON public.support_tickets;
    CREATE POLICY "Service role tickets" ON public.support_tickets
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 2. VoiceShield core tables: same unscoped full-access pattern.
DO $$
DECLARE
  t text;
  p text;
BEGIN
  FOR t, p IN SELECT * FROM (VALUES
    ('voice_sessions', 'Service Role Full Access Sessions'),
    ('voice_detection_events', 'Service Role Full Access Events'),
    ('voice_threat_alerts', 'Service Role Full Access Alerts'),
    ('voice_forensic_jobs', 'Service Role Full Access Jobs'),
    ('voice_forensic_results', 'Service Role Full Access Results')
  ) AS v(t, p)
  LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p, t);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', p, t);
    END IF;
  END LOOP;
END $$;

-- 3. proposals: anon could read and update every proposal (secure tokens,
--    client emails, prices) and any signed-in user had full access. All
--    proposal reads and writes go through server routes using service_role,
--    including the token-based public proposal page and approval.
DO $$ BEGIN
  IF to_regclass('public.proposals') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Allow public read of proposals by token" ON public.proposals;
    DROP POLICY IF EXISTS "Allow client update to approve proposals" ON public.proposals;
    DROP POLICY IF EXISTS "Admins can manage all proposals" ON public.proposals;
    DROP POLICY IF EXISTS "Service role proposals" ON public.proposals;
    CREATE POLICY "Service role proposals" ON public.proposals
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 4. projects / invoices: clients may read only their own rows.
--    "Clients can view own projects" also matched user_id IS NULL, exposing
--    every unassigned project to any signed-in user; clients could also
--    update or delete their own projects (value, progress, status).
DO $$ BEGIN
  IF to_regclass('public.projects') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Clients can view own projects" ON public.projects;
    DROP POLICY IF EXISTS "Users own projects" ON public.projects;
    CREATE POLICY "Users own projects" ON public.projects
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. profiles.role: owners could update their own row without column limits,
--    so any user could set role = 'admin' and satisfy every policy that
--    checks profiles.role = 'admin'. Requests made with a user or anon token
--    may no longer set or change role; service_role and direct database
--    sessions (no JWT) are unaffected.
CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.role(), '') IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' AND NEW.role IS NOT NULL AND NEW.role NOT IN ('client', 'user') THEN
      RAISE EXCEPTION 'profiles.role can only be assigned by an administrator' USING ERRCODE = '42501';
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'profiles.role can only be changed by an administrator' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    DROP TRIGGER IF EXISTS guard_profile_role ON public.profiles;
    CREATE TRIGGER guard_profile_role
      BEFORE INSERT OR UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();
  END IF;
END $$;
