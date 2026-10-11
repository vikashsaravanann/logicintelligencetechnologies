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
  {
    key: "lit_website_lead_capture",
    name: "LIT — Website Lead Capture",
    webhookPath: "/webhook/lit-website-lead-capture",
    eventType: "lead.website_captured",
    file: "LIT-01-website-lead-capture.json",
  },
  {
    key: "lit_ai_lead_qualification",
    name: "LIT — AI Lead Qualification",
    webhookPath: "/webhook/lit-ai-lead-qualification",
    eventType: "lead.ai_qualified",
    file: "LIT-04-ai-lead-qualification.json",
  },
  {
    key: "lit_consultation_scheduling",
    name: "LIT — Consultation Scheduling",
    webhookPath: "/webhook/lit-consultation-scheduling",
    eventType: "consultation.scheduled",
    file: "LIT-06-consultation-scheduling.json",
  },
  {
    key: "lit_project_requirement_intake",
    name: "LIT — Project Requirement Intake",
    webhookPath: "/webhook/lit-project-requirement-intake",
    eventType: "project.requirement_intake",
    file: "LIT-09-project-requirement-intake.json",
  },
  {
    key: "hlt_healthcare_demo_inquiry",
    name: "HLT — Healthcare Demo Inquiry",
    webhookPath: "/webhook/hlt-healthcare-demo-inquiry",
    eventType: "healthcare.demo_inquiry",
    file: "HLT-01-healthcare-demo-inquiry.json",
  },
  {
    key: "ops_deployment_failure_alert",
    name: "OPS — Deployment Failure Alert",
    webhookPath: "/webhook/ops-deployment-failure-alert",
    eventType: "ops.deployment_failed",
    file: "OPS-01-deployment-failure-alert.json",
  },
  {
    key: "ops_automation_reliability_monitor",
    name: "OPS — Automation Reliability Monitor",
    webhookPath: "/webhook/ops-automation-reliability-monitor",
    eventType: "ops.reliability_monitor",
    file: "OPS-04-automation-reliability-monitor.json",
  },
];

export function workflowForEvent(eventType: string): WorkflowDef | null {
  return WORKFLOWS.find((w) => w.eventType === eventType) ?? null;
}
