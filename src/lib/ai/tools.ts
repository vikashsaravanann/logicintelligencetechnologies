import "server-only";
import * as React from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send-email";
import NewLeadNotificationEmail from "@/emails/new-lead-notification-email";
import LeadConfirmationEmail from "@/emails/lead-confirmation-email";
import { isValidEmail } from "@/lib/email/validation";

export type AiLeadSource = "chat_widget" | "ai_page";

export const AI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "lookup_lead_status",
      description:
        "Look up whether a submission (contact form, free demo, checklist, or AI-captured lead) exists for a given email. Use ONLY when the visitor provides their own email and asks about a prior submission.",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "The exact email address the visitor provided.",
          },
        },
        required: ["email"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "capture_lead",
      description:
        "Save a qualified lead when the visitor has shared at least their name and email and shown genuine interest. Triggers an internal team notification. Respond with a natural confirmation after calling — never say 'Lead captured'.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Visitor full name" },
          email: { type: "string", description: "Visitor email" },
          phone: { type: "string", description: "Phone if provided" },
          company: { type: "string", description: "Company if provided" },
          interest: {
            type: "string",
            description: "What they were asking about / project interest",
          },
        },
        required: ["name", "email"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "save_memory",
      description:
        "Persist a durable fact about a logged-in user (name, company, interested package, budget range, project type). Call only for stable facts worth remembering across sessions — not every message. Requires an authenticated user_id on the request.",
      parameters: {
        type: "object",
        properties: {
          memory_key: {
            type: "string",
            description:
              "Short key e.g. name, company, interested_package, budget_range, project_type",
          },
          memory_value: {
            type: "string",
            description: "The fact value to store",
          },
        },
        required: ["memory_key", "memory_value"],
      },
    },
  },
];

export async function lookupLeadStatus(_email: string) {
  // Disabled until submissions carry explicit, verified account ownership.
  // Merely stating an email (or matching an account email) is not proof.
  return { found: false, submissions: {}, note: "Contact support through the authenticated client portal for submission status." };
}

async function emailAlreadyCaptured(email: string): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from("ai_captured_leads")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .limit(1);
    return Boolean(data?.length);
  } catch {
    return false;
  }
}

export async function captureLead(args: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  interest?: string;
  source: AiLeadSource;
  userId?: string | null;
  chatId?: string | null;
}) {
  const name = String(args.name || "").trim();
  const email = String(args.email || "").trim().toLowerCase();
  if (!name || !isValidEmail(email)) {
    return { ok: false, error: "name and valid email are required" };
  }

  if (await emailAlreadyCaptured(email)) {
    return { ok: true, message: "Your enquiry has been received." };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("ai_captured_leads")
      .insert({
        name,
        email,
        phone: args.phone?.trim() || null,
        company: args.company?.trim() || null,
        interest: args.interest?.trim() || null,
        source: args.source,
        user_id: args.userId || null,
        chat_id: args.chatId || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[captureLead DB]", error);
      return { ok: false, error: "Could not save lead" };
    }

    // Internal notification (same pattern as free-demo)
    try {
      await sendEmail({
        to: [
          "support@logicintelligencetechnologies.in",
          "vikash@logicintelligencetechnologies.in",
        ],
        from: "noReply",
        replyTo: email,
        subject: `AI lead (${args.source}): ${name} — ${args.interest || "general"}`,
        react: React.createElement(NewLeadNotificationEmail, {
          fullName: name,
          companyName: args.company || "",
          email,
          phone: args.phone || "",
          service: args.interest || `AI capture (${args.source})`,
          requirements: `Captured via ${args.source}${args.chatId ? ` chat=${args.chatId}` : ""}`,
          submissionDate: new Date().toISOString(),
        }),
      });
    } catch (emailErr) {
      console.error("[captureLead email]", emailErr);
    }

    try {
      await sendEmail({
        to: email,
        from: "noReply",
        subject: "We received your request — Logic Intelligence Technologies",
        react: React.createElement(LeadConfirmationEmail, {
          fullName: name,
          service: args.interest || "your Logic AI enquiry",
        }),
      });
    } catch (visitorErr) {
      console.error("[captureLead visitor email]", visitorErr);
    }

    return {
      ok: true,
      message: "Your enquiry has been received.",
    };
  } catch (err) {
    console.error("[captureLead]", err);
    return { ok: false, error: "Failed to capture lead" };
  }
}

export async function loadUserMemory(userId: string): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin
      .from("ai_memory")
      .select("memory_key, memory_value")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(40);

    if (error || !data?.length) return "";

    const lines = data.map((r) => `- ${r.memory_key}: ${r.memory_value}`);
    return `KNOWN FACTS ABOUT THIS LOGGED-IN USER (from prior conversations):\n${lines.join("\n")}\nUse these for continuity. Do not awkwardly recite the list — apply naturally.`;
  } catch (err) {
    console.error("[loadUserMemory]", err);
    return "";
  }
}

export async function saveMemory(
  userId: string | null | undefined,
  memoryKey: string,
  memoryValue: string
) {
  if (!userId) {
    return { ok: false, error: "No authenticated user — memory skipped" };
  }
  const key = String(memoryKey || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .slice(0, 80);
  const value = String(memoryValue || "").trim().slice(0, 500);
  if (!key || !value) {
    return { ok: false, error: "memory_key and memory_value required" };
  }

  try {
    const { error } = await supabaseAdmin.from("ai_memory").upsert(
      {
        user_id: userId,
        memory_key: key,
        memory_value: value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,memory_key" }
    );
    if (error) {
      console.error("[saveMemory]", error);
      return { ok: false, error: "Could not save memory" };
    }
    return { ok: true, memory_key: key };
  } catch (err) {
    console.error("[saveMemory]", err);
    return { ok: false, error: "Failed to save memory" };
  }
}

export async function dispatchToolCall(
  name: string,
  args: Record<string, unknown>,
  ctx: {
    source: AiLeadSource;
    userId?: string | null;
    chatId?: string | null;
  }
) {
  if (name === "lookup_lead_status") {
    return lookupLeadStatus(String(args.email || ""));
  }
  if (name === "capture_lead") {
    // Do not let model-selected recipients trigger transactional email or
    // fabricate client ownership. Public validated forms remain available.
    return { ok: false, error: "Submit your enquiry using the contact form." };
  }
  if (name === "save_memory") {
    return saveMemory(
      ctx.userId,
      String(args.memory_key || ""),
      String(args.memory_value || "")
    );
  }
  return { ok: false, error: `Unknown tool: ${name}` };
}

export const LEAD_QUALIFICATION_GUIDANCE = `
LEAD QUALIFICATION (natural, non-pushy):
1. Always answer the visitor's actual question first. Never withhold a real answer until they give contact info.
2. After genuine interest (specific pricing, "how do we start", requirements/scope, or 2+ substantive exchanges), naturally ask for name and email so the team can follow up. Phone is optional.
3. Never demand name + email + phone in one message. Ask conversationally; call capture_lead only when you have at least name and email.
4. If they decline or ignore the ask, do not repeat it more than once in the same conversation — keep helping.
5. Never fabricate urgency or pressure tactics.
6. After capture_lead succeeds, confirm naturally (e.g. the team will reach out within 24 hours) — never say "Lead captured".
7. For logged-in users, use save_memory for durable facts (name, company, interested package, budget, project type) only.
`;
