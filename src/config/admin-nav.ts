/**
 * Canonical admin navigation + CTA destinations.
 * Command Center is the production Admin Dashboard.
 */
export const ADMIN_DASHBOARD_PATH = "/admin/command-center" as const;

export const ADMIN_NAV_ITEMS = [
  {
    label: "Command Center",
    href: ADMIN_DASHBOARD_PATH,
    match: (pathname: string) =>
      pathname === "/admin" || pathname === ADMIN_DASHBOARD_PATH,
  },
  {
    label: "Leads",
    href: "/admin/leads",
    match: (pathname: string) => pathname.startsWith("/admin/leads"),
  },
  {
    label: "AI Leads",
    href: "/admin/ai-leads",
    match: (pathname: string) => pathname.startsWith("/admin/ai-leads"),
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    match: (pathname: string) => pathname.startsWith("/admin/bookings"),
  },
  {
    label: "Proposals",
    href: "/admin/proposals",
    match: (pathname: string) => pathname.startsWith("/admin/proposals"),
  },
  {
    label: "Support",
    href: "/admin/support",
    match: (pathname: string) => pathname.startsWith("/admin/support"),
  },
] as const;

export const ADMIN_QUICK_ACTIONS = [
  { label: "View Leads", href: "/admin/leads" },
  { label: "View AI Leads", href: "/admin/ai-leads" },
  { label: "View Bookings", href: "/admin/bookings" },
  { label: "View Proposals", href: "/admin/proposals" },
  { label: "Create Proposal", href: "/admin/proposals/new" },
  { label: "View Support", href: "/admin/support" },
] as const;
