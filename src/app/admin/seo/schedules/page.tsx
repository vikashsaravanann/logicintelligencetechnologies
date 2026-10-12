import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { RiskTierBadge } from "../../components/RiskTierBadge";
import {
  previewCycle,
  getCycleHistory,
  calculate72hSlot,
  formatKolkataTime,
  ANCHOR_EPOCH_MS,
  CYCLE_INTERVAL_HOURS,
} from "@/lib/seo/scheduler";
import { resolveGscCredentials, getRemainingDailyQuota } from "@/lib/seo/gsc-client";
import { RunAuditButton } from "./RunAuditButton";
import {
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ExternalLink,
  Search,
  Eye,
  Globe,
  Sliders,
  History,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "72-Hour Crawl Schedules & Deterministic Anchor | Admin | LIT",
  description:
    "Deterministic 72-hour crawl window coordination, Search Console quota bounds, and cycle execution history.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SeoSchedulesPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("seo.read", "/admin/seo/schedules");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = params?.site || "all";

  const slot = calculate72hSlot();
  const preview = await previewCycle(currentSite === "all" ? undefined : currentSite);
  const history = await getCycleHistory(currentSite === "all" ? undefined : currentSite, 15);
  const remainingQuota = getRemainingDailyQuota();
  const creds = resolveGscCredentials();

  const anchorDateStr = new Date(ANCHOR_EPOCH_MS).toISOString();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/seo" label="SEO Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Calendar className="w-3 h-3" />
              Scheduler Engine
            </span>
            <RiskTierBadge tier="R0" />
            <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
              {CYCLE_INTERVAL_HOURS}h Cadence
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            72-Hour Crawl Schedules & Sync Coordination
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Deterministic 72-hour interval coordination anchored to Jan 1, 2026 UTC, ensuring Search Console quota preservation and zero Google Indexing API abuse.
          </p>
        </div>
      </div>

      {/* Subnav Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold">
        <Link
          href="/admin/seo"
          className="px-3 py-1.5 rounded-lg text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100 transition-colors"
        >
          Overview
        </Link>
        <Link
          href="/admin/seo/sites"
          className="px-3 py-1.5 rounded-lg text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100 transition-colors"
        >
          Properties & Hostnames
        </Link>
        <Link
          href="/admin/seo/url-inspection"
          className="px-3 py-1.5 rounded-lg text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100 transition-colors"
        >
          URL Inspection
        </Link>
        <Link
          href="/admin/seo/sitemaps"
          className="px-3 py-1.5 rounded-lg text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100 transition-colors"
        >
          Sitemaps & Validation
        </Link>
        <Link
          href="/admin/seo/schedules"
          className="px-3 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
        >
          72h Schedules
        </Link>
      </div>

      {/* 4-Site Scope Filter */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider">
          Filter By Deployment Scope:
        </div>
        <FourSiteTabs currentSite={currentSite} baseUrl="/admin/seo/schedules" />
      </div>

      {/* Section 1: Deterministic Anchor & Slot Window Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Anchor Card */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Anchor Epoch (UTC)
            </span>
            <Clock className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
          </div>
          <div className="font-mono text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
            2026-01-01 00:00:00Z
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Deterministic base for all 72h cycles. Zero drift across server restarts.
          </p>
        </div>

        {/* Current Slot Card */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Active Cycle Slot
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[var(--lit-navy,#0B2545)]">
              #{slot.slotIndex}
            </span>
          </div>
          <div className="text-xs font-medium text-[var(--lit-navy,#0B2545)] space-y-0.5">
            <div>
              <span className="text-[var(--lit-text-muted,#52677C)] font-mono text-[10px]">IST:</span>{" "}
              {slot.slotStartKolkata}
            </div>
            <div>
              <span className="text-[var(--lit-text-muted,#52677C)] font-mono text-[10px]">TO:</span>{" "}
              {slot.slotEndKolkata}
            </div>
          </div>
          <div className="text-[10px] text-[var(--lit-text-muted,#52677C)] font-mono">
            Next cycle in {slot.hoursUntilNextSlot}h
          </div>
        </div>

        {/* Quota Consumption */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Est. Inspection Quota
            </span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--lit-navy,#0B2545)]">
            {preview.totalEstimatedInspections} / {remainingQuota}
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Estimated URLs sampled this cycle vs remaining daily quota.
          </p>
        </div>

        {/* Credential & API Status */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              GSC API Telemetry
            </span>
            <TruthfulStatusBadge status={creds.configured ? "CONFIGURED" : "UNCONFIGURED"} />
          </div>
          <div className="text-xs font-mono truncate text-[var(--lit-navy,#0B2545)]">
            {creds.clientEmail || "Not authenticated"}
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Service Account ADC key binding.
          </p>
        </div>
      </div>

      {/* Manual Run Action */}
      <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              Manual Cycle Execution Console
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Execute an on-demand sitemap validation and GSC inspection sample for {currentSite === "all" ? "all 4 production sites" : currentSite}.
            </p>
          </div>
          <RiskTierBadge tier="R0" />
        </div>
        <RunAuditButton currentSite={currentSite} />
      </div>

      {/* Section 2: Four-Site Execution Schedule Matrix */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
              Four-Site Synchronization Matrix
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
              Deterministic schedules, last crawl timestamps in Asia/Kolkata, and bounded quota allocations.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)]">
            {preview.sites.length} Site(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)] font-mono">
              <tr>
                <th className="py-3 px-6">Property / Domain</th>
                <th className="py-3 px-6">Last Crawled (IST)</th>
                <th className="py-3 px-6">Next Crawl (IST)</th>
                <th className="py-3 px-6">Cycle Due</th>
                <th className="py-3 px-6">Est. Inspection Sample</th>
                <th className="py-3 px-6">Action / Diagnostics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {preview.sites.map((site) => (
                <tr key={site.siteCode} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-[var(--lit-navy,#0B2545)] font-mono text-xs">
                      {site.siteCode}
                    </div>
                    <div className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5 truncate max-w-xs">
                      {site.domain}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                    {site.lastCrawlKolkata}
                    {site.lastCrawlUtc && (
                      <div className="text-[10px] text-[var(--lit-text-muted,#52677C)]">
                        {site.lastCrawlUtc.slice(0, 19)}Z
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                    {site.nextCrawlKolkata}
                    <div className="text-[10px] text-[var(--lit-text-muted,#52677C)]">
                      {site.nextCrawlUtc.slice(0, 19)}Z
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {site.isDue ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        DUE NOW
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ON CADENCE
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                    <span className="font-semibold">{site.estimatedQuotaConsumption} URLs</span>
                    <div className="text-[10px] text-[var(--lit-text-muted,#52677C)]">
                      Priority canonical set
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Link
                      href={`/admin/seo/sites/${site.dbSiteId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--lit-teal,#1FA9A2)] hover:underline"
                    >
                      Diagnostics <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Hard Rules & Compliance Safeguards (QA-50 / Section 10.3) */}
      <div className="p-6 rounded-2xl border border-teal-200 bg-teal-50/50 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
          <h3 className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">
            Architectural Safeguards & Section 10.3 Compliance Rules
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {preview.hardRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white border border-teal-100 flex items-start gap-2.5 shadow-2xs"
            >
              <div className="w-5 h-5 rounded-full bg-teal-100 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                {idx + 1}
              </div>
              <p className="text-xs text-[var(--lit-navy,#0B2545)] leading-relaxed">
                {rule}
              </p>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-teal-100 text-xs text-[var(--lit-text-muted,#52677C)] flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-[var(--lit-teal,#1FA9A2)]" />
          <span>
            <strong>QA-50 Mandate:</strong> Automatic invocation of Google Indexing API on non-JobPosting/BroadcastEvent pages violates Google Webmaster Guidelines and is strictly blocked at the client adapter level.
          </span>
        </div>
      </div>

      {/* Section 4: Cycle Run History */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--lit-navy,#0B2545)]" />
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
              Historical Cycle Execution Log
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
            {history.length} Most Recent Runs
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--lit-text-muted,#52677C)] space-y-2">
            <Clock className="w-6 h-6 mx-auto text-slate-300" />
            <p className="font-semibold text-[var(--lit-navy,#0B2545)]">
              No cycle runs recorded in this window
            </p>
            <p>
              Cycles run automatically every 72 hours via cron or can be triggered manually above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)] font-mono">
                <tr>
                  <th className="py-3 px-6">Cycle ID</th>
                  <th className="py-3 px-6">Executed At (IST)</th>
                  <th className="py-3 px-6">Trigger Type</th>
                  <th className="py-3 px-6">Inspected / Anomalies</th>
                  <th className="py-3 px-6">Overall Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {history.map((run: any) => (
                  <tr key={run.cycleId || run.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                      {run.cycleId || run.id}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                      {run.executedAtKolkata || run.createdAtKolkata || formatKolkataTime(run.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {run.triggerType || run.trigger_type || "SCHEDULED"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                      <span>{run.totalInspected ?? run.urls_inspected ?? 0} inspected</span>
                      <span className="text-[var(--lit-text-muted,#52677C)]"> / </span>
                      <span
                        className={
                          (run.totalAnomalies ?? run.anomalies_detected ?? 0) > 0
                            ? "text-amber-600 font-bold"
                            : "text-emerald-600"
                        }
                      >
                        {run.totalAnomalies ?? run.anomalies_detected ?? 0} anomalies
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <TruthfulStatusBadge
                        status={
                          run.overallStatus === "COMPLETED" || run.status === "COMPLETED"
                            ? "HEALTHY"
                            : run.overallStatus === "PARTIAL" || run.status === "PARTIAL"
                            ? "WARNING"
                            : run.overallStatus === "FAILED" || run.status === "FAILED"
                            ? "CRITICAL"
                            : "UNKNOWN"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
