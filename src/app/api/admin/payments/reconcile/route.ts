import { NextRequest, NextResponse } from 'next/server';
import { reconcileEngagementStagePayment } from '@/lib/engagements/db';
import { requireCapabilityApi } from '@/lib/auth/session';
import { recordAdminAction } from '@/lib/admin/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Strictly require Super Admin / Staff 'payment.verify' capability
    const auth = await requireCapabilityApi(req, 'payment.verify');
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const {
      engagementRef,
      stageKey,
      reconciliationNotes,
      verifiedAmount,
      transactionRef,
    } = body;

    if (!engagementRef || typeof engagementRef !== 'string' || !engagementRef.trim()) {
      return NextResponse.json(
        { success: false, error: 'Valid engagementRef is required.' },
        { status: 400 }
      );
    }

    if (!stageKey || (stageKey !== 'initial-invoice' && stageKey !== 'final-payment')) {
      return NextResponse.json(
        {
          success: false,
          error: `Bank reconciliation is only supported for 'initial-invoice' or 'final-payment'. Received '${stageKey}'.`,
        },
        { status: 400 }
      );
    }

    if (!transactionRef || typeof transactionRef !== 'string' || !transactionRef.trim()) {
      return NextResponse.json(
        { success: false, error: 'Valid bank transaction reference (bank credit ref or UTR) is required.' },
        { status: 400 }
      );
    }

    const parsedAmount =
      verifiedAmount !== undefined && verifiedAmount !== null && !isNaN(Number(verifiedAmount)) && Number(verifiedAmount) > 0
        ? Number(verifiedAmount)
        : undefined;

    const verifiedActor = auth.session.email || auth.session.userId || 'Super Admin';

    const result = await reconcileEngagementStagePayment({
      engagementRef: engagementRef.trim(),
      stageKey,
      actorName: verifiedActor,
      reconciliationNotes: reconciliationNotes?.trim(),
      verifiedAmount: parsedAmount,
      transactionRef: transactionRef.trim(),
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to reconcile bank payment.' },
        { status: 400 }
      );
    }

    // Record immutable admin audit log
    await recordAdminAction({
      actor: { userId: auth.session.userId, email: auth.session.email, role: auth.session.role },
      action: 'payment.bank.reconcile',
      capability: 'payment.verify',
      target: { type: 'client_engagement_payment', id: `${engagementRef}-${stageKey}` },
      outcome: 'succeeded',
      metadata: {
        engagementRef,
        stageKey,
        transactionRef: transactionRef.trim(),
        verifiedAmount: parsedAmount,
        actor: verifiedActor,
      },
      request: req,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error('[API POST /api/admin/payments/reconcile] Error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
