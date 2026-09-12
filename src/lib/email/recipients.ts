import "server-only";
import { COMPANY } from "@/config/company";
import { isValidEmail, normalizeEmail } from "./validation";

export function getLeadNotificationRecipients(): string[] {
  const raw = process.env.LEAD_NOTIFICATION_EMAIL || "";
  const fromEnv = raw
    .split(",")
    .map((item) => normalizeEmail(item))
    .filter(isValidEmail);
  if (fromEnv.length) return fromEnv;
  return [COMPANY.emails.support];
}

export function getAdminAlertRecipient(): string {
  const envAddr = process.env.ADMIN_ALERT_EMAIL || "";
  if (isValidEmail(envAddr)) return normalizeEmail(envAddr);
  return COMPANY.emails.admin;
}

export function defaultReplyTo(): string {
  return COMPANY.emails.support || COMPANY.emails.hello;
}
