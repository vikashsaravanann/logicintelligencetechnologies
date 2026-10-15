'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Copy,
  Check,
  Mail,
  Send,
  ExternalLink,
  Plus,
  Loader2,
  ShieldCheck,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileEdit,
} from 'lucide-react';
import { ClientEngagement, ClientIdentityChangeRequest } from '@/lib/engagements/types';
import { generatePortalEmailCopyText } from '@/lib/engagements/share';
import { IssueEngagementModal } from './components/IssueEngagementModal';

interface EngagementsAdminClientProps {
  initialEngagements: ClientEngagement[];
  initialIdentityRequests: ClientIdentityChangeRequest[];
}

export default function EngagementsAdminClient({
  initialEngagements,
  initialIdentityRequests,
}: EngagementsAdminClientProps) {
  const [engagements, setEngagements] = useState<ClientEngagement[]>(initialEngagements);
  const [identityRequests, setIdentityRequests] = useState<ClientIdentityChangeRequest[]>(initialIdentityRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingReqId, setProcessingReqId] = useState<string | null>(null);

  // Per-engagement action feedback
  const [copiedLinkRef, setCopiedLinkRef] = useState<string | null>(null);
  const [copiedEmailRef, setCopiedEmailRef] = useState<string | null>(null);
  const [sendingEmailRef, setSendingEmailRef] = useState<string | null>(null);
  const [sentRefs, setSentRefs] = useState<Set<string>>(new Set());
  const [emailNotice, setEmailNotice] = useState<{ ref: string; message: string; success: boolean } | null>(null);

  const filteredEngagements = engagements.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.company_name.toLowerCase().includes(q) ||
      e.engagement_ref.toLowerCase().includes(q) ||
      (e.contact_name && e.contact_name.toLowerCase().includes(q))
    );
  });

  const handleIdentityAction = async (requestId: string, action: 'approve' | 'reject') => {
    setProcessingReqId(requestId);
    try {
      const res = await fetch('/api/engagements/identity-correction', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status: action === 'approve' ? 'approved' : 'rejected',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIdentityRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r))
        );
        const req = identityRequests.find((r) => r.id === requestId);
        if (action === 'approve' && req && req.engagement_id && req.target_field === 'company_name') {
          setEngagements((prev) =>
            prev.map((eng) =>
              eng.id === req.engagement_id ? { ...eng, company_name: req.proposed_value } : eng
            )
          );
        }
      } else {
        alert(data.error || 'Failed to update identity change request.');
      }
    } catch {
      alert('Network error updating identity change request.');
    } finally {
      setProcessingReqId(null);
    }
  };

  const handleCopyLink = (eng: ClientEngagement) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.logicintelligencetechnologies.in';
    const portalUrl = `${origin}/engagement/${eng.engagement_ref}`;
    navigator.clipboard.writeText(portalUrl);
    setCopiedLinkRef(eng.engagement_ref);
    setTimeout(() => setCopiedLinkRef(null), 2500);
  };

  const handleCopyEmail = (eng: ClientEngagement) => {
    const text = generatePortalEmailCopyText(eng);
    navigator.clipboard.writeText(text);
    setCopiedEmailRef(eng.engagement_ref);
    setTimeout(() => setCopiedEmailRef(null), 2500);
  };

  const handleSendEmail = async (eng: ClientEngagement) => {
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
          message: `Portal invitation dispatched to ${eng.contact_email}`,
          success: true,
        });
      } else {
        setEmailNotice({
          ref: eng.engagement_ref,
          message: `Failed: ${data.message || 'Error dispatching email'}`,
          success: false,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to trigger email';
      setEmailNotice({
        ref: eng.engagement_ref,
        message: msg,
        success: false,
      });
    } finally {
      setSendingEmailRef(null);
    }
  };

  const handleEngagementCreated = (newEng: ClientEngagement) => {
    setEngagements((prev) => [newEng, ...prev.filter((e) => e.id !== newEng.id)]);
  };

  const pendingRequests = identityRequests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DFE7EF] shadow-xs">
          <span className="text-xs font-semibold text-[#52677C]">Active Engagements</span>
          <div className="text-2xl font-bold text-[#0B2545] mt-1">{engagements.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium">100% In-Flight</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DFE7EF] shadow-xs">
          <span className="text-xs font-semibold text-[#52677C]">Client Lifecycle Stages</span>
          <div className="text-2xl font-bold text-[#1565C0] mt-1">13 Stages</div>
          <span className="text-[11px] text-slate-500">Universal Master Schema</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DFE7EF] shadow-xs">
          <span className="text-xs font-semibold text-[#52677C]">Identity Change Queue</span>
          <div className={`text-2xl font-bold mt-1 ${pendingRequests.length > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
            {pendingRequests.length} Pending
          </div>
          <span className="text-[11px] text-slate-500">Super-Admin Protected</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DFE7EF] shadow-xs">
          <span className="text-xs font-semibold text-[#52677C]">Manual UPI Verification</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">2 Milestones</div>
          <span className="text-[11px] text-slate-500">Stages 06 &amp; 11 (50% / 50%)</span>
        </div>
      </div>

      {/* Identity Change Requests Review Queue (Super-Admin Security Gate) */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Identity Correction Review Queue ({pendingRequests.length} Pending)</span>
            </div>
            <span className="text-[11px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
              Super-Admin Authorization Required
            </span>
          </div>

          <p className="text-xs text-amber-800 leading-relaxed">
            Per company security policy, clients cannot directly overwrite authoritative legal entity names, GSTIN, or billing addresses. 
            Review the submitted request below before authorizing modification.
          </p>

          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white border border-amber-200 rounded-xl p-4 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="font-bold text-[#0B2545]">
                    Field: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">{req.target_field}</code>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Requested by: <strong>{req.requested_by}</strong> · {new Date(req.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Current Authoritative Value:</span>
                    <span className="text-[#0B2545] font-semibold">{req.current_value}</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                    <span className="text-[11px] text-emerald-700 font-medium block">Proposed Client Value:</span>
                    <span className="text-emerald-900 font-bold">{req.proposed_value}</span>
                  </div>
                </div>

                <div className="text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-[11px] text-slate-500 font-medium block">Client Stated Justification:</span>
                  <span>{req.change_reason}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleIdentityAction(req.id, 'reject')}
                    disabled={processingReqId === req.id}
                    className="px-3 py-1.5 border border-slate-300 hover:border-red-400 text-slate-600 hover:text-red-700 rounded-lg font-medium transition-colors"
                  >
                    Reject Modification
                  </button>
                  <button
                    onClick={() => handleIdentityAction(req.id, 'approve')}
                    disabled={processingReqId === req.id}
                    className="px-4 py-1.5 bg-[#1565C0] hover:bg-[#0B2545] text-white rounded-lg font-semibold transition-colors shadow-xs"
                  >
                    {processingReqId === req.id ? 'Processing...' : 'Authorize & Update Record'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagements Directory Header & Search */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">
              Active Client Engagements
            </h3>
            <p className="text-xs text-[#52677C]">
              Enterprise contracts managed under the 13-stage lifecycle engine.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by company or ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-xl text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <IssueEngagementModal onCreated={handleEngagementCreated} />
              <Link
                href="/admin/engagements/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#DFE7EF] hover:border-[#1565C0] text-xs font-semibold text-[#0B2545] rounded-xl transition-colors bg-white shadow-xs shrink-0"
              >
                <span>Full Form</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Global Notice if email was sent */}
        {emailNotice && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 ${
              emailNotice.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {emailNotice.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>
                <strong>{emailNotice.ref}:</strong> {emailNotice.message}
              </span>
            </div>
            <button
              onClick={() => setEmailNotice(null)}
              className="text-xs font-bold hover:underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Engagements List */}
        <div className="space-y-4">
          {filteredEngagements.map((eng) => {
            const isCopiedLink = copiedLinkRef === eng.engagement_ref;
            const isCopiedEmail = copiedEmailRef === eng.engagement_ref;
            const isSendingEmail = sendingEmailRef === eng.engagement_ref;

            return (
              <div
                key={eng.id}
                className="border border-[#DFE7EF] rounded-xl p-5 hover:border-[#B9DCFF] transition-all bg-white space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1565C0] bg-[#E7F3FF] px-2.5 py-0.5 rounded">
                        {eng.engagement_ref}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {eng.status}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[#0B2545]">
                      {eng.company_name}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {eng.project_title}
                    </p>
                  </div>

                  {/* Action Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                    {/* Inspect Button - EXACTLY matching Proposal Creation */}
                    <Link
                      href={`/admin/engagements/${eng.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs"
                      title="Inspect Engagement Lifecycle & Milestones"
                    >
                      <FileEdit className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
                      <span>Inspect</span>
                    </Link>

                    {/* Dispatch Button - EXACTLY matching Proposal Creation */}
                    <button
                      type="button"
                      onClick={() => handleSendEmail(eng)}
                      disabled={isSendingEmail || sentRefs.has(eng.engagement_ref)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs ${
                        sentRefs.has(eng.engagement_ref)
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] disabled:opacity-50"
                      }`}
                      title={`Dispatch client portal invitation to ${eng.contact_email}`}
                    >
                      {isSendingEmail ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : sentRefs.has(eng.engagement_ref) ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Send className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
                      )}
                      <span>
                        {isSendingEmail ? "Sending…" : sentRefs.has(eng.engagement_ref) ? "Dispatched" : "Dispatch"}
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

                    {/* Copy Link Utility */}
                    <button
                      onClick={() => handleCopyLink(eng)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 border border-[#DFE7EF] text-[11px] font-semibold text-[#0B2545] hover:border-[#1565C0] hover:text-[#1565C0] rounded-lg transition-colors bg-white shadow-2xs"
                      title="Copy public client portal access link"
                    >
                      {isCopiedLink ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500" />
                      )}
                      <span>{isCopiedLink ? 'Copied' : 'Link'}</span>
                    </button>

                    {/* Copy Email Utility */}
                    <button
                      onClick={() => handleCopyEmail(eng)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 border border-[#DFE7EF] text-[11px] font-semibold text-[#0B2545] hover:border-[#1565C0] hover:text-[#1565C0] rounded-lg transition-colors bg-white shadow-2xs"
                      title="Copy complete formatted client invitation email"
                    >
                      {isCopiedEmail ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Mail className="w-3 h-3 text-slate-500" />
                      )}
                      <span>{isCopiedEmail ? 'Copied' : 'Email'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Details */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0B2545]">
                      Lifecycle Milestone Progress
                    </span>
                    <span className="text-[#1565C0] font-bold">
                      Stage 06 of 13 (46% Completed)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-[#1565C0] to-[#1FA9A2] rounded-full transition-all duration-500 w-[46%]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Primary Contact:</span>
                      <span className="font-medium text-[#0B2545]">{eng.contact_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Email / Phone:</span>
                      <span className="font-medium text-[#0B2545]">
                        {eng.contact_email} {eng.contact_phone ? `· ${eng.contact_phone}` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Contract Value:</span>
                      <span className="font-medium text-emerald-700 font-mono">
                        {(eng.metadata?.budget_range as string) || '₹21,24,000.00 (Total SOW)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
