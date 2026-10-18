-- Atomic staff–engagement assignment (respect unique staff_user_id + engagement_id)
-- History via append-only events; reactivation updates the same row.

CREATE TABLE IF NOT EXISTS public.staff_assignment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES public.staff_client_assignments(id) ON DELETE SET NULL,
  staff_user_id uuid NOT NULL,
  engagement_id uuid,
  client_id uuid,
  event_type text NOT NULL,
  actor_user_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_assignment_events_staff
  ON public.staff_assignment_events (staff_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_assignment_events_engagement
  ON public.staff_assignment_events (engagement_id, created_at DESC);

ALTER TABLE public.staff_assignment_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.staff_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id uuid NOT NULL,
  engagement_id uuid,
  event_type text NOT NULL,
  title text NOT NULL,
  summary text,
  source_id text,
  action_url text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_staff_notifications_idempotency
  ON public.staff_notifications (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_staff_notifications_recipient
  ON public.staff_notifications (recipient_user_id, created_at DESC);

ALTER TABLE public.staff_notifications ENABLE ROW LEVEL SECURITY;

-- Staff can read own notifications
DROP POLICY IF EXISTS staff_notifications_select_own ON public.staff_notifications;
CREATE POLICY staff_notifications_select_own
  ON public.staff_notifications
  FOR SELECT
  TO authenticated
  USING (recipient_user_id = auth.uid());

DROP POLICY IF EXISTS staff_notifications_update_own ON public.staff_notifications;
CREATE POLICY staff_notifications_update_own
  ON public.staff_notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_user_id = auth.uid())
  WITH CHECK (recipient_user_id = auth.uid());

-- Service role bypasses RLS for inserts from server

CREATE OR REPLACE FUNCTION public.staff_upsert_project_assignment(
  p_staff_user_id uuid,
  p_engagement_id uuid,
  p_client_id uuid DEFAULT NULL,
  p_assignment_role text DEFAULT 'delivery_engineer',
  p_can_view_technical_stages boolean DEFAULT true,
  p_can_prepare_technical_quotation boolean DEFAULT false,
  p_can_prepare_invoice_request boolean DEFAULT false,
  p_can_invite_collaborators boolean DEFAULT false,
  p_assignment_reason text DEFAULT 'Assigned by Super Admin',
  p_expires_at timestamptz DEFAULT NULL,
  p_actor_user_id uuid DEFAULT NULL
)
RETURNS public.staff_client_assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_eng record;
  v_row public.staff_client_assignments;
  v_now timestamptz := now();
BEGIN
  IF p_staff_user_id IS NULL OR p_engagement_id IS NULL THEN
    RAISE EXCEPTION 'staff_user_id and engagement_id are required';
  END IF;

  IF length(trim(coalesce(p_assignment_reason, ''))) < 5 THEN
    RAISE EXCEPTION 'assignment_reason must be at least 5 characters';
  END IF;

  -- Reject known demo engagement
  IF p_engagement_id = '8acad856-9840-4646-b42d-f8bf12ea47f8'::uuid THEN
    RAISE EXCEPTION 'Demonstration engagement cannot be assigned';
  END IF;

  SELECT id, client_id, company_name, project_title
    INTO v_eng
  FROM public.client_engagements
  WHERE id = p_engagement_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Engagement does not exist';
  END IF;

  IF p_client_id IS NULL THEN
    p_client_id := v_eng.client_id;
  END IF;

  -- Upsert by unique (staff_user_id, engagement_id)
  SELECT * INTO v_row
  FROM public.staff_client_assignments
  WHERE staff_user_id = p_staff_user_id
    AND engagement_id = p_engagement_id
  FOR UPDATE;

  IF FOUND THEN
    UPDATE public.staff_client_assignments SET
      client_id = COALESCE(p_client_id, client_id),
      assignment_role = p_assignment_role,
      status = 'active',
      can_view_technical_stages = p_can_view_technical_stages,
      can_prepare_technical_quotation = p_can_prepare_technical_quotation,
      can_prepare_invoice_request = p_can_prepare_invoice_request,
      can_invite_collaborators = p_can_invite_collaborators,
      assigned_by = COALESCE(p_actor_user_id, assigned_by),
      assignment_reason = p_assignment_reason,
      starts_at = CASE WHEN status <> 'active' THEN v_now ELSE starts_at END,
      expires_at = p_expires_at,
      revoked_at = NULL,
      revoked_by = NULL,
      updated_at = v_now
    WHERE id = v_row.id
    RETURNING * INTO v_row;
  ELSE
    INSERT INTO public.staff_client_assignments (
      staff_user_id, client_id, engagement_id, assignment_role, status,
      can_view_technical_stages, can_prepare_technical_quotation, can_prepare_invoice_request,
      can_invite_collaborators, assigned_by, assignment_reason, starts_at, expires_at
    ) VALUES (
      p_staff_user_id, p_client_id, p_engagement_id, p_assignment_role, 'active',
      p_can_view_technical_stages, p_can_prepare_technical_quotation, p_can_prepare_invoice_request,
      p_can_invite_collaborators, p_actor_user_id, p_assignment_reason, v_now, p_expires_at
    )
    RETURNING * INTO v_row;
  END IF;

  INSERT INTO public.staff_assignment_events (
    assignment_id, staff_user_id, engagement_id, client_id, event_type, actor_user_id, payload
  ) VALUES (
    v_row.id, p_staff_user_id, p_engagement_id, p_client_id, 'assignment.upserted', p_actor_user_id,
    jsonb_build_object(
      'role', p_assignment_role,
      'reason', p_assignment_reason,
      'can_prepare_technical_quotation', p_can_prepare_technical_quotation,
      'can_prepare_invoice_request', p_can_prepare_invoice_request
    )
  );

  INSERT INTO public.staff_notifications (
    recipient_user_id, engagement_id, event_type, title, summary, source_id, action_url, idempotency_key
  ) VALUES (
    p_staff_user_id,
    p_engagement_id,
    'project.assigned',
    'Project assignment updated',
    coalesce(v_eng.project_title, v_eng.company_name, 'Assigned project'),
    v_row.id::text,
    '/staff/projects/' || p_engagement_id::text,
    'assignment:' || v_row.id::text || ':' || extract(epoch from v_now)::bigint::text
  )
  ON CONFLICT DO NOTHING;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.staff_upsert_project_assignment FROM PUBLIC;
REVOKE ALL ON FUNCTION public.staff_upsert_project_assignment FROM anon;
REVOKE ALL ON FUNCTION public.staff_upsert_project_assignment FROM authenticated;
-- Invoked only via service role from Next.js server
GRANT EXECUTE ON FUNCTION public.staff_upsert_project_assignment TO service_role;
