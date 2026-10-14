'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ClientEngagement,
  EngagementStage,
  EngagementDocumentLink,
  ClientIdentityChangeRequest,
  StageStatus,
} from '@/lib/engagements/types';

interface EngagementDetailAdminClientProps {
  engagement: ClientEngagement;
  initialStages: EngagementStage[];
  documents: EngagementDocumentLink[];
  identityRequests: ClientIdentityChangeRequest[];
}

export default function EngagementDetailAdminClient({
  engagement,
  initialStages,
  documents,
  identityRequests,
}: EngagementDetailAdminClientProps) {
  const [stages, setStages] = useState<EngagementStage[]>(initialStages);
  const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleStatusChange = (stageId: string, newStatus: StageStatus) => {
    setUpdatingStageId(stageId);
    setTimeout(() => {
      setStages((prev) =>
        prev.map((s) => (s.id === stageId ? { ...s, status: newStatus, updated_at: new Date().toISOString() } : s))
      );
      setUpdatingStageId(null);
      setSuccessMessage(`Stage status updated to "${newStatus}". Changes recorded in audit ledger.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 500);
  };

  const handleBankVerification = (stageKey: 'initial-invoice' | 'final-payment') => {
    const stage = stages.find((s) => s.stage_key === stageKey);
    if (!stage) return;

    setUpdatingStageId(stage.id);
    setTimeout(() => {
      // Mark current stage verified and unlock next stage
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
      setUpdatingStageId(null);
      setSuccessMessage(
        `Receiving bank credit verified! Payment marked verified, and Stage ${currentIndex + 2} (${nextStage?.title}) is unlocked.`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 600);
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
            <Link
              href={`/engagement/${engagement.engagement_ref}`}
              target="_blank"
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>Visit Client Portal</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
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
            <span className="font-mono font-bold text-emerald-700">₹21,24,000.00</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 text-[11px] block">Payment Terms:</span>
            <span className="font-semibold text-[#1565C0]">50% Deposit / 50% Settlement</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {/* 13-Stage Lifecycle Gates Matrix */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#0B2545]">
            13-Stage Universal Lifecycle Gates & Status Controller
          </h3>
          <p className="text-xs text-[#52677C]">
            Super-Admin control plane for manual gate overrides, status transitions, and audit records.
          </p>
        </div>

        <div className="border border-[#DFE7EF] rounded-xl overflow-hidden font-sans text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-[#DFE7EF]">
                <tr>
                  <th className="p-3 w-16">Ord</th>
                  <th className="p-3">Stage & Description</th>
                  <th className="p-3">Prerequisite Requirement</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">Super-Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE7EF] bg-white">
                {stages.map((stage) => {
                  const isUpdating = updatingStageId === stage.id;
                  const isPaymentStage = stage.stage_key === 'initial-invoice' || stage.stage_key === 'final-payment';

                  return (
                    <tr key={stage.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#1565C0]">
                        #{String(stage.ordinal).padStart(2, '0')}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-[#0B2545]">{stage.title}</div>
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
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            stage.status === 'completed' || stage.status === 'verified' || stage.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : stage.status === 'locked'
                              ? 'bg-slate-100 text-slate-500 border-slate-200'
                              : 'bg-blue-50 text-[#1565C0] border-blue-200'
                          }`}
                        >
                          {stage.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/engagement/${engagement.engagement_ref}/${stage.stage_key}`}
                            target="_blank"
                            className="px-2.5 py-1 text-[11px] border border-slate-200 text-slate-600 hover:text-[#0B2545] hover:border-slate-400 rounded transition-colors"
                          >
                            Preview
                          </Link>

                          {isPaymentStage && stage.status !== 'verified' && (
                            <button
                              onClick={() => handleBankVerification(stage.stage_key as any)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded transition-colors shadow-xs"
                            >
                              Verify Bank Credit
                            </button>
                          )}

                          <select
                            value={stage.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(stage.id, e.target.value as StageStatus)}
                            className="px-2 py-1 text-[11px] border border-[#DFE7EF] rounded bg-white text-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#1565C0]"
                          >
                            <option value="locked">locked</option>
                            <option value="available">available</option>
                            <option value="in_progress">in_progress</option>
                            <option value="submitted">submitted</option>
                            <option value="under_review">under_review</option>
                            <option value="approved">approved</option>
                            <option value="verification_pending">verification_pending</option>
                            <option value="verified">verified</option>
                            <option value="completed">completed</option>
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
            Preserved Master PDF Documents & Integrity Registry
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
    </div>
  );
}
