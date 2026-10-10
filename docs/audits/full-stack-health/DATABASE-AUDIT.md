# Supabase PostgreSQL Database Audit Report

**Database Platform:** Supabase PostgreSQL (pgvector enabled)  
**Date:** October 10, 2026  
**Migrations Audited:** 42 migration files in `supabase/migrations/`

---

## 1. Schema & Migration Architecture

The database architecture was audited from initial schema to the latest 2026 migrations.

### Core Tables & Usage
1. `profiles`: User accounts, staff roles (`admin`, `staff`, `executive`), company affiliations, phone numbers, timestamps.
2. `contact_leads`: General inquiries, budget ranges, timeline requirements, conversion status.
3. `demo_leads`: Free demo requests, company domain, requirement notes.
4. `checklist_leads`: Architecture checklist requests, company name, score.
5. `newsletter_subscribers`: Email subscriptions with double opt-in verification tokens (`confirmed_at`, `unsubscribed_at`).
6. `projects`: Client projects, milestone progress, statuses (`planning`, `active`, `delivered`).
7. `invoices`: Project invoices, amounts in INR/USD, tax breakdowns, payment links, payment states.
8. `support_tickets`: Support requests, client association, severity levels, resolutions.
9. `ai_chats` & `ai_memories`: Long-term user chat context with embeddings (pgvector).
10. `onboarding_sessions`: Tokenized client onboarding with secret hashing and expiry.

---

## 2. Row Level Security (RLS) & Access Control

- **Strict RLS Enforcement:** Migration `20260906140000_force_rls_and_realtime.sql` and `20261005120000_harden_rls.sql` enforce RLS across all application tables.
- **Anonymous Access:** Anonymous roles (`anon`) are restricted strictly to `INSERT` on public lead tables (`contact_leads`, `demo_leads`, `checklist_leads`). Direct `SELECT`, `UPDATE`, or `DELETE` permissions are revoked.
- **Client Separation:** Authenticated clients can only query rows where `user_id = auth.uid()` or where client company ID matches their authenticated profile.
- **Staff Roles:** Administrative queries rely on server-side `SUPABASE_SERVICE_ROLE_KEY` or custom security definer functions checking `profiles.role IN ('admin', 'staff', 'executive')`.
- **Zero Raw Secrets in Database:** Session tokens, webhook secrets, and access tokens are hashed via SHA-256 before storage (`tests/security/hardening-contract.test.ts` verified).

---

## 3. Migration Idempotency & Rollback Safety

- Migrations utilize standard PostgreSQL `IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, and idempotent DDL.
- Migration test script `scripts/db-test.sh` exercises a two-pass idempotency test across all migrations.
- In environments without local Postgres 16 instances (e.g. standard developer workstations without local Docker/Postgres daemon), tests fall back to SQL assertions and unit mock validations without risking production connection state.
