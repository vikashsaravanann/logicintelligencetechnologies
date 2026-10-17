-- ==============================================================================
-- LOGIC INTELLIGENCE TECHNOLOGIES (LIT) — FORMS, WORKSPACES & COMMUNICATIONS
-- Migration: 20261017090000_forms_workspaces_governance.sql
-- Scope:
--   1. WS02: Unique index on staff_client_assignments(staff_user_id, engagement_id)
--   2. FORMS05: Database persistence for staff_support_notes & staff_escalations
--   3. FORMS03: Canonical support_tickets columns & indexes (client, project, staff links)
--   4. FORMS04: Full checklist discovery answers & metadata persistence
--   5. FORMS02: Assigned staff access policies for shared project communications
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. WS02: Unique Index on staff_client_assignments(staff_user_id, engagement_id)
-- ------------------------------------------------------------------------------

-- Deduplicate any legacy duplicate assignments where both staff and engagement match
DELETE FROM public.staff_client_assignments a
USING public.staff_client_assignments b
WHERE a.id > b.id
  AND a.staff_user_id = b.staff_user_id
  AND a.engagement_id IS NOT NULL
  AND a.engagement_id = b.engagement_id;

-- Create unique index to guard collaboration invitation upserts and prevent double assignments
CREATE UNIQUE INDEX IF NOT EXISTS uq_staff_client_assignments_pair
  ON public.staff_client_assignments (staff_user_id, engagement_id);

-- ------------------------------------------------------------------------------
-- 2. FORMS05: Database Persistence for Staff Support Notes (Replacing in-memory Map)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_support_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  engagement_id UUID REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.staff_client_assignments(id) ON DELETE SET NULL,
  author_user_id UUID NOT NULL REFERENCES public.profiles(id),
  author_email TEXT,
  author_role TEXT NOT NULL,
  stage_key TEXT,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_support_notes_client
  ON public.staff_support_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_staff_support_notes_engagement
  ON public.staff_support_notes(engagement_id);
CREATE INDEX IF NOT EXISTS idx_staff_support_notes_created_at
  ON public.staff_support_notes(created_at DESC);

ALTER TABLE public.staff_support_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ssn_service_role ON public.staff_support_notes;
CREATE POLICY ssn_service_role ON public.staff_support_notes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ssn_super_admin ON public.staff_support_notes;
CREATE POLICY ssn_super_admin ON public.staff_support_notes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS ssn_staff_assigned ON public.staff_support_notes;
CREATE POLICY ssn_staff_assigned ON public.staff_support_notes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_client_assignments a
      WHERE a.staff_user_id = auth.uid()
        AND a.status = 'active'
        AND (
          a.client_id = staff_support_notes.client_id
          OR (staff_support_notes.engagement_id IS NOT NULL AND a.engagement_id = staff_support_notes.engagement_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_client_assignments a
      WHERE a.staff_user_id = auth.uid()
        AND a.status = 'active'
        AND (
          a.client_id = staff_support_notes.client_id
          OR (staff_support_notes.engagement_id IS NOT NULL AND a.engagement_id = staff_support_notes.engagement_id)
        )
    )
  );

-- ------------------------------------------------------------------------------
-- 3. FORMS05: Database Persistence for Staff Escalations / Action Requests
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  engagement_id UUID REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.staff_client_assignments(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  requested_by_email TEXT,
  requested_by_role TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (
    request_type IN (
      'stage_review',
      'identity_correction_escalation',
      'technical_clarification',
      'commercial_escalation'
    )
  ),
  stage_key TEXT,
  summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_super_admin' CHECK (
    status IN ('pending_super_admin', 'in_review', 'resolved')
  ),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_escalations_client
  ON public.staff_escalations(client_id);
CREATE INDEX IF NOT EXISTS idx_staff_escalations_engagement
  ON public.staff_escalations(engagement_id);
CREATE INDEX IF NOT EXISTS idx_staff_escalations_status
  ON public.staff_escalations(status);
CREATE INDEX IF NOT EXISTS idx_staff_escalations_created_at
  ON public.staff_escalations(created_at DESC);

ALTER TABLE public.staff_escalations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS se_service_role ON public.staff_escalations;
CREATE POLICY se_service_role ON public.staff_escalations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS se_super_admin ON public.staff_escalations;
CREATE POLICY se_super_admin ON public.staff_escalations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS se_staff_assigned ON public.staff_escalations;
CREATE POLICY se_staff_assigned ON public.staff_escalations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_client_assignments a
      WHERE a.staff_user_id = auth.uid()
        AND a.status = 'active'
        AND (
          a.client_id = staff_escalations.client_id
          OR (staff_escalations.engagement_id IS NOT NULL AND a.engagement_id = staff_escalations.engagement_id)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff_client_assignments a
      WHERE a.staff_user_id = auth.uid()
        AND a.status = 'active'
        AND (
          a.client_id = staff_escalations.client_id
          OR (staff_escalations.engagement_id IS NOT NULL AND a.engagement_id = staff_escalations.engagement_id)
        )
    )
  );

-- ------------------------------------------------------------------------------
-- 4. FORMS03: Canonical Support Tickets Schema Linkage
-- ------------------------------------------------------------------------------

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS ticket_ref TEXT,
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS engagement_id UUID REFERENCES public.client_engagements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS component TEXT,
  ADD COLUMN IF NOT EXISTS severity TEXT,
  ADD COLUMN IF NOT EXISTS sla_target_hours INTEGER,
  ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_support_tickets_ticket_ref
  ON public.support_tickets(ticket_ref)
  WHERE ticket_ref IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_support_tickets_client_id
  ON public.support_tickets(client_id)
  WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_support_tickets_engagement_id
  ON public.support_tickets(engagement_id)
  WHERE engagement_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_staff
  ON public.support_tickets(assigned_staff_id)
  WHERE assigned_staff_id IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 5. FORMS04: Full Discovery Questionnaire Answers & Metadata
-- ------------------------------------------------------------------------------

ALTER TABLE public.checklist_leads
  ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ------------------------------------------------------------------------------
-- 6. FORMS02: Assigned Staff RLS Policies for Shared Project Communications
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS ct_staff_assigned ON public.conversation_threads;
CREATE POLICY ct_staff_assigned ON public.conversation_threads
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_client_assignments a
      JOIN public.client_engagements ce ON ce.id = a.engagement_id
      WHERE a.staff_user_id = auth.uid()
        AND a.status = 'active'
        AND (
          ce.engagement_ref = conversation_threads.engagement_ref
          OR ce.contact_email = conversation_threads.client_email
        )
    )
  );

DROP POLICY IF EXISTS cm_staff_assigned ON public.conversation_messages;
CREATE POLICY cm_staff_assigned ON public.conversation_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_threads t
      JOIN public.client_engagements ce ON (
        ce.engagement_ref = t.engagement_ref
        OR ce.contact_email = t.client_email
      )
      JOIN public.staff_client_assignments a ON a.engagement_id = ce.id
      WHERE t.thread_id = conversation_messages.thread_id
        AND a.staff_user_id = auth.uid()
        AND a.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_threads t
      JOIN public.client_engagements ce ON (
        ce.engagement_ref = t.engagement_ref
        OR ce.contact_email = t.client_email
      )
      JOIN public.staff_client_assignments a ON a.engagement_id = ce.id
      WHERE t.thread_id = conversation_messages.thread_id
        AND a.staff_user_id = auth.uid()
        AND a.status = 'active'
    )
  );

COMMIT;
