-- 20261014090000_visibility_engine_phase1.sql
-- LIT Visibility Engine — Phase 1 (data model only).
--
-- Measures where LIT (and later, clients) appear across Google and AI answer
-- engines (Perplexity, ChatGPT, Gemini, Claude). This migration adds ONLY the
-- data model + seeds; the scheduled probe (n8n) and the read-only dashboard
-- live outside the database.
--
-- Conventions mirror the lead engine (20261010090000_lead_engine_phase1.sql):
--   * RLS is service_role-ONLY (not `to authenticated`). This app has non-staff
--     authenticated users (client/user roles); the Command Center reads these
--     tables via supabaseAdmin behind requireCapabilityPage, exactly like the
--     lead tables. anon/authenticated get no access.
--   * Fully idempotent (IF NOT EXISTS, drop-then-create policies, guarded seeds)
--     so the db-test harness can apply it twice without duplicates.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Entities we track visibility for. 'self' = LIT; 'client' = a managed client.
create table if not exists tracked_entities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       text not null check (type in ('self','client')),
  domain     text,
  created_at timestamptz not null default now()
);

-- The queries we probe each entity against (e.g. "best web dev company X").
create table if not exists target_queries (
  id         uuid primary key default gen_random_uuid(),
  entity_id  uuid not null references tracked_entities(id) on delete cascade,
  query_text text not null,
  locale     text default 'en-IN',
  active     boolean default true,
  created_at timestamptz not null default now()
);

-- One row per (query, platform) run. raw_response keeps the full API payload
-- (or the error) for debugging; rank is only meaningful for google.
create table if not exists visibility_checks (
  id           uuid primary key default gen_random_uuid(),
  query_id     uuid not null references target_queries(id) on delete cascade,
  platform     text not null check (platform in
                 ('google','google_ai_overview','perplexity','chatgpt','gemini','claude')),
  run_at       timestamptz not null default now(),
  mentioned    boolean not null default false,
  cited        boolean not null default false,
  rank         int,
  snippet      text,
  source_urls  jsonb default '[]'::jsonb,
  raw_response jsonb,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_target_queries_entity_active
  on target_queries (entity_id, active);

create index if not exists idx_visibility_checks_query_platform_run
  on visibility_checks (query_id, platform, run_at desc);

-- ---------------------------------------------------------------------------
-- RLS: service_role-only (anon/authenticated denied). Matches the lead tables.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['tracked_entities','target_queries','visibility_checks']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format('drop policy if exists service_role_all on %I;', t);
    execute format('create policy service_role_all on %I for all to service_role using (true) with check (true);', t);
    execute format('revoke all on %I from public, anon, authenticated;', t);
    execute format('grant all on %I to service_role;', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Seed: one 'self' entity (LIT) + a handful of realistic queries.
-- Idempotent via NOT EXISTS guards (no natural unique key to ON CONFLICT on).
-- ---------------------------------------------------------------------------
insert into tracked_entities (name, type, domain)
select 'Logic Intelligence Technologies', 'self', 'logicintelligencetechnologies.in'
where not exists (
  select 1 from tracked_entities
  where name = 'Logic Intelligence Technologies' and type = 'self'
);

insert into target_queries (entity_id, query_text, locale)
select e.id, q.query_text, 'en-IN'
from tracked_entities e
cross join (values
  ('best web development company Coimbatore'),
  ('AI SaaS development company India'),
  ('custom software development company Coimbatore'),
  ('hire Next.js developers India'),
  ('healthcare software development company India')
) as q(query_text)
where e.type = 'self'
  and e.name = 'Logic Intelligence Technologies'
  and not exists (
    select 1 from target_queries tq
    where tq.entity_id = e.id and tq.query_text = q.query_text
  );
