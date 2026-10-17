import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireCapabilityPage } from "@/lib/auth/session";
import { getStaffWorkspace } from "@/lib/workspaces/service";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { Activity, Shield, Clock, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Activity Log | Staff Workspace | Logic Intelligence Technologies",
  description: "Immutable audit trail of staff workspace events and administrative actions.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function WorkspaceActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireCapabilityPage("dashboard.view", `/admin/workspaces/${id}/activity`);

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

  // Fetch events for this workspace
  const { data: events, error } = await supabaseAdmin
    .from("staff_workspace_events")
    .select("*")
    .eq("workspace_id", id)
    .order("created_at", { ascending: false });

  const eventList = events || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" /> Immutable Workspace Activity Trail
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Security audit log of lifecycle events, access checks, and administrative updates.
          </p>
        </div>

        <span className="text-xs font-mono text-neutral-500">
          Total Events: {eventList.length}
        </span>
      </div>

      {eventList.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-12 text-center space-y-3">
          <Activity className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No activity events recorded yet</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Audit logs are recorded automatically as workspace provisioning, authentication, and task operations occur.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 overflow-hidden shadow-xl">
          <div className="divide-y divide-white/5">
            {eventList.map((ev) => (
              <div key={ev.id} className="p-4.5 hover:bg-white/[0.02] transition-colors flex items-start gap-4">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-xs font-bold font-mono text-white">
                      {ev.event_key}
                    </p>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {formatIST(ev.created_at)}
                    </span>
                  </div>

                  {ev.details && Object.keys(ev.details).length > 0 && (
                    <div className="rounded-lg bg-black/40 border border-white/5 p-2.5 text-[11px] font-mono text-neutral-300 overflow-x-auto">
                      <pre>{JSON.stringify(ev.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
