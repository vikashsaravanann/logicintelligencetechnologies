-- Newsletter double opt-in upgrade.
-- Adds consent tracking, double opt-in state machine, and policy versioning
-- to the newsletter_subscribers table.

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS double_opt_in_status text    NOT NULL DEFAULT 'confirmed',
  ADD COLUMN IF NOT EXISTS confirmed_at         timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_token   text,
  ADD COLUMN IF NOT EXISTS token_expires_at     timestamptz,
  ADD COLUMN IF NOT EXISTS consent_page         text,
  ADD COLUMN IF NOT EXISTS policy_version       text    NOT NULL DEFAULT '2026-09',
  ADD COLUMN IF NOT EXISTS ip_address           text,
  ADD COLUMN IF NOT EXISTS updated_at           timestamptz DEFAULT now() NOT NULL;

-- Existing rows are grandfathered as confirmed (opt-in already performed).
-- New subscribers start as 'pending' until they click the confirmation link.
UPDATE public.newsletter_subscribers
  SET double_opt_in_status = 'confirmed',
      confirmed_at          = COALESCE(subscribed_at, created_at)
  WHERE double_opt_in_status = 'confirmed'
    AND confirmed_at IS NULL;

-- Partial index: quickly find pending subscribers for expiry cleanup.
CREATE INDEX IF NOT EXISTS newsletter_subscribers_pending_idx
  ON public.newsletter_subscribers (double_opt_in_status, token_expires_at)
  WHERE double_opt_in_status = 'pending';

-- Partial index: unique non-null confirmation token.
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_token_unique
  ON public.newsletter_subscribers (confirmation_token)
  WHERE confirmation_token IS NOT NULL;

COMMENT ON COLUMN public.newsletter_subscribers.double_opt_in_status IS
  'pending | confirmed | expired. Only confirmed rows receive marketing sends.';
COMMENT ON COLUMN public.newsletter_subscribers.confirmation_token IS
  'HMAC-SHA256 signed token used in the confirmation link. Cleared after use.';
