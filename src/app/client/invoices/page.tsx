import { Metadata } from "next";
import { Receipt, CheckCircle2, Clock, CreditCard, ArrowRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Invoices & Billing | Client Portal",
};

export const revalidate = 0;

export default async function ClientInvoicesPage() {
  const { data: invoices } = await supabaseAdmin
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Invoices & Billing
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Track milestone payments, download receipts, and settle outstanding balances.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4">Invoice Code</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{inv.invoice_code}</div>
                      <div className="text-[10px] text-zinc-500">Milestone Payment</div>
                    </td>
                    <td className="p-4 font-black text-white">
                      ₹{Number(inv.amount).toLocaleString()}
                    </td>
                    <td className="p-4 text-xs text-zinc-400">
                      {inv.due_date || "Net 15"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {inv.status === "Paid" ? (
                        <span className="text-xs text-zinc-500 font-semibold">Settled</span>
                      ) : (
                        <a
                          href="https://buy.stripe.com/test_placeholder"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-[0_0_10px_rgba(0,191,255,0.3)]"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-zinc-500 text-xs">
                    No invoices generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
