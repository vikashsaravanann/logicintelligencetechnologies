/**
 * LIT 13-Stage Universal Client Lifecycle Engine
 * Specifications: LIT_13_STAGE_CLIENT_LIFECYCLE_MANUAL_UPI_PAYMENT_PORTAL_MASTER_PROMPT_V2.md
 */

export type StageKey =
  | 'checklist'
  | 'discovery'
  | 'proposal'
  | 'acceptance'
  | 'sow'
  | 'initial-invoice'
  | 'onboarding'
  | 'technical-spec'
  | 'development'
  | 'delivery-acceptance'
  | 'final-payment'
  | 'handover'
  | 'support';

export type StageStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'issued'
  | 'awaiting_signature'
  | 'signed'
  | 'payment_requested'
  | 'customer_claimed_paid'
  | 'verification_pending'
  | 'partially_verified'
  | 'verified'
  | 'paid'
  | 'accepted'
  | 'completed'
  | 'not_applicable'
  | 'blocked'
  | 'expired'
  | 'revoked';

export interface StageDefinition {
  ordinal: number;
  key: StageKey;
  title: string;
  shortTitle: string;
  description: string;
  clientActionLabel: string;
  adminActionLabel: string;
  prerequisiteKey: StageKey | null;
  prerequisiteDesc: string | null;
  documentMasterRef: string | null;
  badgeText: string;
}

export const CANONICAL_13_STAGES: Record<StageKey, StageDefinition> = {
  checklist: {
    ordinal: 1,
    key: 'checklist',
    title: '50-Point Enterprise Deployment Checklist',
    shortTitle: '50-Point Checklist',
    description: 'Select and audit technical scope items from our official 21-page enterprise master.',
    clientActionLabel: 'Review & Select Points',
    adminActionLabel: 'Audit Submission & Generate Receipt',
    prerequisiteKey: null,
    prerequisiteDesc: null,
    documentMasterRef: 'LIT_50_Point_Enterprise_Deployment_Checklist.pdf',
    badgeText: 'Stage 01 · Scope Baseline',
  },
  discovery: {
    ordinal: 2,
    key: 'discovery',
    title: 'Discovery & Requirements Review',
    shortTitle: 'Discovery & Scoping',
    description: 'Technical architecture questionnaire, integration review, and scoping minutes.',
    clientActionLabel: 'Provide Technical Answers',
    adminActionLabel: 'Review & Publish Discovery Minutes',
    prerequisiteKey: 'checklist',
    prerequisiteDesc: 'Requires submission of Stage 1 50-Point Enterprise Checklist.',
    documentMasterRef: null,
    badgeText: 'Stage 02 · Technical Review',
  },
  proposal: {
    ordinal: 3,
    key: 'proposal',
    title: 'Proposal / Commercial Quotation',
    shortTitle: 'Commercial Proposal',
    description: 'Review formal technical scope, pricing breakdown, deliverables, and milestone schedule.',
    clientActionLabel: 'Review Proposal PDF & Scope',
    adminActionLabel: 'Approve & Dispatch Quotation',
    prerequisiteKey: 'discovery',
    prerequisiteDesc: 'Requires reviewed and approved technical discovery baseline.',
    documentMasterRef: 'LIT-02-Proposal-Commercial-Quotation.pdf',
    badgeText: 'Stage 03 · Commercial Terms',
  },
  acceptance: {
    ordinal: 4,
    key: 'acceptance',
    title: 'Proposal Formal Acceptance',
    shortTitle: 'Proposal Acceptance',
    description: 'Formal digital acceptance receipt of approved commercial quotation and terms.',
    clientActionLabel: 'Accept Proposal Version',
    adminActionLabel: 'Verify Acceptance Timestamp & Signer',
    prerequisiteKey: 'proposal',
    prerequisiteDesc: 'Requires official commercial proposal version dispatched by Founder.',
    documentMasterRef: null,
    badgeText: 'Stage 04 · Client Assent',
  },
  sow: {
    ordinal: 5,
    key: 'sow',
    title: 'SOW / Service Agreement',
    shortTitle: 'SOW Agreement',
    description: 'Legally binding Master Services Agreement with IP assignment, warranty, and confidentiality.',
    clientActionLabel: 'Review & Execute Agreement',
    adminActionLabel: 'Countersign & Issue Executed SOW',
    prerequisiteKey: 'acceptance',
    prerequisiteDesc: 'Requires accepted commercial proposal version.',
    documentMasterRef: 'LIT-01-SOW-Service-Agreement.pdf',
    badgeText: 'Stage 05 · Binding Contract',
  },
  'initial-invoice': {
    ordinal: 6,
    key: 'initial-invoice',
    title: 'Initial Payment Request & Verification',
    shortTitle: 'Initial Deposit (50%)',
    description: 'Manual UPI payment request (50% deposit), dynamic amount-specific QR, and bank credit audit.',
    clientActionLabel: 'Scan UPI QR & Submit UTR',
    adminActionLabel: 'Reconcile Bank Credit & Issue Tax Document',
    prerequisiteKey: 'sow',
    prerequisiteDesc: 'Requires executed SOW / Service Agreement signed by both parties.',
    documentMasterRef: null,
    badgeText: 'Stage 06 · Initial Payment',
  },
  onboarding: {
    ordinal: 7,
    key: 'onboarding',
    title: 'Onboarding Guide & Secure Intake',
    shortTitle: 'Client Onboarding',
    description: 'Welcome orientation, credential-free technical access delegation, and kickoff intake.',
    clientActionLabel: 'Complete Intake Form',
    adminActionLabel: 'Verify Technical Access & Schedule Kickoff',
    prerequisiteKey: 'initial-invoice',
    prerequisiteDesc: 'Requires verified initial payment credit and issued payment receipt.',
    documentMasterRef: 'LIT-03-Client-Onboarding-Guide.pdf',
    badgeText: 'Stage 07 · Kickoff & Access',
  },
  'technical-spec': {
    ordinal: 8,
    key: 'technical-spec',
    title: 'Technical Specification Blueprint',
    shortTitle: 'Technical Specification',
    description: 'Detailed systems architecture, API contracts, database schema, and hosting blueprint.',
    clientActionLabel: 'Review Architecture Blueprint',
    adminActionLabel: 'Publish Engineering Specification Baseline',
    prerequisiteKey: 'onboarding',
    prerequisiteDesc: 'Requires completed client intake questionnaire.',
    documentMasterRef: 'LIT-04-Technical-Specification.pdf',
    badgeText: 'Stage 08 · System Design',
  },
  development: {
    ordinal: 9,
    key: 'development',
    title: 'Development & Sprint Milestones',
    shortTitle: 'Sprint Milestones',
    description: 'Live sprint progress, staging preview builds, test suite evidence, and change requests.',
    clientActionLabel: 'Track Progress & Request Changes',
    adminActionLabel: 'Deploy Staging & Update Milestone Evidence',
    prerequisiteKey: 'technical-spec',
    prerequisiteDesc: 'Requires signed-off technical specification baseline.',
    documentMasterRef: 'LIT-06-Change-Request.pdf',
    badgeText: 'Stage 09 · Engineering & QA',
  },
  'delivery-acceptance': {
    ordinal: 10,
    key: 'delivery-acceptance',
    title: 'Delivery & Acceptance Report',
    shortTitle: 'Delivery Acceptance',
    description: 'Final delivery verification report, test proofs, security audit, and formal client sign-off.',
    clientActionLabel: 'Review Delivery & Sign Sign-off',
    adminActionLabel: 'Publish Delivery Report & Evidence',
    prerequisiteKey: 'development',
    prerequisiteDesc: 'Requires completion and QA pass of all engineering milestones.',
    documentMasterRef: 'LIT-05-Delivery-Acceptance-Report.pdf',
    badgeText: 'Stage 10 · Acceptance Sign-off',
  },
  'final-payment': {
    ordinal: 11,
    key: 'final-payment',
    title: 'Final Payment Request & Settlement',
    shortTitle: 'Final Settlement (50%)',
    description: 'Final 50% delivery settlement via manual UPI QR, UTR submission, and Super Admin audit.',
    clientActionLabel: 'Scan UPI QR & Submit Final UTR',
    adminActionLabel: 'Reconcile Final Bank Credit & Issue Tax Invoice',
    prerequisiteKey: 'delivery-acceptance',
    prerequisiteDesc: 'Requires signed Delivery & Acceptance Report.',
    documentMasterRef: null,
    badgeText: 'Stage 11 · Final Settlement',
  },
  handover: {
    ordinal: 12,
    key: 'handover',
    title: 'Handover & IP / Access Transfer',
    shortTitle: 'Handover & IP Transfer',
    description: 'Source repository ownership delegation, production DNS handover, and runbooks.',
    clientActionLabel: 'Confirm Repository & Account Transfer',
    adminActionLabel: 'Execute Ownership Transfer & Transfer Manifest',
    prerequisiteKey: 'final-payment',
    prerequisiteDesc: 'Requires verified final settlement funds credited to receiving bank.',
    documentMasterRef: null,
    badgeText: 'Stage 12 · Ownership Transfer',
  },
  support: {
    ordinal: 13,
    key: 'support',
    title: 'Maintenance & Support SLA',
    shortTitle: 'Support & SLA',
    description: 'Post-launch SLA coverage, uptime monitoring, priority ticketing, and scheduled upgrades.',
    clientActionLabel: 'Submit Support Ticket / Review SLA',
    adminActionLabel: 'Manage SLA Tickets & Monitoring Alerts',
    prerequisiteKey: 'handover',
    prerequisiteDesc: 'Requires completed handover manifest.',
    documentMasterRef: 'LIT-07-Maintenance-Support-Agreement.pdf',
    badgeText: 'Stage 13 · Post-Launch SLA',
  },
};

export const ORDERED_STAGE_KEYS: StageKey[] = [
  'checklist',
  'discovery',
  'proposal',
  'acceptance',
  'sow',
  'initial-invoice',
  'onboarding',
  'technical-spec',
  'development',
  'delivery-acceptance',
  'final-payment',
  'handover',
  'support',
];

export interface ClientEngagement {
  id: string;
  engagement_ref: string;
  client_id: string | null;
  proposal_id: string | null;
  checklist_invitation_id: string | null;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  project_title: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  current_stage: StageKey;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EngagementStage {
  id: string;
  engagement_id: string;
  stage_key: StageKey;
  ordinal: number;
  title: string;
  summary: string | null;
  status: StageStatus;
  assigned_owner: string | null;
  notes: string | null;
  prerequisite_stage_key: string | null;
  prerequisite_description: string | null;
  document_master_ref: string | null;
  snapshot: Record<string, unknown>;
  unlocked_at: string | null;
  completed_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EngagementStageEvent {
  id: string;
  engagement_id: string;
  stage_key: StageKey;
  action: string;
  from_status: string | null;
  to_status: string | null;
  actor_role: string;
  actor_id: string | null;
  reason: string | null;
  idempotency_key: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface EngagementDocumentLink {
  id: string;
  engagement_id: string;
  stage_key: StageKey;
  document_title: string;
  master_id: string | null;
  version_label: string;
  file_url: string;
  file_size_bytes: number | null;
  sha256_hash: string | null;
  is_client_visible: boolean;
  requires_signature: boolean;
  signature_status: 'none' | 'pending' | 'signed' | 'rejected';
  signed_at: string | null;
  signed_by: string | null;
  created_at: string;
}

export interface ClientIdentityChangeRequest {
  id: string;
  engagement_id: string | null;
  client_id: string | null;
  target_field:
    | 'company_name'
    | 'registered_address'
    | 'gstin'
    | 'pan'
    | 'contact_name'
    | 'contact_email'
    | 'contact_phone'
    | 'billing_address';
  current_value: string | null;
  proposed_value: string;
  change_reason: string;
  requested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}
