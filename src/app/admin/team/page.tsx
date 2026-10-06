import { requireCapabilityPage } from "@/lib/auth/session";
import { hasCapability } from "@/config/roles";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { TeamRoleControl } from "./team-row";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  email: string | null;
  lastSignIn: string | null;
  confirmed: boolean;
  role: string | null;
  hasProfile: boolean;
}

export default async function AdminTeamPage() {
  const session = await requireCapabilityPage("team.read", "/admin/team");
  const canManage = hasCapability(session.role, "team.manage");

  let rows: Row[] = [];
  let loadError = false;
  try {
    const [{ data: authData, error: authErr }, { data: profiles, error: profErr }] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 200 }),
      supabaseAdmin.from("profiles").select("id, role"),
    ]);
    if (authErr || profErr) loadError = true;
    const roleById = new Map((profiles ?? []).map((p) => [p.id as string, p.role as string | null]));
    rows = (authData?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? null,
      lastSignIn: u.last_sign_in_at ?? null,
      confirmed: Boolean(u.email_confirmed_at),
      role: roleById.get(u.id) ?? null,
      hasProfile: roleById.has(u.id),
    }));
    rows.sort((a, b) => (a.email ?? "").localeCompare(b.email ?? ""));
  } catch {
    loadError = true;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Team &amp; Roles</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Assign staff roles. Only a super admin can change roles, and the last super
          admin cannot be removed. Accounts without a profile row show “no profile”.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300" role="alert">
          Could not load accounts. The admin API request failed.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Confirmed</th>
                <th className="px-4 py-3 font-semibold">Last sign-in</th>
                <th className="px-4 py-3 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-neutral-200">{r.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    {r.confirmed ? (
                      <span className="text-emerald-400">Yes</span>
                    ) : (
                      <span className="text-amber-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{formatIST(r.lastSignIn, "datetime")}</td>
                  <td className="px-4 py-3">
                    <TeamRoleControl targetId={r.id} currentRole={r.role} canManage={canManage} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">No accounts found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
