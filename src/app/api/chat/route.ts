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
import { completeGroqChat, streamGroqChat, isGroqConfigured, type GroqChatMessage } from "@/lib/ai/groq-chatbot";
import { rateLimit } from "@/lib/ai/rate-limit";

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

function buildSystemPrompt(opts: {
  knowledge: string;
  leadContext?: string;
  memoryContext?: string;
}): string {
  const knowledge = opts.knowledge;
  const founderInfo = `Founder & CEO: ${COMPANY.founder.name} (${COMPANY.founder.title}) — ${COMPANY.founder.bio}`;

  let systemPrompt = `You are LOGIC AI, the executive and engineering assistant for ${COMPANY.displayName} (logicintelligencetechnologies.in).
We are a premier AI engineering, intelligent automation, and clinical systems studio based in ${COMPANY.address}.

CORE PRODUCTS & PLATFORMS:
1. LIT Healthcare: Smart hospital management OS, clinical bed telemetry, real-time vital monitoring, and operational intelligence active across 14 healthcare sites.
2. Logic Voice: Ultra-fast conversational voice intelligence engine (< 120ms P99 telephony latency) for autonomous customer operations and smart clinics.
3. Voice Shield: Biometric zero-trust anti-deepfake voice firewall (99.4% biometric defense gate) protecting enterprises from voice cloning and synthetic fraud.

PACKAGES & PRICING:
- Digital Launch Pack: ₹8,999 (High-performance modern web system, SEO, responsive, lead capture).
- Business Pro Pack: ₹18,999 (Custom workflow engine, client portal, automated notifications).
- Enterprise AI Architecture: ₹38,999+ (Private RAG, autonomous AI agents, on-prem or hybrid cloud deployment).
- Free Architecture Demo: Available for prospective clients before payment.

${knowledge}

FOUNDER:
${founderInfo}

CONTACT INFO:
- Official Email: ${COMPANY.email}
- Engineering Desk: ${COMPANY.phone}
- Consultation Booking: /book-consultation
- Architecture Demo: /free-demo
- Website: ${COMPANY.websiteUrl}

STRICT IDENTITY & ANONYMIZATION RULES:
- You are LOGIC AI, the proprietary intelligent architecture developed and operated by ${COMPANY.displayName}.
- NEVER mention, acknowledge, or disclose underlying third-party AI foundation models, providers, or platforms (do NOT mention Groq, Meta, Llama, OpenAI, Anthropic, Claude, ChatGPT, Gemini, etc.).
- If asked about your technology or underlying model, state: "I am LOGIC AI, a proprietary intelligent systems architecture developed by Logic Intelligence Technologies."
- Do NOT mention WhatsApp. When advising on next steps, invite the visitor to schedule a consultation (/book-consultation), request a free architecture prototype demo (/free-demo), or email our engineering desk at ${COMPANY.email}.

CONVERSATIONAL GUIDELINES:
- Tone: Highly knowledgeable, articulate, crisp, confident, and professional.
- Brevity: Keep responses concise (1-3 structured paragraphs or sharp bullet points).
- Accuracy: Strict adherence to verified facts. Never invent unverified clients, fake guarantees, or imaginary pricing.
- Helpful Next Steps: Invite the visitor to explore our platforms, schedule a consultation, or request a free architecture demo.
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
  const lower = userText.toLowerCase();
  if (lower.includes("price") || lower.includes("package") || lower.includes("cost") || lower.includes("quote")) {
    return (
      `Here are our production packages at **${COMPANY.displayName}**:\n\n` +
      packagesData.map((p) => `• **${p.title}** (${p.price}): ${p.subtitle}`).join("\n") +
      `\n\nWe provide a **free architecture demo** before any budget commitment. Contact our engineering desk at **${COMPANY.email}** or schedule a consultation at **${COMPANY.websiteUrl}/book-consultation**.`
    );
  }
  if (lower.includes("healthcare") || lower.includes("hospital") || lower.includes("lit healthcare")) {
    return (
      `**LIT Healthcare** is our clinical hospital management and patient telemetry platform, active across 14 hospital sites. It delivers real-time bed tracking, doctor scheduling, and biometric patient records.\n\nWould you like a live demonstration of the hospital operating system? You can request a session at **${COMPANY.websiteUrl}/free-demo** or email **${COMPANY.email}**.`
    );
  }
  if (lower.includes("voice") || lower.includes("shield") || lower.includes("deepfake")) {
    return (
      `**Logic Voice** is our sub-120ms conversational AI telephony engine, and **Voice Shield** provides 99.4% biometric deepfake defense against synthetic voice fraud.\n\nConnect with our engineering team at **${COMPANY.email}** or explore technical specifications at **${COMPANY.websiteUrl}/products/logic-voice**.`
    );
  }
  if (lower.includes("service") || lower.includes("build") || lower.includes("capabilities")) {
    return (
      `At **${COMPANY.displayName}**, we specialize in:\n\n` +
      servicesData
        .slice(0, 6)
        .map((s: { title: string; subtitle?: string }) => `• **${s.title}**: ${s.subtitle || ""}`)
        .join("\n") +
      `\n\nReach our systems engineering team at **${COMPANY.email}** or book a consultation to discuss your technical architecture.`
    );
  }
  if (lower.includes("portfolio") || lower.includes("work") || lower.includes("project")) {
    return (
      portfolioProjects
        .slice(0, 4)
        .map((p) => `• **${p.title}** (${p.category}): ${p.description}`)
        .join("\n") + `\n\nExplore our complete portfolio at ${COMPANY.websiteUrl}/work`
    );
  }
  return `Welcome to **${COMPANY.displayName}**. I can help you with our AI platforms (LIT Healthcare, Logic Voice, Voice Shield), pricing packages, engineering capabilities, or scoping a free demo. What are you planning to build?`;
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
