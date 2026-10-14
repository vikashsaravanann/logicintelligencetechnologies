export type CustomerType = "individual" | "company";

export type PaymentRequestStatus =
  | "awaiting_billing"
  | "ready_to_pay"
  | "payment_reported"
  | "under_review"
  | "approved"
  | "rejected"
  | "prerequisite_required";

export interface BillingDetailsInput {
  contactName: string;
  email: string;
  phone: string;
  customerType: CustomerType;
  companyName?: string;
  gstin?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  placeOfSupply: string;
  acknowledgement: boolean;
}

export interface UtrSubmissionInput {
  utr: string;
  payerUpiId?: string;
  bankName?: string;
  transferredAt?: string;
  screenshotUrl?: string;
  notes?: string;
  confirmation: boolean;
}

export interface MobileIntentLink {
  appId: "gpay" | "phonepe" | "paytm" | "bhim" | "generic";
  appName: string;
  url: string;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface PaymentPortalData {
  token: string;
  proposalId: string;
  proposalTitle: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string | null;
  stage: 6 | 11;
  stageName: string;
  milestoneTitle: string;
  milestonePercentage: number;
  subtotal: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstAmount: number;
  totalPayable: number;
  currency: string;
  isSowSigned: boolean;
  sowSignedAt?: string | null;
  status: PaymentRequestStatus;
  uniqueRef: string;
  billingDetails?: BillingDetailsInput | null;
  paymentAttempt?: {
    utr: string;
    payerUpiId?: string | null;
    bankName?: string | null;
    reportedAt: string;
    verifiedAt?: string | null;
    reconciliationRef?: string | null;
  } | null;
  // FORM-FIRST GATE: Under NO circumstances present until billingDetails submitted!
  upiUri?: string | null;
  qrCodeDataUrl?: string | null;
  mobileLinks?: MobileIntentLink[] | null;
}
