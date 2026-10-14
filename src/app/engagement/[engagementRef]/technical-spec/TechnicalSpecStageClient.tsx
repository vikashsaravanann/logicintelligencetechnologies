'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StageDocumentCard from '../components/StageDocumentCard';

interface TechnicalSpecStageClientProps {
  engagementRef: string;
  companyName: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
  document?: any;
}

export default function TechnicalSpecStageClient({
  engagementRef,
  companyName,
  initialStatus = 'available',
  initialData = {},
  document,
}: TechnicalSpecStageClientProps) {
  const [hasConfirmedArchitecture, setHasConfirmedArchitecture] = useState(
    ['approved', 'completed'].includes(initialStatus)
  );
  const [activeTab, setActiveTab] = useState<'architecture' | 'security' | 'api' | 'database'>('architecture');
  const [isApproving, setIsApproving] = useState(false);
  const [auditHash, setAuditHash] = useState<string | null>(initialData?.last_audit_hash || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApproveSpec = async () => {
    setIsApproving(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/technical-spec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_spec',
          payload: {
            specificationVersion: 'v3.1 (Approved Engineering Baseline)',
            approvedByCompany: companyName,
            approvedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record architecture approval.');
      }

      setAuditHash(data.auditHash);
      setHasConfirmedArchitecture(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while confirming architecture.');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Master PDF Card */}
      <StageDocumentCard
        documentRef={document?.master_id ? `${document.master_id}-Technical-Specification.pdf` : 'LIT-04-Technical-Specification.pdf'}
        title={document?.document_title || 'LIT-04 Technical Specification Blueprint'}
        description="Authoritative systems engineering specification detailing component topology, API schemas, PostgreSQL data models, security parameters, and deployment gates."
        documentMasterPath={document?.file_url || '/assets/docs/masters/LIT-04-Technical-Specification.pdf'}
        version={document?.version_label || 'v3.1 (Approved Engineering Baseline)'}
        status="active"
      />

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* Interactive Blueprint Viewer */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] overflow-hidden shadow-xs">
        <div className="border-b border-[#DFE7EF] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">
              System Architecture & Technical Contracts
            </h3>
            <p className="text-xs text-[#52677C]">
              Reviewed technical specification for {companyName} deployment.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'architecture'
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-[#0B2545]'
              }`}
            >
              Topology
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'security'
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-[#0B2545]'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'api'
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-[#0B2545]'
              }`}
            >
              API Contracts
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'database'
                  ? 'bg-white text-[#0B2545] shadow-xs'
                  : 'text-slate-600 hover:text-[#0B2545]'
              }`}
            >
              Database
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'architecture' && (
            <div className="space-y-5 text-xs text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-[#DFE7EF] bg-slate-50/60 space-y-2">
                  <div className="flex items-center gap-2 text-[#1565C0] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#1565C0]" />
                    Frontend & Edge
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Next.js 15 App Router with React Server Components, Tailwind CSS, Vercel Edge Network, and CDN caching.
                  </p>
                  <div className="font-mono text-[11px] text-slate-500 pt-1">
                    Latency: &lt; 50ms edge TTFB
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#DFE7EF] bg-slate-50/60 space-y-2">
                  <div className="flex items-center gap-2 text-[#1FA9A2] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#1FA9A2]" />
                    Application Core
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Stateless API routes, edge middleware authentication, and asynchronous job queuing via n8n workflows.
                  </p>
                  <div className="font-mono text-[11px] text-slate-500 pt-1">
                    Runtime: Node.js 20 LTS / Edge
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#DFE7EF] bg-slate-50/60 space-y-2">
                  <div className="flex items-center gap-2 text-[#0B2545] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#0B2545]" />
                    Data & Persistence
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Supabase PostgreSQL 15, Row Level Security (RLS), immutable audit ledgers, and automated daily backups.
                  </p>
                  <div className="font-mono text-[11px] text-slate-500 pt-1">
                    Storage: Encrypted block storage
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200">
                <span className="font-bold text-[#0B2545] block mb-1">Infrastructure Isolation Guarantee</span>
                <p className="text-slate-600 leading-relaxed">
                  Every client engagement runs in an isolated workspace with tenant identifiers strictly enforced in database policies. 
                  Zero cross-tenant data leakage is cryptographically guaranteed by PostgreSQL session-variable policies.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
                  <span className="font-bold text-emerald-900 block mb-1">Data In Transit & At Rest</span>
                  <p className="text-emerald-800 leading-relaxed">
                    TLS 1.3 encryption for all HTTP/WebSocket traffic. AES-256 GCM encryption at rest for all database tables, backups, and S3/Supabase storage objects.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40">
                  <span className="font-bold text-blue-900 block mb-1">Super Admin Role Gate</span>
                  <p className="text-blue-800 leading-relaxed">
                    Client company names, GSTIN, verified banking details, and stage unlock overrides are strictly locked behind multi-factor authenticated Super Admin permissions.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40">
                  <span className="font-bold text-purple-900 block mb-1">Immutable Audit Ledger</span>
                  <p className="text-purple-800 leading-relaxed">
                    All stage transitions, proposal acceptances, identity change requests, and payment reports produce append-only audit records with client IP, timestamp, and signature hashes.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40">
                  <span className="font-bold text-amber-900 block mb-1">Zero Raw Credentials</span>
                  <p className="text-amber-800 leading-relaxed">
                    Zero client secrets or API keys are stored in plain text. Environment secrets are injected via encrypted runtime secret managers (Vercel KMS / Supabase Vault).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Core API endpoints defined in the technical specification baseline:
              </p>
              <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-[11px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Method</th>
                      <th className="p-2.5">Endpoint</th>
                      <th className="p-2.5">Scope</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr>
                      <td className="p-2.5 text-blue-600 font-bold">GET</td>
                      <td className="p-2.5">/api/engagements/[ref]</td>
                      <td className="p-2.5 text-slate-500">Client / Read</td>
                      <td className="p-2.5 text-slate-700">Fetches 13-stage status and active document references</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-amber-600 font-bold">POST</td>
                      <td className="p-2.5">/api/engagements/identity-correction</td>
                      <td className="p-2.5 text-slate-500">Client / Untrusted</td>
                      <td className="p-2.5 text-slate-700">Queues identity change proposal for Super Admin review</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-emerald-600 font-bold">POST</td>
                      <td className="p-2.5">/api/engagements/[ref]/stages/[stageKey]</td>
                      <td className="p-2.5 text-slate-500">Client / Write</td>
                      <td className="p-2.5 text-slate-700">Submits verified stage action and records audit hash</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-purple-600 font-bold">PATCH</td>
                      <td className="p-2.5">/api/admin/engagements/verify-stage</td>
                      <td className="p-2.5 text-slate-500">Super Admin Only</td>
                      <td className="p-2.5 text-slate-700">Reconciles bank funds and unlocks subsequent stage</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Core relational entities managed in Supabase PostgreSQL:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-[#0B2545]">client_engagements</span>
                  <div className="text-slate-500 text-[10px]">
                    id (uuid) · engagement_ref (text, unique) · company_name · current_stage (text) · status (text) · created_at
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-[#0B2545]">engagement_stages</span>
                  <div className="text-slate-500 text-[10px]">
                    id (uuid) · engagement_id (fk) · stage_key (text) · ordinal (int 1-13) · status · prerequisites_met · updated_at
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-[#0B2545]">engagement_stage_events</span>
                  <div className="text-slate-500 text-[10px]">
                    id (uuid) · stage_id (fk) · event_type · actor_role · payload (jsonb) · created_at (immutable ledger)
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-[#0B2545]">client_identity_change_requests</span>
                  <div className="text-slate-500 text-[10px]">
                    id (uuid) · engagement_id · proposed_changes (jsonb) · status (pending/approved/rejected) · reviewed_by
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="border-t border-[#DFE7EF] p-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href={`/engagement/${engagementRef}`}
            className="text-xs text-[#52677C] hover:text-[#0B2545] font-medium"
          >
            ← Back to Visit All Stages
          </Link>

          {hasConfirmedArchitecture ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Architecture Baseline Confirmed
                </span>
                {auditHash && (
                  <div className="font-mono text-[10px] text-slate-500">
                    Audit SHA-256: <span className="text-[#0B2545] font-bold">{auditHash.slice(0, 16)}...</span>
                  </div>
                )}
              </div>
              <Link
                href={`/engagement/${engagementRef}/development`}
                className="px-4 py-2 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
              >
                Proceed to Stage 09: Development & Sprint Milestones →
              </Link>
            </div>
          ) : (
            <button
              onClick={handleApproveSpec}
              disabled={isApproving}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              {isApproving ? (
                <span>Recording Technical Assent...</span>
              ) : (
                <>
                  <span>Confirm Architecture Specification Baseline</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
