import { NextRequest, NextResponse } from 'next/server';
import { reconcileEngagementStagePayment } from '@/lib/engagements/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      engagementRef,
      stageKey,
      actorName = 'Super Admin',
      reconciliationNotes,
      verifiedAmount,
      transactionRef,
    } = body;

    if (!engagementRef || !stageKey) {
      return NextResponse.json(
        { success: false, error: 'engagementRef and stageKey are required.' },
        { status: 400 }
      );
    }

    if (stageKey !== 'initial-invoice' && stageKey !== 'final-payment') {
      return NextResponse.json(
        {
          success: false,
          error: `Bank reconciliation is only supported for 'initial-invoice' or 'final-payment'. Received '${stageKey}'.`,
        },
        { status: 400 }
      );
    }

    const result = await reconcileEngagementStagePayment({
      engagementRef,
      stageKey,
      actorName,
      reconciliationNotes,
      verifiedAmount,
      transactionRef,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to reconcile bank payment.' },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error('[API POST /api/admin/payments/reconcile] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
