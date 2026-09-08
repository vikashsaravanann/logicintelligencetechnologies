"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COMPANY } from "@/config/company";
import { MarkdownMessage } from "@/components/ai/markdown-message";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
};

const GREETING: ChatMessage = {
  role: "assistant",
  content: `Hi! I'm the ${COMPANY.displayName} support assistant. Ask about packages, services, or past work — or share your email to check a form you submitted.`,
};

const PRICE_RE = /₹|price|pack|cost|8,999|18,999|how much/i;
function waTranscript(messages: ChatMessage[]) {
  const slice = messages.filter((m) => m.content).slice(-6);
  const body =
    "Hi LIT — from the site chat.\n\n" +
    slice
      .map((m) => `${m.role === "user" ? "Visitor" : "LOGIC AI"}: ${m.content.replace(/\s+/g, " ").slice(0, 280)}`)
      .join("\n\n");
  return `https://wa.me/${COMPANY.phone.replace(/\D/g, "")}?text=${encodeURIComponent(body.slice(0, 1800))}`;
}

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [showLead, setShowLead] = useState(false);
  const [leadOk, setLeadOk] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const history = messages
      .filter((m) => m !== GREETING)
      .concat({ role: "user", content: text })
      .slice(-16);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setLoading(true);

    try {
      // Prefer streaming /api/ai for responsive UX; fall back to /api/chat JSON
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          text,
          history: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: true,
          max_tokens: 700,
          mode: "company",
        }),
        signal: AbortSignal.timeout(28000),
      });

      const ctype = res.headers.get("content-type") || "";

      if (res.ok && ctype.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let full = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";
          for (const part of parts) {
            const line = part.split("\n").find((l) => l.startsWith("data:"));
            if (!line) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              if (json.type === "token" && json.content) {
                full += json.content;
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last?.role === "assistant") {
                    copy[copy.length - 1] = { ...last, content: full };
                  }
                  return copy;
                });
              }
              if (json.type === "meta" && json.citations) {
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last?.role === "assistant") {
                    copy[copy.length - 1] = { ...last, citations: json.citations };
                  }
                  return copy;
                });
              }
              if (json.type === "done" && json.content) {
                full = json.content;
                setMessages((prev) => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last?.role === "assistant") {
                    copy[copy.length - 1] = { ...last, content: full };
                  }
                  return copy;
                });
              }
            } catch {
              /* ignore partial */
            }
          }
        }

        if (!full.trim()) {
          throw new Error("empty stream");
        }
        if (!leadOk && PRICE_RE.test(text + full) && localStorage.getItem("lit_ai_lead_done") !== "1") {
          setShowLead(true);
        }
        return;
      }

      // JSON fallback: /api/chat (tools + memory)
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.filter((m) => m.content),
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await chatRes.json().catch(() => ({}));
      const reply =
        data.reply ||
        data.generated_text ||
        data.message ||
        "Sorry — please try again or WhatsApp us.";

      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant") {
          copy[copy.length - 1] = { ...last, content: String(reply) };
        }
        return copy;
      });
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant") {
          copy[copy.length - 1] = {
            role: "assistant",
            content:
              "Connection issue. Please try again, or reach us on WhatsApp.",
          };
        }
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 transition-all duration-300 hover:scale-105 mb-safe ${
          open
            ? "w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-primary text-black shadow-xl shadow-primary/30 flex items-center justify-center"
            : "h-11 sm:h-14 pl-1.5 pr-2.5 sm:pl-2 sm:pr-4 rounded-full bg-[#0A0F1E]/95 border border-primary/40 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,191,255,0.25)] hover:border-primary flex items-center gap-2 sm:gap-3 text-white group"
        }`}
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white p-0 flex items-center justify-center shrink-0 shadow-md overflow-hidden border border-white/20">
              <img
                src={COMPANY.logoIconPath}
                alt="Logic Intelligence Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="hidden sm:flex items-center justify-center pr-1 select-none">
              <span className="text-[9px] sm:text-[10px] text-zinc-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                AI Chat
              </span>
            </div>
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[min(92vw,360px)] h-[min(70dvh,560px)] sm:max-h-[600px] rounded-2xl border border-white/10 bg-[#060B18]/95 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden pb-safe"
          >
            <div className="relative px-4 py-3 bg-gradient-to-r from-[#0A0F1E] to-[#12172B] border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden border border-white/30">
                <img
                  src="/assets/image.png"
                  alt="Logic Intelligence Technologies"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  LOGIC AI Support
                </p>
                <p className="text-[10px] text-zinc-500">Streaming · grounded answers</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-zinc-400"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 overscroll-contain"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-primary text-black rounded-br-sm whitespace-pre-wrap"
                        : "bg-white/5 text-zinc-200 border border-white/5 rounded-bl-sm"
                    }`}
                  >
                    {!m.content && loading && i === messages.length - 1 ? (
                      <span className="inline-flex items-center gap-1.5 text-zinc-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        Thinking…
                      </span>
                    ) : m.role === "assistant" && m.content ? (
                      <>
                        <MarkdownMessage content={m.content} />
                        {m.citations && m.citations.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {m.citations.map((c) => (
                              <span key={c} className="text-[10px] rounded-full border border-white/10 px-2 py-0.5 text-zinc-400">From {c}</span>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#0A0F1E] border-t border-white/5">
              {showLead && !leadOk && (
                <form
                  className="mb-2 flex gap-1"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch("/api/ai/lead", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: leadName, email: leadEmail, source: "chat_widget", interest: "Widget pricing chat" }),
                    });
                    const data = await res.json();
                    if (data.ok) { setLeadOk(true); setShowLead(false); localStorage.setItem("lit_ai_lead_done", "1"); }
                  }}
                >
                  <input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Name" className="flex-1 bg-white/5 rounded-lg px-2 py-1 text-xs outline-none" />
                  <input value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="Email" className="flex-1 bg-white/5 rounded-lg px-2 py-1 text-xs outline-none" />
                  <button type="submit" className="text-[10px] font-bold uppercase px-2 rounded-lg bg-primary text-black">Send</button>
                </form>
              )}
              <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl p-1.5 focus-within:border-primary/50 transition-colors">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question…"
                  rows={1}
                  className="flex-1 max-h-[100px] min-h-[40px] resize-none bg-transparent px-3 py-2.5 text-[16px] sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="w-11 h-11 shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent text-black flex items-center justify-center disabled:opacity-70 hover:scale-105 transition-transform"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
              <div className="mt-2 text-center">
                <a
                  href={waTranscript(messages)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#25D366] hover:underline"
                >
                  <MessageCircle className="w-3 h-3" />
                  Prefer WhatsApp?
                </a>
                <button
                  type="button"
                  className="ml-3 text-[10px] font-semibold text-zinc-400 hover:text-white"
                  onClick={async () => {
                    if (!leadEmail.includes("@")) { setShowLead(true); return; }
                    await fetch("/api/ai/ticket", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: leadName || "Visitor", email: leadEmail, summary: messages.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n") }),
                    });
                  }}
                >
                  Talk to a human
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
