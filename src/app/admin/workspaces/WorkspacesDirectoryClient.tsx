"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminBackLink } from "@/app/admin/components/AdminBackLink";
import {
  Search,
  Plus,
  Shield,
  Briefcase,
  Mail,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  PauseCircle,
  PlayCircle,
  Users,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import { StaffWorkspaceSummaryDTO, StaffWorkspaceStatus } from "@/lib/workspaces/types";

interface Props {
  initialWorkspaces: StaffWorkspaceSummaryDTO[];
}

export default function WorkspacesDirectoryClient({ initialWorkspaces }: Props) {
  const [workspaces, setWorkspaces] = useState<StaffWorkspaceSummaryDTO[]>(initialWorkspaces);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter workspaces
  const filtered = workspaces.filter((ws) => {
    const matchesSearch =
      ws.name.toLowerCase().includes(search.toLowerCase()) ||
      ws.employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
      ws.employee.email.toLowerCase().includes(search.toLowerCase()) ||
      ws.employee.department.toLowerCase().includes(search.toLowerCase()) ||
      ws.employee.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      ws.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "all") return true;
    if (statusFilter === "active") return ws.status === "active";
    if (statusFilter === "pending")
      return (
        ws.status === "pending_email_verification" ||
        ws.status === "initial_password_change_required"
      );
    if (statusFilter === "suspended") return ws.status === "suspended";

    return true;
  });

  const totalCount = workspaces.length;
  const activeCount = workspaces.filter((w) => w.status === "active").length;
  const pendingCount = workspaces.filter(
    (w) =>
      w.status === "pending_email_verification" ||
      w.status === "initial_password_change_required"
  ).length;
  const suspendedCount = workspaces.filter((w) => w.status === "suspended").length;

  const copyUrl = async (id: string) => {
    const origin = window?.location?.origin || "https://www.logicintelligencetechnologies.in";
    const url = `${origin}/admin/workspaces/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleResendInvite = async (wsId: string, email: string) => {
    setActionLoadingId(wsId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/workspaces/${wsId}/resend-invite`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to resend invitation.");
      }
      setFeedback({
        type: "success",
        message: `Invitation email successfully queued for ${email}.`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Failed to resend invitation.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleSuspend = async (wsId: string, currentStatus: StaffWorkspaceStatus) => {
    const isCurrentlySuspended = currentStatus === "suspended";
    const nextStatus: StaffWorkspaceStatus = isCurrentlySuspended ? "active" : "suspended";
    const reason = isCurrentlySuspended
      ? "Reactivated by Super Admin from workspaces directory"
      : "Suspended by Super Admin from workspaces directory";

    setActionLoadingId(wsId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/workspaces/${wsId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update workspace status.");
      }

      setWorkspaces((prev) =>
        prev.map((w) => (w.id === wsId ? { ...w, status: nextStatus } : w))
      );
      setFeedback({
        type: "success",
        message: `Workspace status successfully updated to ${nextStatus}.`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Failed to update workspace status.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminBackLink href="/admin/command-center" label="Command Center" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            <Shield className="w-4 h-4" /> Personnel Governance
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Staff Admin Workspaces Directory
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Person-specific employee workspaces, assigned modules, credentials lifecycle, and access governance.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/workspaces/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Staff Workspace</span>
          </Link>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Workspaces</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Active Staff</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{activeCount}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Pending Setup</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-400">{pendingCount}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Suspended</span>
            <PauseCircle className="w-4 h-4 text-red-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-400">{suspendedCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Search employee, job title, email, UUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "pending", label: "Pending Setup" },
            { id: "suspended", label: "Suspended" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-black/30 text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workspaces List / Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-12 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No staff workspaces found</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            {search || statusFilter !== "all"
              ? "Try adjusting your search criteria or filter options."
              : "No individual staff workspaces have been provisioned yet. Super Admin can create the first employee workspace."}
          </p>
          <div className="pt-2">
            <Link
              href="/admin/workspaces/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Staff Workspace</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 border-b border-white/10 text-neutral-400 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Role & Department</th>
                  <th className="px-5 py-3.5">Assignments & Tasks</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((ws) => {
                  const isActionLoading = actionLoadingId === ws.id;
                  const isSuspended = ws.status === "suspended";

                  return (
                    <tr key={ws.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Employee Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                            {ws.employee.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{ws.employee.fullName}</p>
                            <p className="text-[11px] text-neutral-400 font-mono truncate">{ws.employee.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department & Role */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{ws.employee.jobTitle}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-neutral-400">{ws.employee.department}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-neutral-800 text-neutral-300">
                            {ws.role}
                          </span>
                        </div>
                      </td>

                      {/* Tasks & Projects */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-neutral-300">
                            <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                            <span>{ws.taskCount} tasks</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-neutral-300">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{ws.assignedProjectCount} projects</span>
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {ws.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : ws.status === "suspended" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            <PauseCircle className="w-3 h-3" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Sparkles className="w-3 h-3" /> Pending Setup
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => copyUrl(ws.id)}
                            title="Copy Direct URL"
                            className="p-2 rounded-lg bg-black/40 hover:bg-neutral-800 text-neutral-300 transition-colors border border-white/5"
                          >
                            {copiedId === ws.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleResendInvite(ws.id, ws.employee.email)}
                            disabled={isActionLoading}
                            title="Resend Invitation Email"
                            className="p-2 rounded-lg bg-black/40 hover:bg-neutral-800 text-neutral-300 transition-colors border border-white/5 disabled:opacity-50"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleSuspend(ws.id, ws.status)}
                            disabled={isActionLoading}
                            title={isSuspended ? "Reactivate Workspace" : "Suspend Workspace"}
                            className={`p-2 rounded-lg transition-colors border border-white/5 disabled:opacity-50 ${
                              isSuspended
                                ? "bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400"
                                : "bg-black/40 hover:bg-red-950/40 text-neutral-400 hover:text-red-400"
                            }`}
                          >
                            {isSuspended ? (
                              <PlayCircle className="w-3.5 h-3.5" />
                            ) : (
                              <PauseCircle className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <Link
                            href={`/admin/workspaces/${ws.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-semibold text-xs border border-blue-500/30 transition-colors"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
