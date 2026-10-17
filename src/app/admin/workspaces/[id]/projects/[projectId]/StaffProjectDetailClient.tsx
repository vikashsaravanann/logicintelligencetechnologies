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
  initialMessages?: any[];
  canInvite: boolean;
  callerUserId: string;
}

export default function StaffProjectDetailClient({
  workspace,
  engagement,
  stages,
  teamMembers,
  changeRequests,
  initialMessages = [],
  canInvite,
  callerUserId,
}: Props) {
  const [activeTab, setActiveTab] = useState<"stages" | "team" | "rfcs" | "messages">("stages");
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      setMessageError(null);
      const res = await fetch(`/api/admin/projects/${engagement.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send message");
      }
      setMessages((prev) => [...prev, data.message]);
      setNewMessage("");
    } catch (err: any) {
      setMessageError(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

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
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assigned Projects</span>
        </Link>
      </div>

      {/* Corporate Redaction Policy Alert Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
        <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider text-amber-950">
            LIT Corporate Governance Policy 1 — Commercial Redaction Active
          </p>
          <p className="leading-relaxed">
            Staff delivery views strictly redact <strong>Stage 06 (Advance Invoice)</strong> and{" "}
            <strong>Stage 11 (Final Payment)</strong>. Commercial contract pricing, invoice totals, and client banking details are restricted to the Founder / Super Admin.
          </p>
        </div>
      </div>

      {/* Engagement Header Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-200">
                {engagement.status}
              </span>
              <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
                Ref: {engagement.engagement_ref}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[var(--lit-navy,#0B2545)] mt-1">
              {engagement.company_name}
            </h1>
            <p className="text-sm font-medium text-[var(--lit-text-muted,#52677C)] mt-0.5">
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Collaborator</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border-t border-[var(--lit-border-light,#DFE7EF)] pt-4 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("stages")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs ${
              activeTab === "stages"
                ? "bg-[var(--lit-navy,#0B2545)] text-white"
                : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] bg-white border border-[var(--lit-border-light,#DFE7EF)]"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>13-Stage Journey</span>
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs ${
              activeTab === "team"
                ? "bg-[var(--lit-navy,#0B2545)] text-white"
                : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] bg-white border border-[var(--lit-border-light,#DFE7EF)]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Delivery Team ({teamMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("rfcs")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs ${
              activeTab === "rfcs"
                ? "bg-[var(--lit-navy,#0B2545)] text-white"
                : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] bg-white border border-[var(--lit-border-light,#DFE7EF)]"
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Change Requests (RFCs)</span>
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs ${
              activeTab === "messages"
                ? "bg-[var(--lit-navy,#0B2545)] text-white"
                : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] bg-white border border-[var(--lit-border-light,#DFE7EF)]"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Project Messages ({messages.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: 13-STAGE LIFECYCLE JOURNEY */}
      {activeTab === "stages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" /> Canonical Technical Lifecycle Gates
            </h3>
            <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
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
                    className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-3 relative overflow-hidden shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs flex items-center justify-center font-mono">
                          {String(ordinal).padStart(2, "0")}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                            Founder Governance Gate
                          </span>
                          <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                            {st.title || (ordinal === 6 ? "Initial Advance Invoice & Payment" : "Final Balance Invoice & Payment")}
                          </h4>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>Restricted</span>
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1 shadow-2xs">
                      <p className="text-xs text-amber-950 font-bold">
                        This stage is restricted to the Founder / Super Admin.
                      </p>
                      <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
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
                  className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 space-y-3 hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center font-mono ${
                          isDone
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                            : isInProgress
                            ? "bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]"
                            : "bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-slate-500"
                        }`}
                      >
                        {String(ordinal).padStart(2, "0")}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                          {st.badgeText || `Stage ${ordinal}`}
                        </span>
                        <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                          {st.title || st.shortTitle}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isDone
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : isInProgress
                          ? "bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {st.status?.replace("_", " ") || "Scheduled"}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--lit-text-muted,#52677C)] line-clamp-2">
                    {st.description || st.summary}
                  </p>

                  <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-[11px] text-[var(--lit-text-muted,#52677C)]">
                    <span>Gate: {st.key}</span>
                    <span className="text-[var(--lit-teal,#1FA9A2)] font-bold">Technical Review</span>
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
          <div className="flex items-center justify-between pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--lit-blue,#1565C0)]" /> Authorized Project Team Members
              </h3>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                Staff members explicitly authorized to collaborate on this engagement.
              </p>
            </div>

            {canInvite && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[var(--lit-blue,#1565C0)] text-xs font-bold uppercase tracking-wider border border-blue-200 transition-all cursor-pointer shadow-2xs"
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
                className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)] font-bold flex items-center justify-center text-sm shadow-2xs">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">{member.name}</h4>
                        {member.isPrimaryLead && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Primary Lead
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)]">{member.email}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    {member.role.replace("_", " ")}
                  </span>
                </div>

                <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        member.canInviteCollaborators ? "text-[var(--lit-blue,#1565C0)]" : "text-slate-300"
                      }`}
                    />
                    <span>
                      {member.canInviteCollaborators ? "Can invite colleagues" : "Team member"}
                    </span>
                  </div>

                  <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
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
          <div className="flex items-center justify-between pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-indigo-700" /> Client Change Requests (RFCs)
              </h3>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                Scope modifications requested by client. Commercial impact is sanitized.
              </p>
            </div>
          </div>

          {changeRequests.length === 0 ? (
            <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-12 text-center text-[var(--lit-text-muted,#52677C)] space-y-2 shadow-2xs">
              <GitPullRequest className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs">No active change requests recorded for this engagement.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {changeRequests.map((rfc: any) => (
                <div
                  key={rfc.id}
                  className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 space-y-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                        RFC #{rfc.id.slice(0, 8)}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] mt-0.5">
                        {rfc.title || "Technical Scope Modification"}
                      </h4>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {rfc.status || "Under Review"}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                    {rfc.description || rfc.justification}
                  </p>

                  <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)]">
                    <span className="flex items-center gap-1.5 text-amber-800">
                      <Lock className="w-3 h-3 text-amber-700" />
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

      {/* TAB 4: PROJECT MESSAGES & COMMUNICATIONS */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" /> Client Project Communication Stream
              </h3>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                Two-way communication thread with {engagement.contact_name} ({engagement.contact_email}).
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden flex flex-col min-h-[400px]">
            {/* Messages Feed */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[500px]">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-[var(--lit-text-muted,#52677C)] space-y-2">
                  <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs">No project messages recorded yet. Start the conversation below.</p>
                </div>
              ) : (
                messages.map((msg: any) => {
                  const isTeam = msg.sender === "team";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isTeam ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 space-y-1.5 shadow-2xs ${
                          isTeam
                            ? "bg-[var(--lit-navy,#0B2545)] text-white rounded-br-xs"
                            : "bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] rounded-bl-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px]">
                          <span className={`font-bold ${isTeam ? "text-teal-300" : "text-indigo-700"}`}>
                            {msg.senderName} {msg.role ? `(${msg.role})` : ""}
                          </span>
                          <span className={isTeam ? "text-slate-300" : "text-slate-400"}>
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="text-xs whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/50 space-y-2">
              {messageError && (
                <p className="text-xs text-rose-600 font-medium">{messageError}</p>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Reply to ${engagement.contact_name} as ${workspace.fullName || "assigned staff"}...`}
                  className="flex-1 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3 text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] resize-none shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer shadow-2xs shrink-0"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Reply</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE COLLABORATOR MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Invite Colleague to Project</h3>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-[var(--lit-navy,#0B2545)] text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {inviteError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            {inviteSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Invitation Dispatched to {inviteSuccess.recipient}</span>
                  </div>
                  <p className="text-[var(--lit-text-muted,#52677C)]">
                    A secure 256-bit single-use invitation link was sent via official tracked email. Valid for 7 days.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1">
                    Direct Invitation URL (Single-Use Token)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteSuccess.url}
                      className="w-full text-xs font-mono rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-2.5 text-[var(--lit-navy,#0B2545)]"
                    />
                    <button
                      onClick={copyInviteUrl}
                      className="px-3 py-2.5 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-white font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
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
                    className="px-4 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                    Colleague Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@logicintelligencetechnologies.in"
                    className="w-full text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-2.5 text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs"
                  />
                  <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
                    Must be an active employee registered in the LIT directory.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                    Project Collaboration Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as ProjectStaffRole)}
                    className="w-full text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-2.5 text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs cursor-pointer"
                  >
                    <option value="collaborator">Collaborator (General Engineering)</option>
                    <option value="technical_specialist">Technical Specialist (Architecture / ML)</option>
                    <option value="delivery_engineer">Delivery Engineer (Implementation)</option>
                    <option value="technical_support">Technical Support (Client SLA Owner)</option>
                    <option value="project_coordinator">Project Coordinator (Milestones)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                    Invitation Note / Scope Assignment (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={inviteNotes}
                    onChange={(e) => setInviteNotes(e.target.value)}
                    placeholder="e.g., Assigned to sprint deliverables for PostgreSQL RLS architecture and Supabase triggers..."
                    className="w-full text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-2.5 text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] resize-none shadow-2xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={inviting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
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
