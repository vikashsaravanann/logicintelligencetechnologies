"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, Clock, FileText, Check, Loader2, Sparkles, Building2 } from "lucide-react";
import { COMPANY } from "@/config/company";
import { trackEvent } from "@/lib/analytics";

interface Props {
  proposal: any;
}

export default function ProposalViewerClient({ proposal }: Props) {
  const [signerName, setSignerName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [status, setStatus] = useState<string>(proposal.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="space-y-12">
      {/* Header Document Banner */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase block mb-1">
              LOGIC INTELLIGENCE TECHNOLOGIES · STATEMENT OF WORK
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
              {proposal.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                isApproved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-primary/20 text-primary border border-primary/30"
              }`}
            >
              {isApproved ? "Approved & Executed" : "Active Proposal"}
            </span>
          </div>
        </div>

        {/* Client & Author Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 text-xs">
          <div>
            <span className="text-zinc-500 font-bold uppercase block mb-1">Prepared For</span>
            <span className="text-white font-bold text-sm">{proposal.client_name}</span>
            {proposal.client_company && (
              <span className="text-zinc-400 block">{proposal.client_company}</span>
            )}
            <span className="text-zinc-400 block">{proposal.client_email}</span>
          </div>

          <div>
            <span className="text-zinc-500 font-bold uppercase block mb-1">Prepared By</span>
            <span className="text-white font-bold text-sm">{COMPANY.legalName}</span>
            <span className="text-zinc-400 block">Coimbatore, India</span>
            <span className="text-primary block">{COMPANY.email}</span>
          </div>

          <div>
            <span className="text-zinc-500 font-bold uppercase block mb-1">Estimated Timeline</span>
            <span className="text-white font-bold text-sm">{proposal.timeline}</span>
            <span className="text-zinc-400 block">From kickoff date</span>
          </div>

          <div>
            <span className="text-zinc-500 font-bold uppercase block mb-1">Total Project Investment</span>
            <span className="text-primary font-black text-xl">
              {proposal.currency === "INR" ? "₹" : "$"}{Number(proposal.pricing).toLocaleString()}
            </span>
            <span className="text-zinc-400 block">Taxes as applicable</span>
          </div>
        </div>
      </div>

      {/* Scope of Work */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>1. Technical Scope & Architecture</span>
        </h2>
        <div className="space-y-3">
          {proposal.scope && proposal.scope.length > 0 ? (
            proposal.scope.map((item: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-400">Custom enterprise scope defined per mutual discovery.</p>
          )}
        </div>
      </div>

      {/* Deliverables Checklist */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <span>2. Milestone Deliverables</span>
        </h2>
        <div className="space-y-3">
          {proposal.deliverables && proposal.deliverables.length > 0 ? (
            proposal.deliverables.map((d: string, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </div>
                <span className="text-sm font-semibold text-zinc-200">{d}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-400">Milestone schedule included in technical addendum.</p>
          )}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>3. Commercial Terms & IP Assignment</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed whitespace-pre-line mb-6">
          {proposal.terms || "Upon receipt of final milestone payment, 100% full intellectual property and source code ownership transfer to client. Includes 30 days post-launch warranty support."}
        </p>
      </div>

      {/* Digital Acceptance Section */}
      <div className="rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/10 via-white/[0.02] to-accent/10 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl">
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-2">
            Digital Acceptance & Authorization
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 mb-6">
            By typing your full legal name below and clicking &quot;Approve & Sign Proposal&quot;, you authorize Logic Intelligence Technologies to initiate project scheduling and onboarding.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mb-4">
              {error}
            </div>
          )}

          {isApproved ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm">Proposal Successfully Accepted & Approved</p>
                <p className="text-xs text-emerald-400/80">
                  Our onboarding team will contact you within 2 business hours to coordinate developer sprints.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Signatory Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Johnathan Smith"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                />
                <label htmlFor="agree" className="text-xs text-zinc-300 leading-relaxed cursor-pointer">
                  I confirm that I am authorized to enter into contracts on behalf of {proposal.client_company || proposal.client_name}, and accept the scope, deliverables, and commercial terms stated in this proposal.
                </label>
              </div>

              <button
                type="button"
                onClick={handleApprove}
                disabled={loading || !signerName.trim() || !agreeTerms}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-black font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_25px_rgba(0,191,255,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing Digital Signature...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Approve & Sign Proposal</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
