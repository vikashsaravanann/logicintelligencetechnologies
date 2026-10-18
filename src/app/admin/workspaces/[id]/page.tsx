import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getStaffWorkspace } from "@/lib/workspaces/service";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  CheckSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import AssignProjectsButton from "@/app/admin/workspaces/components/AssignProjectsButton";

export const metadata: Metadata = {
  title: "Staff Workspace Overview | Admin | Logic Intelligence Technologies",
  description: "Employee private administration portal and task dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Ordinary staff who own this workspace must use the independent /staff portal
  // rather than the Admin Command Center chrome.
  const { getStaffSession } = await import("@/lib/auth/session");
  const { getSelfStaffWorkspace } = await import("@/lib/workspaces/service");
  const softSession = await getStaffSession();
  if (softSession && softSession.role !== "super_admin") {
    const self = await getSelfStaffWorkspace(softSession.userId);
    if (self.hasActiveWorkspace && self.workspaceId === id) {
      redirect("/staff/dashboard");
    }
  }

  const session = await requireCapabilityPage("dashboard.view", `/admin/workspaces/${id}`);

  let workspace;
  try {
    workspace = await getStaffWorkspace(id, session.userId);
  } catch (err: any) {
    if (err?.message?.includes("NOT_FOUND")) notFound();
    if (err?.message?.includes("FORBIDDEN")) {
      redirect("/admin/forbidden?need=workspace_ownership_or_super_admin");
    }
    throw err;
  }

  const tasks = workspace.tasks || [];
  const todoCount = tasks.filter((t) => t.state === "todo").length;
  const inProgressCount = tasks.filter((t) => t.state === "in_progress").length;
  const completedCount = tasks.filter((t) => t.state === "completed").length;

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Tasks Card */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Active Tasks
            </span>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono">
              {todoCount + inProgressCount}
            </span>
            <span className="text-xs text-[var(--lit-text-muted,#52677C)] font-medium">({completedCount} completed)</span>
          </div>
          <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
            <span className="text-[var(--lit-text-muted,#52677C)]">{inProgressCount} in progress</span>
            <Link
              href={`/admin/workspaces/${id}/tasks`}
              className="text-[var(--lit-teal,#1FA9A2)] hover:underline font-bold text-xs uppercase tracking-wider flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Assigned Engagements Card */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Client Engagements
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono">
              {workspace.assignedEngagements.length}
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Technical Access
            </span>
          </div>
          <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
            <span className="text-[var(--lit-text-muted,#52677C)]">Financially Redacted</span>
            <Link
              href={`/admin/workspaces/${id}/projects`}
              className="text-indigo-700 hover:underline font-bold text-xs uppercase tracking-wider flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Capabilities Card */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
              Module Permissions
            </span>
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[var(--lit-navy,#0B2545)] font-mono">
              {workspace.capabilities.length}
            </span>
            <span className="text-xs text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Active Capabilities
            </span>
          </div>
          <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs">
            <span className="text-[var(--lit-text-muted,#52677C)] uppercase font-bold text-[10px] tracking-wider">
              Role: {workspace.role}
            </span>
            <span className="text-slate-400 text-[11px]">Governed by RLS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Tasks & Engagements Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Tasks Card */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
                  <CheckSquare className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Assigned Technical Tasks</h2>
              </div>
              <Link
                href={`/admin/workspaces/${id}/tasks`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-[var(--lit-navy,#0B2545)] font-bold">No tasks currently assigned</p>
                <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                  New tasks assigned by supervisors or created directly will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] hover:bg-slate-100 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-bold text-[var(--lit-navy,#0B2545)] truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === "urgent"
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : task.priority === "high"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-200"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] capitalize">
                        {task.state.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Client Engagements Preview */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
                  <Briefcase className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)]">Assigned Client Engagements</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[11px] text-[var(--lit-text-muted,#52677C)] font-bold uppercase tracking-wider">
                  Strict Technical Scope
                </span>
                {session.role === "super_admin" && (
                  <AssignProjectsButton
                    workspaceId={id}
                    staffUserId={workspace.ownerUserId}
                    staffEmail={workspace.email}
                    staffName={workspace.fullName}
                    variant="header"
                  />
                )}
              </div>
            </div>

            {workspace.assignedEngagements.length === 0 ? (
              <div className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-8 text-center space-y-3">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-[var(--lit-navy,#0B2545)] font-bold">No client engagements currently assigned</p>
                <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                  Super Admin assigns delivery engineers and technical leads to specific engagements.
                </p>
                {session.role === "super_admin" && (
                  <div className="pt-2">
                    <AssignProjectsButton
                      workspaceId={id}
                      staffUserId={workspace.ownerUserId}
                      staffEmail={workspace.email}
                      staffName={workspace.fullName}
                      variant="primary"
                      label="Assign First Project"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {workspace.assignedEngagements.map((eng) => (
                  <div
                    key={eng.assignmentId}
                    className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">{eng.clientName}</p>
                        <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-0.5">
                          Assigned Role: <span className="text-[var(--lit-navy,#0B2545)] font-semibold capitalize">{eng.assignmentRole.replace("_", " ")}</span>
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-[var(--lit-blue,#1565C0)] border border-blue-200">
                        Assigned
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-wrap gap-2 text-[10px]">
                      {eng.canViewTechnicalStages && (
                        <span className="px-2 py-0.5 rounded bg-white text-[var(--lit-navy,#0B2545)] border border-[var(--lit-border-light,#DFE7EF)] font-medium">
                          ✓ Technical Stages
                        </span>
                      )}
                      {eng.canPrepareTechnicalQuotation && (
                        <span className="px-2 py-0.5 rounded bg-white text-[var(--lit-navy,#0B2545)] border border-[var(--lit-border-light,#DFE7EF)] font-medium">
                          ✓ Quote Drafting (Non-Monetary)
                        </span>
                      )}
                      {eng.canPrepareInvoiceRequest && (
                        <span className="px-2 py-0.5 rounded bg-white text-[var(--lit-navy,#0B2545)] border border-[var(--lit-border-light,#DFE7EF)] font-medium">
                          ✓ Milestone Delivery Requests
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Employee Profile & Capabilities */}
        <div className="space-y-6">
          {/* Employee Identity Card */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
              <span className="p-1 rounded bg-blue-50 border border-blue-200 text-[var(--lit-blue,#1565C0)]">
                <User className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Employee Profile
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[var(--lit-text-muted,#52677C)] text-[11px] font-medium">Full Name</p>
                <p className="font-bold text-[var(--lit-navy,#0B2545)] mt-0.5">{workspace.fullName}</p>
              </div>

              <div>
                <p className="text-[var(--lit-text-muted,#52677C)] text-[11px] font-medium">Official Corporate Email</p>
                <p className="font-mono text-[var(--lit-navy,#0B2545)] font-semibold mt-0.5 break-all">{workspace.email}</p>
              </div>

              <div>
                <p className="text-[var(--lit-text-muted,#52677C)] text-[11px] font-medium">Department</p>
                <p className="font-semibold text-[var(--lit-navy,#0B2545)] mt-0.5">{workspace.department}</p>
              </div>

              <div>
                <p className="text-[var(--lit-text-muted,#52677C)] text-[11px] font-medium">Working Role / Title</p>
                <p className="font-bold text-[var(--lit-blue,#1565C0)] mt-0.5">{workspace.jobTitle}</p>
              </div>

              <div>
                <p className="text-[var(--lit-text-muted,#52677C)] text-[11px] font-medium">System Baseline Role</p>
                <p className="font-mono uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                  {workspace.role}
                </p>
              </div>
            </div>
          </div>

          {/* Module Capabilities Card */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
              <span className="p-1 rounded bg-teal-50 border border-teal-200 text-[var(--lit-teal,#1FA9A2)]">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                Authorized Capabilities
              </h2>
            </div>

            {workspace.capabilities.length === 0 ? (
              <p className="text-xs text-[var(--lit-text-muted,#52677C)]">No explicit capabilities assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {workspace.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] border border-[var(--lit-border-light,#DFE7EF)]"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Governance & Privacy Card */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-2 text-xs text-amber-900 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-950 font-bold">
              <Lock className="w-4 h-4 text-amber-700" />
              <span className="uppercase text-[11px] tracking-wider">Data Protection Policy</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Access to client bank reconciliation, quotation pricing, invoice issuance, and platform secrets is reserved strictly for Super Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
