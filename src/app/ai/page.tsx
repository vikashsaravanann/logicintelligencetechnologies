"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  Bot,
  Check,
  Copy,
  Loader2,
  Menu,
  MessageSquarePlus,
  Pencil,
  RefreshCw,
  Sparkles,
  Trash2,
  User,
  WifiOff,
  X,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import { MarkdownMessage } from "@/components/ai/markdown-message";

type Role = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  provider?: string;
  model?: string;
  error?: boolean;
};

type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const STORAGE_KEY = "lit_ai_sessions_v3";
const WA = `https://wa.me/${COMPANY.phone.replace(/\D/g, "")}`;

const STARTERS = [
  "What packages do you offer and starting prices?",
  "How does a production RAG pipeline work?",
  "I need a hotel website with booking — what do you recommend?",
  "Compare Next.js and plain React for a business site",
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

function suggestFollowUps(reply: string): string[] {
  const r = reply.toLowerCase();
  const out: string[] = [];
  if (/price|₹|pack|cost|quote/i.test(r)) {
    out.push("What is included in the Digital Launch Pack?");
    out.push("Can I get a free demo before paying?");
  } else if (/demo|scope/i.test(r)) {
    out.push("How long does a typical demo take?");
    out.push("What info do you need to start?");
  } else {
    out.push("Tell me about your AI services");
    out.push("Show me relevant portfolio work");
  }
  out.push("I want to talk to a human on WhatsApp");
  return out.slice(0, 3);
}

function pricingIntent(text: string) {
  return /price|cost|package|₹|quote|budget|how much/i.test(text);
}

export default function AiChatPage() {
  const reduceMotion = useReducedMotion();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [lastProvider, setLastProvider] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const s = loadSessions();
    setSessions(s);
    if (s[0]) setActiveId(s[0].id);
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [supabase.auth]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 24)));
  }, [sessions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [sessions, activeId, sending, reduceMotion]);

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) || null,
    [sessions, activeId]
  );

  const newChat = useCallback(() => {
    const id = uid();
    setSessions((prev) => [
      { id, title: "New chat", messages: [], updatedAt: Date.now() },
      ...prev,
    ]);
    setActiveId(id);
    setSidebarOpen(false);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  const commitRename = (id: string) => {
    const title = renameValue.trim().slice(0, 60);
    if (title) {
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title } : s))
      );
    }
    setRenamingId(null);
  };

  async function copyText(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* ignore */
    }
  }

  async function send(text?: string, retryOf?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    if (!navigator.onLine) {
      setOnline(false);
      return;
    }

    let sessionId = activeId;
    if (!sessionId) {
      sessionId = uid();
      setSessions((prev) => [
        {
          id: sessionId!,
          title: content.slice(0, 48),
          messages: [],
          updatedAt: Date.now(),
        },
        ...prev,
      ]);
      setActiveId(sessionId);
    }

    const userMsg: ChatMessage = {
      id: retryOf ? `${retryOf}-u` : uid(),
      role: "user",
      content,
      createdAt: Date.now(),
    };
    const assistantId = uid();

    setInput("");
    setSending(true);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              title:
                s.messages.length === 0 ? content.slice(0, 48) : s.title,
              messages: [
                ...s.messages,
                userMsg,
                {
                  id: assistantId,
                  role: "assistant" as const,
                  content: "",
                  createdAt: Date.now(),
                },
              ],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    const history =
      sessions
        .find((s) => s.id === sessionId)
        ?.messages.map((m) => ({ role: m.role, content: m.content })) || [];

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({
          message: content,
          text: content,
          history: [...history, { role: "user", content }],
          stream: true,
          max_tokens: 900,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const ctype = res.headers.get("content-type") || "";
      if (ctype.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let full = "";
        let provider = "";
        let model = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";
          for (const part of parts) {
            const line = part
              .split("\n")
              .find((l) => l.startsWith("data:"));
            if (!line) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              if (json.type === "token" && json.content) {
                full += json.content;
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === sessionId
                      ? {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantId
                              ? { ...m, content: full }
                              : m
                          ),
                        }
                      : s
                  )
                );
              }
              if (json.type === "done") {
                full = json.content || full;
                provider = json.provider || provider;
                model = json.model || model;
                setLastProvider(provider || null);
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === sessionId
                      ? {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantId
                              ? {
                                  ...m,
                                  content: full,
                                  provider,
                                  model,
                                }
                              : m
                          ),
                        }
                      : s
                  )
                );
              }
            } catch {
              /* ignore */
            }
          }
        }
        if (!full.trim()) throw new Error("Empty stream");
      } else {
        const data = await res.json();
        const reply =
          data.generated_text || data.reply || data.message || "";
        if (!reply) throw new Error("Empty response");
        setLastProvider(data.provider || null);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: reply,
                          provider: data.provider,
                          model: data.model,
                        }
                      : m
                  ),
                }
              : s
          )
        );
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        error: true,
                        content:
                          "Could not reach the AI service. Check your connection and try again.",
                      }
                    : m
                ),
              }
            : s
        )
      );
    } finally {
      setSending(false);
    }
  }

  const lastAssistant = [...(active?.messages || [])]
    .reverse()
    .find((m) => m.role === "assistant" && m.content && !m.error);

  return (
    <div className="min-h-[100dvh] bg-[#0A0F1E] text-white flex flex-col relative overflow-hidden">
      {/* Ambient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,191,255,0.18), transparent), radial-gradient(circle at 80% 60%, rgba(99,102,241,0.08), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <BackToHome />

      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0A0F1E]/90 backdrop-blur-xl pt-[max(4.5rem,env(safe-area-inset-top))] sm:pt-24">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg border border-white/10 hover:bg-white/5"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open chats"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
                LOGIC AI
              </h1>
              <p className="text-[11px] text-zinc-500 truncate">
                {lastProvider
                  ? `via ${lastProvider}`
                  : `${COMPANY.displayName} · streaming`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={newChat}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-white/10 hover:border-primary/40 hover:bg-white/5 transition-colors active:scale-95"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
        {!online && (
          <div className="bg-amber-500/15 border-t border-amber-500/30 text-amber-200 text-xs px-4 py-2 flex items-center gap-2 justify-center">
            <WifiOff className="w-3.5 h-3.5" /> You are offline. Reconnect to
            continue.
          </div>
        )}
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-0 sm:px-6 grid lg:grid-cols-[260px_1fr] gap-0 lg:gap-6 min-h-0 relative z-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col border-r border-white/5 py-4 pr-2 max-h-[calc(100dvh-8rem)] sticky top-28">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2 mb-2">
            Chats
          </p>
          <div className="flex-1 overflow-y-auto space-y-1 overscroll-contain">
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
                {renamingId === s.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => commitRename(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(s.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="flex-1 bg-black/40 border border-white/10 rounded px-1 py-0.5 text-xs text-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 truncate">{s.title}</span>
                )}
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingId(s.id);
                    setRenameValue(s.title);
                  }}
                  aria-label="Rename"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(s.id);
                  }}
                  aria-label="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          {userEmail && (
            <p className="text-[10px] text-zinc-600 px-2 mt-3 truncate">
              {userEmail}
            </p>
          )}
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.button
                type="button"
                className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              />
              <motion.aside
                className="fixed left-0 top-0 bottom-0 z-50 w-[min(86vw,300px)] bg-[#0c1224] border-r border-white/10 p-4 flex flex-col lg:hidden"
                initial={reduceMotion ? false : { x: -320 }}
                animate={{ x: 0 }}
                exit={reduceMotion ? undefined : { x: -320 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold">Chats</span>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={newChat}
                  className="mb-3 w-full py-2 rounded-lg border border-white/10 text-xs font-semibold hover:bg-white/5"
                >
                  New chat
                </button>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate ${
                        s.id === activeId
                          ? "bg-primary/15 border border-primary/25"
                          : "hover:bg-white/5 text-zinc-400"
                      }`}
                      onClick={() => {
                        setActiveId(s.id);
                        setSidebarOpen(false);
                      }}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main */}
        <main className="flex flex-col min-h-[calc(100dvh-7rem)] lg:min-h-[calc(100dvh-8rem)]">
          <div className="flex-1 overflow-y-auto px-3 sm:px-0 py-6 space-y-4 overscroll-contain">
            {!active?.messages.length && !sending && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl mx-auto text-center pt-8 sm:pt-14"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-indigo-500/20 border border-white/10 flex items-center justify-center mx-auto mb-5">
                  <Bot className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight">
                  Ask anything
                </h2>
                <p className="text-sm text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                  Streaming answers about packages, builds, and general tech —
                  grounded on {COMPANY.displayName} facts when relevant.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 text-left">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="p-3 rounded-xl border border-white/10 bg-white/[0.03] text-xs text-zinc-300 hover:border-primary/40 hover:bg-primary/5 transition-all text-left active:scale-[0.99]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="max-w-[65ch] mx-auto w-full space-y-4">
              <AnimatePresence initial={false}>
                {active?.messages.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={
                      reduceMotion ? false : { opacity: 0, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.01, 0.08) }}
                    className={`flex gap-2.5 ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`relative max-w-[92%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] sm:text-[15px] leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-black font-medium rounded-br-md"
                          : m.error
                            ? "bg-red-500/10 border border-red-500/30 text-red-100 rounded-bl-md"
                            : "bg-white/[0.06] border border-white/10 text-zinc-100 rounded-bl-md"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        m.content ? (
                          <div className="ai-md">
                            <MarkdownMessage content={m.content} />
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:300ms]" />
                          </span>
                        )
                      ) : (
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      )}

                      {m.role === "assistant" && m.content && !m.error && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
                          {m.provider && (
                            <span className="text-[10px] uppercase tracking-wider text-zinc-500 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                              via {m.provider}
                              {m.model ? ` · ${m.model}` : ""}
                            </span>
                          )}
                          <button
                            type="button"
                            className="text-[11px] text-zinc-400 hover:text-white inline-flex items-center gap-1"
                            onClick={() => copyText(m.id, m.content)}
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            Copy
                          </button>
                          {m.error && (
                            <button
                              type="button"
                              className="text-[11px] text-primary inline-flex items-center gap-1"
                              onClick={() => {
                                const prevUser = active?.messages[
                                  active.messages.findIndex((x) => x.id === m.id) - 1
                                ];
                                if (prevUser?.role === "user")
                                  send(prevUser.content, m.id);
                              }}
                            >
                              <RefreshCw className="w-3 h-3" /> Retry
                            </button>
                          )}
                        </div>
                      )}
                      {m.error && (
                        <button
                          type="button"
                          className="mt-2 text-[11px] text-primary inline-flex items-center gap-1"
                          onClick={() => {
                            const idx =
                              active?.messages.findIndex((x) => x.id === m.id) ??
                              -1;
                            const prevUser =
                              idx > 0 ? active?.messages[idx - 1] : null;
                            if (prevUser?.role === "user")
                              send(prevUser.content, m.id);
                          }}
                        >
                          <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                      )}
                    </div>
                    {m.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-zinc-300" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {lastAssistant && !sending && (
                <div className="flex flex-wrap gap-2 pl-10">
                  {suggestFollowUps(lastAssistant.content).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="text-[11px] px-2.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-primary/40 hover:text-white transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {active?.messages.some(
                (m) => m.role === "user" && pricingIntent(m.content)
              ) && (
                <div className="pl-10">
                  <a
                    href={WA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/25 transition-colors"
                  >
                    Talk to a human on WhatsApp
                  </a>
                </div>
              )}
            </div>
            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <div className="sticky bottom-0 border-t border-white/5 bg-[#0A0F1E]/95 backdrop-blur-xl px-3 sm:px-0 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 max-w-3xl mx-auto"
            >
              <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/30 transition-all">
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
                  className="w-full bg-transparent px-4 py-3 text-[16px] sm:text-sm text-white placeholder:text-zinc-500 resize-none focus:outline-none max-h-32"
                />
              </div>
              <button
                type="submit"
                disabled={sending || !input.trim() || !online}
                className="w-11 h-11 rounded-xl bg-primary text-black flex items-center justify-center shrink-0 disabled:opacity-40 hover:brightness-110 transition-all active:scale-95"
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
              AI can make mistakes. Verify pricing on{" "}
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
