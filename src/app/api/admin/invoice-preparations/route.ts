import { NextResponse } from 'next/server';
import { requireCapabilityApi } from '@/lib/auth/session';
import {
  createInvoicePreparationRequest,
  listInvoicePreparationRequests,
  type InvoicePrepStatus,
} from '@/lib/invoices/preparation';

export async function GET(request: Request) {
  const auth = await requireCapabilityApi(request, 'invoice.preparation.read');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const engagementId = searchParams.get('engagementId') ?? undefined;
  const status = (searchParams.get('status') ?? undefined) as InvoicePrepStatus | undefined;

  const result = await listInvoicePreparationRequests({
    actorUserId: auth.session.userId,
    actorRole: auth.session.role,
    engagementId,
    status,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true, requests: result.requests });
}

export async function POST(request: Request) {
  const auth = await requireCapabilityApi(request, 'invoice.preparation.create');
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.message }, { status: auth.status });
  }

  const rawPayload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await createInvoicePreparationRequest({
    actorUserId: auth.session.userId,
    actorEmail: auth.session.email,
    actorRole: auth.session.role,
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

  return NextResponse.json({ ok: true, request: result.request }, { status: 201 });
}
