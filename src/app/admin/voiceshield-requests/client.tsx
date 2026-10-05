"use client";

import { useState } from "react";
import { ShieldCheck, CheckCircle2, Clock, Mail, Building2, User, Briefcase, ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string | null;
  pipeline_stage: string | null;
  created_at: string;
}

interface Props {
  leads: Lead[];
}

function getAccessType(message: string | null): string {
  if (!message) return "Demo";
  const match = message.match(/Access type:\s*(\w+)/i);
  return match?.[1] ?? "Demo";
}

function getRole(message: string | null): string {
  if (!message) return "—";
  const match = message.match(/Role:\s*(.+)/i);
  return match?.[1]?.trim() ?? "—";
}

function getUseCase(message: string | null): string {
  if (!message) return "—";
  const match = message.match(/Use case:\s*(.+)/i);
  return match?.[1]?.trim() ?? "—";
}

export function VoiceShieldRequestsClient({ leads }: Props) {
  const [statuses, setStatuses] = useState<Record<string, "idle" | "loading" | "success" | "error">>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApprove = async (lead: Lead) => {
    setStatuses((s) => ({ ...s, [lead.id]: "loading" }));
    setErrors((e) => ({ ...e, [lead.id]: "" }));

    try {
      const res = await fetch("/api/admin/voiceshield-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          email: lead.email,
          fullName: lead.name,
          accessType: getAccessType(lead.message),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send access");
      }
      setStatuses((s) => ({ ...s, [lead.id]: "success" }));
    } catch (err) {
      setStatuses((s) => ({ ...s, [lead.id]: "error" }));
      setErrors((e) => ({ ...e, [lead.id]: err instanceof Error ? err.message : "Unknown error" }));
    }
  };

  const voiceShieldLeads = leads.filter((l) =>
    l.message?.includes("VoiceShield") || l.message?.includes("Access type:")
  );

  return (
    <div className="container mx-auto p-4 py-8 max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/command-center"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors mb-4 font-mono uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Command Center
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                VoiceShield Access Requests
              </h1>
            </div>
            <p className="text-zinc-400 text-sm ml-11">
              Review applicants and grant console access by sending the gated URL directly to their email.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <span className="text-2xl font-bold text-cyan-400">{voiceShieldLeads.length}</span>
            <span className="text-xs text-cyan-300/70 font-mono uppercase tracking-wider">pending requests</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
        <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-300/80 leading-relaxed">
          Clicking <strong>Grant Access</strong> will immediately send the VoiceShield console URL to the applicant&apos;s email address. This action is logged and the lead status will be updated to <strong>Access Granted</strong>. The console URL is private — do not share it publicly.
        </p>
      </div>

      {/* Requests Table */}
      {voiceShieldLeads.length === 0 ? (
        <div className="text-center py-24 text-zinc-600 font-mono text-sm">
          No VoiceShield access requests yet.
        </div>
      ) : (
        <div className="space-y-4">
          {voiceShieldLeads.map((lead) => {
            const status = statuses[lead.id] ?? "idle";
            const alreadyGranted = lead.pipeline_stage === "Access Granted";
            const accessType = getAccessType(lead.message);
            const role = getRole(lead.message);
            const useCase = getUseCase(lead.message);

            return (
              <div
                key={lead.id}
                className={`rounded-2xl border p-6 transition-all ${
                  alreadyGranted || status === "success"
                    ? "border-emerald-500/20 bg-emerald-950/10"
                    : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Applicant Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-base">{lead.name}</div>
                        <div className="text-sm text-zinc-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5" />
                          {lead.email}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-14">
                      <div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Company</div>
                        <div className="text-sm text-zinc-300 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                          {lead.company || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Role</div>
                        <div className="text-sm text-zinc-300 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                          {role}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Access Type</div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          accessType === "Enterprise pilot"
                            ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                            : accessType === "Beta"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                        }`}>
                          {accessType}
                        </span>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Submitted</div>
                        <div className="text-sm text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>

                    {useCase !== "—" && (
                      <div className="ml-14">
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Use Case</div>
                        <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">{useCase}</p>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-14 lg:ml-0">
                    {alreadyGranted || status === "success" ? (
                      <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Access Granted
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(lead)}
                          disabled={status === "loading"}
                          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:text-white text-sm font-bold transition-all disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.05)]"
                        >
                          {status === "loading" ? (
                            <>
                              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-4 h-4" />
                              Grant Access & Email URL
                            </>
                          )}
                        </button>
                        {status === "error" && (
                          <p className="text-xs text-red-400 text-right max-w-[220px]">
                            {errors[lead.id] || "Failed. Please try again."}
                          </p>
                        )}
                      </>
                    )}
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                    >
                      View Full Dossier →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
