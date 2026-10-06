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
  "leads.read",
  "leads.write",
  "bookings.read",
  "bookings.write",
  "proposals.read",
  "proposals.write",
  "proposals.send",
  "invoices.read",
  "invoices.write",
  "support.read",
  "support.reply",
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
  "automations.read",
  "automations.retry",
  "automations.sync",
  "status.read",
  "analytics.read",
  "audit.read",
  "team.read",
  "team.manage",
] as const;
export type Capability = (typeof CAPABILITIES)[number];

const ALL: readonly Capability[] = CAPABILITIES;

// admin has everything except managing staff roles (super_admin only).
const ADMIN: readonly Capability[] = CAPABILITIES.filter((c) => c !== "team.manage");

const OPERATIONS: readonly Capability[] = [
  "dashboard.view",
  "leads.read", "leads.write",
  "bookings.read", "bookings.write",
  "proposals.read", "proposals.write", "proposals.send",
  "invoices.read", "invoices.write",
  "support.read",
  "outreach.read", "outreach.manage",
  "emails.read", "emails.send",
  "voiceshield.read", "voiceshield.approve",
  "clients.read", "clients.write",
  "contracts.read",
  "documents.read", "documents.upload", "documents.review", "documents.download",
  "onboarding.manage",
  "automations.read", "automations.retry",
  "status.read", "analytics.read",
];

const SUPPORT: readonly Capability[] = [
  "dashboard.view",
  "support.read", "support.reply",
  "leads.read",
  "bookings.read",
  "clients.read",
  "documents.read",
  "status.read",
];

const DEVELOPER: readonly Capability[] = [
  "dashboard.view",
  "status.read",
  "automations.read", "automations.retry",
  "clients.read",
  "documents.read",
];

const VIEWER: readonly Capability[] = [
  "dashboard.view",
  "analytics.read",
  "status.read",
  "proposals.read",
  "clients.read",
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
