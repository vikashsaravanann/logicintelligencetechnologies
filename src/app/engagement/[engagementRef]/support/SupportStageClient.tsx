'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StageDocumentCard from '../components/StageDocumentCard';

interface SupportStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
  document?: any;
}

export default function SupportStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail,
  initialStatus = 'available',
  initialData = {},
  document,
}: SupportStageClientProps) {
  const [ticketSubject, setTicketSubject] = useState('');
  const [severity, setSeverity] = useState<'P1' | 'P2' | 'P3'>('P2');
  const [component, setComponent] = useState('Frontend Web Portal');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [auditHash, setAuditHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const slaTiers = [
    {
      tier: 'P1 · Critical Outage',
      response: '< 1 Hour',
      coverage: '24/7/365 Dedicated Response',
      scope: 'Total platform downtime, severe data loss risk, or payment system outage.',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      tier: 'P2 · Major Degradation',
      response: '< 4 Hours',
      coverage: 'Business Hours (9 AM - 8 PM IST)',
      scope: 'Core feature impaired with no immediate workaround, partial integration drop.',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      tier: 'P3 · Minor Inquiry / Fix',
      response: '< 24 Hours',
      coverage: 'Business Hours',
      scope: 'UI cosmetic adjustments, general questions, minor configuration tweaks.',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !description.trim()) {
      setErrorMessage('Please provide an incident subject and detailed description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const generatedId = `TKT-LIT-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_ticket',
          payload: {
            ticketId: generatedId,
            subject: ticketSubject.trim(),
            severity,
            component,
            description: description.trim(),
            contactEmail,
            companyName,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch incident ticket.');
      }

      setTicketId(generatedId);
      setAuditHash(data.auditHash);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while logging support incident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Master PDF Card */}
      <StageDocumentCard
        documentRef={document?.master_id ? `${document.master_id}-Maintenance-Support-Agreement.pdf` : 'LIT-07-Maintenance-Support-Agreement.pdf'}
        title={document?.document_title || 'LIT-07 Maintenance & Support Agreement Master'}
        description="Official post-launch service level agreement establishing guaranteed response times, bug remediation protocols, and quarterly security audits."
        documentMasterPath={document?.file_url || '/assets/docs/masters/LIT-07-Maintenance-Support-Agreement.pdf'}
        version={document?.version_label || 'v2.1 (Active Support Standard)'}
        status="active"
      />

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* SLA Tiers Table */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#0B2545]">
            Active SLA Response Matrix
          </h3>
          <p className="text-xs text-[#52677C]">
            Guaranteed service tiers under your enterprise maintenance plan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slaTiers.map((tier, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${tier.badgeColor}`}>
                  {tier.tier}
                </span>
                <span className="font-mono text-xs font-bold text-[#0B2545]">
                  {tier.response}
                </span>
              </div>
              <div className="text-[11px] text-[#1565C0] font-semibold">
                {tier.coverage}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {tier.scope}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Submission Form */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs">
        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900">
                Support Ticket Logged: {ticketId}
              </h3>
              <p className="text-xs text-emerald-700 max-w-lg mx-auto mt-1 leading-relaxed">
                Your incident has been dispatched to our engineering on-call rotation. 
                You will receive updates directly at <strong>{contactEmail}</strong> per your SLA response guarantee.
              </p>
              {auditHash && (
                <div className="font-mono text-[10px] text-emerald-900 mt-2">
                  Cryptographic Audit Digest: <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-bold">{auditHash}</code>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setTicketSubject('');
                setDescription('');
              }}
              className="text-xs text-[#1565C0] font-semibold hover:underline"
            >
              Log another ticket
            </button>
          </div>
        ) : (
          <form onSubmit={handleTicketSubmit} className="space-y-5 text-xs">
            <div className="border-b border-[#DFE7EF] pb-3">
              <h3 className="text-base font-bold text-[#0B2545]">
                Submit Priority Support Incident
              </h3>
              <p className="text-xs text-[#52677C] mt-0.5">
                Our support engineers monitor incoming tickets with real-time alerting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Incident Severity *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white"
                >
                  <option value="P1">P1 · Critical (System Down / Blocker - 1h Response)</option>
                  <option value="P2">P2 · Major (Feature Impaired - 4h Response)</option>
                  <option value="P3">P3 · Minor (Cosmetic / Inquiry - 24h Response)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Affected Component *
                </label>
                <select
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white"
                >
                  <option value="Frontend Web Portal">Frontend Web Portal</option>
                  <option value="Authentication & Login">Authentication & Login</option>
                  <option value="Database / API Services">Database / API Services</option>
                  <option value="PDF Generation & Invoicing">PDF Generation & Invoicing</option>
                  <option value="Automation / n8n Workflows">Automation / n8n Workflows</option>
                  <option value="Custom Domain & DNS">Custom Domain & DNS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1">
                Incident Subject *
              </label>
              <input
                type="text"
                placeholder="Brief summary of the issue..."
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1">
                Description & Steps to Reproduce *
              </label>
              <textarea
                rows={4}
                placeholder="Include URL, error messages, user impact, and steps to reproduce..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#DFE7EF]">
              <Link
                href={`/engagement/${engagementRef}`}
                className="text-xs text-[#52677C] hover:text-[#0B2545] font-medium"
              >
                ← Back to Visit All Stages
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Dispatching Ticket...</span>
                ) : (
                  <>
                    <span>Submit Support Ticket</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Emergency Escalation Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div>
          <span className="font-bold text-[#0B2545] block">Founder Escalation Channel</span>
          <span>For urgent production emergencies impacting business operations:</span>
        </div>
        <a
          href="mailto:hello@logicintelligencetechnologies.in?subject=URGENT%20P1%20Escalation"
          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-black transition-colors shrink-0"
        >
          hello@logicintelligencetechnologies.in
        </a>
      </div>
    </div>
  );
}
