/**
 * Pure helpers to roll up provisioning-step statuses into an overall automation
 * status for the failure queue. No side effects.
 */

export type StepStatus = "pending" | "running" | "succeeded" | "failed" | "skipped" | "not_configured";
export type OverallStatus = "pending" | "running" | "complete" | "partial" | "failed" | "dead_letter";

/**
 * Roll up a set of step statuses:
 * - any failed and none running/pending  -> failed
 * - all succeeded/skipped/not_configured -> complete
 * - a mix of done and failed             -> partial
 * - something still running              -> running
 * - otherwise                            -> pending
 */
export function rollupStatus(steps: StepStatus[]): OverallStatus {
  if (steps.length === 0) return "pending";
  const has = (s: StepStatus) => steps.includes(s);
  const terminalOk = (s: StepStatus) => s === "succeeded" || s === "skipped" || s === "not_configured";

  if (steps.every(terminalOk)) return "complete";
  if (has("running")) return "running";
  if (has("failed")) {
    // No work left to do and at least one failure.
    const stuck = steps.every((s) => terminalOk(s) || s === "failed");
    if (stuck) return steps.some(terminalOk) ? "partial" : "failed";
    return "running";
  }
  return "pending";
}

/** Whether an overall status warrants surfacing in the failure queue. */
export function needsAttention(status: OverallStatus): boolean {
  return status === "failed" || status === "partial" || status === "dead_letter";
}
