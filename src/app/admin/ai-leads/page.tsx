import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../components/AdminBackLink";
import { formatIST } from "@/lib/format/datetime";
import { InspectAiLeadButton } from "./components/InspectAiLeadButton";
import { AiLeadActions } from "./ai-lead-actions";
import {
  Sparkles,
  Bot,
  Mail,
  Phone,
  Building,
  MessageSquare,
  Radio,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Assistant Enquiries | Logic Intelligence Technologies",
  description: "Real-time inbound lead captures from AI conversational assistants and discovery widgets.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default async function AdminAiLeadsPage() {
  await requireCapabilityPage("leads.read", "/admin/ai-leads");

  const { data: leads, error } = await supabaseAdmin
    .from("ai_captured_leads")
    .select("id, name, email, phone, company, interest, source, chat_id, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = leads || [];
  const uniqueSources = Array.from(new Set(rows.map((r) => r.source).filter(Boolean)));
  const latestCaptured = rows.length > 0 ? rows[0].created_at : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-3 h-3" />
              Automated Conversational Ingestion
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            AI Assistant Enquiries
          </h1>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)]">
            Inbound opportunities captured directly from conversational AI assistants (/ai) and site-wide interactive inquiry widgets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-mono font-medium text-[var(--lit-navy,#0B2545)] shadow-2xs">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Telemetry Active</span>
          </div>
        </div>
      </div>

      {error ? (
        <div
          className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-2xs"
          role="alert"
        >
          Failed to query AI captured leads from database.
        </div>
      ) : null}

      {/* KPI Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Total Captured Leads
            </span>
            <div className="p-1.5 rounded-lg border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)]">
              <Bot className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono tracking-tight">
            {rows.length}
          </div>
          <p className="text-[11px] font-medium text-[var(--lit-text-muted,#52677C)] mt-1">
            Displaying latest 100 captures
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Capture Channels
            </span>
            <div className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono tracking-tight">
            {uniqueSources.length || 0}
          </div>
          <p className="text-[11px] font-medium text-[var(--lit-text-muted,#52677C)] mt-1 truncate">
            {uniqueSources.join(", ") || "No sources recorded"}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Most Recent Capture
            </span>
            <div className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-black text-[var(--lit-navy,#0B2545)] font-mono tracking-tight pt-2">
            {latestCaptured ? formatIST(latestCaptured) : "—"}
          </div>
          <p className="text-[11px] font-medium text-[var(--lit-text-muted,#52677C)] mt-1">
            Server timestamp in IST
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
            <Bot className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Captured Conversational Inquiries</span>
          </h2>
          <span className="text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)] bg-[var(--lit-cloud,#F7F9FC)] px-2.5 py-0.5 rounded-full border border-[var(--lit-border-light,#DFE7EF)]">
            {rows.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--lit-cloud,#F7F9FC)] border-b border-[var(--lit-border-light,#DFE7EF)] text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Captured (IST)</th>
                <th className="px-4 py-3 font-semibold">Name & Org</th>
                <th className="px-4 py-3 font-semibold">Contact Coordinates</th>
                <th className="px-4 py-3 font-semibold">Expressed Interest</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Chat Session</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]/70">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[var(--lit-cloud,#F7F9FC)] transition-colors group"
                >
                  <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-[var(--lit-text-muted,#52677C)]">
                    {formatIST(row.created_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-[var(--lit-navy,#0B2545)] text-sm">
                      {row.name}
                    </div>
                    {row.company ? (
                      <div className="flex items-center gap-1 text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
                        <Building className="w-3 h-3 shrink-0" />
                        <span>{row.company}</span>
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="space-y-1">
                      <a
                        href={`mailto:${row.email}`}
                        className="inline-flex items-center gap-1.5 text-[var(--lit-teal,#1FA9A2)] font-semibold hover:underline"
                      >
                        <Mail className="w-3 h-3 shrink-0" />
                        <span>{row.email}</span>
                      </a>
                      {row.phone ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--lit-text-muted,#52677C)] font-mono">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{row.phone}</span>
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    {row.interest ? (
                      <p className="text-[var(--lit-ink,#121826)] line-clamp-2">
                        {row.interest}
                      </p>
                    ) : (
                      <span className="text-[var(--lit-text-muted,#52677C)] font-mono">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)]">
                      {row.source}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px]">
                    {row.chat_id ? (
                      <span className="inline-flex items-center gap-1 text-[var(--lit-teal,#1FA9A2)] font-semibold bg-[var(--lit-teal,#1FA9A2)]/10 px-2 py-0.5 rounded-md border border-[var(--lit-teal,#1FA9A2)]/20">
                        <span>{String(row.chat_id).slice(0, 8)}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-60" />
                      </span>
                    ) : (
                      <span className="text-[var(--lit-text-muted,#52677C)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <InspectAiLeadButton lead={row} />
                      {row.email ? (
                        <AiLeadActions email={row.email} name={row.name || "Lead"} />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 rounded-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-text-muted,#52677C)]">
                        <Bot className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                        No AI leads recorded yet
                      </p>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-sm">
                        Visitors interacting with the /ai conversational assistant or embedded chat triggers will appear here in real-time.
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
