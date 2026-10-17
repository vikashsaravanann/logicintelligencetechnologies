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
      {/* Super Admin Management View Alert Banner */}
      {workspace.isSuperAdminManagementView && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-200 flex items-start gap-3 shadow-lg">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-amber-300">
              Super Admin Management View — Read / Governance Mode
            </p>
            <p className="leading-relaxed">
              You are inspecting this employee&apos;s workspace with Super Admin privileges. You are <strong>NOT</strong> impersonating this employee. Actions taken here are logged with your administrative identity.
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Header Card */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-lg shadow-inner">
              {workspace.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {workspace.isSuperAdminManagementView ? "Staff Workspace" : "My Admin Workspace"}
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-xs text-neutral-400">{workspace.department}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
                {workspace.fullName}
              </h1>
              <p className="text-xs text-neutral-300 font-semibold mt-0.5">
                {workspace.jobTitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Badge */}
            {workspace.status === "active" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            ) : workspace.status === "suspended" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                <PauseCircle className="w-3.5 h-3.5" /> Suspended
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Pending Verification
              </span>
            )}

            {/* UUID Copy Button */}
            <button
              onClick={copyUuid}
              title="Copy Workspace UUID"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 hover:bg-neutral-800 text-xs font-mono text-neutral-300 border border-white/10 transition-colors"
            >
              {copiedUuid ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span>{copiedUuid ? "Copied" : shortUuid}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-white/10 pt-4 flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
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
