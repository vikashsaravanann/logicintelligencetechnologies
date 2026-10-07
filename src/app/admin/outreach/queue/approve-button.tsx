"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { approveDraft } from "../studio/actions";

export function ApproveButton({ messageId, disabled }: { messageId: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onApprove() {
    setLoading(true);
    setMsg(null);
    try {
      const r = await approveDraft(messageId);
      setMsg(r.message);
      if (r.ok) router.refresh();
    } catch {
      setMsg("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onApprove}
        disabled={loading || disabled}
        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/90 px-3 py-1 text-[11px] font-bold text-black hover:bg-emerald-400 disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
        Approve
      </button>
      {msg ? <span className="text-[10px] text-neutral-400">{msg}</span> : null}
    </div>
  );
}
