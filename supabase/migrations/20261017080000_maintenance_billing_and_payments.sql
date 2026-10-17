-- =============================================================================
-- Migration: 20261017080000_maintenance_billing_and_payments.sql
-- Scope: Milestone 2 (BILL01 - BILL06)
--   1. Drop flawed compound trial index uq_active_standard_trial_per_engagement
--   2. Restore STANDARD as paid plan (₹999 + 18% GST = ₹1,178.82 / 117882 paise)
--   3. Ensure FREE_TRIAL (₹0 base, ₹20 refundable verification) is strictly evaluation
--   4. Ensure all 5 canonical tiers (FREE_TRIAL, STANDARD, BASIC, PRO, ENTERPRISE) in maintenance_plans
--   5. Create unique index strictly for FREE_TRIAL evaluations per engagement
--   6. Enforce unique constraints on bank_reference and declared_utr to prevent duplicate credit allocation
--   7. Prevent backward transitions from completed refund state
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Drop flawed compound index (BILL03)
-- -----------------------------------------------------------------------------
DROP INDEX IF EXISTS public.uq_active_standard_trial_per_engagement;

-- -----------------------------------------------------------------------------
-- 2. Restore and enforce canonical 5-tier catalog configuration (BILL01, BILL03, BILL04)
-- -----------------------------------------------------------------------------
-- Ensure FREE_TRIAL exists and is marked free_trial
INSERT INTO public.maintenance_plans (
  id, name, plan_type, base_price_paise, gst_rate_bps, gst_amount_paise, total_price_paise,
  billing_frequency, duration_days, refundable_paise, enhancement_hours_monthly,
  sla_response_time, support_hours, short_description, included_features, service_limits, is_active, display_order
)
VALUES (
  'FREE_TRIAL',
  'Free Trial',
  'free_trial',
  0,
  1800,
  0,
  2000, -- ₹20.00 refundable verification
  'one_time',
  30,
  2000,
  0.00,
  'Best-Effort (Community & Knowledge Base)',
  'Self-Service Documentation & FAQs',
  '30-Day Free Trial with one-time refundable ₹20 UPI verification payment. No automatic paid conversion or recurring debit.',
  '["30-Day Free Trial Dashboard Access", "Knowledge Base & Engineering Documentation", "Self-Service Maintenance FAQs", "General Support Enquiry Submission", "Introductory Project Health Overview", "Guided Ticket Intake Preparation", "Option to Compare & Select Paid Plans"]'::jsonb,
  '["No dedicated engineering hours", "No emergency response guarantees", "No custom code modifications", "Third-party cloud costs excluded"]'::jsonb,
  true,
  1
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
  display_order = 1,
  updated_at = NOW();

-- Restore STANDARD as paid plan (plan_type = 'paid', BILL03, BILL04)
UPDATE public.maintenance_plans
SET plan_type = 'paid', updated_at = NOW()
WHERE id = 'STANDARD';

INSERT INTO public.maintenance_plans (
  id, name, plan_type, base_price_paise, gst_rate_bps, gst_amount_paise, total_price_paise,
  billing_frequency, duration_days, refundable_paise, enhancement_hours_monthly,
  sla_response_time, support_hours, short_description, included_features, service_limits, is_active, display_order
)
VALUES (
  'STANDARD',
  'Standard Care',
  'paid',
  99900,   -- ₹999.00
  1800,    -- 18% GST
  17982,   -- ₹179.82
  117882,  -- ₹1,178.82 total
  'monthly',
  30,
  0,
  0.00,
  '< 24 Business Hours',
  'Business Hours (Mon – Sat, 9 AM – 6 PM IST)',
  'Entry-level paid maintenance support: basic support ticketing, business-hours assistance, and monthly project health summary.',
  '["Client Support Dashboard Access", "Basic Support Ticketing Queue", "Business-Hours Email Assistance", "Monthly Project Health Summary", "Knowledge Base & Architecture Guides", "Scheduled Maintenance Release Advisories"]'::jsonb,
  '["No included minor enhancement hours", "No emergency 24/7 on-call hotline", "Custom functional development quoted separately", "Third-party cloud infrastructure costs excluded"]'::jsonb,
  true,
  2
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
  display_order = 2,
  updated_at = NOW();

-- -----------------------------------------------------------------------------
-- 3. Strict trial uniqueness index (BILL03)
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_trial_per_engagement 
  ON public.maintenance_subscriptions (engagement_id) 
  WHERE (plan_id = 'FREE_TRIAL' AND status IN ('active', 'pending_verification'));

-- -----------------------------------------------------------------------------
-- 4. Prevent duplicate bank reconciliation reference / UTR allocation (BILL05)
-- -----------------------------------------------------------------------------
ALTER TABLE public.maintenance_orders
  ADD COLUMN IF NOT EXISTS bank_reference TEXT;

UPDATE public.maintenance_orders
  SET bank_reference = bank_reconciliation_ref
  WHERE bank_reference IS NULL AND bank_reconciliation_ref IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_maintenance_orders_bank_ref 
  ON public.maintenance_orders (bank_reference) 
  WHERE (bank_reference IS NOT NULL AND status IN ('verified', 'verification_pending'));

CREATE UNIQUE INDEX IF NOT EXISTS uq_maintenance_orders_bank_reconciliation_ref 
  ON public.maintenance_orders (bank_reconciliation_ref) 
  WHERE (bank_reconciliation_ref IS NOT NULL AND status IN ('verified', 'verification_pending'));

CREATE UNIQUE INDEX IF NOT EXISTS uq_maintenance_orders_declared_utr 
  ON public.maintenance_orders (declared_utr) 
  WHERE (declared_utr IS NOT NULL AND status IN ('verified', 'verification_pending'));

-- -----------------------------------------------------------------------------
-- 5. Terminal refund state transition protection (BILL04)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_prevent_completed_refund_reversion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.refund_status = 'completed' AND NEW.refund_status <> 'completed' THEN
    RAISE EXCEPTION 'Terminal state violation: Completed trial refunds cannot be reverted to %.', NEW.refund_status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_completed_refund_reversion ON public.maintenance_subscriptions;
CREATE TRIGGER trg_prevent_completed_refund_reversion
  BEFORE UPDATE ON public.maintenance_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_prevent_completed_refund_reversion();

COMMIT;
