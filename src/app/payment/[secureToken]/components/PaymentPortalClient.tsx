"use client";

import React, { useState, useTransition, useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building,
  User,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  ArrowRight,
  ExternalLink,
  Lock,
  RefreshCw,
  HelpCircle,
  Phone,
  Mail,
  ChevronRight,
  Info,
  Smartphone,
} from "lucide-react";
import type { PaymentRequestWithDetails, CustomerType } from "@/types/payments";
import { formatPaiseToRupees } from "@/lib/payments/calculations";
import { getMobileIntentLinks, LIT_PAYEE_CONFIG } from "@/lib/payments/upi";
import { BankTransferCard } from "@/components/shared/BankTransferCard";
import {
  submitBillingFormAction,
  submitPaymentAttemptAction,
  type BillingFormActionState,
  type PaymentAttemptActionState,
} from "../actions";

interface PaymentPortalClientProps {
  paymentData: PaymentRequestWithDetails;
  upiUri: string | null;
  qrDataUrl: string | null;
  token: string;
}

const INDIAN_STATES = [
  { name: "Tamil Nadu", code: "33" },
  { name: "Karnataka", code: "29" },
  { name: "Maharashtra", code: "27" },
  { name: "Delhi", code: "07" },
  { name: "Telangana", code: "36" },
  { name: "Andhra Pradesh", code: "37" },
  { name: "Kerala", code: "32" },
  { name: "Gujarat", code: "24" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "West Bengal", code: "19" },
  { name: "Rajasthan", code: "08" },
  { name: "Haryana", code: "06" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Bihar", code: "10" },
  { name: "Punjab", code: "03" },
  { name: "Odisha", code: "21" },
  { name: "Assam", code: "18" },
  { name: "Goa", code: "30" },
  { name: "Uttarakhand", code: "05" },
  { name: "Jharkhand", code: "20" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Jammu and Kashmir", code: "01" },
  { name: "Chandigarh", code: "04" },
  { name: "Puducherry", code: "34" },
];

export function PaymentPortalClient({
  paymentData,
  upiUri,
  qrDataUrl,
  token,
}: PaymentPortalClientProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  const { request, billing, attempts, reconciliations, documents, proposal } = paymentData;
  const status = request.status;
  const stageNumber = request.stage_number || 6;

  // Copy state feedback
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Step 2: Billing Form State
  const [billingState, billingAction, isBillingPending] = useActionState<BillingFormActionState | null, FormData>(
    async (prev, formData) => {
      const res = await submitBillingFormAction(prev, formData);
      if (res.success) {
        startTransition(() => {
          router.refresh();
        });
      }
      return res;
    },
    null
  );

  const [customerType, setCustomerType] = useState<CustomerType>(billing?.customer_type || "company");
  const [placeOfSupply, setPlaceOfSupply] = useState<string>(billing?.place_of_supply || "Tamil Nadu - 33");

  // Step 4: UTR Submission State
  const [paymentAttemptState, paymentAttemptAction, isAttemptPending] = useActionState<PaymentAttemptActionState | null, FormData>(
    async (prev, formData) => {
      const res = await submitPaymentAttemptAction(prev, formData);
      if (res.success) {
        startTransition(() => {
          router.refresh();
        });
      }
      return res;
    },
    null
  );

  const [utrValue, setUtrValue] = useState<string>("");

  // Determine latest attempt & reconciliation
  const latestAttempt = attempts.length > 0 ? attempts[0] : null;
  const latestReconciliation = reconciliations.length > 0 ? reconciliations[0] : null;

  // Documents
  const invoiceDoc = documents.find((d) => d.doc_type === "invoice") || null;
  const receiptDoc = documents.find((d) => d.doc_type === "receipt") || null;
  const invoiceId = invoiceDoc?.id || request.invoice_id || request.id;
  const receiptId = receiptDoc?.id || request.receipt_id || request.id;

  // Mobile UPI deep-links
  const mobileIntentLinks = upiUri ? getMobileIntentLinks(upiUri) : [];

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] font-sans">
      <style>{`
        @keyframes litQrLaserSweep {
          0% {
            top: 6px;
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          88% {
            opacity: 1;
          }
          100% {
            top: calc(100% - 8px);
            opacity: 0;
          }
        }
        .lit-qr-laser-line {
          animation: litQrLaserSweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
      {/* Top Brand & Security Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[var(--lit-border-light,#DFE7EF)] shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--lit-navy,#0B2545)] to-[var(--lit-blue,#1565C0)] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              L
            </div>
            <div>
              <span className="font-poppins font-extrabold text-base sm:text-lg text-[var(--lit-navy,#0B2545)] tracking-tight block leading-tight">
                LOGIC INTELLIGENCE TECHNOLOGIES
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
                ENTERPRISE FINANCIAL CLEARING & SETTLEMENT
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>256-Bit Encrypted Session</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh settlement status"
              className="p-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-[var(--lit-blue,#1565C0)]" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Step 1: Milestone Summary & SOW Status Card */}
        <section className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-6 sm:p-8 shadow-xs mb-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--lit-blue,#1565C0)] via-[var(--lit-teal,#1FA9A2)] to-[var(--lit-navy,#0B2545)]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-sky-50 text-[var(--lit-blue,#1565C0)] border border-sky-200 font-mono">
                  {stageNumber === 6 ? "STAGE 06 · INITIAL 50% COMMITMENT" : "STAGE 11 · FINAL 50% DELIVERY"}
                </span>
                {status === "awaiting_billing_details" && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    Step 1 of 3: Awaiting Billing Details
                  </span>
                )}
                {status === "ready_to_pay" && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
                    Step 2 of 3: Ready for UPI Transfer
                  </span>
                )}
                {(status === "payment_reported" || status === "under_review") && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200">
                    Step 3 of 3: Under Super Admin Audit
                  </span>
                )}
                {status === "approved" && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Verified & Reconciled
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
                {proposal?.title || request.milestone_title || "Enterprise Engagement Milestone Payment"}
              </h1>
              <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)]">
                Milestone: <strong className="text-[var(--lit-ink,#121826)]">{request.milestone_title}</strong> · Engagement Ref:{" "}
                <span className="font-mono text-xs">{token.slice(0, 16)}</span>
              </p>
            </div>

            {/* Total Payable Box */}
            <div className="bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-2xl p-4 sm:p-5 text-right flex flex-col justify-center min-w-[240px]">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--lit-text-muted,#52677C)]">
                Total Payable Amount
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-[var(--lit-navy,#0B2545)] tracking-tight mt-1">
                {formatPaiseToRupees(request.total_payable_paise)}
              </span>
              <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
                {request.is_interstate ? "Includes 18% IGST (Inter-State)" : "Includes 9% CGST + 9% SGST (Tamil Nadu)"}
              </span>
            </div>
          </div>

          {/* Breakdown Mini-Grid */}
          <div className="mt-4 pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[var(--lit-text-muted,#52677C)] block">Subtotal (Excl. Tax)</span>
              <span className="font-mono font-bold text-[var(--lit-ink,#121826)]">
                {formatPaiseToRupees(request.subtotal_paise)}
              </span>
            </div>
            {request.is_interstate ? (
              <div>
                <span className="text-[var(--lit-text-muted,#52677C)] block">IGST (18%)</span>
                <span className="font-mono font-bold text-[var(--lit-ink,#121826)]">
                  {formatPaiseToRupees(request.igst_paise)}
                </span>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-[var(--lit-text-muted,#52677C)] block">CGST (9%)</span>
                  <span className="font-mono font-bold text-[var(--lit-ink,#121826)]">
                    {formatPaiseToRupees(request.cgst_paise)}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--lit-text-muted,#52677C)] block">SGST (9%)</span>
                  <span className="font-mono font-bold text-[var(--lit-ink,#121826)]">
                    {formatPaiseToRupees(request.sgst_paise)}
                  </span>
                </div>
              </>
            )}
            <div>
              <span className="text-[var(--lit-text-muted,#52677C)] block">Place of Supply</span>
              <span className="font-semibold text-[var(--lit-ink,#121826)]">
                {billing?.place_of_supply || "Tamil Nadu - 33"}
              </span>
            </div>
          </div>
        </section>

        {/* ── STEP 2: FORM-FIRST BILLING GATE ───────────────────────────────── */}
        {status === "awaiting_billing_details" && (
          <section className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-6 sm:p-10 shadow-xs mb-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                    Client Invoicing & Billing Details
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
                    Statutory requirement: Dynamic UPI QR code will be generated immediately after your billing snapshot is saved.
                  </p>
                </div>
              </div>

              {/* Security info alert */}
              <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Statutory Tax Compliance Gate</strong>
                  <p className="mt-0.5 text-amber-800">
                    Indian GST laws require full legal invoicing details prior to receiving and processing electronic funds transfers.
                    The official Tax Invoice PDF will be issued to these registered details.
                  </p>
                </div>
              </div>

              {billingState?.error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{billingState.error}</span>
                </div>
              )}

              <form action={billingAction} className="space-y-5">
                <input type="hidden" name="paymentRequestId" value={request.id} />
                <input type="hidden" name="token" value={token} />

                {/* Customer Classification */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-2">
                    Client Entity Classification *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        customerType === "company"
                          ? "border-[var(--lit-blue,#1565C0)] bg-sky-50/50 text-[var(--lit-navy,#0B2545)] font-medium shadow-xs"
                          : "border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-text-muted,#52677C)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="customerType"
                        value="company"
                        checked={customerType === "company"}
                        onChange={() => setCustomerType("company")}
                        className="sr-only"
                      />
                      <Building className="h-4 w-4 text-[var(--lit-blue,#1565C0)]" />
                      <span className="text-xs sm:text-sm">Company / LLP / Enterprise</span>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        customerType === "individual"
                          ? "border-[var(--lit-blue,#1565C0)] bg-sky-50/50 text-[var(--lit-navy,#0B2545)] font-medium shadow-xs"
                          : "border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-text-muted,#52677C)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="customerType"
                        value="individual"
                        checked={customerType === "individual"}
                        onChange={() => setCustomerType("individual")}
                        className="sr-only"
                      />
                      <User className="h-4 w-4 text-[var(--lit-blue,#1565C0)]" />
                      <span className="text-xs sm:text-sm">Individual / Sole Proprietor</span>
                    </label>
                  </div>
                  {billingState?.errors?.customerType && (
                    <p className="mt-1.5 text-xs text-rose-600 font-medium">{billingState.errors.customerType}</p>
                  )}
                </div>

                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      Full Legal Name (Authorized Signatory) *
                    </label>
                    <input
                      type="text"
                      name="legalName"
                      defaultValue={billing?.legal_name || ""}
                      placeholder="e.g. Anand Sharma"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                    {billingState?.errors?.legalName && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{billingState.errors.legalName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      {customerType === "company" ? "Registered Company / Entity Name *" : "Business / Brand Name (Optional)"}
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      defaultValue={billing?.company_name || ""}
                      placeholder="e.g. Apex Health Systems Pvt Ltd"
                      required={customerType === "company"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                    {billingState?.errors?.companyName && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{billingState.errors.companyName}</p>
                    )}
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      Billing Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={billing?.email || ""}
                      placeholder="accounts@yourcompany.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                    {billingState?.errors?.email && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{billingState.errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      Contact Phone (10-Digit Mobile) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={billing?.phone || ""}
                      placeholder="9876543210"
                      maxLength={12}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                    {billingState?.errors?.phone && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{billingState.errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Address Line 1 & Line 2 */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                    Registered Billing Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    defaultValue={billing?.address_line1 || ""}
                    placeholder="Floor, Suite, Building Name, Street"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                  />
                  {billingState?.errors?.addressLine1 && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{billingState.errors.addressLine1}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    name="addressLine2"
                    defaultValue={billing?.address_line2 || ""}
                    placeholder="Area, Landmark, Tech Park"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                  />
                </div>

                {/* City, State, PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={billing?.city || ""}
                      placeholder="Coimbatore"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                    {billingState?.errors?.city && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{billingState.errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      name="state"
                      defaultValue={billing?.state || "Tamil Nadu"}
                      placeholder="Tamil Nadu"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                    {billingState?.errors?.state && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{billingState.errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      6-Digit PIN Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      defaultValue={billing?.postal_code || ""}
                      placeholder="641021"
                      maxLength={6}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                    {billingState?.errors?.postalCode && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{billingState.errors.postalCode}</p>
                    )}
                  </div>
                </div>

                {/* Place of Supply Selection & GSTIN/PAN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      Place of Supply (GST) *
                    </label>
                    <select
                      name="placeOfSupply"
                      value={placeOfSupply}
                      onChange={(e) => setPlaceOfSupply(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s.code} value={`${s.name} - ${s.code}`}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      Client GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      name="clientGstin"
                      defaultValue={billing?.client_gstin || ""}
                      placeholder="33AAAAA0000A1Z5"
                      maxLength={15}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                    {billingState?.errors?.clientGstin && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{billingState.errors.clientGstin}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      Client PAN (Optional)
                    </label>
                    <input
                      type="text"
                      name="pan"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                    {billingState?.errors?.pan && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{billingState.errors.pan}</p>
                    )}
                  </div>
                </div>

                {/* Statutory Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      name="confirmation"
                      defaultChecked
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--lit-blue,#1565C0)] focus:ring-[var(--lit-blue,#1565C0)]"
                    />
                    <span className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                      I certify that the above billing address and tax registration details are accurate. I authorize Logic Intelligence
                      Technologies to issue statutory tax invoices based on these registered credentials.
                    </span>
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isBillingPending}
                    className="w-full py-4 px-6 rounded-2xl bg-[var(--lit-navy,#0B2545)] text-white font-semibold text-sm uppercase tracking-wider shadow-sm hover:bg-[#123663] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isBillingPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Saving Billing Record & Unlocking Dynamic QR…</span>
                      </>
                    ) : (
                      <>
                        <span>Save Billing Details & Unlock Dynamic UPI QR</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* ── STEP 3 & 4: READY TO PAY (DYNAMIC QR & UTR SUBMISSION) ─────────── */}
        {status === "ready_to_pay" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Left 7 Columns: Payee Transparency & Dynamic QR */}
            <div className="lg:col-span-7 space-y-6">
              {/* Payee Transparency Card */}
              <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--lit-border-light,#DFE7EF)] mb-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-poppins font-bold text-base sm:text-lg text-[var(--lit-navy,#0B2545)]">
                      Verified Payee Transparency Card
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Beneficiary
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[var(--lit-text-muted,#52677C)] block">Verified Account Holder</span>
                      <strong className="text-base font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                        {LIT_PAYEE_CONFIG.accountHolder}
                      </strong>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-[var(--lit-blue,#1565C0)] font-medium">
                      Founder / Payee
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[var(--lit-text-muted,#52677C)] block">UPI ID / Virtual Payment Address</span>
                      <strong className="text-base font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                        {LIT_PAYEE_CONFIG.upiId}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(LIT_PAYEE_CONFIG.upiId, "upiId")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] transition-all"
                    >
                      {copiedField === "upiId" ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy UPI</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      <span className="text-[var(--lit-text-muted,#52677C)] block">Organization Brand</span>
                      <strong className="text-[var(--lit-ink,#121826)] block mt-0.5">
                        {LIT_PAYEE_CONFIG.brandName}
                      </strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      <span className="text-[var(--lit-text-muted,#52677C)] block">Receiving Bank</span>
                      <strong className="text-[var(--lit-ink,#121826)] block mt-0.5">
                        YES BANK / PTYES
                      </strong>
                    </div>
                  </div>

                  {/* Disclosure Banner */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Manual UPI Transfer Notice:</strong> Electronic UPI payments are received directly by verified founder account{" "}
                      <strong>S VIKASH</strong> on behalf of <strong>Logic Intelligence Technologies</strong>. Once transferred, provide the 12-digit
                      UTR below for Super Admin ledger verification.
                    </span>
                  </div>

                  {/* Direct Axis Bank Transfer (NEFT/RTGS/IMPS) */}
                  <BankTransferCard
                    amount={formatPaiseToRupees(request.total_payable_paise)}
                    reference={token.slice(0, 16)}
                  />
                </div>
              </div>

              {/* Dynamic QR Code Card */}
              <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-6 sm:p-8 shadow-xs text-center">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--lit-blue,#1565C0)] block mb-1">
                  DYNAMIC UPI SCAN & PAY
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                  Scan With Any UPI App
                </h3>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1 mb-6">
                  Pre-encoded with the exact milestone total of{" "}
                  <strong className="font-mono text-[var(--lit-navy,#0B2545)] font-bold">
                    {formatPaiseToRupees(request.total_payable_paise)}
                  </strong>
                </p>

                {qrDataUrl ? (
                  <div className="mx-auto w-64 h-64 p-3 bg-white border-2 border-[var(--lit-navy,#0B2545)] rounded-2xl shadow-md flex items-center justify-center relative group overflow-hidden">
                    {/* 4 Corner Targeting Viewfinder Brackets */}
                    <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[var(--lit-blue,#1565C0)] rounded-tl-sm pointer-events-none" />
                    <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[var(--lit-blue,#1565C0)] rounded-tr-sm pointer-events-none" />
                    <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[var(--lit-blue,#1565C0)] rounded-bl-sm pointer-events-none" />
                    <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[var(--lit-blue,#1565C0)] rounded-br-sm pointer-events-none" />

                    {/* Sweeping Laser Scanline */}
                    <div className="lit-qr-laser-line absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#1FA9A2] to-transparent shadow-[0_0_12px_#1FA9A2,0_0_4px_#1565C0] pointer-events-none z-10" />

                    <Image
                      src={qrDataUrl}
                      alt="Dynamic UPI QR Code"
                      width={240}
                      height={240}
                      className="rounded-xl object-contain relative z-0"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="mx-auto w-64 h-64 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <QrCode className="h-16 w-16" />
                  </div>
                )}

                {/* Amount Copy Button */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy((request.total_payable_paise / 100).toFixed(2), "amount")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)] hover:bg-gray-100 transition-all"
                  >
                    {copiedField === "amount" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Amount Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Exact Amount ({formatPaiseToRupees(request.total_payable_paise)})</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Mobile Intent App Launchers */}
                {mobileIntentLinks.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[var(--lit-border-light,#DFE7EF)]">
                    <span className="text-xs font-semibold text-[var(--lit-text-muted,#52677C)] block mb-3">
                      Or Open Directly In Your Mobile UPI App:
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {mobileIntentLinks.map((link) => (
                        <a
                          key={link.appId}
                          href={link.url}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-medium text-[var(--lit-ink,#121826)] hover:bg-[var(--lit-cloud,#F7F9FC)] shadow-2xs transition-all"
                        >
                          <Smartphone className="h-3.5 w-3.5 text-[var(--lit-blue,#1565C0)]" />
                          <span>{link.appName}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: 4-Step Instructions & UTR Submission Form */}
            <div className="lg:col-span-5 space-y-6">
              {/* 4-Step Guide */}
              <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-6 sm:p-7 shadow-xs">
                <h3 className="font-poppins font-bold text-base text-[var(--lit-navy,#0B2545)] mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[var(--lit-blue,#1565C0)]" />
                  <span>How to Complete This Transfer</span>
                </h3>

                <ol className="space-y-3.5 text-xs text-[var(--lit-text-muted,#52677C)]">
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-sky-100 text-[var(--lit-blue,#1565C0)] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Scan the dynamic QR code above using <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, or any UPI app.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-sky-100 text-[var(--lit-blue,#1565C0)] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Confirm that payee name displays <strong>S VIKASH</strong> and VPA is <strong>9342877474@ptyes</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-sky-100 text-[var(--lit-blue,#1565C0)] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Transfer the exact payable amount of{" "}
                      <strong className="text-[var(--lit-ink,#121826)]">{formatPaiseToRupees(request.total_payable_paise)}</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-sky-100 text-[var(--lit-blue,#1565C0)] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      4
                    </span>
                    <span>
                      Copy the <strong>12-digit UPI Reference / UTR</strong> number from your transaction details and submit below.
                    </span>
                  </li>
                </ol>
              </div>

              {/* UTR Submission Card */}
              <div className="bg-white border-2 border-[var(--lit-blue,#1565C0)]/30 rounded-3xl p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-[var(--lit-blue,#1565C0)]" />
                  <h3 className="font-poppins font-bold text-base text-[var(--lit-navy,#0B2545)]">
                    Submit 12-Digit UTR Reference
                  </h3>
                </div>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] mb-5">
                  Enter the transaction reference from your UPI receipt to trigger Super Admin bank verification.
                </p>

                {paymentAttemptState?.error && (
                  <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{paymentAttemptState.error}</span>
                  </div>
                )}

                <form action={paymentAttemptAction} className="space-y-4">
                  <input type="hidden" name="paymentRequestId" value={request.id} />
                  <input type="hidden" name="token" value={token} />
                  <input type="hidden" name="reportedAmountPaise" value={request.total_payable_paise} />

                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      12-Digit UPI UTR / Reference Number *
                    </label>
                    <input
                      type="text"
                      name="utr"
                      value={utrValue}
                      onChange={(e) => setUtrValue(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 22))}
                      placeholder="e.g. 428910398471"
                      required
                      className="w-full px-3.5 py-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white font-mono text-base tracking-widest text-[var(--lit-navy,#0B2545)] font-bold focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--lit-text-muted,#52677C)]">
                      <span>Must be the 12-digit UPI reference from your receipt</span>
                      <span className="font-mono">{utrValue.length}/12</span>
                    </div>
                    {paymentAttemptState?.errors?.utr && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{paymentAttemptState.errors.utr}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      Payer UPI ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="payerUpiId"
                      placeholder="client@okhdfcbank"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      Payer Bank Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="payerBankName"
                      placeholder="e.g. HDFC Bank / ICICI Bank"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--lit-navy,#0B2545)] mb-1">
                      Remarks / Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      placeholder="Any additional bank reference remarks"
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="confirmation"
                        required
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--lit-blue,#1565C0)] focus:ring-[var(--lit-blue,#1565C0)]"
                      />
                      <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] leading-snug">
                        I confirm that I have transferred the exact sum of {formatPaiseToRupees(request.total_payable_paise)} to S VIKASH
                        and this 12-digit UTR is accurate.
                      </span>
                    </label>
                    {paymentAttemptState?.errors?.confirmation && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{paymentAttemptState.errors.confirmation}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isAttemptPending}
                      className="w-full py-3.5 px-5 rounded-2xl bg-[var(--lit-blue,#1565C0)] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider shadow-sm hover:bg-[#0D47A1] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAttemptPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Submitting UTR For Verification…</span>
                        </>
                      ) : (
                        <>
                          <span>Submit UTR for Super Admin Audit</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: UNDER REVIEW STATE ────────────────────────────────────── */}
        {(status === "payment_reported" || status === "under_review") && (
          <section className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-8 sm:p-12 shadow-xs mb-8 text-center max-w-2xl mx-auto">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-50 text-purple-700 border border-purple-200">
              <Clock className="h-10 w-10 animate-pulse text-purple-600" />
            </div>

            <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-widest block mb-2">
              AUDIT PENDING · STAGE {stageNumber}
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
              Payment Under Super Admin Verification
            </h2>

            <p className="mt-3 text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              Your transaction reference has been recorded in our financial ledger. Our Super Admin team verifies bank credits against
              our YES BANK statement within <strong>1 to 4 business hours</strong>.
            </p>

            {/* Submitted Transaction Details Box */}
            <div className="mt-6 p-5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--lit-text-muted,#52677C)]">Submitted UPI UTR</span>
                <span className="font-mono text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  {latestAttempt?.utr || "Pending recording"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--lit-text-muted,#52677C)]">Reported Amount</span>
                <span className="font-mono text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  {formatPaiseToRupees(latestAttempt?.reported_amount_paise || request.total_payable_paise)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--lit-text-muted,#52677C)]">Submitted Timestamp</span>
                <span className="text-xs text-[var(--lit-ink,#121826)]">
                  {latestAttempt ? new Date(latestAttempt.created_at).toLocaleString("en-IN") : "Just now"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--lit-text-muted,#52677C)]">Receiving Bank</span>
                <span className="text-xs font-semibold text-[var(--lit-ink,#121826)]">YES BANK / PTYES (S VIKASH)</span>
              </div>
            </div>

            {/* Milestone Stages Indicator */}
            <div className="mt-8 pt-6 border-t border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-text-muted,#52677C)]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>1. Billing Saved</span>
                </div>
                <div className="hidden sm:block text-gray-300">→</div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>2. UTR Submitted</span>
                </div>
                <div className="hidden sm:block text-gray-300">→</div>
                <div className="flex items-center gap-1.5 text-purple-700 font-semibold animate-pulse">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>3. Super Admin Audit</span>
                </div>
                <div className="hidden sm:block text-gray-300">→</div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <FileText className="h-4 w-4" />
                  <span>4. Tax Invoice & Receipts</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--lit-navy,#0B2545)] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[#123663] transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Check Verification Status</span>
              </button>
            </div>
          </section>
        )}

        {/* ── STEP 6: VERIFIED & APPROVED STATE ─────────────────────────────── */}
        {status === "approved" && (
          <section className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-8 sm:p-12 shadow-xs mb-8 text-center max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-[var(--lit-blue,#1565C0)]" />

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700 border-2 border-emerald-200">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>

            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-widest block mb-2">
              RECONCILED & AUDITED · STAGE {stageNumber}
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
              Payment Verified & Approved
            </h2>

            <p className="mt-3 text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-xl mx-auto">
              Your manual UPI transfer has been verified against YES BANK credit statements by our Super Admin accounts team.
              Your official Tax Invoice and Payment Receipt are available for download below.
            </p>

            {/* Reconciliation Audit Info */}
            <div className="mt-6 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-left text-xs space-y-2 max-w-lg mx-auto">
              <div className="flex items-center justify-between">
                <span className="text-[var(--lit-text-muted,#52677C)]">Settled Amount</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  {formatPaiseToRupees(latestReconciliation?.bank_credit_amount_paise || request.total_payable_paise)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--lit-text-muted,#52677C)]">Bank Credit Reference</span>
                <span className="font-mono font-semibold text-[var(--lit-navy,#0B2545)]">
                  {latestReconciliation?.bank_credit_reference || latestAttempt?.utr || "YESB-RECONCILED"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--lit-text-muted,#52677C)]">Credited At</span>
                <span className="text-[var(--lit-ink,#121826)]">
                  {latestReconciliation?.credited_at
                    ? new Date(latestReconciliation.credited_at).toLocaleString("en-IN")
                    : new Date().toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--lit-text-muted,#52677C)]">Receiving Bank</span>
                <span className="font-medium text-[var(--lit-ink,#121826)]">
                  {latestReconciliation?.receiving_bank_account || "YES BANK / PTYES"}
                </span>
              </div>
            </div>

            {/* Dual Document Download Section */}
            <div className="mt-8 pt-8 border-t border-[var(--lit-border-light,#DFE7EF)]">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[var(--lit-text-muted,#52677C)] mb-4">
                Official Financial Documents (PDF)
              </h4>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={`/api/documents/invoice/${invoiceId}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] px-6 py-3.5 text-xs font-semibold text-[var(--lit-navy,#0B2545)] shadow-xs hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-[var(--lit-blue,#1565C0)] transition-all"
                >
                  <FileText className="h-4 w-4 text-[var(--lit-blue,#1565C0)]" />
                  <span>Download Tax Invoice (PDF)</span>
                  <Download className="h-3.5 w-3.5 text-[var(--lit-text-muted,#52677C)]" />
                </a>

                <a
                  href={`/api/documents/receipt/${receiptId}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] px-6 py-3.5 text-xs font-semibold text-[var(--lit-navy,#0B2545)] shadow-xs hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-emerald-500 transition-all"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Download Payment Receipt (PDF)</span>
                  <Download className="h-3.5 w-3.5 text-[var(--lit-text-muted,#52677C)]" />
                </a>
              </div>
            </div>

            {/* Next Stage Navigation CTA */}
            <div className="mt-8 pt-6">
              {stageNumber === 6 ? (
                <Link
                  href={`/onboarding/${token}`}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[var(--lit-navy,#0B2545)] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#123663] transition-all group"
                >
                  <span>Proceed to Stage 07: Client Onboarding</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  href={`/handover/${token}`}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[var(--lit-navy,#0B2545)] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-md hover:bg-[#123663] transition-all group"
                >
                  <span>Proceed to Stage 12: Project Handover & Delivery</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </section>
        )}

        {/* ── REJECTION OR CANCELLATION STATE ──────────────────────────────── */}
        {(status === "rejected" || status === "cancelled") && (
          <section className="bg-white border border-rose-200 rounded-3xl p-8 sm:p-12 shadow-xs mb-8 text-center max-w-xl mx-auto">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="h-8 w-8 text-rose-600" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              {status === "rejected" ? "Payment Verification Unsuccessful" : "Payment Session Cancelled"}
            </h2>

            <p className="mt-3 text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              {status === "rejected"
                ? "The submitted UTR transaction reference could not be reconciled against our YES BANK bank credits. Please verify your transaction receipt or contact our accounts desk."
                : "This milestone payment session has been marked as cancelled. Please contact your LIT engagement lead for assistance."}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`mailto:hello@logicintelligencetechnologies.in?subject=Payment%20Discrepancy%20Ref%20${encodeURIComponent(token)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#123663] transition-all"
              >
                <Mail className="h-4 w-4" />
                <span>Contact Accounts Desk</span>
              </a>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--lit-ink,#121826)] hover:bg-[var(--lit-cloud,#F7F9FC)] transition-all"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </section>
        )}

        {/* Footer Support & Enterprise Details */}
        <footer className="mt-12 pt-8 border-t border-[var(--lit-border-light,#DFE7EF)] text-center text-xs text-[var(--lit-text-muted,#52677C)]">
          <p className="font-medium text-[var(--lit-navy,#0B2545)]">
            LOGIC INTELLIGENCE TECHNOLOGIES · MSME UDYAM: UDYAM-TN-03-0345274
          </p>
          <p className="mt-1">
            Registered Address: Eachanari, Coimbatore, Tamil Nadu 641021, India · Official Email: hello@logicintelligencetechnologies.in
          </p>
          <p className="mt-2 text-[11px] text-gray-400">
            All electronic payment submissions are logged and cryptographically audited under standard Indian banking security guidelines.
          </p>
        </footer>
      </main>
    </div>
  );
}
