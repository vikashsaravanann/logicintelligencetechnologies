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
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Active Tasks
            </span>
            <CheckSquare className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{todoCount + inProgressCount}</span>
            <span className="text-xs text-neutral-500 font-medium">({completedCount} completed)</span>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-neutral-400">{inProgressCount} in progress</span>
            <Link
              href={`/admin/workspaces/${id}/tasks`}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Assigned Engagements Card */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Client Engagements
            </span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{workspace.assignedEngagements.length}</span>
            <span className="text-xs text-emerald-400 font-medium">Technical Access</span>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Financially Redacted</span>
            <Link
              href={`/admin/workspaces/${id}/projects`}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Capabilities Card */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Module Permissions
            </span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{workspace.capabilities.length}</span>
            <span className="text-xs text-teal-400 font-medium">Active Capabilities</span>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-neutral-400 uppercase font-semibold text-[10px] tracking-wider">
              Role: {workspace.role}
            </span>
            <span className="text-neutral-500 text-[11px]">Governed by RLS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Tasks & Engagements Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Tasks Card */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Assigned Technical Tasks</h2>
              </div>
              <Link
                href={`/admin/workspaces/${id}/tasks`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-black/20 p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-neutral-500 mx-auto" />
                <p className="text-xs text-neutral-400 font-semibold">No tasks currently assigned</p>
                <p className="text-[11px] text-neutral-500">
                  New tasks assigned by supervisors or created directly will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-white/5 bg-black/30 hover:border-white/10 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-bold text-white truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-[11px] text-neutral-400 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          task.priority === "urgent"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : task.priority === "high"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 capitalize">
                        {task.state.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Client Engagements Preview */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">Assigned Client Engagements</h2>
              </div>
              <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider">
                Strict Technical Scope
              </span>
            </div>

            {workspace.assignedEngagements.length === 0 ? (
              <div className="rounded-xl border border-white/5 bg-black/20 p-8 text-center space-y-2">
                <Briefcase className="w-8 h-8 text-neutral-500 mx-auto" />
                <p className="text-xs text-neutral-400 font-semibold">No client engagements currently assigned</p>
                <p className="text-[11px] text-neutral-500">
                  Super Admin assigns delivery engineers and technical leads to specific engagements.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {workspace.assignedEngagements.map((eng) => (
                  <div
                    key={eng.assignmentId}
                    className="p-4 rounded-xl border border-white/5 bg-black/30 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-white">{eng.clientName}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Assigned Role: <span className="text-neutral-200 capitalize">{eng.assignmentRole.replace("_", " ")}</span>
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Assigned
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 text-[10px]">
                      {eng.canViewTechnicalStages && (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          ✓ Technical Stages
                        </span>
                      )}
                      {eng.canPrepareTechnicalQuotation && (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                          ✓ Quote Drafting (Non-Monetary)
                        </span>
                      )}
                      {eng.canPrepareInvoiceRequest && (
                        <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
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
          <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-white/10 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" /> Employee Profile
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-neutral-500 text-[11px]">Full Name</p>
                <p className="font-bold text-white mt-0.5">{workspace.fullName}</p>
              </div>

              <div>
                <p className="text-neutral-500 text-[11px]">Official Corporate Email</p>
                <p className="font-mono text-neutral-200 mt-0.5 break-all">{workspace.email}</p>
              </div>

              <div>
                <p className="text-neutral-500 text-[11px]">Department</p>
                <p className="font-semibold text-white mt-0.5">{workspace.department}</p>
              </div>

              <div>
                <p className="text-neutral-500 text-[11px]">Working Role / Title</p>
                <p className="font-semibold text-blue-400 mt-0.5">{workspace.jobTitle}</p>
              </div>

              <div>
                <p className="text-neutral-500 text-[11px]">System Baseline Role</p>
                <p className="font-mono uppercase font-bold text-emerald-400 mt-0.5">
                  {workspace.role}
                </p>
              </div>
            </div>
          </div>

          {/* Module Capabilities Card */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-white/10 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" /> Authorized Capabilities
            </h2>

            {workspace.capabilities.length === 0 ? (
              <p className="text-xs text-neutral-500">No explicit capabilities assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {workspace.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-white/5"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Governance & Privacy Card */}
          <div className="rounded-2xl border border-white/5 bg-black/40 p-5 space-y-2 text-xs text-neutral-400">
            <div className="flex items-center gap-2 text-neutral-300 font-bold">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Data Protection Policy</span>
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
