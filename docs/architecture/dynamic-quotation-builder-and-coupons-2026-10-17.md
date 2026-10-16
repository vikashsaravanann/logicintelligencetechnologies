# Dynamic Quotation Builder, Pricing, GST, Milestones & Coupon Governance

**Date:** 2026-10-17  
**Repository:** `vikashsaravanann/logicintelligencetechnologies`

---

## 1. Service Catalog & Seeded Pricing
- **Catalog Table:** `public.service_catalog_items`
- **Canonical Seeded Item:**
  - Slug: `frontend-nextjs-enterprise`
  - Code: `FRONT-NEXTJS-ENT`
  - Title: `Frontend — Next.js Enterprise Architecture`
  - Default Price: `5000000` paise (`₹50,000.00`)
- **Role-Based Catalog Redaction:**
  - `GET /api/admin/quotations/catalog` returns full `default_price_paise` only when `hasCapability(role, 'quotation.price.view')` is `true` (`super_admin`).
  - For `admin` and `operations`, `redactServiceCatalogForStaff()` strips `default_price_paise` so staff can select technical catalog items without viewing unit prices.

---

## 2. Commercial Calculation Engine (`calculateQuotationFinancials` & `calculateEngagementFinancials`)

### 2.1 Zero Unapproved Fallback Pricing
- Removed legacy hardcoded `₹18,00,000` (`DEFAULT_SUBTOTAL_INR = 1_800_000`) and `₹50` fallbacks.
- When an engagement or quotation has not been commercially approved by the Super Admin (`subtotal <= 0`), `isCommerciallyApproved` is `false` and formatted displays return `"Pending Commercial Approval"`.

### 2.2 Statutory GST Modes
1. **`cgst_sgst_18` (Intra-State Tamil Nadu — Default):**
   - `cgst_paise = Math.round(taxable_amount_paise * 0.09)` (9%)
   - `sgst_paise = Math.round(taxable_amount_paise * 0.09)` (9%)
   - `igst_paise = 0`
2. **`igst_18` (Inter-State Supply):**
   - `igst_paise = Math.round(taxable_amount_paise * 0.18)` (18%)
   - `cgst_paise = 0`, `sgst_paise = 0`
3. **`exempt_0` (Zero-Rated / Exempt when configured by Super Admin):**
   - `cgst_paise = 0`, `sgst_paise = 0`, `igst_paise = 0`

### 2.3 Two-Milestone Payment Schedule (50% / 50%)
- **Milestone 1 — Stage 06 Initial Deposit (50%):** `deposit_amount_paise = Math.floor(total_paise / 2)`
- **Milestone 2 — Stage 11 Final Settlement (50%):** `final_amount_paise = total_paise - deposit_amount_paise`
- **Benchmark Verification (`₹50,000.00` Subtotal):**
  - Subtotal: `₹50,000.00` (`5000000` paise)
  - CGST (9%): `₹4,500.00` (`450000` paise)
  - SGST (9%): `₹4,500.00` (`450000` paise)
  - Total GST (18%): `₹9,000.00` (`900000` paise)
  - Total Payable: `₹59,000.00` (`5900000` paise)
  - Milestone 1 (50% Kickoff Advance): `₹29,500.00` (`2950000` paise)
  - Milestone 2 (50% Final Settlement): `₹29,500.00` (`2950000` paise)

---

## 3. Coupon Governance & `WAKEUPINDIA` Placeholder

### 3.1 `WAKEUPINDIA` Inactive Placeholder
- Seeded in `public.quotation_coupons` (and in-memory fallback) with:
  - `code = 'WAKEUPINDIA'`
  - `is_active = false`
  - `discount_type = null`
  - `discount_paise = null`
  - `discount_percent = null`
- **Activation Guard:** `toggleCoupon()` in `src/lib/quotations/service.ts` and database constraint `quotation_coupons_active_requires_discount_chk` prevent activating any coupon until the Super Admin configures a valid `discount_type` and positive discount value.
- **Validation Guard:** `POST /api/quotations/[token]/apply-coupon` returns HTTP `422` (`valid: false, discount_paise: 0`) when a client attempts to apply an inactive or unconfigured coupon code, and `ProposalStageClient.tsx` validates coupons against the server API rather than client-side string checks.
