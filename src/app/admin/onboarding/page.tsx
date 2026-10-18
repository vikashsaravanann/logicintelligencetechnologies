import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { sessionState, type SessionState } from "@/lib/onboarding/token-core";
import { IssueLinkForm } from "./issue-link-form";

interface SessionRow {
  id: string;
  contract_id: string | null;
  client_id: string | null;
  project_id: string | null;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  consumed_at: string | null;
}
import { AdminBackLink } from "../components/AdminBackLink";
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Layers,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Onboarding Invitations | Admin | Logic Intelligence Technologies",
  description: "Cryptographic onboarding sessions, single-use token issuance, and intake lifecycle telemetry.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const STATE_CONFIG: Record<
  string,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  valid: {
    label: "Valid · Unused",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  consumed: {
    label: "Consumed · Complete",
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    icon: FileCheck2,
  },
  revoked: {
    label: "Revoked",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    icon: XCircle,
  },
  expired: {
    label: "Expired",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    icon: AlertTriangle,
  },
  invalid: {
    label: "Invalid",
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    icon: XCircle,
  },
};

export default async function OnboardingPage() {
  await requireCapabilityPage("onboarding.manage", "/admin/onboarding");

  const { data, error } = await supabaseAdmin
    .from("onboarding_sessions")
    .select("id, contract_id, client_id, project_id, created_at, expires_at, revoked_at, consumed_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const rawSessions = (data ?? []) as SessionRow[];
  const evaluatedSessions = rawSessions.map((s) => ({
    ...s,
    state: sessionState(s),
  }));

  const totalCount = evaluatedSessions.length;
  const validCount = evaluatedSessions.filter((s) => s.state === "valid").length;
  const consumedCount = evaluatedSessions.filter((s) => s.state === "consumed").length;
  const expiredRevokedCount = evaluatedSessions.filter(
    (s) => s.state === "expired" || s.state === "revoked"
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <KeyRound className="w-3 h-3" />
              Onboarding Pipeline
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              Zero-Trust Intake
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Onboarding Invitations
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Issue single-use cryptographic onboarding tokens and audit intake completion.
          </p>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Total Sessions
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {error ? "—" : totalCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Recorded sessions</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Pending Intake
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-700">
              {error ? "—" : validCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Active tokens</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Intake Completed
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
              <FileCheck2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-blue-700">
              {error ? "—" : consumedCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Consumed tokens</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Expired / Revoked
            </span>
            <span className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-amber-700">
              {error ? "—" : expiredRevokedCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Inactive tokens</p>
          </div>
        </div>
      </div>

      {/* Generator Form */}
      <IssueLinkForm />

      {/* Sessions Ledger */}
      {error ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-sm text-rose-800 shadow-2xs"
          role="alert"
        >
          <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
            <XCircle className="w-4 h-4 text-rose-600" />
            Query Error
          </div>
          Could not load onboarding sessions from the database.
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Onboarding Sessions Ledger
              </h2>
            </div>
            <span className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
              {evaluatedSessions.length} sessions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[var(--lit-cloud,#F7F9FC)]/60 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">State</th>
                  <th className="px-6 py-3.5 font-semibold">Associated Contract</th>
                  <th className="px-6 py-3.5 font-semibold">Associated Client</th>
                  <th className="px-6 py-3.5 font-semibold">Created (IST)</th>
                  <th className="px-6 py-3.5 font-semibold">Expiry (IST)</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {evaluatedSessions.map((s) => {
                  const cfg = STATE_CONFIG[s.state] ?? STATE_CONFIG.invalid;
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[var(--lit-cloud,#F7F9FC)]/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}
                        >
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[var(--lit-navy,#0B2545)]">
                        {s.contract_id ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {s.contract_id.slice(0, 13)}…
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[var(--lit-text-muted,#52677C)]">
                        {s.client_id ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                            {s.client_id.slice(0, 13)}…
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[var(--lit-text-muted,#52677C)]">
                        {formatIST(s.created_at, "datetime")}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[var(--lit-text-muted,#52677C)]">
                        {formatIST(s.expires_at, "datetime")}
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-mono">
                        {s.consumed_at ? (
                          <span className="text-blue-700 font-semibold">
                            Consumed {formatIST(s.consumed_at, "date")}
                          </span>
                        ) : s.revoked_at ? (
                          <span className="text-slate-500">
                            Revoked {formatIST(s.revoked_at, "date")}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">Ready</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {evaluatedSessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)] flex items-center justify-center mx-auto">
                          <KeyRound className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                          No Onboarding Sessions Yet
                        </h3>
                        <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                          Issue a new onboarding token using the form above to invite a client to complete their activation intake.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
