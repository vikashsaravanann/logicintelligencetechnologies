# Logic Intelligence Technologies — Corporate A–Z Baseline Audit (2026-10-17)

**Repository:** `vikashsaravanann/logicintelligencetechnologies`  
**Workspace:** `/Users/vikash/lit-infrastructure/logicintelligencetechnologies`  
**Audit Baseline Commit (`HEAD` / `origin/main`):** `631b082` (`fix(admin): add 'use client' directive to BookingDetailActions`)  
**Specification:** `LIT_CODEX_CORPORATE_AZ_GOVERNANCE_CLIENT_PORTAL_QUOTATION_DEPLOYMENT_MASTER_PROMPT_2026-10-17.md`

---

## 1. Repository & Build Baseline

| Check | Baseline Status | Evidence |
|---|---|---|
| Git `HEAD` & `origin/main` | `631b082` | `git status --short --branch` (`## main...origin/main`) |
| Uncommitted Working Tree Files | 2 modified files | `.github/workflows/preview.yml`, `.github/workflows/production.yml` (preserved per Section 02) |
| TypeScript (`npm run typecheck`) | **PASS** (0 errors) | `tsc --noEmit` exits 0 |
| ESLint (`npm run lint`) | **PASS** (0 errors, 747 warnings) | Earlier 11 lint errors from `e42d9b0` resolved in `c180f3c`..`631b082` |
| Unit & Contract Tests (`npm test`) | **PASS** (603 tests, 64 suites, 0 failures) | `node --import tsx --test` exits 0 |
| 7 Master PDFs & 50-Point Checklist | **PRESENT** | Verified in `/Users/vikash/lit-infrastructure/` (`LIT-01`..`LIT-07` + `LIT_50_POINT_ENTERPRISE_CHECKLIST_EXACT_SOURCE_V1.json`) |

---

## 2. Confirmed P0 / P1 / P2 Defects (File & Line Evidence)

### P0-01 — Unauthenticated Financial Mutation Route
- **Location:** `src/app/api/admin/engagements/pricing/route.ts:8-96`
- **Defect:** `POST /api/admin/engagements/pricing` has no authentication or capability check (`requireCapabilityApi` is completely absent). Any anonymous caller knowing an `engagementRef` or `engagementId` can overwrite `client_engagements.metadata` (`contract_subtotal`, `contract_value`, `deposit_amount`, `settlement_amount`) and `engagement_stages.snapshot` for `proposal`, `initial-invoice`, and `final-payment`.
- **Additional Flaws:** Falls back to `50` on invalid/missing `subtotal` (`line 33`), ignores Supabase `.update()` error return values (`lines 42, 65, 81`), and writes no audit log.

### P0-02 — Overbroad Staff Role & Capability Matrix Violating Policy 1 & Policy 2
- **Location:** `src/config/roles.ts:25-145`
- **Defect:**
  - `ADMIN` (`line 79`) is granted `CAPABILITIES.filter((c) => c !== 'team.manage')`, giving non-founder `admin` users `payment.verify`, `invoices.write`, `proposals.write`, `proposals.send`, `documents.approve`, and `documents.issue`.
  - `OPERATIONS` (`lines 81-101`) is granted `proposals.write`, `proposals.send`, `invoices.write`, and `approvals.decide`.
  - Granular governance capabilities required by Policy 1 and Policy 2 (`quotation.technical_draft.*`, `quotation.price.manage`, `quotation.commercial.*`, `quotation.publish`, `quotation.send`, `coupon.*`, `invoice.preparation.*`, `invoice.issue`, `support.assigned_client.*`, `engagement.stage.approve`, `engagement.identity_change.approve`) are missing.

### P0-03 — Insufficient Authorization on Quotation, Proposal, Coupon, Invoice & Reconciliation Endpoints
- **Locations:**
  - `src/app/api/admin/engagements/proposal/route.ts:13` — checks `proposals.write` instead of `super_admin`-only commercial approval capability; defaults `subtotal` to `50` (`line 31`).
  - `src/app/api/admin/quotations/route.ts:25` — allows `proposals.write` to set commercial unit prices, manual discounts, and `publishImmediately`.
  - `src/app/api/admin/quotations/[id]/publish/route.ts:12` — checks `proposals.write` instead of `quotation.publish` (`super_admin` only).
  - `src/app/api/admin/quotations/[id]/send-email/route.ts:17` — checks `proposals.write` instead of `quotation.send` (`super_admin` only), and does not verify `quotation.status === 'published'`.
  - `src/app/api/admin/quotations/coupons/route.ts:9,19` and `src/app/api/admin/quotations/coupons/[id]/route.ts:12` — allow `proposals.read` / `proposals.write` to read, create, and activate coupons instead of `super_admin`-only `coupon.read` / `coupon.manage`.
  - `src/app/api/admin/invoices/route.ts:24` and `src/app/admin/invoices/actions.ts:12,48` — check `invoices.write` instead of `super_admin`-only `invoice.issue` / `payment.verify`.
  - `src/app/api/admin/payments/reconcile/route.ts:12` — checks `payment.verify` (which `admin` currently holds in `roles.ts`).

### P0-04 — Unauthenticated / Weakly Authorized Stage & Identity-Correction Endpoints
- **Locations:**
  - `src/app/api/engagements/[ref]/stages/[stageKey]/route.ts:15` — `GET` has no authentication or tenant ownership check.
  - `src/app/api/engagements/[ref]/stages/[stageKey]/route.ts:97-110` — `POST` checks `getStaffSession()`, and if null, treats any anonymous caller as `'client'` without verifying authenticated client session or assigned staff scope.
  - `src/app/api/engagements/[ref]/stages/[stageKey]/route.ts:139` — `PATCH` checks `clients.write` instead of `engagement.stage.approve` (and allows stage 6 / stage 11 payment verification without `payment.verify`).
  - `src/app/api/engagements/identity-correction/route.ts:22` — `POST` has no caller authentication; `PATCH` (`line 93`) checks `clients.write` instead of `engagement.identity_change.approve` (`super_admin` only).

### P0-05 — Unsafe `user_metadata` Role Check & Blanket Staff Access in Supabase RLS
- **Locations:**
  - `supabase/migrations/20261016140000_harden_engagement_quotation_rls.sql:9-19` — `public.is_staff_or_admin()` trusts `(auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin')`, which is user-mutable in Supabase Auth, and grants all staff `FOR ALL` access to all engagements, stages, documents, and identity requests.
  - `supabase/migrations/20261015040000_v6_quotations_and_service_catalog.sql:232-279` — `q_anon_select` allows anonymous `SELECT` on all rows where `secure_token IS NOT NULL` (enabling table enumeration) and `q_admin_all` trusts `auth.jwt() -> 'user_metadata' ->> 'role'`.

### P0-06 — Public Quotation Token Endpoint Exposes Drafts & Client-Side Coupon Bypass
- **Locations:**
  - `src/lib/quotations/service.ts:542-580` — `getQuotationByToken(secureToken)` returns draft, revoked, or superseded quotations without checking `quote.status === 'published' || quote.status === 'sent' || quote.status === 'viewed' || quote.status === 'accepted'`.
  - `src/lib/quotations/service.ts:327-341` — seeds an unapproved active coupon `FOUNDER10` (`is_active: true`) and sets `discount_paise: 1000000` on `WAKEUPINDIA` instead of `null` with founder-blocked notes.
  - `src/app/engagement/[engagementRef]/proposal/ProposalStageClient.tsx:193,210-220` — hardcodes client-side coupon logic accepting `WAKEUPINDIA`, `LIT2026`, and `FOUNDER50K` to deduct ₹50,000 in the UI.

### P1-01 — Missing Policy 1 Workflows (Staff Technical Quotation Drafts & Invoice Preparation Queue)
- **Defect:** There is no separation between staff technical scope preparation (`quotation_technical_drafts`) and Super Admin commercial pricing/approval (`quotation_commercial_versions`, `commercial_approval_events`), nor between staff invoice-preparation requests (`invoice_preparation_requests`) and Super Admin invoice issuance.

### P1-02 — Missing Policy 2 Workflow (Audited Staff Support View with Server-Side Financial Redaction)
- **Defect:** There is no `staff_client_assignments` or `staff_support_access_events` table, no `/admin/support/clients/[clientId]` or `/api/admin/staff-support/clients/[clientId]` route, and no server-side DTO redaction stripping financial fields for assigned staff.

### P1-03 — Fabricated Commercial Values (`₹50`, `₹10,62,000`, `₹21,24,000`), Unconditional 18% GST, & Invented 5-Item Scope Splits
- **Locations:**
  - `src/lib/engagements/financials.ts:69,105-143,157-158,222` — defaults missing amounts to `50`, unconditionally applies 18% GST (`0.09` CGST + `0.09` SGST) despite `COMPANY.registration.gstin === null` (`src/config/company.ts:23`), and fabricates 5 bundled scope items (`45%, 20%, 15%, 10%, 10%`) for any subtotal `> 1000`.
  - `src/app/admin/engagements/EngagementsAdminClient.tsx:462` — falls back to `'₹21,24,000.00 (Total SOW)'`.
  - `src/app/client/dashboard/page.tsx:563` — falls back to `"₹10,62,000.00"`.
  - `src/app/admin/engagements/components/ProposalBuilderModal.tsx:18-68,94` — hardcodes `DEFAULT_DELIVERABLES` (Next.js 15, Groq LPU, 90-day SLA) and `"50"` subtotal fallback.

### P1-04 — Simulated Audit & Telemetry Evidence in Admin Engagement Inspector
- **Location:** `src/app/admin/engagements/[id]/EngagementDetailAdminClient.tsx:96,127,201,656,821,838,864,922,988,996`
- **Defect:** Hardcodes fake fallback IP (`103.21.244.1`), fake bank reference (`BANK-CR-MANUAL`), fake GitHub repository (`https://github.com/apexmeridian/enterprise-platform`), fake infrastructure claims (`AWS IAM Role & VPC Peering Configured`, `99.95% High Availability Uptime`, `100% Automated Test Suite Passed`), and sends client-supplied `actorRole: 'admin'` in request payloads.

---

## 3. Remediation Execution Order

1. **Phase P0 & P1 — Roles, API Guards, Supabase RLS Migration, and Audited Staff Support View:**
   - Refactor `src/config/roles.ts` and `src/lib/auth/session.ts` to enforce exact Policy 1 & Policy 2 capabilities.
   - Harden all admin & client engagement/quotation/invoice/payment routes.
   - Author additive migration `supabase/migrations/20261017000000_corporate_governance_staff_support_quotations_invoices.sql`.
   - Build Staff Assignments & Audited Staff Support View (`/api/admin/staff-assignments`, `/api/admin/staff-support/clients/[clientId]`, `/admin/support/clients/[clientId]`) with strict server-side financial redaction and non-impersonation banner.
2. **Phase P2 & P3 — Staff Technical Quotation Drafts, Invoice Preparation Queue, Catalog & Pricing Engine:**
   - Implement technical quotation draft and Super Admin commercial approval/publish/send endpoints and UI.
   - Implement staff invoice-preparation request and Super Admin invoice issuance endpoints and UI.
   - Fix `src/lib/engagements/financials.ts`, `src/lib/quotations/pricing.ts`, and `src/lib/quotations/service.ts` to respect `COMPANY.registration.gstin === null` (0% GST unless configured), integer paise 50/50 milestone math, `FE-01` `₹50,000` default catalog item, and inactive `Support Wake Up India — Initial Launch` coupon.
3. **Phase P4 & P5 — 13-Stage Client Portal, 7 PDF Field Registry, and Admin Inspector Cleanup:**
   - Remove all fabricated fallbacks in `EngagementDetailAdminClient.tsx`, `EngagementsAdminClient.tsx`, `ProposalBuilderModal.tsx`, `ProposalStageClient.tsx`, and `client/dashboard/page.tsx`.
   - Create canonical 7-PDF + 50-point checklist field ownership registry (`src/lib/documents/master-field-registry.ts`) and verify SHA-256 PDF generation.
4. **Phase P6 & P7 — Documentation Deliverables, 50-Case Security & Governance Test Suite, and Release Verification:**
   - Generate all required `docs/` deliverables (Section 28).
   - Add and run the 50-case security, governance, pricing, and redaction test suite alongside `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
