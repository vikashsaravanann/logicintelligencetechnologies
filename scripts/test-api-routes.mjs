import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Stub server-only for standalone Node.js test runner
try {
  const serverOnlyPath = require.resolve("server-only");
  require.cache[serverOnlyPath] = {
    id: serverOnlyPath,
    filename: serverOnlyPath,
    loaded: true,
    exports: {},
  };
} catch {
  // Ignore if not present
}

import crypto from "crypto";

async function testRoutes() {
  const { GET: getInvoicePdf } = await import("../src/app/api/documents/invoice/[invoiceId]/pdf/route.ts");
  const { GET: getReceiptPdf } = await import("../src/app/api/documents/receipt/[receiptId]/pdf/route.ts");

  console.log("--- 1. Testing Invoice Route (/api/documents/invoice/sample/pdf) ---");
  const fakeInvoiceReq = new Request("http://localhost:3000/api/documents/invoice/sample/pdf");
  const invoiceRes = await getInvoicePdf(fakeInvoiceReq, {
    params: Promise.resolve({ invoiceId: "sample" }),
  });

  console.log("Invoice Response Status:", invoiceRes.status);
  console.log("Invoice Content-Type:", invoiceRes.headers.get("content-type"));
  console.log("Invoice Content-Disposition:", invoiceRes.headers.get("content-disposition"));
  const invoiceShaHeader = invoiceRes.headers.get("x-document-sha256");
  console.log("Invoice x-document-sha256:", invoiceShaHeader);

  if (invoiceRes.status !== 200) {
    throw new Error(`Invoice route failed with status ${invoiceRes.status}`);
  }

  const invoiceArrayBuffer = await invoiceRes.arrayBuffer();
  const invoiceBuffer = Buffer.from(invoiceArrayBuffer);
  const calculatedInvoiceSha = crypto.createHash("sha256").update(invoiceBuffer).digest("hex");
  console.log("Calculated Invoice SHA-256:", calculatedInvoiceSha);
  console.log("Invoice PDF size (bytes):", invoiceBuffer.length);

  if (invoiceShaHeader !== calculatedInvoiceSha) {
    throw new Error(`Invoice SHA header mismatch! Header: ${invoiceShaHeader}, Calc: ${calculatedInvoiceSha}`);
  }
  console.log("✓ Invoice SHA-256 matches header perfectly!\n");

  console.log("--- 2. Testing Receipt Route (/api/documents/receipt/sample/pdf) ---");
  const fakeReceiptReq = new Request("http://localhost:3000/api/documents/receipt/sample/pdf");
  const receiptRes = await getReceiptPdf(fakeReceiptReq, {
    params: Promise.resolve({ receiptId: "sample" }),
  });

  console.log("Receipt Response Status:", receiptRes.status);
  console.log("Receipt Content-Type:", receiptRes.headers.get("content-type"));
  console.log("Receipt Content-Disposition:", receiptRes.headers.get("content-disposition"));
  const receiptShaHeader = receiptRes.headers.get("x-document-sha256");
  console.log("Receipt x-document-sha256:", receiptShaHeader);

  if (receiptRes.status !== 200) {
    throw new Error(`Receipt route failed with status ${receiptRes.status}`);
  }

  const receiptArrayBuffer = await receiptRes.arrayBuffer();
  const receiptBuffer = Buffer.from(receiptArrayBuffer);
  const calculatedReceiptSha = crypto.createHash("sha256").update(receiptBuffer).digest("hex");
  console.log("Calculated Receipt SHA-256:", calculatedReceiptSha);
  console.log("Receipt PDF size (bytes):", receiptBuffer.length);

  if (receiptShaHeader !== calculatedReceiptSha) {
    throw new Error(`Receipt SHA header mismatch! Header: ${receiptShaHeader}, Calc: ${calculatedReceiptSha}`);
  }
  console.log("✓ Receipt SHA-256 matches header perfectly!\n");

  console.log("--- 3. Testing 404 on non-existent document ---");
  const notFoundReq = new Request("http://localhost:3000/api/documents/invoice/non-existent-id/pdf");
  const notFoundRes = await getInvoicePdf(notFoundReq, {
    params: Promise.resolve({ invoiceId: "non-existent-id" }),
  });
  console.log("Not Found Response Status:", notFoundRes.status);
  if (notFoundRes.status !== 404) {
    throw new Error(`Expected 404, got ${notFoundRes.status}`);
  }
  console.log("✓ 404 handled gracefully!");

  console.log("\nALL API ROUTE INTEGRATION TESTS PASSED CLEANLY!");
}

testRoutes().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
