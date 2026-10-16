import { NextResponse } from 'next/server';
import { requireCapabilityApi } from '@/lib/auth/session';
import { approveAndIssueInvoiceFromPreparation } from '@/lib/invoices/preparation';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(request, 'invoice.issue');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const decision =
    body.decision === 'changes_requested' || body.decision === 'rejected'
      ? body.decision
      : 'approve_and_issue';

  const result = await approveAndIssueInvoiceFromPreparation({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    actorRole: auth.session.role,
    requestId: id,
    decision,
    approvedAmountPaise: body.approvedAmountPaise,
    approvalNotes: body.approvalNotes ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    decision: result.decision,
    request: result.request,
    invoice: result.invoice,
  });
}
