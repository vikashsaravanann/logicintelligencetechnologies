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
      <main className="min-h-screen bg-[#070B14] text-slate-100 p-8">
        <div className="max-w-4xl mx-auto rounded-2xl border border-rose-500/40 bg-rose-950/20 p-8">
          <p className="text-xs font-mono uppercase tracking-widest text-rose-400">
            Policy 2 — Audited Staff Support View Enforcement
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Access Restricted to Assigned Staff
          </h1>
          <p className="mt-3 text-sm text-slate-300">{result.message}</p>
          <p className="mt-2 text-xs text-slate-400">
            This access attempt has been recorded in the immutable{' '}
            <code className="text-rose-300">staff_support_access_events</code> audit log under
            staff identity <code className="text-slate-200">{session.email ?? session.userId}</code>.
          </p>
          <div className="mt-6">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
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
    <main className="min-h-screen bg-[#070B14] text-slate-100 p-6 md:p-10 space-y-8">
      {/* Mandatory Non-Impersonation Persistent Banner */}
      <div
        role="status"
        aria-live="polite"
        data-testid="staff-support-view-banner"
        className="rounded-xl border border-amber-500/40 bg-amber-950/30 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
      >
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-amber-300">
            Audited Non-Impersonation Support Session
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-100">{ctx.banner}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber-200/90">
          <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1">
            Role: {ctx.actor.staff_role}
          </span>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-emerald-200">
            Financials Redacted
          </span>
        </div>
      </div>

      {/* Header & Client Technical Summary */}
      <header className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Client Technical Support Context
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">{ctx.client.company_name}</h1>
          <p className="text-sm text-slate-300 mt-1">
            {ctx.client.project_title} • Contact: {ctx.client.contact_name}{' '}
            {ctx.client.contact_email ? `(${ctx.client.contact_email})` : ''}
          </p>
          {ctx.client.engagement_ref && (
            <p className="mt-1 text-xs font-mono text-slate-400">
              Engagement Reference: {ctx.client.engagement_ref} • Stage {ctx.client.current_stage}/13
            </p>
          )}
        </div>
        <div className="text-right text-xs text-slate-400 space-y-1">
          <p>
            Assignment Role:{' '}
            <span className="font-mono text-slate-200">{ctx.assignment.assignment_role}</span>
          </p>
          <p>
            Technical Quotation Prep:{' '}
            <span className="font-mono text-slate-200">
              {ctx.assignment.can_prepare_technical_quotation ? 'Enabled' : 'No'}
            </span>
          </p>
          <p>
            Invoice Prep Request:{' '}
            <span className="font-mono text-slate-200">
              {ctx.assignment.can_prepare_invoice_request ? 'Enabled' : 'No'}
            </span>
          </p>
        </div>
      </header>

      {/* Server-Enforced Commercial Redaction Notice */}
      <section
        aria-label="Financial Redaction Policy Notice"
        className="rounded-xl border border-slate-800 bg-slate-950/80 p-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Commercial & Financial Data Boundary (Policy 2)
          </h2>
          <span className="text-xs font-mono text-rose-400">SERVER-SIDE REDACTED</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {ctx.financial_redaction.commercial_summary}
        </p>
      </section>

      {/* Technical Stages Overview */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          13-Stage Technical & Delivery Progression (Read-Only Support View)
        </h2>
        {ctx.technical_stages.length === 0 ? (
          <p className="text-sm text-slate-400">
            No stage records loaded for this client identifier yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ctx.technical_stages.map((stage) => (
              <div
                key={stage.stage_key}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400">
                    Stage {String(stage.stage_number).padStart(2, '0')} • {stage.stage_key}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-xs font-mono text-slate-300">
                    {stage.status}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{stage.display_name}</h3>
                {stage.is_financial_stage_redacted ? (
                  <p className="text-xs text-amber-300/90 font-mono">
                    [Commercial Stage Redacted — Super Admin Only]
                  </p>
                ) : (
                  <pre className="text-[11px] text-slate-400 overflow-x-auto bg-slate-900/70 rounded p-2">
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
