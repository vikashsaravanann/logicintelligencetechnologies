"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  FileEdit,
  PlusCircle,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  Send,
  X,
  DollarSign,
  Calendar,
} from "lucide-react";
import { formatINR } from "@/lib/format/datetime";

interface ChangeRequest {
  id: string;
  rfcRef: string;
  engagementRef: string;
  clientEmail: string;
  title: string;
  category: "scope_expansion" | "architecture_change" | "integration" | "timeline_amendment" | "other";
  description: string;
  justification?: string | null;
  impactSummary?: string | null;
  status: "draft" | "submitted" | "in_review" | "quoted" | "client_approved" | "rejected" | "implemented";
  estimatedCostInr?: number | null;
  estimatedTimelineDays?: number | null;
  submittedAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export default function ClientChangeRequestsPage() {
  const [rfcs, setRfcs] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [engagementRef, setEngagementRef] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("scope_expansion");
  const [description, setDescription] = useState<string>("");
  const [justification, setJustification] = useState<string>("");

  const fetchRfcs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/client/change-requests");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRfcs(data.changeRequests || []);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch change requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRfcs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg("Title and description are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setFeedback(null);

    try {
      const res = await fetch("/api/client/change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          engagementRef: engagementRef.trim() || "GENERAL",
          title: title.trim(),
          category,
          description: description.trim(),
          justification: justification.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit change request");
      }

      setFeedback(`Change request ${data.changeRequest?.rfcRef || "RFC"} registered successfully.`);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setJustification("");
      fetchRfcs();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "Submission failed. Please verify required fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
      case "in_review":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            Under Technical Review
          </span>
        );
      case "quoted":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
            Quote Issued · Awaiting Approval
          </span>
        );
      case "client_approved":
      case "implemented":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            Approved &amp; Scheduled
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-red-50 text-red-700 border border-red-200">
            Declined
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-50 text-slate-700 border border-slate-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 font-mono">
              Scope Control
            </span>
            <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
              RFC System (Request for Change)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
            Change Requests
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Formal engineering scope amendments, technical impact reviews, and commercial quotes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-cyan-300" />
            <span>Submit New RFC</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* RFC List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[var(--lit-text-muted,#52677C)]">
          <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-3" />
          <span>Synchronizing scope changes...</span>
        </div>
      ) : rfcs.length === 0 ? (
        <div className="p-12 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-center mx-auto text-slate-400">
            <FileEdit className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
            No scope amendments or RFCs logged
          </h3>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-sm mx-auto">
            Your project is operating strictly against the baseline executed SOW and technical specification. Use the button above if you need new features or architectural modifications.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rfcs.map((rfc) => (
            <div
              key={rfc.id}
              className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                      {rfc.rfcRef}
                    </span>
                    {getStatusBadge(rfc.status)}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      Ref: {rfc.engagementRef}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                    {rfc.title}
                  </h3>
                </div>

                <div className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono shrink-0">
                  {new Date(rfc.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-2 text-xs text-[var(--lit-ink,#121826)] leading-relaxed bg-[var(--lit-cloud,#F7F9FC)] p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)]/60">
                <p><strong>Description:</strong> {rfc.description}</p>
                {rfc.justification && (
                  <p className="text-[var(--lit-text-muted,#52677C)]">
                    <strong>Business Justification:</strong> {rfc.justification}
                  </p>
                )}
              </div>

              {/* Commercial Quote Panel (if quoted) */}
              {rfc.status === "quoted" && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 block">
                      Engineering Quotation Issued
                    </span>
                    <div className="flex items-center gap-4 text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                      {rfc.estimatedCostInr != null && (
                        <span>Cost: {formatINR(rfc.estimatedCostInr)} + GST</span>
                      )}
                      {rfc.estimatedTimelineDays != null && (
                        <span>Schedule: +{rfc.estimatedTimelineDays} working days</span>
                      )}
                    </div>
                    {rfc.impactSummary && (
                      <p className="text-[11px] text-amber-900">{rfc.impactSummary}</p>
                    )}
                  </div>

                  <Link
                    href="/client/messages"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
                  >
                    <span>Discuss with Lead</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Proportional Enterprise RFC Modal */}
      {isModalOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[90vh] text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Decorative Banner */}
            <div className="relative bg-gradient-to-r from-[#0B2545] via-[#123663] to-[#1565C0] px-6 py-5 sm:px-7 sm:py-6 text-white shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  Engineering Governance · RFC
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  Change Protocol
                </span>
              </div>

              <h3 className="text-xl font-bold font-poppins text-white tracking-tight">
                Submit Request for Change (RFC)
              </h3>
              <p className="text-xs text-slate-200/90 mt-1 leading-relaxed">
                Log technical change requests, architectural modifications, or feature adjustments into the immutable audit queue.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-4 overflow-y-auto flex-1">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                    <span>Engagement Reference (optional)</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">e.g. LIT-2026-ENG-01</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LIT-2026-ENG-01"
                    value={engagementRef}
                    onChange={(e) => setEngagementRef(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B2545] mb-1.5">
                    Change Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Add Razorpay payment gateway integration"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                    <span>Change Classification *</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">Impact Scope</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all cursor-pointer"
                  >
                    <option value="scope_expansion">Scope Expansion (New Feature Addition)</option>
                    <option value="architecture_change">Architecture Modification (Core Logic / Database)</option>
                    <option value="integration">Third-Party Integration (API / Webhooks / Gateway)</option>
                    <option value="timeline_amendment">Timeline / Schedule Shift</option>
                    <option value="other">General Operational Modification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                    <span>Detailed Technical Description *</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">Specification</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Specify the required behavior, workflows, or data requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all resize-none shadow-2xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B2545] mb-1.5 flex items-center justify-between">
                    <span>Business Justification (optional)</span>
                    <span className="text-[10px] font-mono text-slate-400 font-normal">Rationale</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Why is this change necessary for your business operations?"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] outline-none transition-all resize-none shadow-2xs leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !description.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#1565C0] hover:from-[#123663] hover:to-[#1976D2] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-cyan-300" />
                    <span>{isSubmitting ? "Submitting..." : "Submit for Technical Review"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
