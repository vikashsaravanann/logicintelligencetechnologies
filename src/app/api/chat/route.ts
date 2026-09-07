import { NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { COMPANY } from "@/config/company";
import { packagesData } from "@/data/packagesData";
import { servicesData } from "@/data/servicesData";
import { portfolioProjects } from "@/data/portfolioData";
import { buildQueryGroundedKnowledge } from "@/lib/ai/knowledge";
import { completeWithProviders, hasAnyProvider } from "@/lib/ai/providers";
import {
  AI_TOOLS,
  dispatchToolCall,
  loadUserMemory,
  lookupLeadStatus,
} from "@/lib/ai/tools";
import { env } from "@/config/env";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GROQ_API_KEY =
  process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.GROQ_API_KEY;
const GROQ_API_URL =
  process.env.GROQ_API_URL ||
  process.env.XAI_API_URL ||
  "https://api.groq.com/openai/v1/chat/completions";

function getCandidateModels(): string[] {
  const envModel = process.env.GROQ_MODEL || process.env.GROK_MODEL;
  if (GROQ_API_URL.includes("x.ai")) {
    return [envModel, "grok-beta"].filter(Boolean) as string[];
  }
  if (GROQ_API_URL.includes("openrouter.ai")) {
    return [envModel, "qwen/qwen-2.5-72b-instruct"].filter(Boolean) as string[];
  }
  return [
    envModel,
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "groq/compound-mini",
  ].filter(Boolean) as string[];
}

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(10000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
  chat_id: z.string().uuid().optional().nullable(),
});

function buildSystemPrompt(opts: {
  knowledge: string;
  leadContext?: string;
  memoryContext?: string;
}): string {
  const knowledge = opts.knowledge;
  const founderInfo = `Founder: ${COMPANY.founder.name} (${COMPANY.founder.title}) - ${COMPANY.founder.bio}`;

  let systemPrompt = `You are the support assistant for ${COMPANY.displayName} on the website chat widget. You also answer general knowledge questions accurately and professionally when asked — not only company topics.

${knowledge}

FOUNDER:
${founderInfo}

GUIDELINES:
1. Answer from verified company facts. Never invent pricing, timelines, or terms.
2. Be concise, professional, and helpful. Prefer short paragraphs or bullets.
3. If info is missing, say so and offer WhatsApp (${COMPANY.phone}) or /contact.
4. CRITICAL: if the user asks for a quote/price estimate, include \`[QUOTE_BUILDER]\` in the reply.
5. CRITICAL: if they ask for a human/ticket/frustrated handoff, include \`[HUMAN_HANDOFF]\`.
6. CRITICAL: if they clearly agree to buy a package, output \`[CHECKOUT:PackageName]\`.
7. CRITICAL: if they ask to schedule a call/demo, output \`[CALENDAR]\`.
8. Use tools when appropriate: capture_lead (name+email), lookup_lead_status, save_memory (logged-in only).
`;

  if (opts.memoryContext) {
    systemPrompt += `\n\n${opts.memoryContext}`;
  }
  if (opts.leadContext) {
    systemPrompt += `\n\nLEAD SUBMISSION LOOKUP RESULT:\n${opts.leadContext}\n(Use this verified data to answer status questions directly.)`;
  }
  return systemPrompt;
}

function cleanModelResponse(rawText: string): string {
  return rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function generateLocalFallbackReply(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes("price") || lower.includes("package") || lower.includes("quote")) {
    return (
      `Here are our packages at ${COMPANY.displayName}:\n\n` +
      packagesData.map((p) => `• **${p.title}** (${p.price}): ${p.subtitle}`).join("\n") +
      `\n\nWhatsApp **${COMPANY.phone}** or **${COMPANY.email}** for a custom quote.`
    );
  }
  if (lower.includes("service") || lower.includes("build")) {
    return (
      `We deliver:\n\n` +
      servicesData
        .slice(0, 6)
        .map((s: { title: string; subtitle?: string }) => `• **${s.title}**: ${s.subtitle || ""}`)
        .join("\n") +
      `\n\nWhatsApp **${COMPANY.phone}** to talk through your project.`
    );
  }
  if (lower.includes("portfolio") || lower.includes("work")) {
    return (
      portfolioProjects
        .slice(0, 4)
        .map((p) => `• **${p.title}** (${p.category}): ${p.description}`)
        .join("\n") + `\n\nMore at ${COMPANY.websiteUrl}/work`
    );
  }
  return `I'm the ${COMPANY.displayName} assistant. Ask about packages, services, or past work — or reach us on WhatsApp at ${COMPANY.phone}.`;
}

async function resolveUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerComponentClient(
      { cookies: () => cookieStore as any },
      {
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    );
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let userQuery = "";

  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const messages = parsed.data.messages;
    const chatId = parsed.data.chat_id ?? null;
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";
    userQuery = lastUserMessage;

    const userId = await resolveUserId();
    const memoryContext = userId ? await loadUserMemory(userId) : "";

    let leadContext = "";
    const emailMatch = lastUserMessage.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    );
    if (
      emailMatch &&
      /status|submit|form|lead|check|demo|quote|request/i.test(lastUserMessage)
    ) {
      leadContext = JSON.stringify(await lookupLeadStatus(emailMatch[0]), null, 2);
    }

    const { block: knowledgeBlock } = await buildQueryGroundedKnowledge(lastUserMessage);

    const conversation: Array<Record<string, unknown>> = [
      {
        role: "system",
        content: buildSystemPrompt({ knowledge: knowledgeBlock, leadContext, memoryContext }),
      },
      ...messages,
    ];

    if (!hasAnyProvider() && !GROQ_API_KEY) {
      return NextResponse.json({
        success: true,
        reply: generateLocalFallbackReply(userQuery),
      });
    }

    // Parallel Groq + xAI (Grok): first successful reply wins
    try {
      const dual = await completeWithProviders(conversation as any, {
        tools: AI_TOOLS as any,
        temperature: 0.4,
        max_tokens: 900,
      });
      if (dual.content) {
        const cleaned = cleanModelResponse(dual.content);
        if (cleaned) {
          return NextResponse.json({
            success: true,
            reply: cleaned,
            generated_text: cleaned,
            provider: dual.provider,
            model: dual.model,
          });
        }
      }
      // tool_calls path: fall through to existing sequential handler if raw has tools
      const toolMsg = (dual.raw as any)?.choices?.[0]?.message;
      if (toolMsg?.tool_calls?.length && dual.provider !== "none") {
        // handled below by legacy loop when dual only returned tools — continue
      }
    } catch (e) {
      console.warn("[chat] dual provider race failed", e);
    }

    const toolCtx = {
      source: "chat_widget" as const,
      userId,
      chatId,
    };

    let finalReply = "";
    for (const model of getCandidateModels()) {
      try {
        let response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: conversation,
            tools: AI_TOOLS,
            tool_choice: "auto",
            temperature: 0.4,
          }),
          signal: AbortSignal.timeout(12000),
        });

        if (response.status === 400) {
          const errText = await response.text();
          if (/tool|function/i.test(errText)) {
            response = await fetch(GROQ_API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${GROQ_API_KEY}`,
              },
              body: JSON.stringify({
                model,
                messages: conversation,
                temperature: 0.4,
              }),
              signal: AbortSignal.timeout(12000),
            });
          }
        }

        if (!response.ok) {
          console.warn(`[Chat API] Model ${model} status ${response.status}`);
          continue;
        }

        let data = await response.json();
        let assistantMessage = data.choices?.[0]?.message;

        // Multi-tool loop (max 3)
        for (let i = 0; i < 3 && assistantMessage?.tool_calls?.length; i++) {
          const toolMessages: Array<Record<string, unknown>> = [];
          for (const toolCall of assistantMessage.tool_calls) {
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(toolCall.function.arguments || "{}");
            } catch {
              args = {};
            }
            const toolResult = await dispatchToolCall(
              toolCall.function.name,
              args,
              toolCtx
            );
            toolMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify(toolResult),
            });
          }

          const followUp = [...conversation, assistantMessage, ...toolMessages];
          const followupResponse = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model,
              messages: followUp,
              tools: AI_TOOLS,
              tool_choice: "auto",
              temperature: 0.4,
            }),
            signal: AbortSignal.timeout(12000),
          });

          if (!followupResponse.ok) break;
          data = await followupResponse.json();
          assistantMessage = data.choices?.[0]?.message;
          conversation.push(...toolMessages);
        }

        const rawContent =
          assistantMessage?.content || assistantMessage?.reasoning_content || "";
        const cleaned = cleanModelResponse(rawContent);
        if (cleaned) {
          finalReply = cleaned;
          break;
        }
      } catch (modelError) {
        console.warn(`[Chat API] Error model ${model}:`, modelError);
      }
    }

    if (!finalReply) finalReply = generateLocalFallbackReply(userQuery);

    return NextResponse.json({ success: true, reply: finalReply });
  } catch (error) {
    console.error("[Chat Route Error]", error);
    return NextResponse.json({
      success: true,
      reply: generateLocalFallbackReply(userQuery),
    });
  }
}
