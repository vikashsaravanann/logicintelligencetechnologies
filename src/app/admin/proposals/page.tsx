import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ProposalActions } from "./proposal-actions";
import { AdminBackLink } from "../components/AdminBackLink";
import { formatIST } from "@/lib/format/datetime";
import {
  FileSignature,
  Plus,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Proposal Registry | Admin | Logic Intelligence Technologies",
  description: "Generate, dispatch, inspect, and track client proposals and digital signatures.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

interface ProposalRow {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  client_company?: string | null;
  status: "Draft" | "Sent" | "Viewed" | "Approved" | string;
  pricing: number | string;
  currency: string;
  timeline?: string | null;
  secure_token: string;
  created_at: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Draft: {
    label: "Draft",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    icon: Clock,
  },
  Sent: {
    label: "Sent",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock,
  },
  Viewed: {
    label: "Viewed",
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    icon: Eye,
  },
  Approved: {
    label: "Approved",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
};

export default async function AdminProposalsPage() {
  await requireCapabilityPage("proposals.read", "/admin/proposals");

  const { data: rawProposals, error } = await supabaseAdmin
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false });

  const proposals = (rawProposals ?? []) as ProposalRow[];
  const totalCount = proposals.length;
  const draftSentCount = proposals.filter((p) => p.status === "Draft" || p.status === "Sent").length;
  const viewedCount = proposals.filter((p) => p.status === "Viewed").length;
  const approvedCount = proposals.filter((p) => p.status === "Approved").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <FileSignature className="w-3 h-3" />
              Proposals & SOWs
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              E-Signature Workflow
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Client Proposals & Contracts
          </h1>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Generate, dispatch, inspect, and track client proposals, statements of work, and digital signatures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/proposals/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Proposal</span>
          </Link>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Total Proposals
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <FileText className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {error ? "—" : totalCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Generated proposals</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Draft / Sent
            </span>
            <span className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-amber-700">
              {error ? "—" : draftSentCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Awaiting review</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Viewed by Client
            </span>
            <span className="p-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
              <Eye className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-blue-700">
              {error ? "—" : viewedCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Opened by recipient</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Approved
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-700">
              {error ? "—" : approvedCount}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">Signed & approved</p>
          </div>
        </div>
      </div>

      {/* Proposals Table */}
      {error ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-sm text-rose-800 shadow-2xs"
          role="alert"
        >
          <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
            <XCircle className="w-4 h-4 text-rose-600" />
            Database Error
          </div>
          Could not load proposals from the database.
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Proposal Registry
              </h2>
            </div>
            <span className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
              {proposals.length} {proposals.length === 1 ? "proposal" : "proposals"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="bg-[var(--lit-cloud,#F7F9FC)]/60 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Title & Organization</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Valuation</th>
                  <th className="px-6 py-3.5 font-semibold">Timeline</th>
                  <th className="px-6 py-3.5 font-semibold">Issued (IST)</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {proposals.map((p) => {
                  const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.Draft;
                  const Icon = cfg.icon;
                  const currencySymbol = p.currency === "INR" ? "₹" : "$";

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--lit-cloud,#F7F9FC)]/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/proposals/${p.id}`}
                          className="font-bold text-sm text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-teal,#1FA9A2)] transition-colors"
                        >
                          {p.title}
                        </Link>
                        <div className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5 flex items-center gap-1.5">
                          <span>{p.client_name}</span>
                          {p.client_company && (
                            <>
                              <span>·</span>
                              <span className="font-medium text-slate-700 flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                {p.client_company}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{cfg.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-xs text-[var(--lit-navy,#0B2545)]">
                        {currencySymbol}
                        {Number(p.pricing || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--lit-text-muted,#52677C)]">
                        {p.timeline || "—"}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
                        {formatIST(p.created_at, "date")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ProposalActions proposalId={p.id} secureToken={p.secure_token} />
                      </td>
                    </tr>
                  );
                })}
                {proposals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)] flex items-center justify-center mx-auto">
                          <FileSignature className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                          No Proposals Created Yet
                        </h3>
                        <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                          Draft custom engineering proposals with interactive milestones, deliverables, and digital e-signature capabilities.
                        </p>
                        <div className="pt-2">
                          <Link
                            href="/admin/proposals/new"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--lit-navy,#0B2545)]/90 transition-all shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create First Proposal</span>
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
