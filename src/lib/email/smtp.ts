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

/**
 * Production policy (LIT):
 * - Only two Zoho app passwords are maintained: NOREPLY and HELLO.
 * - Welcome / system / transactional notifications → noReply identity + SMTP_NOREPLY_PASS
 * - Support / contact / admin / founder-facing / general business → hello identity auth via SMTP_HELLO_PASS
 *   (From: address still reflects the logical sender; auth user is the mailbox that holds the password)
 */
const senderEnvMap: Record<SenderKey, string> = {
  noReply: "NOREPLY",
  vikash: "HELLO",
  hello: "HELLO",
  admin: "HELLO",
  support: "HELLO",
  contact: "HELLO",
};

/** Logical From: address still uses COMPANY.emails[sender]; auth uses credential pool. */
function credentialPool(sender: SenderKey): "NOREPLY" | "HELLO" {
  return sender === "noReply" ? "NOREPLY" : "HELLO";
}

/**
 * Zoho Mail (India): smtp.zoho.in
 * - Port 465 → implicit TLS (secure: true)
 * - Port 587 → STARTTLS (secure: false, requireTLS: true)
 */
function getSmtpConfig(sender: SenderKey): SmtpConfig {
  const pool = credentialPool(sender);
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

  // Auth user: the mailbox that owns the app password for this pool.
  // Prefer explicit per-pool user, then shared SMTP_USER, then company default for the pool.
  const poolUserDefault =
    pool === "NOREPLY"
      ? COMPANY.emails.noReply
      : COMPANY.emails.hello;

  const user =
    process.env[`SMTP_${pool}_USER`] ||
    process.env[`SMTP_${prefix}_USER`] ||
    process.env.SMTP_USER ||
    poolUserDefault;

  // Password: only the two maintained secrets.
  const pass =
    (pool === "NOREPLY"
      ? process.env.SMTP_NOREPLY_PASS
      : process.env.SMTP_HELLO_PASS) ||
    process.env.SMTP_PASS ||
    "";

  // From: always the logical sender identity (branded display name).
  const from =
    process.env[`SMTP_${prefix}_FROM`] ||
    process.env.SMTP_FROM ||
    `"${COMPANY.displayName}" <${COMPANY.emails[sender]}>`;

  if (!host || !user || !pass) {
    throw new Error(
      `SMTP config missing for sender: ${sender} (pool: ${pool}). ` +
        `Set SMTP_${pool}_PASS (or SMTP_PASS) and ensure SMTP_HOST / SMTP_USER are configured.`
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
  // Cache by auth identity (not From:), so hello-pool senders share one transport.
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
  // Either pool being present is enough for system health checks.
  if (sender !== "noReply") return hasSenderCredentials("noReply");
  return hasSenderCredentials("hello");
}

export function resolveSender(sender: SenderKey): SenderKey {
  try {
    getSmtpConfig(sender);
    return sender;
  } catch {
    // Prefer noReply for transactional fallback; then hello.
    if (hasSenderCredentials("noReply")) return "noReply";
    if (hasSenderCredentials("hello")) return "hello";
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
