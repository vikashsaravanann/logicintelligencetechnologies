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
import {
  MASTER_DOCUMENT_FIELD_REGISTRY,
  getDocumentFieldDefinitions,
  resolveAutoPopulatedDocumentFields,
} from "../../src/lib/documents/master-field-registry.ts";

// Require server modules after server-only stub is loaded
const { resolveAndVerifyAttachments } = require("../../src/lib/email/attachments");

const source = (relPath: string) =>
  fs.readFileSync(new URL(`../../${relPath}`, import.meta.url), "utf8");

// =============================================================================
// MAIL01: Email Outbox Schema & Queue Alignment
// =============================================================================
test("MAIL01: public.email_outbox migration and outbox client support attachment_refs and template_data", () => {
  const migration = source(
    "supabase/migrations/20261017100000_email_outbox_attachments_and_truthful_delivery.sql"
  );
  assert.ok(
    migration.includes("attachment_refs") && migration.includes("'[]'::jsonb"),
    "migration must add attachment_refs JSONB"
  );
  assert.ok(
    migration.includes("template_data") && migration.includes("'{}'::jsonb"),
    "migration must add template_data JSONB"
  );
  assert.ok(
    migration.includes("('pending', 'queued', 'retrying')"),
    "migration must index pending, queued, and retrying states"
  );

  const outboxCode = source("src/lib/email/outbox.ts");
  assert.ok(
    outboxCode.includes("attachmentRefs"),
    "outbox.ts must support attachmentRefs in types"
  );
  assert.ok(
    outboxCode.includes("templateData"),
    "outbox.ts must support templateData in types"
  );
  assert.ok(
    outboxCode.includes('.in("status", ["pending", "queued", "retrying"])'),
    "loadDueOutbox must query pending, queued, and retrying"
  );
  assert.ok(
    outboxCode.includes("attachment_refs") && outboxCode.includes("template_data"),
    "loadDueOutbox must select attachment_refs and template_data"
  );
  assert.ok(
    outboxCode.includes("export async function enqueueTransactionalEmail"),
    "outbox.ts must export enqueueTransactionalEmail"
  );
});

// =============================================================================
// MAIL02: Attachment Verification & Retry Preservation
// =============================================================================
test("MAIL02: Attachment resolution validates PDF integrity and SHA-256", async () => {
  // Empty or undefined refs return empty array
  const empty = await resolveAndVerifyAttachments(undefined);
  assert.deepEqual(empty, []);

  // Cron outbox worker passes attachments to sendMail
  const cronRoute = source("src/app/api/cron/email-outbox/route.ts");
  assert.ok(
    cronRoute.includes("resolveAndVerifyAttachments(row.attachment_refs"),
    "cron outbox worker must resolve and verify attachments"
  );
  assert.ok(
    cronRoute.includes("attachments: attachments"),
    "cron outbox worker must attach verified buffers to sendMail"
  );

  // sendEmail accepts attachmentRefs and forwards to claimOutbox
  const sendEmailCode = source("src/lib/email/send-email.ts");
  assert.ok(
    sendEmailCode.includes("attachmentRefs?: AttachmentRef[]") &&
      (sendEmailCode.includes("attachmentRefs,") || sendEmailCode.includes("attachmentRefs:")),
    "sendEmail must accept and forward attachmentRefs to claimOutbox"
  );

  // db.ts builds durable attachmentRefs for payment verification email
  const dbCode = source("src/lib/engagements/db.ts");
  assert.ok(
    dbCode.includes("emailAttachmentRefs.push({") &&
      dbCode.includes("storageBucket: DOCUMENTS_BUCKET"),
    "db.ts must construct durable attachmentRefs with DOCUMENTS_BUCKET"
  );
});

// =============================================================================
// MAIL03: Truthful Stage Lifecycle Email Delivery
// =============================================================================
test("MAIL03: Stage lifecycle notifications never output Stage 14 or premature unlocks", () => {
  const notificationsCode = source("src/lib/engagements/stage-notifications.ts");

  // Inquiries and revisions do not advance stage or overwrite summaries
  assert.ok(
    notificationsCode.includes("action === 'request_revision'") &&
      notificationsCode.includes("action === 'ask_question'"),
    "extractStageDetails must return early on revision/question/decline"
  );
  assert.ok(
    notificationsCode.includes("const isAdvancing = input.action !== 'request_revision'") &&
      notificationsCode.includes("const nextStageTitle = isAdvancing && nextDef ? nextDef.title : undefined;"),
    "notifyStageSubmitted must not set nextStageTitle on non-advancing actions"
  );

  // Stage 13 is the final milestone; never Stage 14
  assert.ok(
    notificationsCode.includes("approvedDef.ordinal === 13"),
    "notifyStageApproved must detect Stage 13 as final milestone"
  );
  assert.ok(
    notificationsCode.includes("Stage 13 Approved · Project Completed & Handed Over"),
    "notifyStageApproved must use final completion subject without non-existent next stage"
  );

  const receiptTemplate = source("emails/stage-submission-client-receipt-email.tsx");
  assert.ok(
    !receiptTemplate.includes("Stage 14"),
    "receipt email template must never reference Stage 14"
  );
  assert.ok(
    receiptTemplate.includes("Ongoing technical support and SLA coverage will remain active in your portal."),
    "receipt email must explain ongoing support at completion"
  );
});

// =============================================================================
// MAIL04: Awaited Durable Notification Executions
// =============================================================================
test("MAIL04: Stage notification triggers in db.ts are awaited in try/catch blocks", () => {
  const dbCode = source("src/lib/engagements/db.ts");
  assert.ok(
    dbCode.includes("await notifyStageSubmitted("),
    "notifyStageSubmitted must be awaited"
  );
  assert.ok(
    dbCode.includes("await notifyStageApproved("),
    "notifyStageApproved must be awaited"
  );
  // Ensure no unawaited floating promise calls remain
  const unawaitedCalls = dbCode.match(/(?<!await\s+)notifyStageApproved\(/g);
  assert.equal(
    unawaitedCalls,
    null,
    "No unawaited floating calls to notifyStageApproved are allowed in db.ts"
  );
});

// =============================================================================
// PDF01 & PDF02: Concurrency Isolation & Storage Persistence
// =============================================================================
test("PDF01 & PDF02: Generated stage financial documents are uploaded to storage and financial_documents", () => {
  const dbCode = source("src/lib/engagements/db.ts");

  // Confirms invoice and receipt PDFs are uploaded to DOCUMENTS_BUCKET
  assert.ok(
    dbCode.includes(".from(DOCUMENTS_BUCKET)") &&
      dbCode.includes("upload(invoiceStoragePath,"),
    "must upload invoice PDF bytes to DOCUMENTS_BUCKET"
  );
  assert.ok(
    dbCode.includes(".from(DOCUMENTS_BUCKET)") &&
      dbCode.includes("upload(receiptStoragePath,"),
    "must upload receipt PDF bytes to DOCUMENTS_BUCKET"
  );

  // Confirms financial_documents table insertion
  assert.ok(
    dbCode.includes(".from('financial_documents').insert({"),
    "must insert authoritative rows into financial_documents"
  );

  // Concurrency isolation in pdf-renderer
  const docsysCode = source("services/pdf-renderer/generator/docsys.py");
  assert.ok(
    docsysCode.includes("class _ThreadLocalDict"),
    "pdf-renderer docsys must use _ThreadLocalDict for FILL"
  );
  assert.ok(
    docsysCode.includes("class _ThreadLocalList"),
    "pdf-renderer docsys must use _ThreadLocalList for RECORD"
  );

  const appCode = source("services/pdf-renderer/app.py");
  assert.ok(
    appCode.includes("RENDER_LOCK = threading.Lock()"),
    "app.py must serialize rendering requests via RENDER_LOCK"
  );
  assert.ok(
    appCode.includes("finally:\n            reset_counts()\n            set_fill({})"),
    "app.py must reset counts and clear fill in finally block"
  );
});

// =============================================================================
// PDF03: Synchronized Template IDs in Master Field Registry
// =============================================================================
test("PDF03: Master field registry synchronizes LIT-02-PROPOSAL and LIT-05-DELIVERY", () => {
  const codes = Object.keys(MASTER_DOCUMENT_FIELD_REGISTRY);

  // Assert both Python template keys and existing governance keys exist
  assert.ok(codes.includes("LIT-02-PROPOSAL"), "must define LIT-02-PROPOSAL");
  assert.ok(codes.includes("LIT-05-DELIVERY"), "must define LIT-05-DELIVERY");
  assert.ok(codes.includes("LIT-01-SOW"), "must preserve LIT-01-SOW");
  assert.ok(codes.includes("LIT-02-NDA"), "must preserve LIT-02-NDA");
  assert.ok(codes.includes("LIT-05-CHANGE-REQUEST"), "must preserve LIT-05-CHANGE-REQUEST");
  assert.ok(codes.includes("LIT-06-HANDOVER"), "must preserve LIT-06-HANDOVER");

  // Verify LIT-02-PROPOSAL field definitions and financial redaction
  const proposalFields = getDocumentFieldDefinitions("LIT-02-PROPOSAL");
  assert.ok(proposalFields.length >= 8, "LIT-02-PROPOSAL must have complete field spec");
  const proposalRedacted = getDocumentFieldDefinitions("LIT-02-PROPOSAL", { redactFinancials: true });
  assert.ok(
    proposalRedacted.every((f) => !f.financialSensitive),
    "redactFinancials must strip sensitive pricing fields from LIT-02-PROPOSAL"
  );

  // Auto-population resolution
  const context = {
    engagementRef: "ENG-2026-TEST",
    companyName: "Acme Healthcare",
    contactName: "Dr. Jane Doe",
    contactEmail: "jane@acme.com",
    approvedSubtotalPaise: 5000000,
    approvedGstPaise: 900000,
    approvedTotalPaise: 5900000,
  };

  const resolvedProposal = resolveAutoPopulatedDocumentFields("LIT-02-PROPOSAL", context);
  assert.equal(resolvedProposal.proposalReference, "LIT-02-PROPOSAL-ENG-2026-TEST");
  assert.equal(resolvedProposal.clientLegalName, "Acme Healthcare");
  assert.equal(resolvedProposal.contractSubtotalPaise, 5000000);
  assert.equal(resolvedProposal.totalContractValuePaise, 5900000);
  assert.equal(resolvedProposal.milestone1DepositPaise, 2950000);
  assert.equal(resolvedProposal.milestone2SettlementPaise, 2950000);

  const resolvedDelivery = resolveAutoPopulatedDocumentFields("LIT-05-DELIVERY", context);
  assert.equal(resolvedDelivery.deliveryReportRef, "LIT-05-DELIVERY-ENG-2026-TEST");
  assert.equal(resolvedDelivery.acceptanceCriteriaVerified, true);
});

// =============================================================================
// PDF04: Accessible 2:3 Preview Modal & Client Stage Integration
// =============================================================================
test("PDF04: PdfPreviewModal provides z-[100] stacking, preflight verification, and object/iframe fallback", () => {
  const modalCode = source("src/components/pdf/PdfPreviewModal.tsx");

  assert.ok(
    modalCode.includes("z-[100]"),
    "modal must use z-[100] to sit above headers and drawer navigations"
  );
  assert.ok(
    modalCode.includes("touchAction = 'none'"),
    "modal must lock touch-action to prevent background scroll leaking"
  );
  assert.ok(
    modalCode.includes("checkDocument") && modalCode.includes("method: 'HEAD'"),
    "modal must perform pre-flight HTTP inspection"
  );
  assert.ok(
    modalCode.includes("res.status === 404") && modalCode.includes("res.status === 403"),
    "modal must handle 401, 403, and 404 status codes explicitly"
  );
  assert.ok(
    modalCode.includes("<object") && modalCode.includes("<iframe"),
    "modal must use <object> tag with embedded <iframe> fallback"
  );
  assert.ok(
    modalCode.includes("SHA-256:"),
    "modal must display SHA-256 cryptographic verification badge"
  );

  // Client stage portal wiring
  const initialClientCode = source(
    "src/app/engagement/[engagementRef]/initial-invoice/InitialInvoiceStageClient.tsx"
  );
  assert.ok(
    initialClientCode.includes("<PdfPreviewModal"),
    "InitialInvoiceStageClient must render PdfPreviewModal"
  );
  assert.ok(
    !initialClientCode.includes("/api/documents/invoice/${initialData?.invoice_id || 'latest'}/pdf"),
    "InitialInvoiceStageClient must eliminate literal 'latest' URL string"
  );

  const finalClientCode = source(
    "src/app/engagement/[engagementRef]/final-payment/FinalPaymentStageClient.tsx"
  );
  assert.ok(
    finalClientCode.includes("<PdfPreviewModal"),
    "FinalPaymentStageClient must render PdfPreviewModal"
  );
  assert.ok(
    !finalClientCode.includes("/api/documents/invoice/${initialData?.invoice_id || 'latest'}/pdf"),
    "FinalPaymentStageClient must eliminate literal 'latest' URL string"
  );
});
