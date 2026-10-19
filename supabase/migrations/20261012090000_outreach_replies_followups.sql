-- 20261012090000_outreach_replies_followups.sql
-- Replies and Follow-Ups for the Outreach Intelligence workspace (directive
-- Lead Operations → Outreach: Replies, Follow-Ups). Service_role-only, like the
-- rest of the lead engine. Replies are append-only (an inbound record is never
-- rewritten); their category can be re-classified via a new append row, never
-- by mutating the original. Follow-ups are mutable (scheduled → sent/cancelled).
-- Idempotent; applied one statement at a time via MCP.

-- Reply intent taxonomy (directive: POSITIVE / QUESTION / REQUEST_AUDIT /
-- NOT_NOW / NOT_INTERESTED / OPT_OUT / BOUNCE), plus auto_reply and the
-- uncategorized default so nothing is ever silently mislabelled.
do $$ begin create type outreach_reply_category as enum
  ('positive','question','request_audit','not_now','not_interested','opt_out','bounce','auto_reply','uncategorized');
exception when duplicate_object then null; end $$;

do $$ begin create type outreach_followup_status as enum
  ('scheduled','sent','cancelled','skipped');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Inbound replies (append-only)
-- ---------------------------------------------------------------------------
create table if not exists lead_outreach_replies (
  id                   uuid primary key default gen_random_uuid(),
  business_id          uuid not null references lead_businesses(id) on delete cascade,
  outreach_id          uuid references lead_outreach(id) on delete set null,
  message_id           uuid references lead_outreach_messages(id) on delete set null,
  channel              outreach_channel not null default 'email',
  from_email           text,
  subject              text,
  body                 text not null,
  category             outreach_reply_category not null default 'uncategorized',
  category_confidence  numeric,
  category_rationale   text,
  requires_human       boolean not null default true,
  handled              boolean not null default false,
  handled_by           text,
  handled_at           timestamptz,
  classified_by        text,
  provider             text,
  model                text,
  raw                  jsonb not null default '{}'::jsonb,
  received_at          timestamptz not null default now(),
  created_at           timestamptz not null default now()
);

create index if not exists idx_outreach_replies_business on lead_outreach_replies (business_id);
create index if not exists idx_outreach_replies_category on lead_outreach_replies (category);
create index if not exists idx_outreach_replies_received on lead_outreach_replies (received_at desc);
create index if not exists idx_outreach_replies_unhandled on lead_outreach_replies (handled) where handled = false;

-- confidence stays in [0,1] when present
do $$ begin
  alter table lead_outreach_replies add constraint lead_outreach_replies_confidence_range
    check (category_confidence is null or (category_confidence >= 0 and category_confidence <= 1));
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Follow-ups (mutable lifecycle)
-- ---------------------------------------------------------------------------
create table if not exists lead_outreach_followups (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references lead_businesses(id) on delete cascade,
  outreach_id     uuid references lead_outreach(id) on delete set null,
  message_id      uuid references lead_outreach_messages(id) on delete set null,
  sequence_step   integer not null default 1,
  due_at          timestamptz not null,
  status          outreach_followup_status not null default 'scheduled',
  reason          text,
  resolution      text,
  created_by      text,
  cancelled_by    text,
  sent_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_outreach_followups_business on lead_outreach_followups (business_id);
create index if not exists idx_outreach_followups_status on lead_outreach_followups (status);
create index if not exists idx_outreach_followups_due on lead_outreach_followups (due_at)
  where status = 'scheduled';

-- at most one scheduled follow-up per business at a time (no duplicate chasing)
create unique index if not exists uq_outreach_followups_one_active
  on lead_outreach_followups (business_id) where status = 'scheduled';

do $$ begin
  alter table lead_outreach_followups add constraint lead_outreach_followups_step_positive
    check (sequence_step >= 1);
exception when duplicate_object then null; end $$;

drop trigger if exists trg_set_updated_at on lead_outreach_followups;
create trigger trg_set_updated_at before update on lead_outreach_followups
  for each row execute function lead_set_updated_at();

-- When a human reply lands, stop any scheduled chase for that business: a
-- person has engaged, so the automated follow-up must not fire. opt_out and
-- bounce also cancel. auto_reply (out-of-office) does NOT cancel.
create or replace function lead_cancel_followups_on_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.category <> 'auto_reply' then
    update lead_outreach_followups
      set status = 'cancelled',
          cancelled_by = 'system:reply_received',
          resolution = 'Reply received (' || new.category::text || ')',
          updated_at = now()
      where business_id = new.business_id and status = 'scheduled';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_cancel_followups_on_reply on lead_outreach_replies;
create trigger trg_cancel_followups_on_reply after insert on lead_outreach_replies
  for each row execute function lead_cancel_followups_on_reply();

-- The inbound facts of a reply are immutable: re-classifying or marking it
-- handled may change category/handled/*, but never the sender, body, subject,
-- channel, raw payload, business, or received_at. No row may be deleted.
create or replace function lead_outreach_replies_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' or tg_op = 'TRUNCATE' then
    raise exception 'lead_outreach_replies is delete-protected (inbound record)';
  end if;
  if new.business_id is distinct from old.business_id
     or new.from_email is distinct from old.from_email
     or new.subject   is distinct from old.subject
     or new.body      is distinct from old.body
     or new.channel   is distinct from old.channel
     or new.raw       is distinct from old.raw
     or new.received_at is distinct from old.received_at
     or new.created_at  is distinct from old.created_at then
    raise exception 'lead_outreach_replies inbound facts are immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_replies_guard_upd on lead_outreach_replies;
create trigger trg_replies_guard_upd before update on lead_outreach_replies
  for each row execute function lead_outreach_replies_guard();
drop trigger if exists trg_replies_guard_del on lead_outreach_replies;
create trigger trg_replies_guard_del before delete on lead_outreach_replies
  for each row execute function lead_outreach_replies_guard();

-- ---------------------------------------------------------------------------
-- RLS: service_role only, matching the rest of the lead engine.
-- ---------------------------------------------------------------------------
alter table lead_outreach_replies enable row level security;
alter table lead_outreach_replies force row level security;
drop policy if exists service_role_all on lead_outreach_replies;
create policy service_role_all on lead_outreach_replies for all to service_role using (true) with check (true);
revoke all on lead_outreach_replies from public, anon, authenticated;
grant select, insert, update on lead_outreach_replies to service_role;
revoke delete, truncate on lead_outreach_replies from service_role;

alter table lead_outreach_followups enable row level security;
alter table lead_outreach_followups force row level security;
drop policy if exists service_role_all on lead_outreach_followups;
create policy service_role_all on lead_outreach_followups for all to service_role using (true) with check (true);
revoke all on lead_outreach_followups from public, anon, authenticated;
grant all on lead_outreach_followups to service_role;
