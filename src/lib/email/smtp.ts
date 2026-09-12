import "server-only";
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { COMPANY } from "@/config/company";

type SenderKey = keyof typeof COMPANY.emails;

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

const senderEnvMap: Record<SenderKey, string> = {
  noReply: "NOREPLY",
  vikash: "VIKASH",
  hello: "HELLO",
  admin: "ADMIN",
  support: "SUPPORT",
};

/**
 * Zoho Mail (India): smtp.zoho.in
 * - Port 465 → implicit TLS (secure: true)
 * - Port 587 → STARTTLS (secure: false, requireTLS: true)
 */
function getSmtpConfig(sender: SenderKey): SmtpConfig {
  const prefix = senderEnvMap[sender];

  const host =
    process.env[`SMTP_${prefix}_HOST`] ||
    process.env.SMTP_HOST ||
    "smtp.zoho.in";

  const port = Number(
    process.env[`SMTP_${prefix}_PORT`] || process.env.SMTP_PORT || 587
  );

  const secureEnv =
    process.env[`SMTP_${prefix}_SECURE`] ?? process.env.SMTP_SECURE;
  const secure =
    secureEnv === "true"
      ? true
      : secureEnv === "false"
        ? false
        : port === 465;

  const user =
    process.env[`SMTP_${prefix}_USER`] ||
    process.env.SMTP_USER ||
    COMPANY.emails[sender] ||
    COMPANY.emails.noReply;

  const pass =
    process.env[`SMTP_${prefix}_PASS`] ||
    process.env.SMTP_PASS ||
    process.env.SMTP_NOREPLY_PASS ||
    "";

  const from =
    process.env[`SMTP_${prefix}_FROM`] ||
    process.env.SMTP_FROM ||
    `"${COMPANY.displayName}" <${COMPANY.emails[sender]}>`;

  if (!host || !user || !pass) {
    throw new Error(
      `SMTP config missing for sender: ${sender} (prefix: ${prefix})`
    );
  }

  return { host, port, secure, user, pass, from };
}

function buildTransportOptions(config: SmtpConfig): SMTPTransport.Options {
  const rejectUnauthorized =
    process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false";

  const options: SMTPTransport.Options = {
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 25000,
    requireTLS: !config.secure && config.port === 587,
    tls: {
      minVersion: "TLSv1.2",
      servername: config.host,
      rejectUnauthorized,
    },
  };

  return options;
}

const transporterCache = new Map<string, nodemailer.Transporter>();

export function getSmtpTransporter(
  sender: SenderKey = "noReply"
): nodemailer.Transporter {
  const config = getSmtpConfig(sender);
  const cacheKey = `${config.host}:${config.port}:${config.user}:${config.secure}`;
  const cached = transporterCache.get(cacheKey);
  if (cached) return cached;

  const transporter = nodemailer.createTransport(buildTransportOptions(config));
  transporterCache.set(cacheKey, transporter);
  return transporter;
}

export function getSmtpFromAddress(sender: SenderKey = "noReply"): string {
  const prefix = senderEnvMap[sender];
  const envFrom = process.env[`SMTP_${prefix}_FROM`] || process.env.SMTP_FROM;
  if (envFrom) return envFrom;
  return `"${COMPANY.displayName}" <${COMPANY.emails[sender]}>`;
}

export function hasSenderCredentials(sender: SenderKey): boolean {
  try {
    getSmtpConfig(sender);
    return true;
  } catch {
    return false;
  }
}

export function isSmtpConfigured(sender: SenderKey = "noReply"): boolean {
  if (hasSenderCredentials(sender)) return true;
  if (sender !== "noReply") return hasSenderCredentials("noReply");
  return false;
}

export function resolveSender(sender: SenderKey): SenderKey {
  try {
    getSmtpConfig(sender);
    return sender;
  } catch {
    return "noReply";
  }
}

export async function verifySmtpConnection(
  sender: SenderKey = "noReply"
): Promise<{
  ok: boolean;
  host: string;
  port: number;
  secure: boolean;
  error?: string;
}> {
  try {
    const resolved = resolveSender(sender);
    const config = getSmtpConfig(resolved);
    const transporter = getSmtpTransporter(resolved);
    await transporter.verify();
    return {
      ok: true,
      host: config.host,
      port: config.port,
      secure: config.secure,
    };
  } catch (e) {
    let host = "unknown";
    let port = 0;
    let secure = false;
    try {
      const c = getSmtpConfig(resolveSender(sender));
      host = c.host;
      port = c.port;
      secure = c.secure;
    } catch {
      /* ignore */
    }
    return {
      ok: false,
      host,
      port,
      secure,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
