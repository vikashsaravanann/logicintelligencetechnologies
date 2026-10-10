"use client";

import { useState, useTransition } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { setStaffRole } from "./actions";
import { ASSIGNABLE_ROLES } from "@/config/roles";

export function RoleBadge({ role }: { role: string | null }) {
  const norm = (role ?? "").toLowerCase();
  let tone = "bg-slate-100 text-slate-700 border-slate-200";
  let label = role ?? "no profile";

  if (norm === "super_admin") {
    tone = "bg-purple-50 text-purple-700 border-purple-200";
    label = "SUPER_ADMIN";
  } else if (norm === "admin") {
    tone = "bg-blue-50 text-blue-700 border-blue-200";
    label = "ADMIN";
  } else if (norm === "agent" || norm === "operations") {
    tone = "bg-emerald-50 text-emerald-700 border-emerald-200";
    label = norm === "agent" ? "AGENT" : "OPERATIONS";
  } else if (norm === "viewer") {
    tone = "bg-slate-100 text-slate-700 border-slate-200";
    label = "VIEWER";
  } else if (norm === "support") {
    tone = "bg-amber-50 text-amber-700 border-amber-200";
    label = "SUPPORT";
  } else if (norm === "developer") {
    tone = "bg-cyan-50 text-cyan-700 border-cyan-200";
    label = "DEVELOPER";
  } else if (norm === "client") {
    tone = "bg-teal-50 text-teal-700 border-teal-200";
    label = "CLIENT";
  } else if (norm === "user") {
    tone = "bg-slate-100 text-slate-600 border-slate-200";
    label = "USER";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold tracking-wider font-mono uppercase ${tone}`}
    >
      {label}
    </span>
  );
}

export function TeamRoleControl({
  targetId,
  currentRole,
  canManage,
}: {
  targetId: string;
  currentRole: string | null;
  canManage: boolean;
}) {
  const [role, setRole] = useState(currentRole ?? "user");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!canManage) {
    return <RoleBadge role={currentRole} />;
  }

  const isDirty = role !== (currentRole ?? "user");

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setMsg(null);
          }}
          disabled={pending}
          className="h-8 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--lit-navy,#0B2545)] shadow-2xs transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          aria-label="Role assignment"
        >
          {ASSIGNABLE_ROLES.map((r) => (
            <option key={r} value={r}>
              {r.toUpperCase()}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={pending || !isDirty}
          onClick={() =>
            startTransition(async () => {
              setMsg(null);
              const res = await setStaffRole({ targetId, role });
              setMsg(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
            })
          }
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] px-3 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-[#153a66] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            <span>Save</span>
          )}
        </button>
      </div>

      {msg ? (
        <span
          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium font-mono ${
            msg.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
          role="status"
        >
          {msg.ok ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {msg.text}
        </span>
      ) : null}
    </div>
  );
}
