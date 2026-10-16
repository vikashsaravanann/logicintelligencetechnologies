import { COMPANY } from '@/config/company';
import { ClientEngagement } from './types';

/**
 * Generates ready-to-copy client invitation email text for manual dispatch.
 * Safe for use in client components and server components.
 */
export function generatePortalEmailCopyText(engagement: Pick<ClientEngagement, 'engagement_ref' | 'company_name' | 'contact_name' | 'project_title'>): string {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl).replace(/\/$/, '');
  const portalUrl = `${siteUrl}/engagement/${engagement.engagement_ref}`;
  const workspaceUrl = `${siteUrl}/client/login?ref=${engagement.engagement_ref}`;

  return `Subject: LIT | Your Client Lifecycle Portal & Workspace: ${engagement.project_title} (${engagement.engagement_ref})

Dear ${engagement.contact_name || 'Client Partner'},

Your dedicated client portals for ${engagement.company_name} are now live and ready to access. Below are your official private invitation links:

1. CLIENT ENGAGEMENT & MILESTONE PORTAL (13-STAGE LIFECYCLE):
${portalUrl}

2. CLIENT ENTERPRISE WORKSPACE & DASHBOARD:
${workspaceUrl}

Engagement Reference: ${engagement.engagement_ref}
Project Scope: ${engagement.project_title}
Authorized Organization: ${engagement.company_name}

ABOUT YOUR CLIENT ENGAGEMENT PORTAL:
Through your engagement portal, you can monitor and participate in our 13-stage engineering governance process:
1. Stage 01: 50-Point Enterprise Deployment Checklist (Select & submit technical requirements)
2. Stages 03 & 04: Commercial Proposal & SOW Agreement (Merged commercial terms & sign-off)
3. Stages 06 & 11: Milestone Invoices (50% upfront & 50% completion with bank-cleared UPI reconciliation)
4. Stage 07: Client Infrastructure Onboarding (Secure cloud credentials intake)
5. Stages 10 & 12: Delivery Acceptance, IP Transfer, and GitHub Handover

ABOUT YOUR CLIENT WORKSPACE:
Your workspace dashboard provides continuous access to deliverables, active sprints, change requests, invoices, and project documents.

GOVERNANCE & SECURITY GUARANTEE:
- Zero third-party payment gateways; transactions are audited directly via YES Bank UPI (${COMPANY.beneficiary.upiId} / ${COMPANY.beneficiary.accountHolder}).
- Official MSME Registered Enterprise: ${COMPANY.registration.msmeUdyamNumber} (Registered Eachanari, Coimbatore, Tamil Nadu).

If you have any questions or require revisions, please reply directly to this email or visit your portal at ${portalUrl}.

Warm regards,
Vikash Saravanan, Founder
Logic Intelligence Technologies
${COMPANY.websiteUrl}
Email: ${COMPANY.email} | Phone: ${COMPANY.phone}
`;
}

/**
 * Generates formatted WhatsApp share text.
 * Safe for use in client components and server components.
 */
export function generatePortalWhatsAppText(engagement: Pick<ClientEngagement, 'engagement_ref' | 'company_name' | 'contact_name'>): string {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || COMPANY.websiteUrl).replace(/\/$/, '');
  const portalUrl = `${siteUrl}/engagement/${engagement.engagement_ref}`;
  const workspaceUrl = `${siteUrl}/client/login?ref=${engagement.engagement_ref}`;

  return `Hello ${engagement.contact_name}, your official Client Portals for ${engagement.company_name} are ready.\n\n1. 13-Stage Milestone Portal: ${portalUrl}\n2. Client Workspace Dashboard: ${workspaceUrl}\n\n(Ref: ${engagement.engagement_ref})`;
}
