import Link from "next/link";
import { requireStaffPortal } from "@/lib/auth/staff-portal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StaffSupportPage() {
  const ctx = await requireStaffPortal("/staff/support");

  const { data: events } = await supabaseAdmin
    .from("staff_workspace_events")
    .select("id, event_key, details, created_at")
    .eq("workspace_id", ctx.workspaceId)
    .eq("event_key", "client.message.received")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support</h1>
        <p className="mt-1 text-sm text-slate-600">
          Client message alerts for your workspace. Use Messages for full conversation threads and replies.
        </p>
      </div>
      <Link
        href="/staff/messages"
        className="inline-flex rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-3 py-2 text-sm font-semibold text-white"
      >
        Open Messages inbox
      </Link>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Recent client message alerts</h2>
        {events && events.length > 0 ? (
          <ul className="mt-3 divide-y divide-slate-100">
            {events.map((e) => {
              const d = (e.details || {}) as { client_email?: string; preview?: string };
              return (
                <li key={e.id} className="py-2.5 text-sm">
                  <p className="font-medium text-slate-800">{d.client_email || "Client"}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{d.preview}</p>
                  <p className="text-[10px] text-slate-400">
                    {e.created_at ? new Date(e.created_at).toLocaleString() : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No client message alerts yet.</p>
        )}
      </section>
    </div>
  );
}
