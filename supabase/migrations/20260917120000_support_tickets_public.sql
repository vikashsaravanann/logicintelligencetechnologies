-- Allow public support form submissions without auth.users identity.
-- user_id remains for authenticated portal tickets; nullable for anonymous web forms.

ALTER TABLE public.support_tickets
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS requester_name text,
  ADD COLUMN IF NOT EXISTS requester_email text,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'web-form',
  ADD COLUMN IF NOT EXISTS page_url text;

-- Public insert via service role only; keep authenticated self-insert.
DROP POLICY IF EXISTS "Clients can create tickets" ON public.support_tickets;
CREATE POLICY "Clients can create tickets"
  ON public.support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Company admin read (service role bypasses RLS for inserts from API)
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') ILIKE '%@logicintelligencetechnologies.in'
    OR auth.uid() = user_id
  );

CREATE INDEX IF NOT EXISTS support_tickets_requester_email_idx
  ON public.support_tickets (lower(requester_email));
CREATE INDEX IF NOT EXISTS support_tickets_status_idx
  ON public.support_tickets (status);
