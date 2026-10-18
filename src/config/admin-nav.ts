/**
 * Canonical admin navigation, grouped and capability-gated.
 * Command Center (/admin/command-center) is the admin dashboard home.
 *
 * Every href must resolve to a real page (enforced by tests/admin/admin-nav).
 * New destinations are added in the batch that ships their page.
 * Note: VoiceShield admin panel removed — VoiceShield has been retired.
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
      { label: "All Form Submissions", href: "/admin/intake", capability: "leads.read", match: startsWith("/admin/intake") },
      { label: "Website Enquiries", href: "/admin/leads", capability: "leads.read", match: startsWith("/admin/leads") },
      { label: "AI Assistant Enquiries", href: "/admin/ai-leads", capability: "leads.read", match: startsWith("/admin/ai-leads") },
      { label: "Bookings", href: "/admin/bookings", capability: "bookings.read", match: startsWith("/admin/bookings") },
    ],
  },
  {
    label: "Outreach",
    items: [
      { label: "Outreach Overview", href: "/admin/outreach", capability: "outreach.read", match: (p) => p === "/admin/outreach" },
      { label: "Draft Outreach Message", href: "/admin/outreach/studio", capability: "outreach.manage", match: startsWith("/admin/outreach/studio") },
      { label: "Message Review & Queue", href: "/admin/outreach/queue", capability: "outreach.manage", match: startsWith("/admin/outreach/queue") },
      { label: "Do-Not-Contact List", href: "/admin/outreach/suppression", capability: "outreach.manage", match: startsWith("/admin/outreach/suppression") },
      { label: "Outreach Metrics", href: "/admin/outreach/analytics", capability: "outreach.read", match: startsWith("/admin/outreach/analytics") },
      { label: "Outreach Writing Guide", href: "/admin/outreach/playbook", capability: "outreach.read", match: startsWith("/admin/outreach/playbook") },
      { label: "Outreach Policy & Legal Reviews", href: "/admin/outreach/compliance", capability: "outreach.read", match: startsWith("/admin/outreach/compliance") },
    ],
  },
  {
    label: "Clients",
    items: [
      { label: "Clients", href: "/admin/clients", capability: "clients.read", match: startsWith("/admin/clients") },
      { label: "Engagements", href: "/admin/engagements", capability: "clients.read", match: startsWith("/admin/engagements") },
      { label: "Checklists", href: "/admin/checklist-invitations", capability: "checklists.read", match: startsWith("/admin/checklist-invitations") },
      { label: "Documents", href: "/admin/documents", capability: "documents.read", match: startsWith("/admin/documents") },
      { label: "Onboarding Invitations", href: "/admin/onboarding", capability: "onboarding.manage", match: startsWith("/admin/onboarding") },
      { label: "Proposals", href: "/admin/proposals", capability: "proposals.read", match: startsWith("/admin/proposals") },
      { label: "Quotations", href: "/admin/quotations", capability: "proposals.read", match: startsWith("/admin/quotations") },
      { label: "Invoices", href: "/admin/invoices", capability: "invoices.read", match: startsWith("/admin/invoices") },
      { label: "Payments", href: "/admin/payments", capability: "payment.verify", match: startsWith("/admin/payments") },
      { label: "Subscriptions", href: "/admin/subscriptions", capability: "payment.verify", match: startsWith("/admin/subscriptions") },
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
    label: "Automation Intelligence",
    items: [
      { label: "Automations", href: "/admin/automations", capability: "automations.read", match: (p) => p === "/admin/automations" },
      { label: "Approvals", href: "/admin/automations/approvals", capability: "automations.read", match: startsWith("/admin/automations/approvals") },
      { label: "SEO & Indexing", href: "/admin/seo", capability: "seo.read", match: (p) => p === "/admin/seo" || p.startsWith("/admin/seo/") },
      { label: "Visibility Engine", href: "/admin/command-center/visibility", capability: "seo.read", match: startsWith("/admin/command-center/visibility") },
      { label: "Edge CDN", href: "/admin/cdn", capability: "cdn.read", match: startsWith("/admin/cdn") },
      { label: "Reliability Reports", href: "/admin/automations/reports", capability: "automations.read", match: startsWith("/admin/automations/reports") },
      { label: "Governance & Runbooks", href: "/admin/automations/governance", capability: "automations.read", match: startsWith("/admin/automations/governance") },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "System Status", href: "/admin/status", capability: "status.read", match: startsWith("/admin/status") },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Company", href: "/admin/company", capability: "dashboard.view", match: startsWith("/admin/company") },
      { label: "Staff Workspaces", href: "/admin/workspaces", capability: "team.read", match: startsWith("/admin/workspaces") },
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
 * ADMIN_NAV_GROUPS:
 * - Dashboard is active on "/admin" and the command-center path.
 * - Exact-match routes (/admin/outreach, /admin/automations) match strictly.
 * - Disambiguates parent prefixes when a more specific sibling route is matched (NAV04).
 * - Explicitly supports URL hash fragments (e.g. #milestones / #journey) without selecting multiple items.
 * - Strips URL hashes and query parameters cleanly when hash is absent.
 */
export function isActiveNav(
  pathname: string,
  href: string,
  allHrefs?: string[],
  currentHash?: string
): boolean {
  const [cleanPath, pathHash] = (pathname || "").split("#");
  const [cleanHref, hrefHash] = (href || "").split("#");
  const effectiveHash = (currentHash !== undefined ? currentHash : pathHash || "").replace(/^#/, "");

  // If item explicitly targets a hash (e.g. /client/dashboard#milestones or /client/dashboard#journey)
  if (hrefHash) {
    const isHashMatch =
      effectiveHash === hrefHash ||
      (hrefHash === "milestones" && (effectiveHash === "journey" || effectiveHash === "milestones")) ||
      (hrefHash === "journey" && (effectiveHash === "journey" || effectiveHash === "milestones"));
    return cleanPath === cleanHref && Boolean(isHashMatch);
  }

  // If URL has an active hash and a sibling nav item specifically targets that hash,
  // suppress parent base route match so only the hash item is active.
  if (effectiveHash && allHrefs && allHrefs.length > 0) {
    const hasSiblingHashMatch = allHrefs.some((other) => {
      const [otherPath, otherHash] = other.split("#");
      return (
        otherPath === cleanHref &&
        otherHash &&
        (otherHash === effectiveHash ||
          (otherHash === "milestones" && (effectiveHash === "journey" || effectiveHash === "milestones")) ||
          (otherHash === "journey" && (effectiveHash === "journey" || effectiveHash === "milestones")))
      );
    });
    if (hasSiblingHashMatch) return false;
  }

  if (cleanHref === ADMIN_DASHBOARD_PATH) {
    return cleanPath === "/admin" || cleanPath === ADMIN_DASHBOARD_PATH;
  }

  // Exact match paths with distinct dedicated sub-routes
  if (cleanHref === "/admin/outreach" || cleanHref === "/admin/automations") {
    return cleanPath === cleanHref;
  }

  if (cleanPath === cleanHref) {
    return true;
  }

  if (allHrefs && allHrefs.length > 0) {
    const isPrefixMatch = cleanPath.startsWith(cleanHref + "/");
    if (!isPrefixMatch) return false;

    // Check if another nav item is a more specific match for cleanPath
    const hasMoreSpecificMatch = allHrefs.some(
      (other) =>
        other.split("#")[0] !== cleanHref &&
        other.split("#")[0].startsWith(cleanHref + "/") &&
        (cleanPath === other.split("#")[0] || cleanPath.startsWith(other.split("#")[0] + "/"))
    );
    return !hasMoreSpecificMatch;
  }

  return cleanPath.startsWith(cleanHref + "/");
}
