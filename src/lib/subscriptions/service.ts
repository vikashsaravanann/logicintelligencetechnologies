import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  PlanIdentifier,
  MAINTENANCE_PLANS,
  calculatePlanPricing,
  formatPaiseToInr,
} from '@/config/maintenance-plans';
import { buildUpiUri, LIT_PAYEE_CONFIG } from '@/lib/payments/upi';

export interface CreateOrderParams {
  clientId: string;
  engagementId: string;
  planId: PlanIdentifier;
  consentConfirmed?: boolean;
}

export interface SubmitUtrParams {
  orderRef: string;
  secureToken: string;
  declaredUtr: string;
  declaredPayeeName: string;
  paymentProofUrl?: string;
}

export interface VerifyOrderParams {
  orderId: string;
  adminUserId: string;
  bankReconciliationRef: string;
  notes?: string;
}

export interface ProcessRefundParams {
  subscriptionId: string;
  adminUserId: string;
  refundStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_review_required';
  refundReference?: string;
  refundNotes?: string;
}

export interface CreateCorrectionParams {
  clientId: string;
  engagementId: string;
  stageNumber?: number;
  documentRef?: string;
  affectedField: string;
  previousValue?: string;
  requestedValue: string;
  explanation: string;
  supportingEvidenceUrl?: string;
}

/**
 * Create or reuse an unfulfilled maintenance order
 */
export async function createOrGetMaintenanceOrder(params: CreateOrderParams) {
  const { clientId, engagementId, planId, consentConfirmed = true } = params;
  const pricing = calculatePlanPricing(planId);

  // Check if there is an active pending order with same plan and client
  const { data: existingOrders, error: findError } = await supabaseAdmin
    .from('maintenance_orders')
    .select('*')
    .eq('client_id', clientId)
    .eq('engagement_id', engagementId)
    .eq('plan_id', planId)
    .in('status', ['pending_payment', 'verification_pending'])
    .order('created_at', { ascending: false })
    .limit(1);

  if (!findError && existingOrders && existingOrders.length > 0) {
    const existing = existingOrders[0];
    return {
      order: existing,
      pricing,
      upiUri: existing.upi_uri,
      isExisting: true,
    };
  }

  const tokenBytes = crypto.randomBytes(24).toString('hex');
  const secureToken = `mnt_sec_${tokenBytes}`;
  const timestampShort = Date.now().toString(36).toUpperCase();
  const randShort = crypto.randomBytes(3).toString('hex').toUpperCase();
  const orderRef = `LIT-MNT-${timestampShort}-${randShort}`;

  const orderType = planId === 'FREE_TRIAL' ? 'trial_verification' : 'subscription_initial';

  // Construct NPCI UPI URI
  const upiUri = buildUpiUri({
    payeeVpa: LIT_PAYEE_CONFIG.upiId,
    payeeName: LIT_PAYEE_CONFIG.accountHolder,
    amount: pricing.totalPricePaise / 100,
    transactionRef: orderRef,
    transactionNote: `${MAINTENANCE_PLANS[planId].name} (${orderRef})`,
  });

  const { data: newOrder, error: insertError } = await supabaseAdmin
    .from('maintenance_orders')
    .insert({
      order_ref: orderRef,
      client_id: clientId,
      engagement_id: engagementId,
      plan_id: planId,
      order_type: orderType,
      base_amount_paise: pricing.basePricePaise,
      gst_amount_paise: pricing.gstAmountPaise,
      total_amount_paise: pricing.totalPricePaise,
      currency: 'INR',
      secure_token: secureToken,
      upi_uri: upiUri,
      status: 'pending_payment',
      consent_confirmed: consentConfirmed,
      consent_timestamp: new Date().toISOString(),
      metadata: {
        plan_name: pricing.name,
        refundable_paise: pricing.refundablePaise,
        sla_target: pricing.slaResponseTime,
      },
    })
    .select('*')
    .single();

  if (insertError || !newOrder) {
    throw new Error(`Failed to create maintenance order: ${insertError?.message || 'Unknown database error'}`);
  }

  // Queue initial order registration acknowledgment email in outbox
  await supabaseAdmin.from('email_outbox').insert({
    recipient_email: 'hello@logicintelligencetechnologies.in', // Admin copy
    template_id: 'maintenance-order-registered',
    subject: `New Maintenance Order Registered: ${orderRef} (${pricing.name})`,
    status: 'queued',
    payload: {
      orderRef,
      planId,
      planName: pricing.name,
      totalFormatted: pricing.formattedTotal,
      clientId,
      engagementId,
    },
    metadata: { orderRef, planId },
  });

  return {
    order: newOrder,
    pricing,
    upiUri,
    isExisting: false,
  };
}

/**
 * Submit UTR payment proof for a maintenance order
 */
export async function submitMaintenanceUtr(params: SubmitUtrParams) {
  const { orderRef, secureToken, declaredUtr, declaredPayeeName, paymentProofUrl } = params;

  // Clean UTR
  const cleanUtr = declaredUtr.trim().toUpperCase();
  if (cleanUtr.length < 8) {
    throw new Error('Please enter a valid UPI UTR or bank transaction reference (minimum 8 characters).');
  }

  // Query order by secureToken and orderRef
  const { data: order, error: queryError } = await supabaseAdmin
    .from('maintenance_orders')
    .select('*')
    .eq('order_ref', orderRef)
    .single();

  if (queryError || !order) {
    throw new Error('Maintenance order not found.');
  }

  if (order.secure_token !== secureToken.trim()) {
    throw new Error('Unauthorized: Invalid cryptographic security token for this payment order.');
  }

  if (order.status === 'verified') {
    throw new Error('This order has already been verified and settled by Super Admin.');
  }

  const { data: updatedOrder, error: updateError } = await supabaseAdmin
    .from('maintenance_orders')
    .update({
      declared_utr: cleanUtr,
      declared_payee_name: declaredPayeeName.trim(),
      declared_payment_time: new Date().toISOString(),
      payment_proof_url: paymentProofUrl || null,
      status: 'verification_pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .select('*')
    .single();

  if (updateError || !updatedOrder) {
    throw new Error(`Failed to update payment status: ${updateError?.message || 'Database error'}`);
  }

  // Queue Super Admin payment review notification
  await supabaseAdmin.from('email_outbox').insert({
    recipient_email: 'support@logicintelligencetechnologies.in',
    template_id: 'maintenance-payment-reported',
    subject: `[ACTION REQUIRED] Maintenance Payment Reported: ${cleanUtr} (${orderRef})`,
    status: 'queued',
    payload: {
      orderRef,
      planId: order.plan_id,
      declaredUtr: cleanUtr,
      amountPaise: order.total_amount_paise,
      amountFormatted: formatPaiseToInr(order.total_amount_paise),
    },
    metadata: { orderRef, utr: cleanUtr },
  });

  return updatedOrder;
}

/**
 * Retrieve current active subscription & free trial state for an engagement
 */
export async function getClientActiveSubscription(engagementId: string) {
  const { data: subscriptions, error } = await supabaseAdmin
    .from('maintenance_subscriptions')
    .select('*')
    .eq('engagement_id', engagementId)
    .in('status', ['active', 'pending_verification', 'grace_period', 'expired'])
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !subscriptions || subscriptions.length === 0) {
    return null;
  }

  const sub = subscriptions[0];
  const now = new Date();
  let daysRemaining = 0;

  if (sub.status === 'active') {
    const expiryDate = sub.plan_id === 'FREE_TRIAL'
      ? new Date(sub.trial_expires_at || now)
      : new Date(sub.current_period_end || now);

    const diffMs = expiryDate.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  return {
    ...sub,
    daysRemaining,
    planDetails: MAINTENANCE_PLANS[sub.plan_id as PlanIdentifier] || null,
  };
}

/**
 * Super Admin authorizes bank reconciliation and activates trial or subscription
 */
export async function verifyMaintenanceOrderAndActivate(params: VerifyOrderParams) {
  const { orderId, adminUserId, bankReconciliationRef, notes } = params;

  const { data: order, error: orderError } = await supabaseAdmin
    .from('maintenance_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Maintenance order not found.');
  }

  if (order.status === 'verified') {
    throw new Error('This order has already been verified.');
  }

  const nowIso = new Date().toISOString();
  const plan = MAINTENANCE_PLANS[order.plan_id as PlanIdentifier];
  if (!plan) {
    throw new Error(`Unrecognized plan ID: ${order.plan_id}`);
  }

  // Update order to verified
  const { error: orderUpdateErr } = await supabaseAdmin
    .from('maintenance_orders')
    .update({
      status: 'verified',
      verified_by: adminUserId,
      verified_at: nowIso,
      bank_reconciliation_ref: bankReconciliationRef.trim(),
      metadata: {
        ...order.metadata,
        admin_notes: notes || null,
      },
      updated_at: nowIso,
    })
    .eq('id', order.id);

  if (orderUpdateErr) {
    throw new Error(`Failed to verify order: ${orderUpdateErr.message}`);
  }

  // Calculate activation dates
  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(startDate.getDate() + plan.durationDays);

  const isFreeTrial = plan.planType === 'free_trial';

  // Upsert subscription
  const subscriptionPayload = {
    client_id: order.client_id,
    engagement_id: order.engagement_id,
    plan_id: order.plan_id,
    plan_version: 'v1.0',
    status: 'active',
    trial_started_at: isFreeTrial ? nowIso : null,
    trial_expires_at: isFreeTrial ? expiryDate.toISOString() : null,
    started_at: !isFreeTrial ? nowIso : null,
    current_period_start: nowIso,
    current_period_end: expiryDate.toISOString(),
    next_invoice_date: !isFreeTrial ? expiryDate.toISOString() : null,
    payment_due_date: !isFreeTrial ? expiryDate.toISOString() : null,
    enhancement_hours_allocated: plan.enhancementHoursMonthly,
    enhancement_hours_used: 0.00,
    verification_payment_request_id: order.id,
    refund_status: isFreeTrial ? 'pending' : 'not_applicable',
    refund_notes: isFreeTrial ? 'Pending Super Admin ₹20 refund dispatch' : null,
    updated_at: nowIso,
  };

  const { data: sub, error: subError } = await supabaseAdmin
    .from('maintenance_subscriptions')
    .insert(subscriptionPayload)
    .select('*')
    .single();

  if (subError || !sub) {
    throw new Error(`Failed to activate subscription: ${subError?.message || 'Database error'}`);
  }

  // Link subscription ID back to order
  await supabaseAdmin
    .from('maintenance_orders')
    .update({ subscription_id: sub.id })
    .eq('id', order.id);

  // Queue activation confirmation email
  await supabaseAdmin.from('email_outbox').insert({
    recipient_email: 'hello@logicintelligencetechnologies.in',
    template_id: isFreeTrial ? 'trial-activated' : 'subscription-activated',
    subject: isFreeTrial
      ? `Standard Free Trial Activated — 30 Days (Order ${order.order_ref})`
      : `${plan.name} Activated (Order ${order.order_ref})`,
    status: 'queued',
    payload: {
      orderRef: order.order_ref,
      planName: plan.name,
      planId: plan.id,
      activationDate: nowIso,
      expiryDate: expiryDate.toISOString(),
      refundable: isFreeTrial ? '₹20.00 (Queued for Refund)' : 'N/A',
    },
    metadata: { orderId: order.id, subscriptionId: sub.id },
  });

  return {
    order,
    subscription: sub,
  };
}

/**
 * Super Admin processes or marks completed the ₹20 trial refund
 */
export async function processSubscriptionRefund(params: ProcessRefundParams) {
  const { subscriptionId, refundStatus, refundReference, refundNotes } = params;

  const nowIso = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    refund_status: refundStatus,
    refund_notes: refundNotes || null,
    updated_at: nowIso,
  };

  if (refundStatus === 'processing' || refundStatus === 'pending') {
    updateData.refund_initiated_at = nowIso;
  }
  if (refundStatus === 'completed') {
    updateData.refund_completed_at = nowIso;
    updateData.refund_reference = refundReference || `REF-${Date.now().toString(36).toUpperCase()}`;
  }

  const { data: updatedSub, error } = await supabaseAdmin
    .from('maintenance_subscriptions')
    .update(updateData)
    .eq('id', subscriptionId)
    .select('*')
    .single();

  if (error || !updatedSub) {
    throw new Error(`Failed to update refund status: ${error?.message || 'Database error'}`);
  }

  if (refundStatus === 'completed') {
    await supabaseAdmin.from('email_outbox').insert({
      recipient_email: 'hello@logicintelligencetechnologies.in',
      template_id: 'trial-refund-completed',
      subject: `₹20 Verification Refund Completed (Ref: ${updatedSub.refund_reference})`,
      status: 'queued',
      payload: {
        subscriptionId: updatedSub.id,
        refundReference: updatedSub.refund_reference,
        completedAt: nowIso,
      },
      metadata: { subscriptionId },
    });
  }

  return updatedSub;
}

/**
 * Submit structured client correction request (Phase 8 Change Control)
 */
export async function createClientCorrectionRequest(params: CreateCorrectionParams) {
  const {
    clientId,
    engagementId,
    stageNumber,
    documentRef,
    affectedField,
    previousValue,
    requestedValue,
    explanation,
    supportingEvidenceUrl,
  } = params;

  const timestampShort = Date.now().toString(36).toUpperCase();
  const randShort = crypto.randomBytes(3).toString('hex').toUpperCase();
  const requestRef = `CORR-${timestampShort}-${randShort}`;

  const { data: correction, error } = await supabaseAdmin
    .from('client_correction_requests')
    .insert({
      request_ref: requestRef,
      client_id: clientId,
      engagement_id: engagementId,
      stage_number: stageNumber || null,
      document_ref: documentRef || null,
      affected_field: affectedField.trim(),
      previous_value: previousValue || null,
      requested_value: requestedValue.trim(),
      explanation: explanation.trim(),
      supporting_evidence_url: supportingEvidenceUrl || null,
      status: 'submitted',
    })
    .select('*')
    .single();

  if (error || !correction) {
    throw new Error(`Failed to submit correction request: ${error?.message || 'Database error'}`);
  }

  await supabaseAdmin.from('email_outbox').insert({
    recipient_email: 'support@logicintelligencetechnologies.in',
    template_id: 'correction-request-submitted',
    subject: `[CHANGE CONTROL] Correction Requested: ${requestRef} (${affectedField})`,
    status: 'queued',
    payload: {
      requestRef,
      affectedField,
      requestedValue,
      engagementId,
      clientId,
    },
    metadata: { requestRef },
  });

  return correction;
}
