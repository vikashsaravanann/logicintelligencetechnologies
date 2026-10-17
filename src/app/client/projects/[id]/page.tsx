import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/components/navigation/back-button";
import {
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  ShieldCheck,
  FileText,
  PlusCircle,
  Briefcase,
  GitBranch,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";
import { getPortalContext, getOwnRow, listOwnRows } from "@/lib/client-portal/data";
import { formatINR, formatIST } from "@/lib/format/datetime";
import { getDeliveryTeamForClientProject } from "@/lib/collaboration/project-collaboration-service";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Project Milestone Details | Client Portal | Logic Intelligence Technologies",
  description: "Granular engineering milestone verification, sprint deliverables, and deployment tracking.",
};

export const revalidate = 0;

export default async function ClientProjectDetailPage({ params }: Props) {
  const { id } = await params;

  const portal = await getPortalContext(`/client/projects/${id}`);
  const [project, allInvoices, deliveryTeam] = await Promise.all([
    getOwnRow(portal, "projects", id),
    listOwnRows(portal, "invoices"),
    getDeliveryTeamForClientProject(id, portal.user.id),
  ]);

  if (!project) {
    notFound();
  }

  const projectInvoices = allInvoices?.filter((inv) => inv.project_id === id) || [];
  const isDone = (project.progress ?? 0) === 100 || project.status === "Completed";
  const statusStyle = isDone
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : project.status === "In Progress" || project.status === "Active"
      ? "bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border-teal-200"
      : "bg-blue-50 text-blue-700 border-blue-200";

  const milestones = [
    {
      code: "M1",
      title: "Architecture, Database & API Specifications",
      description: "Entity relation schemas, zero-trust API contracts, and infrastructure topology baseline.",
      deliverables: ["Supabase schema migrations", "RBAC & RLS isolation tests", "Swagger / OpenAPI spec"],
      status: (project.progress ?? 0) >= 25 ? "Done" : (project.progress ?? 0) > 0 ? "In Progress" : "Scheduled",
      targetPct: 25,
    },
    {
      code: "M2",
      title: "Front-End UI Components & Design Verification",
      description: "Clinical light design system integration, responsive viewports, and WCAG AA verification.",
      deliverables: ["Component test suites", "Design tokens parity check", "Cross-browser mobile QA"],
      status: (project.progress ?? 0) >= 50 ? "Done" : (project.progress ?? 0) >= 25 ? "In Progress" : "Scheduled",
      targetPct: 50,
    },
    {
      code: "M3",
      title: "Backend Logic, Integrations & Auth Isolation",
      description: "Server actions, background workers, encrypted payload handling, and webhooks execution.",
      deliverables: ["Idempotent payment webhooks", "Email dispatch pipeline", "Rate limiter stress test"],
      status: (project.progress ?? 0) >= 75 ? "Done" : (project.progress ?? 0) >= 50 ? "In Progress" : "Scheduled",
      targetPct: 75,
    },
    {
      code: "M4",
      title: "Full UAT, Production Deployment & Code Handover",
      description: "Production dry-run, load testing, comprehensive audit sign-off, and repository transfer.",
      deliverables: ["Signed IP assignment", "100% test coverage verification", "Production environment cutover"],
      status: (project.progress ?? 0) === 100 ? "Done" : (project.progress ?? 0) >= 75 ? "In Progress" : "Scheduled",
      targetPct: 100,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <BackButton fallbackHref="/client/projects" label="Back to Projects" inline />
      </div>

      {/* Project Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-[var(--lit-navy,#0B2545)] border border-slate-200">
              {project.project_code || "PRJ-LIT"}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border font-mono ${statusStyle}`}>
              {project.status || "In Progress"}
            </span>
            <span className="text-xs text-[var(--lit-text-muted,#52677C)]">
              Client: <strong className="text-[var(--lit-ink,#121826)]">{project.client_name}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
            {project.name}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Real-time milestone completion status, engineering deliverables, and technical handoff milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/client/support?project=${encodeURIComponent(project.project_code || project.name)}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs tracking-wide shadow-2xs transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Report Blocker</span>
          </Link>
          <Link
            href="/book-consultation"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white font-semibold text-xs tracking-wide shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4 text-cyan-300" />
            <span>Sprint Review Call</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Overall Progress</span>
            <GitBranch className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
            {project.progress ?? 0}%
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--lit-cloud,#F7F9FC)] border border-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--lit-teal,#1FA9A2)] to-[var(--lit-blue,#1565C0)] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, project.progress ?? 0))}%` }}
            />
          </div>
        </div>

        {/* Project SOW Value */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Committed Value</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
            {formatINR(project.value)}
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Fixed scope milestone billing
          </p>
        </div>

        {/* Target Delivery Date */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Target Completion</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-[var(--lit-navy,#0B2545)] font-poppins truncate">
            {project.due_date ? formatIST(project.due_date, "date") : "Continuous Sprint"}
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Scheduled release window
          </p>
        </div>

        {/* Security & Verification */}
        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
            <span>Security State</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-emerald-700 font-poppins">
            RLS Isolated
          </div>
          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">
            Encrypted artifact storage
          </p>
        </div>
      </div>

      {/* Engineering Milestones */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
              Standard Engineering Milestones
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Sequential phase gates verified by continuous integration tests and engineering review sign-offs.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[var(--lit-navy,#0B2545)] border border-slate-200 self-start sm:self-auto font-mono">
            {milestones.filter((m) => m.status === "Done").length} of {milestones.length} Completed
          </span>
        </div>

        <div className="space-y-4">
          {milestones.map((m) => {
            const isMilestoneDone = m.status === "Done";
            const isMilestoneInProgress = m.status === "In Progress";

            return (
              <div
                key={m.code}
                className={`p-5 rounded-xl border transition-all ${
                  isMilestoneDone
                    ? "bg-emerald-50/30 border-emerald-200"
                    : isMilestoneInProgress
                      ? "bg-teal-50/30 border-teal-300 ring-1 ring-teal-100"
                      : "bg-[var(--lit-cloud,#F7F9FC)]/50 border-[var(--lit-border-light,#DFE7EF)] opacity-75"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5">
                      {isMilestoneDone ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isMilestoneInProgress ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-[var(--lit-teal,#1FA9A2)] animate-pulse">
                          <Clock className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-500 font-mono text-xs font-bold">
                          {m.code}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[var(--lit-text-muted,#52677C)]">
                          {m.code}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                          {m.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1 max-w-2xl">
                        {m.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {m.deliverables.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-ink,#121826)] font-mono"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                            <span>{item}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border font-mono self-start sm:self-auto ${
                      isMilestoneDone
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : isMilestoneInProgress
                          ? "bg-teal-100 text-teal-800 border-teal-300"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assigned LIT Delivery Team */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
                Assigned LIT Delivery Team
              </h2>
            </div>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Dedicated cloud architects and AI engineers assigned to this engagement.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[var(--lit-navy,#0B2545)] border border-slate-200 self-start sm:self-auto font-mono">
            {deliveryTeam.length} {deliveryTeam.length === 1 ? "Specialist" : "Specialists"} Assigned
          </span>
        </div>

        {deliveryTeam.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-[var(--lit-cloud,#F7F9FC)]/50 p-6 text-center text-xs text-[var(--lit-text-muted,#52677C)] space-y-1.5">
            <Users className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="font-medium text-[var(--lit-navy,#0B2545)]">Logic Intelligence Engineering Squad</p>
            <p>Core engineering lead assignment in progress. Your consultation architect remains your interim point of contact.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deliveryTeam.map((member) => (
              <div
                key={member.userId}
                className="p-5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/30 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative w-12 h-15 rounded-lg overflow-hidden border border-[var(--lit-border-light,#DFE7EF)] bg-slate-100 shrink-0 aspect-[4/5] flex items-center justify-center">
                    {member.portraitUrl || member.avatarUrl ? (
                      <img
                        src={member.portraitUrl || member.avatarUrl || ""}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[var(--lit-navy,#0B2545)] bg-slate-200">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins truncate">
                        {member.name}
                      </h3>
                      {member.isPrimaryLead && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 shrink-0 font-mono">
                          Team Lead
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[var(--lit-teal,#1FA9A2)] mt-0.5">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1 line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>

                {member.skills && member.skills.length > 0 && (
                  <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-wrap gap-1.5">
                    {member.skills.slice(0, 4).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded text-[10px] bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 4 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-[var(--lit-text-muted,#52677C)] font-mono">
                        +{member.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Associated Invoices Section */}
      {projectInvoices.length > 0 && (
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <h2 className="text-base font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                Milestone Invoices & Billing
              </h2>
            </div>
            <Link
              href="/client/invoices"
              className="text-xs font-semibold text-[var(--lit-teal,#1FA9A2)] hover:underline inline-flex items-center gap-1"
            >
              <span>View All Invoices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
            {projectInvoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                    {inv.invoice_code || "INV-LIT"}
                  </span>
                  <span className="text-[var(--lit-text-muted,#52677C)] ml-3">
                    Due: {inv.due_date ? formatIST(inv.due_date, "date") : "Due on receipt"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-[var(--lit-navy,#0B2545)] font-mono">
                    {formatINR(inv.amount)}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                      inv.status === "Paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {inv.status || "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engineering Delivery Assurance Card */}
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/40 via-white to-blue-50/30 p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              Enterprise Handover & Intellectual Property Transfer
            </h3>
          </div>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-2xl">
            Upon completion of Milestone M4, all repository commits, Docker containers, schema definitions, and automated test suites are fully assigned to your organization under standard master service agreements.
          </p>
        </div>
        <Link
          href="/client/documents"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--lit-navy,#0B2545)] bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:bg-[var(--lit-cloud,#F7F9FC)] shadow-2xs transition-colors shrink-0"
        >
          <span>Document Vault</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
