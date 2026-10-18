BEGIN;

-- These functions are internal guards/administration helpers. They are not API RPCs.
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.forbid_client_impersonation(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role;
GRANT EXECUTE ON FUNCTION public.forbid_client_impersonation(uuid, uuid) TO service_role;

COMMIT;
