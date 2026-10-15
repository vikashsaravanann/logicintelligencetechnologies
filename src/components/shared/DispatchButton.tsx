"use client";

import React from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

interface DispatchButtonProps {
  onDispatch: () => void | Promise<void>;
  isSending?: boolean;
  isDispatched?: boolean;
  disabled?: boolean;
  title?: string;
  className?: string;
  defaultLabel?: string;
  sendingLabel?: string;
  dispatchedLabel?: string;
}

/**
 * Standard Dispatch button modeled after the Proposal Creation/Registry Dispatch Button.
 * Features 3 states: Default (Dispatch with blue Send icon), Sending (Sending… with spinner),
 * and Dispatched (Dispatched with emerald CheckCircle2).
 */
export function DispatchButton({
  onDispatch,
  isSending = false,
  isDispatched = false,
  disabled = false,
  title = "Dispatch formal notification email",
  className = "",
  defaultLabel = "Dispatch",
  sendingLabel = "Sending…",
  dispatchedLabel = "Dispatched",
}: DispatchButtonProps) {
  return (
    <button
      type="button"
      onClick={onDispatch}
      disabled={disabled || isSending || isDispatched}
      title={title}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs ${
        isDispatched
          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] disabled:opacity-50"
      } ${className}`}
    >
      {isSending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isDispatched ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      ) : (
        <Send className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
      )}
      <span>{isSending ? sendingLabel : isDispatched ? dispatchedLabel : defaultLabel}</span>
    </button>
  );
}

export default DispatchButton;
