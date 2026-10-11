-- 20261012090000_global_outreach_compliance.sql
-- LIT Global Outreach Compliance System — Normalized Policy Engine & Universal Gates
--
-- Extends the lead engine with:
--   1. outreach_policy_rules: Granular channel + recipient + purpose + jurisdiction policy.
--   2. outreach_policy_approvals: Immutable audit records of human legal approvals.
--   3. outreach_consent_evidence: Immutable proof of recipient consent and opt-in provenance.
--   4. outreach_eligibility_decisions: Evaluated eligibility determinations prior to dispatch.
--   5. outreach_delivery_events: Dispatch, delivery, bounce, opt-out, and complaint events.
--   6. Bi-directional suppression sync between email_suppressions and lead_suppressions.
--   7. Universal database trigger gates on lead_outreach, lead_outreach_messages, and outreach_enrollments.
--
-- Service_role-only RLS; anon/authenticated denied. Fully idempotent.

create extension if not exists "pgcrypto";

alter table if exists public.contact_leads add column if not exists country text;
alter table if exists public.outreach_enrollments add column if not exists country text;

-- ---------------------------------------------------------------------------
-- 1. Normalized Policy Rules
-- ---------------------------------------------------------------------------
create table if not exists outreach_policy_rules (
  id                       uuid primary key default gen_random_uuid(),
  country_code             text not null,
  region                   text,
  channel                  text not null default 'email',
  recipient_class          text not null default 'corporate_subscriber',
  purpose                  text not null default 'cold_outreach',
  policy_status            text not null default 'review_required'
                           check (policy_status in ('permitted', 'review_required', 'restricted', 'blocked')),
  requires_consent         boolean not null default false,
  allowed_legal_basis_types text[] not null default '{}',
  rule_version             text not null default '1.0',
  official_source_urls     text[] not null default '{}',
  conditions               jsonb not null default '{}'::jsonb,
  valid_from               timestamptz not null default now(),
  expires_at               timestamptz,
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists idx_outreach_rules_country_chan
  on outreach_policy_rules (country_code, channel, recipient_class, purpose);
create index if not exists idx_outreach_rules_status
  on outreach_policy_rules (policy_status);

-- ---------------------------------------------------------------------------
-- 2. Legal Review Approvals (Audit Trail)
-- ---------------------------------------------------------------------------
create table if not exists outreach_policy_approvals (
  id                         uuid primary key default gen_random_uuid(),
  rule_id                    uuid not null references outreach_policy_rules(id) on delete cascade,
  reviewer_user_id           text,
  reviewer_email             text not null,
  reviewer_role              text not null,
  qualification_or_authority text not null,
  evidence_uri               text,
  decision_reason            text not null,
  approval_time              timestamptz not null default now(),
  expiry_time                timestamptz not null,
  created_at                 timestamptz not null default now()
);

create index if not exists idx_outreach_approvals_rule
  on outreach_policy_approvals (rule_id);

-- ---------------------------------------------------------------------------
-- 3. Consent Evidence Register
-- ---------------------------------------------------------------------------
create table if not exists outreach_consent_evidence (
  id           uuid primary key default gen_random_uuid(),
  contact_ref  text,
  business_ref text,
  email        text,
  phone        text,
  channel      text not null default 'email',
  purpose      text not null default 'inbound_followup',
  scope        text not null default 'commercial',
  consent_type text not null default 'express'
               check (consent_type in ('express', 'inferred', 'implied', 'soft_opt_in')),
  source       text not null default 'website_form',
  proof_ref    text,
  ip_address   text,
  user_agent   text,
  obtained_at  timestamptz not null default now(),
  expires_at   timestamptz,
  revoked_at   timestamptz,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_consent_email
  on outreach_consent_evidence (lower(email)) where email is not null;
create index if not exists idx_consent_phone
  on outreach_consent_evidence (phone) where phone is not null;

-- ---------------------------------------------------------------------------
-- 4. Eligibility Decisions Log
-- ---------------------------------------------------------------------------
create table if not exists outreach_eligibility_decisions (
  id                  uuid primary key default gen_random_uuid(),
  campaign_id         text,
  contact_ref         text,
  business_ref        text,
  email               text,
  phone               text,
  country_code        text not null,
  channel             text not null default 'email',
  rule_id             uuid references outreach_policy_rules(id) on delete set null,
  rule_version        text,
  legal_basis         text,
  suppression_checked boolean not null default false,
  result              text not null
                      check (result in ('permitted', 'review_required', 'restricted', 'blocked', 'suppressed')),
  reason_codes        text[] not null default '{}',
  evaluated_at        timestamptz not null default now(),
  human_approval_ref  text,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

create index if not exists idx_decisions_email
  on outreach_eligibility_decisions (lower(email)) where email is not null;
create index if not exists idx_decisions_time
  on outreach_eligibility_decisions (evaluated_at desc);

-- ---------------------------------------------------------------------------
-- 5. Delivery Events
-- ---------------------------------------------------------------------------
create table if not exists outreach_delivery_events (
  id                  uuid primary key default gen_random_uuid(),
  decision_id         uuid references outreach_eligibility_decisions(id) on delete set null,
  outbox_id           uuid,
  provider_message_id text,
  event_type          text not null
                      check (event_type in ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complaint', 'unsubscribed')),
  channel             text not null default 'email',
  recipient           text not null,
  metadata            jsonb not null default '{}'::jsonb,
  occurred_at         timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

create index if not exists idx_delivery_events_recipient
  on outreach_delivery_events (lower(recipient));

-- ---------------------------------------------------------------------------
-- 6. Updated_at Trigger for Rules
-- ---------------------------------------------------------------------------
drop trigger if exists trg_set_updated_at on outreach_policy_rules;
create trigger trg_set_updated_at before update on outreach_policy_rules
  for each row execute function lead_set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. Bidirectional Suppression Sync Triggers
-- ---------------------------------------------------------------------------
create or replace function sync_email_suppression_to_lead()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  -- Prevent infinite trigger recursion
  if new.source = 'lead_suppressions_sync' then
    return new;
  end if;

  if new.email is not null then
    if not exists (
      select 1 from lead_suppressions
       where lower(email) = lower(new.email) and active = true
    ) then
      insert into lead_suppressions (email, reason, scope, source, active)
      values (
        lower(new.email),
        case
          when new.reason in ('bounce', 'complaint') then new.reason::suppression_reason
          when new.reason = 'unsubscribe' then 'opt_out'::suppression_reason
          else 'manual'::suppression_reason
        end,
        'global',
        'email_suppressions_sync',
        true
      )
      on conflict do nothing;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_email_to_lead_suppression on email_suppressions;
create trigger trg_sync_email_to_lead_suppression
  after insert or update on email_suppressions
  for each row execute function sync_email_suppression_to_lead();

create or replace function sync_lead_suppression_to_email()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  -- Prevent infinite trigger recursion
  if new.source = 'email_suppressions_sync' then
    return new;
  end if;

  if new.email is not null and new.active = true then
    if not exists (
      select 1 from email_suppressions where lower(email) = lower(new.email)
    ) then
      insert into email_suppressions (email, reason, source, updated_at)
      values (
        lower(new.email),
        case
          when new.reason::text in ('bounce', 'complaint') then new.reason::text
          else 'unsubscribe'
        end,
        'lead_suppressions_sync',
        now()
      )
      on conflict (email) do update
        set updated_at = now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_lead_to_email_suppression on lead_suppressions;
create trigger trg_sync_lead_to_email_suppression
  after insert or update on lead_suppressions
  for each row execute function sync_lead_suppression_to_email();

-- ---------------------------------------------------------------------------
-- 8. Enhanced Gate Trigger on lead_outreach
-- ---------------------------------------------------------------------------
create or replace function lead_enforce_outreach_gates()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_country text;
  v_status  jurisdiction_outreach_status;
  v_rule_status text;
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

  -- Check broad country allowlist
  select outreach_status into v_status
    from lead_jurisdictions where country_code = v_country;

  -- Check granular policy rules if not broadly allowed
  if v_status is distinct from 'allowed' then
    select policy_status into v_rule_status
      from outreach_policy_rules
     where country_code = v_country
       and channel = new.channel::text
       and policy_status = 'permitted'
       and (expires_at is null or expires_at > now())
     limit 1;

    if v_rule_status is distinct from 'permitted' then
      raise exception
        'Outreach blocked: jurisdiction % is not on the outreach allowlist (status: %)',
        v_country, coalesce(v_status::text, 'unlisted');
    end if;
  end if;

  if new.contact_id is not null then
    select email, phone into v_email, v_phone
      from lead_contacts where id = new.contact_id;
  end if;

  -- Check both lead_suppressions and email_suppressions
  if exists (
    select 1 from lead_suppressions s
     where s.active
       and (
            s.business_id = new.business_id
         or (v_email  is not null and lower(s.email)  = lower(v_email))
         or (v_phone  is not null and s.phone         = v_phone)
         or (v_domain is not null and lower(s.domain) = lower(v_domain))
       )
  ) or (
    v_email is not null and exists (
      select 1 from email_suppressions es
       where lower(es.email) = lower(v_email)
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

-- ---------------------------------------------------------------------------
-- 9. Gate Trigger on lead_outreach_messages (Message Studio)
-- ---------------------------------------------------------------------------
create or replace function lead_enforce_outreach_message_gate()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_country text;
  v_status  jurisdiction_outreach_status;
  v_domain  text;
begin
  -- Only gate approved or scheduled or sent drafts
  if new.status in ('approved', 'scheduled', 'sent') then
    if not new.blockers_pass then
      raise exception 'Message approval blocked: QA blocker gates have not passed';
    end if;

    select country_code, domain into v_country, v_domain
      from lead_businesses where id = new.business_id;

    if v_country is null then
      raise exception 'Message approval blocked: business % has no country_code', new.business_id;
    end if;

    select outreach_status into v_status
      from lead_jurisdictions where country_code = v_country;

    if v_status is distinct from 'allowed' and not exists (
      select 1 from outreach_policy_rules
       where country_code = v_country
         and channel = new.channel::text
         and policy_status = 'permitted'
         and (expires_at is null or expires_at > now())
    ) then
      raise exception
        'Message approval blocked: jurisdiction % is not permitted (status: %)',
        v_country, coalesce(v_status::text, 'unlisted');
    end if;

    if exists (
      select 1 from lead_suppressions s
       where s.active
         and (s.business_id = new.business_id or (v_domain is not null and lower(s.domain) = lower(v_domain)))
    ) then
      raise exception 'Message approval blocked: active suppression exists for business %', new.business_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_outreach_message_gate on lead_outreach_messages;
create trigger trg_outreach_message_gate
  before insert or update of status, blockers_pass
  on lead_outreach_messages
  for each row execute function lead_enforce_outreach_message_gate();

-- ---------------------------------------------------------------------------
-- 10. Gate Trigger on outreach_enrollments (Legacy Campaign Pipeline)
-- ---------------------------------------------------------------------------
create or replace function outreach_enforce_enrollment_gate()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status = 'ACTIVE' then
    if exists (
      select 1 from email_suppressions es
       where lower(es.email) = lower(new.email)
    ) or exists (
      select 1 from lead_suppressions ls
       where ls.active and lower(ls.email) = lower(new.email)
    ) then
      raise exception 'Enrollment blocked: email % is suppressed', new.email;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_outreach_enrollment_gate on outreach_enrollments;
create trigger trg_outreach_enrollment_gate
  before insert or update of status, email
  on outreach_enrollments
  for each row execute function outreach_enforce_enrollment_gate();

-- ---------------------------------------------------------------------------
-- 11. RLS Policies: service_role-only
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'outreach_policy_rules',
    'outreach_policy_approvals',
    'outreach_consent_evidence',
    'outreach_eligibility_decisions',
    'outreach_delivery_events'
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

-- ---------------------------------------------------------------------------
-- 12. Seed Granular Policy Rules (Strict Default-Deny Posture)
-- ---------------------------------------------------------------------------
insert into outreach_policy_rules (
  country_code, channel, recipient_class, purpose, policy_status, requires_consent, rule_version, official_source_urls, notes
) values
  ('US', 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   array['https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business'],
   'US B2B Email: CAN-SPAM opt-out regime. Physical postal address + one-click opt-out mandatory. Needs human pilot signoff.'),

  ('GB', 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   array['https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/'],
   'UK B2B Email: PECR Reg 22 corporate exception. Requires verified corporate status and documented LIA under UK GDPR Art 6(1)(f).'),

  ('IN', 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   array['https://www.trai.gov.in/advice-to-senders'],
   'India B2B Email: DPDP Act 2023 & commercial practices. Clear identity and opt-out required.'),

  ('DE', 'email', 'corporate_subscriber', 'cold_outreach', 'restricted', true, '1.0',
   array['https://www.gesetze-im-internet.de/uwg_2004/BJNR141400004.html'],
   'Germany: Section 7 UWG prohibits cold electronic advertising without prior express consent.'),

  ('FR', 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   array['https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique-sms-mms-et-automate-dappel'],
   'France B2B Email: CNIL professional exception requires direct subject relevance and clear opt-out.'),

  ('CA', 'email', 'corporate_subscriber', 'cold_outreach', 'restricted', true, '1.0',
   array['https://crtc.gc.ca/eng/com500/guide.htm'],
   'Canada: CASL strict opt-in regime. Conspicuous publication or express consent required.'),

  ('AU', 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   array['https://www.acma.gov.au/avoid-sending-spam'],
   'Australia: Spam Act 2003 consent regime. Conspicuous publication inferred consent requires direct work relevance.'),

  ('AE', 'email', 'corporate_subscriber', 'cold_outreach', 'review_required', false, '1.0',
   array['https://tdra.gov.ae/'],
   'UAE: UAE PDPL & commercial communication framework. Commercial identification and opt-out required.')
on conflict do nothing;

