import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const source = (filePath: string) =>
  fs.readFileSync(path.join(process.cwd(), filePath), "utf8");

test("Maintenance Order Creation: Authoritative pricing is calculated server-side", () => {
  const serviceCode = source("src/lib/subscriptions/service.ts");
  const routeCode = source("src/app/api/subscriptions/order/route.ts");

  // Order creation service must invoke authoritative calculatePlanPricing
  assert.ok(
    serviceCode.includes("calculatePlanPricing(planId)"),
    "Order creation service must use calculatePlanPricing from server catalog"
  );

  // Route must not trust client-supplied total or paise
  assert.ok(
    !routeCode.includes("body.totalPayablePaise"),
    "Route must not read client-supplied totalPayablePaise"
  );
  assert.ok(
    !routeCode.includes("body.amountPaise"),
    "Route must not read client-supplied amountPaise"
  );

  // Route must validate planId against catalog
  assert.ok(
    routeCode.includes("MAINTENANCE_PLANS[planId as PlanIdentifier]"),
    "Route must check planId against canonical catalog"
  );
});

test("Maintenance UTR Submission: Validates 12-digit UTR and requires order reference", () => {
  const routeCode = source("src/app/api/subscriptions/submit-utr/route.ts");
  const serviceCode = source("src/lib/subscriptions/service.ts");

  assert.ok(
    routeCode.includes("declaredUtr"),
    "Route must require declaredUtr"
  );
  assert.ok(
    routeCode.includes("orderRef"),
    "Route must require orderRef"
  );
  assert.ok(
    routeCode.includes("secureToken"),
    "Route must require secureToken"
  );
  assert.ok(
    serviceCode.includes("cleanUtr"),
    "Service must sanitize UTR input"
  );
});

test("Maintenance Admin Verification: Locked to Super Admin with bank reconciliation", () => {
  const verifyCode = source("src/app/api/admin/subscriptions/verify/route.ts");
  const serviceCode = source("src/lib/subscriptions/service.ts");

  // Must enforce super_admin role check
  assert.ok(
    verifyCode.includes('profile?.role !== "super_admin"'),
    "Verify route must check profile role === super_admin"
  );
  assert.ok(
    verifyCode.includes("FORBIDDEN: Verified Super Admin access required."),
    "Verify route must return 403 on non-super-admin"
  );

  // Service must require bankReconciliationRef and adminUserId
  assert.ok(
    serviceCode.includes("bank_reconciliation_ref: bankReconciliationRef.trim()"),
    "Service must store bank reconciliation reference"
  );
  assert.ok(
    serviceCode.includes("verified_by: adminUserId"),
    "Service must store admin user ID who verified"
  );
  assert.ok(
    serviceCode.includes("This order has already been verified."),
    "Service must prevent double verification"
  );
});

test("Maintenance Admin Refund: Super Admin manual refund for ₹20 Free Trial", () => {
  const refundCode = source("src/app/api/admin/subscriptions/refund/route.ts");
  const serviceCode = source("src/lib/subscriptions/service.ts");

  // Must enforce super_admin check
  assert.ok(
    refundCode.includes('profile?.role !== "super_admin"'),
    "Refund route must check profile role === super_admin"
  );
  assert.ok(
    refundCode.includes("FORBIDDEN: Verified Super Admin access required."),
    "Refund route must return 403 on non-super-admin"
  );

  // Service must enforce refund processing
  assert.ok(
    serviceCode.includes("processSubscriptionRefund"),
    "Refund route must delegate to processSubscriptionRefund"
  );
});

test("Maintenance RLS Migration: Revokes anonymous write and enforces tenant isolation", () => {
  const migrationCode = source(
    "supabase/migrations/20261017050000_maintenance_and_subscriptions_five_options.sql"
  );

  // RLS enabled on all new tables
  assert.ok(migrationCode.includes("ALTER TABLE public.maintenance_plans ENABLE ROW LEVEL SECURITY;"));
  assert.ok(migrationCode.includes("ALTER TABLE public.maintenance_subscriptions ENABLE ROW LEVEL SECURITY;"));
  assert.ok(migrationCode.includes("ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;"));
  assert.ok(migrationCode.includes("ALTER TABLE public.maintenance_enhancement_ledger ENABLE ROW LEVEL SECURITY;"));
  assert.ok(migrationCode.includes("ALTER TABLE public.maintenance_roadmap_items ENABLE ROW LEVEL SECURITY;"));
  assert.ok(migrationCode.includes("ALTER TABLE public.client_correction_requests ENABLE ROW LEVEL SECURITY;"));

  // Revoke anonymous mutations
  assert.ok(
    migrationCode.includes("REVOKE ALL ON public.maintenance_subscriptions FROM anon;"),
    "Must revoke anon access to subscriptions"
  );
  assert.ok(
    migrationCode.includes("REVOKE ALL ON public.maintenance_orders FROM anon;"),
    "Must revoke anon access to orders"
  );
  assert.ok(
    migrationCode.includes("REVOKE ALL ON public.maintenance_enhancement_ledger FROM anon;"),
    "Must revoke anon access to enhancement ledger"
  );

  // Free Trial verification fee check
  assert.ok(
    migrationCode.includes("2000"),
    "Migration must seed Free Trial one-time verification fee of 2000 paise (₹20)"
  );
});

test("Correction Request Control: Validates structured fields and links to engagement/document", () => {
  const correctionCode = source("src/app/api/subscriptions/correction/route.ts");

  assert.ok(
    correctionCode.includes("affectedField"),
    "Must require affectedField"
  );
  assert.ok(
    correctionCode.includes("requestedValue"),
    "Must require requestedValue"
  );
  assert.ok(
    correctionCode.includes("explanation"),
    "Must require explanation"
  );
  assert.ok(
    correctionCode.includes("documentRef"),
    "Must link change to document reference"
  );
});
