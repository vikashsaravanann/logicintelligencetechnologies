import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import {
  getCanonicalWorkflows,
  getWorkflowCountsBySite,
  type SiteFilter,
} from "@/lib/automations/unified-four-site";
import {
  Activity,
  ShieldCheck,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sanitized Execution History | Admin | Logic Intelligence Technologies",
  description: "Search execution logs, inspect duration, and audit sanitized execution projections.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface ExecutionRow {
  id: string;
  event_type: string;
  status: string;
  created_at: string;
  site?: string;
}

export default async function ExecutionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string; status?: string }>;
}) {
  await requireCapabilityPage("automations.read", "/admin/automations/executions");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = (params?.site || "all") as SiteFilter;
  const currentStatus = params?.status || "all";

  const allCanonical = getCanonicalWorkflows();
  const siteCounts = getWorkflowCountsBySite(allCanonical);

  let query = supabaseAdmin
    .from("automation_events")
    .select("id, event_type, status, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (currentStatus !== "all") {
    query = query.eq("status", currentStatus);
  }

  const { data: rawEvents } = await query;
  const events = (rawEvents as ExecutionRow[] | null) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Activity className="w-3 h-3" />
              Execution Telemetry
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3" /> Zero-Payload Privacy Guard
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Sanitized Execution History
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Real-time audit log of pipeline executions and automation events with automatic credential and PHI/PII redaction.
          </p>
        </div>
      </div>

      {/* Four Site Tabs */}
      <FourSiteTabs activeSite={currentSite} baseUrl="/admin/automations/executions" counts={siteCounts} />

      {/* Status Filter */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="font-mono text-slate-500">Status:</span>
        {["all", "completed", "pending", "failed", "dead_letter"].map((s) => {
          const active = currentStatus === s;
          const targetParams = new URLSearchParams();
          if (currentSite !== "all") targetParams.set("site", currentSite);
          if (s !== "all") targetParams.set("status", s);
          const queryStr = targetParams.toString();
          return (
            <a
              key={s}
              href={`/admin/automations/executions${queryStr ? `?${queryStr}` : ""}`}
              className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition-colors ${
                active
                  ? "bg-[var(--lit-navy,#0B2545)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s.toUpperCase()}
            </a>
          );
        })}
      </div>

      {/* Executions Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--lit-navy,#0B2545)]">{events.length}</span>
            <span className="text-[var(--lit-text-muted,#52677C)]">dispatched events in current projection</span>
          </div>
          <span className="font-mono text-slate-500 text-[11px]">Source: PostgreSQL automation_events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Execution ID</th>
                <th className="px-5 py-3 font-semibold">Event / Pipeline</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Dispatched At (IST)</th>
                <th className="px-5 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-[var(--lit-navy,#0B2545)]">
                    <a
                      href={`/admin/automations/executions/${e.id}`}
                      className="text-[var(--lit-blue,#1565C0)] hover:underline inline-flex items-center gap-1"
                    >
                      {e.id.slice(0, 12)}...
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-[var(--lit-navy,#0B2545)]">{e.event_type}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <TruthfulStatusBadge
                      status={
                        e.status === "completed"
                          ? "Completed"
                          : e.status === "failed" || e.status === "dead_letter"
                          ? "Error"
                          : "Active"
                      }
                      size="sm"
                    />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    {formatIST(e.created_at, "datetime")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <a
                      href={`/admin/automations/executions/${e.id}`}
                      className="font-semibold text-[var(--lit-blue,#1565C0)] hover:underline"
                    >
                      Inspect Timeline →
                    </a>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <p className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">No matching executions</p>
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)]">No events match the selected criteria.</p>
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
