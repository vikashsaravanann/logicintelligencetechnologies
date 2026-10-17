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
    const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
    const reason =
      nextStatus === "suspended"
        ? "Administrative suspension by Super Admin via Workspaces Directory."
        : "Reactivated by Super Admin via Workspaces Directory.";

    setActionLoadingId(wsId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/workspaces/${wsId}/status`, {
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
      {/* Top Header */}
      <div className="pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <AdminBackLink href="/admin/command-center" label="Command Center" />
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono mb-2">
              <Shield className="w-3.5 h-3.5" /> Personnel Governance
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
              Staff Admin Workspaces Directory
            </h1>
            <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)]">
              Person-specific employee workspaces, assigned modules, credentials lifecycle, and access governance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/workspaces/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Staff Workspace</span>
            </Link>
          </div>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">Total Workspaces</span>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">Active Staff</span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-700 font-mono">{activeCount}</p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">Pending Setup</span>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-700 font-mono">{pendingCount}</p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">Suspended</span>
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              <PauseCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-rose-700 font-mono">{suspendedCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, job title, email, UUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl pl-9 pr-4 py-2 text-xs text-[var(--lit-ink,#121826)] placeholder:text-slate-400 focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] transition-colors shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "pending", label: "Pending Setup" },
            { id: "suspended", label: "Suspended" },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer ${
                  isSelected
                    ? "bg-[var(--lit-navy,#0B2545)] text-white"
                    : "bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-text-muted,#52677C)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspaces List / Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-12 text-center space-y-3 shadow-2xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-center text-[var(--lit-teal,#1FA9A2)]">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">No staff workspaces found</h3>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-md mx-auto">
            {search || statusFilter !== "all"
              ? "Try adjusting your search criteria or filter options."
              : "No individual staff workspaces have been provisioned yet. Super Admin can create the first employee workspace."}
          </p>
          <div className="pt-2">
            <Link
              href="/admin/workspaces/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-xs font-bold uppercase tracking-wider text-white shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Staff Workspace</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--lit-cloud,#F7F9FC)] border-b border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Role & Department</th>
                  <th className="px-5 py-3.5">Assignments & Tasks</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {filtered.map((ws) => {
                  const isActionLoading = actionLoadingId === ws.id;
                  const isSuspended = ws.status === "suspended";

                  return (
                    <tr key={ws.id} className="hover:bg-[var(--lit-cloud,#F7F9FC)]/50 transition-colors">
                      {/* Employee Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)] font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                            {ws.employee.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--lit-navy,#0B2545)] truncate">{ws.employee.fullName}</p>
                            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] font-mono truncate">{ws.employee.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department & Role */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-[var(--lit-navy,#0B2545)]">{ws.employee.jobTitle}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">{ws.employee.department}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            {ws.role}
                          </span>
                        </div>
                      </td>

                      {/* Tasks & Projects */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 font-semibold text-[var(--lit-navy,#0B2545)]">
                            <CheckSquare className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
                            <span>{ws.taskCount} tasks</span>
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[var(--lit-navy,#0B2545)]">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{ws.assignedProjectCount} projects</span>
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {ws.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        ) : ws.status === "suspended" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                            <PauseCircle className="w-3 h-3 text-rose-600" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                            <Sparkles className="w-3 h-3 text-amber-600" /> Pending Setup
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => copyUrl(ws.id)}
                            title="Copy Direct URL"
                            className="p-2 rounded-lg bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] transition-colors border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs cursor-pointer"
                          >
                            {copiedId === ws.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>

                          <button
                            onClick={() => handleResendInvite(ws.id, ws.employee.email)}
                            disabled={isActionLoading}
                            title="Resend Invitation Email"
                            className="p-2 rounded-lg bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] transition-colors border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs disabled:opacity-50 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                          </button>

                          <button
                            onClick={() => handleToggleSuspend(ws.id, ws.status)}
                            disabled={isActionLoading}
                            title={isSuspended ? "Reactivate Workspace" : "Suspend Workspace"}
                            className={`p-2 rounded-lg transition-colors border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs disabled:opacity-50 cursor-pointer ${
                              isSuspended
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                : "bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600"
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[var(--lit-blue,#1565C0)] font-bold text-xs uppercase tracking-wider border border-blue-200 transition-colors shadow-2xs"
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
