-- Migration: 20261015000000_client_engagements_lifecycle.sql
-- Description: Universal 13-stage client lifecycle engine, audit events, document vault links,
--              identity change queue, and secure engagement access.
-- Idempotent and compliant with Command Center RLS and super-admin security policies.

BEGIN;

-- ── 1. client_engagements ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_ref text NOT NULL UNIQUE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  checklist_invitation_id uuid REFERENCES public.enterprise_checklist_invitations(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  project_title text NOT NULL DEFAULT 'Enterprise AI & Cloud Infrastructure Architecture',
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  current_stage text NOT NULL DEFAULT 'checklist',
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_engagements_ref ON public.client_engagements (engagement_ref);
CREATE INDEX IF NOT EXISTS idx_client_engagements_client ON public.client_engagements (client_id);
CREATE INDEX IF NOT EXISTS idx_client_engagements_proposal ON public.client_engagements (proposal_id);

ALTER TABLE public.client_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_engagements FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ce_service_all ON public.client_engagements;
CREATE POLICY ce_service_all ON public.client_engagements FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ce_anon_select ON public.client_engagements;
CREATE POLICY ce_anon_select ON public.client_engagements FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS ce_auth_all ON public.client_engagements;
CREATE POLICY ce_auth_all ON public.client_engagements FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_engagements TO service_role;
GRANT SELECT ON public.client_engagements TO anon;
GRANT SELECT, INSERT, UPDATE ON public.client_engagements TO authenticated;


-- ── 2. engagement_stages ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.engagement_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  stage_key text NOT NULL CHECK (stage_key IN (
    'checklist', 'discovery', 'proposal', 'acceptance', 'sow',
    'initial-invoice', 'onboarding', 'technical-spec', 'development',
    'delivery-acceptance', 'final-payment', 'handover', 'support'
  )),
  ordinal int NOT NULL CHECK (ordinal BETWEEN 1 AND 13),
  title text NOT NULL,
  summary text,
  status text NOT NULL DEFAULT 'locked' CHECK (status IN (
    'locked', 'available', 'in_progress', 'submitted', 'under_review',
    'changes_requested', 'approved', 'issued', 'awaiting_signature',
    'signed', 'payment_requested', 'customer_claimed_paid',
    'verification_pending', 'partially_verified', 'verified', 'paid',
    'accepted', 'completed', 'not_applicable', 'blocked', 'expired', 'revoked'
  )),
  assigned_owner text DEFAULT 'Logic Intelligence Technologies Staff',
  notes text,
  prerequisite_stage_key text,
  prerequisite_description text,
  document_master_ref text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  unlocked_at timestamptz,
  completed_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_engagement_stage UNIQUE (engagement_id, stage_key),
  CONSTRAINT uq_engagement_ordinal UNIQUE (engagement_id, ordinal)
);

CREATE INDEX IF NOT EXISTS idx_engagement_stages_eng ON public.engagement_stages (engagement_id);
CREATE INDEX IF NOT EXISTS idx_engagement_stages_key ON public.engagement_stages (stage_key);

ALTER TABLE public.engagement_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_stages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS es_service_all ON public.engagement_stages;
CREATE POLICY es_service_all ON public.engagement_stages FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS es_anon_select ON public.engagement_stages;
CREATE POLICY es_anon_select ON public.engagement_stages FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS es_auth_all ON public.engagement_stages;
CREATE POLICY es_auth_all ON public.engagement_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.engagement_stages TO service_role;
GRANT SELECT ON public.engagement_stages TO anon;
GRANT SELECT, INSERT, UPDATE ON public.engagement_stages TO authenticated;


-- ── 3. engagement_stage_events ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.engagement_stage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  stage_key text NOT NULL,
  action text NOT NULL,
  from_status text,
  to_status text,
  actor_role text NOT NULL DEFAULT 'system',
  actor_id text,
  reason text,
  idempotency_key text UNIQUE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stage_events_eng ON public.engagement_stage_events (engagement_id);
CREATE INDEX IF NOT EXISTS idx_stage_events_key ON public.engagement_stage_events (stage_key);

ALTER TABLE public.engagement_stage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_stage_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ese_service_all ON public.engagement_stage_events;
CREATE POLICY ese_service_all ON public.engagement_stage_events FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ese_anon_select ON public.engagement_stage_events;
CREATE POLICY ese_anon_select ON public.engagement_stage_events FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS ese_auth_all ON public.engagement_stage_events;
CREATE POLICY ese_auth_all ON public.engagement_stage_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.engagement_stage_events TO service_role;
GRANT SELECT ON public.engagement_stage_events TO anon;
GRANT SELECT, INSERT ON public.engagement_stage_events TO authenticated;


-- ── 4. engagement_document_links ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.engagement_document_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  stage_key text NOT NULL,
  document_title text NOT NULL,
  master_id text,
  version_label text NOT NULL DEFAULT 'v1.0',
  file_url text NOT NULL,
  file_size_bytes bigint,
  sha256_hash text,
  is_client_visible boolean NOT NULL DEFAULT true,
  requires_signature boolean NOT NULL DEFAULT false,
  signature_status text DEFAULT 'none' CHECK (signature_status IN ('none', 'pending', 'signed', 'rejected')),
  signed_at timestamptz,
  signed_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_links_eng ON public.engagement_document_links (engagement_id);

ALTER TABLE public.engagement_document_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_document_links FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS edl_service_all ON public.engagement_document_links;
CREATE POLICY edl_service_all ON public.engagement_document_links FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS edl_anon_select ON public.engagement_document_links;
CREATE POLICY edl_anon_select ON public.engagement_document_links FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS edl_auth_all ON public.engagement_document_links;
CREATE POLICY edl_auth_all ON public.engagement_document_links FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.engagement_document_links TO service_role;
GRANT SELECT ON public.engagement_document_links TO anon;
GRANT SELECT, INSERT, UPDATE ON public.engagement_document_links TO authenticated;


-- ── 5. client_identity_change_requests ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_identity_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  target_field text NOT NULL CHECK (target_field IN (
    'company_name', 'registered_address', 'gstin', 'pan',
    'contact_name', 'contact_email', 'contact_phone', 'billing_address'
  )),
  current_value text,
  proposed_value text NOT NULL,
  change_reason text NOT NULL,
  requested_by text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_identity_requests_eng ON public.client_identity_change_requests (engagement_id);
CREATE INDEX IF NOT EXISTS idx_identity_requests_status ON public.client_identity_change_requests (status);

ALTER TABLE public.client_identity_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_identity_change_requests FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cicr_service_all ON public.client_identity_change_requests;
CREATE POLICY cicr_service_all ON public.client_identity_change_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS cicr_anon_insert ON public.client_identity_change_requests;
CREATE POLICY cicr_anon_insert ON public.client_identity_change_requests FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS cicr_anon_select ON public.client_identity_change_requests;
CREATE POLICY cicr_anon_select ON public.client_identity_change_requests FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS cicr_auth_all ON public.client_identity_change_requests;
CREATE POLICY cicr_auth_all ON public.client_identity_change_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_identity_change_requests TO service_role;
GRANT SELECT, INSERT ON public.client_identity_change_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.client_identity_change_requests TO authenticated;


-- ── 6. engagement_invites ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.engagement_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  recipient_email text NOT NULL,
  recipient_name text NOT NULL,
  scope text NOT NULL DEFAULT 'full_journey',
  expires_at timestamptz NOT NULL,
  max_uses int NOT NULL DEFAULT 100,
  use_count int NOT NULL DEFAULT 0,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invites_token ON public.engagement_invites (token_hash);

ALTER TABLE public.engagement_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_invites FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ei_service_all ON public.engagement_invites;
CREATE POLICY ei_service_all ON public.engagement_invites FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ei_anon_select ON public.engagement_invites;
CREATE POLICY ei_anon_select ON public.engagement_invites FOR SELECT TO anon USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.engagement_invites TO service_role;
GRANT SELECT ON public.engagement_invites TO anon;
GRANT SELECT, INSERT, UPDATE ON public.engagement_invites TO authenticated;


-- ── 7. Automatic Stage Initialization Function & Trigger ────────────────────
CREATE OR REPLACE FUNCTION public.init_engagement_stages()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert all 13 canonical stages in exact order with gate definitions
  INSERT INTO public.engagement_stages (
    engagement_id, stage_key, ordinal, title, summary, status,
    prerequisite_stage_key, prerequisite_description, document_master_ref, unlocked_at
  ) VALUES
    (
      NEW.id, 'checklist', 1, '50-Point Enterprise Checklist',
      'Select and verify project technical scope items from official 21-page enterprise master.',
      'available', NULL, NULL, 'LIT_50_Point_Enterprise_Deployment_Checklist.pdf', now()
    ),
    (
      NEW.id, 'discovery', 2, 'Discovery & Requirements Review',
      'Technical architecture questions, integration context, and scoping minutes.',
      'locked', 'checklist', 'Completion and submission of Stage 1 50-Point Enterprise Checklist.', NULL, NULL
    ),
    (
      NEW.id, 'proposal', 3, 'Proposal / Commercial Quotation',
      'Formal technical proposal, pricing breakdown, deliverables, and milestone schedule.',
      'locked', 'discovery', 'Approved technical discovery and scoping decisions by LIT Engineering Lead.', 'LIT-02-Proposal-Commercial-Quotation.pdf', NULL
    ),
    (
      NEW.id, 'acceptance', 4, 'Proposal Acceptance',
      'Client formal review and digital acceptance receipt of approved commercial proposal.',
      'locked', 'proposal', 'Official commercial proposal dispatched and approved by Founder.', NULL, NULL
    ),
    (
      NEW.id, 'sow', 5, 'SOW / Service Agreement',
      'Legally binding Statement of Work with IP protection, warranty, and change terms.',
      'locked', 'acceptance', 'Formal client acceptance receipt recorded for Proposal version.', 'LIT-01-SOW-Service-Agreement.pdf', NULL
    ),
    (
      NEW.id, 'initial-invoice', 6, 'Initial Payment Request & Verification',
      'Manual UPI payment request (50% deposit), dynamic amount-specific QR, and bank credit audit.',
      'locked', 'sow', 'Fully executed SOW / Service Agreement signed by both parties.', NULL, NULL
    ),
    (
      NEW.id, 'onboarding', 7, 'Onboarding Guide & Secure Intake',
      'Welcome orientation, credential-free technical access delegation, and kickoff intake.',
      'locked', 'initial-invoice', 'Manual Super Admin bank credit verification and receipt issuance for Initial Deposit.', 'LIT-03-Client-Onboarding-Guide.pdf', NULL
    ),
    (
      NEW.id, 'technical-spec', 8, 'Technical Specification',
      'Detailed systems architecture, API contracts, database schema, and hosting blueprint.',
      'locked', 'onboarding', 'Completed onboarding intake and environment review.', 'LIT-04-Technical-Specification.pdf', NULL
    ),
    (
      NEW.id, 'development', 9, 'Development & Milestones',
      'Live sprint milestones, staging preview builds, QA verification, and change requests.',
      'locked', 'technical-spec', 'Approved Technical Specification baseline.', 'LIT-06-Change-Request.pdf', NULL
    ),
    (
      NEW.id, 'delivery-acceptance', 10, 'Delivery & Acceptance Report',
      'Verification evidence, test results, performance audits, and formal client sign-off.',
      'locked', 'development', 'All sprint milestones and staging QA completed.', 'LIT-05-Delivery-Acceptance-Report.pdf', NULL
    ),
    (
      NEW.id, 'final-payment', 11, 'Final Payment Request & Settlement',
      'Final 50% delivery settlement via manual UPI QR, UTR submission, and Super Admin audit.',
      'locked', 'delivery-acceptance', 'Formal acceptance report signed by client authority.', NULL, NULL
    ),
    (
      NEW.id, 'handover', 12, 'Handover & IP / Access Transfer',
      'Source repository delegation, DNS/Cloud credentials handover, and runbooks.',
      'locked', 'final-payment', 'Final settlement verified by Super Admin with receiving bank credit.', NULL, NULL
    ),
    (
      NEW.id, 'support', 13, 'Maintenance / Support',
      'Post-launch SLA coverage, monitoring, priority ticketing, and scheduled upgrades.',
      'locked', 'handover', 'Completed handover manifest and credential acknowledgement.', 'LIT-07-Maintenance-Support-Agreement.pdf', NULL
    )
  ON CONFLICT (engagement_id, stage_key) DO NOTHING;

  -- Record initial event
  INSERT INTO public.engagement_stage_events (
    engagement_id, stage_key, action, from_status, to_status, actor_role, reason
  ) VALUES (
    NEW.id, 'checklist', 'INITIALIZE', NULL, 'available', 'system', 'Client engagement initiated with 13 lifecycle stages.'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_init_engagement_stages ON public.client_engagements;
CREATE TRIGGER trg_init_engagement_stages
  AFTER INSERT ON public.client_engagements
  FOR EACH ROW
  EXECUTE FUNCTION public.init_engagement_stages();


-- ── 8. Seed Default Sample Engagement for Immediate Testing ─────────────────
INSERT INTO public.client_engagements (
  engagement_ref, company_name, contact_name, contact_email, contact_phone,
  project_title, status, current_stage, notes
)
VALUES (
  'ENG-2026-LIT-SAMPLE',
  'Apex Meridian Technologies Pvt Ltd',
  'Dr. Rajesh Krishnan',
  'rajesh.krishnan@apexmeridian.com',
  '+91 98401 23456',
  'Enterprise Multi-Tenant AI Platform & HIPAA Hospital Infrastructure',
  'active',
  'checklist',
  'Canonical enterprise demonstration engagement for Logic Intelligence Technologies.'
)
ON CONFLICT (engagement_ref) DO NOTHING;

-- Populate canonical documents for the sample engagement
INSERT INTO public.engagement_document_links (
  engagement_id, stage_key, document_title, master_id, version_label, file_url, requires_signature, signature_status
)
SELECT
  e.id,
  'checklist',
  'Official 50-Point Enterprise Deployment Checklist',
  'LIT-00',
  'v2.4',
  '/assets/docs/LIT_50_Point_Enterprise_Deployment_Checklist.pdf',
  false,
  'none'
FROM public.client_engagements e
WHERE e.engagement_ref = 'ENG-2026-LIT-SAMPLE'
ON CONFLICT DO NOTHING;

INSERT INTO public.engagement_document_links (
  engagement_id, stage_key, document_title, master_id, version_label, file_url, requires_signature, signature_status
)
SELECT
  e.id,
  'sow',
  'Statement of Work & Master Service Agreement',
  'LIT-01',
  'v1.0',
  '/assets/docs/masters/LIT-01-SOW-Service-Agreement.pdf',
  true,
  'pending'
FROM public.client_engagements e
WHERE e.engagement_ref = 'ENG-2026-LIT-SAMPLE'
ON CONFLICT DO NOTHING;

INSERT INTO public.engagement_document_links (
  engagement_id, stage_key, document_title, master_id, version_label, file_url, requires_signature, signature_status
)
SELECT
  e.id,
  'onboarding',
  'Client Technical Onboarding & Systems Guide',
  'LIT-03',
  'v1.0',
  '/assets/docs/masters/LIT-03-Client-Onboarding-Guide.pdf',
  false,
  'none'
FROM public.client_engagements e
WHERE e.engagement_ref = 'ENG-2026-LIT-SAMPLE'
ON CONFLICT DO NOTHING;

INSERT INTO public.engagement_document_links (
  engagement_id, stage_key, document_title, master_id, version_label, file_url, requires_signature, signature_status
)
SELECT
  e.id,
  'technical-spec',
  'Production Technical & Architectural Specification',
  'LIT-04',
  'v1.0',
  '/assets/docs/masters/LIT-04-Technical-Specification.pdf',
  false,
  'none'
FROM public.client_engagements e
WHERE e.engagement_ref = 'ENG-2026-LIT-SAMPLE'
ON CONFLICT DO NOTHING;

INSERT INTO public.engagement_document_links (
  engagement_id, stage_key, document_title, master_id, version_label, file_url, requires_signature, signature_status
)
SELECT
  e.id,
  'support',
  'Enterprise Maintenance & SLA Agreement',
  'LIT-07',
  'v1.0',
  '/assets/docs/masters/LIT-07-Maintenance-Support-Agreement.pdf',
  true,
  'none'
FROM public.client_engagements e
WHERE e.engagement_ref = 'ENG-2026-LIT-SAMPLE'
ON CONFLICT DO NOTHING;

COMMIT;
