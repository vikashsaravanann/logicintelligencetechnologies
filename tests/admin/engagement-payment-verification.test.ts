// Stub server-only for standalone Node.js test runner
require.cache[require.resolve("server-only")] = {
  id: require.resolve("server-only"),
  filename: require.resolve("server-only"),
  loaded: true,
  exports: {},
} as unknown as NodeJS.Module;

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { COMPANY } from "../../src/config/company";
import { generatePortalEmailCopyText, generatePortalWhatsAppText } from "../../src/lib/engagements/share";
import {
  generateTaxInvoicePdf,
  generatePaymentReceiptPdf,
  LIT_CREDENTIALS,
  TaxInvoiceData,
  PaymentReceiptData,
  computeSha256,
} from "../../src/lib/pdf/invoice-receipt-generator";
import {
  isValidUtr,
  buildUpiUri,
  LIT_PAYEE_CONFIG,
} from "../../src/lib/payments/upi";

// Require after server-only stub is loaded
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  submitStageAction,
  reconcileEngagementStagePayment,
} = require("../../src/lib/engagements/db");

describe("Admin & Payment Workflows Verification", () => {
  describe("1. Corporate Identity & Payment Credentials Verification", () => {
    it("ensures MSME Udyam registration matches UDYAM-TN-03-0345274 across all sources", () => {
      assert.equal(COMPANY.registration.msmeUdyamNumber, "UDYAM-TN-03-0345274");
      assert.equal(LIT_CREDENTIALS.msmeUdyamNumber, "UDYAM-TN-03-0345274");
      assert.equal(COMPANY.registration.enterpriseName, "LOGIC INTELLIGENCE TECHNOLOGIES");
    });

    it("ensures Beneficiary account holder matches S VIKASH and UPI ID 9342877474@ptyes", () => {
      assert.equal(COMPANY.beneficiary.accountHolder, "S VIKASH");
      assert.equal(COMPANY.beneficiary.upiId, "9342877474@ptyes");
      assert.equal(LIT_PAYEE_CONFIG.accountHolder, "S VIKASH");
      assert.equal(LIT_PAYEE_CONFIG.upiId, "9342877474@ptyes");
      assert.ok(COMPANY.beneficiary.bankName.includes("YES BANK"));
    });

    it("ensures SAC code for IT & Software Services is 998315", () => {
      assert.equal(LIT_CREDENTIALS.sacCode, "998315");
      assert.equal(LIT_CREDENTIALS.sacDescription, "Information Technology & Software Services");
    });
  });

  describe("2. Engagement Creation & Share Template Dispatch", () => {
    const mockEngagement = {
      engagement_ref: "LIT-ENG-2026-TEST",
      company_name: "Apex Healthcare Systems Ltd",
      contact_name: "Dr. Rajesh Sundaram",
      project_title: "AI Diagnostic Clinical Engine",
    };

    it("generates 1-click email draft containing portal link, MSME number, and bank details", () => {
      const emailText = generatePortalEmailCopyText(mockEngagement);

      assert.ok(emailText.includes("LIT-ENG-2026-TEST"), "Must include engagement reference");
      assert.ok(emailText.includes("Apex Healthcare Systems Ltd"), "Must include client company name");
      assert.ok(emailText.includes("Dr. Rajesh Sundaram"), "Must include client contact name");
      assert.ok(emailText.includes("/engagement/LIT-ENG-2026-TEST"), "Must include portal URL");
      assert.ok(emailText.includes("UDYAM-TN-03-0345274"), "Must include official MSME number");
      assert.ok(emailText.includes("9342877474@ptyes"), "Must include verified UPI ID");
      assert.ok(emailText.includes("S VIKASH"), "Must include beneficiary name");
      assert.ok(emailText.includes("13-stage engineering governance process"), "Must outline 13-stage governance");
      assert.ok(emailText.includes("Zero third-party payment gateways"), "Must state zero 3rd-party gateway policy");
    });

    it("generates formatted WhatsApp text with quick portal link and reference code", () => {
      const waText = generatePortalWhatsAppText(mockEngagement);

      assert.ok(waText.includes("Hello Dr. Rajesh Sundaram"), "Must greet contact by name");
      assert.ok(waText.includes("Apex Healthcare Systems Ltd"), "Must state company name");
      assert.ok(waText.includes("/engagement/LIT-ENG-2026-TEST"), "Must include portal link");
      assert.ok(waText.includes("Ref: LIT-ENG-2026-TEST"), "Must include reference code");
    });
  });

  describe("3. Stage Status Transitions & Bank Reconciliation Invariants", () => {
    it("enforces prerequisite gate preventing client actions on locked stages without prerequisite completion", async () => {
      // Invariant: initial-invoice has prerequisite SOW (Stage 4).
      // Since SOW is locked in initial state, client cannot bypass to submit UTR.
      const lockedResult = await submitStageAction({
        engagementRef: "ENG-2026-LIT-SAMPLE",
        stageKey: "initial-invoice",
        action: "report_utr",
        payload: { utr: "428910398471" },
        actorRole: "client",
      });

      assert.equal(lockedResult.success, false, "Must fail closed on locked prerequisite");
      assert.ok(lockedResult.error?.includes("Prerequisite stage"), "Error must mention prerequisite requirement");
    });

    it("allows client submission on currently available stage (Stage 1: Checklist)", async () => {
      const result = await submitStageAction({
        engagementRef: "ENG-2026-LIT-SAMPLE",
        stageKey: "checklist",
        action: "submit_checklist",
        payload: {
          checklist_version: "2.4",
          total_checked: 48,
        },
        actorRole: "client",
      });

      assert.ok(result.success, "Available stage submission should succeed");
      assert.equal(result.status, "submitted");
      assert.equal(result.nextUnlockedStageKey, "discovery");
      assert.ok(result.auditHash && result.auditHash.length === 64, "Must compute valid 64-char SHA256 audit hash");
    });

    it("allows Super Admin to override stage status and unlock downstream stages", async () => {
      const result = await submitStageAction({
        engagementRef: "ENG-2026-LIT-SAMPLE",
        stageKey: "sow",
        action: "admin_override_status",
        payload: {
          status: "signed",
          reason: "Manual countersignature executed off-platform",
          unlockNext: true,
        },
        actorRole: "admin",
      });

      assert.ok(result.success, "Admin override should succeed");
      assert.equal(result.status, "signed", "Stage status must reflect override");
      assert.equal(result.nextUnlockedStageKey, "initial-invoice", "Override unlocks initial-invoice");
    });

    it("rejects bank reconciliation requests on non-payment stages", async () => {
      const invalidStage = "checklist" as unknown as "initial-invoice";
      const result = await reconcileEngagementStagePayment({
        engagementRef: "ENG-2026-LIT-SAMPLE",
        stageKey: invalidStage,
        transactionRef: "BANK-TEST-123",
      });

      assert.equal(result.success, false, "Must reject reconciliation on non-payment stage");
      assert.ok(result.error?.includes("Bank reconciliation is only supported on payment stages"));
    });

    it("verifies bank reconciliation unlocks Stage 7 (onboarding) for initial-invoice", async () => {
      const initRec = await reconcileEngagementStagePayment({
        engagementRef: "ENG-2026-LIT-SAMPLE",
        stageKey: "initial-invoice",
        transactionRef: "BANK-REC-INIT-999",
        verifiedAmount: "₹10,62,000.00",
        actorName: "Vikash Saravanan",
      });

      assert.ok(initRec.success, "Reconciliation must succeed for initial-invoice");
      assert.equal(initRec.stage?.status, "verified", "Reconciled stage must be verified");
      assert.equal(initRec.nextStage?.stage_key, "onboarding", "Target downstream stage must be onboarding");
      assert.equal(initRec.nextStage?.status, "available", "Downstream stage must transition to available");
    });

    it("verifies bank reconciliation unlocks Stage 12 (handover) for final-payment", async () => {
      const finalRec = await reconcileEngagementStagePayment({
        engagementRef: "ENG-2026-LIT-SAMPLE",
        stageKey: "final-payment",
        transactionRef: "BANK-REC-FINAL-888",
        verifiedAmount: "₹10,62,000.00",
        actorName: "Vikash Saravanan",
      });

      assert.ok(finalRec.success, "Reconciliation must succeed for final-payment");
      assert.equal(finalRec.stage?.status, "verified", "Reconciled stage must be verified");
      assert.equal(finalRec.nextStage?.stage_key, "handover", "Target downstream stage must be handover");
      assert.equal(finalRec.nextStage?.status, "available", "Downstream stage must transition to available");
    });
  });

  describe("4. UPI & UTR Invariants", () => {
    it("validates 12-digit UTR references correctly", () => {
      assert.equal(isValidUtr("428910398471"), true, "Valid 12-digit numeric UTR");
      assert.equal(isValidUtr("SBIN20261014"), true, "Valid 12-char alphanumeric UTR");
      assert.equal(isValidUtr("12345"), false, "Too short UTR rejected");
      assert.equal(isValidUtr("4289 1039 8471"), false, "UTR with spaces rejected");
      assert.equal(isValidUtr(""), false, "Empty UTR rejected");
    });

    it("constructs valid UPI URI targeting official LIT beneficiary", () => {
      const upiUri = buildUpiUri({
        pa: LIT_PAYEE_CONFIG.upiId,
        pn: LIT_PAYEE_CONFIG.accountHolder,
        am: 177000.0,
        tr: "LIT-INV-2026-0001",
        tn: "Initial Milestone Payment",
      });

      assert.ok(upiUri.startsWith("upi://pay?"), "URI must begin with upi://pay?");
      assert.ok(upiUri.includes("pa=9342877474%40ptyes") || upiUri.includes("pa=9342877474@ptyes"), "Must contain payee VPA");
      assert.ok(upiUri.includes("pn=S%20VIKASH") || upiUri.includes("pn=S+VIKASH"), "Must contain payee name");
      assert.ok(upiUri.includes("am=177000.00"), "Must contain formatted 2-decimal amount");
      assert.ok(upiUri.includes("cu=INR"), "Must specify currency INR");
    });
  });

  describe("5. Dual-Document PDF Generation (Tax Invoice & Payment Receipt)", () => {
    const sampleClient = {
      legalName: "Acme Healthcare Systems Pvt Ltd",
      attentionName: "Dr. Rajesh Sundaram, Managing Director",
      billingAddress: ["42 Cyber Tech Park, Mill Road", "Peelamedu"],
      cityStatePin: "Coimbatore, Tamil Nadu 641004, India",
      email: "accounts@acmehealthcare.com",
      phone: "+91 98421 55678",
      gstin: "33AABCA1234F1Z8",
    };

    const sampleItem = {
      description: "Enterprise Architecture & Discovery Milestone (50-Point Scope)",
      subDescription: "Stage 6 Initial Payment · Core Cloud Infrastructure, Security Posture & Architecture",
      quantity: 1,
      unitPrice: 150000.0,
      taxRatePercent: 18,
      amount: 150000.0,
    };

    it("generates cryptographically verified Tax Invoice PDF", async () => {
      const invoiceData: TaxInvoiceData = {
        invoiceNumber: "LIT-INV-2026-UNIT",
        dateIssued: "October 15, 2026",
        dueDate: "October 22, 2026",
        placeOfSupply: "Tamil Nadu (Code 33)",
        milestoneRef: "Stage 6: Initial Project Milestone",
        client: sampleClient,
        items: [sampleItem],
        taxType: "INTRA_STATE",
        subtotal: 150000.0,
        cgstAmount: 13500.0,
        sgstAmount: 13500.0,
        totalTaxAmount: 27000.0,
        totalPayable: 177000.0,
        status: "pending",
        amountDue: 177000.0,
      };

      const result = await generateTaxInvoicePdf(invoiceData);

      assert.ok(result.buffer instanceof Buffer, "Must produce a Node.js Buffer");
      assert.ok(result.bytes instanceof Uint8Array, "Must produce a Uint8Array");
      assert.ok(result.bytes.length > 1000, "PDF must have non-trivial size");
      assert.equal(result.pageCount, 1, "A4 Tax invoice should be 1 page");

      // Verify PDF magic bytes '%PDF-'
      const magic = result.buffer.toString("utf8", 0, 5);
      assert.equal(magic, "%PDF-", "Generated file must start with %PDF- header");

      // Verify SHA-256 hash integrity
      const expectedHash = computeSha256(result.bytes);
      assert.equal(result.sha256, expectedHash, "Result SHA256 must match computed digest");
    });

    it("generates cryptographically verified Payment Receipt PDF", async () => {
      const receiptData: PaymentReceiptData = {
        receiptNumber: "LIT-REC-2026-UNIT",
        invoiceNumber: "LIT-INV-2026-UNIT",
        datePaid: "October 15, 2026",
        placeOfSupply: "Tamil Nadu (Code 33)",
        milestoneRef: "Stage 6: Initial Project Milestone",
        client: sampleClient,
        items: [sampleItem],
        taxType: "INTRA_STATE",
        subtotal: 150000.0,
        cgstAmount: 13500.0,
        sgstAmount: 13500.0,
        totalTaxAmount: 27000.0,
        totalAmount: 177000.0,
        amountPaid: 177000.0,
        paymentHistory: [
          {
            paymentMethod: "UPI Manual Transfer",
            paymentDate: "October 15, 2026",
            utrReference: "428910398471",
            receivingBankRef: "YES BANK / PTYES (S VIKASH)",
            amountPaid: 177000.0,
            receiptNumber: "LIT-REC-2026-UNIT",
          },
        ],
      };

      const result = await generatePaymentReceiptPdf(receiptData);

      assert.ok(result.buffer instanceof Buffer, "Must produce a Node.js Buffer");
      assert.ok(result.bytes instanceof Uint8Array, "Must produce a Uint8Array");
      assert.ok(result.bytes.length > 1000, "PDF must have non-trivial size");
      assert.equal(result.pageCount, 1, "Payment receipt should be 1 page");

      // Verify PDF magic bytes '%PDF-'
      const magic = result.buffer.toString("utf8", 0, 5);
      assert.equal(magic, "%PDF-", "Generated file must start with %PDF- header");

      // Verify SHA-256 hash integrity
      const expectedHash = computeSha256(result.bytes);
      assert.equal(result.sha256, expectedHash, "Result SHA256 must match computed digest");
    });
  });
});
