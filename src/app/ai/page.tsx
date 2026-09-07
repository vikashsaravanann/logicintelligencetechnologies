"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUp, Check, Copy, Download, Loader2, Menu, MessageSquarePlus, Mic, Paperclip, Quote, RefreshCw, Sparkles, Square, Trash2, WifiOff, X } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { COMPANY } from "@/config/company";
import { MarkdownMessage } from "@/components/ai/markdown-message";

type Role = "user" | "assistant";
type Mode = "company" | "general";
type ChatMessage = { id: string; role: Role; content: string; createdAt: number; provider?: string; error?: boolean };
type ChatSession = { id: string; title: string; messages: ChatMessage[]; updatedAt: number; remote?: boolean };
type AttachFile = { name: string; type: string; data: string };

const STORAGE_KEY = "lit_ai_sessions_v3";
const STREAM_MS = 45_000;
const MAX_FILE = 2 * 1024 * 1024;
const TICKER_UNIT = "LOGIC INTELLIGENCE TECHNOLOGIES  ·  WHERE LOGIC MEETS INNOVATION  ·  ";
const TICKER = Array.from({ length: 8 }, () => TICKER_UNIT).join("");
const STARTERS = [
  "What packages do you offer and starting prices?",
  "How does a production RAG pipeline work?",
  "I need a hotel website with booking — what do you recommend?",
  "Compare Next.js and plain React for a business site",
];
const DEMO_RE = /\b(demo|quote|book|hire|i want a (web)?site|pricing|free consult|start a project)\b/i;
const glow = "radial-gradient(ellipse 70% 45% at 50% 115%, rgba(255,110,40,0.55), transparent 60%), radial-gradient(ellipse 40% 30% at 20% 100%, rgba(180,40,10,0.25), transparent), #0a0604";
const WA = `https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — chatting on Logic AI.")}`;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}
function initials(email: string | null) {
  return email ? email.slice(0, 1).toUpperCase() : "U";
}
function followUps(reply: string) {
  const r = reply.toLowerCase();
  if (/price|₹|pack|cost/.test(r)) return ["What is in Digital Launch?", "Can I get a free demo?", "Talk on WhatsApp"];
  if (/rag|ai|assistant/.test(r)) return ["How do you stop invented prices?", "How long is a demo?", "Talk on WhatsApp"];
  return ["Show packages and floors", "How does a free demo work?", "Talk on WhatsApp"];
}
function readFile(file: File): Promise<AttachFile> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE) {
      reject(new Error("File must be under 2 MB."));
      return;
    }
    const ok = /^(text\/|application\/pdf|application\/json)/.test(file.type) || /\.(txt|md|pdf|json)$/i.test(file.name);
    if (!ok) {
      reject(new Error("Use .txt, .md, or .pdf."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => resolve({ name: file.name, type: file.type || "text/plain", data: String(reader.result || "") });
    if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) reader.readAsDataURL(file);
    else reader.readAsText(file);
  });
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("company");
  const [listening, setListening] = useState(false);
  const [attach, setAttach] = useState<AttachFile | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      setUserEmail(u?.email ?? null);
      setUserId(u?.id ?? null);
      const meta = u?.user_metadata as { avatar_url?: string; picture?: string } | undefined;
      setUserAvatar(meta?.avatar_url || meta?.picture || null);
      if (u?.id) {
        const { data: chats } = await supabase
          .from("ai_chats")
          .select("id,title,updated_at,ai_messages(id,role,content,created_at)")
          .eq("user_id", u.id)
          .order("updated_at", { ascending: false })
          .limit(24);
        if (chats && chats.length) {
          const mapped: ChatSession[] = chats.map((c: any) => ({
            id: c.id,
            title: c.title,
            remote: true,
            updatedAt: new Date(c.updated_at).getTime(),
            messages: (c.ai_messages || [])
              .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((m: any) => ({ id: m.id, role: m.role, content: m.content, createdAt: new Date(m.created_at).getTime() })),
          }));
          setSessions(mapped);
          setActiveId(mapped[0].id);
          return;
        }
      }
      try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (Array.isArray(parsed) && parsed.length) {
          setSessions(parsed);
          if (parsed[0]) setActiveId(parsed[0].id);
        }
      } catch { /* ignore */ }
    });
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      abortRef.current?.abort();
      recRef.current?.stop();
    };
  }, [supabase]);

  useEffect(() => {
    if (!userId) localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 24)));
  }, [sessions, userId]);

  useEffect(() => {
    if (!landed) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeId, sending, landed]);

  const active = useMemo(() => sessions.find((s) => s.id === activeId) || null, [sessions, activeId]);
  const lastAssistant = [...(active?.messages || [])].reverse().find((m) => m.role === "assistant" && m.content && !m.error);
  const lastUser = [...(active?.messages || [])].reverse().find((m) => m.role === "user");

  async function persistTurn(session: ChatSession, userContent: string, assistantContent: string) {
    if (!userId || !isUuid(session.id)) return;
    await supabase.from("ai_chats").upsert({
      id: session.id,
      user_id: userId,
      title: session.title,
      updated_at: new Date().toISOString(),
    });
    await supabase.from("ai_messages").insert([
      { chat_id: session.id, role: "user", content: userContent.slice(0, 8000) },
      { chat_id: session.id, role: "assistant", content: assistantContent.slice(0, 16000) },
    ]);
  }

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    const id = userId ? crypto.randomUUID() : uid();
    setSessions((prev) => [{ id, title: "New chat", messages: [], updatedAt: Date.now(), remote: Boolean(userId) }, ...prev]);
    setActiveId(id);
    setSidebarOpen(false);
    setSending(false);
    setShowDemo(false);
    setAttach(null);
  }, [userId]);

  async function deleteChat(id: string) {
    setSessions((p) => p.filter((x) => x.id !== id));
    if (activeId === id) setActiveId(null);
    if (userId && isUuid(id)) await supabase.from("ai_chats").delete().eq("id", id);
  }

  function patchAssistant(sessionId: string, assistantId: string, patch: Partial<ChatMessage>) {
    setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, messages: s.messages.map((m) => m.id === assistantId ? { ...m, ...patch } : m) } : s));
  }

  function toggleMic() {
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) {
      setAttachError("Voice works in Chrome or Edge.");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setInput(t);
      if (e.results[e.results.length - 1].isFinal) {
        setListening(false);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  async function onPickFile(f: File | undefined) {
    if (!f) return;
    setAttachError(null);
    try {
      setAttach(await readFile(f));
    } catch (err) {
      setAttachError((err as Error).message);
    }
  }

  async function send(text?: string, opts?: { suffix?: string }) {
    const raw = (text ?? input).trim();
    if (!raw || sending) return;
    if (!navigator.onLine) { setOnline(false); return; }
    if (raw.toLowerCase() === "talk on whatsapp") {
      window.open(WA, "_blank");
      return;
    }
    const content = opts?.suffix ? `${raw}\n\n${opts.suffix}` : raw;
    if (DEMO_RE.test(raw)) setShowDemo(true);
    let sessionId = activeId;
    if (!sessionId) {
      sessionId = userId ? crypto.randomUUID() : uid();
      setSessions((prev) => [{ id: sessionId!, title: raw.slice(0, 48), messages: [], updatedAt: Date.now(), remote: Boolean(userId) }, ...prev]);
      setActiveId(sessionId);
    }
    const assistantId = uid();
    const filePayload = attach;
    setInput("");
    setAttach(null);
    setSending(true);
    setLanded(false);
    setSessions((prev) => prev.map((s) => s.id === sessionId ? {
      ...s,
      title: s.messages.length === 0 ? raw.slice(0, 48) : s.title,
      messages: [...s.messages, { id: uid(), role: "user", content: filePayload ? `${content}\n\n[Attached: ${filePayload.name}]` : content, createdAt: Date.now() }, { id: assistantId, role: "assistant", content: "", createdAt: Date.now() }],
      updatedAt: Date.now(),
    } : s));
    const history = sessions.find((s) => s.id === sessionId)?.messages.map((m) => ({ role: m.role, content: m.content })) || [];
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const timer = window.setTimeout(() => ac.abort(), STREAM_MS);
    let full = "";
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
          mode,
          chat_id: sessionId,
          file: filePayload,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ctype = res.headers.get("content-type") || "";
      if (ctype.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
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
                patchAssistant(sessionId, assistantId, { content: full });
              }
              if (json.type === "done") {
                full = json.content || full;
                setLastProvider(json.provider || null);
                patchAssistant(sessionId, assistantId, { content: full, provider: json.provider });
              }
            } catch { /* ignore */ }
          }
        }
        if (!full.trim()) throw new Error("Empty stream");
      } else {
        const data = await res.json();
        const reply = data.generated_text || data.reply || data.message || "";
        if (!reply) throw new Error("Empty response");
        full = reply;
        setLastProvider(data.provider || null);
        patchAssistant(sessionId, assistantId, { content: reply, provider: data.provider });
      }
      const sess = { id: sessionId, title: raw.slice(0, 48), messages: [], updatedAt: Date.now(), remote: Boolean(userId) };
      await persistTurn(sess, content, full);
    } catch (err) {
      const aborted = (err as Error)?.name === "AbortError";
      patchAssistant(sessionId, assistantId, {
        error: true,
        content: full.trim() || (aborted ? "Stopped — tap Retry to run that again." : "The assistant did not respond in time. Tap Retry."),
      });
    } finally {
      window.clearTimeout(timer);
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send();
  }

  const SenderFace = () =>
    userAvatar ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={userAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0" />
    ) : (
      <div className="w-8 h-8 rounded-full bg-[#E8651C] text-white text-xs font-bold grid place-items-center shrink-0" title={userEmail || "Guest"}>{initials(userEmail)}</div>
    );

  if (landed) {
    return (
      <div className="min-h-[100dvh] text-[#F3EDE4] relative overflow-hidden" style={{ background: glow }}>
        <style>{`@keyframes lit-marquee{from{transform:translate3d(-50%,0,0)}to{transform:translate3d(0,0,0)}}.lit-ticker{animation:lit-marquee 5s linear infinite;will-change:transform}@media (prefers-reduced-motion:reduce){.lit-ticker{animation:lit-marquee 5s linear infinite!important;animation-iteration-count:infinite!important}}`}</style>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] bg-gradient-to-t from-orange-600/40 via-orange-500/10 to-transparent blur-2xl" />
        <header className="relative z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-8 py-5">
          <Link href="/" className="justify-self-start flex items-center gap-2 min-w-0 max-w-full">
            <Image src={COMPANY.logoIconPath} alt="" width={28} height={28} className="rounded-full object-cover border border-white/20 shrink-0" />
            <span className="text-[11px] sm:text-[13px] font-semibold tracking-[0.08em] uppercase truncate">LOGIC INTELLIGENCE TECHNOLOGIES</span>
          </Link>
          <nav className="hidden md:flex justify-self-center items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1.5 backdrop-blur-md">
            {[["Home", "/"], ["About us", "/about"], ["Package", "/packages"], ["Blog", "/blog"]].map(([label, href]) => (
              <Link key={href} href={href} className="px-3 py-1.5 text-sm whitespace-nowrap text-[#E8DFD4]/80 hover:text-white">{label}</Link>
            ))}
          </nav>
          <Link href="/contact" className="justify-self-end rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm whitespace-nowrap">Contact Us</Link>
        </header>
        <main className="relative z-10 flex flex-col items-center text-center px-6 pt-16 sm:pt-24 pb-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs mb-8"><Sparkles className="w-3.5 h-3.5 text-orange-300" /> Logic AI</p>
          <h1 className="max-w-5xl font-serif text-[2.4rem] sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-[#F6EFE6]">The fastest way<br /> to Build and Grow<br /> your Website.</h1>
          <p className="mt-6 max-w-xl text-sm sm:text-base text-[#C9BDB0] leading-relaxed">Logic Intelligence Technologies helps businesses build stunning websites and scale their online presence with AI-powered tools for design, automation, and growth.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => setLanded(false)} className="inline-flex items-center gap-2 rounded-full bg-[#E8651C] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(232,101,28,0.35)] hover:brightness-110">Get Started <ArrowRight className="w-4 h-4" /></button>
            <Link href="/ai-assistant" className="rounded-full border border-white/15 bg-black/25 px-6 py-3 text-sm">Learn More</Link>
          </div>
        </main>
        <div className="absolute bottom-5 inset-x-0 overflow-hidden pointer-events-none">
          <div className="lit-ticker flex w-max">
            <p className="lit-ticker-text whitespace-nowrap text-[12px] tracking-[0.28em] uppercase text-white/45 pr-16">{TICKER}</p>
            <p className="lit-ticker-text whitespace-nowrap text-[12px] tracking-[0.28em] uppercase text-white/45 pr-16" aria-hidden>{TICKER}</p>
          </div>
        </div>
      </div>
    );
  }

  const hdrBtn = "inline-flex items-center justify-center gap-1.5 h-10 min-w-[7rem] px-4 rounded-full border border-white/15 bg-black/30 text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-white/10 hover:border-white/30 transition-colors disabled:opacity-40 whitespace-nowrap";

  return (
    <div className="min-h-[100dvh] text-[#F3EDE4] flex flex-col" style={{ background: glow }}>
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="w-full px-3 sm:px-6 py-3 grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="justify-self-start flex items-center gap-2.5 min-w-0">
            <button type="button" className="lg:hidden h-10 w-10 rounded-full border border-white/15 bg-black/30 grid place-items-center" onClick={() => setSidebarOpen(true)} aria-label="Open chats"><Menu className="w-4 h-4" /></button>
            <Image src={COMPANY.logoIconPath} alt="" width={36} height={36} className="rounded-full object-cover hidden sm:block border border-white/20" />
            <button type="button" onClick={() => setLanded(true)} className="text-left min-w-0">
              <h1 className="text-sm font-black tracking-[0.14em] uppercase">Logic AI</h1>
              <p className="text-[10px] text-zinc-500 truncate uppercase tracking-wider">{sending ? "thinking" : lastProvider ? `via ${lastProvider}` : "ready"}{userEmail ? ` · ${userEmail}` : " · guest"}</p>
            </button>
          </div>
          <div className="hidden lg:flex justify-self-center items-center gap-2">
            <button type="button" onClick={() => setMode("company")} className={`${hdrBtn} ${mode === "company" ? "bg-[#E8651C] text-white border-[#E8651C]" : ""}`}>Company</button>
            <button type="button" onClick={() => setMode("general")} className={`${hdrBtn} ${mode === "general" ? "bg-[#E8651C] text-white border-[#E8651C]" : ""}`}>General</button>
          </div>
          <div className="justify-self-end flex items-center gap-2">
            <button type="button" onClick={() => { if (!active) return; const t = active.messages.map((m) => `${m.role}: ${m.content}`).join("\n\n"); const b = new Blob([t], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "logic-ai.txt"; a.click(); URL.revokeObjectURL(u); }} className={`hidden sm:inline-flex ${hdrBtn}`} disabled={!active?.messages.length}><Download className="w-4 h-4" /> Export</button>
            <a href={WA} className={`hidden sm:inline-flex ${hdrBtn}`}>WhatsApp</a>
            <Link href="/" className={hdrBtn}>Home</Link>
            <button type="button" onClick={newChat} className={hdrBtn}><MessageSquarePlus className="w-4 h-4" /> New</button>
          </div>
        </div>
        {!online && <div className="bg-amber-500/15 text-amber-200 text-xs px-4 py-2 flex items-center justify-center gap-2 uppercase tracking-wider"><WifiOff className="w-3.5 h-3.5" /> Offline</div>}
      </header>
      <div className="flex-1 w-full grid lg:grid-cols-[168px_minmax(0,1fr)] min-h-0">
        <aside className="hidden lg:flex flex-col border-r border-white/5 py-3 px-1.5 max-h-[calc(100dvh-3.5rem)]">
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-2 mb-1">History {userId ? "· cloud" : "· this device"}</p>
          <div className="flex-1 overflow-y-auto space-y-0.5">
            {sessions.map((s) => (
              <div key={s.id} className={`flex items-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] cursor-pointer ${s.id === activeId ? "bg-orange-500/15 border border-orange-400/25" : "text-zinc-400 hover:bg-white/5"}`} onClick={() => setActiveId(s.id)}>
                <span className="flex-1 truncate">{s.title}</span>
                <button type="button" className="p-0.5 text-red-400" onClick={(e) => { e.stopPropagation(); void deleteChat(s.id); }}><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </aside>
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.button type="button" className="fixed inset-0 z-40 bg-black/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
              <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-56 bg-[#120a08] p-3 lg:hidden" initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}>
                <div className="flex justify-between mb-3"><span className="text-xs font-bold">History</span><button type="button" onClick={() => setSidebarOpen(false)}><X className="w-4 h-4" /></button></div>
                {sessions.map((s) => (
                  <button key={s.id} type="button" className="block w-full text-left text-[11px] py-1.5 truncate" onClick={() => { setActiveId(s.id); setSidebarOpen(false); }}>{s.title}</button>
                ))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        <section className="flex flex-col min-h-0 min-w-0 max-h-[calc(100dvh-3.5rem)]">
          <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-6 space-y-5">
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
            {active?.messages.map((m, i) => (
              <div key={m.id} className={`max-w-3xl mx-auto flex gap-2 items-end group ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0"><Sparkles className={`w-3.5 h-3.5 text-orange-300 ${sending && !m.content ? "animate-pulse" : ""}`} /></div>}
                <div className={`rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-[#E8651C] text-white max-w-[80%]" : "bg-black/30 border border-white/10 flex-1 min-w-0"}`}>
                  {m.role === "assistant" ? (
                    m.content ? <MarkdownMessage content={m.content} /> : sending ? (
                      <span className="inline-flex items-center gap-2 text-zinc-400 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking
                      </span>
                    ) : null
                  ) : m.content}
                  {m.error && <button type="button" className="mt-2 text-xs inline-flex items-center gap-1" onClick={() => void send(lastUser?.content)}><RefreshCw className="w-3 h-3" /> Retry</button>}
                  {m.role === "assistant" && m.content && !m.error && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-500">
                      <button type="button" className="inline-flex items-center gap-1" onClick={async () => { await navigator.clipboard.writeText(m.content); setCopiedId(m.id); }}>{copiedId === m.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy</button>
                      <button type="button" className="inline-flex items-center gap-1" onClick={() => setInput(`Regarding this:\n"""${m.content.slice(0, 600)}"""\n\n`)}><Quote className="w-3 h-3" /> Ask about this</button>
                      {i === (active.messages.length - 1) && (
                        <>
                          <button type="button" onClick={() => void send(lastUser?.content || m.content, { suffix: "Rewrite shorter. Keep facts." })}>Shorter</button>
                          <button type="button" onClick={() => void send(lastUser?.content || m.content, { suffix: "Rewrite more technical. Keep facts." })}>More technical</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {m.role === "user" && <SenderFace />}
              </div>
            ))}
            {!sending && lastAssistant && (
              <div className="max-w-3xl mx-auto flex flex-wrap gap-2 pl-10">
                {followUps(lastAssistant.content).map((q) => (
                  <button key={q} type="button" onClick={() => void send(q)} className="text-[11px] rounded-full border border-white/15 px-3 py-1 hover:border-orange-400/50">{q}</button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          {showDemo && (
            <div className="px-3 sm:px-8">
              <div className="max-w-3xl mx-auto mb-2 flex items-center justify-between gap-3 rounded-xl border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-xs">
                <span>Ready to see a scoped demo? We do not invent prices on a call.</span>
                <Link href="/free-demo" className="shrink-0 rounded-full bg-[#E8651C] px-3 py-1 font-bold text-white">Book free demo</Link>
              </div>
            </div>
          )}
          <form onSubmit={onSubmit} className="px-3 sm:px-8 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
            {attach && (
              <div className="max-w-3xl mx-auto mb-1 flex items-center justify-between text-[11px] text-zinc-400 px-1">
                <span>Attached: {attach.name}</span>
                <button type="button" onClick={() => setAttach(null)}>Remove</button>
              </div>
            )}
            {attachError && <p className="max-w-3xl mx-auto text-[11px] text-red-300 mb-1">{attachError}</p>}
            <div className="max-w-3xl mx-auto flex items-end gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
              <input ref={fileRef} type="file" accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf" className="hidden" onChange={(e) => void onPickFile(e.target.files?.[0])} />
              <button type="button" className="p-2 text-zinc-400" onClick={() => fileRef.current?.click()} aria-label="Attach"><Paperclip className="w-4 h-4" /></button>
              <button type="button" className={`p-2 ${listening ? "text-orange-400" : "text-zinc-400"}`} onClick={toggleMic} aria-label="Voice"><Mic className="w-4 h-4" /></button>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} rows={1} placeholder={listening ? "Listening…" : "Enter prompt here…"} className="flex-1 bg-transparent resize-none text-sm py-2 outline-none max-h-32" />
              {sending ? (
                <button type="button" onClick={() => abortRef.current?.abort()} className="p-2 rounded-full border border-white/20" aria-label="Stop"><Square className="w-3 h-3" /></button>
              ) : (
                <button type="submit" disabled={!input.trim() && !attach} className="p-2 rounded-full bg-[#E8651C] text-white disabled:opacity-40" aria-label="Send"><ArrowUp className="w-4 h-4" /></button>
              )}
            </div>
            <div className="sm:hidden max-w-3xl mx-auto mt-2 flex justify-center gap-2 text-[10px] font-bold uppercase">
              <button type="button" onClick={() => setMode("company")} className={mode === "company" ? "text-orange-300" : "text-zinc-500"}>Company</button>
              <button type="button" onClick={() => setMode("general")} className={mode === "general" ? "text-orange-300" : "text-zinc-500"}>General</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
