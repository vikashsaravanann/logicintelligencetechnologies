# Authorization & Row Level Security (RLS) Deep-Dive

**Target System:** Logic Intelligence Technologies Corporate Platform  
**Auditor:** Subagent A01/A02 — Corporate Platform Security & Pre-Launch Lead  
**Audit Date:** October 11, 2026  
**Status:** **PASS (Hardened RBAC & Enforced Database-Level Multi-Tenancy)**

---

## 1. Role-Based Access Control (RBAC) Architecture

The platform defines a strict separation between corporate staff and external client accounts. Access permissions are declared deterministically in `src/config/roles.ts` and enforced at both the Edge middleware layer and the PostgreSQL database layer.

### Role Hierarchy & Definitions

```
                     ┌─────────────────┐
                     │   super_admin   │  (Full system authority, team management)
                     └────────┬────────┘
                              │
                     ┌────────▼────────┐
                     │      admin      │  (Financials, campaigns, contracts, RLS audits)
                     └────────┬────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
┌─────────▼─────────┐ ┌───────▼─────────┐ ┌───────▼─────────┐
│    operations     │ │     support     │ │    developer    │
│(Leads, onboarding)│ │(Tickets, booking│ │(Automations, n8n│
└─────────┬─────────┘ └───────┬─────────┘ └───────┬─────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                     ┌────────▼────────┐
                     │     viewer      │  (Read-only operational dashboards)
                     └─────────────────┘
                              :
                     ┌─────────────────┐
                     │  client / user  │  (Isolated to single organization tenant)
                     └─────────────────┘
```

---

## 2. Capability Matrix Across Roles

| Capability / Action | `super_admin` | `admin` | `operations` | `support` | `developer` | `viewer` | `client` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Manage Staff Roles & Team** | **YES** | NO | NO | NO | NO | NO | NO |
| **Global Command Center** | **YES** | NO | NO | NO | NO | NO | NO |
| **Approve Gate 4 Outreach** | **YES** | **YES** | NO | NO | NO | NO | NO |
| **Manage Billing & Invoices** | **YES** | **YES** | NO | NO | NO | NO | View Own |
| **Sign Legal Proposals/Contracts** | **YES** | **YES** | NO | NO | NO | NO | View Own |
| **Import Automation Workflows** | **YES** | **YES** | NO | NO | **YES** | NO | NO |
| **Manage Enterprise Leads & CRM** | **YES** | **YES** | **YES** | NO | NO | NO | NO |
| **Triage AI Lead Conversations** | **YES** | **YES** | **YES** | NO | NO | NO | NO |
| **Manage Client Support Tickets** | **YES** | **YES** | **YES** | **YES** | NO | NO | Own Org |
| **Manage Calendar Bookings** | **YES** | **YES** | **YES** | **YES** | NO | NO | View Own |
| **Access Platform Audit Logs** | **YES** | **YES** | NO | NO | NO | NO | NO |
| **View System Status & Health** | **YES** | **YES** | **YES** | **YES** | **YES** | **YES** | NO |
| **Access Client Workspace** | **YES** | **YES** | **YES** | NO | NO | NO | Own Org |

---

## 3. Database-Level Protections & Security Triggers

To prevent privilege escalation attacks that attempt to bypass application code, PostgreSQL triggers are enforced on the `profiles` table:

### A. The `guard_profile_role` Trigger
Prevents client users or unauthorized sessions from elevating their privileges:
- If an `UPDATE` statement on the `profiles` table alters the `role` column, the trigger executes a security check.
- Unless the active session belongs to a verified `super_admin` (verified via `auth.uid()` and existing role state), the update is aborted with a PostgreSQL exception: `42501: Insufficient privilege to alter user role`.
- This ensures that even if an attacker discovers a vulnerability allowing direct profile updates via Supabase PostgREST endpoints, their role remains immutable.

### B. The `protect_last_super_admin` Trigger
Mitigates catastrophic system lockout:
- If an update or deletion would result in zero active users with the `super_admin` role, the trigger aborts the transaction with an error.

### C. Client Profile Column Whitelist
Client-facing profile update APIs (`src/app/client/profile/route.ts`) explicitly whitelist editable fields:
- **Allowed Fields:** `first_name`, `last_name`, `phone`, `avatar_url`, `theme_preference`.
- **Blocked Fields:** `id`, `email`, `role`, `organization_id`, `created_at`.

---

## 4. Multi-Tenant Row Level Security (RLS) Isolation

Client data is strictly partitioned by `organization_id`. Every client table in Supabase enforces RLS policies:

### Policy Structure

```sql
-- Client Documents Isolation Policy
CREATE POLICY "tenant_documents_isolation" ON client_vault
  FOR ALL
  USING (
    organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    OR (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) IN ('super_admin', 'admin', 'operations')
  );
```

### Verified Multi-Tenant Invariants (from `tests/security/tenant-rls.sql`)
1. **Cross-Tenant Read Isolation:** Client A from Organization Alpha cannot read or query invoices, deliverables, documents, or support tickets belonging to Organization Beta. The database query returns an empty set (`0 rows`).
2. **Cross-Tenant Write Isolation:** Client A cannot insert or update records associated with Organization Beta's `organization_id`. The database rejects the operation with an RLS policy violation.
3. **Storage Bucket Isolation:** S3/Supabase storage objects in the `client_vault` bucket enforce path-based policies: `tenant_id/document_id.pdf`. Download requests must pass through `/api/resources/download`, which verifies session ownership before generating presigned URLs.

---

## 5. Session Verification & Middleware Defense

Edge routing security in `src/middleware.ts` enforces the following checks:
1. **Cryptographic Token Verification:** Calls `supabase.auth.getUser()`, which validates the cryptographic signature of the JWT directly against the Supabase authentication service. It does not rely on unchecked cookies.
2. **Staff Path Boundary (`isCompanyOnlyPath`):** All routes under `/admin/*` trigger a database role lookup. If the user is unauthenticated or holds only a `client` role, they are redirected to `/admin/forbidden` or `/login`.
3. **No Company Email Suffix Bypass:** Privileges are never granted based on email domain heuristics (e.g., `@logicintelligence.com`). Roles must be explicitly assigned by an existing `super_admin` in the database.
