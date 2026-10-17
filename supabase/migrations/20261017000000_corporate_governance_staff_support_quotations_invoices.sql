-- =============================================================================
-- Migration: 20261017000000_corporate_governance_staff_support_quotations_invoices.sql
-- Purpose:
--   1. Enforce Policy 1 (Staff Technical Preparation vs Super Admin Commercial Approval)
--   2. Enforce Policy 2 (Audited Staff Support View, Assignment-Scoped, Non-Impersonation)
--   3. Eliminate user_metadata role trust in RLS policies; use public.profiles.role
--   4. Remove anonymous quotation enumeration (q_anon_select)
--   5. Seed Enterprise Frontend Engineering (Rs. 50,000) and inactive WAKEUPINDIA coupon
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Authoritative Role & Assignment Helper Functions (SECURITY DEFINER)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_staff_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_staff_role() = 'super_admin', false);
$$;

-- -----------------------------------------------------------------------------
-- 2. Staff-Client Assignment & Audited Support Access Tables (Policy 2)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_client_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  engagement_id UUID REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  assignment_role TEXT NOT NULL CHECK (
    assignment_role IN ('technical_support', 'project_coordinator', 'operations_prep', 'delivery_engineer')
  ),
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'expired', 'revoked')
  ),
  can_view_technical_stages BOOLEAN NOT NULL DEFAULT true,
  can_prepare_technical_quotation BOOLEAN NOT NULL DEFAULT false,
  can_prepare_invoice_request BOOLEAN NOT NULL DEFAULT false,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  assignment_reason TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT staff_client_assignment_target_check CHECK (
    client_id IS NOT NULL OR engagement_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_staff_client_assignments_staff
  ON public.staff_client_assignments (staff_user_id, status);
CREATE INDEX IF NOT EXISTS idx_staff_client_assignments_client
  ON public.staff_client_assignments (client_id, status);
CREATE INDEX IF NOT EXISTS idx_staff_client_assignments_engagement
  ON public.staff_client_assignments (engagement_id, status);

CREATE TABLE IF NOT EXISTS public.staff_support_access_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id UUID NOT NULL REFERENCES public.profiles(id),
  staff_email TEXT,
  staff_role TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  engagement_id UUID REFERENCES public.client_engagements(id),
  assignment_id UUID REFERENCES public.staff_client_assignments(id),
  action TEXT NOT NULL,
  route TEXT NOT NULL,
  reason TEXT,
  redacted_fields TEXT[] NOT NULL DEFAULT ARRAY[
    'unit_price', 'subtotal', 'tax', 'gst', 'discount', 'coupon',
    'total', 'milestone_amount', 'invoice_total', 'payment_reference',
    'utr', 'bank_details', 'upi_vpa', 'gstin', 'pan'
  ],
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_support_access_events_staff
  ON public.staff_support_access_events (staff_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_support_access_events_engagement
  ON public.staff_support_access_events (engagement_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.is_assigned_staff_for_client(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin() OR EXISTS (
    SELECT 1
    FROM public.staff_client_assignments a
    WHERE a.staff_user_id = auth.uid()
      AND a.client_id = target_client_id
      AND a.status = 'active'
      AND (a.expires_at IS NULL OR a.expires_at > NOW())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_staff_for_engagement(target_engagement_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin() OR EXISTS (
    SELECT 1
    FROM public.staff_client_assignments a
    LEFT JOIN public.client_engagements ce ON ce.id = target_engagement_id
    WHERE a.staff_user_id = auth.uid()
      AND a.status = 'active'
      AND (a.expires_at IS NULL OR a.expires_at > NOW())
      AND (
        a.engagement_id = target_engagement_id
        OR (ce.client_id IS NOT NULL AND a.client_id = ce.client_id)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.forbid_client_impersonation(
  actor_user_id UUID,
  target_client_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF actor_user_id IS NULL THEN
    RETURN false;
  END IF;
  IF target_client_user_id IS NOT NULL AND actor_user_id = target_client_user_id THEN
    RETURN true;
  END IF;
  -- Staff must never execute mutations pretending to be target_client_user_id
  RETURN false;
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. Staff Technical Quotation Drafts & Super Admin Commercial Versions (Policy 1)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.quotation_technical_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  engagement_id UUID REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  draft_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'technical_draft' CHECK (
    status IN (
      'technical_draft',
      'submitted_for_commercial_review',
      'changes_requested',
      'approved_by_super_admin',
      'rejected',
      'converted_to_quotation'
    )
  ),
  client_Snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  scope_summary TEXT NOT NULL DEFAULT '',
  architecture_notes TEXT NOT NULL DEFAULT '',
  timeline_notes TEXT NOT NULL DEFAULT '',
  assumptions TEXT NOT NULL DEFAULT '',
  exclusions TEXT NOT NULL DEFAULT '',
  technical_line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  checklist_selection JSONB NOT NULL DEFAULT '[]'::jsonb,
  prepared_by UUID NOT NULL REFERENCES public.profiles(id),
  prepared_by_email TEXT,
  prepared_by_role TEXT NOT NULL,
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotation_technical_drafts_status
  ON public.quotation_technical_drafts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotation_technical_drafts_engagement
  ON public.quotation_technical_drafts (engagement_id);

CREATE TABLE IF NOT EXISTS public.quotation_commercial_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  technical_draft_id UUID REFERENCES public.quotation_technical_drafts(id) ON DELETE SET NULL,
  version_number INTEGER NOT NULL CHECK (version_number >= 1),
  priced_line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_paise BIGINT NOT NULL CHECK (subtotal_paise >= 0),
  discount_paise BIGINT NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  coupon_id UUID REFERENCES public.quotation_coupons(id) ON DELETE SET NULL,
  coupon_code TEXT,
  taxable_paise BIGINT NOT NULL CHECK (taxable_paise >= 0),
  gst_Applicable BOOLEAN NOT NULL DEFAULT false,
  gst_rate_bps INTEGER NOT NULL DEFAULT 0 CHECK (gst_rate_bps >= 0 AND gst_rate_bps <= 2800),
  gst_paise BIGINT NOT NULL DEFAULT 0 CHECK (gst_paise >= 0),
  total_paise BIGINT NOT NULL CHECK (total_paise >= 0),
  advance_percent NUMERIC(5,2) NOT NULL DEFAULT 50.00 CHECK (advance_percent = 50.00),
  final_percent NUMERIC(5,2) NOT NULL DEFAULT 50.00 CHECK (final_percent = 50.00),
  advance_paise BIGINT NOT NULL CHECK (advance_paise >= 0),
  final_paise BIGINT NOT NULL CHECK (final_paise >= 0),
  commercial_notes TEXT,
  approved_by UUID NOT NULL REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  CONSTRAINT exact_two_milestone_sum CHECK (advance_paise + final_paise = total_paise),
  UNIQUE (quotation_id, version_number)
);

-- -----------------------------------------------------------------------------
-- 4. Staff Invoice Preparation Requests & Commercial Approval Audit Trail (Policy 1)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.invoice_preparation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT NOT NULL UNIQUE,
  engagement_id UUID NOT NULL REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  milestone_key TEXT NOT NULL CHECK (
    milestone_key IN ('initial_50_advance', 'final_50_deployment')
  ),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN (
      'draft',
      'submitted_for_super_admin',
      'changes_requested',
      'approved_and_issued',
      'rejected'
    )
  ),
  deliverable_summary TEXT NOT NULL,
  evidence_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  stage_Verification_notes TEXT,
  prepared_by UUID NOT NULL REFERENCES public.profiles(id),
  prepared_by_email TEXT,
  prepared_by_role TEXT NOT NULL,
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  issued_invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_preparation_requests_status
  ON public.invoice_preparation_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_preparation_requests_engagement
  ON public.invoice_preparation_requests (engagement_id);

CREATE TABLE IF NOT EXISTS public.commercial_approval_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (
    entity_type IN (
      'quotation_technical_draft',
      'quotation_pricing',
      'quotation_publish',
      'quotation_coupon',
      'invoice_preparation_request',
      'invoice_issue',
      'payment_verification',
      'engagement_pricing',
      'stage_approval',
      'identity_change_request'
    )
  ),
  entity_id TEXT NOT NULL,
  engagement_id UUID REFERENCES public.client_engagements(id) ON DELETE SET NULL,
  actor_user_id UUID NOT NULL REFERENCES public.profiles(id),
  actor_email TEXT,
  actor_role TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (
    decision IN ('submitted', 'approved', 'rejected', 'changes_requested', 'published', 'issued', 'verified', 'revoked')
  ),
  notes TEXT,
  before_state JSONB,
  after_state JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commercial_approval_events_entity
  ON public.commercial_approval_events (entity_type, entity_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 5. Enable Row Level Security on All Governance Tables
-- -----------------------------------------------------------------------------

ALTER TABLE public.staff_client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_support_access_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_technical_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_commercial_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_preparation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_approval_events ENABLE ROW LEVEL SECURITY;

-- staff_client_assignments: Super Admin manages; assigned staff can read own active rows
DROP POLICY IF EXISTS "super_admin_all_staff_assignments" ON public.staff_client_assignments;
CREATE POLICY "super_admin_all_staff_assignments"
  ON public.staff_client_assignments FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "staff_read_own_assignments" ON public.staff_client_assignments;
CREATE POLICY "staff_read_own_assignments"
  ON public.staff_client_assignments FOR SELECT TO authenticated
  USING (staff_user_id = auth.uid());

-- staff_support_access_events: Super Admin reads all; staff can insert own audit events and read own
DROP POLICY IF EXISTS "super_admin_read_all_support_events" ON public.staff_support_access_events;
CREATE POLICY "super_admin_read_all_support_events"
  ON public.staff_support_access_events FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "staff_insert_own_support_events" ON public.staff_support_access_events;
CREATE POLICY "staff_insert_own_support_events"
  ON public.staff_support_access_events FOR INSERT TO authenticated
  WITH CHECK (staff_user_id = auth.uid());

-- quotation_technical_drafts: Super Admin full access; assigned admin/operations can read/create/update non-approved drafts
DROP POLICY IF EXISTS "super_admin_all_technical_drafts" ON public.quotation_technical_drafts;
CREATE POLICY "super_admin_all_technical_drafts"
  ON public.quotation_technical_drafts FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "staff_select_assigned_technical_drafts" ON public.quotation_technical_drafts;
CREATE POLICY "staff_select_assigned_technical_drafts"
  ON public.quotation_technical_drafts FOR SELECT TO authenticated
  USING (
    public.current_staff_role() IN ('admin', 'operations')
    AND (
      prepared_by = auth.uid()
      OR (engagement_id IS NOT NULL AND public.is_assigned_staff_for_engagement(engagement_id))
      OR (client_id IS NOT NULL AND public.is_assigned_staff_for_client(client_id))
    )
  );

DROP POLICY IF EXISTS "staff_insert_assigned_technical_drafts" ON public.quotation_technical_drafts;
CREATE POLICY "staff_insert_assigned_technical_drafts"
  ON public.quotation_technical_drafts FOR INSERT TO authenticated
  WITH CHECK (
    public.current_staff_role() IN ('admin', 'operations')
    AND prepared_by = auth.uid()
    AND status IN ('technical_draft', 'submitted_for_commercial_review')
    AND (
      (engagement_id IS NOT NULL AND public.is_assigned_staff_for_engagement(engagement_id))
      OR (client_id IS NOT NULL AND public.is_assigned_staff_for_client(client_id))
    )
  );

DROP POLICY IF EXISTS "staff_update_assigned_technical_drafts" ON public.quotation_technical_drafts;
CREATE POLICY "staff_update_assigned_technical_drafts"
  ON public.quotation_technical_drafts FOR UPDATE TO authenticated
  USING (
    public.current_staff_role() IN ('admin', 'operations')
    AND prepared_by = auth.uid()
    AND status IN ('technical_draft', 'changes_requested')
  )
  WITH CHECK (
    public.current_staff_role() IN ('admin', 'operations')
    AND prepared_by = auth.uid()
    AND status IN ('technical_draft', 'submitted_for_commercial_review', 'changes_requested')
  );

-- quotation_commercial_versions: Super Admin ONLY
DROP POLICY IF EXISTS "super_admin_only_commercial_versions" ON public.quotation_commercial_versions;
CREATE POLICY "super_admin_only_commercial_versions"
  ON public.quotation_commercial_versions FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- invoice_preparation_requests: Super Admin full access; assigned admin/operations can read/create/update non-issued requests
DROP POLICY IF EXISTS "super_admin_all_invoice_prep_requests" ON public.invoice_preparation_requests;
CREATE POLICY "super_admin_all_invoice_prep_requests"
  ON public.invoice_preparation_requests FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "staff_select_assigned_invoice_prep_requests" ON public.invoice_preparation_requests;
CREATE POLICY "staff_select_assigned_invoice_prep_requests"
  ON public.invoice_preparation_requests FOR SELECT TO authenticated
  USING (
    public.current_staff_role() IN ('admin', 'operations')
    AND (
      prepared_by = auth.uid()
      OR public.is_assigned_staff_for_engagement(engagement_id)
    )
  );

DROP POLICY IF EXISTS "staff_insert_assigned_invoice_prep_requests" ON public.invoice_preparation_requests;
CREATE POLICY "staff_insert_assigned_invoice_prep_requests"
  ON public.invoice_preparation_requests FOR INSERT TO authenticated
  WITH CHECK (
    public.current_staff_role() IN ('admin', 'operations')
    AND prepared_by = auth.uid()
    AND status IN ('draft', 'submitted_for_super_admin')
    AND public.is_assigned_staff_for_engagement(engagement_id)
  );

DROP POLICY IF EXISTS "staff_update_assigned_invoice_prep_requests" ON public.invoice_preparation_requests;
CREATE POLICY "staff_update_assigned_invoice_prep_requests"
  ON public.invoice_preparation_requests FOR UPDATE TO authenticated
  USING (
    public.current_staff_role() IN ('admin', 'operations')
    AND prepared_by = auth.uid()
    AND status IN ('draft', 'changes_requested')
  )
  WITH CHECK (
    public.current_staff_role() IN ('admin', 'operations')
    AND prepared_by = auth.uid()
    AND status IN ('draft', 'submitted_for_super_admin', 'changes_requested')
  );

-- commercial_approval_events: Super Admin full access; staff can read own submitted events
DROP POLICY IF EXISTS "super_admin_all_commercial_approval_events" ON public.commercial_approval_events;
CREATE POLICY "super_admin_all_commercial_approval_events"
  ON public.commercial_approval_events FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "staff_select_own_commercial_approval_events" ON public.commercial_approval_events;
CREATE POLICY "staff_select_own_commercial_approval_events"
  ON public.commercial_approval_events FOR SELECT TO authenticated
  USING (actor_user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 6. Replace Unsafe RLS Policies on Engagements, Quotations, Coupons & Invoices
-- -----------------------------------------------------------------------------

-- 6a. client_engagements
DROP POLICY IF EXISTS "staff_all_engagements" ON public.client_engagements;
DROP POLICY IF EXISTS "super_admin_all_engagements" ON public.client_engagements;
DROP POLICY IF EXISTS "assigned_staff_select_engagements" ON public.client_engagements;

CREATE POLICY "super_admin_all_engagements"
  ON public.client_engagements FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "assigned_staff_select_engagements"
  ON public.client_engagements FOR SELECT TO authenticated
  USING (
    public.current_staff_role() IN ('admin', 'operations', 'support')
    AND public.is_assigned_staff_for_engagement(id)
  );

-- 6b. engagement_stages
DROP POLICY IF EXISTS "staff_all_engagement_stages" ON public.engagement_stages;
DROP POLICY IF EXISTS "super_admin_all_engagement_stages" ON public.engagement_stages;
DROP POLICY IF EXISTS "assigned_staff_select_engagement_stages" ON public.engagement_stages;

CREATE POLICY "super_admin_all_engagement_stages"
  ON public.engagement_stages FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "assigned_staff_select_engagement_stages"
  ON public.engagement_stages FOR SELECT TO authenticated
  USING (
    public.current_staff_role() IN ('admin', 'operations', 'support')
    AND public.is_assigned_staff_for_engagement(engagement_id)
  );

-- 6c. engagement_document_links
DROP POLICY IF EXISTS "staff_all_document_links" ON public.engagement_document_links;
DROP POLICY IF EXISTS "super_admin_all_document_links" ON public.engagement_document_links;
DROP POLICY IF EXISTS "assigned_staff_select_document_links" ON public.engagement_document_links;

CREATE POLICY "super_admin_all_document_links"
  ON public.engagement_document_links FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "assigned_staff_select_document_links"
  ON public.engagement_document_links FOR SELECT TO authenticated
  USING (
    public.current_staff_role() IN ('admin', 'operations', 'support')
    AND public.is_assigned_staff_for_engagement(engagement_id)
  );

-- 6d. client_identity_change_requests
DROP POLICY IF EXISTS "staff_all_identity_requests" ON public.client_identity_change_requests;
DROP POLICY IF EXISTS "super_admin_all_identity_requests" ON public.client_identity_change_requests;
DROP POLICY IF EXISTS "assigned_staff_select_identity_requests" ON public.client_identity_change_requests;

CREATE POLICY "super_admin_all_identity_requests"
  ON public.client_identity_change_requests FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "assigned_staff_select_identity_requests"
  ON public.client_identity_change_requests FOR SELECT TO authenticated
  USING (
    public.current_staff_role() IN ('admin', 'operations', 'support')
    AND public.is_assigned_staff_for_engagement(engagement_id)
  );

-- 6e. quotations, quotation_line_items, quotation_versions, quotation_coupons, quotation_service_catalog
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotations') THEN
    DROP POLICY IF EXISTS "q_anon_select" ON public.quotations;
    DROP POLICY IF EXISTS "q_staff_all" ON public.quotations;
    DROP POLICY IF EXISTS "staff_all_quotations" ON public.quotations;
    DROP POLICY IF EXISTS "super_admin_all_quotations" ON public.quotations;

    EXECUTE 'CREATE POLICY "super_admin_all_quotations"
      ON public.quotations FOR ALL TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotation_line_items') THEN
    DROP POLICY IF EXISTS "qli_anon_select" ON public.quotation_line_items;
    DROP POLICY IF EXISTS "qli_staff_all" ON public.quotation_line_items;
    DROP POLICY IF EXISTS "staff_all_quotation_line_items" ON public.quotation_line_items;
    DROP POLICY IF EXISTS "super_admin_all_quotation_line_items" ON public.quotation_line_items;

    EXECUTE 'CREATE POLICY "super_admin_all_quotation_line_items"
      ON public.quotation_line_items FOR ALL TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotation_versions') THEN
    DROP POLICY IF EXISTS "qv_staff_all" ON public.quotation_versions;
    DROP POLICY IF EXISTS "staff_all_quotation_versions" ON public.quotation_versions;
    DROP POLICY IF EXISTS "super_admin_all_quotation_versions" ON public.quotation_versions;

    EXECUTE 'CREATE POLICY "super_admin_all_quotation_versions"
      ON public.quotation_versions FOR ALL TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotation_coupons') THEN
    DROP POLICY IF EXISTS "qc_staff_all" ON public.quotation_coupons;
    DROP POLICY IF EXISTS "staff_all_quotation_coupons" ON public.quotation_coupons;
    DROP POLICY IF EXISTS "super_admin_all_quotation_coupons" ON public.quotation_coupons;

    EXECUTE 'CREATE POLICY "super_admin_all_quotation_coupons"
      ON public.quotation_coupons FOR ALL TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin())';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotation_service_catalog') THEN
    DROP POLICY IF EXISTS "qsc_staff_write" ON public.quotation_service_catalog;
    DROP POLICY IF EXISTS "super_admin_manage_quotation_service_catalog" ON public.quotation_service_catalog;

    EXECUTE 'CREATE POLICY "super_admin_manage_quotation_service_catalog"
      ON public.quotation_service_catalog FOR ALL TO authenticated
      USING (public.is_super_admin())
      WITH CHECK (public.is_super_admin())';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 7. Seed Required Service Catalog Item & Inactive WAKEUPINDIA Coupon
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotation_service_catalog') THEN
    INSERT INTO public.quotation_service_catalog (
      code,
      category,
      name,
      description,
      default_unit,
      base_price_paise,
      default_gst_rate_bps,
      is_active,
      sort_order
    )
    VALUES (
      'frontend-nextjs-enterprise',
      'Frontend Engineering',
      'Enterprise Frontend Engineering — Next.js 16 / React / TypeScript',
      'Responsive enterprise web application architecture, design system implementation, accessibility and performance optimization.',
      'project',
      5000000,
      1800,
      true,
      5
    )
    ON CONFLICT (code) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      base_price_paise = EXCLUDED.base_price_paise,
      is_active = true,
      updated_at = NOW();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quotation_coupons') THEN
    -- Deactivate any unapproved FOUNDER10 seed coupon
    UPDATE public.quotation_coupons
    SET is_active = false,
        updated_at = NOW()
    WHERE code = 'FOUNDER10';

    -- Upsert WAKEUPINDIA as inactive and pending Super Admin configuration
    INSERT INTO public.quotation_coupons (
      code,
      campaign_name,
      description,
      discount_type,
      discount_value,
      min_subtotal_paise,
      max_discount_paise,
      max_redemptions,
      is_active
    )
    VALUES (
      'WAKEUPINDIA',
      'Support Wake Up India — Initial Launch',
      'Inactive seed campaign awaiting explicit Super Admin parameters before activation.',
      'percentage',
      0,
      0,
      NULL,
      100,
      false
    )
    ON CONFLICT (code) DO UPDATE SET
      campaign_name = EXCLUDED.campaign_name,
      description = EXCLUDED.description,
      discount_type = 'percentage',
      discount_value = 0,
      is_active = false,
      updated_at = NOW();
  END IF;
END $$;

COMMIT;
