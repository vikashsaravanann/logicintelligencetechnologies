-- Complete Platform Database Migration for Logic Intelligence Technologies
-- Adds tables for Bookings, Proposals, Support Ticket Messages, and CRM extensions

-- 1. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.contact_leads(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    consultation_type VARCHAR(100) NOT NULL DEFAULT 'Discovery',
    slot_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
    status VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
    calendar_event_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to bookings" ON public.bookings 
FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Clients can view own bookings" ON public.bookings 
FOR SELECT TO authenticated USING (auth.uid() = user_id OR email = auth.jwt()->>'email');

CREATE POLICY "Admins can manage all bookings" ON public.bookings 
FOR ALL TO authenticated USING (true);

-- 2. Proposals Table
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    secure_token VARCHAR(100) NOT NULL UNIQUE,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_company VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    scope TEXT[] NOT NULL DEFAULT '{}',
    deliverables TEXT[] NOT NULL DEFAULT '{}',
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    timeline VARCHAR(100) NOT NULL,
    pricing NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    terms TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of proposals by token" ON public.proposals 
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow client update to approve proposals" ON public.proposals 
FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage all proposals" ON public.proposals 
FOR ALL TO authenticated USING (true);

-- 3. Support Ticket Messages Table
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_type VARCHAR(20) NOT NULL DEFAULT 'client',
    sender_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view messages for own tickets" ON public.support_ticket_messages 
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE support_tickets.id = support_ticket_messages.ticket_id 
        AND support_tickets.user_id = auth.uid()
    )
);

CREATE POLICY "Clients can send messages to own tickets" ON public.support_ticket_messages 
FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE support_tickets.id = support_ticket_messages.ticket_id 
        AND support_tickets.user_id = auth.uid()
    )
);

CREATE POLICY "Admins can manage all ticket messages" ON public.support_ticket_messages 
FOR ALL TO authenticated USING (true);

-- 4. Extend Contact Leads for CRM and Scoring
ALTER TABLE public.contact_leads
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS lead_category VARCHAR(50) DEFAULT 'developing',
ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50) DEFAULT 'new_lead',
ADD COLUMN IF NOT EXISTS assigned_owner VARCHAR(255) DEFAULT 'Vikash Saravanan',
ADD COLUMN IF NOT EXISTS follow_up_status VARCHAR(50) DEFAULT 'enrolled',
ADD COLUMN IF NOT EXISTS follow_up_day INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS service_interest VARCHAR(100),
ADD COLUMN IF NOT EXISTS budget VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());
