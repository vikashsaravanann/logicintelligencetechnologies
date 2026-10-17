"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  CheckSquare,
  Activity,
  Settings,
  LayoutDashboard,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  PauseCircle,
  ExternalLink,
  Wallet,
  User,
} from "lucide-react";
import { SafeEmployeeWorkspaceDTO } from "@/lib/workspaces/types";

interface Props {
  workspace: SafeEmployeeWorkspaceDTO;
}

export default function WorkspaceHeaderTabs({ workspace }: Props) {
  const pathname = usePathname();
  const [copiedUuid, setCopiedUuid] = useState(false);

  const copyUuid = async () => {
    try {
      await navigator.clipboard.writeText(workspace.workspaceId);
      setCopiedUuid(true);
      setTimeout(() => setCopiedUuid(false), 2000);
    } catch (err) {
      console.error("Failed to copy UUID:", err);
    }
  };

  const tabs = [
    {
      href: `/admin/workspaces/${workspace.workspaceId}`,
      label: "Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `/admin/workspaces/${workspace.workspaceId}/tasks`,
      label: `Tasks (${workspace.tasks.length})`,
      icon: CheckSquare,
      exact: false,
    },
    {
      href: `/admin/workspaces/${workspace.workspaceId}/projects`,
      label: `Assigned Projects (${workspace.assignedEngagements.length})`,
      icon: Briefcase,
      exact: false,
    },
    {
      href: `/admin/workspaces/${workspace.workspaceId}/wallet`,
      label: "Document Wallet",
      icon: Wallet,
      exact: false,
    },
    {
      href: `/admin/workspaces/${workspace.workspaceId}/profile`,
      label: "Profile",
      icon: User,
      exact: false,
    },
    {
      href: `/admin/workspaces/${workspace.workspaceId}/activity`,
      label: "Activity Log",
      icon: Activity,
      exact: false,
    },
  ];

  if (workspace.isSuperAdminManagementView) {
    tabs.push({
      href: `/admin/workspaces/${workspace.workspaceId}/manage`,
      label: "Management",
      icon: Settings,
      exact: false,
    });
  }

  const shortUuid = `${workspace.workspaceId.slice(0, 8)}...${workspace.workspaceId.slice(-4)}`;

  return (
    <div className="space-y-6">
      {/* Suspended / Inactive State Alert Banner */}
      {(workspace.status === "suspended" || workspace.status === "revoked" || workspace.status === "archived") && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-3 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-rose-900">
              Workspace Access {workspace.status === "suspended" ? "Suspended" : workspace.status === "revoked" ? "Revoked" : "Archived"}
            </p>
            <p className="leading-relaxed">
              This staff workspace is currently <strong>{workspace.status}</strong>. Direct employee access, API operations, and active assignment permissions are halted until reactivated by a Super Admin.
            </p>
          </div>
        </div>
      )}

      {/* Super Admin Management View Alert Banner */}
      {workspace.isSuperAdminManagementView && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-amber-950">
              Super Admin Management View — Read / Governance Mode
            </p>
            <p className="leading-relaxed">
              You are inspecting this employee&apos;s workspace with Super Admin privileges. You are <strong>NOT</strong> impersonating this employee. Actions taken here are logged with your administrative identity.
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Header Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)] font-black flex items-center justify-center shrink-0 text-lg shadow-2xs">
              {workspace.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)]">
                  {workspace.isSuperAdminManagementView ? "Staff Workspace" : "My Admin Workspace"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-[var(--lit-text-muted,#52677C)]">{workspace.department}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--lit-navy,#0B2545)] mt-0.5">
                {workspace.fullName}
              </h1>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-semibold mt-0.5">
                {workspace.jobTitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Badge */}
            {workspace.status === "active" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
              </span>
            ) : workspace.status === "suspended" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                <PauseCircle className="w-3.5 h-3.5 text-rose-600" /> Suspended
              </span>
            ) : workspace.status === "revoked" || workspace.status === "archived" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> {workspace.status === "revoked" ? "Revoked" : "Archived"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Pending Verification
              </span>
            )}

            {/* UUID Copy Button */}
            <button
              onClick={copyUuid}
              title="Copy Workspace UUID"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-mono text-[var(--lit-navy,#0B2545)] border border-[var(--lit-border-light,#DFE7EF)] transition-colors shadow-2xs cursor-pointer"
            >
              {copiedUuid ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>{copiedUuid ? "Copied" : shortUuid}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-[var(--lit-border-light,#DFE7EF)] pt-4 flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shadow-2xs ${
                  isActive
                    ? "bg-[var(--lit-navy,#0B2545)] text-white"
                    : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] bg-white border border-[var(--lit-border-light,#DFE7EF)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
