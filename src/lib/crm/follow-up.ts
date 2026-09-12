/**
 * Automated Follow-up Sequence Engine for Logic Intelligence Technologies
 * Manages 5-step nurturing sequences (Days 0, 1, 3, 7, 14) with automatic suppression.
 */

export interface FollowUpStep {
  day: number;
  subject: string;
  templateId: string;
  objective: string;
}

export const STANDARD_NURTURE_SEQUENCE: FollowUpStep[] = [
  {
    day: 0,
    subject: 'Thank You for Contacting Logic Intelligence Technologies',
    templateId: 'contact_confirmation',
    objective: 'Immediate confirmation of inquiry and expected response time.',
  },
  {
    day: 1,
    subject: 'Quick Follow-Up: Your Software Architecture & Requirements',
    templateId: 'helpful_followup',
    objective: 'Offer architectural insights and clarify project timeline.',
  },
  {
    day: 3,
    subject: 'Curated Resource: Modern Full-Stack & AI Capability Brief',
    templateId: 'resource_followup',
    objective: 'Provide case studies and technical benchmarks.',
  },
  {
    day: 7,
    subject: 'Direct Invitation: 30-Minute Technical Scoping Call',
    templateId: 'consultation_invite',
    objective: 'Drive lead to book a consultation slot.',
  },
  {
    day: 14,
    subject: 'Closing the Loop — Logic Intelligence Technologies',
    templateId: 'final_followup',
    objective: 'Polite wrap-up and permanent open door.',
  },
];

export interface SuppressionCheckInput {
  hasReplied?: boolean;
  hasBookedMeeting?: boolean;
  isQualified?: boolean;
  hasUnsubscribed?: boolean;
  hasBecameCustomer?: boolean;
  manualOptOut?: boolean;
}

export function shouldSuppressFollowUp(input: SuppressionCheckInput): boolean {
  return Boolean(
    input.hasReplied ||
    input.hasBookedMeeting ||
    input.isQualified ||
    input.hasUnsubscribed ||
    input.hasBecameCustomer ||
    input.manualOptOut
  );
}
