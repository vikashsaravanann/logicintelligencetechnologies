-- Milestone 4: Email Outbox Attachments & Truthful Delivery Schema Alignment (MAIL01-MAIL04, PDF02)

ALTER TABLE public.email_outbox
  ADD COLUMN IF NOT EXISTS attachment_refs jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS template_data jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS email_outbox_status_next_attempt_queued_idx
  ON public.email_outbox (status, next_attempt_at)
  WHERE status IN ('pending', 'queued', 'retrying');

ALTER TABLE public.financial_documents
  ALTER COLUMN payment_request_id DROP NOT NULL;

COMMENT ON COLUMN public.email_outbox.attachment_refs IS 'Array of immutable attachment descriptors [{storageBucket, storagePath, expectedSha256, filename}]';
COMMENT ON COLUMN public.email_outbox.template_data IS 'Structured JSON payload used for template rendering and retry audit';
