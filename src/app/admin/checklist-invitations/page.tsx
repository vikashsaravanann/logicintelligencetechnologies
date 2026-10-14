import { Metadata } from "next";
import Link from "next/link";
import {
  ListChecks,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  Send,
  FileText,
  Building2,
  ArrowRight,
} from "lucide-react";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../components/AdminBackLink";
import { IssueInvitationModal } from "./issue-invitation-modal";

export const metadata: Metadata = {
  title: "50-Point Checklist Invitations | Admin | Logic Intelligence Technologies",
  description: "Enterprise deployment checklist invitations, client requirements intake, and proposal preparation.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface InvitationRow {
  id: string;
  recipient_name: string;
  recipient_email: string;
  recipient_company?: string | null;
  status: string;
  expires_at: string;
  sent_at?: string | null;
  sent_count: number;
  viewed_at?: string | null;
  submitted_at?: string | null;
  revoked_at?: string | null;
  proposal_id?: string | null;
  internal_notes?: string | null;
  created_at: string;
  enterprise_checklist_responses?: {
    confirmation_reference: string;
    selected_count: number;
    submitted_at: string;
  }[] | null;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  submitted: {
    label: "Submitted",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  reviewed: {
    label: "Reviewed",
    badge: "border-blue-200 bg-blue-50 text-blue-800",
    icon: ShieldCheck,
  },
  proposal_prepared: {
    label: "Proposal Drafted",
    badge: "border-purple-200 bg-purple-50 text-purple-800",
    icon: FileText,
  },
  proposal_sent: {
    label: "Proposal Sent",
    badge: "border-teal-200 bg-teal-50 text-teal-800",
    icon: Send,
  },
  viewed: {
    label: "Viewed by Client",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock,
  },
  sent: {
    label: "Email Dispatched",
    badge: "border-sky-200 bg-sky-50 text-sky-800",
    icon: Send,
  },
  issued: {
    label: "Link Issued",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    icon: Clock,
  },
  expired: {
    label: "Expired",
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    icon: AlertCircle,
  },
  revoked: {
    label: "Revoked",
    badge: "border-slate-200 bg-slate-100 text-slate-600",
    icon: XCircle,
  },
};

type PageProps = {
  searchParams?: Promise<{ status?: string; q?: string }>;
};

export default async function ChecklistInvitationsPage({ searchParams }: PageProps) {
  await requireCapabilityPage("checklists.read", "/admin/checklist-invitations");

  const resolvedParams = searchParams ? await searchParams : {};
  const statusFilter = resolvedParams.status?.trim() || "";
  const query = resolvedParams.q?.trim().toLowerCase() || "";

  const { data, error } = await supabaseAdmin
    .from("enterprise_checklist_invitations")
    .select(
      `id, recipient_name, recipient_email, recipient_company, status,
       expires_at, sent_at, sent_count, viewed_at, submitted_at, revoked_at,
       proposal_id, internal_notes, created_at,
       enterprise_checklist_responses(confirmation_reference, selected_count, submitted_at)`
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const invitations = ((data ?? []) as unknown) as InvitationRow[];

  // KPI Calculations
  const totalInvitations = invitations.length;
  const submittedCount = invitations.filter((i) => i.submitted_at || i.status === "submitted").length;
  const reviewedCount = invitations.filter((i) => i.status === "reviewed" || i.status === "proposal_prepared" || i.status === "proposal_sent").length;
  const pendingCount = invitations.filter((i) => !i.submitted_at && i.status !== "expired" && i.status !== "revoked").length;

  const filtered = invitations.filter((inv) => {
    if (statusFilter && statusFilter !== "all") {
      if (statusFilter === "submitted" && !inv.submitted_at) return false;
      if (statusFilter === "in_progress" && (inv.submitted_at || inv.status === "expired" || inv.status === "revoked")) return false;
      if (statusFilter === "reviewed" && inv.status !== "reviewed" && inv.status !== "proposal_prepared") return false;
      if (statusFilter !== "submitted" && statusFilter !== "in_progress" && statusFilter !== "reviewed" && inv.status !== statusFilter) {
        return false;
      }
    }
    if (query) {
      const matchName = inv.recipient_name?.toLowerCase().includes(query);
      const matchEmail = inv.recipient_email?.toLowerCase().includes(query);
      const matchCompany = inv.recipient_company?.toLowerCase().includes(query);
      if (!matchName && !matchEmail && !matchCompany) return false;
    }
    return true;
  });

  const STATUS_TABS = [
    { id: "", label: "All", count: totalInvitations },
    { id: "submitted", label: "Submitted", count: submittedCount },
    { id: "in_progress", label: "Pending", count: pendingCount },
    { id: "reviewed", label: "Reviewed", count: reviewedCount },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#B9DCFF] bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <ListChecks className="w-3 h-3" />
              SOP Requirements Intake
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              <ShieldCheck className="w-3 h-3 text-teal-600" />
              Version 1.0 (50 Points)
            </span>
          </div>
          <h1 className="mt-2 font-poppins text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            50-Point Enterprise Checklist Registry
          </h1>
          <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)]">
            Private client invitation links, live selection telemetry, technical discovery reviews, and proposal draft linkage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <IssueInvitationModal />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Issued", value: totalInvitations, color: "text-[var(--lit-navy,#0B2545)]" },
          { label: "Pending Intake", value: pendingCount, color: "text-[var(--lit-blue,#1565C0)]" },
          { label: "Submitted", value: submittedCount, color: "text-emerald-700" },
          { label: "Reviewed & Drafted", value: reviewedCount, color: "text-purple-700" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs"
          >
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
              {kpi.label}
            </span>
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${kpi.color}`}>
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] w-fit">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.id ? `/admin/checklist-invitations?status=${tab.id}` : "/admin/checklist-invitations"}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? "bg-white text-[var(--lit-navy,#0B2545)] shadow-xs"
                    : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]"
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 font-mono text-[10px] opacity-70">({tab.count})</span>
              </Link>
            );
          })}
        </div>

        <form method="GET" className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lit-text-muted,#52677C)]" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search recipient or company…"
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:border-[var(--lit-blue,#1565C0)]"
          />
        </form>
      </div>

      {/* Invitations Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                <th className="py-3 px-4">Recipient / Account</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Checkpoints</th>
                <th className="py-3 px-4">Issued / Expiring</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--lit-text-muted,#52677C)]">
                    No enterprise checklist invitations found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.issued;
                  const StatusIcon = cfg.icon;
                  const response = inv.enterprise_checklist_responses?.[0];

                  return (
                    <tr key={inv.id} className="hover:bg-[var(--lit-cloud,#F7F9FC)]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[var(--lit-navy,#0B2545)] block">
                          {inv.recipient_name}
                        </span>
                        {inv.recipient_company && (
                          <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] block">
                            {inv.recipient_company}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-[var(--lit-blue,#1565C0)] block mt-0.5">
                          {inv.recipient_email}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider border ${cfg.badge}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {response ? (
                          <div>
                            <span className="font-bold text-emerald-800 block">
                              {response.selected_count} / 50 Selected
                            </span>
                            <span className="text-[10px] text-[var(--lit-text-muted,#52677C)] block">
                              Ref: {response.confirmation_reference}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[var(--lit-text-muted,#52677C)]">
                            Pending Submission
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-[var(--lit-text-muted,#52677C)]">
                        <div>
                          <span>Issued: {new Date(inv.created_at).toLocaleDateString()}</span>
                          <span className="block text-[10px] font-mono">
                            Expires: {new Date(inv.expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/checklist-invitations/${inv.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs transition-colors shadow-2xs"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
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
