-- Migration: 20261014190000_dedicated_upi_payment_portal.sql
-- Description: Database schema and RPC layer for Dedicated UPI Payment Portal,
-- Company Credentials (MSME/Udyam), and Client Lifecycle stages 6 & 11.
-- Complies with LIT 13-stage lifecycle and least-privilege service_role-only / capability RLS standards.

BEGIN;

-- ── 1. Company Credentials ───────────────────────────────────────────────────
-- Stores authoritative MSME / Udyam credentials, registered address, and official channels.
-- Only super_admin may mutate; public/anon may read verified details for official invoices.
CREATE TABLE IF NOT EXISTS public.company_credentials (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_name     text NOT NULL DEFAULT 'LOGIC INTELLIGENCE TECHNOLOGIES',
  msme_udyam_number   text NOT NULL DEFAULT 'UDYAM-TN-03-0345274',
  msme_category       text NOT NULL DEFAULT 'Micro Enterprise',
  major_activity      text NOT NULL DEFAULT 'Services',
  registered_address  text NOT NULL DEFAULT 'Eachanari, Coimbatore, Tamil Nadu 641021',
  gstin               text CHECK (gstin IS NULL OR gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  pan                 text CHECK (pan IS NULL OR pan ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
  official_email      text NOT NULL DEFAULT 'hello@logicintelligencetechnologies.in',
  official_website    text NOT NULL DEFAULT 'https://www.logicintelligencetechnologies.in',
  updated_by          uuid,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_credentials_created ON public.company_credentials(created_at DESC);

ALTER TABLE public.company_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_credentials FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_credentials_service ON public.company_credentials;
CREATE POLICY company_credentials_service ON public.company_credentials
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS company_credentials_staff_select ON public.company_credentials;
CREATE POLICY company_credentials_staff_select ON public.company_credentials
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS company_credentials_super_admin_update ON public.company_credentials;
CREATE POLICY company_credentials_super_admin_update ON public.company_credentials
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS company_credentials_anon_select ON public.company_credentials;
CREATE POLICY company_credentials_anon_select ON public.company_credentials
  FOR SELECT TO anon USING (true);

GRANT SELECT ON public.company_credentials TO anon;
GRANT SELECT ON public.company_credentials TO authenticated;
GRANT ALL ON public.company_credentials TO service_role;

DROP TRIGGER IF EXISTS company_credentials_set_updated_at ON public.company_credentials;
CREATE TRIGGER company_credentials_set_updated_at
  BEFORE UPDATE ON public.company_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Seed initial authoritative MSME/Udyam row if table is empty
INSERT INTO public.company_credentials (
  enterprise_name,
  msme_udyam_number,
  msme_category,
  major_activity,
  registered_address,
  gstin,
  pan,
  official_email,
  official_website
)
SELECT
  'LOGIC INTELLIGENCE TECHNOLOGIES',
  'UDYAM-TN-03-0345274',
  'Micro Enterprise',
  'Services',
  'Eachanari, Coimbatore, Tamil Nadu 641021',
  NULL, -- Never store placeholder or copy MSME into GSTIN
  NULL,
  'hello@logicintelligencetechnologies.in',
  'https://www.logicintelligencetechnologies.in'
WHERE NOT EXISTS (SELECT 1 FROM public.company_credentials);


-- ── 2. Payment Beneficiary Profiles ──────────────────────────────────────────
-- Centrally managed, founder-verified receiving UPI profiles.
CREATE TABLE IF NOT EXISTS public.payment_beneficiary_profiles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_label       text NOT NULL DEFAULT 'Founder Primary UPI',
  upi_id              text NOT NULL DEFAULT '9342877474@ptyes',
  account_holder_name text NOT NULL DEFAULT 'S VIKASH',
  display_brand_name  text NOT NULL DEFAULT 'Logic Intelligence Technologies',
  is_active           boolean NOT NULL DEFAULT true,
  verified_at         timestamptz DEFAULT now(),
  verified_by         uuid,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Backward/forward compatibility columns if existing table used alternative names
ALTER TABLE public.payment_beneficiary_profiles
  ADD COLUMN IF NOT EXISTS upi_id text DEFAULT '9342877474@ptyes',
  ADD COLUMN IF NOT EXISTS upi_vpa text DEFAULT '9342877474@ptyes',
  ADD COLUMN IF NOT EXISTS account_holder_name text DEFAULT 'S VIKASH',
  ADD COLUMN IF NOT EXISTS upi_registered_name text DEFAULT 'S VIKASH',
  ADD COLUMN IF NOT EXISTS display_brand_name text DEFAULT 'Logic Intelligence Technologies',
  ADD COLUMN IF NOT EXISTS display_brand text DEFAULT 'Logic Intelligence Technologies',
  ADD COLUMN IF NOT EXISTS verified_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS verified_by uuid;

UPDATE public.payment_beneficiary_profiles
SET upi_id = COALESCE(upi_id, upi_vpa, '9342877474@ptyes'),
    upi_vpa = COALESCE(upi_vpa, upi_id, '9342877474@ptyes'),
    account_holder_name = COALESCE(account_holder_name, upi_registered_name, 'S VIKASH'),
    upi_registered_name = COALESCE(upi_registered_name, account_holder_name, 'S VIKASH'),
    display_brand_name = COALESCE(display_brand_name, display_brand, 'Logic Intelligence Technologies'),
    display_brand = COALESCE(display_brand, display_brand_name, 'Logic Intelligence Technologies');

CREATE INDEX IF NOT EXISTS idx_beneficiary_profiles_active ON public.payment_beneficiary_profiles(is_active);

ALTER TABLE public.payment_beneficiary_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_beneficiary_profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS beneficiary_profiles_service ON public.payment_beneficiary_profiles;
CREATE POLICY beneficiary_profiles_service ON public.payment_beneficiary_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS beneficiary_profiles_staff_select ON public.payment_beneficiary_profiles;
CREATE POLICY beneficiary_profiles_staff_select ON public.payment_beneficiary_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'admin', 'operations', 'support', 'developer', 'viewer')
    )
  );

DROP POLICY IF EXISTS beneficiary_profiles_super_admin_mutate ON public.payment_beneficiary_profiles;
CREATE POLICY beneficiary_profiles_super_admin_mutate ON public.payment_beneficiary_profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS beneficiary_profiles_anon_select ON public.payment_beneficiary_profiles;
CREATE POLICY beneficiary_profiles_anon_select ON public.payment_beneficiary_profiles
  FOR SELECT TO anon USING (is_active = true);

GRANT SELECT ON public.payment_beneficiary_profiles TO anon;
GRANT SELECT ON public.payment_beneficiary_profiles TO authenticated;
GRANT ALL ON public.payment_beneficiary_profiles TO service_role;

DROP TRIGGER IF EXISTS payment_beneficiary_profiles_set_updated_at ON public.payment_beneficiary_profiles;
CREATE TRIGGER payment_beneficiary_profiles_set_updated_at
  BEFORE UPDATE ON public.payment_beneficiary_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Seed initial founder-verified UPI profile
INSERT INTO public.payment_beneficiary_profiles (
  profile_label,
  upi_id,
  upi_vpa,
  account_holder_name,
  upi_registered_name,
  display_brand_name,
  display_brand,
  is_active,
  verified_at
)
SELECT
  'Founder Primary UPI',
  '9342877474@ptyes',
  '9342877474@ptyes',
  'S VIKASH',
  'S VIKASH',
  'Logic Intelligence Technologies',
  'Logic Intelligence Technologies',
  true,
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.payment_beneficiary_profiles
  WHERE upi_id = '9342877474@ptyes' OR upi_vpa = '9342877474@ptyes'
);


-- ── 3. Engagement Payment Requests ───────────────────────────────────────────
-- Server-controlled monetary ledger for Stage 6 (Initial) & Stage 11 (Final) payments.
CREATE TABLE IF NOT EXISTS public.engagement_payment_requests (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id            uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  contract_id            uuid REFERENCES public.client_contracts(id) ON DELETE SET NULL,
  client_id              uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  milestone_index        integer NOT NULL DEFAULT 6,
  stage_number           integer NOT NULL DEFAULT 6 CHECK (stage_number IN (6, 11)),
  milestone_title        text NOT NULL,
  secure_token           text NOT NULL UNIQUE,
  subtotal_paise         bigint NOT NULL CHECK (subtotal_paise >= 0),
  discount_paise         bigint NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  tax_mode               text NOT NULL DEFAULT 'tax_exclusive' CHECK (tax_mode IN ('tax_exclusive', 'tax_inclusive', 'exempt')),
  gst_rate_bps           integer NOT NULL DEFAULT 1800 CHECK (gst_rate_bps >= 0),
  is_interstate          boolean NOT NULL DEFAULT false,
  cgst_paise             bigint NOT NULL DEFAULT 0 CHECK (cgst_paise >= 0),
  sgst_paise             bigint NOT NULL DEFAULT 0 CHECK (sgst_paise >= 0),
  igst_paise             bigint NOT NULL DEFAULT 0 CHECK (igst_paise >= 0),
  total_payable_paise    bigint NOT NULL CHECK (total_payable_paise >= 0),
  beneficiary_profile_id uuid REFERENCES public.payment_beneficiary_profiles(id),
  status                 text NOT NULL DEFAULT 'awaiting_billing_details'
                           CHECK (status IN ('awaiting_billing_details', 'ready_to_pay', 'payment_reported', 'under_review', 'approved', 'rejected', 'cancelled')),
  expires_at             timestamptz NOT NULL,
  invoice_id             uuid,
  receipt_id             uuid,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_requests_token ON public.engagement_payment_requests(secure_token);
CREATE INDEX IF NOT EXISTS idx_payment_requests_client ON public.engagement_payment_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.engagement_payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_proposal ON public.engagement_payment_requests(proposal_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_stage ON public.engagement_payment_requests(stage_number, status);

ALTER TABLE public.engagement_payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_payment_requests FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payment_requests_service ON public.engagement_payment_requests;
CREATE POLICY payment_requests_service ON public.engagement_payment_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS payment_requests_staff_select ON public.engagement_payment_requests;
CREATE POLICY payment_requests_staff_select ON public.engagement_payment_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'admin', 'operations', 'support', 'developer', 'viewer')
    )
  );

DROP POLICY IF EXISTS payment_requests_staff_update ON public.engagement_payment_requests;
CREATE POLICY payment_requests_staff_update ON public.engagement_payment_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'admin')
    )
  );

DROP POLICY IF EXISTS payment_requests_anon_select ON public.engagement_payment_requests;
CREATE POLICY payment_requests_anon_select ON public.engagement_payment_requests
  FOR SELECT TO anon
  USING (expires_at > now() AND status <> 'cancelled');

GRANT SELECT ON public.engagement_payment_requests TO anon;
GRANT SELECT, UPDATE ON public.engagement_payment_requests TO authenticated;
GRANT ALL ON public.engagement_payment_requests TO service_role;

DROP TRIGGER IF EXISTS engagement_payment_requests_set_updated_at ON public.engagement_payment_requests;
CREATE TRIGGER engagement_payment_requests_set_updated_at
  BEFORE UPDATE ON public.engagement_payment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


-- ── 4. Payment Billing Submissions ───────────────────────────────────────────
-- Billing form gate snapshot required before dynamic UPI QR generation.
CREATE TABLE IF NOT EXISTS public.payment_billing_submissions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id uuid NOT NULL REFERENCES public.engagement_payment_requests(id) ON DELETE CASCADE,
  customer_type      text NOT NULL CHECK (customer_type IN ('individual', 'company')),
  legal_name         text NOT NULL,
  company_name       text,
  email              text NOT NULL,
  phone              text NOT NULL,
  address_line1      text NOT NULL,
  address_line2      text,
  city               text NOT NULL,
  state              text NOT NULL,
  postal_code        text NOT NULL,
  country            text NOT NULL DEFAULT 'India',
  client_gstin       text CHECK (client_gstin IS NULL OR client_gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
  place_of_supply    text NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE(payment_request_id)
);

-- Compatibility columns if table already existed under alternative column names
ALTER TABLE public.payment_billing_submissions
  ADD COLUMN IF NOT EXISTS legal_name text,
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS client_gstin text,
  ADD COLUMN IF NOT EXISTS gstin text,
  ADD COLUMN IF NOT EXISTS ip_hash text;

UPDATE public.payment_billing_submissions
SET legal_name = COALESCE(legal_name, contact_name, 'Client'),
    contact_name = COALESCE(contact_name, legal_name, 'Client'),
    client_gstin = COALESCE(client_gstin, gstin),
    gstin = COALESCE(gstin, client_gstin);

CREATE INDEX IF NOT EXISTS idx_billing_submissions_req ON public.payment_billing_submissions(payment_request_id);
CREATE INDEX IF NOT EXISTS idx_billing_submissions_email ON public.payment_billing_submissions(email);

ALTER TABLE public.payment_billing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_billing_submissions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS billing_submissions_service ON public.payment_billing_submissions;
CREATE POLICY billing_submissions_service ON public.payment_billing_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS billing_submissions_staff_select ON public.payment_billing_submissions;
CREATE POLICY billing_submissions_staff_select ON public.payment_billing_submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'admin', 'operations', 'support', 'developer', 'viewer')
    )
  );

DROP POLICY IF EXISTS billing_submissions_anon_insert ON public.payment_billing_submissions;
CREATE POLICY billing_submissions_anon_insert ON public.payment_billing_submissions
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.engagement_payment_requests req
      WHERE req.id = payment_request_id
        AND req.expires_at > now()
        AND req.status IN ('awaiting_billing_details', 'ready_to_pay')
    )
  );

DROP POLICY IF EXISTS billing_submissions_anon_select ON public.payment_billing_submissions;
CREATE POLICY billing_submissions_anon_select ON public.payment_billing_submissions
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.engagement_payment_requests req
      WHERE req.id = payment_request_id
        AND req.expires_at > now()
    )
  );

GRANT SELECT, INSERT ON public.payment_billing_submissions TO anon;
GRANT SELECT ON public.payment_billing_submissions TO authenticated;
GRANT ALL ON public.payment_billing_submissions TO service_role;


-- ── 5. Payment Attempts ──────────────────────────────────────────────────────
-- Captures client UTR reference and payment proof. Unique UTR blocks replay fraud.
CREATE TABLE IF NOT EXISTS public.payment_attempts (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id         uuid NOT NULL REFERENCES public.engagement_payment_requests(id) ON DELETE CASCADE,
  utr                        text NOT NULL,
  payer_upi_id               text,
  payer_bank_name            text,
  reported_amount_paise      bigint NOT NULL CHECK (reported_amount_paise > 0),
  payment_proof_storage_path text,
  notes                      text,
  client_ip                  text,
  user_agent                 text,
  status                     text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'rejected')),
  created_at                 timestamptz NOT NULL DEFAULT now(),
  UNIQUE(utr)
);

-- Compatibility columns if table already existed under alternative column names
ALTER TABLE public.payment_attempts
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS payer_bank_name text,
  ADD COLUMN IF NOT EXISTS reported_amount_paise bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_proof_storage_path text,
  ADD COLUMN IF NOT EXISTS screenshot_url text,
  ADD COLUMN IF NOT EXISTS transferred_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS ip_hash text;

UPDATE public.payment_attempts
SET bank_name = COALESCE(bank_name, payer_bank_name),
    payer_bank_name = COALESCE(payer_bank_name, bank_name),
    screenshot_url = COALESCE(screenshot_url, payment_proof_storage_path),
    payment_proof_storage_path = COALESCE(payment_proof_storage_path, screenshot_url);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_req ON public.payment_attempts(payment_request_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_utr ON public.payment_attempts(utr);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON public.payment_attempts(status);

ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_attempts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payment_attempts_service ON public.payment_attempts;
CREATE POLICY payment_attempts_service ON public.payment_attempts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS payment_attempts_staff_select ON public.payment_attempts;
CREATE POLICY payment_attempts_staff_select ON public.payment_attempts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'admin', 'operations', 'support', 'developer', 'viewer')
    )
  );

DROP POLICY IF EXISTS payment_attempts_anon_insert ON public.payment_attempts;
CREATE POLICY payment_attempts_anon_insert ON public.payment_attempts
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.engagement_payment_requests req
      WHERE req.id = payment_request_id
        AND req.expires_at > now()
        AND req.status IN ('ready_to_pay', 'payment_reported')
    )
  );

DROP POLICY IF EXISTS payment_attempts_anon_select ON public.payment_attempts;
CREATE POLICY payment_attempts_anon_select ON public.payment_attempts
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.engagement_payment_requests req
      WHERE req.id = payment_request_id
        AND req.expires_at > now()
    )
  );

GRANT SELECT, INSERT ON public.payment_attempts TO anon;
GRANT SELECT ON public.payment_attempts TO authenticated;
GRANT ALL ON public.payment_attempts TO service_role;


-- ── 6. Payment Reconciliations ───────────────────────────────────────────────
-- Super-admin verified bank ledger reconciliation records.
CREATE TABLE IF NOT EXISTS public.payment_reconciliations (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id       uuid NOT NULL REFERENCES public.engagement_payment_requests(id) ON DELETE CASCADE,
  payment_attempt_id       uuid NOT NULL REFERENCES public.payment_attempts(id) ON DELETE CASCADE,
  verified_by              uuid NOT NULL,
  bank_credit_reference    text NOT NULL,
  bank_credit_amount_paise bigint NOT NULL CHECK (bank_credit_amount_paise > 0),
  credited_at              timestamptz NOT NULL DEFAULT now(),
  receiving_bank_account   text NOT NULL DEFAULT 'YES BANK / PTYES',
  reconciliation_notes     text,
  created_at               timestamptz NOT NULL DEFAULT now()
);

-- Compatibility columns if table already existed under alternative column names
ALTER TABLE public.payment_reconciliations
  ADD COLUMN IF NOT EXISTS reconciliation_ref text,
  ADD COLUMN IF NOT EXISTS approver_id uuid,
  ADD COLUMN IF NOT EXISTS credited_amount_paise bigint,
  ADD COLUMN IF NOT EXISTS bank_account_ref text,
  ADD COLUMN IF NOT EXISTS decision text;

UPDATE public.payment_reconciliations
SET reconciliation_ref = COALESCE(reconciliation_ref, bank_credit_reference),
    bank_credit_reference = COALESCE(bank_credit_reference, reconciliation_ref),
    approver_id = COALESCE(approver_id, verified_by),
    verified_by = COALESCE(verified_by, approver_id),
    credited_amount_paise = COALESCE(credited_amount_paise, bank_credit_amount_paise),
    bank_credit_amount_paise = COALESCE(bank_credit_amount_paise, credited_amount_paise),
    bank_account_ref = COALESCE(bank_account_ref, receiving_bank_account),
    receiving_bank_account = COALESCE(receiving_bank_account, bank_account_ref),
    decision = COALESCE(decision, 'approved');

CREATE INDEX IF NOT EXISTS idx_payment_reconciliations_req ON public.payment_reconciliations(payment_request_id);
CREATE INDEX IF NOT EXISTS idx_payment_reconciliations_attempt ON public.payment_reconciliations(payment_attempt_id);

ALTER TABLE public.payment_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reconciliations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reconciliations_service ON public.payment_reconciliations;
CREATE POLICY reconciliations_service ON public.payment_reconciliations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS reconciliations_staff_select ON public.payment_reconciliations;
CREATE POLICY reconciliations_staff_select ON public.payment_reconciliations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'admin', 'operations')
    )
  );

DROP POLICY IF EXISTS reconciliations_super_admin_insert ON public.payment_reconciliations;
CREATE POLICY reconciliations_super_admin_insert ON public.payment_reconciliations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

REVOKE ALL ON public.payment_reconciliations FROM anon, PUBLIC;
GRANT SELECT ON public.payment_reconciliations TO authenticated;
GRANT ALL ON public.payment_reconciliations TO service_role;


-- ── 7. Financial Documents (Invoice + Receipt Vault) ─────────────────────────
-- Stores Claude-reference-style PDF metadata with SHA-256 integrity hash.
CREATE TABLE IF NOT EXISTS public.financial_documents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_request_id uuid NOT NULL REFERENCES public.engagement_payment_requests(id) ON DELETE RESTRICT,
  doc_type           text NOT NULL CHECK (doc_type IN ('invoice', 'receipt')),
  document_number    text NOT NULL UNIQUE,
  title              text NOT NULL,
  storage_path       text NOT NULL,
  sha256_hash        text NOT NULL CHECK (sha256_hash ~ '^[0-9a-f]{64}$'),
  byte_size          bigint NOT NULL CHECK (byte_size > 0),
  client_id          uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  proposal_id        uuid REFERENCES public.proposals(id) ON DELETE SET NULL,
  contract_id        uuid REFERENCES public.client_contracts(id) ON DELETE SET NULL,
  status             text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'void')),
  issued_at          timestamptz NOT NULL DEFAULT now(),
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_docs_req ON public.financial_documents(payment_request_id);
CREATE INDEX IF NOT EXISTS idx_financial_docs_client ON public.financial_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_financial_docs_number ON public.financial_documents(document_number);
CREATE INDEX IF NOT EXISTS idx_financial_docs_type ON public.financial_documents(doc_type, status);

ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_documents FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS financial_docs_service ON public.financial_documents;
CREATE POLICY financial_docs_service ON public.financial_documents
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS financial_docs_staff_select ON public.financial_documents;
CREATE POLICY financial_docs_staff_select ON public.financial_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('super_admin', 'admin', 'operations', 'support', 'developer', 'viewer')
    )
  );

DROP POLICY IF EXISTS financial_docs_anon_select ON public.financial_documents;
CREATE POLICY financial_docs_anon_select ON public.financial_documents
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.engagement_payment_requests req
      WHERE req.id = payment_request_id
        AND (req.invoice_id = public.financial_documents.id OR req.receipt_id = public.financial_documents.id)
        AND req.status = 'approved'
    )
  );

GRANT SELECT ON public.financial_documents TO anon;
GRANT SELECT ON public.financial_documents TO authenticated;
GRANT ALL ON public.financial_documents TO service_role;

-- Backlink constraints on engagement_payment_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_payment_req_invoice'
  ) THEN
    ALTER TABLE public.engagement_payment_requests
      ADD CONSTRAINT fk_payment_req_invoice
      FOREIGN KEY (invoice_id) REFERENCES public.financial_documents(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_payment_req_receipt'
  ) THEN
    ALTER TABLE public.engagement_payment_requests
      ADD CONSTRAINT fk_payment_req_receipt
      FOREIGN KEY (receipt_id) REFERENCES public.financial_documents(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ── 8. Atomic Reconciliation & Approval RPC ─────────────────────────────────
-- Reconciles bank statement, verifies attempt, marks request approved,
-- records audit log and unlocks downstream lifecycle stage.
CREATE OR REPLACE FUNCTION public.reconcile_and_approve_payment(
  p_payment_request_id     uuid,
  p_payment_attempt_id     uuid,
  p_admin_user_id          uuid,
  p_bank_credit_reference  text,
  p_bank_credit_amount_paise bigint,
  p_receiving_bank         text DEFAULT 'YES BANK / PTYES',
  p_reconciliation_notes   text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_role text;
  v_req public.engagement_payment_requests%ROWTYPE;
  v_attempt public.payment_attempts%ROWTYPE;
  v_reconciliation_id uuid;
BEGIN
  -- 1. Authorization: Only super_admin may verify bank receipts and reconcile
  SELECT role INTO v_admin_role FROM public.profiles WHERE id = p_admin_user_id;
  IF v_admin_role IS NULL OR v_admin_role <> 'super_admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only super_admin may reconcile and approve payments' USING ERRCODE = '42501';
  END IF;

  -- 2. Input validation
  IF p_bank_credit_reference IS NULL OR trim(p_bank_credit_reference) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bank credit reference is required');
  END IF;

  IF p_bank_credit_amount_paise IS NULL OR p_bank_credit_amount_paise <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bank credit amount must be greater than zero');
  END IF;

  -- 3. Lock & validate payment request
  SELECT * INTO v_req
  FROM public.engagement_payment_requests
  WHERE id = p_payment_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment request not found');
  END IF;

  IF v_req.status = 'approved' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment request is already approved',
      'payment_request_id', p_payment_request_id
    );
  END IF;

  -- 4. Lock & validate payment attempt
  SELECT * INTO v_attempt
  FROM public.payment_attempts
  WHERE id = p_payment_attempt_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment attempt not found');
  END IF;

  IF v_attempt.payment_request_id <> p_payment_request_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment attempt does not belong to this payment request');
  END IF;

  -- 5. Insert reconciliation record
  INSERT INTO public.payment_reconciliations (
    payment_request_id,
    payment_attempt_id,
    verified_by,
    bank_credit_reference,
    bank_credit_amount_paise,
    credited_at,
    receiving_bank_account,
    reconciliation_notes
  ) VALUES (
    p_payment_request_id,
    p_payment_attempt_id,
    p_admin_user_id,
    trim(p_bank_credit_reference),
    p_bank_credit_amount_paise,
    now(),
    COALESCE(NULLIF(trim(p_receiving_bank), ''), 'YES BANK / PTYES'),
    p_reconciliation_notes
  ) RETURNING id INTO v_reconciliation_id;

  -- 6. Update payment attempt status to verified
  UPDATE public.payment_attempts
  SET status = 'verified'
  WHERE id = p_payment_attempt_id;

  -- 7. Update payment request status to approved
  UPDATE public.engagement_payment_requests
  SET status = 'approved',
      updated_at = now()
  WHERE id = p_payment_request_id;

  -- 8. Lifecycle / project unlock
  -- Stage 6 (Initial Payment) unlocks Stage 7 (Onboarding)
  IF v_req.stage_number = 6 OR v_req.milestone_index = 6 THEN
    -- Update linked project in projects table if exists
    UPDATE public.projects
    SET lifecycle_status = 'stage_6_verified',
        updated_at = now()
    WHERE (contract_id = v_req.contract_id AND v_req.contract_id IS NOT NULL)
       OR (proposal_id = v_req.proposal_id AND v_req.proposal_id IS NOT NULL)
       OR (client_id = v_req.client_id AND v_req.client_id IS NOT NULL);

    -- Check if engagement_stages table exists and unlock onboarding
    IF to_regclass('public.engagement_stages') IS NOT NULL THEN
      EXECUTE '
        UPDATE public.engagement_stages
        SET status = ''completed'', completed_at = now()
        WHERE stage_key = ''initial-invoice''
          AND (engagement_id IN (
            SELECT id FROM public.client_engagements WHERE client_id = $1 OR proposal_id = $2
          ))
      ' USING v_req.client_id, v_req.proposal_id;

      EXECUTE '
        UPDATE public.engagement_stages
        SET status = ''unlocked'', unlocked_at = now()
        WHERE stage_key = ''onboarding''
          AND status = ''locked''
          AND (engagement_id IN (
            SELECT id FROM public.client_engagements WHERE client_id = $1 OR proposal_id = $2
          ))
      ' USING v_req.client_id, v_req.proposal_id;
    END IF;

  ELSIF v_req.stage_number = 11 OR v_req.milestone_index = 11 THEN
    -- Final payment verified -> unlock handover (Stage 12)
    UPDATE public.projects
    SET lifecycle_status = 'stage_11_verified',
        updated_at = now()
    WHERE (contract_id = v_req.contract_id AND v_req.contract_id IS NOT NULL)
       OR (proposal_id = v_req.proposal_id AND v_req.proposal_id IS NOT NULL)
       OR (client_id = v_req.client_id AND v_req.client_id IS NOT NULL);

    IF to_regclass('public.engagement_stages') IS NOT NULL THEN
      EXECUTE '
        UPDATE public.engagement_stages
        SET status = ''completed'', completed_at = now()
        WHERE stage_key = ''final-payment''
          AND (engagement_id IN (
            SELECT id FROM public.client_engagements WHERE client_id = $1 OR proposal_id = $2
          ))
      ' USING v_req.client_id, v_req.proposal_id;

      EXECUTE '
        UPDATE public.engagement_stages
        SET status = ''unlocked'', unlocked_at = now()
        WHERE stage_key = ''handover''
          AND status = ''locked''
          AND (engagement_id IN (
            SELECT id FROM public.client_engagements WHERE client_id = $1 OR proposal_id = $2
          ))
      ' USING v_req.client_id, v_req.proposal_id;
    END IF;
  END IF;

  -- 9. Emit automation event if table exists
  IF to_regclass('public.automation_events') IS NOT NULL THEN
    INSERT INTO public.automation_events (event_type, payload)
    VALUES ('payment.verified', jsonb_build_object(
      'payment_request_id', p_payment_request_id,
      'reconciliation_id', v_reconciliation_id,
      'stage_number', v_req.stage_number,
      'milestone_index', v_req.milestone_index,
      'client_id', v_req.client_id,
      'proposal_id', v_req.proposal_id,
      'contract_id', v_req.contract_id,
      'amount_paise', p_bank_credit_amount_paise,
      'bank_credit_reference', p_bank_credit_reference,
      'verified_by', p_admin_user_id
    ));
  END IF;

  -- 10. Record admin audit log entry if table exists
  IF to_regclass('public.admin_audit_log') IS NOT NULL THEN
    INSERT INTO public.admin_audit_log (
      actor_user_id,
      actor_role,
      action,
      capability,
      target_type,
      target_id,
      outcome,
      request_id,
      metadata
    ) VALUES (
      p_admin_user_id,
      'super_admin',
      'payment.reconcile_and_approve',
      'invoices.write',
      'engagement_payment_requests',
      p_payment_request_id::text,
      'succeeded',
      gen_random_uuid()::text,
      jsonb_build_object(
        'reconciliation_id', v_reconciliation_id,
        'bank_credit_reference', p_bank_credit_reference,
        'bank_credit_amount_paise', p_bank_credit_amount_paise,
        'attempt_id', p_payment_attempt_id,
        'stage_number', v_req.stage_number
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reconciliation_id', v_reconciliation_id,
    'payment_request_id', p_payment_request_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_and_approve_payment(uuid, uuid, uuid, text, bigint, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reconcile_and_approve_payment(uuid, uuid, uuid, text, bigint, text, text) TO authenticated, service_role;

-- ── 9. Compatibility Views ──────────────────────────────────────────────────
-- Provides client_payment_requests view aliasing engagement_payment_requests if table not defined
DO $$
BEGIN
  IF to_regclass('public.client_payment_requests') IS NULL THEN
    CREATE VIEW public.client_payment_requests AS
      SELECT
        id,
        proposal_id,
        client_id,
        contract_id,
        stage_number AS stage,
        ('Stage ' || stage_number::text) AS stage_name,
        milestone_title,
        50.00::numeric(5,2) AS milestone_percentage,
        subtotal_paise,
        (gst_rate_bps::numeric / 10000.0)::numeric(5,4) AS gst_rate,
        (cgst_paise + sgst_paise + igst_paise) AS gst_amount_paise,
        total_payable_paise,
        'INR'::text AS currency,
        ('LIT-PAY-' || substr(id::text, 1, 8))::text AS unique_reference,
        encode(digest(secure_token, 'sha256'), 'hex') AS secure_token_hash,
        status,
        NULL::text AS notes,
        expires_at,
        created_at,
        updated_at
      FROM public.engagement_payment_requests;

    GRANT SELECT ON public.client_payment_requests TO service_role, authenticated, anon;
  END IF;
END $$;

COMMIT;
