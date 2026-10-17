import { NextRequest, NextResponse } from 'next/server';
import { createClientCorrectionRequest } from '@/lib/subscriptions/service';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getVerifiedClientUser } from '@/lib/auth/client-auth';

export async function POST(req: NextRequest) {
  try {
    const verifiedClient = await getVerifiedClientUser();
    const body = await req.json();
    const {
      engagementId,
      stageNumber,
      documentRef,
      affectedField,
      previousValue,
      requestedValue,
      explanation,
      supportingEvidenceUrl,
    } = body;

    if (!engagementId || !affectedField || !requestedValue || !explanation) {
      return NextResponse.json(
        { error: 'Missing required parameters: engagementId, affectedField, requestedValue, and explanation are required.' },
        { status: 400 }
      );
    }

    const clientId = verifiedClient ? verifiedClient.user.id : body.clientId || 'anonymous-client';

    const correction = await createClientCorrectionRequest({
      clientId,
      engagementId,
      stageNumber,
      documentRef,
      affectedField,
      previousValue,
      requestedValue,
      explanation,
      supportingEvidenceUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Correction request submitted for formal review.',
      correction,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const engagementId = searchParams.get('engagementId');

    let query = supabaseAdmin.from('client_correction_requests').select('*').order('created_at', { ascending: false });

    if (engagementId) {
      query = query.eq('engagement_id', engagementId);
    }

    const { data: corrections, error } = await query.limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      corrections: corrections || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
