import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { retryAutomationEvent, retryProvisioningStep } from "../actions";
import {
  getCanonicalWorkflows,
  getWorkflowCountsBySite,
  type SiteFilter,
} from "@/lib/automations/unified-four-site";
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dead Letter Queue & Resolution | Admin | Logic Intelligence Technologies",
  description: "Inspect failed jobs, root cause classification, and bounded manual retry for dead-lettered events.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface FailedEvent {
  id: string;
  event_type: string;
  status: string;
  created_at: string;
}

export default async function DeadLetterQueuePage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("automations.read", "/admin/automations/dead-letter");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = (params?.site || "all") as SiteFilter;

  const allCanonical = getCanonicalWorkflows();
  const siteCounts = getWorkflowCountsBySite(allCanonical);

  const [eventsRes, stepsRes] = await Promise.all([
    supabaseAdmin
      .from("automation_events")
      .select("id, event_type, status, created_at")
      .in("status", ["failed", "dead_letter"])
      .order("created_at", { ascending: false })
      .limit(30),
    supabaseAdmin
      .from("provisioning_steps")
      .select("id, step, status, created_at")
      .eq("status", "failed")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const failedEvents = (eventsRes.data as FailedEvent[] | null) ?? [];
  const failedSteps = (stepsRes.data as { id: string; step: string; status: string; created_at: string }[] | null) ?? [];
  const totalFailures = failedEvents.length + failedSteps.length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-800 text-[10px] font-bold uppercase tracking-wider font-mono">
              <ShieldAlert className="w-3 h-3" />
              Dead Letter Queue
            </span>
            <span className="text-xs font-mono text-slate-500">Bounded Retries Max 3x</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Dead Letter Queue &amp; Resolution
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Quarantined automation events and failing provisioning steps awaiting triage or operator intervention.
          </p>
        </div>
      </div>

      {/* Four Site Tabs */}
      <FourSiteTabs activeSite={currentSite} baseUrl="/admin/automations/dead-letter" counts={siteCounts} />

      {/* Status Summary Banner */}
      <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">Quarantine Status</h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
            {totalFailures > 0
              ? `${totalFailures} dead-lettered items require operator evaluation.`
              : "All automation queues are nominal. Zero quarantined items."}
          </p>
        </div>
        <span
          className={`font-mono text-sm font-bold px-3 py-1 rounded-full border ${
            totalFailures > 0
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {totalFailures} in DLQ
        </span>
      </div>

      {/* Dead Letter Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--lit-navy,#0B2545)]">Quarantined Entities</span>
          <span className="font-mono text-slate-500 text-[11px]">Fail-Closed Safety Guard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Entity Type</th>
                <th className="px-5 py-3 font-semibold">Identifier / Pipeline</th>
                <th className="px-5 py-3 font-semibold">Failure State</th>
                <th className="px-5 py-3 font-semibold">Quarantined At (IST)</th>
                <th className="px-5 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {failedEvents.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-blue-700">Event</td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[var(--lit-navy,#0B2545)]">{e.event_type}</div>
                    <span className="font-mono text-[10px] text-slate-400">{e.id}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <TruthfulStatusBadge status="Error" size="sm" />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    {formatIST(e.created_at, "datetime")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <form action={retryAutomationEvent}>
                      <input type="hidden" name="eventId" value={e.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-white shadow-2xs transition-all"
                      >
                        <RefreshCw className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
                        <span>Re-queue</span>
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {failedSteps.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-purple-700">Provisioning Step</td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[var(--lit-navy,#0B2545)]">{s.step}</div>
                    <span className="font-mono text-[10px] text-slate-400">{s.id}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <TruthfulStatusBadge status="Error" size="sm" />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    {formatIST(s.created_at, "datetime")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <form action={retryProvisioningStep}>
                      <input type="hidden" name="stepId" value={s.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-white shadow-2xs transition-all"
                      >
                        <RefreshCw className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
                        <span>Retry Step</span>
                      </button>
                    </form>
                  </td>
                </tr>
              ))}

              {totalFailures === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">Dead Letter Queue Empty</p>
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                      All background tasks and automation events are completing successfully.
                    </p>
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
