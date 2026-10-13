-- 20261014120000_visibility_engine_phase4.sql
-- LIT Visibility Engine — Phase 4: Citation & Mention Engine.
--
-- Builds on Phase 1–3. Adds:
--   * citation_targets — off-site places we could earn a mention/citation
--     (directories, communities, press, wiki-eligible sources, review sites,
--     partners). status flows identified → queued → actioned → live (or rejected).
--   * mention_checks — did a citation actually go live, and is it feeding AI
--     answers (its URL seen in a probe's source_urls)? That last flag is the
--     money metric.
--
-- Outreach itself is NOT modelled here — promoting a target reuses the Lead
-- Engine's lead_outreach_messages queue + approval UI. Nothing auto-sends.
--
-- Same conventions as prior phases: service_role-only forced RLS, idempotent.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists citation_targets (
  id               uuid primary key default gen_random_uuid(),
  entity_id        uuid not null references tracked_entities(id) on delete cascade,
  type             text not null check (type in
                     ('directory','community','press','wiki_source','review_site','partner')),
  name             text not null,
  url              text not null,
  domain_authority int,
  relevance_note   text,
  status           text not null default 'identified'
                     check (status in ('identified','queued','actioned','live','rejected')),
  citation_url     text,               -- where our mention ended up, once live
  created_at       timestamptz not null default now(),
  unique (entity_id, url)
);

create table if not exists mention_checks (
  id                 uuid primary key default gen_random_uuid(),
  citation_target_id uuid not null references citation_targets(id) on delete cascade,
  checked_at         timestamptz not null default now(),
  is_live            boolean default false,
  seen_in_ai         boolean default false,  -- appeared as a source in an AI probe
  note               text,
  created_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_citation_targets_entity_status
  on citation_targets (entity_id, status);
create index if not exists idx_mention_checks_target_checked
  on mention_checks (citation_target_id, checked_at desc);

-- ---------------------------------------------------------------------------
-- RLS: service_role-only (anon/authenticated denied). Matches prior phases.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['citation_targets','mention_checks']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format('drop policy if exists service_role_all on %I;', t);
    execute format('create policy service_role_all on %I for all to service_role using (true) with check (true);', t);
    execute format('revoke all on %I from public, anon, authenticated;', t);
    execute format('grant all on %I to service_role;', t);
  end loop;
end $$;
