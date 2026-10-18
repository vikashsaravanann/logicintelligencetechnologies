-- Allow service_role and owner onboarding transitions for staff_workspaces.status
-- without weakening Super Admin governance controls.

CREATE OR REPLACE FUNCTION public.check_staff_workspace_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text;
BEGIN
  -- Service role (admin API / server jobs) may update governance fields.
  BEGIN
    jwt_role := coalesce(auth.jwt() ->> 'role', '');
  EXCEPTION WHEN OTHERS THEN
    jwt_role := '';
  END;

  IF jwt_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF public.is_super_admin() THEN
    RETURN NEW;
  END IF;

  -- Owner-driven onboarding transitions only
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF auth.uid() IS NOT NULL
       AND auth.uid() = OLD.owner_user_id
       AND (
         (OLD.status = 'pending_email_verification' AND NEW.status = 'initial_password_change_required')
         OR (OLD.status IN ('pending_email_verification', 'initial_password_change_required') AND NEW.status = 'active')
       )
    THEN
      NULL; -- allowed onboarding transition
    ELSE
      RAISE EXCEPTION 'Forbidden: Only super administrators can change staff workspace status';
    END IF;
  END IF;

  IF NEW.role_snapshot IS DISTINCT FROM OLD.role_snapshot THEN
    RAISE EXCEPTION 'Forbidden: Only super administrators can change staff workspace role';
  END IF;
  IF NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id THEN
    RAISE EXCEPTION 'Forbidden: Workspace owner cannot be altered';
  END IF;
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'Forbidden: Workspace provenance cannot be altered';
  END IF;

  RETURN NEW;
END;
$$;

-- Owner may update their own workspace during onboarding (status transitions above)
DROP POLICY IF EXISTS staff_workspaces_owner_update ON public.staff_workspaces;
CREATE POLICY staff_workspaces_owner_update ON public.staff_workspaces
  FOR UPDATE TO authenticated
  USING (
    owner_user_id = auth.uid()
    AND status IN ('active', 'pending_email_verification', 'initial_password_change_required')
  )
  WITH CHECK (
    owner_user_id = auth.uid()
    AND status IN ('active', 'pending_email_verification', 'initial_password_change_required')
  );
