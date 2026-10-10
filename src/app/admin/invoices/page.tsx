import { Metadata } from "next";
import Link from "next/link";
import {
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  ExternalLink,
  X,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { requireCapabilityPage } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatINR, formatIST } from "@/lib/format/datetime";
import { AdminBackLink } from "../components/AdminBackLink";
import { markInvoicePaid } from "./actions";

export const metadata: Metadata = {
  title: "Invoices & Billing | Admin | Logic Intelligence Technologies",
  description: "Enterprise billing registry, milestone disbursements, and payment settlement records.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface InvoiceRow {
  id: string;
  invoice_code: string;
  client_name: string;
  client_email?: string | null;
  amount: number | string;
  currency: string;
  status: "Pending" | "Paid" | "Overdue" | "Cancelled" | "Draft" | "Void" | string;
  due_date?: string | null;
  paid_at?: string | null;
  created_at: string;
  description?: string | null;
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  Paid: {
    label: "Paid",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  Pending: {
    label: "Pending",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock,
  },
  Overdue: {
    label: "Overdue",
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    icon: AlertCircle,
  },
  Cancelled: {
    label: "Cancelled",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    icon: XCircle,
  },
  Draft: {
    label: "Draft",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
    icon: Clock,
  },
  Void: {
    label: "Void",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    icon: XCircle,
  },
};

type PageProps = {
  searchParams?: Promise<{ status?: string; q?: string }>;
};

export default async function InvoicesPage({ searchParams }: PageProps) {
  await requireCapabilityPage("invoices.read", "/admin/invoices");

  const resolvedParams = searchParams ? await searchParams : {};
  const statusFilter = resolvedParams.status?.trim() || "";
  const query = resolvedParams.q?.trim().toLowerCase() || "";

  const { data, error } = await supabaseAdmin
    .from("invoices")
    .select("id, invoice_code, client_name, client_email, amount, currency, status, due_date, paid_at, created_at, description")
    .order("created_at", { ascending: false })
    .limit(200);

  const invoices = ((data ?? []) as unknown) as InvoiceRow[];

  const isPastDue = (inv: InvoiceRow) => {
    if (inv.status === "Paid" || inv.status === "Cancelled" || inv.status === "Void") return false;
    if (inv.status === "Overdue") return true;
    if (!inv.due_date) return false;
    const due = new Date(inv.due_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return due < now;
  };

  const getEffectiveStatus = (inv: InvoiceRow) => {
    if (inv.status === "Paid") return "Paid";
    if (inv.status === "Cancelled" || inv.status === "Void") return inv.status;
    if (isPastDue(inv)) return "Overdue";
    return inv.status || "Pending";
  };

  // KPI Calculations
  const totalInvoiced = invoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
  const paidInvoices = invoices.filter((inv) => inv.status === "Paid");
  const collectedAmount = paidInvoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
  const overdueInvoices = invoices.filter((inv) => isPastDue(inv));
  const overdueAmount = overdueInvoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
  const pendingInvoices = invoices.filter((inv) => inv.status === "Pending" && !isPastDue(inv));
  const pendingAmount = pendingInvoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);

  // Filtered rows for the table
  const filteredInvoices = invoices.filter((inv) => {
    const effective = getEffectiveStatus(inv);
    if (statusFilter && statusFilter !== "All") {
      if (statusFilter === "Overdue" && effective !== "Overdue") return false;
      if (statusFilter === "Pending" && effective !== "Pending") return false;
      if (statusFilter === "Paid" && effective !== "Paid") return false;
      if (statusFilter === "Cancelled" && inv.status !== "Cancelled") return false;
    }
    if (query) {
      const matchCode = inv.invoice_code?.toLowerCase().includes(query);
      const matchName = inv.client_name?.toLowerCase().includes(query);
      const matchEmail = inv.client_email?.toLowerCase().includes(query);
      const matchDesc = inv.description?.toLowerCase().includes(query);
      if (!matchCode && !matchName && !matchEmail && !matchDesc) return false;
    }
    return true;
  });

  const STATUS_TABS = [
    { id: "", label: "All", count: invoices.length },
    { id: "Paid", label: "Paid", count: paidInvoices.length },
    { id: "Pending", label: "Pending", count: pendingInvoices.length },
    { id: "Overdue", label: "Overdue", count: overdueInvoices.length },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <AdminBackLink href="/admin/command-center" label="Command Center" />
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-[var(--lit-teal,#1FA9A2)] text-[10px] font-bold uppercase tracking-wider font-mono">
              <Receipt className="w-3 h-3" />
              Financial Ledger
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
              <ShieldCheck className="w-3 h-3 text-teal-600" />
              GST Compliance
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
            Invoices &amp; Billing
          </h1>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)]">
            Client accounts ledger, milestone disbursements, and real-time payment settlement records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-white font-semibold text-xs tracking-wide shadow-2xs transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lit-teal,#1FA9A2)]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* Stats / KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Total Invoiced
            </span>
            <span className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <Receipt className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-[var(--lit-navy,#0B2545)]">
              {error ? "—" : formatINR(totalInvoiced)}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"} issued
            </p>
          </div>
        </div>

        {/* Collected */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Collected
            </span>
            <span className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-emerald-700">
              {error ? "—" : formatINR(collectedAmount)}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              {paidInvoices.length} paid in full
            </p>
          </div>
        </div>

        {/* Pending */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Pending
            </span>
            <span className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-amber-700">
              {error ? "—" : formatINR(pendingAmount)}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              {pendingInvoices.length} awaiting settlement
            </p>
          </div>
        </div>

        {/* Overdue */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Overdue
            </span>
            <span className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-rose-700">
              {error ? "—" : formatINR(overdueAmount)}
            </span>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1">
              {overdueInvoices.length} past due date
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      {error ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-sm text-rose-800 shadow-2xs"
          role="alert"
        >
          <div className="flex items-center gap-2 font-bold text-rose-900 mb-1">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Database Query Error
          </div>
          Could not load invoices. The database query failed.
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs overflow-hidden">
          {/* Table Header & Controls */}
          <div className="px-6 py-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Invoices Ledger
              </h2>
              <span className="text-xs font-mono font-medium text-[var(--lit-text-muted,#52677C)]">
                ({filteredInvoices.length} {filteredInvoices.length === 1 ? "record" : "records"})
              </span>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Tabs */}
              <div className="flex items-center rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white p-0.5 text-xs">
                {STATUS_TABS.map((tab) => {
                  const isActive = statusFilter === tab.id;
                  const queryPart = query ? `&q=${encodeURIComponent(query)}` : "";
                  const href = tab.id
                    ? `/admin/invoices?status=${encodeURIComponent(tab.id)}${queryPart}`
                    : `/admin/invoices${query ? `?q=${encodeURIComponent(query)}` : ""}`;

                  return (
                    <Link
                      key={tab.label}
                      href={href}
                      className={`inline-flex items-center px-3 py-1 rounded-md font-semibold transition-all ${
                        isActive
                          ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                          : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)]"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`ml-1.5 text-[10px] font-mono rounded-full px-1.5 py-0.2 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-[var(--lit-text-muted,#52677C)]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Search Form */}
              <form method="GET" action="/admin/invoices" className="relative flex items-center">
                {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
                <Search className="absolute left-2.5 w-3.5 h-3.5 text-[var(--lit-text-muted,#52677C)] pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={resolvedParams.q ?? ""}
                  placeholder="Search invoice or client..."
                  className="h-8 w-44 sm:w-56 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white pl-8 pr-7 text-xs text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:border-[var(--lit-teal,#1FA9A2)] focus:outline-none transition-all shadow-2xs"
                />
                {query && (
                  <Link
                    href={statusFilter ? `/admin/invoices?status=${encodeURIComponent(statusFilter)}` : "/admin/invoices"}
                    className="absolute right-2 text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Link>
                )}
              </form>
            </div>
          </div>

          {/* Clean Invoices Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-[var(--lit-cloud,#F7F9FC)]/60 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] border-b border-[var(--lit-border-light,#DFE7EF)]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Invoice #</th>
                  <th className="px-6 py-3.5 font-semibold">Client Name</th>
                  <th className="px-6 py-3.5 font-semibold">Issue Date</th>
                  <th className="px-6 py-3.5 font-semibold">Due Date</th>
                  <th className="px-6 py-3.5 font-semibold">Amount</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {filteredInvoices.map((inv) => {
                  const effectiveStatus = getEffectiveStatus(inv);
                  const isInvOverdue = isPastDue(inv);
                  const cfg = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.Cancelled;
                  const StatusIcon = cfg.icon;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-[var(--lit-cloud,#F7F9FC)]/60 transition-colors group"
                    >
                      {/* Invoice Number */}
                      <td className="px-6 py-4 font-mono text-xs">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-bold text-[var(--lit-navy,#0B2545)] group-hover:border-slate-300 transition-colors">
                          {inv.invoice_code}
                        </span>
                      </td>

                      {/* Client Name */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                          {inv.client_name}
                        </div>
                        {inv.client_email && (
                          <div className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono mt-0.5">
                            {inv.client_email}
                          </div>
                        )}
                        {inv.description && (
                          <div className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5 line-clamp-1 max-w-xs">
                            {inv.description}
                          </div>
                        )}
                      </td>

                      {/* Issue Date */}
                      <td className="px-6 py-4 text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
                        {formatIST(inv.created_at, "date")}
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4 text-xs font-mono">
                        <span className={isInvOverdue ? "text-rose-700 font-bold" : "text-[var(--lit-navy,#0B2545)]"}>
                          {inv.due_date ? formatIST(inv.due_date, "date") : "Net 15"}
                        </span>
                        {isInvOverdue && (
                          <span className="block text-[10px] font-bold text-rose-600 font-mono">
                            Past Due
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-mono font-bold text-sm text-[var(--lit-navy,#0B2545)]">
                        {formatINR(inv.amount)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider font-mono ${cfg.badge}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{cfg.label}</span>
                        </span>
                        {inv.paid_at && (
                          <span className="block text-[10px] text-[var(--lit-text-muted,#52677C)] font-mono mt-0.5">
                            Paid {formatIST(inv.paid_at, "date")}
                          </span>
                        )}
                      </td>

                      {/* View Link & Action */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/contact?invoice=${encodeURIComponent(inv.invoice_code || inv.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-teal,#1FA9A2)] text-xs font-semibold shadow-2xs transition-all"
                            title="View public invoice settlement page"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
                          </Link>

                          {(inv.status === "Pending" || inv.status === "Overdue" || isInvOverdue) && inv.status !== "Paid" ? (
                            <form action={markInvoicePaid} className="inline">
                              <input type="hidden" name="id" value={inv.id} />
                              <button
                                type="submit"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold shadow-2xs transition-all"
                                title="Mark invoice as paid"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Mark paid</span>
                              </button>
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)] flex items-center justify-center mx-auto">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">
                          {query || statusFilter ? "No Matching Invoices Found" : "No Invoices Issued Yet"}
                        </h3>
                        <p className="text-xs text-[var(--lit-text-muted,#52677C)] leading-relaxed">
                          {query || statusFilter
                            ? "Try resetting your search query or selecting a different status filter tab."
                            : "Generate your first verified GST-compliant client invoice with server-generated sequencing and automated settlement tracking."}
                        </p>
                        <div className="pt-2 flex items-center justify-center gap-3">
                          {query || statusFilter ? (
                            <Link
                              href="/admin/invoices"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-xs font-bold text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] transition-all shadow-2xs"
                            >
                              Reset Filters
                            </Link>
                          ) : (
                            <Link
                              href="/admin/invoices/new"
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--lit-teal,#1FA9A2)]/90 transition-all shadow-2xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Create First Invoice</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
