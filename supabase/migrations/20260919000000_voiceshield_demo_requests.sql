-- ============================================================
-- VoiceShield Integration: Demo Request Lead Table
-- Migration: 20260919000000_voiceshield_demo_requests.sql
-- ============================================================
-- Extends the existing LIT Supabase project with a VoiceShield-specific
-- lead capture table. Namespaced with `vs_` prefix to avoid collisions
-- with existing LIT tables.
--
-- Note: VoiceShield demo requests are ALSO captured in the existing
-- `contact_leads` table via /api/contact (projectType = "VoiceShield Demo Request").
-- This table provides richer structured data for VoiceShield-specific CRM.
-- ============================================================

-- VoiceShield demo request leads
CREATE TABLE IF NOT EXISTS vs_demo_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contact
  full_name       TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 120),
  email           TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  phone           TEXT CHECK (char_length(phone) <= 40),
  company_name    TEXT CHECK (char_length(company_name) <= 160),

  -- Request details
  use_case        TEXT CHECK (char_length(use_case) <= 2000),
  sector          TEXT CHECK (char_length(sector) <= 80),

  -- CRM
  status          TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'contacted', 'demo_scheduled', 'converted', 'closed')),
  notes           TEXT CHECK (char_length(notes) <= 4000),

  -- Source tracking
  page_url        TEXT CHECK (char_length(page_url) <= 500),
  utm_source      TEXT CHECK (char_length(utm_source) <= 200),

  -- Referential link to contact_leads if a parallel record was created
  contact_lead_id UUID REFERENCES contact_leads(id) ON DELETE SET NULL
);

-- Indexes for admin CRM queries
CREATE INDEX IF NOT EXISTS idx_vs_demo_requests_email     ON vs_demo_requests(email);
CREATE INDEX IF NOT EXISTS idx_vs_demo_requests_status    ON vs_demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_vs_demo_requests_created   ON vs_demo_requests(created_at DESC);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_vs_demo_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vs_demo_requests_updated_at ON vs_demo_requests;
CREATE TRIGGER vs_demo_requests_updated_at
  BEFORE UPDATE ON vs_demo_requests
  FOR EACH ROW EXECUTE FUNCTION update_vs_demo_requests_updated_at();

-- Enable RLS
ALTER TABLE vs_demo_requests ENABLE ROW LEVEL SECURITY;

-- Policy: No public SELECT — admin only via service role
-- (Public submissions go through /api/contact which uses service role insert)
-- Admin reads via service role — no public policy needed for SELECT.

-- Policy: No direct public INSERT either — all inserts via server-side API
-- using service role key (SUPABASE_SERVICE_ROLE_KEY).

COMMENT ON TABLE vs_demo_requests IS
  'VoiceShield demo request leads. Inserted server-side only via /api/contact '
  'using service role. No public access. Managed through LIT admin panel.';

COMMENT ON COLUMN vs_demo_requests.status IS
  'CRM status: new → contacted → demo_scheduled → converted | closed';
