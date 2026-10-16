import { NextResponse } from 'next/server';
import { requireCapabilityApi } from '@/lib/auth/session';
import { approveAndPriceQuotationBySuperAdmin } from '@/lib/quotations/technical-drafts';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(request, 'quotation.commercial.approve');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));

  const decision =
    body.decision === 'changes_requested' || body.decision === 'rejected'
      ? body.decision
      : 'approved';

  const result = await approveAndPriceQuotationBySuperAdmin({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    actorRole: auth.session.role,
    quotationId: id,
    technicalDraftId: body.technicalDraftId ?? null,
    decision,
    pricedLineItems: Array.isArray(body.pricedLineItems) ? body.pricedLineItems : [],
    discountPaise: body.discountPaise,
    couponCode: body.couponCode ?? null,
    gstApplicable: body.gstApplicable,
    gstRateBps: body.gstRateBps,
    commercialNotes: body.commercialNotes ?? null,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    decision: result.decision,
    approval: result.approval,
    draft: result.draft,
  });
}
