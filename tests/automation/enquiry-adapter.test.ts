import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  isValidEnquiryTransition,
  assertValidEnquiryTransition,
  validateEnquiryParameters,
  validateGeminiExtraction,
  extractMessageContent,
  reserveMessageAtomic,
  recordProviderSendReceipt,
  markMessageCompleted,
  markMessageFailed,
  markMessageDeclined,
  generateIdempotencyKey,
  verifyProviderMessageSent,
  verifyCalComWebhookHmac,
  processCalComBookingWebhook,
  canApproveEnquiry,
  inMemoryReservationStore,
  LIT_SERVICE_CATEGORIES,
  type ProviderSendReceipt,
  type CalComBookingPayload,
} from "../../src/lib/automations/enquiry-adapter.ts";

test.beforeEach(() => {
  inMemoryReservationStore.clear();
});

// ============================================================================
// 1. STATE MACHINE TRANSITIONS
// ============================================================================

test("state machine allows valid lifecycle transitions", () => {
  assert.equal(isValidEnquiryTransition("received", "message_reserved"), true);
  assert.equal(isValidEnquiryTransition("message_reserved", "classified"), true);
  assert.equal(isValidEnquiryTransition("classified", "pending_approval"), true);
  assert.equal(isValidEnquiryTransition("pending_approval", "approved"), true);
  assert.equal(isValidEnquiryTransition("approved", "dispatching"), true);
  assert.equal(isValidEnquiryTransition("dispatching", "sent"), true);
  assert.equal(isValidEnquiryTransition("sent", "booked"), true);
  assert.equal(isValidEnquiryTransition("pending_approval", "declined"), true);
  assert.equal(isValidEnquiryTransition("dispatching", "failed"), true);
  assert.equal(isValidEnquiryTransition("failed", "dispatching"), true); // retry
});

test("state machine disallows invalid transitions and terminal state bypass", () => {
  // Cannot jump from received straight to sent or booked
  assert.equal(isValidEnquiryTransition("received", "sent"), false);
  assert.equal(isValidEnquiryTransition("received", "booked"), false);
  assert.equal(isValidEnquiryTransition("classified", "sent"), false);

  // Terminal states cannot transition out
  assert.equal(isValidEnquiryTransition("booked", "dispatching"), false);
  assert.equal(isValidEnquiryTransition("declined", "approved"), false);
  assert.equal(isValidEnquiryTransition("ignored_duplicate", "received"), false);

  assert.throws(
    () => assertValidEnquiryTransition("received", "booked"),
    /Invalid enquiry state transition/
  );
});

// ============================================================================
// 2. P0 RACE CONDITION & ATOMIC RESERVATION
// ============================================================================

test("atomic reservation reserves new message and rejects duplicate concurrent claims", async () => {
  const msgId = "msg_test_001";
  const threadId = "th_test_001";

  // First worker reserves
  const res1 = await reserveMessageAtomic({
    messageId: msgId,
    threadId,
    sender: "client@example.com",
    ttlSeconds: 300,
  });

  assert.equal(res1.success, true);
  assert.ok(res1.token);
  assert.equal(inMemoryReservationStore.getStatus(msgId), "message_reserved");

  // Concurrent worker attempts to reserve the same message
  const res2 = await reserveMessageAtomic({
    messageId: msgId,
    threadId,
    sender: "client@example.com",
    ttlSeconds: 300,
  });

  assert.equal(res2.success, false);
  assert.equal(res2.reason, "ALREADY_RESERVED");
  assert.equal(res2.existingStatus, "message_reserved");
});

test("atomic reservation rejects already completed or terminal messages", async () => {
  const msgId = "msg_test_completed";
  const threadId = "th_test_completed";

  inMemoryReservationStore.markTerminal(msgId, "sent");

  const res = await reserveMessageAtomic({
    messageId: msgId,
    threadId,
  });

  assert.equal(res.success, false);
  assert.equal(res.reason, "ALREADY_PROCESSED");
  assert.equal(res.existingStatus, "sent");
});

// ============================================================================
// 3. P0 PREMATURE SUCCESS PREVENTION
// ============================================================================

test("provider receipt gate updates state to 'sent' ONLY with valid provider delivery receipt", async () => {
  const msgId = "msg_receipt_001";
  const threadId = "th_receipt_001";

  await reserveMessageAtomic({ messageId: msgId, threadId });

  // 1. Missing provider message ID must fail
  const invalidReceipt: ProviderSendReceipt = {
    provider: "gmail",
    providerMessageId: "",
    threadId,
    messageId: msgId,
    status: "delivered",
    sentAt: new Date().toISOString(),
  };

  const failRes = await recordProviderSendReceipt(invalidReceipt);
  assert.equal(failRes.success, false);
  assert.match(failRes.error!, /MISSING_PROVIDER_MESSAGE_ID/);

  // 2. Failed provider send must transition to 'failed', never 'sent'
  const failedReceipt: ProviderSendReceipt = {
    provider: "gmail",
    providerMessageId: "gmail_err_01",
    threadId,
    messageId: msgId,
    status: "failed",
    sentAt: new Date().toISOString(),
  };

  const errRes = await recordProviderSendReceipt(failedReceipt);
  assert.equal(errRes.success, false);
  assert.equal(errRes.threadState, "failed");
  assert.equal(inMemoryReservationStore.getStatus(msgId), "failed");

  // 3. Successful receipt with message ID transitions to 'sent'
  const validReceipt: ProviderSendReceipt = {
    provider: "gmail",
    providerMessageId: "gmail_success_12345",
    threadId,
    messageId: msgId,
    status: "delivered",
    sentAt: new Date().toISOString(),
  };

  const okRes = await recordProviderSendReceipt(validReceipt);
  assert.equal(okRes.success, true);
  assert.equal(okRes.threadState, "sent");
  assert.equal(inMemoryReservationStore.getStatus(msgId), "sent");
});

// ============================================================================
// 4. P0 TERMINAL LIFECYCLE COMPLETIONS
// ============================================================================

test("terminal lifecycle functions mark status accurately", async () => {
  const threadId = "th_term_01";

  // markMessageCompleted
  const okReceipt: ProviderSendReceipt = {
    provider: "smtp",
    providerMessageId: "smtp_msg_999",
    threadId,
    messageId: "msg_term_ok",
    status: "accepted",
    sentAt: new Date().toISOString(),
  };
  await markMessageCompleted("msg_term_ok", threadId, okReceipt);
  assert.equal(inMemoryReservationStore.getStatus("msg_term_ok"), "sent");

  // markMessageFailed
  await markMessageFailed("msg_term_fail", threadId, "Timeout contacting SMTP");
  assert.equal(inMemoryReservationStore.getStatus("msg_term_fail"), "failed");

  // markMessageDeclined
  await markMessageDeclined("msg_term_dec", threadId, "Out of scope", "admin@lit.in");
  assert.equal(inMemoryReservationStore.getStatus("msg_term_dec"), "declined");
});

// ============================================================================
// 5. P0 RETRY IDEMPOTENCY
// ============================================================================

test("idempotency key generation is deterministic and unique per action", () => {
  const k1 = generateIdempotencyKey("th_123", "msg_456", "dispatch");
  const k2 = generateIdempotencyKey("th_123", "msg_456", "dispatch");
  const k3 = generateIdempotencyKey("th_123", "msg_456", "followup");

  assert.equal(k1, k2);
  assert.notEqual(k1, k3);
  assert.ok(k1.startsWith("idemp_"));
});

test("verifyProviderMessageSent accurately identifies sent status", async () => {
  const msgId = "msg_check_sent";
  assert.equal((await verifyProviderMessageSent(msgId)).isSent, false);

  inMemoryReservationStore.markTerminal(msgId, "sent");
  const res = await verifyProviderMessageSent(msgId);
  assert.equal(res.isSent, true);
  assert.equal(res.status, "sent");
});

// ============================================================================
// 6. P1 SERVICE TAXONOMY & CLEANING REJECTION
// ============================================================================

test("validateEnquiryParameters rejects cleaning template placeholders", () => {
  // Reject cleaning words
  const cleaningCheck = validateEnquiryParameters({
    subject: "Need house cleaning services",
    body: "Please send maid for 3 bedroom 2 bathroom deep clean estimate",
    isProduction: true,
  });
  assert.equal(cleaningCheck.valid, false);
  assert.ok(cleaningCheck.errors.some((e) => e.includes("cleaning")));

  // Reject TEST-DAY5 in production
  const testDayCheck = validateEnquiryParameters({
    query: "TEST-DAY5 consultation",
    isProduction: true,
  });
  assert.equal(testDayCheck.valid, false);
  assert.ok(testDayCheck.errors.some((e) => e.includes("TEST-DAY5")));

  // Reject America/New_York timezone in production
  const tzCheck = validateEnquiryParameters({
    timezone: "America/New_York",
    isProduction: true,
  });
  assert.equal(tzCheck.valid, false);
  assert.ok(tzCheck.errors.some((e) => e.includes("America/New_York")));

  // Accept valid LIT enterprise AI query
  const litCheck = validateEnquiryParameters({
    subject: "Autonomous Agentic Workflows for Healthcare Telemetry",
    body: "We need an enterprise AI architecture with VoiceShield Biometric defense.",
    timezone: "Asia/Kolkata",
    isProduction: true,
  });
  assert.equal(litCheck.valid, true);
  assert.equal(litCheck.errors.length, 0);
  assert.ok(litCheck.matchedCategory);
});

// ============================================================================
// 7. P1 GEMINI EXTRACTION SCHEMA VALIDATION & HUMAN REVIEW FALLBACK
// ============================================================================

test("validateGeminiExtraction validates high confidence extraction", () => {
  const validPayload = {
    customerName: "Dr. Rajesh Sharma",
    customerEmail: "rajesh@apollohealth.org",
    companyName: "Apollo Health Group",
    serviceInterest: "Healthcare Telemetry & ABDM Integration",
    budgetRange: "₹25L - ₹50L",
    urgency: "high",
    sentiment: "positive",
    intentScore: 0.95,
    ambiguousFields: [],
    suggestedReply: "Dear Dr. Sharma, thank you for reaching out...",
  };

  const result = validateGeminiExtraction(validPayload);
  assert.equal(result.valid, true);
  assert.equal(result.needsHumanReview, false);
  assert.equal(result.recommendedState, "pending_approval");
  assert.equal(result.extraction?.customerName, "Dr. Rajesh Sharma");
});

test("validateGeminiExtraction triggers human review on low intent score or ambiguous dates", () => {
  // Low confidence
  const lowConf = {
    customerName: "Alex",
    customerEmail: "alex@example.com",
    serviceInterest: "AI Consulting",
    intentScore: 0.55, // < 0.70 threshold
    ambiguousFields: [],
  };

  const res1 = validateGeminiExtraction(lowConf);
  assert.equal(res1.valid, true);
  assert.equal(res1.needsHumanReview, true);
  assert.match(res1.reviewReason!, /LOW_INTENT_CONFIDENCE/);
  assert.equal(res1.recommendedState, "needs_review");

  // Ambiguous fields
  const ambiguous = {
    customerName: "Priya Patel",
    customerEmail: "priya@startup.co",
    serviceInterest: "Custom Full-Stack Development",
    intentScore: 0.85,
    ambiguousFields: ["timeline", "meeting_slot"],
  };

  const res2 = validateGeminiExtraction(ambiguous);
  assert.equal(res2.valid, true);
  assert.equal(res2.needsHumanReview, true);
  assert.match(res2.reviewReason!, /AMBIGUOUS_FIELDS_DETECTED/);

  // Cleaning term inside extraction
  const cleaningExtraction = {
    customerName: "John Doe",
    customerEmail: "john@cleaning.com",
    serviceInterest: "Office deep clean estimate",
    intentScore: 0.9,
    ambiguousFields: [],
  };

  const res3 = validateGeminiExtraction(cleaningExtraction);
  assert.equal(res3.valid, false);
  assert.equal(res3.needsHumanReview, true);
  assert.match(res3.reviewReason!, /PROHIBITED_CLEANING_TEMPLATE/);
});

// ============================================================================
// 8. P1 MIME HANDLING & SANITIZATION
// ============================================================================

test("extractMessageContent prefers text/plain when present", () => {
  const content = extractMessageContent({
    textPlain: "Hello, we need an enterprise cloud consultation.",
    textHtml: "<p>HTML version with <b>formatting</b></p>",
  });

  assert.equal(content.source, "plain");
  assert.equal(content.text, "Hello, we need an enterprise cloud consultation.");
  assert.equal(content.truncated, false);
});

test("extractMessageContent sanitizes text/html fallback safely", () => {
  const htmlInput = `
    <html>
      <head><style>body { color: red; }</style></head>
      <body>
        <script>alert('xss');</script>
        <h2>Project Inquiry</h2>
        <p>We are interested in &quot;VoiceShield&quot; &amp; ABDM integration.<br/>Timeline is Q4 &nbsp; 2026.</p>
      </body>
    </html>
  `;

  const content = extractMessageContent({
    textPlain: "",
    textHtml: htmlInput,
  });

  assert.equal(content.source, "html");
  assert.ok(!content.text.includes("<script>"));
  assert.ok(!content.text.includes("<style>"));
  assert.ok(!content.text.includes("alert"));
  assert.ok(content.text.includes('We are interested in "VoiceShield" & ABDM integration.'));
  assert.ok(content.text.includes("Timeline is Q4 2026."));
});

// ============================================================================
// 9. P1 CAL.COM SIGNED WEBHOOK & BOOKING SYNCHRONIZATION
// ============================================================================

test("verifyCalComWebhookHmac validates legitimate webhook signatures and rejects tampered ones", () => {
  const secret = "test_calcom_secret_key_12345";
  const body = JSON.stringify({ triggerEvent: "BOOKING_CREATED", payload: { uid: "book_test_1" } });

  const validSig = createHmac("sha256", secret).update(Buffer.from(body, "utf8")).digest("hex");
  assert.equal(verifyCalComWebhookHmac(body, validSig, secret), true);
  assert.equal(verifyCalComWebhookHmac(body, `sha256=${validSig}`, secret), true);

  // Tampered payload
  assert.equal(verifyCalComWebhookHmac(body + "x", validSig, secret), false);

  // Wrong secret
  assert.equal(verifyCalComWebhookHmac(body, validSig, "wrong_secret"), false);

  // Missing signature
  assert.equal(verifyCalComWebhookHmac(body, null, secret), false);
});

test("processCalComBookingWebhook deduplicates bookings and sets booking status", async () => {
  const payload: CalComBookingPayload = {
    triggerEvent: "BOOKING_CREATED",
    payload: {
      uid: "uid_booking_unique_789",
      startTime: "2026-10-15T10:00:00Z",
      endTime: "2026-10-15T10:30:00Z",
      attendees: [{ email: "client@enterprise.com", name: "Client Corp" }],
    },
  };

  const res1 = await processCalComBookingWebhook(payload);
  assert.equal(res1.success, true);
  assert.equal(res1.bookingUid, "uid_booking_unique_789");
  assert.equal(res1.isDuplicate, false);
  assert.equal(res1.actionTaken, "booked");

  // Second delivery of same webhook must be identified as duplicate
  const res2 = await processCalComBookingWebhook(payload);
  assert.equal(res2.success, true);
  assert.equal(res2.isDuplicate, true);
  assert.equal(res2.actionTaken, "ignored");
});

// ============================================================================
// 10. DUAL-CONTROL OPERATOR APPROVAL CHECKS
// ============================================================================

test("canApproveEnquiry enforces dual-control policy", () => {
  const targetEnquiry = {
    threadId: "th_app_01",
    messageId: "msg_app_01",
    submittedBy: "operator@lit.in",
    status: "pending_approval" as const,
  };

  // 1. Regular user / support cannot approve
  const supportActor = { userId: "u1", email: "support@lit.in", role: "support" };
  const resSupport = canApproveEnquiry(supportActor, targetEnquiry);
  assert.equal(resSupport.allowed, false);
  assert.match(resSupport.reason!, /Insufficient permissions/);

  // 2. Submitter cannot self-approve (dual-control violation)
  const submitterActor = { userId: "u2", email: "operator@lit.in", role: "admin" };
  const resSubmitter = canApproveEnquiry(submitterActor, targetEnquiry);
  assert.equal(resSubmitter.allowed, false);
  assert.match(resSubmitter.reason!, /Dual-control violation/);

  // 3. Different admin can approve
  const otherAdmin = { userId: "u3", email: "second_admin@lit.in", role: "admin" };
  const resOtherAdmin = canApproveEnquiry(otherAdmin, targetEnquiry);
  assert.equal(resOtherAdmin.allowed, true);

  // 4. Super admin can override and self-approve
  const superAdminActor = { userId: "u4", email: "operator@lit.in", role: "super_admin" };
  const resSuper = canApproveEnquiry(superAdminActor, targetEnquiry);
  assert.equal(resSuper.allowed, true);
});

// ============================================================================
// 11. ADMIN API ROUTE CONTRACT TESTS
// ============================================================================

test("admin approve route enforces authentication, dual-control, and valid decisions", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");

  const approveRouteSrc = fs.readFileSync(
    path.join(process.cwd(), "src/app/api/admin/automation/enquiry/approve/route.ts"),
    "utf8"
  );

  // Must call requireAdminApi
  assert.ok(approveRouteSrc.includes("requireAdminApi(request)"), "must enforce requireAdminApi");

  // Must call canApproveEnquiry for dual-control
  assert.ok(approveRouteSrc.includes("canApproveEnquiry("), "must evaluate dual-control check");

  // Must reject invalid decisions
  assert.ok(approveRouteSrc.includes("approved"), "must support approved decision");
  assert.ok(approveRouteSrc.includes("declined"), "must support declined decision");
  assert.ok(approveRouteSrc.includes("needs_review"), "must support needs_review decision");

  // Must record audit to customer_enquiry_approvals
  assert.ok(
    approveRouteSrc.includes("customer_enquiry_approvals"),
    "must persist approval audit record"
  );
});

test("calcom webhook route enforces HMAC signature verification before execution", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");

  const webhookRouteSrc = fs.readFileSync(
    path.join(process.cwd(), "src/app/api/admin/automation/enquiry/webhook/calcom/route.ts"),
    "utf8"
  );

  // Must verify HMAC signature before processing
  const verifyIdx = webhookRouteSrc.indexOf("verifyCalComWebhookHmac(");
  const processIdx = webhookRouteSrc.indexOf("processCalComBookingWebhook(");

  assert.ok(verifyIdx > -1, "must call verifyCalComWebhookHmac");
  assert.ok(processIdx > -1, "must call processCalComBookingWebhook");
  assert.ok(verifyIdx < processIdx, "HMAC verification must occur before webhook processing");

  // Must return 401 on signature failure
  assert.ok(webhookRouteSrc.includes("status: 401"), "must return 401 on signature verification failure");
});

