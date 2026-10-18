import { hasCapability, type Capability, type StaffRole } from "@/config/roles";

export interface ModuleItem {
  href: string;
  label: string;
  badge: string;
  desc: string;
  capability?: Capability;
  isExternalPreview?: boolean;
}

export interface ModuleCategory {
  id: string;
  name: string;
  subtitle: string;
  iconName: string;
  tone: {
    border: string;
    bg: string;
    text: string;
    hoverBorder: string;
    badge: string;
    button: string;
  };
  footerLink: {
    href: string;
    label: string;
  };
  items: ModuleItem[];
}

export const MODULE_CATEGORIES: ModuleCategory[] = [
  {
    id: "lifecycle",
    name: "1. Client Lifecycle",
    subtitle: "13-Stage Governance & Portals",
    iconName: "ListChecks",
    tone: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      text: "text-[#1565C0]",
      hoverBorder: "hover:border-[#1565C0]/40",
      badge: "bg-blue-50 text-[#1565C0] border-blue-200",
      button: "bg-blue-50 hover:bg-blue-100/70 border-blue-200 text-[#1565C0]",
    },
    footerLink: {
      href: "/admin/engagements",
      label: "Open Engagements Console →",
    },
    items: [
      { href: "/engagement", label: "Client Portals Hub", badge: "Live 13-Stage", desc: "Universal client milestone progression & stage gate access", capability: "clients.read" },
      { href: "/admin/engagements", label: "Engagements Registry", badge: "Admin Core", desc: "Stage data inspection, client submission verification & approvals", capability: "clients.read" },
      { href: "/admin/engagements/new", label: "Create Client Engagement", badge: "+ Action", desc: "Provision tokens & initialize 13 milestones", capability: "clients.write" },
      { href: "/admin/clients", label: "Client Accounts", badge: "Profiles", desc: "Enterprise account records, company metadata & contact dossiers", capability: "clients.read" },
      { href: "/admin/checklist-invitations", label: "Checklists & Invitations", badge: "v2.4 Scope", desc: "Enterprise scoping invitations & dispatch", capability: "checklists.read" },
      { href: "/admin/onboarding", label: "Onboarding Invitations", badge: "Stage 7", desc: "Credential handoff, kickoff forms & repository setup", capability: "onboarding.manage" },
      { href: "/admin/documents", label: "Document Vault", badge: "PDF Storage", desc: "Signed SOWs, Tax Invoices & Payment Receipts repository", capability: "documents.read" },
    ],
  },
  {
    id: "financials",
    name: "2. Financials & Payments",
    subtitle: "50/50 Milestones & UPI Audit",
    iconName: "Receipt",
    tone: {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      hoverBorder: "hover:border-emerald-300",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      button: "bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200 text-emerald-800",
    },
    footerLink: {
      href: "/admin/payments",
      label: "Verify Pending Payments →",
    },
    items: [
      { href: "/admin/payments", label: "Bank Reconciliation", badge: "Super Admin", desc: "12-digit UTR bank statement audit, receiving bank verification & receipt generation", capability: "payment.verify" },
      { href: "/admin/invoices", label: "Tax Invoices Ledger", badge: "Tax Invoices", desc: "18% GST statutory invoice journal & compliance trail", capability: "invoices.read" },
      { href: "/admin/invoices/new", label: "Issue New Invoice", badge: "+ Action", desc: "Single-page A4 PDF invoice generator with dual milestone split", capability: "invoice.issue" },
      { href: "/admin/quotations", label: "Quotation Engine", badge: "V6 Engine", desc: "Instant pricing, scope, dual milestones & quote lifecycle", capability: "proposals.read" },
      { href: "/admin/quotations/new", label: "Draft New Quotation", badge: "+ Action", desc: "Dual milestones, 77-service pricing & PDF generator", capability: "proposals.write" },
      { href: "/admin/quotations/catalog", label: "Quotation Rate Catalog", badge: "77 Services", desc: "Standard rate card & module deliverables directory", capability: "proposals.read" },
      { href: "/admin/quotations/coupons", label: "Discount Coupons", badge: "Promotions", desc: "Commercial partner discount codes & percentage offsets", capability: "coupon.manage" },
      { href: "/admin/proposals", label: "Proposals & SOWs", badge: "Contracts", desc: "Master commercial terms & binding SOW agreements", capability: "proposals.read" },
      { href: "/admin/proposals/new", label: "Draft Proposal", badge: "+ Action", desc: "50/50 milestone structure proposal generator", capability: "proposals.write" },
      { href: "/admin/contracts", label: "Client Contracts & SOWs", badge: "Contracts", desc: "Admin contract register and legal execution console", capability: "contracts.read" },
      { href: "/admin/subscriptions", label: "Maintenance Subscriptions", badge: "Billing", desc: "Recurring plans, SLA entitlements & renewal orders", capability: "payment.verify" },
    ],
  },
  {
    id: "crm",
    name: "3. Website Enquiries & Pipeline",
    subtitle: "Inbound Inquiries & Consultations",
    iconName: "Users",
    tone: {
      border: "border-teal-200",
      bg: "bg-teal-50",
      text: "text-[var(--lit-teal,#1FA9A2)]",
      hoverBorder: "hover:border-[var(--lit-teal,#1FA9A2)]/40",
      badge: "bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border-teal-200",
      button: "bg-teal-50 hover:bg-teal-100/70 border-teal-200 text-teal-800",
    },
    footerLink: {
      href: "/admin/leads",
      label: "View Website Enquiries →",
    },
    items: [
      { href: "/admin/intake", label: "All Form Submissions", badge: "Inbound", desc: "Real-time client contact submissions & web intake", capability: "leads.read" },
      { href: "/admin/leads", label: "Website Enquiries", badge: "Dossiers", desc: "Scored leads, engagement timelines & executive history", capability: "leads.read" },
      { href: "/admin/ai-leads", label: "AI Assistant Enquiries", badge: "AI Scored", desc: "Autonomous ICP classification & conversion propensity", capability: "leads.read" },
      { href: "/admin/bookings", label: "Consultation Bookings", badge: "Calendar", desc: "Google Meet consultations, slots & attendee details", capability: "bookings.read" },
    ],
  },
  {
    id: "outreach",
    name: "4. Outreach Operations",
    subtitle: "Outbound Sequences & Deliverability",
    iconName: "Send",
    tone: {
      border: "border-sky-200",
      bg: "bg-sky-50",
      text: "text-sky-700",
      hoverBorder: "hover:border-sky-300",
      badge: "bg-sky-50 text-sky-700 border-sky-200",
      button: "bg-sky-50 hover:bg-sky-100/70 border-sky-200 text-sky-800",
    },
    footerLink: {
      href: "/admin/outreach",
      label: "Open Outreach Hub →",
    },
    items: [
      { href: "/admin/outreach", label: "Outreach Overview", badge: "Outbound", desc: "Enterprise outbound campaign orchestration & sender health", capability: "outreach.read" },
      { href: "/admin/outreach/studio", label: "Draft Outreach Message", badge: "Sequences", desc: "Multi-touch cadence sequence designer & copy steps", capability: "outreach.manage" },
      { href: "/admin/outreach/queue", label: "Message Review & Queue", badge: "Execution", desc: "Scheduled email & message releases with pacing", capability: "outreach.manage" },
      { href: "/admin/outreach/suppression", label: "Do-Not-Contact List", badge: "Opt-Out", desc: "DND, statutory compliance & domain-level blocklists", capability: "outreach.manage" },
      { href: "/admin/outreach/analytics", label: "Outreach Metrics", badge: "Metrics", desc: "Open rates, reply rates & pipeline attribution", capability: "outreach.read" },
      { href: "/admin/outreach/playbook", label: "Outreach Writing Guide", badge: "Templates", desc: "Pre-approved corporate copy guidelines & value props", capability: "outreach.read" },
      { href: "/admin/outreach/compliance", label: "Outreach Policy & Legal Reviews", badge: "Legal", desc: "GDPR, CAN-SPAM, Indian DND guards & audit rules", capability: "outreach.read" },
    ],
  },
  {
    id: "communications",
    name: "5. Comms & Support",
    subtitle: "Transactional Emails & Helpdesk",
    iconName: "Mail",
    tone: {
      border: "border-purple-200",
      bg: "bg-purple-50",
      text: "text-purple-700",
      hoverBorder: "hover:border-purple-300",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      button: "bg-purple-50 hover:bg-purple-100/70 border-purple-200 text-purple-800",
    },
    footerLink: {
      href: "/admin/emails",
      label: "Email Operations Hub →",
    },
    items: [
      { href: "/admin/support", label: "Support Helpdesk", badge: "Tickets", desc: "Customer tickets, priority SLAs & resolution tracking", capability: "support.read" },
      { href: "/admin/emails", label: "Transactional Email Logs", badge: "Delivery", desc: "Live SMTP outbox logs, delivery audit & telemetry", capability: "emails.read" },
      { href: "/admin/emails/new", label: "Compose Email", badge: "+ Action", desc: "Direct branded transactional message dispatch", capability: "emails.read" },
      { href: "/admin/emails/mailboxes", label: "Mailboxes Configuration", badge: "SMTP/DNS", desc: "Sender domains, SPF/DKIM verification & MX records", capability: "emails.read" },
      { href: "/admin/emails/outbox", label: "Outbox Queue", badge: "Pending", desc: "Buffered dispatches, circuit breaking & retry schedules", capability: "emails.read" },
      { href: "/admin/email-preview", label: "Email Template Previews", badge: "LIT V2", desc: "Dual document receipts, step alerts & stage unlock emails", capability: "emails.read" },
    ],
  },
  {
    id: "automations",
    name: "6. Automations & Workflows",
    subtitle: "180 Workflows & Edge Daemons",
    iconName: "Zap",
    tone: {
      border: "border-indigo-200",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      hoverBorder: "hover:border-indigo-300",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      button: "bg-indigo-50 hover:bg-indigo-100/70 border-indigo-200 text-indigo-800",
    },
    footerLink: {
      href: "/admin/automations/catalog",
      label: "Browse 180 Automation Workflows →",
    },
    items: [
      { href: "/admin/automations", label: "Automations Hub", badge: "Four-Site", desc: "Centralized execution telemetry & cron daemons", capability: "automations.read" },
      { href: "/admin/automations/catalog", label: "Workflow Catalog", badge: "180 Tasks", desc: "All 180 production background workflows across 4 sites", capability: "automations.read" },
      { href: "/admin/automations/approvals", label: "Action Approvals Gate", badge: "Safety Gate", desc: "Super Admin human-in-the-loop approvals for R3/R4", capability: "approvals.decide" },
      { href: "/admin/automations/workflows", label: "Automated Workflows", badge: "Orchestration", desc: "Active task execution pipelines & definitions", capability: "automations.read" },
      { href: "/admin/automations/executions", label: "Execution History", badge: "Run Logs", desc: "Granular step-by-step workflow run audit logs", capability: "automations.read" },
      { href: "/admin/automations/schedules", label: "Job Schedules & Crons", badge: "Cron Rules", desc: "Automated recurrence triggers & timing", capability: "automations.read" },
      { href: "/admin/automations/dead-letter", label: "Dead Letter Queue (DLQ)", badge: "Failures", desc: "Failed event retries, poison pill isolation & alerts", capability: "automations.manage" },
      { href: "/admin/automations/site-health", label: "Site Health Probes", badge: "Live Probes", desc: "Four-site synthetic edge monitors & heartbeat checks", capability: "status.read" },
      { href: "/admin/automations/connectors", label: "System Connectors", badge: "Integrations", desc: "Supabase, Redis, Resend, Vercel & Fastly bridges", capability: "automations.manage" },
      { href: "/admin/automations/deployments", label: "Deployment Logs", badge: "CI/CD", desc: "Multi-repo Vercel and Edge deployment status", capability: "automations.read" },
      { href: "/admin/automations/events", label: "Event Bus Streams", badge: "Webhooks", desc: "Real-time event subscription bus & event ledger", capability: "automations.read" },
      { href: "/admin/automations/n8n", label: "n8n Workflow Engine", badge: "Flow Engine", desc: "Self-hosted node-based workflow server bridge", capability: "automations.manage" },
      { href: "/admin/automations/reports", label: "Reliability Reports", badge: "Audit", desc: "Uptime, error budgets & synthetic SLA metrics", capability: "automations.read" },
      { href: "/admin/automations/governance", label: "Governance & Runbooks", badge: "SOP", desc: "Operational runbooks & failover procedures", capability: "automations.read" },
    ],
  },
  {
    id: "seo-cdn",
    name: "7. SEO, CDN & Edge Network",
    subtitle: "Google Search Console & Fastly",
    iconName: "Globe",
    tone: {
      border: "border-cyan-200",
      bg: "bg-cyan-50",
      text: "text-cyan-800",
      hoverBorder: "hover:border-cyan-300",
      badge: "bg-cyan-50 text-cyan-800 border-cyan-200",
      button: "bg-cyan-50 hover:bg-cyan-100/70 border-cyan-200 text-cyan-900",
    },
    footerLink: {
      href: "/admin/seo",
      label: "Open SEO Intelligence Console →",
    },
    items: [
      { href: "/admin/seo", label: "SEO Intelligence Console", badge: "Search", desc: "Crawling, indexing & 4-site properties overview", capability: "seo.read" },
      { href: "/admin/seo/url-inspection", label: "SEO URL Inspection Tool", badge: "Edge Inspector", desc: "Real-time edge indexability & GSC verification", capability: "seo.read" },
      { href: "/admin/seo/sitemaps", label: "Dynamic XML Sitemaps", badge: "XML", desc: "Authoritative multi-site sitemap verification", capability: "seo.read" },
      { href: "/admin/seo/sites", label: "Four-Site SEO Registry", badge: "Multi-Domain", desc: "Domain property configurations & canonical targets", capability: "seo.read" },
      { href: "/admin/seo/schedules", label: "72-Hour Crawl Schedules", badge: "Cadence", desc: "Automated 72-hour crawl scheduler & slot allocations", capability: "seo.read" },
      { href: "/admin/command-center/visibility", label: "Visibility Engine", badge: "Rankings", desc: "Four-site organic search performance & keyword rank", capability: "seo.read" },
      { href: "/admin/cdn", label: "Edge CDN Cache Purge", badge: "Fastly/Edge", desc: "Stale cache invalidation, instant purges & TTL controls", capability: "cdn.read" },
      { href: "/admin/cdn/cache-jobs", label: "Cache Invalidation Jobs", badge: "Purge History", desc: "Edge CDN purge execution journal & status", capability: "cdn.read" },
    ],
  },
  {
    id: "client-workspace",
    name: "8. Client Workspace & Portals",
    subtitle: "Client Side Experience & Tools",
    iconName: "LayoutDashboard",
    tone: {
      border: "border-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-800",
      hoverBorder: "hover:border-amber-300",
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      button: "bg-amber-50 hover:bg-amber-100/70 border-amber-200 text-amber-900",
    },
    footerLink: {
      href: "/client/dashboard",
      label: "Preview Client Workspace →",
    },
    items: [
      { href: "/client/dashboard", label: "Client Workspace Dashboard", badge: "Client View", desc: "Client-facing project overview, milestones & actions", capability: "clients.read", isExternalPreview: true },
      { href: "/client/projects", label: "Client Projects Portfolio", badge: "Projects", desc: "Active engagements, sprint deliverables & delivery tracks", capability: "clients.read", isExternalPreview: true },
      { href: "/client/messages", label: "Client Messaging & Comms", badge: "Inbox", desc: "Direct communications with engineering team & notices", capability: "clients.read", isExternalPreview: true },
      { href: "/client/change-requests", label: "Change Requests (RFCs)", badge: "Scope Control", desc: "Client request for changes management ledger", capability: "clients.read", isExternalPreview: true },
      { href: "/client/actions", label: "Action Items & Sign-Offs", badge: "Approvals", desc: "Pending approvals, deliverables & blocker clearance", capability: "clients.read", isExternalPreview: true },
      { href: "/client/documents", label: "Client Documents Vault", badge: "Contracts", desc: "Client view of signed agreements, invoices & specs", capability: "clients.read", isExternalPreview: true },
      { href: "/client/invoices", label: "Client Invoices & Receipts", badge: "Billing", desc: "Client view of paid & outstanding invoices", capability: "clients.read", isExternalPreview: true },
      { href: "/client/meetings", label: "Client Scheduled Sessions", badge: "Sessions", desc: "Discovery, review & delivery meeting calendar", capability: "clients.read", isExternalPreview: true },
      { href: "/client/notifications", label: "Notification Preferences", badge: "Feed", desc: "Client notification feed, digest rules & delivery channels", capability: "clients.read", isExternalPreview: true },
      { href: "/client/support", label: "Client Support Portal", badge: "Helpdesk", desc: "Client ticket submission & resolution status", capability: "clients.read", isExternalPreview: true },
      { href: "/client/profile", label: "Client Organization Profile", badge: "Profile", desc: "Client company details, billing info & primary contacts", capability: "clients.read", isExternalPreview: true },
      { href: "/client", label: "Client Portal Gateway", badge: "Root Entry", desc: "Root client routing gateway redirecting to Dashboard", capability: "clients.read", isExternalPreview: true },
    ],
  },
  {
    id: "governance",
    name: "9. Governance & System Security",
    subtitle: "MSME, RBAC & Core Operations",
    iconName: "Building",
    tone: {
      border: "border-slate-300",
      bg: "bg-slate-100",
      text: "text-slate-700",
      hoverBorder: "hover:border-slate-400",
      badge: "bg-slate-100 text-slate-700 border-slate-300",
      button: "bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-800",
    },
    footerLink: {
      href: "/admin/company",
      label: "View MSME Statutory Profile →",
    },
    items: [
      { href: "/admin/company", label: "Company & MSME Credentials", badge: "Verified", desc: "MSME UDYAM-TN-03-0345274, registered address & GSTIN", capability: "dashboard.view" },
      { href: "/admin/status", label: "System Telemetry & Uptime", badge: "Status", desc: "Database, Redis, Storage & edge latency health checks", capability: "status.read" },
      { href: "/admin/analytics", label: "Executive Analytics", badge: "KPIs", desc: "Paid revenue, pipeline velocity & cohorts", capability: "analytics.read" },
      { href: "/admin/team", label: "Team & Staff Access", badge: "RBAC", desc: "Capability matrix, staff roles & session security", capability: "team.read" },
      { href: "/admin/workspaces", label: "Staff Admin Workspaces", badge: "Workspaces", desc: "Person-specific staff workspaces, credential lifecycle & access governance", capability: "team.read" },
      { href: "/admin/workspaces/new", label: "Create Staff Workspace", badge: "+ Action", desc: "Dedicated personnel workspace creator with credentials, role and assignments", capability: "team.manage" },
      { href: "/admin/audit", label: "Cryptographic Audit Log", badge: "SHA-256", desc: "Immutable SHA-256 trail of all administrative actions", capability: "audit.read" },
      { href: "/admin/command-center", label: "Executive Command Center", badge: "Dashboard", desc: "Real-time operations, revenue metrics, KPIs and master module index", capability: "dashboard.view" },
      { href: "/admin/forbidden", label: "Access Forbidden Safety Screen", badge: "Security", desc: "Capability-denied guard & session safety handling", capability: "dashboard.view" },
      { href: "/profile", label: "Staff Profile & Settings", badge: "Account", desc: "Authenticated user settings and profile management", capability: "dashboard.view", isExternalPreview: true },
    ],
  },
];

/**
 * Filter module categories for a specific staff role.
 * Ensures unauthorized links are dropped before rendering, and empty categories are omitted.
 */
export function filterModuleCategoriesForRole(role?: StaffRole | null): ModuleCategory[] {
  if (!role) return [];
  return MODULE_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => !item.capability || hasCapability(role, item.capability)),
  })).filter((cat) => cat.items.length > 0);
}
