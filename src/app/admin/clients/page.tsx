import { Metadata } from "next";
import Link from "next/link";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { AdminBackLink } from "../components/AdminBackLink";
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
  ArrowRight,
  ExternalLink,
  FileSignature,
  ShieldCheck,
  Briefcase,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Client Directory | Admin | Logic Intelligence Technologies",
  description: "Enterprise client directory, contracts, active accounts, and telemetry.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface ClientRow {
  id: string;
  client_code: string;
  legal_name: string;
  display_name?: string | null;
  contact_email: string | null;
  status: "prospect" | "active" | "paused" | "closed" | string;
  created_at: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  prospect: {
    label: "Prospect",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Clock,
  },
  active: {
    label: "Active",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  paused: {
    label: "Paused",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    icon: PauseCircle,
  },
  closed: {
    label: "Closed",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    icon: XCircle,
  },
};

const STATUS_ORDER = ["prospect", "active", "paused", "closed"] as const;

export default async function ClientsPage() {
  await requireCapabilityPage("clients.read", "/admin/clients");

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("id, client_code, legal_name, display_name, contact_email, status, created_at")
    .not("is_fixture", "is", true)
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as ClientRow[];
  const totalClients = rows.length;

  const counts = STATUS_ORDER.map((s) => ({
    status: s,
    count: rows.filter((r) => r.status === s).length,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Building2 className="w-3 h-3" />
              Client Registry
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              Real Accounts Only
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Client Organizations
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Enterprise customer organizations, active engagements, and contract dossiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/proposals"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] font-semibold text-xs tracking-wider transition-all shadow-2xs"
          >
            <FileSignature className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Approved Proposals</span>
          </Link>
        </div>
      </div>

      {/* Status Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {counts.map((c) => {
          const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.closed;
          const Icon = cfg.icon;
          return (
            <div
              key={c.status}
              className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                  {cfg.label}
                </span>
                <span
                  className={`inline-flex items-center justify-center p-1.5 rounded-lg border ${cfg.badge}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
                  {error ? "—" : c.count}
                </span>
                <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
                  {error ? "Database unavailable" : `${c.count} of ${totalClients} accounts`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      {error ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-sm text-rose-800 shadow-2xs"
          role="alert"
        >
          <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
            <XCircle className="w-4 h-4 text-rose-600" />
            Database Query Error
          </div>
          Could not load client organizations. Please verify your connection or database credentials.
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Enterprise Accounts Directory
              </h2>
            </div>
            <span className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
              {rows.length} {rows.length === 1 ? "organization" : "organizations"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[var(--lit-cloud,#F7F9FC)]/60 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Client Code</th>
                  <th className="px-6 py-3.5 font-semibold">Legal Organization</th>
                  <th className="px-6 py-3.5 font-semibold">Contact Email</th>
                  <th className="px-6 py-3.5 font-semibold">Account Status</th>
                  <th className="px-6 py-3.5 font-semibold">Enrolled (IST)</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {rows.map((c) => {
                  const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.closed;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-[var(--lit-cloud,#F7F9FC)]/60 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {c.client_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/clients/${c.id}`}
                          className="font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors flex items-center gap-2"
                        >
                          <span>{c.legal_name}</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--lit-teal,#1FA9A2)]" />
                        </Link>
                        {c.display_name && c.display_name !== c.legal_name && (
                          <div className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                            {c.display_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-[var(--lit-text-muted,#52677C)]">
                        {c.contact_email ? (
                          <a
                            href={`mailto:${c.contact_email}`}
                            className="hover:text-[var(--lit-teal,#1FA9A2)] underline-offset-2 hover:underline"
                          >
                            {c.contact_email}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${cfg.badge}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
                        {formatIST(c.created_at, "date")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/clients/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-navy,#0B2545)] transition-colors"
                        >
                          <span>Dossier</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)] flex items-center justify-center mx-auto">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                          No Client Accounts Found
                        </h3>
                        <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                          Client accounts are initiated automatically when approved digital proposals are converted into active contract scopes.
                        </p>
                        <div className="pt-2">
                          <Link
                            href="/admin/proposals"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all shadow-2xs"
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                            <span>Browse Proposals</span>
                          </Link>
                        </div>
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
