import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ListChecks,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  FileText,
  Building2,
  Calendar,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdminBackLink } from "../../components/AdminBackLink";
import { ENTERPRISE_CHECKPOINTS, ENTERPRISE_PHASES } from "@/data/enterpriseDeploymentChecklist";
import { ChecklistDetailActions } from "./checklist-detail-actions";

export const metadata: Metadata = {
  title: "Checklist Review & Scope Detail | Admin | Logic Intelligence Technologies",
  description: "Technical discovery review and proposal drafting from client checklist selections.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChecklistInvitationDetailPage({ params }: Props) {
  await requireCapabilityPage("checklists.read", "/admin/checklist-invitations");
  const { id } = await params;

  const { data: inv, error } = await supabaseAdmin
    .from("enterprise_checklist_invitations")
    .select(`
      id, recipient_name, recipient_email, recipient_company, status,
      expires_at, sent_at, sent_count, viewed_at, submitted_at, revoked_at,
      proposal_id, internal_notes, created_at,
      enterprise_checklist_responses(
        id, confirmation_reference, selected_count, client_notes, submitted_at,
        enterprise_checklist_reviews(review_status, internal_notes, reviewed_at),
        enterprise_checklist_response_items(point_number)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !inv) {
    notFound();
  }

  const response = (inv.enterprise_checklist_responses as any)?.[0] || inv.enterprise_checklist_responses;
  const review = response?.enterprise_checklist_reviews?.[0] || response?.enterprise_checklist_reviews;
  const selectedPointNumbers: number[] = (response?.enterprise_checklist_response_items || []).map(
    (item: any) => item.point_number
  );

  const selectedSet = new Set(selectedPointNumbers);
  const selectedCheckpoints = ENTERPRISE_CHECKPOINTS.filter((c) => selectedSet.has(c.number));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/checklist-invitations" label="Checklist Registry" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#B9DCFF] bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <ListChecks className="w-3 h-3" />
              SOP Requirements Intake
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              Status: {inv.status.toUpperCase()}
            </span>
          </div>
          <h1 className="mt-2 font-poppins text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            {inv.recipient_company || inv.recipient_name}
          </h1>
          <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
            {inv.recipient_email} · Issued: {new Date(inv.created_at).toLocaleDateString()}
          </p>
        </div>

        {inv.proposal_id && (
          <Link
            href={`/admin/proposals/${inv.proposal_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold hover:bg-purple-100 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Open Linked Proposal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs space-y-1">
          <span className="font-mono text-[10px] uppercase font-bold text-[var(--lit-text-muted,#52677C)] block">
            Submission Telemetry
          </span>
          <span className="text-xl font-mono font-extrabold text-[var(--lit-navy,#0B2545)] block">
            {response ? `${response.selected_count} / 50 Selected` : "Awaiting Client"}
          </span>
          {response && (
            <span className="text-[11px] font-mono text-[var(--lit-blue,#1565C0)] block">
              Ref: {response.confirmation_reference}
            </span>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs space-y-1">
          <span className="font-mono text-[10px] uppercase font-bold text-[var(--lit-text-muted,#52677C)] block">
            Client Interaction Lifecycle
          </span>
          <div className="text-[11px] text-[var(--lit-navy,#0B2545)] space-y-0.5">
            <div>Sent: {inv.sent_at ? new Date(inv.sent_at).toLocaleDateString() : "Not sent yet"} ({inv.sent_count}x)</div>
            <div>Viewed: {inv.viewed_at ? new Date(inv.viewed_at).toLocaleDateString() : "Not viewed yet"}</div>
            <div>Submitted: {inv.submitted_at ? new Date(inv.submitted_at).toLocaleDateString() : "Not submitted"}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs space-y-1">
          <span className="font-mono text-[10px] uppercase font-bold text-[var(--lit-text-muted,#52677C)] block">
            Security & Validity
          </span>
          <span className="text-xs font-semibold text-emerald-700 block">
            Cryptographic SHA-256 Digest
          </span>
          <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] block">
            Expires: {new Date(inv.expires_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Interactive Actions (Email, WhatsApp, Proposal Draft, Review Notes) */}
      <ChecklistDetailActions
        invitationId={inv.id}
        recipientName={inv.recipient_name}
        recipientEmail={inv.recipient_email}
        company={inv.recipient_company}
        status={inv.status}
        selectedCount={selectedPointNumbers.length}
        proposalId={inv.proposal_id}
        initialReviewNotes={review?.internal_notes || inv.internal_notes}
      />

      {/* Client Notes if submitted */}
      {response?.client_notes && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-2xs text-xs space-y-1.5">
          <span className="font-mono font-bold uppercase tracking-wider text-blue-900 block text-[11px]">
            Client Notes & Priorities
          </span>
          <p className="text-[var(--lit-navy,#0B2545)] leading-relaxed whitespace-pre-wrap">
            {response.client_notes}
          </p>
        </div>
      )}

      {/* Selected Checkpoints Breakdown */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <h2 className="font-poppins font-bold text-base text-[var(--lit-navy,#0B2545)]">
            Client Selected Checkpoints ({selectedPointNumbers.length} of 50)
          </h2>
          <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
            Grouped by 8 SDLC Phases
          </span>
        </div>

        {selectedPointNumbers.length === 0 ? (
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] py-8 text-center">
            The client has not submitted their selections yet.
          </p>
        ) : (
          <div className="space-y-6">
            {ENTERPRISE_PHASES.map((phase) => {
              const phaseSelected = selectedCheckpoints.filter((c) => c.phase === phase.phase);
              if (phaseSelected.length === 0) return null;

              return (
                <div key={phase.phase} className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-[var(--lit-border-light,#DFE7EF)]">
                    <span className="font-mono text-xs font-bold text-[var(--lit-blue,#1565C0)]">
                      Phase {phase.phase}: {phase.title}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--lit-text-muted,#52677C)]">
                      ({phaseSelected.length} selected)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {phaseSelected.map((cp) => (
                      <div
                        key={cp.number}
                        className="p-3.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/50 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--lit-navy,#0B2545)]">
                            Point {String(cp.number).padStart(2, "0")}: {cp.title}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--lit-text-muted,#52677C)]">
                            PDF Page {cp.pdf_page}
                          </span>
                        </div>
                        <p className="text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                          {cp.engineering_requirement}
                        </p>
                        <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]/60 text-[11px] text-[var(--lit-navy,#0B2545)]">
                          <strong>Acceptance:</strong> {cp.acceptance_criteria}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
