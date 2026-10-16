# GitHub-to-Vercel Deployment Root Cause Analysis & Release Runbook

**Date:** 2026-10-17  
**Repository:** `vikashsaravanann/logicintelligencetechnologies`  
**Production Domain:** `https://www.logicintelligencetechnologies.in`

---

## 1. Root Cause Analysis of Prior GitHub-to-Vercel Deployment Failures

1. **Duplicate / Conflicting Workflow Triggers:**
   - Both `.github/workflows/ci.yml` and `.github/workflows/production.yml` triggered on pushes to `main`.
   - `.github/workflows/preview.yml` and `.github/workflows/production.yml` previously attempted unconditional `npx vercel pull` / `npx vercel deploy` even when repository secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) were not configured in the GitHub Actions environment, causing CLI invocation failures when Vercel's native GitHub integration was already handling builds or when secrets were absent.
2. **Working-Tree Workflow Hardening Preserved:**
   - The local uncommitted updates in `.github/workflows/preview.yml` and `.github/workflows/production.yml` add explicit secret-presence checks (`check_secrets`) so GitHub Actions runs full quality gates (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`) and only invokes the Vercel CLI step when `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are populated.

---

## 2. Pre-Deployment Verification Gates (Mandatory Before Any Production Push)

Every release candidate must pass these local and CI checks with zero errors:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

---

## 3. Supabase Migration Application Runbook

Before or alongside deploying the application release:

1. **Verify Target Supabase Project:**
   - Confirm `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` target the corporate Supabase project (`logicintelligencetechnologies`).
2. **Apply Governance & RLS Migration:**
   - Migration file: `supabase/migrations/20261017000000_corporate_governance_staff_support_quotations_invoices.sql`
   - Creates helper functions (`current_staff_role`, `is_super_admin`, `is_assigned_staff_for_client`, `is_assigned_staff_for_engagement`, `forbid_client_impersonation`).
   - Creates governance tables (`staff_client_assignments`, `staff_support_access_events`, `quotation_technical_drafts`, `quotation_commercial_versions`, `invoice_preparation_requests`, `commercial_approval_events`).
   - Replaces unsafe `user_metadata` and `USING (true)` policies on `quotations`, `quotation_coupons`, `service_catalog_items`, and `invoices`.
   - Seeds `frontend-nextjs-enterprise` (`5000000` paise = `₹50,000.00`) and inactive placeholder coupon `WAKEUPINDIA` (`is_active = false`, `discount_type = null`, `discount_paise = null`).

---

## 4. Production Release & Post-Deploy Verification Checklist

1. **GitHub Commit & Push (Requires Founder Authorization):**
   - Commit verified changes to branch / `main` and push to `origin`.
2. **Vercel Production Build & Alias Verification:**
   - Verify Vercel deployment reaches `READY` state and aliases `https://www.logicintelligencetechnologies.in`.
3. **Post-Deploy Smoke Checks:**
   - `GET https://www.logicintelligencetechnologies.in/api/health` returns HTTP `200`.
   - Unauthenticated requests to `/api/admin/quotations`, `/api/admin/invoices`, `/api/admin/staff-assignments`, and `/api/admin/engagements/pricing` return HTTP `401`.
   - Inactive coupon `WAKEUPINDIA` returns HTTP `422` on `/api/quotations/[token]/apply-coupon`.
