/* eslint-disable @typescript-eslint/no-require-imports */
// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { hasCapability, CAPABILITIES, SUPER_ADMIN_ONLY_CAPABILITIES } from "../../src/config/roles.ts";

const { verifyStaffClientAssignment } = require("../../src/lib/support/staff-support.ts");
const { acceptQuotation } = require("../../src/lib/quotations/service.ts");

const source = (path: string) => fs.readFileSync(path, "utf8");

test("S01 Negative Authorization: Client API routes strip and reject spoofed x-client-email headers", () => {
  const clientRoutes = [
    "src/app/api/client/actions/route.ts",
    "src/app/api/client/change-requests/route.ts",
    "src/app/api/client/decisions/route.ts",
    "src/app/api/client/messages/route.ts",
    "src/app/api/client/notification-preferences/route.ts",
    "src/app/api/client/notifications/route.ts",
    "src/app/api/client/search/route.ts",
  ];

  for (const route of clientRoutes) {
    const code = source(route);
    assert.ok(
      !code.includes('req.headers.get("x-client-email")'),
      `${route} must not trust unverified x-client-email header`
    );
    assert.ok(
      code.includes("getVerifiedClientUser"),
      `${route} must enforce getVerifiedClientUser session authentication`
    );
  }
});

test("S02 & S04 Negative Authorization: Payment actions strictly enforce cryptographic token matching", () => {
  const dbCode = source("src/lib/payments/db.ts");
  assert.ok(
    dbCode.includes("req.secure_token !== input.secureToken.trim()"),
    "Payment submission and declaration must verify matching secure_token"
  );
  assert.ok(
    dbCode.includes("Unauthorized: Invalid payment token for this request"),
    "Payment verification must throw Unauthorized on token mismatch"
  );
});

test("S05 Negative Authorization: Financial & Invoice PDF endpoints deny unauthorized callers & prevent cache poisoning", () => {
  const financialPdfCode = source("src/app/api/documents/financial/[id]/route.ts");
  assert.ok(
    financialPdfCode.includes("Cache-Control"),
    "Financial document route must set Cache-Control header"
  );
  assert.ok(
    financialPdfCode.includes("private, no-cache, no-store, must-revalidate"),
    "Financial document route must enforce private no-cache headers"
  );
  assert.ok(
    financialPdfCode.includes("createRouteHandlerClient"),
    "Financial document route must authenticate via Supabase session"
  );

  const invoicePdfCode = source("src/app/api/documents/invoice/[invoiceId]/pdf/route.ts");
  assert.ok(
    invoicePdfCode.includes("private, no-cache, no-store, must-revalidate"),
    "Invoice PDF route must enforce private no-cache headers"
  );
  assert.ok(
    invoicePdfCode.includes("createRouteHandlerClient"),
    "Invoice PDF route must authenticate via Supabase session"
  );
});

test("S06 Negative Authorization: Quotation PDF denies unauthenticated UUID lookups and draft downloads", () => {
  const quotationPdfCode = source("src/app/api/documents/quotation/[token]/pdf/route.ts");
  assert.ok(
    quotationPdfCode.includes('process.env.NODE_ENV !== "production"'),
    "Quotation PDF sample bypass must be locked to non-production only"
  );
  assert.ok(
    quotationPdfCode.includes("isStaff"),
    "Quotation PDF route must verify staff authentication for internal UUID lookups"
  );
  assert.ok(
    quotationPdfCode.includes('quotation.status === "draft" && !isStaff'),
    "Quotation PDF route must reject draft quotations for public clients"
  );
  assert.ok(
    quotationPdfCode.includes("private, no-cache, no-store, must-revalidate"),
    "Quotation PDF route must enforce private no-cache headers"
  );
});

test("S07 & B04 Negative Authorization: Staff support assignment denies split-identifier bypass", async () => {
  // Negative test: verifyStaffClientAssignment should return allowed: false if client and engagement do not match together
  const assignmentCheck = await verifyStaffClientAssignment({
    staffUserId: "staff-1",
    staffRole: "support",
    clientId: "cl-unassigned-client-id",
    engagementId: "eng-some-unassigned-id",
  });
  assert.equal(assignmentCheck.allowed, false, "Must return allowed: false for unassigned client & engagement");
});

test("S08 Negative Authorization: Suspended and offboarded staff sessions resolve to null", () => {
  const sessionCode = source("src/lib/auth/session.ts");
  assert.ok(
    sessionCode.includes('ws && ["suspended", "revoked", "archived"].includes(ws.status)'),
    "resolveStaff must reject staff when workspace status is not active"
  );
  assert.ok(
    sessionCode.includes('emp && ["suspended", "offboarded"].includes(emp.employment_status)'),
    "resolveStaff must reject staff when employment status is not active"
  );
});

test("B08 Negative Authorization: Viewer role cannot hold any write, manage, or approve capabilities", () => {
  const forbiddenKeywords = ["write", "manage", "approve", "issue", "send", "upload", "review"];
  for (const c of CAPABILITIES) {
    if (forbiddenKeywords.some((k) => c.endsWith(`.${k}`))) {
      assert.equal(
        hasCapability("viewer", c),
        false,
        `Viewer must not hold forbidden capability: ${c}`
      );
    }
  }
});

test("B08 Negative Authorization: Operations & Developer roles cannot hold Super Admin commercial capabilities", () => {
  for (const c of SUPER_ADMIN_ONLY_CAPABILITIES) {
    assert.equal(
      hasCapability("operations", c),
      false,
      `Operations must not hold super admin only capability: ${c}`
    );
    assert.equal(
      hasCapability("developer", c),
      false,
      `Developer must not hold super admin only capability: ${c}`
    );
  }
});

test("U06 Negative Authorization: Digital quotation acceptance rejects draft and unconfirmed requests", async () => {
  // Rejection without legal consent checkbox
  const resConsent = await acceptQuotation("qt-sample-001", {
    fullName: "Client Name",
    email: "client@example.com",
    consentChecked: false,
  });
  assert.equal(resConsent.ok, false);
  assert.ok(resConsent.error?.includes("Legal consent"));

  // Rejection with empty signer name
  const resEmptyName = await acceptQuotation("qt-sample-001", {
    fullName: "   ",
    email: "client@example.com",
    consentChecked: true,
  });
  assert.equal(resEmptyName.ok, false);

  // Rejection for non-existent token
  const resNotFound = await acceptQuotation("non-existent-token-xyz-9999", {
    fullName: "Client Name",
    email: "client@example.com",
    consentChecked: true,
  });
  assert.equal(resNotFound.ok, false);
  assert.ok(resNotFound.error?.includes("Quotation not found"));
});
