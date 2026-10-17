"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ListChecks,
  Receipt,
  Users,
  Mail,
  Zap,
  Globe,
  LayoutDashboard,
  Building,
  ArrowRight,
  Search,
  ExternalLink,
  ShieldCheck,
  Plus,
  FileText,
  Calendar,
  Ticket,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  Inbox,
  Send,
  Eye,
  FileSpreadsheet,
  Cpu,
  Clock,
  Radio,
  Sliders,
  CheckCircle2,
  FileCheck2,
  Share2,
  Bot,
  Scale,
  BookOpen,
  HeartPulse,
  Compass,
  HelpCircle,
  Lock,
  User,
  Shield,
  FileCheck,
  Code,
  Smartphone,
  Award,
  Flame,
  Key,
} from "lucide-react";

export interface ModuleItem {
  href: string;
  label: string;
  badge: string;
  desc: string;
  isExternalPreview?: boolean;
}

export interface ModuleCategory {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
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
    icon: ListChecks,
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
      { href: "/engagement", label: "Client Portals Hub", badge: "Live 13-Stage", desc: "Universal client milestone progression & stage gate access" },
      { href: "/admin/engagements", label: "Engagements Registry", badge: "Admin Core", desc: "Stage data inspection, client submission verification & approvals" },
      { href: "/admin/engagements/new", label: "Register New Client", badge: "+ Action", desc: "Provision tokens & initialize 13 milestones" },
      { href: "/admin/clients", label: "Client Accounts", badge: "Profiles", desc: "Enterprise account records, company metadata & contact dossiers" },
      { href: "/admin/checklist-invitations", label: "Checklists & Invitations", badge: "v2.4 Scope", desc: "Enterprise scoping invitations & dispatch" },
      { href: "/admin/checklists", label: "Master Checklists", badge: "50 Checkpoints", desc: "Architecture baseline definitions & 50-point technical checklist" },
      { href: "/admin/onboarding", label: "Client Onboarding Console", badge: "Stage 7", desc: "Credential handoff, kickoff forms & repository setup" },
      { href: "/admin/documents", label: "Document Vault", badge: "PDF Storage", desc: "Signed SOWs, Tax Invoices & Payment Receipts repository" },
      { href: "/onboard", label: "Self-Service Client Onboard", badge: "Client Flow", desc: "Public client self-service onboarding entry point", isExternalPreview: true },
      { href: "/checklist", label: "50-Point Scoping Demo", badge: "Interactive", desc: "Live interactive enterprise scoping checklist preview", isExternalPreview: true },
      { href: "/enterprise-checklist", label: "Enterprise Checklist Gateway", badge: "Stage 1 Gate", desc: "Token gateway redirecting to engagement checklist milestone", isExternalPreview: true },
      { href: "/onboarding", label: "Client Onboarding Gateway", badge: "Stage 7 Gate", desc: "Token gateway redirecting to engagement onboarding milestone", isExternalPreview: true },
      { href: "/handover", label: "Project Handover Gateway", badge: "Stage 12 Gate", desc: "Token gateway redirecting to engagement handover milestone", isExternalPreview: true },
    ],
  },
  {
    id: "financials",
    name: "2. Financials & Payments",
    subtitle: "50/50 Milestones & UPI Audit",
    icon: Receipt,
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
      { href: "/admin/payments", label: "Bank Reconciliation", badge: "Super Admin", desc: "12-digit UTR bank statement audit, receiving bank verification & receipt generation" },
      { href: "/admin/invoices", label: "Tax Invoices Ledger", badge: "Tax Invoices", desc: "18% GST statutory invoice journal & compliance trail" },
      { href: "/admin/invoices/new", label: "Issue New Invoice", badge: "+ Action", desc: "Single-page A4 PDF invoice generator with dual milestone split" },
      { href: "/admin/quotations", label: "Quotation Engine", badge: "V6 Engine", desc: "Instant pricing, scope, dual milestones & quote lifecycle" },
      { href: "/admin/quotations/new", label: "Draft New Quotation", badge: "+ Action", desc: "Dual milestones, 77-service pricing & PDF generator" },
      { href: "/admin/quotations/catalog", label: "Quotation Rate Catalog", badge: "77 Services", desc: "Standard rate card & module deliverables directory" },
      { href: "/admin/quotations/coupons", label: "Discount Coupons", badge: "Promotions", desc: "Commercial partner discount codes & percentage offsets" },
      { href: "/admin/proposals", label: "Proposals & SOWs", badge: "Contracts", desc: "Master commercial terms & binding SOW agreements" },
      { href: "/admin/proposals/new", label: "Draft Proposal", badge: "+ Action", desc: "50/50 milestone structure proposal generator" },
      { href: "/admin/contracts", label: "Client Contracts & SOWs", badge: "Contracts", desc: "Admin contract register and legal execution console" },
      { href: "/payment", label: "UPI Payment Portal Gateway", badge: "Stage 6/11", desc: "Token payment gate redirecting to active engagement payment milestone", isExternalPreview: true },
      { href: "/proposal", label: "Commercial Proposal Gateway", badge: "Stage 4 Gate", desc: "Token gateway redirecting to engagement proposal milestone", isExternalPreview: true },
      { href: "/quotation", label: "Commercial Quotation Gateway", badge: "Quote Gate", desc: "Token gateway redirecting to client quotation milestone", isExternalPreview: true },
    ],
  },
  {
    id: "crm",
    name: "3. CRM Pipeline & Outreach",
    subtitle: "Inbound Inquiries & Campaigns",
    icon: Users,
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
      label: "View CRM Leads Ledger →",
    },
    items: [
      { href: "/admin/intake", label: "Intake Stream", badge: "Inbound", desc: "Real-time client contact submissions & web intake" },
      { href: "/admin/leads", label: "CRM Leads Ledger", badge: "Dossiers", desc: "Scored leads, engagement timelines & executive history" },
      { href: "/admin/ai-leads", label: "AI Leads Intelligence", badge: "AI Scored", desc: "Autonomous ICP classification & conversion propensity" },
      { href: "/admin/bookings", label: "Consultation Bookings", badge: "Calendar", desc: "Google Meet consultations, slots & attendee details" },
      { href: "/admin/outreach", label: "Outreach Campaign Hub", badge: "Outbound", desc: "Enterprise outbound campaign orchestration & sender health" },
      { href: "/admin/outreach/studio", label: "Outreach Studio", badge: "Sequences", desc: "Multi-touch cadence sequence designer & copy steps" },
      { href: "/admin/outreach/queue", label: "Dispatch Queue", badge: "Execution", desc: "Scheduled email & message releases with pacing" },
      { href: "/admin/outreach/suppression", label: "Suppression Registry", badge: "Opt-Out", desc: "DND, statutory compliance & domain-level blocklists" },
      { href: "/admin/outreach/analytics", label: "Outreach Analytics", badge: "Metrics", desc: "Open rates, reply rates & pipeline attribution" },
      { href: "/admin/outreach/compliance", label: "Compliance & Jurisdictions", badge: "Legal", desc: "GDPR, CAN-SPAM, Indian DND guards & audit rules" },
      { href: "/admin/outreach/playbook", label: "Message Playbook", badge: "Templates", desc: "Pre-approved corporate copy guidelines & value props" },
      { href: "/booking/success", label: "Booking Confirmation Screen", badge: "Confirmed", desc: "Google Meet consultation confirmed success landing", isExternalPreview: true },
      { href: "/booking/cancelled", label: "Booking Reschedule Screen", badge: "Reschedule", desc: "Consultation cancellation & slot rescheduling page", isExternalPreview: true },
    ],
  },
  {
    id: "communications",
    name: "4. Comms & Support",
    subtitle: "Transactional Emails & Helpdesk",
    icon: Mail,
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
      { href: "/admin/support", label: "Support Helpdesk", badge: "Tickets", desc: "Customer tickets, priority SLAs & resolution tracking" },
      { href: "/support/new", label: "Submit Support Ticket", badge: "Intake", desc: "Public customer ticket creation & priority intake form", isExternalPreview: true },
      { href: "/admin/emails", label: "Transactional Email Logs", badge: "Delivery", desc: "Live SMTP outbox logs, delivery audit & telemetry" },
      { href: "/admin/emails/new", label: "Compose Email", badge: "+ Action", desc: "Direct branded transactional message dispatch" },
      { href: "/admin/emails/mailboxes", label: "Mailboxes Configuration", badge: "SMTP/DNS", desc: "Sender domains, SPF/DKIM verification & MX records" },
      { href: "/admin/emails/outbox", label: "Outbox Queue", badge: "Pending", desc: "Buffered dispatches, circuit breaking & retry schedules" },
      { href: "/admin/email-preview", label: "Email Template Previews", badge: "LIT V2", desc: "Dual document receipts, step alerts & stage unlock emails" },
    ],
  },
  {
    id: "automations",
    name: "5. Automations & Workflows",
    subtitle: "180 Workflows & Edge Daemons",
    icon: Zap,
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
      { href: "/admin/automations", label: "Automations Hub", badge: "Four-Site", desc: "Centralized execution telemetry & cron daemons" },
      { href: "/admin/automations/catalog", label: "Workflow Catalog", badge: "180 Tasks", desc: "All 180 production background workflows across 4 sites" },
      { href: "/admin/automations/approvals", label: "Action Approvals Gate", badge: "Safety Gate", desc: "Super Admin human-in-the-loop approvals for R3/R4" },
      { href: "/admin/automations/workflows", label: "Automated Workflows", badge: "Orchestration", desc: "Active task execution pipelines & definitions" },
      { href: "/admin/automations/executions", label: "Execution History", badge: "Run Logs", desc: "Granular step-by-step workflow run audit logs" },
      { href: "/admin/automations/schedules", label: "Job Schedules & Crons", badge: "Cron Rules", desc: "Automated recurrence triggers & timing" },
      { href: "/admin/automations/dead-letter", label: "Dead Letter Queue (DLQ)", badge: "Failures", desc: "Failed event retries, poison pill isolation & alerts" },
      { href: "/admin/automations/site-health", label: "Site Health Probes", badge: "Live Probes", desc: "Four-site synthetic edge monitors & heartbeat checks" },
      { href: "/admin/automations/connectors", label: "System Connectors", badge: "Integrations", desc: "Supabase, Redis, Resend, Vercel & Fastly bridges" },
      { href: "/admin/automations/deployments", label: "Deployment Logs", badge: "CI/CD", desc: "Multi-repo Vercel and Edge deployment status" },
      { href: "/admin/automations/events", label: "Event Bus Streams", badge: "Webhooks", desc: "Real-time event subscription bus & event ledger" },
      { href: "/admin/automations/n8n", label: "n8n Workflow Engine", badge: "Flow Engine", desc: "Self-hosted node-based workflow server bridge" },
      { href: "/admin/automations/reports", label: "Reliability Reports", badge: "Audit", desc: "Uptime, error budgets & synthetic SLA metrics" },
      { href: "/admin/automations/governance", label: "Governance & Runbooks", badge: "SOP", desc: "Operational runbooks & failover procedures" },
    ],
  },
  {
    id: "seo-cdn",
    name: "6. SEO, CDN & Edge Network",
    subtitle: "Google Search Console & Fastly",
    icon: Globe,
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
      { href: "/admin/seo", label: "SEO Intelligence Console", badge: "Search", desc: "Crawling, indexing & 4-site properties overview" },
      { href: "/admin/seo/url-inspection", label: "SEO URL Inspection Tool", badge: "Edge Inspector", desc: "Real-time edge indexability & GSC verification" },
      { href: "/admin/seo/sitemaps", label: "Dynamic XML Sitemaps", badge: "XML", desc: "Authoritative multi-site sitemap verification" },
      { href: "/admin/seo/sites", label: "Four-Site SEO Registry", badge: "Multi-Domain", desc: "Domain property configurations & canonical targets" },
      { href: "/admin/seo/schedules", label: "72-Hour Crawl Schedules", badge: "Cadence", desc: "Automated 72-hour crawl scheduler & slot allocations" },
      { href: "/admin/command-center/visibility", label: "Visibility Engine", badge: "Rankings", desc: "Four-site organic search performance & keyword rank" },
      { href: "/admin/cdn", label: "Edge CDN Cache Purge", badge: "Fastly/Edge", desc: "Stale cache invalidation, instant purges & TTL controls" },
      { href: "/admin/cdn/cache-jobs", label: "Cache Invalidation Jobs", badge: "Purge History", desc: "Edge CDN purge execution journal & status" },
    ],
  },
  {
    id: "client-workspace",
    name: "7. Client Workspace & Portals",
    subtitle: "Client Side Experience & Tools",
    icon: LayoutDashboard,
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
      { href: "/client/dashboard", label: "Client Workspace Dashboard", badge: "Client View", desc: "Client-facing project overview, milestones & actions", isExternalPreview: true },
      { href: "/client/projects", label: "Client Projects Portfolio", badge: "Projects", desc: "Active engagements, sprint deliverables & delivery tracks", isExternalPreview: true },
      { href: "/client/messages", label: "Client Messaging & Comms", badge: "Inbox", desc: "Direct communications with engineering team & notices", isExternalPreview: true },
      { href: "/client/change-requests", label: "Change Requests (RFCs)", badge: "Scope Control", desc: "Client request for changes management ledger", isExternalPreview: true },
      { href: "/client/actions", label: "Action Items & Sign-Offs", badge: "Approvals", desc: "Pending approvals, deliverables & blocker clearance", isExternalPreview: true },
      { href: "/client/documents", label: "Client Documents Vault", badge: "Contracts", desc: "Client view of signed agreements, invoices & specs", isExternalPreview: true },
      { href: "/client/invoices", label: "Client Invoices & Receipts", badge: "Billing", desc: "Client view of paid & outstanding invoices", isExternalPreview: true },
      { href: "/client/meetings", label: "Client Scheduled Sessions", badge: "Sessions", desc: "Discovery, review & delivery meeting calendar", isExternalPreview: true },
      { href: "/client/notifications", label: "Notification Preferences", badge: "Feed", desc: "Client notification feed, digest rules & delivery channels", isExternalPreview: true },
      { href: "/client/support", label: "Client Support Portal", badge: "Helpdesk", desc: "Client ticket submission & resolution status", isExternalPreview: true },
      { href: "/client/profile", label: "Client Organization Profile", badge: "Profile", desc: "Client company details, billing info & primary contacts", isExternalPreview: true },
      { href: "/client/login", label: "Client Portal Authentication", badge: "Auth Gate", desc: "Magic-link and authenticated login gate for clients", isExternalPreview: true },
      { href: "/client", label: "Client Portal Gateway", badge: "Root Entry", desc: "Root client routing gateway redirecting to Workspace", isExternalPreview: true },
    ],
  },
  {
    id: "governance",
    name: "8. Governance & System Security",
    subtitle: "MSME, RBAC & Core Products",
    icon: Building,
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
      { href: "/admin/company", label: "Company & MSME Credentials", badge: "Verified", desc: "MSME UDYAM-TN-03-0345274, registered address & GSTIN" },
      { href: "/admin/status", label: "System Telemetry & Uptime", badge: "Status", desc: "Database, Redis, Storage & edge latency health checks" },
      { href: "/admin/analytics", label: "Executive Analytics", badge: "KPIs", desc: "Paid revenue, pipeline velocity & cohorts" },
      { href: "/admin/team", label: "Team & Staff Access", badge: "RBAC", desc: "Capability matrix, staff roles & session security" },
      { href: "/admin/workspaces", label: "Staff Admin Workspaces", badge: "Workspaces", desc: "Person-specific staff workspaces, credential lifecycle & access governance" },
      { href: "/admin/workspaces/new", label: "Provision Staff Workspace", badge: "+ Action", desc: "Dedicated personnel workspace creator with credentials, role and assignments" },
      { href: "/admin/audit", label: "Cryptographic Audit Log", badge: "SHA-256", desc: "Immutable SHA-256 trail of all administrative actions" },
      { href: "/admin/command-center", label: "Executive Command Center", badge: "Dashboard", desc: "Real-time operations, revenue metrics, KPIs and master module index" },
      { href: "/admin/forbidden", label: "Access Forbidden Safety Screen", badge: "Security", desc: "Capability-denied guard & session safety handling" },
      { href: "/login", label: "Staff Authentication Gate", badge: "Staff Login", desc: "Secure internal credential login for LIT team", isExternalPreview: true },
      { href: "/reset-password", label: "Password Recovery", badge: "Credentials", desc: "Self-service staff password reset and token recovery", isExternalPreview: true },
      { href: "/profile", label: "Staff Profile & Settings", badge: "Account", desc: "Authenticated user settings and profile management", isExternalPreview: true },
      { href: "/unsubscribe", label: "Global Opt-Out & Unsubscribe", badge: "Statutory", desc: "Public unsubscribe handler and suppression registrar", isExternalPreview: true },
      { href: "/admin", label: "Admin Root Gateway", badge: "Gateway", desc: "Canonical root operations gateway redirecting to Executive Command Center" },
      { href: "/auth", label: "Authentication Routing Gateway", badge: "Auth Gateway", desc: "Canonical authentication gate redirecting to staff login", isExternalPreview: true },
    ],
  },
  {
    id: "ai-products",
    name: "9. AI Products & Showcases",
    subtitle: "VoiceShield, Logic Voice & AI Studio",
    icon: Bot,
    tone: {
      border: "border-violet-200",
      bg: "bg-violet-50",
      text: "text-violet-700",
      hoverBorder: "hover:border-violet-300",
      badge: "bg-violet-50 text-violet-700 border-violet-200",
      button: "bg-violet-50 hover:bg-violet-100/70 border-violet-200 text-violet-800",
    },
    footerLink: {
      href: "/products",
      label: "Browse All Products & Models →",
    },
    items: [
      { href: "/voice-shield", label: "VoiceShield AI Defense", badge: "Active Product", desc: "State-of-the-art synthetic voice & audio deepfake detection engine", isExternalPreview: true },
      { href: "/products/logic-voice", label: "Logic Voice Assistant", badge: "Active Product", desc: "Enterprise ultra-low-latency voice AI platform", isExternalPreview: true },
      { href: "/products/ai-voice-agents", label: "AI Voice Agents", badge: "Solutions", desc: "Autonomous telephonic customer service & outbound voice agents", isExternalPreview: true },
      { href: "/products/ai-website-agents", label: "AI Website Agents", badge: "Solutions", desc: "Interactive conversational web agents with real-time RAG", isExternalPreview: true },
      { href: "/ai", label: "Enterprise AI Studio", badge: "Full Studio", desc: "Enterprise LLM orchestrations, fine-tuning & infrastructure", isExternalPreview: true },
      { href: "/healthcare", label: "Smart Hospital Platform", badge: "Enterprise", desc: "A-to-T module hospital management & clinical workflows", isExternalPreview: true },
      { href: "/healthcare/plans", label: "Healthcare Plans & Tiers", badge: "Commercial", desc: "Hospital deployment sizing, pricing tiers & SLA packages", isExternalPreview: true },
      { href: "/packages", label: "Solution Packages Catalog", badge: "Fixed-Scope", desc: "Pre-packaged AI & engineering delivery bundles", isExternalPreview: true },
      { href: "/products", label: "All Products & Solutions", badge: "Catalog", desc: "Full directory of LIT proprietary software products", isExternalPreview: true },
      { href: "/products/facts", label: "Product Facts & Benchmarks", badge: "Verified", desc: "Technical specs, latency benchmarks & architecture facts", isExternalPreview: true },
      { href: "/pricing", label: "Enterprise Pricing Model", badge: "50/50 Model", desc: "Production pricing structure & milestone payment terms", isExternalPreview: true },
      { href: "/roi-calculator", label: "AI ROI Calculator", badge: "Client Tool", desc: "Enterprise ROI feasibility & financial savings calculator", isExternalPreview: true },
    ],
  },
  {
    id: "services-architecture",
    name: "10. Services & Architecture",
    subtitle: "Custom Engineering & Advisory",
    icon: Code,
    tone: {
      border: "border-sky-200",
      bg: "bg-sky-50",
      text: "text-sky-700",
      hoverBorder: "hover:border-sky-300",
      badge: "bg-sky-50 text-sky-700 border-sky-200",
      button: "bg-sky-50 hover:bg-sky-100/70 border-sky-200 text-sky-800",
    },
    footerLink: {
      href: "/services",
      label: "View All Engineering Services →",
    },
    items: [
      { href: "/services", label: "Enterprise Engineering Services", badge: "Services", desc: "Custom software, full-stack, cloud & AI engineering", isExternalPreview: true },
      { href: "/discovery", label: "Public Project Discovery Wizard", badge: "Interactive", desc: "Interactive 6-step project scoping, deliverables & architecture wizard", isExternalPreview: true },
      { href: "/industries", label: "Industry Verticals", badge: "Verticals", desc: "Domain solutions for Healthcare, Finance, Logistics & Retail", isExternalPreview: true },
      { href: "/work", label: "Case Studies & Client Work", badge: "Portfolio", desc: "Production delivery case studies, architecture & ROI results", isExternalPreview: true },
      { href: "/architecture", label: "System Architecture Blueprints", badge: "Engineering", desc: "High-concurrency microservices, Edge CDN & Supabase topologies", isExternalPreview: true },
      { href: "/certifications", label: "Security & Compliance Standards", badge: "Audited", desc: "ISO 27001, SOC 2, HIPAA & MSME statutory compliance", isExternalPreview: true },
      { href: "/expertise", label: "Core Technical Competencies", badge: "Tech Stack", desc: "Distributed systems, PyTorch, Next.js & enterprise databases", isExternalPreview: true },
      { href: "/ai-assistant", label: "Conversational AI Assistant", badge: "Interactive", desc: "Live conversational AI agent demo & interactive benchmark", isExternalPreview: true },
      { href: "/ai-discovery", label: "AI Discovery Framework", badge: "Advisory", desc: "Structured enterprise AI adoption & scoping methodology", isExternalPreview: true },
      { href: "/ai-ethics", label: "AI Ethics & Safety Charter", badge: "Governance", desc: "Principles for zero-bias, explainability & responsible AI", isExternalPreview: true },
      { href: "/book-consultation", label: "Book Technical Consultation", badge: "Booking", desc: "Direct scheduling with Principal Architect Vikash Saravanan", isExternalPreview: true },
      { href: "/free-demo", label: "Request Architecture Demo", badge: "Live Demo", desc: "Interactive product walkthroughs & proof of concepts", isExternalPreview: true },
      { href: "/sales", label: "Enterprise Sales Inquiries", badge: "Sales", desc: "Custom procurement, RFPs & enterprise contract inquiries", isExternalPreview: true },
      { href: "/booking", label: "Consultation Booking Shortlink", badge: "Shortlink", desc: "Shortlink route canonicalizing to /book-consultation", isExternalPreview: true },
    ],
  },
  {
    id: "corporate-knowledge",
    name: "11. Corporate, Media & Knowledge",
    subtitle: "Dossiers, API Docs & Resources",
    icon: BookOpen,
    tone: {
      border: "border-orange-200",
      bg: "bg-orange-50",
      text: "text-orange-800",
      hoverBorder: "hover:border-orange-300",
      badge: "bg-orange-50 text-orange-800 border-orange-200",
      button: "bg-orange-50 hover:bg-orange-100/70 border-orange-200 text-orange-900",
    },
    footerLink: {
      href: "/knowledge-base",
      label: "Open Knowledge Base →",
    },
    items: [
      { href: "/", label: "LIT Corporate Homepage", badge: "Public Home", desc: "Primary production homepage, enterprise hero & technology overview", isExternalPreview: true },
      { href: "/search", label: "Universal Site Search", badge: "Site Search", desc: "Real-time client search across products, services, blog & whitepapers", isExternalPreview: true },
      { href: "/about", label: "About Logic Intelligence Technologies", badge: "Corporate", desc: "Company vision, mission & engineering principles", isExternalPreview: true },
      { href: "/about/founder", label: "Founder Dossier: Vikash Saravanan", badge: "Leadership", desc: "Founder profile, technical background & architectural philosophy", isExternalPreview: true },
      { href: "/company/facts", label: "Verified Company Facts", badge: "MSME", desc: "Statutory registration, address, leadership & verified facts", isExternalPreview: true },
      { href: "/docs/api", label: "Platform API Documentation", badge: "Developer", desc: "OpenAPI specifications, webhook contracts & SDK guides", isExternalPreview: true },
      { href: "/knowledge-base", label: "Engineering Knowledge Base", badge: "Docs", desc: "Technical runbooks, deployment guides & architectural articles", isExternalPreview: true },
      { href: "/blog", label: "LIT Engineering Blog", badge: "Insights", desc: "Deep-dives into AI latency, security & software engineering", isExternalPreview: true },
      { href: "/resources", label: "Whitepapers & Research Guides", badge: "Publications", desc: "Technical whitepapers, benchmarks & architectural guides", isExternalPreview: true },
      { href: "/careers", label: "Careers at LIT", badge: "Hiring", desc: "Open engineering, AI research & architectural positions", isExternalPreview: true },
      { href: "/jobs", label: "Job Board & Openings", badge: "Opportunities", desc: "Active vacancies, benefits & direct application pipeline", isExternalPreview: true },
      { href: "/investors", label: "Investor Relations", badge: "Financial", desc: "Corporate growth, financial metrics & capital strategy", isExternalPreview: true },
      { href: "/investor-brief", label: "Executive Investor Brief", badge: "Dossier", desc: "High-level summary of technology moats & revenue model", isExternalPreview: true },
      { href: "/press", label: "Press Room & Announcements", badge: "Media", desc: "Official press releases, media kits & platform announcements", isExternalPreview: true },
      { href: "/community", label: "Developer Community", badge: "Ecosystem", desc: "Open-source contributions, webinars & developer resources", isExternalPreview: true },
      { href: "/contact", label: "Global Contact Directory", badge: "Contact", desc: "Coimbatore HQ address, email channels & response SLAs", isExternalPreview: true },
      { href: "/help-center", label: "Self-Service Help Center", badge: "Knowledge", desc: "Frequently asked questions, guides & troubleshooting steps", isExternalPreview: true },
      { href: "/support", label: "Public Support Helpdesk", badge: "Public", desc: "Public customer ticket creation & resolution tracking", isExternalPreview: true },
      { href: "/status", label: "Public Status Page", badge: "Public Uptime", desc: "Public service availability and real-time maintenance feed", isExternalPreview: true },
      { href: "/company", label: "Company Overview Shortlink", badge: "Shortlink", desc: "Shortlink route canonicalizing to /company/facts", isExternalPreview: true },
      { href: "/docs", label: "Documentation Portal Shortlink", badge: "Shortlink", desc: "Shortlink route canonicalizing to /docs/api", isExternalPreview: true },
    ],
  },
  {
    id: "legal-policies",
    name: "12. Statutory Legal Policies",
    subtitle: "Compliance, Privacy & Terms",
    icon: Scale,
    tone: {
      border: "border-zinc-300",
      bg: "bg-zinc-100",
      text: "text-zinc-800",
      hoverBorder: "hover:border-zinc-400",
      badge: "bg-zinc-100 text-zinc-800 border-zinc-300",
      button: "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-900",
    },
    footerLink: {
      href: "/terms",
      label: "View Master Terms of Service →",
    },
    items: [
      { href: "/security", label: "Security & Threat Posture", badge: "Security", desc: "Pen-testing, encryption standards & bug bounty program", isExternalPreview: true },
      { href: "/privacy", label: "Privacy Policy", badge: "Statutory", desc: "Data protection, GDPR & Indian DPDP Act compliance", isExternalPreview: true },
      { href: "/privacy-policy", label: "Privacy Policy (Statutory Alias)", badge: "Alias", desc: "Statutory alias route canonicalizing to /privacy", isExternalPreview: true },
      { href: "/terms", label: "Master Terms of Service", badge: "Legal", desc: "Terms of platform use, warranties & commercial limitations", isExternalPreview: true },
      { href: "/terms-of-service", label: "Terms of Service (Statutory Alias)", badge: "Alias", desc: "Statutory alias route canonicalizing to /terms", isExternalPreview: true },
      { href: "/refund-policy", label: "Cancellation & Refund Policy", badge: "Commercial", desc: "Statutory 50/50 payment milestone refund policies", isExternalPreview: true },
      { href: "/cookie-policy", label: "Cookie & Telemetry Policy", badge: "Legal", desc: "Browser cookie usage, local storage & tracking policies", isExternalPreview: true },
      { href: "/accessibility", label: "Accessibility Statement", badge: "WCAG 2.1", desc: "WCAG 2.1 AA accessibility commitment & compliance", isExternalPreview: true },
    ],
  },
  {
    id: "stage-previews",
    name: "13. Canonical 13 Stages",
    subtitle: "Interactive Client Stage Gates",
    icon: Layers,
    tone: {
      border: "border-rose-200",
      bg: "bg-rose-50",
      text: "text-rose-800",
      hoverBorder: "hover:border-rose-300",
      badge: "bg-rose-50 text-rose-800 border-rose-200",
      button: "bg-rose-50 hover:bg-rose-100/70 border-rose-200 text-rose-900",
    },
    footerLink: {
      href: "/engagement/ENG-2026-LIT-SAMPLE",
      label: "Preview 13-Stage Demo Portal →",
    },
    items: [
      { href: "/engagement/ENG-2026-LIT-SAMPLE/checklist", label: "Stage 01: 50-Point Checklist", badge: "Stage 1", desc: "Interactive enterprise checklist submission & baseline", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/discovery", label: "Stage 02: Technical Discovery", badge: "Stage 2", desc: "Consultation booking & cloud architecture preferences", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/technical-spec", label: "Stage 03: Technical Specification", badge: "Stage 3", desc: "Architecture blueprint & technical specification sign-off", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/proposal", label: "Stage 04: Commercial Proposal", badge: "Stage 4", desc: "Commercial deliverables & 50/50 payment terms review", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/sow", label: "Stage 05: Master SOW Agreement", badge: "Stage 5", desc: "Digital signature & legally binding SOW execution", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/initial-invoice", label: "Stage 06: Initial 50% Deposit", badge: "Stage 6", desc: "Dynamic UPI QR, billing details gate & UTR submission", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/onboarding", label: "Stage 07: Client Onboarding", badge: "Stage 7", desc: "Credential handoff & technical repository provisioning", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/development", label: "Stage 08: Sprint Execution", badge: "Stage 8", desc: "Sprint deliverables tracking & Change Requests (RFCs)", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/acceptance", label: "Stage 09: Client UAT Acceptance", badge: "Stage 9", desc: "User acceptance testing, QA verification & client sign-off", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/delivery-acceptance", label: "Stage 10: Delivery Sign-Off", badge: "Stage 10", desc: "Formal delivery acceptance certificate & milestone completion", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/final-payment", label: "Stage 11: Final 50% Settlement", badge: "Stage 11", desc: "Final milestone UPI payment, UTR verification & receipt", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/handover", label: "Stage 12: Production Handover", badge: "Stage 12", desc: "DNS cutover, production domain & credentials transfer", isExternalPreview: true },
      { href: "/engagement/ENG-2026-LIT-SAMPLE/support", label: "Stage 13: Support & Maintenance", badge: "Stage 13", desc: "Post-launch 24/7 SLA maintenance & helpdesk desk", isExternalPreview: true },
    ],
  },
];

export function MasterModuleDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");

  const totalToolCount = useMemo(() => {
    return MODULE_CATEGORIES.reduce((acc, cat) => acc + cat.items.length, 0);
  }, []);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return MODULE_CATEGORIES.map((cat) => {
      // Filter items within category
      const matchingItems = cat.items.filter((item) => {
        if (!q) return true;
        return (
          item.label.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q) ||
          item.href.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q)
        );
      });

      return {
        ...cat,
        items: matchingItems,
      };
    }).filter((cat) => {
      // Category filter check
      if (activeCategoryId !== "all" && cat.id !== activeCategoryId) {
        return false;
      }
      return cat.items.length > 0;
    });
  }, [searchQuery, activeCategoryId]);

  const matchedToolCount = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  return (
    <div className="space-y-6 pt-2">
      {/* Directory Title & Search Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] tracking-tight flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--lit-navy,#0B2545)]/10 text-[var(--lit-navy,#0B2545)]">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <span>Master Operations &amp; Module Directory</span>
            </h2>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#1565C0] border border-blue-200 px-2.5 py-0.5 rounded-full">
              {matchedToolCount === totalToolCount
                ? `${totalToolCount} Modules Connected`
                : `${matchedToolCount} of ${totalToolCount} Modules`}
            </span>
          </div>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">
            Complete, authoritative directory of all {totalToolCount} pages, administrative tools, portals, billing tools, and automated pipelines across the platform.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px] sm:min-w-[340px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by module name, keyword, or path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0]/30 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded bg-slate-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setActiveCategoryId("all")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-xs ${
            activeCategoryId === "all"
              ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
              : "bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Categories ({totalToolCount})
        </button>
        {MODULE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-xs flex items-center gap-1.5 ${
              activeCategoryId === cat.id
                ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                : "bg-white border border-[var(--lit-border-light,#DFE7EF)] text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>{cat.name}</span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                activeCategoryId === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {cat.items.length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid of Categories */}
      {filteredCategories.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <p className="text-sm font-bold text-slate-700">No modules match your search &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-xs text-slate-400 mt-1">Try searching for keywords like &ldquo;invoice&rdquo;, &ldquo;seo&rdquo;, &ldquo;lead&rdquo;, or &ldquo;checklist&rdquo;.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategoryId("all");
            }}
            className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => {
            const IconComponent = category.icon;

            return (
              <div
                key={category.id}
                className={`rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs ${category.tone.hoverBorder} transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${category.tone.bg} border ${category.tone.border} ${category.tone.text}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">{category.name}</h3>
                        <p className="text-[10px] text-slate-500 font-mono">{category.subtitle}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${category.tone.badge}`}>
                      {category.items.length} Tools
                    </span>
                  </div>

                  <div className="mt-3.5 divide-y divide-slate-100">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="py-2.5 px-2 -mx-2 rounded-xl flex items-center justify-between gap-2 hover:bg-[var(--lit-cloud,#F7F9FC)] group transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold text-[var(--lit-navy,#0B2545)] group-hover:${category.tone.text} transition-colors truncate`}>
                              {item.label}
                            </span>
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                        </div>
                        {item.isExternalPreview ? (
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1565C0] group-hover:translate-x-0.5 transition-all shrink-0" />
                        ) : (
                          <ArrowRight className={`w-3.5 h-3.5 text-slate-400 group-hover:${category.tone.text} group-hover:translate-x-0.5 transition-all shrink-0`} />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    href={category.footerLink.href}
                    className={`w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border font-bold text-xs transition-colors ${category.tone.button}`}
                  >
                    <span>{category.footerLink.label}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
