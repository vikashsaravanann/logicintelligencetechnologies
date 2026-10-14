/**
 * Dedicated UPI Payment Portal & Company Credentials Type Definitions
 * 
 * Supports Stage 6 (Initial 50% Commitment Deposit) & Stage 11 (Final 50% Delivery Balance)
 * payments, MSME/Udyam enterprise credentials, pure paise monetary math, and immutable audit ledgers.
 */

export type PaymentRequestStatus =
  | 'awaiting_billing_details'
  | 'ready_to_pay'
  | 'payment_reported'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type TaxMode = 'tax_exclusive' | 'tax_inclusive' | 'exempt';

export type CustomerType = 'individual' | 'company';

export type PaymentAttemptStatus = 'submitted' | 'verified' | 'rejected';

export type FinancialDocType = 'invoice' | 'receipt';

export type FinancialDocStatus = 'issued' | 'void';

export type PaymentStageNumber = 6 | 11;

/**
 * Authoritative enterprise credentials & MSME/Udyam registration details.
 */
export interface CompanyCredentials {
  id: string;
  enterprise_name: string;
  msme_udyam_number: string;
  msme_category: string;
  major_activity: string;
  registered_address: string;
  gstin: string | null;
  pan: string | null;
  official_email: string;
  official_website: string;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

/**
 * Founder-verified receiving UPI profiles.
 */
export interface PaymentBeneficiaryProfile {
  id: string;
  profile_label: string;
  upi_id: string;
  account_holder_name: string;
  display_brand_name: string;
  is_active: boolean;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Server-controlled monetary ledger record for engagement payments.
 * All monetary amounts are non-negative integer paise.
 */
export interface EngagementPaymentRequest {
  id: string;
  proposal_id: string | null;
  contract_id: string | null;
  client_id: string | null;
  milestone_index: number;
  stage_number: PaymentStageNumber;
  milestone_title: string;
  secure_token: string;
  subtotal_paise: number;
  discount_paise: number;
  tax_mode: TaxMode;
  gst_rate_bps: number; // e.g. 1800 = 18.00%
  is_interstate: boolean;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  total_payable_paise: number;
  beneficiary_profile_id: string | null;
  status: PaymentRequestStatus;
  expires_at: string;
  invoice_id: string | null;
  receipt_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Billing form submission snapshot required before UPI QR generation.
 */
export interface PaymentBillingSubmission {
  id: string;
  payment_request_id: string;
  customer_type: CustomerType;
  legal_name: string;
  company_name: string | null;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  client_gstin: string | null;
  place_of_supply: string;
  created_at: string;
}

/**
 * Client-submitted payment verification attempt with unique UTR.
 */
export interface PaymentAttempt {
  id: string;
  payment_request_id: string;
  utr: string;
  payer_upi_id: string | null;
  payer_bank_name: string | null;
  reported_amount_paise: number;
  payment_proof_storage_path: string | null;
  notes: string | null;
  client_ip: string | null;
  user_agent: string | null;
  status: PaymentAttemptStatus;
  created_at: string;
}

/**
 * Super-admin verified bank ledger reconciliation record.
 */
export interface PaymentReconciliation {
  id: string;
  payment_request_id: string;
  payment_attempt_id: string;
  verified_by: string;
  bank_credit_reference: string;
  bank_credit_amount_paise: number;
  credited_at: string;
  receiving_bank_account: string;
  reconciliation_notes: string | null;
  created_at: string;
}

/**
 * Cryptographically hashed PDF document (Invoice or Receipt).
 */
export interface FinancialDocument {
  id: string;
  payment_request_id: string;
  doc_type: FinancialDocType;
  document_number: string;
  title: string;
  storage_path: string;
  sha256_hash: string;
  byte_size: number;
  client_id: string | null;
  proposal_id: string | null;
  contract_id: string | null;
  status: FinancialDocStatus;
  issued_at: string;
  created_at: string;
}

// ── Operational Inputs & DTOs ────────────────────────────────────────────────

export interface CreatePaymentRequestInput {
  proposalId?: string | null;
  contractId?: string | null;
  clientId?: string | null;
  milestoneIndex?: number;
  stageNumber: PaymentStageNumber;
  milestoneTitle: string;
  subtotalPaise: number;
  discountPaise?: number;
  taxMode?: TaxMode;
  gstRateBps?: number;
  isInterstate?: boolean;
  beneficiaryProfileId?: string;
  expiresInDays?: number;
  secureToken?: string;
}

export interface SubmitBillingInput {
  paymentRequestId: string;
  customerType: CustomerType;
  legalName: string;
  companyName?: string | null;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  clientGstin?: string | null;
  placeOfSupply?: string;
}

export interface RecordPaymentAttemptInput {
  paymentRequestId: string;
  utr: string;
  payerUpiId?: string | null;
  payerBankName?: string | null;
  reportedAmountPaise: number;
  paymentProofStoragePath?: string | null;
  notes?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
}

export interface ReconcilePaymentInput {
  paymentRequestId: string;
  paymentAttemptId: string;
  adminUserId: string;
  bankCreditReference: string;
  bankCreditAmountPaise: number;
  receivingBank?: string;
  reconciliationNotes?: string;
}

export interface ReconciliationRpcResult {
  success: boolean;
  error?: string;
  reconciliation_id?: string;
  payment_request_id?: string;
}

export interface CreateFinancialDocumentInput {
  paymentRequestId: string;
  docType: FinancialDocType;
  documentNumber: string;
  title: string;
  storagePath: string;
  sha256Hash: string;
  byteSize: number;
  clientId?: string | null;
  proposalId?: string | null;
  contractId?: string | null;
  status?: FinancialDocStatus;
}

export interface UpdateCompanyCredentialsInput {
  enterpriseName?: string;
  msmeUdyamNumber?: string;
  msmeCategory?: string;
  majorActivity?: string;
  registeredAddress?: string;
  gstin?: string | null;
  pan?: string | null;
  officialEmail?: string;
  officialWebsite?: string;
}

export interface TaxCalculationInput {
  subtotalPaise: number;
  discountPaise?: number;
  taxMode?: TaxMode;
  gstRateBps?: number;
  isInterstate?: boolean;
  placeOfSupply?: string;
}

export interface TaxCalculationResult {
  subtotalPaise: number;
  discountPaise: number;
  taxableAmountPaise: number;
  taxMode: TaxMode;
  gstRateBps: number;
  isInterstate: boolean;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalTaxPaise: number;
  totalPayablePaise: number;
}

export interface UpiUriOptions {
  payeeVpa: string;
  payeeName: string;
  amountPaise: number;
  transactionNote: string;
  transactionRef?: string;
  merchantCode?: string;
}

export interface PaymentRequestWithDetails {
  request: EngagementPaymentRequest;
  beneficiary: PaymentBeneficiaryProfile | null;
  billing: PaymentBillingSubmission | null;
  attempts: PaymentAttempt[];
  reconciliations: PaymentReconciliation[];
  documents: FinancialDocument[];
  company: CompanyCredentials | null;
  proposal?: any | null;
}
