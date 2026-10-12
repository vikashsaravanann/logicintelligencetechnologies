"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RiskTierBadge } from "../../components/RiskTierBadge";
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Send,
  Eye,
  Info,
} from "lucide-react";

interface InvalidationConsoleProps {
  initialSite?: string;
}

export function InvalidationConsole({ initialSite }: InvalidationConsoleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [siteId, setSiteId] = useState<string>(
    initialSite && initialSite !== "all" ? initialSite : "corporate"
  );
  const [pathsText, setPathsText] = useState<string>("/services\n/about");
  const [reason, setReason] = useState<string>("");
  const [overrideApproved, setOverrideApproved] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
    details?: string;
    requestId?: string;
  } | null>(null);

  // Parse and normalize paths
  const rawLines = pathsText
    .split(/[\n,]/)
    .map((p) => p.trim())
    .filter(Boolean);

  const isBlanket = rawLines.some((p) => p === "/*" || p === "*");
  const normalizedPaths = rawLines.filter((p) => p !== "/*" && p !== "*");
  const hasRoot = normalizedPaths.includes("/");
  const riskClass = isBlanket ? "R3" : hasRoot ? "R2" : "R1";
  const requiresApproval = riskClass === "R2" || riskClass === "R3" || normalizedPaths.length > 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlanket) {
      setFeedback({
        success: false,
        message:
          "BLANKET PURGE REJECTED: Wildcard cache purges (/* or *) are strictly forbidden under Section 11 policy.",
      });
      return;
    }

    if (normalizedPaths.length === 0) {
      setFeedback({
        success: false,
        message: "Please specify at least one valid route path to invalidate.",
      });
      return;
    }

    if (!reason || reason.trim().length < 8) {
      setFeedback({
        success: false,
        message: "Operational justification must be at least 8 characters long.",
      });
      return;
    }

    setFeedback(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/cdn/v1/invalidation/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteId,
            paths: normalizedPaths,
            reason: reason.trim(),
            approved: overrideApproved,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to submit invalidation request");
        }

        setFeedback({
          success: true,
          message: data.result?.message || "Invalidation request submitted successfully.",
          requestId: data.result?.requestId,
          details: `Status: ${data.result?.status} | Paths: ${data.result?.paths?.join(", ")}`,
        });

        // Clear paths text
        setPathsText("");
        setReason("");
        router.refresh();
      } catch (err) {
        setFeedback({
          success: false,
          message: err instanceof Error ? err.message : "Error submitting request",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Policy Guard Alert Banner */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          Section 11 Invalidation Rule: Blanket Purges Are Strictly Prohibited
        </div>
        <p className="text-amber-800 leading-relaxed">
          Wholesale cache invalidations (<code>{'/*'}</code> or <code>*</code>) exhaust origin compute capacity and violate operational discipline. Invalidation must target specific modified paths only.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Site */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
              Target Origin Deployment:
            </label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              disabled={isPending}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]"
            >
              <option value="corporate">Corporate LIT (www.logicintelligencetechnologies.in)</option>
              <option value="healthcare">Healthcare Platform (healthcare.logicintelligencetechnologies.in)</option>
              <option value="logic_voice">Logic Voice (logicvoice.logicintelligencetechnologies.in)</option>
              <option value="voice_shield">VoiceShield (voiceshield.logicintelligencetechnologies.in)</option>
            </select>
          </div>

          {/* Risk Evaluation Preview */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
              Real-Time Impact & Governance Evaluation:
            </label>
            <div className="p-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-slate-50 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <RiskTierBadge tier={riskClass} />
                <span className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
                  {requiresApproval ? "Dual-Control Required" : "Automated Dispatch"}
                </span>
              </div>
              <span className="font-bold text-[var(--lit-navy,#0B2545)]">
                {normalizedPaths.length} Target Route(s)
              </span>
            </div>
          </div>
        </div>

        {/* Paths Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--lit-navy,#0B2545)] flex items-center justify-between">
            <span>Target Routes (newline or comma-separated):</span>
            <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
              e.g. /services, /about, /sitemap.xml
            </span>
          </label>
          <textarea
            value={pathsText}
            onChange={(e) => setPathsText(e.target.value)}
            disabled={isPending}
            rows={3}
            placeholder="/services&#10;/pricing&#10;/sitemap.xml"
            className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]"
          />
        </div>

        {/* Blanket Purge Warning */}
        {isBlanket && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Wildcard pattern (<code>{'/*'}</code> or <code>*</code>) detected. Blanket purges are prohibited.</span>
          </div>
        )}

        {/* Justification Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--lit-navy,#0B2545)] flex items-center justify-between">
            <span>Mandatory Operational Justification (min 8 characters):</span>
            <span
              className={`text-[11px] font-mono ${
                reason.trim().length >= 8 ? "text-emerald-600 font-bold" : "text-amber-600"
              }`}
            >
              {reason.trim().length} / 8 chars min
            </span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
            placeholder="e.g. Deployed hotfix to pricing copy; purged stale edge cache"
            className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]"
          />
        </div>

        {/* Super Admin Override Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="overrideApproved"
            checked={overrideApproved}
            onChange={(e) => setOverrideApproved(e.target.checked)}
            disabled={isPending}
            className="w-4 h-4 rounded border-slate-300 text-[var(--lit-teal,#1FA9A2)] focus:ring-[var(--lit-teal,#1FA9A2)] cursor-pointer"
          />
          <label
            htmlFor="overrideApproved"
            className="text-xs text-[var(--lit-navy,#0B2545)] font-semibold cursor-pointer select-none"
          >
            Super Admin Override: Immediate edge dispatch (bypasses approval queue if authorized)
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isPending || isBlanket || normalizedPaths.length === 0 || reason.trim().length < 8}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white text-xs font-bold shadow-xs hover:bg-[var(--lit-navy-dark,#071A31)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Dispatching Invalidation...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-400" />
                Submit Invalidation Request
              </>
            )}
          </button>
        </div>
      </form>

      {/* Result / Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-1 ${
            feedback.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {feedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          {feedback.requestId && (
            <div className="font-mono text-[11px] text-emerald-700">
              Request ID: {feedback.requestId}
            </div>
          )}
          {feedback.details && (
            <div className="font-mono text-[11px] text-emerald-700">{feedback.details}</div>
          )}
        </div>
      )}
    </div>
  );
}
