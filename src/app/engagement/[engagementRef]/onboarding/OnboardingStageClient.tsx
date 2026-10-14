'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StageDocumentCard from '../components/StageDocumentCard';

interface OnboardingStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
}

export default function OnboardingStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail,
  initialStatus = 'available',
  initialData = {},
}: OnboardingStageClientProps) {
  const [techLeadName, setTechLeadName] = useState(initialData?.techLeadName || contactName);
  const [techLeadEmail, setTechLeadEmail] = useState(initialData?.techLeadEmail || contactEmail);
  const [techLeadPhone, setTechLeadPhone] = useState(initialData?.techLeadPhone || '+91 ');
  const [timezone, setTimezone] = useState(initialData?.timezone || 'Asia/Kolkata (IST)');
  const [cloudProviders, setCloudProviders] = useState<string[]>(
    initialData?.cloudProviders || ['Vercel', 'Supabase']
  );
  const [githubOrg, setGithubOrg] = useState(initialData?.githubOrg || '');
  const [domainName, setDomainName] = useState(initialData?.domainName || '');
  const [dnsProvider, setDnsProvider] = useState(initialData?.dnsProvider || 'Cloudflare');
  const [kickoffDate, setKickoffDate] = useState(initialData?.kickoffDate || '2026-10-20');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(
    ['submitted', 'completed', 'verified', 'approved'].includes(initialStatus)
  );
  const [auditHash, setAuditHash] = useState<string | null>(initialData?.last_audit_hash || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableClouds = ['AWS', 'Google Cloud (GCP)', 'Vercel', 'Supabase', 'Cloudflare', 'Azure'];

  const toggleCloud = (provider: string) => {
    if (cloudProviders.includes(provider)) {
      setCloudProviders(cloudProviders.filter((p) => p !== provider));
    } else {
      setCloudProviders([...cloudProviders, provider]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_onboarding',
          payload: {
            techLeadName,
            techLeadEmail,
            techLeadPhone,
            timezone,
            cloudProviders,
            githubOrg,
            domainName,
            dnsProvider,
            kickoffDate,
            notes,
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit technical onboarding');
      }

      setIsSubmitted(true);
      setAuditHash(data.auditHash);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting onboarding details';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Master PDF Card */}
      <StageDocumentCard
        title="Client Technical Onboarding & Systems Guide"
        filename="LIT-03-Client-Onboarding-Guide.pdf"
        versionLabel="v1.0"
        fileUrl="/assets/docs/masters/LIT-03-Client-Onboarding-Guide.pdf"
        fileSizeBytes={598441}
        sha256="b2c3d4e5...onb"
      />

      {/* Credential-Free Access Notice */}
      <div className="bg-[#E7F3FF] border border-[#B9DCFF] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#0B2545]">
        <svg className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <div>
          <span className="font-bold block">Strict Credential-Free Access Policy (Zero Raw Passwords)</span>
          <p className="mt-1 text-slate-600 leading-relaxed">
            Logic Intelligence Technologies engineers will <strong>never</strong> ask for your raw passwords, root credentials, or multi-factor SMS codes. 
            All environment access is delegated via least-privilege IAM roles, GitHub organization team invites, scoped deploy keys, or temporary SSO invites.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {isSubmitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">
              Technical Onboarding Intake Received & Logged
            </h3>
            <p className="text-xs text-emerald-700 max-w-lg mx-auto mt-1 leading-relaxed">
              Our engineering team has received your infrastructure details and contact preferences. 
              The technical kickoff session is queued and Stage 08 (Technical Specification) is now ready.
            </p>
            {auditHash && (
              <p className="font-mono text-[11px] text-emerald-800 bg-white/70 p-2 rounded border border-emerald-200 max-w-md mx-auto mt-2 break-all">
                Audit Digest: {auditHash}
              </p>
            )}
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/engagement/${engagementRef}/technical-spec`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
            >
              <span>Proceed to Stage 08: Technical Specification</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-emerald-800 hover:text-emerald-950 underline"
            >
              Modify Intake Responses
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">
              Technical Delegation & Stakeholder Roster
            </h3>
            <p className="text-xs text-[#52677C] mt-1">
              Provide contacts for your engineering liaison and environment coordinators for {companyName}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                Technical Lead / Contact Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={techLeadName}
                onChange={(e) => setTechLeadName(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                Technical Lead Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={techLeadEmail}
                onChange={(e) => setTechLeadEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                Emergency Phone / Escalation Contact
              </label>
              <input
                type="tel"
                value={techLeadPhone}
                onChange={(e) => setTechLeadPhone(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                Primary Team Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
            </div>
          </div>

          {/* Infrastructure Environment Details */}
          <div className="border-t border-[#DFE7EF] pt-5 space-y-4 text-xs">
            <h4 className="text-sm font-bold text-[#0B2545]">
              Target Cloud Platforms & Git Repositories
            </h4>

            <div>
              <label className="block font-medium text-[#0B2545] mb-2">
                Target Cloud & Managed Services
              </label>
              <div className="flex flex-wrap gap-2">
                {availableClouds.map((cloud) => {
                  const isChecked = cloudProviders.includes(cloud);
                  return (
                    <button
                      key={cloud}
                      type="button"
                      onClick={() => toggleCloud(cloud)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-[#E7F3FF] border-[#1565C0] text-[#1565C0]'
                          : 'bg-white border-[#DFE7EF] text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}{cloud}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[#0B2545] mb-1.5">
                  GitHub Organization / Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. apex-meridian"
                  value={githubOrg}
                  onChange={(e) => setGithubOrg(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0B2545] mb-1.5">
                  Production Domain Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. platform.apexmeridian.com"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[#0B2545] mb-1.5">
                  DNS Management Provider
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cloudflare, Route53, GoDaddy, Namecheap"
                  value={dnsProvider}
                  onChange={(e) => setDnsProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0B2545] mb-1.5">
                  Preferred Kickoff Meeting Date
                </label>
                <input
                  type="date"
                  value={kickoffDate}
                  onChange={(e) => setKickoffDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] text-xs mb-1.5">
                Specific Constraints or Security Requirements
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Specific VPC peering required, HIPAA BAA required, specific geographic region residency (India-only, US-only)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
            </div>
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
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting Onboarding Details...</span>
              ) : (
                <>
                  <span>Submit Technical Intake & Request Kickoff</span>
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
  );
}
