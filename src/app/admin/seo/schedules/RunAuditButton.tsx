"use client";

import { useState } from "react";
import { Play, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface RunAuditButtonProps {
  currentSite?: string;
}

export function RunAuditButton({ currentSite }: RunAuditButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    details?: string;
  } | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/seo/v1/cycle/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site: currentSite && currentSite !== "all" ? currentSite : undefined,
          forced: true,
          reason: "Manual operator trigger from 72h SEO Schedule Console",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to trigger cycle run");
      }

      setResult({
        success: true,
        message: `Cycle executed successfully! Inspected ${data.cycle?.totalInspected || 0} URLs with ${data.cycle?.totalAnomalies || 0} anomalies detected.`,
      });

      // Refresh server components
      router.refresh();
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "Error executing cycle",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={handleRun}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--lit-teal,#1FA9A2)] text-white text-xs font-bold shadow-xs hover:bg-[var(--lit-teal-dark,#188580)] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Executing 72h Audit...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Trigger Manual Audit Cycle (R0)
            </>
          )}
        </button>
        <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
          Audit is read-only (R0). GSC quota preserved. Zero page mutation.
        </span>
      </div>

      {result && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            result.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          )}
          <div>
            <p className="font-semibold">{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
