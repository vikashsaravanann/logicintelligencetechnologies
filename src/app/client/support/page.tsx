import { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/navigation/back-button";
import {
  Plus,
  ArrowRight,
  Headphones,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Calendar,
  FolderOpen,
  MessageSquare,
} from "lucide-react";
import { getPortalContext, listOwnRows } from "@/lib/client-portal/data";
import { formatIST } from "@/lib/format/datetime";

export const metadata: Metadata = {
  title: "Support Desk | Client Portal | Logic Intelligence Technologies",
  description: "Track bug reports, engineering requests, and enterprise resolution SLAs.",
};

export const revalidate = 0;

export default async function ClientSupportPage() {
  const portal = await getPortalContext("/client/support");
  const tickets = await listOwnRows(portal, "support_tickets");

  const totalTickets = tickets?.length || 0;
  const openTickets = tickets?.filter((t) => t.status === "Open" || t.status === "In Progress") || [];
  const resolvedTickets = tickets?.filter((t) => t.status === "Resolved" || t.status === "Closed") || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <BackButton fallbackHref="/client/dashboard" label="Back to Dashboard" inline />
      </div>

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 font-mono">
              Enterprise Support Desk
            </span>
            <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
              {portal.user.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
            Support Desk &amp; SLA Tracking
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Submit defects, request sprint change orders, and track engineering resolution SLAs in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/support/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-cyan-300" />
            <span>Open New Ticket</span>
          </Link>
        </div>
      </div>

      {/* KPI Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Total Requests</span>
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
            {totalTickets}
          </div>
          <p className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
            Lifetime incident tickets
          </p>
        </div>

        {/* In-Flight Tickets */}
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Active / In-Flight</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-poppins">
            {openTickets.length}
          </div>
          <p className="text-[10px] text-amber-600 mt-0.5 font-medium">
            Engineering team engaged
          </p>
        </div>

        {/* Resolved Tickets */}
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Resolved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-poppins">
            {resolvedTickets.length}
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">
            Completed &amp; verified
          </p>
        </div>

        {/* SLA Guarantee */}
        <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
            <span>Target Response</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)] font-mono mt-0.5">
            &lt; 2 Hours
          </div>
          <p className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
            Enterprise Tier SLA
          </p>
        </div>
      </div>

      {/* Tickets List Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              Incident &amp; Inquiry Queue
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Row-Level Security isolated ticket records for your organization.
            </p>
          </div>
          <span className="text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
            {totalTickets} {totalTickets === 1 ? "ticket" : "tickets"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-[11px] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              <tr>
                <th className="py-3.5 px-6">Ticket Subject &amp; Scope</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Created Timestamp</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {tickets && tickets.length > 0 ? (
                tickets.map((t) => {
                  const isOpen = t.status === "Open";
                  const isInProgress = t.status === "In Progress";
                  const isResolved = t.status === "Resolved" || t.status === "Closed";

                  const statusClass = isOpen
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : isInProgress
                      ? "bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border-teal-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200";

                  return (
                    <tr key={t.id} className="hover:bg-[var(--lit-cloud,#F7F9FC)]/60 transition-colors">
                      <td className="py-4 px-6 max-w-md">
                        <Link
                          href={`/support/${t.id}`}
                          className="font-bold text-[var(--lit-navy,#0B2545)] hover:underline block truncate"
                        >
                          {t.subject}
                        </Link>
                        {t.message && (
                          <p className="text-xs text-[var(--lit-text-muted,#52677C)] truncate mt-0.5">
                            {t.message}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${statusClass}`}
                        >
                          {isResolved ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{t.status || "Open"}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-[var(--lit-text-muted,#52677C)] font-mono">
                        {t.created_at ? formatIST(t.created_at, "datetime") : "—"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/support/${t.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[var(--lit-teal,#1FA9A2)] hover:text-teal-700 text-xs font-bold border border-teal-200 transition-colors"
                        >
                          <span>Discussion</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-14 px-6 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 flex items-center justify-center mx-auto">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                        No Active Support Tickets
                      </h3>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                        All client deliverables and infrastructure pipelines are running smoothly. If you require architectural assistance, our squad is ready.
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/support/new"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 shadow-2xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Submit Ticket</span>
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

      {/* Enterprise SLA Tiers Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-7 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
            Enterprise Resolution Service-Level Commitments (SLA)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
            <span className="font-mono uppercase font-bold text-[10px] text-rose-700 block">
              Sev-1: Blocker
            </span>
            <p className="font-bold text-[var(--lit-navy,#0B2545)] font-mono">&lt; 1 Hour Response</p>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Complete production outage or critical security hazard
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
            <span className="font-mono uppercase font-bold text-[10px] text-amber-700 block">
              Sev-2: Major
            </span>
            <p className="font-bold text-[var(--lit-navy,#0B2545)] font-mono">&lt; 2 Hours Response</p>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Core capability degradation with workaround available
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
            <span className="font-mono uppercase font-bold text-[10px] text-blue-700 block">
              Sev-3: Minor
            </span>
            <p className="font-bold text-[var(--lit-navy,#0B2545)] font-mono">&lt; 4 Hours Response</p>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              Cosmetic glitch, minor bug, or small feature tweak
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
            <span className="font-mono uppercase font-bold text-[10px] text-slate-700 block">
              Sev-4: Advisory
            </span>
            <p className="font-bold text-[var(--lit-navy,#0B2545)] font-mono">&lt; 24 Hours Response</p>
            <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
              General technical advisory or scoping question
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
