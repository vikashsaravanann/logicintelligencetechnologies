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
      { label: "Outreach", href: "/admin/outreach", capability: "outreach.read", match: startsWith("/admin/outreach") },
    ],
  },
  {
    label: "Clients",
    items: [
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
