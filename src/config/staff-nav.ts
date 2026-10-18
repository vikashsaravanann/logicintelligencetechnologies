/**
 * Staff navigation registry — serializable for Server → Client boundary.
 * Icons are resolved only inside client components via iconKey → registry.
 */

export type StaffIconKey =
  | "layout-dashboard"
  | "list-todo"
  | "folder-kanban"
  | "message-square"
  | "file-text"
  | "user"
  | "shield"
  | "activity"
  | "inbox"
  | "life-buoy"
  | "file-pen"
  | "receipt"
  | "upload"
  | "workflow"
  | "line-chart";

export interface StaffNavEntry {
  id: string;
  label: string;
  href: string;
  description: string;
  /** Module capability required; null = always available for active staff */
  capability: string | null;
  /** Serializable icon identifier — never a React component */
  iconKey: StaffIconKey;
  order: number;
}

/** Plain serializable nav item for client shells */
export type StaffNavItemSerializable = {
  id: string;
  label: string;
  href: string;
  iconKey: StaffIconKey;
  order: number;
};

/** Essential utilities always available to active staff (not part of the nine optional modules). */
export const STAFF_ESSENTIAL_NAV: StaffNavEntry[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/staff/dashboard",
    description: "Your workspace overview",
    capability: null,
    iconKey: "layout-dashboard",
    order: 10,
  },
  {
    id: "tasks",
    label: "My Tasks",
    href: "/staff/tasks",
    description: "Assigned tasks",
    capability: null,
    iconKey: "list-todo",
    order: 20,
  },
  {
    id: "projects",
    label: "Projects",
    href: "/staff/projects",
    description: "Assigned projects",
    capability: null,
    iconKey: "folder-kanban",
    order: 30,
  },
  {
    id: "messages",
    label: "Messages",
    href: "/staff/messages",
    description: "Client project conversations",
    capability: null,
    iconKey: "message-square",
    order: 35,
  },
  {
    id: "documents",
    label: "Documents",
    href: "/staff/documents",
    description: "Document wallet",
    capability: "documents.read",
    iconKey: "file-text",
    order: 40,
  },
  {
    id: "profile",
    label: "My Profile",
    href: "/staff/profile",
    description: "Official profile",
    capability: null,
    iconKey: "user",
    order: 90,
  },
  {
    id: "security",
    label: "Account Security",
    href: "/staff/settings/security",
    description: "Password and account protection",
    capability: null,
    iconKey: "shield",
    order: 95,
  },
  {
    id: "activity",
    label: "Activity",
    href: "/staff/activity",
    description: "Your activity history",
    capability: null,
    iconKey: "activity",
    order: 100,
  },
];

/** Nine optional modules — only shown when Super Admin granted the capability. */
export const STAFF_MODULE_NAV: StaffNavEntry[] = [
  {
    id: "leads",
    label: "Leads & Intake",
    href: "/staff/leads",
    description: "Website and intake inquiries",
    capability: "leads.read",
    iconKey: "inbox",
    order: 50,
  },
  {
    id: "support",
    label: "Support Tickets",
    href: "/staff/support",
    description: "Assigned support tickets",
    capability: "support.read",
    iconKey: "life-buoy",
    order: 55,
  },
  {
    id: "support-reply",
    label: "Support Responses",
    href: "/staff/support",
    description: "Reply to support tickets",
    capability: "support.reply",
    iconKey: "message-square",
    order: 56,
  },
  {
    id: "quotations",
    label: "Technical Quotations",
    href: "/staff/quotations",
    description: "Technical draft preparation",
    capability: "quotation.technical_draft.create",
    iconKey: "file-pen",
    order: 60,
  },
  {
    id: "invoices",
    label: "Invoice Preparation",
    href: "/staff/invoices",
    description: "Invoice preparation requests",
    capability: "invoice.preparation.create",
    iconKey: "receipt",
    order: 65,
  },
  {
    id: "documents-upload",
    label: "Document Upload",
    href: "/staff/documents",
    description: "Upload technical documents",
    capability: "documents.upload",
    iconKey: "upload",
    order: 41,
  },
  {
    id: "automations",
    label: "Automations",
    href: "/staff/automations",
    description: "Workflow health monitoring",
    capability: "automations.read",
    iconKey: "workflow",
    order: 70,
  },
  {
    id: "seo",
    label: "SEO & Analytics",
    href: "/staff/seo",
    description: "SEO and analytics",
    capability: "seo.read",
    iconKey: "line-chart",
    order: 75,
  },
];

/**
 * Build staff navigation from verified server-side capability grants.
 * Never trust client-supplied permission arrays.
 */
export function buildStaffNavigation(grantedCapabilities: string[]): StaffNavEntry[] {
  const granted = new Set(grantedCapabilities);
  const all = [...STAFF_ESSENTIAL_NAV, ...STAFF_MODULE_NAV];
  const filtered = all.filter((entry) => {
    if (entry.capability === null) return true;
    return granted.has(entry.capability);
  });

  const byHref = new Map<string, StaffNavEntry>();
  for (const e of filtered.sort((a, b) => a.order - b.order)) {
    if (!byHref.has(e.href) || byHref.get(e.href)!.order > e.order) {
      byHref.set(e.href, e);
    }
  }
  return Array.from(byHref.values()).sort((a, b) => a.order - b.order);
}

/** Serialize for client components — only plain data crosses the boundary. */
export function toSerializableStaffNav(entries: StaffNavEntry[]): StaffNavItemSerializable[] {
  return entries.map((e) => ({
    id: e.id,
    label: e.label,
    href: e.href,
    iconKey: e.iconKey,
    order: e.order,
  }));
}

export function staffHasCapability(granted: string[], capability: string): boolean {
  return granted.includes(capability);
}
