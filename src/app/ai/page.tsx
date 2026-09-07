"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUp, Check, Copy, Loader2, Menu, MessageSquarePlus, Mic, Paperclip, Pencil, RefreshCw, Sparkles, Trash2, WifiOff, X } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MarkdownMessage } from "@/components/ai/markdown-message";

type Role = "user" | "assistant";
type ChatMessage = { id: string; role: Role; content: string; createdAt: number; provider?: string; error?: boolean };
type ChatSession = { id: string; title: string; messages: ChatMessage[]; updatedAt: number };

const STORAGE_KEY = "lit_ai_sessions_v3";
const STARTERS = [
  "What packages do you offer and starting prices?",
  "How does a production RAG pipeline work?",
  "I need a hotel website with booking — what do you recommend?",
  "Compare Next.js and plain React for a business site",
];
const glow = "radial-gradient(ellipse 70% 45% at 50% 115%, rgba(255,110,40,0.55), transparent 60%), radial-gradient(ellipse 40% 30% at 20% 100%, rgba(180,40,10,0.25), transparent), #0a0604";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function AiChatPage() {
  const [landed, setLanded] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [online, setOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastProvider, setLastProvider] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(parsed)) {
        setSessions(parsed);
        if (parsed[0]) setActiveId(parsed[0].id);
      }
    } catch { /* ignore */ }
    supabase.auth.getUser().then(({ data }) => undefined);
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
    if (!landed) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeId, sending, landed]);

  const active = useMemo(() => sessions.find((s) => s.id === activeId) || null, [sessions, activeId]);

  const newChat = useCallback(() => {
    const id = uid();
    setSessions((prev) => [{ id, title: "New chat", messages: [], updatedAt: Date.now() }, ...prev]);
    setActiveId(id);
    setSidebarOpen(false);
  }, []);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    if (!navigator.onLine) { setOnline(false); return; }
    let sessionId = activeId;
    if (!sessionId) {
      sessionId = uid();
      setSessions((prev) => [{ id: sessionId!, title: content.slice(0, 48), messages: [], updatedAt: Date.now() }, ...prev]);
      setActiveId(sessionId);
    }
    const assistantId = uid();
    setInput("");
    setSending(true);
    setLanded(false);
    setSessions((prev) => prev.map((s) => s.id === sessionId ? {
      ...s,
      title: s.messages.length === 0 ? content.slice(0, 48) : s.title,
      messages: [...s.messages, { id: uid(), role: "user", content, createdAt: Date.now() }, { id: assistantId, role: "assistant", content: "", createdAt: Date.now() }],
      updatedAt: Date.now(),
    } : s));
    const history = sessions.find((s) => s.id === sessionId)?.messages.map((m) => ({ role: m.role, content: m.content })) || [];
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
        body: JSON.stringify({ message: content, text: content, history: [...history, { role: "user", content }], stream: true, max_tokens: 900 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ctype = res.headers.get("content-type") || "";
      if (ctype.includes("text/event-stream") && res.body) {
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
                setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, messages: s.messages.map((m) => m.id === assistantId ? { ...m, content: full } : m) } : s));
              }
              if (json.type === "done") {
                full = json.content || full;
                setLastProvider(json.provider || null);
                setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, messages: s.messages.map((m) => m.id === assistantId ? { ...m, content: full, provider: json.provider } : m) } : s));
              }
            } catch { /* ignore */ }
          }
        }
        if (!full.trim()) throw new Error("Empty stream");
      } else {
        const data = await res.json();
        const reply = data.generated_text || data.reply || data.message || "";
        if (!reply) throw new Error("Empty response");
        setLastProvider(data.provider || null);
        setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, messages: s.messages.map((m) => m.id === assistantId ? { ...m, content: reply, provider: data.provider } : m) } : s));
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, messages: s.messages.map((m) => m.id === assistantId ? { ...m, error: true, content: "Could not reach the AI service. Retry." } : m) } : s));
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send();
  }

  if (landed) {
    return (
      <div className="min-h-[100dvh] text-[#F3EDE4] relative overflow-hidden" style={{ background: glow }}>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] bg-gradient-to-t from-orange-600/40 via-orange-500/10 to-transparent blur-2xl" />
        <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-5">
          <Link href="/" className="text-[13px] font-medium">Logic Intelligence Technologies</Link>
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1.5 backdrop-blur-md">
            {[["Home", "/"], ["About us", "/about"], ["Package", "/packages"], ["Blog", "/blog"]].map(([label, href]) => (
              <Link key={href} href={href} className="px-3 py-1.5 text-sm text-[#E8DFD4]/80 hover:text-white">{label}</Link>
            ))}
          </nav>
          <Link href="/contact" className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm">Contact Us</Link>
        </header>
        <main className="relative z-10 flex flex-col items-center text-center px-6 pt-16 sm:pt-24 pb-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs mb-8"><Sparkles className="w-3.5 h-3.5 text-orange-300" /> Logic AI</p>
          <h1 className="max-w-5xl font-serif text-[2.4rem] sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-[#F6EFE6]">The fastest way<br /> to Build and Grow<br /> your Website.</h1>
          <p className="mt-6 max-w-xl text-sm sm:text-base text-[#C9BDB0] leading-relaxed">Logic Intelligence Technologies helps businesses build stunning websites and scale their online presence with AI-powered tools for design, automation, and growth.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => setLanded(false)} className="inline-flex items-center gap-2 rounded-full bg-[#E8651C] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(232,101,28,0.35)] hover:brightness-110">Get Started <ArrowRight className="w-4 h-4" /></button>
            <Link href="/ai-assistant" className="rounded-full border border-white/15 bg-black/25 px-6 py-3 text-sm">Learn More</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] text-[#F3EDE4] flex flex-col" style={{ background: glow }}>
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button type="button" className="lg:hidden p-2 rounded-lg border border-white/10" onClick={() => setSidebarOpen(true)} aria-label="Open chats"><Menu className="w-4 h-4" /></button>
            <button type="button" onClick={() => setLanded(true)} className="text-left">
              <h1 className="text-sm font-bold">LOGIC AI</h1>
              <p className="text-[11px] text-zinc-500">{lastProvider ? `via ${lastProvider}` : "streaming"}</p>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xs text-zinc-400">Home</Link>
            <button type="button" onClick={newChat} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border border-white/10"><MessageSquarePlus className="w-3.5 h-3.5" /> New</button>
          </div>
        </div>
        {!online && <div className="bg-amber-500/15 text-amber-200 text-xs px-4 py-2 flex items-center justify-center gap-2"><WifiOff className="w-3.5 h-3.5" /> Offline</div>}
      </header>
      <div className="flex-1 max-w-6xl w-full mx-auto grid lg:grid-cols-[240px_1fr] min-h-0">
        <aside className="hidden lg:flex flex-col border-r border-white/5 py-4 px-2 max-h-[calc(100dvh-4rem)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2 mb-2">History</p>
          <div className="flex-1 overflow-y-auto space-y-1">
            {sessions.map((s) => (
              <div key={s.id} className={`flex items-center gap-1 rounded-lg px-2 py-2 text-xs cursor-pointer ${s.id === activeId ? "bg-orange-500/15 border border-orange-400/25" : "text-zinc-400 hover:bg-white/5"}`} onClick={() => setActiveId(s.id)}>
                <span className="flex-1 truncate">{s.title}</span>
                <button type="button" className="p-1 text-red-400" onClick={(e) => { e.stopPropagation(); setSessions((p) => p.filter((x) => x.id !== s.id)); if (activeId === s.id) setActiveId(null); }}><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </aside>
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.button type="button" className="fixed inset-0 z-40 bg-black/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
              <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-[min(86vw,300px)] bg-[#120a08] p-4 lg:hidden" initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}>
                <div className="flex justify-between mb-4"><span className="text-sm font-bold">History</span><button type="button" onClick={() => setSidebarOpen(false)}><X className="w-4 h-4" /></button></div>
                {sessions.map((s) => (
                  <button key={s.id} type="button" className="block w-full text-left text-xs py-2 truncate" onClick={() => { setActiveId(s.id); setSidebarOpen(false); }}>{s.title}</button>
                ))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        <section className="flex flex-col min-h-0 max-h-[calc(100dvh-4rem)]">
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5">
            {(!active || active.messages.length === 0) && (
              <div className="max-w-2xl mx-auto text-center pt-10">
                <p className="text-lg font-semibold mb-4">Ask anything about LIT or your stack.</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {STARTERS.map((q) => (
                    <button key={q} type="button" onClick={() => void send(q)} className="text-left text-sm rounded-xl border border-white/10 bg-black/20 px-4 py-3 hover:border-orange-400/40">{q}</button>
                  ))}
                </div>
              </div>
            )}
            {active?.messages.map((m) => (
              <div key={m.id} className={`max-w-3xl mx-auto flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0"><Sparkles className="w-3.5 h-3.5 text-orange-300" /></div>}
                <div className={`rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-[#E8651C] text-white max-w-[80%]" : "bg-black/30 border border-white/10 flex-1"}`}>
                  {m.role === "assistant" ? (m.content ? <MarkdownMessage content={m.content} /> : sending && <Loader2 className="w-4 h-4 animate-spin" />) : m.content}
                  {m.error && <button type="button" className="mt-2 text-xs inline-flex items-center gap-1" onClick={() => void send(active.messages.find((x) => x.role === "user")?.content)}><RefreshCw className="w-3 h-3" /> Retry</button>}
                  {m.role === "assistant" && m.content && <button type="button" className="mt-2 text-[11px] text-zinc-500 inline-flex items-center gap-1" onClick={async () => { await navigator.clipboard.writeText(m.content); setCopiedId(m.id); }}>{copiedId === m.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy</button>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={onSubmit} className="px-4 sm:px-8 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
            <div className="max-w-3xl mx-auto flex items-end gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
              <input ref={fileRef} type="file" className="hidden" />
              <button type="button" className="p-2 text-zinc-400" onClick={() => fileRef.current?.click()} aria-label="Attach"><Paperclip className="w-4 h-4" /></button>
              <button type="button" className="p-2 text-zinc-400" aria-label="Voice"><Mic className="w-4 h-4" /></button>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} rows={1} placeholder="Enter prompt here…" className="flex-1 bg-transparent resize-none text-sm py-2 outline-none max-h-32" />
              <button type="submit" disabled={sending || !input.trim()} className="p-2 rounded-full bg-[#E8651C] text-white disabled:opacity-40" aria-label="Send">{sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
