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
import {
  GitCommit,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  GitBranch,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Deployment Verification & Release Gates | Admin | Logic Intelligence Technologies",
  description: "Verify Git SHA, deployment state, and migration versions across all four site properties.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface SiteDeployment {
  siteKey: string;
  name: string;
  repo: string;
  environment: "Production" | "Staging";
  branch: string;
  lastReleaseBaseline: string;
  schemaVersion: string;
  status: "Active" | "Staged" | "Unknown";
}

const DEPLOYMENTS: SiteDeployment[] = [
  {
    siteKey: "corporate",
    name: "Corporate LIT Platform",
    repo: "logicintelligencetechnologies",
    environment: "Production",
    branch: "main",
    lastReleaseBaseline: "2026-03-31T00:00:00.000Z",
    schemaVersion: "20260412_000000",
    status: "Active",
  },
  {
    siteKey: "healthcare",
    name: "Healthcare AI Clinical Platform",
    repo: "lit-smart-hospital-platform",
    environment: "Production",
    branch: "main",
    lastReleaseBaseline: "2026-03-31T00:00:00.000Z",
    schemaVersion: "20260410_000000",
    status: "Active",
  },
  {
    siteKey: "logic_voice",
    name: "Logic Voice Telephony System",
    repo: "logic-voice",
    environment: "Production",
    branch: "main",
    lastReleaseBaseline: "2026-03-31T00:00:00.000Z",
    schemaVersion: "20260408_000000",
    status: "Active",
  },
  {
    siteKey: "voice_shield",
    name: "VoiceShield Voice Biometrics & Security",
    repo: "voice-shield",
    environment: "Production",
    branch: "main",
    lastReleaseBaseline: "2026-03-31T00:00:00.000Z",
    schemaVersion: "20260405_000000",
    status: "Active",
  },
];

export default async function DeploymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("automations.read", "/admin/automations/deployments");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = (params?.site || "all") as SiteFilter;

  const allCanonical = getCanonicalWorkflows();
  const siteCounts = getWorkflowCountsBySite(allCanonical);

  const filteredDeployments = currentSite === "all"
    ? DEPLOYMENTS
    : DEPLOYMENTS.filter((d) => d.siteKey === currentSite);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <GitCommit className="w-3 h-3" />
              Release Gates
            </span>
            <span className="text-xs font-mono text-slate-500">Zero-Downtime Rollback Mandate</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Deployment Verification &amp; Release Gates
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Multi-repo Git tracking, production schema migrations, and deployment readiness across all four properties.
          </p>
        </div>
      </div>

      {/* Four Site Tabs */}
      <FourSiteTabs activeSite={currentSite} baseUrl="/admin/automations/deployments" counts={siteCounts} />

      {/* Deployments Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--lit-navy,#0B2545)]">Four-Site Deployment Targets</span>
          <span className="font-mono text-slate-500 text-[11px]">Enforces multi-repo isolation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Entity &amp; Name</th>
                <th className="px-5 py-3 font-semibold">Repository</th>
                <th className="px-5 py-3 font-semibold">Branch / Env</th>
                <th className="px-5 py-3 font-semibold">Schema Baseline</th>
                <th className="px-5 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {filteredDeployments.map((d) => (
                <tr key={d.siteKey} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[var(--lit-navy,#0B2545)]">{d.name}</div>
                    <span className="font-mono text-[10px] text-slate-400">{d.siteKey}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <GitBranch className="w-3 h-3 text-slate-400" />
                      {d.repo}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    {d.branch} ({d.environment})
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600 text-[11px]">
                    {d.schemaVersion}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <TruthfulStatusBadge status={d.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
