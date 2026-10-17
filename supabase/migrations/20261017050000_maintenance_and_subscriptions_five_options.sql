-- =============================================================================
-- Migration: 20261017050000_maintenance_and_subscriptions_five_options.sql
-- Purpose:
--   1. Authoritative 5-Tier Maintenance Plan Catalog (Free Trial, Standard, Basic, Pro, Enterprise)
--   2. Client Maintenance Subscriptions & 30-Day Free Trial Tracker (Refundable Rs. 20 UPI Verification)
--   3. Maintenance Orders with Integer Paise Calculations, Dynamic UPI, and Anti-Tamper Immutability
--   4. Maintenance Enhancement Hours Ledger (1 hr Basic, 3 hrs Pro, 6 hrs Enterprise)
--   5. Maintenance Feature Roadmap Registry (Separating Available vs Planned)
--   6. Structured Client Correction Requests Workflow (Phase 8 Change Control)
--   7. Strict RLS Policies & Revocation of Anonymous SELECT on Payment Tables
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Maintenance Plans Catalog
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.maintenance_plans (
  id TEXT PRIMARY KEY, -- 'FREE_TRIAL', 'STANDARD', 'BASIC', 'PRO', 'ENTERPRISE'
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free_trial', 'paid')),
  base_price_paise BIGINT NOT NULL DEFAULT 0,
  gst_rate_bps INTEGER NOT NULL DEFAULT 1800, -- 18% GST
  gst_amount_paise BIGINT NOT NULL DEFAULT 0,
  total_price_paise BIGINT NOT NULL,
  billing_frequency TEXT NOT NULL CHECK (billing_frequency IN ('one_time', 'monthly')),
  duration_days INTEGER NOT NULL DEFAULT 30,
  refundable_paise BIGINT NOT NULL DEFAULT 0,
  enhancement_hours_monthly NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  sla_response_time TEXT NOT NULL,
  support_hours TEXT NOT NULL,
  short_description TEXT NOT NULL,
  included_features JSONB NOT NULL DEFAULT '[]'::jsonb,
  service_limits JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Canonical Five Options
INSERT INTO public.maintenance_plans (
  id, name, plan_type, base_price_paise, gst_rate_bps, gst_amount_paise, total_price_paise,
  billing_frequency, duration_days, refundable_paise, enhancement_hours_monthly,
  sla_response_time, support_hours, short_description, included_features, service_limits, is_active, display_order
)
VALUES
  (
    'FREE_TRIAL',
    'Free Trial (30 Days)',
    'free_trial',
    0,
    1800,
    0,
    2000, -- Rs. 20.00 refundable verification payment
    'one_time',
    30,
    2000, -- 100% refundable Rs. 20
    0.00,
    'Best-Effort (Community & Knowledge Base)',
    'Self-Service Documentation & FAQs',
    '30-Day Free Trial with one-time refundable ₹20 UPI verification payment. No automatic paid conversion or recurring charge.',
    '["30-Day Free Trial Dashboard", "Self-service Knowledge Base & Architecture Guides", "Maintenance & Operations FAQs", "General Support Enquiry Submission", "Introductory Project Health Overview", "Guided Ticket Intake Preparation", "Option to Compare & Select Paid Care Plans"]'::jsonb,
    '["No dedicated engineering hours", "No emergency response guarantees", "No custom code modifications", "Third-party infrastructure costs excluded"]'::jsonb,
    true,
    1
  ),
  (
    'STANDARD',
    'Standard Care',
    'paid',
    99900, -- Rs. 999.00
    1800,
    17982, -- Rs. 179.82 (18% GST)
    117882, -- Rs. 1,178.82 Total
    'monthly',
    30,
    0,
    0.00,
    '< 24 Business Hours',
    'Standard Business Hours (Mon – Fri, 9 AM – 6 PM IST)',
    'Entry-level paid software maintenance, basic support ticketing, and monthly health summary.',
    '["Client Support Dashboard", "Incident Ticketing (Standard Queue)", "Standard Business-Hours Email Support", "Monthly Project Health Summary", "Critical Security Advisory Bulletins", "Contract & Master Document Repository Access"]'::jsonb,
    '["No included enhancement hours", "Non-emergency SLA response targets", "Major upgrades require separate quotation"]'::jsonb,
    true,
    2
  ),
  (
    'BASIC',
    'Basic Care',
    'paid',
    499900, -- Rs. 4,999.00
    1800,
    89982, -- Rs. 899.82 (18% GST)
    589882, -- Rs. 5,898.82 Total
    'monthly',
    30,
    0,
    1.00, -- 1 minor enhancement hour/month
    '< 12 Business Hours',
    'Business Hours (Mon – Sat, 9 AM – 6 PM IST)',
    'Routine software maintenance, bug remediation, security review, and 1 minor enhancement hour/month.',
    '["All Standard Care inclusions", "Routine Bug Investigation & Minor Remediation", "1 Minor Enhancement Hour / Billing Month", "Monthly Website & App Health Review", "Basic Security & Dependency Updates Review", "Monthly Maintenance Report & Telemetry Review"]'::jsonb,
    '["Unused enhancement hours do not roll over", "New large modules excluded", "Emergency 24/7 hotline excluded"]'::jsonb,
    true,
    3
  ),
  (
    'PRO',
    'Pro Care',
    'paid',
    999900, -- Rs. 9,999.00
    1800,
    179982, -- Rs. 1,799.82 (18% GST)
    1179882, -- Rs. 11,798.82 Total
    'monthly',
    30,
    0,
    3.00, -- 3 minor enhancement hours/month
    '< 8 Business Hours',
    'Extended Business Hours (Mon – Sat, 8 AM – 8 PM IST)',
    'Higher-priority support queue, weekly health reviews, error monitoring, and 3 minor enhancement hours/month.',
    '["All Basic Care inclusions", "Priority Support Queue & Escalation", "3 Minor Enhancement Hours / Billing Month", "Weekly Application Health & Error Reviews", "Automated Performance Monitoring & Trend Analysis", "Monthly Security & Vulnerability Review", "Structured Change Request Impact Assessment"]'::jsonb,
    '["Unused enhancement hours capped at 3 hrs/mo", "Major structural refactors quoted separately"]'::jsonb,
    true,
    4
  ),
  (
    'ENTERPRISE',
    'Enterprise Care',
    'paid',
    1999900, -- Rs. 19,999.00
    1800,
    359982, -- Rs. 3,599.82 (18% GST)
    2359882, -- Rs. 23,598.82 Total
    'monthly',
    30,
    0,
    6.00, -- 6 minor enhancement hours/month
    '< 4 Business Hours',
    'Priority Business Hours with Designated Technical Lead',
    'Highest business-hours queue priority, critical incident escalation, architecture reviews, and 6 minor enhancement hours/month.',
    '["All Pro Care inclusions", "Highest Business-Hours Queue Priority", "6 Minor Enhancement Hours / Billing Month", "Critical Incident Escalation & Response Protocols", "Monthly Architecture & Reliability Reviews", "Monthly Security Posture & Compliance Report", "Monthly Technical Planning & Strategy Consultation", "Management-level Operational Governance Summary"]'::jsonb,
    '["24/7 staffed on-call bridge requires separate contract", "Substantial functional modules require RFC change quotation"]'::jsonb,
    true,
    5
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  plan_type = EXCLUDED.plan_type,
  base_price_paise = EXCLUDED.base_price_paise,
  gst_rate_bps = EXCLUDED.gst_rate_bps,
  gst_amount_paise = EXCLUDED.gst_amount_paise,
  total_price_paise = EXCLUDED.total_price_paise,
  billing_frequency = EXCLUDED.billing_frequency,
  duration_days = EXCLUDED.duration_days,
  refundable_paise = EXCLUDED.refundable_paise,
  enhancement_hours_monthly = EXCLUDED.enhancement_hours_monthly,
  sla_response_time = EXCLUDED.sla_response_time,
  support_hours = EXCLUDED.support_hours,
  short_description = EXCLUDED.short_description,
  included_features = EXCLUDED.included_features,
  service_limits = EXCLUDED.service_limits,
  is_active = true,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 2. Maintenance Subscriptions & 30-Day Free Trial Tracking
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.maintenance_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  engagement_id UUID NOT NULL REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.maintenance_plans(id),
  plan_version TEXT NOT NULL DEFAULT 'v1.0',
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (
    status IN ('pending_verification', 'active', 'grace_period', 'expired', 'cancelled', 'upgraded', 'downgraded')
  ),
  trial_started_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_invoice_date TIMESTAMPTZ,
  payment_due_date TIMESTAMPTZ,
  enhancement_hours_allocated NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  enhancement_hours_used NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  verification_payment_request_id UUID,
  refund_status TEXT NOT NULL DEFAULT 'not_applicable' CHECK (
    refund_status IN ('not_applicable', 'not_initiated', 'pending', 'processing', 'completed', 'failed', 'manual_review_required')
  ),
  refund_reference TEXT,
  refund_initiated_at TIMESTAMPTZ,
  refund_completed_at TIMESTAMPTZ,
  refund_notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_subs_client ON public.maintenance_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_subs_engagement ON public.maintenance_subscriptions(engagement_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_subs_status ON public.maintenance_subscriptions(status);

-- -----------------------------------------------------------------------------
-- 3. Maintenance Orders & UPI Payment Requests
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.maintenance_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  engagement_id UUID NOT NULL REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.maintenance_subscriptions(id) ON DELETE SET NULL,
  plan_id TEXT NOT NULL REFERENCES public.maintenance_plans(id),
  order_type TEXT NOT NULL CHECK (
    order_type IN ('trial_verification', 'subscription_initial', 'subscription_renewal', 'upgrade')
  ),
  base_amount_paise BIGINT NOT NULL,
  gst_amount_paise BIGINT NOT NULL DEFAULT 0,
  total_amount_paise BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  secure_token TEXT NOT NULL UNIQUE,
  upi_uri TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (
    status IN ('draft', 'pending_payment', 'verification_pending', 'verified', 'rejected', 'refund_pending', 'refunded', 'cancelled')
  ),
  declared_utr TEXT,
  declared_payee_name TEXT,
  declared_payment_time TIMESTAMPTZ,
  payment_proof_url TEXT,
  bank_reconciliation_ref TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  invoice_id UUID,
  receipt_id UUID,
  consent_confirmed BOOLEAN NOT NULL DEFAULT true,
  consent_timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_orders_client ON public.maintenance_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_ref ON public.maintenance_orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_token ON public.maintenance_orders(secure_token);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON public.maintenance_orders(status);

-- Anti-tamper trigger: once verified, total amount and financial refs cannot be altered
CREATE OR REPLACE FUNCTION public.fn_prevent_verified_maintenance_order_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IN ('verified', 'refunded') THEN
    IF NEW.total_amount_paise <> OLD.total_amount_paise OR
       NEW.base_amount_paise <> OLD.base_amount_paise OR
       NEW.gst_amount_paise <> OLD.gst_amount_paise OR
       NEW.client_id <> OLD.client_id OR
       NEW.engagement_id <> OLD.engagement_id OR
       NEW.order_ref <> OLD.order_ref THEN
      RAISE EXCEPTION 'Security Violation: Verified or refunded maintenance orders cannot have financial or ownership attributes mutated.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_verified_maintenance_order_mutation ON public.maintenance_orders;
CREATE TRIGGER trg_prevent_verified_maintenance_order_mutation
  BEFORE UPDATE ON public.maintenance_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_prevent_verified_maintenance_order_mutation();

-- -----------------------------------------------------------------------------
-- 4. Maintenance Enhancement Hours Ledger
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.maintenance_enhancement_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.maintenance_subscriptions(id) ON DELETE CASCADE,
  engagement_id UUID NOT NULL REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  hours_logged NUMERIC(5,2) NOT NULL CHECK (hours_logged > 0),
  task_description TEXT NOT NULL,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id),
  change_request_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enhancement_ledger_sub ON public.maintenance_enhancement_ledger(subscription_id);

-- -----------------------------------------------------------------------------
-- 5. Maintenance Feature Roadmap Items (Separating Available vs Planned)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.maintenance_roadmap_items (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES public.maintenance_plans(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (
    status IN ('idea', 'under_review', 'planned', 'in_development', 'testing', 'released', 'deferred')
  ),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed planned future roadmap items
INSERT INTO public.maintenance_roadmap_items (id, plan_id, title, description, status, display_order, is_published)
VALUES
  ('trial-guided-onboarding', 'FREE_TRIAL', 'Personalized Onboarding Walkthrough', 'Interactive step-by-step tour covering technical documentation and ticket intake.', 'planned', 1, true),
  ('trial-ai-faq', 'FREE_TRIAL', 'AI-Assisted Architecture FAQs', 'Conversational FAQ assistant for rapid resolution of common integration questions.', 'planned', 2, true),
  ('trial-intro-diagnostics', 'FREE_TRIAL', 'Automated Introductory Diagnostics', 'One-click automated baseline health check probe for public endpoints.', 'planned', 3, true),
  
  ('standard-auto-alerts', 'STANDARD', 'Automated Uptime & Health Alerts', 'Email notifications upon edge endpoint latency degradation or certificate expiry.', 'planned', 1, true),
  ('standard-self-guidance', 'STANDARD', 'Self-Service Technical Guidance', 'Guided troubleshooting flowcharts for runtime configuration issues.', 'planned', 2, true),
  ('standard-recs', 'STANDARD', 'Quarterly Maintenance Recommendations', 'Automated architectural best-practice suggestions based on stack evolution.', 'planned', 3, true),

  ('basic-monthly-reports', 'BASIC', 'Automated Monthly Website Reports', 'Comprehensive monthly performance, uptime, and Core Web Vitals executive report.', 'planned', 1, true),
  ('basic-dependency-review', 'BASIC', 'Scheduled Dependency Review Workflows', 'Automated vulnerability alerts and npm package health auditing.', 'planned', 2, true),
  ('basic-seo-recs', 'BASIC', 'Guided Technical SEO Scoring', 'Automated crawler audit highlighting meta tags, schema markup, and sitemap health.', 'planned', 3, true),

  ('pro-ai-diagnosis', 'PRO', 'AI-Assisted Incident Diagnosis', 'Automated log anomaly detection correlating HTTP 5xx errors with recent deployments.', 'planned', 1, true),
  ('pro-api-health-dashboard', 'PRO', 'Advanced API Health Dashboard', 'Live p95 latency heatmaps and webhook delivery success monitors.', 'planned', 2, true),
  ('pro-regression-automation', 'PRO', 'Automated Smoke & Regression Probes', 'Synthetic scheduled test runs verifying checkout and contact form availability.', 'planned', 3, true),

  ('ent-multi-project-center', 'ENTERPRISE', 'Unified Multi-Project Command Center', 'Single pane of glass monitoring multiple client web platforms and microservices.', 'planned', 1, true),
  ('ent-predictive-monitoring', 'ENTERPRISE', 'Predictive Operational Monitoring', 'Machine learning trend detection for memory consumption and database connection saturation.', 'planned', 2, true),
  ('ent-custom-integrations', 'ENTERPRISE', 'Custom Operational Webhook Integrations', 'Bi-directional alert routing to client enterprise Slack, PagerDuty, or Microsoft Teams.', 'planned', 3, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  display_order = EXCLUDED.display_order,
  is_published = true,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 6. Structured Client Correction Requests Workflow (Phase 8 Change Control)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.client_correction_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_ref TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  engagement_id UUID NOT NULL REFERENCES public.client_engagements(id) ON DELETE CASCADE,
  stage_number INTEGER,
  document_ref TEXT,
  affected_field TEXT NOT NULL,
  previous_value TEXT,
  requested_value TEXT NOT NULL,
  explanation TEXT NOT NULL,
  supporting_evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('submitted', 'under_review', 'more_information_required', 'approved', 'rejected', 'applied', 'client_notified')
  ),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewer_decision TEXT,
  decision_notes TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corrections_client ON public.client_correction_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_corrections_engagement ON public.client_correction_requests(engagement_id);
CREATE INDEX IF NOT EXISTS idx_corrections_status ON public.client_correction_requests(status);

-- -----------------------------------------------------------------------------
-- 7. Row Level Security & Anonymous Grant Hardening
-- -----------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_enhancement_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_correction_requests ENABLE ROW LEVEL SECURITY;

-- Revoke anonymous access on payment tables to prevent unauthenticated enumeration
REVOKE ALL ON public.engagement_payment_requests FROM anon;
REVOKE ALL ON public.payment_billing_submissions FROM anon;
REVOKE ALL ON public.maintenance_orders FROM anon;
REVOKE ALL ON public.maintenance_subscriptions FROM anon;
REVOKE ALL ON public.maintenance_enhancement_ledger FROM anon;
REVOKE ALL ON public.client_correction_requests FROM anon;

-- Public can read active maintenance plans catalog & published roadmap
DROP POLICY IF EXISTS "public_read_active_maintenance_plans" ON public.maintenance_plans;
CREATE POLICY "public_read_active_maintenance_plans"
  ON public.maintenance_plans FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "public_read_published_roadmap" ON public.maintenance_roadmap_items;
CREATE POLICY "public_read_published_roadmap"
  ON public.maintenance_roadmap_items FOR SELECT
  TO public
  USING (is_published = true);

-- Super admin full management on plans and roadmap
DROP POLICY IF EXISTS "super_admin_manage_maintenance_plans" ON public.maintenance_plans;
CREATE POLICY "super_admin_manage_maintenance_plans"
  ON public.maintenance_plans FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "super_admin_manage_roadmap" ON public.maintenance_roadmap_items;
CREATE POLICY "super_admin_manage_roadmap"
  ON public.maintenance_roadmap_items FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Subscriptions RLS
DROP POLICY IF EXISTS "clients_read_own_subscriptions" ON public.maintenance_subscriptions;
CREATE POLICY "clients_read_own_subscriptions"
  ON public.maintenance_subscriptions FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

DROP POLICY IF EXISTS "staff_super_admin_manage_subscriptions" ON public.maintenance_subscriptions;
CREATE POLICY "staff_super_admin_manage_subscriptions"
  ON public.maintenance_subscriptions FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    EXISTS (
      SELECT 1 FROM public.staff_client_assignments sca
      WHERE sca.staff_user_id = auth.uid()
        AND sca.engagement_id = public.maintenance_subscriptions.engagement_id
        AND sca.status = 'active'
    )
  )
  WITH CHECK (public.is_super_admin());

-- Orders RLS
DROP POLICY IF EXISTS "clients_read_own_maintenance_orders" ON public.maintenance_orders;
CREATE POLICY "clients_read_own_maintenance_orders"
  ON public.maintenance_orders FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

DROP POLICY IF EXISTS "clients_insert_own_maintenance_orders" ON public.maintenance_orders;
CREATE POLICY "clients_insert_own_maintenance_orders"
  ON public.maintenance_orders FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "clients_submit_utr_maintenance_orders" ON public.maintenance_orders;
CREATE POLICY "clients_submit_utr_maintenance_orders"
  ON public.maintenance_orders FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() AND status IN ('pending_payment', 'verification_pending'))
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "super_admin_manage_maintenance_orders" ON public.maintenance_orders;
CREATE POLICY "super_admin_manage_maintenance_orders"
  ON public.maintenance_orders FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Enhancement Ledger RLS
DROP POLICY IF EXISTS "clients_read_own_enhancement_ledger" ON public.maintenance_enhancement_ledger;
CREATE POLICY "clients_read_own_enhancement_ledger"
  ON public.maintenance_enhancement_ledger FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.client_engagements ce
      WHERE ce.id = public.maintenance_enhancement_ledger.engagement_id
        AND ce.client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "staff_super_admin_manage_ledger" ON public.maintenance_enhancement_ledger;
CREATE POLICY "staff_super_admin_manage_ledger"
  ON public.maintenance_enhancement_ledger FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    EXISTS (
      SELECT 1 FROM public.staff_client_assignments sca
      WHERE sca.staff_user_id = auth.uid()
        AND sca.engagement_id = public.maintenance_enhancement_ledger.engagement_id
        AND sca.status = 'active'
    )
  );

-- Correction Requests RLS
DROP POLICY IF EXISTS "clients_manage_own_corrections" ON public.client_correction_requests;
CREATE POLICY "clients_manage_own_corrections"
  ON public.client_correction_requests FOR ALL
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "staff_super_admin_manage_corrections" ON public.client_correction_requests;
CREATE POLICY "staff_super_admin_manage_corrections"
  ON public.client_correction_requests FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    EXISTS (
      SELECT 1 FROM public.staff_client_assignments sca
      WHERE sca.staff_user_id = auth.uid()
        AND sca.engagement_id = public.client_correction_requests.engagement_id
        AND sca.status = 'active'
    )
  )
  WITH CHECK (public.is_super_admin());

COMMIT;
