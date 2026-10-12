import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { FourSiteTabs } from "../../components/FourSiteTabs";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { RiskTierBadge } from "../../components/RiskTierBadge";
import { FOUR_SITES, type SiteKey } from "@/lib/automations/unified-four-site";
import {
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Users,
  Clock,
  HardDrive,
  AlertTriangle,
  FileText,
  Lock,
  Server,
  Zap,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Terminal,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Service Ownership & Governance Runbooks | Admin | LIT",
  description:
    "Cross-property service ownership matrix, DPDP 7-year retention rules, and clinical incident response runbooks.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface ServiceOwner {
  serviceName: string;
  domain: string;
  siteCode: string;
  leadOwner: string;
  leadRole: string;
  escalationContact: string;
  repo: string;
  tier: "R0" | "R1" | "R2" | "R3" | "R4";
}

const SERVICE_OWNERS: ServiceOwner[] = [
  {
    serviceName: "Corporate LIT Executive Platform",
    domain: "www.logicintelligencetechnologies.in",
    siteCode: "LIT-CORP",
    leadOwner: "ops@logicintelligencetechnologies.in",
    leadRole: "Director of Operations & CRM",
    escalationContact: "tech-lead@logicintelligencetechnologies.in",
    repo: "logicintelligencetechnologies",
    tier: "R2",
  },
  {
    serviceName: "Smart Hospital & Healthcare Platform",
    domain: "healthcare.logicintelligencetechnologies.in",
    siteCode: "LIT-HC",
    leadOwner: "clinical-ops@logicintelligencetechnologies.in",
    leadRole: "Clinical Architect & ABDM Officer",
    escalationContact: "dpo@logicintelligencetechnologies.in",
    repo: "lit-smart-hospital-platform",
    tier: "R4",
  },
  {
    serviceName: "Logic Voice Conversational Telephony",
    domain: "logicvoice.logicintelligencetechnologies.in",
    siteCode: "LIT-LV",
    leadOwner: "voice-ai@logicintelligencetechnologies.in",
    leadRole: "Audio Streams & Telephony Lead",
    escalationContact: "infra@logicintelligencetechnologies.in",
    repo: "logic-voice",
    tier: "R3",
  },
  {
    serviceName: "VoiceShield Deepfake Sentinel",
    domain: "voiceshield.logicintelligencetechnologies.in",
    siteCode: "LIT-VS",
    leadOwner: "security@logicintelligencetechnologies.in",
    leadRole: "Biometric Defense & Threat Intel Lead",
    escalationContact: "ciso@logicintelligencetechnologies.in",
    repo: "voice-shield",
    tier: "R4",
  },
  {
    serviceName: "Platform Infrastructure & Edge CDN",
    domain: "Global Anycast / Vercel Edge",
    siteCode: "LIT-EDGE",
    leadOwner: "sre-ops@logicintelligencetechnologies.in",
    leadRole: "Principal DevOps & Cloud Infrastructure",
    escalationContact: "oncall-sre@logicintelligencetechnologies.in",
    repo: "lit-infrastructure",
    tier: "R3",
  },
];

interface RetentionRule {
  dataDomain: string;
  retentionWindow: string;
  legalBasis: string;
  purgingMechanism: string;
  complianceClassification: string;
}

const RETENTION_RULES: RetentionRule[] = [
  {
    dataDomain: "Audit Logs & Dual-Control Approvals",
    retentionWindow: "7 Years (Mandatory)",
    legalBasis: "Companies Act & IT Act 2000 Section 67C",
    purgingMechanism: "Immutable append-only cold archive with cryptographic signing",
    complianceClassification: "Statutory Regulatory Record",
  },
  {
    dataDomain: "Customer Inquiries & Transient Lead Data",
    retentionWindow: "Zero Retention (Ephemeral)",
    legalBasis: "DPDP Act 2023 Principle of Data Minimization",
    purgingMechanism: "Evaluated in memory and routed immediately; zero raw lead tables",
    complianceClassification: "Ephemeral Operational Buffer",
  },
  {
    dataDomain: "Telemetry Probes & Health Observations",
    retentionWindow: "90 Days Hot / 365 Days Cold",
    legalBasis: "Operational Reliability & SLA Tracking",
    purgingMechanism: "Automated rolling partition purge via pg_cron",
    complianceClassification: "Internal Engineering Telemetry",
  },
  {
    dataDomain: "Google Search Console Coverage History",
    retentionWindow: "16 Months",
    legalBasis: "Search Quality & Crawl Regression Tracking",
    purgingMechanism: "Deterministic 72-hour sliding window pruning",
    complianceClassification: "External Provider Telemetry",
  },
];

interface RunbookItem {
  id: string;
  title: string;
  severity: "P0_CRITICAL" | "P1_HIGH" | "P2_ELEVATED";
  scope: string;
  symptoms: string[];
  steps: string[];
}

const INCIDENT_RUNBOOKS: RunbookItem[] = [
  {
    id: "RB-OPS-01",
    title: "n8n Automation Engine Unreachability / Outage",
    severity: "P1_HIGH",
    scope: "Background workflow execution across 4 sites",
    symptoms: [
      "Automations command center displays UNCONFIGURED or UNREACHABLE",
      "Dead-letter events fail to dispatch within 15-minute SLA",
      "HTTP 502/503 returned on n8n webhook listener endpoints",
    ],
    steps: [
      "1. Verify Droplet container status: `docker ps -a | grep n8n` on host server.",
      "2. Check environment credentials via `/admin/automations` configuration dialog.",
      "3. Execute safe workflow re-activation: `node scripts/activate-safe-n8n-workflows.mjs`.",
      "4. Inspect PostgreSQL event backlog: check `ops_audit_events` for stuck runs.",
      "5. Escalate to DevOps SRE if container memory utilization exceeds 85%.",
    ],
  },
  {
    id: "RB-OPS-02",
    title: "Search Console Daily Quota Exhaustion (>2,000 req/day)",
    severity: "P2_ELEVATED",
    scope: "Public URL Inspection API in /admin/seo/url-inspection",
    symptoms: [
      "GSC URL inspection requests fail with HTTP 429 Quota Exceeded",
      "Quota tracker displays 0 remaining daily inspections",
    ],
    steps: [
      "1. Verify remaining quota on `/admin/seo` (resets at 00:00:00 UTC).",
      "2. 72-hour scheduler automatically throttles inspection sampler to 10 priority URLs.",
      "3. Disallow manual batch inspections until UTC midnight reset.",
      "4. Ensure Google Indexing API is NEVER invoked (enforced by QA-50 guard).",
    ],
  },
  {
    id: "RB-OPS-03",
    title: "Edge CDN Cache Desync / Stale Route Incident",
    severity: "P2_ELEVATED",
    scope: "Vercel Edge Anycast across 4 production domains",
    symptoms: [
      "Probes on /admin/cdn report stale age > 7 days or HTTP error",
      "Updated deployment copy not reflecting for end users",
    ],
    steps: [
      "1. Navigate to `/admin/cdn` and inspect live headers for the affected site.",
      "2. Open `/admin/cdn/cache-jobs` (Invalidation Console).",
      "3. Submit targeted invalidation for specific modified paths (e.g. `/services`).",
      "4. STRICT RULE: Reject any attempt to submit wildcard `/*` blanket purges.",
      "5. Re-probe route and confirm fresh `x-vercel-cache` header (HIT/MISS/PRERENDER).",
    ],
  },
  {
    id: "RB-OPS-04",
    title: "Critical Dual-Control Workflow Desync (R3/R4)",
    severity: "P0_CRITICAL",
    scope: "Biometric or Financial automation actions",
    symptoms: [
      "Pending approval request unacknowledged for > 4 hours",
      "Unauthorized execution attempt detected in ops_audit_events",
    ],
    steps: [
      "1. Immediately access `/admin/automations/approvals` queue.",
      "2. Review cryptographic payload fingerprint and requesting actor identity.",
      "3. Two Super Admins must sign off before any R3/R4 dispatch.",
      "4. If suspicious, reject with substantive justification and freeze pipeline.",
    ],
  },
];

export default async function GovernancePage({
  searchParams,
}: {
  searchParams?: Promise<{ site?: string }>;
}) {
  await requireCapabilityPage("automations.read", "/admin/automations/governance");
  const params = searchParams ? await searchParams : undefined;
  const currentSite = params?.site || "all";

  const filteredOwners =
    currentSite === "all"
      ? SERVICE_OWNERS
      : SERVICE_OWNERS.filter((o) => {
          if (currentSite === "corporate") return o.siteCode === "LIT-CORP";
          if (currentSite === "healthcare") return o.siteCode === "LIT-HC";
          if (currentSite === "logic_voice") return o.siteCode === "LIT-LV";
          if (currentSite === "voice_shield") return o.siteCode === "LIT-VS";
          return true;
        });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <ShieldAlert className="w-3 h-3" />
              Governance & Runbooks
            </span>
            <RiskTierBadge tier="R4" />
            <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
              DPDP 2023 Compliant
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Service Ownership & Incident Runbooks
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Authoritative ownership matrix, statutory 7-year audit retention rules, and emergency operational runbooks for four-site production infrastructure.
          </p>
        </div>
      </div>

      {/* Subnav Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold">
        <Link
          href="/admin/automations"
          className="px-3 py-1.5 rounded-lg text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100 transition-colors"
        >
          Automations Overview
        </Link>
        <Link
          href="/admin/automations/approvals"
          className="px-3 py-1.5 rounded-lg text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100 transition-colors"
        >
          Dual-Control Approvals
        </Link>
        <Link
          href="/admin/automations/reports"
          className="px-3 py-1.5 rounded-lg text-[var(--lit-text-muted,#52677C)] hover:bg-slate-100 transition-colors"
        >
          Reliability & Privacy Reports
        </Link>
        <Link
          href="/admin/automations/governance"
          className="px-3 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
        >
          Service Ownership & Runbooks
        </Link>
      </div>

      {/* 4-Site Scope Filter */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider">
          Filter Service Governance:
        </div>
        <FourSiteTabs currentSite={currentSite} baseUrl="/admin/automations/governance" />
      </div>

      {/* Section 1: Service Ownership Matrix */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              Cross-Property Service Ownership Matrix
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Identified owners, repositories, and direct escalation routing for all 4 deployments and edge systems.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--lit-navy,#0B2545)]">
            {filteredOwners.length} Services
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)] font-mono">
              <tr>
                <th className="py-3 px-6">Service / Site</th>
                <th className="py-3 px-6">Primary Owner</th>
                <th className="py-3 px-6">Escalation Channel</th>
                <th className="py-3 px-6">Repository</th>
                <th className="py-3 px-6">Max Risk Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {filteredOwners.map((owner) => (
                <tr key={owner.serviceName} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-[var(--lit-navy,#0B2545)] text-xs">
                      {owner.serviceName}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)] mt-0.5">
                      {owner.domain}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-mono text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                      {owner.leadOwner}
                    </div>
                    <div className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                      {owner.leadRole}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-[var(--lit-teal,#1FA9A2)] font-semibold">
                    {owner.escalationContact}
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                    {owner.repo}
                  </td>
                  <td className="py-4 px-6">
                    <RiskTierBadge tier={owner.tier} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Data Retention & Compliance Rules */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            Statutory Data Retention & Zero-Payload Architecture (DPDP Act 2023)
          </h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
            Retention obligations codified under Indian and international regulatory frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          {RETENTION_RULES.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--lit-navy,#0B2545)] text-sm">
                  {rule.dataDomain}
                </span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200">
                  {rule.retentionWindow}
                </span>
              </div>
              <div className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                <strong>Legal Basis:</strong> {rule.legalBasis}
              </div>
              <div className="text-[11px] text-[var(--lit-navy,#0B2545)]">
                <strong>Mechanism:</strong> {rule.purgingMechanism}
              </div>
              <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] text-[10px] font-mono text-[var(--lit-text-muted,#52677C)]">
                {rule.complianceClassification}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Incident Runbooks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              Standard Incident Remediation Runbooks
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Deterministic operational triage procedures for production disruptions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INCIDENT_RUNBOOKS.map((rb) => (
            <div
              key={rb.id}
              className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                    {rb.id}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      rb.severity === "P0_CRITICAL"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : rb.severity === "P1_HIGH"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {rb.severity}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                  {rb.title}
                </h3>
                <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
                  Scope: {rb.scope}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
                <div className="text-[11px] font-bold text-[var(--lit-navy,#0B2545)]">
                  Triage & Recovery Steps:
                </div>
                <div className="space-y-1 text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {rb.steps.map((step, sIdx) => (
                    <div key={sIdx}>{step}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
