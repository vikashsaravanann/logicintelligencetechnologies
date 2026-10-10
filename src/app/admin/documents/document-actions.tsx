"use client";

import { transitionDocumentAction } from "./actions";
import { ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, XCircle, RotateCcw } from "lucide-react";

interface DocumentActionsProps {
  documentId: string;
  status: string;
  nextStatuses: string[];
}

const TRANSITION_STYLES: Record<
  string,
  { badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  in_review: {
    badge: "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800",
    icon: AlertTriangle,
  },
  approved: {
    badge: "border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800",
    icon: CheckCircle2,
  },
  issued: {
    badge: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800",
    icon: ShieldCheck,
  },
  void: {
    badge: "border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800",
    icon: XCircle,
  },
  superseded: {
    badge: "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700",
    icon: RotateCcw,
  },
};

export function DocumentActions({ documentId, status, nextStatuses }: DocumentActionsProps) {
  if (nextStatuses.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 border border-[var(--lit-border-light,#DFE7EF)] p-4 text-xs text-[var(--lit-text-muted,#52677C)]">
        No state transitions available from current status{" "}
        <span className="font-mono font-bold text-[var(--lit-navy,#0B2545)]">“{status}”</span> (terminal or locked state).
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {nextStatuses.map((to) => {
        const style = TRANSITION_STYLES[to] ?? {
          badge: "border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-slate-50 text-[var(--lit-navy,#0B2545)]",
          icon: ArrowRight,
        };
        const Icon = style.icon;

        return (
          <form key={to} action={transitionDocumentAction}>
            <input type="hidden" name="documentId" value={documentId} />
            <input type="hidden" name="toStatus" value={to} />
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer ${style.badge}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>Move to {to.replace("_", " ")}</span>
            </button>
          </form>
        );
      })}
    </div>
  );
}
