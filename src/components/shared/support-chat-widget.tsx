"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Send,
  RotateCcw,
  Sparkles,
  Zap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Headphones,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COMPANY } from "@/config/company";
import { MarkdownMessage } from "@/components/ai/markdown-message";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  citations?: string[];
};

const STARTER_PROMPTS = [
  {
    label: "🏥 LIT Healthcare Clinical OS",
    prompt: "Tell me about LIT Healthcare and how the clinical telemetry platform works.",
    icon: Building2,
  },
  {
    label: "🎙️ Logic Voice & Telephony Architecture",
    prompt: "Explain Logic Voice latency and how Voice Shield defends against synthetic voice fraud.",
    icon: ShieldCheck,
  },
  {
    label: "💼 Architecture Packages & Pricing",
    prompt: "What packages and engineering tiers are available for new software systems?",
    icon: Zap,
  },
  {
    label: "🚀 Request Free Architecture Demo",
    prompt: "How can I request a working architecture prototype demo before making any commitment?",
    icon: Sparkles,
  },
];

const INITIAL_GREETING: ChatMessage = {
  role: "assistant",
  content: `Hello! I am **LOGIC AI**, the intelligence assistant for **${COMPANY.displayName}**.\n\nI can assist you with our clinical hospital operating systems (**LIT Healthcare**), autonomous conversational voice agents (**Logic Voice**), biometric deepfake audio firewalls (**Voice Shield**), engineering packages, or scheduling an architecture review. What are you building?`,
  timestamp: "Just now",
};

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [handoffName, setHandoffName] = useState("");
  const [handoffContact, setHandoffContact] = useState("");
  const [handoffNotes, setHandoffNotes] = useState("");
  const [handoffSubmitted, setHandoffSubmitted] = useState(false);
  const [handoffSubmitting, setHandoffSubmitting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, open, scrollToBottom]);

  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [open]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([{ ...INITIAL_GREETING, timestamp: formatTime() }]);
    setInput("");
  };

  async function handleSend(textToSend?: string) {
    const messageText = (textToSend ?? input).trim();
    if (!messageText || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: messageText,
      timestamp: formatTime(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = newMessages
        .filter((m) => m !== INITIAL_GREETING && m.content)
        .slice(-12)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          stream: false,
        }),
        signal: AbortSignal.timeout(20000),
      });

      const data = await res.json().catch(() => ({}));

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            timestamp: formatTime(),
          },
        ]);
      } else if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Notice: ${data.error}. You can also connect directly with our engineering desk at **${COMPANY.email}**.`,
            timestamp: formatTime(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Thank you for reaching out. Please connect directly with our systems engineering team at **${COMPANY.email}** or schedule an architecture consultation at **${COMPANY.websiteUrl}/book-consultation**.`,
            timestamp: formatTime(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `We experienced a brief network timeout. Please connect with our team directly at **${COMPANY.email}** or try asking again.`,
          timestamp: formatTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <motion.button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close LOGIC AI Assistant" : "Open LOGIC AI Assistant"}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 transition-all duration-300 shadow-2xl ${
          open
            ? "w-12 h-12 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center border border-cyan-300 shadow-cyan-500/40"
            : "h-13 px-4 rounded-full bg-gradient-to-r from-[#071328]/95 via-[#0B1C3D]/95 to-[#08152E]/95 border border-cyan-500/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(14,165,233,0.35)] hover:border-cyan-400 flex items-center gap-3 text-white group"
        }`}
      >
        {open ? (
          <X className="w-5 h-5 transition-transform" />
        ) : (
          <>
            <div className="relative w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-teal-400 to-blue-500 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#081328] rounded-full overflow-hidden p-0.5 flex items-center justify-center">
                <Image
                  src={COMPANY.logoIconPath}
                  alt="Logic Intelligence Technologies Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#081328] animate-pulse" />
            </div>
            <div className="flex flex-col text-left select-none pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-wide text-white group-hover:text-cyan-300 transition-colors font-mono">
                  LOGIC AI
                </span>
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <span className="text-[10px] text-zinc-400">Engineering &amp; Systems Intelligence</span>
            </div>
          </>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-7 z-50 w-[min(94vw,430px)] h-[min(78dvh,640px)] rounded-3xl border border-cyan-500/25 bg-[#070F1E]/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_35px_rgba(14,165,233,0.18)] flex flex-col overflow-hidden font-sans"
          >
            {/* Professional Executive Header */}
            <div className="relative px-4 py-3.5 bg-gradient-to-r from-[#08162E] via-[#0B1F42] to-[#0A1835] border-b border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-blue-500 p-0.5 shrink-0 shadow-md">
                  <div className="w-full h-full bg-[#070F1E] rounded-[10px] overflow-hidden flex items-center justify-center p-1">
                    <Image
                      src={COMPANY.logoIconPath}
                      alt="Logic Intelligence Logo"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070F1E]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white tracking-tight font-mono">LOGIC AI</p>
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Autonomous Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">
                    Logic Intelligence Technologies · Systems Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Feed */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain scroll-smooth"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-end gap-2 max-w-[90%]">
                    {m.role === "assistant" && (
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                    )}
                    <div
                      className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                        m.role === "user"
                          ? "bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-300 text-slate-950 font-medium rounded-br-sm shadow-cyan-500/20"
                          : "bg-[#0B1A36]/90 border border-cyan-500/20 text-zinc-100 rounded-bl-sm backdrop-blur-md"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <>
                          <MarkdownMessage content={m.content} />
                          {m.citations && m.citations.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                              {m.citations.map((c) => (
                                <span
                                  key={c}
                                  className="text-[10px] rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 font-mono"
                                >
                                  Verified: {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                    </div>
                  </div>

                  {/* Message Meta: Timestamp & Copy */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-zinc-500">
                    <span>{m.timestamp}</span>
                    {m.role === "assistant" && (
                      <>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(m.content, idx)}
                          className="hover:text-zinc-300 flex items-center gap-1 transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking / Loading indicator */}
              {loading && (
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  </div>
                  <div className="bg-[#0B1A36]/90 border border-cyan-500/20 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-xs text-cyan-300">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                    </div>
                    <span>LOGIC AI is processing…</span>
                  </div>
                </div>
              )}

              {/* Starter Suggestion Chips (show on initial message) */}
              {messages.length === 1 && !loading && (
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    Recommended queries
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {STARTER_PROMPTS.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(item.prompt)}
                          className="w-full text-left p-2.5 rounded-xl bg-[#0C1B38] border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-[#0E2248] text-zinc-200 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium truncate">{item.label}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-300 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Engineering Handoff Callback Modal */}
            <AnimatePresence>
              {showHandoffModal && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="mx-3 mb-2 p-3.5 rounded-2xl bg-[#091733] border border-cyan-500/30 shadow-lg text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                      Request Engineering Callback
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHandoffModal(false)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {handoffSubmitted ? (
                    <div className="p-2.5 text-emerald-300 flex items-center gap-2 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>Request recorded! Our systems engineering team will review and connect with you within 2 business hours.</span>
                    </div>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!handoffContact.trim() || handoffSubmitting) return;
                        setHandoffSubmitting(true);
                        try {
                          await fetch("/api/ai/lead", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              name: handoffName || "Chat Visitor",
                              email: handoffContact.includes("@") ? handoffContact : undefined,
                              phone: !handoffContact.includes("@") ? handoffContact : undefined,
                              source: "chat_widget_handoff",
                              interest: handoffNotes || "Request engineering contact from chat widget",
                              notes: messages.slice(-4).map((m) => `${m.role}: ${m.content}`).join("\n"),
                            }),
                          });
                          setHandoffSubmitted(true);
                          setTimeout(() => {
                            setShowHandoffModal(false);
                            setHandoffSubmitted(false);
                            setHandoffName("");
                            setHandoffContact("");
                            setHandoffNotes("");
                          }, 3500);
                        } catch {
                          setHandoffSubmitted(true);
                        } finally {
                          setHandoffSubmitting(false);
                        }
                      }}
                      className="space-y-2"
                    >
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        value={handoffName}
                        onChange={(e) => setHandoffName(e.target.value)}
                        className="w-full bg-[#050C1B] border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Work Email or Phone Number"
                        required
                        value={handoffContact}
                        onChange={(e) => setHandoffContact(e.target.value)}
                        className="w-full bg-[#050C1B] border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Brief requirement (e.g. Hospital OS, Voice Agent)"
                        value={handoffNotes}
                        onChange={(e) => setHandoffNotes(e.target.value)}
                        className="w-full bg-[#050C1B] border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 text-xs"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={handoffSubmitting}
                          className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 font-bold hover:brightness-105 active:scale-[0.99] transition-all text-xs font-mono uppercase tracking-wider disabled:opacity-50"
                        >
                          {handoffSubmitting ? "Submitting..." : "Submit Callback Request"}
                        </button>
                      </div>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input & Professional Footer Controls */}
            <div className="p-3 bg-gradient-to-t from-[#050C1A] to-[#08152E] border-t border-cyan-500/20">
              <div className="relative flex items-end gap-2 bg-[#061022] border border-cyan-500/25 rounded-2xl p-1.5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask LOGIC AI about platforms, architecture, pricing..."
                  rows={1}
                  className="flex-1 max-h-[90px] min-h-[38px] resize-none bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-cyan-400 to-teal-300 text-slate-950 flex items-center justify-center disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 active:scale-95 transition-all shadow-md shadow-cyan-500/20"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>

              {/* Professional Corporate Utility Strip */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 px-1 font-mono">
                <button
                  type="button"
                  onClick={() => setShowHandoffModal((prev) => !prev)}
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-cyan-300 font-semibold"
                >
                  <Headphones className="w-3 h-3 text-cyan-400" />
                  <span>Talk to Engineering</span>
                </button>

                <div className="flex items-center gap-3">
                  <Link
                    href="/book-consultation"
                    onClick={() => setOpen(false)}
                    className="hover:text-white transition-colors text-zinc-300 flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    <span>Consultation</span>
                  </Link>
                  <span className="text-zinc-600">·</span>
                  <Link
                    href="/free-demo"
                    onClick={() => setOpen(false)}
                    className="hover:text-cyan-300 transition-colors text-zinc-300 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Free Demo</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
