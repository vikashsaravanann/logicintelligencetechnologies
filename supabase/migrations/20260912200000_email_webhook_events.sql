-- Email webhook events: provider-level deduplication and replay protection.
-- Every inbound webhook from any email provider (Stripe, Zoho, future) gets stored
-- before processing. The unique constraint on (provider, provider_event_id) ensures
-- that a replayed webhook cannot trigger a duplicate delivery action.

CREATE TABLE IF NOT EXISTS public.email_webhook_events (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider           text        NOT NULL,                       -- 'stripe', 'zoho', etc.
  provider_event_id  text        NOT NULL,                       -- e.g. Stripe evt_xxx
  event_type         text        NOT NULL,                       -- e.g. 'checkout.session.completed'
  payload_hash       text,                                       -- SHA-256 of raw body (hex)
  received_at        timestamptz NOT NULL DEFAULT now(),
  processed_at       timestamptz,
  status             text        NOT NULL DEFAULT 'received',    -- received | processed | failed | ignored
  error              text,
  CONSTRAINT email_webhook_events_provider_event_unique
    UNIQUE (provider, provider_event_id)
);

CREATE INDEX IF NOT EXISTS email_webhook_events_provider_status_idx
  ON public.email_webhook_events (provider, status);

CREATE INDEX IF NOT EXISTS email_webhook_events_received_at_idx
  ON public.email_webhook_events (received_at DESC);

-- Only the service role may read/write webhook events.
ALTER TABLE public.email_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role email_webhook_events" ON public.email_webhook_events;
CREATE POLICY "service role email_webhook_events"
  ON public.email_webhook_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Admin users may read (not write) webhook events for diagnostics.
DROP POLICY IF EXISTS "admin read email_webhook_events" ON public.email_webhook_events;
CREATE POLICY "admin read email_webhook_events"
  ON public.email_webhook_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE public.email_webhook_events IS
  'Idempotent store of inbound provider webhook events. '
  'Insert before processing; unique constraint prevents replay attacks.';
