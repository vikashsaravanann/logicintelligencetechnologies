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
} from "lucide-react";
import { SafeEmployeeWorkspaceDTO, StaffWorkspaceStatus } from "@/lib/workspaces/types";

interface Props {
  workspace: SafeEmployeeWorkspaceDTO;
}

export default function ManageWorkspaceClient({ workspace }: Props) {
  const [status, setStatus] = useState<StaffWorkspaceStatus>(workspace.status);
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [resending, setResending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" /> Super Admin Workspace Governance
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Founder-level administrative controls, credentials status, and access suspension.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>Super Admin Access Only</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-4 text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
              : "border-red-500/30 bg-red-950/20 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Copyable Routing Links */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          Routing & Shareable Links
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Direct Workspace Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={wsUrl}
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-neutral-200 select-all focus:outline-none"
              />
              <button
                onClick={() => copyText(wsUrl, "link")}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Direct Login Redirect Link (Sends employee to workspace upon login)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={loginUrl}
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-neutral-200 select-all focus:outline-none"
              />
              <button
                onClick={() => copyText(loginUrl, "login")}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors"
              >
                {copiedLogin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLogin ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resend Invitation Card */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" /> Outbound Email Dispatch
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Re-queue official workspace invitation email to <span className="font-mono text-white">{workspace.email}</span>.
            </p>
          </div>

          <button
            onClick={handleResendInvite}
            disabled={resending}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            <span>{resending ? "Dispatching..." : "Resend Invitation"}</span>
          </button>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/30 p-3.5 text-xs text-neutral-400 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Remember: Invitation emails never include the temporary password. You must deliver credentials out-of-band.
          </span>
        </div>
      </div>

      {/* Status Lifecycle Governance Card */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" /> Status Lifecycle Governance
        </h3>
        <p className="text-xs text-neutral-400">
          Current status: <strong className="text-white uppercase">{status}</strong>
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">
              Operational Justification / Audit Reason <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Temporary leave of absence / Security review / Reinstated"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {status !== "active" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("active")}
                disabled={updating}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition-all"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Revoke Access</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
