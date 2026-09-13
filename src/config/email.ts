import { COMPANY } from "./company";

export const EMAIL_CONFIG = {
  provider: "Zoho Mail SMTP",
  defaultFrom: `${COMPANY.displayName} <${COMPANY.emails.hello}>`,
  supportFrom: `${COMPANY.displayName} Support <${COMPANY.emails.support}>`,
  notificationsFrom: `${COMPANY.displayName} Notifications <${COMPANY.emails.noReply}>`,
  adminRecipient: COMPANY.emails.admin,
  founderRecipient: COMPANY.emails.vikash,
  smtp: {
    host: "smtppro.zoho.in",
    port: 465,
    secure: true,
  },
  categories: {
    auth: "Authentication & Security",
    lead: "Lead & Discovery Intake",
    booking: "Consultation & Meetings",
    proposal: "Client Proposals",
    resource: "PDF Deliveries",
    support: "Client Tickets & SLAs",
    newsletter: "Engineering Updates",
  },
} as const;
