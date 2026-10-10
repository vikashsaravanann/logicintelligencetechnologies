"use client";

import { useState, useTransition } from "react";
import { UserPlus, X, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { ASSIGNABLE_ROLES, type AssignableRole } from "@/config/roles";
import { inviteTeamMember } from "./actions";

const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: "Full platform governance, team management, security audit authority.",
  admin: "Operational control and resource management. Cannot change staff roles.",
  operations: "Automation execution, pipeline runs, and business entity workflows.",
  support: "Customer ticket resolution, onboarding assistance, and helpdesk access.",
  developer: "API key orchestration, webhook management, and technical diagnostics.",
  viewer: "Read-only visibility across dashboards, metrics, and non-sensitive logs.",
  client: "Client-facing portal access for approved organization representatives.",
  user: "Standard baseline authenticated portal user.",
};

export function InviteMemberDialog({ canManage }: { canManage: boolean }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AssignableRole>("viewer");
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  if (!canManage) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus(null);
    startTransition(async () => {
      const res = await inviteTeamMember({ email, role });
      if (res.ok) {
        setStatus({ ok: true, message: res.message });
        setTimeout(() => {
          setOpen(false);
          setEmail("");
          setStatus(null);
        }, 1800);
      } else {
        setStatus({ ok: false, message: res.error });
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStatus(null);
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-[#153a66] active:scale-[0.99]"
      >
        <UserPlus className="h-4 w-4" />
        <span>Invite Member</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="invite-dialog-title"
                    className="text-base font-bold text-[var(--lit-navy,#0B2545)]"
                  >
                    Invite Team Member
                  </h2>
                  <p className="text-xs text-[var(--lit-text-muted,#52677C)]">
                    Provision access with role-based security guards
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@logicintel.com"
                  disabled={pending}
                  className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3.5 py-2 text-sm text-[var(--lit-navy,#0B2545)] shadow-2xs transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] mb-1.5">
                  Assigned Staff Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AssignableRole)}
                  disabled={pending}
                  className="w-full rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-3.5 py-2 text-sm font-medium text-[var(--lit-navy,#0B2545)] shadow-2xs transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.toUpperCase()}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[11px] text-[var(--lit-text-muted,#52677C)]">
                  {ROLE_DESCRIPTIONS[role] ?? "Standard access permissions."}
                </p>
              </div>

              {status ? (
                <div
                  className={`flex items-center gap-2 rounded-xl border p-3 text-xs ${
                    status.ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                  role="alert"
                >
                  {status.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  )}
                  <span>{status.message}</span>
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--lit-border-light,#DFE7EF)]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-4 py-2 text-xs font-semibold text-[var(--lit-text-muted,#52677C)] hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || !email}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--lit-navy,#0B2545)] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#153a66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <span>Send Invitation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
