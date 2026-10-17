-- =============================================================================
-- Migration: 20261017060000_standard_free_trial_twenty_rupees.sql
-- Purpose:
--   1. Authoritative Standard 30-Day Free Trial Catalog Configuration (₹0 subscription, ₹20 refundable verification)
--   2. Strict unique constraints preventing duplicate active trials or duplicate pending orders per engagement
--   3. Refund state auditing and lifecycle transitions for ₹20 verification deposits
--   4. Idempotent trial expiration trigger function
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Upsert STANDARD as 30-Day Free Trial (₹0 + ₹20 Refundable UPI Verification)
-- -----------------------------------------------------------------------------

INSERT INTO public.maintenance_plans (
  id, name, plan_type, base_price_paise, gst_rate_bps, gst_amount_paise, total_price_paise,
  billing_frequency, duration_days, refundable_paise, enhancement_hours_monthly,
  sla_response_time, support_hours, short_description, included_features, service_limits, is_active, display_order
)
VALUES
  (
    'STANDARD',
    'STANDARD',
    'free_trial',
    0,
    1800,
    0,
    2000, -- ₹20.00 one-time refundable verification payment
    'one_time',
    30,
    2000, -- 100% refundable ₹20
    0.00,
    'Best-Effort (Community & Knowledge Base)',
    'Self-Service Documentation & FAQs',
    '30-Day Free Trial with one-time refundable ₹20 UPI verification payment. 30 days of trial access, subject to the approved Standard coverage terms. No automatic paid conversion or recurring debit.',
    '["30-Day Free Trial Dashboard Access", "Knowledge Base & Architecture Guides", "Self-Service Maintenance FAQs", "General Support Enquiry Submission", "Introductory Project Health Overview", "Guided Ticket Intake Preparation", "Option to Compare & Select Paid Care Plans"]'::jsonb,
    '["No dedicated engineering hours", "No emergency response guarantees", "No custom code modifications", "Third-party cloud infrastructure costs excluded"]'::jsonb,
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

-- -----------------------------------------------------------------------------
-- 2. Prevent Duplicate Active Trials for the Same Engagement
-- -----------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_standard_trial_per_engagement 
  ON public.maintenance_subscriptions (engagement_id) 
  WHERE (plan_id IN ('STANDARD', 'FREE_TRIAL') AND status IN ('active', 'pending_verification'));

-- -----------------------------------------------------------------------------
-- 3. Prevent Duplicate Pending Orders on Multiple Click / Rapid Refresh
-- -----------------------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS uq_pending_trial_order_per_engagement 
  ON public.maintenance_orders (engagement_id) 
  WHERE (order_type = 'trial_verification' AND status IN ('pending_payment', 'verification_pending'));

-- -----------------------------------------------------------------------------
-- 4. Expiration Helper Function (Can be run via cron or SQL RPC)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_expire_outdated_standard_trials()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER := 0;
BEGIN
  WITH updated AS (
    UPDATE public.maintenance_subscriptions
    SET 
      status = 'expired',
      updated_at = NOW()
    WHERE 
      status = 'active'
      AND trial_expires_at IS NOT NULL
      AND trial_expires_at <= NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO expired_count FROM updated;

  RETURN expired_count;
END;
$$;

COMMIT;
