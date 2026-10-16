-- ============================================================================
-- Migration: 20261016140000_harden_engagement_quotation_rls.sql
-- Description: Security hardening for client engagements, stages, documents,
--              identity change requests, and quotations.
-- Remediates: Audit findings P0-05 and P0-06 (RLS open anon/auth policies).
-- ============================================================================

-- Helper function to check if the current JWT caller is staff
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
  );
$$;

-- ── 1. client_engagements ───────────────────────────────────────────────────
DROP POLICY IF EXISTS ce_anon_select ON public.client_engagements;
DROP POLICY IF EXISTS ce_auth_all ON public.client_engagements;
DROP POLICY IF EXISTS ce_auth_staff_all ON public.client_engagements;
DROP POLICY IF EXISTS ce_auth_client_select ON public.client_engagements;

-- Staff has full read/write access
CREATE POLICY ce_auth_staff_all ON public.client_engagements
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- Authenticated clients can only SELECT their own engagements
CREATE POLICY ce_auth_client_select ON public.client_engagements
  FOR SELECT TO authenticated
  USING (
    contact_email = (auth.jwt() ->> 'email')
  );


-- ── 2. engagement_stages ────────────────────────────────────────────────────
DROP POLICY IF EXISTS es_anon_select ON public.engagement_stages;
DROP POLICY IF EXISTS es_auth_all ON public.engagement_stages;
DROP POLICY IF EXISTS es_auth_staff_all ON public.engagement_stages;
DROP POLICY IF EXISTS es_auth_client_select ON public.engagement_stages;

CREATE POLICY es_auth_staff_all ON public.engagement_stages
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

CREATE POLICY es_auth_client_select ON public.engagement_stages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_engagements ce
      WHERE ce.id = engagement_stages.engagement_id
        AND ce.contact_email = (auth.jwt() ->> 'email')
    )
  );


-- ── 3. engagement_stage_events ──────────────────────────────────────────────
DROP POLICY IF EXISTS ese_anon_select ON public.engagement_stage_events;
DROP POLICY IF EXISTS ese_auth_all ON public.engagement_stage_events;
DROP POLICY IF EXISTS ese_auth_staff_all ON public.engagement_stage_events;
DROP POLICY IF EXISTS ese_auth_client_select ON public.engagement_stage_events;

CREATE POLICY ese_auth_staff_all ON public.engagement_stage_events
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

CREATE POLICY ese_auth_client_select ON public.engagement_stage_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_engagements ce
      WHERE ce.id = engagement_stage_events.engagement_id
        AND ce.contact_email = (auth.jwt() ->> 'email')
    )
  );


-- ── 4. engagement_document_links ────────────────────────────────────────────
DROP POLICY IF EXISTS edl_anon_select ON public.engagement_document_links;
DROP POLICY IF EXISTS edl_auth_all ON public.engagement_document_links;
DROP POLICY IF EXISTS edl_auth_staff_all ON public.engagement_document_links;
DROP POLICY IF EXISTS edl_auth_client_select ON public.engagement_document_links;

CREATE POLICY edl_auth_staff_all ON public.engagement_document_links
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

CREATE POLICY edl_auth_client_select ON public.engagement_document_links
  FOR SELECT TO authenticated
  USING (
    is_client_visible = true
    AND EXISTS (
      SELECT 1 FROM public.client_engagements ce
      WHERE ce.id = engagement_document_links.engagement_id
        AND ce.contact_email = (auth.jwt() ->> 'email')
    )
  );


-- ── 5. client_identity_change_requests ──────────────────────────────────────
DROP POLICY IF EXISTS cicr_anon_insert ON public.client_identity_change_requests;
DROP POLICY IF EXISTS cicr_anon_select ON public.client_identity_change_requests;
DROP POLICY IF EXISTS cicr_auth_all ON public.client_identity_change_requests;
DROP POLICY IF EXISTS cicr_auth_staff_all ON public.client_identity_change_requests;
DROP POLICY IF EXISTS cicr_auth_client_select ON public.client_identity_change_requests;
DROP POLICY IF EXISTS cicr_auth_client_insert ON public.client_identity_change_requests;

CREATE POLICY cicr_auth_staff_all ON public.client_identity_change_requests
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

CREATE POLICY cicr_auth_client_select ON public.client_identity_change_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_engagements ce
      WHERE ce.id = client_identity_change_requests.engagement_id
        AND ce.contact_email = (auth.jwt() ->> 'email')
    )
  );

CREATE POLICY cicr_auth_client_insert ON public.client_identity_change_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.client_engagements ce
      WHERE ce.id = client_identity_change_requests.engagement_id
        AND ce.contact_email = (auth.jwt() ->> 'email')
    )
  );


-- ── 6. engagement_invites ───────────────────────────────────────────────────
DROP POLICY IF EXISTS ei_anon_select ON public.engagement_invites;
DROP POLICY IF EXISTS ei_auth_staff_all ON public.engagement_invites;

CREATE POLICY ei_auth_staff_all ON public.engagement_invites
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());
