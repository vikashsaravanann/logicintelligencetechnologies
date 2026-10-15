import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  calculateGst,
  isValidUtr,
  isValidGstin as isValidGstinUpi,
  buildUpiUri as buildUpiUriFromParams,
  getMobileIntentLinks,
  LIT_PAYEE_CONFIG,
  formatInr,
  rupeesToPaise,
  paiseToRupees,
} from "../../src/lib/payments/upi";

import {
  calculateTaxAndTotals,
  isValidGstin,
  isValidPan,
  isValidSha256,
  isTamilNaduPlaceOfSupply,
  formatPaiseToRupees,
  buildUpiUri as buildUpiUriFromPaise,
  DEFAULT_BENEFICIARY_PROFILE,
} from "../../src/lib/payments/calculations";

describe("Payment Client Portal - Unit Tests", () => {
  describe("Tax and GST Calculations", () => {
    it("calculates intra-state 9% CGST + 9% SGST for Tamil Nadu (rupees)", () => {
      const subtotal = 50000;
      const result = calculateGst(subtotal, "Tamil Nadu", 0.18);

      assert.equal(result.subtotal, 50000);
      assert.equal(result.isInterState, false);
      assert.equal(result.gstAmount, 9000);
      assert.equal(result.cgst, 4500);
      assert.equal(result.sgst, 4500);
      assert.equal(result.igst, 0);
      assert.equal(result.totalAmount, 59000);
    });

    it("calculates intra-state GST when place of supply is TN state abbreviation", () => {
      const subtotal = 100000;
      const result = calculateGst(subtotal, "TN", 0.18);

      assert.equal(result.isInterState, false);
      assert.equal(result.gstAmount, 18000);
      assert.equal(result.cgst, 9000);
      assert.equal(result.sgst, 9000);
      assert.equal(result.igst, 0);
      assert.equal(result.totalAmount, 118000);
    });

    it("calculates inter-state 18% IGST for non-TN state (rupees)", () => {
      const subtotal = 50000;
      const result = calculateGst(subtotal, "Karnataka", 0.18);

      assert.equal(result.isInterState, true);
      assert.equal(result.gstAmount, 9000);
      assert.equal(result.cgst, 0);
      assert.equal(result.sgst, 0);
      assert.equal(result.igst, 9000);
      assert.equal(result.totalAmount, 59000);
    });

    it("calculates precise paise calculations for intra-state supply with place of supply code 33", () => {
      const result = calculateTaxAndTotals({
        subtotalPaise: 5000000, // ₹50,000
        placeOfSupply: "33 - Tamil Nadu",
        taxMode: "tax_exclusive",
        gstRateBps: 1800,
      });

      assert.equal(result.isInterstate, false);
      assert.equal(result.taxableAmountPaise, 5000000);
      assert.equal(result.cgstPaise, 450000); // ₹4,500
      assert.equal(result.sgstPaise, 450000); // ₹4,500
      assert.equal(result.igstPaise, 0);
      assert.equal(result.totalTaxPaise, 900000); // ₹9,000
      assert.equal(result.totalPayablePaise, 5900000); // ₹59,000
    });

    it("calculates precise paise calculations for inter-state supply with state code 29 (Karnataka)", () => {
      const result = calculateTaxAndTotals({
        subtotalPaise: 5000000, // ₹50,000
        placeOfSupply: "29 - Karnataka",
        taxMode: "tax_exclusive",
        gstRateBps: 1800,
      });

      assert.equal(result.isInterstate, true);
      assert.equal(result.taxableAmountPaise, 5000000);
      assert.equal(result.cgstPaise, 0);
      assert.equal(result.sgstPaise, 0);
      assert.equal(result.igstPaise, 900000); // ₹9,000
      assert.equal(result.totalTaxPaise, 900000);
      assert.equal(result.totalPayablePaise, 5900000);
    });

    it("correctly back-calculates tax-inclusive pricing", () => {
      const result = calculateTaxAndTotals({
        subtotalPaise: 5900000, // ₹59,000 all-inclusive
        placeOfSupply: "33",
        taxMode: "tax_inclusive",
        gstRateBps: 1800,
      });

      assert.equal(result.totalPayablePaise, 5900000);
      assert.equal(result.taxableAmountPaise, 5000000);
      assert.equal(result.totalTaxPaise, 900000);
      assert.equal(result.cgstPaise, 450000);
      assert.equal(result.sgstPaise, 450000);
    });

    it("handles tax exempt mode cleanly", () => {
      const result = calculateTaxAndTotals({
        subtotalPaise: 5000000,
        placeOfSupply: "33",
        taxMode: "exempt",
      });

      assert.equal(result.totalTaxPaise, 0);
      assert.equal(result.cgstPaise, 0);
      assert.equal(result.sgstPaise, 0);
      assert.equal(result.igstPaise, 0);
      assert.equal(result.totalPayablePaise, 5000000);
    });

    it("identifies Tamil Nadu place of supply variants correctly", () => {
      assert.equal(isTamilNaduPlaceOfSupply("33"), true);
      assert.equal(isTamilNaduPlaceOfSupply("33 - Tamil Nadu"), true);
      assert.equal(isTamilNaduPlaceOfSupply("Tamil Nadu"), true);
      assert.equal(isTamilNaduPlaceOfSupply("tamilnadu"), true);
      assert.equal(isTamilNaduPlaceOfSupply("TN"), true);
      assert.equal(isTamilNaduPlaceOfSupply("27 - Maharashtra"), false);
      assert.equal(isTamilNaduPlaceOfSupply("07 - Delhi"), false);
      assert.equal(isTamilNaduPlaceOfSupply(null), true); // Default is TN
    });
  });

  describe("12-Digit UTR Validation", () => {
    it("accepts valid standard 12-digit numeric UPI UTRs", () => {
      assert.equal(isValidUtr("123456789012"), true);
      assert.equal(isValidUtr("428901234567"), true);
      assert.equal(isValidUtr("000012345678"), true);
    });

    it("accepts valid 10-22 character alphanumeric bank references (NEFT/IMPS)", () => {
      assert.equal(isValidUtr("CMS98234710123"), true);
      assert.equal(isValidUtr("YESB2026101400192"), true);
    });

    it("rejects invalid UTRs", () => {
      assert.equal(isValidUtr(""), false);
      assert.equal(isValidUtr("12345"), false); // Too short (<10 chars)
      assert.equal(isValidUtr("123456789"), false); // 9 chars
      assert.equal(isValidUtr("12345678901234567890123"), false); // >22 chars
      assert.equal(isValidUtr("1234567-89012"), false); // Special characters
      assert.equal(isValidUtr("UTR#12345678"), false);
      assert.equal(isValidUtr("1234 5678 9012"), false);
      assert.equal(isValidUtr("   "), false);
      assert.equal(isValidUtr(null as unknown as string), false);
      assert.equal(isValidUtr(undefined as unknown as string), false);
    });
  });

  describe("GSTIN and PAN Validation", () => {
    it("validates standard Indian GSTINs", () => {
      // Valid GSTIN format: 2 digits + 5 letters + 4 digits + 1 letter + 1 char + Z + 1 char
      const validGstinTN = "33AABCL1234A1Z5";
      const validGstinKA = "29ABCDE1234F1Z5";

      assert.equal(isValidGstin(validGstinTN), true);
      assert.equal(isValidGstin(validGstinKA), true);
      assert.equal(isValidGstinUpi(validGstinTN), true);

      // Invalid GSTINs
      assert.equal(isValidGstin("33AABCL1234A1"), false); // Too short
      assert.equal(isValidGstin("33AABCL1234A1Z599"), false); // Too long
      assert.equal(isValidGstin("INVALIDGSTIN123"), false);
      assert.equal(isValidGstin(null), false);
      assert.equal(isValidGstin(undefined), false);
    });

    it("validates standard Indian PANs", () => {
      // Valid PAN format: 5 letters + 4 digits + 1 letter
      assert.equal(isValidPan("ABCDE1234F"), true);
      assert.equal(isValidPan("AAAAA0000A"), true);

      // Invalid PANs
      assert.equal(isValidPan("ABCDE1234"), false); // 9 chars
      assert.equal(isValidPan("ABCDE12345F"), false); // 11 chars
      assert.equal(isValidPan("12345ABCDE"), false);
      assert.equal(isValidPan("abcde1234f"), false); // PAN regex checks uppercase
      assert.equal(isValidPan(null), false);
      assert.equal(isValidPan(undefined), false);
    });

    it("validates SHA-256 hash formatting", () => {
      const validSha = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      assert.equal(isValidSha256(validSha), true);
      assert.equal(isValidSha256(validSha.toUpperCase()), true); // Function trims and lowercases
      assert.equal(isValidSha256("invalidhash"), false);
      assert.equal(isValidSha256(""), false);
      assert.equal(isValidSha256(null), false);
    });
  });

  describe("Dynamic UPI URI Generation", () => {
    it("generates correct NPCI UPI URI with exact amount and parameters using upi.ts", () => {
      const uri = buildUpiUriFromParams({
        pa: LIT_PAYEE_CONFIG.upiId,
        pn: LIT_PAYEE_CONFIG.accountHolder,
        am: 59000.0,
        tr: "LIT-STAGE6-TEST123",
        tn: "Advance Milestone Deposit",
      });

      assert.ok(uri.startsWith("upi://pay?"));
      const parsed = new URL(uri);
      assert.equal(parsed.searchParams.get("pa"), "9342877474@ptyes");
      assert.equal(parsed.searchParams.get("pn"), "S VIKASH");
      assert.equal(parsed.searchParams.get("am"), "59000.00");
      assert.equal(parsed.searchParams.get("cu"), "INR");
      assert.equal(parsed.searchParams.get("tr"), "LIT-STAGE6-TEST123");
      assert.equal(parsed.searchParams.get("tn"), "Advance Milestone Deposit");
    });

    it("generates correct NPCI UPI URI using calculations.ts with paise", () => {
      const uri = buildUpiUriFromPaise({
        payeeVpa: DEFAULT_BENEFICIARY_PROFILE.upi_id,
        payeeName: DEFAULT_BENEFICIARY_PROFILE.account_holder_name,
        amountPaise: 5900000, // ₹59,000.00
        transactionRef: "LIT-STAGE11-TEST456",
        transactionNote: "Final Project Handover",
      });

      assert.ok(uri.startsWith("upi://pay?"));
      const parsed = new URL(uri);
      assert.equal(parsed.searchParams.get("pa"), "9342877474@ptyes");
      assert.equal(parsed.searchParams.get("pn"), "S VIKASH");
      assert.equal(parsed.searchParams.get("am"), "59000.00");
      assert.equal(parsed.searchParams.get("cu"), "INR");
      assert.equal(parsed.searchParams.get("tr"), "LIT-STAGE11-TEST456");
      assert.equal(parsed.searchParams.get("tn"), "Final Project Handover");
    });

    it("encodes special characters and spaces safely in transaction notes", () => {
      const uri = buildUpiUriFromParams({
        pa: "9342877474@ptyes",
        pn: "S VIKASH",
        am: 1500.5,
        tr: "LIT-REF-001",
        tn: "Invoice & Work Order #42 / 2026",
      });

      assert.ok(uri.includes("am=1500.50"));
      const parsed = new URL(uri);
      assert.equal(parsed.searchParams.get("tn"), "Invoice & Work Order #42 / 2026");
    });
  });

  describe("Mobile Deep-Link Intent Generation", () => {
    it("generates 5 intent schemes for valid UPI URI", () => {
      const upiUri = "upi://pay?pa=9342877474@ptyes&pn=S%20VIKASH&am=59000.00&cu=INR&tr=LIT-TEST";
      const links = getMobileIntentLinks(upiUri);

      assert.equal(links.length, 5);

      const gpay = links.find((l) => l.appId === "gpay");
      const phonepe = links.find((l) => l.appId === "phonepe");
      const paytm = links.find((l) => l.appId === "paytm");
      const bhim = links.find((l) => l.appId === "bhim");
      const generic = links.find((l) => l.appId === "generic");

      assert.ok(gpay?.url.startsWith("gpay://upi/pay?pa=9342877474@ptyes"));
      assert.ok(phonepe?.url.startsWith("phonepe://upi/pay?pa=9342877474@ptyes"));
      assert.ok(paytm?.url.startsWith("paytmmp://pay?pa=9342877474@ptyes"));
      assert.ok(bhim?.url.startsWith("bhim://pay?pa=9342877474@ptyes"));
      assert.equal(generic?.url, upiUri);
    });

    it("returns empty array for invalid or empty UPI URI", () => {
      assert.deepEqual(getMobileIntentLinks(""), []);
      assert.deepEqual(getMobileIntentLinks("https://example.com"), []);
      assert.deepEqual(getMobileIntentLinks("invalid-scheme"), []);
    });
  });

  describe("Currency Formatting & Helper Utilities", () => {
    it("formats Indian Rupees correctly", () => {
      assert.equal(formatInr(59000), "₹59,000.00");
      assert.equal(formatInr(0), "₹0.00");
      assert.equal(formatPaiseToRupees(5900000), "₹59,000.00");
      assert.equal(formatPaiseToRupees(150), "₹1.50");
    });

    it("converts between rupees and paise accurately", () => {
      assert.equal(rupeesToPaise(590), 59000);
      assert.equal(paiseToRupees(59000), 590);
    });

    it("maintains verified beneficiary transparency constants", () => {
      assert.equal(LIT_PAYEE_CONFIG.accountHolder, "S VIKASH");
      assert.equal(LIT_PAYEE_CONFIG.upiId, "9342877474@ptyes");
      assert.equal(LIT_PAYEE_CONFIG.brandName, "Logic Intelligence Technologies");

      assert.equal(DEFAULT_BENEFICIARY_PROFILE.account_holder_name, "S VIKASH");
      assert.equal(DEFAULT_BENEFICIARY_PROFILE.upi_id, "9342877474@ptyes");
    });
  });
});
