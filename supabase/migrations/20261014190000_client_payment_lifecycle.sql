-- Command Center / Client Lifecycle Batch 5: client payment requests, billing submissions, and manual UPI reconciliation.
-- Additive and idempotent; new tables have service_role-only RLS matching Command Center hardening practice.

BEGIN;

-- ── 1. payment_beneficiary_profiles ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_beneficiary_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_label text NOT NULL DEFAULT 'Founder Primary VPA',
  upi_vpa text NOT NULL,
  upi_registered_name text NOT NULL,
  display_brand text NOT NULL DEFAULT 'Logic Intelligence Technologies',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_beneficiary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_beneficiary_profiles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pbp_service ON public.payment_beneficiary_profiles;
CREATE POLICY pbp_service ON public.payment_beneficiary_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.payment_beneficiary_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payment_beneficiary_profiles TO service_role;

-- Seed default founder VPA if empty
INSERT INTO public.payment_beneficiary_profiles (profile_label, upi_vpa, upi_registered_name, display_brand, is_active)
SELECT 'Founder Primary VPA', '9342877474@ptyes', 'S VIKASH', 'Logic Intelligence Technologies', true
WHERE NOT EXISTS (SELECT 1 FROM public.payment_beneficiary_profiles WHERE upi_vpa = '9342877474@ptyes');


-- ── 2. client_payment_requests ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  contract_id uuid REFERENCES public.client_contracts(id) ON DELETE SET NULL,
  stage int NOT NULL CHECK (stage IN (6, 11)),
  stage_name text NOT NULL,
  milestone_title text NOT NULL,
  milestone_percentage numeric(5, 2) NOT NULL DEFAULT 50.00,
  subtotal_paise bigint NOT NULL,
  gst_rate numeric(5, 4) NOT NULL DEFAULT 0.1800,
  gst_amount_paise bigint NOT NULL,
  total_payable_paise bigint NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  unique_reference text NOT NULL UNIQUE,
  secure_token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'awaiting_billing'
    CHECK (status IN ('awaiting_billing', 'ready_to_pay', 'payment_reported', 'under_review', 'approved', 'rejected', 'cancelled', 'prerequisite_required')),
  notes text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cpr_proposal_stage_idx ON public.client_payment_requests (proposal_id, stage);
CREATE INDEX IF NOT EXISTS cpr_token_hash_idx ON public.client_payment_requests (secure_token_hash);

ALTER TABLE public.client_payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_payment_requests FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cpr_service ON public.client_payment_requests;
CREATE POLICY cpr_service ON public.client_payment_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.client_payment_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.client_payment_requests TO service_role;


-- ── 3. payment_billing_submissions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_billing_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id uuid NOT NULL REFERENCES public.client_payment_requests(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  customer_type text NOT NULL CHECK (customer_type IN ('individual', 'company')),
  company_name text,
  gstin text,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  place_of_supply text NOT NULL,
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pbs_req_idx ON public.payment_billing_submissions (payment_request_id);

ALTER TABLE public.payment_billing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_billing_submissions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pbs_service ON public.payment_billing_submissions;
CREATE POLICY pbs_service ON public.payment_billing_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.payment_billing_submissions FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.payment_billing_submissions TO service_role;


-- ── 4. payment_attempts ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id uuid NOT NULL REFERENCES public.client_payment_requests(id) ON DELETE CASCADE,
  utr text NOT NULL,
  payer_upi_id text,
  bank_name text,
  transferred_at timestamptz NOT NULL DEFAULT now(),
  screenshot_url text,
  notes text,
  ip_hash text,
  status text NOT NULL DEFAULT 'under_review'
    CHECK (status IN ('under_review', 'verified', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pa_req_idx ON public.payment_attempts (payment_request_id);
CREATE INDEX IF NOT EXISTS pa_utr_idx ON public.payment_attempts (utr);

ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_attempts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pa_service ON public.payment_attempts;
CREATE POLICY pa_service ON public.payment_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.payment_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payment_attempts TO service_role;


-- ── 5. payment_reconciliations ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_reconciliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id uuid NOT NULL REFERENCES public.client_payment_requests(id) ON DELETE CASCADE,
  payment_attempt_id uuid REFERENCES public.payment_attempts(id) ON DELETE SET NULL,
  reconciliation_ref text NOT NULL UNIQUE,
  approver_id uuid,
  credited_amount_paise bigint NOT NULL,
  credited_at timestamptz NOT NULL,
  bank_account_ref text NOT NULL DEFAULT 'HDFC Bank - Current A/C',
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected', 'partial_credit')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reconciliations FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pr_service ON public.payment_reconciliations;
CREATE POLICY pr_service ON public.payment_reconciliations FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.payment_reconciliations FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.payment_reconciliations TO service_role;

COMMIT;
