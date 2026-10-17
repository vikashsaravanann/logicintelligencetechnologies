"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Users,
  GitPullRequest,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserPlus,
  Mail,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Send,
  Loader2,
} from "lucide-react";
import { SafeEmployeeWorkspaceDTO } from "@/lib/workspaces/types";
import { ClientEngagement } from "@/lib/engagements/types";
import { ProjectTeamMember, ProjectStaffRole } from "@/lib/collaboration/project-collaboration-service";

interface Props {
  workspace: SafeEmployeeWorkspaceDTO;
  engagement: ClientEngagement;
  stages: any[];
  teamMembers: ProjectTeamMember[];
  changeRequests: any[];
  canInvite: boolean;
  callerUserId: string;
}

export default function StaffProjectDetailClient({
  workspace,
  engagement,
  stages,
  teamMembers,
  changeRequests,
  canInvite,
  callerUserId,
}: Props) {
  const [activeTab, setActiveTab] = useState<"stages" | "team" | "rfcs">("stages");

  // Invite Modal / Form State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectStaffRole>("collaborator");
  const [inviteNotes, setInviteNotes] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<{ url: string; recipient: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      setInviteError("Colleague email is required.");
      return;
    }

    try {
      setInviting(true);
      setInviteError(null);
      setInviteSuccess(null);

      const res = await fetch(`/api/admin/projects/${engagement.id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: inviteEmail.trim(),
          requestedRole: inviteRole,
          notes: inviteNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to issue invitation");
      }

      setInviteSuccess({
        url: data.inviteUrl,
        recipient: data.invitation.recipient_email,
      });
      setInviteEmail("");
      setInviteNotes("");
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const copyInviteUrl = async () => {
    if (!inviteSuccess?.url) return;
    try {
      await navigator.clipboard.writeText(inviteSuccess.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href={`/admin/workspaces/${workspace.workspaceId}/projects`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assigned Projects</span>
        </Link>
      </div>

      {/* Corporate Redaction Policy Alert Banner */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 flex items-start gap-3 shadow-md">
        <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider text-amber-300">
            LIT Corporate Governance Policy 1 — Commercial Redaction Active
          </p>
          <p className="leading-relaxed">
            Staff delivery views strictly redact <strong>Stage 06 (Advance Invoice)</strong> and{" "}
            <strong>Stage 11 (Final Payment)</strong>. Commercial contract pricing, invoice totals, and client banking details are restricted to the Founder / Super Admin.
          </p>
        </div>
      </div>

      {/* Engagement Header Card */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {engagement.status}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Ref: {engagement.engagement_ref}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              {engagement.company_name}
            </h1>
            <p className="text-sm font-medium text-neutral-300 mt-0.5">
              {engagement.project_title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canInvite && (
              <button
                onClick={() => {
                  setShowInviteModal(true);
                  setInviteSuccess(null);
                  setInviteError(null);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Collaborator</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border-t border-white/10 pt-4 flex items-center gap-2">
          <button
            onClick={() => setActiveTab("stages")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "stages"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>13-Stage Journey</span>
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "team"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Delivery Team ({teamMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("rfcs")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "rfcs"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Change Requests (RFCs)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 13-STAGE LIFECYCLE JOURNEY */}
      {activeTab === "stages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" /> Canonical Technical Lifecycle Gates
            </h3>
            <span className="text-xs text-neutral-400">
              Stages 6 & 11 Restrict Commercial Billing to Founder
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stages.map((st: any, idx: number) => {
              const ordinal = st.ordinal || idx + 1;
              const isRestricted = st.isRestricted || ordinal === 6 || ordinal === 11;

              if (isRestricted) {
                return (
                  <div
                    key={st.key || ordinal}
                    className="rounded-2xl border border-amber-500/30 bg-neutral-900/40 p-5 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center font-mono">
                          {String(ordinal).padStart(2, "0")}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            Founder Governance Gate
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            {st.title || (ordinal === 6 ? "Initial Advance Invoice & Payment" : "Final Balance Invoice & Payment")}
                          </h4>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Lock className="w-3 h-3" />
                        <span>Restricted</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-950/60 border border-white/5 space-y-1">
                      <p className="text-xs text-amber-200/90 font-medium">
                        This stage is restricted to the Founder / Super Admin.
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Commercial pricing, bank accounts, and invoice approval are handled exclusively via the Super Admin Command Center.
                      </p>
                    </div>
                  </div>
                );
              }

              // Normal Technical Stage
              const isDone = st.status === "completed" || st.status === "approved" || st.status === "signed";
              const isInProgress = st.status === "in_progress" || st.status === "submitted";

              return (
                <div
                  key={st.key || ordinal}
                  className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 space-y-3 hover:border-white/20 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center font-mono ${
                          isDone
                            ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                            : isInProgress
                            ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400"
                            : "bg-neutral-800 border border-white/10 text-neutral-400"
                        }`}
                      >
                        {String(ordinal).padStart(2, "0")}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {st.badgeText || `Stage ${ordinal}`}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {st.title || st.shortTitle}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : isInProgress
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                          : "bg-neutral-800 text-neutral-400 border-white/10"
                      }`}
                    >
                      {st.status?.replace("_", " ") || "Scheduled"}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 line-clamp-2">
                    {st.description || st.summary}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>Gate: {st.key}</span>
                    <span className="text-indigo-400 font-medium">Technical Review</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DELIVERY TEAM & COLLABORATION */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Authorized Project Team Members
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Staff members explicitly authorized to collaborate on this engagement.
              </p>
            </div>

            {canInvite && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Colleague</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.assignmentId}
                className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center text-sm">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{member.name}</h4>
                        {member.isPrimaryLead && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Primary Lead
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">{member.email}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-white/5">
                    {member.role.replace("_", " ")}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        member.canInviteCollaborators ? "text-indigo-400" : "text-neutral-600"
                      }`}
                    />
                    <span>
                      {member.canInviteCollaborators ? "Can invite colleagues" : "Team member"}
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-500">
                    Assigned: {new Date(member.assignedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CHANGE REQUESTS (RFCs) */}
      {activeTab === "rfcs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-indigo-400" /> Client Change Requests (RFCs)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Scope modifications requested by client. Commercial impact is sanitized.
              </p>
            </div>
          </div>

          {changeRequests.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-12 text-center text-neutral-400 space-y-2">
              <GitPullRequest className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-xs">No active change requests recorded for this engagement.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {changeRequests.map((rfc: any) => (
                <div
                  key={rfc.id}
                  className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        RFC #{rfc.id.slice(0, 8)}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {rfc.title || "Technical Scope Modification"}
                      </h4>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-white/5">
                      {rfc.status || "Under Review"}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300">
                    {rfc.description || rfc.justification}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5 text-amber-300/80">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Commercial Cost: Restricted to Founder</span>
                    </span>
                    <span>Requested: {new Date(rfc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INVITE COLLABORATOR MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Invite Colleague to Project</h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {inviteError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            {inviteSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Invitation Dispatched to {inviteSuccess.recipient}</span>
                  </div>
                  <p className="text-neutral-300">
                    A secure 256-bit single-use invitation link was sent via official tracked email. Valid for 7 days.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Direct Invitation URL (Single-Use Token)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteSuccess.url}
                      className="w-full text-xs font-mono rounded-xl border border-white/10 bg-neutral-950 p-2.5 text-neutral-300"
                    />
                    <button
                      onClick={copyInviteUrl}
                      className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteSuccess(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Colleague Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@logicintelligencetechnologies.in"
                    className="w-full text-xs rounded-xl border border-white/10 bg-neutral-950 p-2.5 text-neutral-200 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Must be an active employee registered in the LIT directory.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Project Collaboration Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as ProjectStaffRole)}
                    className="w-full text-xs rounded-xl border border-white/10 bg-neutral-950 p-2.5 text-neutral-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="collaborator">Collaborator (General Engineering)</option>
                    <option value="technical_specialist">Technical Specialist (Architecture / ML)</option>
                    <option value="delivery_engineer">Delivery Engineer (Implementation)</option>
                    <option value="technical_support">Technical Support (Client SLA Owner)</option>
                    <option value="project_coordinator">Project Coordinator (Milestones)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Invitation Note / Scope Assignment (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={inviteNotes}
                    onChange={(e) => setInviteNotes(e.target.value)}
                    placeholder="e.g., Assigned to sprint deliverables for PostgreSQL RLS architecture and Supabase triggers..."
                    className="w-full text-xs rounded-xl border border-white/10 bg-neutral-950 p-2.5 text-neutral-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={inviting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                  >
                    {inviting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Invite...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Invitation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
