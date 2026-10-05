/** Canonical lifecycle stages for outreach pipeline */
export const LEAD_LIFECYCLE_STAGES = [
  "NEW",
  "QUALIFIED",
  "CONTACTED",
  "ENGAGED",
  "REPLIED",
  "MEETING_REQUESTED",
  "MEETING_BOOKED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
  "NURTURE",
  "UNSUBSCRIBED",
  "SUPPRESSED",
] as const;

export type LeadLifecycleStage = (typeof LEAD_LIFECYCLE_STAGES)[number];

export const COMMUNICATION_STATUSES = [
  "NEVER_CONTACTED",
  "QUEUED",
  "SENT",
  "DELIVERED",
  "BOUNCED",
  "COMPLAINT",
  "REPLIED",
  "UNSUBSCRIBED",
  "SUPPRESSED",
] as const;

export type CommunicationStatus = (typeof COMMUNICATION_STATUSES)[number];

export const CAMPAIGN_STATUSES = [
  "DRAFT",
  "READY",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "ARCHIVED",
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const ENROLLMENT_STATUSES = [
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "STOPPED",
  "SKIPPED",
] as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

/** Stages that stop automated marketing sequences */
export const STOP_LIFECYCLE_STAGES: LeadLifecycleStage[] = [
  "REPLIED",
  "WON",
  "LOST",
  "UNSUBSCRIBED",
  "SUPPRESSED",
];
