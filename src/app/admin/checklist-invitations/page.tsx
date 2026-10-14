import { Metadata } from "next";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import ChecklistInvitationsClient from "./checklist-invitations-client";
import { AdminBackLink } from "../components/AdminBackLink";
import {
  CheckSquare,
  Clock,
  Eye,
  CheckCircle2,
  FileSignature,
  FileCheck2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise Checklist Registry | Admin | Logic Intelligence Technologies",
  description: "Issue, monitor, and review 50-point enterprise deployment checklists and requirements submissions.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default async function AdminChecklistInvitationsPage() {
  await requireCapabilityPage("checklists.read", "/admin/checklist-invitations");

  const { data: invitations, error } = await supabaseAdmin
    .from("enterprise_checklist_invitations")
    .select(
      `id, recipient_name, recipient_email, recipient_company, status, expires_at, sent_at,
       sent_count, viewed_at, submitted_at, created_at, proposal_id,
       enterprise_checklist_responses(id, confirmation_reference, selected_count, submitted_at, client_notes)`
    )
    .order("created_at", { ascending: false });

  const list = (invitations || []) as any[];

  const totalCount = list.length;
  const submittedCount = list.filter((i) => i.status === "submitted" || i.status === "reviewed" || i.status === "proposal_prepared").length;
  const viewedCount = list.filter((i) => i.status === "viewed").length;
  const issuedCount = list.filter((i) => i.status === "issued" || i.status === "sent").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <CheckSquare className="w-3 h-3" />
              Checklist Lifecycle
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              50 Points · 8 Phases
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)] font-poppins">
            Enterprise Checklist Invitations
          </h1>
          <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)]">
            Issue cryptographically secure checklist links, review client requirements, and prepare aligned proposals.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase">Total Issued</span>
            <CheckSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-[var(--lit-navy,#0B2545)]">{totalCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">Across all clients</div>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <span className="text-[11px] font-mono uppercase">Issued / Sent</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-900">{issuedCount}</div>
          <div className="text-[10px] text-amber-700 mt-1">Pending client review</div>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-blue-500 mb-2">
            <span className="text-[11px] font-mono uppercase">Viewed</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-blue-900">{viewedCount}</div>
          <div className="text-[10px] text-blue-700 mt-1">In client evaluation</div>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-500 mb-2">
            <span className="text-[11px] font-mono uppercase">Submitted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-900">{submittedCount}</div>
          <div className="text-[10px] text-emerald-700 mt-1">Ready for proposal draft</div>
        </div>
      </div>

      {/* Interactive Table Client */}
      <ChecklistInvitationsClient initialInvitations={list} />
    </div>
  );
}
