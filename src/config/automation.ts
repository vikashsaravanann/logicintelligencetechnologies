/**
 * Automation workflow configuration: the exact n8n workflow names and webhook
 * paths the app dispatches to and imports. Keeping them here (not scattered)
 * lets the import action and the dispatcher agree, and lets a test assert the
 * JSON workflow definitions match.
 */

export interface WorkflowDef {
  /** Internal key. */
  key: string;
  /** Exact n8n workflow name (used for create-if-missing by name). */
  name: string;
  /** Webhook path on the n8n instance. */
  webhookPath: string;
  /** The automation_event event_type that dispatches to this workflow. */
  eventType: string;
  /** The workflow definition JSON file under src/lib/automation/n8n/. */
  file: string;
}

export const WORKFLOWS: WorkflowDef[] = [
  {
    key: "contract_signed",
    name: "LIT — Contract Signed",
    webhookPath: "/webhook/lit-contract-signed",
    eventType: "contract.signed",
    file: "contract-signed.json",
  },
  {
    key: "onboarding_submitted",
    name: "LIT — Onboarding Submitted",
    webhookPath: "/webhook/lit-onboarding-submitted",
    eventType: "onboarding.submitted",
    file: "onboarding-submitted.json",
  },
];

export function workflowForEvent(eventType: string): WorkflowDef | null {
  return WORKFLOWS.find((w) => w.eventType === eventType) ?? null;
}
