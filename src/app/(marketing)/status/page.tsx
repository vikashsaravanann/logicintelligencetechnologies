import React from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Mail,
  Server,
  ShieldCheck,
  Clock,
  ArrowRight,
  Zap,
  Globe,
  RefreshCw,
} from "lucide-react";
import type { Metadata } from "next";
import PageShell from "@/components/layout/page-shell";
import BackButton from "@/components/navigation/back-button";
import JsonLd from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { COMPANY } from "@/config/company";
import CTASection from "@/components/ui/cta-section";
import Link from "next/link";
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
  alternates: {
    canonical: "/status",
  },
  openGraph: {
    title: "Live System Status | Logic Intelligence Technologies",
    description:
      "Real-time reachability, edge latency checks, and system health status for all enterprise services.",
    images: [
      {
        url: "/api/og?title=Live+System+Status&category=Telemetry",
        width: 1200,
        height: 630,
        alt: "Logic Intelligence Technologies System Status",
      },
    ],
  },
};

// Re-check at most once a minute; visitors never trigger extra probes.
export const revalidate = 60;

const STATE_STYLE: Record<
  ServiceState,
  {
    label: string;
    text: string;
    bg: string;
    border: string;
    pingBg: string;
    beaconBg: string;
    Icon: typeof CheckCircle2;
  }
> = {
  OPERATIONAL: {
    label: "All Systems Operational",
    text: "text-emerald-700",
    bg: "bg-emerald-50/80",
    border: "border-emerald-200",
    pingBg: "bg-emerald-400",
    beaconBg: "bg-emerald-500",
    Icon: CheckCircle2,
  },
  DEGRADED: {
    label: "Degraded Performance Detected",
    text: "text-amber-700",
    bg: "bg-amber-50/80",
    border: "border-amber-200",
    pingBg: "bg-amber-400",
    beaconBg: "bg-amber-500",
    Icon: AlertTriangle,
  },
  OUTAGE: {
    label: "Partial Outage Detected",
    text: "text-rose-700",
    bg: "bg-rose-50/80",
    border: "border-rose-200",
    pingBg: "bg-rose-400",
    beaconBg: "bg-rose-500",
    Icon: XCircle,
  },
  UNKNOWN: {
    label: "Verification In Progress",
    text: "text-slate-700",
    bg: "bg-slate-100",
    border: "border-slate-200",
    pingBg: "bg-slate-400",
    beaconBg: "bg-slate-500",
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

const UPTIME_SPECS = [
  {
    icon: Clock,
    title: "99.99% Availability",
    subtitle: "Enterprise Contractual SLA",
    accent: "bg-[#E7F3FF] text-[#1565C0] border-[#BBDEFB]",
  },
  {
    icon: Zap,
    title: "< 200ms Routing",
    subtitle: "Distributed Edge PoPs",
    accent: "bg-[#E0F2F1] text-[#00796B] border-[#B2DFDB]",
  },
  {
    icon: Globe,
    title: "Multi-Region Failover",
    subtitle: "Automated Standby Clusters",
    accent: "bg-[#EDE7F6] text-[#5E35B1] border-[#D1C4E9]",
  },
  {
    icon: RefreshCw,
    title: "60s Synthetic Probes",
    subtitle: "Isolated TLS Handshakes",
    accent: "bg-[#FFF8E1] text-[#B78103] border-[#FFE082]",
  },
];

export default async function StatusPage() {
  const results = await checkAllServices();
  const overall = overallState(results);
  const overallStyle = STATE_STYLE[overall.state];
  const checkedAt = results[0]?.checkedAt ?? new Date().toISOString();

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Status", path: "/status" },
  ];

  return (
    <PageShell>
      <JsonLd data={breadcrumb(breadcrumbItems)} />

      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs / Back button */}
          <div className="mb-6">
            <BackButton fallbackHref="/" label="Home" inline />
          </div>

          {/* Hero Section */}
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F3FF] border border-[#BBDEFB] text-[#1565C0] text-xs font-mono uppercase tracking-widest shadow-2xs">
              <Activity className="w-3.5 h-3.5 animate-pulse text-[#1FA9A2]" />
              <span>Live System Health Monitor</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-poppins font-bold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight">
              System Health & <br />
              <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">
                Uptime Telemetry
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
              Continuous synthetic health telemetry and latency measurements across our public interfaces, speech inference edge endpoints, and clinical platform services.
            </p>
          </div>

          {/* Overall Status Banner */}
          <div
            className={`mb-12 rounded-3xl border p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-3 transition-all shadow-sm ${overallStyle.border} ${overallStyle.bg}`}
            role="status"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${overallStyle.pingBg}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3.5 w-3.5 ${overallStyle.beaconBg}`}
                />
              </span>
              <h2
                className={`text-xl sm:text-2xl font-mono font-bold tracking-wider uppercase ${overallStyle.text}`}
              >
                {overall.label}
              </h2>
            </div>
            <p className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last checked: {formatIst(checkedAt)} IST · Background interval: 60s</span>
            </p>
          </div>

          {/* Uptime Specs Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-12">
            {UPTIME_SPECS.map((spec, idx) => {
              const Icon = spec.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                      {spec.title}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border ${spec.accent}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] font-medium leading-tight">
                    {spec.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Services List Card */}
          <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-sm mb-12">
            <div className="px-6 py-4.5 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold tracking-widest text-[var(--lit-navy,#0B2545)] uppercase flex items-center gap-2">
                <Server className="w-4 h-4 text-[#1565C0]" />
                <span>Verified Core Services</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500 uppercase font-medium">
                {results.length} Monitored Targets
              </span>
            </div>

            <div className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {results.map((r) => {
                const s = STATE_STYLE[r.state];
                const StateIcon = s.Icon;

                return (
                  <div
                    key={r.id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-mono font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wide">
                          {r.name}
                        </h4>
                        {r.latencyMs !== null && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                            {r.latencyMs} ms
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)] break-words font-light">
                        {r.description}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">
                        {r.detail}
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full border ${s.border} ${s.bg} ${s.text}`}
                    >
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">
                        {s.label}
                      </span>
                      <StateIcon className="w-4 h-4" aria-hidden />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monitoring Protocol Details */}
          <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-10 shadow-sm space-y-4 mb-16">
            <div className="flex items-center gap-2 text-[#00796B] text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Monitoring Protocol & Methodology</span>
            </div>
            <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-light">
              Reachability probes originate from edge workers every 60 seconds with isolated TLS handshakes. An endpoint is categorized as operational only when it responds with an HTTP 2xx or validated JSON payload within {SLOW_RESPONSE_MS / 1000} seconds. Responses exceeding this threshold are marked degraded.
            </p>
            <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-slate-500">
              <span>Experiencing unexpected latency or anomalous behavior?</span>
              <div className="flex items-center gap-4">
                <Link
                  href="/support/new"
                  className="inline-flex items-center gap-1.5 text-[#1565C0] font-semibold hover:underline"
                >
                  <span>Submit Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href={`mailto:${COMPANY.supportEmail}?subject=Status%20Inquiry`}
                  className="inline-flex items-center gap-1.5 text-[#1565C0] font-semibold hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{COMPANY.supportEmail}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Canonical CTA Section */}
        <div className="mt-20">
          <CTASection
            title="Need Guaranteed Enterprise Uptime SLAs?"
            subtitle="Explore our custom private VPC clusters, multi-region failover deployments, and dedicated on-call engineering SLAs."
            primaryCta={{
              label: "Schedule Technical Review",
              href: "/book-consultation",
            }}
            secondaryCta={{
              label: "Contact Support Desk",
              href: "/support",
            }}
          />
        </div>
      </main>
    </PageShell>
  );
}
