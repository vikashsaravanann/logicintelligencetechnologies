import { NextResponse } from 'next/server';
import { requireCapabilityApi } from '@/lib/auth/session';
import { submitQuotationTechnicalDraftForApproval } from '@/lib/quotations/technical-drafts';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(
    request,
    'quotation.technical_draft.submit_for_approval'
  );
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const result = await submitQuotationTechnicalDraftForApproval({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    actorRole: auth.session.role,
    draftId: id,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, draft: result.draft });
}
