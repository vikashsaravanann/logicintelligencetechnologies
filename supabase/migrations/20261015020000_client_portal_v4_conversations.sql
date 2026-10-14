-- Migration: 20261015020000_client_portal_v4_conversations.sql
-- Description: Client Portal V4 Persistent Conversations and Engineering Stream Messages
-- Safe, additive, idempotent migration with strict RLS and audit trails.

BEGIN;

-- 1. Conversation Threads
CREATE TABLE IF NOT EXISTS public.conversation_threads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id       text UNIQUE NOT NULL,
  engagement_ref  text,
  client_email    text NOT NULL,
  subject         text NOT NULL DEFAULT 'Engineering Communications',
  status          text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'resolved')),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_threads_thread_id ON public.conversation_threads(thread_id);
CREATE INDEX IF NOT EXISTS idx_conversation_threads_client_email ON public.conversation_threads(client_email);
CREATE INDEX IF NOT EXISTS idx_conversation_threads_engagement_ref ON public.conversation_threads(engagement_ref) WHERE engagement_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversation_threads_created_at ON public.conversation_threads(created_at DESC);

-- 2. Conversation Messages
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      text UNIQUE NOT NULL,
  thread_id       text NOT NULL REFERENCES public.conversation_threads(thread_id) ON DELETE CASCADE,
  sender_type     text NOT NULL CHECK (sender_type IN ('client', 'team', 'system')),
  sender_email    text NOT NULL,
  sender_name     text NOT NULL,
  role            text,
  content         text NOT NULL,
  status          text NOT NULL DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read')),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_messages_message_id ON public.conversation_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_thread_id ON public.conversation_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender_email ON public.conversation_messages(sender_email);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON public.conversation_messages(created_at ASC);

-- 3. Row Level Security
ALTER TABLE public.conversation_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_threads FORCE ROW LEVEL SECURITY;

ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages FORCE ROW LEVEL SECURITY;

-- Service Role Grants
GRANT ALL ON public.conversation_threads TO service_role;
GRANT ALL ON public.conversation_messages TO service_role;

-- Authenticated Role Grants
GRANT SELECT, INSERT, UPDATE ON public.conversation_threads TO authenticated;
GRANT SELECT, INSERT ON public.conversation_messages TO authenticated;

-- Policies for conversation_threads
DROP POLICY IF EXISTS ct_service_all ON public.conversation_threads;
CREATE POLICY ct_service_all ON public.conversation_threads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ct_auth_select ON public.conversation_threads;
CREATE POLICY ct_auth_select ON public.conversation_threads
  FOR SELECT TO authenticated
  USING (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

DROP POLICY IF EXISTS ct_auth_insert ON public.conversation_threads;
CREATE POLICY ct_auth_insert ON public.conversation_threads
  FOR INSERT TO authenticated
  WITH CHECK (
    client_email = (auth.jwt() ->> 'email')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
  );

-- Policies for conversation_messages
DROP POLICY IF EXISTS cm_service_all ON public.conversation_messages;
CREATE POLICY cm_service_all ON public.conversation_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS cm_auth_select ON public.conversation_messages;
CREATE POLICY cm_auth_select ON public.conversation_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_threads t
      WHERE t.thread_id = conversation_messages.thread_id
        AND (
          t.client_email = (auth.jwt() ->> 'email')
          OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
          OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
        )
    )
  );

DROP POLICY IF EXISTS cm_auth_insert ON public.conversation_messages;
CREATE POLICY cm_auth_insert ON public.conversation_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_threads t
      WHERE t.thread_id = conversation_messages.thread_id
        AND (
          t.client_email = (auth.jwt() ->> 'email')
          OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
          OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')
        )
    )
  );

COMMIT;
