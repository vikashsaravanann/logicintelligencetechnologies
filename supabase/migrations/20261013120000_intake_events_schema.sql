-- Migration: 20261013120000_intake_events_schema.sql
-- Description: Central cross-site intake events and audit registry for LIT Universal Platform

CREATE TABLE IF NOT EXISTS public.intake_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    correlation_id UUID,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    entity VARCHAR(50) NOT NULL, -- corporate, healthcare, logicvoice, voiceshield
    environment VARCHAR(50) NOT NULL DEFAULT 'production',
    source_site VARCHAR(255) NOT NULL,
    form_id VARCHAR(100) NOT NULL,
    form_version VARCHAR(50) DEFAULT 'v1',
    source_record_id VARCHAR(255) NOT NULL,
    record_type VARCHAR(100) NOT NULL, -- booking, contact, demo, support, chat_lead
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(100),
    company_name VARCHAR(255),
    safe_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    notification_state VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, queued, sent, failed, simulated
    sync_state VARCHAR(50) NOT NULL DEFAULT 'synced',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_intake_events_entity ON public.intake_events(entity);
CREATE INDEX IF NOT EXISTS idx_intake_events_record_type ON public.intake_events(record_type);
CREATE INDEX IF NOT EXISTS idx_intake_events_submitted_at ON public.intake_events(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_intake_events_customer_email ON public.intake_events(customer_email);

ALTER TABLE public.intake_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins to view all intake events
CREATE POLICY "Admins can view all intake events" ON public.intake_events
    FOR SELECT TO authenticated USING (true);

-- Allow service role full management
CREATE POLICY "Service role full intake management" ON public.intake_events
    FOR ALL TO service_role USING (true) WITH CHECK (true);
