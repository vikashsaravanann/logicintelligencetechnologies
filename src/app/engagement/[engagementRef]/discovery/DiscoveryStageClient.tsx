'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface DiscoveryStageClientProps {
  engagementRef: string;
  companyName: string;
}

export default function DiscoveryStageClient({ engagementRef, companyName }: DiscoveryStageClientProps) {
  const [meetingDate, setMeetingDate] = useState('2026-10-20');
  const [meetingTime, setMeetingTime] = useState('14:30');
  const [technicalAnswers, setTechnicalAnswers] = useState({
    cloudProvider: 'GCP (Google Cloud Platform) + Vercel Enterprise',
    databasePreference: 'Supabase PostgreSQL + pgvector (Managed)',
    complianceReqs: 'HIPAA compliant PHI data isolation, MSME statutory alignment',
    ehrIntegrations: 'FHIR API / HL7 standard endpoints for hospital lab and pharmacy sync',
    aiRequirements: 'Groq LPU high-throughput inference with local RAG embeddings',
  });
  const [customNote, setCustomNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
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

        {isSaved ? (
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-4 rounded-xl text-xs text-[#065F46] space-y-2">
            <p className="font-semibold">✓ Clarifications Logged Successfully</p>
            <p>
              Your notes and meeting slot have been recorded. Technical lead will incorporate these into Stage 3 Commercial Proposal.
            </p>
            <Link
              href={`/engagement/${engagementRef}/proposal`}
              className="inline-block mt-2 bg-[#065F46] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#044e39]"
            >
              Proceed to Stage 3 Commercial Proposal →
            </Link>
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Time (IST)</label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
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
                className="bg-[#0B2545] hover:bg-[#1565C0] text-white px-5 py-2.5 rounded-xl font-semibold shadow-xs transition-colors"
              >
                Save & Acknowledge Discovery Baseline →
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
