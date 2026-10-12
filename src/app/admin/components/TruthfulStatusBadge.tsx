import React from "react";
import { CheckCircle2, AlertCircle, Clock, ShieldAlert, CircleDot, PauseCircle, Activity } from "lucide-react";

export type TruthfulState =
  | "Connected"
  | "Unconfigured"
  | "Unknown"
  | "Degraded"
  | "Staged"
  | "Active"
  | "Paused"
  | "Deprecated"
  | "Retired"
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Dispatched"
  | "Success"
  | "Error"
  | "Running";

interface Props {
  state?: TruthfulState | string;
  status?: TruthfulState | string;
  size?: "sm" | "md";
  showDot?: boolean;
}

export function TruthfulStatusBadge({ state, status, size = "md", showDot = true }: Props) {
  const displayState = (state ?? status ?? "Unknown");
  const norm = displayState.trim().toLowerCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  let dotColor = "bg-slate-400";
  let icon = <CircleDot className="w-3 h-3" />;

  if (norm === "connected" || norm === "active" || norm === "success" || norm === "approved") {
    styles = "bg-emerald-50 text-emerald-800 border-emerald-200";
    dotColor = "bg-emerald-500";
    icon = <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
  } else if (norm === "staged") {
    styles = "bg-blue-50 text-blue-800 border-blue-200";
    dotColor = "bg-blue-500";
    icon = <Clock className="w-3 h-3 text-blue-600" />;
  } else if (norm === "unconfigured" || norm === "paused" || norm === "pending") {
    styles = "bg-amber-50 text-amber-800 border-amber-200";
    dotColor = "bg-amber-500";
    icon = <PauseCircle className="w-3 h-3 text-amber-600" />;
  } else if (norm === "error" || norm === "rejected" || norm === "degraded") {
    styles = "bg-rose-50 text-rose-800 border-rose-200";
    dotColor = "bg-rose-500";
    icon = <AlertCircle className="w-3 h-3 text-rose-600" />;
  } else if (norm === "running" || norm === "dispatched") {
    styles = "bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border-teal-200";
    dotColor = "bg-[var(--lit-teal,#1FA9A2)] animate-pulse";
    icon = <Activity className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)] animate-pulse" />;
  } else if (norm === "deprecated" || norm === "retired") {
    styles = "bg-gray-100 text-gray-600 border-gray-300";
    dotColor = "bg-gray-400";
    icon = <ShieldAlert className="w-3 h-3 text-gray-500" />;
  }

  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium font-mono capitalize tracking-tight ${padding} ${styles}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      {displayState}
    </span>
  );
}
