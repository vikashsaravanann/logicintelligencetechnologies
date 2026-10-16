# Staff Commercial Separation & Audited Staff Support View Architecture

**Date:** 2026-10-17  
**Repository:** `vikashsaravanann/logicintelligencetechnologies`  
**Policies Implemented:** Policy 1 (Staff Preparation, Super Admin Approval) & Policy 2 (Audited Staff Support View — Non-Impersonation)

---

## 1. Policy 1 — Staff Preparation vs Super Admin Commercial Approval

### 1.1 Capability Separation (`src/config/roles.ts`)
- **`super_admin` Only Capabilities (`SUPER_ADMIN_ONLY_CAPABILITIES`):**
  - `quotation.price.view`, `quotation.price.edit`, `quotation.discount.apply`, `quotation.commercial.approve`, `quotation.publish`, `quotation.send`, `quotation.revoke`
  - `coupon.view`, `coupon.create`, `coupon.activate`, `coupon.deactivate`, `coupon.delete`
  - `invoice.price.manage`, `invoice.issue`, `invoice.send`
  - `engagement.pricing.manage`, `engagement.stage.approve`, `engagement.identity_change.approve`
  - `payments.reconcile`, `support.assignment.manage`, `users.manage`, `settings.manage`
- **`admin` & `operations` Technical Preparation Capabilities:**
  - `quotation.technical_draft.create`, `quotation.technical_draft.update`, `quotation.technical_draft.submit`
  - `invoice.preparation.create`, `invoice.preparation.update`, `invoice.preparation.submit`
- **`support` Capabilities:**
  - `support.assigned_client.view`, `support.assigned_client.note`, `support.assigned_client.request_action`

### 1.2 Technical Quotation Draft & Commercial Approval Workflow
1. **Staff Technical Draft Creation (`POST /api/admin/quotations/technical-drafts`):**
   - Assigned staff (`admin`, `operations`) select catalog services or custom technical modules, enter quantities, scope descriptions, and timeline assumptions.
   - `sanitizeTechnicalDraftLineItems()` in `src/lib/quotations/technical-drafts.ts` strips any injected `unit_price_paise`, `discount_paise`, `total_paise`, `subtotal_paise`, or `coupon_code` fields.
2. **Submission for Commercial Pricing (`POST /api/admin/quotations/technical-drafts/[id]/submit`):**
   - Transitions draft status from `technical_draft` to `submitted_for_commercial_pricing`.
3. **Super Admin Commercial Approval (`POST /api/admin/quotations/[id]/commercial-approve`):**
   - Restricted strictly to `super_admin`.
   - Enters/approves unit prices in paise, optional approved coupon/discount, and GST mode (`cgst_sgst_18`, `igst_18`, `exempt_0`).
   - Computes exact 50% Kickoff Deposit (`milestone_1_paise = floor(total_paise / 2)`) and 50% Final Settlement (`milestone_2_paise = total_paise - milestone_1_paise`).
   - Writes an immutable `quotation_commercial_versions` record and `commercial_approval_events` audit entry, and locks the technical draft (`locked_at`).

### 1.3 Staff Invoice Preparation vs Super Admin Issuance
1. **Staff Invoice Preparation (`POST /api/admin/invoices/preparations`):**
   - Staff (`admin`, `operations`) prepare milestone readiness evidence (`initial_50_deposit` or `final_50_settlement`) without commercial pricing or invoice numbers.
2. **Submission (`POST /api/admin/invoices/preparations/[id]/submit`):**
   - Queues the request as `submitted_for_super_admin`.
3. **Super Admin Approval & Issuance (`POST /api/admin/invoices/preparations/[id]/approve-issue`):**
   - Restricted strictly to `super_admin` (`invoice.issue`).
   - Verifies commercial figures, assigns official invoice number, creates the `invoices` record, marks preparation `issued`, and logs to `commercial_approval_events`.

---

## 2. Policy 2 — Audited Staff Support View (Non-Impersonation)

### 2.1 Zero Impersonation Guarantee
- Staff never mint client JWTs, never swap cookies to a client session, and cannot use `?ref=` in `/client/dashboard` to view another user's engagement.
- Database helper `public.forbid_client_impersonation()` and server guard `assertForbiddenImpersonation()` explicitly reject and audit any impersonation attempt.

### 2.2 Explicit Staff-Client Assignments (`staff_client_assignments`)
- Managed exclusively by `super_admin` via `GET/POST /api/admin/staff-assignments` and `DELETE /api/admin/staff-assignments/[id]`.
- Unassigned staff attempting to access `/api/admin/staff-support/clients/[clientId]` receive HTTP `403` and an immutable `denied_unassigned_access` row in `staff_support_access_events`.

### 2.3 Server-Side Financial Redaction (`redactFinancialsDeep`)
- `getRedactedStaffSupportClientContext()` in `src/lib/support/staff-support.ts` strips all commercial and tax keys (`subtotal`, `gstAmount`, `totalPayable`, `unit_price_paise`, `coupon_code`, `utrNumber`, `upiVpa`, `clientGstin`, `share_token`, etc.) before data leaves the server.
- UI route `/admin/support/clients/[clientId]` renders the mandatory persistent banner:
  > `Staff Support View — acting as [STAFF USER], read-only client context; not signed in as client`
