import Link from "next/link";
import { requireStaffCapability } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffInvoicesPage() {
  const ctx = await requireStaffCapability("invoice.preparation.create", "/staff/invoices");

  const { data: rows } = await supabaseAdmin
    .from("invoice_preparation_requests")
    .select(
      "id, request_number, status, engagement_id, milestone_key, deliverable_summary, created_at, updated_at, prepared_by"
    )
    .eq("prepared_by", ctx.userId)
    .order("updated_at", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Invoice Preparation</h1>
          <p className="mt-1 text-sm text-slate-600">
            Technical completion requests only. Final GST invoices are issued solely by Super Admin.
          </p>
        </div>
        <Link
          href="/staff/invoices/new"
          className="inline-flex justify-center rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2 text-sm font-semibold text-white"
        >
          New preparation
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {!rows || rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No invoice preparation requests yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((r) => (
              <li key={r.id} className="px-4 py-3 text-sm">
                <p className="font-semibold text-slate-900">{r.request_number || r.id.slice(0, 8)}</p>
                <p className="text-xs text-slate-500">
                  {r.milestone_key || "Milestone"} · {r.status}
                  {r.updated_at ? ` · ${new Date(r.updated_at).toLocaleString()}` : ""}
                </p>
                {r.deliverable_summary ? (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">{r.deliverable_summary}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
