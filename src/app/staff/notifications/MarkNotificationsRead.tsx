"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkNotificationsRead() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function markAll() {
    setBusy(true);
    try {
      await fetch("/api/staff/notifications/read-all", { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={markAll}
      disabled={busy}
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
    >
      {busy ? "Updating…" : "Mark all read"}
    </button>
  );
}
