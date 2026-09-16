-- Outreach pipeline: campaigns, sequence steps, enrollments, activity events.

ALTER TABLE public.contact_leads
  ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'NEW',
  ADD COLUMN IF NOT EXISTS communication_status text DEFAULT 'NEVER_CONTACTED',
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_replied_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_follow_up_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS owner_email text;

CREATE INDEX IF NOT EXISTS contact_leads_lifecycle_stage_idx
  ON public.contact_leads (lifecycle_stage);
CREATE INDEX IF NOT EXISTS contact_leads_email_normalized_idx
  ON public.contact_leads (lower(email));

CREATE TABLE IF NOT EXISTS public.outreach_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','READY','ACTIVE','PAUSED','COMPLETED','ARCHIVED')),
  created_by text,
  approved_by text,
  approved_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  audience_filter jsonb DEFAULT '{}'::jsonb,
  dry_run boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.outreach_sequence_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.outreach_campaigns(id) ON DELETE CASCADE,
  step_order integer NOT NULL DEFAULT 0,
  delay_days integer NOT NULL DEFAULT 0,
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text,
  template_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, step_order)
);

CREATE TABLE IF NOT EXISTS public.outreach_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.outreach_campaigns(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.contact_leads(id) ON DELETE SET NULL,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','PAUSED','COMPLETED','STOPPED','SKIPPED')),
  stop_reason text,
  current_step integer NOT NULL DEFAULT 0,
  next_send_at timestamptz,
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email)
);

CREATE INDEX IF NOT EXISTS outreach_enrollments_due_idx
  ON public.outreach_enrollments (status, next_send_at)
  WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS public.lead_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.contact_leads(id) ON DELETE SET NULL,
  email text,
  event_type text NOT NULL,
  campaign_id uuid REFERENCES public.outreach_campaigns(id) ON DELETE SET NULL,
  enrollment_id uuid REFERENCES public.outreach_enrollments(id) ON DELETE SET NULL,
  actor text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_activity_events_lead_idx
  ON public.lead_activity_events (lead_id, created_at DESC);

ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_outreach_campaigns"
  ON public.outreach_campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_outreach_steps"
  ON public.outreach_sequence_steps FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_outreach_enrollments"
  ON public.outreach_enrollments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_lead_activity"
  ON public.lead_activity_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "company_read_outreach_campaigns"
  ON public.outreach_campaigns FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') ILIKE '%@logicintelligencetechnologies.in');
CREATE POLICY "company_read_outreach_enrollments"
  ON public.outreach_enrollments FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') ILIKE '%@logicintelligencetechnologies.in');
CREATE POLICY "company_read_lead_activity"
  ON public.lead_activity_events FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') ILIKE '%@logicintelligencetechnologies.in');
