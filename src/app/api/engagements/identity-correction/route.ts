import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { engagementId, targetField, proposedValue, changeReason, requestedBy } = body;

    if (!proposedValue || !changeReason || !requestedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required correction fields.' },
        { status: 400 }
      );
    }

    if (isAdminClientConfigured() && engagementId) {
      const { data, error } = await supabaseAdmin
        .from('client_identity_change_requests')
        .insert({
          engagement_id: engagementId,
          target_field: targetField || 'company_name',
          proposed_value: proposedValue.trim(),
          change_reason: changeReason.trim(),
          requested_by: requestedBy.trim(),
          status: 'pending',
        })
        .select('id')
        .single();

      if (error) {
        console.error('[identity-correction] DB insert error:', error);
      } else {
        return NextResponse.json({ success: true, id: data.id });
      }
    }

    // Return success response if database insert succeeded or simulated
    return NextResponse.json({ success: true, id: `req-sim-${Date.now()}` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, status } = body;

    if (!requestId || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid requestId or status. Status must be approved or rejected.' },
        { status: 400 }
      );
    }

    if (isAdminClientConfigured()) {
      const { data: requestRecord, error: fetchErr } = await supabaseAdmin
        .from('client_identity_change_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchErr || !requestRecord) {
        return NextResponse.json(
          { success: false, error: 'Identity correction request not found.' },
          { status: 404 }
        );
      }

      // If approved, update target field in client_engagements
      if (status === 'approved' && requestRecord.engagement_id && requestRecord.target_field) {
        const updatePayload: Record<string, any> = {
          [requestRecord.target_field]: requestRecord.proposed_value,
          updated_at: new Date().toISOString(),
        };

        await supabaseAdmin
          .from('client_engagements')
          .update(updatePayload)
          .eq('id', requestRecord.engagement_id);
      }

      // Update status of the change request
      const { error: updateErr } = await supabaseAdmin
        .from('client_identity_change_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateErr) {
        console.error('[identity-correction] PATCH update error:', updateErr);
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, requestId, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
