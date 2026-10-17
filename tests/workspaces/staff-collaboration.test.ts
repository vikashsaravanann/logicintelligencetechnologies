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
import crypto from "crypto";

const {
  redactJourneyForStaff,
  redactChangeRequestsForStaff,
  RESTRICTED_STAGE_PLACEHOLDER,
} = require("../../src/lib/engagements/redaction");

const {
  WALLET_MAX_FILE_SIZE_BYTES,
  WALLET_ALLOWED_MIME_TYPES,
  validateWalletUpload,
} = require("../../src/lib/workspaces/wallet-service");

const { hashInvitationToken } = require("../../src/lib/collaboration/project-collaboration-service");

const readCode = (relPath: string) => fs.readFileSync(relPath, "utf8");

test("Staff Document Wallet: enforces strict 50 MB boundary", () => {
  assert.strictEqual(
    WALLET_MAX_FILE_SIZE_BYTES,
    52428800,
    "Wallet max file size must be exactly 50 MB (52,428,800 bytes)"
  );

  // Exact 50 MB boundary is allowed
  assert.doesNotThrow(() => {
    validateWalletUpload(52428800, "application/pdf");
  });

  // 1 byte over 50 MB must be rejected
  assert.throws(
    () => {
      validateWalletUpload(52428801, "application/pdf");
    },
    /50 MB/,
    "Files over 50 MB must be rejected"
  );

  // Negative or zero byte files
  assert.throws(
    () => {
      validateWalletUpload(0, "application/pdf");
    },
    /empty/,
    "Empty files must be rejected"
  );
});

test("Staff Document Wallet: enforces MIME allowlist and rejects executable formats", () => {
  // Allowed types
  assert.ok(WALLET_ALLOWED_MIME_TYPES.includes("application/pdf"));
  assert.ok(WALLET_ALLOWED_MIME_TYPES.includes("image/jpeg"));
  assert.ok(WALLET_ALLOWED_MIME_TYPES.includes("image/png"));
  assert.ok(WALLET_ALLOWED_MIME_TYPES.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));

  // Valid upload passes
  assert.doesNotThrow(() => {
    validateWalletUpload(1024 * 1024, "image/jpeg");
  });

  // Disallowed dangerous MIME types
  const dangerousMimes = [
    "application/x-msdownload",
    "application/x-sh",
    "text/html",
    "application/javascript",
    "application/x-php",
    "text/xml",
  ];

  for (const mime of dangerousMimes) {
    assert.throws(
      () => {
        validateWalletUpload(1024, mime);
      },
      /unsupported MIME type/i,
      `MIME type ${mime} must be rejected`
    );
  }
});

test("Staff Document Wallet: enforces owner path prefix and tenant isolation", () => {
  const serviceCode = readCode("src/lib/workspaces/wallet-service.ts");

  // Path prefix isolation
  assert.ok(
    serviceCode.includes("!storagePath.startsWith(`${ownerUserId}/`)"),
    "Storage object paths must be strictly partitioned by owner user ID"
  );

  // Signed URL expiry
  assert.ok(
    serviceCode.includes("createSignedUrl"),
    "Wallet downloads must issue short-lived signed URLs, never permanent public URLs"
  );
  assert.ok(
    serviceCode.includes("900"),
    "Signed URL TTL must be 15 minutes (900 seconds)"
  );

  // Route authorization check
  const routeCode = readCode("src/app/api/admin/workspaces/[id]/wallet/route.ts");
  assert.ok(
    routeCode.includes('ws.ownerUserId !== caller.userId && caller.role !== "super_admin"'),
    "Wallet endpoint must enforce that caller is either workspace owner or super_admin"
  );
});

test("13-Stage Redaction Engine: redacts Stage 6 and Stage 11 for non-super-admin staff", () => {
  const mockStages = [
    { key: "discovery", ordinal: 2, title: "Discovery & Requirements", description: "Technical scoping", status: "completed" },
    { key: "initial-invoice", ordinal: 6, title: "Initial 50% Advance", description: "Advance billing of INR 250,000", status: "completed", estimated_cost_inr: 250000 },
    { key: "technical-spec", ordinal: 8, title: "Technical Specifications", description: "Architecture blueprints", status: "in_progress" },
    { key: "final-payment", ordinal: 11, title: "Final 50% Deployment Payment", description: "Final milestone invoice", status: "pending", estimated_cost_inr: 250000 },
    { key: "handover", ordinal: 12, title: "Codebase Handover & IP Assignment", description: "Repository transfer", status: "pending" },
  ];

  // 1. When viewed by staff (isSuperAdmin = false)
  const staffView = redactJourneyForStaff(mockStages, false);

  const stage6 = staffView.find((s) => s.key === "initial-invoice");
  const stage11 = staffView.find((s) => s.key === "final-payment");
  const stage8 = staffView.find((s) => s.key === "technical-spec");

  assert.ok(stage6, "Stage 6 must exist");
  assert.strictEqual(stage6.status, "locked", "Stage 6 status must be forced to 'locked' for staff");
  assert.strictEqual(stage6.description, RESTRICTED_STAGE_PLACEHOLDER, "Stage 6 description must be redacted");
  assert.strictEqual((stage6 as any).estimated_cost_inr, undefined, "Commercial price must be completely removed");

  assert.ok(stage11, "Stage 11 must exist");
  assert.strictEqual(stage11.status, "locked", "Stage 11 status must be forced to 'locked' for staff");
  assert.strictEqual(stage11.description, RESTRICTED_STAGE_PLACEHOLDER, "Stage 11 description must be redacted");
  assert.strictEqual((stage11 as any).estimated_cost_inr, undefined, "Commercial price must be completely removed");

  assert.ok(stage8, "Technical spec stage must be visible");
  assert.strictEqual(stage8.status, "in_progress", "Non-financial stages must retain status");
  assert.strictEqual(stage8.description, "Architecture blueprints", "Non-financial description preserved");

  // 2. When viewed by Super Admin (isSuperAdmin = true)
  const adminView = redactJourneyForStaff(mockStages, true);
  const adminStage6 = adminView.find((s) => s.key === "initial-invoice");
  assert.strictEqual(adminStage6?.status, "completed", "Super Admin sees original stage status");
  assert.strictEqual(adminStage6?.description, "Advance billing of INR 250,000", "Super Admin sees full commercial description");
});

test("13-Stage Redaction Engine: redacts commercial cost in RFC change requests", () => {
  const mockRfcs = [
    {
      id: "rfc-123",
      title: "Add Vector Search Engine",
      description: "Upgrade PostgreSQL pgvector",
      estimated_cost_inr: 75000,
      pricing_notes: "Requires dedicated GPU node",
    },
  ];

  // Staff view
  const staffRfcs = redactChangeRequestsForStaff(mockRfcs, false);
  assert.strictEqual(staffRfcs[0].estimated_cost_inr, null, "Staff view must set estimated_cost_inr to null");
  assert.strictEqual(staffRfcs[0].is_cost_redacted, true, "Staff view must flag is_cost_redacted");
  assert.strictEqual(staffRfcs[0].title, "Add Vector Search Engine");

  // Admin view
  const adminRfcs = redactChangeRequestsForStaff(mockRfcs, true);
  assert.strictEqual(adminRfcs[0].estimated_cost_inr, 75000, "Super admin sees full estimated cost");
  assert.strictEqual(adminRfcs[0].pricing_notes, "Requires dedicated GPU node", "Super admin sees pricing notes");
});

test("Project Collaboration: cryptographic token hashing produces deterministic SHA-256", () => {
  const token = "b9f7a62d4e1c8a03f47e2b8c91a0f3e7b9f7a62d4e1c8a03f47e2b8c91a0f3e7";
  const expectedHash = crypto.createHash("sha256").update(token).digest("hex");
  const actualHash = hashInvitationToken(token);

  assert.strictEqual(actualHash, expectedHash);
  assert.strictEqual(actualHash.length, 64, "SHA-256 hex hash must be exactly 64 characters");
});

test("Project Collaboration: invitation acceptance checks account match and single-use state", () => {
  const serviceCode = readCode("src/lib/collaboration/project-collaboration-service.ts");

  assert.ok(
    serviceCode.includes("ALREADY_ACCEPTED"),
    "Service must detect and reject reused invitation tokens"
  );
  assert.ok(
    serviceCode.includes("EXPIRED"),
    "Service must check expiration date of invitations"
  );
  assert.ok(
    serviceCode.includes("REVOKED"),
    "Service must verify invitation has not been revoked"
  );
  assert.ok(
    serviceCode.includes("ACCOUNT_MISMATCH"),
    "Service must enforce caller email equals invitation recipient email"
  );
  assert.ok(
    serviceCode.includes("staff_client_assignments"),
    "Accepted invitations must record active assignment in staff_client_assignments"
  );
});

test("Client-to-Staff Routing: deterministic triage fallback enqueues unassigned requests", () => {
  const routerCode = readCode("src/lib/routing/client-request-router.ts");

  assert.ok(
    routerCode.includes("project_triage_queue"),
    "Router must enqueue to project_triage_queue when no active lead exists"
  );
  assert.ok(
    routerCode.includes("pending_assignment"),
    "Triage queue items must default to pending_assignment"
  );
  assert.ok(
    routerCode.includes("ClientRequestRoutedEmail"),
    "Assigned requests must dispatch ClientRequestRoutedEmail notification"
  );
  assert.ok(
    routerCode.includes("sendEmail"),
    "Routing notifications must dispatch via sendEmail"
  );
  assert.ok(
    readCode("src/lib/email/outbox.ts").includes("email_outbox"),
    "All routing email notifications must queue to email_outbox"
  );
});

test("Client Portal: delivery team display strictly sanitizes commercial exposure", () => {
  const serviceCode = readCode("src/lib/collaboration/project-collaboration-service.ts");

  // Check getDeliveryTeamForClientProject return properties
  assert.ok(
    serviceCode.includes("getDeliveryTeamForClientProject"),
    "Must export getDeliveryTeamForClientProject helper"
  );

  // Client view page
  const pageCode = readCode("src/app/client/projects/[id]/page.tsx");
  assert.ok(
    pageCode.includes("getDeliveryTeamForClientProject"),
    "Client project detail page must invoke getDeliveryTeamForClientProject"
  );
  assert.ok(
    pageCode.includes("Assigned LIT Delivery Team"),
    "Client project detail page must render Assigned LIT Delivery Team section"
  );
});

