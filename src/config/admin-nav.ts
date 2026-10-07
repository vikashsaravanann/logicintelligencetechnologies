/**
 * Canonical admin navigation, grouped and capability-gated.
 * Command Center (/admin/command-center) is the admin dashboard home.
 *
 * Every href must resolve to a real page (enforced by tests/admin/admin-nav).
 * New destinations are added in the batch that ships their page.
 */
import { hasCapability, type Capability, type StaffRole } from "@/config/roles";

export const ADMIN_DASHBOARD_PATH = "/admin/command-center" as const;

export interface AdminNavItem {
  label: string;
  href: string;
  capability: Capability;
  match: (pathname: string) => boolean;
}
export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

const startsWith = (prefix: string) => (p: string) => p === prefix || p.startsWith(prefix + "/");

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Command Center", href: ADMIN_DASHBOARD_PATH, capability: "dashboard.view",
        match: (p) => p === "/admin" || p === ADMIN_DASHBOARD_PATH },
      { label: "Analytics", href: "/admin/analytics", capability: "analytics.read", match: startsWith("/admin/analytics") },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { label: "Leads", href: "/admin/leads", capability: "leads.read", match: startsWith("/admin/leads") },
      { label: "AI Leads", href: "/admin/ai-leads", capability: "leads.read", match: startsWith("/admin/ai-leads") },
      { label: "Bookings", href: "/admin/bookings", capability: "bookings.read", match: startsWith("/admin/bookings") },
      { label: "VoiceShield", href: "/admin/voiceshield-requests", capability: "voiceshield.read", match: startsWith("/admin/voiceshield-requests") },
      { label: "Outreach", href: "/admin/outreach", capability: "outreach.read", match: (p) => p === "/admin/outreach" },
    ],
  },
  {
    label: "Lead Operations",
    items: [
      { label: "Outreach Studio", href: "/admin/outreach/studio", capability: "outreach.manage", match: startsWith("/admin/outreach/studio") },
      { label: "Message Playbook", href: "/admin/outreach/playbook", capability: "outreach.read", match: startsWith("/admin/outreach/playbook") },
    ],
  },
  {
    label: "Clients",
    items: [
      { label: "Clients", href: "/admin/clients", capability: "clients.read", match: startsWith("/admin/clients") },
      { label: "Documents", href: "/admin/documents", capability: "documents.read", match: startsWith("/admin/documents") },
      { label: "Onboarding", href: "/admin/onboarding", capability: "onboarding.manage", match: startsWith("/admin/onboarding") },
      { label: "Proposals", href: "/admin/proposals", capability: "proposals.read", match: startsWith("/admin/proposals") },
      { label: "Invoices", href: "/admin/invoices", capability: "invoices.read", match: startsWith("/admin/invoices") },
    ],
  },
  {
    label: "Comms",
    items: [
      { label: "Support", href: "/admin/support", capability: "support.read", match: startsWith("/admin/support") },
      { label: "Emails", href: "/admin/emails", capability: "emails.read", match: startsWith("/admin/emails") },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Automations", href: "/admin/automations", capability: "automations.read", match: startsWith("/admin/automations") },
      { label: "System Status", href: "/admin/status", capability: "status.read", match: startsWith("/admin/status") },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Team", href: "/admin/team", capability: "team.read", match: startsWith("/admin/team") },
      { label: "Audit Log", href: "/admin/audit", capability: "audit.read", match: startsWith("/admin/audit") },
    ],
  },
];

/** Groups filtered to the items a role can see; empty groups dropped. */
export function navForRole(role: StaffRole | null | undefined): AdminNavGroup[] {
  return ADMIN_NAV_GROUPS.map((g) => ({
    label: g.label,
    items: g.items.filter((i) => hasCapability(role, i.capability)),
  })).filter((g) => g.items.length > 0);
}

/** Every nav href, for the nav-coverage test. */
export function allNavHrefs(): string[] {
  return ADMIN_NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));
}

/**
 * Serializable nav shapes for passing from the server AdminShell to the client
 * nav components. The `match` predicate is a function and CANNOT cross the
 * server→client boundary (React throws "Functions cannot be passed to Client
 * Components"), so the client receives only label+href and derives the active
 * state with isActiveNav() below.
 */
export interface AdminNavLinkView {
  label: string;
  href: string;
}
export interface AdminNavGroupView {
  label: string;
  items: AdminNavLinkView[];
}

/** Capability-filtered nav for a role, reduced to serializable label+href. */
export function navViewForRole(role: StaffRole | null | undefined): AdminNavGroupView[] {
  return navForRole(role).map((g) => ({
    label: g.label,
    items: g.items.map((i) => ({ label: i.label, href: i.href })),
  }));
}

/**
 * Active-state rule for a nav href, mirroring the `match` predicates in
 * ADMIN_NAV_GROUPS: the dashboard is active on "/admin" and the command-center
 * path; every other item is active on its href or any sub-path.
 */
export function isActiveNav(pathname: string, href: string): boolean {
  if (href === ADMIN_DASHBOARD_PATH) {
    return pathname === "/admin" || pathname === ADMIN_DASHBOARD_PATH;
  }
  return pathname === href || pathname.startsWith(href + "/");
}
