'use client';

import React from 'react';
import Link from 'next/link';

interface ProposalStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
}

export default function ProposalStageClient({
  engagementRef,
  companyName,
  contactName,
}: ProposalStageClientProps) {
  const proposalData = {
    proposalNumber: 'LIT-PROP-2026-084',
    dateIssued: '14 October 2026',
    validUntil: '14 November 2026',
    commercialTier: 'Enterprise Bespoke Multi-Site Engineering',
    subtotal: '₹18,00,000',
    gst: '₹3,24,000',
    totalPayable: '₹21,24,000',
    paymentSchedule: [
      {
        milestone: 'Initial Deposit (Stage 6)',
        pct: '50%',
        amount: '₹10,62,000',
        trigger: 'Execution of SOW / Service Agreement (Stage 5)',
      },
      {
        milestone: 'Final Settlement (Stage 11)',
        pct: '50%',
        amount: '₹10,62,000',
        trigger: 'Delivery Acceptance Sign-off & QA Verification (Stage 10)',
      },
    ],
    deliverables: [
      '50-Point Enterprise Architectural Audit & Compliance Alignment',
      'Production Next.js 15 Web Application + Custom REST/FHIR Middleware',
      'Supabase Database Schema with Strict RLS & Immutable Audit Trails',
      'Zero-Gateway Audited Manual UPI Payment Clearance Architecture',
      'AI Assistant Pipeline with Groq LPU + Domain-Isolated RAG Embeddings',
      'Comprehensive Handover Manifest, Transfer Runbooks & 90-Day SLA Support',
    ],
  };

  return (
    <div className="space-y-6">
      {/* Proposal Summary Card */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#1565C0] bg-[#E7F3FF] px-2.5 py-1 rounded">
                {proposalData.proposalNumber}
              </span>
              <span className="text-xs text-slate-500">Issued: {proposalData.dateIssued}</span>
            </div>
            <h2 className="text-lg font-bold text-[#0B2545] mt-1.5">
              Commercial Proposal for {companyName}
            </h2>
            <p className="text-xs text-[#52677C]">
              Attn: {contactName} · Valid until: {proposalData.validUntil}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Contract Value (Incl. 18% GST)</span>
            <span className="text-2xl font-black font-mono text-[#0B2545]">{proposalData.totalPayable}</span>
          </div>
        </div>

        {/* Deliverables List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#0B2545]">Agreed Scope Deliverables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {proposalData.deliverables.map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-[#1FA9A2] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-slate-700 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Milestone Structure */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-[#0B2545]">Milestone Payment Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Milestone</th>
                  <th className="py-2.5 px-3">Portion</th>
                  <th className="py-2.5 px-3">Amount (INR)</th>
                  <th className="py-2.5 px-3">Trigger Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proposalData.paymentSchedule.map((ps, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-[#0B2545]">{ps.milestone}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#1565C0]">{ps.pct}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{ps.amount}</td>
                    <td className="py-2.5 px-3 text-slate-600">{ps.trigger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button: Proceed to Stage 4 Acceptance */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Official proposal version reviewed and approved by Founder, Vikash Saravanan.
          </span>
          <Link
            href={`/engagement/${engagementRef}/acceptance`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0B2545] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Proceed to Formal Proposal Acceptance (Stage 4)</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
