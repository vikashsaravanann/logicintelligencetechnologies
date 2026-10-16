import { NextResponse } from 'next/server';
import { requireCapabilityApi } from '@/lib/auth/session';
import {
  getQuotationTechnicalDraftById,
  updateQuotationTechnicalDraft,
} from '@/lib/quotations/technical-drafts';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(request, 'quotation.technical_draft.read');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const result = await getQuotationTechnicalDraftById({
    actorUserId: auth.session.userId,
    actorRole: auth.session.role,
    draftId: id,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, draft: result.draft });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(request, 'quotation.technical_draft.update');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const rawPayload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await updateQuotationTechnicalDraft({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    actorRole: auth.session.role,
    draftId: id,
    rawPayload,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.message,
        forbiddenFields: result.forbiddenFields,
      },
      { status: result.status }
    );
  }

  return NextResponse.json({ ok: true, draft: result.draft });
}
