-- Secure staff profile RLS + expandable professional profile storage

-- 1) Tighten SELECT: owner or super_admin only (no broad staff role access)
DROP POLICY IF EXISTS spd_auth_select ON public.staff_profile_details;
CREATE POLICY spd_auth_select ON public.staff_profile_details
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- 2) Expand profile detail columns (employee-editable, non-company-controlled)
ALTER TABLE public.staff_profile_details
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS personal_email text,
  ADD COLUMN IF NOT EXISTS mobile_e164 text,
  ADD COLUMN IF NOT EXISTS professional_headline text,
  ADD COLUMN IF NOT EXISTS professional_summary text,
  ADD COLUMN IF NOT EXISTS career_objective text,
  ADD COLUMN IF NOT EXISTS professional_interests text,
  ADD COLUMN IF NOT EXISTS work_arrangement text,
  ADD COLUMN IF NOT EXISTS resume_section_prefs jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;

-- 3) Normalized profile entries (skills, education, experience, etc.)
CREATE TABLE IF NOT EXISTS public.staff_profile_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type text NOT NULL CHECK (entry_type IN (
    'skill','education','experience','certification','project','achievement','link','language'
  )),
  title text,
  organization text,
  category text,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  start_date date,
  end_date date,
  is_current boolean NOT NULL DEFAULT false,
  include_in_resume boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_profile_entries_user_type
  ON public.staff_profile_entries (user_id, entry_type, sort_order);

ALTER TABLE public.staff_profile_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS spe_select_own ON public.staff_profile_entries;
CREATE POLICY spe_select_own ON public.staff_profile_entries
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

DROP POLICY IF EXISTS spe_write_own ON public.staff_profile_entries;
CREATE POLICY spe_write_own ON public.staff_profile_entries
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_profile_entries TO authenticated;
GRANT ALL ON public.staff_profile_entries TO service_role;

-- 4) Employee code uniqueness when set
CREATE UNIQUE INDEX IF NOT EXISTS uq_staff_employees_employee_code
  ON public.staff_employees (employee_code)
  WHERE employee_code IS NOT NULL AND length(trim(employee_code)) > 0;

-- 5) Profile change audit (restricted)
CREATE TABLE IF NOT EXISTS public.staff_profile_change_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  actor_user_id uuid,
  field_key text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_profile_change_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS spce_select_own ON public.staff_profile_change_events;
CREATE POLICY spce_select_own ON public.staff_profile_change_events
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );
GRANT SELECT ON public.staff_profile_change_events TO authenticated;
GRANT ALL ON public.staff_profile_change_events TO service_role;
