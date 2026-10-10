import "server-only";

export type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GroqCompletionOptions = {
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
};

export type GroqResponse = {
  content: string;
  model: string;
  provider: "lit-ai";
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const CANDIDATE_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

export function isGroqConfigured(): boolean {
  const key = process.env.GROQ_API_KEY;
  return Boolean(key && key !== "[SENSITIVE]" && key.trim().length > 10);
}

function cleanResponse(raw: string): string {
  return (raw || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?think>/gi, "")
    .trim();
}

/**
 * Execute a completion via Groq, exclusively for the website chatbot.
 * Cascades through candidate models (Llama 3.3 70B, Llama 3.1 8B, Llama 3, Mixtral).
 */
export async function completeGroqChat(
  messages: GroqChatMessage[],
  options?: GroqCompletionOptions
): Promise<GroqResponse | null> {
  if (!isGroqConfigured()) return null;

  const key = process.env.GROQ_API_KEY!.trim();
  const temperature = options?.temperature ?? 0.4;
  const max_tokens = Math.min(1200, Math.max(64, options?.max_tokens ?? 900));

  for (const model of CANDIDATE_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.warn(`[GroqChat] Model ${model} returned ${res.status}: ${errText.slice(0, 150)}`);
        // If 404, 429, 400 or 5xx, try next model in candidate list
        continue;
      }

      const json = await res.json();
      const rawContent = json?.choices?.[0]?.message?.content ?? "";
      const cleaned = cleanResponse(rawContent);

      if (cleaned) {
        return {
          content: cleaned,
          model: "LIT Neural Engine",
          provider: "lit-ai" as const,
        };
      }
    } catch (err) {
      console.warn(`[GroqChat] Exception calling ${model}:`, err);
    }
  }

  return null;
}

/**
 * Stream a completion via Groq using Server-Sent Events (SSE) ReadableStream.
 * Returns null if Groq is not configured or fails to initialize stream.
 */
export async function streamGroqChat(
  messages: GroqChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<ReadableStream<Uint8Array> | null> {
  if (!isGroqConfigured()) return null;

  const key = process.env.GROQ_API_KEY!.trim();
  const temperature = options?.temperature ?? 0.4;
  const max_tokens = Math.min(1200, Math.max(64, options?.max_tokens ?? 900));

  for (const model of CANDIDATE_MODELS) {
    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: true,
        }),
        signal: AbortSignal.timeout(18000),
      });

      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => "");
        console.warn(`[GroqStream] ${model} returned ${res.status}: ${err.slice(0, 150)}`);
        continue;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      return new ReadableStream<Uint8Array>({
        async start(controller) {
          let buffer = "";
          let accumulated = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith("data:")) continue;
                const payload = trimmed.slice(5).trim();
                if (payload === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(payload);
                  const token = parsed?.choices?.[0]?.delta?.content ?? "";
                  if (token) {
                    accumulated += token;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`)
                    );
                  }
                } catch {
                  // Skip invalid chunk
                }
              }
            }

            const cleaned = cleanResponse(accumulated);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "done", content: cleaned, model: "LIT Neural Engine", provider: "lit-ai" })}\n\n`)
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (streamErr) {
            controller.error(streamErr);
          } finally {
            reader.releaseLock();
          }
        },
      });
    } catch (err) {
      console.warn(`[GroqStream] Failed on ${model}:`, err);
    }
  }

  return null;
}
