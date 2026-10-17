import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { supabaseAdmin, isAdminClientConfigured } from "@/lib/supabase/admin";
import { DOCUMENTS_BUCKET } from "@/lib/documents/storage";
import { generateTaxInvoicePdf, TaxInvoiceData } from "@/lib/pdf/invoice-receipt-generator";

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
  request: NextRequest,
  context: { params: Promise<{ invoiceId: string }> }
) {
  const { invoiceId } = await context.params;
  const isInline = request.nextUrl.searchParams.get("inline") === "true";
  const disposition = isInline ? "inline" : "attachment";

  if (!invoiceId || invoiceId.trim().length === 0) {
    return NextResponse.json({ error: "Missing invoice identifier" }, { status: 400 });
  }

  const id = invoiceId.trim();

  // 1. Enforce authenticated session (fail closed, no sample bypasses)
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient(
    { cookies: () => cookieStore as any },
    { supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json(
      { error: "Authentication required to view tax invoice" },
      { status: 401 }
    );
  }

  // 2. Fetch caller role for authorization
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isStaffAdmin = profile && (profile.role === "super_admin" || profile.role === "admin");
  const userEmail = user.email?.toLowerCase();

  // 3. If Supabase Admin is configured, check financial_documents table
  if (isAdminClientConfigured()) {
    try {
      let query = supabaseAdmin
        .from("financial_documents")
        .select("id, document_number, title, storage_path, sha256_hash, byte_size, status, doc_type, payment_request_id, client_id")
        .eq("doc_type", "invoice");

      if (UUID_REGEX.test(id)) {
        query = query.or(`id.eq.${id},payment_request_id.eq.${id}`);
      } else {
        query = query.eq("document_number", id);
      }

      const { data: doc } = await query.maybeSingle();

      if (doc && doc.status === "issued" && doc.storage_path) {
        // Enforce ownership if not staff admin
        if (!isStaffAdmin && doc.client_id !== user.id) {
          let hasPrAccess = false;
          if (doc.payment_request_id) {
            const { data: pr } = await supabaseAdmin
              .from("engagement_payment_requests")
              .select("client_id")
              .eq("id", doc.payment_request_id)
              .maybeSingle();
            if (pr && pr.client_id === user.id) {
              hasPrAccess = true;
            }
          }
          if (!hasPrAccess) {
            return NextResponse.json(
              { error: "Forbidden: You do not have permission to view this invoice" },
              { status: 403 }
            );
          }
        }

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
              "Content-Disposition": `${disposition}; filename="Invoice-${doc.document_number}.pdf"`,
              "Content-Length": buffer.length.toString(),
              "x-document-sha256": doc.sha256_hash,
              "X-Content-Sha256": doc.sha256_hash,
              "Cache-Control": "private, no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
            },
          });
        }
      }
    } catch (e) {
      console.warn("[invoice-pdf] Error querying financial_documents:", e);
    }

    // 4. Query engagement_payment_requests
    try {
      let reqQuery = supabaseAdmin
        .from("engagement_payment_requests")
        .select("*");

      if (UUID_REGEX.test(id)) {
        reqQuery = reqQuery.eq("id", id);
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

        // Enforce ownership if not staff admin
        if (!isStaffAdmin) {
          const isReqClient = paymentReq.client_id === user.id;
          const isBillingEmail = billing?.email && userEmail && billing.email.toLowerCase() === userEmail;
          if (!isReqClient && !isBillingEmail) {
            return NextResponse.json(
              { error: "Forbidden: You do not have permission to view this invoice" },
              { status: 403 }
            );
          }
        }

        // Build invoice data
        const subtotalINR = Number(paymentReq.subtotal_paise || paymentReq.total_payable_paise || 0) / 100;
        const totalINR = Number(paymentReq.total_payable_paise || 0) / 100;
        const cgstINR = Number(paymentReq.cgst_paise || 0) / 100;
        const sgstINR = Number(paymentReq.sgst_paise || 0) / 100;
        const igstINR = Number(paymentReq.igst_paise || 0) / 100;
        const taxRate = paymentReq.gst_rate_bps ? paymentReq.gst_rate_bps / 100 : 18;
        const isInterstate = Boolean(paymentReq.is_interstate);
        const isApproved = paymentReq.status === "approved";

        const docNum = `LIT-INV-${new Date(paymentReq.created_at || Date.now()).getFullYear()}-${paymentReq.id.slice(0, 8).toUpperCase()}`;

        const invoiceData: TaxInvoiceData = {
          invoiceNumber: docNum,
          dateIssued: formatDate(paymentReq.created_at),
          dueDate: formatDate(paymentReq.expires_at),
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
          totalPayable: totalINR,
          status: isApproved ? "paid" : "pending",
          amountDue: isApproved ? 0 : totalINR,
        };

        const res = await generateTaxInvoicePdf(invoiceData);
        return new NextResponse(Buffer.from(res.bytes), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="Invoice-${docNum}.pdf"`,
            "Content-Length": res.bytes.length.toString(),
            "x-document-sha256": res.sha256,
            "X-Content-Sha256": res.sha256,
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
          },
        });
      }
    } catch (e) {
      console.warn("[invoice-pdf] Error querying engagement_payment_requests:", e);
    }

    // 5. Check legacy invoices table
    try {
      let legacyQuery = supabaseAdmin.from("invoices").select("*");
      if (UUID_REGEX.test(id)) {
        legacyQuery = legacyQuery.eq("id", id);
      } else {
        legacyQuery = legacyQuery.eq("invoice_code", id);
      }

      const { data: legacyInv } = await legacyQuery.maybeSingle();

      if (legacyInv) {
        if (!isStaffAdmin && legacyInv.user_id !== user.id && legacyInv.client_id !== user.id) {
          return NextResponse.json(
            { error: "Forbidden: You do not have permission to view this invoice" },
            { status: 403 }
          );
        }

        const invAmount = Number(legacyInv.amount || 0);
        const subtotal = Number((invAmount / 1.18).toFixed(2));
        const taxTotal = Number((invAmount - subtotal).toFixed(2));
        const halfTax = Number((taxTotal / 2).toFixed(2));
        const docNum = legacyInv.invoice_code || `LIT-INV-${legacyInv.id.slice(0, 8).toUpperCase()}`;

        const invoiceData: TaxInvoiceData = {
          invoiceNumber: docNum,
          dateIssued: formatDate(legacyInv.created_at),
          dueDate: formatDate(legacyInv.due_date),
          placeOfSupply: "Tamil Nadu (Code 33)",
          milestoneRef: "Information Technology & Software Services",
          client: {
            legalName: legacyInv.client_name || "Client",
            billingAddress: "Registered Office Address",
            email: "",
          },
          items: [
            {
              description: "Professional IT & Cloud Infrastructure Services",
              quantity: 1,
              unitPrice: subtotal,
              taxRatePercent: 18,
              amount: subtotal,
            },
          ],
          taxType: "INTRA_STATE",
          subtotal: subtotal,
          cgstAmount: halfTax,
          sgstAmount: Number((taxTotal - halfTax).toFixed(2)),
          totalTaxAmount: taxTotal,
          totalPayable: invAmount,
          status: legacyInv.status?.toLowerCase() === "paid" ? "paid" : "pending",
          amountDue: legacyInv.status?.toLowerCase() === "paid" ? 0 : invAmount,
        };

        const res = await generateTaxInvoicePdf(invoiceData);
        return new NextResponse(Buffer.from(res.bytes), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `${disposition}; filename="Invoice-${docNum}.pdf"`,
            "Content-Length": res.bytes.length.toString(),
            "x-document-sha256": res.sha256,
            "X-Content-Sha256": res.sha256,
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
          },
        });
      }
    } catch (e) {
      console.warn("[invoice-pdf] Error querying legacy invoices:", e);
    }
  }

  return NextResponse.json(
    { error: "Invoice not found for identifier: " + id },
    { status: 404 }
  );
}
