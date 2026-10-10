import { NextResponse } from "next/server";
import { COMPANY } from "@/config/company";
import { buildQueryGroundedKnowledge } from "@/lib/ai/knowledge";
import { completeWithProviders, hasAnyProvider } from "@/lib/ai/providers";
import { loadUserMemory } from "@/lib/ai/tools";
import { z } from "zod";
import { guardAiRequest, readBoundedAiJson, InvalidAiRequest } from "@/lib/ai/request-guard";
import { completeGroqChat, streamGroqChat, isGroqConfigured, type GroqChatMessage } from "@/lib/ai/groq-chatbot";
import { rateLimit } from "@/lib/ai/rate-limit";
import { MASTER_COMPANY_KNOWLEDGE, generateAuthoritativeReply } from "@/lib/ai/company-knowledge";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(16),
  chat_id: z.string().uuid().optional().nullable(),
  stream: z.boolean().optional(),
});

export async function GET() {
  if (!isGroqConfigured()) {
    return NextResponse.json({ configured: false });
  }
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY!.trim()}` },
    });
    const data = await res.json();
    const modelIds = (data?.data || []).map((m: { id: string }) => m.id);
    return NextResponse.json({ configured: true, count: modelIds.length, models: modelIds });
  } catch (err: any) {
    return NextResponse.json({ configured: true, error: String(err) }, { status: 500 });
  }
}

function buildSystemPrompt(opts: {
  knowledge: string;
  leadContext?: string;
  memoryContext?: string;
}): string {
  const dynamicKnowledge = opts.knowledge ? `\n\nDYNAMIC GROUNDING KNOWLEDGE:\n${opts.knowledge}` : "";

  let systemPrompt = `You are LOGIC AI, the senior executive engineering assistant and official AI representative for ${COMPANY.displayName} (${COMPANY.websiteUrl}).
We are a premier AI systems engineering, intelligent automation, and clinical healthcare software studio based in ${COMPANY.address}.

YOUR MISSION & PROFESSIONAL PERSONA:
- You speak with executive authority, deep technical mastery, mathematical rigor, and polished corporate professionalism.
- You have complete, direct, and authoritative access to all proprietary platforms, clinical systems, voice engines, security firewalls, pricing packages, and leadership data of Logic Intelligence Technologies.
- Always provide structured, comprehensive, and detailed answers. When explaining products or services, detail their architectural specifications, latencies, security models, and operational capabilities.
- Avoid vague or hand-waving responses. Provide concrete figures, metrics, and exact pricing where relevant.
- Tone: Formal, articulate, sophisticated, authoritative, and helpful.

${MASTER_COMPANY_KNOWLEDGE}
${dynamicKnowledge}

STRICT IDENTITY, ANONYMIZATION & OPERATIONAL RULES:
1. You are LOGIC AI, the proprietary intelligent architecture developed and operated exclusively by ${COMPANY.displayName}.
2. NEVER mention, acknowledge, or disclose any third-party foundation models, providers, or platforms (do NOT mention Groq, Meta, Llama, OpenAI, Anthropic, Claude, ChatGPT, Gemini, Mistral, etc.). If asked what model or architecture powers you, state: "I am LOGIC AI, a proprietary intelligent systems architecture developed and operated by Logic Intelligence Technologies."
3. Next steps & consultation guidance:
   - Invite visitors to schedule an architecture consultation at ${COMPANY.websiteUrl}/book-consultation
   - Invite visitors to request our complimentary pre-payment architecture demo at ${COMPANY.websiteUrl}/free-demo
   - Or connect directly with our engineering desk by phone at ${COMPANY.phone} or email at ${COMPANY.email}.
4. Accuracy & Integrity: Adhere strictly to the verified platform specifications in the dossier above. Never invent unverified clients, fake statistical guarantees, or arbitrary discounts.
`;

  if (opts.memoryContext) {
    systemPrompt += `\n\nUSER MEMORY CONTEXT:\n${opts.memoryContext}`;
  }
  if (opts.leadContext) {
    systemPrompt += `\n\nLEAD SUBMISSION LOOKUP RESULT:\n${opts.leadContext}\n(Use this verified data to answer status questions directly.)`;
  }
  return systemPrompt;
}

function cleanModelResponse(rawText: string): string {
  return rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?think>/gi, "")
    .trim();
}

function generateLocalFallbackReply(userText: string): string {
  return generateAuthoritativeReply(userText);
}

export async function POST(req: Request) {
  let userQuery = "";

  try {
    const auth = await guardAiRequest();

    // When Groq is configured for chatbot, allow public visitor interaction with IP rate limiting.
    if (!auth.ok && !isGroqConfigured()) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    // IP rate-limit check for public/guest chatbot visitors
    if (!auth.ok) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "anonymous-visitor";
      const allowedMinute = await rateLimit(`ai:public:chat:${ip}`, 15, 60_000);
      if (!allowedMinute) {
        return NextResponse.json(
          {
            success: false,
            reply: `You have sent several inquiries in a short duration. For immediate assistance, please connect with our engineering team at **${COMPANY.email}** or schedule a consultation at **${COMPANY.websiteUrl}/book-consultation**.`,
          },
          { status: 429 }
        );
      }
    }

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

    const userId = auth.ok ? auth.user.id : null;
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

    const conversation: GroqChatMessage[] = [
      {
        role: "system",
        content: buildSystemPrompt({ knowledge: knowledgeBlock, leadContext, memoryContext }),
      },
      ...messages,
    ];

    // 1. Primary: Groq API (Integrated exclusively for the chatbot)
    if (isGroqConfigured()) {
      if (parsed.data.stream) {
        const stream = await streamGroqChat(conversation);
        if (stream) {
          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          });
        }
      }

      const groqRes = await completeGroqChat(conversation, {
        temperature: 0.4,
        max_tokens: 950,
      });

      if (groqRes && groqRes.content) {
        return NextResponse.json({
          success: true,
          reply: groqRes.content,
          model: "LIT Neural Engine",
          provider: "lit-ai",
        });
      }
    }

    // 2. Secondary: Fall back to existing system providers if available
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
              provider: "lit-ai",
              model: "LIT Neural Engine",
            });
          }
        }
      } catch (e) {
        console.warn("[chat] secondary provider failed", e);
      }
    }

    // 3. Fallback: Local knowledge-grounded response
    return NextResponse.json({
      success: true,
      reply: generateLocalFallbackReply(userQuery),
      provider: "local-grounded",
    });
  } catch (error) {
    if (error instanceof InvalidAiRequest) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[Chat Route Error]", error);
    return NextResponse.json({
      success: true,
      reply: generateLocalFallbackReply(userQuery),
      provider: "local-fallback",
    });
  }
}
