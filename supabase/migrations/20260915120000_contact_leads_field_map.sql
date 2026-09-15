-- Additive columns so contact/career payloads keep phone, source, and intent
-- without stuffing everything into message. Existing rows remain valid.

ALTER TABLE public.contact_leads
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS project_type text,
  ADD COLUMN IF NOT EXISTS budget text,
  ADD COLUMN IF NOT EXISTS timeline text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS page_url text,
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Anonymous visitors must not read leads. Keep insert-only for anon.
DROP POLICY IF EXISTS "Auth read contact_leads" ON public.contact_leads;
CREATE POLICY "Company read contact_leads"
  ON public.contact_leads
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') ILIKE '%@logicintelligencetechnologies.in'
  );
