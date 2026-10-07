-- 20261011090000_lead_outreach_messages.sql
-- Versioned, structured outreach drafts for the Message Studio (directive
-- §28 status, §29 versioning, §27 human approval). Service_role-only, like the
-- rest of the lead engine. Historical versions are never overwritten.
-- Idempotent; applied one statement at a time via MCP.

do $$ begin create type outreach_message_status as enum
  ('draft','needs_review','approved','scheduled','sent','rejected','superseded');
exception when duplicate_object then null; end $$;

create table if not exists lead_outreach_messages (
  id                      uuid primary key default gen_random_uuid(),
  business_id             uuid not null references lead_businesses(id) on delete cascade,
  outreach_id             uuid references lead_outreach(id) on delete set null,
  version                 integer not null default 1,
  channel                 outreach_channel not null default 'email',
  opportunity_type        opportunity_type,
  subject                 text,
  observation             text,
  impact                  text,
  cta                     text,
  body                    text not null,
  evidence_used           jsonb not null default '[]'::jsonb,
  claims_requiring_review jsonb not null default '[]'::jsonb,
  qa_score                integer,
  qa_gates                jsonb not null default '[]'::jsonb,
  blockers_pass           boolean not null default false,
  status                  outreach_message_status not null default 'draft',
  provider                text,
  model                   text,
  generated_by            text,
  generated_at            timestamptz not null default now(),
  reviewed_by             text,
  reviewed_at             timestamptz,
  approved_by             text,
  approved_at             timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists idx_outreach_messages_business on lead_outreach_messages (business_id);
create index if not exists idx_outreach_messages_status   on lead_outreach_messages (status);
create index if not exists idx_outreach_messages_outreach on lead_outreach_messages (outreach_id);

drop trigger if exists trg_set_updated_at on lead_outreach_messages;
create trigger trg_set_updated_at before update on lead_outreach_messages
  for each row execute function lead_set_updated_at();

-- An approved message must carry its approver + timestamp (completeness).
do $$ begin
  alter table lead_outreach_messages add constraint lead_outreach_messages_approved_complete
    check (status <> 'approved' or (approved_by is not null and approved_at is not null));
exception when duplicate_object then null; end $$;

alter table lead_outreach_messages enable row level security;
alter table lead_outreach_messages force row level security;
drop policy if exists service_role_all on lead_outreach_messages;
create policy service_role_all on lead_outreach_messages for all to service_role using (true) with check (true);
revoke all on lead_outreach_messages from public, anon, authenticated;
grant all on lead_outreach_messages to service_role;
