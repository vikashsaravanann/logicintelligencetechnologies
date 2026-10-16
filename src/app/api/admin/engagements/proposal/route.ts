import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase/admin';
import { getEngagementByRef, getEngagementStages } from '@/lib/engagements/db';
import { calculateEngagementFinancials } from '@/lib/engagements/financials';
import { requireCapabilityApi } from '@/lib/auth/session';
import { recordAdminAction } from '@/lib/admin/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireCapabilityApi(req, 'proposals.write');
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const {
      engagementRef,
      proposalData,
      subtotal,
      releaseToClient = false,
      notes,
    } = body;

    if (!engagementRef) {
      return NextResponse.json(
        { success: false, error: 'engagementRef is required' },
        { status: 400 }
      );
    }

    const engagement = await getEngagementByRef(engagementRef);
    if (!engagement) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found' },
        { status: 404 }
      );
    }

    const numericSubtotal =
      typeof subtotal === 'number'
        ? subtotal
        : parseFloat(String(subtotal || proposalData?.subtotal || '').replace(/[^0-9.]/g, '')) || 50;

    const financials = calculateEngagementFinancials(numericSubtotal);

    const now = new Date().toISOString();
    const updatedMetadata = {
      ...(engagement.metadata || {}),
      proposal_data: {
        ...(proposalData || {}),
        subtotal: financials.subtotal,
        totalPayable: financials.totalFormatted,
        deposit: financials.depositFormatted,
        settlement: financials.settlementFormatted,
        last_prepared_at: now,
        prepared_by: 'Super Admin',
      },
      contract_subtotal: financials.subtotal,
      contract_value: financials.totalFormatted,
      budget_range: financials.totalFormatted,
      gst_amount: financials.gstFormatted,
      deposit_amount: financials.depositFormatted,
      settlement_amount: financials.settlementFormatted,
      commercial_items: financials.scopeItems,
      proposal_released: releaseToClient || Boolean((engagement.metadata as Record<string, any>)?.proposal_released),
      proposal_updated_at: now,
      pricing_notes: notes || 'Updated via Admin Proposal Builder',
    };

    if (isAdminClientConfigured()) {
      // 1. Update client_engagements record
      const updatePayload: Record<string, any> = {
        metadata: updatedMetadata,
        updated_at: now,
      };

      if (releaseToClient && engagement.current_stage === 'discovery') {
        updatePayload.current_stage = 'proposal';
      }

      await supabaseAdmin
        .from('client_engagements')
        .update(updatePayload)
        .eq('id', engagement.id);

      // 2. Update proposal stage record & snapshot
      const stages = await getEngagementStages(engagement.id);
      const proposalStage = stages.find((s) => s.stage_key === 'proposal');
      if (proposalStage) {
        const stageUpdate: Record<string, any> = {
          snapshot: {
            ...(proposalStage.snapshot || {}),
            customProposal: proposalData || {},
            subtotal: financials.subtotalFormatted,
            gst: financials.gstFormatted,
            totalPayable: financials.totalFormatted,
            deposit: financials.depositFormatted,
            settlement: financials.settlementFormatted,
            commercialItems: financials.scopeItems,
            last_updated_at: now,
          },
          updated_at: now,
        };

        if (releaseToClient && (proposalStage.status === 'locked' || proposalStage.status === 'in_progress')) {
          stageUpdate.status = 'available';
          stageUpdate.unlocked_at = proposalStage.unlocked_at || now;
        }

        await supabaseAdmin
          .from('engagement_stages')
          .update(stageUpdate)
          .eq('id', proposalStage.id);
      }
    }

    await recordAdminAction({
      actor: {
        userId: auth.session.userId,
        email: auth.session.email,
        role: auth.session.role,
      },
      action: releaseToClient ? 'proposal.release' : 'proposal.update',
      capability: 'proposals.write',
      target: { type: 'client_engagement_proposal', id: engagementRef },
      metadata: {
        numericSubtotal,
        totalPayable: financials.totalFormatted,
        depositAmount: financials.depositFormatted,
        releaseToClient,
      },
      outcome: 'succeeded',
    });

    return NextResponse.json({
      success: true,
      financials,
      message: releaseToClient
        ? '✓ Proposal prepared and released to client successfully! Stage 03 is now unlocked for the client.'
        : '✓ Proposal draft saved successfully for this client.',
    });
  } catch (err: unknown) {
    console.error('[API POST /api/admin/engagements/proposal] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to save proposal';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
