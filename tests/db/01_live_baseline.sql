-- Reconstructed from live schema (docs/command-center/prechecks.md): the minimal
-- objects new migrations depend on. Not the full production schema.
\set ON_ERROR_STOP on

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Existing production trigger: a user cannot change their own role via the anon
-- key (only service_role / postgres may). Reconstructed for faithful tests.
CREATE OR REPLACE FUNCTION public.guard_profile_role() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF coalesce(auth.role(), '') IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' AND NEW.role IS NOT NULL AND NEW.role NOT IN ('client','user') THEN
      RAISE EXCEPTION 'profiles.role can only be assigned by an administrator' USING ERRCODE = '42501';
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'profiles.role can only be changed by an administrator' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_profile_role ON public.profiles;
CREATE TRIGGER guard_profile_role BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_service ON public.profiles;
CREATE POLICY profiles_service ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS profiles_self_read ON public.profiles;
CREATE POLICY profiles_self_read ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
