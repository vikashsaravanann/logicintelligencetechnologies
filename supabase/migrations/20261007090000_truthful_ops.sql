-- Command Center Batch 2: truthful operations.
-- Adds the columns the admin tools actually need, normalises status values,
-- and gives proposals an idempotent approve + a view-tracking function so the
-- public flow stops lying about state. Additive and idempotent; applied to
-- prod via Supabase SQL after the Batch 0 pre-checks.
BEGIN;

-- ── invoices ────────────────────────────────────────────────────────────────
-- Live schema has no client_email/description/currency/paid_at/updated_at.
-- 0 rows present, default status 'Pending'.
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_email text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS description  text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS currency     text NOT NULL DEFAULT 'INR';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS paid_at      timestamptz;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS updated_at   timestamptz NOT NULL DEFAULT now();

-- Normalise any legacy casing before constraining (no stray rows today, but a
-- lowercase write from old code would otherwise fail VALIDATE).
UPDATE public.invoices SET status = initcap(status)
  WHERE status IS NOT NULL AND status <> initcap(status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'invoices_status_check' AND conrelid = 'public.invoices'::regclass
  ) THEN
    ALTER TABLE public.invoices
      ADD CONSTRAINT invoices_status_check
      CHECK (status IN ('Pending','Paid','Overdue','Cancelled'))
      NOT VALID;
    ALTER TABLE public.invoices VALIDATE CONSTRAINT invoices_status_check;
  END IF;
END $$;

DROP TRIGGER IF EXISTS invoices_set_updated_at ON public.invoices;
CREATE TRIGGER invoices_set_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- ── proposals ────────────────────────────────────────────────────────────────
-- Already has client_email, currency, status (default 'Draft'), approved_at,
-- updated_at. Add the reference + send/view/accept provenance columns.
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS reference            text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS sent_at              timestamptz;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS sent_count           integer NOT NULL DEFAULT 0;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS viewed_at            timestamptz;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS signer_name          text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS accepted_ip_hash     text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS accepted_user_agent  text;

-- reference is server-generated (LIT-PROP-YYYY-NNNN) and must be unique when set.
-- Partial unique index allows the existing rows (NULL reference) to coexist.
CREATE UNIQUE INDEX IF NOT EXISTS proposals_reference_key
  ON public.proposals (reference) WHERE reference IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'proposals_status_check' AND conrelid = 'public.proposals'::regclass
  ) THEN
    ALTER TABLE public.proposals
      ADD CONSTRAINT proposals_status_check
      CHECK (status IN ('Draft','Sent','Viewed','Approved','Expired','Declined'))
      NOT VALID;
    ALTER TABLE public.proposals VALIDATE CONSTRAINT proposals_status_check;
  END IF;
END $$;

-- ── approve_proposal: idempotent, no project creation ────────────────────────
-- Accepts a proposal exactly once. Only a Sent/Viewed proposal that has not
-- expired can move to Approved; a second call returns already_approved without
-- overwriting the recorded provenance. Does NOT create a project (that is an
-- explicit admin "Start contract" step in Batch 3). Called server-side with the
-- service-role key from the public accept route.
CREATE OR REPLACE FUNCTION public.approve_proposal(
  p_token text,
  p_signer_name text,
  p_ip_hash text,
  p_user_agent text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $fn$
DECLARE
  rec public.proposals%ROWTYPE;
BEGIN
  SELECT * INTO rec FROM public.proposals WHERE secure_token = p_token;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  IF rec.status = 'Approved' THEN
    RETURN jsonb_build_object('ok', true, 'reason', 'already_approved',
      'status', rec.status, 'reference', rec.reference);
  END IF;

  IF rec.expires_at IS NOT NULL AND rec.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'expired');
  END IF;

  IF rec.status NOT IN ('Sent','Viewed') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_acceptable',
      'status', rec.status);
  END IF;

  UPDATE public.proposals
     SET status = 'Approved',
         approved_at = now(),
         signer_name = NULLIF(btrim(p_signer_name), ''),
         accepted_ip_hash = p_ip_hash,
         accepted_user_agent = left(COALESCE(p_user_agent, ''), 300)
   WHERE id = rec.id AND status IN ('Sent','Viewed')
  RETURNING * INTO rec;

  IF NOT FOUND THEN
    -- Lost a race to another concurrent approve; report the settled state.
    SELECT * INTO rec FROM public.proposals WHERE id = rec.id;
    RETURN jsonb_build_object('ok', true, 'reason', 'already_approved',
      'status', rec.status, 'reference', rec.reference);
  END IF;

  RETURN jsonb_build_object('ok', true, 'reason', 'approved',
    'status', rec.status, 'reference', rec.reference);
END $fn$;

-- ── record_proposal_view: first-view tracking, GET-safe ──────────────────────
-- Stamps viewed_at once and promotes Sent -> Viewed. Never touches an Approved/
-- Expired/Declined/Draft proposal. Returns whether a change was made.
CREATE OR REPLACE FUNCTION public.record_proposal_view(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $fn$
DECLARE
  n integer := 0;
BEGIN
  UPDATE public.proposals
     SET viewed_at = COALESCE(viewed_at, now()),
         status = CASE WHEN status = 'Sent' THEN 'Viewed' ELSE status END
   WHERE secure_token = p_token
     AND status IN ('Sent','Viewed')
     AND (viewed_at IS NULL OR status = 'Sent');
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN jsonb_build_object('ok', true, 'changed', n > 0);
END $fn$;

REVOKE ALL ON FUNCTION public.approve_proposal(text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_proposal(text, text, text, text) TO service_role;
REVOKE ALL ON FUNCTION public.record_proposal_view(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_proposal_view(text) TO service_role;

COMMIT;
