import { sendEmail, EmailAttachment } from '@/lib/email/send-email';
import { COMPANY } from '@/config/company';
import { CANONICAL_13_STAGES, ClientEngagement, StageKey, ORDERED_STAGE_KEYS } from './types';
import { ENTERPRISE_CHECKPOINTS } from '@/data/enterpriseDeploymentChecklist';
import StageSubmissionClientReceiptEmail, { StageDetailItem } from '../../../emails/stage-submission-client-receipt-email';
import StageSubmissionAdminAlertEmail from '../../../emails/stage-submission-admin-alert-email';
import StageApprovedClientEmail from '../../../emails/stage-approved-client-email';

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'hello@logicintelligencetechnologies.in';

interface NotifyStageSubmissionInput {
  engagement: ClientEngagement;
  stageKey: StageKey;
  action: string;
  payload: Record<string, any>;
}

interface NotifyStageApprovalInput {
  engagement: ClientEngagement;
  approvedStageKey: StageKey;
  nextStageKey?: StageKey | null;
  adminNotes?: string;
  attachments?: EmailAttachment[];
}

/**
 * Builds human-readable details list from stage payload for emails
 */
function extractStageDetails(stageKey: StageKey, payload: Record<string, any>, action?: string): { summary: string; details: StageDetailItem[] } {
  const details: StageDetailItem[] = [];
  let summary = 'Client submitted stage information';

  if (action === 'request_revision') {
    summary = 'Revision requested by client';
    if (payload.revisionNotes || payload.notes) {
      details.push({ label: 'Revision Notes', value: String(payload.revisionNotes || payload.notes) });
    }
  } else if (action === 'ask_question') {
    summary = 'Question / clarification inquiry submitted by client';
    if (payload.question || payload.notes) {
      details.push({ label: 'Inquiry', value: String(payload.question || payload.notes) });
    }
  } else if (action === 'report_payment') {
    summary = 'Payment reported with UTR; pending Super Admin verification';
  }

  switch (stageKey) {
    case 'checklist': {
      const selected = Array.isArray(payload.selectedItems)
        ? payload.selectedItems.map((n: any) => Number(n)).filter((n: number) => !isNaN(n))
        : [];
      const count = selected.length || payload.totalSelected || 0;
      summary = `${count} of 50 enterprise deployment checkpoints selected`;

      details.push({ label: 'Selected Checkpoints Count', value: `${count} of 50` });
      if (payload.submittedByName) {
        details.push({ label: 'Submitted By', value: String(payload.submittedByName) });
      }
      if (payload.notes) {
        details.push({ label: 'Client Notes', value: String(payload.notes) });
      }

      // Add sample of selected checkpoint titles
      if (selected.length > 0) {
        const sampleTitles = selected
          .slice(0, 5)
          .map((num: number) => {
            const cp = ENTERPRISE_CHECKPOINTS.find((c) => c.number === num);
            return cp ? `#${num} ${cp.title}` : `#${num}`;
          })
          .join(', ');
        const extraText = selected.length > 5 ? ` (+${selected.length - 5} more)` : '';
        details.push({ label: 'Sample Checkpoints', value: `${sampleTitles}${extraText}` });
      }
      break;
    }

    case 'discovery': {
      summary = 'Discovery requirements and meeting consultation preferences recorded';
      if (payload.meetingDate) {
        details.push({ label: 'Preferred Meeting Date', value: String(payload.meetingDate) });
      }
      if (payload.meetingTime) {
        details.push({ label: 'Preferred Time Slot', value: String(payload.meetingTime) });
      }
      if (payload.customNote) {
        details.push({ label: 'Scoping Notes', value: String(payload.customNote) });
      }
      if (payload.technicalAnswers?.cloudProvider) {
        details.push({ label: 'Primary Cloud', value: String(payload.technicalAnswers.cloudProvider) });
      }
      if (payload.technicalAnswers?.databasePreference) {
        details.push({ label: 'Database Preference', value: String(payload.technicalAnswers.databasePreference) });
      }
      break;
    }

    case 'proposal': {
      summary = 'Proposal / Commercial terms reviewed';
      if (payload.revisionNotes) {
        details.push({ label: 'Revision Requested', value: String(payload.revisionNotes) });
      } else {
        details.push({ label: 'Decision', value: 'Proposal accepted by client' });
      }
      break;
    }

    case 'acceptance': {
      summary = 'Commercial proposal digitally accepted';
      if (payload.signatoryName) {
        details.push({ label: 'Signatory Name', value: String(payload.signatoryName) });
      }
      if (payload.signatoryEmail) {
        details.push({ label: 'Signatory Email', value: String(payload.signatoryEmail) });
      }
      if (payload.signatoryDesignation) {
        details.push({ label: 'Designation / Title', value: String(payload.signatoryDesignation) });
      }
      break;
    }

    case 'sow': {
      summary = 'Statement of Work (SOW) / Agreement digitally signed';
      if (payload.signatoryName) {
        details.push({ label: 'Signatory Name', value: String(payload.signatoryName) });
      }
      if (payload.signatoryEmail) {
        details.push({ label: 'Signatory Email', value: String(payload.signatoryEmail) });
      }
      details.push({ label: 'Terms Assent', value: 'Agreed to Master Services Agreement terms' });
      break;
    }

    case 'initial-invoice':
    case 'final-payment': {
      summary = stageKey === 'initial-invoice' ? 'Initial 50% deposit payment reported' : 'Final 50% settlement payment reported';
      if (payload.utr) {
        details.push({ label: 'Reported 12-Digit UTR', value: String(payload.utr) });
      }
      if (payload.amount || payload.reportedAmount) {
        const amt = payload.amount || payload.reportedAmount;
        details.push({ label: 'Amount Reported', value: `₹${amt}` });
      }
      if (payload.legalName) {
        details.push({ label: 'Billing Legal Name', value: String(payload.legalName) });
      }
      if (payload.gstin) {
        details.push({ label: 'Client GSTIN', value: String(payload.gstin) });
      }
      if (payload.paymentProofUrl) {
        details.push({ label: 'Payment Proof', value: String(payload.paymentProofUrl) });
      }
      break;
    }

    case 'onboarding': {
      summary = 'Client onboarding questionnaire & credentials intake completed';
      if (payload.primaryContact) {
        details.push({ label: 'Technical Contact', value: String(payload.primaryContact) });
      }
      if (payload.repoUrl) {
        details.push({ label: 'Repository URL', value: String(payload.repoUrl) });
      }
      if (payload.techStack) {
        details.push({ label: 'Tech Stack', value: String(payload.techStack) });
      }
      break;
    }

    case 'technical-spec': {
      summary = 'Technical Specification Architecture Blueprint approved';
      if (payload.approvedBy) {
        details.push({ label: 'Approved By', value: String(payload.approvedBy) });
      }
      if (payload.specVersion) {
        details.push({ label: 'Spec Version', value: String(payload.specVersion) });
      }
      break;
    }

    case 'development': {
      summary = 'Sprint milestone update or Change Request (RFC) submitted';
      if (payload.rfcTitle) {
        details.push({ label: 'RFC Title', value: String(payload.rfcTitle) });
      }
      if (payload.currentSprint) {
        details.push({ label: 'Sprint', value: String(payload.currentSprint) });
      }
      break;
    }

    case 'delivery-acceptance': {
      summary = 'Formal Delivery Acceptance sign-off completed';
      if (payload.acceptedBy) {
        details.push({ label: 'Accepted By', value: String(payload.acceptedBy) });
      }
      if (payload.signoffRole) {
        details.push({ label: 'Role', value: String(payload.signoffRole) });
      }
      break;
    }

    case 'handover': {
      summary = 'Production handover and IP / accounts transfer confirmed';
      if (payload.confirmedBy) {
        details.push({ label: 'Confirmed By', value: String(payload.confirmedBy) });
      }
      details.push({ label: 'Handover Status', value: 'Repository & infrastructure access accepted' });
      break;
    }

    case 'support': {
      summary = 'Support SLA ticket or inquiry submitted';
      if (payload.ticketTitle) {
        details.push({ label: 'Ticket Title', value: String(payload.ticketTitle) });
      }
      if (payload.severity) {
        details.push({ label: 'Severity', value: String(payload.severity) });
      }
      if (payload.description) {
        details.push({ label: 'Description', value: String(payload.description) });
      }
      break;
    }

    default:
      summary = `Information submitted for ${stageKey}`;
  }

  return { summary, details };
}

/**
 * Dispatches dual email notifications when a client submits any stage:
 * 1. Email to the Client (receipt of submission)
 * 2. Email to the Admin (alert with direct console review link)
 */
export async function notifyStageSubmitted(input: NotifyStageSubmissionInput): Promise<{ clientEmailed: boolean; adminEmailed: boolean }> {
  const { engagement, stageKey, payload } = input;
  const stageDef = CANONICAL_13_STAGES[stageKey];
  if (!stageDef) return { clientEmailed: false, adminEmailed: false };

  const currentIndex = ORDERED_STAGE_KEYS.indexOf(stageKey);
  const nextKey = currentIndex >= 0 && currentIndex < ORDERED_STAGE_KEYS.length - 1 ? ORDERED_STAGE_KEYS[currentIndex + 1] : null;
  const nextDef = nextKey ? CANONICAL_13_STAGES[nextKey] : null;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl).replace(/\/$/, '');
  const portalUrl = `${siteUrl}/engagement/${engagement.engagement_ref}/${stageKey}`;
  const adminPortalUrl = `${siteUrl}/admin/engagements/${engagement.id}`;

  const { summary, details } = extractStageDetails(stageKey, payload, input.action);

  let clientEmailed = false;
  let adminEmailed = false;

  let subjectPrefix = 'Submission Confirmed';
  if (input.action === 'request_revision') {
    subjectPrefix = 'Revision Requested';
  } else if (input.action === 'ask_question') {
    subjectPrefix = 'Question / Inquiry Received';
  } else if (input.action === 'report_payment') {
    subjectPrefix = 'Payment Reported (Pending Verification)';
  }

  // 1. Email to Client
  if (engagement.contact_email) {
    try {
      const res = await sendEmail({
        to: engagement.contact_email,
        from: 'hello',
        subject: `LIT | ${subjectPrefix}: Stage ${stageDef.ordinal} - ${stageDef.shortTitle} (${engagement.engagement_ref})`,
        category: 'transactional',
        eventType: 'client-stage-submission',
        templateKey: 'stage-submission-client-receipt-email',
        react: StageSubmissionClientReceiptEmail({
          recipientName: engagement.contact_name,
          companyName: engagement.company_name,
          engagementRef: engagement.engagement_ref,
          stageOrdinal: stageDef.ordinal,
          stageTitle: stageDef.title,
          submittedSummary: summary,
          detailsList: details,
          portalUrl,
          nextStageTitle: nextDef ? nextDef.title : undefined,
        }),
      });
      clientEmailed = res.success;
    } catch (err) {
      console.warn('[notifyStageSubmitted] Failed to send client receipt email:', err);
    }
  }

  // 2. Email to Admin
  try {
    const adminRes = await sendEmail({
      to: ADMIN_EMAIL,
      from: 'hello',
      subject: `[ADMIN ALERT] ${engagement.company_name} - ${subjectPrefix}: Stage ${stageDef.ordinal}: ${stageDef.shortTitle}`,
      category: 'transactional',
      eventType: 'admin-stage-submission-alert',
      templateKey: 'stage-submission-admin-alert-email',
      react: StageSubmissionAdminAlertEmail({
        companyName: engagement.company_name,
        contactName: engagement.contact_name,
        contactEmail: engagement.contact_email,
        engagementRef: engagement.engagement_ref,
        stageOrdinal: stageDef.ordinal,
        stageTitle: stageDef.title,
        submittedSummary: summary,
        detailsList: details,
        adminPortalUrl,
      }),
    });
    adminEmailed = adminRes.success;
  } catch (err) {
    console.warn('[notifyStageSubmitted] Failed to send admin alert email:', err);
  }

  return { clientEmailed, adminEmailed };
}

/**
 * Dispatches an email to the client when an Admin approves/verifies a stage,
 * informing them that Stage X was approved and Stage X+1 has unlocked!
 * Never invents Stage 14 (MAIL03).
 */
export async function notifyStageApproved(input: NotifyStageApprovalInput): Promise<{ ok: boolean }> {
  const { engagement, approvedStageKey, nextStageKey, adminNotes } = input;
  const approvedDef = CANONICAL_13_STAGES[approvedStageKey];
  if (!approvedDef || !engagement.contact_email) return { ok: false };

  const isFinalStage = approvedDef.ordinal === 13;
  let nextKey: StageKey | null = null;
  let nextDef = null;

  if (!isFinalStage && nextStageKey !== null) {
    if (nextStageKey !== undefined) {
      nextKey = nextStageKey;
    } else {
      const currentIndex = ORDERED_STAGE_KEYS.indexOf(approvedStageKey);
      if (currentIndex >= 0 && currentIndex < ORDERED_STAGE_KEYS.length - 1) {
        nextKey = ORDERED_STAGE_KEYS[currentIndex + 1];
      }
    }
    nextDef = nextKey ? CANONICAL_13_STAGES[nextKey] : null;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl).replace(/\/$/, '');
  const nextStageUrl = nextKey
    ? `${siteUrl}/engagement/${engagement.engagement_ref}/${nextKey}`
    : `${siteUrl}/engagement/${engagement.engagement_ref}`;

  const subject = isFinalStage
    ? `LIT | Stage 13 Approved · Project Completed & Handed Over (${engagement.engagement_ref})`
    : `LIT | Stage ${approvedDef.ordinal} Approved! Unlock Stage ${nextDef ? nextDef.ordinal : ''}: ${nextDef ? nextDef.shortTitle : 'Next Milestone'}`;

  try {
    const res = await sendEmail({
      to: engagement.contact_email,
      from: 'hello',
      subject,
      category: 'transactional',
      eventType: 'client-stage-approved',
      templateKey: 'stage-approved-client-email',
      react: StageApprovedClientEmail({
        recipientName: engagement.contact_name,
        companyName: engagement.company_name,
        engagementRef: engagement.engagement_ref,
        approvedStageOrdinal: approvedDef.ordinal,
        approvedStageTitle: approvedDef.title,
        nextStageOrdinal: nextDef ? nextDef.ordinal : null,
        nextStageTitle: nextDef ? nextDef.title : 'Ongoing Technical Support',
        nextStageUrl,
        adminNotes,
      }),
      attachments: input.attachments,
    });
    return { ok: res.success };
  } catch (err) {
    console.warn('[notifyStageApproved] Failed to send approval email:', err);
    return { ok: false };
  }
}
