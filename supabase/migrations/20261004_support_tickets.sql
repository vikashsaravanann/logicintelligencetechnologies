-- Migration: Create support_tickets table with Row Level Security (RLS)
-- Logic Intelligence Technologies (LIT) Autonomous Workflow Fabric

CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_email text NOT NULL,
  original_message text NOT NULL,
  category text NOT NULL,
  urgency integer NOT NULL,
  sentiment text NOT NULL,
  status text DEFAULT 'open'
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow insert via service role and authenticated users
CREATE POLICY "Allow service role full access on support_tickets"
  ON support_tickets
  FOR ALL
  USING (true)
  WITH CHECK (true);
