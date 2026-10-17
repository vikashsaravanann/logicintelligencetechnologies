import React from 'react';
import Link from 'next/link';
import { requireCapabilityPage } from '@/lib/auth/session';
import { getRedactedStaffSupportContext } from '@/lib/support/staff-support';

export const dynamic = 'force-dynamic';

export default async function StaffSupportClientViewPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const session = await requireCapabilityPage(
    'support.assigned_client.read',
    `/admin/support/clients/${clientId}`
  );

  const result = await getRedactedStaffSupportContext({
    staffUserId: session.userId,
    staffEmail: session.email,
    staffRole: session.role,
    clientId,
    route: `/admin/support/clients/${clientId}`,
    reason: 'Server component Staff Support View access',
  });

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] p-8">
        <div className="max-w-4xl mx-auto rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-xs">
          <p className="text-xs font-mono uppercase tracking-widest text-rose-700 font-bold">
            Policy 2 — Audited Staff Support View Enforcement
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--lit-navy,#0B2545)]">
            Access Restricted to Assigned Staff
          </h1>
          <p className="mt-3 text-sm text-[var(--lit-text-muted,#4A607A)]">{result.message}</p>
          <p className="mt-2 text-xs text-slate-500">
            This access attempt has been recorded in the immutable{' '}
            <code className="text-rose-700 font-semibold">staff_support_access_events</code> audit log under
            staff identity <code className="text-[var(--lit-navy,#0B2545)] font-semibold">{session.email ?? session.userId}</code>.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/command-center"
              className="inline-flex items-center rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-4 py-2 text-xs font-semibold text-[var(--lit-navy,#0B2545)] hover:bg-slate-50 shadow-2xs transition-colors"
            >
              Return to Command Center
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const ctx = result.data;

  return (
    <main className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] p-6 md:p-10 space-y-8">
      {/* Mandatory Non-Impersonation Persistent Banner */}
      <div
        role="status"
        aria-live="polite"
        data-testid="staff-support-view-banner"
        className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-2xs"
      >
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-amber-800 font-bold">
            Audited Non-Impersonation Support Session
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-950">{ctx.banner}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber-900">
          <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 font-semibold">
            Role: {ctx.actor.staff_role}
          </span>
          <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-emerald-800 font-semibold">
            Financials Redacted
          </span>
        </div>
      </div>

      {/* Header & Client Technical Summary */}
      <header className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--lit-teal,#1FA9A2)] font-bold">
            Client Technical Support Context
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--lit-navy,#0B2545)]">{ctx.client.company_name}</h1>
          <p className="text-sm text-[var(--lit-text-muted,#4A607A)] mt-1 font-medium">
            {ctx.client.project_title} • Contact: {ctx.client.contact_name}{' '}
            {ctx.client.contact_email ? `(${ctx.client.contact_email})` : ''}
          </p>
          {ctx.client.engagement_ref && (
            <p className="mt-1 text-xs font-mono text-slate-500">
              Engagement Reference: {ctx.client.engagement_ref} • Stage {ctx.client.current_stage}/13
            </p>
          )}
        </div>
        <div className="text-right text-xs text-[var(--lit-text-muted,#4A607A)] space-y-1">
          <p>
            Assignment Role:{' '}
            <span className="font-mono text-[var(--lit-navy,#0B2545)] font-semibold">{ctx.assignment.assignment_role}</span>
          </p>
          <p>
            Technical Quotation Prep:{' '}
            <span className="font-mono text-[var(--lit-navy,#0B2545)] font-semibold">
              {ctx.assignment.can_prepare_technical_quotation ? 'Enabled' : 'No'}
            </span>
          </p>
          <p>
            Invoice Prep Request:{' '}
            <span className="font-mono text-[var(--lit-navy,#0B2545)] font-semibold">
              {ctx.assignment.can_prepare_invoice_request ? 'Enabled' : 'No'}
            </span>
          </p>
        </div>
      </header>

      {/* Server-Enforced Commercial Redaction Notice */}
      <section
        aria-label="Financial Redaction Policy Notice"
        className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-5 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
            Commercial & Financial Data Boundary (Policy 2)
          </h2>
          <span className="text-xs font-mono text-rose-600 font-bold">SERVER-SIDE REDACTED</span>
        </div>
        <p className="mt-2 text-xs text-[var(--lit-text-muted,#4A607A)]">
          {ctx.financial_redaction.commercial_summary}
        </p>
      </section>

      {/* Technical Stages Overview */}
      <section className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-4 shadow-xs">
        <h2 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">
          13-Stage Technical & Delivery Progression (Read-Only Support View)
        </h2>
        {ctx.technical_stages.length === 0 ? (
          <p className="text-sm text-[var(--lit-text-muted,#4A607A)]">
            No stage records loaded for this client identifier yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ctx.technical_stages.map((stage) => (
              <div
                key={stage.stage_key}
                className="rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[var(--lit-teal,#1FA9A2)] font-bold">
                    Stage {String(stage.stage_number).padStart(2, '0')} • {stage.stage_key}
                  </span>
                  <span className="rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white px-2.5 py-0.5 text-xs font-mono text-[var(--lit-navy,#0B2545)] font-semibold shadow-2xs">
                    {stage.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--lit-navy,#0B2545)]">{stage.display_name}</h3>
                {stage.is_financial_stage_redacted ? (
                  <p className="text-xs text-amber-700 font-mono font-medium">
                    [Commercial Stage Redacted — Super Admin Only]
                  </p>
                ) : (
                  <pre className="text-[11px] text-[var(--lit-text-muted,#4A607A)] overflow-x-auto bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded p-2">
                    {JSON.stringify(stage.technical_data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
