"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  FileText,
  Download,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Building2,
  Calendar,
  X,
  Loader2,
  ArrowRight,
  Check,
} from "lucide-react";
import type { EnterpriseCheckpoint, EnterpriseChecklistPhase } from "@/data/enterpriseDeploymentChecklist";

interface Props {
  token: string;
  invitation: {
    id: string;
    recipientName: string;
    recipientCompany?: string | null;
    expiresAt: string;
    status: string;
    version?: {
      document_title: string;
      document_version: string;
      checkpoint_count: number;
      phase_count: number;
    } | null;
  };
  initialResponse?: {
    id: string;
    confirmation_reference: string;
    selected_count: number;
    client_notes?: string | null;
    submitted_at: string;
    selectedPoints?: number[];
  } | null;
  initialState: "valid" | "invalid" | "revoked" | "submitted" | "expired";
  phases: EnterpriseChecklistPhase[];
  checkpoints: EnterpriseCheckpoint[];
}

export default function EnterpriseChecklistClient({
  token,
  invitation,
  initialResponse,
  initialState,
  phases,
  checkpoints,
}: Props) {
  const isAlreadySubmitted = initialState === "submitted" || Boolean(initialResponse);
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(() => {
    if (initialResponse?.selectedPoints) {
      return new Set(initialResponse.selectedPoints);
    }
    return new Set<number>();
  });

  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([1, 2, 6, 13, 20, 28, 33, 39, 45]));
  const [searchQuery, setSearchQuery] = useState("");
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [clientNotes, setClientNotes] = useState(initialResponse?.client_notes || "");
  const [agreeDisclaimer, setAgreeDisclaimer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    confirmationReference: string;
    selectedCount: number;
    submittedAt: string;
  } | null>(
    initialResponse
      ? {
          confirmationReference: initialResponse.confirmation_reference,
          selectedCount: initialResponse.selected_count,
          submittedAt: initialResponse.submitted_at,
        }
      : null
  );

  // Record client view asynchronously on mount
  useEffect(() => {
    if (!isAlreadySubmitted) {
      const controller = new AbortController();
      fetch(`/api/enterprise-checklists/${token}/view`, {
        method: "POST",
        signal: controller.signal,
      }).catch(() => {});
      return () => controller.abort();
    }
  }, [token, isAlreadySubmitted]);

  const toggleSelect = (num: number) => {
    if (submittedData) return;
    setSelectedNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(num)) {
        next.delete(num);
      } else {
        next.add(num);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (submittedData) return;
    setSelectedNumbers(new Set(checkpoints.map((c) => c.number)));
  };

  const clearAll = () => {
    if (submittedData) return;
    setSelectedNumbers(new Set());
  };

  const toggleExpand = (num: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(num)) {
        next.delete(num);
      } else {
        next.add(num);
      }
      return next;
    });
  };

  // Filter checkpoints based on search query
  const filteredCheckpoints = useMemo(() => {
    if (!searchQuery.trim()) return checkpoints;
    const q = searchQuery.toLowerCase();
    return checkpoints.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.phase_title.toLowerCase().includes(q) ||
        c.engineering_requirement.toLowerCase().includes(q) ||
        c.acceptance_criteria.toLowerCase().includes(q) ||
        String(c.number).includes(q)
    );
  }, [checkpoints, searchQuery]);

  const filteredNumbers = useMemo(
    () => new Set(filteredCheckpoints.map((c) => c.number)),
    [filteredCheckpoints]
  );

  const handleSubmit = async () => {
    if (selectedNumbers.size === 0) {
      setSubmitError("Please select at least 1 checkpoint to submit.");
      return;
    }
    if (!agreeDisclaimer) {
      setSubmitError("Please acknowledge the requirements selection disclaimer before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/enterprise-checklists/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPoints: Array.from(selectedNumbers),
          submittedByName: invitation.recipientName,
          clientNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit checklist.");
      }

      setSubmittedData({
        confirmationReference: data.confirmationReference,
        selectedCount: data.selectedCount,
        submittedAt: data.submittedAt,
      });
      setShowReviewModal(false);
    } catch (err: any) {
      setSubmitError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedList = useMemo(() => {
    return checkpoints.filter((c) => selectedNumbers.has(c.number));
  }, [checkpoints, selectedNumbers]);

  return (
    <div className="space-y-8">
      {/* Header Document Banner matching ProposalViewerClient style */}
      <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-10 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-[var(--lit-blue,#1565C0)] tracking-wider uppercase bg-[#E7F3FF] border border-[#B9DCFF] px-2.5 py-0.5 rounded-full">
                OFFICIAL STANDARD OPERATING PROCEDURE · V1.0
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-[var(--lit-teal,#1FA9A2)] font-semibold">
                8 Phases · 50 Checkpoints
              </span>
            </div>
            <h1 className="font-poppins text-2xl sm:text-4xl font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight">
              The 50-Point Enterprise Deployment Checklist
            </h1>
            <p className="font-serif italic text-xs sm:text-sm text-[var(--lit-teal,#1FA9A2)] mt-1.5">
              Standard Operating Procedure for Production-Grade AI Architectures
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                submittedData
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] border border-[#B9DCFF]"
              }`}
            >
              {submittedData ? "Selections Submitted" : "Private Client Invitation"}
            </span>
          </div>
        </div>

        {/* Client & Metadata Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 text-xs">
          <div>
            <span className="text-[var(--lit-text-muted,#52677C)] font-mono font-bold uppercase block mb-1">
              Prepared For
            </span>
            <span className="text-[var(--lit-navy,#0B2545)] font-bold text-sm block">
              {invitation.recipientName}
            </span>
            {invitation.recipientCompany && (
              <span className="text-[var(--lit-text-muted,#52677C)] block">
                {invitation.recipientCompany}
              </span>
            )}
          </div>

          <div>
            <span className="text-[var(--lit-text-muted,#52677C)] font-mono font-bold uppercase block mb-1">
              Specification Document
            </span>
            <span className="text-[var(--lit-navy,#0B2545)] font-semibold block">
              21-Page Official PDF SOP
            </span>
            <span className="text-[var(--lit-text-muted,#52677C)] font-mono text-[11px] block mt-0.5">
              Approved · In Force
            </span>
          </div>

          <div>
            <span className="text-[var(--lit-text-muted,#52677C)] font-mono font-bold uppercase block mb-1">
              Invitation Validity
            </span>
            <span className="text-[var(--lit-navy,#0B2545)] font-mono block">
              {new Date(invitation.expiresAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-emerald-700 font-medium block mt-0.5 text-[11px]">
              Active Token Session
            </span>
          </div>

          <div>
            <span className="text-[var(--lit-text-muted,#52677C)] font-mono font-bold uppercase block mb-1">
              Official Document Files
            </span>
            <div className="flex flex-wrap gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowPdfModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white font-medium text-xs transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full PDF</span>
              </button>
              <a
                href="/resources/website-development-checklist.pdf"
                download="LIT_50_Point_Enterprise_Deployment_Checklist.pdf"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-medium text-xs transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="mt-8 p-4 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--lit-navy,#0B2545)]">Client Requirements Exercise:</strong>{" "}
            Review the 50 checkpoints across eight phases and select the areas relevant to your platform
            or application. Selecting a checkpoint registers your project scope priority with our
            engineering team. It does not certify that the platform already passes the checkpoint or
            constitute a commercial contract.
          </div>
        </div>
      </div>

      {/* Confirmation Box if Submitted */}
      {submittedData && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/60 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h2 className="font-poppins text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)]">
                  Checklist Selections Confirmed & Recorded
                </h2>
                <p className="text-xs text-emerald-800 font-medium">
                  {submittedData.selectedCount} of 50 checkpoints selected · Committed to corporate engineering registry
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-6">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                Confirmation Reference
              </span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-[var(--lit-navy,#0B2545)] block">
                {submittedData.confirmationReference}
              </span>
              <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] block">
                {new Date(submittedData.submittedAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>

          <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
            Our principal engineering team is reviewing your selected points against our architectural baseline.
            We will use these selections to prepare your tailored technical Statement of Work and commercial proposal.
          </p>
        </div>
      )}

      {/* Phase Jump Navigation & Search Bar */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 sm:p-6 shadow-xs space-y-4 sticky top-20 z-20 backdrop-blur-md bg-white/95">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lit-text-muted,#52677C)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all 50 checkpoints (e.g., PostgreSQL, RAG, WebSockets, RLS, Vercel)..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] focus:outline-none focus:border-[var(--lit-blue,#1565C0)] focus:ring-2 focus:ring-[#1565C0]/15"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--lit-text-muted,#52677C)] hover:text-black"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!submittedData && (
              <>
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-slate-100 text-xs font-semibold text-[var(--lit-navy,#0B2545)] transition-colors"
                >
                  Select All 50
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-slate-100 text-xs font-semibold text-[var(--lit-text-muted,#52677C)] transition-colors"
                >
                  Clear
                </button>
              </>
            )}

            <div className="px-3.5 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] text-white text-xs font-mono font-bold tracking-wider">
              {selectedNumbers.size} / 50 Selected
            </div>
          </div>
        </div>

        {/* Phase Jump Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px] font-mono">
          {phases.map((p) => (
            <a
              key={p.phase}
              href={`#phase-${p.phase}`}
              className="px-2.5 py-1 rounded-md bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] hover:border-[var(--lit-blue,#1565C0)] hover:text-[var(--lit-blue,#1565C0)] text-[var(--lit-navy,#0B2545)] whitespace-nowrap transition-colors"
            >
              Phase {p.phase} ({p.range})
            </a>
          ))}
        </div>
      </div>

      {/* 8 Phases with 50 Checkpoint Cards */}
      <div className="space-y-10">
        {phases.map((phase) => {
          const phaseCheckpoints = phase.checkpoints.filter((c) =>
            filteredNumbers.has(c.number)
          );
          if (phaseCheckpoints.length === 0) return null;

          return (
            <div
              key={phase.phase}
              id={`phase-${phase.phase}`}
              className="scroll-mt-36 space-y-4"
            >
              {/* Phase Header Banner */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-[var(--lit-navy,#0B2545)]/15">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-white bg-[var(--lit-navy,#0B2545)] px-3 py-1 rounded-lg">
                    PHASE {String(phase.phase).padStart(2, "0")}
                  </span>
                  <h2 className="font-poppins text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)]">
                    {phase.title}
                  </h2>
                </div>
                <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
                  Checkpoints {phase.range}
                </span>
              </div>

              {/* Checkpoints list */}
              <div className="space-y-3">
                {phaseCheckpoints.map((cp) => {
                  const isSelected = selectedNumbers.has(cp.number);
                  const isExpanded = expandedCards.has(cp.number);

                  return (
                    <div
                      key={cp.number}
                      className={`rounded-2xl border transition-all ${
                        isSelected
                          ? "border-[#1565C0] bg-white shadow-xs"
                          : "border-[var(--lit-border-light,#DFE7EF)] bg-white hover:border-slate-300 shadow-2xs"
                      }`}
                    >
                      {/* Checkpoint Header Row */}
                      <div className="p-4 sm:p-5 flex items-start gap-4">
                        <label className="flex items-center gap-3 cursor-pointer shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={Boolean(submittedData)}
                            onChange={() => toggleSelect(cp.number)}
                            aria-label={`Select checkpoint ${cp.number}, ${cp.title}`}
                            className="w-5 h-5 rounded-md text-[var(--lit-blue,#1565C0)] border-[var(--lit-border-light,#DFE7EF)] focus:ring-2 focus:ring-[#1565C0]/20 cursor-pointer disabled:opacity-50"
                          />
                        </label>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-[var(--lit-blue,#1565C0)] bg-[#E7F3FF] border border-[#B9DCFF] px-2 py-0.5 rounded">
                                {String(cp.number).padStart(2, "0")}
                              </span>
                              <h3 className="font-poppins font-bold text-sm sm:text-base text-[var(--lit-navy,#0B2545)]">
                                {cp.title}
                              </h3>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
                                PDF Page {cp.pdf_page}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleExpand(cp.number)}
                                className="inline-flex items-center gap-1 text-[var(--lit-teal,#1FA9A2)] hover:underline font-medium text-xs"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Collapse</span>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </>
                                ) : (
                                  <>
                                    <span>Details</span>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Quick Requirement Summary */}
                          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-2 leading-relaxed">
                            {cp.engineering_requirement}
                          </p>
                        </div>
                      </div>

                      {/* Expandable Engineering Sections */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/50 rounded-b-2xl space-y-3 text-xs">
                          <div>
                            <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--lit-blue,#1565C0)] block mb-1">
                              Engineering Requirement (Verbatim SOP)
                            </span>
                            <p className="text-[var(--lit-navy,#0B2545)] leading-relaxed bg-white p-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)]">
                              {cp.engineering_requirement}
                            </p>
                          </div>

                          <div>
                            <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-emerald-800 block mb-1">
                              Acceptance Criteria (Acceptance Gate)
                            </span>
                            <p className="text-[var(--lit-navy,#0B2545)] leading-relaxed bg-white p-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)]">
                              {cp.acceptance_criteria}
                            </p>
                          </div>

                          <div>
                            <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-purple-800 block mb-1">
                              Verification Evidence (Artifacts / Proof)
                            </span>
                            <p className="text-[var(--lit-navy,#0B2545)] leading-relaxed bg-white p-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)]">
                              {cp.verification_evidence}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Summary Bar */}
      {!submittedData && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-white/95 backdrop-blur-md border-t border-[var(--lit-border-light,#DFE7EF)] shadow-lg">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--lit-blue,#1565C0)] text-white flex items-center justify-center font-mono font-bold text-sm">
                {selectedNumbers.size}
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] block">
                  {selectedNumbers.size} of 50 Checkpoints Selected
                </span>
                <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] block">
                  {selectedNumbers.size === 0
                    ? "Select checkpoints to register scope"
                    : "Ready for technical review & proposal drafting"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                disabled={selectedNumbers.size === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <span>Review Selections & Submit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF View Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]">
              <div>
                <h3 className="font-poppins font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                  The 50-Point Enterprise Deployment Checklist (21 Pages)
                </h3>
                <p className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
                  LIT_50_Point_Enterprise_Deployment_Checklist.pdf · Official Approved SOP
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/resources/website-development-checklist.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] text-xs font-medium text-[var(--lit-navy,#0B2545)] hover:bg-white flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </a>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-slate-100 relative">
              <iframe
                src="/resources/website-development-checklist.pdf#toolbar=1"
                title="50-Point Enterprise Deployment Checklist PDF"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Review & Submit Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]">
              <div>
                <h3 className="font-poppins font-bold text-base text-[var(--lit-navy,#0B2545)]">
                  Review & Confirm Checkpoints
                </h3>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                  {selectedNumbers.size} of 50 checkpoints selected for project scope
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-black hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Selected Points List */}
              <div>
                <span className="font-mono font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] block mb-2">
                  Selected Scope Summary ({selectedList.length} Items):
                </span>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-3 space-y-2">
                  {selectedList.map((cp) => (
                    <div key={cp.number} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--lit-navy,#0B2545)]">
                        <strong>Point {String(cp.number).padStart(2, "0")}</strong>: {cp.title}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
                        Phase {cp.phase}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Notes / Special Requirements */}
              <div>
                <label className="font-mono font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] block mb-1.5">
                  Optional Project Notes or Priorities:
                </label>
                <textarea
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Share any specific requirements, target launch timelines, or third-party integrations..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] focus:outline-none focus:border-[var(--lit-blue,#1565C0)] focus:ring-2 focus:ring-[#1565C0]/15"
                />
              </div>

              {/* Mandatory Disclaimer */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-950 text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="disclaimer-check"
                    checked={agreeDisclaimer}
                    onChange={(e) => setAgreeDisclaimer(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--lit-navy,#0B2545)] mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="disclaimer-check" className="cursor-pointer leading-relaxed">
                    <strong>Official Scope Acknowledgment:</strong> I understand that submitting these
                    selections registers project requirements and requested scope with Logic Intelligence
                    Technologies. It does not certify that the platform already passes these checkpoints
                    or constitute a commercial contract.
                  </label>
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
                  {submitError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-semibold text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !agreeDisclaimer}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Selections…</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Submit to Registry</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
