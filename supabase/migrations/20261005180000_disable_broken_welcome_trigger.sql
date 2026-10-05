-- Applied to production on 2026-10-05 via SQL.
--
-- trg_send_welcome_email_on_profiles_insert (created outside migrations)
-- called http() from an AFTER INSERT trigger on profiles, but neither the
-- http nor the pg_net extension is installed. Every profile insert failed
-- with "function http(jsonb) does not exist", so 22 of 30 accounts had no
-- profile row and no role, and the admin accounts could not open /admin.
-- Welcome emails are sent by the app (auth callback and
-- /api/auth/send-welcome), so the trigger is disabled, not repaired.
-- Re-enable with: ALTER TABLE public.profiles ENABLE TRIGGER trg_send_welcome_email_on_profiles_insert;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_send_welcome_email_on_profiles_insert'
      AND tgrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles DISABLE TRIGGER trg_send_welcome_email_on_profiles_insert;
  END IF;
END $$;
