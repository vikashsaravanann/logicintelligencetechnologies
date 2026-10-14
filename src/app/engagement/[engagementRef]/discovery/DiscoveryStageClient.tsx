'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface DiscoveryStageClientProps {
  engagementRef: string;
  companyName: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
}

export default function DiscoveryStageClient({
  engagementRef,
  companyName,
  initialStatus = 'available',
  initialData = {},
}: DiscoveryStageClientProps) {
  const [meetingDate, setMeetingDate] = useState(initialData?.meetingDate || '2026-10-20');
  const [meetingTime, setMeetingTime] = useState(initialData?.meetingTime || '14:30');
  const [technicalAnswers, setTechnicalAnswers] = useState(
    initialData?.technicalAnswers || {
      cloudProvider: 'GCP (Google Cloud Platform) + Vercel Enterprise',
      databasePreference: 'Supabase PostgreSQL + pgvector (Managed)',
      complianceReqs: 'HIPAA compliant PHI data isolation, MSME statutory alignment',
      ehrIntegrations: 'FHIR API / HL7 standard endpoints for hospital lab and pharmacy sync',
      aiRequirements: 'Groq LPU high-throughput inference with local RAG embeddings',
    }
  );
  const [customNote, setCustomNote] = useState(initialData?.customNote || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(['completed', 'under_review', 'approved'].includes(initialStatus));
  const [auditHash, setAuditHash] = useState<string | null>(initialData?.last_audit_hash || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge_discovery',
          payload: {
            meetingDate,
            meetingTime,
            customNote,
            technicalAnswers,
            acknowledgedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record discovery acknowledgment');
      }

      setIsSaved(true);
      setAuditHash(data.auditHash);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting discovery notes';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Discovery Findings Card */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#0B2545]">Technical Architecture Baseline & Scoping Minutes</h2>
          <p className="text-xs text-[#52677C] mt-1">
            Official engineering review and scope decisions prepared by Logic Intelligence Technologies for {companyName}.
          </p>
        </div>

        {/* Discovery Q&A Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
            <span className="font-semibold text-slate-500 uppercase text-[10px]">Primary Hosting Environment</span>
            <p className="font-bold text-slate-800">{technicalAnswers.cloudProvider}</p>
            <p className="text-slate-500 text-[11px]">Multi-region latency &lt; 50ms, Edge SSR enabled.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
            <span className="font-semibold text-slate-500 uppercase text-[10px]">Database Architecture</span>
            <p className="font-bold text-slate-800">{technicalAnswers.databasePreference}</p>
            <p className="text-slate-500 text-[11px]">Row Level Security (RLS) forced, automated point-in-time recovery.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
            <span className="font-semibold text-slate-500 uppercase text-[10px]">Compliance & Data Security</span>
            <p className="font-bold text-slate-800">{technicalAnswers.complianceReqs}</p>
            <p className="text-slate-500 text-[11px]">Zero-PHI outbound rule, encrypted client document storage.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
            <span className="font-semibold text-slate-500 uppercase text-[10px]">AI Inference & Knowledge RAG</span>
            <p className="font-bold text-slate-800">{technicalAnswers.aiRequirements}</p>
            <p className="text-slate-500 text-[11px]">Sub-200ms TTFT, strictly domain-isolated memory boundaries.</p>
          </div>
        </div>

        {/* Meeting Minutes & Technical Review */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <h3 className="text-sm font-bold text-[#0B2545]">Reviewed Technical Findings & Assumptions</h3>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
            <li>Production domain configuration will target client apex and CDN edge.</li>
            <li>Zero automated payment gateways will be used; all settlements routed through audited manual UPI clearance.</li>
            <li>All authoritative identity and master contracts require Super Admin manual signature verification.</li>
            <li>Out of Scope for initial phase: Legacy on-premise mainframe sync without REST/FHIR bridge.</li>
          </ul>
        </div>
      </div>

      {/* Client Clarification & Meeting Form */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#0B2545] mb-4">Submit Technical Clarification or Meeting Availability</h3>

        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {isSaved ? (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-5 rounded-xl text-xs text-[#065F46] space-y-3">
            <p className="font-semibold text-sm">✓ Clarifications & Technical Baseline Formally Acknowledged</p>
            <p>
              Your notes and preferred meeting slot have been logged. Stage 03 Commercial Proposal is ready for review.
            </p>
            {auditHash && (
              <p className="font-mono text-[11px] text-slate-600 bg-white/70 p-2 rounded border border-emerald-200">
                Audit Digest: {auditHash}
              </p>
            )}
            <div className="pt-2 flex items-center gap-3">
              <Link
                href={`/engagement/${engagementRef}/proposal`}
                className="inline-block bg-[#065F46] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#044e39] transition-colors"
              >
                Proceed to Stage 3 Commercial Proposal →
              </Link>
              <button
                type="button"
                onClick={() => setIsSaved(false)}
                className="text-xs text-slate-600 hover:text-slate-900 underline"
              >
                Edit Notes
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Meeting Date</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Time (IST)</label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Technical Clarifications / Architecture Questions
              </label>
              <textarea
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Clarify specific endpoint schemas, database sizing, concurrency estimates, or internal security requirements..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0B2545] hover:bg-[#1565C0] text-white px-5 py-2.5 rounded-xl font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Saving Baseline...' : 'Save & Acknowledge Discovery Baseline →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
