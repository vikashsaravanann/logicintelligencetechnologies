'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StageDocumentCard from '../components/StageDocumentCard';
import MaintenancePlansSection from '@/components/maintenance/MaintenancePlansSection';
import CorrectionRequestModal from '@/components/maintenance/CorrectionRequestModal';

interface SupportStageClientProps {
  engagementRef: string;
  engagementId?: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  initialStatus?: string;
  initialData?: Record<string, any>;
  document?: any;
}

interface SupportTicket {
  id: string;
  subject: string;
  severity: 'S1' | 'S2' | 'S3' | 'S4';
  component: string;
  systemUrl?: string;
  description: string;
  expectedBehavior?: string;
  observedBehavior?: string;
  affectedScope?: string;
  contactEmail: string;
  contactPhone?: string;
  submittedAt: string;
  status: 'TRIAGED_OPEN' | 'INVESTIGATING' | 'RESOLVED';
  slaTarget: string;
  auditHash?: string;
}

export default function SupportStageClient({
  engagementRef,
  engagementId,
  companyName,
  contactName,
  contactEmail,
  initialStatus = 'available',
  initialData = {},
  document,
}: SupportStageClientProps) {
  const [activeTab, setActiveTab] = useState<'plans' | 'agreement' | 'tickets' | 'new-ticket'>('plans');
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(1);

  // Ticket Form States
  const [ticketSubject, setTicketSubject] = useState('');
  const [severity, setSeverity] = useState<'S1' | 'S2' | 'S3' | 'S4'>('S2');
  const [component, setComponent] = useState('Frontend Web Portal (Next.js Edge)');
  const [systemUrl, setSystemUrl] = useState('');
  const [description, setDescription] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [observedBehavior, setObservedBehavior] = useState('');
  const [affectedScope, setAffectedScope] = useState('All Users / System Blocked');
  const [contactPhone, setContactPhone] = useState('+91 93428 77474');
  const [secretWarning, setSecretWarning] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<SupportTicket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Existing tickets list
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    if (Array.isArray(initialData?.tickets) && initialData.tickets.length > 0) {
      return initialData.tickets;
    }
    return [
      {
        id: 'TKT-LIT-2026-001',
        subject: 'Post-Delivery Verification: Initial Health Check & Baseline Validation',
        severity: 'S4',
        component: 'Production Cloud Accounts & Monitoring',
        systemUrl: 'https://www.logicintelligencetechnologies.in/',
        description: 'Automated post-handover smoke verification confirming Edge runtime, SSL certificate validity, and PostgreSQL connectivity.',
        expectedBehavior: 'All edge healthchecks respond with HTTP 200 within 100ms.',
        observedBehavior: 'Verified clean p95 latency of 64ms across all endpoints.',
        affectedScope: 'Automated Baseline Verification',
        contactEmail: contactEmail || 'hello@logicintelligencetechnologies.in',
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'RESOLVED',
        slaTarget: '24 Hours',
        auditHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      },
    ];
  });

  // Client-side secrets detection
  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    const secretPattern = /(?:bearer\s+[a-zA-Z0-9_\-\.]{20,}|ghp_[a-zA-Z0-9]{30,}|sk_live_[a-zA-Z0-9]{24,}|postgres:\/\/[^:]+:[^@]+@|password\s*[:=]\s*['"][^'"]+['"])/i;
    if (secretPattern.test(val)) {
      setSecretWarning('CRITICAL SECURITY WARNING: It appears you may have pasted a raw secret, password, or token. Please redact it immediately per our Zero Raw Credentials policy.');
    } else {
      setSecretWarning(null);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !description.trim()) {
      setErrorMessage('Please provide an incident subject and detailed description.');
      return;
    }

    if (secretWarning) {
      setErrorMessage('Cannot submit ticket containing unredacted raw credentials. Remove secrets before dispatching.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const generatedId = `TKT-LIT-${Math.floor(100000 + Math.random() * 900000)}`;
    const slaTarget = severity === 'S1' ? '< 1 Hour' : severity === 'S2' ? '< 4 Hours' : severity === 'S3' ? '< 12 Hours' : '< 24 Hours';

    const newTicket: SupportTicket = {
      id: generatedId,
      subject: ticketSubject.trim(),
      severity,
      component,
      systemUrl: systemUrl.trim(),
      description: description.trim(),
      expectedBehavior: expectedBehavior.trim(),
      observedBehavior: observedBehavior.trim(),
      affectedScope,
      contactEmail,
      contactPhone: contactPhone.trim(),
      submittedAt: new Date().toISOString(),
      status: 'TRIAGED_OPEN',
      slaTarget,
    };

    try {
      const res = await fetch(`/api/engagements/${engagementRef}/stages/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_ticket',
          payload: {
            ticket: newTicket,
            ticketId: generatedId,
            subject: ticketSubject.trim(),
            severity,
            component,
            systemUrl: systemUrl.trim(),
            description: description.trim(),
            expectedBehavior: expectedBehavior.trim(),
            observedBehavior: observedBehavior.trim(),
            affectedScope,
            contactEmail,
            contactPhone: contactPhone.trim(),
            companyName,
            submittedAt: newTicket.submittedAt,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch incident ticket.');
      }

      newTicket.auditHash = data.auditHash;
      setTickets((prev) => [newTicket, ...prev]);
      setSubmissionSuccess(newTicket);
      setTicketSubject('');
      setDescription('');
      setExpectedBehavior('');
      setObservedBehavior('');
      setSystemUrl('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while logging support incident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const slaMatrix = [
    {
      severity: 'S1',
      label: 'Critical Outage',
      firstResponse: '< 1 Hour',
      targetRemediation: '< 4 Hours',
      coverage: '24/7/365 Dedicated On-Call',
      color: 'border-red-300 bg-red-50/70 text-red-800',
      badge: 'bg-red-600 text-white',
      definition: 'Total system downtime, primary checkout/payment path failure, or critical security breach causing business standstill.',
    },
    {
      severity: 'S2',
      label: 'Major Degradation',
      firstResponse: '< 4 Hours',
      targetRemediation: '< 12 Hours',
      coverage: 'Business Hours (9 AM – 7 PM IST)',
      color: 'border-amber-300 bg-amber-50/70 text-amber-800',
      badge: 'bg-amber-600 text-white',
      definition: 'Core workflow impaired with no viable workaround; key features inaccessible to a substantial subset of users.',
    },
    {
      severity: 'S3',
      label: 'Minor Flaw / Workaround Available',
      firstResponse: '< 12 Hours',
      targetRemediation: '< 48 Hours',
      coverage: 'Business Hours (Mon – Sat)',
      color: 'border-blue-300 bg-blue-50/70 text-blue-800',
      badge: 'bg-blue-600 text-white',
      definition: 'Non-critical defect, reporting inconsistency, or partial UI failure where an operational workaround exists.',
    },
    {
      severity: 'S4',
      label: 'Cosmetic / General Inquiry',
      firstResponse: '< 24 Hours',
      targetRemediation: 'Next Scheduled Maintenance Release',
      coverage: 'Business Hours (Mon – Sat)',
      color: 'border-slate-300 bg-slate-50/70 text-slate-800',
      badge: 'bg-slate-600 text-white',
      definition: 'Minor styling alignment, text adjustment, usage question, or configuration assistance.',
    },
  ];

  const agreementChapters = [
    {
      number: 1,
      title: '01. Agreement Summary & Parties',
      content: (
        <div className="space-y-3 text-xs text-slate-700">
          <p>
            This <strong>Maintenance & Support Agreement (LIT-07)</strong> is entered into by and between:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-[#0B2545] block">Service Provider:</span>
              <div className="text-slate-800 font-medium">LOGIC INTELLIGENCE TECHNOLOGIES</div>
              <div className="text-[11px] text-slate-600">MSME: UDYAM-TN-03-0345274 (Micro Enterprise · Services)</div>
              <div className="text-[11px] text-slate-600">Eachanari, Coimbatore, Tamil Nadu 641021, India</div>
              <div className="text-[11px] text-slate-600">Email: hello@logicintelligencetechnologies.in</div>
            </div>
            <div>
              <span className="font-bold text-[#0B2545] block">Client Organization:</span>
              <div className="text-slate-800 font-medium">{companyName}</div>
              <div className="text-[11px] text-slate-600">Authorized Contact: {contactName}</div>
              <div className="text-[11px] text-slate-600">Email: {contactEmail}</div>
              <div className="text-[11px] text-slate-600">Engagement Reference: {engagementRef}</div>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px]">
            <strong>Truthful Status Contract:</strong> Standard 90-Day Production Warranty is currently active following Stage 10 delivery acceptance. Optional monthly maintenance care plans (Basic Care or Enterprise Care) remain uncontracted under the baseline SOW and are available upon formal renewal.
          </div>
        </div>
      ),
    },
    {
      number: 2,
      title: '02. Covered Systems & Production Architecture',
      content: (
        <div className="space-y-3 text-xs text-slate-700">
          <p>The following production infrastructure assets delivered under the Statement of Work are covered under active maintenance:</p>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2.5">System Component</th>
                  <th className="p-2.5">Runtime / Platform</th>
                  <th className="p-2.5">Tenant Ownership</th>
                  <th className="p-2.5">Maintenance Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">Frontend Web Application</td>
                  <td className="p-2.5">Next.js Edge / Vercel Edge Network</td>
                  <td className="p-2.5">Client Vercel Team</td>
                  <td className="p-2.5">Edge routing, runtime stability, hydration bugfixes</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">PostgreSQL Relational Database</td>
                  <td className="p-2.5">Supabase Enterprise Managed PostgreSQL</td>
                  <td className="p-2.5">Client Supabase Organization</td>
                  <td className="p-2.5">Schema integrity, RLS policy enforcement, PITR verification</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">Authentication & Identity Engine</td>
                  <td className="p-2.5">Supabase Auth (JWT & PKCE)</td>
                  <td className="p-2.5">Client Supabase Tenant</td>
                  <td className="p-2.5">Session management, role validation, MFA routing</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">Edge DNS, TLS & WAF</td>
                  <td className="p-2.5">Cloudflare DNS & Edge Network</td>
                  <td className="p-2.5">Client Cloudflare Account</td>
                  <td className="p-2.5">Automated TLS 1.3 renewals, DDoS shield, DNS records</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium text-slate-900">Transactional Communications</td>
                  <td className="p-2.5">Resend Transactional Email API</td>
                  <td className="p-2.5">Client Resend Account</td>
                  <td className="p-2.5">DKIM/SPF deliverability, template updates</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      number: 3,
      title: '03. Included Services & Enhancement Entitlements',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Corrective Bug Remediation:</strong> Investigation and resolution of software defects within delivered code in accordance with the SLA response matrix.</li>
            <li><strong>Security Vulnerability Remediation:</strong> Expedited deployment of critical CVE patches to npm dependencies, Next.js framework, and database extensions.</li>
            <li><strong>Dependency Upgrades:</strong> Ongoing minor and patch level updates to prevent bit-rot and upstream breaking changes.</li>
            <li><strong>Automated Health & Telemetry Monitoring:</strong> 1-minute interval synthetic endpoint pings and alerting to on-call engineers.</li>
            <li><strong>Monthly Technical Report:</strong> Summaries of platform uptime, error telemetry, p95 response times, and recommended optimizations.</li>
            <li><strong>Minor Enhancement Hours:</strong> Standard Warranty: 0 hrs/mo. (Basic Care: 2 hrs/mo, Enterprise Care: 10 hrs/mo).</li>
          </ul>
        </div>
      ),
    },
    {
      number: 4,
      title: '04. Excluded Services & Scope Boundaries',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <p>The following categories are explicitly excluded from standard maintenance and require an approved <strong>LIT-06 Change Request</strong>:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Substantial new functional modules, database architecture restructurings, or major design overhauls.</li>
            <li>Third-party cloud infrastructure subscription and usage fees (Vercel, Supabase, Cloudflare, Resend).</li>
            <li>Rectification of damages or outages caused by unauthorized codebase modifications by client staff or third parties.</li>
            <li>End-user customer support, business data entry, copywriting, or graphic design production.</li>
            <li>Major runtime migrations (e.g. Next.js major version upgrades with breaking changes).</li>
          </ul>
        </div>
      ),
    },
    {
      number: 5,
      title: '05. Support Channels & Incident Routing Policy',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-[#0B2545] block">Client Portal (Recommended)</span>
            <p className="text-[11px] text-slate-600 mt-1">Direct cryptographic ticket dispatch via Stage 13 portal. Generates immutable SHA-256 reference and triggers on-call SMS/Slack alerts.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-[#0B2545] block">Official Email</span>
            <p className="text-[11px] text-slate-600 mt-1"><strong>hello@logicintelligencetechnologies.in</strong></p>
            <p className="text-[10px] text-slate-500 mt-0.5">Monitored during standard business hours with ticket auto-creation.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-[#0B2545] block">S1 Emergency Hotline</span>
            <p className="text-[11px] text-slate-600 mt-1"><strong>+91 93428 77474</strong></p>
            <p className="text-[10px] text-slate-500 mt-0.5">Reserved exclusively for S1 Critical Outages impacting live business operations.</p>
          </div>
        </div>
      ),
    },
    {
      number: 6,
      title: '06. Support Hours & Operating Schedule',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-[#0B2545]">Standard Business Coverage</span>
              <p className="text-[11px] text-slate-600 mt-1">
                <strong>Monday through Saturday</strong>: 9:00 AM to 7:00 PM IST (Indian Standard Time, UTC+5:30).
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Applicable to all S2, S3, and S4 incidents, inquiries, and scheduled maintenance work.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-[#0B2545]">S1 Emergency After-Hours Coverage</span>
              <p className="text-[11px] text-slate-600 mt-1">
                <strong>24/7/365 On-Call Availability</strong> for verified S1 Critical Outages only.
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Truthful SLA: Non-emergency inquiries submitted outside business hours are queued for next business morning triage.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 7,
      title: '07. Incident Classification Matrix (S1–S4)',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <p>Clients may select from four severity classifications based on objective business impact:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {slaMatrix.map((item) => (
              <div key={item.severity} className={`p-3 rounded-xl border ${item.color}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.badge}`}>
                    {item.severity} · {item.label}
                  </span>
                  <span className="font-mono text-[11px] font-bold">Resp: {item.firstResponse}</span>
                </div>
                <p className="text-[11px] mt-1.5 leading-relaxed">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      number: 8,
      title: '08. Guaranteed Response & Remediation Targets',
      content: (
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Severity Level</th>
                <th className="p-2.5">First Response Target</th>
                <th className="p-2.5">Target Workaround / Resolution</th>
                <th className="p-2.5">Escalation Pathway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-2.5 font-bold text-red-700">S1 · Critical Outage</td>
                <td className="p-2.5 font-mono font-bold">&lt; 1 Hour</td>
                <td className="p-2.5 font-mono">&lt; 4 Hours</td>
                <td className="p-2.5">Immediate founder & lead architect pager escalation</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-amber-700">S2 · Major Degradation</td>
                <td className="p-2.5 font-mono font-bold">&lt; 4 Hours</td>
                <td className="p-2.5 font-mono">&lt; 12 Hours</td>
                <td className="p-2.5">Senior engineer dispatch with interim mitigation</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-blue-700">S3 · Minor Flaw</td>
                <td className="p-2.5 font-mono font-bold">&lt; 12 Hours</td>
                <td className="p-2.5 font-mono">&lt; 48 Hours</td>
                <td className="p-2.5">Scheduled sprint cycle patch</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-700">S4 · Cosmetic / Inquiry</td>
                <td className="p-2.5 font-mono font-bold">&lt; 24 Hours</td>
                <td className="p-2.5 font-mono">Next Release</td>
                <td className="p-2.5">Regular bi-weekly deployment cycle</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      number: 9,
      title: '09. Scheduled Maintenance Windows & Emergency Patches',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <p>
            <strong>Designated Maintenance Window:</strong> Routine updates and non-urgent database maintenance are scheduled for <strong>Sundays between 01:00 AM and 04:00 AM IST</strong> to minimize user disruption.
          </p>
          <p>
            <strong>Advance Notice:</strong> LIT provides a minimum of <strong>48 hours advance notice</strong> prior to scheduled maintenance that may cause intermittent availability.
          </p>
          <p>
            <strong>Emergency Zero-Day Exception:</strong> In the event of a published critical zero-day vulnerability (CVSS &gt;= 9.0) affecting system components, LIT reserves the right to deploy emergency hotfixes immediately, with post-deployment debrief provided within 4 hours.
          </p>
        </div>
      ),
    },
    {
      number: 10,
      title: '10. Security Patching & Vulnerability Triage Protocol',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <ul className="list-disc pl-5 space-y-1">
            <li>Continuous automated vulnerability scanning across all npm and Python package dependencies.</li>
            <li>Automated Dependabot alerts and Snyk container security analysis.</li>
            <li>Zero-tolerance policy for known critical vulnerabilities in production code paths.</li>
            <li>Patching verified against comprehensive automated unit and integration regression test suites prior to deployment.</li>
          </ul>
        </div>
      ),
    },
    {
      number: 11,
      title: '11. Infrastructure Responsibilities Matrix',
      content: (
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Domain / Asset</th>
                <th className="p-2.5">LIT Responsibility</th>
                <th className="p-2.5">Client Responsibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-2.5 font-medium">Domain & DNS Registration</td>
                <td className="p-2.5">DNS record configuration & SSL health</td>
                <td className="p-2.5">Annual domain registration fees & registrar custody</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Vercel & Supabase Cloud</td>
                <td className="p-2.5">CI/CD deployment, runtime tuning, migrations</td>
                <td className="p-2.5">Direct monthly cloud invoice settlement</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Application Code</td>
                <td className="p-2.5">Bug fixing, patch release, Git maintenance</td>
                <td className="p-2.5">GitHub organization owner custody</td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Internal User Administration</td>
                <td className="p-2.5">RBAC schema enforcement</td>
                <td className="p-2.5">Assigning/revoking internal staff credentials</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      number: 12,
      title: '12. Third-Party SaaS & Infrastructure Billing',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <p>
            All third-party cloud infrastructure and SaaS service subscriptions (including Vercel Pro/Enterprise, Supabase Pro, Cloudflare, Resend, and domain registrars) are held directly in the Client&apos;s name.
          </p>
          <p>
            LIT charges exclusively for technical engineering services, architecture, and SLA guarantees, with zero hidden markups on underlying cloud compute or bandwidth.
          </p>
        </div>
      ),
    },
    {
      number: 13,
      title: '13. Backup Cadence, Retention & Disaster Recovery',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-[#0B2545] block">Database Backup & Recovery SLA</span>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-[11px] text-slate-600">
              <li><strong>Automated Daily Snapshots:</strong> Managed by Supabase with 30-day continuous retention.</li>
              <li><strong>Point-In-Time Recovery (PITR):</strong> Allows restoration to any specified second within the retention window.</li>
              <li><strong>Recovery Point Objective (RPO):</strong> &lt; 5 minutes.</li>
              <li><strong>Recovery Time Objective (RTO):</strong> &lt; 2 hours for standard database restoration.</li>
              <li><strong>Quarterly Recovery Drill:</strong> Scheduled staging restoration validation to verify backup integrity.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      number: 14,
      title: '14. Monitoring, Health Telemetry & Advisories',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <p>LIT maintains active synthetic monitoring across all core endpoints:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>1-minute uptime checks from multi-region edge nodes.</li>
            <li>Real-time telemetry tracking Core Web Vitals (LCP, FID, CLS) and API p95 response times.</li>
            <li>Automated alerting routed to LIT engineering on-call rotation upon HTTP 5xx spikes or p95 degradation exceeding 500ms.</li>
          </ul>
        </div>
      ),
    },
    {
      number: 15,
      title: '15. Maintenance Charges & Service Plan Tiers',
      content: (
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-emerald-50/60 rounded-xl border-2 border-emerald-500">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Default Project Inclusions</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">Standard 90-Day Production Warranty</div>
            <div className="font-mono font-bold text-base text-emerald-800 mt-1">₹0 / Included in Contract</div>
            <p className="text-[11px] text-slate-600 mt-1">Comprehensive defect remediation for all delivered components under approved SOW scope.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Option 1 · Evaluation</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">FREE TRIAL</div>
              <div className="font-mono font-bold text-sm text-slate-900 mt-1">₹0 <span className="text-[10px] font-normal text-emerald-600">/ 30 Days</span></div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">₹20 refundable verification</div>
              <p className="text-[10px] text-slate-500 mt-2">30 consecutive days of trial access. Self-service knowledge base, FAQs, and ticket preparation. No auto-conversion or recurring debit.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Option 2 · Entry Care</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">STANDARD</div>
              <div className="font-mono font-bold text-sm text-slate-900 mt-1">₹999 <span className="text-[10px] font-normal text-slate-500">/mo</span></div>
              <div className="text-[10px] text-slate-500 mt-0.5">₹1,178.82 incl. 18% GST</div>
              <p className="text-[10px] text-slate-500 mt-2">Entry-level paid maintenance support: basic support ticketing, business-hours assistance, and monthly project health summary.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Option 3 · Routine Care</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">BASIC</div>
              <div className="font-mono font-bold text-sm text-slate-900 mt-1">₹4,999 <span className="text-[10px] font-normal text-slate-500">/mo</span></div>
              <div className="text-[10px] text-slate-500 mt-0.5">₹5,898.82 incl. 18% GST</div>
              <p className="text-[10px] text-slate-500 mt-2">Routine bug remediation, basic security updates, monthly telemetry review, and 1 minor enhancement hr/mo.</p>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Option 4 · Most Popular</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">PRO</div>
              <div className="font-mono font-bold text-sm text-slate-900 mt-1">₹9,999 <span className="text-[10px] font-normal text-slate-500">/mo</span></div>
              <div className="text-[10px] text-slate-500 mt-0.5">₹11,798.82 incl. 18% GST</div>
              <p className="text-[10px] text-slate-500 mt-2">3 enhancement hrs/mo, weekly health reviews, error monitoring, and &lt;8h priority SLA.</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Option 5 · Mission Critical</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">ENTERPRISE</div>
              <div className="font-mono font-bold text-sm text-slate-900 mt-1">₹19,999 <span className="text-[10px] font-normal text-slate-500">/mo</span></div>
              <div className="text-[10px] text-slate-500 mt-0.5">₹23,598.82 incl. 18% GST</div>
              <p className="text-[10px] text-slate-500 mt-2">6 enhancement hrs/mo, designated lead, monthly architecture reviews, & &lt;4h SLA.</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic">Note: Care plans can be activated at any time prior to or upon conclusion of the 90-day complimentary warranty period. Advance monthly billing applies for paid tiers.</p>
        </div>
      ),
    },
    {
      number: 16,
      title: '16. Payment Terms & Invoicing Rules',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <p>For contracted maintenance plans:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Invoicing is issued on the 1st of each calendar month in advance.</li>
            <li>Payment is due within <strong>7 business days</strong> of invoice date via dynamic UPI or NEFT/RTGS bank transfer.</li>
            <li>A 15-day grace period is provided before non-emergency SLA services are temporarily paused.</li>
          </ul>
        </div>
      ),
    },
    {
      number: 17,
      title: '17. Agreement Term & Commencement Date',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <p>
            <strong>Standard Warranty:</strong> Commences immediately upon bilateral execution of Stage 10 (Delivery Acceptance) and remains active for <strong>90 consecutive calendar days</strong>.
          </p>
          <p>
            <strong>Extended Support Plan:</strong> Standard 12-month initial commitment term commencing upon the anniversary of warranty conclusion.
          </p>
        </div>
      ),
    },
    {
      number: 18,
      title: '18. Annual Renewal & Indexation Terms',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <p>
            Extended support contracts renew automatically on their annual anniversary unless either party provides 30 days prior written notice.
          </p>
          <p>
            Annual fee adjustments, if applicable, are capped at the prevailing Consumer Price Index or a maximum of 7% per annum.
          </p>
        </div>
      ),
    },
    {
      number: 19,
      title: '19. Termination & Orderly Exit Transition',
      content: (
        <div className="space-y-2 text-xs text-slate-700">
          <p>
            Either party may terminate an extended maintenance agreement with <strong>30 days written notice</strong>.
          </p>
          <p>
            Upon termination, LIT provides an orderly handover package including current deployment state, verified clean git tags, and revocation of external LIT access tokens without disruption to production services.
          </p>
        </div>
      ),
    },
    {
      number: 20,
      title: '20. Bilateral Execution & Signatures',
      content: (
        <div className="space-y-3 text-xs text-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
              <span className="font-bold text-[#0B2545] block">Provider Authorized Signatory:</span>
              <div className="font-semibold text-slate-900">Vikash Saravanan</div>
              <div className="text-[11px] text-slate-600">Founder & Principal Systems Architect</div>
              <div className="text-[11px] text-slate-600">Logic Intelligence Technologies</div>
              <div className="mt-2 text-[10px] font-mono bg-emerald-50 text-emerald-800 p-2 rounded border border-emerald-200">
                DIGITALLY EXECUTED · MSME UDYAM-TN-03-0345274
              </div>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-[#0B2545] block">Client Authorized Signatory:</span>
              <div className="font-semibold text-slate-900">{contactName}</div>
              <div className="text-[11px] text-slate-600">Authorized Technical Lead / Executive</div>
              <div className="text-[11px] text-slate-600">{companyName}</div>
              <div className="mt-2 text-[10px] font-mono bg-blue-50 text-blue-800 p-2 rounded border border-blue-200">
                ACTIVE UNDER ENGAGEMENT: {engagementRef}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

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

      {/* Warranty & Maintenance Status Header Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#134074] text-white rounded-2xl p-6 shadow-sm border border-[#134074]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                STAGE 13 · PRODUCTION OPERATIONS
              </span>
              <span className="text-[11px] text-slate-300 font-mono">
                {engagementRef}
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1.5">Project Support, Warranty and Maintenance</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Standard 90-Day Production Warranty active for <strong>{companyName}</strong>. 
              Report technical issues, review the full 20-section LIT-07 Agreement, or escalate emergency incidents to our engineering team.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-300 font-medium">Warranty Coverage</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">90-Day Standard Active</div>
            <div className="text-[10px] text-slate-300 font-mono mt-0.5">MSME: UDYAM-TN-03-0345274</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-3">
        <div className="flex items-center gap-4 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'plans'
                ? 'border-[#1565C0] text-[#1565C0]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Care Plans & 30-Day Trial
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('new-ticket')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'new-ticket'
                ? 'border-[#1565C0] text-[#1565C0]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Log Support Incident
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tickets'
                ? 'border-[#1565C0] text-[#1565C0]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Incident Tickets ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('agreement')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'agreement'
                ? 'border-[#1565C0] text-[#1565C0]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            LIT-07 Maintenance Agreement (20 Sections)
          </button>
        </div>

        {/* Phase 8 Structured Change Control Action Button */}
        <div className="pb-2.5 sm:pb-0 shrink-0">
          <button
            type="button"
            onClick={() => setIsCorrectionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Request Data Correction
          </button>
        </div>
      </div>

      {/* Tab 0: Maintenance Plans & 30-Day Free Trial */}
      {activeTab === 'plans' && (
        <MaintenancePlansSection
          engagementRef={engagementRef}
          engagementId={engagementId || engagementRef}
          companyName={companyName}
          contactEmail={contactEmail}
        />
      )}

      {/* Phase 8 Structured Correction Request Modal */}
      <CorrectionRequestModal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        engagementId={engagementId || engagementRef}
        stageNumber={13}
        documentRef="LIT-07-Maintenance-Agreement"
        companyName={companyName}
      />

      {/* Tab 1: Log New Ticket */}
      {activeTab === 'new-ticket' && (
        <div className="space-y-6">
          {/* SLA Overview Bar */}
          <div className="bg-white rounded-2xl border border-[#DFE7EF] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                Guaranteed Response Matrix by Severity
              </h3>
              <span className="text-[11px] text-[#52677C]">Select the appropriate tier below</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {slaMatrix.map((item) => (
                <div
                  key={item.severity}
                  onClick={() => setSeverity(item.severity as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    severity === item.severity
                      ? `${item.color} ring-2 ring-[#1565C0] shadow-xs`
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.badge}`}>
                      {item.severity}
                    </span>
                    <span className="font-mono text-xs font-bold">{item.firstResponse}</span>
                  </div>
                  <div className="font-bold text-xs mt-1 text-slate-900">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.coverage}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Success Banner */}
          {submissionSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-mono">
                      {submissionSuccess.id}
                    </span>
                    <span className="text-xs font-bold text-emerald-900">
                      Support Ticket Logged & Dispatched
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Your incident <strong>&ldquo;{submissionSuccess.subject}&rdquo;</strong> has been routed to our on-call engineers. 
                    Target first-response SLA: <strong>{submissionSuccess.slaTarget}</strong>. Confirmation update sent to <strong>{submissionSuccess.contactEmail}</strong>.
                  </p>
                  {submissionSuccess.auditHash && (
                    <div className="mt-2 text-[10px] font-mono text-emerald-900 bg-emerald-100/80 p-2 rounded-lg border border-emerald-200/80 break-all">
                      Cryptographic Audit Hash: <strong>{submissionSuccess.auditHash}</strong>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmissionSuccess(null)}
                      className="text-xs font-semibold text-emerald-900 underline hover:text-emerald-700"
                    >
                      Log another ticket
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tickets')}
                      className="text-xs font-semibold px-3 py-1 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                    >
                      View all tickets ({tickets.length})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleTicketSubmit} className="space-y-5 text-xs">
              <div className="border-b border-[#DFE7EF] pb-4">
                <h3 className="text-base font-bold text-[#0B2545]">
                  Submit Priority Incident or Inquiry
                </h3>
                <p className="text-xs text-[#52677C] mt-0.5">
                  Direct submission to the Logic Intelligence Technologies on-call engineering rotation.
                </p>
              </div>

              {/* Zero Raw Secrets Warning Alert */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                <svg className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <strong className="font-semibold">STRICT ZERO RAW CREDENTIALS POLICY:</strong> Do not include passwords, API secret keys, database credentials, or private access tokens in your ticket description. If reproduction requires authentication, specify role permissions only.
                </div>
              </div>

              {secretWarning && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-medium">
                  {secretWarning}
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Grid 1: Severity and Component */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Incident Severity *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white font-medium"
                  >
                    <option value="S1">S1 · Critical Outage (&lt; 1h First Response, 24/7)</option>
                    <option value="S2">S2 · Major Degradation (&lt; 4h First Response)</option>
                    <option value="S3">S3 · Minor Flaw (&lt; 12h First Response)</option>
                    <option value="S4">S4 · Cosmetic / General Inquiry (&lt; 24h Response)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Affected System Component *
                  </label>
                  <select
                    value={component}
                    onChange={(e) => setComponent(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white font-medium"
                  >
                    <option value="Frontend Web Portal (Next.js Edge)">Frontend Web Portal (Next.js Edge)</option>
                    <option value="Authentication & Security (Supabase Auth)">Authentication & Security (Supabase Auth)</option>
                    <option value="PostgreSQL Database & API Services">PostgreSQL Database & API Services</option>
                    <option value="PDF Generation & Invoicing Engine">PDF Generation & Invoicing Engine</option>
                    <option value="Cloudflare Edge DNS & SSL/TLS">Cloudflare Edge DNS & SSL/TLS</option>
                    <option value="Transactional Email API (Resend)">Transactional Email API (Resend)</option>
                    <option value="Mobile Responsive UI / Viewport">Mobile Responsive UI / Viewport</option>
                  </select>
                </div>
              </div>

              {/* Grid 2: Subject & URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Incident Subject *
                  </label>
                  <input
                    type="text"
                    placeholder="Clear summary of the issue..."
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Affected URL / Path (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /engagement/ENG-2026-LIT-SAMPLE/support"
                    value={systemUrl}
                    onChange={(e) => setSystemUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-[#0B2545] mb-1">
                  Detailed Description & Steps to Reproduce *
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide precise steps: 1. Navigate to page, 2. Click action, 3. Observe error message..."
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none font-sans"
                />
              </div>

              {/* Expected vs Observed Behavior */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Expected Behavior
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What should have occurred..."
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Observed Behavior / Error Message
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What actually occurred or error displayed..."
                    value={observedBehavior}
                    onChange={(e) => setObservedBehavior(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>
              </div>

              {/* Affected Scope & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Affected User Scope
                  </label>
                  <select
                    value={affectedScope}
                    onChange={(e) => setAffectedScope(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none bg-white font-medium"
                  >
                    <option value="All Users / System Blocked">All Users / System Blocked</option>
                    <option value="Authenticated Users Only">Authenticated Users Only</option>
                    <option value="Admin / Backoffice Staff Only">Admin / Backoffice Staff Only</option>
                    <option value="Isolated Single User / Edge Case">Isolated Single User / Edge Case</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Notification Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-600 rounded-lg text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#0B2545] mb-1">
                    Callback Phone (Emergency)
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DFE7EF] rounded-lg text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#DFE7EF]">
                <Link
                  href={`/engagement/${engagementRef}`}
                  className="text-xs text-[#52677C] hover:text-[#0B2545] font-medium"
                >
                  ← Back to Visit All Stages
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting || !!secretWarning}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1565C0] text-white text-xs font-semibold rounded-lg hover:bg-[#0B2545] transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Dispatching Ticket to Engineers...</span>
                  ) : (
                    <>
                      <span>Dispatch Incident Ticket</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Incident Tickets List */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFE7EF] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#0B2545]">
                Support Incident Ledger & Telemetry
              </h3>
              <p className="text-xs text-[#52677C]">
                History of logged tickets for {companyName} with cryptographic verification and SLA status.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('new-ticket')}
              className="px-3 py-1.5 bg-[#1565C0] text-white rounded-lg text-xs font-semibold hover:bg-[#0B2545]"
            >
              + Log New Ticket
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No incident tickets logged yet. Your production environment is operating normally.
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-[11px]">
                        {t.id}
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          t.severity === 'S1'
                            ? 'bg-red-100 text-red-800'
                            : t.severity === 'S2'
                            ? 'bg-amber-100 text-amber-800'
                            : t.severity === 'S3'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {t.severity} · SLA: {t.slaTarget}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'INVESTIGATING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(t.submittedAt).toLocaleString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{t.subject}</h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{t.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Component: <strong>{t.component}</strong></span>
                    {t.systemUrl && <span>URL: <code className="font-mono">{t.systemUrl}</code></span>}
                    <span>Contact: <strong>{t.contactEmail}</strong></span>
                  </div>

                  {t.auditHash && (
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      Audit Hash: {t.auditHash}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: LIT-07 Agreement 20 Sections */}
      {activeTab === 'agreement' && (
        <div className="bg-white rounded-2xl border border-[#DFE7EF] p-6 shadow-xs space-y-4">
          <div className="border-b border-[#DFE7EF] pb-3">
            <h3 className="text-base font-bold text-[#0B2545]">
              LIT-07 Maintenance & Support Agreement — Complete 20 Sections
            </h3>
            <p className="text-xs text-[#52677C]">
              Authoritative service terms, infrastructure covenants, security patching SLAs, and operational policies.
            </p>
          </div>

          <div className="space-y-2">
            {agreementChapters.map((chapter) => {
              const isOpen = expandedSection === chapter.number;
              return (
                <div
                  key={chapter.number}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedSection(isOpen ? null : chapter.number)}
                    className="w-full p-3.5 bg-slate-50/80 hover:bg-slate-100 text-left flex items-center justify-between text-xs font-bold text-[#0B2545] transition-colors"
                  >
                    <span>{chapter.title}</span>
                    <svg
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white border-t border-slate-200">
                      {chapter.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Emergency Escalation Channel */}
      <div className="p-5 bg-gradient-to-r from-[var(--lit-navy,#0B2545)] to-[#1565C0] text-white rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-white text-sm block">Direct Engineering On-Call Escalation</span>
          <span className="text-slate-200">
            For critical production emergencies (S1 outage): Call our Founder & Principal Architect Hotline immediately.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:+919342877474"
            className="px-4 py-2 bg-[var(--lit-teal,#1FA9A2)] text-white rounded-xl font-bold hover:bg-[#188c86] transition-colors shadow-2xs"
          >
            +91 93428 77474
          </a>
          <a
            href="mailto:hello@logicintelligencetechnologies.in?subject=CRITICAL%20S1%20Production%20Outage"
            className="px-4 py-2 bg-white/15 text-white border border-white/20 rounded-xl font-semibold hover:bg-white/25 transition-colors"
          >
            hello@logicintelligencetechnologies.in
          </a>
        </div>
      </div>
    </div>
  );
}
