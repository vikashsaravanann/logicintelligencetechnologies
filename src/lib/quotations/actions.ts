'use server';

import { revalidatePath } from 'next/cache';
import { getStaffSession } from '@/lib/auth/session';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  createQuotationDraft,
  updateQuotationDraft,
  publishQuotation,
  duplicateQuotation,
  revokeQuotation,
  validateCouponCode,
  acceptQuotation,
  submitQuotationRevisionRequest,
  getQuotationById,
  getQuotationByToken,
  getQuotationLineItems,
  logQuotationAudit,
  listCoupons,
  createCoupon,
  toggleCouponStatus,
} from '@/lib/quotations/db';
import { calculateQuotation } from '@/lib/quotations/pricing';
import { sendQuotationEmail } from '@/lib/email/send-quotation-email';
import {
  CreateQuotationDraftInput,
  UpdateQuotationDraftInput,
  QuotationRecord,
  QuotationLineItemInput,
  CreateCouponInput,
  QuotationCoupon,
} from '@/types/quotations';

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ── 1. Create Quotation Draft Action ─────────────────────────────────────────

export async function createQuotationDraftAction(
  formDataOrInput: FormData | CreateQuotationDraftInput
): Promise<ActionResult<QuotationRecord>> {
  try {
    const session = await getStaffSession();
    if (!session && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Unauthorized: Staff credentials required.' };
    }

    const adminUserId = session?.userId || '00000000-0000-0000-0000-000000000001';

    let input: CreateQuotationDraftInput;

    if (formDataOrInput instanceof FormData) {
      const companyName = String(formDataOrInput.get('company_name') || '').trim();
      const recipientName = String(formDataOrInput.get('recipient_name') || '').trim();
      const recipientEmail = String(formDataOrInput.get('recipient_email') || '').trim().toLowerCase();
      const projectTitle = String(formDataOrInput.get('project_title') || '').trim();

      if (!companyName || !recipientName || !recipientEmail || !projectTitle) {
        return {
          success: false,
          error: 'Company name, recipient name, email, and project title are required.',
        };
      }

      let lineItems: QuotationLineItemInput[] = [];
      const lineItemsRaw = formDataOrInput.get('line_items');
      if (typeof lineItemsRaw === 'string' && lineItemsRaw.trim()) {
        try {
          lineItems = JSON.parse(lineItemsRaw);
        } catch {
          // ignore parse error
        }
      }

      input = {
        company_name: companyName,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        recipient_phone: String(formDataOrInput.get('recipient_phone') || '').trim() || null,
        project_title: projectTitle,
        project_brief: String(formDataOrInput.get('project_brief') || '').trim() || null,
        timeline_estimate: String(formDataOrInput.get('timeline_estimate') || '2 to 4 weeks').trim(),
        client_id: String(formDataOrInput.get('client_id') || '').trim() || null,
        engagement_id: String(formDataOrInput.get('engagement_id') || '').trim() || null,
        lead_id: String(formDataOrInput.get('lead_id') || '').trim() || null,
        internal_notes: String(formDataOrInput.get('internal_notes') || '').trim() || null,
        currency: 'INR',
        created_by: adminUserId,
        line_items: lineItems,
      };
    } else {
      input = {
        ...formDataOrInput,
        created_by: formDataOrInput.created_by || adminUserId,
      };
    }

    const quote = await createQuotationDraft(input);

    revalidatePath('/admin/quotations');
    return { success: true, data: quote, message: 'Quotation draft created successfully' };
  } catch (err: any) {
    console.error('[createQuotationDraftAction] error:', err);
    return { success: false, error: err.message || 'Failed to create quotation draft' };
  }
}

// ── 2. Update Quotation Draft Action ─────────────────────────────────────────

export async function updateQuotationDraftAction(
  id: string,
  input: UpdateQuotationDraftInput
): Promise<ActionResult<QuotationRecord>> {
  try {
    const session = await getStaffSession();
    if (!session && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Unauthorized: Staff credentials required.' };
    }

    const updated = await updateQuotationDraft(id, input);

    revalidatePath('/admin/quotations');
    revalidatePath(`/admin/quotations/${id}`);
    return { success: true, data: updated, message: 'Quotation draft updated successfully' };
  } catch (err: any) {
    console.error('[updateQuotationDraftAction] error:', err);
    return { success: false, error: err.message || 'Failed to update quotation draft' };
  }
}

// ── 3. Publish Quotation Action ──────────────────────────────────────────────

export async function publishQuotationAction(
  id: string
): Promise<ActionResult<QuotationRecord>> {
  try {
    const session = await getStaffSession();
    if (!session && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Unauthorized: Staff credentials required.' };
    }

    const adminUserId = session?.userId || '00000000-0000-0000-0000-000000000001';
    const published = await publishQuotation(id, adminUserId);

    // Automatically send quotation email to client upon publish
    let emailStatus = 'pending';
    if (published.recipient_email) {
      try {
        const lines = await getQuotationLineItems(published.id);
        const selectedCount = lines.filter((l) => l.is_selected).length;
        const emailResult = await sendQuotationEmail({
          quotation: published,
          recipientEmail: published.recipient_email,
          selectedServicesCount: selectedCount,
        });

        if (emailResult.success) {
          emailStatus = 'sent';
          await logQuotationAudit(
            published.id,
            'email_sent',
            adminUserId,
            published.recipient_email,
            {
              recipient: published.recipient_email,
              quotation_ref: published.quotation_ref,
              auto_sent_on_publish: true,
              delivery_status: emailResult.status,
            }
          );
          await supabaseAdmin
            .from('quotations')
            .update({
              delivery_state: 'email_sent',
              updated_at: new Date().toISOString(),
            })
            .eq('id', published.id);
        }
      } catch (mailErr) {
        console.error('[publishQuotationAction] Auto-email dispatch error:', mailErr);
      }
    }

    revalidatePath('/admin/quotations');
    revalidatePath(`/admin/quotations/${id}`);
    if (published.secure_token) {
      revalidatePath(`/quotation/${published.secure_token}`);
    }

    const emailNote = emailStatus === 'sent' ? ` and email sent to ${published.recipient_email}` : '';

    return {
      success: true,
      data: published,
      message: `Quotation ${published.quotation_ref} published successfully (v${published.version_number})${emailNote}`,
    };
  } catch (err: any) {
    console.error('[publishQuotationAction] error:', err);
    return { success: false, error: err.message || 'Failed to publish quotation' };
  }
}

// ── 4. Duplicate Quotation Action ────────────────────────────────────────────

export async function duplicateQuotationAction(
  id: string
): Promise<ActionResult<QuotationRecord>> {
  try {
    const session = await getStaffSession();
    if (!session && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Unauthorized: Staff credentials required.' };
    }

    const adminUserId = session?.userId || '00000000-0000-0000-0000-000000000001';
    const cloned = await duplicateQuotation(id, adminUserId);

    revalidatePath('/admin/quotations');
    return {
      success: true,
      data: cloned,
      message: `Quotation duplicated as ${cloned.quotation_ref}`,
    };
  } catch (err: any) {
    console.error('[duplicateQuotationAction] error:', err);
    return { success: false, error: err.message || 'Failed to duplicate quotation' };
  }
}

// ── 5. Revoke Quotation Action ───────────────────────────────────────────────

export async function revokeQuotationAction(
  id: string,
  reason?: string
): Promise<ActionResult<QuotationRecord>> {
  try {
    const session = await getStaffSession();
    if (!session && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Unauthorized: Staff credentials required.' };
    }

    const adminUserId = session?.userId || '00000000-0000-0000-0000-000000000001';
    const revoked = await revokeQuotation(id, adminUserId, reason);

    revalidatePath('/admin/quotations');
    revalidatePath(`/admin/quotations/${id}`);
    if (revoked.secure_token) {
      revalidatePath(`/quotation/${revoked.secure_token}`);
    }

    return {
      success: true,
      data: revoked,
      message: `Quotation ${revoked.quotation_ref} revoked`,
    };
  } catch (err: any) {
    console.error('[revokeQuotationAction] error:', err);
    return { success: false, error: err.message || 'Failed to revoke quotation' };
  }
}

// ── 6. Apply Coupon Action (Client or Admin) ─────────────────────────────────

export async function applyCouponAction(
  token: string,
  couponCode: string
): Promise<ActionResult<any>> {
  try {
    const cleanToken = (token || '').trim();
    const cleanCode = (couponCode || '').trim();

    if (!cleanToken) {
      return { success: false, error: 'Quotation access token is required.' };
    }
    if (!cleanCode) {
      return { success: false, error: 'Please enter a coupon code.' };
    }

    const quotation = await getQuotationByToken(cleanToken);
    if (!quotation) {
      return { success: false, error: 'Quotation not found for the provided access token.' };
    }

    if (!['draft', 'published', 'changes_requested'].includes(quotation.status)) {
      return {
        success: false,
        error: `Coupons cannot be applied to a quotation in "${quotation.status}" status.`,
      };
    }

    const validation = await validateCouponCode(
      cleanCode,
      quotation.subtotal_paise,
      quotation.client_id || undefined
    );

    if (!validation.isValid || !validation.coupon) {
      return {
        success: false,
        error: validation.error || 'Invalid or expired coupon code.',
      };
    }

    const lines = await getQuotationLineItems(quotation.id);
    const updatedCalc = calculateQuotation(
      lines,
      validation.coupon,
      0,
      quotation.tax_paise,
      quotation
    );

    // If quotation is still a draft, persist the coupon code to the draft
    if (quotation.status === 'draft') {
      await supabaseAdmin
        .from('quotations')
        .update({
          applied_coupon_code: validation.coupon.code,
          discount_paise: validation.discountPaise,
          discount_label: validation.label,
          total_payable_paise: updatedCalc.totalPayablePaise,
          milestone1_paise: updatedCalc.milestone1Paise,
          milestone2_paise: updatedCalc.milestone2Paise,
          updated_at: new Date().toISOString(),
        })
        .eq('id', quotation.id);

      revalidatePath(`/admin/quotations/${quotation.id}`);
    }

    return {
      success: true,
      data: {
        coupon: validation.coupon,
        discountPaise: validation.discountPaise,
        discountLabel: validation.label,
        calculation: updatedCalc,
      },
      message: `Coupon "${validation.coupon.code}" applied successfully.`,
    };
  } catch (err: any) {
    console.error('[applyCouponAction] error:', err);
    return { success: false, error: err.message || 'Failed to apply coupon' };
  }
}

// ── 7. Client Formal Acceptance Action ───────────────────────────────────────

export async function acceptQuotationClientAction(
  token: string,
  clientDetails: {
    clientName: string;
    clientEmail: string;
    clientDesignation?: string;
    clientCompany?: string;
    consentCheckboxes?: {
      exact_version?: boolean;
      scope_and_pricing?: boolean;
      two_milestones?: boolean;
      authority_declaration?: boolean;
    };
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<ActionResult<any>> {
  try {
    const cleanToken = (token || '').trim();
    if (!cleanToken) {
      return { success: false, error: 'Quotation access token is required.' };
    }

    if (!clientDetails.clientName?.trim()) {
      return { success: false, error: 'Signer full name is required for legal acceptance.' };
    }
    if (!clientDetails.clientEmail?.trim()) {
      return { success: false, error: 'Signer business email is required for legal acceptance.' };
    }

    if (clientDetails.consentCheckboxes) {
      const { exact_version, scope_and_pricing, two_milestones, authority_declaration } =
        clientDetails.consentCheckboxes;
      if (!exact_version || !scope_and_pricing || !two_milestones || !authority_declaration) {
        return {
          success: false,
          error: 'All four formal acceptance consent affirmations must be checked.',
        };
      }
    }

    const quotation = await getQuotationByToken(cleanToken);
    if (!quotation) {
      return { success: false, error: 'Quotation not found for the provided access token.' };
    }

    const result = await acceptQuotation({
      quotationId: quotation.id,
      secureToken: cleanToken,
      clientName: clientDetails.clientName.trim(),
      clientEmail: clientDetails.clientEmail.trim().toLowerCase(),
      clientDesignation: clientDetails.clientDesignation?.trim(),
      clientCompany: clientDetails.clientCompany?.trim() || quotation.company_name,
      ipAddress: clientDetails.ipAddress,
      userAgent: clientDetails.userAgent,
    });

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to record acceptance.' };
    }

    revalidatePath(`/quotation/${cleanToken}`);
    revalidatePath('/admin/quotations');
    revalidatePath(`/admin/quotations/${quotation.id}`);

    return {
      success: true,
      data: result,
      message: result.message || 'Quotation accepted successfully. Statement of Work (SOW) unlocked.',
    };
  } catch (err: any) {
    console.error('[acceptQuotationClientAction] error:', err);
    return { success: false, error: err.message || 'Failed to accept quotation' };
  }
}

// ── 8. Client Revision Request Action ────────────────────────────────────────

export async function requestQuotationRevisionClientAction(
  token: string,
  details: { name: string; email: string; notes: string }
): Promise<ActionResult<any>> {
  try {
    const cleanToken = (token || '').trim();
    if (!cleanToken) {
      return { success: false, error: 'Quotation access token is required.' };
    }
    if (!details.notes?.trim()) {
      return { success: false, error: 'Please describe the adjustments or scope changes requested.' };
    }

    const quotation = await getQuotationByToken(cleanToken);
    if (!quotation) {
      return { success: false, error: 'Quotation not found.' };
    }

    const result = await submitQuotationRevisionRequest(quotation.id, {
      name: details.name || quotation.recipient_name,
      email: details.email || quotation.recipient_email,
      notes: details.notes.trim(),
    });

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to submit revision request.' };
    }

    revalidatePath(`/quotation/${cleanToken}`);
    revalidatePath('/admin/quotations');
    revalidatePath(`/admin/quotations/${quotation.id}`);

    return {
      success: true,
      data: result,
      message: 'Revision request submitted. Our engineering team will review and update the proposal.',
    };
  } catch (err: any) {
    console.error('[requestQuotationRevisionClientAction] error:', err);
    return { success: false, error: err.message || 'Failed to submit revision request' };
  }
}

// ── 9. Send Quotation Email Action ───────────────────────────────────────────

export async function sendQuotationEmailAction(
  quotationId: string,
  recipientEmail?: string
): Promise<ActionResult<any>> {
  try {
    const session = await getStaffSession();
    if (!session && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Unauthorized: Staff credentials required.' };
    }

    const quotation = await getQuotationById(quotationId);
    if (!quotation) {
      return { success: false, error: `Quotation with id "${quotationId}" not found` };
    }

    if (!quotation.secure_token) {
      return { success: false, error: 'Cannot send quotation without an active access token.' };
    }

    const lines = await getQuotationLineItems(quotation.id);
    const selectedCount = lines.filter((l) => l.is_selected).length;
    const targetEmail = (recipientEmail || quotation.recipient_email || '').trim();

    // 1. Dispatch email
    const emailResult = await sendQuotationEmail({
      quotation,
      recipientEmail: targetEmail,
      selectedServicesCount: selectedCount,
    });

    if (emailResult.success) {
      // 2. Log audit entry 'email_sent'
      await logQuotationAudit(
        quotation.id,
        'email_sent',
        session?.userId,
        targetEmail,
        {
          recipient: targetEmail,
          quotation_ref: quotation.quotation_ref,
          delivery_status: emailResult.status,
          correlation_id: quotation.id,
        }
      );

      // 3. Update delivery_state = 'email_sent'
      await supabaseAdmin
        .from('quotations')
        .update({
          delivery_state: 'email_sent',
          updated_at: new Date().toISOString(),
        })
        .eq('id', quotation.id);

      revalidatePath('/admin/quotations');
      revalidatePath(`/admin/quotations/${quotation.id}`);

      return {
        success: true,
        message: `Quotation sent successfully to ${targetEmail}`,
      };
    } else {
      await logQuotationAudit(
        quotation.id,
        'email_failed',
        session?.userId,
        targetEmail,
        {
          recipient: targetEmail,
          error: emailResult.message,
          error_code: emailResult.errorCode,
        }
      );

      await supabaseAdmin
        .from('quotations')
        .update({
          delivery_state: 'email_failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', quotation.id);

      return {
        success: false,
        error: emailResult.message || 'Failed to deliver quotation email',
      };
    }
  } catch (err: any) {
    console.error('[sendQuotationEmailAction] error:', err);
    return { success: false, error: err.message || 'Failed to dispatch quotation email' };
  }
}

// ── 10. Coupon Management Actions ────────────────────────────────────────────

export async function listCouponsAction(
  activeOnly?: boolean
): Promise<ActionResult<QuotationCoupon[]>> {
  try {
    const session = await getStaffSession();
    if (!session && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Unauthorized: Staff credentials required.' };
    }

    const coupons = await listCoupons(activeOnly);
    return { success: true, data: coupons };
  } catch (err: any) {
    console.error('[listCouponsAction] error:', err);
    return { success: false, error: err.message || 'Failed to list coupons' };
  }
}

export async function createCouponAction(
  input: CreateCouponInput
): Promise<ActionResult<QuotationCoupon>> {
  try {
    const session = await getStaffSession();
    if (!session && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Unauthorized: Staff credentials required.' };
    }

    const adminUserId = session?.userId || '00000000-0000-0000-0000-000000000001';
    const created = await createCoupon({
      ...input,
      created_by: adminUserId,
      approved_by: adminUserId,
    });

    revalidatePath('/admin/quotations/coupons');
    return {
      success: true,
      data: created,
      message: `Coupon "${created.code}" created successfully.`,
    };
  } catch (err: any) {
    console.error('[createCouponAction] error:', err);
    return { success: false, error: err.message || 'Failed to create coupon' };
  }
}

export async function toggleCouponStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResult<QuotationCoupon>> {
  try {
    const session = await getStaffSession();
    if (!session && process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Unauthorized: Staff credentials required.' };
    }

    const updated = await toggleCouponStatus(id, isActive);

    revalidatePath('/admin/quotations/coupons');
    return {
      success: true,
      data: updated,
      message: `Coupon "${updated.code}" is now ${isActive ? 'active' : 'inactive'}.`,
    };
  } catch (err: any) {
    console.error('[toggleCouponStatusAction] error:', err);
    return { success: false, error: err.message || 'Failed to update coupon status' };
  }
}
