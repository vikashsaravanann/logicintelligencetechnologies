"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  MessageCircle,
  FileText,
  Loader2,
  Check,
  ExternalLink,
  ShieldCheck,
  Copy,
  Plus,
} from "lucide-react";

interface Props {
  invitationId: string;
  recipientName: string;
  recipientEmail: string;
  company?: string | null;
  status: string;
  selectedCount?: number;
  proposalId?: string | null;
  initialReviewNotes?: string | null;
}

export function ChecklistDetailActions({
  invitationId,
  recipientName,
  recipientEmail,
  company,
  status,
  selectedCount = 0,
  proposalId,
  initialReviewNotes,
}: Props) {
  const router = useRouter();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [reviewStatus, setReviewStatus] = useState("reviewed");
  const [reviewNotes, setReviewNotes] = useState(initialReviewNotes || "");
  const [savingReview, setSavingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState(
    `Enterprise Architecture & Application Deployment — ${company || recipientName}`
  );
  const [proposalPricing, setProposalPricing] = useState("250000");
  const [proposalTimeline, setProposalTimeline] = useState("4-6 Weeks");
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(proposalId || null);

  const handleSendEmail = async () => {
    setSendingEmail(true);
    setEmailError(null);
    setEmailSuccess(false);
    try {
      const res = await fetch(`/api/admin/enterprise-checklists/${invitationId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "email" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch email.");
      setEmailSuccess(true);
      router.refresh();
    } catch (err: any) {
      setEmailError(err?.message || "Failed to send email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleWhatsApp = async () => {
    try {
      const res = await fetch(`/api/admin/enterprise-checklists/${invitationId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "whatsapp" }),
      });
      const data = await res.json();
      if (data.shareUrl) {
        window.open(data.shareUrl, "_blank");
      }
    } catch (err) {
      console.error("WhatsApp share failed:", err);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingReview(true);
    setReviewSuccess(false);
    try {
      const res = await fetch(`/api/admin/enterprise-checklists/${invitationId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewStatus,
          internalNotes: reviewNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save review.");
      setReviewSuccess(true);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Could not save review.");
    } finally {
      setSavingReview(false);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProposal(true);
    try {
      const res = await fetch(`/api/admin/enterprise-checklists/${invitationId}/create-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: proposalTitle,
          timeline: proposalTimeline,
          pricing: Number(proposalPricing),
          currency: "INR",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create proposal draft.");
      setProposalSuccess(data.proposalId);
      setShowProposalModal(false);
      router.refresh();
      router.push(`/admin/proposals/${data.proposalId}`);
    } catch (err: any) {
      alert(err?.message || "Failed to generate proposal draft.");
    } finally {
      setCreatingProposal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Controls Bar */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs space-y-4">
        <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
          Outreach & Commercial Actions
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lit-blue,#1565C0)] hover:bg-[#0D47A1] text-white text-xs font-semibold shadow-2xs disabled:opacity-50 transition-colors"
          >
            {sendingEmail ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending Invitation…</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Invitation Email</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Share via WhatsApp</span>
          </button>

          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => setShowProposalModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{proposalSuccess ? "View Draft Proposal" : "Generate Proposal Draft"}</span>
            </button>
          )}
        </div>

        {emailSuccess && (
          <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Invitation email successfully dispatched to {recipientEmail}.</span>
          </p>
        )}
        {emailError && <p className="text-xs text-rose-600">{emailError}</p>}
      </div>

      {/* Internal Technical Review Box */}
      {selectedCount > 0 && (
        <form onSubmit={handleSaveReview} className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Technical Lead Review & Assessment
            </h3>
            <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">Staff Internal Only</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase font-bold text-[var(--lit-text-muted,#52677C)] block mb-1">
                Review Status
              </label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] text-xs font-medium"
              >
                <option value="reviewed">Reviewed (Scope Understood)</option>
                <option value="scope_confirmed">Scope Confirmed (Ready for Proposal)</option>
                <option value="clarification_requested">Requires Technical Clarification</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase font-bold text-[var(--lit-text-muted,#52677C)] block mb-1">
              Internal Technical Review Notes
            </label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g. Next.js 16 App router verified, client needs AWS S3 bucket permissions, telephony voice agent requires sub-400ms streaming..."
              className="w-full p-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] text-xs focus:outline-none focus:border-[var(--lit-blue,#1565C0)]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {reviewSuccess ? (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Review notes saved.</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={savingReview}
              className="px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white text-xs font-semibold disabled:opacity-50"
            >
              {savingReview ? "Saving…" : "Save Review"}
            </button>
          </div>
        </form>
      )}

      {/* Generate Proposal Draft Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="font-poppins font-bold text-base text-[var(--lit-navy,#0B2545)]">
              Create Commercial Proposal Draft
            </h3>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              This will pre-populate candidate scope items from the {selectedCount} selected checkpoints into an editable proposal draft. It will NOT be sent automatically.
            </p>

            <form onSubmit={handleCreateProposal} className="space-y-3 text-xs">
              <div>
                <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  required
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                    Proposed Investment (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={proposalPricing}
                    onChange={(e) => setProposalPricing(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)]"
                  />
                </div>

                <div>
                  <label className="font-mono font-bold text-[10px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                    Timeline *
                  </label>
                  <input
                    type="text"
                    required
                    value={proposalTimeline}
                    onChange={(e) => setProposalTimeline(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProposal}
                  className="px-5 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] text-white font-bold uppercase tracking-wider text-xs"
                >
                  {creatingProposal ? "Generating Draft…" : "Create Editable Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
