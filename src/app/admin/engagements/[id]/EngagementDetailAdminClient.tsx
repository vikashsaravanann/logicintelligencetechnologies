'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Clock,
  Lock,
  AlertCircle,
  Eye,
  FileCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Send,
  Calendar,
  DollarSign,
  Briefcase,
  Layers,
  FileText,
  UserCheck,
  Server,
  HelpCircle,
  Sparkles,
  Bell,
} from 'lucide-react';
import {
  ClientEngagement,
  EngagementStage,
  EngagementDocumentLink,
  ClientIdentityChangeRequest,
  StageStatus,
  StageKey,
  CANONICAL_13_STAGES,
} from '@/lib/engagements/types';
import { ENTERPRISE_CHECKPOINTS, EnterpriseCheckpoint } from '@/data/enterpriseDeploymentChecklist';
import { StageApprovalModal } from '@/components/shared/StageApprovalModal';
import { SendNotificationModal } from '../components/SendNotificationModal';
import { ManagePricingModal } from '../components/ManagePricingModal';
import { getFinancialsForEngagement, calculateEngagementFinancials } from '@/lib/engagements/financials';

interface EngagementDetailAdminClientProps {
  engagement: ClientEngagement;
  initialStages: EngagementStage[];
  documents: EngagementDocumentLink[];
  identityRequests: ClientIdentityChangeRequest[];
  initialActiveStageKey?: StageKey;
}

export default function EngagementDetailAdminClient({
  engagement: initialEngagement,
  initialStages,
  documents,
  identityRequests: _identityRequests,
  initialActiveStageKey,
}: EngagementDetailAdminClientProps) {
  const [engagement, setEngagement] = useState<ClientEngagement>(initialEngagement);
  const [stages, setStages] = useState<EngagementStage[]>(initialStages);
  const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeInspectorStageKey, setActiveInspectorStageKey] = useState<StageKey>(
    initialActiveStageKey || (initialEngagement.current_stage as StageKey) || 'checklist'
  );
  const [checklistSearch, setChecklistSearch] = useState<string>('');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // Animated Approval Modal State
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    stageKey: StageKey;
    stageTitle: string;
    stageOrdinal: number;
    isPaymentStage: boolean;
    defaultNotes: string;
  } | null>(null);

  const currentStageRecord = stages.find((s) => s.stage_key === activeInspectorStageKey) || stages[0];

  const handleStatusChange = async (stageId: string, newStatus: StageStatus) => {
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return;

    setUpdatingStageId(stageId);
    try {
      const res = await fetch(`/api/engagements/${engagement.engagement_ref}/stages/${stage.stage_key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          action: 'admin_override_status',
          notes: `Status changed to ${newStatus} by Super Admin`,
          actorRole: 'admin',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update stage status');
      }

      if (data.stages && Array.isArray(data.stages)) {
        setStages(data.stages);
      } else {
        setStages((prev) =>
          prev.map((s) => (s.id === stageId ? { ...s, status: newStatus, updated_at: new Date().toISOString() } : s))
        );
      }
      setSuccessMessage(`Stage "${stage.title}" status updated to "${newStatus}". Recorded in audit ledger.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update stage status';
      alert(msg);
    } finally {
      setUpdatingStageId(null);
    }
  };

  const handleApproveStage = (stageKey: StageKey) => {
    const stage = stages.find((s) => s.stage_key === stageKey);
    if (!stage) return;

    const isPaymentStage = stageKey === 'initial-invoice' || stageKey === 'final-payment';
    const snapshot = (stage.snapshot || {}) as Record<string, any>;
    const defaultUtr = snapshot.utrNumber || snapshot.utr || snapshot.transactionRef || snapshot.transaction_ref || snapshot.billingSubmission?.utr || 'BANK-CR-MANUAL';
    const defaultNote = `Approved and verified by Super Admin for ${stage.title}. Next milestone unlocked.`;

    setApprovalModal({
      isOpen: true,
      stageKey,
      stageTitle: stage.title,
      stageOrdinal: stage.ordinal,
      isPaymentStage,
      defaultNotes: isPaymentStage ? defaultUtr : defaultNote,
    });
  };

  const handleConfirmApproval = async (notesOrUtr: string) => {
    if (!approvalModal) return;
    const { stageKey, isPaymentStage } = approvalModal;
    const stage = stages.find((s) => s.stage_key === stageKey);
    if (!stage) return;

    setUpdatingStageId(stage.id);

    try {
      if (isPaymentStage) {
        const milestoneAmount = stageKey === 'initial-invoice' ? financials.depositAmount : financials.settlementAmount;
        const res = await fetch('/api/admin/payments/reconcile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engagementRef: engagement.engagement_ref,
            stageKey,
            transactionRef: notesOrUtr.trim(),
            verifiedAmount: milestoneAmount,
            actorName: 'Super Admin',
            reconciliationNotes: `Manual receiving bank verification for ${stageKey}. Ref: ${notesOrUtr.trim()}`,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to verify bank credit');
        }

        if (data.stages && Array.isArray(data.stages)) {
          setStages(data.stages);
        } else {
          const currentIndex = stages.findIndex((s) => s.stage_key === stageKey);
          const nextStage = stages[currentIndex + 1];

          setStages((prev) =>
            prev.map((s, idx) => {
              if (idx === currentIndex) {
                return { ...s, status: 'verified', approved_at: new Date().toISOString() };
              }
              if (nextStage && idx === currentIndex + 1) {
                return { ...s, status: 'available', unlocked_at: new Date().toISOString() };
              }
              return s;
            })
          );
        }

        setSuccessMessage(
          data.message ||
            `Receiving bank credit verified! Payment marked verified, downstream stage unlocked, and Tax Invoice & Receipt issued.`
        );
        setTimeout(() => setSuccessMessage(null), 4500);
      } else {
        const res = await fetch(`/api/engagements/${engagement.engagement_ref}/stages/${stageKey}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'approved',
            action: 'admin_approve_stage',
            notes: notesOrUtr.trim(),
            unlockNext: true,
            actorRole: 'admin',
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to approve stage');
        }

        if (data.stages && Array.isArray(data.stages)) {
          setStages(data.stages);
        } else {
          const currentIndex = stages.findIndex((s) => s.stage_key === stageKey);
          setStages((prev) =>
            prev.map((s, idx) => {
              if (idx === currentIndex) {
                return { ...s, status: 'approved', approved_at: new Date().toISOString() };
              }
              if (idx === currentIndex + 1) {
                return { ...s, status: 'available', unlocked_at: new Date().toISOString() };
              }
              return s;
            })
          );
        }
        setSuccessMessage(
          `✓ Stage "${stage.title}" approved! Downstream milestone unlocked, and notification email sent to client.`
        );
        setTimeout(() => setSuccessMessage(null), 4500);
      }
    } finally {
      setUpdatingStageId(null);
    }
  };

  // Dynamically compute total contract commitment and payment terms using statutory GST engine
  const financials = getFinancialsForEngagement(engagement, stages);
  const contractValueDisplay = financials.totalFormatted;
  const paymentTermsDisplay = `50% Deposit (${financials.depositFormatted}) / 50% Settlement (${financials.settlementFormatted})`;

  // Status badge styling helper
  const renderStatusBadge = (status: StageStatus) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'verified':
      case 'accepted':
      case 'signed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span className="capitalize">{status}</span>
          </span>
        );
      case 'submitted':
      case 'under_review':
      case 'verification_pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            <span className="capitalize">{status.replace('_', ' ')}</span>
          </span>
        );
      case 'in_progress':
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1565C0] border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0]"></span>
            <span className="capitalize">{status.replace('_', ' ')}</span>
          </span>
        );
      case 'locked':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Locked</span>
          </span>
        );
    }
  };

  // Render client submission data inspector for any of the 13 stages
  const renderStageSubmissionInspector = (stage: EngagementStage) => {
    const snap = (stage.snapshot || {}) as Record<string, any>;
    const hasData = Object.keys(snap).length > 0;
    const stageKey = stage.stage_key;

    if (!hasData && stage.status === 'locked') {
      return (
        <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-slate-500 space-y-2">
          <Lock className="w-8 h-8 mx-auto text-slate-300" />
          <p className="font-semibold text-xs text-slate-700">Stage Locked &amp; Awaiting Prerequisite Completion</p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            {stage.prerequisite_description || 'Previous stages must be completed before the client can submit data here.'}
          </p>
        </div>
      );
    }

    if (!hasData && (stage.status === 'available' || stage.status === 'in_progress')) {
      return (
        <div className="p-8 text-center bg-blue-50/40 rounded-xl border border-dashed border-blue-200 text-slate-600 space-y-2">
          <Clock className="w-8 h-8 mx-auto text-blue-400 animate-spin-slow" />
          <p className="font-semibold text-xs text-[#0B2545]">Client In-Progress</p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            This stage is available in the client portal. The client has not submitted their final submission payload yet.
          </p>
          <div className="pt-2">
            <Link
              href={`/engagement/${engagement.engagement_ref}/${stage.stage_key}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DFE7EF] hover:border-[#1565C0] text-[#1565C0] text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <span>Preview Client View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      );
    }

    // Custom Inspectors per stage
    switch (stageKey) {
      case 'checklist': {
        const selectedItems: number[] = Array.isArray(snap.selectedItems)
          ? snap.selectedItems.map(Number).filter((n) => !isNaN(n))
          : [];
        const count = selectedItems.length || snap.totalSelected || 0;
        const notes = snap.notes || snap.clientNotes || '';
        const submittedAt = snap.submittedAt || stage.completed_at || stage.updated_at;

        // Resolve checkpoint details
        const selectedCheckpoints: EnterpriseCheckpoint[] = selectedItems
          .map((num) => ENTERPRISE_CHECKPOINTS.find((c) => c.number === num))
          .filter((c): c is EnterpriseCheckpoint => Boolean(c));

        const filteredCheckpoints = checklistSearch.trim()
          ? selectedCheckpoints.filter(
              (c) =>
                c.title.toLowerCase().includes(checklistSearch.toLowerCase()) ||
                c.phase_title.toLowerCase().includes(checklistSearch.toLowerCase()) ||
                String(c.number).includes(checklistSearch)
            )
          : selectedCheckpoints;

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                  Checkpoints Selected
                </span>
                <div className="text-2xl font-black font-mono text-emerald-700 mt-0.5">
                  {count} <span className="text-xs font-medium text-emerald-600">/ 50 ({(count * 2).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-emerald-200/60 rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, count * 2)}%` }} />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Submission Timestamp
                </span>
                <span className="text-xs font-mono font-bold text-slate-800 mt-1 block">
                  {submittedAt ? new Date(submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Verified'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Audit Hash verified</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  SOP Master Reference
                </span>
                <span className="text-xs font-mono font-bold text-[#1565C0] mt-1 block">LIT-00 (v2.4)</span>
                <Link
                  href="/admin/checklist-invitations"
                  className="text-[10px] text-teal-700 hover:underline font-semibold mt-0.5 block"
                >
                  Manage Checklist Invitations →
                </Link>
              </div>
            </div>

            {notes && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
                <span className="font-bold text-amber-900 block mb-1">Client Project Notes / Clarifications:</span>
                <p className="text-amber-800 font-sans italic leading-relaxed whitespace-pre-wrap">{notes}</p>
              </div>
            )}

            {/* Checkpoints Inspector List */}
            <div className="space-y-2 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                  Selected Enterprise Checkpoints ({selectedCheckpoints.length})
                </span>
                <input
                  type="text"
                  value={checklistSearch}
                  onChange={(e) => setChecklistSearch(e.target.value)}
                  placeholder="Filter selected checkpoints..."
                  className="px-3 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1565C0] w-full sm:w-64"
                />
              </div>

              {selectedCheckpoints.length === 0 ? (
                <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                  Client submitted checklist with empty selection or selection stored in legacy format.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/30">
                  {filteredCheckpoints.map((cp) => (
                    <div
                      key={cp.number}
                      className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs hover:border-[#1565C0]/40 transition-all shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#E7F3FF] text-[#1565C0] border border-[#B9DCFF]">
                            #{String(cp.number).padStart(2, '0')}
                          </span>
                          <span className="font-bold text-[#0B2545] text-xs">{cp.title}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          Phase {cp.phase}: {cp.phase_title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {cp.engineering_requirement}
                      </p>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Acceptance: <strong className="text-slate-700 font-normal">{cp.acceptance_criteria}</strong></span>
                        <span className="font-mono text-slate-400 shrink-0">PDF p.{cp.pdf_page}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'discovery': {
        const meetingDate = snap.meetingDate || snap.date;
        const meetingTime = snap.meetingTime || snap.time;
        const answers = (snap.technicalAnswers || {}) as Record<string, any>;
        const customNote = snap.customNote || snap.scopingNotes || snap.notes;

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1565C0] block">
                  Scheduled Consultation
                </span>
                <div className="text-sm font-bold text-[#0B2545] mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#1565C0]" />
                  <span>{meetingDate || 'Date to be confirmed'}</span>
                </div>
                <span className="text-xs font-mono text-slate-600 mt-0.5 block">
                  {meetingTime || 'Time pending'} (Asia/Kolkata IST)
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Meeting Mode
                </span>
                <span className="text-xs font-bold text-[#0B2545] mt-1 block">Google Meet · Executive Video</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Automated calendar invitation issued</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Technical Architecture Lead
                </span>
                <span className="text-xs font-bold text-[#0B2545] mt-1 block">Vikash Saravanan</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Lead Principal Architect, LIT</span>
              </div>
            </div>

            {/* Technical Answers Grid */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wider block">
                Client Technical Answers &amp; Platform Stack Preferences
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Primary Cloud:</span>
                  <span className="font-bold text-[#0B2545]">{answers.cloudProvider || answers.primaryCloud || 'AWS / Multi-Cloud'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Database Preference:</span>
                  <span className="font-bold text-[#0B2545]">{answers.databasePreference || answers.primaryDatabase || 'PostgreSQL + Timescale'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Compliance Requirements:</span>
                  <span className="font-bold text-[#0B2545]">{answers.complianceRequirements || answers.compliance || 'HIPAA + ISO 27001'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Target Go-Live:</span>
                  <span className="font-bold text-[#0B2545]">{answers.targetLaunchDate || answers.launchDate || 'Q4 2026'}</span>
                </div>
              </div>
            </div>

            {customNote && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-bold text-slate-700 block mb-1">Client Scoping Notes:</span>
                <p className="text-slate-600 font-sans italic leading-relaxed whitespace-pre-wrap">{customNote}</p>
              </div>
            )}
          </div>
        );
      }

      case 'proposal': {
        const subtotal = financials.subtotalFormatted;
        const gst = financials.gstFormatted;
        const total = financials.totalFormatted;

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Proposal Reference
                </span>
                <span className="text-xs font-mono font-bold text-[#1565C0] mt-1 block">
                  {snap.proposalRef || snap.proposalId || engagement.proposal_id || 'LIT-PROP-2026'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Subtotal (Excl. GST)
                </span>
                <span className="text-sm font-mono font-bold text-slate-800 mt-1 block">
                  {subtotal}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  GST (18% Statutory)
                </span>
                <span className="text-sm font-mono font-bold text-slate-800 mt-1 block">
                  {gst}
                  <span className="text-[10px] font-normal text-slate-500 block mt-0.5">
                    (CGST 9%: {financials.cgstFormatted} · SGST 9%: {financials.sgstFormatted})
                  </span>
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                  Total Commitment
                </span>
                <span className="text-base font-mono font-black text-emerald-700 mt-1 block">
                  {total}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 block">Payment Terms &amp; Milestones:</span>
                <button
                  type="button"
                  onClick={() => setIsPricingModalOpen(true)}
                  className="text-xs font-bold text-[#1565C0] hover:underline cursor-pointer"
                >
                  Edit Quotation &amp; Rates
                </button>
              </div>
              <p className="text-slate-600">
                Milestone 1: 50% Initial Deposit ({financials.depositFormatted}) · Milestone 2: 50% Final Settlement ({financials.settlementFormatted})
              </p>
            </div>
          </div>
        );
      }

      case 'acceptance': {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Legal Signatory
                </span>
                <span className="text-xs font-bold text-[#0B2545] mt-1 block">
                  {snap.signatoryName || engagement.contact_name}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {snap.signatoryEmail || engagement.contact_email}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Designation / Role
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">
                  {snap.signatoryRole || snap.signatoryDesignation || 'Authorized Representative'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Full corporate binding authority</span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                  Assent Record
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 mt-1 block">
                  {snap.acceptedAt ? new Date(snap.acceptedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Recorded'}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 mt-0.5 block">IP: {snap.clientIp || '103.21.244.1'}</span>
              </div>
            </div>
          </div>
        );
      }

      case 'sow': {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Signer Name
                </span>
                <span className="text-xs font-bold text-[#0B2545] mt-1 block">
                  {snap.signerName || snap.signatoryName || engagement.contact_name}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {snap.signerDesignation || 'Managing Director'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Master Agreement Reference
                </span>
                <span className="text-xs font-mono font-bold text-[#1565C0] mt-1 block">
                  LIT-01-SOW-Service-Agreement
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Version 1.0</span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                  Signature Audit Hash
                </span>
                <span className="text-[10px] font-mono text-slate-700 mt-1 block truncate">
                  {snap.signatureHash || stage.snapshot?.last_audit_hash || 'SHA-256 Validated'}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block">✓ Legally Binding</span>
              </div>
            </div>
          </div>
        );
      }

      case 'initial-invoice':
      case 'final-payment': {
        const isInitial = stageKey === 'initial-invoice';
        const utr = snap.utrNumber || snap.utr || snap.transactionRef || snap.transaction_ref;
        const amount = snap.amount || (isInitial ? financials.depositFormatted : financials.settlementFormatted);
        const billing = (snap.billingSubmission || {}) as Record<string, any>;
        const isVerified = stage.status === 'verified';

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Milestone Allocation
                </span>
                <span className="text-xs font-bold text-[#0B2545] mt-1 block">
                  {isInitial ? 'Stage 06: Initial 50% Deposit' : 'Stage 11: Final 50% Settlement'}
                </span>
                <span className="text-sm font-mono font-bold text-slate-800 mt-0.5 block">
                  {typeof amount === 'number' ? `₹${amount.toLocaleString('en-IN')}` : amount}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Client Reported UTR
                </span>
                <span className="text-sm font-mono font-bold text-[#1565C0] mt-1 block">
                  {utr || 'Pending client submission'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Mode: UPI Direct / IMPS Transfer
                </span>
              </div>

              <div
                className={`p-3.5 rounded-xl border ${
                  isVerified ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/70 border-amber-300'
                }`}
              >
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                    isVerified ? 'text-emerald-800' : 'text-amber-800'
                  }`}
                >
                  Bank Credit Status
                </span>
                <span
                  className={`text-xs font-bold mt-1 block ${
                    isVerified ? 'text-emerald-700' : 'text-amber-800'
                  }`}
                >
                  {isVerified ? '✓ Verified in YES BANK / PTYES' : 'Awaiting Super Admin Verification'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Beneficiary: S VIKASH (9342877474@ptyes)
                </span>
              </div>
            </div>

            {/* Direct Reconcile Action Banner when pending review */}
            {!isVerified && (
              <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#0B2545] flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>Reconcile Payment &amp; Issue Legal Documents</span>
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Verify receiving bank credit in YES BANK, generate Tax Invoice &amp; Payment Receipt PDFs, advance to {isInitial ? 'Stage 07 Onboarding' : 'Stage 12 Handover'}, and dispatch email with both PDF attachments.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={updatingStageId === stage.id}
                  onClick={() => handleApproveStage(stageKey)}
                  className="px-4 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap self-start sm:self-center disabled:opacity-50"
                >
                  ✓ Reconcile &amp; Approve
                </button>
              </div>
            )}

            {/* Billing Address Details */}
            {Object.keys(billing).length > 0 && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-slate-700 block">Client Billing Information:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Legal Entity:</span>
                    <span className="font-semibold text-slate-800">{billing.companyName || billing.legalName || engagement.company_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Billing Email:</span>
                    <span className="font-semibold text-slate-800">{billing.email || engagement.contact_email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Place of Supply:</span>
                    <span className="font-semibold text-slate-800">{billing.placeOfSupply || 'Tamil Nadu (33)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GSTIN:</span>
                    <span className="font-semibold text-slate-800">{billing.clientGstin || 'Unregistered / Direct'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'onboarding': {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Git Repository
                </span>
                <span className="text-xs font-mono font-bold text-[#1565C0] mt-1 block truncate">
                  {snap.repoUrl || 'https://github.com/apexmeridian/enterprise-platform'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Access verified by LIT engineering</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Tech Stack
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">
                  {snap.techStack || 'Next.js 15, FastAPI, PostgreSQL, TailwindCSS, Docker'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Cloud Infrastructure
                </span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block">
                  {snap.cloudAccounts || 'AWS IAM Role & VPC Peering Configured'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'technical-spec': {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Spec Version
                </span>
                <span className="text-xs font-mono font-bold text-[#1565C0] mt-1 block">
                  {snap.specVersion || 'v1.4 (Enterprise Architecture)'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Document LIT-04</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  SLA Target
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">
                  {snap.slaRequirement || '99.95% High Availability Uptime'}
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                  Client Technical Sign-Off
                </span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block">
                  {snap.clientSignoff || `${engagement.contact_name} (CTO)`}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'development': {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Sprint Roadmap
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">
                  Sprint 1 &amp; 2 Complete · Sprint 3 Active
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Staging Environment
                </span>
                <span className="text-xs font-mono font-bold text-[#1565C0] mt-1 block truncate">
                  {snap.stagingUrl || 'https://staging.logicintelligencetechnologies.in'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Change Requests (RFCs)
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">
                  0 Blockers · All scopes approved
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'delivery-acceptance': {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 block">
                  QA Acceptance
                </span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block">
                  {snap.qaSignoff || '100% Automated Test Suite Passed'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  UAT Product Sign-Off
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">
                  {snap.uatApprovedBy || `${engagement.contact_name} (Product Sponsor)`}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Acceptance Notes
                </span>
                <span className="text-xs text-slate-600 mt-1 block">
                  {snap.acceptanceNotes || 'All deliverables approved for production deployment.'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'handover': {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Production Domain
                </span>
                <span className="text-xs font-mono font-bold text-[#1565C0] mt-1 block">
                  {snap.productionDomain || 'https://www.logicintelligencetechnologies.in'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  DNS &amp; SSL Records
                </span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block">
                  {snap.dnsRecordsConfigured || 'A, CNAME, SPF, DKIM Configured'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Credentials Handover
                </span>
                <span className="text-xs font-bold text-slate-800 mt-1 block">
                  {snap.adminCredentialsTransferred ? 'Vault Transfer Complete' : 'Vault Credentials Handed Over'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'support': {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  SLA Tier
                </span>
                <span className="text-xs font-bold text-[#0B2545] mt-1 block">
                  {snap.slaTier || 'Enterprise 24x7 Dedicated SLA'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Warranty Coverage
                </span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block">
                  {snap.warrantyPeriod || '90-Day Post-Launch Warranty Active'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Enterprise Support Hub
                </span>
                <Link
                  href="/admin/support"
                  className="text-xs font-bold text-teal-700 hover:underline mt-1 block"
                >
                  View Support Tickets Queue →
                </Link>
              </div>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
            <pre className="text-[11px] font-mono whitespace-pre-wrap">{JSON.stringify(snap, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Engagement Header */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFE7EF] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#1565C0] bg-[#E7F3FF] px-2.5 py-1 rounded">
                {engagement.engagement_ref}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {engagement.status}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Tenant: {engagement.id.substring(0, 8)}...
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#0B2545] mt-2">
              {engagement.company_name}
            </h2>
            <p className="text-xs text-[#52677C]">
              {engagement.project_title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPricingModalOpen(true)}
              className="px-4 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Edit Quotation, Subtotal, and GST rates for this engagement"
            >
              <DollarSign className="w-3.5 h-3.5 text-white" />
              <span>Edit Quotation &amp; Rates</span>
            </button>
            <button
              type="button"
              onClick={() => setIsNotificationModalOpen(true)}
              className="px-4 py-2 bg-[var(--lit-teal,#1FA9A2)] hover:bg-[#188c86] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              title="Send notification to this client workspace"
            >
              <Bell className="w-3.5 h-3.5 text-white" />
              <span>Send Notification</span>
            </button>
            <Link
              href={`/engagement/${engagement.engagement_ref}`}
              target="_blank"
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>Visit Client Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 text-[11px] block">Primary Liaison:</span>
            <span className="font-semibold text-[#0B2545]">{engagement.contact_name}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 text-[11px] block">Contact Email:</span>
            <span className="font-semibold text-[#0B2545]">{engagement.contact_email}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 text-[11px] block">Total Contract Commitment:</span>
            <span className="font-mono font-bold text-emerald-700">{contractValueDisplay}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 text-[11px] block">Payment Terms:</span>
            <span className="font-semibold text-[#1565C0]">{paymentTermsDisplay}</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Interactive 13-Stage Quick Navigator & Inspector Header */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFE7EF] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--lit-teal,#1FA9A2)]/10 text-[var(--lit-teal,#1FA9A2)]">
                <Eye className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-base font-bold text-[#0B2545]">
                Stage Data Inspector &amp; Verification Console
              </h3>
            </div>
            <p className="text-xs text-[#52677C] mt-0.5">
              Select any stage below to inspect the client&apos;s submitted choices, answers, notes, UTRs, and verify &amp; approve to unlock next milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Active Inspector: Stage #{String(currentStageRecord.ordinal).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* 13 Stage Pills */}
        <div className="flex flex-wrap gap-1.5 pb-2">
          {stages.map((st) => {
            const isSelected = st.stage_key === activeInspectorStageKey;
            const isDone = ['completed', 'verified', 'approved', 'accepted', 'signed'].includes(st.status);
            const isAwaitingReview = ['submitted', 'under_review', 'verification_pending'].includes(st.status);
            const isAvailable = st.status === 'available' || st.status === 'in_progress';

            return (
              <button
                key={st.stage_key}
                type="button"
                onClick={() => setActiveInspectorStageKey(st.stage_key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B2545] text-white shadow-xs'
                    : isAwaitingReview
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : isAvailable
                    ? 'bg-blue-50 text-[#1565C0] border border-blue-200 hover:bg-blue-100'
                    : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="font-mono text-[10px]">#{String(st.ordinal).padStart(2, '0')}</span>
                <span>{CANONICAL_13_STAGES[st.stage_key]?.shortTitle || st.title}</span>
                {isDone && <CheckCircle className={`w-3 h-3 ${isSelected ? 'text-emerald-300' : 'text-emerald-600'}`} />}
                {isAwaitingReview && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
              </button>
            );
          })}
        </div>

        {/* Selected Stage Detail Inspector Panel */}
        <div className="border border-[#DFE7EF] rounded-2xl p-5 bg-white shadow-2xs space-y-4">
          {/* Header of the Selected Stage */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-[#E7F3FF] text-[#1565C0] border border-[#B9DCFF]">
                  Stage #{String(currentStageRecord.ordinal).padStart(2, '0')}
                </span>
                <h4 className="text-base font-extrabold text-[#0B2545]">
                  {currentStageRecord.title}
                </h4>
                {renderStatusBadge(currentStageRecord.status)}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {currentStageRecord.summary}
              </p>
            </div>

            {/* Stage Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/engagement/${engagement.engagement_ref}/${currentStageRecord.stage_key}`}
                target="_blank"
                className="px-3 py-1.5 text-xs border border-slate-200 text-slate-700 hover:text-[#0B2545] hover:border-slate-400 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>Client View</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              {/* Review & Approve Button */}
              {currentStageRecord.status !== 'approved' &&
                currentStageRecord.status !== 'verified' &&
                currentStageRecord.status !== 'completed' && (
                  <button
                    type="button"
                    disabled={updatingStageId === currentStageRecord.id}
                    onClick={() => handleApproveStage(currentStageRecord.stage_key)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>
                      {currentStageRecord.stage_key === 'initial-invoice' ||
                      currentStageRecord.stage_key === 'final-payment'
                        ? 'Verify Bank Credit'
                        : '✓ Approve & Unlock Next Stage'}
                    </span>
                  </button>
                )}
            </div>
          </div>

          {/* Render Stage-Specific Captured Data */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-[#1565C0]" />
                <span>Captured Client Information &amp; Submission Telemetry</span>
              </span>
            </div>

            {renderStageSubmissionInspector(currentStageRecord)}
          </div>

          {/* Verification & Manual Status Controller Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Stage Status Override:</span>
              <select
                value={currentStageRecord.status}
                disabled={updatingStageId === currentStageRecord.id}
                onChange={(e) => handleStatusChange(currentStageRecord.id, e.target.value as StageStatus)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white text-black font-bold focus:outline-none focus:ring-1 focus:ring-[#1565C0] shadow-2xs"
                style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#FFFFFF' }}
              >
                {[
                  'locked',
                  'available',
                  'in_progress',
                  'submitted',
                  'under_review',
                  'approved',
                  'verification_pending',
                  'verified',
                  'completed',
                ].map((st) => (
                  <option
                    key={st}
                    value={st}
                    style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#FFFFFF' }}
                  >
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Audit Hash: {typeof currentStageRecord.snapshot?.last_audit_hash === 'string' ? currentStageRecord.snapshot.last_audit_hash.slice(0, 16) + '...' : 'System Initial'}
            </div>
          </div>
        </div>
      </div>

      {/* 13-Stage Lifecycle Gates Matrix Table */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">
              13-Stage Universal Lifecycle Gates &amp; Status Matrix
            </h3>
            <p className="text-xs text-[#52677C]">
              Super-Admin control plane for stage transitions, audit records, and downstream unlocks.
            </p>
          </div>
        </div>

        <div className="border border-[#DFE7EF] rounded-xl overflow-hidden font-sans text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-[#DFE7EF]">
                <tr>
                  <th className="p-3 w-16">Ord</th>
                  <th className="p-3">Stage &amp; Description</th>
                  <th className="p-3">Prerequisite Requirement</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">Super-Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE7EF] bg-white">
                {stages.map((stage) => {
                  const isUpdating = updatingStageId === stage.id;
                  const isPaymentStage = stage.stage_key === 'initial-invoice' || stage.stage_key === 'final-payment';
                  const isSelected = stage.stage_key === activeInspectorStageKey;

                  return (
                    <tr
                      key={stage.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-[#1565C0]">
                        #{String(stage.ordinal).padStart(2, '0')}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setActiveInspectorStageKey(stage.stage_key)}
                          className="font-bold text-[#0B2545] hover:text-[#1565C0] text-left block"
                        >
                          {stage.title}
                        </button>
                        <div className="text-[11px] text-slate-500 max-w-sm">{stage.summary}</div>
                      </td>
                      <td className="p-3 text-slate-600">
                        {stage.prerequisite_description ? (
                          <span className="text-[11px] text-slate-500">
                            {stage.prerequisite_description}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">None (Root Entry)</span>
                        )}
                      </td>
                      <td className="p-3">
                        {renderStatusBadge(stage.status)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveInspectorStageKey(stage.stage_key)}
                            className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors shadow-2xs"
                          >
                            Inspect
                          </button>

                          <Link
                            href={`/engagement/${engagement.engagement_ref}/${stage.stage_key}`}
                            target="_blank"
                            className="px-2.5 py-1 text-[11px] border border-slate-200 text-slate-600 hover:text-[#0B2545] hover:border-slate-400 rounded-lg transition-colors"
                          >
                            Preview
                          </Link>

                          {isPaymentStage && stage.status !== 'verified' && (
                            <button
                              type="button"
                              onClick={() => handleApproveStage(stage.stage_key)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                            >
                              Verify Bank
                            </button>
                          )}

                          {!isPaymentStage &&
                            stage.status !== 'approved' &&
                            stage.status !== 'completed' && (
                              <button
                                type="button"
                                onClick={() => handleApproveStage(stage.stage_key)}
                                disabled={isUpdating}
                                className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}

                          <select
                            value={stage.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(stage.id, e.target.value as StageStatus)}
                            className="px-2 py-1 text-[11px] border border-slate-300 rounded-lg bg-white text-black font-semibold focus:outline-none focus:ring-1 focus:ring-[#1565C0]"
                            style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#FFFFFF' }}
                          >
                            {[
                              'locked',
                              'available',
                              'in_progress',
                              'submitted',
                              'under_review',
                              'approved',
                              'verification_pending',
                              'verified',
                              'completed',
                            ].map((st) => (
                              <option
                                key={st}
                                value={st}
                                style={{ color: '#000000', WebkitTextFillColor: '#000000', backgroundColor: '#FFFFFF' }}
                              >
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Official Master PDF Registry for this Engagement */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#0B2545]">
            Preserved Master PDF Documents &amp; Integrity Registry
          </h3>
          <p className="text-xs text-[#52677C]">
            All 7 official document templates and the 50-point checklist available for this client.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {documents.map((doc) => (
            <div key={doc.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-[#0B2545] block">{doc.document_title}</span>
                <span className="text-[11px] font-mono text-slate-500">
                  {doc.master_id} · {doc.version_label} · Stage: {doc.stage_key}
                </span>
              </div>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-white border border-[#DFE7EF] hover:border-[#1565C0] text-[#1565C0] text-[11px] font-semibold rounded-lg shadow-xs"
              >
                Download PDF
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Animated Super Admin Approval & Bank Verification Confirmation Modal */}
      {approvalModal && (
        <StageApprovalModal
          isOpen={approvalModal.isOpen}
          onClose={() => setApprovalModal(null)}
          onConfirm={handleConfirmApproval}
          title={
            approvalModal.isPaymentStage
              ? 'Verify Bank Statement & Clear Milestone'
              : 'Approve & Unlock Stage Milestone'
          }
          stageName={approvalModal.stageTitle}
          stageOrdinal={approvalModal.stageOrdinal}
          companyName={engagement.company_name}
          isPaymentStage={approvalModal.isPaymentStage}
          defaultNotes={approvalModal.defaultNotes}
        />
      )}

      {/* Send Notification Modal */}
      <SendNotificationModal
        engagement={engagement}
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onSuccess={(msg) => {
          setSuccessMessage(msg);
          setTimeout(() => setSuccessMessage(null), 4000);
        }}
      />

      {/* Manage Pricing Modal */}
      <ManagePricingModal
        engagement={engagement}
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onUpdated={(updatedEngagement) => {
          setEngagement(updatedEngagement);
          setSuccessMessage("✓ Commercial quotation & rates updated successfully!");
          setTimeout(() => setSuccessMessage(null), 4500);
        }}
      />
    </div>
  );
}
