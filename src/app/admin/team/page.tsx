import { Metadata } from "next";
import { Users, Shield, UserCheck, ShieldAlert, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { requireCapabilityPage } from "@/lib/auth/session";
import { hasCapability } from "@/config/roles";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatIST } from "@/lib/format/datetime";
import { TeamRoleControl } from "./team-row";
import { InviteMemberDialog } from "./invite-dialog";

export const metadata: Metadata = {
  title: "Team & Role Governance | Admin",
  description: "Manage staff accounts, capability matrices, and administrative permissions.",
};

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

  const totalMembers = rows.length;
  const superAdminCount = rows.filter((r) => r.role === "super_admin").length;
  const adminCount = rows.filter((r) => r.role === "admin").length;
  const confirmedCount = rows.filter((r) => r.confirmed).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              <Users className="h-4 w-4" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)]">
              Team &amp; Access Governance
            </h1>
          </div>
          <p className="mt-1 text-sm text-[var(--lit-text-muted,#52677C)]">
            Member directory and cryptographic role assignments. Guarded by database trigger constraints.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <InviteMemberDialog canManage={canManage} />
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Total Personnel</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[var(--lit-navy,#0B2545)]">
            {totalMembers}
          </div>
          <p className="mt-1 text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Registered auth identities
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Super Admins</span>
            <Shield className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-purple-700">
            {superAdminCount}
          </div>
          <p className="mt-1 text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Full governance authority
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Admins &amp; Staff</span>
            <ShieldAlert className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-700">
            {adminCount}
          </div>
          <p className="mt-1 text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Operations &amp; service admins
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Verified Logins</span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {confirmedCount}
          </div>
          <p className="mt-1 text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Email confirmed accounts
          </p>
        </div>
      </div>

      {/* Security Policy Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 shadow-2xs">
        <Shield className="h-5 w-5 shrink-0 text-blue-700 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-bold">Security Constraint Enforcement:</span> Only accounts with the{" "}
          <span className="font-mono font-bold text-purple-700">super_admin</span> role can reassign
          staff permissions. The final super administrator account is cryptographically protected by
          the database trigger{" "}
          <code className="rounded bg-blue-100/80 px-1.5 py-0.5 font-mono text-[11px] text-blue-900">
            protect_last_super_admin
          </code>{" "}
          and cannot be demoted or removed.
        </div>
      </div>

      {/* Main Table Card */}
      {loadError ? (
        <div
          className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-sm text-rose-800 shadow-xs"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>Could not load accounts directory. The administrative Supabase request failed.</span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] bg-slate-50/50 px-5 py-3.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
              Member Directory ({rows.length})
            </span>
            <span className="font-mono text-xs text-[var(--lit-text-muted,#52677C)]">
              Scope: All registered accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                <tr>
                  <th className="px-5 py-3.5">Personnel</th>
                  <th className="px-5 py-3.5">Email Status</th>
                  <th className="px-5 py-3.5">Last Sign-In (IST)</th>
                  <th className="px-5 py-3.5">Assigned Role &amp; Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {rows.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-slate-100 font-mono text-xs font-bold text-[var(--lit-navy,#0B2545)]">
                          {(r.email?.[0] ?? "U").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                            {r.email ?? "—"}
                          </p>
                          <p className="font-mono text-[10px] text-[var(--lit-text-muted,#52677C)]">
                            ID: {r.id.slice(0, 8)}…{r.id.slice(-4)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {r.confirmed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                          <Clock className="h-3 w-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-[var(--lit-text-muted,#52677C)]">
                      {formatIST(r.lastSignIn, "datetime")}
                    </td>
                    <td className="px-5 py-4">
                      <TeamRoleControl
                        targetId={r.id}
                        currentRole={r.role}
                        canManage={canManage}
                      />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-[var(--lit-text-muted,#52677C)]">
                      No accounts registered in identity database.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
