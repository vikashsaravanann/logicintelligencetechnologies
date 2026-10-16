import { NextResponse } from 'next/server';
import { requireCapabilityApi } from '@/lib/auth/session';
import { submitInvoicePreparationRequest } from '@/lib/invoices/preparation';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapabilityApi(
    request,
    'invoice.preparation.submit_for_approval'
  );
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { id } = await context.params;
  const result = await submitInvoicePreparationRequest({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    actorRole: auth.session.role,
    requestId: id,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, request: result.request });
}
