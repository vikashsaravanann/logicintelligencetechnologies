-- Close residual advisor findings and enforce assignment-scoped staff access.
-- This migration intentionally preserves all auth users, profiles, roles, and audit data.

BEGIN;

CREATE OR REPLACE FUNCTION public.can_access_engagement_ref(target_engagement_ref text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.client_engagements ce
      JOIN public.staff_client_assignments a ON a.engagement_id = ce.id
      JOIN public.staff_employees e ON e.auth_user_id = a.staff_user_id
      JOIN public.staff_workspaces w ON w.owner_user_id = a.staff_user_id
      WHERE ce.engagement_ref = target_engagement_ref
        AND a.staff_user_id = (SELECT auth.uid())
        AND a.status = 'active'
        AND a.revoked_at IS NULL
        AND a.starts_at <= now()
        AND (a.expires_at IS NULL OR a.expires_at > now())
        AND e.employment_status = 'active'
        AND w.status = 'active'
    ), false
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_quotation(target_quotation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    public.is_super_admin()
    OR EXISTS (
      SELECT 1
      FROM public.quotations q
      WHERE q.id = target_quotation_id
        AND (
          (q.engagement_id IS NOT NULL AND public.is_assigned_staff_for_engagement(q.engagement_id))
          OR (q.client_id IS NOT NULL AND public.is_assigned_staff_for_client(q.client_id))
        )
    ), false
  );
$$;

REVOKE ALL ON FUNCTION public.can_access_engagement_ref(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_access_quotation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_engagement_ref(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_access_quotation(uuid) TO authenticated, service_role;

-- Client project records: clients see their own records; staff see assigned projects only.
DROP POLICY IF EXISTS ct_auth_select ON public.conversation_threads;
CREATE POLICY ct_auth_select ON public.conversation_threads FOR SELECT TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
       OR public.can_access_engagement_ref(engagement_ref));

DROP POLICY IF EXISTS ct_auth_insert ON public.conversation_threads;
CREATE POLICY ct_auth_insert ON public.conversation_threads FOR INSERT TO authenticated
WITH CHECK (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
            OR public.can_access_engagement_ref(engagement_ref));

DROP POLICY IF EXISTS ct_staff_assigned ON public.conversation_threads;
DROP POLICY IF EXISTS cm_staff_assigned ON public.conversation_messages;

DROP POLICY IF EXISTS cm_auth_select ON public.conversation_messages;
CREATE POLICY cm_auth_select ON public.conversation_messages FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.conversation_threads t
  WHERE t.thread_id = conversation_messages.thread_id
    AND (t.client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
         OR public.can_access_engagement_ref(t.engagement_ref))
));

DROP POLICY IF EXISTS cm_auth_insert ON public.conversation_messages;
CREATE POLICY cm_auth_insert ON public.conversation_messages FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversation_threads t
  WHERE t.thread_id = conversation_messages.thread_id
    AND (t.client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
         OR public.can_access_engagement_ref(t.engagement_ref))
));

DROP POLICY IF EXISTS cn_auth_select ON public.client_notifications;
CREATE POLICY cn_auth_select ON public.client_notifications FOR SELECT TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
       OR public.can_access_engagement_ref(engagement_ref));
DROP POLICY IF EXISTS cn_auth_update ON public.client_notifications;
CREATE POLICY cn_auth_update ON public.client_notifications FOR UPDATE TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
       OR public.can_access_engagement_ref(engagement_ref))
WITH CHECK (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
            OR public.can_access_engagement_ref(engagement_ref));

DROP POLICY IF EXISTS ca_auth_select ON public.client_action_items;
CREATE POLICY ca_auth_select ON public.client_action_items FOR SELECT TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
       OR public.can_access_engagement_ref(engagement_ref));
DROP POLICY IF EXISTS ca_auth_update ON public.client_action_items;
CREATE POLICY ca_auth_update ON public.client_action_items FOR UPDATE TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
       OR public.can_access_engagement_ref(engagement_ref))
WITH CHECK (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
            OR public.can_access_engagement_ref(engagement_ref));

DROP POLICY IF EXISTS rfc_auth_select ON public.client_change_requests;
CREATE POLICY rfc_auth_select ON public.client_change_requests FOR SELECT TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
       OR public.can_access_engagement_ref(engagement_ref));
DROP POLICY IF EXISTS rfc_auth_insert ON public.client_change_requests;
CREATE POLICY rfc_auth_insert ON public.client_change_requests FOR INSERT TO authenticated
WITH CHECK (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
            OR public.can_access_engagement_ref(engagement_ref));
DROP POLICY IF EXISTS rfc_auth_update ON public.client_change_requests;
CREATE POLICY rfc_auth_update ON public.client_change_requests FOR UPDATE TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
       OR public.can_access_engagement_ref(engagement_ref))
WITH CHECK (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
            OR public.can_access_engagement_ref(engagement_ref));

DROP POLICY IF EXISTS csd_auth_select ON public.client_shared_decisions;
CREATE POLICY csd_auth_select ON public.client_shared_decisions FOR SELECT TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
       OR public.can_access_engagement_ref(engagement_ref));
DROP POLICY IF EXISTS csd_auth_update ON public.client_shared_decisions;
CREATE POLICY csd_auth_update ON public.client_shared_decisions FOR UPDATE TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
       OR public.can_access_engagement_ref(engagement_ref))
WITH CHECK (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
            OR public.can_access_engagement_ref(engagement_ref));

DROP POLICY IF EXISTS cpb_auth_select ON public.client_project_blockers;
CREATE POLICY cpb_auth_select ON public.client_project_blockers FOR SELECT TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
       OR public.can_access_engagement_ref(engagement_ref));

DROP POLICY IF EXISTS cqa_auth_select ON public.client_qa_criteria;
CREATE POLICY cqa_auth_select ON public.client_qa_criteria FOR SELECT TO authenticated
USING (public.can_access_engagement_ref(engagement_ref) OR EXISTS (
  SELECT 1 FROM public.client_engagements ce JOIN public.clients c ON c.id = ce.client_id
  WHERE ce.engagement_ref = client_qa_criteria.engagement_ref AND c.user_id = (SELECT auth.uid())
));

-- Notification preferences are private to the client and super admins.
DROP POLICY IF EXISTS cnp_auth_select ON public.client_notification_preferences;
CREATE POLICY cnp_auth_select ON public.client_notification_preferences FOR SELECT TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid())) OR public.is_super_admin());
DROP POLICY IF EXISTS cnp_auth_insert ON public.client_notification_preferences;
CREATE POLICY cnp_auth_insert ON public.client_notification_preferences FOR INSERT TO authenticated
WITH CHECK (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid())) OR public.is_super_admin());
DROP POLICY IF EXISTS cnp_auth_update ON public.client_notification_preferences;
CREATE POLICY cnp_auth_update ON public.client_notification_preferences FOR UPDATE TO authenticated
USING (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid())) OR public.is_super_admin())
WITH CHECK (client_email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid())) OR public.is_super_admin());

-- Commercial records: super admin or staff assigned to the quotation's project.
DROP POLICY IF EXISTS q_auth_all ON public.quotations;
CREATE POLICY q_auth_all ON public.quotations FOR ALL TO authenticated
USING (public.is_super_admin() OR (engagement_id IS NOT NULL AND public.is_assigned_staff_for_engagement(engagement_id)))
WITH CHECK (public.is_super_admin() OR (engagement_id IS NOT NULL AND public.is_assigned_staff_for_engagement(engagement_id)));

DROP POLICY IF EXISTS qv_auth_all ON public.quotation_versions;
CREATE POLICY qv_auth_all ON public.quotation_versions FOR ALL TO authenticated
USING (public.can_access_quotation(quotation_id)) WITH CHECK (public.can_access_quotation(quotation_id));
DROP POLICY IF EXISTS qli_auth_all ON public.quotation_line_items;
CREATE POLICY qli_auth_all ON public.quotation_line_items FOR ALL TO authenticated
USING (public.can_access_quotation(quotation_id)) WITH CHECK (public.can_access_quotation(quotation_id));
DROP POLICY IF EXISTS qcr_auth_all ON public.quotation_coupon_redemptions;
CREATE POLICY qcr_auth_all ON public.quotation_coupon_redemptions FOR ALL TO authenticated
USING (public.can_access_quotation(quotation_id)) WITH CHECK (public.can_access_quotation(quotation_id));
DROP POLICY IF EXISTS qa_auth_all ON public.quotation_acceptances;
CREATE POLICY qa_auth_all ON public.quotation_acceptances FOR SELECT TO authenticated
USING (public.can_access_quotation(quotation_id));
DROP POLICY IF EXISTS qrr_auth_all ON public.quotation_revision_requests;
CREATE POLICY qrr_auth_all ON public.quotation_revision_requests FOR SELECT TO authenticated
USING (public.can_access_quotation(quotation_id));
DROP POLICY IF EXISTS qal_auth_all ON public.quotation_audit_logs;
CREATE POLICY qal_auth_all ON public.quotation_audit_logs FOR SELECT TO authenticated
USING (public.can_access_quotation(quotation_id));
DROP POLICY IF EXISTS qc_auth_all ON public.quotation_coupons;
CREATE POLICY qc_auth_all ON public.quotation_coupons FOR ALL TO authenticated
USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS payment_requests_staff_select ON public.engagement_payment_requests;
CREATE POLICY payment_requests_staff_select ON public.engagement_payment_requests FOR SELECT TO authenticated
USING (public.is_super_admin() OR public.is_assigned_staff_for_client(client_id)
       OR client_id IN (SELECT c.id FROM public.clients c WHERE c.user_id = (SELECT auth.uid()))
       OR client_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS billing_submissions_staff_select ON public.payment_billing_submissions;
CREATE POLICY billing_submissions_staff_select ON public.payment_billing_submissions FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.engagement_payment_requests req
  WHERE req.id = payment_billing_submissions.payment_request_id
    AND (public.is_super_admin() OR public.is_assigned_staff_for_client(req.client_id)
         OR req.client_id IN (SELECT c.id FROM public.clients c WHERE c.user_id = (SELECT auth.uid()))
         OR req.client_id = (SELECT auth.uid()))
));

-- Service-only tables have RLS but no user-facing policies by design.
REVOKE ALL ON TABLE public.automation_approval_decisions, public.automation_approval_requests,
  public.automation_schedules, public.edge_invalidation_requests, public.leads,
  public.ops_audit_events, public.vs_demo_requests FROM anon, authenticated;
GRANT ALL ON TABLE public.automation_approval_decisions, public.automation_approval_requests,
  public.automation_schedules, public.edge_invalidation_requests, public.leads,
  public.ops_audit_events, public.vs_demo_requests TO service_role;

-- Fix function search paths and remove direct invocation of trigger-only functions.
ALTER FUNCTION public.update_modified_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.match_knowledge_chunks(text, integer, vector) SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.update_vs_demo_requests_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.init_engagement_stages() SET search_path = public, pg_temp;
ALTER FUNCTION public.set_quotations_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.protect_immutable_staff_workspace_events() SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_prevent_verified_maintenance_order_mutation() SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_expire_outdated_standard_trials() SET search_path = public, pg_temp;
ALTER FUNCTION public.fn_prevent_completed_refund_reversion() SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS public.send_welcome_email_trigger();

REVOKE ALL ON FUNCTION public.audit_enquiry_approval() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_staff_workspace_immutability() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_maintenance_order_mutation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_profile_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.init_engagement_stages() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.lead_cancel_followups_on_reply() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.protect_immutable_staff_workspace_events() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_prevent_verified_maintenance_order_mutation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_prevent_completed_refund_reversion() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_quotations_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_modified_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_vs_demo_requests_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fn_expire_outdated_standard_trials() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_expire_outdated_standard_trials() TO service_role;

REVOKE ALL ON FUNCTION public.current_staff_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_assigned_staff_for_client(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_assigned_staff_for_engagement(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff_or_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff_workspace_owner(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_staff_role(), public.is_assigned_staff_for_client(uuid),
  public.is_assigned_staff_for_engagement(uuid), public.is_staff_or_admin(),
  public.is_staff_workspace_owner(uuid), public.is_super_admin() TO authenticated, service_role;

COMMIT;
