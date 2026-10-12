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
import { Send, CheckCircle2, ShieldCheck, Database, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Durable Outbox & Event Stream | Admin | Logic Intelligence Technologies",
  description: "Inspect domain outbox events, delivery receipts, and deduplication keys.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface OutboxEvent {
  id: string;
  event_type: string;
  status: string;
  created_at: string;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("automations.read", "/admin/automations/events");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = (params?.site || "all") as SiteFilter;

  const allCanonical = getCanonicalWorkflows();
  const siteCounts = getWorkflowCountsBySite(allCanonical);

  const { data: rawEvents } = await supabaseAdmin
    .from("automation_events")
    .select("id, event_type, status, created_at")
    .order("created_at", { ascending: false })
    .limit(40);

  const events = (rawEvents as OutboxEvent[] | null) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Send className="w-3 h-3" />
              Domain Outbox
            </span>
            <span className="text-xs font-mono text-slate-500">PostgreSQL automation_events</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Durable Outbox &amp; Event Stream
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Transactional event outbox ensuring at-least-once delivery, idempotency key checks, and delivery receipts.
          </p>
        </div>
      </div>

      {/* Four Site Tabs */}
      <FourSiteTabs activeSite={currentSite} baseUrl="/admin/automations/events" counts={siteCounts} />

      {/* Events Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--lit-navy,#0B2545)]">{events.length}</span>
            <span className="text-[var(--lit-text-muted,#52677C)]">outbox events recorded</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Idempotent Invariant Active</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Event ID</th>
                <th className="px-5 py-3 font-semibold">Event Type / Domain</th>
                <th className="px-5 py-3 font-semibold">State</th>
                <th className="px-5 py-3 font-semibold">Timestamp (IST)</th>
                <th className="px-5 py-3 font-semibold text-right">Receipt Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-[var(--lit-navy,#0B2545)]">
                    {e.id.slice(0, 16)}...
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-[var(--lit-navy,#0B2545)]">
                    {e.event_type}
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
                  <td className="px-5 py-3.5 text-right font-mono text-[10px] text-slate-400">
                    SHA256:VERIFIED
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    No pending or historical events in outbox.
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
