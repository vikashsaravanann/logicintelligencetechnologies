"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  FileText,
  Check,
  Loader2,
  Sparkles,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  User,
  ArrowRight,
} from "lucide-react";

import { COMPANY } from "@/config/company";
import { trackEvent } from "@/lib/analytics";
import { StageApprovalModal } from "@/components/shared/StageApprovalModal";

interface Props {
  proposal: any;
}

export default function ProposalViewerClient({ proposal }: Props) {
  const [signerName, setSignerName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [status, setStatus] = useState<string>(proposal.status);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Record the view once, client-side. Best-effort.
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/proposals/${proposal.secure_token}/view`, {
      method: "POST",
      signal: controller.signal,
    }).catch(() => {});
    return () => controller.abort();
  }, [proposal.secure_token]);

  const handleApprove = async () => {
    if (!signerName.trim() || !agreeTerms) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/proposals/${proposal.secure_token}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signerName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve proposal.");
      }

      setStatus("Approved");
      trackEvent("proposal_approved", {
        proposalId: proposal.id,
      });
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const isApproved = status === "Approved";

  return (
    <div className="space-y-8">
      {/* Header Document Banner */}
      <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-10 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <span className="text-xs font-mono font-bold text-[var(--lit-blue,#1565C0)] tracking-wider uppercase block mb-1.5">
              LOGIC INTELLIGENCE TECHNOLOGIES · STATEMENT OF WORK
            </span>
            <h1 className="font-poppins text-2xl sm:text-4xl font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight">
              {proposal.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                isApproved
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] border border-[#B9DCFF]"
              }`}
            >
              {isApproved ? "Accepted & Signed" : "Active Statement of Work"}
            </span>
          </div>
        </div>

        {/* Client & Author Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 text-xs">
          <div>
            <span className="text-[var(--lit-text-muted,#52677C)] font-mono font-bold uppercase block mb-1">
              Prepared For
            </span>
            <span className="text-[var(--lit-navy,#0B2545)] font-bold text-sm block">
              {proposal.client_name}
            </span>
            {proposal.client_company && (
              <span className="text-[var(--lit-text-muted,#52677C)] block">
                {proposal.client_company}
              </span>
            )}
            <span className="text-[var(--lit-text-muted,#52677C)] block font-mono text-[11px] mt-0.5">
              {proposal.client_email}
            </span>
          </div>

          <div>
            <span className="text-[var(--lit-text-muted,#52677C)] font-mono font-bold uppercase block mb-1">
              Prepared By
            </span>
            <span className="text-[var(--lit-navy,#0B2545)] font-bold text-sm block">
              {COMPANY.legalName}
            </span>
            <span className="text-[var(--lit-text-muted,#52677C)] block">
              Coimbatore, India
            </span>
            <span className="text-[var(--lit-blue,#1565C0)] font-mono block text-[11px] mt-0.5">
              {COMPANY.email}
            </span>
          </div>

          <div>
            <span className="text-[var(--lit-text-muted,#52677C)] font-mono font-bold uppercase block mb-1">
              Estimated Timeline
            </span>
            <span className="text-[var(--lit-navy,#0B2545)] font-bold text-sm block">
              {proposal.timeline}
            </span>
            <span className="text-[var(--lit-text-muted,#52677C)] block">
              From kickoff & sprint lock
            </span>
          </div>

          <div>
            <span className="text-[var(--lit-text-muted,#52677C)] font-mono font-bold uppercase block mb-1">
              Project Investment
            </span>
            <span className="text-[var(--lit-blue,#1565C0)] font-bold text-2xl block font-mono">
              {proposal.currency === "INR" ? "₹" : "$"}
              {Number(proposal.pricing).toLocaleString()}
            </span>
            <span className="text-[var(--lit-text-muted,#52677C)] block">
              Taxes as applicable
            </span>
          </div>
        </div>
      </div>

      {/* Scope of Work */}
      <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-6 flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-[var(--lit-blue,#1565C0)]" />
          <span>1. Technical Scope & Architecture</span>
        </h2>
        <div className="space-y-3">
          {proposal.scope && proposal.scope.length > 0 ? (
            proposal.scope.map((item: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-sm text-[var(--lit-navy,#0B2545)] font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Custom enterprise scope defined per mutual technical discovery.
            </p>
          )}
        </div>
      </div>

      {/* Deliverables Checklist */}
      <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-6 flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
          <span>2. Milestone Deliverables</span>
        </h2>
        <div className="space-y-3">
          {proposal.deliverables && proposal.deliverables.length > 0 ? (
            proposal.deliverables.map((d: string, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center gap-3.5"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E0F7F6] text-[var(--lit-teal,#1FA9A2)] border border-[#A7ECE8] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                  0{idx + 1}
                </div>
                <span className="text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                  {d}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Milestone schedule included in technical addendum.
            </p>
          )}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-4 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[var(--lit-blue,#1565C0)]" />
          <span>3. Commercial Terms & IP Assignment</span>
        </h2>
        <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed whitespace-pre-line font-sans">
          {proposal.terms ||
            "Upon receipt of final milestone payment, 100% full intellectual property and source code ownership transfer to client. Includes 30 days post-launch warranty support."}
        </p>
      </div>

      {/* Digital Acceptance Section */}
      <div className="rounded-3xl border border-[#B9DCFF] bg-gradient-to-br from-[#E7F3FF] via-white to-[#F1ECFF] p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl">
          <h3 className="font-poppins text-xl sm:text-2xl font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight mb-2">
            Digital Acceptance & Authorization
          </h3>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mb-6 leading-relaxed">
            By typing your full legal name below and clicking &quot;Accept Proposal&quot;, you record your acceptance of this proposal and authorize Logic Intelligence Technologies to initiate onboarding.
          </p>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {isApproved ? (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start sm:items-center gap-4 shadow-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                    Proposal Successfully Accepted & Signed
                  </p>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5 leading-relaxed">
                    Thank you. Statement of work has been recorded. Complete your billing details to unlock the Stage 06 dynamic UPI payment gateway.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#B9DCFF] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-[var(--lit-blue,#1565C0)] tracking-wider uppercase block">
                    Next Stage · Stage 06 Initial Payment Gate
                  </span>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                    Form-first billing gate with dynamic amount-specific UPI QR & instant invoice generation.
                  </p>
                </div>
                <Link
                  href={`/payment/${proposal.secure_token}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm shrink-0"
                >
                  <span>Proceed to Payment Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider mb-2">
                  Signatory Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-3 text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)]/60 focus:outline-none focus:border-[var(--lit-blue,#1565C0)] focus:ring-2 focus:ring-[#1565C0]/15 transition-all shadow-2xs"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-blue,#1565C0)] focus:ring-[var(--lit-blue,#1565C0)]"
                />
                <label
                  htmlFor="agree"
                  className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed cursor-pointer font-sans"
                >
                  I confirm that I am authorized to enter into contracts on behalf of{" "}
                  <strong className="text-[var(--lit-navy,#0B2545)]">
                    {proposal.client_company || proposal.client_name}
                  </strong>
                  , and accept the scope, deliverables, and commercial terms stated in this proposal.
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={loading || !signerName.trim() || !agreeTerms}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Recording Acceptance…</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Accept & Sign Proposal</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <StageApprovalModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleApprove}
        title="Confirm Proposal Approval & Digital Signature"
        stageName={proposal.title || "Commercial Proposal & Contract Terms"}
        companyName={proposal.client_company || proposal.client_name || "Enterprise Client"}
        defaultNotes={`Formally authorized and signed by ${signerName} on behalf of ${proposal.client_company || proposal.client_name}.`}
        inputLabel="Signer Legal Assent Confirmation Notes *"
        inputPlaceholder="Confirming authorized contract acceptance..."
      />
    </div>
  );
}
