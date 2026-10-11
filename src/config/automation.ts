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
    key: "lit_public_business_lead_discovery",
    name: "LIT — Public Business Lead Discovery",
    webhookPath: "/webhook/lit-public-business-lead-discovery",
    eventType: "lead.public_discovered",
    file: "LIT-02-public-business-lead-discovery.json",
  },
  {
    key: "lit_digital_opportunity_audit",
    name: "LIT — Website and Digital Opportunity Audit",
    webhookPath: "/webhook/lit-digital-opportunity-audit",
    eventType: "lead.digital_audit_requested",
    file: "LIT-03-digital-opportunity-audit.json",
  },
  {
    key: "lit_ai_lead_qualification",
    name: "LIT — AI Lead Qualification",
    webhookPath: "/webhook/lit-ai-lead-qualification",
    eventType: "lead.ai_qualified",
    file: "LIT-04-ai-lead-qualification.json",
  },
  {
    key: "lit_personalized_outreach_drafts",
    name: "LIT — Personalized Outreach Drafts",
    webhookPath: "/webhook/lit-personalized-outreach-drafts",
    eventType: "outreach.draft_generated",
    file: "LIT-05-personalized-outreach-drafts.json",
  },
  {
    key: "lit_consultation_scheduling",
    name: "LIT — Consultation Scheduling",
    webhookPath: "/webhook/lit-consultation-scheduling",
    eventType: "consultation.scheduled",
    file: "LIT-06-consultation-scheduling.json",
  },
  {
    key: "lit_proposal_preparation",
    name: "LIT — Proposal Preparation",
    webhookPath: "/webhook/lit-proposal-preparation",
    eventType: "proposal.draft_requested",
    file: "LIT-07-proposal-preparation.json",
  },
  {
    key: "lit_sales_pipeline_followup",
    name: "LIT — Sales Pipeline Follow-Up",
    webhookPath: "/webhook/lit-sales-pipeline-followup",
    eventType: "pipeline.followup_triggered",
    file: "LIT-08-sales-pipeline-followup.json",
  },
  {
    key: "lit_project_requirement_intake",
    name: "LIT — Project Requirement Intake",
    webhookPath: "/webhook/lit-project-requirement-intake",
    eventType: "project.requirement_intake",
    file: "LIT-09-project-requirement-intake.json",
  },
  {
    key: "lit_project_workspace_creation",
    name: "LIT — Project Workspace Creation",
    webhookPath: "/webhook/lit-project-workspace-creation",
    eventType: "project.workspace_created",
    file: "LIT-10-project-workspace-creation.json",
  },
  {
    key: "lit_development_milestone_tracking",
    name: "LIT — Development Milestone Tracking",
    webhookPath: "/webhook/lit-development-milestone-tracking",
    eventType: "project.milestone_updated",
    file: "LIT-11-development-milestone-tracking.json",
  },
  {
    key: "lit_automated_quality_reporting",
    name: "LIT — Automated Quality Reporting",
    webhookPath: "/webhook/lit-automated-quality-reporting",
    eventType: "project.qa_completed",
    file: "LIT-12-automated-quality-reporting.json",
  },
  {
    key: "lit_client_progress_reports",
    name: "LIT — Client Progress Reports",
    webhookPath: "/webhook/lit-client-progress-reports",
    eventType: "client.progress_report_dispatched",
    file: "LIT-13-client-progress-reports.json",
  },
  {
    key: "lit_delivery_handover",
    name: "LIT — Delivery & Handover",
    webhookPath: "/webhook/lit-delivery-handover",
    eventType: "project.delivered",
    file: "LIT-14-delivery-handover.json",
  },
  {
    key: "lit_maintenance_renewal",
    name: "LIT — Maintenance & Renewal",
    webhookPath: "/webhook/lit-maintenance-renewal",
    eventType: "project.maintenance_renewal",
    file: "LIT-15-maintenance-renewal.json",
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
  {
    key: "lit_client_feedback_csat",
    name: "LIT — Client Feedback & CSAT",
    webhookPath: "/webhook/lit-client-feedback-csat",
    eventType: "client.feedback_requested",
    file: "LIT-18-client-feedback-csat.json",
  },
  {
    key: "lit_support_ticket_routing",
    name: "LIT — Support Ticket Routing",
    webhookPath: "/webhook/lit-support-ticket-routing",
    eventType: "support.ticket_routed",
    file: "LIT-17-support-ticket-routing.json",
  },
  {
    key: "lit_quarterly_business_review",
    name: "LIT — Quarterly Business Review",
    webhookPath: "/webhook/lit-quarterly-business-review",
    eventType: "client.qbr_scheduled",
    file: "LIT-19-quarterly-business-review.json",
  },
  {
    key: "lit_account_retention_sentinel",
    name: "LIT — Account Retention Sentinel",
    webhookPath: "/webhook/lit-account-retention-sentinel",
    eventType: "client.churn_risk_flagged",
    file: "LIT-20-account-retention-sentinel.json",
  },
  {
    key: "lit_milestone_invoice_generation",
    name: "LIT — Milestone Invoice Generation",
    webhookPath: "/webhook/lit-milestone-invoice-generation",
    eventType: "billing.milestone_invoice_created",
    file: "LIT-22-milestone-invoice-generation.json",
  },
  {
    key: "lit_payment_reconciliation",
    name: "LIT — Payment Reconciliation",
    webhookPath: "/webhook/lit-payment-reconciliation",
    eventType: "billing.payment_received",
    file: "LIT-23-payment-reconciliation.json",
  },
  {
    key: "lit_overdue_payment_escalation",
    name: "LIT — Overdue Payment Escalation",
    webhookPath: "/webhook/lit-overdue-payment-escalation",
    eventType: "billing.payment_overdue",
    file: "LIT-24-overdue-payment-escalation.json",
  },
  {
    key: "lit_knowledge_sync",
    name: "LIT — Knowledge Base Sync",
    webhookPath: "/webhook/lit-knowledge-sync",
    eventType: "ops.knowledge_synced",
    file: "LIT-25-knowledge-sync.json",
  },
  {
    key: "lit_engineering_onboarding",
    name: "LIT — Engineering Onboarding",
    webhookPath: "/webhook/lit-engineering-onboarding",
    eventType: "ops.engineer_onboarded",
    file: "LIT-26-engineering-onboarding.json",
  },
  {
    key: "lit_weekly_operations_digest",
    name: "LIT — Weekly Operations Digest",
    webhookPath: "/webhook/lit-weekly-operations-digest",
    eventType: "ops.weekly_digest_generated",
    file: "LIT-27-weekly-operations-digest.json",
  },
  {
    key: "hlt_facility_onboarding",
    name: "HLT — Hospital Facility Onboarding",
    webhookPath: "/webhook/hlt-facility-onboarding",
    eventType: "healthcare.facility_onboarded",
    file: "HLT-02-facility-onboarding.json",
  },
  {
    key: "hlt_abdm_gateway_monitor",
    name: "HLT — ABDM Gateway Monitor",
    webhookPath: "/webhook/hlt-abdm-gateway-monitor",
    eventType: "healthcare.abdm_heartbeat",
    file: "HLT-03-abdm-gateway-monitor.json",
  },
  {
    key: "hlt_bed_capacity_alert",
    name: "HLT — Bed Capacity Alert",
    webhookPath: "/webhook/hlt-bed-capacity-alert",
    eventType: "healthcare.capacity_alert",
    file: "HLT-04-bed-capacity-alert.json",
  },
  {
    key: "hlt_pharmacy_reorder",
    name: "HLT — Pharmacy Reorder Automation",
    webhookPath: "/webhook/hlt-pharmacy-reorder",
    eventType: "healthcare.pharmacy_low_stock",
    file: "HLT-05-pharmacy-reorder.json",
  },
  {
    key: "hlt_compliance_audit",
    name: "HLT — Compliance Audit Sentinel",
    webhookPath: "/webhook/hlt-compliance-audit",
    eventType: "healthcare.compliance_audit",
    file: "HLT-06-compliance-audit.json",
  },
  {
    key: "ops_ssl_domain_sentinel",
    name: "OPS — SSL & Domain Sentinel",
    webhookPath: "/webhook/ops-ssl-domain-sentinel",
    eventType: "ops.ssl_expiry_check",
    file: "OPS-02-ssl-domain-sentinel.json",
  },
  {
    key: "ops_database_integrity",
    name: "OPS — Database Integrity Verification",
    webhookPath: "/webhook/ops-database-integrity",
    eventType: "ops.database_integrity_checked",
    file: "OPS-03-database-integrity.json",
  },
];

export function workflowForEvent(eventType: string): WorkflowDef | null {
  return WORKFLOWS.find((w) => w.eventType === eventType) ?? null;
}
