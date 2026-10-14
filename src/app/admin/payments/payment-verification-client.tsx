"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  CreditCard,
  ShieldCheck,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Download,
  Check,
  Copy,
  X,
  FileText,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Hash,
  Landmark,
} from "lucide-react";
import { formatIST, formatINR } from "@/lib/format/datetime";
import {
  approveAndIssueDocumentsAction,
  rejectPaymentReportAction,
  type ApprovePaymentResult,
} from "./actions";

export interface PaymentRequestListItem {
  id: string;
  milestone_title: string;
  stage_number: number;
  milestone_index: number;
  total_payable_paise: number;
  subtotal_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  is_interstate: boolean;
  status: string;
  secure_token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  invoice_id?: string | null;
  receipt_id?: string | null;

  client?: {
    id: string;
    name: string;
    company_name?: string | null;
    email: string;
    phone?: string | null;
  } | null;

  billing_submission?: {
    id: string;
    customer_type: string;
    legal_name: string;
    company_name?: string | null;
    email: string;
    phone: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    client_gstin?: string | null;
    place_of_supply: string;
  } | null;

  attempts: Array<{
    id: string;
    utr: string;
    payer_upi_id?: string | null;
    payer_bank_name?: string | null;
    reported_amount_paise: number;
    payment_proof_storage_path?: string | null;
    notes?: string | null;
    status: string;
    created_at: string;
  }>;

  reconciliation?: {
    id: string;
    bank_credit_reference: string;
    bank_credit_amount_paise: number;
    credited_at: string;
    receiving_bank_account: string;
    reconciliation_notes?: string | null;
  } | null;

  invoice_doc?: {
    id: string;
    document_number: string;
    title: string;
    sha256_hash: string;
    issued_at: string;
  } | null;

  receipt_doc?: {
    id: string;
    document_number: string;
    title: string;
    sha256_hash: string;
    issued_at: string;
  } | null;
}

interface Props {
  initialRequests: PaymentRequestListItem[];
}

type TabKey = "ALL" | "UNDER_REVIEW" | "APPROVED" | "AWAITING_PAYMENT";

export default function PaymentVerificationClient({ initialRequests }: Props) {
  const [requests, setRequests] = useState<PaymentRequestListItem[]>(initialRequests);
  const [activeTab, setActiveTab] = useState<TabKey>("UNDER_REVIEW");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequestListItem | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Verification modal form state
  const [bankCreditRef, setBankCreditRef] = useState("");
  const [verifiedAmountINR, setVerifiedAmountINR] = useState<number>(0);
  const [receivingBank, setReceivingBank] = useState("YES BANK / PTYES");
  const [reconciliationNotes, setReconciliationNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [approveResult, setApproveResult] = useState<ApprovePaymentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rejection sub-state
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Tab counts
  const underReviewCount = requests.filter(
    (r) => r.status === "under_review" || r.status === "payment_reported"
  ).length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const awaitingPaymentCount = requests.filter(
    (r) => r.status === "awaiting_billing_details" || r.status === "ready_to_pay"
  ).length;

  const filteredRequests = requests.filter((req) => {
    // Filter tab check
    if (activeTab === "UNDER_REVIEW") {
      if (req.status !== "under_review" && req.status !== "payment_reported") return false;
    } else if (activeTab === "APPROVED") {
      if (req.status !== "approved") return false;
    } else if (activeTab === "AWAITING_PAYMENT") {
      if (req.status !== "awaiting_billing_details" && req.status !== "ready_to_pay") return false;
    }

    // Search query check
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = req.milestone_title.toLowerCase().includes(q);
    const clientNameMatch =
      req.billing_submission?.legal_name?.toLowerCase().includes(q) ||
      req.client?.name?.toLowerCase().includes(q);
    const companyMatch =
      req.billing_submission?.company_name?.toLowerCase().includes(q) ||
      req.client?.company_name?.toLowerCase().includes(q);
    const utrMatch = req.attempts.some((a) => a.utr.toLowerCase().includes(q));
    const invoiceMatch = req.invoice_doc?.document_number.toLowerCase().includes(q);
    const receiptMatch = req.receipt_doc?.document_number.toLowerCase().includes(q);

    return titleMatch || clientNameMatch || companyMatch || utrMatch || invoiceMatch || receiptMatch;
  });

  const openReconcileModal = (req: PaymentRequestListItem) => {
    setSelectedRequest(req);
    setBankCreditRef("");
    setVerifiedAmountINR(req.total_payable_paise / 100);
    setReceivingBank("YES BANK / PTYES");
    setReconciliationNotes("");
    setApproveResult(null);
    setErrorMessage(null);
    setShowRejectForm(false);
    setRejectReason("");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
    setTimeout(() => setCopiedUtr(null), 2500);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    const latestAttempt = selectedRequest.attempts[0];
    if (!latestAttempt) {
      setErrorMessage("No client payment attempt submitted for this request.");
      return;
    }
    if (!bankCreditRef.trim()) {
      setErrorMessage("Please enter the verified bank credit reference.");
      return;
    }

    setIsApproving(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("paymentRequestId", selectedRequest.id);
      formData.append("paymentAttemptId", latestAttempt.id);
      formData.append("bankCreditReference", bankCreditRef.trim());
      formData.append(
        "verifiedAmountPaise",
        Math.round(verifiedAmountINR * 100).toString()
      );
      formData.append("receivingBank", receivingBank.trim());
      if (reconciliationNotes.trim()) {
        formData.append("reconciliationNotes", reconciliationNotes.trim());
      }

      const res = await approveAndIssueDocumentsAction(formData);
      setApproveResult(res);

      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? {
                ...r,
                status: "approved",
                invoice_doc: res.invoiceNumber
                  ? {
                      id: "inv-" + selectedRequest.id,
                      document_number: res.invoiceNumber,
                      title: `Tax Invoice - ${selectedRequest.milestone_title}`,
                      sha256_hash: "verified-sha256",
                      issued_at: new Date().toISOString(),
                    }
                  : r.invoice_doc,
                receipt_doc: res.receiptNumber
                  ? {
                      id: "rec-" + selectedRequest.id,
                      document_number: res.receiptNumber,
                      title: `Payment Receipt - ${selectedRequest.milestone_title}`,
                      sha256_hash: "verified-sha256",
                      issued_at: new Date().toISOString(),
                    }
                  : r.receipt_doc,
              }
            : r
        )
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Payment verification and approval failed"
      );
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      setErrorMessage("Please provide a rejection note explaining why this report was declined.");
      return;
    }

    setIsRejecting(true);
    setErrorMessage(null);

    try {
      const latestAttempt = selectedRequest.attempts[0];
      const formData = new FormData();
      formData.append("paymentRequestId", selectedRequest.id);
      if (latestAttempt) {
        formData.append("paymentAttemptId", latestAttempt.id);
      }
      formData.append("reason", rejectReason.trim());

      await rejectPaymentReportAction(formData);

      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id ? { ...r, status: "rejected" } : r
        )
      );

      setSelectedRequest(null);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to reject payment report"
      );
    } finally {
      setIsRejecting(false);
    }
  };

  const formatStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Issued
          </span>
        );
      case "under_review":
      case "payment_reported":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Under Review
          </span>
        );
      case "ready_to_pay":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-3.5 h-3.5" /> Awaiting Payment
          </span>
        );
      case "awaiting_billing_details":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-3.5 h-3.5" /> Awaiting Billing
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b sm:border-b-0 border-slate-200 pb-2 sm:pb-0">
          <button
            onClick={() => setActiveTab("UNDER_REVIEW")}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "UNDER_REVIEW"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Under Review</span>
            {underReviewCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === "UNDER_REVIEW"
                    ? "bg-amber-700 text-white"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {underReviewCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All ({requests.length})
          </button>

          <button
            onClick={() => setActiveTab("APPROVED")}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "APPROVED"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Approved</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === "APPROVED"
                  ? "bg-emerald-800 text-white"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("AWAITING_PAYMENT")}
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === "AWAITING_PAYMENT"
                ? "bg-blue-700 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>Awaiting Payment</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === "AWAITING_PAYMENT"
                  ? "bg-blue-800 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {awaitingPaymentCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client, UTR, doc #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          />
        </div>
      </div>

      {/* Payment Requests Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 px-4">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              No payment requests found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {activeTab === "UNDER_REVIEW"
                ? "No client-reported payments are currently pending verification."
                : "No payment records match the selected criteria or search term."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Milestone & Stage</th>
                  <th className="py-3.5 px-4">Client / Company</th>
                  <th className="py-3.5 px-4">Payable Amount</th>
                  <th className="py-3.5 px-4">Client UTR / Status</th>
                  <th className="py-3.5 px-4">Documents / Verification</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const clientName =
                    req.billing_submission?.legal_name ||
                    req.client?.name ||
                    "Direct Client";
                  const companyName =
                    req.billing_submission?.company_name ||
                    req.client?.company_name ||
                    null;
                  const latestAttempt = req.attempts[0];
                  const isUnderReview =
                    req.status === "under_review" ||
                    req.status === "payment_reported";

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isUnderReview ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Milestone & Stage */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">
                          {req.milestone_title}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span className="font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px]">
                            Stage {req.stage_number}
                          </span>
                          <span>·</span>
                          <span>Created {formatIST(req.created_at)}</span>
                        </div>
                      </td>

                      {/* Client / Company */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{clientName}</span>
                        </div>
                        {companyName && (
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{companyName}</span>
                          </div>
                        )}
                        <div className="text-xs text-slate-400 mt-0.5">
                          {req.billing_submission?.email || req.client?.email || "—"}
                        </div>
                      </td>

                      {/* Payable Amount */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {formatINR(req.total_payable_paise / 100)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {req.is_interstate
                            ? "IGST 18%"
                            : "CGST 9% + SGST 9%"}
                        </div>
                      </td>

                      {/* Client UTR / Status */}
                      <td className="py-4 px-4">
                        <div className="mb-1">{formatStatusBadge(req.status)}</div>
                        {latestAttempt ? (
                          <div className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <Hash className="w-3 h-3 text-slate-400" />
                            <span>{latestAttempt.utr}</span>
                            <button
                              onClick={() => handleCopy(latestAttempt.utr)}
                              title="Copy UTR"
                              className="text-slate-400 hover:text-slate-600 ml-0.5"
                            >
                              {copiedUtr === latestAttempt.utr ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No UTR reported
                          </span>
                        )}
                      </td>

                      {/* Documents / Verification */}
                      <td className="py-4 px-4">
                        {req.status === "approved" ? (
                          <div className="space-y-1">
                            {req.invoice_doc && (
                              <div className="flex items-center gap-1 text-xs">
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                <Link
                                  href={`/api/documents/financial/${req.invoice_doc.id}`}
                                  target="_blank"
                                  className="text-blue-700 hover:underline font-mono"
                                >
                                  {req.invoice_doc.document_number}
                                </Link>
                              </div>
                            )}
                            {req.receipt_doc && (
                              <div className="flex items-center gap-1 text-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <Link
                                  href={`/api/documents/financial/${req.receipt_doc.id}`}
                                  target="_blank"
                                  className="text-emerald-700 hover:underline font-mono"
                                >
                                  {req.receipt_doc.document_number}
                                </Link>
                              </div>
                            )}
                          </div>
                        ) : req.reconciliation ? (
                          <div className="text-xs font-mono text-slate-600">
                            Bank Ref: {req.reconciliation.bank_credit_reference}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Pending Ledger Match
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {isUnderReview ? (
                          <button
                            onClick={() => openReconcileModal(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Review & Reconcile</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openReconcileModal(req)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Reconcile Modal / Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  S{selectedRequest.stage_number}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Review & Reconcile Payment
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedRequest.milestone_title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Alert message if error */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Result View */}
              {approveResult && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Payment Approved & Documents Issued!</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    The atomic bank reconciliation record has been committed to the ledger.
                    The official Tax Invoice and Payment Receipt PDFs have been archived and
                    dispatched via email to the client.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {approveResult.invoiceDownloadUrl && (
                      <Link
                        href={approveResult.invoiceDownloadUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Tax Invoice ({approveResult.invoiceNumber})</span>
                      </Link>
                    )}
                    {approveResult.receiptDownloadUrl && (
                      <Link
                        href={approveResult.receiptDownloadUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Payment Receipt ({approveResult.receiptNumber})</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* 1. Client & Entity Profile */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Client & Billing Profile</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Legal Name:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedRequest.billing_submission?.legal_name ||
                        selectedRequest.client?.name ||
                        "Direct Enterprise Client"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Company:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {selectedRequest.billing_submission?.company_name ||
                        selectedRequest.client?.company_name ||
                        "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Billing Email:</span>
                    <p className="font-medium text-slate-800 mt-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {selectedRequest.billing_submission?.email ||
                        selectedRequest.client?.email ||
                        "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>
                    <p className="font-medium text-slate-800 mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {selectedRequest.billing_submission?.phone ||
                        selectedRequest.client?.phone ||
                        "—"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400">Billing Address:</span>
                    <p className="font-medium text-slate-700 mt-0.5">
                      {[
                        selectedRequest.billing_submission?.address_line1,
                        selectedRequest.billing_submission?.address_line2,
                        selectedRequest.billing_submission?.city,
                        selectedRequest.billing_submission?.state,
                        selectedRequest.billing_submission?.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                  {selectedRequest.billing_submission?.client_gstin && (
                    <div>
                      <span className="text-slate-400">Client GSTIN:</span>
                      <p className="font-mono font-medium text-slate-800 mt-0.5">
                        {selectedRequest.billing_submission.client_gstin}
                      </p>
                    </div>
                  )}
                  {selectedRequest.billing_submission?.place_of_supply && (
                    <div>
                      <span className="text-slate-400">Place of Supply:</span>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {selectedRequest.billing_submission.place_of_supply}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Client-Reported Payment Details */}
              <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/80">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                  <span>Client-Reported Payment Details</span>
                </h4>
                {selectedRequest.attempts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No payment attempt has been reported by the client yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Client-Reported UTR:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                          {selectedRequest.attempts[0].utr}
                        </span>
                        <button
                          onClick={() => handleCopy(selectedRequest.attempts[0].utr)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded"
                        >
                          {copiedUtr === selectedRequest.attempts[0].utr ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">Reported Amount:</span>
                      <p className="font-bold text-sm text-slate-900 mt-0.5">
                        {formatINR(
                          selectedRequest.attempts[0].reported_amount_paise / 100
                        )}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500">Reported Timestamp:</span>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {formatIST(selectedRequest.attempts[0].created_at)}
                      </p>
                    </div>

                    {selectedRequest.attempts[0].payer_upi_id && (
                      <div>
                        <span className="text-slate-500">Payer UPI ID:</span>
                        <p className="font-mono text-slate-800 mt-0.5">
                          {selectedRequest.attempts[0].payer_upi_id}
                        </p>
                      </div>
                    )}

                    {selectedRequest.attempts[0].payment_proof_storage_path && (
                      <div className="sm:col-span-2 pt-1">
                        <span className="text-slate-500">Payment Proof Document:</span>
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 font-mono">
                            <FileText className="w-3.5 h-3.5" />
                            {selectedRequest.attempts[0].payment_proof_storage_path}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Super Admin Verification Inputs */}
              {!approveResult && selectedRequest.status !== "approved" && (
                <div className="space-y-4 pt-1">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bank Ledger Reconciliation Inputs</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bank Credit Reference */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Verified Bank Credit Reference <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. YESB-CMS-20261014-9918 or IMPS/428910398471"
                        value={bankCreditRef}
                        onChange={(e) => setBankCreditRef(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Must match the transaction reference on official YES BANK net banking statement.
                      </span>
                    </div>

                    {/* Verified Amount */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Verified Credit Amount (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={verifiedAmountINR}
                        onChange={(e) => setVerifiedAmountINR(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
                        required
                      />
                    </div>

                    {/* Receiving Bank Account */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Receiving Bank Account
                      </label>
                      <input
                        type="text"
                        value={receivingBank}
                        onChange={(e) => setReceivingBank(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                      />
                    </div>

                    {/* Reconciliation Notes */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Reconciliation Notes (Internal Audit)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Optional internal reconciliation remarks or bank clearance ledger ID..."
                        value={reconciliationNotes}
                        onChange={(e) => setReconciliationNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rejection Form Toggle */}
              {showRejectForm && !approveResult && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Decline / Reject Payment Report</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reason for Rejection <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. UTR not found on bank ledger, incorrect amount transferred, or invalid screenshot proof."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border border-red-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={isRejecting || !rejectReason.trim()}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isRejecting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Rejecting...</span>
                        </>
                      ) : (
                        <span>Confirm Rejection</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                {!showRejectForm && !approveResult && selectedRequest.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline"
                  >
                    Reject Payment Report
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {approveResult ? "Close" : "Cancel"}
                </button>

                {!approveResult && selectedRequest.status !== "approved" && (
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isApproving || !bankCreditRef.trim() || verifiedAmountINR <= 0}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying & Issuing PDFs...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve & Issue Documents</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
