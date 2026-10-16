import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send-email';
import { COMPANY } from '@/config/company';
import { ClientEngagement } from './types';
import EngagementPortalInvitationEmail from '../../../emails/engagement-portal-invitation-email';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Dispatches an enterprise client lifecycle portal invitation email to the primary contact.
 */
export async function sendEngagementInvitationEmail(
  engagementIdOrRef: string,
  customMessage?: string
): Promise<{ ok: boolean; message: string }> {
  let engagement: ClientEngagement | null = null;

  if (isAdminClientConfigured()) {
    try {
      let query = supabaseAdmin.from('client_engagements').select('*');
      if (UUID_REGEX.test(engagementIdOrRef)) {
        query = query.or(`engagement_ref.eq.${engagementIdOrRef},id.eq.${engagementIdOrRef}`);
      } else {
        query = query.eq('engagement_ref', engagementIdOrRef);
      }
      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        engagement = data as ClientEngagement;
      }
    } catch (err) {
      console.warn('[sendEngagementInvitationEmail] Supabase query failed:', err);
    }
  }

  // Fallback lookup strictly for canonical sample only
  if (!engagement) {
    if (engagementIdOrRef.toUpperCase() === 'ENG-2026-LIT-SAMPLE') {
      engagement = {
        id: '8acad856-9840-4646-b42d-f8bf12ea47f8',
        engagement_ref: engagementIdOrRef.toUpperCase(),
        client_id: null,
        proposal_id: null,
        checklist_invitation_id: null,
        company_name: 'Apex Meridian Technologies Pvt Ltd',
        contact_name: 'Dr. Rajesh Krishnan',
        contact_email: 'rajesh.krishnan@apexmeridian.com',
        contact_phone: '+91 98401 23456',
        project_title: 'Enterprise Multi-Tenant AI Platform & HIPAA Hospital Infrastructure',
        status: 'active',
        current_stage: 'checklist',
        notes: null,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      return { ok: false, message: 'Engagement record not found.' };
    }
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl).replace(/\/$/, '');
  const portalUrl = `${siteUrl}/engagement/${engagement.engagement_ref}`;
  const workspaceUrl = `${siteUrl}/client/login?ref=${engagement.engagement_ref}`;

  try {
    const result = await sendEmail({
      to: engagement.contact_email,
      from: 'hello',
      subject: `LIT | Your Client Lifecycle Portal: ${engagement.project_title} (${engagement.engagement_ref})`,
      category: 'transactional',
      eventType: 'client-portal-invitation',
      templateKey: 'engagement-portal-invitation-email',
      react: EngagementPortalInvitationEmail({
        recipientName: engagement.contact_name,
        companyName: engagement.company_name,
        projectTitle: engagement.project_title,
        engagementRef: engagement.engagement_ref,
        portalUrl,
        workspaceUrl,
        customMessage,
      }),
    });

    if (!result.success) {
      return { ok: false, message: result.message || 'Failed to dispatch email.' };
    }

    // Record last emailed timestamp in metadata
    if (isAdminClientConfigured() && engagement.id) {
      try {
        const updatedMetadata = {
          ...(engagement.metadata || {}),
          last_email_sent_at: new Date().toISOString(),
          email_dispatch_count: (((engagement.metadata as any)?.email_dispatch_count || 0) + 1),
        };
        await supabaseAdmin
          .from('client_engagements')
          .update({ metadata: updatedMetadata, updated_at: new Date().toISOString() })
          .eq('id', engagement.id);
      } catch (metaErr) {
        console.warn('[sendEngagementInvitationEmail] metadata update non-critical failure:', metaErr);
      }
    }

    return {
      ok: true,
      message: `Client portal invitation email dispatched successfully to ${engagement.contact_email}.`,
    };
  } catch (err: any) {
    console.error('[sendEngagementInvitationEmail] Error:', err);
    return { ok: false, message: err?.message || 'Failed to dispatch email.' };
  }
}

export { generatePortalEmailCopyText, generatePortalWhatsAppText } from './share';

