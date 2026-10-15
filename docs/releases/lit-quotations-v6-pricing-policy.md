# LOGIC INTELLIGENCE TECHNOLOGIES
# V6 PROFESSIONAL SERVICES PRICING & COMMERCIAL POLICY

**Document Reference:** `LIT-POL-V6-PRICING-2026-10-15`  
**Classification:** Authoritative Commercial Standard  
**Entity:** Logic Intelligence Technologies (UDYAM-TN-03-0345274)  
**Registered Office:** Eachanari, Coimbatore, Tamil Nadu 641021, India  
**Founder & Executive Signatory:** Vikash Saravanan  
**Effective Date:** 15 October 2026  

---

## 1. Executive Summary & Core Pricing Invariants

This document establishes the authoritative pricing principles, calculation algorithms, catalog governance, and tax policies for Logic Intelligence Technologies (LIT) professional services quotations.

### Mandatory Invariants:
1. **The Sole Default Price Invariant:**
   - **Service Code `FE-01`** (*Enterprise Frontend Engineering — Next.js 16, React 19 & TypeScript*) is pre-configured with a founder-authorized baseline starting price of **₹50,000.00** (`5,000,000` paise).
   - **All other 76 bespoke development, architecture, cloud, AI, and security services** in the canonical 77-service catalog have **`default_unit_price_paise = NULL`**.
   - Under no circumstances shall an unpriced service default to ₹0, 0 paise, or an invented arbitrary figure.
   - A service with a `NULL` price cannot be included in a published quotation without an authorized administrator explicitly quoting an integer paise unit price, or the founder explicitly marking it as `included_at_no_additional_charge` with documented rationale.

2. **Deterministic Minor Currency Unit (Paise):**
   - All monetary calculations are performed strictly using integer paise (1 INR = 100 Paise).
   - Floating-point representations are prohibited in financial arithmetic to prevent IEEE 754 rounding drift.
   - Display conversions (`formatPaiseToINR`) format numbers using the Indian numbering system (`en-IN`) with standard comma grouping.

3. **Two-Stage Milestone Conservation Rule:**
   - Quotation payments are structured into exactly two contractual milestones:
     - **Milestone 1 (50%):** Payable upon execution of the Statement of Work (SOW), prior to engineering commencement.
     - **Milestone 2 (50%):** Payable upon formal client delivery acceptance, prior to production handover.
   - Integer division formula ensuring strict mathematical sum conservation:
     $$\text{milestone1Paise} = \left\lfloor \frac{\text{totalPayablePaise}}{2} \right\rfloor$$
     $$\text{milestone2Paise} = \text{totalPayablePaise} - \text{milestone1Paise}$$
     $$\text{milestone1Paise} + \text{milestone2Paise} \equiv \text{totalPayablePaise}$$
   - Any odd-paise difference is absorbed cleanly into Milestone 2, ensuring zero paise drift across the contract lifecycle.

4. **Zero-Leakage Customer Projection Policy:**
   - Only explicitly selected line items (`is_selected = true`) that have an approved positive price (`quoted_unit_price_paise > 0`) or an explicit complimentary waiver (`included_at_no_additional_charge = true`) are visible to clients.
   - Unselected catalog services and unpriced draft items are strictly filtered at the database/API boundary and are never transmitted in JSON responses, React Server Components (RSC), HTML trees, PDF documents, or email notifications.

---

## 2. Canonical 77-Service Catalog Structure

The catalog comprises 77 standardized enterprise service offerings across 8 strategic engineering categories:

| Category | Description | SKU Range | Items | Baseline Default Price |
| :--- | :--- | :---: | :---: | :--- |
| **Category A** | Design & Discovery Systems | `DS-01` to `DS-08` | 8 | `NULL` (Bespoke Quoting) |
| **Category B** | Frontend & Web Application Engineering | `FE-01` to `FE-12` | 12 | **`FE-01` = ₹50,000.00**; `FE-02`..`FE-12` = `NULL` |
| **Category C** | Backend Engineering & API Systems | `BE-01` to `BE-12` | 12 | `NULL` (Bespoke Quoting) |
| **Category D** | Database & Data Infrastructure | `DB-01` to `DB-08` | 8 | `NULL` (Bespoke Quoting) |
| **Category E** | Artificial Intelligence & Machine Learning | `AI-01` to `AI-08` | 8 | `NULL` (Bespoke Quoting) |
| **Category F** | Cloud, DevOps & Platform Engineering | `CL-01` to `CL-10` | 10 | `NULL` (Bespoke Quoting) |
| **Category G** | System Integration & Third-Party Platforms | `IN-01` to `IN-11` | 11 | `NULL` (Bespoke Quoting) |
| **Category H** | Quality Assurance, Security & Performance | `QA-01` to `QA-08` | 8 | `NULL` (Bespoke Quoting) |
| **TOTAL** | **Canonical Service Offerings** | — | **77** | **1 priced (`FE-01`), 76 unpriced (`NULL`)** |

---

## 3. Verified Enterprise Issuer Credentials

All quotations, contractual summaries, and legal documents issued under this system cite LIT's authentic statutory credentials:

- **Legal Entity:** `LOGIC INTELLIGENCE TECHNOLOGIES`
- **MSME / Udyam Registration:** `UDYAM-TN-03-0345274`
- **Enterprise Classification:** Micro Enterprise · Services
- **Registered Address:** Eachanari, Coimbatore, Tamil Nadu 641021, India
- **Official Contact Email:** `hello@logicintelligencetechnologies.in`
- **Official Corporate Portal:** `https://www.logicintelligencetechnologies.in`
- **Founder & Authorized Signatory:** Vikash Saravanan, Founder
- **GST Statutory Notice:** `GSTIN: Unregistered (Composition / Threshold)`

---

## 4. Tax Handling & GST Treatment

1. **Threshold & Exemption Notice:**
   - In compliance with Indian Goods and Services Tax laws for Micro Enterprises operating within the statutory threshold exemption, quotations default to threshold composition / exemption unless GST registration is finalized.
2. **Tax Computation Modes:**
   - `tax_exempt` / `composition`: Tax calculated as `0` paise. Notice displayed: `GST: Not Applicable (MSME Threshold Exemption Under CGST Act)`.
   - `intra_state` (Tamil Nadu Place of Supply): 18.00% standard rate split evenly into CGST 9% (`cgst_paise = subtotal * 900 / 10000`) and SGST 9% (`sgst_paise = subtotal * 900 / 10000`).
   - `inter_state` (Outside Tamil Nadu Place of Supply): 18.00% IGST (`igst_paise = subtotal * 1800 / 10000`).

---

## 5. Coupon Governance & Discount Regulations

1. **Founder Manual Discounts:**
   - Authorized staff may apply manual price adjustments or line-item complimentary waivers only with founder review.
   - All complimentary waivers require a mandatory `charge_waiver_reason` recorded in audit logs.
2. **Coupon Engine Controls:**
   - Coupons support percentage discounts (with optional `max_discount_paise` cap) or fixed paise reductions.
   - Coupons enforce minimum subtotal thresholds (`min_subtotal_paise`), expiry dates (`expires_at`), and maximum redemptions (`max_redemptions`).
   - Coupon codes are evaluated deterministically:
     $$\text{discount} = \min\left(\left\lfloor \frac{\text{subtotal} \times \text{percentage}}{100} \right\rfloor, \text{max\_discount}\right)$$
   - Redemptions are recorded in `quotation_coupon_redemptions` with high-water mark validation.
3. **Launch Campaign Status:**
   - The initial launch campaign coupon `WAKEUPINDIA` is seeded in an inactive state (`is_active = false`) with `discount_percentage = NULL`. It cannot be redeemed until explicitly configured and authorized by the Super Admin.

---

## 6. Auditability & Immutability

1. **Version Snapshots:**
   - Publishing a quotation freezes the line items, deliverables, and calculations into an immutable snapshot record (`quotation_versions`) with a computed SHA-256 hash.
   - Subsequent client reviews inspect the immutable version snapshot.
2. **Acceptance Cryptographic Integrity:**
   - Formal client acceptance requires explicit affirmative consent to the exact version hash, scope, pricing, and two-stage milestone schedule.
   - Acceptance captures client IP, user agent, timestamp, signer title, and generates a unique acceptance reference (`ACC-YYYYMMDD-XXXX`).
