"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  Building2,
  User,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Printer,
  X,
  Loader2,
} from "lucide-react";
import type { EnterpriseCheckpoint, EnterpriseChecklistPhase } from "@/data/enterpriseDeploymentChecklist";

interface Props {
  token: string;
  initialState: string;
  invitation: {
    id: string;
    recipientName: string;
    recipientCompany?: string | null;
    expiresAt: string;
    status: string;
    version?: {
      document_title?: string;
      document_version?: string;
      checkpoint_count?: number;
      phase_count?: number;
    } | null;
  };
  initialResponse?: {
    id?: string;
    confirmation_reference?: string;
    selected_count?: number;
    client_notes?: string | null;
    submitted_at?: string;
    selectedPoints?: number[];
  } | null;
  checkpoints: EnterpriseCheckpoint[];
  phases: EnterpriseChecklistPhase[];
}

export default function EnterpriseChecklistClient({
  token,
  initialState,
  invitation,
  initialResponse,
  checkpoints,
  phases,
}: Props) {
  const [selectedPoints, setSelectedPoints] = useState<number[]>(
    initialResponse?.selectedPoints || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitterName, setSubmitterName] = useState(invitation.recipientName || "");
  const [clientNotes, setClientNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    confirmationReference: string;
    selectedCount: number;
    submittedAt: string;
  } | null>(
    initialResponse?.confirmation_reference
      ? {
          confirmationReference: initialResponse.confirmation_reference,
          selectedCount: initialResponse.selected_count || initialResponse.selectedPoints?.length || 0,
          submittedAt: initialResponse.submitted_at || new Date().toISOString(),
        }
      : null
  );

  const isAlreadySubmitted = Boolean(submissionResult || initialState === "submitted");
  const isExpired = initialState === "expired";
  const isRevoked = initialState === "revoked";

  // Track view event on mount (best-effort, once)
  useEffect(() => {
    if (!isAlreadySubmitted && !isExpired && !isRevoked) {
      const controller = new AbortController();
      fetch(`/api/enterprise-checklists/${token}/view`, {
        method: "POST",
        signal: controller.signal,
      }).catch(() => {});
      return () => controller.abort();
    }
  }, [token, isAlreadySubmitted, isExpired, isRevoked]);

  // Filter checkpoints based on search query and active phase
  const filteredCheckpoints = useMemo(() => {
    return checkpoints.filter((cp) => {
      const matchesPhase = activePhase === null || cp.phase === activePhase;
      if (!matchesPhase) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        cp.title.toLowerCase().includes(q) ||
        cp.engineering_requirement.toLowerCase().includes(q) ||
        cp.acceptance_criteria.toLowerCase().includes(q) ||
        cp.verification_evidence.toLowerCase().includes(q) ||
        cp.phase_title.toLowerCase().includes(q) ||
        cp.number.toString().includes(q)
      );
    });
  }, [checkpoints, searchQuery, activePhase]);

  // Toggle single checkpoint selection
  const handleTogglePoint = (num: number) => {
    if (isAlreadySubmitted || isExpired || isRevoked) return;
    setSelectedPoints((prev) =>
      prev.includes(num) ? prev.filter((p) => p !== num) : [...prev, num].sort((a, b) => a - b)
    );
  };

  // Select all 50 points
  const handleSelectAll = () => {
    if (isAlreadySubmitted || isExpired || isRevoked) return;
    setSelectedPoints(checkpoints.map((c) => c.number));
  };

  // Clear selections
  const handleClearAll = () => {
    if (isAlreadySubmitted || isExpired || isRevoked) return;
    setSelectedPoints([]);
  };

  // Toggle expanded details on a card
  const handleToggleCard = (num: number) => {
    setExpandedCards((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  // Expand all cards in current view
  const handleExpandAll = () => {
    const next: Record<number, boolean> = {};
    checkpoints.forEach((c) => {
      next[c.number] = true;
    });
    setExpandedCards(next);
  };

  // Collapse all cards
  const handleCollapseAll = () => {
    setExpandedCards({});
  };

  // Submit selections to backend
  const handleSubmitSelections = async () => {
    if (selectedPoints.length === 0) {
      setSubmitError("Please select at least 1 checkpoint.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/enterprise-checklists/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPoints,
          submittedByName: submitterName.trim() || invitation.recipientName,
          clientNotes: clientNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Failed to submit checklist selections.");
      }

      setSubmissionResult({
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

  const expiryFormatted = invitation.expiresAt
    ? new Date(invitation.expiresAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-8">
      {/* 1. Header Card */}
      <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-10 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <span className="text-xs font-mono font-bold text-[var(--lit-blue,#1565C0)] tracking-wider uppercase block mb-1.5">
              LOGIC INTELLIGENCE TECHNOLOGIES · ENTERPRISE DEPLOYMENT
            </span>
            <h1 className="font-poppins text-2xl sm:text-4xl font-extrabold text-[var(--lit-navy,#0B2545)] tracking-tight">
              The 50-Point Enterprise Deployment Checklist
            </h1>
            <p className="mt-2 text-sm text-[var(--lit-muted,#52677C)] max-w-2xl">
              Official engineering standard for enterprise web systems, hospital platforms, and autonomous AI agents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                isAlreadySubmitted
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : isExpired
                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                  : "bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] border border-[#B9DCFF]"
              }`}
            >
              {isAlreadySubmitted ? "Submitted & Confirmed" : isExpired ? "Invitation Expired" : "Private Client Review"}
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              v1.0 · 50 Points
            </span>
          </div>
        </div>

        {/* Client & Metadata Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 font-mono uppercase block text-[10px]">Client / Organization</span>
              <span className="font-semibold text-slate-800 text-sm block">
                {invitation.recipientCompany || "Confidential Enterprise Client"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 font-mono uppercase block text-[10px]">Prepared For</span>
              <span className="font-semibold text-slate-800 text-sm block">{invitation.recipientName}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 font-mono uppercase block text-[10px]">Valid Until</span>
              <span className="font-semibold text-slate-800 text-sm block">{expiryFormatted || "Standard Validity"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:justify-end">
            <button
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              title="Preview complete 21-page PDF document"
            >
              <Eye className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
              View 21-Page PDF
            </button>
            <a
              href="/assets/docs/LIT_50_Point_Enterprise_Deployment_Checklist.pdf"
              download="LIT_50_Point_Enterprise_Deployment_Checklist.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              title="Download original approved PDF"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              Download
            </a>
          </div>
        </div>
      </div>

      {/* 2. Submission Receipt Card (If Already Submitted) */}
      {isAlreadySubmitted && submissionResult && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-200/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-600 text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-emerald-950 font-poppins">
                  Checklist Selections Confirmed
                </h2>
                <p className="text-xs text-emerald-800">
                  Your requirements selection has been recorded. Our technical team is reviewing your selected points.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-300 shadow-xs">
                <span className="text-[10px] uppercase font-mono text-emerald-700 block">Confirmation Ref</span>
                <span className="font-mono font-bold text-emerald-950 text-sm">
                  {submissionResult.confirmationReference}
                </span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-100 transition shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs text-emerald-900">
            <div>
              <span className="font-semibold block text-emerald-950">Selected Checkpoints:</span>
              <span className="text-sm font-bold">{submissionResult.selectedCount} of 50 Checkpoints</span>
            </div>
            <div>
              <span className="font-semibold block text-emerald-950">Submitted On:</span>
              <span>{new Date(submissionResult.submittedAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-semibold block text-emerald-950">Next Steps:</span>
              <span>Engineering review & aligned proposal draft preparation.</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Navigation & Controls Bar */}
      <div className="sticky top-20 z-20 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white/95 backdrop-blur-md p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 50 checkpoints, requirements, evidence..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)] focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Selection Controls */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                Selected: <strong className="text-[var(--lit-blue,#1565C0)]">{selectedPoints.length}</strong> / 50
              </span>
              <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-[var(--lit-blue,#1565C0)] h-full transition-all duration-300"
                  style={{ width: `${(selectedPoints.length / 50) * 100}%` }}
                />
              </div>
            </div>

            {!isAlreadySubmitted && !isExpired && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
              <button
                onClick={handleExpandAll}
                className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition"
              >
                Expand
              </button>
              <button
                onClick={handleCollapseAll}
                className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition"
              >
                Collapse
              </button>
            </div>
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setActivePhase(null)}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
              activePhase === null
                ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Phases (50)
          </button>
          {phases.map((ph) => {
            const countInPhase = checkpoints.filter((c) => c.phase === ph.phase).length;
            const selectedInPhase = checkpoints.filter(
              (c) => c.phase === ph.phase && selectedPoints.includes(c.number)
            ).length;

            return (
              <button
                key={ph.phase}
                onClick={() => setActivePhase(ph.phase)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition ${
                  activePhase === ph.phase
                    ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>Phase {ph.phase}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activePhase === ph.phase
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {selectedInPhase > 0 ? `${selectedInPhase}/` : ""}
                  {countInPhase}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Checkpoint List Grouped By Phase */}
      <div className="space-y-10">
        {phases.map((ph) => {
          const phasePoints = filteredCheckpoints.filter((c) => c.phase === ph.phase);
          if (phasePoints.length === 0) return null;

          const selectedInPhase = phasePoints.filter((c) => selectedPoints.includes(c.number)).length;

          return (
            <section key={ph.phase} className="space-y-4">
              {/* Phase Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--lit-navy,#0B2545)] text-white font-mono font-bold text-xs">
                    0{ph.phase}
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                      {ph.title}
                    </h2>
                    <span className="text-xs font-mono text-slate-500">
                      Points {ph.range}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">
                    Phase Scope: <strong>{selectedInPhase}</strong> / {phasePoints.length}
                  </span>
                </div>
              </div>

              {/* Checkpoints in Phase */}
              <div className="space-y-3">
                {phasePoints.map((cp) => {
                  const isSelected = selectedPoints.includes(cp.number);
                  const isExpanded = Boolean(expandedCards[cp.number]);

                  return (
                    <article
                      key={cp.number}
                      className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden ${
                        isSelected
                          ? "border-[var(--lit-blue,#1565C0)] shadow-sm bg-blue-50/10 ring-1 ring-[var(--lit-blue,#1565C0)]/20"
                          : "border-[var(--lit-border-light,#DFE7EF)] hover:border-slate-300"
                      }`}
                    >
                      {/* Checkpoint Summary Bar */}
                      <div className="p-4 sm:p-5 flex items-start gap-4">
                        {/* Custom accessible Checkbox */}
                        <div className="pt-0.5">
                          <label className="relative flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isAlreadySubmitted || isExpired || isRevoked}
                              onChange={() => handleTogglePoint(cp.number)}
                              aria-label={`Select point ${cp.number}, ${cp.title}`}
                              className="w-5 h-5 rounded-md border-slate-300 text-[var(--lit-blue,#1565C0)] focus:ring-[var(--lit-blue,#1565C0)] focus:ring-offset-0 disabled:opacity-60 cursor-pointer"
                            />
                          </label>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-xs text-[var(--lit-blue,#1565C0)]">
                              #{cp.number < 10 ? `0${cp.number}` : cp.number}
                            </span>
                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">
                              {cp.title}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              PDF p.{cp.pdf_page}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[var(--lit-blue,#1565C0)] border border-blue-200">
                                Selected
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                            {cp.engineering_requirement}
                          </p>
                        </div>

                        {/* Expand / Collapse Button */}
                        <button
                          onClick={() => handleToggleCard(cp.number)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0"
                          aria-label={isExpanded ? "Collapse requirement details" : "Expand requirement details"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Details Section */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/60 space-y-4 text-xs">
                          <div>
                            <span className="font-mono font-bold uppercase text-[10px] text-slate-400 block mb-1">
                              Engineering Requirement
                            </span>
                            <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                              {cp.engineering_requirement}
                            </p>
                          </div>

                          <div>
                            <span className="font-mono font-bold uppercase text-[10px] text-slate-400 block mb-1">
                              Acceptance Criteria
                            </span>
                            <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                              {cp.acceptance_criteria}
                            </p>
                          </div>

                          <div>
                            <span className="font-mono font-bold uppercase text-[10px] text-slate-400 block mb-1">
                              Verification Evidence
                            </span>
                            <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                              {cp.verification_evidence}
                            </p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* 5. Sticky Bottom Action Bar (When points selected and not yet submitted) */}
      {!isAlreadySubmitted && !isExpired && !isRevoked && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white/95 backdrop-blur-md p-4 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white flex items-center justify-center font-bold text-sm">
                {selectedPoints.length}
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {selectedPoints.length} of 50 Checkpoints Selected
                </span>
                <span className="text-xs text-slate-500 block">
                  {selectedPoints.length === 0
                    ? "Select checkpoints to include in your scope review."
                    : "Ready to review and submit."}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              disabled={selectedPoints.length === 0}
              className="px-5 py-2.5 rounded-xl bg-[var(--lit-blue,#1565C0)] hover:bg-[#1255A3] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm"
            >
              Review & Submit
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Review & Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
                  Review Your Checklist Selections
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedPoints.length} checkpoints selected for technical scope alignment.
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submitter Name */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Submitted By (Name / Title):
                </label>
                <input
                  type="text"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)]"
                  placeholder="e.g. Dr. Jane Doe, Chief Technology Officer"
                />
              </div>

              {/* Notes / Special Focus */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Additional Notes or Project Priorities (Optional):
                </label>
                <textarea
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)]"
                  placeholder="Specify key architectural constraints, integration milestones, or target deployment timelines..."
                />
              </div>

              {/* Selected Points Preview */}
              <div>
                <span className="font-semibold text-slate-700 block mb-2">
                  Selected Checkpoints ({selectedPoints.length}):
                </span>
                <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1.5">
                  {selectedPoints.map((num) => {
                    const pt = checkpoints.find((c) => c.number === num);
                    if (!pt) return null;
                    return (
                      <div key={num} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-200/60 last:border-none">
                        <span className="font-medium text-slate-800">
                          <strong>#{pt.number}:</strong> {pt.title}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">Phase {pt.phase}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legal Notice / Scope Disclaimer */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Important Scope Notice:</strong> These selections identify technical requirements
                for your project scope. They do not certify that controls have been tested or implemented,
                nor do they constitute commercial contract acceptance. Upon submission, our technical team
                will review the requirements and prepare an aligned proposal draft.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Back to Checklist
              </button>
              <button
                type="button"
                onClick={handleSubmitSelections}
                disabled={isSubmitting || selectedPoints.length === 0}
                className="px-6 py-2.5 rounded-xl bg-[var(--lit-blue,#1565C0)] hover:bg-[#1255A3] disabled:bg-slate-300 text-white font-semibold text-xs flex items-center gap-2 transition shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm & Submit Selections
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PDF Preview Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
                <h3 className="font-poppins text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                  The 50-Point Enterprise Deployment Checklist (21 Pages)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/assets/docs/LIT_50_Point_Enterprise_Deployment_Checklist.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5 hover:bg-slate-100"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in New Tab
                </a>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src="/assets/docs/LIT_50_Point_Enterprise_Deployment_Checklist.pdf#toolbar=1"
                className="w-full h-full rounded-xl border border-slate-200"
                title="50-Point Enterprise Deployment Checklist PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
