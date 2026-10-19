"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { dispatchMessage } from "../studio/actions";

export function DispatchButton({ messageId }: { messageId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onDispatch() {
    setLoading(true);
    setMsg(null);
    try {
      const r = await dispatchMessage(messageId);
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
        onClick={onDispatch}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/90 px-3 py-1 text-[11px] font-bold text-black hover:bg-indigo-400 disabled:opacity-40"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
        Dispatch
      </button>
      {msg ? <span className="text-[10px] text-neutral-400">{msg}</span> : null}
    </div>
  );
}
