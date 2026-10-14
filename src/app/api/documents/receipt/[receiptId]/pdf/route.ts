import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isAdminClientConfigured } from "@/lib/supabase/admin";
import { DOCUMENTS_BUCKET } from "@/lib/documents/storage";
import { generatePaymentReceiptPdf, PaymentReceiptData } from "@/lib/pdf/invoice-receipt-generator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) {
    return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ receiptId: string }> }
) {
  const { receiptId } = await context.params;

  if (!receiptId || receiptId.trim().length === 0) {
    return NextResponse.json({ error: "Missing receipt identifier" }, { status: 400 });
  }

  const id = receiptId.trim();

  // Test / Sample shortcut for quick validation
  if (id === "sample" || id === "test") {
    const sampleReceipt: PaymentReceiptData = {
      receiptNumber: "LIT-REC-2026-0001",
      invoiceNumber: "LIT-INV-2026-0001",
      datePaid: formatDate(new Date()),
      placeOfSupply: "Tamil Nadu (Code 33)",
      milestoneRef: "Stage 6: Initial Project Milestone",
      client: {
        legalName: "Acme Healthcare Systems Pvt Ltd",
        attentionName: "Dr. Rajesh Sundaram, Managing Director",
        billingAddress: ["42 Cyber Tech Park, Mill Road", "Peelamedu"],
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
          unitPrice: 150000.0,
          taxRatePercent: 18,
          amount: 150000.0,
        },
      ],
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
          paymentDate: formatDate(new Date()),
          utrReference: "428910398471",
          receivingBankRef: "YES BANK / PTYES (S VIKASH)",
          amountPaid: 177000.0,
          receiptNumber: "LIT-REC-2026-0001",
        },
      ],
    };

    const res = await generatePaymentReceiptPdf(sampleReceipt);
    return new NextResponse(Buffer.from(res.bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Receipt-${sampleReceipt.receiptNumber}.pdf"`,
        "Content-Length": res.bytes.length.toString(),
        "x-document-sha256": res.sha256,
        "X-Content-Sha256": res.sha256,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }

  // 1. If DB configured, check financial_documents table for receipt
  if (isAdminClientConfigured()) {
    try {
      let query = supabaseAdmin
        .from("financial_documents")
        .select("id, document_number, title, storage_path, sha256_hash, byte_size, status, doc_type, payment_request_id")
        .eq("doc_type", "receipt");

      if (UUID_REGEX.test(id)) {
        query = query.or(`id.eq.${id},payment_request_id.eq.${id}`);
      } else {
        query = query.eq("document_number", id);
      }

      const { data: doc } = await query.maybeSingle();

      if (doc && doc.status === "issued" && doc.storage_path) {
        // Attempt to stream stored PDF
        const { data: blob, error: downloadError } = await supabaseAdmin.storage
          .from(DOCUMENTS_BUCKET)
          .download(doc.storage_path);

        if (!downloadError && blob) {
          const arrayBuffer = await blob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename="Receipt-${doc.document_number}.pdf"`,
              "Content-Length": buffer.length.toString(),
              "x-document-sha256": doc.sha256_hash,
              "X-Content-Sha256": doc.sha256_hash,
              "Cache-Control": "public, max-age=86400, s-maxage=86400",
            },
          });
        }
      }
    } catch (e) {
      console.warn("[receipt-pdf] Error querying financial_documents:", e);
    }

    // 2. Query engagement_payment_requests + reconciliations / attempts
    try {
      let reqQuery = supabaseAdmin
        .from("engagement_payment_requests")
        .select("*");

      if (UUID_REGEX.test(id)) {
        reqQuery = reqQuery.or(`id.eq.${id},receipt_id.eq.${id}`);
      } else {
        reqQuery = reqQuery.eq("secure_token", id);
      }

      const { data: paymentReq } = await reqQuery.maybeSingle();

      if (paymentReq) {
        // Fetch billing submission
        const { data: billing } = await supabaseAdmin
          .from("payment_billing_submissions")
          .select("*")
          .eq("payment_request_id", paymentReq.id)
          .maybeSingle();

        // Fetch reconciliation record
        const { data: reconciliation } = await supabaseAdmin
          .from("payment_reconciliations")
          .select("*")
          .eq("payment_request_id", paymentReq.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Fetch payment attempt
        const { data: attempt } = await supabaseAdmin
          .from("payment_attempts")
          .select("*")
          .eq("payment_request_id", paymentReq.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const subtotalINR = Number(paymentReq.subtotal_paise || paymentReq.total_payable_paise || 0) / 100;
        const totalINR = Number(paymentReq.total_payable_paise || 0) / 100;
        const cgstINR = Number(paymentReq.cgst_paise || 0) / 100;
        const sgstINR = Number(paymentReq.sgst_paise || 0) / 100;
        const igstINR = Number(paymentReq.igst_paise || 0) / 100;
        const taxRate = paymentReq.gst_rate_bps ? paymentReq.gst_rate_bps / 100 : 18;
        const isInterstate = Boolean(paymentReq.is_interstate);

        const year = new Date(paymentReq.created_at || Date.now()).getFullYear();
        const docReceiptNum = `LIT-REC-${year}-${paymentReq.id.slice(0, 8).toUpperCase()}`;
        const docInvoiceNum = `LIT-INV-${year}-${paymentReq.id.slice(0, 8).toUpperCase()}`;

        const utrRef = attempt?.utr_number || reconciliation?.bank_credit_reference || "Verified Bank Credit";
        const receivingBank = reconciliation?.receiving_bank_account || "YES BANK / PTYES";
        const paidDate = formatDate(reconciliation?.credited_at || attempt?.created_at || paymentReq.updated_at);

        const receiptData: PaymentReceiptData = {
          receiptNumber: docReceiptNum,
          invoiceNumber: docInvoiceNum,
          datePaid: paidDate,
          placeOfSupply: billing?.place_of_supply || (isInterstate ? "Inter-State Supply" : "Tamil Nadu (Code 33)"),
          milestoneRef: paymentReq.milestone_title || `Stage ${paymentReq.stage_number || paymentReq.milestone_index || 6} Payment`,
          client: {
            legalName: billing?.legal_name || billing?.company_name || billing?.contact_name || "Client",
            attentionName: billing?.contact_name !== billing?.legal_name ? billing?.contact_name : undefined,
            billingAddress: billing
              ? [billing.address_line1, billing.address_line2].filter(Boolean)
              : "Client Billing Address",
            cityStatePin: billing ? `${billing.city}, ${billing.state} ${billing.postal_code}, ${billing.country}` : undefined,
            email: billing?.email || "",
            phone: billing?.phone || undefined,
            gstin: billing?.client_gstin || billing?.gstin || undefined,
          },
          items: [
            {
              description: paymentReq.milestone_title || "Enterprise Architecture & Discovery Milestone",
              subDescription: `Stage ${paymentReq.stage_number || 6} Payment · Project Milestone Services`,
              quantity: 1,
              unitPrice: subtotalINR,
              taxRatePercent: taxRate,
              amount: subtotalINR,
            },
          ],
          taxType: isInterstate ? "INTER_STATE" : "INTRA_STATE",
          subtotal: subtotalINR,
          cgstAmount: cgstINR,
          sgstAmount: sgstINR,
          igstAmount: igstINR,
          totalTaxAmount: cgstINR + sgstINR + igstINR,
          totalAmount: totalINR,
          amountPaid: totalINR,
          paymentHistory: [
            {
              paymentMethod: "UPI Transfer",
              paymentDate: paidDate,
              utrReference: utrRef,
              receivingBankRef: receivingBank,
              amountPaid: totalINR,
              receiptNumber: docReceiptNum,
            },
          ],
        };

        const res = await generatePaymentReceiptPdf(receiptData);
        return new NextResponse(Buffer.from(res.bytes), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="Receipt-${docReceiptNum}.pdf"`,
            "Content-Length": res.bytes.length.toString(),
            "x-document-sha256": res.sha256,
            "X-Content-Sha256": res.sha256,
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      }
    } catch (e) {
      console.warn("[receipt-pdf] Error querying payment records:", e);
    }
  }

  return NextResponse.json(
    { error: "Payment receipt not found for identifier: " + id },
    { status: 404 }
  );
}
