-- Email admin audit log: records every admin-triggered send action.
-- Allows forensic inspection of who triggered what email, when, and with what outcome.

CREATE TABLE IF NOT EXISTS public.email_admin_audit (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by  text        NOT NULL,   -- 'session:{email}' or 'cron'
  email_type    text        NOT NULL,   -- e.g. 'invoice', 'kickoff'
  recipient     text        NOT NULL,   -- masked in app layer; stored plain for admin query
  outbox_id     uuid        REFERENCES public.email_outbox(id) ON DELETE SET NULL,
  status        text        NOT NULL,   -- 'sent' | 'failed' | 'dry_run'
  error_message text,
  ip_address    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_admin_audit_triggered_by_idx
  ON public.email_admin_audit (triggered_by);

CREATE INDEX IF NOT EXISTS email_admin_audit_created_at_idx
  ON public.email_admin_audit (created_at DESC);

ALTER TABLE public.email_admin_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role email_admin_audit" ON public.email_admin_audit;
CREATE POLICY "service role email_admin_audit"
  ON public.email_admin_audit FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin read email_admin_audit" ON public.email_admin_audit;
CREATE POLICY "admin read email_admin_audit"
  ON public.email_admin_audit FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE public.email_admin_audit IS
  'Immutable audit trail of admin-triggered email sends. Never delete rows.';
