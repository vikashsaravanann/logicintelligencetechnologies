import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffNotificationsPage() {
  const ctx = await requireStaffPortal("/staff/notifications");

  const { data: events } = await supabaseAdmin
    .from("staff_workspace_events")
    .select("id, event_key, details, created_at")
    .eq("workspace_id", ctx.workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
      <p className="text-sm text-slate-600">Workspace activity and client alerts for your account.</p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {!events || events.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No notifications yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {events.map((e) => {
              const d = (e.details || {}) as Record<string, string>;
              return (
                <li key={e.id} className="px-4 py-3 text-sm">
                  <p className="font-medium text-slate-900">{e.event_key}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(e.created_at).toLocaleString()}
                    {d.preview ? ` · ${d.preview}` : ""}
                    {d.client_email ? ` · ${d.client_email}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
