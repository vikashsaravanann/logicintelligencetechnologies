"use client";

import { useState, useTransition } from "react";
import { recordLegalPolicyApproval, revokeLegalPolicyApproval } from "./review-actions";
import { ShieldCheck, X, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface LegalApprovalModalProps {
  ruleId: string;
  countryCode: string;
  channel: string;
  purpose: string;
  ruleVersion: string;
  currentStatus: string;
  activeApprovalId?: string | null;
}

export function LegalApprovalModal({
  ruleId,
  countryCode,
  channel,
  purpose,
  ruleVersion,
  currentStatus,
  activeApprovalId,
}: LegalApprovalModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Form states
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewerRole, setReviewerRole] = useState<"legal_counsel" | "compliance_officer" | "external_counsel" | "dpo">("legal_counsel");
  const [qualification, setQualification] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [expiryDays, setExpiryDays] = useState(180);
  const [evidenceUri, setEvidenceUri] = useState("");
  const [evidenceHash, setEvidenceHash] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const res = await recordLegalPolicyApproval({
          ruleId,
          reviewerEmail,
          reviewerRole,
          qualification,
          decisionReason,
          expiryDays: Number(expiryDays),
          evidenceUri: evidenceUri || undefined,
          evidenceHash: evidenceHash || undefined,
        });

        if (res.ok) {
          setSuccess("Legal policy approval recorded successfully. Expiry set to " + res.expiresAt?.slice(0, 10));
          setTimeout(() => {
            setIsOpen(false);
            setSuccess(null);
            router.refresh();
          }, 1500);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to record approval.");
      }
    });
  };

  const handleRevoke = () => {
    if (!activeApprovalId) return;
    if (!confirm("Are you sure you want to revoke this legal approval? The policy will immediately revert to review_required.")) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const res = await revokeLegalPolicyApproval({
          approvalId: activeApprovalId,
          revokedBy: reviewerEmail || "admin",
          reason: "Revoked via administrative compliance dashboard",
        });

        if (res.ok) {
          setSuccess("Legal approval revoked. Policy reverted to review_required.");
          setTimeout(() => {
            setIsOpen(false);
            setSuccess(null);
            router.refresh();
          }, 1500);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to revoke approval.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-slate-50 text-[11px] font-medium text-[var(--lit-navy,#0B2545)] shadow-2xs transition-colors"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
        <span>{currentStatus === "permitted" ? "Manage Review" : "Record Approval"}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[var(--lit-navy,#0B2545)]" />
                <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                  Legal Policy Review Signoff
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 text-slate-600 font-mono">
              <div>
                <span className="font-bold text-slate-800">Target Scope:</span> {countryCode} • {channel} • {purpose}
              </div>
              <div>
                <span className="font-bold text-slate-800">Rule Version:</span> {ruleVersion}
              </div>
              <div>
                <span className="font-bold text-slate-800">Current Status:</span>{" "}
                <span className="capitalize font-bold text-slate-900">{currentStatus}</span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-start gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2 text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reviewer Official Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="legal.counsel@logicintelligence.com"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reviewer Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] text-slate-900 bg-white"
                  >
                    <option value="legal_counsel">Legal Counsel</option>
                    <option value="compliance_officer">Compliance Officer</option>
                    <option value="external_counsel">External Counsel</option>
                    <option value="dpo">Data Protection Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Review Duration (Days, Max 180) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    required
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Math.min(180, Math.max(1, Number(e.target.value))))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Legal Qualification / Bar Admission / Authority <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bar Council Admission #BCI-8921 / CIPP/E / Solicitor SRA #49102"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Statutory Grounds &amp; Decision Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Scoped B2B outreach reviewed under CAN-SPAM. Opt-out mechanism and postal address confirmed."
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Evidence URI (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://vault.lit/docs/legal/lia-us-2026.pdf"
                    value={evidenceUri}
                    onChange={(e) => setEvidenceUri(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Evidence Hash (SHA-256)
                  </label>
                  <input
                    type="text"
                    placeholder="sha256:7f83b1657ff1fc53..."
                    value={evidenceHash}
                    onChange={(e) => setEvidenceHash(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)] text-slate-900 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                {activeApprovalId && (
                  <button
                    type="button"
                    onClick={handleRevoke}
                    disabled={isPending}
                    className="px-3 py-2 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold transition-colors disabled:opacity-50"
                  >
                    Revoke Approval
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#071930] text-white font-bold transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Recording..." : "Record Legal Approval"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
