import "server-only";
import * as React from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "./send-email";
import WelcomeEmail from "@/emails/welcome-email";
import { isSupabaseLive } from "./config";
import { isValidEmail, normalizeEmail, sanitizePersonName } from "./validation";
import { emailLog, maskEmail } from "./logger";

interface EnsureWelcomeOptions {
  userId?: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export async function ensureWelcomeEmail({
  userId,
  email,
  fullName,
}: EnsureWelcomeOptions) {
  const cleanEmail = normalizeEmail(email);
  if (!isValidEmail(cleanEmail)) {
    return { success: false, message: "Invalid email address", alreadySent: false };
  }
  const safeName = sanitizePersonName(fullName || "") || null;

  try {
    if (userId && isSupabaseLive()) {
      const { data: claimed, error } = await supabaseAdmin
        .from("profiles")
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq("id", userId)
        .is("welcome_email_sent_at", null)
        .select("id")
        .maybeSingle();

      if (error) {
        emailLog("warn", "welcome_claim_failed", {
          message: error.message?.slice(0, 180),
        });
      } else if (!claimed) {
        const { data: existing } = await supabaseAdmin
          .from("profiles")
          .select("welcome_email_sent_at")
          .eq("id", userId)
          .maybeSingle();
        if (existing?.welcome_email_sent_at) {
          return {
            success: true,
            message: "Welcome email already sent",
            alreadySent: true,
          };
        }
      }
    }

    const emailResult = await sendEmail({
      to: cleanEmail,
      from: "noReply",
      subject: "Welcome to Logic Intelligence Technologies",
      category: "transactional",
      eventType: "welcome",
      templateKey: "welcome-email",
      idempotencyKey: userId ? `welcome:${userId}` : `welcome-email:${cleanEmail}`,
      react: React.createElement(WelcomeEmail, {
        email: safeName || cleanEmail,
      }),
    });

    if (!emailResult.success) {
      emailLog("error", "welcome_send_failed", {
        recipient: maskEmail(cleanEmail),
        message: emailResult.message,
      });
      if (userId && isSupabaseLive()) {
        await supabaseAdmin
          .from("profiles")
          .update({ welcome_email_sent_at: null })
          .eq("id", userId);
      }
      return {
        success: false,
        message: emailResult.message,
        alreadySent: false,
      };
    }

    if (emailResult.skipped && emailResult.message === "Already sent") {
      return { success: true, message: "Welcome email already sent", alreadySent: true };
    }

    return {
      success: true,
      message: "Welcome email queued",
      alreadySent: Boolean(emailResult.skipped),
    };
  } catch (error) {
    emailLog("error", "welcome_exception", {
      message: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      message: "Internal server error",
      alreadySent: false,
    };
  }
}
