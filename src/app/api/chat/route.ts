import { NextResponse } from "next/server";
import { COMPANY } from "@/config/company";
import { packagesData } from "@/data/packagesData";
import { servicesData } from "@/data/servicesData";
import { portfolioProjects } from "@/data/portfolioData";
import { buildQueryGroundedKnowledge } from "@/lib/ai/knowledge";
import { completeWithProviders, hasAnyProvider } from "@/lib/ai/providers";
import { loadUserMemory } from "@/lib/ai/tools";
import { z } from "zod";
import { guardAiRequest, readBoundedAiJson, InvalidAiRequest } from "@/lib/ai/request-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  let systemPrompt = `You are the homepage assistant for ${COMPANY.displayName}. Keep replies short, warm, and professional — like a polished chat conversation, not an essay.\n\n${knowledge}\n\nFOUNDER:\n${founderInfo}\n\nSTYLE:\n- Default: 1–4 short paragraphs or a few bullets. Ask ONE useful follow-up.\n- Do not use heavy Markdown. Prefer plain conversational text.\n- Use emojis sparingly or not at all.\n- Never invent pricing, clients, awards, timelines, or guarantees.\n- If knowledge is insufficient: "I don't want to guess on that. If you tell me what you're looking to build, I can help you find the right next step."\n- For custom pricing: "Custom projects are scoped around your requirements, features and timeline. Tell me what you're planning and I can help you understand the right direction."\n- For strong purchase intent, offer Free Demo, Contact, or Consultation once — do not spam CTAs.\n- If they ask for a human, collect name, email, phone, and a short project summary, then include \`[HUMAN_HANDOFF]\`.\n- Quote/price estimate: include \`[QUOTE_BUILDER]\`.\n- Schedule a call/demo: include \`[CALENDAR]\`.\n- Package purchase agreement: include \`[CHECKOUT:PackageName]\`.\n`;

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

    if (!hasAnyProvider()) {
      return NextResponse.json({
        success: true,
        reply: generateLocalFallbackReply(userQuery),
      });
    }

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
    } catch (e) {
      console.warn("[chat] provider failed", e);
    }

    return NextResponse.json({
      success: true,
      reply: generateLocalFallbackReply(userQuery),
    });
  } catch (error) {
    if (error instanceof InvalidAiRequest) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[Chat Route Error]", error);
    return NextResponse.json({
      success: true,
      reply: generateLocalFallbackReply(userQuery),
    });
  }
}
