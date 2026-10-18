import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import Link from "next/link";
import {
  Users,
  Building,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Bot,
  Calendar,
  Layers,
} from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../components/AdminBackLink";
import { formatIST } from "@/lib/format/datetime";
import { leadScoreLabel } from "@/lib/admin/kpis";

export const metadata: Metadata = {
  title: "Website Enquiries | Logic Intelligence Technologies",
  description: "Centralized enterprise registry of inbound website contact inquiries, discovery requests, and intent scores.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default async function AdminLeadsPage() {
  await requireCapabilityPage("leads.read", "/admin/leads");

  const { data: leads, error } = await supabaseAdmin
    .from("contact_leads")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = leads || [];
  const highIntentCount = rows.filter((l) => (l.lead_score ?? 0) >= 70).length;
  const activePipelineCount = rows.filter(
    (l) => !["Closed Won", "Closed Lost", "Disqualified"].includes(l.pipeline_stage || ""),
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header & Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Users className="w-3 h-3" />
              Website Enquiries Registry
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Website Enquiries
          </h1>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)]">
            Centralized registry of website inquiries, enterprise demo requests, and calculated intent scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/ai-leads"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-slate-300 transition-all shadow-2xs"
          >
            <Bot className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <span>AI Intent Leads</span>
          </Link>
        </div>
      </div>

      {error ? (
        <div
          className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-2xs"
          role="alert"
        >
          Failed to load leads from the database.
        </div>
      ) : null}

      {/* Summary Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Total Inbound Leads
            </span>
            <div className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono tracking-tight">
            {rows.length}
          </div>
          <p className="text-[11px] font-medium text-[var(--lit-text-muted,#52677C)] mt-1">
            Authoritative registry rows
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              High Intent (&ge;70)
            </span>
            <div className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono tracking-tight">
            {highIntentCount}
          </div>
          <p className="text-[11px] font-medium text-[var(--lit-text-muted,#52677C)] mt-1">
            Prime qualification tier
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Active Pipeline
            </span>
            <div className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono tracking-tight">
            {activePipelineCount}
          </div>
          <p className="text-[11px] font-medium text-[var(--lit-text-muted,#52677C)] mt-1">
            In negotiation or review
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Latest Capture
            </span>
            <div className="p-1.5 rounded-lg border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xs font-black text-[var(--lit-navy,#0B2545)] font-mono tracking-tight pt-2 truncate">
            {rows.length > 0 ? formatIST(rows[0].created_at) : "—"}
          </div>
          <p className="text-[11px] font-medium text-[var(--lit-text-muted,#52677C)] mt-1">
            Indian Standard Time
          </p>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Registered Inbound Leads</span>
          </h2>
          <span className="text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)] bg-[var(--lit-cloud,#F7F9FC)] px-2.5 py-0.5 rounded-full border border-[var(--lit-border-light,#DFE7EF)]">
            {rows.length} Contacts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-[11px] uppercase tracking-wider font-bold text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-5 py-3.5">Lead Name / Contact</th>
                <th className="px-5 py-3.5">Company</th>
                <th className="px-5 py-3.5">Intent Score</th>
                <th className="px-5 py-3.5">Pipeline Stage</th>
                <th className="px-5 py-3.5">Captured (IST)</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]/70">
              {rows.length > 0 ? (
                rows.map((l) => {
                  const score = l.lead_score;
                  const hasScore = score !== null && score !== undefined;

                  return (
                    <tr
                      key={l.id}
                      className="hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/leads/${l.id}`}
                          className="font-bold text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-teal,#1FA9A2)] text-sm block transition-colors"
                        >
                          {l.name}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                          <Mail className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
                          <span>{l.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--lit-ink,#121826)] font-medium">
                          <Building className="w-3.5 h-3.5 text-[var(--lit-text-muted,#52677C)]" />
                          <span>{l.company || "Not Specified"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {hasScore ? (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                              score >= 70
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : score >= 40
                                ? "bg-blue-50 text-blue-800 border border-blue-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {score} / 100
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            Unscored
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)]">
                          {l.pipeline_stage || "New Lead"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-[var(--lit-text-muted,#52677C)] whitespace-nowrap">
                        {formatIST(l.created_at)}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/leads/${l.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] hover:border-[var(--lit-teal,#1FA9A2)] text-xs font-semibold text-[var(--lit-navy,#0B2545)] shadow-2xs transition-all"
                        >
                          <span>Dossier</span>
                          <ArrowRight className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 rounded-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-text-muted,#52677C)]">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                        No leads recorded in database yet
                      </p>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-sm">
                        Inbound inquiries submitted through contact forms and demo portals will populate here automatically.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
