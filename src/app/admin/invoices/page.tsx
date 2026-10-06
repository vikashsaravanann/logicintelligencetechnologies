import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatINR, formatIST } from "@/lib/format/datetime";
import { markInvoicePaid } from "./actions";

export const metadata: Metadata = { title: "Invoices & Billing | Admin" };
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  Paid: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  Overdue: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  Cancelled: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
};

export default async function InvoicesPage() {
  await requireCapabilityPage("invoices.read", "/admin/invoices");

  const { data, error } = await supabaseAdmin
    .from("invoices")
    .select("id, invoice_code, client_name, client_email, amount, currency, status, due_date, paid_at, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices &amp; Billing</h1>
          <p className="mt-1 text-sm text-neutral-400">Client invoices with their real payment status.</p>
        </div>
        <Link
          href="/admin/invoices/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New Invoice
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300" role="alert">
          Could not load invoices. The database query failed.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(data ?? []).map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-200">{inv.invoice_code}</td>
                  <td className="px-4 py-3 text-neutral-200">
                    {inv.client_name}
                    {inv.client_email ? <span className="block text-[11px] text-neutral-500">{inv.client_email}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-neutral-200">{formatINR(inv.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_TONE[inv.status] ?? STATUS_TONE.Cancelled}`}>
                      {inv.status}
                    </span>
                    {inv.paid_at ? <span className="block text-[10px] text-neutral-500">Paid {formatIST(inv.paid_at, "date")}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{formatIST(inv.due_date, "date")}</td>
                  <td className="px-4 py-3">
                    {inv.status === "Pending" || inv.status === "Overdue" ? (
                      <form action={markInvoicePaid}>
                        <input type="hidden" name="id" value={inv.id} />
                        <button className="rounded-lg bg-emerald-600/20 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30">
                          Mark paid
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-neutral-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-neutral-500">
                    No invoices yet. Use “New Invoice” to create the first one.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
