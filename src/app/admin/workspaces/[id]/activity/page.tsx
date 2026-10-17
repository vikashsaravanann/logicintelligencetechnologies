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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" /> Immutable Workspace Activity Trail
          </h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
            Security audit log of lifecycle events, access checks, and administrative updates.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-[var(--lit-text-muted,#52677C)] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          Total Events: {eventList.length}
        </span>
      </div>

      {eventList.length === 0 ? (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-12 text-center space-y-3 shadow-2xs">
          <Activity className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">No activity events recorded yet</h3>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-sm mx-auto">
            Audit logs are recorded automatically as workspace provisioning, authentication, and task operations occur.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-2xs">
          <div className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
            {eventList.map((ev) => (
              <div key={ev.id} className="p-4.5 hover:bg-[var(--lit-cloud,#F7F9FC)]/50 transition-colors flex items-start gap-4">
                <div className="p-2 rounded-xl bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-xs font-bold font-mono text-[var(--lit-navy,#0B2545)]">
                      {ev.event_key}
                    </p>
                    <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] font-mono">
                      {formatIST(ev.created_at)}
                    </span>
                  </div>

                  {ev.details && Object.keys(ev.details).length > 0 && (
                    <div className="rounded-lg bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] p-2.5 text-[11px] font-mono text-[var(--lit-ink,#121826)] overflow-x-auto">
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
