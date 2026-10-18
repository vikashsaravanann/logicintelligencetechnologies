import Link from "next/link";
import { requireStaffCapability } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffQuotationsPage() {
  const ctx = await requireStaffCapability("quotation.technical_draft.create", "/staff/quotations");

  const { data: assignments } = await supabaseAdmin
    .from("staff_client_assignments")
    .select("engagement_id, can_prepare_technical_quotation, status")
    .eq("staff_user_id", ctx.userId)
    .eq("status", "active");

  const engIds = (assignments || [])
    .filter((a) => a.engagement_id && a.can_prepare_technical_quotation !== false)
    .map((a) => a.engagement_id as string);

  const { data: drafts } = await supabaseAdmin
    .from("quotation_technical_drafts")
    .select("id, draft_number, status, engagement_id, client_snapshot, prepared_by, updated_at")
    .eq("prepared_by", ctx.userId)
    .order("updated_at", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Technical Quotations</h1>
          <p className="mt-1 text-sm text-slate-600">
            Technical scope drafts only. Prices, GST and commercial terms are Super Admin controlled.
          </p>
        </div>
        <Link
          href="/staff/quotations/new"
          className="inline-flex justify-center rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white"
        >
          New technical draft
        </Link>
      </div>

      {engIds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-600">
          No assigned projects currently allow technical quotation preparation.
        </div>
      ) : (
        <p className="text-xs text-slate-500">{engIds.length} project(s) eligible for technical drafts.</p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {!drafts || drafts.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No technical drafts yet. Create one for an assigned project.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {drafts.map((d) => {
              const snap = (d.client_snapshot || {}) as { project_title?: string; company_name?: string };
              return (
                <li key={d.id}>
                  <Link href={`/staff/quotations/${d.id}`} className="block px-4 py-3 hover:bg-slate-50">
                    <p className="text-sm font-semibold text-slate-900">
                      {snap.project_title || d.draft_number || d.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {snap.company_name || "—"} · {d.status}
                      {d.updated_at ? ` · ${new Date(d.updated_at).toLocaleString()}` : ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
