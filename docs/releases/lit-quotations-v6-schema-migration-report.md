# LOGIC INTELLIGENCE TECHNOLOGIES
# V6 QUOTATIONS SCHEMA MIGRATION & RLS VERIFICATION REPORT

**Migration ID:** `20261015040000_v6_quotations_and_service_catalog.sql`  
**Target Environment:** Supabase PostgreSQL 15+ / Production & Local Docker Test DB  
**Target Reference:** `vikashsaravanann/logicintelligencetechnologies`  
**Execution Timestamp:** 15 October 2026  
**Status:** VALIDATED & IDEMPOTENT (Double-pass clean execution via `scripts/db-test.sh`)  

---

## 1. Schema Objects Created & Managed

The migration establishes 9 dedicated relational tables, indexes, constraints, triggers, and atomic stored procedures:

### Relational Tables:
1. `public.quotation_services_catalog`:
   - Stores the 77 canonical services categorized across DS (01..08), FE (01..12), BE (01..12), DB (01..08), AI (01..08), CL (01..10), IN (01..11), and QA (01..08).
   - Invariant: `CHECK (service_code = 'FE-01' OR default_unit_price_paise IS NULL)` strictly enforces that only `FE-01` can have a non-null default unit price (`5,000,000` paise = ₹50,000.00). All other 76 services are strictly `NULL`.
2. `public.quotations`:
   - Primary quotation master record with fields for unique `quotation_ref`, high-entropy `secure_token`, client/company linkage, financial summaries in integer paise (`subtotal_paise`, `discount_paise`, `tax_paise`, `total_payable_paise`, `milestone_1_paise`, `milestone_2_paise`), delivery state, and workflow lifecycle status.
3. `public.quotation_versions`:
   - Immutable version snapshot table. Every publication event creates a frozen copy of the scope, deliverables, terms, SHA-256 version hash, and financial calculations.
4. `public.quotation_line_items`:
   - Line items associated with quotations or version snapshots. Enforces integer paise constraints: `CHECK (quoted_unit_price_paise IS NULL OR quoted_unit_price_paise > 0)`.
5. `public.quotation_coupons`:
   - Coupon definition table supporting percentage and fixed-paise discounts, redemption limits, category/service applicability, and expiration timestamps.
   - Seeded with initial `WAKEUPINDIA` campaign code (`is_active = false`, disabled by default).
6. `public.quotation_coupon_redemptions`:
   - Audit trail for coupon redemptions preventing duplicate or excessive usage.
7. `public.quotation_acceptances`:
   - Cryptographic record of client formal acceptance, capturing signer credentials, consent checkboxes, version hash, client IP, user agent, and unique `acceptance_ref`.
8. `public.quotation_revision_requests`:
   - Formal client requests for quotation modifications, capturing requested scope changes, budget feedback, and timestamp.
9. `public.quotation_audit_logs`:
   - Tamper-evident operational audit trail recording all administrative, pricing, discount, and publication actions.

---

## 2. Stored Procedures & Atomic Functions

1. **`accept_quotation_v6(p_secure_token text, p_signer_name text, p_signer_email text, p_signer_title text, p_signer_company text, p_ip text, p_user_agent text)`**:
   - Executes atomically in a transaction:
     - Validates quotation existence, publication status, and validity period.
     - Confirms matching version hash.
     - Records formal row in `quotation_acceptances`.
     - Transitions quotation status to `accepted`.
     - Advances linked engagement (if applicable) to Stage 5 (`sow_review`).
     - Logs `client_accepted` audit entry.
2. **`request_quotation_revision_v6(p_secure_token text, p_requested_by_name text, p_requested_by_email text, p_comments text, p_requested_changes jsonb)`**:
   - Atomically records client revision request, transitions status to `changes_requested`, and logs audit event.

---

## 3. Row Level Security (RLS) Policy Matrix

| Table Name | Policy Scope | Operations | Allowed Roles | Enforcement Guarantee |
| :--- | :--- | :---: | :---: | :--- |
| `quotation_services_catalog` | Admin Management | ALL | `service_role`, Super Admin | Public read forbidden; client cannot list unquoted catalog |
| `quotation_services_catalog` | Staff Read | SELECT | `authenticated` staff | Staff with `proposals.read` or `dashboard.view` |
| `quotations` | Public Client Read | SELECT | `anon`, `authenticated` | Restricted strictly to `secure_token = current_setting(...)` or published quotes matching token |
| `quotations` | Staff Full Access | ALL | `authenticated` staff | Restricted to authorized staff roles (`super_admin`, `admin`, `operations`) |
| `quotation_line_items` | Public Client Read | SELECT | `anon`, `authenticated` | Restricted to `is_selected = true` on published quotation versions |
| `quotation_versions` | Client Version Read | SELECT | `anon` | Accessible only via valid quotation token lookup |
| `quotation_acceptances` | Insert & Read | INSERT / SELECT | Authenticated / Token-matched | Immutable insert-only; client cannot tamper with historic acceptances |
| `quotation_coupons` | Public Validate | SELECT | `anon`, `authenticated` | Only active, unexpired coupons can be queried by exact code |

---

## 4. Idempotency & Database Test Verification

The migration was rigorously tested using the repository's migration test suite:
- **Test Command:** `./scripts/db-test.sh`
- **Pass 1 (Clean Provisioning):** All migrations from baseline `20260823*` to `20261015040000*` applied cleanly in a transient PostgreSQL container.
- **Pass 2 (Re-application Idempotency):** All migrations re-executed against the existing database state to verify zero `relation already exists` or duplicate constraint errors.
- **Assertion Suite:** `tests/db/quotations_v6.assert.sql` executed with 100% assertions passing:
  - Assert 77 total canonical services present.
  - Assert Category A (8), B (12), C (12), D (8), E (8), F (10), G (11), H (8).
  - Assert only `FE-01` has non-null price (`5,000,000` paise = ₹50,000.00).
  - Assert other 76 services have `default_unit_price_paise IS NULL`.
  - Assert atomic `accept_quotation_v6` RPC functionality.

---

## 5. Rollback & Disaster Recovery Strategy

1. **Transactional Rollback:**
   - In the event of migration failure, PostgreSQL rolls back DDL inside the transaction block automatically.
2. **Reverse Migration DDL:**
   - `DROP FUNCTION IF EXISTS accept_quotation_v6, request_quotation_revision_v6 CASCADE;`
   - `DROP TABLE IF EXISTS quotation_audit_logs, quotation_revision_requests, quotation_acceptances, quotation_coupon_redemptions, quotation_coupons, quotation_line_items, quotation_versions, quotations, quotation_services_catalog CASCADE;`
3. **Data Protection Invariant:**
   - Existing production tables (`proposals`, `client_contracts`, `clients`, `engagement_payment_requests`, `company_credentials`) remain completely untouched and non-destructive.
