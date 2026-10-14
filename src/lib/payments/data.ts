import "server-only";
import { supabaseAdmin, isAdminClientConfigured } from "@/lib/supabase/admin";
import {
  LIT_PAYEE_CONFIG,
  buildUpiUri,
  generateUpiQrDataUrl,
  getMobileIntentLinks,
  calculateGst,
  isValidUtr,
  formatInr,
} from "./upi";
import type {
  PaymentPortalData,
  BillingDetailsInput,
  UtrSubmissionInput,
  PaymentRequestStatus,
} from "./types";
import { createHash } from "crypto";

// Fallback in-memory state store for resilience across test / development instances
interface MemoryState {
  billing?: BillingDetailsInput;
  paymentAttempt?: {
    utr: string;
    payerUpiId?: string | null;
    bankName?: string | null;
    reportedAt: string;
    status: string;
  };
  status: PaymentRequestStatus;
}

const memoryStateCache = new Map<string, MemoryState>();

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Resolve client payment portal data for a given secure token.
 * Token can be either a proposal secure_token or a payment request token.
 */
export async function resolvePaymentPortalData(
  secureToken: string
): Promise<PaymentPortalData | null> {
  if (!secureToken || typeof secureToken !== "string" || secureToken.length < 8) {
    return null;
  }

  // 1. Try resolving via proposals table
  let proposal: any = null;
  try {
    const { data, error } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .eq("secure_token", secureToken)
      .maybeSingle();

    if (!error && data) {
      proposal = data;
    }
  } catch (err) {
    console.warn("[payments/data] proposals query error:", err);
  }

  // 2. If not found by proposal token directly, check client_payment_requests table
  let paymentRequestRow: any = null;
  const tokenHash = hashToken(secureToken);

  try {
    const { data: prData } = await supabaseAdmin
      .from("client_payment_requests")
      .select("*, proposals(*)")
      .eq("secure_token_hash", tokenHash)
      .maybeSingle();

    if (prData) {
      paymentRequestRow = prData;
      if (prData.proposals) {
        proposal = prData.proposals;
      }
    }
  } catch {
    /* ignore if table not yet migrated */
  }

  if (!proposal && !paymentRequestRow) {
    return null;
  }

  // Stage gate check: Stage 6 requires Stage 5 (SOW / Contract Signed).
  // In LIT workflow, proposal acceptance marks proposal status = 'Approved' or signed SOW.
  const isApproved =
    proposal?.status?.toLowerCase() === "approved" ||
    proposal?.status?.toLowerCase() === "accepted";
  const isSowSigned = isApproved;
  const sowSignedAt = proposal?.approved_at || null;

  const stage = (paymentRequestRow?.stage || 6) as 6 | 11;
  const stageName =
    stage === 6
      ? "Stage 06 · Initial 50% Milestone Payment Request"
      : "Stage 11 · Final 50% Milestone Payment Settlement";
  const milestoneTitle =
    stage === 6
      ? "Milestone 1: Project Kickoff, Architecture & Core Sprint Initiation"
      : "Milestone 2: Final Acceptance, Production Delivery & Handover";

  const milestonePercentage = 50.0;
  const totalContractPricing = Number(proposal?.pricing || 100000);
  const milestoneSubtotal = Math.round(totalContractPricing * (milestonePercentage / 100));

  // Retrieve existing billing submission and payment attempts from DB or memory cache
  const memState = memoryStateCache.get(secureToken) || {
    status: isSowSigned ? "awaiting_billing" : "prerequisite_required",
  };

  let dbBilling: BillingDetailsInput | null = null;
  let dbPaymentAttempt: any = null;
  let currentStatus: PaymentRequestStatus = memState.status;

  if (paymentRequestRow) {
    currentStatus = paymentRequestRow.status as PaymentRequestStatus;

    // Load billing submission
    try {
      const { data: billData } = await supabaseAdmin
        .from("payment_billing_submissions")
        .select("*")
        .eq("payment_request_id", paymentRequestRow.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (billData) {
        dbBilling = {
          contactName: billData.contact_name,
          email: billData.email,
          phone: billData.phone,
          customerType: billData.customer_type,
          companyName: billData.company_name || undefined,
          gstin: billData.gstin || undefined,
          addressLine1: billData.address_line1,
          addressLine2: billData.address_line2 || undefined,
          city: billData.city,
          state: billData.state,
          postalCode: billData.postal_code,
          country: billData.country,
          placeOfSupply: billData.place_of_supply,
          acknowledgement: true,
        };
      }

      const { data: attData } = await supabaseAdmin
        .from("payment_attempts")
        .select("*")
        .eq("payment_request_id", paymentRequestRow.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (attData) {
        dbPaymentAttempt = {
          utr: attData.utr,
          payerUpiId: attData.payer_upi_id,
          bankName: attData.bank_name,
          reportedAt: attData.transferred_at || attData.created_at,
          status: attData.status,
        };
      }
    } catch {
      /* ignore db errors */
    }
  }

  const effectiveBilling = dbBilling || memState.billing || null;
  const effectiveAttempt = dbPaymentAttempt || memState.paymentAttempt || null;

  if (!isSowSigned) {
    currentStatus = "prerequisite_required";
  } else if (effectiveAttempt) {
    if (currentStatus !== "approved" && currentStatus !== "rejected") {
      currentStatus = "payment_reported";
    }
  } else if (effectiveBilling) {
    if (currentStatus === "awaiting_billing" || currentStatus === "prerequisite_required") {
      currentStatus = "ready_to_pay";
    }
  } else {
    currentStatus = "awaiting_billing";
  }

  const placeOfSupply = effectiveBilling?.placeOfSupply || "Tamil Nadu";
  const gstBreakdown = calculateGst(milestoneSubtotal, placeOfSupply);

  // Reference number formatting: e.g. LIT-PAY-2026-X8F9C2
  const tokenFragment = (proposal?.id || secureToken).replace(/-/g, "").slice(0, 6).toUpperCase();
  const uniqueRef = `LIT-PAY-2026-${tokenFragment}`;

  // FORM-FIRST GATE:
  // Under NO circumstances render or serve the payment QR code until the client has
  // filled out, validated, and submitted their complete billing information!
  let upiUri: string | null = null;
  let qrCodeDataUrl: string | null = null;
  let mobileLinks: any = null;

  if (isSowSigned && effectiveBilling && currentStatus !== "awaiting_billing") {
    upiUri = buildUpiUri({
      pa: LIT_PAYEE_CONFIG.upiId,
      pn: LIT_PAYEE_CONFIG.accountHolder,
      am: gstBreakdown.totalAmount,
      cu: "INR",
      tr: uniqueRef,
      tn: `${uniqueRef} ${milestoneTitle.slice(0, 30)}`,
    });

    try {
      qrCodeDataUrl = await generateUpiQrDataUrl(upiUri);
      mobileLinks = getMobileIntentLinks(upiUri);
    } catch (err) {
      console.error("[payments/data] QR generation failed:", err);
    }
  }

  return {
    token: secureToken,
    proposalId: proposal?.id || "temp-proposal-id",
    proposalTitle: proposal?.title || "Enterprise Engineering Statement of Work",
    clientName: proposal?.client_name || effectiveBilling?.contactName || "Valued Client",
    clientEmail: proposal?.client_email || effectiveBilling?.email || "billing@client.com",
    clientCompany: proposal?.client_company || effectiveBilling?.companyName || null,
    stage,
    stageName,
    milestoneTitle,
    milestonePercentage,
    subtotal: gstBreakdown.subtotal,
    gstRate: gstBreakdown.gstRate,
    cgst: gstBreakdown.cgst,
    sgst: gstBreakdown.sgst,
    igst: gstBreakdown.igst,
    gstAmount: gstBreakdown.gstAmount,
    totalPayable: gstBreakdown.totalAmount,
    currency: "INR",
    isSowSigned,
    sowSignedAt,
    status: currentStatus,
    uniqueRef,
    billingDetails: effectiveBilling,
    paymentAttempt: effectiveAttempt,
    upiUri,
    qrCodeDataUrl,
    mobileLinks,
  };
}

/**
 * Record client billing submission (FORM-FIRST GATE passed).
 */
export async function recordBillingSubmission(
  secureToken: string,
  billing: BillingDetailsInput,
  meta?: { ipHash?: string; userAgent?: string }
): Promise<{ success: boolean; error?: string }> {
  // Update memory state cache immediately
  const existing = memoryStateCache.get(secureToken) || { status: "ready_to_pay" };
  existing.billing = billing;
  existing.status = "ready_to_pay";
  memoryStateCache.set(secureToken, existing);

  // Try persisting to DB
  try {
    const data = await resolvePaymentPortalData(secureToken);
    if (!data) return { success: false, error: "Payment request not found" };

    const tokenHash = hashToken(secureToken);

    // Ensure payment request exists in client_payment_requests table
    let prId: string | null = null;
    const { data: existingPr } = await supabaseAdmin
      .from("client_payment_requests")
      .select("id")
      .eq("secure_token_hash", tokenHash)
      .maybeSingle();

    if (existingPr?.id) {
      prId = existingPr.id;
      await supabaseAdmin
        .from("client_payment_requests")
        .update({
          status: "ready_to_pay",
          updated_at: new Date().toISOString(),
        })
        .eq("id", prId);
    } else if (data.proposalId) {
      const { data: newPr } = await supabaseAdmin
        .from("client_payment_requests")
        .insert({
          proposal_id: data.proposalId === "temp-proposal-id" ? null : data.proposalId,
          stage: data.stage,
          stage_name: data.stageName,
          milestone_title: data.milestoneTitle,
          milestone_percentage: data.milestonePercentage,
          subtotal_paise: Math.round(data.subtotal * 100),
          gst_rate: data.gstRate,
          gst_amount_paise: Math.round(data.gstAmount * 100),
          total_payable_paise: Math.round(data.totalPayable * 100),
          currency: "INR",
          unique_reference: data.uniqueRef,
          secure_token_hash: tokenHash,
          status: "ready_to_pay",
        })
        .select("id")
        .maybeSingle();

      prId = newPr?.id || null;
    }

    if (prId) {
      await supabaseAdmin.from("payment_billing_submissions").insert({
        payment_request_id: prId,
        contact_name: billing.contactName,
        email: billing.email,
        phone: billing.phone,
        customer_type: billing.customerType,
        company_name: billing.companyName || null,
        gstin: billing.gstin ? billing.gstin.toUpperCase() : null,
        address_line1: billing.addressLine1,
        address_line2: billing.addressLine2 || null,
        city: billing.city,
        state: billing.state,
        postal_code: billing.postalCode,
        country: billing.country || "India",
        place_of_supply: billing.placeOfSupply,
        ip_hash: meta?.ipHash || null,
        user_agent: meta?.userAgent || null,
      });
    }
  } catch (err: any) {
    console.warn("[payments/data] DB persist billing error (in-memory preserved):", err?.message);
  }

  return { success: true };
}

/**
 * Record UTR submission / payment attempt by client.
 */
export async function recordPaymentUtr(
  secureToken: string,
  utrInput: UtrSubmissionInput,
  meta?: { ipHash?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!isValidUtr(utrInput.utr)) {
    return {
      success: false,
      error: "Invalid UTR. Please provide a valid 12-digit UPI reference number.",
    };
  }

  // Update memory state cache immediately
  const existing = memoryStateCache.get(secureToken) || { status: "payment_reported" };
  existing.paymentAttempt = {
    utr: utrInput.utr.trim(),
    payerUpiId: utrInput.payerUpiId?.trim() || null,
    bankName: utrInput.bankName?.trim() || null,
    reportedAt: new Date().toISOString(),
    status: "under_review",
  };
  existing.status = "payment_reported";
  memoryStateCache.set(secureToken, existing);

  // Try persisting to DB
  try {
    const tokenHash = hashToken(secureToken);
    const { data: pr } = await supabaseAdmin
      .from("client_payment_requests")
      .select("id")
      .eq("secure_token_hash", tokenHash)
      .maybeSingle();

    if (pr?.id) {
      await supabaseAdmin.from("payment_attempts").insert({
        payment_request_id: pr.id,
        utr: utrInput.utr.trim(),
        payer_upi_id: utrInput.payerUpiId?.trim() || null,
        bank_name: utrInput.bankName?.trim() || null,
        screenshot_url: utrInput.screenshotUrl?.trim() || null,
        notes: utrInput.notes?.trim() || null,
        ip_hash: meta?.ipHash || null,
        status: "under_review",
      });

      await supabaseAdmin
        .from("client_payment_requests")
        .update({
          status: "payment_reported",
          updated_at: new Date().toISOString(),
        })
        .eq("id", pr.id);
    }
  } catch (err: any) {
    console.warn("[payments/data] DB persist UTR error (in-memory preserved):", err?.message);
  }

  return { success: true };
}
