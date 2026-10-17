import * as React from "react";
import OperationalNoticeEmail from "./operational-notice-email";
import type { EmailDesign } from "./components/email-design";

// Fictional review data. Sending flows supply their own original subjects and text.
const notices: Array<{ key: string; name: string; title?: string; text: string; design: EmailDesign }> = [
  { key: "trial-registration-received", name: "Free Trial Registration Received", text: "Maintenance order LIT-DEMO-001 registered for Standard Trial. Payment verification is pending.", design: "maintenance" },
  { key: "maintenance-order-registered", name: "Maintenance Order Registered", text: "Maintenance order LIT-DEMO-002 registered for Base Care. Review the order in your existing workspace.", design: "maintenance" },
  { key: "maintenance-payment-reported", name: "Maintenance Payment Reported", title: "[ACTION REQUIRED] Maintenance Payment Reported: DEMO20261018123456789012 (LIT-DEMO-002)", text: "A payment has been reported for order LIT-DEMO-002. Super admin verification is required before activation.", design: "payment" },
  { key: "trial-activated", name: "Free Trial Activated", text: "The Standard Trial has been activated for order LIT-DEMO-001. The expiry date recorded on the subscription applies.", design: "maintenance" },
  { key: "subscription-activated", name: "Maintenance Subscription Activated", text: "Base Care has been activated for order LIT-DEMO-002. Your subscription details are available in the project workspace.", design: "maintenance" },
  { key: "trial-refund-initiated", name: "Trial Verification Refund Initiated", text: "Your verification refund is being processed. This message does not confirm that funds have reached the bank account.", design: "payment" },
  { key: "trial-refund-completed", name: "Trial Verification Refund Completed", title: "₹20 Verification Refund Completed (Ref: DEMO20261018123456789012)", text: "The verification refund for subscription LIT-DEMO-003 has been marked completed. Bank reference: DEMO-REFUND-001.", design: "payment" },
  { key: "trial-ended", name: "Your Free Trial Has Ended", text: "Your trial for the demonstration project has concluded. Please choose a paid maintenance care plan to continue coverage.", design: "maintenance" },
  { key: "correction-request-submitted", name: "Correction Request Submitted", text: "Correction request LIT-DEMO-004 has been submitted for the demonstration project. Affected field: company address.", design: "support" },
  { key: "proposal-approved-notification", name: "Proposal Acceptance Notification", text: 'Proposal accepted: LIT-DEMO-005\nReference: LIT-DEMO-005\nSigner: Demonstration Client', design: "notification" },
];

export const OPERATIONAL_NOTICE_PREVIEWS = notices.map(notice => ({
  key: notice.key,
  name: notice.name,
  category: "transactional" as const,
  description: "Redesigned operational outbox notification. Fictional review data; existing sending content is preserved.",
  defaultSender: "no-reply@logicintelligencetechnologies.in",
  replyTo: "support@logicintelligencetechnologies.in",
  subject: notice.title ?? notice.name,
  getElement: () => <OperationalNoticeEmail title={notice.title ?? notice.name} text={notice.text} design={notice.design} />,
}));
