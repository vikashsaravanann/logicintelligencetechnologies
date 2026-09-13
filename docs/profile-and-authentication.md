# Profile & Authentication Architecture

**Company:** Logic Intelligence Technologies  
**Canonical Routes:**  
- `/login` — Single authentication gateway  
- `/profile` — Single authenticated account workspace  

---

## 1. Single Canonical Profile Architecture

### Problem Statement
Previously, the repository contained disjointed profile destinations (`/client/profile` and `/profile`) and duplicate client login paths (`/client/login` and `/login`), creating confusion and redundant maintenance overhead.

### Architectural Solution
1. **`/login` is Authentication Only**:
   - Handles password authentication, magic link requests, and password resets.
   - Preserves destination parameters via `?next=/target-route`.
   - Never exposes profile data or account settings to unauthenticated visitors.

2. **`/profile` is the Single Unified Account Hub**:
   - Provides a comprehensive, tabbed interface for authenticated clients and users.
   - **Details Tab:** Personal information editing (Full name, company name, phone number).
   - **Projects Tab:** Assigned engineering projects, sprint milestones, and progress bars.
   - **Billing Tab:** Invoices, milestone payments, and receipts.
   - **Vault Tab:** AES-256 encrypted file vault with direct upload and download capabilities.
   - **Support Tab:** Direct ticketing and customer support history.
   - **Onboarding Tab:** Interactive client onboarding progress.

3. **Legacy Route Migration Table**:

| Historical Route | Action | Canonical Target | HTTP Code |
|---|---|---|---|
| `/client/profile` | Permanent Redirect | `/profile` | 301 / 308 |
| `/client/login` | Redirect to Unified Login | `/login` | 301 / 308 |

---

## 2. Security & RLS Isolation

- **Server-Side Authorization:** `/profile` checks Supabase authentication via `createServerComponentClient` on the server before rendering. Unauthenticated sessions are redirected immediately to `/login`.
- **Row Level Security (RLS):** All mutations to the `profiles` table are constrained strictly to `auth.uid() = id`.
- **Column Allowlist:** Client profile updates allow only `full_name`, `company_name`, and `phone_number`. Sensitive fields like `email`, `role`, and `id` cannot be overwritten by client payloads.
