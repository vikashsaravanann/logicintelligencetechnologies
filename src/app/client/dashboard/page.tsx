import { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  Receipt,
  HelpCircle,
  PlusCircle,
  Calendar,
  ArrowRight,
  ShieldCheck,
  FolderOpen,
  Clock,
  Sparkles,
} from "lucide-react";
import { getPortalContext, listOwnRows } from "@/lib/client-portal/data";
import { formatINR, formatIST } from "@/lib/format/datetime";

export const metadata: Metadata = {
  title: "Executive Dashboard | Client Portal | Logic Intelligence Technologies",
  description: "Real-time engineering progress, milestone telemetry, and billing overview.",
};

export const revalidate = 0;

export default async function ClientDashboardPage() {
  const portal = await getPortalContext("/client/dashboard");
  const [projects, invoices, tickets, files] = await Promise.all([
    listOwnRows(portal, "projects", 4),
    listOwnRows(portal, "invoices", 4),
    listOwnRows(portal, "support_tickets", 4),
    listOwnRows(portal, "client_files", 4),
  ]);

  const activeProjects = projects?.filter((p) => p.status !== "Completed") || [];
  const pendingInvoices = invoices?.filter((i) => i.status === "Pending") || [];
  const openTickets = tickets?.filter((t) => t.status === "Open" || t.status === "In Progress") || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 font-mono">
              Workspace Active
            </span>
            <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Welcome, {portal.user.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
            Client Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Real-time engineering telemetry, milestone delivery timelines, and billing status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/client/support"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs tracking-wide shadow-2xs transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <span>New Ticket</span>
          </Link>
          <Link
            href="/book-consultation"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white font-semibold text-xs tracking-wide shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4 text-cyan-300" />
            <span>Book Review Call</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Projects */}
        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] font-mono">
              Active Projects
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
            {activeProjects.length}
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            <span>In active sprint execution</span>
          </p>
        </div>

        {/* Pending Invoices */}
        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] font-mono">
              Pending Invoices
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
            {pendingInvoices.length}
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Awaiting milestone sign-off</span>
          </p>
        </div>

        {/* Open Tickets */}
        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] font-mono">
              Support Tickets
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
            {openTickets.length}
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span>Active queue & SLA</span>
          </p>
        </div>

        {/* Vault Documents */}
        <div className="p-6 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] font-mono">
              Vault Documents
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-200">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
            {files?.length || 0}
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Encrypted specifications & NDAs</span>
          </p>
        </div>
      </div>

      {/* Main Content Grid: Projects & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Projects (8 Cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)]">
                <Briefcase className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins uppercase tracking-wider">
                  Current Sprints & Engagements
                </h2>
                <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                  Active milestones and deployment velocity.
                </p>
              </div>
            </div>
            <Link
              href="/client/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-navy,#0B2545)] transition-colors"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {activeProjects.length > 0 ? (
              activeProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)]/60 border border-[var(--lit-border-light,#DFE7EF)] space-y-3.5 hover:border-[var(--lit-teal,#1FA9A2)]/40 hover:bg-white transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[var(--lit-navy,#0B2545)] font-poppins">
                        {proj.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
                          ID: {proj.project_code || proj.id.slice(0, 8)}
                        </span>
                        {proj.tier && (
                          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)]">
                            {proj.tier}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200">
                      {proj.status}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] mb-1.5 font-mono">
                      <span>Milestone Progress</span>
                      <span className="font-bold text-[var(--lit-navy,#0B2545)]">
                        {proj.progress ?? 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--lit-teal,#1FA9A2)] to-[var(--lit-blue,#1565C0)] transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(Math.max(proj.progress || 0, 0), 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-[var(--lit-text-muted,#52677C)]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
                      <span>Updated {proj.updated_at ? formatIST(proj.updated_at, "date") : "Recently"}</span>
                    </span>
                    <Link
                      href={`/client/projects/${proj.id}`}
                      className="font-semibold text-[var(--lit-navy,#0B2545)] hover:text-[var(--lit-teal,#1FA9A2)] transition-colors inline-flex items-center gap-1"
                    >
                      <span>Milestone Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center rounded-2xl border border-dashed border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/40">
                <FolderOpen className="w-10 h-10 text-[var(--lit-text-muted,#52677C)]/60 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                  No active projects currently assigned
                </p>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1 max-w-sm mx-auto">
                  New project scopes appear here once onboarding intake and statement of work are finalized.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Invoices (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                  <Receipt className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins uppercase tracking-wider">
                  Billing Overview
                </h2>
              </div>
              <Link
                href="/client/invoices"
                className="text-xs font-semibold text-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-navy,#0B2545)] transition-colors"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {invoices && invoices.length > 0 ? (
                invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)]/60 border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs hover:bg-white hover:border-[var(--lit-border-light,#DFE7EF)] transition-all shadow-2xs"
                  >
                    <div>
                      <p className="font-bold text-[var(--lit-navy,#0B2545)] font-mono">
                        {inv.invoice_code || `INV-${inv.id.slice(0, 6)}`}
                      </p>
                      <p className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
                        Due: {inv.due_date ? formatIST(inv.due_date, "date") : "Upon Receipt"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[var(--lit-navy,#0B2545)] font-mono">
                        {formatINR(inv.amount)}
                      </p>
                      <span
                        className={`inline-block mt-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          inv.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[var(--lit-text-muted,#52677C)] rounded-2xl bg-[var(--lit-cloud,#F7F9FC)]/40 border border-dashed border-[var(--lit-border-light,#DFE7EF)]">
                  No billing statements currently recorded.
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--lit-border-light,#DFE7EF)]">
            <div className="rounded-2xl bg-teal-50/60 border border-teal-200 p-4 text-xs text-teal-900 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-teal-950">
                <ShieldCheck className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                <span>GST Compliant Invoicing</span>
              </div>
              <p className="text-[11px] text-teal-900/80">
                All statements carry verifiable digital signatures and tax credits compliant with Indian regulatory statutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
