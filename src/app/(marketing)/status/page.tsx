import React from "react";
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Mail, 
  RefreshCw,
  Server,
  ShieldCheck,
  Clock
} from "lucide-react";
import { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY } from "@/config/company";
import {
  checkAllServices,
  overallState,
  SLOW_RESPONSE_MS,
  type ServiceState,
} from "@/lib/status/service-checks";

export const metadata: Metadata = {
  title: "Live System Status | Logic Intelligence Technologies",
  description:
    "Real-time reachability and operational health checks across Logic Intelligence Technologies platforms, inference edge nodes, and portal services.",
};

// Re-check at most once a minute; visitors never trigger extra probes.
export const revalidate = 60;

const STATE_STYLE: Record<
  ServiceState,
  { label: string; text: string; bg: string; border: string; glow: string; Icon: typeof CheckCircle2 }
> = {
  OPERATIONAL: {
    label: "All Systems Operational",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    Icon: CheckCircle2,
  },
  DEGRADED: {
    label: "Degraded Performance",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    Icon: AlertTriangle,
  },
  OUTAGE: {
    label: "Partial Outage Detected",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    glow: "shadow-[0_0_20px_rgba(244,63,94,0.2)]",
    Icon: XCircle,
  },
  UNKNOWN: {
    label: "Status Verification In Progress",
    text: "text-slate-400",
    bg: "bg-slate-800/40",
    border: "border-slate-700/50",
    glow: "",
    Icon: HelpCircle,
  },
};

function formatIst(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function StatusPage() {
  const results = await checkAllServices();
  const overall = overallState(results);
  const overallStyle = STATE_STYLE[overall.state];
  const checkedAt = results[0]?.checkedAt ?? new Date().toISOString();

  return (
    <PageShell>
      <JsonLd
        data={breadcrumb([
          { name: "Home", path: "/" },
          { name: "Status", path: "/status" },
        ])}
      />

      <div className="pt-28 sm:pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackToHome href="/" label="Back to Home" />

        {/* Hero Section */}
        <div className="mt-8 mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-mono font-medium tracking-wider uppercase mb-6 shadow-[0_0_15px_rgba(69,217,210,0.15)]">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Live System Health Monitor
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-heading leading-tight">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400">Status</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            Continuous health telemetry and latency measurements across our public interfaces, speech inference endpoints, and clinical platform services.
          </p>
        </div>

        {/* Big Overall Status Badge */}
        <div
          className={`mb-12 rounded-2xl border p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-3 transition-all ${overallStyle.border} ${overallStyle.bg} ${overallStyle.glow}`}
          role="status"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${overall.state === 'OPERATIONAL' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${overall.state === 'OPERATIONAL' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <h2 className={`text-xl sm:text-2xl font-mono font-bold tracking-widest uppercase ${overallStyle.text}`}>
              {overall.label}
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Last checked: {formatIst(checkedAt)} IST · Background interval: 60s
          </p>
        </div>

        {/* Services List Card */}
        <div className="rounded-3xl border border-white/10 bg-[#10131A] overflow-hidden shadow-2xl mb-12">
          <div className="px-6 py-4 border-b border-white/5 bg-[#151922] flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Verified Core Services
            </h3>
            <span className="text-[11px] font-mono text-slate-500 uppercase">
              {results.length} Monitored Targets
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {results.map((r) => {
              const s = STATE_STYLE[r.state];
              return (
                <div
                  key={r.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wide">
                        {r.name}
                      </h4>
                      {r.latencyMs !== null && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-400">
                          {r.latencyMs} ms
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 break-words">
                      {r.description}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 mt-1">
                      {r.detail}
                    </p>
                  </div>

                  <div className={`flex items-center gap-2.5 shrink-0 px-3 py-1.5 rounded-xl border ${s.border} ${s.bg} ${s.text}`}>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      {s.label}
                    </span>
                    <s.Icon className="w-4 h-4" aria-hidden />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monitoring Protocol Details */}
        <div className="rounded-3xl border border-white/10 bg-[#151922] p-8 sm:p-10 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Monitoring Protocol & Methodology
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            Reachability probes originate from edge workers every 60 seconds with isolated TLS handshakes. An endpoint is categorized as operational only when it responds with an HTTP 2xx or validated JSON payload within {SLOW_RESPONSE_MS / 1000} seconds. Responses exceeding this threshold are marked degraded.
          </p>
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <span>Experiencing latency or anomalous behavior?</span>
            <a
              href={`mailto:${COMPANY.supportEmail}?subject=Status%20Inquiry`}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {COMPANY.supportEmail}
            </a>
          </div>
        </div>

      </div>
    </PageShell>
  );
}
