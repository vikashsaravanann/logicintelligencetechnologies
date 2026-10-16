"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityAction } from "@/lib/auth/session";
import { recordAdminAction } from "@/lib/admin/audit";
import { DOCUMENTS_BUCKET } from "@/lib/documents/storage";
import {
  generateTaxInvoicePdf,
  generatePaymentReceiptPdf,
  formatINR,
  type TaxInvoiceData,
  type PaymentReceiptData,
} from "@/lib/pdf/invoice-receipt-generator";
import React from "react";
import { sendEmail } from "@/lib/email/send-email";
import PaymentVerifiedDualDocumentEmail from "@/emails/payment-verified-dual-document-email";
import { calculateEngagementFinancials } from "@/lib/engagements/financials";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ApprovePaymentResult {
  success: boolean;
  invoiceNumber?: string;
  receiptNumber?: string;
  invoiceDownloadUrl?: string;
  receiptDownloadUrl?: string;
  error?: string;
}

/**
 * Super Admin Payment Reconciliation & Approval Action.
 * 
 * 1. Checks `payment.verify` capability.
 * 2. Invokes atomic database RPC `reconcile_and_approve_payment`.
 * 3. Synthesizes official PDF Tax Invoice and Payment Receipt.
 * 4. Archives documents into private immutable storage vault.
 * 5. Registers financial document ledger records.
 * 6. Dispatches Dual-Document Verification Email to client.
 * 7. Records tamper-evident entry in `admin_audit_log`.
 */
export async function approveAndIssueDocumentsAction(
  formData: FormData
): Promise<ApprovePaymentResult> {
  const session = await requireCapabilityAction("payment.verify", "payment.reconcile_and_approve");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const paymentRequestId = String(formData.get("paymentRequestId") ?? "").trim();
  const paymentAttemptId = String(formData.get("paymentAttemptId") ?? "").trim();
  const bankCreditReference = String(formData.get("bankCreditReference") ?? "").trim();
  const verifiedAmountRaw = String(formData.get("verifiedAmountPaise") ?? "").trim();
  const receivingBank = (String(formData.get("receivingBank") ?? "").trim() || "YES BANK / PTYES");
  const reconciliationNotes = String(formData.get("reconciliationNotes") ?? "").trim();

  const isEngagementAttempt = paymentAttemptId.startsWith("att-");
  if (!UUID_REGEX.test(paymentRequestId)) {
    throw new Error("Invalid payment request ID");
  }
  if (!isEngagementAttempt && !UUID_REGEX.test(paymentAttemptId)) {
    throw new Error("Invalid payment attempt ID");
  }
  if (!bankCreditReference) {
    throw new Error("Bank credit reference is required for ledger reconciliation");
  }

  const verifiedAmountPaise = parseInt(verifiedAmountRaw, 10);
  if (isNaN(verifiedAmountPaise) || verifiedAmountPaise <= 0) {
    throw new Error("Verified bank credit amount must be greater than zero");
  }

  // 1. Check if this is an engagement stage payment (Stage 06 Initial Deposit / Stage 11 Final Settlement)
  const { data: stageRecord } = await supabaseAdmin
    .from("engagement_stages")
    .select(`
      id,
      engagement_id,
      stage_key,
      title,
      ordinal,
      status,
      snapshot,
      client_engagements (
        id,
        engagement_ref,
        company_name,
        contact_name,
        contact_email,
        contact_phone,
        metadata
      )
    `)
    .eq("id", paymentRequestId)
    .maybeSingle();

  if (stageRecord) {
    const eng =
      (Array.isArray(stageRecord.client_engagements)
        ? stageRecord.client_engagements[0]
        : stageRecord.client_engagements) || {};
    const snap = (stageRecord.snapshot || {}) as Record<string, any>;
    const metadata = (eng.metadata || {}) as Record<string, any>;

    const candidateSubtotal =
      snap.subtotal ||
      metadata.contract_subtotal ||
      metadata.subtotal ||
      metadata.contract_value ||
      metadata.budget_range ||
      50;

    const financials = calculateEngagementFinancials(candidateSubtotal);
    const isInitial = stageRecord.stage_key === "initial-invoice";
    const milestoneAmount = isInitial
      ? financials.depositAmount
      : financials.settlementAmount;
    const milestoneSubtotal = Math.round((financials.subtotal / 2) * 100) / 100;
    const milestoneCgst = Math.round((financials.cgstAmount / 2) * 100) / 100;
    const milestoneSgst = Math.round((financials.sgstAmount / 2) * 100) / 100;

    const now = new Date();
    const currentYear = now.getFullYear();
    const hexSuffix = paymentRequestId.replace(/-/g, "").slice(0, 6).toUpperCase();
    const invoiceNumber = `LIT-INV-${currentYear}-${hexSuffix}`;
    const receiptNumber = `LIT-REC-${currentYear}-${hexSuffix}`;

    const formattedDate = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const clientName = snap.remitterName || eng.contact_name || "Enterprise Client";
    const clientCompany = eng.company_name || "";
    const clientEmail = eng.contact_email || "";
    const clientPhone = eng.contact_phone || "";
    const clientGstin = snap.gstin || undefined;
    const placeOfSupply = snap.placeOfSupply || "Tamil Nadu (Code 33)";

    const milestoneTitle = isInitial
      ? "Stage 06: Initial 50% Project Commitment Deposit"
      : "Stage 11: Final 50% Milestone Settlement";

    const verifiedINR = verifiedAmountPaise / 100;

    const invoiceData: TaxInvoiceData = {
      invoiceNumber,
      dateIssued: formattedDate,
      dueDate: formattedDate,
      placeOfSupply,
      milestoneRef: milestoneTitle,
      client: {
        legalName: clientName,
        attentionName: clientCompany ? `${clientName} (${clientCompany})` : clientName,
        billingAddress: [placeOfSupply, "India"],
        email: clientEmail,
        phone: clientPhone || undefined,
        gstin: clientGstin,
      },
      items: [
        {
          description: milestoneTitle,
          quantity: 1,
          unitPrice: milestoneSubtotal,
          taxRatePercent: 18,
          amount: milestoneSubtotal,
        },
      ],
      taxType: "INTRA_STATE",
      taxRatePercent: 18,
      subtotal: milestoneSubtotal,
      cgstAmount: milestoneCgst,
      sgstAmount: milestoneSgst,
      igstAmount: 0,
      totalTaxAmount: milestoneCgst + milestoneSgst,
      totalPayable: verifiedINR,
      status: "paid",
      amountPaid: verifiedINR,
      amountDue: 0,
      notes: `Bank Credit Ref: ${bankCreditReference} · Account: ${receivingBank}`,
    };

    const receiptData: PaymentReceiptData = {
      receiptNumber,
      invoiceNumber,
      datePaid: formattedDate,
      placeOfSupply,
      milestoneRef: milestoneTitle,
      client: invoiceData.client,
      items: invoiceData.items,
      taxType: "INTRA_STATE",
      taxRatePercent: 18,
      subtotal: milestoneSubtotal,
      cgstAmount: milestoneCgst,
      sgstAmount: milestoneSgst,
      igstAmount: 0,
      totalTaxAmount: milestoneCgst + milestoneSgst,
      totalAmount: verifiedINR,
      amountPaid: verifiedINR,
      remainingBalance: 0,
      paymentHistory: [
        {
          paymentMethod: "UPI / Direct Bank Transfer",
          paymentDate: formattedDate,
          utrReference: snap.utrNumber || snap.utr || bankCreditReference,
          receivingBankRef: receivingBank,
          amountPaid: verifiedINR,
          receiptNumber,
        },
      ],
      notes: `Official Payment Receipt. Bank credit reference verified: ${bankCreditReference}.`,
    };

    // Generate binary PDFs
    const invoicePdf = await generateTaxInvoicePdf(invoiceData);
    const receiptPdf = await generatePaymentReceiptPdf(receiptData);

    const invoiceStoragePath = `financial-docs/${paymentRequestId}/${invoiceNumber}.pdf`;
    const receiptStoragePath = `financial-docs/${paymentRequestId}/${receiptNumber}.pdf`;

    await supabaseAdmin.storage
      .from(DOCUMENTS_BUCKET)
      .upload(invoiceStoragePath, invoicePdf.buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    await supabaseAdmin.storage
      .from(DOCUMENTS_BUCKET)
      .upload(receiptStoragePath, receiptPdf.buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    // Insert financial_documents records
    const { data: invoiceDoc } = await supabaseAdmin
      .from("financial_documents")
      .insert({
        payment_request_id: null,
        doc_type: "invoice",
        document_number: invoiceNumber,
        title: `Tax Invoice - ${milestoneTitle}`,
        storage_path: invoiceStoragePath,
        sha256_hash: invoicePdf.sha256,
        byte_size: invoicePdf.bytes.length,
        status: "issued",
        issued_at: now.toISOString(),
      })
      .select("id")
      .single();

    const { data: receiptDoc } = await supabaseAdmin
      .from("financial_documents")
      .insert({
        payment_request_id: null,
        doc_type: "receipt",
        document_number: receiptNumber,
        title: `Payment Receipt - ${milestoneTitle}`,
        storage_path: receiptStoragePath,
        sha256_hash: receiptPdf.sha256,
        byte_size: receiptPdf.bytes.length,
        status: "issued",
        issued_at: now.toISOString(),
      })
      .select("id")
      .single();

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.logicintelligencetechnologies.com";
    const invoiceDownloadUrl = invoiceDoc?.id
      ? `${baseUrl}/api/documents/financial/${invoiceDoc.id}`
      : `${baseUrl}/engagement/${eng.engagement_ref}/${stageRecord.stage_key}`;
    const receiptDownloadUrl = receiptDoc?.id
      ? `${baseUrl}/api/documents/financial/${receiptDoc.id}`
      : `${baseUrl}/engagement/${eng.engagement_ref}/${stageRecord.stage_key}`;

    // Upsert into engagement_document_links
    if (eng.id) {
      await supabaseAdmin.from("engagement_document_links").insert([
        {
          engagement_id: eng.id,
          stage_key: stageRecord.stage_key,
          document_title: `Tax Invoice - ${invoiceNumber}`,
          master_id: `INV-${hexSuffix}`,
          version_label: "v1.0 (Verified)",
          file_url: invoiceDownloadUrl,
          file_size_bytes: invoicePdf.bytes.length,
          sha256_hash: invoicePdf.sha256,
          is_client_visible: true,
          requires_signature: false,
          signature_status: "none",
        },
        {
          engagement_id: eng.id,
          stage_key: stageRecord.stage_key,
          document_title: `Payment Receipt - ${receiptNumber}`,
          master_id: `RCPT-${hexSuffix}`,
          version_label: "v1.0 (Verified)",
          file_url: receiptDownloadUrl,
          file_size_bytes: receiptPdf.bytes.length,
          sha256_hash: receiptPdf.sha256,
          is_client_visible: true,
          requires_signature: false,
          signature_status: "none",
        },
      ]);
    }

    const updatedSnapshot = {
      ...snap,
      bank_verified: true,
      bank_credit_reference: bankCreditReference,
      verified_amount: verifiedINR,
      reconciled_at: now.toISOString(),
      reconciled_by: actor.email,
      receiving_bank: receivingBank,
      notes: reconciliationNotes || "Manual receiving bank credit verified by Super Admin",
      invoice_number: invoiceNumber,
      receipt_number: receiptNumber,
      invoice_id: invoiceDoc?.id || null,
      receipt_id: receiptDoc?.id || null,
      invoice_url: invoiceDownloadUrl,
      receipt_url: receiptDownloadUrl,
      last_action: "verify_bank_credit",
      last_updated_at: now.toISOString(),
    };

    // Update current stage to 'verified'
    await supabaseAdmin
      .from("engagement_stages")
      .update({
        status: "verified",
        snapshot: updatedSnapshot,
        approved_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", stageRecord.id);

    // Unlock next stage: onboarding (Stage 07) or handover (Stage 12)
    const nextStageKey = isInitial ? "onboarding" : "handover";
    await supabaseAdmin
      .from("engagement_stages")
      .update({
        status: "available",
        unlocked_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("engagement_id", eng.id)
      .eq("stage_key", nextStageKey);

    await supabaseAdmin
      .from("client_engagements")
      .update({
        current_stage: nextStageKey,
        updated_at: now.toISOString(),
      })
      .eq("id", eng.id);

    // DISPATCH DUAL-DOCUMENT EMAIL WITH THE TWO ATTACHED PDFS!
    if (clientEmail) {
      try {
        const nextStageUrl = `${baseUrl}/engagement/${eng.engagement_ref}/${nextStageKey}`;
        await sendEmail({
          to: clientEmail,
          subject: `Payment Verified & Official Documents Issued (${invoiceNumber} & ${receiptNumber})`,
          from: "hello",
          category: "transactional",
          templateKey: "payment-verified-dual-document",
          attachments: [
            {
              filename: `${invoiceNumber}.pdf`,
              content: Buffer.from(invoicePdf.bytes),
              contentType: "application/pdf",
            },
            {
              filename: `${receiptNumber}.pdf`,
              content: Buffer.from(receiptPdf.bytes),
              contentType: "application/pdf",
            },
          ],
          react: React.createElement(PaymentVerifiedDualDocumentEmail, {
            recipientName: clientName,
            milestoneTitle,
            amountPaid: formatINR(verifiedINR),
            paymentDate: formattedDate,
            utrReference: snap.utrNumber || snap.utr || bankCreditReference,
            bankCreditReference: bankCreditReference,
            invoiceDownloadUrl,
            receiptDownloadUrl,
            stageNumber: isInitial ? 6 : 11,
            nextStageUrl,
          }),
        });
      } catch (emailErr) {
        console.warn("[payments-action] Dual-document email delivery failed (logged):", emailErr);
      }
    }

    await recordAdminAction({
      actor,
      action: "payment.reconcile_and_approve",
      capability: "payment.verify",
      target: { type: "engagement_stage", id: paymentRequestId },
      outcome: "succeeded",
      metadata: {
        invoiceNumber,
        receiptNumber,
        bankCreditReference,
        verifiedAmountPaise,
        receivingBank,
        engagementRef: eng.engagement_ref,
      },
    });

    revalidatePath("/admin/payments");
    if (eng.engagement_ref) {
      revalidatePath(`/engagement/${eng.engagement_ref}`);
      revalidatePath(`/engagement/${eng.engagement_ref}/${stageRecord.stage_key}`);
      revalidatePath(`/engagement/${eng.engagement_ref}/${nextStageKey}`);
    }

    return {
      success: true,
      invoiceNumber,
      receiptNumber,
      invoiceDownloadUrl,
      receiptDownloadUrl,
    };
  }

  // 2. Fetch standalone payment request and billing snapshot
  const { data: req, error: reqError } = await supabaseAdmin
    .from("engagement_payment_requests")
    .select("*, clients(*)")
    .eq("id", paymentRequestId)
    .single();

  if (reqError || !req) {
    await recordAdminAction({
      actor,
      action: "payment.reconcile_and_approve",
      capability: "payment.verify",
      target: { type: "engagement_payment_request", id: paymentRequestId },
      outcome: "failed",
      errorCode: "request_not_found",
    });
    throw new Error("Payment request not found");
  }

  // Fetch billing submission
  const { data: billing } = await supabaseAdmin
    .from("payment_billing_submissions")
    .select("*")
    .eq("payment_request_id", paymentRequestId)
    .maybeSingle();

  // Fetch payment attempt
  const { data: attempt } = await supabaseAdmin
    .from("payment_attempts")
    .select("*")
    .eq("id", paymentAttemptId)
    .single();

  // 2. Execute Atomic Reconciliation RPC
  const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
    "reconcile_and_approve_payment",
    {
      p_payment_request_id: paymentRequestId,
      p_payment_attempt_id: paymentAttemptId,
      p_admin_user_id: session.userId,
      p_bank_credit_reference: bankCreditReference,
      p_bank_credit_amount_paise: verifiedAmountPaise,
      p_receiving_bank: receivingBank,
      p_reconciliation_notes: reconciliationNotes || null,
    }
  );

  if (rpcError || (rpcResult && rpcResult.success === false)) {
    const errMsg = rpcError?.message || rpcResult?.error || "Reconciliation RPC failed";
    await recordAdminAction({
      actor,
      action: "payment.reconcile_and_approve",
      capability: "payment.verify",
      target: { type: "engagement_payment_request", id: paymentRequestId },
      outcome: "failed",
      errorCode: "rpc_execution_failed",
      metadata: { error: errMsg, bankCreditReference },
    });
    throw new Error(errMsg);
  }

  // 3. Generate Official PDF Documents
  const now = new Date();
  const currentYear = now.getFullYear();
  const hexSuffix = paymentRequestId.replace(/-/g, "").slice(0, 6).toUpperCase();
  const invoiceNumber = `LIT-INV-${currentYear}-${hexSuffix}`;
  const receiptNumber = `LIT-REC-${currentYear}-${hexSuffix}`;

  const formattedDate = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const clientName = billing?.legalName || billing?.legal_name || req.clients?.name || "Valued Enterprise Client";
  const clientCompany = billing?.companyName || billing?.company_name || req.clients?.company_name || "";
  const clientEmail = billing?.email || req.clients?.email || "";
  const clientPhone = billing?.phone || req.clients?.phone || "";
  const clientGstin = billing?.clientGstin || billing?.client_gstin || undefined;
  
  const billingAddress = [
    billing?.addressLine1 || billing?.address_line1 || "",
    billing?.addressLine2 || billing?.address_line2 || "",
    `${billing?.city || ""}, ${billing?.state || ""} ${billing?.postalCode || billing?.postal_code || ""}`.trim(),
  ].filter(Boolean);

  const subtotalINR = Number(req.subtotal_paise || req.total_payable_paise) / 100;
  const verifiedINR = verifiedAmountPaise / 100;
  const cgstINR = Number(req.cgst_paise || 0) / 100;
  const sgstINR = Number(req.sgst_paise || 0) / 100;
  const igstINR = Number(req.igst_paise || 0) / 100;
  const taxRate = Number(req.gst_rate_bps || 1800) / 100;

  const invoiceData: TaxInvoiceData = {
    invoiceNumber,
    dateIssued: formattedDate,
    dueDate: formattedDate,
    placeOfSupply: billing?.placeOfSupply || billing?.place_of_supply || "Tamil Nadu (Code 33)",
    milestoneRef: req.milestone_title,
    client: {
      legalName: clientName,
      attentionName: clientCompany ? `${clientName} (${clientCompany})` : clientName,
      billingAddress: billingAddress.length > 0 ? billingAddress : ["Registered Corporate Address"],
      email: clientEmail,
      phone: clientPhone || undefined,
      gstin: clientGstin,
    },
    items: [
      {
        description: req.milestone_title,
        quantity: 1,
        unitPrice: subtotalINR,
        taxRatePercent: taxRate,
        amount: subtotalINR,
      },
    ],
    taxType: req.is_interstate ? "INTER_STATE" : "INTRA_STATE",
    taxRatePercent: taxRate,
    subtotal: subtotalINR,
    cgstAmount: cgstINR,
    sgstAmount: sgstINR,
    igstAmount: igstINR,
    totalTaxAmount: cgstINR + sgstINR + igstINR,
    totalPayable: verifiedINR,
    status: "paid",
    amountPaid: verifiedINR,
    amountDue: 0,
    notes: `Bank Credit Ref: ${bankCreditReference} · Account: ${receivingBank}`,
  };

  const receiptData: PaymentReceiptData = {
    receiptNumber,
    invoiceNumber,
    datePaid: formattedDate,
    placeOfSupply: invoiceData.placeOfSupply,
    milestoneRef: req.milestone_title,
    client: invoiceData.client,
    items: invoiceData.items,
    taxType: invoiceData.taxType,
    taxRatePercent: taxRate,
    subtotal: subtotalINR,
    cgstAmount: cgstINR,
    sgstAmount: sgstINR,
    igstAmount: igstINR,
    totalTaxAmount: invoiceData.totalTaxAmount,
    totalAmount: verifiedINR,
    amountPaid: verifiedINR,
    remainingBalance: 0,
    paymentHistory: [
      {
        paymentMethod: "UPI / Bank Transfer",
        paymentDate: formattedDate,
        utrReference: attempt?.utr || "Verified Bank UTR",
        receivingBankRef: receivingBank,
        amountPaid: verifiedINR,
        receiptNumber,
      },
    ],
    notes: `Official Payment Receipt. Bank credit reference verified: ${bankCreditReference}.`,
  };

  // Generate binary PDFs
  const invoicePdf = await generateTaxInvoicePdf(invoiceData);
  const receiptPdf = await generatePaymentReceiptPdf(receiptData);

  // 4. Archive into immutable storage vault
  const invoiceStoragePath = `financial-docs/${paymentRequestId}/${invoiceNumber}.pdf`;
  const receiptStoragePath = `financial-docs/${paymentRequestId}/${receiptNumber}.pdf`;

  await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .upload(invoiceStoragePath, invoicePdf.buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .upload(receiptStoragePath, receiptPdf.buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  // 5. Insert financial_documents records
  const { data: invoiceDoc, error: invDocErr } = await supabaseAdmin
    .from("financial_documents")
    .insert({
      payment_request_id: paymentRequestId,
      doc_type: "invoice",
      document_number: invoiceNumber,
      title: `Tax Invoice - ${req.milestone_title}`,
      storage_path: invoiceStoragePath,
      sha256_hash: invoicePdf.sha256,
      byte_size: invoicePdf.bytes.length,
      client_id: req.client_id,
      proposal_id: req.proposal_id,
      contract_id: req.contract_id,
      status: "issued",
      issued_at: now.toISOString(),
    })
    .select("id")
    .single();

  const { data: receiptDoc, error: recDocErr } = await supabaseAdmin
    .from("financial_documents")
    .insert({
      payment_request_id: paymentRequestId,
      doc_type: "receipt",
      document_number: receiptNumber,
      title: `Payment Receipt - ${req.milestone_title}`,
      storage_path: receiptStoragePath,
      sha256_hash: receiptPdf.sha256,
      byte_size: receiptPdf.bytes.length,
      client_id: req.client_id,
      proposal_id: req.proposal_id,
      contract_id: req.contract_id,
      status: "issued",
      issued_at: now.toISOString(),
    })
    .select("id")
    .single();

  if (invDocErr || recDocErr) {
    console.error("[payments-action] Document registration error:", invDocErr || recDocErr);
  }

  // Link invoice & receipt on engagement_payment_requests
  if (invoiceDoc?.id || receiptDoc?.id) {
    await supabaseAdmin
      .from("engagement_payment_requests")
      .update({
        invoice_id: invoiceDoc?.id || null,
        receipt_id: receiptDoc?.id || null,
        status: "approved",
      })
      .eq("id", paymentRequestId);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.logicintelligencetechnologies.in";
  const invoiceDownloadUrl = invoiceDoc?.id
    ? `${baseUrl}/api/documents/financial/${invoiceDoc.id}`
    : `${baseUrl}/dashboard`;
  const receiptDownloadUrl = receiptDoc?.id
    ? `${baseUrl}/api/documents/financial/${receiptDoc.id}`
    : `${baseUrl}/dashboard`;

  // 6. Dispatch Dual-Document Email to Client
  if (clientEmail) {
    try {
      const stageNum = req.stage_number || 6;
      const nextStageUrl =
        stageNum === 6 ? `${baseUrl}/onboarding` : `${baseUrl}/dashboard`;

      await sendEmail({
        to: clientEmail,
        subject: `Payment Verified & Official Documents Issued (${invoiceNumber} & ${receiptNumber})`,
        from: "hello",
        category: "transactional",
        templateKey: "payment-verified-dual-document",
        attachments: [
          {
            filename: `${invoiceNumber}.pdf`,
            content: Buffer.from(invoicePdf.bytes),
            contentType: "application/pdf",
          },
          {
            filename: `${receiptNumber}.pdf`,
            content: Buffer.from(receiptPdf.bytes),
            contentType: "application/pdf",
          },
        ],
        react: React.createElement(PaymentVerifiedDualDocumentEmail, {
          recipientName: clientName,
          milestoneTitle: req.milestone_title,
          amountPaid: formatINR(verifiedINR),
          paymentDate: formattedDate,
          utrReference: attempt?.utr || "Verified Bank UTR",
          bankCreditReference: bankCreditReference,
          invoiceDownloadUrl: invoiceDownloadUrl,
          receiptDownloadUrl: receiptDownloadUrl,
          stageNumber: stageNum,
          nextStageUrl: nextStageUrl,
        }),
      });
    } catch (emailErr) {
      console.warn("[payments-action] Dual-document email delivery failed (logged):", emailErr);
    }
  }

  // 7. Audit Log Entry
  await recordAdminAction({
    actor,
    action: "payment.reconcile_and_approve",
    capability: "payment.verify",
    target: { type: "engagement_payment_request", id: paymentRequestId },
    outcome: "succeeded",
    metadata: {
      bankCreditReference,
      verifiedAmountPaise,
      receivingBank,
      invoiceNumber,
      receiptNumber,
      invoiceDocId: invoiceDoc?.id,
      receiptDocId: receiptDoc?.id,
      stageNumber: req.stage_number,
      clientEmail,
    },
  });

  revalidatePath("/admin/payments");
  revalidatePath("/admin/command-center");
  revalidatePath("/admin/invoices");

  return {
    success: true,
    invoiceNumber,
    receiptNumber,
    invoiceDownloadUrl,
    receiptDownloadUrl,
  };
}

/**
 * Super Admin Reject Payment Action.
 * 
 * Sets status to 'rejected', records rejection note, and logs audit record.
 */
export async function rejectPaymentReportAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await requireCapabilityAction("payment.verify", "payment.reject");
  const actor = { userId: session.userId, email: session.email, role: session.role };

  const paymentRequestId = String(formData.get("paymentRequestId") ?? "").trim();
  const paymentAttemptId = String(formData.get("paymentAttemptId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!UUID_REGEX.test(paymentRequestId)) {
    throw new Error("Invalid payment request ID");
  }
  if (!reason) {
    throw new Error("A rejection reason note is required");
  }

  // Update payment request
  const { error: reqError } = await supabaseAdmin
    .from("engagement_payment_requests")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentRequestId);

  if (reqError) {
    await recordAdminAction({
      actor,
      action: "payment.reject",
      capability: "payment.verify",
      target: { type: "engagement_payment_request", id: paymentRequestId },
      outcome: "failed",
      errorCode: "db_update_failed",
    });
    throw new Error("Could not reject the payment request");
  }

  // Update payment attempt if supplied
  if (paymentAttemptId && UUID_REGEX.test(paymentAttemptId)) {
    await supabaseAdmin
      .from("payment_attempts")
      .update({
        status: "rejected",
        notes: reason,
      })
      .eq("id", paymentAttemptId);
  }

  // Audit record
  await recordAdminAction({
    actor,
    action: "payment.reject",
    capability: "payment.verify",
    target: { type: "engagement_payment_request", id: paymentRequestId },
    outcome: "succeeded",
    metadata: { reason, paymentAttemptId },
  });

  revalidatePath("/admin/payments");
  return { success: true };
}
