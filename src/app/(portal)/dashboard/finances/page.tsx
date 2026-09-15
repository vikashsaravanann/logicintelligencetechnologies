import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DollarSign, Clock, CheckCircle, XCircle, ExternalLink, FileText } from "lucide-react";
import * as React from "react";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    paid:    { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Paid" },
    pending: { color: "text-amber-400 bg-amber-400/10 border-amber-400/20",      label: "Pending" },
    expired: { color: "text-red-400 bg-red-400/10 border-red-400/20",            label: "Expired" },
    overdue: { color: "text-red-400 bg-red-400/10 border-red-400/20",            label: "Overdue" },
  };
  const cfg = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default async function FinancesPage() {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore as any });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const totalPaid = (invoices ?? [])
    .filter((i) => i.status === "paid")
    .reduce((sum: number, i: any) => sum + (i.amount ?? 0), 0);
  const totalPending = (invoices ?? [])
    .filter((i) => i.status === "pending")
    .reduce((sum: number, i: any) => sum + (i.amount ?? 0), 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-white">Financial Dashboard</h2>
        <p className="text-zinc-500 text-sm mt-1">All invoices and payment history for your projects.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Paid", value: fmt(totalPaid), icon: CheckCircle, color: "border-emerald-400/20 text-emerald-400" },
          { label: "Outstanding", value: fmt(totalPending), icon: Clock, color: "border-amber-400/20 text-amber-400" },
          { label: "Total Invoices", value: String(invoices?.length ?? 0), icon: FileText, color: "border-primary/20 text-primary" },
        ].map((card) => (
          <div key={card.label} className={`p-6 rounded-2xl bg-white/5 border ${card.color.split(" ")[0]} flex items-center gap-4`}>
            <div className="p-2 rounded-xl bg-white/5">
              <card.icon className={`w-5 h-5 ${card.color.split(" ")[1]}`} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">{card.label}</p>
              <p className="text-2xl font-black text-white mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-white text-sm">Invoice History</h3>
        </div>
        {!invoices || invoices.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No invoices yet. Your invoices will appear here once issued.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-widest border-b border-white/5">
                  <th className="text-left px-6 py-3">Invoice #</th>
                  <th className="text-left px-6 py-3">Description</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Due Date</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(invoices ?? []).map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 font-mono text-primary text-xs">{inv.invoice_number ?? `INV-${inv.id.slice(0,6).toUpperCase()}`}</td>
                    <td className="px-6 py-4 text-zinc-300 max-w-[200px] truncate">{inv.description ?? "—"}</td>
                    <td className="px-6 py-4 font-bold text-white">{fmt(inv.amount ?? 0)}</td>
                    <td className="px-6 py-4 text-zinc-400">{inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-6 py-4"><StatusBadge status={inv.status ?? "pending"} /></td>
                    <td className="px-6 py-4">
                      {inv.status === "paid" || inv.status === "Paid" ? (
                        <span className="text-zinc-600 text-xs">Complete</span>
                      ) : inv.status === "pending" || inv.status === "Pending" ? (
                        <a href="/contact"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-black text-xs font-bold hover:opacity-90 transition-opacity">
                          Arrange payment
                        </a>
                      ) : <span className="text-zinc-600 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
