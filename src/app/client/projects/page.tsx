import { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/navigation/back-button";
import {
  Briefcase,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Layers,
  PlusCircle,
  FolderOpen,
} from "lucide-react";
import { getPortalContext, listOwnRows } from "@/lib/client-portal/data";
import { formatINR, formatIST } from "@/lib/format/datetime";

export const metadata: Metadata = {
  title: "Projects & Sprints | Client Portal | Logic Intelligence Technologies",
  description: "Real-time engineering progress, milestone telemetry, and sprint delivery tracking.",
};

export const revalidate = 0;

export default async function ClientProjectsPage() {
  const portal = await getPortalContext("/client/projects");
  const projects = await listOwnRows(portal, "projects");

  const totalProjects = projects?.length || 0;
  const inProgressProjects = projects?.filter((p) => (p.progress ?? 0) < 100 && p.status !== "Completed").length || 0;
  const completedProjects = projects?.filter((p) => (p.progress ?? 0) === 100 || p.status === "Completed").length || 0;
  const totalValue = projects?.reduce((acc, p) => acc + (Number(p.value) || 0), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <BackButton fallbackHref="/client/dashboard" label="Back to Dashboard" inline />
      </div>

      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 font-mono">
              Delivery Telemetry
            </span>
            <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
              {portal.user.email}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
            Assigned Projects & Sprints
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Real-time sprint progression, milestone verification, and continuous delivery metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/client/support"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs tracking-wide shadow-2xs transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Open Ticket</span>
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

      {/* Summary KPI Strip */}
      {totalProjects > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
              <span>Total SOWs</span>
              <Layers className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              {totalProjects}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
              <span>Active Sprints</span>
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 font-poppins">
              {inProgressProjects}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
              <span>Completed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-poppins">
              {completedProjects}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs">
            <div className="flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] font-mono mb-1">
              <span>Committed Value</span>
              <Briefcase className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins truncate">
              {formatINR(totalValue)}
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects && projects.length > 0 ? (
          projects.map((p) => {
            const isDone = (p.progress ?? 0) === 100 || p.status === "Completed";
            const statusStyle = isDone
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : p.status === "In Progress" || p.status === "Active"
                ? "bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border-teal-200"
                : "bg-blue-50 text-blue-700 border-blue-200";

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-[var(--lit-navy,#0B2545)] border border-slate-200">
                        {p.project_code || "PRJ-LIT"}
                      </span>
                      <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] font-poppins mt-2 tracking-tight">
                        {p.name}
                      </h3>
                      {p.client_name && (
                        <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                          Client: <span className="font-medium text-[var(--lit-ink,#121826)]">{p.client_name}</span>
                        </p>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border font-mono ${statusStyle}`}>
                      {p.status || "In Progress"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--lit-text-muted,#52677C)] font-medium">Sprint Completion</span>
                      <span className="font-bold text-[var(--lit-navy,#0B2545)] font-mono">{p.progress ?? 0}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[var(--lit-cloud,#F7F9FC)] border border-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--lit-teal,#1FA9A2)] to-[var(--lit-blue,#1565C0)] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, p.progress ?? 0))}%` }}
                      />
                    </div>
                  </div>

                  {/* Telemetry Pills */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--lit-text-muted,#52677C)] font-mono block">
                        Contract Value
                      </span>
                      <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] font-mono mt-0.5 block">
                        {formatINR(p.value)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--lit-text-muted,#52677C)] font-mono block">
                        Target Delivery
                      </span>
                      <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] mt-0.5 block truncate">
                        {p.due_date ? formatIST(p.due_date, "date") : "Continuous Sprint"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs mt-4">
                  <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Updated {p.created_at ? formatIST(p.created_at, "date") : "Active"}</span>
                  </span>
                  <Link
                    href={`/client/projects/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--lit-teal,#1FA9A2)] hover:text-teal-700 bg-teal-50 hover:bg-teal-100/80 border border-teal-200 transition-colors"
                  >
                    <span>Sprint Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-12 text-center shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                No Projects Assigned Yet
              </h3>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1 max-w-md mx-auto">
                Your enterprise tenant workspace is active. Once an engineering statement of work is initialized, milestone telemetry will stream here in real time.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/book-consultation"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white font-semibold text-xs transition-colors shadow-2xs"
              >
                <Calendar className="w-4 h-4 text-cyan-300" />
                <span>Schedule Consultation</span>
              </Link>
              <Link
                href="/client/support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                <span>Contact Engineering</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
