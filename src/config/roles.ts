/**
 * Staff roles and capabilities for the Command Center.
 *
 * Pure module (no server-only imports) so middleware, pages, server actions and
 * tests can all import it. Authorization is role → capability; a page or action
 * declares the capability it needs and the resolver checks the signed-in user's
 * role against this matrix. profiles.role is the single source of truth and is
 * protected by the guard_profile_role and protect_last_super_admin triggers.
 */

export const STAFF_ROLES = [
  "super_admin",
  "admin",
  "operations",
  "support",
  "developer",
  "viewer",
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

/** Roles that are assignable to an account (staff + the two client-side roles). */
export const ASSIGNABLE_ROLES = [...STAFF_ROLES, "user", "client"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const CAPABILITIES = [
  "dashboard.view",
  "tasks.manage",
  "projects.assigned.read",
  "leads.read",
  "leads.write",
  "bookings.read",
  "bookings.write",
  "proposals.read",
  "proposals.write",
  "proposals.send",
  "quotation.technical_draft.read",
  "quotation.technical_draft.create",
  "quotation.technical_draft.update",
  "quotation.technical_draft.submit_for_approval",
  "quotation.price.read",
  "quotation.price.write",
  "quotation.commercial.approve",
  "quotation.publish",
  "quotation.send",
  "quotation.revoke",
  "coupon.read",
  "coupon.manage",
  "coupon.activate",
  "coupon.apply",
  "invoices.read",
  "invoices.write",
  "invoice.preparation.read",
  "invoice.preparation.create",
  "invoice.preparation.update",
  "invoice.preparation.submit_for_approval",
  "invoice.price.manage",
  "invoice.issue",
  "invoice.send",
  "payment.verify",
  "engagement.pricing.manage",
  "engagement.stage.approve",
  "engagement.identity_change.approve",
  "support.read",
  "support.reply",
  "support.assigned_client.read",
  "support.assigned_client.assist",
  "support.assignment.manage",
  "outreach.read",
  "outreach.manage",
  "emails.read",
  "emails.send",
  "voiceshield.read",
  "voiceshield.approve",
  "clients.read",
  "clients.write",
  "contracts.read",
  "contracts.record_signature",
  "documents.read",
  "documents.upload",
  "documents.review",
  "documents.approve",
  "documents.issue",
  "documents.download",
  "onboarding.manage",
  "checklists.read",
  "checklists.write",
  "checklists.send",
  "automations.read",
  "automations.retry",
  "automations.sync",
  "automations.manage",
  "approvals.decide",
  "seo.read",
  "seo.manage",
  "cdn.read",
  "cdn.manage",
  "status.read",
  "analytics.read",
  "audit.read",
  "team.read",
  "team.manage",
] as const;
export type Capability = (typeof CAPABILITIES)[number];

/**
 * Policy 1 & Policy 2: Capabilities strictly reserved for Super Admin.
 * No staff role (admin, operations, support, developer, viewer) may price,
 * discount, approve commercial terms, publish/send quotations, issue invoices,
 * verify bank payments, approve final engagement stages/identity changes, or
 * manage staff-client assignments.
 */
export const SUPER_ADMIN_ONLY_CAPABILITIES = [
  "team.manage",
  "proposals.write",
  "proposals.send",
  "quotation.price.read",
  "quotation.price.write",
  "quotation.commercial.approve",
  "quotation.publish",
  "quotation.send",
  "quotation.revoke",
  "coupon.read",
  "coupon.manage",
  "coupon.activate",
  "coupon.apply",
  "invoices.write",
  "invoice.price.manage",
  "invoice.issue",
  "invoice.send",
  "payment.verify",
  "engagement.pricing.manage",
  "engagement.stage.approve",
  "engagement.identity_change.approve",
  "documents.approve",
  "documents.issue",
  "contracts.record_signature",
  "approvals.decide",
  "support.assignment.manage",
] as const satisfies readonly Capability[];

const ALL: readonly Capability[] = CAPABILITIES;

// admin holds operational & technical preparation capabilities, never Super Admin commercial/pricing/team capabilities.
const ADMIN: readonly Capability[] = CAPABILITIES.filter(
  (c) => !(SUPER_ADMIN_ONLY_CAPABILITIES as readonly string[]).includes(c)
);

const OPERATIONS: readonly Capability[] = [
  "dashboard.view",
  "tasks.manage",
  "projects.assigned.read",
  "leads.read", "leads.write",
  "bookings.read", "bookings.write",
  "proposals.read",
  "quotation.technical_draft.read",
  "quotation.technical_draft.create",
  "quotation.technical_draft.update",
  "quotation.technical_draft.submit_for_approval",
  "invoices.read",
  "invoice.preparation.read",
  "invoice.preparation.create",
  "invoice.preparation.update",
  "invoice.preparation.submit_for_approval",
  "support.read",
  "support.assigned_client.read",
  "support.assigned_client.assist",
  "outreach.read", "outreach.manage",
  "emails.read", "emails.send",
  "voiceshield.read", "voiceshield.approve",
  "clients.read", "clients.write",
  "contracts.read",
  "documents.read", "documents.upload", "documents.review", "documents.download",
  "onboarding.manage",
  "checklists.read", "checklists.write", "checklists.send",
  "automations.read", "automations.retry", "automations.manage",
  "seo.read", "seo.manage",
  "cdn.read", "cdn.manage",
  "status.read", "analytics.read",
];

const SUPPORT: readonly Capability[] = [
  "dashboard.view",
  "tasks.manage",
  "projects.assigned.read",
  "support.read", "support.reply",
  "support.assigned_client.read",
  "support.assigned_client.assist",
  "leads.read",
  "bookings.read",
  "clients.read",
  "documents.read",
  "checklists.read",
  "status.read",
];

const DEVELOPER: readonly Capability[] = [
  "dashboard.view",
  "tasks.manage",
  "projects.assigned.read",
  "status.read",
  "automations.read", "automations.retry", "automations.manage",
  "seo.read", "seo.manage",
  "cdn.read", "cdn.manage",
  "clients.read",
  "documents.read",
  "checklists.read",
];

const VIEWER: readonly Capability[] = [
  "dashboard.view",
  "projects.assigned.read",
  "analytics.read",
  "status.read",
  "proposals.read",
  "clients.read",
  "checklists.read",
  "automations.read",
  "seo.read",
  "cdn.read",
  // read-only: documents metadata but NOT documents.download
];

export const ROLE_CAPABILITIES: Record<StaffRole, readonly Capability[]> = {
  super_admin: ALL,
  admin: ADMIN,
  operations: OPERATIONS,
  support: SUPPORT,
  developer: DEVELOPER,
  viewer: VIEWER,
};

export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  operations: "Operations",
  support: "Support",
  developer: "Developer",
  viewer: "Viewer",
};

export function isStaffRole(role: unknown): role is StaffRole {
  return typeof role === "string" && (STAFF_ROLES as readonly string[]).includes(role);
}

/** True only when `role` is a known staff role that holds `cap`. Unknown → false. */
export function hasCapability(role: string | null | undefined, cap: Capability): boolean {
  if (!isStaffRole(role)) return false;
  return ROLE_CAPABILITIES[role].includes(cap);
}
