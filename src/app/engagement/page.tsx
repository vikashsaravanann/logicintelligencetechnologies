import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ListChecks,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  Send,
  FileText,
  ArrowRight,
  ArrowLeft,
  Building2,
  CreditCard,
  Lock,
  Layers,
  Sparkles,
  Download,
  KeyRound,
  CheckSquare,
} from 'lucide-react';
import { listAllEngagements, getEngagementStages } from '@/lib/engagements/db';
import { CANONICAL_13_STAGES, ORDERED_STAGE_KEYS, StageKey, StageStatus } from '@/lib/engagements/types';

export const metadata: Metadata = {
  title: 'Client Lifecycle & Engagement Registry | Logic Intelligence Technologies',
  description:
    'Universal 13-stage client lifecycle portal, technical requirements intake, proposal governance, and verified manual bank payment reconciliation.',
  robots: {
    index: true,
    follow: true,
  },
};

export const dynamic = 'force-dynamic';

const STAGE_STATUS_STYLES: Record<
  string,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  completed: {
    label: 'Completed',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: CheckCircle2,
  },
  accepted: {
    label: 'Accepted',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: CheckCircle2,
  },
  signed: {
    label: 'Signed & Executed',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: ShieldCheck,
  },
  paid: {
    label: 'Bank Cleared & Paid',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: CheckCircle2,
  },
  verified: {
    label: 'Verified',
    badge: 'border-teal-200 bg-teal-50 text-teal-800',
    icon: ShieldCheck,
  },
  approved: {
    label: 'Approved',
    badge: 'border-teal-200 bg-teal-50 text-teal-800',
    icon: ShieldCheck,
  },
  in_progress: {
    label: 'In Progress',
    badge: 'border-blue-200 bg-blue-50 text-blue-800',
    icon: Clock,
  },
  available: {
    label: 'Available Now',
    badge: 'border-[#B9DCFF] bg-[#E7F3FF] text-[#1565C0]',
    icon: Sparkles,
  },
  submitted: {
    label: 'Submitted for Review',
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    icon: Clock,
  },
  payment_requested: {
    label: 'Payment Pending',
    badge: 'border-purple-200 bg-purple-50 text-purple-800',
    icon: CreditCard,
  },
  verification_pending: {
    label: 'Bank Audit Pending',
    badge: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    icon: Clock,
  },
  locked: {
    label: 'Locked (Gated)',
    badge: 'border-slate-200 bg-slate-100 text-slate-600',
    icon: Lock,
  },
};

const MASTER_PDF_REGISTRY = [
  {
    id: 'LIT-00',
    title: '50-Point Enterprise Deployment Checklist',
    stage: 'Stage 01 (Dedicated)',
    file: '/assets/docs/LIT_50_Point_Enterprise_Deployment_Checklist.pdf',
    size: '684 KB',
    hash: '9a8d29b0f4c3...enterprise',
  },
  {
    id: 'LIT-01',
    title: 'Statement of Work & Master Service Agreement',
    stage: 'Stage 04 (Merged with Proposal)',
    file: '/assets/docs/masters/LIT-01-SOW-Service-Agreement.pdf',
    size: '606 KB',
    hash: 'a1b2c3d4e5f6...sow',
  },
  {
    id: 'LIT-02',
    title: 'Proposal & Commercial Quotation',
    stage: 'Stage 03 (Merged Quotation)',
    file: '/assets/docs/masters/LIT-02-Proposal-Commercial-Quotation.pdf',
    size: '614 KB',
    hash: 'c4d5e6f7a8b9...prop',
  },
  {
    id: 'LIT-03',
    title: 'Client Technical Onboarding Guide',
    stage: 'Stage 07 (Dedicated Credentials)',
    file: '/assets/docs/masters/LIT-03-Client-Onboarding-Guide.pdf',
    size: '584 KB',
    hash: 'b2c3d4e5f6a7...onb',
  },
  {
    id: 'LIT-04',
    title: 'Technical & Architecture Specification',
    stage: 'Stage 05 (Architecture)',
    file: '/assets/docs/masters/LIT-04-Technical-Specification.pdf',
    size: '602 KB',
    hash: 'c3d4e5f6a7b8...tech',
  },
  {
    id: 'LIT-05',
    title: 'Project Milestone Acceptance Certificate',
    stage: 'Stage 10 (Sign-off)',
    file: '/assets/docs/masters/LIT-05-Milestone-Acceptance-Certificate.pdf',
    size: '575 KB',
    hash: 'e5f6a7b8c9d0...acc',
  },
  {
    id: 'LIT-06',
    title: 'Tax Invoice & Official Payment Receipt',
    stage: 'Stage 06 & 11 (Dedicated Invoicing)',
    file: '/assets/docs/masters/LIT-06-Payment-Invoice-Receipt.pdf',
    size: '612 KB',
    hash: 'f6a7b8c9d0e1...inv',
  },
  {
    id: 'LIT-07',
    title: 'Maintenance & Service Level Agreement',
    stage: 'Stage 13 (SLA Support)',
    file: '/assets/docs/masters/LIT-07-Maintenance-Support-Agreement.pdf',
    size: '589 KB',
    hash: 'd4e5f6a7b8c9...sup',
  },
];

type PageProps = {
  searchParams?: Promise<{ status?: string; q?: string }>;
};

export default async function EngagementHubPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const statusFilter = resolvedParams.status?.trim() || '';
  const query = resolvedParams.q?.trim().toLowerCase() || '';

  const rawEngagements = await listAllEngagements();

  // Populate stage telemetry for each engagement
  const engagementsWithStages = await Promise.all(
    rawEngagements.map(async (eng) => {
      const stages = await getEngagementStages(eng.id);
      const completedCount = stages.filter((s) =>
        ['completed', 'signed', 'verified', 'paid', 'accepted'].includes(s.status)
      ).length;
      return {
        ...eng,
        stages,
        completedCount,
        progressPercent: Math.round((completedCount / 13) * 100),
      };
    })
  );

  // Filter logic
  const filtered = engagementsWithStages.filter((eng) => {
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'active' && eng.status !== 'active') return false;
      if (statusFilter === 'completed' && eng.completedCount < 13) return false;
      if (statusFilter === 'in_progress' && (eng.completedCount === 0 || eng.completedCount === 13)) return false;
    }
    if (query) {
      const matchRef = eng.engagement_ref?.toLowerCase().includes(query);
      const matchCompany = eng.company_name?.toLowerCase().includes(query);
      const matchContact = eng.contact_name?.toLowerCase().includes(query);
      const matchTitle = eng.project_title?.toLowerCase().includes(query);
      if (!matchRef && !matchCompany && !matchContact && !matchTitle) return false;
    }
    return true;
  });

  // KPI Calculations
  const totalEngagements = rawEngagements.length;
  const inFlightCount = engagementsWithStages.filter((e) => e.status === 'active').length;
  const totalCompletedStages = engagementsWithStages.reduce((acc, curr) => acc + curr.completedCount, 0);

  const STATUS_TABS = [
    { id: '', label: 'All Portfolios', count: totalEngagements },
    { id: 'active', label: 'Active Journey', count: inFlightCount },
    { id: 'in_progress', label: 'In-Flight Sprints', count: engagementsWithStages.filter((e) => e.completedCount > 0 && e.completedCount < 13).length },
    { id: 'completed', label: 'Delivered', count: engagementsWithStages.filter((e) => e.completedCount === 13).length },
  ];

  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] font-sans text-[var(--lit-ink,#121826)] py-10 px-4 sm:px-6 lg:px-8 selection:bg-[var(--lit-blue,#1565C0)]/15 selection:text-[var(--lit-navy,#0B2545)]">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to LIT Home</span>
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#B9DCFF] bg-[#E7F3FF] text-[var(--lit-blue,#1565C0)] text-[10px] font-bold uppercase tracking-wider font-mono">
                <ListChecks className="w-3 h-3" />
                Universal 13-Stage Governance
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-[var(--lit-text-muted,#52677C)] text-[10px] font-mono font-medium">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                MSME: UDYAM-TN-03-0345274
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Zero Payment Gateways · Bank UPI Audit
              </span>
            </div>
            <h1 className="mt-2 font-poppins text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lit-navy,#0B2545)]">
              Enterprise Client Lifecycle & Engagement Portal
            </h1>
            <p className="mt-1 text-xs text-[var(--lit-text-muted,#52677C)] max-w-3xl leading-relaxed">
              Confidential client journey governance, 13-stage milestone progression, technical discovery reviews, proposal preparation, and verified manual bank payment reconciliation.
            </p>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/checklist"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs transition-colors shadow-2xs"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#1565C0]" />
              <span>Checklist Intake (Stage 1)</span>
            </Link>
            <Link
              href="/engagement/ENG-2026-LIT-SAMPLE"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              <span>Visit All Stages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active Portfolios', value: totalEngagements, color: 'text-[var(--lit-navy,#0B2545)]' },
            { label: 'Total Stages Governed', value: '13 Stages', color: 'text-[var(--lit-blue,#1565C0)]' },
            { label: 'Verified Milestones', value: totalCompletedStages, color: 'text-emerald-700' },
            { label: 'Payment Governance', value: 'Manual UPI', color: 'text-purple-700' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs"
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] block mb-1">
                {kpi.label}
              </span>
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${kpi.color}`}>
                {kpi.value}
              </span>
            </div>
          ))}
        </div>

        {/* Architectural Clarity: Merged Proposal vs Dedicated Invoicing/Checklist */}
        <div className="rounded-2xl border border-[#DFE7EF] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-teal-200 bg-teal-50 text-teal-800 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                <Layers className="w-3 h-3 text-teal-600" />
                System Integration Architecture
              </div>
              <h2 className="text-lg font-bold text-[#0B2545] tracking-tight">
                Merged Commercial Proposal · Dedicated Invoicing & Intake Safeguards
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
              LIT-STAGE-ARCH-v2.4
            </span>
          </div>

          <p className="text-xs text-[#52677C] leading-relaxed">
            In compliance with our enterprise governance framework, all architectural deliverables, technical scope, commercial quotations, and legal service agreements are seamlessly merged into a unified proposal review flow. Crucially, the <strong>50-Point Checklist (Stage 1)</strong>, <strong>Initial 50% Milestone Invoice (Stage 6)</strong>, <strong>Client Infrastructure Onboarding (Stage 7)</strong>, and <strong>Final 50% Settlement (Stage 11)</strong> remain strictly separate, standalone high-security operational stages.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-blue-100 bg-[#F7F9FC]">
              <span className="text-[11px] font-bold text-[#1565C0] block mb-0.5">
                1. Dedicated Requirements Intake
              </span>
              <p className="text-[11px] text-[#52677C] leading-normal">
                Stage 1 50-Point Checklist operates independently to capture full technical specifications prior to commercial pricing.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-teal-100 bg-[#F7F9FC]">
              <span className="text-[11px] font-bold text-teal-700 block mb-0.5">
                2. Unified Proposal & Agreement
              </span>
              <p className="text-[11px] text-[#52677C] leading-normal">
                Stage 3 & 4 merge technical scope, timeline, deliverables, quotation breakdown, and Master Service Agreement into one review.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-purple-100 bg-[#F7F9FC]">
              <span className="text-[11px] font-bold text-purple-700 block mb-0.5">
                3. Dedicated Milestone Invoicing
              </span>
              <p className="text-[11px] text-[#52677C] leading-normal">
                Stages 6 & 11 use dynamic UPI QR billing forms with manual Super Admin bank credit verification before unlocking next stages.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] w-fit">
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.id ? `/engagement?status=${tab.id}` : '/engagement'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white text-[var(--lit-navy,#0B2545)] shadow-xs'
                      : 'text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="ml-1.5 font-mono text-[10px] opacity-70">({tab.count})</span>
                </Link>
              );
            })}
          </div>

          <form method="GET" className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lit-text-muted,#52677C)]" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search reference, company, or project…"
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:border-[var(--lit-blue,#1565C0)]"
            />
          </form>
        </div>

        {/* Active Engagements Registry Table */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/50 flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1565C0]" />
              Authorized Client Engagement Portfolios
            </span>
            <span className="text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
              Showing {filtered.length} of {totalEngagements}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                  <th className="py-3 px-4">Organization / Contact</th>
                  <th className="py-3 px-4">Engagement Reference</th>
                  <th className="py-3 px-4">Current Active Stage</th>
                  <th className="py-3 px-4">Milestone Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[var(--lit-text-muted,#52677C)]">
                      No client engagements found matching your query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((eng) => {
                    const currentStageKey = (eng.current_stage || 'checklist') as StageKey;
                    const stageDef = CANONICAL_13_STAGES[currentStageKey] || CANONICAL_13_STAGES.checklist;
                    const currentStageRecord = eng.stages.find((s) => s.stage_key === currentStageKey);
                    const statusKey = currentStageRecord?.status || 'available';
                    const cfg = STAGE_STATUS_STYLES[statusKey] || STAGE_STATUS_STYLES.available;
                    const StatusIcon = cfg.icon;

                    return (
                      <tr key={eng.id} className="hover:bg-[var(--lit-cloud,#F7F9FC)]/40 transition-colors">
                        {/* Company & Contact */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-[var(--lit-navy,#0B2545)] block text-sm">
                            {eng.company_name}
                          </span>
                          <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] block">
                            {eng.project_title}
                          </span>
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-[var(--lit-blue,#1565C0)]">
                            <span>{eng.contact_name}</span>
                            <span>·</span>
                            <span>{eng.contact_email}</span>
                          </div>
                        </td>

                        {/* Engagement Ref & Meta */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#E7F3FF] text-[#1565C0] border border-[#B9DCFF]">
                            {eng.engagement_ref}
                          </span>
                          {Boolean(eng.metadata?.industry) && (
                            <span className="block text-[10px] text-[var(--lit-text-muted,#52677C)] mt-1">
                              {String(eng.metadata?.industry)}
                            </span>
                          )}
                        </td>

                        {/* Active Stage */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#0B2545] text-white flex items-center justify-center font-mono font-bold text-[10px]">
                              {String(stageDef.ordinal).padStart(2, '0')}
                            </span>
                            <div>
                              <span className="font-bold text-[var(--lit-navy,#0B2545)] block">
                                {stageDef.shortTitle}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider border mt-0.5 ${cfg.badge}`}
                              >
                                <StatusIcon className="w-2.5 h-2.5" />
                                <span>{cfg.label}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Progress */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 w-36">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="font-bold text-[var(--lit-navy,#0B2545)]">
                                {eng.completedCount} / 13 Stages
                              </span>
                              <span className="text-[var(--lit-text-muted,#52677C)]">
                                {eng.progressPercent}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-linear-to-r from-[#1565C0] to-[#1FA9A2] h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(eng.progressPercent, 6)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/engagement/${eng.engagement_ref}/${stageDef.key}`}
                              className="px-2.5 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-[11px] transition-colors shadow-2xs"
                            >
                              Current Stage
                            </Link>
                            <Link
                              href={`/engagement/${eng.engagement_ref}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] text-white font-semibold text-xs transition-colors shadow-2xs"
                            >
                              <span>Visit All</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 13 Canonical Stages Phase View */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--lit-border-light,#DFE7EF)]">
            <div>
              <h2 className="text-xl font-bold font-poppins text-[#0B2545] tracking-tight">
                Canonical 13-Stage Client Lifecycle Governance
              </h2>
              <p className="text-xs text-[#52677C]">
                Sequential milestone gating, client deliverables, and Super Admin authorization rules.
              </p>
            </div>
            <Link
              href="/engagement/ENG-2026-LIT-SAMPLE"
              className="text-xs font-semibold text-[#1565C0] hover:underline flex items-center gap-1"
            >
              <span>Explore Interactive Stage Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Phase 1: Intake & Commercials */}
            <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E7F3FF] text-[#1565C0] border border-[#B9DCFF]">
                    Phase 01
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Stages 01 – 05</span>
                </div>
                <h3 className="text-sm font-bold text-[#0B2545] mb-1">
                  Intake, Discovery & Commercials
                </h3>
                <p className="text-xs text-[#52677C] mb-4 leading-normal">
                  Requirements gathering, architecture review, merged formal proposal, and technical specification.
                </p>

                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-blue-50 text-[#1565C0] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      01
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">50-Point Checklist</strong>
                      <span className="text-[10px] text-teal-700 font-mono font-semibold">[DEDICATED STAGE]</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-blue-50 text-[#1565C0] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      02
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">Discovery & Requirements</strong>
                      <span className="text-[10px] text-slate-500">Architecture scoping minutes</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-blue-50 text-[#1565C0] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      03
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">Proposal & Quotation</strong>
                      <span className="text-[10px] text-purple-700 font-mono font-semibold">[MERGED QUOTATION]</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-blue-50 text-[#1565C0] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      04
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">Statement of Work (SOW)</strong>
                      <span className="text-[10px] text-purple-700 font-mono font-semibold">[MERGED AGREEMENT]</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-blue-50 text-[#1565C0] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      05
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">Technical Specification</strong>
                      <span className="text-[10px] text-slate-500">Architecture & schema sign-off</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href="/engagement/ENG-2026-LIT-SAMPLE/checklist"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-semibold text-[#0B2545] transition-colors"
                >
                  <span>Launch Phase 1</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Phase 2: Invoicing & Build */}
            <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
                    Phase 02
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Stages 06 – 09</span>
                </div>
                <h3 className="text-sm font-bold text-[#0B2545] mb-1">
                  Milestone Invoicing & Engineering
                </h3>
                <p className="text-xs text-[#52677C] mb-4 leading-normal">
                  Dedicated initial milestone invoice, secure infrastructure onboarding, and sprint builds.
                </p>

                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      06
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">Initial 50% Milestone Invoice</strong>
                      <span className="text-[10px] text-emerald-700 font-mono font-semibold">[DEDICATED INVOICE]</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      07
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">Client Infrastructure Onboarding</strong>
                      <span className="text-[10px] text-teal-700 font-mono font-semibold">[DEDICATED CREDENTIALS]</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      08
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">Engineering Sprints & Build</strong>
                      <span className="text-[10px] text-slate-500">Bi-weekly sprint demos</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      09
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">UAT & QA Verification</strong>
                      <span className="text-[10px] text-slate-500">Automated end-to-end tests</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href="/engagement/ENG-2026-LIT-SAMPLE/initial-invoice"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-semibold text-[#0B2545] transition-colors"
                >
                  <span>Launch Phase 2</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Phase 3: Acceptance & Handover */}
            <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Phase 03
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Stages 10 – 13</span>
                </div>
                <h3 className="text-sm font-bold text-[#0B2545] mb-1">
                  Delivery, Settlement & SLA Support
                </h3>
                <p className="text-xs text-[#52677C] mb-4 leading-normal">
                  Formal delivery acceptance, final settlement, complete IP transfer, and ongoing SLA warranty.
                </p>

                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      10
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">Delivery Acceptance</strong>
                      <span className="text-[10px] text-slate-500">Formal sign-off certificate</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      11
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">Final 50% Milestone Settlement</strong>
                      <span className="text-[10px] text-emerald-700 font-mono font-semibold">[DEDICATED SETTLEMENT]</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      12
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">Production Handover & IP</strong>
                      <span className="text-[10px] text-slate-500">Repository & license transfer</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      13
                    </span>
                    <div>
                      <strong className="text-[#0B2545] block">Post-Launch SLA Support</strong>
                      <span className="text-[10px] text-slate-500">24/7 maintenance agreement</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  href="/engagement/ENG-2026-LIT-SAMPLE/delivery-acceptance"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-semibold text-[#0B2545] transition-colors"
                >
                  <span>Launch Phase 3</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Master PDF Documents Registry */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold font-poppins text-[#0B2545] tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1565C0]" />
                Master Enterprise PDF Document Templates
              </h2>
              <p className="text-xs text-[#52677C]">
                Authoritative legal templates, technical guides, and official 50-point checklist PDF.
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              SHA-256 Tamper-Proof Audit
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MASTER_PDF_REGISTRY.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#1565C0]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-[#0B2545]">
                      {doc.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{doc.size}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0B2545] line-clamp-2 mb-1">
                    {doc.title}
                  </h4>
                  <span className="text-[10px] text-[#52677C] block mb-2 font-mono">
                    {doc.stage}
                  </span>
                </div>

                <a
                  href={doc.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full pt-2 border-t border-slate-200 text-[11px] font-semibold text-[#1565C0] hover:underline"
                >
                  <span>Download Master</span>
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Legal & Manual Banking Credentials */}
        <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#0B2545]">
              Corporate Credentials & Manual Bank Settlement Protocol
            </h3>
          </div>
          <p className="text-xs text-[#52677C] leading-relaxed">
            Logic Intelligence Technologies operates strictly under manual banking reconciliation without third-party payment aggregator lock-in. Client invoice payments are remitted directly via official UPI/IMPS and manually verified by the Super Admin against verified bank credit statements before issuing tax receipts and advancing stage progression.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 pt-2 border-t border-slate-100">
            <span>Enterprise: <strong>Logic Intelligence Technologies</strong></span>
            <span>·</span>
            <span>MSME: <strong>UDYAM-TN-03-0345274</strong></span>
            <span>·</span>
            <span>Beneficiary: <strong>S VIKASH</strong></span>
            <span>·</span>
            <span>UPI: <strong>9342877474@ptyes</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
