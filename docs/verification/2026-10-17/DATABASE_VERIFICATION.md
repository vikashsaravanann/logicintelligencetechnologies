# Database Migrations & RLS Policy Verification Report

**Date:** 2026-10-17  
**Platform:** Logic Intelligence Technologies Corporate Platform  
**Target Project:** `lcmbwalrupoyparxsnjw`  
**Migration Directory:** `supabase/migrations/`  

---

## 1. Migration Inventory & Chronology

| Migration File | Description | Security Controls & Objects | Status |
| :--- | :--- | :--- | :--- |
| `20261017020000_individual_staff_admin_workspaces.sql` | Staff workspaces, employees, task assignments, and document wallet tables. | RLS enabled on `staff_workspaces`, `staff_employees`, `staff_workspace_tasks`, and storage policies for `staff-documents`. Circular FK resolved. | Validated |
| `20261017040000_secure_payments_and_billing_rls.sql` | Hardened RLS, anti-tamper triggers, and immutability controls for payments and billing. | RLS enabled on `engagement_payment_requests` and `payment_billing_submissions`. Immutability triggers on approved payments and workspace owners. | Validated |

---

## 2. Migration Details & RLS Policy Specifications

### `20261017020000_individual_staff_admin_workspaces.sql`
- **Table `staff_workspaces`:**
  - Foreign key to `auth.users(id)` ON DELETE RESTRICT.
  - Foreign key to `staff_employees(id)` with deferred addition to resolve cyclic schema dependencies (`B01`).
  - Strict RLS policies:
    - `staff_workspaces_super_admin_all`: Super Admin can select, insert, update, delete.
    - `staff_workspaces_owner_select`: Workspace owner (`owner_user_id = auth.uid()`) can read only their own workspace.
    - `staff_workspaces_owner_update`: Workspace owner can update safe preferences.

- **Table `staff_employees`:**
  - Strict RLS policies:
    - `staff_employees_super_admin_all`: Super Admin management.
    - `staff_employees_self_select`: Employee can read only their own record (`auth_user_id = auth.uid()`).

- **Table `staff_workspace_tasks`:**
  - Scoped to workspace UUID.
  - Access restricted to workspace owner and Super Admin.

- **Storage Bucket `staff-documents`:**
  - Storage bucket isolation: `${workspaceId}/${userId}/...`
  - MIME allowlist restricted to PDF, DOCX, XLSX, PNG, JPG, ZIP. Maximum file size: 50MB.

### `20261017040000_secure_payments_and_billing_rls.sql`
- **Table `engagement_payment_requests`:**
  - Row Level Security explicitly enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
  - Policies:
    - `payment_requests_staff_all`: Staff with `super_admin` or `admin` role can manage payment requests.
    - `payment_requests_client_read`: Authenticated client (`auth.uid() = client_id`) can view their own payment requests.
  - Trigger `prevent_approved_payment_modification`:
    - Prevents mutation of financial amounts, discount paise, GST rate, or status changes once in `approved` or `cancelled` state.

- **Table `payment_billing_submissions`:**
  - Row Level Security explicitly enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
  - Policies:
    - `billing_submissions_staff_all`: Staff with `super_admin` or `admin` role can inspect billing submissions.
    - `billing_submissions_client_read`: Client matching parent `engagement_payment_requests.client_id` can inspect their billing submission.
    - `billing_submissions_insert`: Inserts allowed only when parent payment request is not yet approved.

- **Workspace Immutability Trigger:**
  - Trigger `trg_prevent_workspace_owner_change` on `staff_workspaces`:
    - Raises exception if `NEW.owner_user_id <> OLD.owner_user_id`, preventing unauthorized ownership transfers.
