"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  FileSignature,
  CheckCircle2,
  Clock,
  Eye,
  Building2,
  User,
  Calendar,
  AlertCircle,
  Check,
  Loader2,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Edit3,
  Filter,
  CheckSquare,
  Square,
  Search,
} from "lucide-react";
import type { EnterpriseCheckpoint, EnterpriseChecklistPhase } from "@/data/enterpriseDeploymentChecklist";

interface Props {
  invitation: {
    id: string;
    recipient_name: string;
    recipient_email: string;
    recipient_company?: string | null;
    status: string;
    expires_at: string;
    sent_at?: string | null;
    sent_count: number;
    viewed_at?: string | null;
    submitted_at?: string | null;
    created_at: string;
    proposal_id?: string | null;
    internal_notes?: string | null;
  };
  response?: {
    id: string;
    confirmation_reference: string;
    selected_count: number;
    submitted_at: string;
    client_notes?: string | null;
    selectedPoints: number[];
  } | null;
  reviews: any[];
  checkpoints: EnterpriseCheckpoint[];
  phases: EnterpriseChecklistPhase[];
}

export default function ChecklistDetailClient({
  invitation,
  response,
  reviews,
  checkpoints,
  phases,
}: Props) {
  const [status, setStatus] = useState(invitation.status);
  const [responseState, setResponseState] = useState(response || null);
  const [proposalId, setProposalId] = useState<string | null>(invitation.proposal_id || null);
  const [proposalRef, setProposalRef] = useState<string | null>(null);

  // Review state
  const [reviewNotes, setReviewNotes] = useState(reviews[0]?.review_notes || "");
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);

  // Proposal draft creation state
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);

  // Email resend state
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Expand state for checkpoints
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  // Admin Direct Scope Intake state ("IF US SUBMITTED")
  const [isAdminIntakeOpen, setIsAdminIntakeOpen] = useState(!response);
  const [adminSelectedPoints, setAdminSelectedPoints] = useState<number[]>(
    response?.selectedPoints || []
  );
  const [adminSubmitterName, setAdminSubmitterName] = useState("LIT Solutions Architect");
  const [adminClientNotes, setAdminClientNotes] = useState("");
  const [adminNotifyClient, setAdminNotifyClient] = useState(true);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [adminSubmitError, setAdminSubmitError] = useState<string | null>(null);
  const [adminSubmitSuccess, setAdminSubmitSuccess] = useState(false);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<number | "all">("all");
  const [intakeSearchQuery, setIntakeSearchQuery] = useState("");

  const selectedNumbers = responseState?.selectedPoints || [];
  const selectedDetails = checkpoints.filter((c) => selectedNumbers.includes(c.number));

  const handleSelectAll = () => {
    setAdminSelectedPoints(checkpoints.map((c) => c.number));
  };

  const handleClearAll = () => {
    setAdminSelectedPoints([]);
  };

  const handleTogglePhase = (phaseNumber: number) => {
    const phasePoints = checkpoints.filter((c) => c.phase === phaseNumber).map((c) => c.number);
    const allSelected = phasePoints.every((num) => adminSelectedPoints.includes(num));
    if (allSelected) {
      setAdminSelectedPoints((prev) => prev.filter((num) => !phasePoints.includes(num)));
    } else {
      setAdminSelectedPoints((prev) =>
        Array.from(new Set([...prev, ...phasePoints])).sort((a, b) => a - b)
      );
    }
  };

  const handleTogglePoint = (pointNumber: number) => {
    setAdminSelectedPoints((prev) =>
      prev.includes(pointNumber)
        ? prev.filter((n) => n !== pointNumber)
        : [...prev, pointNumber].sort((a, b) => a - b)
    );
  };

  const handleAdminSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminSelectedPoints.length === 0) {
      setAdminSubmitError("Please select at least 1 checkpoint to record scope.");
      return;
    }

    setIsAdminSubmitting(true);
    setAdminSubmitError(null);

    try {
      const res = await fetch(
        `/api/admin/enterprise-checklists/invitations/${invitation.id}/admin-submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedPoints: adminSelectedPoints,
            submitterName: adminSubmitterName,
            internalNotes: adminClientNotes,
            notifyClient: adminNotifyClient,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to record scope submission.");
      }

      setResponseState({
        id: data.confirmationReference || "resp-" + Date.now(),
        confirmation_reference: data.confirmationReference,
        selected_count: data.selectedCount,
        submitted_at: data.submittedAt || new Date().toISOString(),
        client_notes: adminClientNotes,
        selectedPoints: adminSelectedPoints,
      });
      setStatus("submitted");
      setAdminSubmitSuccess(true);
      setIsAdminIntakeOpen(false);
      setTimeout(() => setAdminSubmitSuccess(false), 5000);
    } catch (err: any) {
      setAdminSubmitError(err.message || "Failed to record scope submission.");
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const filteredIntakeCheckpoints = checkpoints.filter((cp) => {
    if (selectedPhaseFilter !== "all" && cp.phase !== selectedPhaseFilter) return false;
    if (intakeSearchQuery.trim()) {
      const q = intakeSearchQuery.toLowerCase();
      return (
        String(cp.number).includes(q) ||
        cp.title.toLowerCase().includes(q) ||
        cp.phase_title.toLowerCase().includes(q) ||
        cp.engineering_requirement.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleResendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const res = await fetch(`/api/admin/enterprise-checklists/invitations/${invitation.id}/send`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 4000);
      } else {
        alert(data.error || "Failed to dispatch email.");
      }
    } catch {
      alert("Error sending invitation email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSaveReview = async () => {
    setIsSavingReview(true);
    try {
      const res = await fetch(`/api/admin/enterprise-checklists/invitations/${invitation.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewNotes,
          status: status === "submitted" ? "reviewed" : status,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus(data.status);
        setReviewSaved(true);
        setTimeout(() => setReviewSaved(false), 3000);
      } else {
        alert(data.error || "Failed to save review.");
      }
    } catch {
      alert("Error saving review.");
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleCreateProposalDraft = async () => {
    setIsCreatingProposal(true);
    setProposalError(null);

    try {
      const res = await fetch(
        `/api/admin/enterprise-checklists/invitations/${invitation.id}/create-proposal-draft`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to draft proposal.");
      }

      setProposalId(data.proposalId);
      setProposalRef(data.reference);
      setStatus("proposal_prepared");
    } catch (err: any) {
      setProposalError(err.message || "Failed to draft proposal.");
    } finally {
      setIsCreatingProposal(false);
    }
  };

  const toggleCard = (num: number) => {
    setExpandedCards((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Info Card */}
      <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-[var(--lit-blue,#1565C0)] uppercase">
                Enterprise Checklist Invitation
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border border-slate-200 bg-slate-50 text-slate-700">
                {status.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--lit-navy,#0B2545)] font-poppins mt-1">
              {invitation.recipient_company || invitation.recipient_name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResendEmail}
              disabled={isSendingEmail}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
            >
              {isSendingEmail ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : emailSent ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Sent!
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
                  Send Invitation Email
                </>
              )}
            </button>

            {proposalId && (
              <Link
                href="/admin/proposals"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--lit-blue,#1565C0)] hover:bg-[#1255A3] text-white text-xs font-semibold shadow-xs transition"
              >
                <FileSignature className="w-3.5 h-3.5" />
                View Linked Proposal
              </Link>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 text-xs text-slate-600">
          <div>
            <span className="font-mono text-[10px] uppercase text-slate-400 block">Contact</span>
            <span className="font-semibold text-slate-800">{invitation.recipient_name}</span>
            <span className="block text-slate-500">{invitation.recipient_email}</span>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase text-slate-400 block">Organization</span>
            <span className="font-semibold text-slate-800">
              {invitation.recipient_company || "—"}
            </span>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase text-slate-400 block">Delivery Telemetry</span>
            <span className="font-medium">Sent: {invitation.sent_count} times</span>
            {invitation.viewed_at && (
              <span className="block text-blue-600">
                Viewed: {new Date(invitation.viewed_at).toLocaleDateString()}
              </span>
            )}
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase text-slate-400 block">Expiry</span>
            <span className="font-medium text-slate-800">
              {new Date(invitation.expires_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Admin Scope Submission Alert / Feedback */}
      {adminSubmitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Checklist scope successfully recorded and locked! Stage 2 Discovery has been automatically unlocked.</span>
        </div>
      )}

      {/* 3. Client Submission & Review Actions */}
      {responseState ? (
        <div className="space-y-6">
          {/* Submission Overview Card */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-200/60">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 block">
                  Checklist Response Confirmed
                </span>
                <h2 className="text-lg font-bold text-emerald-950 font-poppins">
                  Reference: {responseState.confirmation_reference}
                </h2>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Submitted on {new Date(responseState.submitted_at).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdminIntakeOpen(!isAdminIntakeOpen)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-emerald-300 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 shadow-xs transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isAdminIntakeOpen ? "Hide Scope Intake Form" : "Re-intake / Modify Scope"}</span>
                </button>

                <div className="px-4 py-2 rounded-2xl bg-white border border-emerald-300 text-center shadow-xs">
                  <span className="text-2xl font-extrabold text-emerald-900 block leading-tight">
                    {responseState.selected_count}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 uppercase">of 50 Points Selected</span>
                </div>
              </div>
            </div>

            {responseState.client_notes && (
              <div className="mt-4 p-3.5 bg-white rounded-xl border border-emerald-200 text-xs">
                <span className="font-semibold text-emerald-900 block mb-1">Client Notes / Priorities:</span>
                <p className="text-emerald-950 italic">{responseState.client_notes}</p>
              </div>
            )}
          </div>

          {/* Technical Review & Proposal Generation Form */}
          <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageSquare className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
              <h3 className="font-poppins text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                Internal Technical Review & Proposal Bridge
              </h3>
            </div>

            {proposalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{proposalError}</span>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block text-xs mb-1">
                Internal Review Findings & Engineering Scoping Notes:
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)]"
                placeholder="Document feasibility, architectural constraints, mandatory security baselines, or team capacity..."
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveReview}
                disabled={isSavingReview}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
              >
                {isSavingReview ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : reviewSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Review Saved!
                  </>
                ) : (
                  "Save Review Notes"
                )}
              </button>

              {!proposalId ? (
                <button
                  type="button"
                  onClick={handleCreateProposalDraft}
                  disabled={isCreatingProposal}
                  className="px-5 py-2 rounded-xl bg-[var(--lit-blue,#1565C0)] hover:bg-[#1255A3] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-2 transition shadow-xs"
                >
                  {isCreatingProposal ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating Proposal Draft...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Proposal Draft from {responseState.selected_count} Points
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-800 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  Proposal Draft Linked ({proposalRef || "Active"})
                </div>
              )}
            </div>
          </div>

          {/* Detailed Selected Checkpoints List */}
          <div className="space-y-4">
            <h3 className="font-poppins text-base font-bold text-[var(--lit-navy,#0B2545)]">
              Selected Checkpoints ({selectedDetails.length})
            </h3>

            <div className="space-y-3">
              {selectedDetails.map((cp) => {
                const isExpanded = Boolean(expandedCards[cp.number]);
                return (
                  <div
                    key={cp.number}
                    className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 text-xs transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[var(--lit-blue,#1565C0)]">
                          #{cp.number < 10 ? `0${cp.number}` : cp.number}
                        </span>
                        <h4 className="font-semibold text-slate-900 text-sm">{cp.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          Phase {cp.phase}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleCard(cp.number)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 text-slate-700 bg-slate-50/50 p-3 rounded-xl">
                        <div>
                          <span className="font-mono font-bold uppercase text-[10px] text-slate-400 block">
                            Engineering Requirement:
                          </span>
                          <p className="mt-0.5">{cp.engineering_requirement}</p>
                        </div>
                        <div>
                          <span className="font-mono font-bold uppercase text-[10px] text-slate-400 block">
                            Acceptance Criteria:
                          </span>
                          <p className="mt-0.5">{cp.acceptance_criteria}</p>
                        </div>
                        <div>
                          <span className="font-mono font-bold uppercase text-[10px] text-slate-400 block">
                            Verification Evidence:
                          </span>
                          <p className="mt-0.5">{cp.verification_evidence}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* 4. Admin Direct Scope Intake ("IF US SUBMITTED") */}
      {(!responseState || isAdminIntakeOpen) && (
        <div className="rounded-3xl border-2 border-[var(--lit-blue,#1565C0)]/30 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[var(--lit-blue,#1565C0)] uppercase tracking-wider">
                  Admin Direct Scope Intake ("IF US SUBMITTED")
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-200">
                  Full Authority
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] font-poppins mt-1">
                Record & Lock Scope on Behalf of Client
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                Record checklist requirements agreed via phone, WhatsApp, email, or architecture consultation.
                Submitting updates the invitation to &apos;submitted&apos; and automatically unlocks Stage 2 Discovery.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-[var(--lit-blue,#1565C0)] text-white font-mono font-bold text-xs shadow-xs">
                {adminSelectedPoints.length} / 50 Selected
              </span>
            </div>
          </div>

          {adminSubmitError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{adminSubmitError}</span>
            </div>
          )}

          {/* Intake Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Intake Recording Engineer / Submitter Name:
              </label>
              <input
                type="text"
                value={adminSubmitterName}
                onChange={(e) => setAdminSubmitterName(e.target.value)}
                placeholder="e.g. LIT Solutions Architect"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Notification Delivery:
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={adminNotifyClient}
                  onChange={(e) => setAdminNotifyClient(e.target.checked)}
                  className="rounded text-[var(--lit-blue,#1565C0)] focus:ring-[var(--lit-blue,#1565C0)]"
                />
                <span>Email submission receipt & confirmation to {invitation.recipient_email}</span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Client Scope Notes / Priority Directives:
              </label>
              <textarea
                rows={2}
                value={adminClientNotes}
                onChange={(e) => setAdminClientNotes(e.target.value)}
                placeholder="Enter client's specific requirements, timeline constraints, integration targets, or discussion summary..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)]"
              />
            </div>
          </div>

          {/* Quick Actions & Phase Filters */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Select All 50
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition"
                >
                  Clear Selection
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={intakeSearchQuery}
                  onChange={(e) => setIntakeSearchQuery(e.target.value)}
                  placeholder="Filter checkpoints..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)]"
                />
              </div>
            </div>

            {/* Phase Quick Toggle Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedPhaseFilter("all")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                  selectedPhaseFilter === "all"
                    ? "bg-[var(--lit-navy,#0B2545)] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All 8 Phases
              </button>
              {phases.map((ph) => {
                const phasePoints = checkpoints.filter((c) => c.phase === ph.phase).map((c) => c.number);
                const selectedInPhase = phasePoints.filter((num) => adminSelectedPoints.includes(num)).length;
                const isAllSelected = phasePoints.length > 0 && selectedInPhase === phasePoints.length;
                return (
                  <button
                    key={ph.phase}
                    type="button"
                    onClick={() => {
                      setSelectedPhaseFilter(ph.phase);
                      handleTogglePhase(ph.phase);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition flex items-center gap-1.5 ${
                      isAllSelected
                        ? "bg-[var(--lit-blue,#1565C0)] text-white"
                        : selectedInPhase > 0
                        ? "bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>Phase {ph.phase}</span>
                    <span className="font-mono text-[10px] opacity-80">({selectedInPhase}/{phasePoints.length})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Checkpoint Checklist */}
          <div className="max-h-96 overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-2xl p-3 bg-slate-50/50">
            {filteredIntakeCheckpoints.map((cp) => {
              const isChecked = adminSelectedPoints.includes(cp.number);
              return (
                <div
                  key={cp.number}
                  onClick={() => handleTogglePoint(cp.number)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-3 ${
                    isChecked
                      ? "bg-blue-50/80 border-[var(--lit-blue,#1565C0)] text-slate-900 shadow-2xs"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[var(--lit-blue,#1565C0)]">
                        #{cp.number < 10 ? `0${cp.number}` : cp.number}
                      </span>
                      <span className="font-semibold text-slate-900">{cp.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                        P{cp.phase}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {cp.engineering_requirement}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Scope Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Selected <strong>{adminSelectedPoints.length}</strong> of 50 checkpoints
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {responseState && (
                <button
                  type="button"
                  onClick={() => setIsAdminIntakeOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleAdminSubmit}
                disabled={isAdminSubmitting || adminSelectedPoints.length === 0}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--lit-blue,#1565C0)] hover:bg-[#1255A3] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                {isAdminSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Recording Scope & Unlocking Stages...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Record Scope & Lock Checklist ({adminSelectedPoints.length} Points) →</span>
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
