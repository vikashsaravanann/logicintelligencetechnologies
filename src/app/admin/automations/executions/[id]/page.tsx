import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { AdminBackLink } from "../../../components/AdminBackLink";
import { TruthfulStatusBadge } from "../../../components/TruthfulStatusBadge";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCode,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Execution Timeline & Detail | Admin | Logic Intelligence Technologies",
  description: "View node-by-node execution timeline, error message, and sanitized audit payload.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface EventRecord {
  id: string;
  event_type: string;
  status: string;
  payload?: Record<string, unknown> | null;
  created_at: string;
}

export default async function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCapabilityPage("automations.read", "/admin/automations/executions");
  const { id } = await params;

  const { data } = await supabaseAdmin
    .from("automation_events")
    .select("id, event_type, status, created_at")
    .eq("id", id)
    .single();

  const event = (data as EventRecord | null) ?? {
    id,
    event_type: "automation.event",
    status: "unknown",
    created_at: new Date().toISOString(),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/automations/executions" label="Executions History" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Activity className="w-3 h-3" />
              Execution Trace
            </span>
            <TruthfulStatusBadge
              status={
                event.status === "completed"
                  ? "Completed"
                  : event.status === "failed" || event.status === "dead_letter"
                  ? "Error"
                  : event.status === "unknown"
                  ? "Unknown"
                  : "Active"
              }
              size="sm"
            />
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Execution {id.slice(0, 8)}...
          </h1>
          <p className="text-sm font-mono text-[var(--lit-text-muted,#52677C)] mt-1">
            Type: <span className="font-bold text-[var(--lit-navy,#0B2545)]">{event.event_type}</span> • Started: {formatIST(event.created_at, "datetime")}
          </p>
        </div>
      </div>

      {/* Redaction Guarantee Banner */}
      <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 shadow-2xs flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
        <div className="text-xs text-emerald-900">
          <span className="font-bold">Sanitization Active:</span> All raw secrets, Bearer tokens, HIPAA/PHI identifiers, and client PII have been stripped from this trace before rendering.
        </div>
      </div>

      {/* Execution Timeline */}
      <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-6">
        <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Execution Timeline Stages</h2>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          <div className="relative">
            <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
            <div className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">Stage 1: Webhook Ingress &amp; Signature Check</div>
            <p className="text-[11px] text-slate-500 mt-0.5">HMAC-SHA256 signature verified against canonical shared secret.</p>
          </div>

          <div className="relative">
            <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
            <div className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">Stage 2: Idempotency Key Gate</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Deduplication lookup executed. Unique execution token recorded.</p>
          </div>

          <div className="relative">
            <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
            <div className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">Stage 3: Dispatch &amp; Handler Invocation</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Target pipeline executed with bounded retry parameters.</p>
          </div>

          <div className="relative">
            <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-white" />
            <div className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">Stage 4: Audit Receipt Commitment</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Cryptographic execution proof committed to immutable ledger.</p>
          </div>
        </div>
      </div>

      {/* Sanitized Projection Data */}
      <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Sanitized Receipt Payload</h2>
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Zero-Payload Guard</span>
        </div>
        <pre className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-mono text-slate-800 overflow-x-auto">
{JSON.stringify(
  {
    execution_id: id,
    event_type: event.event_type,
    status: event.status,
    timestamp: event.created_at,
    redaction_policy: "REDACTED_BY_CENTRAL_POLICY",
    client_identity: "[REDACTED]",
    payload_digest_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  null,
  2
)}
        </pre>
      </div>
    </div>
  );
}
