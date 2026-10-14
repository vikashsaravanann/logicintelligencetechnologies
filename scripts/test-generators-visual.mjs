import { generateTaxInvoicePdf, generatePaymentReceiptPdf, formatINR, numberToIndianRupeesWords } from "../src/lib/pdf/invoice-receipt-generator.js";
import fs from "fs";
import { execSync } from "child_process";

async function run() {
  console.log("Testing Tax Invoice Generation...");
  const sampleInvoiceData = {
    invoiceNumber: "LIT-INV-2026-0001",
    dateIssued: "October 14, 2026",
    dueDate: "October 21, 2026",
    placeOfSupply: "Tamil Nadu (Code 33)",
    milestoneRef: "Stage 6: Initial Project Milestone",
    client: {
      legalName: "Acme Healthcare Systems Pvt Ltd",
      attentionName: "Dr. Rajesh Sundaram, Managing Director",
      billingAddress: [
        "42 Cyber Tech Park, Mill Road",
        "Peelamedu",
      ],
      cityStatePin: "Coimbatore, Tamil Nadu 641004, India",
      email: "accounts@acmehealthcare.com",
      phone: "+91 98421 55678",
      gstin: "33AABCA1234F1Z8",
    },
    items: [
      {
        description: "Enterprise Architecture & Discovery Milestone (50-Point Scope)",
        subDescription: "Stage 6 Initial Payment · Core Cloud Infrastructure, Security Posture & Architecture",
        quantity: 1,
        unitPrice: 150000.00,
        taxRatePercent: 18,
        amount: 150000.00,
      },
    ],
    taxType: "INTRA_STATE",
    subtotal: 150000.00,
    cgstAmount: 13500.00,
    sgstAmount: 13500.00,
    totalTaxAmount: 27000.00,
    totalPayable: 177000.00,
    status: "pending",
    amountDue: 177000.00,
  };

  const invoiceResult = await generateTaxInvoicePdf(sampleInvoiceData);
  fs.writeFileSync("/tmp/lit_sample_invoice.pdf", invoiceResult.bytes);
  console.log("Invoice Generated successfully!");
  console.log("  Page count:", invoiceResult.pageCount);
  console.log("  Bytes size:", invoiceResult.bytes.length);
  console.log("  SHA-256:", invoiceResult.sha256);

  console.log("\nTesting Payment Receipt Generation...");
  const sampleReceiptData = {
    receiptNumber: "LIT-REC-2026-0001",
    invoiceNumber: "LIT-INV-2026-0001",
    datePaid: "October 14, 2026",
    placeOfSupply: "Tamil Nadu (Code 33)",
    milestoneRef: "Stage 6: Initial Project Milestone",
    client: {
      legalName: "Acme Healthcare Systems Pvt Ltd",
      attentionName: "Dr. Rajesh Sundaram, Managing Director",
      billingAddress: [
        "42 Cyber Tech Park, Mill Road",
        "Peelamedu",
      ],
      cityStatePin: "Coimbatore, Tamil Nadu 641004, India",
      email: "accounts@acmehealthcare.com",
      phone: "+91 98421 55678",
      gstin: "33AABCA1234F1Z8",
    },
    items: [
      {
        description: "Enterprise Architecture & Discovery Milestone (50-Point Scope)",
        subDescription: "Stage 6 Initial Payment · Core Cloud Infrastructure, Security Posture & Architecture",
        quantity: 1,
        unitPrice: 150000.00,
        taxRatePercent: 18,
        amount: 150000.00,
      },
    ],
    taxType: "INTRA_STATE",
    subtotal: 150000.00,
    cgstAmount: 13500.00,
    sgstAmount: 13500.00,
    totalTaxAmount: 27000.00,
    totalAmount: 177000.00,
    amountPaid: 177000.00,
    remainingBalance: 0.00,
    paymentHistory: [
      {
        paymentMethod: "UPI Manual Transfer",
        paymentDate: "October 14, 2026",
        utrReference: "428910398471",
        receivingBankRef: "YES BANK / PTYES (9342877474@ptyes · S VIKASH)",
        amountPaid: 177000.00,
        receiptNumber: "LIT-REC-2026-0001",
      },
    ],
  };

  const receiptResult = await generatePaymentReceiptPdf(sampleReceiptData);
  fs.writeFileSync("/tmp/lit_sample_receipt.pdf", receiptResult.bytes);
  console.log("Receipt Generated successfully!");
  console.log("  Page count:", receiptResult.pageCount);
  console.log("  Bytes size:", receiptResult.bytes.length);
  console.log("  SHA-256:", receiptResult.sha256);
}

run().catch(console.error);
