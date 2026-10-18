import type { ComponentType } from "react";
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  FileText,
  User,
  Shield,
  Activity,
  Inbox,
  LifeBuoy,
  MessageSquare,
  FilePen,
  Receipt,
  Workflow,
  LineChart,
  Upload,
} from "lucide-react";

export interface StaffNavEntry {
  id: string;
  label: string;
  href: string;
  description: string;
  /** Module capability required; null = always available for active staff */
  capability: string | null;
  icon: ComponentType<{ className?: string }>;
  order: number;
}

/** Essential utilities always available to active staff (not part of the nine optional modules). */
export const STAFF_ESSENTIAL_NAV: StaffNavEntry[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/staff/dashboard",
    description: "Your workspace overview",
    capability: null,
    icon: LayoutDashboard,
    order: 10,
  },
  {
    id: "tasks",
    label: "My Tasks",
    href: "/staff/tasks",
    description: "Assigned tasks",
    capability: null,
    icon: ListTodo,
    order: 20,
  },
  {
    id: "projects",
    label: "Projects",
    href: "/staff/projects",
    description: "Assigned projects",
    capability: null,
    icon: FolderKanban,
    order: 30,
  },
  {
    id: "messages",
    label: "Messages",
    href: "/staff/messages",
    description: "Client project conversations",
    capability: null,
    icon: MessageSquare,
    order: 35,
  },
  {
    id: "documents",
    label: "Documents",
    href: "/staff/documents",
    description: "Document wallet",
    capability: "documents.read",
    icon: FileText,
    order: 40,
  },
  {
    id: "profile",
    label: "My Profile",
    href: "/staff/profile",
    description: "Official profile",
    capability: null,
    icon: User,
    order: 90,
  },
  {
    id: "security",
    label: "Account Security",
    href: "/staff/settings/security",
    description: "Password and account protection",
    capability: null,
    icon: Shield,
    order: 95,
  },
  {
    id: "activity",
    label: "Activity",
    href: "/staff/activity",
    description: "Your activity history",
    capability: null,
    icon: Activity,
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
    icon: Inbox,
    order: 50,
  },
  {
    id: "support",
    label: "Support Tickets",
    href: "/staff/support",
    description: "Assigned support tickets",
    capability: "support.read",
    icon: LifeBuoy,
    order: 55,
  },
  {
    id: "support-reply",
    label: "Support Responses",
    href: "/staff/support",
    description: "Reply to support tickets",
    capability: "support.reply",
    icon: MessageSquare,
    order: 56,
  },
  {
    id: "quotations",
    label: "Technical Quotations",
    href: "/staff/quotations",
    description: "Technical draft preparation",
    capability: "quotation.technical_draft.create",
    icon: FilePen,
    order: 60,
  },
  {
    id: "invoices",
    label: "Invoice Preparation",
    href: "/staff/invoices",
    description: "Invoice preparation requests",
    capability: "invoice.preparation.create",
    icon: Receipt,
    order: 65,
  },
  {
    id: "documents-upload",
    label: "Document Upload",
    href: "/staff/documents",
    description: "Upload technical documents",
    capability: "documents.upload",
    icon: Upload,
    order: 41,
  },
  {
    id: "automations",
    label: "Automations",
    href: "/staff/automations",
    description: "Workflow health monitoring",
    capability: "automations.read",
    icon: Workflow,
    order: 70,
  },
  {
    id: "seo",
    label: "SEO & Analytics",
    href: "/staff/seo",
    description: "SEO and analytics",
    capability: "seo.read",
    icon: LineChart,
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
    // Essential utilities (capability null) always visible to active staff
    if (entry.capability === null) return true;
    // Optional and operational modules require an explicit grant — never fail open on empty grants
    return granted.has(entry.capability);
  });

  // De-dupe by href keeping lowest order
  const byHref = new Map<string, StaffNavEntry>();
  for (const e of filtered.sort((a, b) => a.order - b.order)) {
    if (!byHref.has(e.href) || (byHref.get(e.href)!.order > e.order)) {
      byHref.set(e.href, e);
    }
  }
  return Array.from(byHref.values()).sort((a, b) => a.order - b.order);
}

export function staffHasCapability(granted: string[], capability: string): boolean {
  return granted.includes(capability);
}
