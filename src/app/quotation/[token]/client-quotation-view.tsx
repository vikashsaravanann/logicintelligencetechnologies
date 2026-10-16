"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  QuotationRecord,
  PublicQuotationProjection,
} from "@/types/quotations";
import { formatPaiseToINR } from "@/lib/quotations/pricing";
import {
  applyCouponAction,
  acceptQuotationClientAction,
  requestQuotationRevisionClientAction,
} from "@/lib/quotations/actions";
import {
  FileText,
  Download,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  Check,
  Layers,
  ArrowRight,
  MessageSquare,
  X,
  Loader2,
  Sparkles,
  Send,
} from "lucide-react";

interface ClientQuotationViewProps {
  token: string;
  quotation: QuotationRecord;
  initialProjection: PublicQuotationProjection;
}

export function ClientQuotationView({
  token,
  quotation,
  initialProjection,
}: ClientQuotationViewProps) {
  const [projection, setProjection] = useState<PublicQuotationProjection>(initialProjection);
  const [currentStatus, setCurrentStatus] = useState<string>(quotation.status);

  // Coupon state
  const [couponCode, setCouponCode] = useState<string>("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Revision state
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [revisionName, setRevisionName] = useState<string>(quotation.recipient_name || "");
  const [revisionEmail, setRevisionEmail] = useState<string>(quotation.recipient_email || "");
  const [revisionNotes, setRevisionNotes] = useState<string>("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState<boolean>(false);
  const [revisionSuccess, setRevisionSuccess] = useState<boolean>(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isRevisionModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isRevisionModalOpen]);

  // Formal acceptance state
  const [signerName, setSignerName] = useState<string>(quotation.recipient_name || "");
  const [signerEmail, setSignerEmail] = useState<string>(quotation.recipient_email || "");
  const [signerDesignation, setSignerDesignation] = useState<string>("");
  const [signerCompany, setSignerCompany] = useState<string>(quotation.company_name || "");

  // 4 Checkboxes
  const [consentScope, setConsentScope] = useState<boolean>(false);
  const [consentPricing, setConsentPricing] = useState<boolean>(false);
  const [consentMilestones, setConsentMilestones] = useState<boolean>(false);
  const [consentAuthority, setConsentAuthority] = useState<boolean>(false);

  const [isSubmittingAcceptance, setIsSubmittingAcceptance] = useState<boolean>(false);
  const [acceptanceError, setAcceptanceError] = useState<string | null>(null);
  const [acceptanceSuccess, setAcceptanceSuccess] = useState<boolean>(false);

  // Apply Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    setIsApplyingCoupon(true);
    setCouponMessage(null);

    try {
      const res = await applyCouponAction(token, cleanCode);
      if (res.success && res.data) {
        setCouponMessage({
          type: "success",
          text: `Coupon "${cleanCode}" applied: ${res.data.discountLabel}`,
        });

        // Update local projection values
        const calc = res.data.calculation;
        setProjection((prev) => ({
          ...prev,
          subtotal_paise: calc.subtotalPaise,
          discount_paise: calc.discountPaise,
          discount_label: res.data.discountLabel,
          tax_paise: calc.taxPaise,
          total_payable_paise: calc.totalPayablePaise,
          milestone_1_paise: calc.milestone1Paise,
          milestone_2_paise: calc.milestone2Paise,
        }));
      } else {
        setCouponMessage({
          type: "error",
          text: res.error || "Failed to apply coupon",
        });
      }
    } catch (err: any) {
      setCouponMessage({
        type: "error",
        text: err.message || "An unexpected error occurred",
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Submit Revision
  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNotes.trim()) {
      setRevisionError("Please describe your requested scope adjustments.");
      return;
    }

    setIsSubmittingRevision(true);
    setRevisionError(null);

    try {
      const res = await requestQuotationRevisionClientAction(token, {
        name: revisionName.trim(),
        email: revisionEmail.trim(),
        notes: revisionNotes.trim(),
      });

      if (res.success) {
        setRevisionSuccess(true);
        setCurrentStatus("changes_requested");
      } else {
        setRevisionError(res.error || "Failed to submit revision request.");
      }
    } catch (err: any) {
      setRevisionError(err.message || "Failed to submit revision request.");
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  // Submit Formal Acceptance
  const handleSubmitAcceptance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAcceptanceError(null);

    if (!signerName.trim()) {
      setAcceptanceError("Please enter the full legal name of the signatory.");
      return;
    }
    if (!signerEmail.trim()) {
      setAcceptanceError("Please enter your business email address.");
      return;
    }
    if (!consentScope || !consentPricing || !consentMilestones || !consentAuthority) {
      setAcceptanceError("You must check all four mandatory legal affirmations to execute acceptance.");
      return;
    }

    setIsSubmittingAcceptance(true);

    try {
      const res = await acceptQuotationClientAction(token, {
        clientName: signerName.trim(),
        clientEmail: signerEmail.trim().toLowerCase(),
        clientDesignation: signerDesignation.trim() || undefined,
        clientCompany: signerCompany.trim() || quotation.company_name,
        consentCheckboxes: {
          exact_version: consentScope,
          scope_and_pricing: consentPricing,
          two_milestones: consentMilestones,
          authority_declaration: consentAuthority,
        },
      });

      if (res.success) {
        setAcceptanceSuccess(true);
        setCurrentStatus("accepted");
      } else {
        setAcceptanceError(res.error || "Failed to process quotation acceptance.");
      }
    } catch (err: any) {
      setAcceptanceError(err.message || "Failed to process quotation acceptance.");
    } finally {
      setIsSubmittingAcceptance(false);
    }
  };

  const isAccepted = currentStatus === "accepted" || acceptanceSuccess;
  const isExpired = quotation.valid_until && new Date(quotation.valid_until) < new Date() && !isAccepted;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Brand Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white flex items-center justify-center font-bold text-lg shadow-xs">
            LIT
          </div>
          <div>
            <div className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
              Logic Intelligence Technologies
            </div>
            <div className="text-xs text-[var(--lit-text-muted,#52677C)] flex items-center gap-2">
              <span>Enterprise IT & Engineering Services</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                MSME UDYAM-TN-03-0345274
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/documents/quotation/${token}/pdf`}
            download={`LIT_Quotation_${quotation.quotation_ref || token}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[var(--lit-navy,#0B2545)] bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* Acceptance Success Banner */}
      {isAccepted && (
        <div className="p-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 text-emerald-900 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-emerald-950">
                Quotation Accepted & Legally Executed
              </h2>
              <p className="text-sm text-emerald-800 mt-1">
                Thank you, <span className="font-semibold">{signerName || quotation.recipient_name}</span>.
                Your formal digital acceptance has been recorded. The Statement of Work (SOW) and technical kickoff have been unlocked.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/client"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                >
                  <span>Go to Client Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={`/api/documents/quotation/${token}/pdf`}
                  download={`LIT_Quotation_${quotation.quotation_ref || token}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-800 bg-white border border-emerald-200 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revisions Requested Banner */}
      {currentStatus === "changes_requested" && !isAccepted && (
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 text-purple-900 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
          <div>
            <span className="font-semibold">Revisions Requested:</span> Our engineering leadership has received your scope feedback and is preparing an updated quotation version.
          </div>
        </div>
      )}

      {/* Main Quotation Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                {projection.quotation_ref}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Version {projection.version_number}
              </span>
              {isAccepted ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Executed
                </span>
              ) : isExpired ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3 h-3" /> Expired
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Active Quotation
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--lit-navy,#0B2545)]">
              {projection.project_title}
            </h1>
            {projection.project_brief && (
              <p className="mt-2 text-sm text-[var(--lit-text-muted,#52677C)] max-w-2xl leading-relaxed">
                {projection.project_brief}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 text-xs font-mono bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[220px]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Date Issued</span>
              <span className="font-semibold text-slate-800">
                {projection.date_issued ? new Date(projection.date_issued).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Current"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Valid Until</span>
              <span className={`font-semibold ${isExpired ? "text-amber-700" : "text-slate-800"}`}>
                {projection.valid_until ? new Date(projection.valid_until).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "14 Days"}
              </span>
            </div>
            {projection.timeline_estimate && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Timeline</span>
                <span className="font-semibold text-slate-800">{projection.timeline_estimate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Client & Issuer Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quotation Prepared For
            </span>
            <div className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">
              {projection.client.company_name}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{projection.client.contact_name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{projection.client.contact_email}</span>
            </div>
            {projection.client.contact_phone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{projection.client.contact_phone}</span>
              </div>
            )}
            {projection.client.billing_address && (
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  {Array.isArray(projection.client.billing_address)
                    ? projection.client.billing_address.join(", ")
                    : projection.client.billing_address}
                  {projection.client.city_state_pin ? `, ${projection.client.city_state_pin}` : ""}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Issued By Service Provider
            </span>
            <div className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">
              {projection.issuer.legal_name}
            </div>
            <div className="text-slate-600">
              {projection.issuer.registered_address}
            </div>
            <div className="text-slate-600 flex items-center gap-2">
              <span>Email: {projection.issuer.official_email}</span>
              <span>•</span>
              <a
                href={projection.issuer.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website
              </a>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-200">
              MSME: {projection.issuer.msme_udyam} ({projection.issuer.msme_category})
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Technical Services Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
              Scope of Technical Deliverables
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Itemized technical services and engineering scope approved for this quotation.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
            {projection.items.length} {projection.items.length === 1 ? "Service" : "Services"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Service & Deliverables</th>
                <th className="py-3 px-4 w-28 text-center">Unit / Qty</th>
                <th className="py-3 px-4 w-36 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projection.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                    No individual line items specified.
                  </td>
                </tr>
              ) : (
                projection.items.map((item) => (
                  <tr key={item.item_number} className="hover:bg-slate-50/40">
                    <td className="py-4 px-4 text-center text-xs font-mono text-slate-400">
                      {item.item_number}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {item.service_code}
                        </span>
                        <span className="font-semibold text-slate-900 text-sm">
                          {item.title}
                        </span>
                      </div>
                      {item.scope_summary && (
                        <p className="text-xs text-slate-600 leading-relaxed mb-2">
                          {item.scope_summary}
                        </p>
                      )}
                      {item.deliverables && item.deliverables.length > 0 && (
                        <div className="space-y-1 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Key Deliverables:
                          </span>
                          <ul className="text-xs text-slate-700 space-y-1">
                            {item.deliverables.map((deliv, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">•</span>
                                <span>{deliv}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.included_at_no_additional_charge && (
                        <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Complimentary / Included at no additional fee
                          {item.inclusion_rationale ? ` (${item.inclusion_rationale})` : ""}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-slate-600 font-mono">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {item.included_at_no_additional_charge ? (
                        <span className="text-emerald-700 font-semibold text-xs">₹0.00</span>
                      ) : (
                        formatPaiseToINR(item.extended_amount_paise)
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pricing Breakdown & Milestones */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-t border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: 50/50 Dual Milestones Schedule */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider">
                  Two-Stage Contractual Payment Schedule
                </h3>
              </div>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                Standard LIT dual-milestone contract terms ensure complete mutual accountability.
              </p>

              <div className="space-y-3">
                {/* Milestone 1 */}
                <div className="p-4 rounded-xl border border-blue-200 bg-white shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Milestone 1 — 50% Upfront
                    </span>
                    <span className="font-mono font-bold text-sm text-blue-900">
                      {formatPaiseToINR(projection.milestone_1_paise)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Due upon execution of Statement of Work (SOW) prior to sprint commencement.
                  </p>
                </div>

                {/* Milestone 2 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Milestone 2 — 50% Upon Delivery
                    </span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {formatPaiseToINR(projection.milestone_2_paise)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Due upon acceptance of deliverables prior to production deployment & IP handover.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Financial Totals Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatPaiseToINR(projection.subtotal_paise)}
                </span>
              </div>

              {projection.discount_paise > 0 && (
                <div className="flex items-center justify-between text-sm text-emerald-700">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Discount ({projection.discount_label || "Applied"})</span>
                  </span>
                  <span className="font-mono font-semibold">
                    -{formatPaiseToINR(projection.discount_paise)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Taxes ({projection.tax_label || "Statutory"})</span>
                <span className="font-mono">
                  {projection.tax_paise > 0
                    ? formatPaiseToINR(projection.tax_paise)
                    : "₹0.00 (Inclusive / Exempt)"}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] block">
                    Total Contract Value
                  </span>
                  <span className="text-[11px] text-slate-400">All inclusive (INR)</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-[var(--lit-navy,#0B2545)] font-mono">
                    {formatPaiseToINR(projection.total_payable_paise)}
                  </span>
                </div>
              </div>

              {/* Coupon Redemption Input */}
              {!isAccepted && (
                <div className="pt-4 border-t border-slate-100">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. WELCOME10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full pl-8 pr-3 py-1.5 text-xs font-mono uppercase rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </form>

                  {couponMessage && (
                    <div
                      className={`mt-2 text-xs p-2 rounded-lg ${
                        couponMessage.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {couponMessage.text}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contract Terms */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-4">
          General Commercial & Technical Terms
        </h3>
        <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4 leading-relaxed">
          {projection.terms.map((term, idx) => (
            <li key={idx}>{term}</li>
          ))}
        </ol>
      </div>

      {/* Action Zone: Formal Acceptance or Request Revisions */}
      {!isAccepted && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Digital Formal Acceptance</span>
                </div>
                <h2 className="text-xl font-bold text-[var(--lit-navy,#0B2545)]">
                  Approve Quotation & Execute Commitment
                </h2>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                  Authorize this proposal to lock scope, assign engineering resources, and trigger SOW preparation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Request Scope Changes</span>
              </button>
            </div>

            {acceptanceError && (
              <div className="mt-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{acceptanceError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAcceptance} className="mt-6 space-y-6">
              {/* Signer credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Signatory Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Signatory Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={signerDesignation}
                    onChange={(e) => setSignerDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Founder & CEO / CTO"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={signerCompany}
                    onChange={(e) => setSignerCompany(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Acme Corporation"
                  />
                </div>
              </div>

              {/* 4 Mandatory Checkboxes */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Mandatory Legal Affirmations
                </span>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentScope}
                    onChange={(e) => setConsentScope(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700">
                    <strong className="text-slate-900">Exact Technical Scope:</strong> I have reviewed and agree to the exact technical deliverables, quantities, and timelines detailed in Quotation {projection.quotation_ref} (Version {projection.version_number}).
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentPricing}
                    onChange={(e) => setConsentPricing(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700">
                    <strong className="text-slate-900">Commercial Total:</strong> I approve the total commercial value of{" "}
                    <strong className="text-slate-900 font-mono">
                      {formatPaiseToINR(projection.total_payable_paise)}
                    </strong>{" "}
                    including applied discounts and statutory taxes.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentMilestones}
                    onChange={(e) => setConsentMilestones(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700">
                    <strong className="text-slate-900">50/50 Dual Milestones:</strong> I agree to the two-stage payment milestone schedule: 50% upon SOW execution before engineering begins, and 50% upon delivery acceptance.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAuthority}
                    onChange={(e) => setConsentAuthority(e.target.checked)}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700">
                    <strong className="text-slate-900">Signing Authority:</strong> I declare that I possess full organizational authority to accept this quotation on behalf of {projection.client.company_name}.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-slate-400">
                  Acceptance timestamp, IP address, and browser hash are securely recorded for audit integrity.
                </p>

                <button
                  type="submit"
                  disabled={
                    isSubmittingAcceptance ||
                    !consentScope ||
                    !consentPricing ||
                    !consentMilestones ||
                    !consentAuthority
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmittingAcceptance ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Confirm Legal Acceptance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revision Request Modal */}
      {isRevisionModalOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setIsRevisionModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[90vh] text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Decorative Banner */}
            <div className="relative bg-gradient-to-r from-[#0B2545] via-[#123663] to-[#1565C0] px-6 py-5 sm:px-7 sm:py-6 text-white shrink-0">
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                disabled={isSubmittingRevision}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Proposal Governance · Scope Refinement
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  Quote: {quotation.quotation_ref}
                </span>
              </div>

              <h3 className="text-xl font-bold font-poppins text-white tracking-tight">
                Request Quotation Adjustments
              </h3>
              <p className="text-xs text-slate-200/90 mt-1 leading-relaxed">
                Submit deliverable adjustments, timeline alterations, or technical scope notes directly to our solution architects.
              </p>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1">
              {/* Active Proposal Summary Pill */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-[#F0F7FF] border border-slate-200/80 flex items-start gap-3.5 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-[#0B2545] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                      Target Proposal Scope
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <Clock className="w-3 h-3" />
                      SLA: 2–4 Business Hours
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#0B2545] truncate mt-0.5">
                    {quotation.project_title}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Our lead architect will review requested adjustments, update milestones and deliverables, and send an amended revision draft.
                  </p>
                </div>
              </div>

              {revisionSuccess ? (
                <div className="p-6 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-emerald-950 font-poppins">
                      Feedback Submitted Successfully
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                      Our engineering team has received your notes and will contact you with an updated quotation draft shortly.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRevisionModalOpen(false)}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitRevision} className="space-y-4">
                  {revisionError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{revisionError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                        <span>Your Full Name *</span>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">Authorized</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={revisionName}
                        onChange={(e) => setRevisionName(e.target.value)}
                        placeholder="e.g. Dr. Rajesh Krishnan"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                        <span>Your Work Email *</span>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">Contact</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={revisionEmail}
                        onChange={(e) => setRevisionEmail(e.target.value)}
                        placeholder="rajesh@company.com"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                      <span>Requested Scope or Deliverable Adjustments *</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">Detailed Notes</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Specify exact milestones, tech stack preferences, timeline adjustments, or commercial considerations you would like adapted..."
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all resize-none shadow-2xs leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsRevisionModalOpen(false)}
                      disabled={isSubmittingRevision}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingRevision || !revisionNotes.trim() || !revisionName.trim() || !revisionEmail.trim()}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#1565C0] hover:from-[#123663] hover:to-[#1976D2] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmittingRevision ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Revision Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
