import "server-only";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  CompanyCredentials,
  PaymentBeneficiaryProfile,
  EngagementPaymentRequest,
  PaymentBillingSubmission,
  PaymentAttempt,
  PaymentReconciliation,
  FinancialDocument,
  CreatePaymentRequestInput,
  SubmitBillingInput,
  RecordPaymentAttemptInput,
  ReconcilePaymentInput,
  ReconciliationRpcResult,
  CreateFinancialDocumentInput,
  UpdateCompanyCredentialsInput,
  PaymentRequestWithDetails,
} from "@/types/payments";
import {
  DEFAULT_COMPANY_CREDENTIALS,
  DEFAULT_BENEFICIARY_PROFILE,
  GSTIN_REGEX,
  PAN_REGEX,
  SHA256_REGEX,
  isTamilNaduPlaceOfSupply,
  calculateTaxAndTotals,
} from "./calculations";

// Re-export pure helpers so callers can import from either module
export * from "./calculations";

// ── Database Operations ──────────────────────────────────────────────────────

/**
 * Retrieves the authoritative company credentials and MSME/Udyam registration.
 */
export async function getCompanyCredentials(): Promise<CompanyCredentials | null> {
  const { data, error } = await supabaseAdmin
    .from("company_credentials")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[payments:db] Failed to fetch company credentials:", error);
    return null;
  }

  if (!data) {
    return {
      id: "fallback-default",
      ...DEFAULT_COMPANY_CREDENTIALS,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
  }

  return data as CompanyCredentials;
}

/**
 * Updates company credentials. Restricted to super_admin.
 */
export async function updateCompanyCredentials(
  input: UpdateCompanyCredentialsInput,
  adminUserId: string
): Promise<CompanyCredentials> {
  // Authorization check: Verify super_admin role
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", adminUserId)
    .maybeSingle();

  if (profileErr || !profile || profile.role !== "super_admin") {
    throw new Error("Unauthorized: Only super_admin may update company credentials");
  }

  // Validate GSTIN and PAN format if provided
  if (input.gstin) {
    const cleanGstin = input.gstin.trim();
    if (!GSTIN_REGEX.test(cleanGstin)) {
      throw new Error("Invalid GSTIN format. Must be 15 alphanumeric characters matching standard GSTIN regex.");
    }
  }

  if (input.pan) {
    const cleanPan = input.pan.trim();
    if (!PAN_REGEX.test(cleanPan)) {
      throw new Error("Invalid PAN format. Must be 10 characters matching standard PAN regex (e.g. ABCDE1234F).");
    }
  }

  const existing = await getCompanyCredentials();
  const payload = {
    enterprise_name: input.enterpriseName ?? existing?.enterprise_name ?? DEFAULT_COMPANY_CREDENTIALS.enterprise_name,
    msme_udyam_number: input.msmeUdyamNumber ?? existing?.msme_udyam_number ?? DEFAULT_COMPANY_CREDENTIALS.msme_udyam_number,
    msme_category: input.msmeCategory ?? existing?.msme_category ?? DEFAULT_COMPANY_CREDENTIALS.msme_category,
    major_activity: input.majorActivity ?? existing?.major_activity ?? DEFAULT_COMPANY_CREDENTIALS.major_activity,
    registered_address: input.registeredAddress ?? existing?.registered_address ?? DEFAULT_COMPANY_CREDENTIALS.registered_address,
    gstin: input.gstin ? input.gstin.trim() : null,
    pan: input.pan ? input.pan.trim() : null,
    official_email: input.officialEmail ?? existing?.official_email ?? DEFAULT_COMPANY_CREDENTIALS.official_email,
    official_website: input.officialWebsite ?? existing?.official_website ?? DEFAULT_COMPANY_CREDENTIALS.official_website,
    updated_by: adminUserId,
    updated_at: new Date().toISOString(),
  };

  if (existing && existing.id !== "fallback-default") {
    const { data, error } = await supabaseAdmin
      .from("company_credentials")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(`Failed to update company credentials: ${error?.message || "Unknown error"}`);
    }
    return data as CompanyCredentials;
  }

  const { data, error } = await supabaseAdmin
    .from("company_credentials")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to insert company credentials: ${error?.message || "Unknown error"}`);
  }
  return data as CompanyCredentials;
}

/**
 * Retrieves the currently active receiving UPI beneficiary profile.
 */
export async function getActiveBeneficiaryProfile(): Promise<PaymentBeneficiaryProfile | null> {
  const { data, error } = await supabaseAdmin
    .from("payment_beneficiary_profiles")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[payments:db] Failed to fetch active beneficiary profile:", error);
    return null;
  }

  if (!data) {
    return {
      id: "fallback-default",
      ...DEFAULT_BENEFICIARY_PROFILE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return data as PaymentBeneficiaryProfile;
}

/**
 * Retrieves a beneficiary profile by UUID.
 */
export async function getBeneficiaryProfileById(id: string): Promise<PaymentBeneficiaryProfile | null> {
  const { data, error } = await supabaseAdmin
    .from("payment_beneficiary_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as PaymentBeneficiaryProfile;
}

/**
 * Generates an engagement payment request for Stage 6 or Stage 11.
 */
export async function createPaymentRequest(input: CreatePaymentRequestInput): Promise<EngagementPaymentRequest> {
  if (input.stageNumber !== 6 && input.stageNumber !== 11) {
    throw new Error("Invalid stage number. Dedicated payment requests only apply to Stage 6 or Stage 11.");
  }

  if (input.subtotalPaise <= 0) {
    throw new Error("Subtotal must be greater than zero paise.");
  }

  // Resolve beneficiary profile
  let beneficiaryId = input.beneficiaryProfileId;
  if (!beneficiaryId) {
    const activeProfile = await getActiveBeneficiaryProfile();
    if (activeProfile && activeProfile.id !== "fallback-default") {
      beneficiaryId = activeProfile.id;
    }
  }

  // Calculate taxes
  const tax = calculateTaxAndTotals({
    subtotalPaise: input.subtotalPaise,
    discountPaise: input.discountPaise ?? 0,
    taxMode: input.taxMode ?? "tax_exclusive",
    gstRateBps: input.gstRateBps ?? 1800,
    isInterstate: input.isInterstate ?? false,
  });

  const secureToken = input.secureToken ?? crypto.randomBytes(24).toString("hex");
  const ttlDays = input.expiresInDays ?? 14;
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();

  const payload = {
    proposal_id: input.proposalId ?? null,
    contract_id: input.contractId ?? null,
    client_id: input.clientId ?? null,
    milestone_index: input.milestoneIndex ?? input.stageNumber,
    stage_number: input.stageNumber,
    milestone_title: input.milestoneTitle.trim(),
    secure_token: secureToken,
    subtotal_paise: tax.subtotalPaise,
    discount_paise: tax.discountPaise,
    tax_mode: tax.taxMode,
    gst_rate_bps: tax.gstRateBps,
    is_interstate: tax.isInterstate,
    cgst_paise: tax.cgstPaise,
    sgst_paise: tax.sgstPaise,
    igst_paise: tax.igstPaise,
    total_payable_paise: tax.totalPayablePaise,
    beneficiary_profile_id: beneficiaryId ?? null,
    status: "awaiting_billing_details",
    expires_at: expiresAt,
  };

  const { data, error } = await supabaseAdmin
    .from("engagement_payment_requests")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create payment request: ${error?.message || "Unknown error"}`);
  }

  return data as EngagementPaymentRequest;
}

/**
 * Resolves a payment request by its unguessable secure token with all associated records.
 * Seamlessly resolves either direct payment tokens or proposal secure tokens.
 */
export async function getPaymentRequestByToken(token: string): Promise<PaymentRequestWithDetails | null> {
  if (!token || typeof token !== "string") return null;

  const trimmedToken = token.trim();

  // 1. Direct query on engagement_payment_requests by secure_token
  const { data: request, error: reqErr } = await supabaseAdmin
    .from("engagement_payment_requests")
    .select("*")
    .eq("secure_token", trimmedToken)
    .maybeSingle();

  if (!reqErr && request) {
    return hydratePaymentDetails(request as EngagementPaymentRequest);
  }

  // 2. Proposal token fallback: check if token belongs to an accepted or active proposal
  try {
    const { data: proposal } = await supabaseAdmin
      .from("proposals")
      .select("*")
      .eq("secure_token", trimmedToken)
      .maybeSingle();

    if (proposal) {
      // Check if an engagement_payment_requests row already exists for this proposal
      const { data: existingPr } = await supabaseAdmin
        .from("engagement_payment_requests")
        .select("*")
        .eq("proposal_id", proposal.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingPr) {
        return hydratePaymentDetails(existingPr as EngagementPaymentRequest);
      }

      // Automatically initialize Stage 6 (50% initial commitment deposit) payment request
      const pricing = Number(proposal.pricing || 100000);
      const subtotalPaise = Math.round(pricing * 0.5 * 100);

      const created = await createPaymentRequest({
        proposalId: proposal.id,
        stageNumber: 6,
        milestoneTitle: "Milestone 1: Project Kickoff, Architecture & Core Sprint Initiation",
        subtotalPaise,
        secureToken: trimmedToken,
      });

      return hydratePaymentDetails(created);
    }
  } catch (err) {
    console.warn("[payments:db] Error resolving proposal token fallback:", err);
  }

  return null;
}

/**
 * Resolves a payment request by its UUID with all associated records.
 */
export async function getPaymentRequestById(id: string): Promise<PaymentRequestWithDetails | null> {
  if (!id) return null;

  const { data: request, error: reqErr } = await supabaseAdmin
    .from("engagement_payment_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (reqErr || !request) return null;

  return hydratePaymentDetails(request as EngagementPaymentRequest);
}

/**
 * Submits billing details for a payment request.
 * Automatically recalculates interstate/intrastate taxes and advances status to 'ready_to_pay'.
 */
export async function submitBillingDetails(input: SubmitBillingInput): Promise<PaymentBillingSubmission> {
  const { data: req, error: reqErr } = await supabaseAdmin
    .from("engagement_payment_requests")
    .select("*")
    .eq("id", input.paymentRequestId)
    .maybeSingle();

  if (reqErr || !req) {
    throw new Error("Payment request not found");
  }

  if (!input.secureToken || typeof input.secureToken !== "string" || !input.secureToken.trim() || req.secure_token !== input.secureToken.trim()) {
    throw new Error("Unauthorized: Invalid payment token for this request");
  }

  if (new Date(req.expires_at).getTime() < Date.now()) {
    throw new Error("Payment request has expired");
  }

  if (req.status === "approved" || req.status === "cancelled") {
    throw new Error(`Cannot submit billing details for payment in '${req.status}' status`);
  }

  // Validate GSTIN if provided
  let cleanGstin: string | null = null;
  if (input.clientGstin && input.clientGstin.trim()) {
    const candidate = input.clientGstin.trim();
    if (!GSTIN_REGEX.test(candidate)) {
      throw new Error("Invalid GSTIN format for client");
    }
    cleanGstin = candidate;
  }

  const placeOfSupply = (input.placeOfSupply ?? input.state).trim();
  const isInterstate = !isTamilNaduPlaceOfSupply(placeOfSupply);

  // Recalculate taxes based on place of supply
  const tax = calculateTaxAndTotals({
    subtotalPaise: req.subtotal_paise,
    discountPaise: req.discount_paise,
    taxMode: req.tax_mode,
    gstRateBps: req.gst_rate_bps,
    isInterstate,
    placeOfSupply,
  });

  // Upsert billing submission snapshot
  const billingPayload = {
    payment_request_id: input.paymentRequestId,
    customer_type: input.customerType,
    legal_name: input.legalName.trim(),
    company_name: input.companyName ? input.companyName.trim() : null,
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    address_line1: input.addressLine1.trim(),
    address_line2: input.addressLine2 ? input.addressLine2.trim() : null,
    city: input.city.trim(),
    state: input.state.trim(),
    postal_code: input.postalCode.trim(),
    country: input.country?.trim() || "India",
    client_gstin: cleanGstin,
    place_of_supply: placeOfSupply,
  };

  const { data: billing, error: billingErr } = await supabaseAdmin
    .from("payment_billing_submissions")
    .upsert(billingPayload, { onConflict: "payment_request_id" })
    .select("*")
    .single();

  if (billingErr || !billing) {
    throw new Error(`Failed to record billing details: ${billingErr?.message || "Unknown error"}`);
  }

  // Update payment request with tax breakdown and transition status to 'ready_to_pay'
  const newStatus = req.status === "awaiting_billing_details" ? "ready_to_pay" : req.status;

  await supabaseAdmin
    .from("engagement_payment_requests")
    .update({
      is_interstate: tax.isInterstate,
      cgst_paise: tax.cgstPaise,
      sgst_paise: tax.sgstPaise,
      igst_paise: tax.igstPaise,
      total_payable_paise: tax.totalPayablePaise,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.paymentRequestId);

  return billing as PaymentBillingSubmission;
}

/**
 * Records a client payment attempt with unique UTR and payment proof.
 * Transitions payment request status to 'payment_reported'.
 */
export async function recordPaymentAttempt(input: RecordPaymentAttemptInput): Promise<PaymentAttempt> {
  const cleanUtr = input.utr.trim();
  if (!cleanUtr) {
    throw new Error("UTR / Transaction reference is required");
  }

  if (input.reportedAmountPaise <= 0) {
    throw new Error("Reported payment amount must be greater than zero");
  }

  // Pre-flight check for duplicate UTR
  const { data: existingUtr } = await supabaseAdmin
    .from("payment_attempts")
    .select("id, payment_request_id, utr, created_at")
    .eq("utr", cleanUtr)
    .maybeSingle();

  if (existingUtr) {
    throw new Error(`UTR reference '${cleanUtr}' has already been submitted for verification. Duplicate submissions are not allowed.`);
  }

  const { data: req, error: reqErr } = await supabaseAdmin
    .from("engagement_payment_requests")
    .select("status, expires_at, secure_token")
    .eq("id", input.paymentRequestId)
    .maybeSingle();

  if (reqErr || !req) {
    throw new Error("Payment request not found");
  }

  if (!input.secureToken || typeof input.secureToken !== "string" || !input.secureToken.trim() || req.secure_token !== input.secureToken.trim()) {
    throw new Error("Unauthorized: Invalid payment token for this request");
  }

  if (req.status === "approved" || req.status === "cancelled") {
    throw new Error(`Cannot record payment attempt for payment in '${req.status}' status`);
  }

  if (new Date(req.expires_at).getTime() < Date.now()) {
    throw new Error("Payment request has expired");
  }

  const attemptPayload = {
    payment_request_id: input.paymentRequestId,
    utr: cleanUtr,
    payer_upi_id: input.payerUpiId ? input.payerUpiId.trim() : null,
    payer_bank_name: input.payerBankName ? input.payerBankName.trim() : null,
    reported_amount_paise: Math.round(input.reportedAmountPaise),
    payment_proof_storage_path: input.paymentProofStoragePath ?? null,
    notes: input.notes ?? null,
    client_ip: input.clientIp ?? null,
    user_agent: input.userAgent ?? null,
    status: "submitted",
  };

  const { data: attempt, error: attemptErr } = await supabaseAdmin
    .from("payment_attempts")
    .insert(attemptPayload)
    .select("*")
    .single();

  if (attemptErr || !attempt) {
    throw new Error(`Failed to submit payment attempt: ${attemptErr?.message || "Unknown error"}`);
  }

  // Update request status to 'payment_reported'
  if (req.status === "ready_to_pay" || req.status === "awaiting_billing_details") {
    await supabaseAdmin
      .from("engagement_payment_requests")
      .update({
        status: "payment_reported",
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.paymentRequestId);
  }

  return attempt as PaymentAttempt;
}

/**
 * Executes atomic bank reconciliation & approval via the Postgres RPC reconcile_and_approve_payment.
 * Requires super_admin actor. Unlocks downstream lifecycle stages (Stage 7 or Stage 12).
 */
export async function reconcileAndApprovePayment(input: ReconcilePaymentInput): Promise<ReconciliationRpcResult> {
  if (!input.bankCreditReference || !input.bankCreditReference.trim()) {
    return { success: false, error: "Bank credit reference is required for reconciliation" };
  }

  if (input.bankCreditAmountPaise <= 0) {
    return { success: false, error: "Bank credit amount must be greater than zero paise" };
  }

  const { data, error } = await supabaseAdmin.rpc("reconcile_and_approve_payment", {
    p_payment_request_id: input.paymentRequestId,
    p_payment_attempt_id: input.paymentAttemptId,
    p_admin_user_id: input.adminUserId,
    p_bank_credit_reference: input.bankCreditReference.trim(),
    p_bank_credit_amount_paise: Math.round(input.bankCreditAmountPaise),
    p_receiving_bank: input.receivingBank?.trim() || "YES BANK / PTYES",
    p_reconciliation_notes: input.reconciliationNotes?.trim() || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as ReconciliationRpcResult;
}

/**
 * Stores a cryptographically hashed PDF document (Invoice or Receipt) and backlinks it to the request.
 */
export async function createFinancialDocument(input: CreateFinancialDocumentInput): Promise<FinancialDocument> {
  const hash = input.sha256Hash.toLowerCase().trim();
  if (!SHA256_REGEX.test(hash)) {
    throw new Error("Invalid sha256_hash: must be 64 lowercase hexadecimal characters.");
  }

  if (input.byteSize <= 0) {
    throw new Error("byte_size must be greater than 0");
  }

  const payload = {
    payment_request_id: input.paymentRequestId,
    doc_type: input.docType,
    document_number: input.documentNumber.trim(),
    title: input.title.trim(),
    storage_path: input.storagePath.trim(),
    sha256_hash: hash,
    byte_size: input.byteSize,
    client_id: input.clientId ?? null,
    proposal_id: input.proposalId ?? null,
    contract_id: input.contractId ?? null,
    status: input.status ?? "issued",
  };

  const { data: doc, error: docErr } = await supabaseAdmin
    .from("financial_documents")
    .insert(payload)
    .select("*")
    .single();

  if (docErr || !doc) {
    throw new Error(`Failed to create financial document: ${docErr?.message || "Unknown error"}`);
  }

  // Link invoice_id or receipt_id on the engagement payment request
  const linkUpdate = input.docType === "invoice" ? { invoice_id: doc.id } : { receipt_id: doc.id };
  await supabaseAdmin
    .from("engagement_payment_requests")
    .update(linkUpdate)
    .eq("id", input.paymentRequestId);

  return doc as FinancialDocument;
}

/**
 * Retrieves all financial documents for a payment request.
 */
export async function getFinancialDocumentsForPayment(paymentRequestId: string): Promise<FinancialDocument[]> {
  const { data, error } = await supabaseAdmin
    .from("financial_documents")
    .select("*")
    .eq("payment_request_id", paymentRequestId)
    .order("issued_at", { ascending: false });

  if (error || !data) return [];
  return data as FinancialDocument[];
}

/**
 * Sequential document number generator with database sequence fallback.
 */
export async function generateDocumentReference(prefix: "LIT-INV" | "LIT-REC" | "LIT-PAY"): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.rpc("next_reference", { p_prefix: prefix });
    if (!error && data && typeof data === "string") {
      return data;
    }
  } catch {
    // Graceful fallback to timestamped random reference if sequence RPC unavailable
  }

  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${rand}`;
}

// ── Internal Hydration Helper ────────────────────────────────────────────────

async function hydratePaymentDetails(request: EngagementPaymentRequest): Promise<PaymentRequestWithDetails> {
  const [
    beneficiaryRes,
    billingRes,
    attemptsRes,
    reconciliationsRes,
    documentsRes,
    companyRes,
    proposalRes,
  ] = await Promise.all([
    request.beneficiary_profile_id
      ? supabaseAdmin.from("payment_beneficiary_profiles").select("*").eq("id", request.beneficiary_profile_id).maybeSingle()
      : supabaseAdmin.from("payment_beneficiary_profiles").select("*").eq("is_active", true).limit(1).maybeSingle(),
    supabaseAdmin.from("payment_billing_submissions").select("*").eq("payment_request_id", request.id).maybeSingle(),
    supabaseAdmin.from("payment_attempts").select("*").eq("payment_request_id", request.id).order("created_at", { ascending: false }),
    supabaseAdmin.from("payment_reconciliations").select("*").eq("payment_request_id", request.id).order("created_at", { ascending: false }),
    supabaseAdmin.from("financial_documents").select("*").eq("payment_request_id", request.id).order("created_at", { ascending: false }),
    getCompanyCredentials(),
    request.proposal_id
      ? supabaseAdmin.from("proposals").select("*").eq("id", request.proposal_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    request,
    beneficiary: beneficiaryRes.data ? (beneficiaryRes.data as PaymentBeneficiaryProfile) : null,
    billing: billingRes.data ? (billingRes.data as PaymentBillingSubmission) : null,
    attempts: (attemptsRes.data as PaymentAttempt[]) || [],
    reconciliations: (reconciliationsRes.data as PaymentReconciliation[]) || [],
    documents: (documentsRes.data as FinancialDocument[]) || [],
    company: companyRes,
    proposal: proposalRes.data || null,
  };
}

