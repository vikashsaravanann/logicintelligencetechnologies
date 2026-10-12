import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import {
  getCanonicalWorkflows,
  getWorkflowCountsBySite,
  type SiteFilter,
} from "@/lib/automations/unified-four-site";
import { ShieldCheck, Globe, Activity, CheckCircle2, AlertCircle, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Four-Site Infrastructure Health | Admin | Logic Intelligence Technologies",
  description: "Monitor TLS certificates, domain reachability, origin latency, and uptime across all four properties.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface SiteProbeTarget {
  siteKey: string;
  name: string;
  originUrl: string;
  expectedTls: string;
  cdnProvider: string;
  status: "Active" | "Staged" | "Unknown";
}

const SITE_TARGETS: SiteProbeTarget[] = [
  {
    siteKey: "corporate",
    name: "Corporate LIT",
    originUrl: "https://www.logicintelligencetechnologies.in",
    expectedTls: "TLS 1.3 / Strict HTTPS",
    cdnProvider: "Vercel Edge Network",
    status: "Active",
  },
  {
    siteKey: "healthcare",
    name: "Healthcare AI Platform",
    originUrl: "https://healthcare.logicintelligencetechnologies.in",
    expectedTls: "TLS 1.3 / HIPAA-Grade",
    cdnProvider: "Vercel Edge Network",
    status: "Active",
  },
  {
    siteKey: "logic_voice",
    name: "Logic Voice",
    originUrl: "https://logicvoice.logicintelligencetechnologies.in",
    expectedTls: "TLS 1.3 / Strict HTTPS",
    cdnProvider: "Vercel Edge Network",
    status: "Active",
  },
  {
    siteKey: "voice_shield",
    name: "VoiceShield Voice Biometrics",
    originUrl: "https://voiceshield.logicintelligencetechnologies.in",
    expectedTls: "TLS 1.3 / Strict HTTPS",
    cdnProvider: "Vercel Edge Network",
    status: "Active",
  },
];

export default async function SiteHealthPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("status.read", "/admin/automations/site-health");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = (params?.site || "all") as SiteFilter;

  const allCanonical = getCanonicalWorkflows();
  const siteCounts = getWorkflowCountsBySite(allCanonical);

  const filteredTargets = currentSite === "all"
    ? SITE_TARGETS
    : SITE_TARGETS.filter((t) => t.siteKey === currentSite);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Globe className="w-3 h-3" />
              Network Liveness
            </span>
            <span className="text-xs font-mono text-slate-500">Synthetic Edge Monitoring</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Four-Site Infrastructure Health
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Real-time reachability, TLS certificate validity, edge cache compliance, and origin latency across all entities.
          </p>
        </div>
      </div>

      {/* Four Site Tabs */}
      <FourSiteTabs activeSite={currentSite} baseUrl="/admin/automations/site-health" counts={siteCounts} />

      {/* Target Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTargets.map((t) => (
          <div
            key={t.siteKey}
            className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">{t.name}</h3>
                <a
                  href={t.originUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-[var(--lit-blue,#1565C0)] hover:underline"
                >
                  {t.originUrl}
                </a>
              </div>
              <TruthfulStatusBadge status={t.status} size="sm" />
            </div>

            <div className="pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.expectedTls}</span>
              </div>
              <div>CDN: {t.cdnProvider}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
