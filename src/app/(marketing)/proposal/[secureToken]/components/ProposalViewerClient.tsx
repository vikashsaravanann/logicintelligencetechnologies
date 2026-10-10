"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, FileText, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
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
    <div className="space-y-10">
      {/* Header Document Banner */}
      <div className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase block mb-1">
              LOGIC INTELLIGENCE TECHNOLOGIES · STATEMENT OF WORK
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
              {proposal.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                isApproved
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
              }`}
            >
              {isApproved ? "Accepted & Signed" : "Active Statement of Work"}
            </span>
          </div>
        </div>

        {/* Client & Author Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 text-xs font-sans">
          <div>
            <span className="text-zinc-500 font-mono font-bold uppercase block mb-1">Prepared For</span>
            <span className="text-white font-bold text-sm block">{proposal.client_name}</span>
            {proposal.client_company && (
              <span className="text-zinc-400 block">{proposal.client_company}</span>
            )}
            <span className="text-zinc-400 block">{proposal.client_email}</span>
          </div>

          <div>
            <span className="text-zinc-500 font-mono font-bold uppercase block mb-1">Prepared By</span>
            <span className="text-white font-bold text-sm block">{COMPANY.legalName}</span>
            <span className="text-zinc-400 block">Coimbatore, India</span>
            <span className="text-cyan-400 font-mono block">{COMPANY.email}</span>
          </div>

          <div>
            <span className="text-zinc-500 font-mono font-bold uppercase block mb-1">Estimated Timeline</span>
            <span className="text-white font-bold text-sm block">{proposal.timeline}</span>
            <span className="text-zinc-400 block">From kickoff & sprint lock</span>
          </div>

          <div>
            <span className="text-zinc-500 font-mono font-bold uppercase block mb-1">Project Investment</span>
            <span className="text-cyan-400 font-bold text-xl block font-mono">
              {proposal.currency === "INR" ? "₹" : "$"}{Number(proposal.pricing).toLocaleString()}
            </span>
            <span className="text-zinc-400 block">Taxes as applicable</span>
          </div>
        </div>
      </div>

      {/* Scope of Work */}
      <div className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-8 shadow-xl">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <span>1. Technical Scope & Architecture</span>
        </h2>
        <div className="space-y-3">
          {proposal.scope && proposal.scope.length > 0 ? (
            proposal.scope.map((item: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#07090D] border border-white/5 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-400">Custom enterprise scope defined per mutual technical discovery.</p>
          )}
        </div>
      </div>

      {/* Deliverables Checklist */}
      <div className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-8 shadow-xl">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span>2. Milestone Deliverables</span>
        </h2>
        <div className="space-y-3">
          {proposal.deliverables && proposal.deliverables.length > 0 ? (
            proposal.deliverables.map((d: string, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-[#07090D] border border-white/5 flex items-center gap-3.5">
                <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                  0{idx + 1}
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
      <div className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-8 shadow-xl">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>3. Commercial Terms & IP Assignment</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed whitespace-pre-line font-light">
          {proposal.terms || "Upon receipt of final milestone payment, 100% full intellectual property and source code ownership transfer to client. Includes 30 days post-launch warranty support."}
        </p>
      </div>

      {/* Digital Acceptance Section */}
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-[#10131A] to-blue-500/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight mb-2">
            Digital Acceptance & Authorization
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 mb-6 font-light">
            By typing your full legal name below and clicking &quot;Accept Proposal&quot;, you record your acceptance of this proposal and authorize Logic Intelligence Technologies to initiate onboarding.
          </p>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isApproved ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm text-white">Proposal Successfully Accepted</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Thank you. Our engineering team will coordinate your onboarding repository access and kickoff session.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Signatory Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-[#07090D] border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-[#07090D] text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="agree" className="text-xs text-zinc-300 leading-relaxed cursor-pointer font-light">
                  I confirm that I am authorized to enter into contracts on behalf of {proposal.client_company || proposal.client_name}, and accept the scope, deliverables, and commercial terms stated in this proposal.
                </label>
              </div>

              <button
                type="button"
                onClick={handleApprove}
                disabled={loading || !signerName.trim() || !agreeTerms}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#07090D] font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(69,217,210,0.25)] hover:shadow-[0_0_35px_rgba(69,217,210,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
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
    </div>
  );
}
