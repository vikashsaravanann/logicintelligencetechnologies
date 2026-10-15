import fs from 'fs';
import path from 'path';

const masterPromptPath = '/Users/vikash/lit-infrastructure/LIT_V6_PROFESSIONAL_WEB_SERVICES_QUOTATION_COUPONS_GITHUB_VERCEL_COMPLETE_AZ_MASTER_PROMPT_2026-10-15.md';
const content = fs.readFileSync(masterPromptPath, 'utf8');
const lines = content.split('\n');

let currentCategoryCode = '';
let currentCategoryName = '';
const services = [];

for (const line of lines) {
  const catMatch = line.match(/^#### Category ([A-H]) — (.+)$/);
  if (catMatch) {
    currentCategoryCode = catMatch[1];
    currentCategoryName = catMatch[2].trim();
    continue;
  }
  const rowMatch = line.match(/^\|\s*([A-Z]{2}-\d{2})\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/);
  if (rowMatch && currentCategoryCode) {
    const code = rowMatch[1].trim();
    let title = rowMatch[2].trim().replace(/\*\*/g, '').trim();
    let scope = rowMatch[3].trim().replace(/\*\*/g, '').trim();
    services.push({
      code,
      category_code: currentCategoryCode,
      category_name: currentCategoryName,
      title,
      client_scope_summary: scope
    });
  }
}

if (services.length !== 77) {
  console.error(`Expected 77 services, found ${services.length}`);
  process.exit(1);
}

const deliverablesMap = {
  A: ['Requirements Matrix & Feature Catalog', 'User Journeys & Experience Specification', 'Agreed Scope Baseline & Deliverables Sign-Off'],
  B: ['Responsive Component Implementation', 'Interactive State & Validation Architecture', 'Cross-Device & Viewport Verification'],
  C: ['Production API Endpoints & Request Handlers', 'Secure Authentication & Capability Enforcement', 'Data Validation Contracts & Operational Runbook'],
  D: ['Relational Schema & Constraints DDL', 'Audited Row-Level Security Policies', 'Optimized Queries & Persistence Storage Layer'],
  E: ['AI Model Orchestration & Prompts Pipeline', 'Grounding & Context Retrieval Verification', 'Safety Controls & Output Validation Fixtures'],
  F: ['Cloud Infrastructure Deployment Topology', 'Automated CI/CD Pipeline & Build Configuration', 'Domain, SSL & Health Monitoring Dashboards'],
  G: ['Authorized API Integration & Credentials Isolation', 'Event Handlers & Ingestion Pipeline', 'Operational Retries & Webhook Verification'],
  H: ['Automated Test Suites & Passing CI Verification', 'Handover Architecture & Operations Documentation', 'Release Readiness Sign-Off & Client Walkthrough']
};

const deliverablesSpecial = {
  'FE-01': [
    'Production Next.js 16 App Router Setup',
    'React 19 & TypeScript Component Architecture',
    'Responsive Desktop, Tablet & Mobile Views',
    'Tailwind CSS Design System Implementation',
    'Interactive Form Validation & State Management'
  ],
  'CL-02': [
    'Vercel Project Setup & Custom Domain Mapping',
    'Build Optimization & Edge Routing Rules',
    'Environment Variables & Production Deployment Validation'
  ],
  'IN-05': [
    'UPI Dynamic QR Code Integration & Display UX',
    'UTR Reference Ingestion & Transaction Reconciliation Interface',
    'Owner Verification & Audit Trail Logging'
  ]
};

const migrationSql = `-- Migration: 20261015040000_v6_quotations_and_service_catalog.sql
-- Description: V6 Professional Quotations & 77 Canonical Services Catalog
-- Implements complete database architecture per LIT_V6_PROFESSIONAL_WEB_SERVICES_QUOTATION_COUPONS_GITHUB_VERCEL_COMPLETE_AZ_MASTER_PROMPT_2026-10-15.md:
--   1. quotation_services_catalog (77 Canonical Services across Categories A-H)
--   2. quotations (Headers, pricing, tokens, state machine)
--   3. quotation_versions (Immutable version snapshots, hashes)
--   4. quotation_line_items (Detailed line items, deliverables)
--   5. quotation_coupons (Promotions & discount campaigns)
--   6. quotation_coupon_redemptions (One-time and multi-use coupon accounting)
--   7. quotation_acceptances (Cryptographic & signature audit records)
--   8. quotation_revision_requests (Client feedback loop)
--   9. quotation_audit_logs (Immutable audit trails)
--   10. accept_quotation_v6 & request_quotation_revision_v6 RPC functions
--   11. Strict Row-Level Security (RLS) and Role Grants

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── 0. Helper Trigger Function for updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_quotations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Minimal stubs for external relations if running in standalone test ────────
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text,
  contact_name text,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── 1. quotation_services_catalog ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotation_services_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  category_code text NOT NULL CHECK (category_code IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H')),
  category_name text NOT NULL,
  title text NOT NULL,
  client_scope_summary text NOT NULL,
  admin_description text,
  default_deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  unit text NOT NULL DEFAULT 'project',
  is_one_time boolean NOT NULL DEFAULT true,
  default_unit_price_paise bigint,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotation_services_catalog_code ON public.quotation_services_catalog (code);
CREATE INDEX IF NOT EXISTS idx_quotation_services_catalog_category ON public.quotation_services_catalog (category_code);
CREATE INDEX IF NOT EXISTS idx_quotation_services_catalog_active ON public.quotation_services_catalog (is_active);

DROP TRIGGER IF EXISTS trg_qsc_updated_at ON public.quotation_services_catalog;
CREATE TRIGGER trg_qsc_updated_at BEFORE UPDATE ON public.quotation_services_catalog
  FOR EACH ROW EXECUTE FUNCTION public.set_quotations_updated_at();

-- ── 2. quotations ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_ref text NOT NULL UNIQUE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  engagement_id uuid REFERENCES public.client_engagements(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  project_title text NOT NULL,
  project_brief text,
  timeline_estimate text NOT NULL DEFAULT '2 to 4 weeks',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'awaiting_founder_review', 'approved', 'published',
    'changes_requested', 'accepted', 'revised', 'expired', 'revoked', 'archived'
  )),
  delivery_state text NOT NULL DEFAULT 'not_sent' CHECK (delivery_state IN (
    'not_sent', 'email_queued', 'email_sent', 'email_failed', 'link_shared'
  )),
  subtotal_paise bigint NOT NULL DEFAULT 0,
  discount_paise bigint NOT NULL DEFAULT 0,
  discount_label text,
  applied_coupon_code text,
  tax_mode text NOT NULL DEFAULT 'exempt_or_pending' CHECK (tax_mode IN (
    'exempt_or_pending', 'tax_exclusive', 'tax_inclusive'
  )),
  tax_rate_bps integer NOT NULL DEFAULT 0,
  tax_paise bigint NOT NULL DEFAULT 0,
  total_payable_paise bigint NOT NULL DEFAULT 0,
  milestone1_paise bigint NOT NULL DEFAULT 0,
  milestone2_paise bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  secure_token text NOT NULL UNIQUE,
  token_hash text,
  latest_version_number int NOT NULL DEFAULT 1,
  valid_until timestamptz NOT NULL,
  internal_notes text,
  published_at timestamptz,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_by uuid,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotations_ref ON public.quotations (quotation_ref);
CREATE INDEX IF NOT EXISTS idx_quotations_token ON public.quotations (secure_token);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations (status);
CREATE INDEX IF NOT EXISTS idx_quotations_client ON public.quotations (client_id);
CREATE INDEX IF NOT EXISTS idx_quotations_engagement ON public.quotations (engagement_id);
CREATE INDEX IF NOT EXISTS idx_quotations_contact_email ON public.quotations (contact_email);

DROP TRIGGER IF EXISTS trg_q_updated_at ON public.quotations;
CREATE TRIGGER trg_q_updated_at BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.set_quotations_updated_at();

-- ── 3. quotation_versions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotation_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  secure_token text NOT NULL,
  client_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  deliverables_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  lines_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  financial_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NOT NULL,
  pdf_storage_path text,
  pdf_sha256 text,
  status text NOT NULL DEFAULT 'draft',
  approved_by uuid,
  published_at timestamptz,
  valid_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(quotation_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_quotation_versions_quote ON public.quotation_versions (quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_versions_token ON public.quotation_versions (secure_token);

-- ── 4. quotation_line_items ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotation_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  version_id uuid REFERENCES public.quotation_versions(id) ON DELETE CASCADE,
  service_catalog_id uuid REFERENCES public.quotation_services_catalog(id) ON DELETE SET NULL,
  service_code text NOT NULL,
  category_code text NOT NULL,
  category_name text NOT NULL,
  title text NOT NULL,
  public_scope text NOT NULL,
  deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  unit text NOT NULL DEFAULT 'project',
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  quoted_unit_price_paise bigint,
  extended_amount_paise bigint NOT NULL DEFAULT 0,
  included_at_no_additional_charge boolean NOT NULL DEFAULT false,
  charge_waiver_reason text,
  is_selected boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotation_line_items_quote ON public.quotation_line_items (quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_line_items_version ON public.quotation_line_items (version_id);
CREATE INDEX IF NOT EXISTS idx_quotation_line_items_catalog ON public.quotation_line_items (service_catalog_id);

DROP TRIGGER IF EXISTS trg_qli_updated_at ON public.quotation_line_items;
CREATE TRIGGER trg_qli_updated_at BEFORE UPDATE ON public.quotation_line_items
  FOR EACH ROW EXECUTE FUNCTION public.set_quotations_updated_at();

-- ── 5. quotation_coupons ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotation_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  campaign_name text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value bigint NOT NULL,
  min_subtotal_paise bigint NOT NULL DEFAULT 0,
  max_discount_paise bigint,
  applies_to_categories text[] DEFAULT '{}'::text[],
  applies_to_services text[] DEFAULT '{}'::text[],
  allowed_client_ids uuid[] DEFAULT '{}'::uuid[],
  max_redemptions int NOT NULL DEFAULT 100,
  redemptions_count int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_stackable boolean NOT NULL DEFAULT false,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_by uuid,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotation_coupons_code ON public.quotation_coupons (code);
CREATE INDEX IF NOT EXISTS idx_quotation_coupons_active ON public.quotation_coupons (is_active);

DROP TRIGGER IF EXISTS trg_qc_updated_at ON public.quotation_coupons;
CREATE TRIGGER trg_qc_updated_at BEFORE UPDATE ON public.quotation_coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_quotations_updated_at();

-- ── 6. quotation_coupon_redemptions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotation_coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.quotation_coupons(id) ON DELETE RESTRICT,
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  version_id uuid REFERENCES public.quotation_versions(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  discount_paise bigint NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  signer_email text NOT NULL,
  UNIQUE(coupon_id, quotation_id)
);

CREATE INDEX IF NOT EXISTS idx_quotation_redemptions_coupon ON public.quotation_coupon_redemptions (coupon_id);
CREATE INDEX IF NOT EXISTS idx_quotation_redemptions_quote ON public.quotation_coupon_redemptions (quotation_id);

-- ── 7. quotation_acceptances ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotation_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE RESTRICT,
  version_id uuid NOT NULL REFERENCES public.quotation_versions(id) ON DELETE RESTRICT,
  signer_name text NOT NULL,
  signer_email text NOT NULL,
  signer_title text NOT NULL,
  signer_company text NOT NULL,
  accepted_total_paise bigint NOT NULL,
  terms_hash text NOT NULL,
  client_ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(quotation_id, version_id)
);

CREATE INDEX IF NOT EXISTS idx_quotation_acceptances_quote ON public.quotation_acceptances (quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_acceptances_version ON public.quotation_acceptances (version_id);

-- ── 8. quotation_revision_requests ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotation_revision_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  version_id uuid REFERENCES public.quotation_versions(id) ON DELETE SET NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  notes text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotation_revision_requests_quote ON public.quotation_revision_requests (quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_revision_requests_status ON public.quotation_revision_requests (status);

-- ── 9. quotation_audit_logs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotation_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  action text NOT NULL,
  actor_id uuid,
  actor_email text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotation_audit_logs_quote ON public.quotation_audit_logs (quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_audit_logs_action ON public.quotation_audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_quotation_audit_logs_created ON public.quotation_audit_logs (created_at DESC);

-- ── 10. Seed Default Inactive Coupon 'WAKEUPINDIA' ─────────────────────────────
INSERT INTO public.quotation_coupons (
  code,
  campaign_name,
  description,
  discount_type,
  discount_value,
  min_subtotal_paise,
  max_discount_paise,
  is_active,
  is_stackable,
  max_redemptions,
  redemptions_count
) VALUES (
  'WAKEUPINDIA',
  'Support Wake Up India — Initial Launch',
  'Founder-controlled promotional discount for qualifying initial launch initiatives.',
  'fixed_amount',
  0,
  0,
  NULL,
  false,
  false,
  100,
  0
)
ON CONFLICT (code) DO UPDATE SET
  campaign_name = EXCLUDED.campaign_name,
  description = EXCLUDED.description,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  is_active = false, -- strictly disabled by default!
  updated_at = now();

-- ── 11. Seed 77 Canonical Services ─────────────────────────────────────────────
`;

let seedSql = `-- Seeding 77 Canonical Services across Categories A through H
INSERT INTO public.quotation_services_catalog (
  code,
  category_code,
  category_name,
  title,
  client_scope_summary,
  admin_description,
  default_deliverables,
  unit,
  is_one_time,
  default_unit_price_paise,
  is_active,
  sort_order
) VALUES
`;

const seedRows = services.map((s, idx) => {
  const isFE01 = s.code === 'FE-01';
  const pricePaise = isFE01 ? '5000000' : 'NULL';
  const deliverables = deliverablesSpecial[s.code] || deliverablesMap[s.category_code] || [];
  const deliverablesJson = JSON.stringify(deliverables).replace(/'/g, "''");
  const adminDesc = isFE01
    ? 'Enterprise Frontend Starting Baseline. Quoted starting value ₹50,000 for client-approved Next.js 16/React 19 interface scope; does not include backend or DB.'
    : `Standard catalog definition for ${s.code} under Category ${s.category_code}. Requires quote-specific pricing and founder approval before publishing.`;

  return `  (
    '${s.code}',
    '${s.category_code}',
    '${s.category_name.replace(/'/g, "''")}',
    '${s.title.replace(/'/g, "''")}',
    '${s.client_scope_summary.replace(/'/g, "''")}',
    '${adminDesc.replace(/'/g, "''")}',
    '${deliverablesJson}'::jsonb,
    'project',
    true,
    ${pricePaise},
    true,
    ${(idx + 1) * 10}
  )`;
});

seedSql += seedRows.join(',\n');
seedSql += `
ON CONFLICT (code) DO UPDATE SET
  category_code = EXCLUDED.category_code,
  category_name = EXCLUDED.category_name,
  title = EXCLUDED.title,
  client_scope_summary = EXCLUDED.client_scope_summary,
  admin_description = EXCLUDED.admin_description,
  default_deliverables = EXCLUDED.default_deliverables,
  unit = EXCLUDED.unit,
  is_one_time = EXCLUDED.is_one_time,
  default_unit_price_paise = EXCLUDED.default_unit_price_paise,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
`;

const securityAndRpcSql = `
-- ── 12. Security & Row-Level Security (RLS) ───────────────────────────────────

-- Enable & Force RLS on all tables
ALTER TABLE public.quotation_services_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_services_catalog FORCE ROW LEVEL SECURITY;

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.quotation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_versions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.quotation_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_line_items FORCE ROW LEVEL SECURITY;

ALTER TABLE public.quotation_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_coupons FORCE ROW LEVEL SECURITY;

ALTER TABLE public.quotation_coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_coupon_redemptions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.quotation_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_acceptances FORCE ROW LEVEL SECURITY;

ALTER TABLE public.quotation_revision_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_revision_requests FORCE ROW LEVEL SECURITY;

ALTER TABLE public.quotation_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_audit_logs FORCE ROW LEVEL SECURITY;

-- Grants
GRANT ALL ON TABLE public.quotation_services_catalog TO service_role;
GRANT SELECT ON TABLE public.quotation_services_catalog TO anon;
GRANT ALL ON TABLE public.quotation_services_catalog TO authenticated;

GRANT ALL ON TABLE public.quotations TO service_role;
GRANT SELECT ON TABLE public.quotations TO anon;
GRANT ALL ON TABLE public.quotations TO authenticated;

GRANT ALL ON TABLE public.quotation_versions TO service_role;
GRANT SELECT ON TABLE public.quotation_versions TO anon;
GRANT ALL ON TABLE public.quotation_versions TO authenticated;

GRANT ALL ON TABLE public.quotation_line_items TO service_role;
GRANT SELECT ON TABLE public.quotation_line_items TO anon;
GRANT ALL ON TABLE public.quotation_line_items TO authenticated;

GRANT ALL ON TABLE public.quotation_coupons TO service_role;
GRANT ALL ON TABLE public.quotation_coupons TO authenticated;

GRANT ALL ON TABLE public.quotation_coupon_redemptions TO service_role;
GRANT ALL ON TABLE public.quotation_coupon_redemptions TO authenticated;

GRANT ALL ON TABLE public.quotation_acceptances TO service_role;
GRANT ALL ON TABLE public.quotation_acceptances TO authenticated;

GRANT ALL ON TABLE public.quotation_revision_requests TO service_role;
GRANT ALL ON TABLE public.quotation_revision_requests TO authenticated;

GRANT ALL ON TABLE public.quotation_audit_logs TO service_role;
GRANT SELECT, INSERT ON TABLE public.quotation_audit_logs TO authenticated;

-- RLS: quotation_services_catalog
DROP POLICY IF EXISTS qsc_service_all ON public.quotation_services_catalog;
CREATE POLICY qsc_service_all ON public.quotation_services_catalog
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS qsc_anon_select ON public.quotation_services_catalog;
CREATE POLICY qsc_anon_select ON public.quotation_services_catalog
  FOR SELECT TO anon USING (is_active = true);

DROP POLICY IF EXISTS qsc_auth_all ON public.quotation_services_catalog;
CREATE POLICY qsc_auth_all ON public.quotation_services_catalog
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
    OR is_active = true
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
  );

-- RLS: quotations
DROP POLICY IF EXISTS q_service_all ON public.quotations;
CREATE POLICY q_service_all ON public.quotations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS q_anon_select ON public.quotations;
CREATE POLICY q_anon_select ON public.quotations
  FOR SELECT TO anon
  USING (
    secure_token IS NOT NULL
    AND status IN ('published', 'accepted', 'revised')
    AND valid_until > now()
  );

DROP POLICY IF EXISTS q_auth_all ON public.quotations;
CREATE POLICY q_auth_all ON public.quotations
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
    OR contact_email = (auth.jwt() ->> 'email')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
  );

-- RLS: quotation_versions
DROP POLICY IF EXISTS qv_service_all ON public.quotation_versions;
CREATE POLICY qv_service_all ON public.quotation_versions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS qv_anon_select ON public.quotation_versions;
CREATE POLICY qv_anon_select ON public.quotation_versions
  FOR SELECT TO anon
  USING (
    quotation_id IN (
      SELECT id FROM public.quotations
      WHERE status IN ('published', 'accepted', 'revised')
    )
  );

DROP POLICY IF EXISTS qv_auth_all ON public.quotation_versions;
CREATE POLICY qv_auth_all ON public.quotation_versions
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
    OR quotation_id IN (
      SELECT id FROM public.quotations
      WHERE contact_email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
  );

-- RLS: quotation_line_items
DROP POLICY IF EXISTS qli_service_all ON public.quotation_line_items;
CREATE POLICY qli_service_all ON public.quotation_line_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS qli_anon_select ON public.quotation_line_items;
CREATE POLICY qli_anon_select ON public.quotation_line_items
  FOR SELECT TO anon
  USING (
    is_selected = true
    AND (quoted_unit_price_paise > 0 OR included_at_no_additional_charge = true)
    AND quotation_id IN (
      SELECT id FROM public.quotations
      WHERE status IN ('published', 'accepted', 'revised')
    )
  );

DROP POLICY IF EXISTS qli_auth_all ON public.quotation_line_items;
CREATE POLICY qli_auth_all ON public.quotation_line_items
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
    OR quotation_id IN (
      SELECT id FROM public.quotations
      WHERE contact_email = (auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
  );

-- RLS: quotation_coupons
DROP POLICY IF EXISTS qc_service_all ON public.quotation_coupons;
CREATE POLICY qc_service_all ON public.quotation_coupons
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS qc_auth_all ON public.quotation_coupons;
CREATE POLICY qc_auth_all ON public.quotation_coupons
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
  );

-- RLS: quotation_coupon_redemptions
DROP POLICY IF EXISTS qcr_service_all ON public.quotation_coupon_redemptions;
CREATE POLICY qcr_service_all ON public.quotation_coupon_redemptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS qcr_auth_all ON public.quotation_coupon_redemptions;
CREATE POLICY qcr_auth_all ON public.quotation_coupon_redemptions
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
    OR signer_email = (auth.jwt() ->> 'email')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
  );

-- RLS: quotation_acceptances
DROP POLICY IF EXISTS qa_service_all ON public.quotation_acceptances;
CREATE POLICY qa_service_all ON public.quotation_acceptances
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS qa_auth_all ON public.quotation_acceptances;
CREATE POLICY qa_auth_all ON public.quotation_acceptances
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
    OR signer_email = (auth.jwt() ->> 'email')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
  );

-- RLS: quotation_revision_requests
DROP POLICY IF EXISTS qrr_service_all ON public.quotation_revision_requests;
CREATE POLICY qrr_service_all ON public.quotation_revision_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS qrr_auth_all ON public.quotation_revision_requests;
CREATE POLICY qrr_auth_all ON public.quotation_revision_requests
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
    OR requester_email = (auth.jwt() ->> 'email')
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
    OR requester_email = (auth.jwt() ->> 'email')
  );

-- RLS: quotation_audit_logs
DROP POLICY IF EXISTS qal_service_all ON public.quotation_audit_logs;
CREATE POLICY qal_service_all ON public.quotation_audit_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS qal_auth_all ON public.quotation_audit_logs;
CREATE POLICY qal_auth_all ON public.quotation_audit_logs
  FOR ALL TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() ->> 'email') LIKE '%@logicintelligencetechnologies.in'
  );

-- ── 13. Atomic RPC Function: accept_quotation_v6 ──────────────────────────────
CREATE OR REPLACE FUNCTION public.accept_quotation_v6(
  p_secure_token text,
  p_signer_name text,
  p_signer_email text,
  p_signer_title text DEFAULT 'Authorized Signatory',
  p_signer_company text DEFAULT '',
  p_expected_total_paise bigint DEFAULT NULL,
  p_terms_hash text DEFAULT NULL,
  p_client_ip text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_quotation RECORD;
  v_version RECORD;
  v_version_id uuid;
  v_acceptance_id uuid;
  v_coupon RECORD;
BEGIN
  -- 1. Input parameter validation
  IF p_secure_token IS NULL OR trim(p_secure_token) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'MISSING_TOKEN', 'message', 'Quotation secure token is required');
  END IF;

  IF p_signer_name IS NULL OR trim(p_signer_name) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'MISSING_NAME', 'message', 'Signer full name is required');
  END IF;

  IF p_signer_email IS NULL OR trim(p_signer_email) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'MISSING_EMAIL', 'message', 'Signer business email is required');
  END IF;

  -- 2. Lookup quotation with row lock
  SELECT * INTO v_quotation
  FROM public.quotations
  WHERE secure_token = trim(p_secure_token)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'QUOTATION_NOT_FOUND', 'message', 'Quotation not found for provided token');
  END IF;

  -- 3. Check current quotation status
  IF v_quotation.status = 'accepted' THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_accepted', true,
      'quotation_id', v_quotation.id,
      'quotation_ref', v_quotation.quotation_ref,
      'accepted_at', v_quotation.accepted_at,
      'message', 'Quotation has already been accepted'
    );
  END IF;

  IF v_quotation.status <> 'published' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_STATUS',
      'message', 'Quotation cannot be accepted because status is ' || v_quotation.status
    );
  END IF;

  -- 4. Expiry validation
  IF v_quotation.valid_until < now() THEN
    UPDATE public.quotations SET status = 'expired', updated_at = now() WHERE id = v_quotation.id;
    RETURN jsonb_build_object(
      'success', false,
      'error', 'QUOTATION_EXPIRED',
      'message', 'Quotation validity period expired on ' || v_quotation.valid_until::text
    );
  END IF;

  -- 5. Total payable verification against expected total
  IF p_expected_total_paise IS NOT NULL AND v_quotation.total_payable_paise <> p_expected_total_paise THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PRICE_MISMATCH',
      'message', 'Quotation total payable (' || v_quotation.total_payable_paise || ' paise) does not match expected (' || p_expected_total_paise || ' paise)'
    );
  END IF;

  -- 6. Locate or link authoritative quotation version
  SELECT * INTO v_version
  FROM public.quotation_versions
  WHERE quotation_id = v_quotation.id
  ORDER BY version_number DESC
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.quotation_versions (
      quotation_id,
      version_number,
      secure_token,
      client_snapshot,
      financial_snapshot,
      content_hash,
      status,
      valid_until
    ) VALUES (
      v_quotation.id,
      v_quotation.latest_version_number,
      v_quotation.secure_token,
      jsonb_build_object('company_name', v_quotation.company_name, 'contact_name', v_quotation.contact_name, 'contact_email', v_quotation.contact_email),
      jsonb_build_object('subtotal_paise', v_quotation.subtotal_paise, 'discount_paise', v_quotation.discount_paise, 'tax_paise', v_quotation.tax_paise, 'total_payable_paise', v_quotation.total_payable_paise),
      md5(v_quotation.id::text || v_quotation.quotation_ref || now()::text),
      'published',
      v_quotation.valid_until
    ) RETURNING * INTO v_version;
  END IF;

  v_version_id := v_version.id;

  -- 7. Insert acceptance record
  INSERT INTO public.quotation_acceptances (
    quotation_id,
    version_id,
    signer_name,
    signer_email,
    signer_title,
    signer_company,
    accepted_total_paise,
    terms_hash,
    client_ip,
    user_agent
  ) VALUES (
    v_quotation.id,
    v_version_id,
    trim(p_signer_name),
    lower(trim(p_signer_email)),
    coalesce(nullif(trim(p_signer_title), ''), 'Authorized Signatory'),
    coalesce(nullif(trim(p_signer_company), ''), v_quotation.company_name),
    v_quotation.total_payable_paise,
    coalesce(nullif(trim(p_terms_hash), ''), md5(v_quotation.id::text || v_version_id::text || now()::text)),
    p_client_ip,
    p_user_agent
  )
  ON CONFLICT (quotation_id, version_id) DO UPDATE
    SET signer_name = EXCLUDED.signer_name,
        signer_email = EXCLUDED.signer_email,
        signer_title = EXCLUDED.signer_title,
        signer_company = EXCLUDED.signer_company,
        accepted_total_paise = EXCLUDED.accepted_total_paise
  RETURNING id INTO v_acceptance_id;

  -- 8. Update quotation status to accepted
  UPDATE public.quotations
  SET status = 'accepted',
      accepted_at = now(),
      updated_at = now()
  WHERE id = v_quotation.id;

  -- 9. Handle coupon redemption accounting
  IF v_quotation.applied_coupon_code IS NOT NULL AND trim(v_quotation.applied_coupon_code) <> '' THEN
    SELECT * INTO v_coupon
    FROM public.quotation_coupons
    WHERE code = upper(trim(v_quotation.applied_coupon_code))
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.quotation_coupons
      SET redemptions_count = redemptions_count + 1,
          updated_at = now()
      WHERE id = v_coupon.id;

      INSERT INTO public.quotation_coupon_redemptions (
        coupon_id,
        quotation_id,
        version_id,
        client_id,
        discount_paise,
        signer_email
      ) VALUES (
        v_coupon.id,
        v_quotation.id,
        v_version_id,
        v_quotation.client_id,
        v_quotation.discount_paise,
        lower(trim(p_signer_email))
      )
      ON CONFLICT (coupon_id, quotation_id) DO NOTHING;
    END IF;
  END IF;

  -- 10. Advance linked client engagement stage if connected
  IF v_quotation.engagement_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'client_engagements') THEN
      UPDATE public.client_engagements
      SET current_stage = CASE
            WHEN current_stage IN ('checklist', 'discovery', 'proposal') THEN 'acceptance'
            ELSE current_stage
          END,
          updated_at = now()
      WHERE id = v_quotation.engagement_id;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'engagement_stages') THEN
      UPDATE public.engagement_stages
      SET status = 'completed',
          notes = coalesce(notes || ' | ', '') || 'Quotation accepted on ' || to_char(now(), 'YYYY-MM-DD HH24:MI:SS UTC')
      WHERE engagement_id = v_quotation.engagement_id AND stage_key IN ('proposal', 'acceptance');

      UPDATE public.engagement_stages
      SET status = 'available',
          unlocked_at = coalesce(unlocked_at, now())
      WHERE engagement_id = v_quotation.engagement_id AND stage_key = 'sow' AND status = 'locked';
    END IF;
  END IF;

  -- 11. Record immutable audit event
  INSERT INTO public.quotation_audit_logs (
    quotation_id,
    action,
    actor_email,
    details,
    ip_address
  ) VALUES (
    v_quotation.id,
    'quotation_accepted',
    lower(trim(p_signer_email)),
    jsonb_build_object(
      'acceptance_id', v_acceptance_id,
      'version_id', v_version_id,
      'quotation_ref', v_quotation.quotation_ref,
      'signer_name', p_signer_name,
      'signer_email', p_signer_email,
      'signer_title', p_signer_title,
      'signer_company', p_signer_company,
      'accepted_total_paise', v_quotation.total_payable_paise,
      'milestone1_paise', v_quotation.milestone1_paise,
      'milestone2_paise', v_quotation.milestone2_paise,
      'applied_coupon_code', v_quotation.applied_coupon_code,
      'engagement_id', v_quotation.engagement_id
    ),
    p_client_ip
  );

  RETURN jsonb_build_object(
    'success', true,
    'quotation_id', v_quotation.id,
    'quotation_ref', v_quotation.quotation_ref,
    'acceptance_id', v_acceptance_id,
    'version_id', v_version_id,
    'status', 'accepted',
    'accepted_total_paise', v_quotation.total_payable_paise,
    'milestone1_paise', v_quotation.milestone1_paise,
    'milestone2_paise', v_quotation.milestone2_paise,
    'accepted_at', now()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.accept_quotation_v6 FROM public;
GRANT EXECUTE ON FUNCTION public.accept_quotation_v6 TO anon, authenticated, service_role;

-- ── 14. Atomic RPC Function: request_quotation_revision_v6 ────────────────────
CREATE OR REPLACE FUNCTION public.request_quotation_revision_v6(
  p_secure_token text,
  p_requester_name text,
  p_requester_email text,
  p_notes text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_quotation RECORD;
  v_version RECORD;
  v_request_id uuid;
BEGIN
  IF p_secure_token IS NULL OR trim(p_secure_token) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'MISSING_TOKEN', 'message', 'Quotation secure token is required');
  END IF;

  IF p_notes IS NULL OR trim(p_notes) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'MISSING_NOTES', 'message', 'Revision notes are required');
  END IF;

  SELECT * INTO v_quotation
  FROM public.quotations
  WHERE secure_token = trim(p_secure_token)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'QUOTATION_NOT_FOUND', 'message', 'Quotation not found');
  END IF;

  IF v_quotation.status NOT IN ('published', 'changes_requested') THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_STATUS', 'message', 'Revisions can only be requested on published quotations');
  END IF;

  SELECT * INTO v_version
  FROM public.quotation_versions
  WHERE quotation_id = v_quotation.id
  ORDER BY version_number DESC
  LIMIT 1;

  INSERT INTO public.quotation_revision_requests (
    quotation_id,
    version_id,
    requester_name,
    requester_email,
    notes,
    status
  ) VALUES (
    v_quotation.id,
    v_version.id,
    coalesce(trim(p_requester_name), v_quotation.contact_name),
    coalesce(lower(trim(p_requester_email)), v_quotation.contact_email),
    trim(p_notes),
    'pending'
  ) RETURNING id INTO v_request_id;

  UPDATE public.quotations
  SET status = 'changes_requested',
      updated_at = now()
  WHERE id = v_quotation.id;

  INSERT INTO public.quotation_audit_logs (
    quotation_id,
    action,
    actor_email,
    details
  ) VALUES (
    v_quotation.id,
    'revision_requested',
    coalesce(lower(trim(p_requester_email)), v_quotation.contact_email),
    jsonb_build_object(
      'request_id', v_request_id,
      'notes', trim(p_notes),
      'requester_name', p_requester_name
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'quotation_id', v_quotation.id,
    'quotation_ref', v_quotation.quotation_ref,
    'request_id', v_request_id,
    'status', 'changes_requested'
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.request_quotation_revision_v6 FROM public;
GRANT EXECUTE ON FUNCTION public.request_quotation_revision_v6 TO anon, authenticated, service_role;

COMMIT;
`;

const finalSql = migrationSql + seedSql + securityAndRpcSql;
const targetPath = '/Users/vikash/lit-infrastructure/logicintelligencetechnologies/supabase/migrations/20261015040000_v6_quotations_and_service_catalog.sql';
fs.writeFileSync(targetPath, finalSql, 'utf8');
console.log('Successfully written migration to', targetPath, 'length:', finalSql.length);
