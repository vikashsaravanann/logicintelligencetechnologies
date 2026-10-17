import { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getStaffWorkspace } from "@/lib/workspaces/service";
import {
  Briefcase,
  Shield,
  ExternalLink,
  Layers,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Assigned Projects | Staff Workspace | Logic Intelligence Technologies",
  description: "Assigned client engagements and delivery responsibilities.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function WorkspaceProjectsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireCapabilityPage("dashboard.view", `/admin/workspaces/${id}/projects`);

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

  const engagements = workspace.assignedEngagements || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" /> Assigned Client Engagements
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Client projects and technical delivery assignments. Financial data is strictly redacted.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Financial Data Redacted (Policy 1)</span>
        </div>
      </div>

      {engagements.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No active client assignments</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Super Admin has not currently assigned this staff member to any client engagements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engagements.map((eng) => (
            <div
              key={eng.assignmentId}
              className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5 space-y-4 shadow-sm hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Client Assignment
                  </span>
                  <h3 className="text-base font-bold text-white truncate mt-0.5">
                    {eng.clientName}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  {eng.assignmentRole.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                  Technical Responsibilities:
                </p>
                <div className="space-y-1.5 text-neutral-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        eng.canViewTechnicalStages ? "text-emerald-400" : "text-neutral-600"
                      }`}
                    />
                    <span>
                      {eng.canViewTechnicalStages
                        ? "Authorized to inspect technical lifecycle stages"
                        : "Technical stage inspection disabled"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        eng.canPrepareTechnicalQuotation ? "text-emerald-400" : "text-neutral-600"
                      }`}
                    />
                    <span>
                      {eng.canPrepareTechnicalQuotation
                        ? "Can draft technical scope for quotations (Non-monetary)"
                        : "Quotation drafting not assigned"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${
                        eng.canPrepareInvoiceRequest ? "text-emerald-400" : "text-neutral-600"
                      }`}
                    />
                    <span>
                      {eng.canPrepareInvoiceRequest
                        ? "Can submit milestone completion invoice requests"
                        : "Milestone invoice requests disabled"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-neutral-500">
                  Ref: {eng.engagementId.slice(0, 8)}...
                </span>
                <Link
                  href={`/admin/engagements?search=${encodeURIComponent(eng.clientName)}`}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <span>Technical View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
