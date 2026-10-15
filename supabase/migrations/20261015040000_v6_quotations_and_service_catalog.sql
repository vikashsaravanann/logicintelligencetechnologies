-- Migration: 20261015040000_v6_quotations_and_service_catalog.sql
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
-- Seeding 77 Canonical Services across Categories A through H
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
  (
    'DS-01',
    'A',
    'Discovery, Website Strategy & Experience Design',
    'Digital Product Discovery & Requirements Architecture',
    'Requirements workshops, functionality matrix, success criteria and scope baseline',
    'Standard catalog definition for DS-01 under Category A. Requires quote-specific pricing and founder approval before publishing.',
    '["Requirements Matrix & Feature Catalog","User Journeys & Experience Specification","Agreed Scope Baseline & Deliverables Sign-Off"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    10
  ),
  (
    'DS-02',
    'A',
    'Discovery, Website Strategy & Experience Design',
    'Website Strategy & Information Architecture',
    'Sitemap, content hierarchy, user journeys and page-level scope',
    'Standard catalog definition for DS-02 under Category A. Requires quote-specific pricing and founder approval before publishing.',
    '["Requirements Matrix & Feature Catalog","User Journeys & Experience Specification","Agreed Scope Baseline & Deliverables Sign-Off"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    20
  ),
  (
    'DS-03',
    'A',
    'Discovery, Website Strategy & Experience Design',
    'UX Research & User Journey Design',
    'User flows, wireframes and experience requirements within agreed personas',
    'Standard catalog definition for DS-03 under Category A. Requires quote-specific pricing and founder approval before publishing.',
    '["Requirements Matrix & Feature Catalog","User Journeys & Experience Specification","Agreed Scope Baseline & Deliverables Sign-Off"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    30
  ),
  (
    'DS-04',
    'A',
    'Discovery, Website Strategy & Experience Design',
    'UI Design System & Component Specification',
    'Approved typography, color tokens, accessible interface kit and component specification',
    'Standard catalog definition for DS-04 under Category A. Requires quote-specific pricing and founder approval before publishing.',
    '["Requirements Matrix & Feature Catalog","User Journeys & Experience Specification","Agreed Scope Baseline & Deliverables Sign-Off"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    40
  ),
  (
    'DS-05',
    'A',
    'Discovery, Website Strategy & Experience Design',
    'Responsive Website Experience Design',
    'Desktop/tablet/mobile page designs and review cycles within quoted screen count',
    'Standard catalog definition for DS-05 under Category A. Requires quote-specific pricing and founder approval before publishing.',
    '["Requirements Matrix & Feature Catalog","User Journeys & Experience Specification","Agreed Scope Baseline & Deliverables Sign-Off"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    50
  ),
  (
    'DS-06',
    'A',
    'Discovery, Website Strategy & Experience Design',
    'Brand-to-Digital Interface Adaptation',
    'Application of client-supplied identity into approved page layouts; no trademark transfer implied',
    'Standard catalog definition for DS-06 under Category A. Requires quote-specific pricing and founder approval before publishing.',
    '["Requirements Matrix & Feature Catalog","User Journeys & Experience Specification","Agreed Scope Baseline & Deliverables Sign-Off"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    60
  ),
  (
    'DS-07',
    'A',
    'Discovery, Website Strategy & Experience Design',
    'Conversion-Focused Landing Page Design',
    'Single or specified landing-page layouts, forms placement and call-to-action planning',
    'Standard catalog definition for DS-07 under Category A. Requires quote-specific pricing and founder approval before publishing.',
    '["Requirements Matrix & Feature Catalog","User Journeys & Experience Specification","Agreed Scope Baseline & Deliverables Sign-Off"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    70
  ),
  (
    'DS-08',
    'A',
    'Discovery, Website Strategy & Experience Design',
    'Content Architecture & Content Migration Planning',
    'Content mapping and approved migration plan; actual migration is separate unless priced',
    'Standard catalog definition for DS-08 under Category A. Requires quote-specific pricing and founder approval before publishing.',
    '["Requirements Matrix & Feature Catalog","User Journeys & Experience Specification","Agreed Scope Baseline & Deliverables Sign-Off"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    80
  ),
  (
    'FE-01',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Enterprise Frontend Engineering — Next.js 16, React 19 & TypeScript',
    'Client-approved frontend interface implementation; default quoted starting value ₹50,000 for the specifically scoped project; does NOT imply bespoke backend, database, admin portal, AI, hosting or domain services',
    'Enterprise Frontend Starting Baseline. Quoted starting value ₹50,000 for client-approved Next.js 16/React 19 interface scope; does not include backend or DB.',
    '["Production Next.js 16 App Router Setup","React 19 & TypeScript Component Architecture","Responsive Desktop, Tablet & Mobile Views","Tailwind CSS Design System Implementation","Interactive Form Validation & State Management"]'::jsonb,
    'project',
    true,
    5000000,
    true,
    90
  ),
  (
    'FE-02',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Responsive Multi-Page Corporate Website Development',
    'Build approved marketing pages, reusable navigation and responsive layouts',
    'Standard catalog definition for FE-02 under Category B. Requires quote-specific pricing and founder approval before publishing.',
    '["Responsive Component Implementation","Interactive State & Validation Architecture","Cross-Device & Viewport Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    100
  ),
  (
    'FE-03',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Advanced Web Application Interface Engineering',
    'Complex authenticated interface components, business forms and app views; server logic separately scoped',
    'Standard catalog definition for FE-03 under Category B. Requires quote-specific pricing and founder approval before publishing.',
    '["Responsive Component Implementation","Interactive State & Validation Architecture","Cross-Device & Viewport Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    110
  ),
  (
    'FE-04',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Client Self-Service Portal Interface Development',
    'Client-facing tasks, dashboards and authorized account UX; auth/backend separately priced unless included by name',
    'Standard catalog definition for FE-04 under Category B. Requires quote-specific pricing and founder approval before publishing.',
    '["Responsive Component Implementation","Interactive State & Validation Architecture","Cross-Device & Viewport Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    120
  ),
  (
    'FE-05',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Business Operations Dashboard Interface Development',
    'Operational KPI visualization UI; actual data connectors and analytics separately scoped',
    'Standard catalog definition for FE-05 under Category B. Requires quote-specific pricing and founder approval before publishing.',
    '["Responsive Component Implementation","Interactive State & Validation Architecture","Cross-Device & Viewport Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    130
  ),
  (
    'FE-06',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Custom Administrative Dashboard Interface Engineering',
    'Admin screens, tables and settings UI; secure role and server permissions separately scoped',
    'Standard catalog definition for FE-06 under Category B. Requires quote-specific pricing and founder approval before publishing.',
    '["Responsive Component Implementation","Interactive State & Validation Architecture","Cross-Device & Viewport Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    140
  ),
  (
    'FE-07',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Dynamic Forms & Workflow Interface Engineering',
    'Field validation, stepper UX and browser interactions; persistence/integration separately scoped',
    'Standard catalog definition for FE-07 under Category B. Requires quote-specific pricing and founder approval before publishing.',
    '["Responsive Component Implementation","Interactive State & Validation Architecture","Cross-Device & Viewport Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    150
  ),
  (
    'FE-08',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Headless CMS Frontend Integration',
    'Display approved CMS content through an authorized content API; CMS provisioning separately scoped',
    'Standard catalog definition for FE-08 under Category B. Requires quote-specific pricing and founder approval before publishing.',
    '["Responsive Component Implementation","Interactive State & Validation Architecture","Cross-Device & Viewport Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    160
  ),
  (
    'FE-09',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Multilingual & Localization Interface Engineering',
    'Localized frontend strings, routing and language selector in named supported languages',
    'Standard catalog definition for FE-09 under Category B. Requires quote-specific pricing and founder approval before publishing.',
    '["Responsive Component Implementation","Interactive State & Validation Architecture","Cross-Device & Viewport Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    170
  ),
  (
    'FE-10',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Web Accessibility & Inclusive Interaction Engineering',
    'Keyboard navigation, semantic components and agreed WCAG testing scope',
    'Standard catalog definition for FE-10 under Category B. Requires quote-specific pricing and founder approval before publishing.',
    '["Responsive Component Implementation","Interactive State & Validation Architecture","Cross-Device & Viewport Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    180
  ),
  (
    'FE-11',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Frontend Performance & Core Web Vitals Optimization',
    'Measured bundle, asset, rendering and loading improvements against defined baselines',
    'Standard catalog definition for FE-11 under Category B. Requires quote-specific pricing and founder approval before publishing.',
    '["Responsive Component Implementation","Interactive State & Validation Architecture","Cross-Device & Viewport Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    190
  ),
  (
    'FE-12',
    'B',
    'Frontend & Interactive Web Application Engineering',
    'Motion Design & Interactive UI Animation',
    'Purposeful page, form and status transitions with reduced-motion compliance',
    'Standard catalog definition for FE-12 under Category B. Requires quote-specific pricing and founder approval before publishing.',
    '["Responsive Component Implementation","Interactive State & Validation Architecture","Cross-Device & Viewport Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    200
  ),
  (
    'BE-01',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Backend Application & REST/GraphQL API Engineering',
    'Production server endpoints, validated data contracts, error handling and documentation',
    'Standard catalog definition for BE-01 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    210
  ),
  (
    'BE-02',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Identity, Authentication & Session Management',
    'Secure sign-in, invitations, session controls and passwordless flows as agreed',
    'Standard catalog definition for BE-02 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    220
  ),
  (
    'BE-03',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Role-Based Access Control & Authorization Engineering',
    'Granular capabilities, server-side enforcement and access review evidence',
    'Standard catalog definition for BE-03 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    230
  ),
  (
    'BE-04',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Multi-Tenant Client Isolation & Data Security',
    'Tenant membership, ownership checks and tenant-separation tests',
    'Standard catalog definition for BE-04 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    240
  ),
  (
    'BE-05',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Custom Admin Operations Console — Full-Stack',
    'Approved admin workflows with actual backend, database, authorization and auditable mutations',
    'Standard catalog definition for BE-05 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    250
  ),
  (
    'BE-06',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Client Portal & Project Workflow Backend',
    'Real client submissions, project state machine, staff-review queues and audit events',
    'Standard catalog definition for BE-06 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    260
  ),
  (
    'BE-07',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Payment Request & Billing Workflow Engineering',
    'Contract-linked payments, request statuses and reconciliation workflow; never promises payment gateway unless priced',
    'Standard catalog definition for BE-07 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    270
  ),
  (
    'BE-08',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Document Issuance, Approval & E-Signature Integration',
    'Versioned PDFs, controlled review/consent and compatible signing provider integration when agreed',
    'Standard catalog definition for BE-08 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    280
  ),
  (
    'BE-09',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Real-Time Messaging & Notification Backend',
    'Persisted conversations, authorization, read state and notification delivery mechanisms',
    'Standard catalog definition for BE-09 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    290
  ),
  (
    'BE-10',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Third-Party API Integration & Webhook Engineering',
    'Specified external API, inbound/outbound webhook processing, retries and security validation',
    'Standard catalog definition for BE-10 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    300
  ),
  (
    'BE-11',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Custom Business Workflow & Approval Engine',
    'State transitions, authorization gates, queues and audit requirements for named business operations',
    'Standard catalog definition for BE-11 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    310
  ),
  (
    'BE-12',
    'C',
    'Backend Applications, APIs & Business Systems',
    'Reporting & Management Analytics Backend',
    'Verified KPI computations and client-scoped/report authorization; dashboards UI separately scoped',
    'Standard catalog definition for BE-12 under Category C. Requires quote-specific pricing and founder approval before publishing.',
    '["Production API Endpoints & Request Handlers","Secure Authentication & Capability Enforcement","Data Validation Contracts & Operational Runbook"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    320
  ),
  (
    'DB-01',
    'D',
    'Database, Supabase & Data Architecture',
    'Relational Database Architecture & Schema Design',
    'ERD, PostgreSQL schema, relationships, indexes and data constraints',
    'Standard catalog definition for DB-01 under Category D. Requires quote-specific pricing and founder approval before publishing.',
    '["Relational Schema & Constraints DDL","Audited Row-Level Security Policies","Optimized Queries & Persistence Storage Layer"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    330
  ),
  (
    'DB-02',
    'D',
    'Database, Supabase & Data Architecture',
    'Supabase & PostgreSQL Implementation',
    'Supabase project integration, schema provisioning and application query layers',
    'Standard catalog definition for DB-02 under Category D. Requires quote-specific pricing and founder approval before publishing.',
    '["Relational Schema & Constraints DDL","Audited Row-Level Security Policies","Optimized Queries & Persistence Storage Layer"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    340
  ),
  (
    'DB-03',
    'D',
    'Database, Supabase & Data Architecture',
    'Row-Level Security & Database Authorization',
    'Audited RLS policies, isolated tenant data and denial-case tests',
    'Standard catalog definition for DB-03 under Category D. Requires quote-specific pricing and founder approval before publishing.',
    '["Relational Schema & Constraints DDL","Audited Row-Level Security Policies","Optimized Queries & Persistence Storage Layer"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    350
  ),
  (
    'DB-04',
    'D',
    'Database, Supabase & Data Architecture',
    'Database Migrations & Legacy Data Integration',
    'Idempotent/reviewed schema migration and approved mapped import data',
    'Standard catalog definition for DB-04 under Category D. Requires quote-specific pricing and founder approval before publishing.',
    '["Relational Schema & Constraints DDL","Audited Row-Level Security Policies","Optimized Queries & Persistence Storage Layer"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    360
  ),
  (
    'DB-05',
    'D',
    'Database, Supabase & Data Architecture',
    'Secure Object Storage & Document Vault',
    'Private buckets, signed/streaming downloads, virus and permission checks',
    'Standard catalog definition for DB-05 under Category D. Requires quote-specific pricing and founder approval before publishing.',
    '["Relational Schema & Constraints DDL","Audited Row-Level Security Policies","Optimized Queries & Persistence Storage Layer"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    370
  ),
  (
    'DB-06',
    'D',
    'Database, Supabase & Data Architecture',
    'Data Synchronization & Event-Driven Persistence',
    'Durable jobs, event queues, deduplication and supported system synchronization',
    'Standard catalog definition for DB-06 under Category D. Requires quote-specific pricing and founder approval before publishing.',
    '["Relational Schema & Constraints DDL","Audited Row-Level Security Policies","Optimized Queries & Persistence Storage Layer"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    380
  ),
  (
    'DB-07',
    'D',
    'Database, Supabase & Data Architecture',
    'Data Reporting Model & Analytics Warehouse Preparation',
    'Governed reporting tables/views and lineage for agreed metrics',
    'Standard catalog definition for DB-07 under Category D. Requires quote-specific pricing and founder approval before publishing.',
    '["Relational Schema & Constraints DDL","Audited Row-Level Security Policies","Optimized Queries & Persistence Storage Layer"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    390
  ),
  (
    'DB-08',
    'D',
    'Database, Supabase & Data Architecture',
    'Backup, Recovery & Data Retention Architecture',
    'Tested recovery plan, provider-compatible backups and retention standards',
    'Standard catalog definition for DB-08 under Category D. Requires quote-specific pricing and founder approval before publishing.',
    '["Relational Schema & Constraints DDL","Audited Row-Level Security Policies","Optimized Queries & Persistence Storage Layer"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    400
  ),
  (
    'AI-01',
    'E',
    'AI Solutions, RAG & Intelligent Automation',
    'AI Website Chatbot & Customer Assistance Engineering',
    'Website chat interface, supported knowledge/FAQ behavior and human escalation',
    'Standard catalog definition for AI-01 under Category E. Requires quote-specific pricing and founder approval before publishing.',
    '["AI Model Orchestration & Prompts Pipeline","Grounding & Context Retrieval Verification","Safety Controls & Output Validation Fixtures"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    410
  ),
  (
    'AI-02',
    'E',
    'AI Solutions, RAG & Intelligent Automation',
    'Retrieval-Augmented Generation (RAG) Knowledge Assistant',
    'Document ingestion, retrieval grounding, access control and citations/evaluation',
    'Standard catalog definition for AI-02 under Category E. Requires quote-specific pricing and founder approval before publishing.',
    '["AI Model Orchestration & Prompts Pipeline","Grounding & Context Retrieval Verification","Safety Controls & Output Validation Fixtures"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    420
  ),
  (
    'AI-03',
    'E',
    'AI Solutions, RAG & Intelligent Automation',
    'LLM API Integration & Model Orchestration',
    'Approved provider APIs, provider configuration, retry/fallback and usage controls',
    'Standard catalog definition for AI-03 under Category E. Requires quote-specific pricing and founder approval before publishing.',
    '["AI Model Orchestration & Prompts Pipeline","Grounding & Context Retrieval Verification","Safety Controls & Output Validation Fixtures"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    430
  ),
  (
    'AI-04',
    'E',
    'AI Solutions, RAG & Intelligent Automation',
    'AI Agent & Tool-Calling Workflow Integration',
    'Guarded agent actions over approved APIs with explicit human approval for sensitive operations',
    'Standard catalog definition for AI-04 under Category E. Requires quote-specific pricing and founder approval before publishing.',
    '["AI Model Orchestration & Prompts Pipeline","Grounding & Context Retrieval Verification","Safety Controls & Output Validation Fixtures"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    440
  ),
  (
    'AI-05',
    'E',
    'AI Solutions, RAG & Intelligent Automation',
    'Voice AI Assistant & Speech Interface Engineering',
    'Agreed speech-to-text, text-to-speech and audio/voice UX integrations',
    'Standard catalog definition for AI-05 under Category E. Requires quote-specific pricing and founder approval before publishing.',
    '["AI Model Orchestration & Prompts Pipeline","Grounding & Context Retrieval Verification","Safety Controls & Output Validation Fixtures"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    450
  ),
  (
    'AI-06',
    'E',
    'AI Solutions, RAG & Intelligent Automation',
    'Vector Search & Embedding Infrastructure',
    'Embeddings pipeline, vector storage and retrieval-quality validation',
    'Standard catalog definition for AI-06 under Category E. Requires quote-specific pricing and founder approval before publishing.',
    '["AI Model Orchestration & Prompts Pipeline","Grounding & Context Retrieval Verification","Safety Controls & Output Validation Fixtures"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    460
  ),
  (
    'AI-07',
    'E',
    'AI Solutions, RAG & Intelligent Automation',
    'AI Lead Qualification & CRM Handoff',
    'Defined lead capture, structured extraction, human review and CRM creation',
    'Standard catalog definition for AI-07 under Category E. Requires quote-specific pricing and founder approval before publishing.',
    '["AI Model Orchestration & Prompts Pipeline","Grounding & Context Retrieval Verification","Safety Controls & Output Validation Fixtures"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    470
  ),
  (
    'AI-08',
    'E',
    'AI Solutions, RAG & Intelligent Automation',
    'AI Response Evaluation, Safety & Usage Monitoring',
    'Evaluation datasets, response testing, grounding checks and observability',
    'Standard catalog definition for AI-08 under Category E. Requires quote-specific pricing and founder approval before publishing.',
    '["AI Model Orchestration & Prompts Pipeline","Grounding & Context Retrieval Verification","Safety Controls & Output Validation Fixtures"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    480
  ),
  (
    'CL-01',
    'F',
    'Cloud, Hosting, DevOps & Web Infrastructure',
    'Cloud Solution Architecture & Environment Planning',
    'Approved frontend/backend/data hosting topology, scale and operational boundaries',
    'Standard catalog definition for CL-01 under Category F. Requires quote-specific pricing and founder approval before publishing.',
    '["Cloud Infrastructure Deployment Topology","Automated CI/CD Pipeline & Build Configuration","Domain, SSL & Health Monitoring Dashboards"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    490
  ),
  (
    'CL-02',
    'F',
    'Cloud, Hosting, DevOps & Web Infrastructure',
    'Vercel Frontend Deployment & Configuration',
    'Existing/new authorized Vercel project integration, build settings and release validation',
    'Standard catalog definition for CL-02 under Category F. Requires quote-specific pricing and founder approval before publishing.',
    '["Vercel Project Setup & Custom Domain Mapping","Build Optimization & Edge Routing Rules","Environment Variables & Production Deployment Validation"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    500
  ),
  (
    'CL-03',
    'F',
    'Cloud, Hosting, DevOps & Web Infrastructure',
    'Render Backend Service Deployment & Operations',
    'Backend deployment, health checks and environment separation where needed',
    'Standard catalog definition for CL-03 under Category F. Requires quote-specific pricing and founder approval before publishing.',
    '["Cloud Infrastructure Deployment Topology","Automated CI/CD Pipeline & Build Configuration","Domain, SSL & Health Monitoring Dashboards"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    510
  ),
  (
    'CL-04',
    'F',
    'Cloud, Hosting, DevOps & Web Infrastructure',
    'Supabase Environment Provisioning & Configuration',
    'Auth/storage/network/project configuration; database schema work separately scoped',
    'Standard catalog definition for CL-04 under Category F. Requires quote-specific pricing and founder approval before publishing.',
    '["Cloud Infrastructure Deployment Topology","Automated CI/CD Pipeline & Build Configuration","Domain, SSL & Health Monitoring Dashboards"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    520
  ),
  (
    'CL-05',
    'F',
    'Cloud, Hosting, DevOps & Web Infrastructure',
    'Domain, DNS & SSL/TLS Configuration',
    'Customer-controlled domain mapping, DNS records, HTTPS and canonical redirect checks',
    'Standard catalog definition for CL-05 under Category F. Requires quote-specific pricing and founder approval before publishing.',
    '["Cloud Infrastructure Deployment Topology","Automated CI/CD Pipeline & Build Configuration","Domain, SSL & Health Monitoring Dashboards"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    530
  ),
  (
    'CL-06',
    'F',
    'Cloud, Hosting, DevOps & Web Infrastructure',
    'GitHub Repository, CI/CD & Release Engineering',
    'Source control, branch checks, build/test workflow and reviewable release procedure',
    'Standard catalog definition for CL-06 under Category F. Requires quote-specific pricing and founder approval before publishing.',
    '["Cloud Infrastructure Deployment Topology","Automated CI/CD Pipeline & Build Configuration","Domain, SSL & Health Monitoring Dashboards"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    540
  ),
  (
    'CL-07',
    'F',
    'Cloud, Hosting, DevOps & Web Infrastructure',
    'Staging, Preview & User Acceptance Environments',
    'Controlled preview deployment, isolated test records and client review access',
    'Standard catalog definition for CL-07 under Category F. Requires quote-specific pricing and founder approval before publishing.',
    '["Cloud Infrastructure Deployment Topology","Automated CI/CD Pipeline & Build Configuration","Domain, SSL & Health Monitoring Dashboards"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    550
  ),
  (
    'CL-08',
    'F',
    'Cloud, Hosting, DevOps & Web Infrastructure',
    'Content Delivery Network & Edge Cache Optimization',
    'CDN/cache configuration, invalidation behavior and consistency tests',
    'Standard catalog definition for CL-08 under Category F. Requires quote-specific pricing and founder approval before publishing.',
    '["Cloud Infrastructure Deployment Topology","Automated CI/CD Pipeline & Build Configuration","Domain, SSL & Health Monitoring Dashboards"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    560
  ),
  (
    'CL-09',
    'F',
    'Cloud, Hosting, DevOps & Web Infrastructure',
    'Application Monitoring, Logs & Incident Alerting',
    'Availability checks, actionable alerts and safe application diagnostics',
    'Standard catalog definition for CL-09 under Category F. Requires quote-specific pricing and founder approval before publishing.',
    '["Cloud Infrastructure Deployment Topology","Automated CI/CD Pipeline & Build Configuration","Domain, SSL & Health Monitoring Dashboards"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    570
  ),
  (
    'CL-10',
    'F',
    'Cloud, Hosting, DevOps & Web Infrastructure',
    'Business Continuity & Recovery Readiness',
    'Restore verification, rollback runbook and recovery coordination for agreed systems',
    'Standard catalog definition for CL-10 under Category F. Requires quote-specific pricing and founder approval before publishing.',
    '["Cloud Infrastructure Deployment Topology","Automated CI/CD Pipeline & Build Configuration","Domain, SSL & Health Monitoring Dashboards"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    580
  ),
  (
    'IN-01',
    'G',
    'Integrations, Growth & Business Automations',
    'Business Email & Transactional Notification Integration',
    'Authorized SMTP/provider connection, templates, delivery event logging and testing',
    'Standard catalog definition for IN-01 under Category G. Requires quote-specific pricing and founder approval before publishing.',
    '["Authorized API Integration & Credentials Isolation","Event Handlers & Ingestion Pipeline","Operational Retries & Webhook Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    590
  ),
  (
    'IN-02',
    'G',
    'Integrations, Growth & Business Automations',
    'WhatsApp Business Messaging Integration',
    'Official provider/API integration where available; excludes manual share-link composition',
    'Standard catalog definition for IN-02 under Category G. Requires quote-specific pricing and founder approval before publishing.',
    '["Authorized API Integration & Credentials Isolation","Event Handlers & Ingestion Pipeline","Operational Retries & Webhook Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    600
  ),
  (
    'IN-03',
    'G',
    'Integrations, Growth & Business Automations',
    'CRM, Lead Capture & Sales Pipeline Integration',
    'Named lead source, CRM fields, assignment rules and duplicate control',
    'Standard catalog definition for IN-03 under Category G. Requires quote-specific pricing and founder approval before publishing.',
    '["Authorized API Integration & Credentials Isolation","Event Handlers & Ingestion Pipeline","Operational Retries & Webhook Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    610
  ),
  (
    'IN-04',
    'G',
    'Integrations, Growth & Business Automations',
    'Scheduling, Booking & Calendar Integration',
    'Appointment availability/confirmation with named calendar provider',
    'Standard catalog definition for IN-04 under Category G. Requires quote-specific pricing and founder approval before publishing.',
    '["Authorized API Integration & Credentials Isolation","Event Handlers & Ingestion Pipeline","Operational Retries & Webhook Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    620
  ),
  (
    'IN-05',
    'G',
    'Integrations, Growth & Business Automations',
    'UPI Payment Experience & Manual Reconciliation Integration',
    'Contract-backed payment requests, amount-specific QR, UTR and owner bank verification',
    'Standard catalog definition for IN-05 under Category G. Requires quote-specific pricing and founder approval before publishing.',
    '["UPI Dynamic QR Code Integration & Display UX","UTR Reference Ingestion & Transaction Reconciliation Interface","Owner Verification & Audit Trail Logging"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    630
  ),
  (
    'IN-06',
    'G',
    'Integrations, Growth & Business Automations',
    'n8n Workflow Automation & Integration Orchestration',
    'Versioned workflows, credentials boundaries, retries, audit and operational ownership',
    'Standard catalog definition for IN-06 under Category G. Requires quote-specific pricing and founder approval before publishing.',
    '["Authorized API Integration & Credentials Isolation","Event Handlers & Ingestion Pipeline","Operational Retries & Webhook Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    640
  ),
  (
    'IN-07',
    'G',
    'Integrations, Growth & Business Automations',
    'Technical SEO, Search Console & Sitemap Integration',
    'Canonical metadata, robots, validated sitemap and Search Console setup; indexing not guaranteed',
    'Standard catalog definition for IN-07 under Category G. Requires quote-specific pricing and founder approval before publishing.',
    '["Authorized API Integration & Credentials Isolation","Event Handlers & Ingestion Pipeline","Operational Retries & Webhook Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    650
  ),
  (
    'IN-08',
    'G',
    'Integrations, Growth & Business Automations',
    'Analytics, Conversion Tracking & Event Measurement',
    'Privacy-aware measurement plan, implemented events and reporting validation',
    'Standard catalog definition for IN-08 under Category G. Requires quote-specific pricing and founder approval before publishing.',
    '["Authorized API Integration & Credentials Isolation","Event Handlers & Ingestion Pipeline","Operational Retries & Webhook Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    660
  ),
  (
    'IN-09',
    'G',
    'Integrations, Growth & Business Automations',
    'Maps, Location & Geospatial API Integration',
    'Agreed map provider, location features, key restrictions and usage accounting',
    'Standard catalog definition for IN-09 under Category G. Requires quote-specific pricing and founder approval before publishing.',
    '["Authorized API Integration & Credentials Isolation","Event Handlers & Ingestion Pipeline","Operational Retries & Webhook Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    670
  ),
  (
    'IN-10',
    'G',
    'Integrations, Growth & Business Automations',
    'E-Commerce Catalog & Checkout Integration',
    'Specified catalog, checkout provider and tax/payment compliance requirements',
    'Standard catalog definition for IN-10 under Category G. Requires quote-specific pricing and founder approval before publishing.',
    '["Authorized API Integration & Credentials Isolation","Event Handlers & Ingestion Pipeline","Operational Retries & Webhook Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    680
  ),
  (
    'IN-11',
    'G',
    'Integrations, Growth & Business Automations',
    'Custom External Service & Enterprise Systems Integration',
    'Explicitly named provider/workflow and approved integration acceptance tests',
    'Standard catalog definition for IN-11 under Category G. Requires quote-specific pricing and founder approval before publishing.',
    '["Authorized API Integration & Credentials Isolation","Event Handlers & Ingestion Pipeline","Operational Retries & Webhook Verification"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    690
  ),
  (
    'QA-01',
    'H',
    'Engineering Quality, Launch & Aftercare',
    'Cross-Browser & Responsive Quality Assurance',
    'Target browser/device coverage and reportable defect outcomes',
    'Standard catalog definition for QA-01 under Category H. Requires quote-specific pricing and founder approval before publishing.',
    '["Automated Test Suites & Passing CI Verification","Handover Architecture & Operations Documentation","Release Readiness Sign-Off & Client Walkthrough"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    700
  ),
  (
    'QA-02',
    'H',
    'Engineering Quality, Launch & Aftercare',
    'Automated Unit, Integration & E2E Test Engineering',
    'Version-controlled tests and passing CI evidence for agreed functionality',
    'Standard catalog definition for QA-02 under Category H. Requires quote-specific pricing and founder approval before publishing.',
    '["Automated Test Suites & Passing CI Verification","Handover Architecture & Operations Documentation","Release Readiness Sign-Off & Client Walkthrough"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    710
  ),
  (
    'QA-03',
    'H',
    'Engineering Quality, Launch & Aftercare',
    'Application Security Hardening & Verification',
    'Agreed threat modeling, secret protection and authorization testing',
    'Standard catalog definition for QA-03 under Category H. Requires quote-specific pricing and founder approval before publishing.',
    '["Automated Test Suites & Passing CI Verification","Handover Architecture & Operations Documentation","Release Readiness Sign-Off & Client Walkthrough"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    720
  ),
  (
    'QA-04',
    'H',
    'Engineering Quality, Launch & Aftercare',
    'User Acceptance Testing & Release Readiness Review',
    'Test scripts, recorded sign-off and actual production readiness conditions',
    'Standard catalog definition for QA-04 under Category H. Requires quote-specific pricing and founder approval before publishing.',
    '["Automated Test Suites & Passing CI Verification","Handover Architecture & Operations Documentation","Release Readiness Sign-Off & Client Walkthrough"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    730
  ),
  (
    'QA-05',
    'H',
    'Engineering Quality, Launch & Aftercare',
    'Technical Documentation & API Handover Package',
    'Architecture notes, operation guide, API contracts and known limitations',
    'Standard catalog definition for QA-05 under Category H. Requires quote-specific pricing and founder approval before publishing.',
    '["Automated Test Suites & Passing CI Verification","Handover Architecture & Operations Documentation","Release Readiness Sign-Off & Client Walkthrough"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    740
  ),
  (
    'QA-06',
    'H',
    'Engineering Quality, Launch & Aftercare',
    'Project Handover, Access Transfer & Team Training',
    'Verified agreed artifact transfer and client walkthrough; never disclose secrets in PDFs',
    'Standard catalog definition for QA-06 under Category H. Requires quote-specific pricing and founder approval before publishing.',
    '["Automated Test Suites & Passing CI Verification","Handover Architecture & Operations Documentation","Release Readiness Sign-Off & Client Walkthrough"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    750
  ),
  (
    'QA-07',
    'H',
    'Engineering Quality, Launch & Aftercare',
    'Post-Launch Maintenance & Update Service',
    'Separately contracted ongoing fixes/updates with explicit duration and coverage',
    'Standard catalog definition for QA-07 under Category H. Requires quote-specific pricing and founder approval before publishing.',
    '["Automated Test Suites & Passing CI Verification","Handover Architecture & Operations Documentation","Release Readiness Sign-Off & Client Walkthrough"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    760
  ),
  (
    'QA-08',
    'H',
    'Engineering Quality, Launch & Aftercare',
    'Priority Technical Support & SLA Service',
    'Separately approved response coverage, escalation and service-level obligations',
    'Standard catalog definition for QA-08 under Category H. Requires quote-specific pricing and founder approval before publishing.',
    '["Automated Test Suites & Passing CI Verification","Handover Architecture & Operations Documentation","Release Readiness Sign-Off & Client Walkthrough"]'::jsonb,
    'project',
    true,
    NULL,
    true,
    770
  )
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
