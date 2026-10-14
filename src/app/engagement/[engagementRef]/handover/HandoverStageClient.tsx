'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HandoverStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
}

export default function HandoverStageClient({
  engagementRef,
  companyName,
  contactName,
}: HandoverStageClientProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isHandedOver, setIsHandedOver] = useState(false);

  const manifestItems = [
    {
      category: 'Source Code & Repositories',
      status: 'Transferred',
      details: 'GitHub repository transfer / admin access delegated to client engineering team.',
      reference: 'github.com/lit-infrastructure/engagement-repo',
    },
    {
      category: 'Production Cloud Accounts',
      status: 'Delegated',
      details: 'Vercel team ownership and Supabase organization admin invites accepted.',
      reference: 'Production Project: org_lit_client_prod',
    },
    {
      category: 'Domain & SSL Certificates',
      status: 'Active & Verified',
      details: 'Cloudflare DNS delegation completed, TLS 1.3 certs active, edge caching tuned.',
      reference: 'Custom Domain: live HTTPS status 200 OK',
    },
    {
      category: 'Engineering Runbooks & Documentation',
      status: 'Delivered',
      details: 'Deployment guides, disaster recovery runbooks, and API specifications delivered.',
      reference: 'Master Documentation: docs/production-runbook.md',
    },
  ];

  const handleConfirmHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acknowledged) return;

    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      setIsHandedOver(true);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Handover & IP Transfer Notice */}
      <div className="bg-[#E7F3FF] border border-[#B9DCFF] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#0B2545]">
        <svg className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
        <div>
          <span className="font-bold block">Formal IP Transfer & Source Code Custody Handover</span>
          <p className="mt-1 text-slate-600 leading-relaxed">
            Per the executed Master Services Agreement (LIT-01), all intellectual property rights, bespoke custom software code, database models, and deployment configurations are formally assigned to {companyName}.
          </p>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#0B2545]">
            Handover Deliverables Manifest
          </h3>
          <p className="text-xs text-[#52677C]">
            Inventory of transferred assets, administrative roles, and documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {manifestItems.map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#0B2545]">{item.category}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  ✓ {item.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.details}
              </p>
              <div className="pt-1 font-mono text-[11px] text-slate-400">
                {item.reference}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isHandedOver ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">
              Custody Handover Formally Acknowledged
            </h3>
            <p className="text-xs text-emerald-700 max-w-lg mx-auto mt-1 leading-relaxed">
              Ownership transfer is finalized. {companyName} is now the primary administrative custodian of all production systems. 
              Stage 13 (Maintenance & Support SLA) is now active.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/engagement/${engagementRef}/support`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
            >
              Proceed to Stage 13: Maintenance & Support SLA
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConfirmHandover} className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DFE7EF] pb-4">
            <h3 className="text-base font-bold text-[#0B2545]">
              Custody Transfer Acknowledgment
            </h3>
            <p className="text-xs text-[#52677C] mt-1">
              Please confirm receipt and administrative control of all listed assets for {companyName}.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 rounded text-[#1565C0] focus:ring-[#1565C0]"
              />
              <span className="leading-relaxed">
                <strong>Receipt & Custody Confirmation:</strong> On behalf of {companyName}, I confirm that we have received full administrative control of source code repositories, deployment environments, DNS controls, and operational runbooks.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#DFE7EF]">
            <Link
              href={`/engagement/${engagementRef}`}
              className="text-xs text-[#52677C] hover:text-[#0B2545] font-medium"
            >
              ← Back to Visit All Stages
            </Link>

            <button
              type="submit"
              disabled={isConfirming || !acknowledged}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isConfirming ? (
                <span>Confirming Custody Transfer...</span>
              ) : (
                <>
                  <span>Confirm Asset Custody Transfer</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
