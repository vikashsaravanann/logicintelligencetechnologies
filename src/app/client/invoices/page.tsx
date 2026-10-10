import { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/navigation/back-button";
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { getPortalContext, listOwnRows } from "@/lib/client-portal/data";
import { formatINR, formatIST } from "@/lib/format/datetime";

export const metadata: Metadata = {
  title: "Invoices & Billing | Client Portal | Logic Intelligence Technologies",
  description: "Track milestone payments, GST invoices, settlement statuses, and accounts history.",
};

export const revalidate = 0;

export default async function ClientInvoicesPage() {
  const portal = await getPortalContext("/client/invoices");
  const invoices = await listOwnRows(portal, "invoices");

  const totalInvoices = invoices?.length || 0;
  const totalBilled = invoices?.reduce((acc, i) => acc + (Number(i.amount) || 0), 0) || 0;
  const paidInvoices = invoices?.filter((i) => i.status === "Paid") || [];
  const paidAmount = paidInvoices.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const pendingInvoices = invoices?.filter((i) => i.status !== "Paid") || [];
  const pendingAmount = pendingInvoices.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <BackButton fallbackHref="/client/dashboard" label="Back to Dashboard" inline />
      </div>

      {/* Header & Account Context */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 font-mono">
              Financial Ledger
            </span>
            <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
              {portal.user.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
            Invoices & Billing History
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Real-time milestone accounts, verified GST compliance receipts, and electronic settlement records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/client/support?subject=Billing%20Inquiry"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs tracking-wide shadow-2xs transition-all"
          >
            <Receipt className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Billing Support</span>
          </Link>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Total Invoiced</span>
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins truncate">
            {formatINR(totalBilled)}
          </div>
          <p className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
            {totalInvoices} {totalInvoices === 1 ? "invoice" : "invoices"} lifetime
          </p>
        </div>

        {/* Paid / Settled */}
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Settled to Date</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-700 font-poppins truncate">
            {formatINR(paidAmount)}
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">
            {paidInvoices.length} paid
          </p>
        </div>

        {/* Outstanding / Pending */}
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Outstanding</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-700 font-poppins truncate">
            {formatINR(pendingAmount)}
          </div>
          <p className="text-[10px] text-amber-600 mt-0.5 font-medium">
            {pendingInvoices.length} action required
          </p>
        </div>

        {/* Compliance */}
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Tax Compliance</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] font-mono mt-0.5">
            GST Verified
          </div>
          <p className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
            SAC Code 998314
          </p>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              Commercial Invoices
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Structured milestone disbursements with itemized taxation and delivery verification.
            </p>
          </div>
          <span className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
            {totalInvoices} {totalInvoices === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-[11px] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="py-3.5 px-6">Invoice ID</th>
                <th className="py-3.5 px-6">Description / SOW</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Due Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv) => {
                  const isPaid = inv.status === "Paid";
                  return (
                    <tr key={inv.id} className="hover:bg-[var(--lit-cloud,#F7F9FC)]/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[var(--lit-navy,#0B2545)] text-xs">
                        {inv.invoice_code || "INV-LIT"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-[var(--lit-ink,#121826)] block">
                          Milestone Engineering Disbursement
                        </span>
                        {inv.client_name && (
                          <span className="text-[10px] text-[var(--lit-text-muted,#52677C)]">
                            Recipient: {inv.client_name}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-[var(--lit-navy,#0B2545)] text-xs">
                        {formatINR(inv.amount)}
                      </td>
                      <td className="py-4 px-6 text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
                        {inv.due_date ? formatIST(inv.due_date, "date") : "Net 15 Days"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{inv.status || "Pending"}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Paid in Full</span>
                          </span>
                        ) : (
                          <Link
                            href={`/contact?subject=Invoice%20Settlement%20${encodeURIComponent(inv.invoice_code || inv.id)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white font-semibold text-xs shadow-2xs transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-cyan-300" />
                            <span>Settle Now</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-14 px-6 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 flex items-center justify-center mx-auto">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                        No Invoices Issued Yet
                      </h3>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                        Invoices are generated upon milestone sign-off according to the schedule in your statement of work.
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/client/projects"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-[var(--lit-teal,#1FA9A2)] hover:text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
                        >
                          <span>Review Active Sprints</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Corporate Settlement & Tax Information Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
            Remittance & Statutory Billing Information
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[var(--lit-text-muted,#52677C)]">
          <div className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
            <span className="font-mono uppercase font-bold text-[10px] text-[var(--lit-navy,#0B2545)] block mb-1">
              Beneficiary Entity
            </span>
            <p className="text-[var(--lit-ink,#121826)] font-medium">Logic Intelligence Technologies Private Limited</p>
            <p className="text-[11px] mt-0.5">Bengaluru, Karnataka, India</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
            <span className="font-mono uppercase font-bold text-[10px] text-[var(--lit-navy,#0B2545)] block mb-1">
              Electronic Transfer
            </span>
            <p className="text-[var(--lit-ink,#121826)] font-medium">NEFT / RTGS / IMPS Bank Transfer</p>
            <p className="text-[11px] mt-0.5">Wire routing provided on individual tax invoices</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
            <span className="font-mono uppercase font-bold text-[10px] text-[var(--lit-navy,#0B2545)] block mb-1">
              Direct Inquiries
            </span>
            <p className="text-[var(--lit-ink,#121826)] font-medium">accounts@logicintelligence.com</p>
            <p className="text-[11px] mt-0.5">Dispute resolution SLA: &lt; 24 business hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
