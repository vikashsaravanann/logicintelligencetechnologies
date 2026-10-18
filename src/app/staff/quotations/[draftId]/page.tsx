import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaffCapability } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffDraftDetailPage({
  params,
}: {
  params: Promise<{ draftId: string }> | { draftId: string };
}) {
  const { draftId } = await params;
  const ctx = await requireStaffCapability("quotation.technical_draft.create", `/staff/quotations/${draftId}`);

  const { data: draft } = await supabaseAdmin
    .from("quotation_technical_drafts")
    .select("*")
    .eq("id", draftId)
    .maybeSingle();

  if (!draft || (draft.prepared_by !== ctx.userId && !ctx.isSuperAdmin)) notFound();

  const snap = (draft.client_snapshot || {}) as Record<string, string>;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/staff/quotations" className="text-xs font-medium text-teal-700 hover:underline">
        ← Technical Quotations
      </Link>
      <h1 className="text-xl font-bold text-slate-900">{snap.project_title || draft.draft_number}</h1>
      <p className="text-xs text-slate-500">
        {snap.company_name} · Status: <strong>{draft.status}</strong>
      </p>
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-sm">
        <div>
          <p className="text-xs font-semibold text-slate-500">Scope</p>
          <p className="whitespace-pre-wrap text-slate-800">{draft.scope_summary || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">Architecture</p>
          <p className="whitespace-pre-wrap text-slate-800">{draft.architecture_notes || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500">Timeline</p>
          <p className="whitespace-pre-wrap text-slate-800">{draft.timeline_notes || "—"}</p>
        </div>
        <p className="text-xs text-slate-500">
          Commercial pricing is not editable here. Submit review is handled through Super Admin quotation workflow.
        </p>
      </section>
    </div>
  );
}
