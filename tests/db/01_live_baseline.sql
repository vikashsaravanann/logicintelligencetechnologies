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

-- Existing production helper: stamps updated_at = now() on UPDATE when the row
-- has that column. Created by migration 20260908010000 in prod; reconstructed
-- here because the local harness applies only the Batch 1+ migrations.
CREATE OR REPLACE FUNCTION public.update_modified_column() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF to_jsonb(NEW) ? 'updated_at' THEN
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END $$;

-- Pre-existing tables that Batch 2 ALTERs. Columns match the live schema
-- recorded in docs/command-center/prechecks.md (not the full production shape).
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_code text NOT NULL UNIQUE,
  project_id uuid,
  client_name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0.00,
  status text NOT NULL DEFAULT 'Pending',
  due_date date,
  created_at timestamptz DEFAULT now(),
  user_id uuid
);

CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secure_token text NOT NULL UNIQUE,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_company text,
  title text NOT NULL,
  scope text[] NOT NULL,
  deliverables text[] NOT NULL,
  milestones jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline text NOT NULL,
  pricing numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'Draft',
  terms text,
  expires_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
