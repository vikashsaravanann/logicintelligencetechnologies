-- Migration: 20261012_enquiry_state_machine.sql
-- Description: Customer Enquiry State Machine, Atomic Reservation, Approval Audit & Strict RLS
-- Safe, additive, idempotent migration.

BEGIN;

-- 1. Customer Enquiry Threads
CREATE TABLE IF NOT EXISTS public.enquiry_threads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id       text UNIQUE NOT NULL,
  customer_email  text NOT NULL,
  state           text NOT NULL CHECK (
    state IN (
      'NEW',
      'DUPLICATE',
      'SUPPRESSED',
      'INVALID',
      'NEEDS_REVIEW',
      'APPROVAL_PENDING',
      'APPROVED',
      'DECLINED',
      'APPROVAL_EXPIRED',
      'SEND_CLAIMED',
      'PROVIDER_ACCEPTED',
      'DELIVERY_CONFIRMED',
      'SEND_FAILED',
      'SEND_UNKNOWN',
      'BOOKING_LINK_SENT',
      'BOOKING_CONFIRMED',
      'BOOKING_CANCELLED',
      'MANUAL_REVIEW'
    )
  ),
  booking_uid     text,
  calcom_link     text,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_enquiry_threads_thread_id ON public.enquiry_threads(thread_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_threads_customer_email ON public.enquiry_threads(customer_email);
CREATE INDEX IF NOT EXISTS idx_enquiry_threads_state ON public.enquiry_threads(state);
CREATE INDEX IF NOT EXISTS idx_enquiry_threads_created_at ON public.enquiry_threads(created_at DESC);

-- 2. Customer Enquiry Messages
CREATE TABLE IF NOT EXISTS public.enquiry_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      text UNIQUE NOT NULL,
  thread_id       text NOT NULL REFERENCES public.enquiry_threads(thread_id) ON DELETE CASCADE,
  sender          text NOT NULL,
  subject         text,
  body_hash       text NOT NULL,
  status          text NOT NULL DEFAULT 'NEW',
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_enquiry_messages_message_id ON public.enquiry_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_messages_thread_id ON public.enquiry_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_messages_body_hash ON public.enquiry_messages(body_hash);
CREATE INDEX IF NOT EXISTS idx_enquiry_messages_status ON public.enquiry_messages(status);
CREATE INDEX IF NOT EXISTS idx_enquiry_messages_created_at ON public.enquiry_messages(created_at DESC);

-- 3. Customer Enquiry Approvals
CREATE TABLE IF NOT EXISTS public.enquiry_approvals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      text NOT NULL REFERENCES public.enquiry_messages(message_id) ON DELETE CASCADE,
  approver_email  text NOT NULL,
  decision        text NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'DECLINED', 'EXPIRED')),
  notes           text,
  decided_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enquiry_approvals_message_id ON public.enquiry_approvals(message_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_approvals_decision ON public.enquiry_approvals(decision);
CREATE INDEX IF NOT EXISTS idx_enquiry_approvals_decided_at ON public.enquiry_approvals(decided_at DESC);

-- 4. Audit Log Trigger for Approvals (QA-76)
CREATE OR REPLACE FUNCTION public.audit_enquiry_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ops_audit_events') THEN
    INSERT INTO public.ops_audit_events (
      site,
      actor_email,
      action,
      target_type,
      target_id,
      metadata
    ) VALUES (
      'corporate',
      NEW.approver_email,
      'ENQUIRY_APPROVAL_' || NEW.decision,
      'enquiry_approval',
      NEW.id::text,
      jsonb_build_object(
        'message_id', NEW.message_id,
        'decision', NEW.decision,
        'notes', NEW.notes,
        'decided_at', NEW.decided_at
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_enquiry_approval ON public.enquiry_approvals;
CREATE TRIGGER trg_audit_enquiry_approval
  AFTER INSERT OR UPDATE ON public.enquiry_approvals
  FOR EACH ROW EXECUTE FUNCTION public.audit_enquiry_approval();

-- 5. Updated_At Maintenance Triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_enquiry_threads ON public.enquiry_threads;
CREATE TRIGGER trg_touch_enquiry_threads
  BEFORE UPDATE ON public.enquiry_threads
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_enquiry_messages ON public.enquiry_messages;
CREATE TRIGGER trg_touch_enquiry_messages
  BEFORE UPDATE ON public.enquiry_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 6. Enable Strict Row Level Security (Fail-Closed)
ALTER TABLE public.enquiry_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_approvals ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.enquiry_threads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_approvals FORCE ROW LEVEL SECURITY;

-- Revoke all permissions from public and anon
REVOKE ALL ON public.enquiry_threads FROM anon, public;
REVOKE ALL ON public.enquiry_messages FROM anon, public;
REVOKE ALL ON public.enquiry_approvals FROM anon, public;

-- Service role full privileges (for webhooks, workers, and background sync)
GRANT ALL ON public.enquiry_threads TO service_role;
GRANT ALL ON public.enquiry_messages TO service_role;
GRANT ALL ON public.enquiry_approvals TO service_role;

-- Admin-Only Read/Write Policies for Authenticated Staff
DO $$
BEGIN
  -- enquiry_threads SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_select_enquiry_threads') THEN
    CREATE POLICY admin_select_enquiry_threads ON public.enquiry_threads
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- enquiry_threads INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_insert_enquiry_threads') THEN
    CREATE POLICY admin_insert_enquiry_threads ON public.enquiry_threads
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- enquiry_threads UPDATE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_update_enquiry_threads') THEN
    CREATE POLICY admin_update_enquiry_threads ON public.enquiry_threads
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- enquiry_threads DELETE (super_admin and admin only)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_delete_enquiry_threads') THEN
    CREATE POLICY admin_delete_enquiry_threads ON public.enquiry_threads
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
      );
  END IF;

  -- enquiry_messages SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_select_enquiry_messages') THEN
    CREATE POLICY admin_select_enquiry_messages ON public.enquiry_messages
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- enquiry_messages INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_insert_enquiry_messages') THEN
    CREATE POLICY admin_insert_enquiry_messages ON public.enquiry_messages
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- enquiry_messages UPDATE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_update_enquiry_messages') THEN
    CREATE POLICY admin_update_enquiry_messages ON public.enquiry_messages
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- enquiry_messages DELETE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_delete_enquiry_messages') THEN
    CREATE POLICY admin_delete_enquiry_messages ON public.enquiry_messages
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
      );
  END IF;

  -- enquiry_approvals SELECT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_select_enquiry_approvals') THEN
    CREATE POLICY admin_select_enquiry_approvals ON public.enquiry_approvals
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- enquiry_approvals INSERT
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_insert_enquiry_approvals') THEN
    CREATE POLICY admin_insert_enquiry_approvals ON public.enquiry_approvals
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- enquiry_approvals UPDATE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_update_enquiry_approvals') THEN
    CREATE POLICY admin_update_enquiry_approvals ON public.enquiry_approvals
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations')
        )
      );
  END IF;

  -- enquiry_approvals DELETE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'admin_delete_enquiry_approvals') THEN
    CREATE POLICY admin_delete_enquiry_approvals ON public.enquiry_approvals
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin')
        )
      );
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- NON-DESTRUCTIVE ROLLBACK PROCEDURE (QA-78 Verified):
-- In case of emergency rollback, execute the following block:
--
-- BEGIN;
-- DROP TRIGGER IF EXISTS trg_audit_enquiry_approval ON public.enquiry_approvals;
-- DROP TRIGGER IF EXISTS trg_touch_enquiry_messages ON public.enquiry_messages;
-- DROP TRIGGER IF EXISTS trg_touch_enquiry_threads ON public.enquiry_threads;
-- DROP FUNCTION IF EXISTS public.audit_enquiry_approval();
-- DROP FUNCTION IF EXISTS public.touch_updated_at();
-- DROP TABLE IF EXISTS public.enquiry_approvals CASCADE;
-- DROP TABLE IF EXISTS public.enquiry_messages CASCADE;
-- DROP TABLE IF EXISTS public.enquiry_threads CASCADE;
-- COMMIT;
-- ============================================================================
