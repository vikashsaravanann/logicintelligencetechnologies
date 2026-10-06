"use client";

import { useState } from "react";

type WorkflowAction = "created" | "exists" | "error";
interface ImportResponse {
  state?: "ok" | "not_configured" | "error";
  detail?: string;
  results?: { name: string; action: WorkflowAction }[];
  error?: string;
}

export default function ImportButton() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "warn" | "error">("ok");

  async function run() {
    setLoading(true);
    setSummary(null);
    try {
      const res = await fetch("/api/admin/automations/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      const body = (await res.json().catch(() => ({}))) as ImportResponse;

      if (body.state === "not_configured") {
        setTone("warn");
        setSummary(body.detail ?? "n8n is not configured.");
        return;
      }
      if (!res.ok || body.state === "error" || body.error) {
        setTone("error");
        setSummary(body.detail ?? body.error ?? `Import failed (${res.status}).`);
        return;
      }

      const results = body.results ?? [];
      const created = results.filter((r) => r.action === "created").length;
      const exists = results.filter((r) => r.action === "exists").length;
      const errors = results.filter((r) => r.action === "error").length;
      setTone(errors > 0 ? "error" : "ok");
      setSummary(`${created} created, ${exists} already present, ${errors} error(s).`);
    } catch {
      setTone("error");
      setSummary("Could not reach the import endpoint.");
    } finally {
      setLoading(false);
    }
  }

  const toneClass =
    tone === "ok"
      ? "text-emerald-300"
      : tone === "warn"
        ? "text-amber-300"
        : "text-rose-300";

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="inline-flex w-fit items-center rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Importing…" : "Import workflow definitions"}
      </button>
      {summary ? <span className={`text-xs ${toneClass}`}>{summary}</span> : null}
    </div>
  );
}
