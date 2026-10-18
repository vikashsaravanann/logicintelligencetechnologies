-- =============================================================================
-- Migration: 20261017070000_auth_rls_security_hardening.sql
-- Purpose:
--   Milestone 1 / Track 1: Complete Auth & Database Hardening (AUTH01 - AUTH16)
--
-- Preserved Superadmin Accounts:
--   1. 05991d42-44b3-4fbb-baaa-c6db030844c7 (createwithvikash@gmail.com) [Primary Founder]
--   2. 4a2e552d-c53b-4b4d-82a5-754b6ac4476c (vikash@logicintelligencetechnologies.in)
--   3. d1a95302-5101-4a25-bff2-129558039574 (admin@logicintelligencetechnologies.in)
--   4. 69002d0e-e76c-4b8b-b6ec-2b36ad2e6bd0 (hello@logicintelligencetechnologies.in)
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. AUTH01: Remove ongoing email-based superadmin promotion in triggers.
--    Protect guard_profile_role against arbitrary email and role manipulation.
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trigger_assign_super_admin_owner ON public.profiles;
DROP FUNCTION IF EXISTS public.assign_super_admin_for_owner();

CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Restrict operations performed by client or anonymous sessions
  IF coalesce(auth.role(), '') IN ('authenticated', 'anon') THEN
    -- Prevent setting elevated roles on insert
    IF TG_OP = 'INSERT' AND NEW.role IS NOT NULL AND NEW.role NOT IN ('client', 'user') THEN
      RAISE EXCEPTION 'profiles.role can only be assigned by an administrator' USING ERRCODE = '42501';
    END IF;

    -- Prevent modifying role unless caller is an established superadmin
    IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
      IF NOT COALESCE(public.is_super_admin(), false) THEN
        RAISE EXCEPTION 'profiles.role can only be changed by an administrator' USING ERRCODE = '42501';
      END IF;
    END IF;

    -- Prevent tampering with profile email directly to spoof identities.
    -- Profile email must strictly mirror verified auth.users.email
    IF TG_OP = 'UPDATE' AND NEW.email IS DISTINCT FROM OLD.email THEN
      IF NOT COALESCE(public.is_super_admin(), false) THEN
        IF NEW.email IS DISTINCT FROM (SELECT email FROM auth.users WHERE id = NEW.id) THEN
          RAISE EXCEPTION 'profiles.email must match verified authentication email' USING ERRCODE = '42501';
        END IF;
      END IF;
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


-- -----------------------------------------------------------------------------
-- 2. AUTH02: Eliminate user_metadata authorization and rewrite is_staff_or_admin()
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND p.role IN (
          'super_admin', 'admin', 'principal_architect', 'lead_architect',
          'systems_engineer', 'solutions_architect', 'security_officer',
          'support_lead', 'technical_support', 'staff', 'operations'
        )
    ),
    false
  );
$$;

-- Rewrite the 27 user_metadata RLS policies using protected profiles.role / helpers:

-- 1-4. conversation_threads & conversation_messages
DROP POLICY IF EXISTS ct_auth_select ON public.conversation_threads;
CREATE POLICY ct_auth_select ON public.conversation_threads
  FOR SELECT TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS ct_auth_insert ON public.conversation_threads;
CREATE POLICY ct_auth_insert ON public.conversation_threads
  FOR INSERT TO authenticated
  WITH CHECK (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS cm_auth_select ON public.conversation_messages;
CREATE POLICY cm_auth_select ON public.conversation_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_threads t
      WHERE t.thread_id = conversation_messages.thread_id
        AND (
          t.client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
          OR public.is_staff_or_admin()
        )
    )
  );

DROP POLICY IF EXISTS cm_auth_insert ON public.conversation_messages;
CREATE POLICY cm_auth_insert ON public.conversation_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_threads t
      WHERE t.thread_id = conversation_messages.thread_id
        AND (
          t.client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
          OR public.is_staff_or_admin()
        )
    )
  );

-- 5-18. client portal practical features
DROP POLICY IF EXISTS cn_auth_select ON public.client_notifications;
CREATE POLICY cn_auth_select ON public.client_notifications
  FOR SELECT TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS cn_auth_update ON public.client_notifications;
CREATE POLICY cn_auth_update ON public.client_notifications
  FOR UPDATE TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  )
  WITH CHECK (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS ca_auth_select ON public.client_action_items;
CREATE POLICY ca_auth_select ON public.client_action_items
  FOR SELECT TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS ca_auth_update ON public.client_action_items;
CREATE POLICY ca_auth_update ON public.client_action_items
  FOR UPDATE TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS rfc_auth_select ON public.client_change_requests;
CREATE POLICY rfc_auth_select ON public.client_change_requests
  FOR SELECT TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS rfc_auth_insert ON public.client_change_requests;
CREATE POLICY rfc_auth_insert ON public.client_change_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS rfc_auth_update ON public.client_change_requests;
CREATE POLICY rfc_auth_update ON public.client_change_requests
  FOR UPDATE TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS csd_auth_select ON public.client_shared_decisions;
CREATE POLICY csd_auth_select ON public.client_shared_decisions
  FOR SELECT TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS csd_auth_update ON public.client_shared_decisions;
CREATE POLICY csd_auth_update ON public.client_shared_decisions
  FOR UPDATE TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS cpb_auth_select ON public.client_project_blockers;
CREATE POLICY cpb_auth_select ON public.client_project_blockers
  FOR SELECT TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS cqa_auth_select ON public.client_qa_criteria;
CREATE POLICY cqa_auth_select ON public.client_qa_criteria
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.client_engagements ce
      JOIN public.clients c ON c.id = ce.client_id
      WHERE ce.engagement_ref = client_qa_criteria.engagement_ref
        AND c.user_id = (SELECT auth.uid())
    )
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS cnp_auth_select ON public.client_notification_preferences;
CREATE POLICY cnp_auth_select ON public.client_notification_preferences
  FOR SELECT TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS cnp_auth_insert ON public.client_notification_preferences;
CREATE POLICY cnp_auth_insert ON public.client_notification_preferences
  FOR INSERT TO authenticated
  WITH CHECK (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS cnp_auth_update ON public.client_notification_preferences;
CREATE POLICY cnp_auth_update ON public.client_notification_preferences
  FOR UPDATE TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    OR public.is_staff_or_admin()
  );

-- 19-27. quotation tables
DROP POLICY IF EXISTS qsc_auth_all ON public.quotation_services_catalog;
CREATE POLICY qsc_auth_all ON public.quotation_services_catalog
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS q_auth_all ON public.quotations;
CREATE POLICY q_auth_all ON public.quotations
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS qv_auth_all ON public.quotation_versions;
CREATE POLICY qv_auth_all ON public.quotation_versions
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS qli_auth_all ON public.quotation_line_items;
CREATE POLICY qli_auth_all ON public.quotation_line_items
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS qc_auth_all ON public.quotation_coupons;
CREATE POLICY qc_auth_all ON public.quotation_coupons
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS qcr_auth_all ON public.quotation_coupon_redemptions;
CREATE POLICY qcr_auth_all ON public.quotation_coupon_redemptions
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS qa_auth_all ON public.quotation_acceptances;
CREATE POLICY qa_auth_all ON public.quotation_acceptances
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS qrr_auth_all ON public.quotation_revision_requests;
CREATE POLICY qrr_auth_all ON public.quotation_revision_requests
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS qal_auth_all ON public.quotation_audit_logs;
CREATE POLICY qal_auth_all ON public.quotation_audit_logs
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_super_admin());


-- -----------------------------------------------------------------------------
-- 3. AUTH03: Bind reconcile_and_approve_payment to auth.uid() = p_admin_user_id
--    and remove broad OR clauses cross-advancing unrelated projects.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.reconcile_and_approve_payment(
  p_payment_request_id     uuid,
  p_payment_attempt_id     uuid,
  p_admin_user_id          uuid,
  p_bank_credit_reference  text,
  p_bank_credit_amount_paise bigint,
  p_receiving_bank         text DEFAULT 'YES BANK / PTYES',
  p_reconciliation_notes   text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_admin_role text;
  v_req public.engagement_payment_requests%ROWTYPE;
  v_attempt public.payment_attempts%ROWTYPE;
  v_reconciliation_id uuid;
BEGIN
  -- 1. Authorization: Verify caller is super_admin and acting as themselves (or service_role)
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    IF auth.uid() IS NULL OR auth.uid() <> p_admin_user_id THEN
      RAISE EXCEPTION 'Unauthorized: Calling user does not match p_admin_user_id' USING ERRCODE = '42501';
    END IF;
  END IF;

  SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_user_id;
  IF v_admin_role IS NULL OR v_admin_role <> 'super_admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only super_admin may reconcile and approve payments' USING ERRCODE = '42501';
  END IF;

  -- 2. Input validation
  IF p_bank_credit_reference IS NULL OR trim(p_bank_credit_reference) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bank credit reference is required');
  END IF;

  IF p_bank_credit_amount_paise IS NULL OR p_bank_credit_amount_paise <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bank credit amount must be greater than zero');
  END IF;

  -- 3. Lock & validate payment request
  SELECT * INTO v_req
  FROM public.engagement_payment_requests
  WHERE id = p_payment_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment request not found');
  END IF;

  IF v_req.status = 'approved' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment request is already approved',
      'payment_request_id', p_payment_request_id
    );
  END IF;

  -- 4. Lock & validate payment attempt
  SELECT * INTO v_attempt
  FROM public.payment_attempts
  WHERE id = p_payment_attempt_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment attempt not found');
  END IF;

  IF v_attempt.payment_request_id <> p_payment_request_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment attempt does not belong to this payment request');
  END IF;

  -- 5. Insert reconciliation record
  INSERT INTO public.payment_reconciliations (
    payment_request_id,
    payment_attempt_id,
    verified_by,
    bank_credit_reference,
    bank_credit_amount_paise,
    credited_at,
    receiving_bank_account,
    reconciliation_notes
  ) VALUES (
    p_payment_request_id,
    p_payment_attempt_id,
    p_admin_user_id,
    trim(p_bank_credit_reference),
    p_bank_credit_amount_paise,
    now(),
    COALESCE(NULLIF(trim(p_receiving_bank), ''), 'YES BANK / PTYES'),
    p_reconciliation_notes
  ) RETURNING id INTO v_reconciliation_id;

  -- 6. Update payment attempt status to verified
  UPDATE public.payment_attempts
  SET status = 'verified'
  WHERE id = p_payment_attempt_id;

  -- 7. Update payment request status to approved
  UPDATE public.engagement_payment_requests
  SET status = 'approved',
      updated_at = now()
  WHERE id = p_payment_request_id;

  -- 8. Lifecycle / project unlock
  -- Stage 6 (Initial Payment) unlocks Stage 7 (Onboarding)
  IF v_req.stage_number = 6 OR v_req.milestone_index = 6 THEN
    -- Update linked project in projects table if exists (exact contract_id or proposal_id, NOT broad client_id)
    IF v_req.contract_id IS NOT NULL THEN
      UPDATE public.projects
      SET lifecycle_status = 'stage_6_verified',
          updated_at = now()
      WHERE contract_id = v_req.contract_id;
    ELSIF v_req.proposal_id IS NOT NULL THEN
      UPDATE public.projects
      SET lifecycle_status = 'stage_6_verified',
          updated_at = now()
      WHERE proposal_id = v_req.proposal_id;
    END IF;

    -- Update linked engagement stages strictly for the targeted engagement
    IF to_regclass('public.engagement_stages') IS NOT NULL THEN
      EXECUTE '
        UPDATE public.engagement_stages
        SET status = ''completed'', completed_at = now()
        WHERE stage_key = ''initial-invoice''
          AND (engagement_id IN (
            SELECT id FROM public.client_engagements
            WHERE (proposal_id = $1 AND $1 IS NOT NULL)
          ))
      ' USING v_req.proposal_id;

      EXECUTE '
        UPDATE public.engagement_stages
        SET status = ''unlocked'', unlocked_at = now()
        WHERE stage_key = ''onboarding''
          AND (engagement_id IN (
            SELECT id FROM public.client_engagements
            WHERE (proposal_id = $1 AND $1 IS NOT NULL)
          ))
      ' USING v_req.proposal_id;
    END IF;
  END IF;

  -- Stage 11 (Final Payment) unlocks Stage 12 (Handover)
  IF v_req.stage_number = 11 OR v_req.milestone_index = 11 THEN
    IF v_req.contract_id IS NOT NULL THEN
      UPDATE public.projects
      SET lifecycle_status = 'stage_11_settled',
          updated_at = now()
      WHERE contract_id = v_req.contract_id;
    ELSIF v_req.proposal_id IS NOT NULL THEN
      UPDATE public.projects
      SET lifecycle_status = 'stage_11_settled',
          updated_at = now()
      WHERE proposal_id = v_req.proposal_id;
    END IF;

    IF to_regclass('public.engagement_stages') IS NOT NULL THEN
      EXECUTE '
        UPDATE public.engagement_stages
        SET status = ''completed'', completed_at = now()
        WHERE stage_key = ''final-payment''
          AND (engagement_id IN (
            SELECT id FROM public.client_engagements
            WHERE (proposal_id = $1 AND $1 IS NOT NULL)
          ))
      ' USING v_req.proposal_id;

      EXECUTE '
        UPDATE public.engagement_stages
        SET status = ''unlocked'', unlocked_at = now()
        WHERE stage_key = ''handover''
          AND (engagement_id IN (
            SELECT id FROM public.client_engagements
            WHERE (proposal_id = $1 AND $1 IS NOT NULL)
          ))
      ' USING v_req.proposal_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reconciliation_id', v_reconciliation_id,
    'payment_request_id', p_payment_request_id,
    'status', 'approved'
  );
END;
$$;


-- -----------------------------------------------------------------------------
-- 4. AUTH04: Drop legacy broad staff policies that defeat tenant isolation
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS ce_auth_staff_all ON public.client_engagements;
DROP POLICY IF EXISTS es_auth_staff_all ON public.engagement_stages;
DROP POLICY IF EXISTS ese_auth_staff_all ON public.engagement_stage_events;
DROP POLICY IF EXISTS edl_auth_staff_all ON public.engagement_document_links;
DROP POLICY IF EXISTS cicr_auth_staff_all ON public.client_identity_change_requests;
DROP POLICY IF EXISTS ei_auth_staff_all ON public.engagement_invites;

-- Recreate scoped staff policies adhering strictly to staff_client_assignments & super_admin
CREATE POLICY ce_auth_staff_scoped ON public.client_engagements
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.staff_client_assignments sca
      WHERE sca.staff_user_id = (SELECT auth.uid())
        AND sca.engagement_id = public.client_engagements.id
        AND sca.status = 'active'
        AND (sca.expires_at IS NULL OR sca.expires_at > now())
    )
  );

CREATE POLICY es_auth_staff_scoped ON public.engagement_stages
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.staff_client_assignments sca
      WHERE sca.staff_user_id = (SELECT auth.uid())
        AND sca.engagement_id = public.engagement_stages.engagement_id
        AND sca.status = 'active'
        AND sca.can_view_technical_stages = true
        AND (sca.expires_at IS NULL OR sca.expires_at > now())
    )
  );

CREATE POLICY ese_auth_staff_scoped ON public.engagement_stage_events
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.staff_client_assignments sca
      WHERE sca.staff_user_id = (SELECT auth.uid())
        AND sca.engagement_id = public.engagement_stage_events.engagement_id
        AND sca.status = 'active'
        AND (sca.expires_at IS NULL OR sca.expires_at > now())
    )
  );

CREATE POLICY edl_auth_staff_scoped ON public.engagement_document_links
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.staff_client_assignments sca
      WHERE sca.staff_user_id = (SELECT auth.uid())
        AND sca.engagement_id = public.engagement_document_links.engagement_id
        AND sca.status = 'active'
        AND (sca.expires_at IS NULL OR sca.expires_at > now())
    )
  );

CREATE POLICY cicr_auth_staff_scoped ON public.client_identity_change_requests
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.staff_client_assignments sca
      WHERE sca.staff_user_id = (SELECT auth.uid())
        AND sca.engagement_id = public.client_identity_change_requests.engagement_id
        AND sca.status = 'active'
        AND (sca.expires_at IS NULL OR sca.expires_at > now())
    )
  );

CREATE POLICY ei_auth_staff_scoped ON public.engagement_invites
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());


-- -----------------------------------------------------------------------------
-- 5. AUTH09 & AUTH10: Restrict maintenance orders RLS & split subscription DELETE
-- -----------------------------------------------------------------------------

-- AUTH10: Split maintenance_subscriptions SELECT from mutations (prevent assigned staff DELETE)
DROP POLICY IF EXISTS "staff_super_admin_manage_subscriptions" ON public.maintenance_subscriptions;

CREATE POLICY "staff_select_assigned_subscriptions"
  ON public.maintenance_subscriptions FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.staff_client_assignments sca
      WHERE sca.staff_user_id = (SELECT auth.uid())
        AND sca.engagement_id = public.maintenance_subscriptions.engagement_id
        AND sca.status = 'active'
        AND (sca.expires_at IS NULL OR sca.expires_at > now())
    )
  );

CREATE POLICY "super_admin_mutate_subscriptions"
  ON public.maintenance_subscriptions FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "super_admin_update_subscriptions"
  ON public.maintenance_subscriptions FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "super_admin_delete_subscriptions"
  ON public.maintenance_subscriptions FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- AUTH09: Protect maintenance_orders from price and status tampering
DROP POLICY IF EXISTS "clients_insert_own_maintenance_orders" ON public.maintenance_orders;
DROP POLICY IF EXISTS "clients_submit_utr_maintenance_orders" ON public.maintenance_orders;

CREATE OR REPLACE FUNCTION public.guard_maintenance_order_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF coalesce(auth.role(), '') = 'authenticated' AND NOT COALESCE(public.is_super_admin(), false) THEN
    IF TG_OP = 'INSERT' THEN
      -- Clients may only create orders in pending_payment status
      IF NEW.status IS DISTINCT FROM 'pending_payment' THEN
        RAISE EXCEPTION 'New maintenance orders must have pending_payment status' USING ERRCODE = '42501';
      END IF;
      -- Clients cannot set verified fields
      IF NEW.verified_by IS NOT NULL OR NEW.verified_at IS NOT NULL THEN
        RAISE EXCEPTION 'Verification fields can only be set by Super Admin' USING ERRCODE = '42501';
      END IF;
    END IF;

    IF TG_OP = 'UPDATE' THEN
      -- Clients cannot change pricing, plan, or client/engagement ownership
      IF NEW.total_payable_paise IS DISTINCT FROM OLD.total_payable_paise
         OR NEW.subtotal_paise IS DISTINCT FROM OLD.subtotal_paise
         OR NEW.gst_paise IS DISTINCT FROM OLD.gst_paise
         OR NEW.plan_id IS DISTINCT FROM OLD.plan_id
         OR NEW.client_id IS DISTINCT FROM OLD.client_id
         OR NEW.engagement_id IS DISTINCT FROM OLD.engagement_id
         OR NEW.order_ref IS DISTINCT FROM OLD.order_ref THEN
        RAISE EXCEPTION 'Pricing, plan, and ownership fields are immutable for clients' USING ERRCODE = '42501';
      END IF;

      -- Clients cannot verify their own orders
      IF NEW.status = 'verified' AND OLD.status <> 'verified' THEN
        RAISE EXCEPTION 'Only Super Admin can mark maintenance orders as verified' USING ERRCODE = '42501';
      END IF;

      IF NEW.verified_by IS DISTINCT FROM OLD.verified_by OR NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
        RAISE EXCEPTION 'Verification metadata can only be updated by Super Admin' USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_maintenance_order_mutation ON public.maintenance_orders;
CREATE TRIGGER trg_guard_maintenance_order_mutation
  BEFORE INSERT OR UPDATE ON public.maintenance_orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_maintenance_order_mutation();


-- -----------------------------------------------------------------------------
-- 6. AUTH12: Canonical Client Identity mapping in database RLS policies
--    Resolve clients.user_id = auth.uid() instead of comparing client_id = auth.uid()
-- -----------------------------------------------------------------------------

-- Fix maintenance_subscriptions client select
DROP POLICY IF EXISTS "clients_read_own_subscriptions" ON public.maintenance_subscriptions;
CREATE POLICY "clients_read_own_subscriptions"
  ON public.maintenance_subscriptions FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT c.id FROM public.clients c WHERE c.user_id = (SELECT auth.uid()))
    OR client_id = (SELECT auth.uid())
  );

-- Fix maintenance_orders client select
DROP POLICY IF EXISTS "clients_read_own_maintenance_orders" ON public.maintenance_orders;
CREATE POLICY "clients_read_own_maintenance_orders"
  ON public.maintenance_orders FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT c.id FROM public.clients c WHERE c.user_id = (SELECT auth.uid()))
    OR client_id = (SELECT auth.uid())
  );

-- Fix engagement_payment_requests staff/client select
DROP POLICY IF EXISTS payment_requests_staff_select ON public.engagement_payment_requests;
CREATE POLICY payment_requests_staff_select ON public.engagement_payment_requests
  FOR SELECT TO authenticated
  USING (
    public.is_staff_or_admin()
    OR client_id IN (SELECT c.id FROM public.clients c WHERE c.user_id = (SELECT auth.uid()))
    OR client_id = (SELECT auth.uid())
  );

-- Fix payment_billing_submissions staff/client select
DROP POLICY IF EXISTS billing_submissions_staff_select ON public.payment_billing_submissions;
CREATE POLICY billing_submissions_staff_select ON public.payment_billing_submissions
  FOR SELECT TO authenticated
  USING (
    public.is_staff_or_admin()
    OR EXISTS (
      SELECT 1 FROM public.engagement_payment_requests req
      WHERE req.id = payment_billing_submissions.payment_request_id
        AND (
          req.client_id IN (SELECT c.id FROM public.clients c WHERE c.user_id = (SELECT auth.uid()))
          OR req.client_id = (SELECT auth.uid())
        )
    )
  );

-- Fix client_correction_requests client select & insert
DROP POLICY IF EXISTS "clients_manage_own_corrections" ON public.client_correction_requests;
CREATE POLICY "clients_manage_own_corrections"
  ON public.client_correction_requests FOR ALL TO authenticated
  USING (
    public.is_super_admin()
    OR client_id IN (SELECT c.id FROM public.clients c WHERE c.user_id = (SELECT auth.uid()))
    OR client_id = (SELECT auth.uid())
  )
  WITH CHECK (
    public.is_super_admin()
    OR client_id IN (SELECT c.id FROM public.clients c WHERE c.user_id = (SELECT auth.uid()))
    OR client_id = (SELECT auth.uid())
  );


-- -----------------------------------------------------------------------------
-- 7. AUTH15: Cleanup literal webhook credential trigger & function
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_send_welcome_email_on_profiles_insert ON public.profiles;
DROP FUNCTION IF EXISTS public.send_welcome_email_on_profiles_insert();
DROP FUNCTION IF EXISTS public.trg_send_welcome_email_on_profiles_insert();

COMMIT;
