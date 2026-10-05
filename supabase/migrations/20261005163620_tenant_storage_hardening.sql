
-- Replace ALL policies on this explicitly reviewed table set. PostgreSQL ORs
-- permissive policies; adding an owner predicate does not close older true rules.
-- No ownership backfill: NULL user_id stays unassigned and invisible to clients.
-- Administrative writes and public lead submissions use guarded server routes.
BEGIN;

DO $$
DECLARE
  t text;
  p record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'projects', 'invoices', 'bookings', 'support_tickets',
    'support_ticket_messages', 'client_files', 'onboarding_submissions',
    'contact_leads', 'demo_leads', 'checklist_leads', 'ai_captured_leads',
    'lead_activity_events'
  ] LOOP
    IF to_regclass(format('public.%I', t)) IS NULL THEN
      RAISE EXCEPTION 'Required audited table public.% is missing', t;
    END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    FOR p IN SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format(
      'CREATE POLICY server_access ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t
    );
    -- profiles is readable only by its owner and role is protected by the
    -- first hardening migration. No email-suffix or editable metadata trust.
    EXECUTE format(
      'CREATE POLICY admin_read ON public.%I FOR SELECT TO authenticated USING (
        NOT coalesce((auth.jwt() ->> ''is_anonymous'')::boolean, false)
        AND EXISTS (SELECT 1 FROM public.profiles p
          WHERE p.id = (SELECT auth.uid()) AND p.role IN (''admin'', ''super_admin''))
      )', t
    );
  END LOOP;
END $$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'projects', 'invoices', 'bookings', 'support_tickets',
    'client_files', 'onboarding_submissions'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY client_read ON public.%I FOR SELECT TO authenticated USING (
        user_id = (SELECT auth.uid())
        AND NOT coalesce((auth.jwt() ->> ''is_anonymous'')::boolean, false)
      )', t
    );
  END LOOP;
END $$;

CREATE POLICY client_ticket_create ON public.support_tickets
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (SELECT auth.uid())
    AND NOT coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
    AND lower(status) = 'open'
    AND (priority IS NULL OR lower(priority) IN ('normal', 'medium'))
    AND length(subject) BETWEEN 1 AND 200
    AND length(message) BETWEEN 1 AND 10000
  );
-- Clients cannot change ticket status, ownership, priority or staff messages.
CREATE POLICY client_message_read ON public.support_ticket_messages
  FOR SELECT TO authenticated USING (
    NOT coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
    AND EXISTS (SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND t.user_id = (SELECT auth.uid()))
  );
CREATE POLICY client_message_create ON public.support_ticket_messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_id = (SELECT auth.uid()) AND sender_type = 'client'
    AND NOT coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
    AND length(message) BETWEEN 1 AND 10000
    -- Attachment paths need a separate owner-validated server flow.
    AND (attachments IS NULL OR attachments = '[]'::jsonb)
    AND EXISTS (SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND t.user_id = (SELECT auth.uid()))
  );

CREATE POLICY client_file_create ON public.client_files
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (SELECT auth.uid())
    AND NOT coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
    AND split_part(file_path, '/', 1) = (SELECT auth.uid())::text
    AND file_path !~ '(^|/)\.\.(/|$)'
    AND length(file_name) BETWEEN 1 AND 255
    AND size BETWEEN 1 AND 10485760
    AND EXISTS (SELECT 1 FROM storage.objects o
      WHERE o.bucket_id = 'client_vault' AND o.name = file_path)
  );
CREATE POLICY client_file_delete ON public.client_files
  FOR DELETE TO authenticated USING (
    user_id = (SELECT auth.uid())
    AND NOT coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );
CREATE POLICY client_onboarding_create ON public.onboarding_submissions
  FOR INSERT TO authenticated WITH CHECK (
    user_id = (SELECT auth.uid()) AND status = 'Submitted'
    AND NOT coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
    AND jsonb_typeof(answers_json) = 'object'
    AND octet_length(answers_json::text) <= 32768
  );
-- Submitted onboarding is immutable for clients; review status is staff-owned.

DROP POLICY IF EXISTS "Clients can upload to vault" ON storage.objects;
DROP POLICY IF EXISTS "Clients can read vault" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read vault" ON storage.objects;
DROP POLICY IF EXISTS vault_client_insert ON storage.objects;
DROP POLICY IF EXISTS vault_client_select ON storage.objects;
DROP POLICY IF EXISTS vault_client_delete ON storage.objects;
DROP POLICY IF EXISTS vault_admin_select ON storage.objects;
CREATE POLICY vault_client_insert ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'client_vault'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND name !~ '(^|/)\.\.(/|$)'
    AND NOT coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );
CREATE POLICY vault_client_select ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'client_vault'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND NOT coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );
CREATE POLICY vault_client_delete ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'client_vault'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND NOT coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );
CREATE POLICY vault_admin_select ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'client_vault'
    AND NOT coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
    AND EXISTS (SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'super_admin'))
  );
-- No UPDATE/upsert privilege: uploading a new object is supported; silently
-- overwriting another document is not. Keep unrelated bucket policies intact.

CREATE INDEX IF NOT EXISTS projects_tenant_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS invoices_tenant_idx ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS bookings_tenant_idx ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS client_files_tenant_idx ON public.client_files(user_id);
CREATE INDEX IF NOT EXISTS onboarding_tenant_idx ON public.onboarding_submissions(user_id);
CREATE INDEX IF NOT EXISTS support_messages_ticket_idx ON public.support_ticket_messages(ticket_id);

COMMIT;