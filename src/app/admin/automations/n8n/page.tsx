import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../components/AdminBackLink";
import { TruthfulStatusBadge } from "../../components/TruthfulStatusBadge";
import { getAutomationsSnapshot } from "@/lib/automations/n8n-client";
import ConfigureN8nDialog from "../configure-dialog";
import ImportButton from "../import-button";
import {
  Server,
  Activity,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export const metadata: Metadata = {
  title: "n8n Runtime & Telemetry | Admin | Logic Intelligence Technologies",
  description: "Inspect n8n version, liveness probe, worker queue, and orchestrator runtime state.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function N8nTelemetryPage() {
  const session = await requireCapabilityPage("automations.read", "/admin/automations/n8n");
  const snap = await getAutomationsSnapshot();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations" label="Automations Overview" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Server className="w-3 h-3" />
              Runtime Diagnostic
            </span>
            <TruthfulStatusBadge
              status={snap.state === "CONNECTED" ? "Connected" : snap.state === "ERROR" ? "Error" : "Unconfigured"}
              size="sm"
            />
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            n8n Runtime &amp; Telemetry
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Real-time health, API connection latency, and blueprint sync state for the n8n automation engine.
          </p>
        </div>

        {session.role === "super_admin" && (
          <div className="sm:self-end flex items-center gap-2">
            <ConfigureN8nDialog />
            <ImportButton />
          </div>
        )}
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Runtime Engine
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-[var(--lit-navy,#0B2545)]">
              {snap.state}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {snap.healthy ? "Liveness OK" : "Offline"}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Registered Blueprints
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-[var(--lit-navy,#0B2545)]">
              {snap.workflows.length}
            </span>
            <span className="text-xs font-mono text-slate-400">Synchronized</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Privacy Policy
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Zero-Payload
            </span>
            <span className="text-xs font-mono text-slate-400">Strict</span>
          </div>
        </div>
      </div>

      {/* Runtime Detail & Diagnostic Details */}
      <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Engine Configuration State</h2>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-700 space-y-1">
          <div>Status Detail: <span className="font-semibold text-[var(--lit-navy,#0B2545)]">{snap.detail}</span></div>
          <div>Base URL Configured: <span className="font-semibold">{process.env.N8N_BASE_URL ? "Yes (Masked)" : "No"}</span></div>
          <div>API Token Configured: <span className="font-semibold">{process.env.N8N_API_KEY ? "Yes (Masked)" : "No"}</span></div>
          <div>Liveness Verification: <span className="font-semibold">{snap.healthy ? "200 OK" : "Unverified / Non-200"}</span></div>
        </div>
      </div>
    </div>
  );
}
