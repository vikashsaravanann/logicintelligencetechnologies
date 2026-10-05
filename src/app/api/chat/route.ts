import { NextResponse } from "next/server";
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
} from "@/lib/ai/tools";
import { z } from "zod";
import { guardAiRequest, readBoundedAiJson, InvalidAiRequest } from "@/lib/ai/request-guard";

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
  content: z.string().min(1).max(4000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(12),
  chat_id: z.string().uuid().optional().nullable(),
});

function buildSystemPrompt(opts: {
  knowledge: string;
  leadContext?: string;
  memoryContext?: string;
}): string {
  const knowledge = opts.knowledge;
  const founderInfo = `Founder: ${COMPANY.founder.name} (${COMPANY.founder.title}) - ${COMPANY.founder.bio}`;

  let systemPrompt = `You are the homepage assistant for ${COMPANY.displayName}. Keep replies short, warm, and professional — like a polished chat conversation, not an essay.

${knowledge}

FOUNDER:
${founderInfo}

STYLE:
- Default: 1–4 short paragraphs or a few bullets. Ask ONE useful follow-up.
- Do not use heavy Markdown. Prefer plain conversational text.
- Use emojis sparingly or not at all.
- Never invent pricing, clients, awards, timelines, or guarantees.
- If knowledge is insufficient: "I don't want to guess on that. If you tell me what you're looking to build, I can help you find the right next step."
- For custom pricing: "Custom projects are scoped around your requirements, features and timeline. Tell me what you're planning and I can help you understand the right direction."
- For strong purchase intent, offer Free Demo, Contact, or Consultation once — do not spam CTAs.
- If they ask for a human, collect name, email, phone, and a short project summary, then include \`[HUMAN_HANDOFF]\`.
- Quote/price estimate: include \`[QUOTE_BUILDER]\`.
- Schedule a call/demo: include \`[CALENDAR]\`.
- Package purchase agreement: include \`[CHECKOUT:PackageName]\`.
- Use tools when appropriate: capture_lead (name+email, once per conversation), lookup_lead_status, save_memory (logged-in only).
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

export async function POST(req: Request) {
  let userQuery = "";

  try {
    const auth = await guardAiRequest();
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    const body = await readBoundedAiJson(req);
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const messages = parsed.data.messages;
    // Do not attach privileged lead writes to a browser-supplied chat owner.
    const chatId = null;
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";
    userQuery = lastUserMessage;

    const userId = auth.user.id;
    const memoryContext = userId ? await loadUserMemory(userId) : "";

    let leadContext = "";
    const emailMatch = lastUserMessage.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    );
    if (
      emailMatch &&
      /status|submit|form|lead|check|demo|quote|request/i.test(lastUserMessage)
    ) {
      leadContext = "Lead status is available through the authenticated client portal or support team only.";
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

    // Exactly one provider path; never repeat a completed paid call in legacy code.
    if (hasAnyProvider()) {
    try {
      const dual = await completeWithProviders(conversation as any, {
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
      console.warn("[chat] provider failed", e);
    }
    return NextResponse.json({ success: true, reply: generateLocalFallbackReply(userQuery) });
    }

    const toolCtx = {
      source: "chat_widget" as const,
      userId,
      chatId,
    };

    let finalReply = "";
    for (const model of getCandidateModels().slice(0, 1)) {
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
            max_tokens: 900,
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
                max_tokens: 900,
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

        // One bounded tool round.
        for (let i = 0; i < 1 && assistantMessage?.tool_calls?.length; i++) {
          const toolMessages: Array<Record<string, unknown>> = [];
          for (const toolCall of assistantMessage.tool_calls.slice(0, 2)) {
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
              max_tokens: 900,
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
    if (error instanceof InvalidAiRequest) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[Chat Route Error]", error);
    return NextResponse.json({
      success: true,
      reply: generateLocalFallbackReply(userQuery),
    });
  }
}
