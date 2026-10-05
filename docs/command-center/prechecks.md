# Command Center — live pre-checks (Batch 0)

Read-only snapshot of production Supabase `lcmbwalrupoyparxsnjw`, taken before
schema changes. Source of truth for migration normalization and the local DB
test baseline (`tests/db/01_live_baseline.sql`). No data invented.

## Distinct status values (value: row count)

- `projects.status` — Planning: 3 (only value present)
- `invoices.status` — (0 rows; column default `Pending`)
- `proposals.status` — Viewed: 1, Approved: 1 (column default `Draft`)
- `bookings.status` — (0 rows; default `Scheduled`)
- `support_tickets.status` — Open: 7 (default `Open`)
- `support_tickets.priority` — Low: 7 (default `Medium`)
- `support_tickets.source` — n8n-webhook: 7 (default `web-form`)
- `support_ticket_messages.sender_type` — (0 rows; default `client`, column NOT NULL; `sender_name` also NOT NULL)
- `contact_leads.project_type` — "VoiceShield Access Request": 2
- `contact_leads.pipeline_stage` — "Access Granted": 1, new_lead: 1 (default `new_lead`)
- `contact_leads.lifecycle_stage` — NEW: 2 (default `NEW`)

All stored status values are clean (no stray casings), so new CHECK constraints
added NOT VALID then VALIDATE will pass. Only risk is future lowercase writes —
migrations normalize those.

## Constraints on touched tables

No CHECK constraints exist on profiles/invoices/proposals/projects/bookings/
support_tickets/support_ticket_messages/onboarding_submissions/client_files/
contact_leads. UNIQUE: invoices.invoice_code, projects.project_code,
proposals.secure_token. All have `id` PK.

## Column baseline (name type [default]; NN = NOT NULL)

- **invoices**: id uuid NN [uuid_generate_v4()], invoice_code varchar NN (no default, UNIQUE), project_id uuid, client_name varchar NN, amount numeric NN [0.00], status varchar NN [Pending], due_date date, created_at timestamptz [now()], user_id uuid. *No client_email, no description.*
- **proposals**: id, secure_token varchar NN UNIQUE, client_name NN, client_email NN, client_company, title NN, scope text[] NN, deliverables text[] NN, milestones jsonb NN ['[]'], timeline NN, pricing numeric(—) NN, currency NN [INR], status NN [Draft], terms, expires_at, approved_at, created_at, updated_at. *No reference/sent_at/sent_count/viewed_at/signer_name.*
- **projects**: id, project_code varchar NN UNIQUE, client_name NN, name NN, status NN [Planning], progress int NN [0], value numeric NN [0.00], due_date, created_at, user_id.
- **support_tickets**: id, user_id, subject NN, message NN, status NN [Open], created_at, requester_name, requester_email, priority [Medium], source [web-form], page_url, ticket_source [web-form].
- **support_ticket_messages**: id, ticket_id NN, sender_id uuid (nullable), sender_type varchar NN [client], sender_name varchar NN, message NN, attachments jsonb ['[]'], created_at.
- **onboarding_submissions**: id, user_id uuid NN, answers_json jsonb NN ['{}'], status varchar NN [Submitted], created_at.
- **profiles**: id uuid NN, full_name, role text [user], welcome_email_sent_at, created_at NN, phone_number, company_name, unsubscribed_at, has_subscribed, has_converted, updated_at NN, email.
- **bookings**: id, user_id, lead_id, name NN, email NN, phone, company, consultation_type NN [Discovery], slot_time timestamptz NN, duration_minutes int NN [45], timezone NN [Asia/Kolkata], status NN [Scheduled], calendar_event_id, notes, created_at, updated_at.
- **client_files**: id, user_id NN, file_name NN, file_path text NN, size int NN [0], created_at.
- **contact_leads**: 28 cols incl. project_type text, pipeline_stage [new_lead], lifecycle_stage [NEW], lead_score [25], assigned_owner [Vikash Saravanan], owner_email, user_id.
- **email_outbox**: 25 cols incl. idempotency_key NN UNIQUE, status NN [pending], html, text, correlation_id, next_attempt_at.
- **email_webhook_events**: id, provider NN, provider_event_id NN, event_type NN, payload_hash, received_at NN, processed_at, status NN [received], error. (UNIQUE(provider, provider_event_id) assumed from code; recordWebhookEvent unused.)

## Triggers / functions / extensions / buckets

- Triggers on profiles: `guard_profile_role` (enabled), `update_profiles_updated_at` (enabled), `trg_send_welcome_email_on_profiles_insert` (**DISABLED** this session — called missing http()).
- Functions present: `guard_profile_role`, `update_modified_column`. **No** `next_reference`, `admin_set_role`.
- Extensions: pgcrypto 1.3 (gen_random_uuid, crypt, gen_random_bytes), uuid-ossp 1.1, vector 0.8.2, supabase_vault, pg_stat_statements, plpgsql.
- Storage buckets: `client_vault` only (public=false). No `lit-documents` yet.

## Infra

- Render workspace: `tea-d9vchsu7bikc73d6srv0` ("My Workspace", team). docker present locally; initdb at /usr/lib/postgresql/16/bin.
- Local: Node 22, Next 16.2.4, React 19.2.4, zod 4.4.2.
