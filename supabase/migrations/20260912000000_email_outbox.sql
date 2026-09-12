-- Production email outbox, attempts, and suppression.
-- Apply in the Supabase SQL editor if the CLI cannot reach the project.

CREATE TABLE IF NOT EXISTS public.email_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  template_key text,
  category text NOT NULL DEFAULT 'transactional',
  recipient text NOT NULL,
  sender text NOT NULL,
  reply_to text,
  subject text NOT NULL,
  html text,
  text text,
  idempotency_key text NOT NULL,
  correlation_id text,
  provider text NOT NULL DEFAULT 'zoho-smtp',
  provider_message_id text,
  status text NOT NULL DEFAULT 'pending',
  attempt_count integer NOT NULL DEFAULT 0,
  last_error text,
  last_error_category text,
  fallback_used boolean NOT NULL DEFAULT false,
  next_attempt_at timestamptz DEFAULT now(),
  queued_at timestamptz DEFAULT now() NOT NULL,
  sent_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT email_outbox_idempotency_key_unique UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS email_outbox_status_next_attempt_idx
  ON public.email_outbox (status, next_attempt_at);

CREATE INDEX IF NOT EXISTS email_outbox_recipient_idx
  ON public.email_outbox (recipient);

CREATE TABLE IF NOT EXISTS public.email_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_event_id uuid REFERENCES public.email_outbox(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL,
  provider text NOT NULL DEFAULT 'zoho-smtp',
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  status text NOT NULL,
  provider_message_id text,
  error_code text,
  error_message text
);

CREATE INDEX IF NOT EXISTS email_attempts_event_idx
  ON public.email_attempts (email_event_id);

CREATE TABLE IF NOT EXISTS public.email_suppressions (
  email text PRIMARY KEY,
  reason text NOT NULL,
  source text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS subscribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_source text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role email_outbox" ON public.email_outbox;
CREATE POLICY "service role email_outbox"
  ON public.email_outbox FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service role email_attempts" ON public.email_attempts;
CREATE POLICY "service role email_attempts"
  ON public.email_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service role email_suppressions" ON public.email_suppressions;
CREATE POLICY "service role email_suppressions"
  ON public.email_suppressions FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin read email_outbox" ON public.email_outbox;
CREATE POLICY "admin read email_outbox"
  ON public.email_outbox FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE public.email_outbox IS 'Durable email delivery records. Do not store secrets or auth tokens.';
