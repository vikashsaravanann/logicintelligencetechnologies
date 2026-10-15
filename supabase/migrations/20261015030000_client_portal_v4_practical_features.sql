-- Migration: 20261015030000_client_portal_v4_practical_features.sql
-- Description: Client Portal V4 Practical Enterprise Features
-- Includes:
--   1. client_notifications (Real-Time Notification Center)
--   2. client_action_items (Central Approvals, Tasks & Signatures)
--   3. client_change_requests (Change Request RFC Manager)
--   4. client_shared_decisions (Decisions & Meeting Actions Register)
--   5. client_project_blockers (Blockers & Dependencies Register)
--   6. client_qa_criteria (QA Evidence & Acceptance Criteria Tracker)
--   7. client_notification_preferences (Project Digest & Notification Preferences)
-- Strict RLS and audit trails for zero cross-tenant leakage.

BEGIN;

-- ── 1. client_notifications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email    text NOT NULL,
  engagement_ref  text,
  title           text NOT NULL,
  message         text NOT NULL,
  category        text NOT NULL CHECK (category IN (
    'action_required', 'milestone', 'document', 'payment', 'system', 'message'
  )),
  action_url      text,
  action_label    text,
  read_at         timestamptz,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_notifs_email ON public.client_notifications(client_email);
CREATE INDEX IF NOT EXISTS idx_client_notifs_ref ON public.client_notifications(engagement_ref) WHERE engagement_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_client_notifs_unread ON public.client_notifications(client_email) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_client_notifs_created ON public.client_notifications(created_at DESC);

ALTER TABLE public.client_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notifications FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.client_notifications TO service_role;
GRANT SELECT, UPDATE ON public.client_notifications TO authenticated;

DROP POLICY IF EXISTS cn_service_all ON public.client_notifications;
CREATE POLICY cn_service_all ON public.client_notifications
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS cn_auth_select ON public.client_notifications;
CREATE POLICY cn_auth_select ON public.client_notifications
  FOR SELECT TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

DROP POLICY IF EXISTS cn_auth_update ON public.client_notifications;
CREATE POLICY cn_auth_update ON public.client_notifications
  FOR UPDATE TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  )
  WITH CHECK (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );


-- ── 2. client_action_items ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_action_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_ref  text NOT NULL,
  client_email    text NOT NULL,
  title           text NOT NULL,
  description     text,
  category        text NOT NULL CHECK (category IN (
    'decision', 'approval', 'review', 'submission', 'meeting', 'payment'
  )),
  priority        text NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'critical'
  )),
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_review', 'completed', 'cancelled'
  )),
  due_at          timestamptz,
  assigned_to     text NOT NULL DEFAULT 'client' CHECK (assigned_to IN (
    'client', 'lit_team'
  )),
  action_url      text,
  completed_at    timestamptz,
  completed_by    text,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_actions_email ON public.client_action_items(client_email);
CREATE INDEX IF NOT EXISTS idx_client_actions_ref ON public.client_action_items(engagement_ref);
CREATE INDEX IF NOT EXISTS idx_client_actions_status ON public.client_action_items(status);
CREATE INDEX IF NOT EXISTS idx_client_actions_due ON public.client_action_items(due_at ASC);

ALTER TABLE public.client_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_action_items FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.client_action_items TO service_role;
GRANT SELECT, UPDATE ON public.client_action_items TO authenticated;

DROP POLICY IF EXISTS ca_service_all ON public.client_action_items;
CREATE POLICY ca_service_all ON public.client_action_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ca_auth_select ON public.client_action_items;
CREATE POLICY ca_auth_select ON public.client_action_items
  FOR SELECT TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

DROP POLICY IF EXISTS ca_auth_update ON public.client_action_items;
CREATE POLICY ca_auth_update ON public.client_action_items
  FOR UPDATE TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  )
  WITH CHECK (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );


-- ── 3. client_change_requests ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_change_requests (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfc_ref                text UNIQUE NOT NULL,
  engagement_ref         text NOT NULL,
  client_email           text NOT NULL,
  title                  text NOT NULL,
  category               text NOT NULL CHECK (category IN (
    'scope_expansion', 'architecture_change', 'integration', 'timeline_amendment', 'other'
  )),
  description            text NOT NULL,
  justification          text,
  impact_summary         text,
  status                 text NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'draft', 'submitted', 'in_review', 'quoted', 'client_approved', 'rejected', 'implemented'
  )),
  estimated_cost_inr     numeric(12, 2),
  estimated_timeline_days integer,
  submitted_at           timestamptz DEFAULT now(),
  reviewed_by            text,
  reviewed_at            timestamptz,
  metadata               jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rfc_ref ON public.client_change_requests(rfc_ref);
CREATE INDEX IF NOT EXISTS idx_rfc_eng_ref ON public.client_change_requests(engagement_ref);
CREATE INDEX IF NOT EXISTS idx_rfc_client_email ON public.client_change_requests(client_email);
CREATE INDEX IF NOT EXISTS idx_rfc_status ON public.client_change_requests(status);

ALTER TABLE public.client_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_change_requests FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.client_change_requests TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.client_change_requests TO authenticated;

DROP POLICY IF EXISTS rfc_service_all ON public.client_change_requests;
CREATE POLICY rfc_service_all ON public.client_change_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS rfc_auth_select ON public.client_change_requests;
CREATE POLICY rfc_auth_select ON public.client_change_requests
  FOR SELECT TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

DROP POLICY IF EXISTS rfc_auth_insert ON public.client_change_requests;
CREATE POLICY rfc_auth_insert ON public.client_change_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

DROP POLICY IF EXISTS rfc_auth_update ON public.client_change_requests;
CREATE POLICY rfc_auth_update ON public.client_change_requests
  FOR UPDATE TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  )
  WITH CHECK (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );


-- ── 4. client_shared_decisions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_shared_decisions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_ref  text NOT NULL,
  client_email    text NOT NULL,
  title           text NOT NULL,
  decision_text   text NOT NULL,
  context_meeting text,
  agreed_date     date NOT NULL DEFAULT CURRENT_DATE,
  status          text NOT NULL DEFAULT 'proposed' CHECK (status IN (
    'proposed', 'acknowledged', 'disputed'
  )),
  acknowledged_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_decisions_ref ON public.client_shared_decisions(engagement_ref);
CREATE INDEX IF NOT EXISTS idx_decisions_email ON public.client_shared_decisions(client_email);

ALTER TABLE public.client_shared_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_shared_decisions FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.client_shared_decisions TO service_role;
GRANT SELECT, UPDATE ON public.client_shared_decisions TO authenticated;

DROP POLICY IF EXISTS csd_service_all ON public.client_shared_decisions;
CREATE POLICY csd_service_all ON public.client_shared_decisions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS csd_auth_select ON public.client_shared_decisions;
CREATE POLICY csd_auth_select ON public.client_shared_decisions
  FOR SELECT TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

DROP POLICY IF EXISTS csd_auth_update ON public.client_shared_decisions;
CREATE POLICY csd_auth_update ON public.client_shared_decisions
  FOR UPDATE TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );


-- ── 5. client_project_blockers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_project_blockers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_ref  text NOT NULL,
  client_email    text NOT NULL,
  title           text NOT NULL,
  severity        text NOT NULL DEFAULT 'medium' CHECK (severity IN (
    'low', 'medium', 'high', 'critical'
  )),
  status          text NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'mitigated', 'resolved'
  )),
  impact          text NOT NULL,
  mitigation_plan text,
  owner           text NOT NULL DEFAULT 'LIT Engineering',
  resolved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blockers_ref ON public.client_project_blockers(engagement_ref);
CREATE INDEX IF NOT EXISTS idx_blockers_email ON public.client_project_blockers(client_email);

ALTER TABLE public.client_project_blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_project_blockers FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.client_project_blockers TO service_role;
GRANT SELECT ON public.client_project_blockers TO authenticated;

DROP POLICY IF EXISTS cpb_service_all ON public.client_project_blockers;
CREATE POLICY cpb_service_all ON public.client_project_blockers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS cpb_auth_select ON public.client_project_blockers;
CREATE POLICY cpb_auth_select ON public.client_project_blockers
  FOR SELECT TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );


-- ── 6. client_qa_criteria ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_qa_criteria (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_ref  text NOT NULL,
  criterion_ref   text NOT NULL,
  title           text NOT NULL,
  category        text NOT NULL DEFAULT 'functional',
  status          text NOT NULL DEFAULT 'not_run' CHECK (status IN (
    'not_run', 'in_progress', 'passed', 'failed', 'blocked'
  )),
  evidence_url    text,
  verified_at     timestamptz,
  verified_by     text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qa_ref ON public.client_qa_criteria(engagement_ref);

ALTER TABLE public.client_qa_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_qa_criteria FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.client_qa_criteria TO service_role;
GRANT SELECT ON public.client_qa_criteria TO authenticated;

DROP POLICY IF EXISTS cqa_service_all ON public.client_qa_criteria;
CREATE POLICY cqa_service_all ON public.client_qa_criteria
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS cqa_auth_select ON public.client_qa_criteria;
CREATE POLICY cqa_auth_select ON public.client_qa_criteria
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_engagements e
      WHERE e.engagement_ref = client_qa_criteria.engagement_ref
        AND (
          e.contact_email = (auth.jwt() ->> 'email')
          OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
          OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
        )
    )
  );


-- ── 7. client_notification_preferences ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_notification_preferences (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_email           text UNIQUE NOT NULL,
  email_critical_alerts  boolean NOT NULL DEFAULT true,
  email_stage_milestones boolean NOT NULL DEFAULT true,
  email_messages         boolean NOT NULL DEFAULT true,
  email_weekly_digest    boolean NOT NULL DEFAULT false,
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notif_prefs_email ON public.client_notification_preferences(client_email);

ALTER TABLE public.client_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notification_preferences FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.client_notification_preferences TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.client_notification_preferences TO authenticated;

DROP POLICY IF EXISTS cnp_service_all ON public.client_notification_preferences;
CREATE POLICY cnp_service_all ON public.client_notification_preferences
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS cnp_auth_select ON public.client_notification_preferences;
CREATE POLICY cnp_auth_select ON public.client_notification_preferences
  FOR SELECT TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

DROP POLICY IF EXISTS cnp_auth_insert ON public.client_notification_preferences;
CREATE POLICY cnp_auth_insert ON public.client_notification_preferences
  FOR INSERT TO authenticated
  WITH CHECK (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

DROP POLICY IF EXISTS cnp_auth_update ON public.client_notification_preferences;
CREATE POLICY cnp_auth_update ON public.client_notification_preferences
  FOR UPDATE TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  )
  WITH CHECK (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

COMMIT;
