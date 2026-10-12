import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { getAutomationsSnapshot } from "@/lib/automations/n8n-client";
import {
  getCanonicalWorkflows,
  getWorkflowCountsBySite,
  type SiteFilter,
} from "@/lib/automations/unified-four-site";
import { Layers, Server, AlertCircle, CheckCircle2, ChevronRight, RefreshCw, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "n8n Workflows Registry | Admin | Logic Intelligence Technologies",
  description: "Synchronized n8n workflow instances and execution blueprints across all environments.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function WorkflowsPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("automations.read", "/admin/automations/workflows");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = (params?.site || "all") as SiteFilter;

  const snap = await getAutomationsSnapshot();
  const allCanonical = getCanonicalWorkflows();
  const siteCounts = getWorkflowCountsBySite(allCanonical);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Layers className="w-3 h-3" />
              Runtime Blueprints
            </span>
            <TruthfulStatusBadge status={snap.state === "CONNECTED" ? "Connected" : snap.state === "ERROR" ? "Error" : "Unconfigured"} size="sm" />
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            n8n Workflows Registry
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Live instances and operational state of workflows deployed on the central n8n orchestration runtime.
          </p>
        </div>
      </div>

      {/* Four Site Tabs */}
      <FourSiteTabs activeSite={currentSite} baseUrl="/admin/automations/workflows" counts={siteCounts} />

      {/* Runtime Health Diagnostic */}
      <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[var(--lit-navy,#0B2545)]">
            <Server className="w-5 h-5 text-[var(--lit-blue,#1565C0)]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">Orchestrator Instance</h3>
              <span className="text-xs font-mono text-slate-500">({snap.state})</span>
            </div>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">{snap.detail}</p>
          </div>
        </div>
        <div className="text-right font-mono text-xs text-slate-500">
          <div>Registered Blueprints: <strong className="text-[var(--lit-navy,#0B2545)]">{snap.workflows.length}</strong></div>
          <div>Canonical Definitions: <strong className="text-[var(--lit-navy,#0B2545)]">{allCanonical.length}</strong></div>
        </div>
      </div>

      {/* Live Workflows Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
          <h2 className="font-bold text-[var(--lit-navy,#0B2545)]">Deployed Workflow Instances</h2>
          <span className="font-mono text-slate-500">Synchronized via n8n REST API</span>
        </div>

        {snap.workflows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Workflow ID</th>
                  <th className="px-5 py-3 font-semibold">Workflow Name</th>
                  <th className="px-5 py-3 font-semibold">State</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {snap.workflows.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-[var(--lit-navy,#0B2545)]">
                      {w.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[var(--lit-navy,#0B2545)]">{w.name}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <TruthfulStatusBadge status={w.active ? "Active" : "Paused"} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <a
                        href={`/admin/automations/workflows/${w.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-[var(--lit-blue,#1565C0)] hover:underline"
                      >
                        <span>Inspect Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center space-y-2">
            <Server className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-[var(--lit-navy,#0B2545)]">No Live Workflows Synchronized</p>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-md mx-auto">
              {snap.state === "NOT CONFIGURED"
                ? "Configure n8n connection parameters to inspect live runtime instances."
                : "The connected orchestrator has no active workflow blueprints registered."}
            </p>
            <div className="pt-2">
              <a
                href="/admin/automations/catalog"
                className="text-xs font-semibold text-[var(--lit-blue,#1565C0)] hover:underline"
              >
                View Canonical Workflow Definitions (178 items) →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
