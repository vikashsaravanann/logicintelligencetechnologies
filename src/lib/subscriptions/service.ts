import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  PlanIdentifier,
  MAINTENANCE_PLANS,
  calculatePlanPricing,
  formatPaiseToInr,
} from '@/config/maintenance-plans';
import { buildUpiUri, LIT_PAYEE_CONFIG } from '@/lib/payments/upi';
import { recordAdminAction } from '@/lib/admin/audit';

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
  bankReconciliationRef?: string;
  bankReference?: string;
  creditedPaise?: number;
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

  const planDef = MAINTENANCE_PLANS[planId];
  const isFreeTrial = planDef.planType === 'free_trial' || planId === 'FREE_TRIAL';

  // If selecting Free Trial, verify eligibility: cannot have an existing active or historical trial (BILL04)
  if (isFreeTrial) {
    const { data: existingTrials } = await supabaseAdmin
      .from('maintenance_subscriptions')
      .select('id, plan_id, status, trial_expires_at')
      .eq('engagement_id', engagementId)
      .eq('plan_id', 'FREE_TRIAL')
      .in('status', ['active', 'pending_verification', 'grace_period', 'expired', 'completed', 'cancelled'])
      .limit(1);

    if (existingTrials && existingTrials.length > 0) {
      throw new Error('A 30-Day Free Trial has already been evaluated or is currently active for this engagement. Duplicate trial orders are prohibited.');
    }
  }

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

  const orderType = isFreeTrial ? 'trial_verification' : 'subscription_initial';

  // Construct NPCI UPI URI
  const upiUri = buildUpiUri({
    payeeVpa: LIT_PAYEE_CONFIG.upiId,
    payeeName: LIT_PAYEE_CONFIG.accountHolder,
    amount: pricing.totalPricePaise / 100,
    transactionRef: orderRef,
    transactionNote: isFreeTrial
      ? `Free Trial — Refundable Verification (${orderRef})`
      : `${MAINTENANCE_PLANS[planId].name} (${orderRef})`,
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
        purpose: isFreeTrial ? 'Free Trial — Refundable Verification' : 'Maintenance Subscription',
      },
    })
    .select('*')
    .single();

  if (insertError || !newOrder) {
    throw new Error(`Failed to create maintenance order: ${insertError?.message || 'Unknown database error'}`);
  }

  // Queue initial order registration acknowledgment email in outbox (MAIL01)
  const emailSubject = isFreeTrial
    ? 'Free Trial Registration Received'
    : `New Maintenance Order Registered: ${orderRef} (${pricing.name})`;

  const idempotencyKey = `email_order_reg_${orderRef}`;
  const { error: outboxErr } = await supabaseAdmin.from('email_outbox').insert({
    event_type: isFreeTrial ? 'trial_registration_received' : 'maintenance_order_registered',
    template_key: isFreeTrial ? 'trial-registration-received' : 'maintenance-order-registered',
    category: 'transactional',
    recipient: 'hello@logicintelligencetechnologies.in',
    sender: 'no-reply@logicintelligencetechnologies.in',
    subject: emailSubject,
    idempotency_key: idempotencyKey,
    status: 'pending',
    text: `Maintenance order ${orderRef} registered for ${pricing.name}. Total payable: ${pricing.formattedTotal}.`,
  });

  if (outboxErr) {
    console.warn('[email-outbox] Order registration enqueue warning:', outboxErr.message);
  }

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

  // Prevent duplicate UTR submissions across orders
  const { data: duplicateUtr } = await supabaseAdmin
    .from('maintenance_orders')
    .select('id, order_ref')
    .eq('declared_utr', cleanUtr)
    .neq('id', order.id)
    .in('status', ['verification_pending', 'verified'])
    .limit(1);

  if (duplicateUtr && duplicateUtr.length > 0) {
    throw new Error(`UTR ${cleanUtr} has already been submitted for another order (${duplicateUtr[0].order_ref}). Duplicate UTR submissions are prohibited.`);
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

  // Queue Super Admin payment review notification in outbox (MAIL01)
  const utrIdempotency = `email_utr_submitted_${order.order_ref}_${cleanUtr}`;
  const { error: outboxErr } = await supabaseAdmin.from('email_outbox').insert({
    event_type: 'maintenance_payment_reported',
    template_key: 'maintenance-payment-reported',
    category: 'transactional',
    recipient: 'support@logicintelligencetechnologies.in',
    sender: 'no-reply@logicintelligencetechnologies.in',
    subject: `[ACTION REQUIRED] Maintenance Payment Reported: ${cleanUtr} (${orderRef})`,
    idempotency_key: utrIdempotency,
    status: 'pending',
    text: `Payment reported for order ${orderRef} (${order.plan_id}) with UTR ${cleanUtr}. Amount: ${formatPaiseToInr(order.total_amount_paise)}.`,
  });

  if (outboxErr) {
    console.warn('[email-outbox] Payment reported enqueue warning:', outboxErr.message);
  }

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
    const isTrial = sub.plan_id === 'FREE_TRIAL';
    const expiryDate = isTrial
      ? new Date(sub.trial_expires_at || sub.current_period_end || now)
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
  const { orderId, adminUserId, notes } = params;
  const bankReconciliationRef = params.bankReconciliationRef || params.bankReference || '';

  // Verify acting user is a legitimate super_admin
  const { data: adminProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', adminUserId)
    .single();

  if (!adminProfile || adminProfile.role !== 'super_admin') {
    throw new Error('Forbidden: Only Super Admin can verify bank reconciliation and activate subscriptions.');
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from('maintenance_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Maintenance order not found.');
  }

  // Idempotent handling: if already verified and subscription exists, return it
  if (order.status === 'verified') {
    if (order.subscription_id) {
      const { data: existingSub } = await supabaseAdmin
        .from('maintenance_subscriptions')
        .select('*')
        .eq('id', order.subscription_id)
        .maybeSingle();
      if (existingSub) {
        return { order, subscription: existingSub, isExisting: true };
      }
    }
    throw new Error('This order has already been verified.');
  }

  const cleanBankRef = bankReconciliationRef.trim();
  if (!cleanBankRef || cleanBankRef.length < 6) {
    throw new Error('A valid bank reconciliation reference (minimum 6 characters) is required.');
  }

  // Prevent duplicate bank reconciliation reference allocation across orders (BILL02, BILL05)
  const { data: duplicateBankRef } = await supabaseAdmin
    .from('maintenance_orders')
    .select('id, order_ref')
    .or(`bank_reconciliation_ref.eq.${cleanBankRef},bank_reference.eq.${cleanBankRef}`)
    .neq('id', order.id)
    .in('status', ['verified', 'verification_pending'])
    .limit(1);

  if (duplicateBankRef && duplicateBankRef.length > 0) {
    throw new Error(`Bank reconciliation reference ${cleanBankRef} has already been allocated to order ${duplicateBankRef[0].order_ref}. Duplicate credit allocation is prohibited.`);
  }

  const nowIso = new Date().toISOString();
  const plan = MAINTENANCE_PLANS[order.plan_id as PlanIdentifier];
  if (!plan) {
    throw new Error(`Unrecognized plan ID: ${order.plan_id}`);
  }

  const isFreeTrialPlan = plan.planType === 'free_trial' || order.plan_id === 'FREE_TRIAL';

  // Strict integer paise verification matching authoritative plan pricing (BILL01, BILL03)
  const expectedPricing = calculatePlanPricing(order.plan_id as PlanIdentifier);
  if (order.total_amount_paise !== expectedPricing.totalPricePaise) {
    throw new Error(`Invalid payment amount: expected ${expectedPricing.totalPricePaise} paise for plan ${order.plan_id}, found ${order.total_amount_paise} paise.`);
  }

  // Reconcile actual bank credit amount in integer paise (BILL01)
  const creditedPaise = params.creditedPaise !== undefined ? Math.round(Number(params.creditedPaise)) : order.total_amount_paise;
  if (creditedPaise <= 0) {
    throw new Error('Credited amount in paise must be a positive integer.');
  }

  let paymentDiscrepancy: 'exact' | 'partial_payment' | 'overpayment' = 'exact';
  if (creditedPaise < order.total_amount_paise) {
    paymentDiscrepancy = 'partial_payment';
    const shortfall = order.total_amount_paise - creditedPaise;
    await supabaseAdmin
      .from('maintenance_orders')
      .update({
        metadata: {
          ...order.metadata,
          payment_discrepancy: 'partial_payment',
          credited_amount_paise: creditedPaise,
          shortfall_paise: shortfall,
          attempted_at: nowIso,
        },
        updated_at: nowIso,
      })
      .eq('id', order.id);

    throw new Error(`Payment verification failed: Partial payment detected. Credited amount of ${creditedPaise} paise is less than canonical order total of ${order.total_amount_paise} paise (shortfall: ${shortfall} paise). Full payment required for activation.`);
  } else if (creditedPaise > order.total_amount_paise) {
    paymentDiscrepancy = 'overpayment';
  }

  // Calculate activation dates
  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(startDate.getDate() + plan.durationDays);

  // Upsert subscription first to prevent stranding order in verified state if activation fails (BILL02)
  const subscriptionPayload = {
    client_id: order.client_id,
    engagement_id: order.engagement_id,
    plan_id: order.plan_id,
    plan_version: 'v1.0',
    status: 'active',
    trial_started_at: isFreeTrialPlan ? nowIso : null,
    trial_expires_at: isFreeTrialPlan ? expiryDate.toISOString() : null,
    started_at: !isFreeTrialPlan ? nowIso : null,
    current_period_start: nowIso,
    current_period_end: expiryDate.toISOString(),
    next_invoice_date: !isFreeTrialPlan ? expiryDate.toISOString() : null,
    payment_due_date: !isFreeTrialPlan ? expiryDate.toISOString() : null,
    enhancement_hours_allocated: plan.enhancementHoursMonthly,
    enhancement_hours_used: 0.00,
    verification_payment_request_id: order.id,
    refund_status: isFreeTrialPlan ? 'pending' : 'not_applicable',
    refund_notes: isFreeTrialPlan ? 'Pending Super Admin ₹20 refund dispatch' : null,
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

  // Atomically update order to verified status and link subscription (BILL02)
  const { data: updatedOrder, error: orderUpdateErr } = await supabaseAdmin
    .from('maintenance_orders')
    .update({
      status: 'verified',
      subscription_id: sub.id,
      verified_by: adminUserId,
      verified_at: nowIso,
      bank_reconciliation_ref: bankReconciliationRef.trim(),
      bank_reference: cleanBankRef,
      metadata: {
        ...order.metadata,
        payment_discrepancy: paymentDiscrepancy,
        credited_amount_paise: creditedPaise,
        excess_paise: paymentDiscrepancy === 'overpayment' ? creditedPaise - order.total_amount_paise : 0,
        admin_notes: notes || null,
      },
      updated_at: nowIso,
    })
    .eq('id', order.id)
    .select('*')
    .single();

  if (orderUpdateErr || !updatedOrder) {
    // Rollback subscription to prevent orphaned record
    await supabaseAdmin.from('maintenance_subscriptions').delete().eq('id', sub.id);
    throw new Error(`Failed to update order to verified status: ${orderUpdateErr?.message || 'Database error'}`);
  }

  // Queue activation confirmation email in outbox (MAIL01)
  const activationIdempotency = `email_sub_activated_${updatedOrder.id}_${sub.id}`;
  const { error: outboxErr } = await supabaseAdmin.from('email_outbox').insert({
    event_type: isFreeTrialPlan ? 'trial_activated' : 'subscription_activated',
    template_key: isFreeTrialPlan ? 'trial-activated' : 'subscription-activated',
    category: 'transactional',
    recipient: 'hello@logicintelligencetechnologies.in',
    sender: 'no-reply@logicintelligencetechnologies.in',
    subject: isFreeTrialPlan
      ? `Free Trial Activated — 30 Days (Order ${order.order_ref})`
      : `${plan.name} Activated (Order ${order.order_ref})`,
    idempotency_key: activationIdempotency,
    status: 'pending',
    text: `${isFreeTrialPlan ? 'Free Trial' : plan.name} activated for order ${order.order_ref}. Expiry: ${expiryDate.toISOString()}.`,
  });

  if (outboxErr) {
    console.warn('[email-outbox] Activation email enqueue warning:', outboxErr.message);
  }

  return {
    order: updatedOrder,
    subscription: sub,
  };
}

/**
 * Super Admin processes or marks completed the ₹20 trial refund
 */
export async function processSubscriptionRefund(params: ProcessRefundParams) {
  const { subscriptionId, adminUserId, refundStatus, refundReference, refundNotes } = params;

  // Verify acting user is a legitimate super_admin
  const { data: adminProfile } = await supabaseAdmin
    .from('profiles')
    .select('role, email')
    .eq('id', adminUserId)
    .single();

  if (!adminProfile || adminProfile.role !== 'super_admin') {
    throw new Error('Forbidden: Only Super Admin can process trial refunds.');
  }

  // Load the current subscription record
  const { data: currentSub, error: fetchSubErr } = await supabaseAdmin
    .from('maintenance_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();

  if (fetchSubErr || !currentSub) {
    throw new Error('Maintenance subscription not found.');
  }

  // BILL05: Apply only to eligible verified trial-verification payments
  if (currentSub.plan_id !== 'FREE_TRIAL') {
    throw new Error('Only 30-Day Free Trial verification payments (₹20.00) are eligible for trial refunds.');
  }

  // Prevent completed refunds from moving backward
  if (currentSub.refund_status === 'completed' && refundStatus !== 'completed') {
    throw new Error('Terminal state violation: Completed trial refunds cannot be reverted to pending or processing.');
  }

  const nowIso = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    refund_status: refundStatus,
    refund_notes: refundNotes || null,
    refunded_by: adminUserId,
    updated_at: nowIso,
  };

  if (refundStatus === 'processing' || refundStatus === 'pending') {
    updateData.refund_initiated_at = nowIso;
  }
  if (refundStatus === 'completed') {
    const cleanRef = refundReference?.trim();
    if (!cleanRef || cleanRef.length < 6 || cleanRef.startsWith('REF-FAKE')) {
      throw new Error('A valid bank or UPI transaction reference is required to mark a refund as completed. Fabricated or placeholder references are prohibited.');
    }
    updateData.refund_completed_at = nowIso;
    updateData.refund_reference = cleanRef;
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

  if (refundStatus === 'completed' && currentSub.verification_payment_request_id) {
    await supabaseAdmin
      .from('maintenance_orders')
      .update({
        status: 'refunded',
        updated_at: nowIso,
      })
      .eq('id', currentSub.verification_payment_request_id);
  }

  // Record immutable administrative audit event
  await recordAdminAction({
    actor: {
      userId: adminUserId,
      email: adminProfile.email,
      role: 'super_admin',
    },
    action: 'maintenance.process_refund',
    capability: 'payment.verify',
    outcome: 'succeeded',
    target: {
      type: 'subscription',
      id: subscriptionId,
    },
    metadata: {
      refund_status: refundStatus,
      refund_reference: updateData.refund_reference,
      plan_id: currentSub.plan_id,
      notes: refundNotes || null,
    },
  });

  if (refundStatus === 'processing') {
    const processingIdempotency = `email_refund_proc_${updatedSub.id}_${nowIso}`;
    const { error: outboxErr } = await supabaseAdmin.from('email_outbox').insert({
      event_type: 'trial_refund_initiated',
      template_key: 'trial-refund-initiated',
      category: 'transactional',
      recipient: 'hello@logicintelligencetechnologies.in',
      sender: 'no-reply@logicintelligencetechnologies.in',
      subject: `₹20 Verification Refund Initiated (Subscription ${updatedSub.id})`,
      idempotency_key: processingIdempotency,
      status: 'pending',
      text: `₹20 verification refund initiated for subscription ${updatedSub.id}.`,
    });
    if (outboxErr) {
      console.warn('[email-outbox] Refund initiated enqueue warning:', outboxErr.message);
    }
  } else if (refundStatus === 'completed') {
    const completedIdempotency = `email_refund_comp_${updatedSub.id}_${updatedSub.refund_reference}`;
    const { error: outboxErr } = await supabaseAdmin.from('email_outbox').insert({
      event_type: 'trial_refund_completed',
      template_key: 'trial-refund-completed',
      category: 'transactional',
      recipient: 'hello@logicintelligencetechnologies.in',
      sender: 'no-reply@logicintelligencetechnologies.in',
      subject: `₹20 Verification Refund Completed (Ref: ${updatedSub.refund_reference})`,
      idempotency_key: completedIdempotency,
      status: 'pending',
      text: `₹20 verification refund completed for subscription ${updatedSub.id}. Bank reference: ${updatedSub.refund_reference}.`,
    });
    if (outboxErr) {
      console.warn('[email-outbox] Refund completed enqueue warning:', outboxErr.message);
    }
  }

  return updatedSub;
}

/**
 * Server-side automatic trial expiration workflow
 * Idempotently checks active trials where trial_expires_at <= NOW() and sets status to 'expired'.
 * Never auto-converts or auto-debits. Paid Standard subscriptions are never expired here.
 */
export async function checkAndExpireStandardTrials(): Promise<{ expiredCount: number; expiredIds: string[] }> {
  const nowIso = new Date().toISOString();

  // Find active FREE_TRIAL subscriptions that have reached or passed their expiration timestamp
  const { data: expiredSubs, error: fetchErr } = await supabaseAdmin
    .from('maintenance_subscriptions')
    .select('id, client_id, engagement_id, plan_id, trial_expires_at')
    .eq('plan_id', 'FREE_TRIAL')
    .eq('status', 'active')
    .not('trial_expires_at', 'is', null)
    .lte('trial_expires_at', nowIso);

  if (fetchErr || !expiredSubs || expiredSubs.length === 0) {
    return { expiredCount: 0, expiredIds: [] };
  }

  const expiredIds: string[] = [];

  for (const sub of expiredSubs) {
    const { error: updateErr } = await supabaseAdmin
      .from('maintenance_subscriptions')
      .update({
        status: 'expired',
        updated_at: nowIso,
      })
      .eq('id', sub.id);

    if (!updateErr) {
      expiredIds.push(sub.id);

      // Queue trial expiration notification email in outbox (MAIL01)
      const expiryIdempotency = `email_trial_expired_${sub.id}_${nowIso}`;
      const { error: outboxErr } = await supabaseAdmin.from('email_outbox').insert({
        event_type: 'trial_expired',
        template_key: 'trial-ended',
        category: 'transactional',
        recipient: 'hello@logicintelligencetechnologies.in',
        sender: 'no-reply@logicintelligencetechnologies.in',
        subject: 'Your 30-Day Free Trial Has Ended',
        idempotency_key: expiryIdempotency,
        status: 'pending',
        text: `Your 30-Day Free Trial for engagement ${sub.engagement_id} has concluded. Please choose a paid maintenance care plan to continue coverage.`,
      });
      if (outboxErr) {
        console.warn('[email-outbox] Trial expired enqueue warning:', outboxErr.message);
      }
    }
  }

  return {
    expiredCount: expiredIds.length,
    expiredIds,
  };
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

  const corrIdempotency = `email_corr_submitted_${requestRef}`;
  const { error: outboxErr } = await supabaseAdmin.from('email_outbox').insert({
    event_type: 'correction_request_submitted',
    template_key: 'correction-request-submitted',
    category: 'transactional',
    recipient: 'support@logicintelligencetechnologies.in',
    sender: 'no-reply@logicintelligencetechnologies.in',
    subject: `[CHANGE CONTROL] Correction Requested: ${requestRef} (${affectedField})`,
    idempotency_key: corrIdempotency,
    status: 'pending',
    text: `Client correction request ${requestRef} submitted for engagement ${engagementId}. Affected field: ${affectedField}.`,
  });

  if (outboxErr) {
    console.warn('[email-outbox] Correction request enqueue warning:', outboxErr.message);
  }

  return correction;
}

/**
 * Canonical Project Interface Contracts (PROJECT.md § 3)
 */
export async function createMaintenanceOrder(params: {
  authUserId: string;
  engagementId: string;
  planId: 'FREE_TRIAL' | 'STANDARD' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  consentTimestamp?: string;
}): Promise<{ orderId: string; orderRef: string; totalPaise: number; upiUri: string }> {
  const result = await createOrGetMaintenanceOrder({
    clientId: params.authUserId,
    engagementId: params.engagementId,
    planId: params.planId,
    consentConfirmed: true,
  });
  return {
    orderId: result.order.id,
    orderRef: result.order.order_ref,
    totalPaise: result.pricing.totalPricePaise,
    upiUri: result.upiUri,
  };
}

export async function verifyMaintenancePayment(params: {
  adminAuthUserId: string;
  orderId: string;
  bankReference: string;
  creditedPaise: number;
}): Promise<{ subscriptionId: string; status: 'active' }> {
  const result = await verifyMaintenanceOrderAndActivate({
    orderId: params.orderId,
    adminUserId: params.adminAuthUserId,
    bankReconciliationRef: params.bankReference,
    bankReference: params.bankReference,
    creditedPaise: params.creditedPaise,
  });
  return {
    subscriptionId: result.subscription.id,
    status: 'active',
  };
}

export async function processTrialRefund(params: {
  adminAuthUserId: string;
  subscriptionId: string;
  refundReference: string;
}): Promise<{ status: 'refunded' }> {
  await processSubscriptionRefund({
    subscriptionId: params.subscriptionId,
    adminUserId: params.adminAuthUserId,
    refundStatus: 'completed',
    refundReference: params.refundReference,
  });
  return { status: 'refunded' };
}
