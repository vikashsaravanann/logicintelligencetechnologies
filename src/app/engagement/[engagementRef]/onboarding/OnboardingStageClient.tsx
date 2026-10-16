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
  document?: any;
}

export default function OnboardingStageClient({
  engagementRef,
  companyName,
  contactName,
  contactEmail,
  initialStatus = 'available',
  initialData = {},
  document,
}: OnboardingStageClientProps) {
  // Stakeholder Roster
  const [techLeadName, setTechLeadName] = useState(initialData?.techLeadName || contactName);
  const [techLeadEmail, setTechLeadEmail] = useState(initialData?.techLeadEmail || contactEmail);
  const [techLeadPhone, setTechLeadPhone] = useState(initialData?.techLeadPhone || '+91 ');
  const [timezone, setTimezone] = useState(initialData?.timezone || 'Asia/Kolkata (IST)');
  const [decisionMakerName, setDecisionMakerName] = useState(initialData?.decisionMakerName || contactName);
  const [decisionMakerEmail, setDecisionMakerEmail] = useState(initialData?.decisionMakerEmail || contactEmail);

  // Brand & Assets Intake
  const [brandColorHex, setBrandColorHex] = useState(initialData?.brandColorHex || '#1565C0');
  const [fontPreference, setFontPreference] = useState(initialData?.fontPreference || 'Inter / Geist Sans');
  const [assetDriveUrl, setAssetDriveUrl] = useState(initialData?.assetDriveUrl || '');
  const [brandGuidelinesNotes, setBrandGuidelinesNotes] = useState(initialData?.brandGuidelinesNotes || '');

  // Delegated Access Statuses
  const [githubStatus, setGithubStatus] = useState(initialData?.githubStatus || 'pending_invite');
  const [githubOrgRepo, setGithubOrgRepo] = useState(initialData?.githubOrgRepo || '');
  const [domainStatus, setDomainStatus] = useState(initialData?.domainStatus || 'client_will_apply');
  const [domainName, setDomainName] = useState(initialData?.domainName || '');
  const [dnsProvider, setDnsProvider] = useState(initialData?.dnsProvider || 'Cloudflare');
  const [supabaseStatus, setSupabaseStatus] = useState(initialData?.supabaseStatus || 'lit_managed');
  const [supabaseProjectId, setSupabaseProjectId] = useState(initialData?.supabaseProjectId || '');
  const [vercelStatus, setVercelStatus] = useState(initialData?.vercelStatus || 'lit_managed');
  const [vercelTeam, setVercelTeam] = useState(initialData?.vercelTeam || '');
  const [cloudProvider, setCloudProvider] = useState(initialData?.cloudProvider || 'Vercel + Supabase');

  // Kickoff & Communication
  const [kickoffDate, setKickoffDate] = useState(initialData?.kickoffDate || '2026-10-22');
  const [kickoffSlot, setKickoffSlot] = useState(initialData?.kickoffSlot || '11:00 AM - 12:00 PM IST');
  const [commChannel, setCommChannel] = useState(initialData?.commChannel || 'Dedicated WhatsApp / Slack Connect');
  const [notes, setNotes] = useState(initialData?.notes || '');

  // UI State
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(
    ['submitted', 'completed', 'verified', 'approved'].includes(initialStatus)
  );
  const [auditHash, setAuditHash] = useState<string | null>(initialData?.last_audit_hash || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Five Onboarding Phases
  const onboardingPhases = [
    { number: 1, title: 'Welcome & Foundations', status: 'Completed', desc: 'SOW signed, initial deposit verified, repository provisioned.' },
    { number: 2, title: 'Information Intake', status: 'In Progress', desc: 'Submit technical liaison, brand assets, and creative guidelines.' },
    { number: 3, title: 'Access Delegation', status: 'Pending', desc: 'Invite @logicintelligence via GitHub, DNS, and cloud IAM.' },
    { number: 4, title: 'Technical Kickoff', status: 'Upcoming', desc: 'Architecture alignment, sprint calendar sign-off, SLA review.' },
    { number: 5, title: 'Sprint 1 Build Initiation', status: 'Upcoming', desc: 'Technical spec lock and core infrastructure deployment.' },
  ];

  // 13 Guide Topics from LIT-03 (pp. 1–6)
  const guideTopics = [
    {
      id: 1,
      title: '01. Next Steps & Responsibilities Matrix',
      summary: 'Immediate action items following SOW execution and verified initial deposit.',
      content:
        'Following initial invoice reconciliation, the engagement transitions into formal infrastructure provisioning. LIT provisions isolated development environments within 24 hours. Client provides technical liaison contacts, brand assets, and delegated provider invitations as outlined below.',
    },
    {
      id: 2,
      title: '02. Technical Onboarding & Systems Architecture',
      summary: 'Strict segregation between Development, Preview/Staging, and Production environments.',
      content:
        'All client projects follow a three-tier environment architecture: (1) Local/Dev with synthetic fixtures, (2) Preview on ephemeral edge branches for feature verification, and (3) Production deployed across Vercel Edge with continuous health monitoring. Code repositories remain the intellectual property of the client upon final settlement.',
    },
    {
      id: 3,
      title: '03. Required Client Materials & Intake Matrix',
      summary: 'Brand guidelines, typography, vector assets, and official copy requirements.',
      content:
        'Please supply high-resolution vector logos (SVG/AI), primary and secondary brand color codes (Hex/HSL), licensed font files or Google Font definitions, product copy, privacy policies, and terms of service. Do not send passwords or credentials in documents.',
    },
    {
      id: 4,
      title: '04. GitHub Delegation (@logicintelligence)',
      summary: 'Zero SSH keys or personal tokens: invite our organization as an external collaborator.',
      content:
        'To delegate repository access, add @logicintelligence (or hello@logicintelligencetechnologies.in) with Admin or Maintainer permissions to the designated repository or organization. Never generate personal access tokens (PATs) or share SSH private keys.',
    },
    {
      id: 5,
      title: '05. Domain & DNS Configuration',
      summary: 'Cloudflare, Route53, or registrar delegation for zero-downtime SSL/TLS provisioning.',
      content:
        'You may either invite LIT as a DNS Manager in Cloudflare/GoDaddy, or our team will provide exact CNAME, A, and TXT verification records for your team to apply. DNS propagation typically completes within 15–30 minutes.',
    },
    {
      id: 6,
      title: '06. Cloud IAM Providers (AWS / GCP / Azure)',
      summary: 'Scoped IAM roles with least-privilege permission boundaries for cloud resources.',
      content:
        'If third-party cloud infrastructure is required, grant access via IAM roles with explicitly scoped policies (e.g., S3ReadOnly, CloudWatchEvents). Billing accounts remain directly owned and paid by the client.',
    },
    {
      id: 7,
      title: '07. Supabase Database Delegation',
      summary: 'Team member invitations only — never export service-role keys or database passwords.',
      content:
        'Invite hello@logicintelligencetechnologies.in to your Supabase organization with the "Developer" role. Database migrations, Row Level Security (RLS) policies, and connection pooling will be managed via automated CLI scripts.',
    },
    {
      id: 8,
      title: '08. Vercel Team & Edge Deployment',
      summary: 'Production edge deployments, automated preview branches, and domain routing.',
      content:
        'Invite LIT as a "Member" in your Vercel team, or LIT can manage the deployment under our enterprise infrastructure and transfer ownership during Stage 12 Handover. Environment variables must be set via the Vercel dashboard.',
    },
    {
      id: 9,
      title: '09. Third-Party Integrations Register',
      summary: 'Stripe, Razorpay, Resend, Twilio, and external REST/GraphQL API connections.',
      content:
        'Document all external services required for the project. For payment gateways and communication APIs, invite LIT to your staging/sandbox environment or generate restricted, IP-whitelisted test API keys.',
    },
    {
      id: 10,
      title: '10. Enterprise Security & MFA Policies',
      summary: 'Mandatory multi-factor authentication, secret hygiene, and automated audit logging.',
      content:
        'All LIT engineers utilize hardware security keys and enforced 2FA. We conduct static application security testing (SAST) and dependency vulnerability scans prior to each release build. Secret values are never committed to version control.',
    },
    {
      id: 11,
      title: '11. Project Communication Channels & SLA Cadence',
      summary: 'Authorized email contacts, direct messaging channels, and weekly progress briefings.',
      content:
        'Official correspondence occurs via hello@logicintelligencetechnologies.in. Day-to-day engineering coordination is supported via a dedicated Slack Connect channel or WhatsApp Business group. Formal milestone demos occur bi-weekly.',
    },
    {
      id: 12,
      title: '12. Delivery Lifecycle: Specify → Build → Review → Accept',
      summary: 'Iterative sprint structure, sprint acceptance milestones, and change governance.',
      content:
        'Work proceeds through 5 core milestones: Infrastructure Scaffolding → Core Domain Logic → Frontend UI/UX Integration → End-to-End QA → Production Handover. Any scope alterations are governed by the LIT-06 Change Request protocol.',
    },
    {
      id: 13,
      title: '13. Support, Warranty & Defect Logging',
      summary: '90-day comprehensive warranty coverage and standard defect logging protocols.',
      content:
        'The delivered solution includes 90 days of corrective maintenance starting from Stage 10 delivery acceptance. Defect tickets must include reproduction steps, environment details, and observed versus expected outcomes.',
    },
  ];

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSaveSuccessMsg(null);

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_draft',
          payload: {
            techLeadName,
            techLeadEmail,
            techLeadPhone,
            timezone,
            decisionMakerName,
            decisionMakerEmail,
            brandColorHex,
            fontPreference,
            assetDriveUrl,
            brandGuidelinesNotes,
            githubStatus,
            githubOrgRepo,
            domainStatus,
            domainName,
            dnsProvider,
            supabaseStatus,
            supabaseProjectId,
            vercelStatus,
            vercelTeam,
            cloudProvider,
            kickoffDate,
            kickoffSlot,
            commChannel,
            notes,
            savedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save onboarding draft');
      }

      setSaveSuccessMsg('Onboarding draft saved successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving draft';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
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
            decisionMakerName,
            decisionMakerEmail,
            brandColorHex,
            fontPreference,
            assetDriveUrl,
            brandGuidelinesNotes,
            githubStatus,
            githubOrgRepo,
            domainStatus,
            domainName,
            dnsProvider,
            supabaseStatus,
            supabaseProjectId,
            vercelStatus,
            vercelTeam,
            cloudProvider,
            kickoffDate,
            kickoffSlot,
            commChannel,
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
        documentRef="LIT-03-Client-Onboarding-Guide.pdf"
        title="LIT-03 Client Technical Onboarding & Systems Guide"
        description="Comprehensive 6-page technical intake, architecture delegation guide, least-privilege access protocols, and kickoff roadmap."
        documentMasterPath="/assets/docs/masters/LIT-03-Client-Onboarding-Guide.pdf"
        version="v1.0 (Official LIT Master Guide)"
        status="active"
      />

      {/* Strict Credential-Free Access Notice */}
      <div className="bg-[#E7F3FF] border border-[#B9DCFF] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-[#0B2545]">
        <svg className="w-5 h-5 text-[#1565C0] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <div className="space-y-1">
          <span className="font-bold block text-sm">Strict Zero-Credential Intake Policy</span>
          <p className="text-slate-600 leading-relaxed">
            <strong>Never enter passwords, API keys, private keys, or security tokens in this portal.</strong>{' '}
            Logic Intelligence Technologies engineers will never request your account passwords or two-factor authentication codes.
            All system access must be delegated via authorized IAM team invitations, GitHub organization invites to{' '}
            <code className="bg-white/80 px-1 py-0.5 rounded border border-blue-200 text-[#1565C0]">@logicintelligence</code>, or scoped Cloudflare DNS delegation.
          </p>
        </div>
      </div>

      {/* Onboarding Phase Timeline */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider mb-4">
          Engagement Onboarding Lifecycle (5 Phases)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {onboardingPhases.map((phase) => (
            <div
              key={phase.number}
              className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between ${
                phase.status === 'Completed'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : phase.status === 'In Progress'
                  ? 'bg-blue-50 border-blue-200 text-blue-900 ring-2 ring-blue-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-[10px] uppercase">Phase 0{phase.number}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      phase.status === 'Completed'
                        ? 'bg-emerald-200/60 text-emerald-800'
                        : phase.status === 'In Progress'
                        ? 'bg-blue-200/60 text-blue-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {phase.status}
                  </span>
                </div>
                <h4 className="font-bold text-xs">{phase.title}</h4>
                <p className="text-[11px] mt-1 leading-snug opacity-80">{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIT-03 Educational Topics Accordion */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50/60 border-b border-[#DFE7EF]">
          <h3 className="text-sm font-bold text-[#0B2545]">
            LIT-03 Master Guide: 13 Core Technical Modules
          </h3>
          <p className="text-xs text-[#52677C] mt-0.5">
            Click any section below to review the authoritative technical onboarding specifications.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {guideTopics.map((topic) => {
            const isExpanded = expandedTopic === topic.id;
            return (
              <div key={topic.id} className="transition-colors hover:bg-slate-50/40">
                <button
                  type="button"
                  onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                  className="w-full text-left px-6 py-3.5 flex items-center justify-between text-xs font-semibold text-[#0B2545]"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-[10px]">
                      {topic.id}
                    </span>
                    <div>
                      <span>{topic.title}</span>
                      <span className="hidden sm:inline-block ml-3 font-normal text-slate-500 text-[11px]">
                        — {topic.summary}
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="px-6 pb-4 pt-1 text-xs text-slate-600 leading-relaxed bg-blue-50/30 border-t border-blue-50">
                    <p>{topic.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
          {errorMessage}
        </div>
      )}
      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          {saveSuccessMsg}
        </div>
      )}

      {/* Submitted Success View */}
      {isSubmitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">
              Technical Onboarding Intake Logged & Verified
            </h3>
            <p className="text-xs text-emerald-700 max-w-lg mx-auto mt-1 leading-relaxed">
              Your technical liaison, creative preferences, and access delegation statuses have been recorded for{' '}
              <strong>{companyName}</strong>. Our engineering leads will review your delegation invites and prepare the system architecture baseline.
            </p>
            {auditHash && (
              <p className="font-mono text-[11px] text-emerald-800 bg-white/70 p-2 rounded border border-emerald-200 max-w-md mx-auto mt-3 break-all">
                Audit Digest: {auditHash}
              </p>
            )}
          </div>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/engagement/${engagementRef}/technical-spec`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs"
            >
              <span>Proceed to Stage 08: Technical Specification</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Modify Intake Responses
            </button>
          </div>
        </div>
      ) : (
        /* Comprehensive Client Intake Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs space-y-8">
          {/* Section 1: Stakeholder Roster */}
          <div className="space-y-4">
            <div className="border-b border-[#DFE7EF] pb-3">
              <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider">
                1. Technical Liaison & Stakeholder Roster
              </h3>
              <p className="text-xs text-[#52677C] mt-0.5">
                Designate the primary engineering contact and business decision-maker for {companyName}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Primary Technical Lead Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={techLeadName}
                  onChange={(e) => setTechLeadName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                  placeholder="e.g. Alex Chen"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Technical Lead Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={techLeadEmail}
                  onChange={(e) => setTechLeadEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                  placeholder="alex@company.com"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Emergency Escalation Phone
                </label>
                <input
                  type="tel"
                  value={techLeadPhone}
                  onChange={(e) => setTechLeadPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Primary Working Timezone
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                  placeholder="Asia/Kolkata (IST)"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Commercial Decision Maker Name
                </label>
                <input
                  type="text"
                  value={decisionMakerName}
                  onChange={(e) => setDecisionMakerName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Commercial Decision Maker Email
                </label>
                <input
                  type="email"
                  value={decisionMakerEmail}
                  onChange={(e) => setDecisionMakerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Brand & Creative Assets */}
          <div className="space-y-4">
            <div className="border-b border-[#DFE7EF] pb-3">
              <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider">
                2. Brand Identity & Design Intake
              </h3>
              <p className="text-xs text-[#52677C] mt-0.5">
                Share your brand assets, typography guidelines, and shared cloud folder links.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Primary Brand Color (Hex / HSL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandColorHex}
                    onChange={(e) => setBrandColorHex(e.target.value)}
                    className="w-9 h-9 p-0.5 border border-[#DFE7EF] rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandColorHex}
                    onChange={(e) => setBrandColorHex(e.target.value)}
                    className="flex-1 px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs font-mono"
                    placeholder="#1565C0"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Preferred Typography / Font Family
                </label>
                <input
                  type="text"
                  value={fontPreference}
                  onChange={(e) => setFontPreference(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs"
                  placeholder="e.g. Inter, Plus Jakarta Sans, Geist"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-[#0B2545] mb-1">
                  Shared Asset Drive Link (Google Drive / Figma / Dropbox)
                </label>
                <input
                  type="url"
                  value={assetDriveUrl}
                  onChange={(e) => setAssetDriveUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs"
                  placeholder="https://drive.google.com/drive/folders/... or Figma link"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Ensure link permissions allow viewing for hello@logicintelligencetechnologies.in.
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-medium text-[#0B2545] mb-1">
                  Brand Guidelines & Creative Notes
                </label>
                <textarea
                  rows={2}
                  value={brandGuidelinesNotes}
                  onChange={(e) => setBrandGuidelinesNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs"
                  placeholder="Describe your design aesthetics, tone of voice, dark/light mode preference..."
                />
              </div>
            </div>
          </div>

          {/* Section 3: Delegated Infrastructure Access Matrix */}
          <div className="space-y-4">
            <div className="border-b border-[#DFE7EF] pb-3">
              <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider">
                3. Delegated Infrastructure Access Matrix (Zero Passwords)
              </h3>
              <p className="text-xs text-[#52677C] mt-0.5">
                Indicate the delegation status for each platform. Clients who have not yet provisioned accounts may select &quot;Guidance Requested&quot;.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* GitHub */}
              <div className="p-4 rounded-xl border border-[#DFE7EF] bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">GitHub Organization / Repo</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                    @logicintelligence
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Delegation Status</label>
                  <select
                    value={githubStatus}
                    onChange={(e) => setGithubStatus(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#DFE7EF] rounded-lg bg-white text-xs"
                  >
                    <option value="pending_invite">Pending Invite to @logicintelligence</option>
                    <option value="invite_sent">Invite Sent to @logicintelligence</option>
                    <option value="access_granted">Admin / Maintainer Access Active</option>
                    <option value="lit_managed">LIT Managed (Transfer at Stage 12)</option>
                    <option value="guidance_requested">Not yet created — Guidance Requested</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Repo URL / Org Name</label>
                  <input
                    type="text"
                    value={githubOrgRepo}
                    onChange={(e) => setGithubOrgRepo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#DFE7EF] rounded-lg bg-white text-xs font-mono"
                    placeholder="github.com/your-org/project-repo"
                  />
                </div>
              </div>

              {/* Domain & DNS */}
              <div className="p-4 rounded-xl border border-[#DFE7EF] bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Domain & DNS Registrar</span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
                    Cloudflare / Route53
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Delegation Preference</label>
                  <select
                    value={domainStatus}
                    onChange={(e) => setDomainStatus(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#DFE7EF] rounded-lg bg-white text-xs"
                  >
                    <option value="client_will_apply">I will apply CNAME / A records provided by LIT</option>
                    <option value="invite_sent">Invited LIT as DNS Manager</option>
                    <option value="not_yet_purchased">Domain not yet purchased — Guidance Requested</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Domain Name</label>
                    <input
                      type="text"
                      value={domainName}
                      onChange={(e) => setDomainName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#DFE7EF] rounded-lg bg-white text-xs font-mono"
                      placeholder="app.yourdomain.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">DNS Provider</label>
                    <input
                      type="text"
                      value={dnsProvider}
                      onChange={(e) => setDnsProvider(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#DFE7EF] rounded-lg bg-white text-xs"
                      placeholder="Cloudflare, GoDaddy, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Supabase */}
              <div className="p-4 rounded-xl border border-[#DFE7EF] bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Supabase Database Workspace</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                    PostgreSQL 15+
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Delegation Status</label>
                  <select
                    value={supabaseStatus}
                    onChange={(e) => setSupabaseStatus(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#DFE7EF] rounded-lg bg-white text-xs"
                  >
                    <option value="lit_managed">LIT Managed Tenant (Transfer at Stage 12)</option>
                    <option value="invite_sent">Invited hello@logicintelligence... as Developer</option>
                    <option value="client_managed">Client Organization (Self-Hosted / Managed)</option>
                    <option value="guidance_requested">Not yet created — Guidance Requested</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Project Ref / URL</label>
                  <input
                    type="text"
                    value={supabaseProjectId}
                    onChange={(e) => setSupabaseProjectId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#DFE7EF] rounded-lg bg-white text-xs font-mono"
                    placeholder="e.g. abcdxyzijklmnop"
                  />
                </div>
              </div>

              {/* Vercel */}
              <div className="p-4 rounded-xl border border-[#DFE7EF] bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Vercel Edge Deployment</span>
                  <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-mono">
                    Edge Runtime
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Delegation Status</label>
                  <select
                    value={vercelStatus}
                    onChange={(e) => setVercelStatus(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#DFE7EF] rounded-lg bg-white text-xs"
                  >
                    <option value="lit_managed">LIT Managed Pipeline (Transfer at Stage 12)</option>
                    <option value="team_invite_sent">Team Invite Sent to LIT</option>
                    <option value="client_managed">Client Vercel Team</option>
                    <option value="guidance_requested">Guidance Requested</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Team Slug / Project Name</label>
                  <input
                    type="text"
                    value={vercelTeam}
                    onChange={(e) => setVercelTeam(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#DFE7EF] rounded-lg bg-white text-xs font-mono"
                    placeholder="e.g. team-acme-corp"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Kickoff & Communication */}
          <div className="space-y-4">
            <div className="border-b border-[#DFE7EF] pb-3">
              <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider">
                4. Technical Kickoff Scheduling & Communication
              </h3>
              <p className="text-xs text-[#52677C] mt-0.5">
                Select your preferred meeting date and communication channel for sprint status updates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Preferred Kickoff Date
                </label>
                <input
                  type="date"
                  value={kickoffDate}
                  onChange={(e) => setKickoffDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Preferred Time Slot (IST)
                </label>
                <select
                  value={kickoffSlot}
                  onChange={(e) => setKickoffSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs bg-white"
                >
                  <option value="10:00 AM - 11:00 AM IST">10:00 AM – 11:00 AM IST</option>
                  <option value="11:00 AM - 12:00 PM IST">11:00 AM – 12:00 PM IST</option>
                  <option value="02:00 PM - 03:00 PM IST">02:00 PM – 03:00 PM IST</option>
                  <option value="04:00 PM - 05:00 PM IST">04:00 PM – 05:00 PM IST</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Daily Update Channel
                </label>
                <select
                  value={commChannel}
                  onChange={(e) => setCommChannel(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs bg-white"
                >
                  <option value="Dedicated WhatsApp / Slack Connect">Dedicated WhatsApp / Slack Connect</option>
                  <option value="Official Email Updates (hello@logicintelligence...)">Official Email Updates Only</option>
                  <option value="Microsoft Teams Connect">Microsoft Teams Connect</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-medium text-[#0B2545] mb-1">
                  Additional Notes / System Specifics
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs"
                  placeholder="Mention any custom legacy systems, compliance constraints (HIPAA, GDPR), or specific API integrations..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#DFE7EF] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              Save Draft
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0B2545] text-white font-semibold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Submitting Onboarding...</span>
                </>
              ) : (
                <>
                  <span>Submit Technical Onboarding</span>
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
