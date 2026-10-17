-- =============================================================================
-- Migration: 20261017020000_individual_staff_admin_workspaces.sql
-- Purpose:
--   1. Individual Staff Admin Workspaces schema, permissions, invitations, and tasks
--   2. Enforce strict isolation: owner sees only self-workspace and assigned tasks
--   3. Super Admin governance: only super_admin manages employees & workspaces
--   4. Immutable workspace audit events
--   5. Full RLS default-deny with explicit owner & super_admin policies
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Helper function: is_staff_workspace_owner
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_staff_workspace_owner(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_workspaces
    WHERE id = ws_id AND owner_user_id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- 2. Staff Employees (Protected personnel profile extension)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  employee_code TEXT UNIQUE,
  email_normalized TEXT NOT NULL UNIQUE,
  phone_e164 TEXT NOT NULL,
  department TEXT NOT NULL,
  job_title TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'full_time' CHECK (
    employment_type IN ('full_time', 'part_time', 'contractor', 'intern')
  ),
  manager_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  employment_status TEXT NOT NULL DEFAULT 'active' CHECK (
    employment_status IN ('active', 'suspended', 'offboarded')
  ),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_employees_auth_user_id ON public.staff_employees(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_employees_email_normalized ON public.staff_employees(email_normalized);
CREATE INDEX IF NOT EXISTS idx_staff_employees_department ON public.staff_employees(department);

-- -----------------------------------------------------------------------------
-- 3. Staff Workspaces (Person-specific private workspace)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_email_verification' CHECK (
    status IN (
      'pending_email_verification',
      'initial_password_change_required',
      'active',
      'suspended',
      'revoked',
      'archived'
    )
  ),
  role_snapshot TEXT NOT NULL CHECK (
    role_snapshot IN ('super_admin', 'admin', 'operations', 'support', 'developer', 'viewer')
  ),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  last_access_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_workspaces_owner_user_id ON public.staff_workspaces(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_workspaces_status ON public.staff_workspaces(status);

-- -----------------------------------------------------------------------------
-- 4. Staff Workspace Permissions (Explicit capability grants)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_workspace_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.staff_workspaces(id) ON DELETE CASCADE,
  capability_id TEXT NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  reason TEXT,
  CONSTRAINT uq_staff_workspace_capability UNIQUE (workspace_id, capability_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_ws_permissions_ws_id ON public.staff_workspace_permissions(workspace_id);

-- -----------------------------------------------------------------------------
-- 5. Staff Workspace Invitations (Delivery and activation tracking)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.staff_workspaces(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (
    status IN ('queued', 'sending', 'provider_accepted', 'delivered', 'bounced', 'failed')
  ),
  idempotency_key TEXT UNIQUE,
  email_outbox_id UUID REFERENCES public.email_outbox(id) ON DELETE SET NULL,
  last_attempt_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_code TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_ws_invitations_ws_id ON public.staff_workspace_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_staff_ws_invitations_recipient ON public.staff_workspace_invitations(recipient_email);

-- -----------------------------------------------------------------------------
-- 6. Staff Workspace Events (Append-only immutable audit)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_workspace_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.staff_workspaces(id) ON DELETE CASCADE,
  actor_auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_key TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_ws_events_ws_id ON public.staff_workspace_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_staff_ws_events_created_at ON public.staff_workspace_events(created_at DESC);

-- Immutable Trigger for staff_workspace_events
CREATE OR REPLACE FUNCTION public.protect_immutable_staff_workspace_events()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'staff_workspace_events is strictly append-only. UPDATE and DELETE are prohibited.';
END;
$$;

DROP TRIGGER IF EXISTS trigger_immutable_staff_workspace_events ON public.staff_workspace_events;
CREATE TRIGGER trigger_immutable_staff_workspace_events
BEFORE UPDATE OR DELETE ON public.staff_workspace_events
FOR EACH ROW EXECUTE FUNCTION public.protect_immutable_staff_workspace_events();

-- -----------------------------------------------------------------------------
-- 7. Staff Tasks (Internal employee tasks scoped to workspace and assignments)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.staff_workspaces(id) ON DELETE CASCADE,
  assignee_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id TEXT,
  engagement_id UUID REFERENCES public.client_engagements(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description_safe TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (
    priority IN ('low', 'medium', 'high', 'urgent')
  ),
  due_at TIMESTAMPTZ,
  state TEXT NOT NULL DEFAULT 'todo' CHECK (
    state IN ('todo', 'in_progress', 'review', 'completed', 'blocked', 'cancelled')
  ),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_tasks_workspace_id ON public.staff_tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assignee ON public.staff_tasks(assignee_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_state ON public.staff_tasks(state);

-- -----------------------------------------------------------------------------
-- 8. Row-Level Security (RLS) Enablement & Strict Policies
-- -----------------------------------------------------------------------------

ALTER TABLE public.staff_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_employees FORCE ROW LEVEL SECURITY;

ALTER TABLE public.staff_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_workspaces FORCE ROW LEVEL SECURITY;

ALTER TABLE public.staff_workspace_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_workspace_permissions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.staff_workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_workspace_invitations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.staff_workspace_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_workspace_events FORCE ROW LEVEL SECURITY;

ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_tasks FORCE ROW LEVEL SECURITY;

-- 8.1 staff_employees policies
DROP POLICY IF EXISTS staff_employees_super_admin_all ON public.staff_employees;
CREATE POLICY staff_employees_super_admin_all ON public.staff_employees
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS staff_employees_owner_select ON public.staff_employees;
CREATE POLICY staff_employees_owner_select ON public.staff_employees
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

-- 8.2 staff_workspaces policies
DROP POLICY IF EXISTS staff_workspaces_super_admin_all ON public.staff_workspaces;
CREATE POLICY staff_workspaces_super_admin_all ON public.staff_workspaces
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS staff_workspaces_owner_select ON public.staff_workspaces;
CREATE POLICY staff_workspaces_owner_select ON public.staff_workspaces
  FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS staff_workspaces_owner_update ON public.staff_workspaces;
CREATE POLICY staff_workspaces_owner_update ON public.staff_workspaces
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- 8.3 staff_workspace_permissions policies
DROP POLICY IF EXISTS staff_ws_perm_super_admin_all ON public.staff_workspace_permissions;
CREATE POLICY staff_ws_perm_super_admin_all ON public.staff_workspace_permissions
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS staff_ws_perm_owner_select ON public.staff_workspace_permissions;
CREATE POLICY staff_ws_perm_owner_select ON public.staff_workspace_permissions
  FOR SELECT TO authenticated
  USING (public.is_staff_workspace_owner(workspace_id));

-- 8.4 staff_workspace_invitations policies
DROP POLICY IF EXISTS staff_ws_inv_super_admin_all ON public.staff_workspace_invitations;
CREATE POLICY staff_ws_inv_super_admin_all ON public.staff_workspace_invitations
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 8.5 staff_workspace_events policies
DROP POLICY IF EXISTS staff_ws_events_super_admin_select ON public.staff_workspace_events;
CREATE POLICY staff_ws_events_super_admin_select ON public.staff_workspace_events
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS staff_ws_events_owner_select ON public.staff_workspace_events;
CREATE POLICY staff_ws_events_owner_select ON public.staff_workspace_events
  FOR SELECT TO authenticated
  USING (public.is_staff_workspace_owner(workspace_id));

DROP POLICY IF EXISTS staff_ws_events_insert ON public.staff_workspace_events;
CREATE POLICY staff_ws_events_insert ON public.staff_workspace_events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin() OR public.is_staff_workspace_owner(workspace_id)
  );

-- 8.6 staff_tasks policies
DROP POLICY IF EXISTS staff_tasks_super_admin_all ON public.staff_tasks;
CREATE POLICY staff_tasks_super_admin_all ON public.staff_tasks
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS staff_tasks_assignee_select ON public.staff_tasks;
CREATE POLICY staff_tasks_assignee_select ON public.staff_tasks
  FOR SELECT TO authenticated
  USING (assignee_user_id = auth.uid());

DROP POLICY IF EXISTS staff_tasks_assignee_update ON public.staff_tasks;
CREATE POLICY staff_tasks_assignee_update ON public.staff_tasks
  FOR UPDATE TO authenticated
  USING (assignee_user_id = auth.uid())
  WITH CHECK (assignee_user_id = auth.uid());

COMMIT;
