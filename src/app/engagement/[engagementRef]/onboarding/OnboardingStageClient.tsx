'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StageDocumentCard from '../components/StageDocumentCard';

interface OnboardingStageClientProps {
  engagementRef: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
}

export default function OnboardingStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail,
}: OnboardingStageClientProps) {
  const [techLeadName, setTechLeadName] = useState(contactName);
  const [techLeadEmail, setTechLeadEmail] = useState(contactEmail);
  const [techLeadPhone, setTechLeadPhone] = useState('+91 ');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [cloudProviders, setCloudProviders] = useState(['Vercel', 'Supabase']);
  const [githubOrg, setGithubOrg] = useState('');
  const [domainName, setDomainName] = useState('');
  const [dnsProvider, setDnsProvider] = useState('Cloudflare');
  const [kickoffDate, setKickoffDate] = useState('2026-10-20');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableClouds = ['AWS', 'Google Cloud (GCP)', 'Vercel', 'Supabase', 'Cloudflare', 'Azure'];

  const toggleCloud = (provider: string) => {
    if (cloudProviders.includes(provider)) {
      setCloudProviders(cloudProviders.filter((p) => p !== provider));
    } else {
      setCloudProviders([...cloudProviders, provider]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Official Master PDF Card */}
      <StageDocumentCard
        documentRef="LIT-03-Client-Onboarding-Guide.pdf"
        title="LIT-03 Client Onboarding Guide"
        description="Official Logic Intelligence Technologies guide for kickoff milestones, credential-free technical delegation, communications charter, and delivery rituals."
        documentMasterPath="/assets/docs/masters/LIT-03-Client-Onboarding-Guide.pdf"
        version="v2.4 (Verified)"
        status="active"
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

      {isSubmitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">
              Technical Onboarding Intake Received
            </h3>
            <p className="text-xs text-emerald-700 max-w-lg mx-auto mt-1 leading-relaxed">
              Our engineering team has received your infrastructure details and contact preferences. 
              The technical kickoff session is queued and Stage 08 (Technical Specification) will unlock upon verification.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/engagement/${engagementRef}/technical-spec`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
            >
              Proceed to Stage 08: Technical Specification
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DFE7EF] pb-4">
            <h3 className="text-base font-bold text-[#0B2545]">
              Technical Intake & Kickoff Questionnaire
            </h3>
            <p className="text-xs text-[#52677C] mt-1">
              Please provide the primary technical points of contact and target environment architecture for {companyName}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                Technical Lead / Main Liaison *
              </label>
              <input
                type="text"
                value={techLeadName}
                onChange={(e) => setTechLeadName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                Technical Lead Email *
              </label>
              <input
                type="email"
                value={techLeadEmail}
                onChange={(e) => setTechLeadEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                Direct Contact Phone / WhatsApp
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
                Operating Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0] bg-white"
              >
                <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST · UTC+5:30)</option>
                <option value="America/New_York (EST)">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London (GMT/BST)">Europe/London (GMT/BST)</option>
                <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT · UTC+8)</option>
                <option value="Asia/Dubai (GST)">Asia/Dubai (GST · UTC+4)</option>
              </select>
            </div>
          </div>

          {/* Cloud Environments */}
          <div className="space-y-2 pt-2">
            <label className="block font-medium text-xs text-[#0B2545]">
              Target Cloud Infrastructure & Runtime Providers
            </label>
            <div className="flex flex-wrap gap-2">
              {availableClouds.map((cloud) => {
                const isSelected = cloudProviders.includes(cloud);
                return (
                  <button
                    type="button"
                    key={cloud}
                    onClick={() => toggleCloud(cloud)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-[#1565C0] text-white border-[#1565C0]'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {cloud}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Repository & Domain Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs pt-2">
            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                GitHub Organization or Existing Repository Handle
              </label>
              <input
                type="text"
                placeholder="e.g. github.com/client-org"
                value={githubOrg}
                onChange={(e) => setGithubOrg(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                We will request scoped collaborator or team invite.
              </span>
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                Target Production Domain
              </label>
              <input
                type="text"
                placeholder="e.g. app.clientdomain.com"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
                className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1565C0]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                SSL certificates and DNS records will be prepared for this domain.
              </span>
            </div>

            <div>
              <label className="block font-medium text-[#0B2545] mb-1.5">
                DNS Registrar / Provider
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
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Submitting Onboarding Details...</span>
                </>
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
