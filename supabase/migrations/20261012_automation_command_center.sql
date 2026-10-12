-- Migration: 20261012_automation_command_center.sql
-- Description: Four-Website Unified Automation Command Center, 72h GSC Monitoring & CDN Freshness Schema
-- Safe, additive, idempotent migration.

BEGIN;

-- 1. Automation Registry
CREATE TABLE IF NOT EXISTS public.automation_registry (
  workflow_code           text PRIMARY KEY,
  site                    text NOT NULL,
  title                   text NOT NULL,
  status                  text NOT NULL CHECK (status IN ('STAGED', 'ACTIVE', 'PAUSED', 'DEPRECATED', 'RETIRED')),
  baseline_provenance     text NOT NULL,
  risk_class              text NOT NULL CHECK (risk_class IN ('R0', 'R1', 'R2', 'R3', 'R4')),
  runtime_engine          text NOT NULL DEFAULT 'n8n',
  audit_state             text NOT NULL DEFAULT 'UNVERIFIED',
  live_approval_required  boolean NOT NULL DEFAULT false,
  n8n_id                  text,
  event_type              text,
  webhook_path            text,
  schedule_cron           text,
  data_class              text NOT NULL DEFAULT 'Class 0',
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_registry_site ON public.automation_registry(site);
CREATE INDEX IF NOT EXISTS idx_automation_registry_status ON public.automation_registry(status);
CREATE INDEX IF NOT EXISTS idx_automation_registry_risk ON public.automation_registry(risk_class);

-- 2. Automation Executions Projection (Read-Optimized, Privacy-Safe Receipts)
CREATE TABLE IF NOT EXISTS public.automation_executions_projection (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_code       text NOT NULL REFERENCES public.automation_registry(workflow_code) ON DELETE CASCADE,
  site                text NOT NULL,
  execution_id        text NOT NULL,
  status              text NOT NULL CHECK (status IN ('success', 'error', 'running', 'waiting', 'crashed')),
  started_at          timestamptz NOT NULL,
  stopped_at          timestamptz,
  duration_ms         int,
  error_message       text,
  sanitized_receipt   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auto_exec_wf ON public.automation_executions_projection(workflow_code);
CREATE INDEX IF NOT EXISTS idx_auto_exec_site ON public.automation_executions_projection(site);
CREATE INDEX IF NOT EXISTS idx_auto_exec_status ON public.automation_executions_projection(status);
CREATE INDEX IF NOT EXISTS idx_auto_exec_started ON public.automation_executions_projection(started_at DESC);

-- 3. Automation Schedules
CREATE TABLE IF NOT EXISTS public.automation_schedules (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_code       text NOT NULL REFERENCES public.automation_registry(workflow_code) ON DELETE CASCADE,
  cron_expression     text NOT NULL,
  timezone            text NOT NULL DEFAULT 'UTC',
  is_active           boolean NOT NULL DEFAULT true,
  last_run_at         timestamptz,
  next_run_at         timestamptz,
  slot_lock_until     timestamptz,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auto_schedules_wf ON public.automation_schedules(workflow_code);

-- 4. Automation Approval Requests
CREATE TABLE IF NOT EXISTS public.automation_approval_requests (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_code       text NOT NULL REFERENCES public.automation_registry(workflow_code) ON DELETE CASCADE,
  site                text NOT NULL,
  requested_by        uuid REFERENCES auth.users(id),
  requested_by_email  text NOT NULL,
  action_type         text NOT NULL, -- 'ACTIVATE', 'RESUME', 'RETRY_DEAD_LETTER', 'INVALIDATE_CDN'
  justification       text NOT NULL,
  status              text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auto_approvals_status ON public.automation_approval_requests(status);

-- 5. Automation Approval Decisions
CREATE TABLE IF NOT EXISTS public.automation_approval_decisions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id          uuid NOT NULL REFERENCES public.automation_approval_requests(id) ON DELETE CASCADE,
  decided_by          uuid REFERENCES auth.users(id),
  decided_by_email    text NOT NULL,
  decision            text NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
  decision_reason     text NOT NULL,
  decided_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auto_decisions_req ON public.automation_approval_decisions(request_id);

-- 6. SEO Site Properties
CREATE TABLE IF NOT EXISTS public.seo_site_properties (
  site_id                   text PRIMARY KEY CHECK (site_id IN ('corporate', 'healthcare', 'logic_voice', 'voice_shield')),
  domain                    text NOT NULL,
  sitemap_url               text NOT NULL,
  robots_url                text NOT NULL,
  gsc_property_id           text NOT NULL,
  gsc_verified              boolean NOT NULL DEFAULT false,
  quota_limit_per_day       int NOT NULL DEFAULT 2000,
  quota_used_today          int NOT NULL DEFAULT 0,
  monitoring_interval_hours int NOT NULL DEFAULT 72,
  last_crawl_at             timestamptz,
  next_crawl_at             timestamptz,
  updated_at                timestamptz NOT NULL DEFAULT now()
);

-- Seed Initial 4 Site SEO Properties (Idempotent)
INSERT INTO public.seo_site_properties (site_id, domain, sitemap_url, robots_url, gsc_property_id, monitoring_interval_hours)
VALUES
  ('corporate', 'https://www.logicintelligencetechnologies.in', 'https://www.logicintelligencetechnologies.in/sitemap.xml', 'https://www.logicintelligencetechnologies.in/robots.txt', 'sc-domain:logicintelligencetechnologies.in', 72),
  ('healthcare', 'https://healthcare.logicintelligencetechnologies.in', 'https://healthcare.logicintelligencetechnologies.in/sitemap.xml', 'https://healthcare.logicintelligencetechnologies.in/robots.txt', 'https://healthcare.logicintelligencetechnologies.in/', 72),
  ('logic_voice', 'https://logicvoice.logicintelligencetechnologies.in', 'https://logicvoice.logicintelligencetechnologies.in/sitemap.xml', 'https://logicvoice.logicintelligencetechnologies.in/robots.txt', 'https://logicvoice.logicintelligencetechnologies.in/', 72),
  ('voice_shield', 'https://voiceshield.logicintelligencetechnologies.in', 'https://voiceshield.logicintelligencetechnologies.in/sitemap.xml', 'https://voiceshield.logicintelligencetechnologies.in/robots.txt', 'https://voiceshield.logicintelligencetechnologies.in/', 72)
ON CONFLICT (site_id) DO UPDATE SET
  domain = EXCLUDED.domain,
  sitemap_url = EXCLUDED.sitemap_url,
  robots_url = EXCLUDED.robots_url,
  gsc_property_id = EXCLUDED.gsc_property_id,
  monitoring_interval_hours = EXCLUDED.monitoring_interval_hours,
  updated_at = now();

-- 7. SEO Cycle Runs (72-Hour Persisted History)
CREATE TABLE IF NOT EXISTS public.seo_cycle_runs (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id                 text NOT NULL REFERENCES public.seo_site_properties(site_id) ON DELETE CASCADE,
  cycle_start             timestamptz NOT NULL DEFAULT now(),
  cycle_end               timestamptz,
  status                  text NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED')),
  sitemap_status          text NOT NULL DEFAULT 'UNKNOWN',
  inspected_urls_count    int NOT NULL DEFAULT 0,
  indexed_urls_count      int NOT NULL DEFAULT 0,
  non_indexed_urls_count  int NOT NULL DEFAULT 0,
  issues_found            jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary_markdown        text,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_runs_site ON public.seo_cycle_runs(site_id);
CREATE INDEX IF NOT EXISTS idx_seo_runs_created ON public.seo_cycle_runs(created_at DESC);

-- 8. Edge Cache Observations
CREATE TABLE IF NOT EXISTS public.edge_cache_observations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id               text NOT NULL REFERENCES public.seo_site_properties(site_id) ON DELETE CASCADE,
  url_path              text NOT NULL,
  observed_at           timestamptz NOT NULL DEFAULT now(),
  edge_status           int NOT NULL,
  cache_control         text,
  cf_cache_status       text,
  age_seconds           int,
  etag                  text,
  last_modified_header  text,
  is_fresh              boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_edge_obs_site ON public.edge_cache_observations(site_id);
CREATE INDEX IF NOT EXISTS idx_edge_obs_time ON public.edge_cache_observations(observed_at DESC);

-- 9. Edge Invalidation Requests
CREATE TABLE IF NOT EXISTS public.edge_invalidation_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         text NOT NULL REFERENCES public.seo_site_properties(site_id) ON DELETE CASCADE,
  requested_by    uuid REFERENCES auth.users(id),
  paths           text[] NOT NULL,
  reason          text NOT NULL,
  status          text NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'DISPATCHED', 'FAILED', 'REJECTED')),
  dispatched_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_edge_inval_site ON public.edge_invalidation_requests(site_id);

-- 10. Operations Audit Events
CREATE TABLE IF NOT EXISTS public.ops_audit_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at   timestamptz NOT NULL DEFAULT now(),
  actor_id      uuid,
  actor_email   text NOT NULL,
  site          text NOT NULL,
  action        text NOT NULL,
  target_type   text NOT NULL,
  target_id     text NOT NULL,
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ops_audit_time ON public.ops_audit_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ops_audit_site ON public.ops_audit_events(site);

-- Enable RLS across all 10 tables
ALTER TABLE public.automation_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_approval_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_site_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_cycle_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_cache_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edge_invalidation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ops_audit_events ENABLE ROW LEVEL SECURITY;

-- Service Role Full Privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Staff Read Access Policies
DO $$
BEGIN
  -- automation_registry
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff_view_automation_registry') THEN
    CREATE POLICY staff_view_automation_registry ON public.automation_registry
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations', 'developer', 'viewer')
        )
      );
  END IF;

  -- automation_executions_projection
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff_view_automation_executions') THEN
    CREATE POLICY staff_view_automation_executions ON public.automation_executions_projection
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations', 'developer', 'viewer')
        )
      );
  END IF;

  -- seo_site_properties
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff_view_seo_properties') THEN
    CREATE POLICY staff_view_seo_properties ON public.seo_site_properties
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations', 'developer', 'viewer')
        )
      );
  END IF;

  -- seo_cycle_runs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff_view_seo_runs') THEN
    CREATE POLICY staff_view_seo_runs ON public.seo_cycle_runs
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations', 'developer', 'viewer')
        )
      );
  END IF;

  -- edge_cache_observations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff_view_edge_cache') THEN
    CREATE POLICY staff_view_edge_cache ON public.edge_cache_observations
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role IN ('super_admin', 'admin', 'operations', 'developer', 'viewer')
        )
      );
  END IF;
END $$;

COMMIT;
