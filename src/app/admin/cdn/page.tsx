import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../components/AdminBackLink";
import { FourSiteTabs } from "../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../components/TruthfulStatusBadge";
import { RiskTierBadge } from "../components/RiskTierBadge";
import {
  CANONICAL_CDN_SITES,
  probeAllSites,
  getRecentObservations,
  resolveCdnSiteId,
  type CdnSiteId,
  type EdgeObservation,
} from "@/lib/cdn/edge-client";
import {
  Server,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ExternalLink,
  ChevronRight,
  Flame,
  Zap,
  HardDrive,
  RefreshCw,
  Sliders,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Edge CDN & Cache Observability | Admin | LIT",
  description:
    "Four-site edge CDN telemetry, Vercel edge cache status inspection, freshness audit, and selective invalidation controls.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CdnOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("cdn.read", "/admin/cdn");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = params?.site || "all";

  // Run live probes
  const liveProbes = await probeAllSites();

  // Get recent history
  const recentObservations = await getRecentObservations(
    currentSite === "all" ? undefined : currentSite,
    30
  );

  const freshCount = liveProbes.filter((p) => p.isFresh).length;
  const staleOrErrorCount = liveProbes.filter((p) => !p.isFresh).length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Server className="w-3 h-3" />
              Edge Observability
            </span>
            <RiskTierBadge tier="R0" />
            <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
              4 Origin Endpoints
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Edge CDN Observability & Cache Operations
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Real-time inspection of Vercel Edge caching headers, SWR compliance, origin staleness detection, and selective invalidation gates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/cdn/cache-jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold shadow-xs hover:bg-[var(--lit-navy-dark,#071A31)] transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Invalidation Console
          </Link>
        </div>
      </div>

      {/* Subnav Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold">
        <Link
          href="/admin/cdn"
          className="px-3 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
        >
          CDN Overview & Probes
        </Link>
        <Link
          href="/admin/cdn/cache-jobs"
          className="px-3 py-1.5 rounded-lg text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100 transition-colors"
        >
          Cache Invalidation Console (R2/R3)
        </Link>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Edge Deployments */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Edge Deployments
            </span>
            <Layers className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-[var(--lit-navy,#0B2545)]">
            4 / 4
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Active canonical production origin domains.
          </p>
        </div>

        {/* Primary CDN Provider */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Edge Provider
            </span>
            <Server className="w-4 h-4 text-[var(--lit-navy,#0B2545)]" />
          </div>
          <div className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
            Vercel Edge Network
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Global Anycast with SWR revalidation.
          </p>
        </div>

        {/* Caching Policy */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Active Cache Policy
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xs font-mono font-semibold text-[var(--lit-navy,#0B2545)] truncate">
            s-maxage=3600, SWR
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            1-hour edge caching with 24-hour background revalidation.
          </p>
        </div>

        {/* Freshness Health */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Freshness Status
            </span>
            <TruthfulStatusBadge status={staleOrErrorCount === 0 ? "HEALTHY" : "WARNING"} />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--lit-navy,#0B2545)]">
            {freshCount} Fresh / {staleOrErrorCount} Incident
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Live edge response verification.
          </p>
        </div>
      </div>

      {/* 4-Site Scope Filter */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider">
          Filter Telemetry Scope:
        </div>
        <FourSiteTabs currentSite={currentSite} baseUrl="/admin/cdn" />
      </div>

      {/* Section 1: Live Edge Header Telemetry */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-[var(--lit-border-light,#DFE7EF)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              Live Edge Response Telemetry (Root Route Probes)
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Live HEAD probes querying origin headers: x-vercel-cache, age, cache-control, and etag.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
            Auto-refreshed on page load
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)] font-mono">
              <tr>
                <th className="py-3 px-6">Site / Domain</th>
                <th className="py-3 px-6">HTTP Status</th>
                <th className="py-3 px-6">Edge Cache Status</th>
                <th className="py-3 px-6">Age (s)</th>
                <th className="py-3 px-6">Cache-Control</th>
                <th className="py-3 px-6">Freshness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {liveProbes.map((probe) => {
                const siteCfg = CANONICAL_CDN_SITES[probe.siteId];
                return (
                  <tr key={probe.siteId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[var(--lit-navy,#0B2545)] text-xs">
                        {siteCfg?.name || probe.siteId}
                      </div>
                      <a
                        href={probe.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--lit-teal,#1FA9A2)] hover:underline mt-0.5 truncate max-w-xs"
                      >
                        {probe.url} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      {probe.edgeStatus > 0 ? (
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold ${
                            probe.edgeStatus < 400
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {probe.edgeStatus}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          UNREACHABLE
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                      {probe.xVercelCache ? (
                        <span className="px-2 py-0.5 rounded-md font-bold bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200">
                          {probe.xVercelCache}
                        </span>
                      ) : probe.cfCacheStatus ? (
                        <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          CF: {probe.cfCacheStatus}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">MISS / NONE</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                      {probe.ageSeconds !== null ? `${probe.ageSeconds}s` : "0s"}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-[var(--lit-text-muted,#52677C)] max-w-xs truncate">
                      {probe.cacheControl || "no-cache"}
                    </td>
                    <td className="py-4 px-6">
                      <TruthfulStatusBadge status={probe.isFresh ? "HEALTHY" : "CRITICAL"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Section 11 Architecture & Policy Banner */}
      <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
            <h3 className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">
              Edge CDN Policy: Section 11 Architecture Standard
            </h3>
          </div>
          <RiskTierBadge tier="R2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Blanket Purges Forbidden
            </div>
            <p className="text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              Global purge requests (<code>/*</code> or <code>*</code>) are blocked. Blanket invalidation floods origin servers and provides zero SEO indexing advantage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
              Targeted Path Invalidation
            </div>
            <p className="text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              Purges must specify exact changed URL paths (e.g. <code>/services</code>, <code>/sitemap.xml</code>) with mandatory operational justification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              SWR Background Revalidation
            </div>
            <p className="text-[var(--lit-text-muted,#52677C)] leading-relaxed">
              Origin changes are naturally propagated via <code>stale-while-revalidate</code> headers without requiring manual intervention during ordinary deployments.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Recent Edge Observations Log */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
              Historical Edge Telemetry Log
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
              Historical probes stored in <code>edge_cache_observations</code> with IST timestamps.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
            {recentObservations.length} Observations
          </span>
        </div>

        {recentObservations.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--lit-text-muted,#52677C)] space-y-2">
            <Clock className="w-6 h-6 mx-auto text-slate-300" />
            <p className="font-semibold text-[var(--lit-navy,#0B2545)]">
              No historical observations recorded yet
            </p>
            <p>
              Probes are recorded dynamically during crawl schedules and route audits.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)] font-mono">
                <tr>
                  <th className="py-3 px-6">Timestamp (IST)</th>
                  <th className="py-3 px-6">Site / Path</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">x-vercel-cache</th>
                  <th className="py-3 px-6">Age</th>
                  <th className="py-3 px-6">Freshness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {recentObservations.map((obs, idx) => (
                  <tr key={obs.id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                      {obs.observedAtIst}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs">
                      <span className="font-bold text-[var(--lit-navy,#0B2545)]">{obs.siteId}</span>
                      <span className="text-[var(--lit-text-muted,#52677C)]"> {obs.path}</span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          obs.edgeStatus >= 200 && obs.edgeStatus < 400
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {obs.edgeStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                      {obs.xVercelCache || "—"}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                      {obs.ageSeconds !== null ? `${obs.ageSeconds}s` : "—"}
                    </td>
                    <td className="py-3.5 px-6">
                      <TruthfulStatusBadge status={obs.isFresh ? "HEALTHY" : "CRITICAL"} />
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
