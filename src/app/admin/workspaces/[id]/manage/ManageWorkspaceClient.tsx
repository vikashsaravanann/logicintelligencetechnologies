"use client";

import React, { useState } from "react";
import {
  Settings,
  Mail,
  Shield,
  ShieldAlert,
  PauseCircle,
  PlayCircle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import { SafeEmployeeWorkspaceDTO, StaffWorkspaceStatus } from "@/lib/workspaces/types";
import AssignProjectsModal from "@/app/admin/workspaces/components/AssignProjectsModal";

interface Props {
  workspace: SafeEmployeeWorkspaceDTO;
}

export default function ManageWorkspaceClient({ workspace }: Props) {
  const [status, setStatus] = useState<StaffWorkspaceStatus>(workspace.status);
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedLogin, setCopiedLogin] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://www.logicintelligencetechnologies.in";
  const wsUrl = `${origin}/admin/workspaces/${workspace.workspaceId}`;
  const loginUrl = `${origin}/login?next=${encodeURIComponent(`/admin/workspaces/${workspace.workspaceId}`)}`;

  const handleUpdateStatus = async (newStatus: StaffWorkspaceStatus) => {
    if (!reason.trim()) {
      setFeedback({ type: "error", message: "Please enter an operational reason for changing workspace status." });
      return;
    }

    setUpdating(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/workspaces/${workspace.workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update workspace status.");
      }

      setStatus(newStatus);
      setReason("");
      setFeedback({
        type: "success",
        message: `Workspace status successfully updated to ${newStatus}.`,
      });
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Failed to update status." });
    } finally {
      setUpdating(false);
    }
  };

  const handleResendInvite = async () => {
    setResending(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/workspaces/${workspace.workspaceId}/resend-invite`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to resend invitation email.");
      }

      setFeedback({
        type: "success",
        message: `Invitation email successfully queued for delivery to ${workspace.email}.`,
      });
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message || "Failed to resend invitation email." });
    } finally {
      setResending(false);
    }
  };

  const copyText = async (text: string, type: "link" | "login") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedLogin(true);
        setTimeout(() => setCopiedLogin(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--lit-blue,#1565C0)]" /> Super Admin Workspace Governance
          </h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
            Founder-level administrative controls, credentials status, and access suspension.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)] text-xs font-bold uppercase tracking-wider shadow-2xs">
          <Shield className="w-3.5 h-3.5" />
          <span>Super Admin Access Only</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border p-4 text-xs font-medium flex items-center justify-between shadow-2xs ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* Copyable Routing Links */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-4 shadow-2xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
          Routing & Shareable Links
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1">
              Direct Workspace Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={wsUrl}
                className="flex-1 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2 text-xs font-mono text-[var(--lit-navy,#0B2545)] select-all focus:outline-none"
              />
              <button
                onClick={() => copyText(wsUrl, "link")}
                className="px-3.5 py-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1">
              Direct Login Redirect Link (Sends employee to workspace upon login)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={loginUrl}
                className="flex-1 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2 text-xs font-mono text-[var(--lit-navy,#0B2545)] select-all focus:outline-none"
              />
              <button
                onClick={() => copyText(loginUrl, "login")}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                {copiedLogin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLogin ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resend Invitation Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-700" /> Outbound Email Dispatch
            </h3>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Re-queue official workspace invitation email to <span className="font-mono text-[var(--lit-navy,#0B2545)] font-bold">{workspace.email}</span>.
            </p>
          </div>

          <button
            onClick={handleResendInvite}
            disabled={resending}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            <span>{resending ? "Dispatching..." : "Resend Invitation"}</span>
          </button>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <span>
            Remember: Invitation emails never include the temporary password. You must deliver credentials out-of-band.
          </span>
        </div>
      </div>

      {/* Client Engagements & Assignments */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-700" /> Client Engagements & Assignments
            </h3>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Assign this staff member to client engagements, change permissions, or revoke project assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-2xs cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Assign Projects</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)]">
          <span>Currently assigned to <strong className="text-[var(--lit-navy,#0B2545)] font-bold">{workspace.assignedEngagements?.length || 0}</strong> client engagement(s)</span>
          <a
            href={`/admin/workspaces/${workspace.workspaceId}/projects`}
            className="text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider inline-flex items-center gap-1"
          >
            <span>View Projects</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Status Lifecycle Governance Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-4 shadow-2xs">
        <div className="border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700" /> Status Lifecycle Governance
          </h3>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
            Current status: <strong className="text-[var(--lit-navy,#0B2545)] uppercase">{status}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
              Operational Justification / Audit Reason <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Temporary leave of absence / Security review / Reinstated"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-2.5 text-xs text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {status !== "active" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("active")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-2xs cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Reactivate Workspace</span>
              </button>
            )}

            {status !== "suspended" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("suspended")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-2xs cursor-pointer"
              >
                <PauseCircle className="w-4 h-4" />
                <span>Suspend Workspace</span>
              </button>
            )}

            {status !== "revoked" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("revoked")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-2xs cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Revoke Access</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <AssignProjectsModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        workspaceId={workspace.workspaceId}
        staffUserId={workspace.ownerUserId}
        staffEmail={workspace.email}
        staffName={workspace.fullName}
      />
    </div>
  );
}
