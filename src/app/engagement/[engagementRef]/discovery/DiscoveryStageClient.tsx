'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  // 1. Organization & Decision-Makers
  const [legalName, setLegalName] = useState(initialData?.legalName || companyName);
  const [industry, setIndustry] = useState(initialData?.industry || 'Healthcare & Enterprise Technology');
  const [primaryContact, setPrimaryContact] = useState(initialData?.primaryContact || 'Authorized Representative');
  const [contactRole, setContactRole] = useState(initialData?.contactRole || 'Director / CTO');
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail || 'lead@company.com');
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || '+91 ');
  const [isSignatory, setIsSignatory] = useState(initialData?.isSignatory !== false);

  // 2. Project Vision
  const [problemStatement, setProblemStatement] = useState(
    initialData?.problemStatement ||
      'Fragmented clinical, billing, and patient records requiring unified enterprise cloud orchestration with strict RLS data security.'
  );
  const [primaryUser, setPrimaryUser] = useState(
    initialData?.primaryUser || 'Clinical staff, hospital administrators, billing specialists, and verified patients.'
  );
  const [successMetrics, setSuccessMetrics] = useState(
    initialData?.successMetrics || 'Zero data loss, < 50ms edge query latency, 100% test pass rate, and full MSME/regulatory compliance.'
  );
  const [targetGeography, setTargetGeography] = useState(initialData?.targetGeography || 'India (Pan-India) & International Enterprise');
  const [supportedLanguages, setSupportedLanguages] = useState(initialData?.supportedLanguages || 'English, Tamil, Hindi');

  // 3. Existing Digital Systems (Credential-Free)
  const [currentWebsite, setCurrentWebsite] = useState(initialData?.currentWebsite || 'https://');
  const [registeredDomain, setRegisteredDomain] = useState(initialData?.registeredDomain || '');
  const [hostingProvider, setHostingProvider] = useState(initialData?.hostingProvider || 'Vercel / Cloudflare');
  const [databasePlatform, setDatabasePlatform] = useState(initialData?.databasePlatform || 'Supabase PostgreSQL');
  const [migrationNeeds, setMigrationNeeds] = useState(
    initialData?.migrationNeeds || 'Legacy patient EHR migration & historical billing transaction sync.'
  );

  // 4. Requested Capabilities Matrix
  const defaultCapabilities = [
    { id: 'cap_frontend', name: 'Frontend Web Application (Next.js 15 App Router)', selected: true },
    { id: 'cap_api', name: 'Custom Backend REST / FHIR Middleware', selected: true },
    { id: 'cap_admin', name: 'Enterprise Super Admin & Audit Portal', selected: true },
    { id: 'cap_auth', name: 'Role-Based Access Control (RBAC) & Multi-Factor Auth', selected: true },
    { id: 'cap_db', name: 'PostgreSQL Relational DB with Row-Level Security (RLS)', selected: true },
    { id: 'cap_payment', name: 'Zero-Gateway Audited Manual UPI Payment Flow', selected: true },
    { id: 'cap_ai', name: 'Groq LPU AI Assistant with Domain-Isolated RAG', selected: true },
    { id: 'cap_analytics', name: 'Edge Telemetry, Audit Logs & Performance Analytics', selected: true },
    { id: 'cap_mobile', name: 'Responsive Mobile & Tablet Viewport Optimization', selected: true },
    { id: 'cap_doc', name: 'Automated Cryptographic PDF Invoices & Receipt Generation', selected: true },
  ];
  const [capabilities, setCapabilities] = useState<Array<{ id: string; name: string; selected: boolean }>>(
    initialData?.capabilities || defaultCapabilities
  );

  const toggleCapability = (id: string) => {
    setCapabilities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  // 5. Users & Permissions
  const [expectedRoles, setExpectedRoles] = useState(
    initialData?.expectedRoles || 'Super Admin, Department Doctor, Ward Nurse, Pharmacy Head, Lab Tech, Billing Clerk, Patient'
  );
  const [estimatedUsers, setEstimatedUsers] = useState(initialData?.estimatedUsers || '500 - 5,000 active monthly users');
  const [multiTenantRequired, setMultiTenantRequired] = useState(initialData?.multiTenantRequired !== false);

  // 6. Data & Integrations
  const [dataSensitivity, setDataSensitivity] = useState(initialData?.dataSensitivity || 'High (Healthcare PHI / Financial Records)');
  const [thirdPartyTools, setThirdPartyTools] = useState(
    initialData?.thirdPartyTools || 'Cloudflare DNS, WhatsApp Business API, SMS Gateway, Google Workspace'
  );
  const [backupCadence, setBackupCadence] = useState(initialData?.backupCadence || 'Automated Daily Backups with Point-in-Time Recovery');

  // 7. Design Direction
  const [hasBrandAssets, setHasBrandAssets] = useState(initialData?.hasBrandAssets !== false);
  const [primaryBrandColor, setPrimaryBrandColor] = useState(initialData?.primaryBrandColor || '#0B2545 (Navy) & #1FA9A2 (Teal)');
  const [designInspiration, setDesignInspiration] = useState(
    initialData?.designInspiration || 'Minimalist, accessible, high-contrast, clinical elegance with Poppins / Inter typography'
  );

  // 8. Constraints & Deadlines
  const [targetLaunchWindow, setTargetLaunchWindow] = useState(initialData?.targetLaunchWindow || '8 - 10 Weeks');
  const [complianceMandates, setComplianceMandates] = useState(
    initialData?.complianceMandates || 'HIPAA PHI compliance, MSME statutory alignment, ISO 27001 baseline security'
  );
  const [budgetGuidance, setBudgetGuidance] = useState(initialData?.budgetGuidance || 'Enterprise Bespoke Milestone Tier');

  // 9. Technical Consultation Scheduler
  const [meetingDate, setMeetingDate] = useState(initialData?.meetingDate || '2026-10-22');
  const [meetingTime, setMeetingTime] = useState(initialData?.meetingTime || '15:00');
  const [meetingAttendees, setMeetingAttendees] = useState(
    initialData?.meetingAttendees || 'Founder & CTO, Principal Solutions Architect, Lead Full-Stack Engineer'
  );
  const [meetingTopics, setMeetingTopics] = useState(
    initialData?.meetingTopics || 'Architecture topology verification, RLS schema validation, and SOW milestone scheduling'
  );

  // 10. Status & Form Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const isFormSubmitted = ['submitted', 'completed', 'under_review', 'approved', 'verified', 'accepted'].includes(initialStatus || '');
  const [submitted, setSubmitted] = useState(isFormSubmitted);
  const [currentStatus, setCurrentStatus] = useState(initialStatus || 'available');
  const [auditHash, setAuditHash] = useState<string | null>(initialData?.last_audit_hash || null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    const payload = {
      legalName,
      industry,
      primaryContact,
      contactRole,
      contactEmail,
      contactPhone,
      isSignatory,
      problemStatement,
      primaryUser,
      successMetrics,
      targetGeography,
      supportedLanguages,
      currentWebsite,
      registeredDomain,
      hostingProvider,
      databasePlatform,
      migrationNeeds,
      capabilities,
      expectedRoles,
      estimatedUsers,
      multiTenantRequired,
      dataSensitivity,
      thirdPartyTools,
      backupCadence,
      hasBrandAssets,
      primaryBrandColor,
      designInspiration,
      targetLaunchWindow,
      complianceMandates,
      budgetGuidance,
      meetingDate,
      meetingTime,
      meetingAttendees,
      meetingTopics,
    };

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_draft',
          payload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save discovery draft');
      }

      setAuditHash(data.auditHash);
      setFeedbackMessage('Discovery questionnaire draft saved with cryptographic digest.');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving draft';
      setErrorMessage(msg);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setFeedbackMessage(null);

    const payload = {
      legalName,
      industry,
      primaryContact,
      contactRole,
      contactEmail,
      contactPhone,
      isSignatory,
      problemStatement,
      primaryUser,
      successMetrics,
      targetGeography,
      supportedLanguages,
      currentWebsite,
      registeredDomain,
      hostingProvider,
      databasePlatform,
      migrationNeeds,
      capabilities,
      expectedRoles,
      estimatedUsers,
      multiTenantRequired,
      dataSensitivity,
      thirdPartyTools,
      backupCadence,
      hasBrandAssets,
      primaryBrandColor,
      designInspiration,
      targetLaunchWindow,
      complianceMandates,
      budgetGuidance,
      meetingDate,
      meetingTime,
      meetingAttendees,
      meetingTopics,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/discovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_discovery',
          payload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit discovery requirements');
      }

      setSubmitted(true);
      setCurrentStatus('under_review');
      setAuditHash(data.auditHash);
      setFeedbackMessage('Discovery requirements recorded. Queued for LIT Principal Architect review.');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting discovery';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Educational Header */}
      <div className="bg-gradient-to-br from-[#0B2545] to-[#133E68] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-sky-200 border border-white/15">
            <span>Stage 02 of 13</span>
            <span>·</span>
            <span>Technical Discovery & Scope Formulation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Project Discovery — Tell Us What You Want to Build
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            In this stage, we translate business challenges and operational goals into rigorous system specifications. Pre-populated from your Stage 1 checklist, this comprehensive questionnaire captures decision-maker authority, digital architecture baselines, requested capability modules, user permissions, and constraints.
          </p>
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-xs flex items-center gap-2.5">
            <span className="text-amber-300 font-bold">🔒 Security Rule:</span>
            <span className="text-slate-200">
              Never enter passwords, database credentials, or private API keys. Provide links and provider names only; secure access delegation occurs in Stage 7 via provider invitations.
            </span>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{feedbackMessage}</span>
          {auditHash && <span className="font-mono text-[10px] text-emerald-600">SHA-256: {auditHash.slice(0, 16)}...</span>}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* 10 Canonical Discovery Sections */}
      <div className="space-y-6">
        {/* Section 1: Organization & Decision Makers */}
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-[#E7F3FF] text-[#1565C0] font-mono font-bold text-xs flex items-center justify-center">
              01
            </span>
            <h3 className="text-sm font-bold text-[#0B2545]">Organization & Decision Makers</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Legal Entity Name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Verified identity prefill.</span>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry / Domain</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Project Lead / Contact</label>
              <input
                type="text"
                value={primaryContact}
                onChange={(e) => setPrimaryContact(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lead Role / Designation</label>
              <input
                type="text"
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone (E.164 / India)</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
          </div>
          <div className="pt-2 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              id="isSignatory"
              checked={isSignatory}
              onChange={(e) => setIsSignatory(e.target.checked)}
              className="w-4 h-4 text-[#1565C0] rounded border-slate-300"
            />
            <label htmlFor="isSignatory" className="text-slate-700 font-medium">
              Primary contact is authorized to legally sign and execute the Stage 5 Statement of Work (SOW).
            </label>
          </div>
        </div>

        {/* Section 2: Project Vision */}
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-[#E7F3FF] text-[#1565C0] font-mono font-bold text-xs flex items-center justify-center">
              02
            </span>
            <h3 className="text-sm font-bold text-[#0B2545]">Project Vision & Core Objectives</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">What primary problem should this project solve?</label>
              <textarea
                rows={2}
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Target Users</label>
                <input
                  type="text"
                  value={primaryUser}
                  onChange={(e) => setPrimaryUser(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Measured Success Criteria</label>
                <input
                  type="text"
                  value={successMetrics}
                  onChange={(e) => setSuccessMetrics(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Geographies</label>
                <input
                  type="text"
                  value={targetGeography}
                  onChange={(e) => setTargetGeography(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supported Languages</label>
                <input
                  type="text"
                  value={supportedLanguages}
                  onChange={(e) => setSupportedLanguages(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Existing Digital Systems (Credential-Free) */}
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-[#E7F3FF] text-[#1565C0] font-mono font-bold text-xs flex items-center justify-center">
              03
            </span>
            <h3 className="text-sm font-bold text-[#0B2545]">Existing Digital Systems (Credential-Free Policy)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Website / Application URL</label>
              <input
                type="text"
                value={currentWebsite}
                onChange={(e) => setCurrentWebsite(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Domain Name</label>
              <input
                type="text"
                value={registeredDomain}
                onChange={(e) => setRegisteredDomain(e.target.value)}
                placeholder="e.g. clientplatform.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hosting / Cloud Provider Name</label>
              <input
                type="text"
                value={hostingProvider}
                onChange={(e) => setHostingProvider(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Database / Storage System</label>
              <input
                type="text"
                value={databasePlatform}
                onChange={(e) => setDatabasePlatform(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
          </div>
          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Data Migration & Historical Records Needs</label>
            <textarea
              rows={2}
              value={migrationNeeds}
              onChange={(e) => setMigrationNeeds(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
            />
          </div>
        </div>

        {/* Section 4: Requested Capabilities Matrix */}
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-[#E7F3FF] text-[#1565C0] font-mono font-bold text-xs flex items-center justify-center">
              04
            </span>
            <h3 className="text-sm font-bold text-[#0B2545]">Requested Capabilities Matrix</h3>
          </div>
          <p className="text-xs text-slate-500">
            Check the engineering capability modules required for your deployment. Unselected workstreams will not appear in the commercial quotation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {capabilities.map((cap) => (
              <div
                key={cap.id}
                onClick={() => toggleCapability(cap.id)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                  cap.selected
                    ? 'bg-blue-50/50 border-[#1565C0] text-[#0B2545]'
                    : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={cap.selected}
                  onChange={() => {}}
                  className="w-4 h-4 text-[#1565C0] rounded border-slate-300"
                />
                <span className="font-semibold">{cap.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Users & Permissions */}
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-[#E7F3FF] text-[#1565C0] font-mono font-bold text-xs flex items-center justify-center">
              05
            </span>
            <h3 className="text-sm font-bold text-[#0B2545]">Users, Roles & Security Permissions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected User Roles & Personas</label>
              <textarea
                rows={2}
                value={expectedRoles}
                onChange={(e) => setExpectedRoles(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Concurrency / User Base</label>
              <input
                type="text"
                value={estimatedUsers}
                onChange={(e) => setEstimatedUsers(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
              <div className="pt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="multiTenant"
                  checked={multiTenantRequired}
                  onChange={(e) => setMultiTenantRequired(e.target.checked)}
                  className="w-4 h-4 text-[#1565C0] rounded border-slate-300"
                />
                <label htmlFor="multiTenant" className="text-slate-700 font-medium">
                  Strict multi-tenant organization data isolation required (RLS enforced).
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Data & Integrations */}
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-[#E7F3FF] text-[#1565C0] font-mono font-bold text-xs flex items-center justify-center">
              06
            </span>
            <h3 className="text-sm font-bold text-[#0B2545]">Data Sensitivity & External Integrations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data Sensitivity Classification</label>
              <input
                type="text"
                value={dataSensitivity}
                onChange={(e) => setDataSensitivity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Third-Party SaaS / API Tools</label>
              <input
                type="text"
                value={thirdPartyTools}
                onChange={(e) => setThirdPartyTools(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Backup & Retention Preference</label>
              <input
                type="text"
                value={backupCadence}
                onChange={(e) => setBackupCadence(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 7: Design Direction */}
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-[#E7F3FF] text-[#1565C0] font-mono font-bold text-xs flex items-center justify-center">
              07
            </span>
            <h3 className="text-sm font-bold text-[#0B2545]">Design Direction & Brand Identity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Colors & Palette</label>
              <input
                type="text"
                value={primaryBrandColor}
                onChange={(e) => setPrimaryBrandColor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Style & Inspiration Platforms</label>
              <input
                type="text"
                value={designInspiration}
                onChange={(e) => setDesignInspiration(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 8: Constraints & Deadlines */}
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-[#E7F3FF] text-[#1565C0] font-mono font-bold text-xs flex items-center justify-center">
              08
            </span>
            <h3 className="text-sm font-bold text-[#0B2545]">Delivery Constraints & Regulatory Mandates</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Launch Window</label>
              <input
                type="text"
                value={targetLaunchWindow}
                onChange={(e) => setTargetLaunchWindow(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Statutory / Security Mandates</label>
              <input
                type="text"
                value={complianceMandates}
                onChange={(e) => setComplianceMandates(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Budget Allocation Tier</label>
              <input
                type="text"
                value={budgetGuidance}
                onChange={(e) => setBudgetGuidance(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 9: Technical Consultation Scheduler */}
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-[#E7F3FF] text-[#1565C0] font-mono font-bold text-xs flex items-center justify-center">
              09
            </span>
            <h3 className="text-sm font-bold text-[#0B2545]">Technical Consultation Scheduler</h3>
          </div>
          <p className="text-xs text-slate-500">
            Request your technical deep-dive consultation slot with LIT Principal Architects. Meetings are conducted via Google Meet / Zoom with screen sharing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposed Meeting Date</label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposed Meeting Time (IST)</label>
              <input
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Proposed Attendees & Focus Agenda</label>
              <textarea
                rows={2}
                value={meetingTopics}
                onChange={(e) => setMeetingTopics(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#1565C0] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 10: Final Review & Submission */}
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-lg bg-[#E7F3FF] text-[#1565C0] font-mono font-bold text-xs flex items-center justify-center">
              10
            </span>
            <h3 className="text-sm font-bold text-[#0B2545]">Final Review & Client Submission</h3>
          </div>

          {['approved', 'verified', 'completed', 'accepted'].includes(currentStatus) ? (
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-6 text-xs text-[#065F46] space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D1FAE5] text-[#065F46] uppercase tracking-wider mb-2">
                    ✓ Discovery Formally Ratified
                  </span>
                  <h4 className="text-base font-bold text-[#065F46]">
                    Technical Discovery Baseline Approved by LIT Engineering
                  </h4>
                  <p className="text-xs text-[#047857] mt-1">
                    Your architecture answers have been incorporated into the project baseline. Stage 3 (Project Proposal & Quotation) is now ready.
                  </p>
                </div>
              </div>

              {auditHash && (
                <p className="font-mono text-[11px] text-slate-700 bg-white/80 p-3 rounded-lg border border-emerald-200">
                  Cryptographic Audit Digest: {auditHash}
                </p>
              )}

              <div className="pt-2">
                <Link
                  href={`/engagement/${engagementRef}/proposal`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#065F46] hover:bg-[#044e39] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <span>Proceed to Stage 3: Commercial Proposal & Quotation →</span>
                </Link>
              </div>
            </div>
          ) : submitted ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-xs text-amber-900 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                ⏳ Under Review · Awaiting Architect Baseline
              </span>
              <h4 className="text-base font-bold text-amber-950">
                Discovery Questionnaire Recorded & Queued for Architecture Sign-Off
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your answers have been securely persisted to engagement reference <strong className="font-mono">{engagementRef}</strong>.
                Our team will review your requirements and formulate the itemized Stage 3 Proposal.
              </p>
              {auditHash && (
                <p className="font-mono text-[11px] text-slate-600 bg-white/70 p-2.5 rounded border border-amber-200">
                  Cryptographic Audit Digest: {auditHash}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                By submitting this discovery questionnaire, you confirm that the above requirements accurately reflect your technical and operational objectives. Submitted data will directly generate the Stage 3 Commercial Proposal (LIT-02).
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-500">
                  All inputs are cryptographically hashed and stored in Supabase.
                </span>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || isSubmitting}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isSavingDraft ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting || isSavingDraft}
                    className="w-full sm:w-auto bg-[#0B2545] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Submitting Discovery...' : 'Submit Discovery Requirements →'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
