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

  const selectedNumbers = response?.selectedPoints || [];
  const selectedDetails = checkpoints.filter((c) => selectedNumbers.includes(c.number));

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

      {/* 2. Client Submission & Review Actions */}
      {response ? (
        <div className="space-y-6">
          {/* Submission Overview Card */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-200/60">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 block">
                  Client Response Confirmed
                </span>
                <h2 className="text-lg font-bold text-emerald-950 font-poppins">
                  Reference: {response.confirmation_reference}
                </h2>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Submitted on {new Date(response.submitted_at).toLocaleString()}
                </p>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-white border border-emerald-300 text-center shadow-xs">
                <span className="text-2xl font-extrabold text-emerald-900 block leading-tight">
                  {response.selected_count}
                </span>
                <span className="text-[10px] font-mono text-emerald-700 uppercase">of 50 Points Selected</span>
              </div>
            </div>

            {response.client_notes && (
              <div className="mt-4 p-3.5 bg-white rounded-xl border border-emerald-200 text-xs">
                <span className="font-semibold text-emerald-900 block mb-1">Client Notes / Priorities:</span>
                <p className="text-emerald-950 italic">{response.client_notes}</p>
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
                      Generate Proposal Draft from {response.selected_count} Points
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
      ) : (
        /* Awaiting Client Submission Card */
        <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-8 text-center space-y-3">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-poppins text-base font-bold text-slate-800">
            Awaiting Client Scope Selection
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The client has not yet submitted their checklist requirements. When they submit, their exact selections, notes, and confirmation reference will appear here automatically.
          </p>
        </div>
      )}
    </div>
  );
}
