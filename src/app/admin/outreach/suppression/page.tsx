import type { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { listSuppressions } from "@/lib/outreach/intelligence/queues";
import { formatIST } from "@/lib/format/datetime";
import { AdminBackLink } from "../../components/AdminBackLink";
import { OutreachNav } from "../components/OutreachNav";
import { SuppressForm, DeactivateButton } from "./suppress-form";
import {
  ShieldAlert,
  Ban,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  Layers,
  AlertOctagon,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Global Suppression & DNC Registry | Admin | Logic Intelligence Technologies",
  description: "Database-enforced do-not-contact (DNC) list, domain blacklists, and opt-out registry.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const REASON_LABELS: Record<string, { label: string; tone: string }> = {
  opt_out: { label: "Opt-Out Request", tone: "border-amber-200 bg-amber-50 text-amber-800" },
  do_not_contact: { label: "Do Not Contact", tone: "border-rose-200 bg-rose-50 text-rose-800" },
  complaint: { label: "Complaint / Unsubscribe", tone: "border-rose-200 bg-rose-50 text-rose-800" },
  bounce: { label: "Hard Bounce", tone: "border-slate-200 bg-slate-100 text-slate-700" },
  jurisdiction: { label: "Restricted Jurisdiction", tone: "border-purple-200 bg-purple-50 text-purple-800" },
  manual: { label: "Manual Override", tone: "border-blue-200 bg-blue-50 text-blue-800" },
};

export default async function OutreachSuppressionPage() {
  await requireCapabilityPage("outreach.manage", "/admin/outreach/suppression");
  const rows = await listSuppressions(200);

  const activeRules = rows.filter((r) => r.active);
  const domainBlocks = activeRules.filter((r) => r.domain);
  const emailBlocks = activeRules.filter((r) => r.email);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header & Navigation */}
      <div className="space-y-4">
        <div>
          <AdminBackLink href="/admin/outreach" label="Outreach Pipeline" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider font-mono">
              <ShieldAlert className="w-3 h-3" />
              DNC Registry
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              Database Gate Enforced
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Global Suppression &amp; DNC Registry
          </h1>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)] max-w-3xl">
            The canonical do-not-contact list. Every entry is enforced directly at the Postgres database layer
            via the <code className="font-mono text-xs text-[var(--lit-navy,#0B2545)]">lead_suppressions</code> gate
            — no draft or send can proceed for any suppressed recipient or domain.
          </p>
        </div>

        {/* Global Outreach Navigation */}
        <OutreachNav active="suppression" />
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Total Rules
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <Layers className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {rows.length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Recorded audit entries</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Active Blocks
            </span>
            <span className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700">
              <Ban className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-rose-700">
              {activeRules.length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Currently enforced live</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Apex Domains Blocked
            </span>
            <span className="p-1.5 rounded-lg border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)]">
              <Globe className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {domainBlocks.length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Entire domain wildcards</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Individual Mailboxes
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)]">
              <Mail className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {emailBlocks.length}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Specific email addresses</p>
          </div>
        </div>
      </div>

      {/* Add Suppression Form */}
      <SuppressForm />

      {/* Suppression Rules Ledger */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
              Enforced Suppression Ledger
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Active and historical suppression rules with origin audit tracking.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--lit-text-muted,#52677C)]">
            {rows.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/75 text-[10px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="px-5 py-3.5">Suppression Target</th>
                <th className="px-5 py-3.5">Reason &amp; Scope</th>
                <th className="px-5 py-3.5">Origin Source</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 mb-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                      No suppression entries registered
                    </p>
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                      Add rules above to block unwanted outreach targets.
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((s) => {
                  const targetValue = s.email || s.domain || s.phone || "—";
                  const targetType = s.email ? "EMAIL" : s.domain ? "DOMAIN" : s.phone ? "PHONE" : "OTHER";
                  const reasonInfo = REASON_LABELS[s.reason] ?? {
                    label: s.reason,
                    tone: "border-slate-200 bg-slate-100 text-slate-700",
                  };

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {s.domain ? (
                            <Globe className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)] shrink-0" />
                          ) : s.email ? (
                            <Mail className="w-3.5 h-3.5 text-[var(--lit-blue,#1565C0)] shrink-0" />
                          ) : (
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="font-mono font-bold text-xs text-[var(--lit-navy,#0B2545)]">
                            {targetValue}
                          </span>
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)]">
                            {targetType}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${reasonInfo.tone}`}>
                          {reasonInfo.label}
                        </span>
                        <span className="block text-[10px] font-mono text-[var(--lit-text-muted,#52677C)] mt-0.5">
                          Scope: {s.scope}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-[var(--lit-text-muted,#52677C)]">
                        {s.source ?? "manual"}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                            s.active
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              s.active ? "bg-rose-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          {s.active ? "Enforced" : "Lifted"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[11px] text-[var(--lit-text-muted,#52677C)]">
                        {formatIST(s.created_at, "datetime")}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        {s.active ? (
                          <DeactivateButton id={s.id} />
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Archived</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
