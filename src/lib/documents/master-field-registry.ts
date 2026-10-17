/**
 * LIT Corporate Master Document Field Registry (Section 17)
 * Maps the 7 original corporate PDFs + 50-point checklist + invoices/receipts
 * into structured interactive form schemas with explicit field ownership,
 * auto-population lineage, and Staff Support View financial redaction rules.
 */

import type { StaffRole } from '@/config/roles';
import type { StageKey } from '@/lib/engagements/types';

export type DocumentCode =
  | 'LIT-00-CHECKLIST'
  | 'LIT-01-SOW'
  | 'LIT-02-NDA'
  | 'LIT-02-PROPOSAL'
  | 'LIT-03-ONBOARDING'
  | 'LIT-04-TECH-SPEC'
  | 'LIT-05-CHANGE-REQUEST'
  | 'LIT-05-DELIVERY'
  | 'LIT-06-HANDOVER'
  | 'LIT-07-MAINTENANCE'
  | 'LIT-QUOTATION'
  | 'LIT-INVOICE'
  | 'LIT-RECEIPT';

export type FieldOwner =
  | 'system'
  | 'client'
  | 'lit_staff_technical'
  | 'super_admin_commercial'
  | 'legal_review';

export type AutoPopulationSource =
  | 'system_generated'
  | 'enquiry_submission'
  | 'client_identity'
  | 'stage_snapshot:checklist'
  | 'stage_snapshot:discovery'
  | 'stage_snapshot:nda'
  | 'stage_snapshot:proposal'
  | 'stage_snapshot:sow'
  | 'stage_snapshot:onboarding'
  | 'stage_snapshot:technical-spec'
  | 'stage_snapshot:development'
  | 'stage_snapshot:delivery-acceptance'
  | 'approved_commercial_quotation'
  | 'verified_payment_reconciliation'
  | 'manual_entry';

export interface DocumentFieldSpec {
  key: string;
  label: string;
  documentCode: DocumentCode;
  stageKey: StageKey;
  section: string;
  owner: FieldOwner;
  autoPopulateFrom: AutoPopulationSource;
  required: boolean;
  financialSensitive: boolean; // If true, redacted in Staff Support View & non-super-admin staff views
  lockedAfterApproval: boolean;
}

export const MASTER_DOCUMENT_FIELD_REGISTRY: Record<DocumentCode, DocumentFieldSpec[]> = {
  'LIT-00-CHECKLIST': [
    {
      key: 'checklistRef',
      label: 'Checklist Reference ID',
      documentCode: 'LIT-00-CHECKLIST',
      stageKey: 'checklist',
      section: 'Document Control',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'clientLegalName',
      label: 'Client Legal Entity Name',
      documentCode: 'LIT-00-CHECKLIST',
      stageKey: 'checklist',
      section: '1. Project Fundamentals & Governance',
      owner: 'client',
      autoPopulateFrom: 'enquiry_submission',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'primaryContactEmail',
      label: 'Primary Contact Email',
      documentCode: 'LIT-00-CHECKLIST',
      stageKey: 'checklist',
      section: '1. Project Fundamentals & Governance',
      owner: 'client',
      autoPopulateFrom: 'enquiry_submission',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'selectedChecklistItems',
      label: '50-Point Enterprise Deployment Selections (Sections 1–9)',
      documentCode: 'LIT-00-CHECKLIST',
      stageKey: 'checklist',
      section: 'Sections 1–9 Checklist Matrix',
      owner: 'client',
      autoPopulateFrom: 'stage_snapshot:checklist',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'signoffAuthorizationName',
      label: 'Section 10 Client Sign-Off Name',
      documentCode: 'LIT-00-CHECKLIST',
      stageKey: 'checklist',
      section: '10. Sign-Off & Authorization',
      owner: 'client',
      autoPopulateFrom: 'client_identity',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
  ],

  'LIT-02-NDA': [
    {
      key: 'agreementReference',
      label: 'NDA Reference Number',
      documentCode: 'LIT-02-NDA',
      stageKey: 'acceptance',
      section: 'Header & Parties',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'effectiveDate',
      label: 'Effective Date',
      documentCode: 'LIT-02-NDA',
      stageKey: 'acceptance',
      section: 'Header & Parties',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'disclosingPartyLegalName',
      label: 'Client Legal Entity Name',
      documentCode: 'LIT-02-NDA',
      stageKey: 'acceptance',
      section: 'Parties',
      owner: 'client',
      autoPopulateFrom: 'stage_snapshot:checklist',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'disclosingPartyAddress',
      label: 'Client Registered Address',
      documentCode: 'LIT-02-NDA',
      stageKey: 'acceptance',
      section: 'Parties',
      owner: 'client',
      autoPopulateFrom: 'stage_snapshot:discovery',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'permittedPurpose',
      label: 'Permitted Purpose & Project Scope',
      documentCode: 'LIT-02-NDA',
      stageKey: 'acceptance',
      section: '1. Purpose & Confidential Information',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:discovery',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'confidentialityTermYears',
      label: 'Confidentiality Survival Term (Years)',
      documentCode: 'LIT-02-NDA',
      stageKey: 'acceptance',
      section: '4. Term & Return of Materials',
      owner: 'legal_review',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'governingLawJurisdiction',
      label: 'Governing Law & Jurisdiction',
      documentCode: 'LIT-02-NDA',
      stageKey: 'acceptance',
      section: '8. Governing Law',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'clientSignatoryName',
      label: 'Client Authorized Signatory Name',
      documentCode: 'LIT-02-NDA',
      stageKey: 'acceptance',
      section: 'Execution Block',
      owner: 'client',
      autoPopulateFrom: 'client_identity',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'clientSignatoryDesignation',
      label: 'Client Authorized Signatory Designation',
      documentCode: 'LIT-02-NDA',
      stageKey: 'acceptance',
      section: 'Execution Block',
      owner: 'client',
      autoPopulateFrom: 'client_identity',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
  ],

  'LIT-01-SOW': [
    {
      key: 'sowReference',
      label: 'SOW Agreement Reference',
      documentCode: 'LIT-01-SOW',
      stageKey: 'sow',
      section: 'Document Control',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'clientLegalName',
      label: 'Client Legal Name',
      documentCode: 'LIT-01-SOW',
      stageKey: 'sow',
      section: '1. Parties & Background',
      owner: 'client',
      autoPopulateFrom: 'stage_snapshot:nda',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'scopeOfWorkModules',
      label: 'Approved Scope Modules & Deliverables',
      documentCode: 'LIT-01-SOW',
      stageKey: 'sow',
      section: '2. Scope of Services & Deliverables',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:proposal',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'deliveryTimelineWeeks',
      label: 'Milestone Delivery Schedule',
      documentCode: 'LIT-01-SOW',
      stageKey: 'sow',
      section: '3. Timeline & Milestones',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:proposal',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'contractSubtotalPaise',
      label: 'Approved Contract Subtotal (INR)',
      documentCode: 'LIT-01-SOW',
      stageKey: 'sow',
      section: '4. Commercial Terms & Two-Milestone Schedule',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'gstAmountPaise',
      label: 'Statutory GST (18% / 9% CGST + 9% SGST)',
      documentCode: 'LIT-01-SOW',
      stageKey: 'sow',
      section: '4. Commercial Terms & Two-Milestone Schedule',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'totalContractValuePaise',
      label: 'Total Contract Payable (INR)',
      documentCode: 'LIT-01-SOW',
      stageKey: 'sow',
      section: '4. Commercial Terms & Two-Milestone Schedule',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'milestone1DepositPaise',
      label: 'Milestone 1 — 50% Kickoff Deposit (Stage 06)',
      documentCode: 'LIT-01-SOW',
      stageKey: 'sow',
      section: '4. Commercial Terms & Two-Milestone Schedule',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'milestone2SettlementPaise',
      label: 'Milestone 2 — 50% Final Settlement (Stage 11)',
      documentCode: 'LIT-01-SOW',
      stageKey: 'sow',
      section: '4. Commercial Terms & Two-Milestone Schedule',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'ipAssignmentClause',
      label: 'Intellectual Property Assignment Upon Full Settlement',
      documentCode: 'LIT-01-SOW',
      stageKey: 'sow',
      section: '6. Intellectual Property & Warranties',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'clientSignerName',
      label: 'Client Signatory Name',
      documentCode: 'LIT-01-SOW',
      stageKey: 'sow',
      section: '10. Execution & Binding Assent',
      owner: 'client',
      autoPopulateFrom: 'stage_snapshot:nda',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
  ],

  'LIT-03-ONBOARDING': [
    {
      key: 'onboardingRef',
      label: 'Onboarding Dossier Reference',
      documentCode: 'LIT-03-ONBOARDING',
      stageKey: 'onboarding',
      section: 'Document Control',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'stakeholderContacts',
      label: 'Key Project Stakeholders & Escalation Matrix',
      documentCode: 'LIT-03-ONBOARDING',
      stageKey: 'onboarding',
      section: '1. Stakeholder Directory',
      owner: 'client',
      autoPopulateFrom: 'stage_snapshot:discovery',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'domainDnsRegistrar',
      label: 'Domain Registrar & DNS Provider Details',
      documentCode: 'LIT-03-ONBOARDING',
      stageKey: 'onboarding',
      section: '2. Infrastructure & DNS',
      owner: 'client',
      autoPopulateFrom: 'stage_snapshot:checklist',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'gitRepositoryOrg',
      label: 'GitHub Organization / Repository Coordinates',
      documentCode: 'LIT-03-ONBOARDING',
      stageKey: 'onboarding',
      section: '3. Source Control & CI/CD',
      owner: 'client',
      autoPopulateFrom: 'stage_snapshot:onboarding',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'brandAssetsUrl',
      label: 'Brand Guidelines, Logos & Content Assets URL',
      documentCode: 'LIT-03-ONBOARDING',
      stageKey: 'onboarding',
      section: '4. Brand & Design Assets',
      owner: 'client',
      autoPopulateFrom: 'stage_snapshot:onboarding',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'complianceConstraints',
      label: 'DPDP Act / Security & Compliance Notes',
      documentCode: 'LIT-03-ONBOARDING',
      stageKey: 'onboarding',
      section: '5. Security & Regulatory',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:checklist',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
  ],

  'LIT-04-TECH-SPEC': [
    {
      key: 'techSpecVersion',
      label: 'Technical Specification Version',
      documentCode: 'LIT-04-TECH-SPEC',
      stageKey: 'technical-spec',
      section: 'Document Control',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'systemArchitectureOverview',
      label: 'System Architecture & Next.js / Supabase Topology',
      documentCode: 'LIT-04-TECH-SPEC',
      stageKey: 'technical-spec',
      section: '1. System Architecture',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:proposal',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'dataModelAndRlsPolicies',
      label: 'Database Schema, Auth Roles & RLS Isolation Model',
      documentCode: 'LIT-04-TECH-SPEC',
      stageKey: 'technical-spec',
      section: '2. Data Model & Security',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:technical-spec',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'apiAndIntegrationContracts',
      label: 'External APIs, Webhooks & Third-Party Integrations',
      documentCode: 'LIT-04-TECH-SPEC',
      stageKey: 'technical-spec',
      section: '3. API & Integration Contracts',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:onboarding',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'nfrPerformanceAndSla',
      label: 'Non-Functional Requirements, Core Web Vitals & Uptime Targets',
      documentCode: 'LIT-04-TECH-SPEC',
      stageKey: 'technical-spec',
      section: '4. Non-Functional Requirements & QA Criteria',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:checklist',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'clientTechnicalApprovalSignoff',
      label: 'Client Architecture Sign-Off',
      documentCode: 'LIT-04-TECH-SPEC',
      stageKey: 'technical-spec',
      section: '5. Architecture Freeze Approval',
      owner: 'client',
      autoPopulateFrom: 'stage_snapshot:technical-spec',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
  ],

  'LIT-05-CHANGE-REQUEST': [
    {
      key: 'crReference',
      label: 'Change Request Number (RFC)',
      documentCode: 'LIT-05-CHANGE-REQUEST',
      stageKey: 'development',
      section: 'Change Control Header',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'requestedChangeSummary',
      label: 'Requested Scope / Feature Addition Summary',
      documentCode: 'LIT-05-CHANGE-REQUEST',
      stageKey: 'development',
      section: '1. Change Description',
      owner: 'client',
      autoPopulateFrom: 'manual_entry',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'technicalImpactAssessment',
      label: 'Engineering & Schedule Impact Assessment',
      documentCode: 'LIT-05-CHANGE-REQUEST',
      stageKey: 'development',
      section: '2. Technical Impact Analysis',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'manual_entry',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'commercialDeltaPaise',
      label: 'Approved Commercial Delta (Super Admin Only)',
      documentCode: 'LIT-05-CHANGE-REQUEST',
      stageKey: 'development',
      section: '3. Commercial Impact',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'manual_entry',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
  ],

  'LIT-06-HANDOVER': [
    {
      key: 'handoverCertificateRef',
      label: 'Handover & IP Transfer Certificate ID',
      documentCode: 'LIT-06-HANDOVER',
      stageKey: 'handover',
      section: 'Certificate Control',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'deliveredModulesInventory',
      label: 'Final Delivered Modules & Production URLs',
      documentCode: 'LIT-06-HANDOVER',
      stageKey: 'handover',
      section: '1. Delivered Assets Inventory',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:delivery-acceptance',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'fullSettlementVerifiedFlag',
      label: '100% Milestone Payment Verification Status',
      documentCode: 'LIT-06-HANDOVER',
      stageKey: 'handover',
      section: '2. Financial Clearance & IP Assignment Trigger',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'verified_payment_reconciliation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'warrantyWindowStartAndEnd',
      label: 'Post-Launch Bug-Fix Warranty Window',
      documentCode: 'LIT-06-HANDOVER',
      stageKey: 'handover',
      section: '3. Warranty & Support Transition',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'clientFinalAcceptanceSignoff',
      label: 'Client Final Handover Sign-Off',
      documentCode: 'LIT-06-HANDOVER',
      stageKey: 'handover',
      section: '4. Execution',
      owner: 'client',
      autoPopulateFrom: 'client_identity',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
  ],

  'LIT-07-MAINTENANCE': [
    {
      key: 'retainerAgreementRef',
      label: 'Annual / Monthly Maintenance Retainer Reference',
      documentCode: 'LIT-07-MAINTENANCE',
      stageKey: 'support',
      section: 'Header',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'retainerDecision',
      label: 'Client Election (Accept Retainer / Decline Optional Retainer)',
      documentCode: 'LIT-07-MAINTENANCE',
      stageKey: 'support',
      section: '1. Service Election',
      owner: 'client',
      autoPopulateFrom: 'manual_entry',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'slaResponseTiers',
      label: 'P1/P2/P3 Incident Response SLA Tiers & Patch Cadence',
      documentCode: 'LIT-07-MAINTENANCE',
      stageKey: 'support',
      section: '2. SLA & Preventive Maintenance Scope',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:technical-spec',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'retainerFeePaise',
      label: 'Approved Retainer Fee (Super Admin Only)',
      documentCode: 'LIT-07-MAINTENANCE',
      stageKey: 'support',
      section: '3. Retainer Commercial Terms',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: false,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
  ],

  'LIT-QUOTATION': [
    {
      key: 'quotationNumber',
      label: 'Quotation Number',
      documentCode: 'LIT-QUOTATION',
      stageKey: 'proposal',
      section: 'Header',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'technicalScopeItems',
      label: 'Selected Technical Services & Deliverables',
      documentCode: 'LIT-QUOTATION',
      stageKey: 'proposal',
      section: 'Technical Scope',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:checklist',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'commercialPricingAndMilestones',
      label: 'Approved Commercial Pricing, GST & 50%/50% Milestones',
      documentCode: 'LIT-QUOTATION',
      stageKey: 'proposal',
      section: 'Commercial Schedule',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
  ],

  'LIT-INVOICE': [
    {
      key: 'invoiceNumber',
      label: 'Tax Invoice Number',
      documentCode: 'LIT-INVOICE',
      stageKey: 'initial-invoice',
      section: 'Invoice Header',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'milestoneDescription',
      label: 'Milestone Description & Technical Readiness Reference',
      documentCode: 'LIT-INVOICE',
      stageKey: 'initial-invoice',
      section: 'Line Items',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:sow',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'invoicePayableBreakdown',
      label: 'Approved Taxable Value, GST & Total Payable',
      documentCode: 'LIT-INVOICE',
      stageKey: 'initial-invoice',
      section: 'Tax & Totals',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
  ],

  'LIT-RECEIPT': [
    {
      key: 'receiptNumber',
      label: 'Official Payment Receipt Number',
      documentCode: 'LIT-RECEIPT',
      stageKey: 'initial-invoice',
      section: 'Receipt Header',
      owner: 'system',
      autoPopulateFrom: 'verified_payment_reconciliation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'verifiedUtrAndAmount',
      label: 'Verified Bank UTR & Settled Amount',
      documentCode: 'LIT-RECEIPT',
      stageKey: 'initial-invoice',
      section: 'Bank Reconciliation',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'verified_payment_reconciliation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
  ],

  'LIT-02-PROPOSAL': [
    {
      key: 'proposalReference',
      label: 'Project Proposal Reference',
      documentCode: 'LIT-02-PROPOSAL',
      stageKey: 'proposal',
      section: 'Document Control',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'clientLegalName',
      label: 'Client Legal Entity Name',
      documentCode: 'LIT-02-PROPOSAL',
      stageKey: 'proposal',
      section: 'Client Information',
      owner: 'client',
      autoPopulateFrom: 'enquiry_submission',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'projectSummary',
      label: 'Executive Summary & Proposed Architecture',
      documentCode: 'LIT-02-PROPOSAL',
      stageKey: 'proposal',
      section: 'Executive Summary',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:checklist',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'technicalScopeItems',
      label: 'Proposed Modules & Deliverables',
      documentCode: 'LIT-02-PROPOSAL',
      stageKey: 'proposal',
      section: 'Technical Scope',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:checklist',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'deliveryTimelineWeeks',
      label: 'Estimated Delivery Timeline (Weeks)',
      documentCode: 'LIT-02-PROPOSAL',
      stageKey: 'proposal',
      section: 'Timeline',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:proposal',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'contractSubtotalPaise',
      label: 'Subtotal Amount (Excl. Tax)',
      documentCode: 'LIT-02-PROPOSAL',
      stageKey: 'proposal',
      section: 'Commercial Investment',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'gstAmountPaise',
      label: '18% GST Amount (Paise)',
      documentCode: 'LIT-02-PROPOSAL',
      stageKey: 'proposal',
      section: 'Commercial Investment',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'totalContractValuePaise',
      label: 'Total Investment (Incl. GST)',
      documentCode: 'LIT-02-PROPOSAL',
      stageKey: 'proposal',
      section: 'Commercial Investment',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'milestone1DepositPaise',
      label: 'Milestone 1 Deposit (50%)',
      documentCode: 'LIT-02-PROPOSAL',
      stageKey: 'proposal',
      section: 'Payment Terms',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'milestone2SettlementPaise',
      label: 'Milestone 2 Final Settlement (50%)',
      documentCode: 'LIT-02-PROPOSAL',
      stageKey: 'proposal',
      section: 'Payment Terms',
      owner: 'super_admin_commercial',
      autoPopulateFrom: 'approved_commercial_quotation',
      required: true,
      financialSensitive: true,
      lockedAfterApproval: true,
    },
    {
      key: 'clientSignatoryName',
      label: 'Client Authorized Acceptance Signatory',
      documentCode: 'LIT-02-PROPOSAL',
      stageKey: 'proposal',
      section: 'Acceptance Block',
      owner: 'client',
      autoPopulateFrom: 'client_identity',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
  ],

  'LIT-05-DELIVERY': [
    {
      key: 'deliveryReportRef',
      label: 'Delivery & Acceptance Report Reference',
      documentCode: 'LIT-05-DELIVERY',
      stageKey: 'acceptance',
      section: 'Document Control',
      owner: 'system',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'clientLegalName',
      label: 'Client Legal Entity Name',
      documentCode: 'LIT-05-DELIVERY',
      stageKey: 'acceptance',
      section: 'Client Information',
      owner: 'client',
      autoPopulateFrom: 'client_identity',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'deliveredModulesInventory',
      label: 'Delivered Scope & Verified Deployments',
      documentCode: 'LIT-05-DELIVERY',
      stageKey: 'acceptance',
      section: 'Deliverables Verification',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'stage_snapshot:delivery-acceptance',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'acceptanceCriteriaVerified',
      label: 'Acceptance Criteria & Test Matrix Verification',
      documentCode: 'LIT-05-DELIVERY',
      stageKey: 'acceptance',
      section: 'QA & Compliance Sign-Off',
      owner: 'lit_staff_technical',
      autoPopulateFrom: 'system_generated',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
    {
      key: 'clientFinalAcceptanceSignoff',
      label: 'Client Final Delivery Acceptance Sign-Off',
      documentCode: 'LIT-05-DELIVERY',
      stageKey: 'acceptance',
      section: 'Formal Acceptance Execution',
      owner: 'client',
      autoPopulateFrom: 'client_identity',
      required: true,
      financialSensitive: false,
      lockedAfterApproval: true,
    },
  ],
};

export function getDocumentFieldDefinitions(
  docCode: DocumentCode,
  options?: { redactFinancials?: boolean }
): DocumentFieldSpec[] {
  const fields = MASTER_DOCUMENT_FIELD_REGISTRY[docCode] ?? [];
  if (options?.redactFinancials) {
    return fields.filter((f) => !f.financialSensitive);
  }
  return fields;
}

export function canActorEditDocumentField(
  docCode: DocumentCode,
  fieldKey: string,
  actorRole: StaffRole | 'client',
  isDocumentApproved = false
): boolean {
  const field = (MASTER_DOCUMENT_FIELD_REGISTRY[docCode] ?? []).find((f) => f.key === fieldKey);
  if (!field) return false;
  if (isDocumentApproved && field.lockedAfterApproval) {
    return false;
  }

  switch (field.owner) {
    case 'system':
      return false;
    case 'super_admin_commercial':
      return actorRole === 'super_admin';
    case 'lit_staff_technical':
      return actorRole === 'super_admin' || actorRole === 'admin' || actorRole === 'operations';
    case 'legal_review':
      return actorRole === 'super_admin' || actorRole === 'admin';
    case 'client':
      return actorRole === 'client' || actorRole === 'super_admin';
    default:
      return false;
  }
}

export interface AutoPopulationContext {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  registeredAddress?: string | null;
  projectSummary?: string | null;
  selectedChecklistItems?: string[];
  approvedScopeModules?: string[];
  deliveryTimelineWeeks?: string;
  approvedSubtotalPaise?: number | null;
  approvedGstPaise?: number | null;
  approvedTotalPaise?: number | null;
  verifiedUtr?: string | null;
}

export function resolveAutoPopulatedDocumentFields(
  docCode: DocumentCode,
  context: AutoPopulationContext,
  options?: { redactFinancials?: boolean }
): Record<string, unknown> {
  const specs = getDocumentFieldDefinitions(docCode, options);
  const resolved: Record<string, unknown> = {};

  for (const spec of specs) {
    switch (spec.key) {
      case 'checklistRef':
      case 'agreementReference':
      case 'sowReference':
      case 'onboardingRef':
      case 'crReference':
      case 'handoverCertificateRef':
      case 'retainerAgreementRef':
      case 'quotationNumber':
      case 'proposalReference':
      case 'deliveryReportRef':
        resolved[spec.key] = `${docCode}-${context.engagementRef}`;
        break;
      case 'effectiveDate':
        resolved[spec.key] = new Date().toISOString().slice(0, 10);
        break;
      case 'clientLegalName':
      case 'disclosingPartyLegalName':
        resolved[spec.key] = context.companyName;
        break;
      case 'primaryContactEmail':
        resolved[spec.key] = context.contactEmail;
        break;
      case 'disclosingPartyAddress':
        resolved[spec.key] = context.registeredAddress ?? 'Pending client address confirmation';
        break;
      case 'permittedPurpose':
        resolved[spec.key] =
          context.projectSummary ??
          `Enterprise architecture, engineering, and software delivery for ${context.companyName}`;
        break;
      case 'projectSummary':
        resolved[spec.key] =
          context.projectSummary ??
          `Enterprise software engineering and digital infrastructure architecture for ${context.companyName}`;
        break;
      case 'acceptanceCriteriaVerified':
        resolved[spec.key] = true;
        break;
      case 'confidentialityTermYears':
        resolved[spec.key] = 3;
        break;
      case 'governingLawJurisdiction':
        resolved[spec.key] = 'Laws of India; Exclusive Jurisdiction of Courts in Chennai, Tamil Nadu';
        break;
      case 'signoffAuthorizationName':
      case 'clientSignatoryName':
      case 'clientSignerName':
      case 'clientFinalAcceptanceSignoff':
        resolved[spec.key] = context.contactName;
        break;
      case 'selectedChecklistItems':
        resolved[spec.key] = context.selectedChecklistItems ?? [];
        break;
      case 'scopeOfWorkModules':
      case 'technicalScopeItems':
      case 'deliveredModulesInventory':
        resolved[spec.key] = context.approvedScopeModules ?? [];
        break;
      case 'deliveryTimelineWeeks':
        resolved[spec.key] = context.deliveryTimelineWeeks ?? '8–12 Weeks (Milestone Governed)';
        break;
      case 'contractSubtotalPaise':
        resolved[spec.key] = options?.redactFinancials ? undefined : (context.approvedSubtotalPaise ?? null);
        break;
      case 'gstAmountPaise':
        resolved[spec.key] = options?.redactFinancials ? undefined : (context.approvedGstPaise ?? null);
        break;
      case 'totalContractValuePaise':
        resolved[spec.key] = options?.redactFinancials ? undefined : (context.approvedTotalPaise ?? null);
        break;
      case 'milestone1DepositPaise':
        resolved[spec.key] =
          options?.redactFinancials || context.approvedTotalPaise == null
            ? undefined
            : Math.floor(context.approvedTotalPaise / 2);
        break;
      case 'milestone2SettlementPaise':
        resolved[spec.key] =
          options?.redactFinancials || context.approvedTotalPaise == null
            ? undefined
            : context.approvedTotalPaise - Math.floor(context.approvedTotalPaise / 2);
        break;
      default:
        resolved[spec.key] = null;
        break;
    }
  }

  return resolved;
}
