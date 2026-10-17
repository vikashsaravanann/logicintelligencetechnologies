import { NextRequest, NextResponse } from 'next/server';
import { submitMaintenanceUtr } from '@/lib/subscriptions/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderRef, secureToken, declaredUtr, declaredPayeeName, paymentProofUrl } = body;

    if (!orderRef || !secureToken || !declaredUtr || !declaredPayeeName) {
      return NextResponse.json(
        { error: 'Missing required parameters: orderRef, secureToken, declaredUtr, declaredPayeeName are mandatory.' },
        { status: 400 }
      );
    }

    const updatedOrder = await submitMaintenanceUtr({
      orderRef,
      secureToken,
      declaredUtr,
      declaredPayeeName,
      paymentProofUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment report recorded. Your transaction is now pending Super Admin bank reconciliation.',
      order: updatedOrder,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
