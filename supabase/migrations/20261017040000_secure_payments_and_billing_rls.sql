-- =============================================================================
-- Migration: 20261017040000_secure_payments_and_billing_rls.sql
-- Purpose:
--   1. Revoke public/anonymous access to payment requests, billing submissions,
--      and financial documents (S02, S03, S04).
--   2. Enforce strict super_admin/admin access for sensitive financial records.
--   3. Restrict staff workspace self-modification; prevent owner self-reactivation
--      or role escalation (S09).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Secure engagement_payment_requests (S02)
-- -----------------------------------------------------------------------------
-- Revoke anonymous table grants
REVOKE ALL ON public.engagement_payment_requests FROM anon;
REVOKE SELECT ON public.engagement_payment_requests FROM anon;

-- Drop insecure anon SELECT policy
DROP POLICY IF EXISTS payment_requests_anon_select ON public.engagement_payment_requests;

-- Ensure authenticated users can only view their own payment requests or if admin
DROP POLICY IF EXISTS payment_requests_staff_select ON public.engagement_payment_requests;
CREATE POLICY payment_requests_staff_select ON public.engagement_payment_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'admin')
    )
    OR client_id = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- 2. Secure payment_billing_submissions (S03, S04)
-- -----------------------------------------------------------------------------
-- Revoke anonymous table grants
REVOKE ALL ON public.payment_billing_submissions FROM anon;
REVOKE SELECT, INSERT ON public.payment_billing_submissions FROM anon;

-- Drop insecure anon policies
DROP POLICY IF EXISTS billing_submissions_anon_select ON public.payment_billing_submissions;
DROP POLICY IF EXISTS billing_submissions_anon_insert ON public.payment_billing_submissions;

-- Restrict staff SELECT on billing submissions strictly to super_admin and admin
DROP POLICY IF EXISTS billing_submissions_staff_select ON public.payment_billing_submissions;
CREATE POLICY billing_submissions_staff_select ON public.payment_billing_submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM public.engagement_payment_requests req
      WHERE req.id = payment_billing_submissions.payment_request_id
        AND req.client_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 3. Secure financial_documents (S04, S05)
-- -----------------------------------------------------------------------------
-- Revoke anonymous table grants
REVOKE ALL ON public.financial_documents FROM anon;
REVOKE SELECT ON public.financial_documents FROM anon;

-- Drop insecure anon SELECT policy
DROP POLICY IF EXISTS financial_docs_anon_select ON public.financial_documents;

-- Restrict staff SELECT on financial documents strictly to super_admin and admin
DROP POLICY IF EXISTS financial_docs_staff_select ON public.financial_documents;
CREATE POLICY financial_docs_staff_select ON public.financial_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'admin')
    )
    OR client_id = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- 4. Secure staff_workspaces against Owner Self-Reactivation (S09)
-- -----------------------------------------------------------------------------
-- Function to block owner modification of governance fields (status, role, owner)
CREATE OR REPLACE FUNCTION public.check_staff_workspace_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Forbidden: Only super administrators can change staff workspace status';
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
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_staff_workspace_immutable_governance ON public.staff_workspaces;
CREATE TRIGGER trg_staff_workspace_immutable_governance
  BEFORE UPDATE ON public.staff_workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.check_staff_workspace_immutability();

-- Update staff_workspaces owner update policy to enforce status consistency
DROP POLICY IF EXISTS staff_workspaces_owner_update ON public.staff_workspaces;
CREATE POLICY staff_workspaces_owner_update ON public.staff_workspaces
  FOR UPDATE TO authenticated
  USING (
    owner_user_id = auth.uid()
    AND status = 'active'
  )
  WITH CHECK (
    owner_user_id = auth.uid()
    AND status = 'active'
  );

COMMIT;
