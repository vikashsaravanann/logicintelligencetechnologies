import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../../components/AdminBackLink";
import { TruthfulStatusBadge } from "../../../components/TruthfulStatusBadge";
import { RiskTierBadge } from "../../../components/RiskTierBadge";
import { getWorkflowById, getCanonicalWorkflows } from "@/lib/automations/unified-four-site";
import {
  Layers,
  ShieldCheck,
  Clock,
  Zap,
  ArrowRight,
  Database,
  FileCode,
  AlertTriangle,
  GitBranch,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Workflow Graph & Node Detail | Admin | Logic Intelligence Technologies",
  description: "Inspect workflow graph nodes, trigger parameters, security bounds, and audit history.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCapabilityPage("automations.read", "/admin/automations/workflows");
  const { id } = await params;
  const canonical = getWorkflowById(id);

  const title = canonical ? canonical.name : `Workflow ${id}`;
  const siteName = canonical?.siteName ?? "Cross-Entity / Platform";
  const riskClass = canonical?.riskClass ?? "R1";
  const category = canonical?.category ?? "Integration Engine";
  const triggerType = canonical?.triggerType ?? "Webhook / Event";
  const dataClass = canonical?.dataClassification ?? "Operational Internal";
  const status = canonical?.status ?? "Active";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations/catalog" label="Workflow Catalog" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Layers className="w-3 h-3" />
              Workflow Node Graph
            </span>
            <RiskTierBadge riskClass={riskClass} />
            <TruthfulStatusBadge status={status} size="sm" />
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            {title}
          </h1>
          <p className="text-sm font-mono text-[var(--lit-text-muted,#52677C)] mt-1">
            Canonical Identifier: <span className="text-[var(--lit-navy,#0B2545)] font-bold">{id}</span>
          </p>
        </div>
      </div>

      {/* Primary Spec Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Site Entity</span>
          <div className="mt-2 text-sm font-bold text-[var(--lit-navy,#0B2545)]">{siteName}</div>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Trigger Type</span>
          <div className="mt-2 text-sm font-mono font-bold text-[var(--lit-blue,#1565C0)]">{triggerType}</div>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Data Classification</span>
          <div className="mt-2 text-sm font-mono font-bold text-slate-700">{dataClass}</div>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Category</span>
          <div className="mt-2 text-sm font-bold text-[var(--lit-navy,#0B2545)]">{category}</div>
        </div>
      </div>

      {/* Governance & Dual Control */}
      <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
          <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Security &amp; Dual-Control Protocol</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <span className="font-mono font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Gatekeeper Requirement
            </span>
            <p className="text-slate-600">
              {canonical?.requiresApproval
                ? "This automation is classified under high-impact governance (R3/R4) and requires human dual-control signoff before deployment or parameter mutation."
                : "This automation operates within standard deterministic operational bounds (R0-R2) with automated schema validation."}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <span className="font-mono font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Privacy &amp; Redaction Invariant
            </span>
            <p className="text-slate-600">
              Payload zero-knowledge policy enforced: all customer credentials, PHI/PII, and sensitive payload tokens are purged before audit logging.
            </p>
          </div>
        </div>
      </div>

      {/* Node Graph Stages */}
      <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Execution Flow Stages</h2>
          <span className="text-xs font-mono text-slate-500">Canonical Pipeline Definition</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-[var(--lit-blue,#1565C0)]">Stage 1</span>
              <Zap className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)]" />
            </div>
            <div className="font-bold text-xs text-[var(--lit-navy,#0B2545)]">Ingress Trigger</div>
            <p className="text-[11px] text-slate-600">HMAC v1 signature validation and payload size bounding.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Stage 2</span>
              <Database className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="font-bold text-xs text-[var(--lit-navy,#0B2545)]">State Check</div>
            <p className="text-[11px] text-slate-600">Deduplication key query against PostgreSQL outbox.</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Stage 3</span>
              <GitBranch className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="font-bold text-xs text-[var(--lit-navy,#0B2545)]">Execution Node</div>
            <p className="text-[11px] text-slate-600">Deterministic business logic execution with bounded retry.</p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">Stage 4</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="font-bold text-xs text-[var(--lit-navy,#0B2545)]">Receipt &amp; Audit</div>
            <p className="text-[11px] text-slate-600">Sanitized cryptographic delivery receipt committed to ledger.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
