-- 20261014110000_visibility_engine_phase3.sql
-- LIT Visibility Engine — Phase 3: Content Engine (generate → review → apply).
--
-- Builds on Phase 1/2. Adds:
--   * content_assets    — the live pages we optimise (one per entity+url).
--   * content_suggestions — generated SEO/GEO assets awaiting human review.
--     Nothing is auto-applied; status flows draft → approved/rejected → applied.
--
-- Same conventions as prior phases: service_role-only forced RLS, idempotent.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists content_assets (
  id         uuid primary key default gen_random_uuid(),
  entity_id  uuid not null references tracked_entities(id) on delete cascade,
  url        text not null,            -- the live page this asset targets
  repo       text not null,            -- which product repo it belongs to
  page_path  text,                     -- best-guess file/route in that repo
  created_at timestamptz not null default now(),
  unique (entity_id, url)
);

create table if not exists content_suggestions (
  id          uuid primary key default gen_random_uuid(),
  asset_id    uuid not null references content_assets(id) on delete cascade,
  query_id    uuid references target_queries(id) on delete set null,
  gap_id      uuid references visibility_gaps(id) on delete set null,
  kind        text not null check (kind in ('json_ld','faq','meta','factual_sentences')),
  payload     jsonb not null,          -- generated content; shape depends on kind
  rationale   text,                    -- why this helps + which query/gap it targets
  status      text not null default 'draft'
               check (status in ('draft','approved','rejected','applied')),
  reviewed_by text,
  reviewed_at timestamptz,
  pr_url      text,                    -- set when applied
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_content_suggestions_status_kind
  on content_suggestions (status, kind);
create index if not exists idx_content_suggestions_asset
  on content_suggestions (asset_id);

-- ---------------------------------------------------------------------------
-- RLS: service_role-only (anon/authenticated denied). Matches prior phases.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['content_assets','content_suggestions']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format('drop policy if exists service_role_all on %I;', t);
    execute format('create policy service_role_all on %I for all to service_role using (true) with check (true);', t);
    execute format('revoke all on %I from public, anon, authenticated;', t);
    execute format('grant all on %I to service_role;', t);
  end loop;
end $$;
