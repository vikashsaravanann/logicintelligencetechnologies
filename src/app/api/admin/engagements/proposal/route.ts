import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase/admin';
import { getEngagementByRef, getEngagementStages } from '@/lib/engagements/db';
import {
  calculateEngagementFinancials,
  validateExplicitSubtotalAmount,
} from '@/lib/engagements/financials';
import { requireCapabilityApi } from '@/lib/auth/session';
import { recordAdminAction } from '@/lib/admin/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireCapabilityApi(req, 'quotation.commercial.approve');
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.message }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const {
      engagementRef,
      proposalData,
      subtotal,
      gstApplicable,
      discountAmount,
      releaseToClient = false,
      notes,
    } = body;

    if (!engagementRef) {
      return NextResponse.json(
        { success: false, error: 'engagementRef is required' },
        { status: 400 }
      );
    }

    const subtotalCheck = validateExplicitSubtotalAmount(subtotal ?? proposalData?.subtotal);
    if (!subtotalCheck.ok) {
      return NextResponse.json(
        { success: false, error: subtotalCheck.error },
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

    const numericSubtotal = subtotalCheck.subtotal;
    const financials = calculateEngagementFinancials(numericSubtotal, {
      gstApplicable: typeof gstApplicable === 'boolean' ? gstApplicable : undefined,
      discountAmount: typeof discountAmount === 'number' ? discountAmount : 0,
    });

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
        prepared_by: auth.session.email ?? 'Super Admin',
      },
      contract_subtotal: financials.subtotal,
      contract_value: financials.totalFormatted,
      budget_range: financials.totalFormatted,
      gst_amount: financials.gstFormatted,
      deposit_amount: financials.depositFormatted,
      settlement_amount: financials.settlementFormatted,
      commercial_items: financials.scopeItems,
      proposal_released:
        releaseToClient ||
        Boolean((engagement.metadata as Record<string, unknown>)?.proposal_released),
      proposal_updated_at: now,
      pricing_notes: notes || 'Updated via Super Admin Proposal Builder',
    };

    if (isAdminClientConfigured()) {
      const updatePayload: Record<string, unknown> = {
        metadata: updatedMetadata,
        updated_at: now,
      };

      if (releaseToClient && engagement.current_stage === 'discovery') {
        updatePayload.current_stage = 'proposal';
      }

      const { error: engErr } = await supabaseAdmin
        .from('client_engagements')
        .update(updatePayload)
        .eq('id', engagement.id);

      if (engErr) {
        return NextResponse.json(
          { success: false, error: `Failed to update engagement proposal: ${engErr.message}` },
          { status: 500 }
        );
      }

      const stages = await getEngagementStages(engagement.id);
      const proposalStage = stages.find((s) => s.stage_key === 'proposal');
      if (proposalStage) {
        const stageUpdate: Record<string, unknown> = {
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

        if (
          releaseToClient &&
          (proposalStage.status === 'locked' || proposalStage.status === 'in_progress')
        ) {
          stageUpdate.status = 'available';
          stageUpdate.unlocked_at = proposalStage.unlocked_at || now;
        }

        const { error: stageErr } = await supabaseAdmin
          .from('engagement_stages')
          .update(stageUpdate)
          .eq('id', proposalStage.id);

        if (stageErr) {
          return NextResponse.json(
            { success: false, error: `Failed to update proposal stage: ${stageErr.message}` },
            { status: 500 }
          );
        }
      }
    }

    await recordAdminAction({
      actor: {
        userId: auth.session.userId,
        email: auth.session.email,
        role: auth.session.role,
      },
      action: releaseToClient ? 'proposal.release' : 'proposal.update',
      capability: 'quotation.commercial.approve',
      target: {
        type: 'client_engagement_proposal',
        id: engagementRef,
      },
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

