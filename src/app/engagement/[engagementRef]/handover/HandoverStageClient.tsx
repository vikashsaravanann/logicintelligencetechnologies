'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface HandoverStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
  document?: any;
}

export default function HandoverStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail = '',
  initialStatus = 'available',
  initialData = {},
  document,
}: HandoverStageClientProps) {
  const [signerName, setSignerName] = useState(initialData?.signerName || contactName);
  const [signerRole, setSignerRole] = useState(initialData?.signerRole || 'Chief Technology Officer / Owner');
  const [signerEmail, setSignerEmail] = useState(initialData?.signerEmail || contactEmail);
  const [isHandedOver, setIsHandedOver] = useState(
    ['completed', 'approved', 'signed'].includes(initialStatus)
  );

  // 10 Handover Asset Categories
  const initialAssetCategories = [
    {
      id: 1,
      category: '01. Source Code & GitHub Repositories',
      status: 'Ready for Custody',
      details: 'GitHub repository transfer / owner rights prepared for client engineering team. Branch protection and v1.0.0 release tag verified.',
      reference: 'github.com/lit-infrastructure/engagement-repo',
    },
    {
      id: 2,
      category: '02. Production Cloud Accounts (Vercel Edge)',
      status: 'Ready for Custody',
      details: 'Vercel team ownership delegation invite prepared with production custom domains and edge routing.',
      reference: 'Vercel Project: org-lit-production',
    },
    {
      id: 3,
      category: '03. Supabase Database Tenant & PITR Backups',
      status: 'Ready for Custody',
      details: 'Supabase organization owner invitation dispatched. Continuous 30-day Point-In-Time-Recovery (PITR) verified.',
      reference: 'Supabase Project: db-lit-prod-01',
    },
    {
      id: 4,
      category: '04. Domain & SSL/TLS DNS Records',
      status: 'Active & Verified',
      details: 'Cloudflare DNS delegation active with automated TLS 1.3 certificates and edge caching verified live (HTTP 200).',
      reference: 'Production URL: logicintelligencetechnologies.in',
    },
    {
      id: 5,
      category: '05. Environment & Configuration Register',
      status: 'Delivered (Redacted)',
      details: 'Complete inventory of required environment variable names with secret values strictly redacted for security.',
      reference: 'Config Register: env.production.example',
    },
    {
      id: 6,
      category: '06. Open-Source Licenses & Attribution Manifest',
      status: 'Delivered',
      details: 'Software Bill of Materials (SBOM) verified: 100% compliant with MIT/Apache-2.0 licenses. Zero GPL copyleft.',
      reference: 'Licenses: docs/open-source-licenses.md',
    },
    {
      id: 7,
      category: '07. Operational Runbooks & Admin Manuals',
      status: 'Delivered',
      details: 'Comprehensive deployment, rollback, and disaster recovery procedures delivered in markdown.',
      reference: 'Master Documentation: docs/production-runbook.md',
    },
    {
      id: 8,
      category: '08. Architecture Diagrams & Vector Assets',
      status: 'Delivered',
      details: 'Vector topology diagrams (SVG) and brand assets delivered in high-resolution master formats.',
      reference: 'Assets Archive: assets/architecture-vector-pack.zip',
    },
    {
      id: 9,
      category: '09. Knowledge-Transfer Walkthrough & Access Revocation',
      status: 'Completed',
      details: '60-minute recorded architecture briefing conducted. Temporary LIT contractor access revoked and passwords rotated.',
      reference: 'Session: KT-Walkthrough-2026-10-15',
    },
    {
      id: 10,
      category: '10. Formal Certificate of Intellectual Property Transfer',
      status: 'Executed',
      details: 'Full legal assignment of custom source code, documentation, and digital assets transferred to client per SOW Section 15.',
      reference: 'Legal Ref: LIT-IP-TRANSFER-2026-001',
    },
  ];

  const [checkedAssets, setCheckedAssets] = useState<number[]>(
    initialData?.checkedAssets || initialAssetCategories.map((a) => a.id)
  );

  const [acknowledged, setAcknowledged] = useState(
    ['completed', 'approved', 'signed'].includes(initialStatus)
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const [auditHash, setAuditHash] = useState<string | null>(initialData?.last_audit_hash || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleAssetCheck = (id: number) => {
    if (checkedAssets.includes(id)) {
      setCheckedAssets(checkedAssets.filter((item) => item !== id));
    } else {
      setCheckedAssets([...checkedAssets, id]);
    }
  };

  const handleConfirmHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acknowledged || !signerName.trim() || !signerEmail.trim()) {
      setErrorMessage('Please verify your signatory details and check the receipt and custody confirmation box.');
      return;
    }

    if (checkedAssets.length < initialAssetCategories.length) {
      setErrorMessage('Please verify and acknowledge receipt of all 10 handover asset categories.');
      return;
    }

    setIsConfirming(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_handover',
          payload: {
            companyName,
            signerName: signerName.trim(),
            signerRole: signerRole.trim(),
            signerEmail: signerEmail.trim().toLowerCase(),
            checkedAssetsCount: checkedAssets.length,
            confirmedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record custody handover confirmation.');
      }

      setAuditHash(data.auditHash);
      setIsHandedOver(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error occurred while confirming asset custody.';
      setErrorMessage(msg);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Overview Card */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="border-b border-[#DFE7EF] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Stage 12 · Ownership & Custody Transfer
            </span>
            <h3 className="text-base font-bold text-[#0B2545]">
              Production Handover & Intellectual Property Assignment
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start sm:self-auto">
            Final Settlement Reconciled
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          Following verified settlement of the final milestone payment, full intellectual property, source code custody,
          cloud infrastructure administration, and operational documentation are formally transferred to{' '}
          <strong>{companyName}</strong>. Please review each asset category below and authorize the receipt of custody.
        </p>

        {/* Security Invariant Notice */}
        <div className="bg-[#E7F3FF] border border-[#B9DCFF] rounded-xl p-4 flex items-start gap-3 text-xs text-[#0B2545]">
          <svg className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <span className="font-bold block">Security Hygiene & Credential Rotation</span>
            <p className="mt-0.5 text-slate-600 leading-relaxed">
              All production secrets, API tokens, and database credentials must be rotated upon completion of handover.
              LIT engineers have revoked temporary deploy keys and access tokens.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* 10 Handover Asset Categories */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50/60 border-b border-[#DFE7EF] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0B2545]">
              Handover Asset Manifest (10 Categories)
            </h3>
            <p className="text-xs text-[#52677C]">
              Verify receipt of each deliverable category before executing final custody transfer.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">
            {checkedAssets.length} / {initialAssetCategories.length} Acknowledged
          </span>
        </div>

        <div className="divide-y divide-slate-100 p-6 space-y-4">
          {initialAssetCategories.map((asset) => {
            const isChecked = checkedAssets.includes(asset.id);
            return (
              <div
                key={asset.id}
                onClick={() => !isHandedOver && toggleAssetCheck(asset.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isChecked
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isHandedOver}
                  onChange={() => {}}
                  className="mt-1 rounded text-[#1565C0] focus:ring-[#1565C0] pointer-events-none"
                />
                <div className="flex-1 text-xs space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-bold text-slate-900">{asset.category}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                      {asset.status}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{asset.details}</p>
                  <span className="font-mono text-[10px] text-blue-700 block bg-white px-2 py-0.5 rounded border border-slate-200 w-fit">
                    Ref: {asset.reference}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custody Sign-Off Form */}
      {isHandedOver ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">
              Full Asset Custody & IP Transfer Executed
            </h3>
            <p className="text-xs text-emerald-700 max-w-lg mx-auto mt-1 leading-relaxed">
              Ownership of all source repositories, cloud resources, and documentation has been transferred to{' '}
              <strong>{companyName}</strong>. Stage 13 (Support & Maintenance) is now active.
            </p>
            {auditHash && (
              <p className="font-mono text-[11px] text-emerald-800 bg-white/80 p-2 rounded border border-emerald-200 max-w-md mx-auto mt-3 break-all">
                Audit Digest: {auditHash}
              </p>
            )}
          </div>
          <div className="pt-3">
            <Link
              href={`/engagement/${engagementRef}/support`}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
            >
              <span>Proceed to Stage 13: Maintenance & Support</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConfirmHandover} className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DFE7EF] pb-3">
            <h3 className="text-base font-bold text-[#0B2545]">
              Custody Acceptance Assent & Signatory Declaration
            </h3>
            <p className="text-xs text-[#52677C] mt-0.5">
              Confirm legal receipt of all deliverables and assume primary custody for {companyName}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-[#0B2545] mb-1">
                Authorized Signatory Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1">
                Signatory Title / Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1">
                Signatory Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 rounded text-[#1565C0] focus:ring-[#1565C0]"
              />
              <span>
                I acknowledge receipt of all 10 software assets, repositories, cloud accounts, and runbooks listed above on behalf of{' '}
                <strong>{companyName}</strong>, and confirm that intellectual property assignment is finalized per the executed Service Agreement.
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-[#DFE7EF] flex justify-end">
            <button
              type="submit"
              disabled={isConfirming || !acknowledged}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B2545] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isConfirming ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Confirming Custody Transfer...</span>
                </>
              ) : (
                <>
                  <span>Execute Handover & Assume Ownership</span>
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
