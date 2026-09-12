import * as React from "react";
import { sendEmail } from "./send-email";
import LoginNotificationEmail from "@/emails/login-notification-email";
import { UAParser } from "ua-parser-js";
import { getAdminAlertRecipient } from "./recipients";
import { COMPANY } from "@/config/company";
import { isValidEmail, normalizeEmail, sanitizeHeaderValue } from "./validation";

export async function sendLoginNotification(
  email: string,
  reqHeaders: Headers,
  body?: { screenSize?: string; timezone?: string }
) {
  const cleanEmail = normalizeEmail(email);
  if (!isValidEmail(cleanEmail)) {
    return { success: false, message: "Invalid email address", status: "failed" as const };
  }

  const uaString = sanitizeHeaderValue(reqHeaders.get("user-agent") || "", 300);
  const parser = new UAParser(uaString);
  const result = parser.getResult();
  const deviceStr =
    [result.device.vendor, result.device.model, result.os.name]
      .filter(Boolean)
      .join(" ") ||
    result.os.name ||
    "Unknown Device";
  const browserStr = result.browser.name || "Unknown Browser";
  const parsedDevice = `${deviceStr} • ${browserStr}`;

  const ipAddress = sanitizeHeaderValue(
    reqHeaders.get("x-forwarded-for") || "Local Development",
    80
  );
  const city = reqHeaders.get("x-vercel-ip-city");
  const region = reqHeaders.get("x-vercel-ip-region");
  const country = reqHeaders.get("x-vercel-ip-country");

  let location = "Local Development";
  if (city || region || country) {
    location = [city, region, country].filter(Boolean).join(", ");
  }

  const dayKey = new Date().toISOString().slice(0, 13);

  return sendEmail({
    to: getAdminAlertRecipient(),
    from: "noReply",
    subject: `Client login: ${cleanEmail}`,
    replyTo: COMPANY.emails.support,
    category: "security",
    eventType: "login-notification",
    templateKey: "login-notification-email",
    idempotencyKey: `login:${cleanEmail}:${dayKey}`,
    react: React.createElement(LoginNotificationEmail, {
      email: cleanEmail,
      loginTimestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      userAgent: uaString,
      location,
      parsedDevice,
      ipAddress,
      screenSize: body?.screenSize ? sanitizeHeaderValue(body.screenSize, 40) : undefined,
      timezone: body?.timezone ? sanitizeHeaderValue(body.timezone, 60) : undefined,
    }),
  });
}
