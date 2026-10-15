'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  Copy,
  Check,
  Mail,
  Phone,
  MessageCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import {
  ClientEngagement,
  EngagementStage,
  CANONICAL_13_STAGES,
  ORDERED_STAGE_KEYS,
  StageKey,
  StageStatus,
} from '@/lib/engagements/types';
import { generatePortalEmailCopyText, generatePortalWhatsAppText } from '@/lib/engagements/share';
import { IssueEngagementModal } from '@/app/admin/engagements/components/IssueEngagementModal';
import { SuperAdminInspectButton } from '@/components/shared/SuperAdminInspectButton';

export type EngagementWithStages = ClientEngagement & {
  stages: EngagementStage[];
  completedCount: number;
  progressPercent: number;
};

interface EngagementHubClientProps {
  initialEngagements: EngagementWithStages[];
  initialStatusFilter?: string;
  initialQuery?: string;
  isSuperAdmin?: boolean;
}

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
    stage: 'Stage 01 (Dedicated Intake)',
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

export default function EngagementHubClient({
  initialEngagements,
  initialStatusFilter = '',
  initialQuery = '',
  isSuperAdmin,
}: EngagementHubClientProps) {
  const [engagements, setEngagements] = useState<EngagementWithStages[]>(initialEngagements);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Per-row interactive states
  const [copiedLinkRef, setCopiedLinkRef] = useState<string | null>(null);
  const [copiedEmailRef, setCopiedEmailRef] = useState<string | null>(null);
  const [copiedWhatsAppRef, setCopiedWhatsAppRef] = useState<string | null>(null);
  const [sendingEmailRef, setSendingEmailRef] = useState<string | null>(null);
  const [sentRefs, setSentRefs] = useState<Set<string>>(new Set());
  const [emailNotice, setEmailNotice] = useState<{ ref: string; message: string; success: boolean } | null>(null);

  // When a new engagement is created via modal
  const handleEngagementCreated = (newEng: ClientEngagement) => {
    // Generate default stages representation
    const defaultStages: EngagementStage[] = ORDERED_STAGE_KEYS.map((key, idx) => ({
      id: `stage-${idx + 1}`,
      engagement_id: newEng.id,
      stage_key: key,
      ordinal: idx + 1,
      title: CANONICAL_13_STAGES[key].title,
      summary: CANONICAL_13_STAGES[key].description,
      status: idx === 0 ? ('available' as StageStatus) : ('locked' as StageStatus),
      assigned_owner: 'Logic Intelligence Technologies Staff',
      notes: null,
      prerequisite_stage_key: CANONICAL_13_STAGES[key].prerequisiteKey,
      prerequisite_description: CANONICAL_13_STAGES[key].prerequisiteDesc,
      document_master_ref: CANONICAL_13_STAGES[key].documentMasterRef,
      snapshot: {},
      unlocked_at: idx === 0 ? new Date().toISOString() : null,
      completed_at: null,
      approved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const newDecorated: EngagementWithStages = {
      ...newEng,
      stages: defaultStages,
      completedCount: 0,
      progressPercent: 0,
    };

    setEngagements((prev) => [newDecorated, ...prev.filter((e) => e.id !== newEng.id)]);
  };

  const handleCopyLink = (eng: EngagementWithStages) => {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://www.logicintelligencetechnologies.in';
    const portalUrl = `${origin}/engagement/${eng.engagement_ref}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedLinkRef(eng.engagement_ref);
    setTimeout(() => setCopiedLinkRef(null), 2500);
  };

  const handleCopyEmail = (eng: EngagementWithStages) => {
    const text = generatePortalEmailCopyText(eng);
    navigator.clipboard.writeText(text);
    setCopiedEmailRef(eng.engagement_ref);
    setTimeout(() => setCopiedEmailRef(null), 2500);
  };

  const handleCopyWhatsApp = (eng: EngagementWithStages) => {
    const text = generatePortalWhatsAppText(eng);
    navigator.clipboard.writeText(text);
    setCopiedWhatsAppRef(eng.engagement_ref);
    setTimeout(() => setCopiedWhatsAppRef(null), 2500);
  };

  const handleSendEmail = async (eng: EngagementWithStages) => {
    setSendingEmailRef(eng.engagement_ref);
    setEmailNotice(null);

    try {
      const res = await fetch(`/api/engagements/${eng.engagement_ref}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (data.ok) {
        setSentRefs((prev) => new Set(prev).add(eng.engagement_ref));
        setEmailNotice({
          ref: eng.engagement_ref,
          message: `Official client portal access email successfully dispatched to ${eng.contact_email}`,
          success: true,
        });
      } else {
        setEmailNotice({
          ref: eng.engagement_ref,
          message: `Email dispatch failed: ${data.message || 'Server error'}`,
          success: false,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sending email';
      setEmailNotice({
        ref: eng.engagement_ref,
        message: msg,
        success: false,
      });
    } finally {
      setSendingEmailRef(null);
    }
  };

  // Filter logic
  const filtered = useMemo(() => {
    return engagements.filter((eng) => {
      if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'active' && eng.status !== 'active') return false;
        if (statusFilter === 'completed' && eng.completedCount < 13) return false;
        if (
          statusFilter === 'in_progress' &&
          (eng.completedCount === 0 || eng.completedCount === 13)
        )
          return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchRef = eng.engagement_ref?.toLowerCase().includes(q);
        const matchCompany = eng.company_name?.toLowerCase().includes(q);
        const matchContact = eng.contact_name?.toLowerCase().includes(q);
        const matchEmail = eng.contact_email?.toLowerCase().includes(q);
        const matchTitle = eng.project_title?.toLowerCase().includes(q);
        if (!matchRef && !matchCompany && !matchContact && !matchEmail && !matchTitle) return false;
      }
      return true;
    });
  }, [engagements, statusFilter, searchQuery]);

  // KPI calculations
  const totalEngagements = engagements.length;
  const inFlightCount = engagements.filter((e) => e.status === 'active').length;
  const totalCompletedStages = engagements.reduce((acc, curr) => acc + curr.completedCount, 0);

  const STATUS_TABS = [
    { id: '', label: 'All Portfolios', count: totalEngagements },
    { id: 'active', label: 'Active Journey', count: inFlightCount },
    {
      id: 'in_progress',
      label: 'In-Flight Sprints',
      count: engagements.filter((e) => e.completedCount > 0 && e.completedCount < 13).length,
    },
    {
      id: 'completed',
      label: 'Delivered',
      count: engagements.filter((e) => e.completedCount === 13).length,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--lit-text-muted,#52677C)]">
            <Link
              href="/admin/command-center"
              className="inline-flex items-center gap-1 hover:text-[var(--lit-navy,#0B2545)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Command Center</span>
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/"
              className="hover:text-[var(--lit-navy,#0B2545)] transition-colors"
            >
              LIT Home
            </Link>
          </div>
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

        {/* Primary Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <SuperAdminInspectButton
            href="/admin/engagements"
            title="Inspect Client Engagements Administration"
            initialIsSuperAdmin={isSuperAdmin}
          />
          <IssueEngagementModal
            buttonLabel="Create Client Portal"
            buttonClassName="inline-flex items-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#123663] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm cursor-pointer"
            onCreated={handleEngagementCreated}
          />
          <Link
            href="/admin/engagements/new"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs transition-colors shadow-2xs"
            title="Open full-page engagement creation form"
          >
            <Plus className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>Full Form</span>
          </Link>
          <Link
            href="/checklist"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-xs transition-colors shadow-2xs"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#1565C0]" />
            <span>Checklist Intake</span>
          </Link>
          <Link
            href="/engagement/ENG-2026-LIT-SAMPLE"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] text-white font-semibold text-xs transition-colors shadow-2xs"
          >
            <span>Visit All Stages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Portfolios',
            value: totalEngagements,
            color: 'text-[var(--lit-navy,#0B2545)]',
          },
          {
            label: 'Total Stages Governed',
            value: '13 Stages',
            color: 'text-[var(--lit-blue,#1565C0)]',
          },
          {
            label: 'Verified Milestones',
            value: totalCompletedStages,
            color: 'text-emerald-700',
          },
          {
            label: 'Payment Governance',
            value: 'Manual UPI',
            color: 'text-purple-700',
          },
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
              Merged Commercial Proposal · Dedicated Invoicing &amp; Intake Safeguards
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)]">
            LIT-STAGE-ARCH-v2.4
          </span>
        </div>

        <p className="text-xs text-[#52677C] leading-relaxed">
          In compliance with our enterprise governance framework, all architectural deliverables,
          technical scope, commercial quotations, and legal service agreements are seamlessly merged
          into a unified proposal review flow. Crucially, the{' '}
          <strong>50-Point Checklist (Stage 1)</strong>,{' '}
          <strong>Initial 50% Milestone Invoice (Stage 6)</strong>,{' '}
          <strong>Client Infrastructure Onboarding (Stage 7)</strong>, and{' '}
          <strong>Final 50% Settlement (Stage 11)</strong> remain strictly separate, standalone
          high-security operational stages.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-blue-100 bg-[#F7F9FC]">
            <span className="text-[11px] font-bold text-[#1565C0] block mb-0.5">
              1. Dedicated Requirements Intake
            </span>
            <p className="text-[11px] text-[#52677C] leading-normal">
              Stage 1 50-Point Checklist operates independently to capture full technical
              specifications prior to commercial pricing.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-teal-100 bg-[#F7F9FC]">
            <span className="text-[11px] font-bold text-teal-700 block mb-0.5">
              2. Unified Proposal &amp; Agreement
            </span>
            <p className="text-[11px] text-[#52677C] leading-normal">
              Stage 3 &amp; 4 merge technical scope, timeline, deliverables, quotation breakdown,
              and Master Service Agreement into one review.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-purple-100 bg-[#F7F9FC]">
            <span className="text-[11px] font-bold text-purple-700 block mb-0.5">
              3. Dedicated Milestone Invoicing
            </span>
            <p className="text-[11px] text-[#52677C] leading-normal">
              Stages 6 &amp; 11 use dynamic UPI QR billing forms with manual Super Admin bank credit
              verification before unlocking next stages.
            </p>
          </div>
        </div>
      </div>

      {/* Global Email Notification Banner */}
      {emailNotice && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-xs transition-all ${
            emailNotice.success
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {emailNotice.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <span className="font-bold block">
                {emailNotice.ref}: Access Email Telemetry
              </span>
              <p className="text-[11px] opacity-90">{emailNotice.message}</p>
            </div>
          </div>
          <button
            onClick={() => setEmailNotice(null)}
            className="text-xs font-bold px-3 py-1 rounded-lg border border-current hover:bg-black/5 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] w-fit">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-[var(--lit-navy,#0B2545)] shadow-xs'
                    : 'text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 font-mono text-[10px] opacity-70">({tab.count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lit-text-muted,#52677C)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference, company, or email…"
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white focus:outline-none focus:border-[var(--lit-blue,#1565C0)]"
          />
        </div>
      </div>

      {/* Authorized Client Engagement Portfolios Registry Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1565C0]" />
            <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)]">
              Authorized Client Engagement Portfolios
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--lit-text-muted,#52677C)]">
            <span>
              Showing {filtered.length} of {totalEngagements} Portfolios
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                <th className="py-3 px-4">Organization / Contact</th>
                <th className="py-3 px-4">Engagement Reference</th>
                <th className="py-3 px-4">Current Active Stage</th>
                <th className="py-3 px-4">Milestone Progress</th>
                <th className="py-3 px-4 text-right">Client Sharing &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lit-border-light,#DFE7EF)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[var(--lit-text-muted,#52677C)]">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No client engagements found matching your query.
                  </td>
                </tr>
              ) : (
                filtered.map((eng) => {
                  const currentStageKey = (eng.current_stage || 'checklist') as StageKey;
                  const stageDef =
                    CANONICAL_13_STAGES[currentStageKey] || CANONICAL_13_STAGES.checklist;
                  const currentStageRecord = eng.stages.find((s) => s.stage_key === currentStageKey);
                  const statusKey = currentStageRecord?.status || 'available';
                  const cfg = STAGE_STATUS_STYLES[statusKey] || STAGE_STATUS_STYLES.available;
                  const StatusIcon = cfg.icon;

                  const isCopiedLink = copiedLinkRef === eng.engagement_ref;
                  const isCopiedEmail = copiedEmailRef === eng.engagement_ref;
                  const isCopiedWhatsApp = copiedWhatsAppRef === eng.engagement_ref;
                  const isSendingEmail = sendingEmailRef === eng.engagement_ref;

                  return (
                    <tr
                      key={eng.id}
                      className="hover:bg-[var(--lit-cloud,#F7F9FC)]/40 transition-colors"
                    >
                      {/* Company & Contact */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[var(--lit-navy,#0B2545)] block text-sm">
                          {eng.company_name}
                        </span>
                        <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] block">
                          {eng.project_title}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-[var(--lit-blue,#1565C0)]">
                          <span>{eng.contact_name}</span>
                          <span>·</span>
                          <span>{eng.contact_email}</span>
                          {eng.contact_phone && (
                            <>
                              <span>·</span>
                              <span className="text-slate-500">{eng.contact_phone}</span>
                            </>
                          )}
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
                        <span className="block text-[10px] font-mono text-slate-400 mt-0.5">
                          Created: {new Date(eng.created_at).toLocaleDateString()}
                        </span>
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

                      {/* Actions: Sharing & Navigation */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col sm:items-end gap-2">
                          {/* Top Row: Primary Actions (Inspect, Dispatch, Portal) */}
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {/* Super Admin Inspect Button */}
                            <SuperAdminInspectButton
                              href={`/admin/engagements/${eng.id}`}
                              title={`Inspect engagement lifecycle for ${eng.company_name}`}
                              initialIsSuperAdmin={isSuperAdmin}
                            />

                            {/* Dispatch Button - EXACT Proposal Creation styling */}
                            <button
                              type="button"
                              onClick={() => handleSendEmail(eng)}
                              disabled={isSendingEmail || sentRefs.has(eng.engagement_ref)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs ${
                                sentRefs.has(eng.engagement_ref)
                                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                                  : 'border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] disabled:opacity-50 cursor-pointer'
                              }`}
                              title={`Dispatch client portal invitation to ${eng.contact_email}`}
                              aria-label={`Dispatch client portal email to ${eng.contact_email}`}
                            >
                              {isSendingEmail ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : sentRefs.has(eng.engagement_ref) ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Send className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
                              )}
                              <span>
                                {isSendingEmail ? 'Sending…' : sentRefs.has(eng.engagement_ref) ? 'Dispatched' : 'Dispatch'}
                              </span>
                            </button>

                            {/* Portal Public View Link */}
                            <Link
                              href={`/engagement/${eng.engagement_ref}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-navy,#0B2545)] transition-colors ml-1"
                              title="Open Public Client View"
                            >
                              <span>Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>

                          {/* Middle Row: Copy Utilities */}
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {/* Copy Link */}
                            <button
                              type="button"
                              onClick={() => handleCopyLink(eng)}
                              className="inline-flex items-center gap-1 px-2 py-1 border border-[#DFE7EF] text-[10px] font-semibold text-[#0B2545] hover:border-[#1565C0] hover:text-[#1565C0] rounded-md transition-colors bg-white shadow-2xs cursor-pointer"
                              title="Copy client portal URL to clipboard"
                              aria-label={`Copy client portal link for ${eng.company_name}`}
                            >
                              {isCopiedLink ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-500" />
                              )}
                              <span>{isCopiedLink ? 'Copied' : 'Link'}</span>
                            </button>

                            {/* Copy Email */}
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(eng)}
                              className="inline-flex items-center gap-1 px-2 py-1 border border-[#DFE7EF] text-[10px] font-semibold text-[#0B2545] hover:border-[#1565C0] hover:text-[#1565C0] rounded-md transition-colors bg-white shadow-2xs cursor-pointer"
                              title="Copy complete formatted client invitation email"
                              aria-label={`Copy invitation email draft for ${eng.company_name}`}
                            >
                              {isCopiedEmail ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Mail className="w-3 h-3 text-slate-500" />
                              )}
                              <span>{isCopiedEmail ? 'Copied' : 'Email'}</span>
                            </button>

                            {/* Copy WhatsApp */}
                            <button
                              type="button"
                              onClick={() => handleCopyWhatsApp(eng)}
                              className="inline-flex items-center gap-1 px-2 py-1 border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-[10px] font-semibold text-emerald-800 rounded-md transition-colors shadow-2xs cursor-pointer"
                              title="Copy WhatsApp invitation text"
                              aria-label={`Copy WhatsApp invitation text for ${eng.company_name}`}
                            >
                              {isCopiedWhatsApp ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>{isCopiedWhatsApp ? 'Copied' : 'WhatsApp'}</span>
                            </button>
                          </div>

                          {/* Bottom Row: Stage Navigation */}
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <Link
                              href={`/engagement/${eng.engagement_ref}/${stageDef.key}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] font-semibold text-[10px] transition-colors shadow-2xs"
                              aria-label={`Go to current stage for ${eng.company_name}`}
                            >
                              Current Stage
                            </Link>
                            <Link
                              href={`/engagement/${eng.engagement_ref}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] text-white font-semibold text-[10px] transition-colors shadow-2xs"
                              aria-label={`Visit full 13-stage portal for ${eng.company_name}`}
                            >
                              <span>Visit All</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
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
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  Phase 1 · Intake
                </span>
                <span className="text-[10px] font-mono text-slate-500">Stages 01–05</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2545] mb-1">Intake, Architecture &amp; Commercials</h3>
              <p className="text-xs text-[#52677C] mb-4 leading-normal">
                Requirements gathering, preliminary discovery, quotation approval, and Master Service Agreement execution.
              </p>

              <ul className="space-y-2.5 text-xs">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    01
                  </span>
                  <div>
                    <strong className="text-[#0B2545] block">50-Point Enterprise Checklist</strong>
                    <span className="text-[10px] text-blue-700 font-mono font-semibold">[DEDICATED INTAKE]</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    02
                  </span>
                  <div>
                    <strong className="text-[#0B2545] block">Technical Discovery Review</strong>
                    <span className="text-[10px] text-slate-500">Architecture analysis &amp; scope</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    03
                  </span>
                  <div>
                    <strong className="text-[#0B2545] block">Proposal &amp; Commercial Quotation</strong>
                    <span className="text-[10px] text-teal-700 font-mono font-semibold">[MERGED WITH PROPOSAL]</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    04
                  </span>
                  <div>
                    <strong className="text-[#0B2545] block">SOW &amp; Master Service Agreement</strong>
                    <span className="text-[10px] text-teal-700 font-mono font-semibold">[MERGED SOW REVIEW]</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    05
                  </span>
                  <div>
                    <strong className="text-[#0B2545] block">Technical Architecture Sign-off</strong>
                    <span className="text-[10px] text-slate-500">Security &amp; cloud blueprint</span>
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

          {/* Phase 2: Execution & Infrastructure */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                  Phase 2 · Execution
                </span>
                <span className="text-[10px] font-mono text-slate-500">Stages 06–09</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2545] mb-1">
                Invoicing, Onboarding &amp; Execution
              </h3>
              <p className="text-xs text-[#52677C] mb-4 leading-normal">
                Initial 50% milestone invoicing via bank UPI, credentials handover, and iterative development sprints.
              </p>

              <ul className="space-y-2.5 text-xs">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    06
                  </span>
                  <div>
                    <strong className="text-[#0B2545] block">Initial 50% Milestone Invoicing</strong>
                    <span className="text-[10px] text-purple-700 font-mono font-semibold">[DEDICATED INVOICE &amp; UPI]</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    07
                  </span>
                  <div>
                    <strong className="text-[#0B2545] block">Client Infrastructure Onboarding</strong>
                    <span className="text-[10px] text-purple-700 font-mono font-semibold">[DEDICATED CREDENTIALS]</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    08
                  </span>
                  <div>
                    <strong className="text-[#0B2545] block">Sprint Execution &amp; Updates</strong>
                    <span className="text-[10px] text-slate-500">Live staging telemetry</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-purple-50 text-purple-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    09
                  </span>
                  <div>
                    <strong className="text-[#0B2545] block">User Acceptance Testing (UAT)</strong>
                    <span className="text-[10px] text-slate-500">Client verification sandbox</span>
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

          {/* Phase 3: Delivery, Settlement & SLA Support */}
          <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Phase 3 · Handover
                </span>
                <span className="text-[10px] font-mono text-slate-500">Stages 10–13</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2545] mb-1">
                Delivery, Settlement &amp; SLA Support
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
                    <strong className="text-[#0B2545] block">Production Handover &amp; IP</strong>
                    <span className="text-[10px] text-slate-500">Repository &amp; license transfer</span>
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
            Corporate Credentials &amp; Manual Bank Settlement Protocol
          </h3>
        </div>
        <p className="text-xs text-[#52677C] leading-relaxed">
          Logic Intelligence Technologies operates strictly under manual banking reconciliation without third-party payment aggregator lock-in. Client invoice payments are remitted directly via official UPI/IMPS and manually verified by the Super Admin against verified bank credit statements before issuing tax receipts and advancing stage progression.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 pt-2 border-t border-slate-100">
          <span>
            Enterprise: <strong>Logic Intelligence Technologies</strong>
          </span>
          <span>·</span>
          <span>
            MSME: <strong>UDYAM-TN-03-0345274</strong>
          </span>
          <span>·</span>
          <span>
            Beneficiary: <strong>S VIKASH</strong>
          </span>
          <span>·</span>
          <span>
            UPI: <strong>9342877474@ptyes</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
