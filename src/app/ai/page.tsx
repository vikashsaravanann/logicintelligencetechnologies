"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  Bot,
  Loader2,
  MessageSquarePlus,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";

type Role = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const STORAGE_KEY = "lit_ai_sessions_v2";

const STARTERS = [
  "What packages do you offer and starting prices?",
  "Compare Netflix and Amazon Prime Video for a family in India",
  "How does a production RAG system work?",
  "I need a hotel website with booking — what do you recommend?",
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AiChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const s = loadSessions();
    setSessions(s);
    if (s[0]) setActiveId(s[0].id);
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, [supabase.auth]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 20)));
  }, [sessions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeId, sending]);

  const active = sessions.find((s) => s.id === activeId) || null;

  const newChat = useCallback(() => {
    const id = uid();
    const session: ChatSession = {
      id,
      title: "New chat",
      messages: [],
      updatedAt: Date.now(),
    };
    setSessions((prev) => [session, ...prev]);
    setActiveId(id);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;

    let sessionId = activeId;
    let base = sessions;
    if (!sessionId) {
      const id = uid();
      const session: ChatSession = {
        id,
        title: content.slice(0, 48),
        messages: [],
        updatedAt: Date.now(),
      };
      base = [session, ...sessions];
      sessionId = id;
      setSessions(base);
      setActiveId(id);
    }

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content,
      createdAt: Date.now(),
    };

    setInput("");
    setSending(true);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              title: s.messages.length === 0 ? content.slice(0, 48) : s.title,
              messages: [...s.messages, userMsg],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    try {
      const history =
        base
          .find((s) => s.id === sessionId)
          ?.messages.map((m) => ({ role: m.role, content: m.content })) || [];

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: [...history, { role: "user", content }],
        }),
      });
      const data = await res.json().catch(() => ({}));
      const reply =
        data.generated_text ||
        data.reply ||
        data.message ||
        "Sorry — I could not generate a reply. Please try again.";

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: reply,
        createdAt: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [...s.messages, assistantMsg],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } catch {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  {
                    id: uid(),
                    role: "assistant" as const,
                    content:
                      "Network error. Please check your connection and try again.",
                    createdAt: Date.now(),
                  },
                ],
              }
            : s
        )
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white flex flex-col">
      <BackToHome />

      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0A0F1E]/90 backdrop-blur-xl pt-20 sm:pt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
                LOGIC AI
              </h1>
              <p className="text-[11px] text-zinc-500 truncate">
                Company expert · general knowledge · {COMPANY.displayName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={newChat}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-white/10 hover:border-primary/40 hover:bg-white/5 transition-colors"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-0 sm:px-6 grid lg:grid-cols-[240px_1fr] gap-0 lg:gap-6 min-h-0">
        <aside className="hidden lg:flex flex-col border-r border-white/5 py-4 pr-2 max-h-[calc(100vh-8rem)] sticky top-28">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2 mb-2">
            Recent
          </p>
          <div className="flex-1 overflow-y-auto space-y-1">
            {sessions.length === 0 && (
              <p className="text-xs text-zinc-600 px-2">No chats yet</p>
            )}
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`group flex items-center gap-1 rounded-lg px-2 py-2 text-left text-xs cursor-pointer ${
                  s.id === activeId
                    ? "bg-primary/15 text-white border border-primary/25"
                    : "text-zinc-400 hover:bg-white/5 border border-transparent"
                }`}
                onClick={() => setActiveId(s.id)}
              >
                <span className="flex-1 truncate">{s.title}</span>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(s.id);
                  }}
                  aria-label="Delete chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          {userEmail && (
            <p className="text-[10px] text-zinc-600 px-2 mt-3 truncate">
              Signed in as {userEmail}
            </p>
          )}
        </aside>

        <main className="flex flex-col min-h-[calc(100vh-7rem)] lg:min-h-[calc(100vh-8rem)]">
          <div className="flex-1 overflow-y-auto px-4 sm:px-0 py-6 space-y-4">
            {!active?.messages.length && !sending && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto text-center pt-8 sm:pt-16"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 border border-white/10 flex items-center justify-center mx-auto mb-5">
                  <Bot className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  Ask anything
                </h2>
                <p className="text-sm text-zinc-400 mb-8">
                  Packages, demos, and builds — or general questions answered
                  professionally.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 text-left">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="p-3 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-zinc-300 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {active?.messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-black font-medium rounded-br-md"
                        : "bg-white/[0.06] border border-white/10 text-zinc-100 rounded-bl-md"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-zinc-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {sending && (
              <div className="flex gap-3 items-center text-zinc-500 text-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <span className="animate-pulse">Thinking…</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="sticky bottom-0 border-t border-white/5 bg-[#0A0F1E]/95 backdrop-blur-xl px-4 sm:px-0 py-4 pb-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 max-w-3xl mx-auto"
            >
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] focus-within:border-primary/40 transition-colors">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder="Message LOGIC AI…"
                  className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-zinc-500 resize-none focus:outline-none max-h-32"
                />
              </div>
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="w-11 h-11 rounded-xl bg-primary text-black flex items-center justify-center shrink-0 disabled:opacity-40 hover:brightness-110 transition-all"
                aria-label="Send"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </form>
            <p className="text-center text-[10px] text-zinc-600 mt-2">
              AI can make mistakes. Verify critical pricing with{" "}
              <Link href="/packages" className="text-primary/80 hover:underline">
                packages
              </Link>{" "}
              or WhatsApp.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
