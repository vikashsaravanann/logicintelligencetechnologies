-- 20261014100000_visibility_engine_phase2.sql
-- LIT Visibility Engine — Phase 2, schema (multi-product entities + gap analysis).
--
-- Builds on 20261014090000_visibility_engine_phase1.sql. Adds:
--   * 'competitor' as an allowed tracked_entities.type (kept for future use; the
--     Phase 2 model attaches competitors to a 'self' entity via the competitors
--     table rather than as entities, but the type is widened per spec).
--   * competitors — comparable products/domains per tracked entity.
--   * visibility_gaps — derived rows where a competitor is cited/ranked for a
--     query+platform and we are not. Recomputed by the gap-analysis workflow.
--   * a unique index on tracked_entities(domain) so the Phase 2 seed can upsert
--     each product on its (natural) domain key.
--
-- Same conventions as Phase 1: service_role-only RLS, idempotent (safe twice).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Widen tracked_entities.type to allow 'competitor'
-- ---------------------------------------------------------------------------
alter table tracked_entities drop constraint if exists tracked_entities_type_check;
alter table tracked_entities
  add constraint tracked_entities_type_check check (type in ('self','client','competitor'));

-- Natural key for upserting entities in the seed (domains are distinct per
-- product; multiple NULLs are still allowed by a unique index in Postgres).
create unique index if not exists tracked_entities_domain_key on tracked_entities (domain);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists competitors (
  id         uuid primary key default gen_random_uuid(),
  entity_id  uuid not null references tracked_entities(id) on delete cascade,
  name       text not null,
  domain     text not null,
  created_at timestamptz not null default now(),
  unique (entity_id, domain)
);

-- Derived: one row per (query, platform, competitor) where the competitor shows
-- up and we do not. Fully recomputed each run by the gap-analysis workflow.
create table if not exists visibility_gaps (
  id            uuid primary key default gen_random_uuid(),
  query_id      uuid not null references target_queries(id) on delete cascade,
  platform      text not null,
  competitor_id uuid not null references competitors(id) on delete cascade,
  computed_at   timestamptz not null default now(),
  note          text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_competitors_entity
  on competitors (entity_id);

create index if not exists idx_visibility_gaps_query_platform_computed
  on visibility_gaps (query_id, platform, computed_at desc);

-- ---------------------------------------------------------------------------
-- RLS: service_role-only (anon/authenticated denied). Matches Phase 1.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['competitors','visibility_gaps']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format('drop policy if exists service_role_all on %I;', t);
    execute format('create policy service_role_all on %I for all to service_role using (true) with check (true);', t);
    execute format('revoke all on %I from public, anon, authenticated;', t);
    execute format('grant all on %I to service_role;', t);
  end loop;
end $$;
