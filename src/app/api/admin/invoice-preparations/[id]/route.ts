import { NextResponse } from 'next/server';
import { requireCapabilityApi } from '@/lib/auth/session';
import {
  getInvoicePreparationRequestById,
  updateInvoicePreparationRequest,
} from '@/lib/invoices/preparation';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(request, 'invoice.preparation.read');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const result = await getInvoicePreparationRequestById({
    actorUserId: auth.session.userId,
    actorRole: auth.session.role,
    requestId: id,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, request: result.request });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(request, 'invoice.preparation.update');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const rawPayload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await updateInvoicePreparationRequest({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    actorRole: auth.session.role,
    requestId: id,
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

  return NextResponse.json({ ok: true, request: result.request });
}
