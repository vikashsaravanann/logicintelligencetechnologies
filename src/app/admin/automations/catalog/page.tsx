import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { RiskTierBadge } from "../../components/RiskTierBadge";
import {
  getCanonicalWorkflows,
  getWorkflowCountsBySite,
  getWorkflowCountsByStatus,
  type SiteFilter,
} from "@/lib/automations/unified-four-site";
import {
  Layers,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  Database,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Canonical Automation Catalog | Admin | Logic Intelligence Technologies",
  description: "Search and inspect all 178 canonical automation definitions across all four digital properties.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AutomationCatalogPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string; risk?: string; q?: string }>;
}) {
  await requireCapabilityPage("automations.read", "/admin/automations/catalog");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = (params?.site || "all") as SiteFilter;
  const currentRisk = params?.risk || "all";
  const searchQuery = (params?.q || "").toLowerCase().trim();

  const allWorkflows = getCanonicalWorkflows();
  const siteCounts = getWorkflowCountsBySite(allWorkflows);
  const statusCounts = getWorkflowCountsByStatus(allWorkflows);

  const filtered = allWorkflows.filter((w) => {
    if (currentSite !== "all" && w.siteKey !== currentSite) return false;
    if (currentRisk !== "all" && w.riskClass !== currentRisk) return false;
    if (searchQuery) {
      const matchId = w.workflowId.toLowerCase().includes(searchQuery);
      const matchName = w.name.toLowerCase().includes(searchQuery);
      const matchCat = w.category.toLowerCase().includes(searchQuery);
      const matchTrigger = w.triggerType.toLowerCase().includes(searchQuery);
      return matchId || matchName || matchCat || matchTrigger;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Layers className="w-3 h-3" />
              Canonical Registry
            </span>
            <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
              docs/automation-program/CANONICAL_WORKFLOW_REGISTRY.csv
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Canonical Automation Catalog
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Complete registry of all 178 canonical workflow definitions across Corporate LIT, Healthcare, Logic Voice, and VoiceShield.
          </p>
        </div>
      </div>

      {/* Four Site Tabs */}
      <FourSiteTabs activeSite={currentSite} baseUrl="/admin/automations/catalog" counts={siteCounts} />

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form method="GET" action="/admin/automations/catalog" className="flex-1 flex items-center gap-2">
          {currentSite !== "all" && <input type="hidden" name="site" value={currentSite} />}
          {currentRisk !== "all" && <input type="hidden" name="risk" value={currentRisk} />}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="q"
              defaultValue={params?.q || ""}
              placeholder="Search by ID, name, category, or trigger type..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-[var(--lit-navy,#0B2545)] text-white hover:bg-[var(--lit-blue,#1565C0)] transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-500">Risk Class:</span>
          {["all", "R0", "R1", "R2", "R3", "R4"].map((r) => {
            const active = currentRisk === r;
            const targetParams = new URLSearchParams();
            if (currentSite !== "all") targetParams.set("site", currentSite);
            if (r !== "all") targetParams.set("risk", r);
            if (searchQuery) targetParams.set("q", searchQuery);
            const queryStr = targetParams.toString();
            const href = `/admin/automations/catalog${queryStr ? `?${queryStr}` : ""}`;

            return (
              <a
                key={r}
                href={href}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
                  active
                    ? "bg-[var(--lit-navy,#0B2545)] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r.toUpperCase()}
              </a>
            );
          })}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[var(--lit-navy,#0B2545)]">{filtered.length}</span>
            <span className="text-[var(--lit-text-muted,#52677C)]">workflows matching filters</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <span>Total: {allWorkflows.length}</span>
            <span>•</span>
            <span>Active: {statusCounts.Active}</span>
            <span>•</span>
            <span>Staged: {statusCounts.Staged}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Workflow ID</th>
                <th className="px-5 py-3 font-semibold">Name &amp; Category</th>
                <th className="px-5 py-3 font-semibold">Site / Entity</th>
                <th className="px-5 py-3 font-semibold">Trigger</th>
                <th className="px-5 py-3 font-semibold">Risk Class</th>
                <th className="px-5 py-3 font-semibold">Data Class</th>
                <th className="px-5 py-3 font-semibold">Governance</th>
                <th className="px-5 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {filtered.map((w) => (
                <tr key={w.workflowId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-[var(--lit-navy,#0B2545)]">
                    <a
                      href={`/admin/automations/workflows/${w.workflowId}`}
                      className="text-[var(--lit-blue,#1565C0)] hover:underline inline-flex items-center gap-1"
                    >
                      {w.workflowId}
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[var(--lit-navy,#0B2545)]">{w.name}</div>
                    <span className="text-[10px] font-mono text-slate-400">{w.category}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    {w.siteName}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {w.triggerType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <RiskTierBadge riskClass={w.riskClass} />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                    {w.dataClassification}
                  </td>
                  <td className="px-5 py-3.5">
                    {w.requiresApproval ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Dual Signoff
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Standard</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <TruthfulStatusBadge status={w.status} size="sm" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                    No workflows found matching current filter criteria.
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
