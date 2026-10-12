-- Migration: 20261012130000_customer_enquiries.sql
-- Description: Production Customer Enquiry tables matching CSV fixtures + enterprise fields, unique constraints, atomic reservations, and strict RLS.
-- Safe, additive, idempotent migration.

BEGIN;

-- 1. Customer Enquiry Threads Table
CREATE TABLE IF NOT EXISTS public.customer_enquiry_threads (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id           text UNIQUE NOT NULL,
  customer_email      text NOT NULL,
  customer_name       text,
  service             text,
  status              text NOT NULL DEFAULT 'received' CHECK (
    status IN (
      'received',
      'message_reserved',
      'classified',
      'pending_approval',
      'approved',
      'dispatching',
      'sent',
      'booked',
      'declined',
      'failed',
      'ignored_duplicate',
      'suppressed',
      'needs_review'
    )
  ),
  offered_start       timestamptz,
  offered_end         timestamptz,
  calendar_event_id   text,
  reply_text          text,
  booking_uid         text,
  calcom_link         text,
  assigned_to         text,
  submitted_by        text,
  metadata            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_enquiry_threads_thread_id 
  ON public.customer_enquiry_threads(thread_id);
CREATE INDEX IF NOT EXISTS idx_customer_enquiry_threads_customer_email 
  ON public.customer_enquiry_threads(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_enquiry_threads_status 
  ON public.customer_enquiry_threads(status);
CREATE INDEX IF NOT EXISTS idx_customer_enquiry_threads_booking_uid 
  ON public.customer_enquiry_threads(booking_uid) WHERE booking_uid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customer_enquiry_threads_created_at 
  ON public.customer_enquiry_threads(created_at DESC);

-- 2. Customer Enquiry Messages Table
CREATE TABLE IF NOT EXISTS public.customer_enquiry_messages (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id          text UNIQUE NOT NULL,
  thread_id           text NOT NULL REFERENCES public.customer_enquiry_threads(thread_id) ON DELETE CASCADE,
  sender              text NOT NULL,
  subject             text,
  body_hash           text,
  status              text NOT NULL DEFAULT 'received' CHECK (
    status IN (
      'received',
      'message_reserved',
      'classified',
      'pending_approval',
      'approved',
      'dispatching',
      'sent',
      'booked',
      'declined',
      'failed',
      'ignored_duplicate',
      'suppressed',
      'needs_review'
    )
  ),
  reservation_token   text,
  reserved_until      timestamptz,
  provider            text,
  provider_message_id text,
  metadata            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_enquiry_messages_message_id 
  ON public.customer_enquiry_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_customer_enquiry_messages_thread_id 
  ON public.customer_enquiry_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_customer_enquiry_messages_status 
  ON public.customer_enquiry_messages(status);
CREATE INDEX IF NOT EXISTS idx_customer_enquiry_messages_provider_msg_id 
  ON public.customer_enquiry_messages(provider_message_id) WHERE provider_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customer_enquiry_messages_created_at 
  ON public.customer_enquiry_messages(created_at DESC);

-- 3. Customer Enquiry Approvals Audit Table
CREATE TABLE IF NOT EXISTS public.customer_enquiry_approvals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id          text NOT NULL REFERENCES public.customer_enquiry_messages(message_id) ON DELETE CASCADE,
  thread_id           text NOT NULL REFERENCES public.customer_enquiry_threads(thread_id) ON DELETE CASCADE,
  approver_email      text NOT NULL,
  approver_role       text NOT NULL,
  decision            text NOT NULL CHECK (decision IN ('approved', 'declined', 'needs_review')),
  notes               text,
  decided_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cust_enquiry_approvals_message_id 
  ON public.customer_enquiry_approvals(message_id);
CREATE INDEX IF NOT EXISTS idx_cust_enquiry_approvals_thread_id 
  ON public.customer_enquiry_approvals(thread_id);
CREATE INDEX IF NOT EXISTS idx_cust_enquiry_approvals_decided_at 
  ON public.customer_enquiry_approvals(decided_at DESC);

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.touch_customer_enquiry_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_cust_enquiry_threads ON public.customer_enquiry_threads;
CREATE TRIGGER trg_touch_cust_enquiry_threads
  BEFORE UPDATE ON public.customer_enquiry_threads
  FOR EACH ROW EXECUTE FUNCTION public.touch_customer_enquiry_updated_at();

DROP TRIGGER IF EXISTS trg_touch_cust_enquiry_messages ON public.customer_enquiry_messages;
CREATE TRIGGER trg_touch_cust_enquiry_messages
  BEFORE UPDATE ON public.customer_enquiry_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_customer_enquiry_updated_at();

-- 5. Enable Strict Fail-Closed Row Level Security (RLS)
ALTER TABLE public.customer_enquiry_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_enquiry_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_enquiry_approvals ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.customer_enquiry_threads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.customer_enquiry_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.customer_enquiry_approvals FORCE ROW LEVEL SECURITY;

-- Revoke all permissions from public and anon
REVOKE ALL ON public.customer_enquiry_threads FROM anon, public;
REVOKE ALL ON public.customer_enquiry_messages FROM anon, public;
REVOKE ALL ON public.customer_enquiry_approvals FROM anon, public;

-- Service role full privileges (for webhooks, workers, and background sync)
GRANT ALL ON public.customer_enquiry_threads TO service_role;
GRANT ALL ON public.customer_enquiry_messages TO service_role;
GRANT ALL ON public.customer_enquiry_approvals TO service_role;

-- Admin-Only Read/Write Policies for Authenticated Staff
DO $$
BEGIN
  -- customer_enquiry_threads SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_select_cust_enquiry_threads') THEN
    CREATE POLICY admin_select_cust_enquiry_threads ON public.customer_enquiry_threads
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- customer_enquiry_threads INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_insert_cust_enquiry_threads') THEN
    CREATE POLICY admin_insert_cust_enquiry_threads ON public.customer_enquiry_threads
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- customer_enquiry_threads UPDATE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_update_cust_enquiry_threads') THEN
    CREATE POLICY admin_update_cust_enquiry_threads ON public.customer_enquiry_threads
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- customer_enquiry_messages SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_select_cust_enquiry_messages') THEN
    CREATE POLICY admin_select_cust_enquiry_messages ON public.customer_enquiry_messages
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- customer_enquiry_messages INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_insert_cust_enquiry_messages') THEN
    CREATE POLICY admin_insert_cust_enquiry_messages ON public.customer_enquiry_messages
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- customer_enquiry_messages UPDATE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_update_cust_enquiry_messages') THEN
    CREATE POLICY admin_update_cust_enquiry_messages ON public.customer_enquiry_messages
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- customer_enquiry_approvals SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_select_cust_enquiry_approvals') THEN
    CREATE POLICY admin_select_cust_enquiry_approvals ON public.customer_enquiry_approvals
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- customer_enquiry_approvals INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_insert_cust_enquiry_approvals') THEN
    CREATE POLICY admin_insert_cust_enquiry_approvals ON public.customer_enquiry_approvals
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;
END $$;

COMMIT;
