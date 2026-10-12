-- Auto-assign super_admin role to createwithvikash@gmail.com
UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE lower(email) = 'createwithvikash@gmail.com'
);

CREATE OR REPLACE FUNCTION public.assign_super_admin_for_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'createwithvikash@gmail.com' THEN
    NEW.role := 'super_admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_assign_super_admin_owner ON public.profiles;
CREATE TRIGGER trigger_assign_super_admin_owner
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_super_admin_for_owner();
