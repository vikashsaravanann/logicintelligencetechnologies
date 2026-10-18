import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { MarkNotificationsRead } from "./MarkNotificationsRead";

export const dynamic = "force-dynamic";

export default async function StaffNotificationsPage() {
  const ctx = await requireStaffPortal("/staff/notifications");

  const { data: notes } = await supabaseAdmin
    .from("staff_notifications")
    .select("id, event_type, title, summary, action_url, read_at, created_at, engagement_id")
    .eq("recipient_user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: events } =
    !notes || notes.length === 0
      ? await supabaseAdmin
          .from("staff_workspace_events")
          .select("id, event_key, details, created_at")
          .eq("workspace_id", ctx.workspaceId)
          .order("created_at", { ascending: false })
          .limit(30)
      : { data: null };

  const unread = (notes || []).filter((n) => !n.read_at).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-600">
            {unread > 0 ? `${unread} unread` : "All caught up"} · Project and review alerts for your account.
          </p>
        </div>
        {unread > 0 ? <MarkNotificationsRead /> : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {notes && notes.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {notes.map((n) => (
              <li key={n.id} className={`px-4 py-3 text-sm ${n.read_at ? "" : "bg-teal-50/40"}`}>
                <a
                  href={n.action_url || "/staff/dashboard"}
                  className="block hover:opacity-90"
                >
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-500">
                    {n.event_type} · {new Date(n.created_at).toLocaleString()}
                    {n.summary ? ` · ${n.summary}` : ""}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        ) : events && events.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {events.map((e) => {
              const d = (e.details || {}) as Record<string, string>;
              return (
                <li key={e.id} className="px-4 py-3 text-sm">
                  <p className="font-medium text-slate-900">{e.event_key}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(e.created_at).toLocaleString()}
                    {d.preview ? ` · ${d.preview}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-6 text-sm text-slate-500">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
