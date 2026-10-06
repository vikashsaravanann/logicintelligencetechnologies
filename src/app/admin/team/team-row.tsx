"use client";

import { useState, useTransition } from "react";
import { setStaffRole } from "./actions";
import { ASSIGNABLE_ROLES } from "@/config/roles";

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
    return <span className="text-sm text-neutral-300">{currentRole ?? "— no profile —"}</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-white"
        aria-label="Role"
      >
        {ASSIGNABLE_ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending || role === (currentRole ?? "user")}
        onClick={() =>
          startTransition(async () => {
            setMsg(null);
            const res = await setStaffRole({ targetId, role });
            setMsg(res.ok ? { ok: true, text: res.message } : { ok: false, text: res.error });
          })
        }
        className="rounded-md bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-40"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {msg ? (
        <span className={`text-xs ${msg.ok ? "text-emerald-400" : "text-rose-400"}`} role="status">
          {msg.text}
        </span>
      ) : null}
    </div>
  );
}
