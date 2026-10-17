-- =============================================================================
-- Migration: 20261017030000_staff_collaboration_and_wallet.sql
-- Purpose:
--   1. Staff Profile Details & 4:5 Portrait Metadata (staff_profile_details)
--   2. Private Staff Document Wallet with 50 MB boundary (staff_document_wallet)
--   3. Project-scoped Staff Collaboration Invitations (project_staff_invitations)
--   4. Extend staff_client_assignments for Project Team Roles & Lead delegation
--   5. Deterministic Client-to-Staff Routing & Triage Queue (project_triage_queue)
--   6. Storage Buckets (staff-wallet, staff-avatars) and Strict RLS Isolation
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Staff Profile Details (Personal & Professional Extensions)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_profile_details (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  avatar_url TEXT,
  portrait_url TEXT, -- 4:5 aspect ratio staff portrait photograph
  bio TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  work_location TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "in_app": true, "digest": "realtime"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_profile_details_user_id ON public.staff_profile_details(user_id);

ALTER TABLE public.staff_profile_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profile_details FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.staff_profile_details TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.staff_profile_details TO authenticated;

DROP POLICY IF EXISTS spd_service_all ON public.staff_profile_details;
CREATE POLICY spd_service_all ON public.staff_profile_details
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS spd_auth_select ON public.staff_profile_details;
CREATE POLICY spd_auth_select ON public.staff_profile_details
  FOR SELECT TO authenticated
  USING (
    -- Any authenticated staff member or super admin can see staff profile details
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('super_admin', 'admin', 'operations', 'support', 'developer', 'viewer')
    )
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS spd_auth_update ON public.staff_profile_details;
CREATE POLICY spd_auth_update ON public.staff_profile_details
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS spd_auth_insert ON public.staff_profile_details;
CREATE POLICY spd_auth_insert ON public.staff_profile_details
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- -----------------------------------------------------------------------------
-- 2. Staff Document Wallet (Private, Isolated, 50 MB max per file)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_document_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 52428800), -- 50 MB strict limit
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'other' CHECK (
    category IN ('identity', 'educational', 'certification', 'employment', 'tax_compliance', 'project_note', 'other')
  ),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_wallet_owner ON public.staff_document_wallet(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_wallet_created_at ON public.staff_document_wallet(created_at DESC);

ALTER TABLE public.staff_document_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_document_wallet FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.staff_document_wallet TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_document_wallet TO authenticated;

DROP POLICY IF EXISTS sdw_service_all ON public.staff_document_wallet;
CREATE POLICY sdw_service_all ON public.staff_document_wallet
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Owner and Super Admin can select; other staff CANNOT see documents of another employee
DROP POLICY IF EXISTS sdw_auth_select ON public.staff_document_wallet;
CREATE POLICY sdw_auth_select ON public.staff_document_wallet
  FOR SELECT TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS sdw_auth_insert ON public.staff_document_wallet;
CREATE POLICY sdw_auth_insert ON public.staff_document_wallet
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS sdw_auth_update ON public.staff_document_wallet;
CREATE POLICY sdw_auth_update ON public.staff_document_wallet
  FOR UPDATE TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS sdw_auth_delete ON public.staff_document_wallet;
CREATE POLICY sdw_auth_delete ON public.staff_document_wallet
  FOR DELETE TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- -----------------------------------------------------------------------------
-- 3. Project-Scoped Staff Invitations (Cryptographic tokens, project collaboration)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.project_staff_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  inviter_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  requested_role TEXT NOT NULL CHECK (
    requested_role IN ('primary_lead', 'collaborator', 'support_owner', 'technical_specialist', 'technical_support', 'project_coordinator', 'delivery_engineer')
  ),
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'declined', 'revoked', 'expired')
  ),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  revoked_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  revoked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_staff_invitations_engagement ON public.project_staff_invitations(engagement_id);
CREATE INDEX IF NOT EXISTS idx_project_staff_invitations_email ON public.project_staff_invitations(recipient_email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_staff_invitations_token_hash ON public.project_staff_invitations(token_hash);

ALTER TABLE public.project_staff_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_staff_invitations FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.project_staff_invitations TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.project_staff_invitations TO authenticated;

DROP POLICY IF EXISTS psi_service_all ON public.project_staff_invitations;
CREATE POLICY psi_service_all ON public.project_staff_invitations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS psi_auth_select ON public.project_staff_invitations;
CREATE POLICY psi_auth_select ON public.project_staff_invitations
  FOR SELECT TO authenticated
  USING (
    inviter_user_id = auth.uid()
    OR accepted_by_user_id = auth.uid()
    OR recipient_email = (auth.jwt() ->> 'email')
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
    OR EXISTS (
      SELECT 1 FROM public.staff_client_assignments sca
      WHERE sca.engagement_id = project_staff_invitations.engagement_id
        AND sca.staff_user_id = auth.uid()
        AND sca.status = 'active'
    )
  );

-- -----------------------------------------------------------------------------
-- 4. Extend staff_client_assignments for Project Team Roles & Delegation
-- -----------------------------------------------------------------------------

ALTER TABLE public.staff_client_assignments
  ADD COLUMN IF NOT EXISTS is_primary_lead BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_invite_collaborators BOOLEAN NOT NULL DEFAULT false;

-- Allow broader project collaboration roles in check constraint if needed
ALTER TABLE public.staff_client_assignments
  DROP CONSTRAINT IF EXISTS staff_client_assignments_assignment_role_check;

ALTER TABLE public.staff_client_assignments
  ADD CONSTRAINT staff_client_assignments_assignment_role_check CHECK (
    assignment_role IN (
      'technical_support',
      'project_coordinator',
      'operations_prep',
      'delivery_engineer',
      'primary_lead',
      'collaborator',
      'support_owner',
      'technical_specialist'
    )
  );

-- -----------------------------------------------------------------------------
-- 5. Client-to-Staff Routing & Triage Queue
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.project_triage_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (
    request_type IN ('message', 'change_request', 'meeting', 'support_ticket', 'document_review')
  ),
  source_id TEXT NOT NULL,
  client_email TEXT NOT NULL,
  summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_assignment' CHECK (
    status IN ('pending_assignment', 'assigned', 'dismissed')
  ),
  assigned_to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_triage_engagement ON public.project_triage_queue(engagement_id);
CREATE INDEX IF NOT EXISTS idx_project_triage_status ON public.project_triage_queue(status);
CREATE INDEX IF NOT EXISTS idx_project_triage_created_at ON public.project_triage_queue(created_at DESC);

ALTER TABLE public.project_triage_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_triage_queue FORCE ROW LEVEL SECURITY;

GRANT ALL ON public.project_triage_queue TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.project_triage_queue TO authenticated;

DROP POLICY IF EXISTS ptq_service_all ON public.project_triage_queue;
CREATE POLICY ptq_service_all ON public.project_triage_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ptq_auth_select ON public.project_triage_queue;
CREATE POLICY ptq_auth_select ON public.project_triage_queue
  FOR SELECT TO authenticated
  USING (
    assigned_to_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'admin', 'operations')
    )
  );

-- -----------------------------------------------------------------------------
-- 6. Storage Buckets (staff-wallet, staff-avatars)
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'staff-wallet',
  'staff-wallet',
  false,
  52428800, -- 50 MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/png',
    'image/jpeg',
    'image/webp',
    'text/plain'
  ];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'staff-avatars',
  'staff-avatars',
  true,
  10485760, -- 10 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Storage object policies for staff-wallet:
-- Users can only access objects prefixed by their own user ID: <uid>/<filename>
DROP POLICY IF EXISTS "Staff wallet owner select" ON storage.objects;
CREATE POLICY "Staff wallet owner select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'staff-wallet'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      )
    )
  );

DROP POLICY IF EXISTS "Staff wallet owner insert" ON storage.objects;
CREATE POLICY "Staff wallet owner insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'staff-wallet'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      )
    )
  );

DROP POLICY IF EXISTS "Staff wallet owner delete" ON storage.objects;
CREATE POLICY "Staff wallet owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'staff-wallet'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      )
    )
  );

-- Storage object policies for staff-avatars:
DROP POLICY IF EXISTS "Staff avatar public select" ON storage.objects;
CREATE POLICY "Staff avatar public select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'staff-avatars');

DROP POLICY IF EXISTS "Staff avatar user insert" ON storage.objects;
CREATE POLICY "Staff avatar user insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'staff-avatars'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'super_admin'
      )
    )
  );

COMMIT;
