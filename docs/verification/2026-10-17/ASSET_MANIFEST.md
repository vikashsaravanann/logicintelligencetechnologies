# Asset Manifest & Visual Document Verification

**Date:** 2026-10-17  
**Platform:** Logic Intelligence Technologies Corporate Platform  

---

## 1. Static Asset Validation (C01)

| Asset File | Expected Spec | Verification Command | Verified Attributes | Status |
| :--- | :--- | :--- | :--- | :--- |
| `public/assets/og-banner.jpg` | Genuine baseline JPEG, 2400x1260, JFIF 1.01 | `file public/assets/og-banner.jpg` | `JPEG image data, JFIF standard 1.01, aspect ratio, density 72x72, segment length 16, Exif Standard: [TIFF image data, big-endian, direntries=1], baseline, precision 8, 2400x1260, components 3` | Verified |
| `public/assets/lit-logo.png` | Centered corporate badge, RGBA | Visual build & asset check | 320x320 PNG badge, transparent alpha | Verified |
| `public/favicon.ico` | Multi-resolution icon | File inspection | Standard Windows ICO format | Verified |

---

## 2. Dynamic PDF & Document Template Registry

All 7 corporate document generators comply with Truthful Auto-Population, MSME Udyam credentials, and strict PDF metadata embedding:

1. **Enterprise Tax Invoice (`TaxInvoiceData`):**
   - Generator: `src/lib/pdf/invoice-receipt-generator.ts` (`generateTaxInvoicePdf`)
   - Route: `/api/documents/invoice/[invoiceId]/pdf`
   - Attributes: Formal GST breakdown (9% CGST + 9% SGST intra-state or 18% IGST inter-state), place of supply codes, reverse-charge indicator, verified MSME Udyam details.

2. **Official Payment Receipt (`PaymentReceiptData`):**
   - Generator: `src/lib/pdf/invoice-receipt-generator.ts` (`generatePaymentReceiptPdf`)
   - Route: `/api/documents/receipt/[receiptId]/pdf`
   - Attributes: Verified 12-digit UTR/IMPS reference, date received, payment mode, zero amount due certificate.

3. **Digital Enterprise Quotation (`QuotationPdfData`):**
   - Generator: `src/lib/pdf/quotation-generator.ts`
   - Route: `/api/documents/quotation/[token]/pdf`
   - Attributes: Scope items, 50/50 payment milestone schedule, 30-day validity window, legal signatory line.

4. **Architecture Scope & Deliverables Blueprint:**
   - Generator: `src/lib/pdf/generator.ts`
   - Attributes: Technical work packages, delivery schedule, security containment specifications.

5. **Security & RLS Architecture Ledger:**
   - Generator: `src/lib/pdf/generator.ts`
   - Attributes: Capability matrices, audit trail specifications, encryption guarantees.

6. **MSME Registration & Corporate Profile:**
   - Attributes: Entity registration details, registered office address in Coimbatore, Tamil Nadu, India.

7. **Client Acceptance & Signoff Certificate:**
   - Generator: `src/lib/quotations/service.ts`
   - Attributes: Timestamped digital legal acceptance record with client IP and signatory name.
