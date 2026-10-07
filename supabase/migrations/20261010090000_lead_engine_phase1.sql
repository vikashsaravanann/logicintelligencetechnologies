-- 20261010090000_lead_engine_phase1.sql
-- LIT Global Lead Engine — Phase 1 (hardened for this codebase).
--
-- Source: founder-supplied 0001–0006. Adapted for production here:
--   * RLS is service_role-ONLY (not `to authenticated`). This app has non-staff
--     authenticated users (client/user roles); the Command Center reads these
--     tables via supabaseAdmin behind requireCapabilityPage, exactly like
--     admin_audit_log. anon/authenticated get no access.
--   * lead_audit_events is append-only (no UPDATE/DELETE policy or grant).
--   * functions pin search_path (advisor hygiene).
--   * fully idempotent (enums guarded, IF NOT EXISTS, drop-then-create triggers/
--     policies) so the db-test harness can apply it twice.
--
-- The jurisdiction allowlist + suppression gate is enforced by a trigger on
-- lead_outreach, so no worker/agent/service_role insert can bypass it.


create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums (idempotent)
-- ---------------------------------------------------------------------------
do $$ begin create type lead_status as enum
  ('new','contacted','replied','qualified','proposal','won','lost','suppressed');
exception when duplicate_object then null; end $$;

do $$ begin create type lead_priority as enum ('p1','p2','p3','p4');
exception when duplicate_object then null; end $$;

do $$ begin create type opportunity_type as enum
  ('L0_no_website','L1_social_only','L2_broken_website','L3_legacy_website',
   'L4_performance','L5_mobile_ux','L6_conversion','L7_seo_foundation',
   'L8_growth_automation');
exception when duplicate_object then null; end $$;

do $$ begin create type contact_type as enum
  ('business_email','business_phone','contact_form','generic','other');
exception when duplicate_object then null; end $$;

do $$ begin create type verification_status as enum
  ('unverified','syntax_valid','domain_valid','mx_present',
   'deliverability_unknown','provider_verified','invalid');
exception when duplicate_object then null; end $$;

do $$ begin create type outreach_channel as enum ('email','phone','linkedin','whatsapp','other');
exception when duplicate_object then null; end $$;

do $$ begin create type outreach_status as enum
  ('draft','queued','sent','replied','bounced','opted_out','closed');
exception when duplicate_object then null; end $$;

do $$ begin create type outreach_event_type as enum
  ('sent','delivered','opened','clicked','replied','bounced','unsubscribed','complaint');
exception when duplicate_object then null; end $$;

do $$ begin create type suppression_reason as enum
  ('opt_out','bounce','complaint','manual','jurisdiction','do_not_contact');
exception when duplicate_object then null; end $$;

do $$ begin create type jurisdiction_outreach_status as enum ('allowed','review_required','blocked');
exception when duplicate_object then null; end $$;

do $$ begin create type job_status as enum ('pending','running','succeeded','failed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin create type enrichment_type as enum
  ('discovery','website_crawl','technical_audit','email_validation','screenshot','scoring');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Shared helper
-- ---------------------------------------------------------------------------
create or replace function lead_set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists lead_import_batches (
  id              uuid primary key default gen_random_uuid(),
  label           text not null,
  target_country  text,
  target_city     text,
  target_industry text,
  requested_count integer,
  status          job_status not null default 'pending',
  cost_estimate   numeric(12,4),
  cost_actual     numeric(12,4),
  requested_by    text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists lead_sources (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  source_type   text not null,
  license_notes text,
  permitted_use text,
  base_url      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists lead_jurisdictions (
  id               uuid primary key default gen_random_uuid(),
  country_code     text not null unique,
  country_name     text,
  outreach_status  jurisdiction_outreach_status not null default 'review_required',
  legal_framework  text,
  requires_opt_in  boolean,
  rule_summary     text,
  reviewed_by      text,
  reviewed_at      timestamptz,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists lead_businesses (
  id                 uuid primary key default gen_random_uuid(),
  import_batch_id    uuid references lead_import_batches(id) on delete set null,
  discovery_source_id uuid references lead_sources(id) on delete set null,
  company_name       text not null,
  legal_name         text,
  industry           text,
  category           text,
  country_code       text,
  region             text,
  city               text,
  address            text,
  timezone           text,
  description        text,
  size_band          text,
  business_type      text,
  domain             text,
  has_website        boolean,
  status             lead_status not null default 'new',
  priority           lead_priority,
  owner              text,
  discovered_at      timestamptz,
  source_url         text,
  provenance         jsonb not null default '{}'::jsonb,
  dedup_key          text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists lead_contacts (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references lead_businesses(id) on delete cascade,
  contact_type        contact_type not null default 'business_email',
  full_name           text,
  role_title          text,
  email               text,
  phone               text,
  contact_page_url    text,
  is_generic          boolean,
  source_id           uuid references lead_sources(id) on delete set null,
  source_url          text,
  retrieved_at        timestamptz,
  verification_status verification_status not null default 'deliverability_unknown',
  provenance          jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists lead_websites (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references lead_businesses(id) on delete cascade,
  url             text,
  final_url       text,
  domain          text,
  https           boolean,
  status_code     integer,
  is_reachable    boolean,
  redirects       jsonb,
  cms             text,
  tech_stack      jsonb,
  last_crawled_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists lead_media (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references lead_businesses(id) on delete cascade,
  website_id          uuid references lead_websites(id) on delete set null,
  media_type          text not null,
  source_url          text,
  storage_path        text,
  image_license_status text,
  attribution         text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists lead_technical_audits (
  id                   uuid primary key default gen_random_uuid(),
  business_id          uuid not null references lead_businesses(id) on delete cascade,
  website_id           uuid references lead_websites(id) on delete set null,
  tested_url           text,
  strategy             text,
  tool                 text,
  data_source          text,
  audited_at           timestamptz not null default now(),
  performance_score    numeric,
  accessibility_score  numeric,
  seo_score            numeric,
  best_practices_score numeric,
  lcp_ms               numeric,
  cls                  numeric,
  inp_ms               numeric,
  ttfb_ms              numeric,
  mobile_friendly      boolean,
  https_ok             boolean,
  has_title            boolean,
  has_meta_description boolean,
  has_canonical        boolean,
  has_sitemap          boolean,
  has_robots           boolean,
  has_structured_data  boolean,
  broken_resources     jsonb,
  conversion_signals   jsonb,
  raw_result           jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists lead_scores (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references lead_businesses(id) on delete cascade,
  score               integer not null check (score between 0 and 100),
  priority            lead_priority,
  business_fit        integer check (business_fit between 0 and 20),
  website_opportunity integer check (website_opportunity between 0 and 25),
  technical_problems  integer check (technical_problems between 0 and 15),
  commercial_intent   integer check (commercial_intent between 0 and 15),
  contactability      integer check (contactability between 0 and 10),
  geo_fit             integer check (geo_fit between 0 and 10),
  evidence_confidence numeric check (evidence_confidence between 0 and 1),
  reasons             jsonb not null default '[]'::jsonb,
  model               text,
  scored_at           timestamptz not null default now(),
  is_current          boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists lead_opportunities (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references lead_businesses(id) on delete cascade,
  opportunity_type  opportunity_type not null,
  evidence          jsonb not null default '{}'::jsonb,
  severity          integer,
  recommended_offer text,
  status            text not null default 'open',
  detected_at       timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists lead_outreach (
  id                   uuid primary key default gen_random_uuid(),
  business_id          uuid not null references lead_businesses(id) on delete cascade,
  contact_id           uuid references lead_contacts(id) on delete set null,
  channel              outreach_channel not null default 'email',
  campaign             text,
  status               outreach_status not null default 'draft',
  draft_body           text,
  attempts             integer not null default 0,
  first_contacted_at   timestamptz,
  last_contacted_at    timestamptz,
  replied              boolean not null default false,
  replied_at           timestamptz,
  opted_out            boolean not null default false,
  jurisdiction_cleared boolean not null default false,
  suppression_checked  boolean not null default false,
  approved_by          text,
  approved_at          timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table if not exists lead_outreach_events (
  id                 uuid primary key default gen_random_uuid(),
  outreach_id        uuid not null references lead_outreach(id) on delete cascade,
  business_id        uuid references lead_businesses(id) on delete set null,
  event_type         outreach_event_type not null,
  channel            outreach_channel,
  provider_message_id text,
  payload            jsonb,
  occurred_at        timestamptz not null default now(),
  created_at         timestamptz not null default now()
);

create table if not exists lead_suppressions (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references lead_businesses(id) on delete set null,
  email       text,
  phone       text,
  domain      text,
  reason      suppression_reason not null,
  scope       text not null default 'global',
  source      text,
  notes       text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists lead_enrichment_jobs (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid references lead_businesses(id) on delete cascade,
  batch_id      uuid references lead_import_batches(id) on delete set null,
  job_type      enrichment_type not null,
  status        job_status not null default 'pending',
  attempts      integer not null default 0,
  scheduled_for timestamptz,
  started_at    timestamptz,
  finished_at   timestamptz,
  cost          numeric(12,4),
  error         text,
  result        jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists lead_audit_events (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id   uuid,
  action      text not null,
  actor       text,
  details     jsonb,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_businesses_country  on lead_businesses (country_code);
create index if not exists idx_businesses_industry on lead_businesses (industry);
create index if not exists idx_businesses_status   on lead_businesses (status);
create index if not exists idx_businesses_priority on lead_businesses (priority);
create index if not exists idx_businesses_batch    on lead_businesses (import_batch_id);
create index if not exists idx_businesses_dedup    on lead_businesses (dedup_key);
create unique index if not exists uq_businesses_domain on lead_businesses (lower(domain))
  where domain is not null and domain <> '';

create index if not exists idx_contacts_business on lead_contacts (business_id);
create index if not exists idx_contacts_email    on lead_contacts (lower(email)) where email is not null;
create index if not exists idx_contacts_phone    on lead_contacts (phone) where phone is not null;

create index if not exists idx_websites_business on lead_websites (business_id);
create index if not exists idx_audits_business   on lead_technical_audits (business_id);
create index if not exists idx_audits_website    on lead_technical_audits (website_id);

create index if not exists idx_scores_business_current on lead_scores (business_id) where is_current;

create index if not exists idx_opps_business on lead_opportunities (business_id);
create index if not exists idx_opps_type     on lead_opportunities (opportunity_type);

create index if not exists idx_outreach_business on lead_outreach (business_id);
create index if not exists idx_outreach_status   on lead_outreach (status);
create index if not exists idx_outreach_events_outreach on lead_outreach_events (outreach_id);
create index if not exists idx_outreach_events_business on lead_outreach_events (business_id);

create index if not exists idx_suppressions_email  on lead_suppressions (lower(email)) where email is not null and active;
create index if not exists idx_suppressions_phone  on lead_suppressions (phone)        where phone is not null and active;
create index if not exists idx_suppressions_domain on lead_suppressions (lower(domain)) where domain is not null and active;
create index if not exists idx_suppressions_biz    on lead_suppressions (business_id)   where active;

create index if not exists idx_jobs_status   on lead_enrichment_jobs (status);
create index if not exists idx_jobs_type     on lead_enrichment_jobs (job_type);
create index if not exists idx_jobs_business on lead_enrichment_jobs (business_id);

create index if not exists idx_lead_audit_entity  on lead_audit_events (entity_type, entity_id);
create index if not exists idx_lead_audit_created on lead_audit_events (created_at);

-- ---------------------------------------------------------------------------
-- updated_at triggers (idempotent)
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'lead_import_batches','lead_sources','lead_jurisdictions','lead_businesses',
    'lead_contacts','lead_websites','lead_media','lead_technical_audits',
    'lead_scores','lead_opportunities','lead_outreach','lead_suppressions',
    'lead_enrichment_jobs'
  ]
  loop
    execute format('drop trigger if exists trg_set_updated_at on %I;', t);
    execute format(
      'create trigger trg_set_updated_at before update on %I
         for each row execute function lead_set_updated_at();', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Outreach gate: jurisdiction allowlist + suppression (DB-enforced)
-- ---------------------------------------------------------------------------
create or replace function lead_enforce_outreach_gates()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_country text;
  v_status  jurisdiction_outreach_status;
  v_email   text;
  v_phone   text;
  v_domain  text;
begin
  select country_code, domain into v_country, v_domain
    from lead_businesses where id = new.business_id;

  if v_country is null then
    raise exception
      'Outreach blocked: business % has no country_code; cannot clear jurisdiction', new.business_id;
  end if;

  select outreach_status into v_status
    from lead_jurisdictions where country_code = v_country;

  if v_status is distinct from 'allowed' then
    raise exception
      'Outreach blocked: jurisdiction % is not on the outreach allowlist (status: %)',
      v_country, coalesce(v_status::text, 'unlisted');
  end if;

  if new.contact_id is not null then
    select email, phone into v_email, v_phone
      from lead_contacts where id = new.contact_id;
  end if;

  if exists (
    select 1 from lead_suppressions s
     where s.active
       and (
            s.business_id = new.business_id
         or (v_email  is not null and lower(s.email)  = lower(v_email))
         or (v_phone  is not null and s.phone         = v_phone)
         or (v_domain is not null and lower(s.domain) = lower(v_domain))
       )
  ) then
    raise exception
      'Outreach blocked: active suppression exists for business % / contact %',
      new.business_id, new.contact_id;
  end if;

  new.jurisdiction_cleared := true;
  new.suppression_checked  := true;
  return new;
end;
$$;

drop trigger if exists trg_outreach_gate on lead_outreach;
create trigger trg_outreach_gate
  before insert or update of business_id, contact_id, status
  on lead_outreach
  for each row
  execute function lead_enforce_outreach_gates();

-- ---------------------------------------------------------------------------
-- RLS: service_role-only (anon/authenticated denied). Matches admin_audit_log.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'lead_import_batches','lead_sources','lead_jurisdictions','lead_businesses',
    'lead_contacts','lead_websites','lead_media','lead_technical_audits',
    'lead_scores','lead_opportunities','lead_outreach','lead_outreach_events',
    'lead_suppressions','lead_enrichment_jobs'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format('drop policy if exists service_role_all on %I;', t);
    execute format('create policy service_role_all on %I for all to service_role using (true) with check (true);', t);
    execute format('revoke all on %I from public, anon, authenticated;', t);
    execute format('grant all on %I to service_role;', t);
  end loop;
end $$;

-- lead_audit_events: append-only (insert + select for service_role; no update/delete).
alter table lead_audit_events enable row level security;
alter table lead_audit_events force row level security;
drop policy if exists service_role_all on lead_audit_events;
drop policy if exists lead_audit_insert on lead_audit_events;
drop policy if exists lead_audit_select on lead_audit_events;
create policy lead_audit_insert on lead_audit_events for insert to service_role with check (true);
create policy lead_audit_select on lead_audit_events for select to service_role using (true);
revoke all on lead_audit_events from public, anon, authenticated;
revoke update, delete, truncate on lead_audit_events from service_role;
grant select, insert on lead_audit_events to service_role;

-- ---------------------------------------------------------------------------
-- Seed: conservative jurisdiction posture (NOTHING 'allowed') + sources.
-- ---------------------------------------------------------------------------
insert into lead_jurisdictions (country_code, country_name, outreach_status, legal_framework, requires_opt_in, rule_summary) values
  ('IN','India',              'review_required','DPDP Act 2023',     null, 'Home jurisdiction. Confirm a documented basis under the DPDP Act before enabling; a business address does not auto-exempt outreach.'),
  ('US','United States',      'review_required','CAN-SPAM',          false,'Lighter regime: accurate headers, physical address, working opt-out. Still confirm per-state rules before enabling.'),
  ('GB','United Kingdom',     'review_required','UK GDPR+PECR',      null, 'Corporate-subscriber B2B email has some latitude; sole traders/partnerships treated more like individuals. Review before enabling.'),
  ('AE','United Arab Emirates','review_required','UAE PDPL',         null, 'Review marketing-consent requirements before enabling.'),
  ('AU','Australia',          'review_required','Spam Act 2003',     true, 'Consent-based. Review before enabling.'),
  ('DE','Germany',            'blocked',        'GDPR+ePrivacy+UWG', true, 'Cold B2B email is high-risk; UWG is strict. Keep blocked until a strong basis exists.'),
  ('FR','France',             'blocked',        'GDPR+ePrivacy',     true, 'Cold electronic marketing is high-risk. Keep blocked.'),
  ('CA','Canada',             'blocked',        'CASL',              true, 'Strict opt-in regime with significant penalties. Keep blocked.')
on conflict (country_code) do nothing;

insert into lead_sources (name, source_type, permitted_use, license_notes) values
  ('manual',           'manual',       'Internal entry',                              null),
  ('LIT crawler',      'public_web',   'Public business pages of a resolved domain',  'Crawl only publicly accessible business pages; respect robots where applicable.'),
  ('Vibe Prospecting', 'licensed_api', 'Per provider licence',                        'Confirm storage + outreach terms before relying on it.'),
  ('Google Places',    'licensed_api', 'Per Google Places terms',                     'Export/caching restrictions apply; do not build a permanent clone of Google business data.')
on conflict (name) do nothing;

