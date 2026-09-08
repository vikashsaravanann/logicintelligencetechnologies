"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUp, Check, Copy, Download, Loader2, Menu, MessageSquarePlus, Mic, Paperclip, Quote, RefreshCw, Search, Share2, Sparkles, Square, Ticket, Trash2, Volume2, WifiOff, X } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { COMPANY } from "@/config/company";
import { MarkdownMessage } from "@/components/ai/markdown-message";
import { InChatPackageCards } from "@/components/ai/package-cards";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

type Role = "user" | "assistant";
type Mode = "company" | "general";
type ChatMessage = { id: string; role: Role; content: string; createdAt: number; provider?: string; error?: boolean; citations?: string[]; badge?: string };
type ChatSession = { id: string; title: string; messages: ChatMessage[]; updatedAt: number; remote?: boolean };
type AttachFile = { name: string; type: string; data: string };
type SpeechRecCtor = new () => BrowserSpeechRec;
type BrowserSpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

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
const PRICE_RE = /₹|price|pack|cost|launch|18,999|8,999|50,000|enterprise|how much/i;
const LAND_NAV: Array<[string, string]> = [
  ["HOME", "/"],
  ["ABOUT US", "/about"],
  ["PACKAGE", "/packages"],
  ["BLOG", "/blog"],
  ["CONTACT US", "/contact"],
];
const glow = "var(--ai-glow)";
const WA = `https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent("Hi LIT — chatting on Logic AI.")}`;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}
function timeAgo(ts: number) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
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
function waTranscript(messages: ChatMessage[]) {
  const slice = messages.filter((m) => m.content).slice(-6);
  const body =
    "Hi LIT — from Logic AI.\n\n" +
    slice
      .map((m) => `${m.role === "user" ? "Visitor" : "LOGIC AI"}: ${m.content.replace(/\s+/g, " ").slice(0, 280)}`)
      .join("\n\n");
  return `https://wa.me/${COMPANY.whatsappNumber}?text=${encodeURIComponent(body.slice(0, 1800))}`;
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
  const [landMenu, setLandMenu] = useState(false);
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
  const [showLead, setShowLead] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadBusy, setLeadBusy] = useState(false);
  const [leadOk, setLeadOk] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [railQuery, setRailQuery] = useState("");
  const [copiedShare, setCopiedShare] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [ticketBusy, setTicketBusy] = useState(false);
  const [ticketOk, setTicketOk] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionsRef = useRef<ChatSession[]>([]);
  const activeIdRef = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<BrowserSpeechRec | null>(null);
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
      const meta = u?.user_metadata as { avatar_url?: string; picture?: string; full_name?: string } | undefined;
      setUserAvatar(meta?.avatar_url || meta?.picture || null);
      if (u?.email) {
        setLeadEmail((prev) => prev || u.email || "");
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", u.id).maybeSingle();
        const nm = (profile as { full_name?: string } | null)?.full_name || meta?.full_name || "";
        if (nm) setLeadName((prev) => prev || nm);
        const chk = await fetch("/api/ai/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ check: true, email: u.email }) });
        const chkJson = await chk.json().catch(() => ({}));
        if (chkJson.exists) { setLeadOk(true); setShowLead(false); }
      }
      if (typeof window !== "undefined" && localStorage.getItem("lit_ai_lead_done") === "1") {
        setLeadOk(true); setShowLead(false);
      }
      const cid = new URLSearchParams(window.location.search).get("c");
      if (cid && u?.id) setActiveId(cid);
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
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "/" && !typing) { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === "Escape") abortRef.current?.abort();
      if (e.key === "ArrowUp" && !typing) {
        const last = [...(sessionsRef.current.find((x) => x.id === activeIdRef.current)?.messages || [])].reverse().find((m) => m.role === "user");
        if (last) setInput(last.content);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      window.removeEventListener("keydown", onKey);
      abortRef.current?.abort();
      recRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, [supabase]);

  useEffect(() => {
    sessionsRef.current = sessions;
    activeIdRef.current = activeId;
    if (!userId) localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 24)));
  }, [sessions, userId, activeId]);

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

  async function commitRename(id: string, title: string) {
    const next = title.trim().slice(0, 80) || "Untitled";
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title: next } : s)));
    setRenamingId(null);
    if (userId && isUuid(id)) await supabase.from("ai_chats").update({ title: next }).eq("id", id);
  }

  async function submitLead() {
    if (leadBusy || leadOk) return;
    const name = leadName.trim();
    const email = leadEmail.trim();
    if (!name || !email.includes("@")) {
      setAttachError("Add your name and a valid email.");
      return;
    }
    setLeadBusy(true);
    try {
      const res = await fetch("/api/ai/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          interest: lastUser?.content || "Pricing on /ai",
          chat_id: activeId,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setLeadOk(true);
        setShowLead(false);
        localStorage.setItem("lit_ai_lead_done", "1");
      } else {
        setAttachError(data.error || "Could not save details.");
      }
    } catch {
      setAttachError("Could not save details.");
    } finally {
      setLeadBusy(false);
    }
  }

  async function openTicket() {
    if (ticketBusy || ticketOk) return;
    const email = leadEmail || userEmail || "";
    if (!email.includes("@")) { setAttachError("Add your email in the lead row first, then tap Talk to a human."); setShowLead(true); return; }
    setTicketBusy(true);
    try {
      const transcript = (active?.messages || []).slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n");
      const res = await fetch("/api/ai/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: leadName || "Visitor", email, summary: transcript || "Talk to a human from Logic AI." }),
      });
      const data = await res.json();
      if (data.ok) setTicketOk(true);
      else setAttachError(data.error || "Could not open a ticket.");
    } catch {
      setAttachError("Could not open a ticket.");
    } finally {
      setTicketBusy(false);
    }
  }

  function speak(text: string) {
    if (!window.speechSynthesis) { setAttachError("Voice-out is not supported in this browser."); return; }
    window.speechSynthesis.cancel();
    if (speaking) { setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text.slice(0, 1200));
    u.rate = 1.02;
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }

  async function copyShare() {
    if (!activeId || !isUuid(activeId)) { setAttachError("Sign in and start a cloud chat to share a link."); return; }
    const url = `${window.location.origin}/ai?c=${activeId}`;
    await navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1500);
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
    const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
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
    rec.onresult = (e) => {
      const t = Array.from(e.results as ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }>).map((r) => r[0].transcript).join(" ");
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
    const lower = raw.toLowerCase();
    if (lower === "talk on whatsapp" || lower === "/wa") {
      window.open(waTranscript(sessions.find((x) => x.id === activeId)?.messages || []), "_blank");
      return;
    }
    if (lower === "/demo") { window.location.href = "/free-demo"; return; }
    if (lower === "/price") { return void send("What packages do you offer and starting prices?"); }
    if (lower === "/human") { void openTicket(); return; }
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
              if (json.type === "meta" && (json.citations || json.faithfulnessHint)) {
                patchAssistant(sessionId, assistantId, { citations: json.citations, badge: json.faithfulnessHint });
              }
              if (json.type === "token" && json.content) {
                full += json.content;
                patchAssistant(sessionId, assistantId, { content: full });
              }
              if (json.type === "done") {
                full = json.content || full;
                setLastProvider(json.provider || null);
                patchAssistant(sessionId, assistantId, { content: full, provider: json.provider, citations: json.citations, badge: json.faithfulnessHint });
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
      if (!leadOk && localStorage.getItem("lit_ai_lead_done") !== "1" && (PRICE_RE.test(raw) || PRICE_RE.test(full))) setShowLead(true);
    } catch (err) {
      const aborted = (err as Error)?.name === "AbortError";
      void fetch("/api/ai/abort", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason: aborted ? "retry" : "timeout", path: "/ai" }) });
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
      <div className="min-h-[100dvh] text-[color:var(--ai-ink)] relative overflow-hidden" style={{ background: glow }}>
        <style>{`@keyframes lit-marquee{from{transform:translate3d(-50%,0,0)}to{transform:translate3d(0,0,0)}}.lit-ticker{animation:lit-marquee 5s linear infinite;will-change:transform}@media (prefers-reduced-motion:reduce){.lit-ticker{animation:lit-marquee 5s linear infinite!important;animation-iteration-count:infinite!important}}`}</style>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] bg-gradient-to-t from-orange-600/40 via-orange-500/10 to-transparent blur-2xl" />
        <header className="relative z-30 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-8 py-3 sm:py-5">
          <Link href="/" className="justify-self-start flex items-center gap-2 min-w-0 max-w-[70vw] sm:max-w-full">
            <Image src={COMPANY.logoIconPath} alt="Logic Intelligence Technologies" width={24} height={24} className="rounded-full object-cover border border-white/20 shrink-0 sm:w-7 sm:h-7" />
            <span className="hidden sm:inline text-[10px] sm:text-[13px] font-semibold tracking-[0.08em] uppercase truncate">LOGIC INTELLIGENCE TECHNOLOGIES</span>
          </Link>
          <nav className="hidden md:flex justify-self-center items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-1.5 backdrop-blur-md">
            {LAND_NAV.filter(([, href]) => href !== "/contact").map(([label, href]) => (
              <Link key={href} href={href} className="px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase whitespace-nowrap text-[#E8DFD4]/80 hover:text-white">{label}</Link>
            ))}
          </nav>
          <div className="justify-self-end flex items-center gap-2 max-w-[62vw] sm:max-w-none overflow-x-auto no-scrollbar">
            <ThemeToggle />
            <Link href="/contact" className="hidden md:inline-flex rounded-full border border-white/15 bg-black/30 px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase whitespace-nowrap">CONTACT US</Link>
            <button type="button" onClick={() => setLandMenu((v) => !v)} className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 bg-black/30" aria-expanded={landMenu} aria-label={landMenu ? "Close menu" : "Open menu"}>
              {landMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>
        {landMenu && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setLandMenu(false)}>
            <div className="absolute top-20 left-4 right-4 rounded-2xl border border-white/10 bg-[#120c08]/95 p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {LAND_NAV.map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setLandMenu(false)} className="block rounded-xl px-4 py-3 text-[12px] font-semibold tracking-[0.16em] uppercase text-[#E8DFD4] hover:bg-white/5">{label}</Link>
              ))}
            </div>
          </div>
        )}
        <main className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 pt-10 sm:pt-24 pb-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] sm:text-xs mb-6 sm:mb-8"><Sparkles className="w-3.5 h-3.5 text-orange-300" /> Logic AI</p>
          <h1 className="max-w-5xl font-serif text-[1.7rem] sm:text-6xl lg:text-7xl leading-[1.12] tracking-tight text-[color:var(--ai-ink)]">The fastest way<br /> to Build and Grow<br /> your Website.</h1>
          <p className="mt-4 sm:mt-6 max-w-xl text-[13px] sm:text-base text-[color:var(--ai-muted)] leading-relaxed px-1">Logic Intelligence Technologies helps businesses build stunning websites and scale their online presence with AI-powered tools for design, automation, and growth.</p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row w-full max-w-xs sm:max-w-none items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
            <button type="button" onClick={() => setLanded(false)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8651C] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(232,101,28,0.35)] hover:brightness-110">Get Started <ArrowRight className="w-4 h-4" /></button>
            <Link href="/ai-assistant" className="rounded-full border border-white/15 bg-black/25 px-5 py-3 text-sm text-center">Learn More</Link>
          </div>
        </main>
        <div className="absolute bottom-4 inset-x-0 overflow-hidden pointer-events-none">
          <div className="lit-ticker flex w-max">
            <p className="lit-ticker-text whitespace-nowrap text-[10px] sm:text-[12px] tracking-[0.18em] sm:tracking-[0.28em] uppercase text-white/45 pr-16">{TICKER}</p>
            <p className="lit-ticker-text whitespace-nowrap text-[12px] tracking-[0.28em] uppercase text-white/45 pr-16" aria-hidden>{TICKER}</p>
          </div>
        </div>
      </div>
    );
  }

  const iconBtn = "h-9 w-9 grid place-items-center rounded-full border border-white/12 bg-white/[0.04] hover:bg-white/[0.09] text-zinc-300 disabled:opacity-40 shrink-0";
  const pillBtn = "inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full border border-white/12 bg-white/[0.04] text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-white/[0.09] disabled:opacity-40 whitespace-nowrap";
  const railSessions = sessions.filter((s) => !railQuery || s.title.toLowerCase().includes(railQuery.toLowerCase()) || s.messages.some((m) => m.content.toLowerCase().includes(railQuery.toLowerCase())));

  const renderHistory = (onPick?: () => void) => (
      <>
        <div className="flex items-center justify-between px-1 mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">History</p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-600">{userId ? "Cloud · synced" : "This device"}</p>
          </div>
          <button type="button" onClick={newChat} className="h-8 px-3 rounded-full bg-[#E8651C] text-[10px] font-bold uppercase tracking-wider text-white">New</button>
        </div>
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={railQuery} onChange={(e) => setRailQuery(e.target.value)} placeholder="Search threads" className="w-full h-9 bg-black/40 border border-white/10 rounded-full pl-9 pr-3 text-xs outline-none focus:border-orange-400/40" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {railSessions.length === 0 && <p className="text-[11px] text-zinc-600 px-2 py-6 text-center">No conversations yet.</p>}
          {railSessions.map((s) => (
            <div
              key={s.id}
              className={`group flex items-start gap-2 rounded-xl px-2.5 py-2.5 cursor-pointer ${s.id === activeId ? "bg-orange-500/15 border border-orange-400/25" : "border border-transparent hover:bg-white/[0.04]"}`}
              onClick={() => { setActiveId(s.id); onPick?.(); }}
            >
              {renamingId === s.id ? (
                <input
                  autoFocus
                  value={renameVal}
                  onChange={(e) => setRenameVal(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={() => void commitRename(s.id, renameVal)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void commitRename(s.id, renameVal); } if (e.key === "Escape") setRenamingId(null); }}
                  className="flex-1 min-w-0 bg-black/40 border border-white/20 rounded px-1.5 py-1 text-xs outline-none"
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#F3EDE4] leading-snug line-clamp-2" onDoubleClick={(e) => { e.stopPropagation(); setRenamingId(s.id); setRenameVal(s.title); }} title="Double-click to rename">{s.title}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{timeAgo(s.updatedAt)}</p>
                </div>
              )}
              <button type="button" className="opacity-0 group-hover:opacity-100 p-1 text-red-400" onClick={(e) => { e.stopPropagation(); void deleteChat(s.id); }} aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </>
    );

  return (
    <div className="min-h-[100dvh] text-[color:var(--ai-ink)] flex flex-col" style={{ background: glow }}>
      <header className="ai-chrome sticky top-0 z-30 border-b border-[color:var(--ai-border)] bg-[color:var(--ai-header)] backdrop-blur-xl">
        <div className="h-12 sm:h-16 px-2 sm:px-5 flex items-center gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)] sm:gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button type="button" className="lg:hidden h-8 w-8 rounded-full border border-white/15 grid place-items-center shrink-0 text-white" onClick={() => setSidebarOpen(true)} aria-label="Open history"><Menu className="w-4 h-4" /></button>
            <Image src={COMPANY.logoIconPath} alt="Logic Intelligence Technologies" width={28} height={28} className="rounded-full object-cover border border-white/20 shrink-0 hidden sm:block" />
            <button type="button" onClick={() => setLanded(true)} className="text-left min-w-0 flex-1">
              <div className="text-[11px] sm:text-[13px] font-bold tracking-[0.12em] uppercase leading-none truncate">LOGIC AI</div>
              <div className="mt-1 text-[9px] sm:text-[10px] text-zinc-500 truncate uppercase tracking-[0.1em]">{sending ? "Thinking" : lastProvider ? `Ready · ${lastProvider}` : "Ready"}<span className="hidden sm:inline">{userEmail ? ` · ${userEmail}` : " · guest"}</span></div>
            </button>
          </div>
          <div className="hidden md:flex justify-self-center items-center rounded-full border border-[color:var(--ai-border)] bg-[color:var(--ai-panel)] p-0.5">
            <button type="button" onClick={() => setMode("company")} className={`inline-flex items-center justify-center h-8 min-w-[7.5rem] px-4 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] ${mode === "company" ? "bg-[#E8651C] text-white" : "text-[color:var(--ai-muted)]"}`}>COMPANY</button>
            <button type="button" onClick={() => setMode("general")} className={`inline-flex items-center justify-center h-8 min-w-[7.5rem] px-4 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] ${mode === "general" ? "bg-[#E8651C] text-white" : "text-[color:var(--ai-muted)]"}`}>GENERAL</button>
          </div>
          <div className="flex items-center justify-end gap-1.5 shrink-0">
            <Link href="/" className="inline-flex items-center justify-center h-9 min-w-[3.25rem] px-3 rounded-full border border-white/15 text-[10px] font-bold uppercase tracking-wider text-white shrink-0">HOME</Link>
            <button type="button" onClick={newChat} className="h-9 min-w-[3.25rem] px-3.5 rounded-full bg-[#E8651C] text-[10px] font-bold uppercase tracking-wider text-white shrink-0">NEW</button>
            <span className="hidden sm:inline-flex"><ThemeToggle /></span>
          </div>
        </div>
        {!online && <div className="bg-amber-500/15 text-amber-200 text-xs px-4 py-2 flex items-center justify-center gap-2 uppercase tracking-wider"><WifiOff className="w-3.5 h-3.5" /> Offline</div>}
      </header>

      <div className="flex-1 w-full grid lg:grid-cols-[260px_minmax(0,1fr)] min-h-0">
        <aside className="hidden lg:flex flex-col border-r border-white/8 bg-black/25 py-4 px-3 max-h-[calc(100dvh-4rem)]">
          {renderHistory()}
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
              <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-[min(86vw,300px)] bg-[#120a08] border-r border-white/10 p-4 flex flex-col lg:hidden" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}>
                <div className="flex justify-end mb-2"><button type="button" onClick={() => setSidebarOpen(false)} className={iconBtn} aria-label="Close"><X className="w-4 h-4" /></button></div>
                {renderHistory(() => setSidebarOpen(false))}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <section className="flex flex-col min-h-0 min-w-0 max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-4rem)]">
          <div className="flex-1 overflow-y-auto">
            <div className="w-full max-w-[48rem] mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
              {(!active || active.messages.length === 0) && (
                <div className="text-center pt-8">
                  <p className="text-base sm:text-xl font-semibold tracking-tight mb-1.5 sm:mb-2">How can Logic AI help?</p>
                  <p className="text-[12px] sm:text-sm text-zinc-500 mb-4 sm:mb-6">Packages, scoping, or general engineering questions.</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {STARTERS.map((q) => (
                      <button key={q} type="button" onClick={() => void send(q)} className="text-left text-[12px] sm:text-sm rounded-xl sm:rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5 sm:px-4 sm:py-3 hover:border-orange-400/40">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {active?.messages.map((m, i) => (
                <div key={m.id} className={`flex gap-2 sm:gap-3 items-end ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="hidden sm:flex w-8 h-8 rounded-full bg-orange-500/20 border border-orange-400/30 items-center justify-center shrink-0 mb-1">
                      <Sparkles className={`w-3.5 h-3.5 text-orange-300 ${sending && !m.content ? "animate-pulse" : ""}`} />
                    </div>
                  )}
                  <div className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-[14px] sm:text-[15px] leading-relaxed min-w-0 ${m.role === "user" ? "bg-[#E8651C] text-white max-w-[min(100%,34rem)]" : "bg-black/35 border border-white/10 w-full"}`}>
                    {m.role === "assistant" ? (
                      m.content ? (
                        <>
                          <MarkdownMessage content={m.content} />
                          <InChatPackageCards text={m.content} />
                          {(m.badge || (m.citations && m.citations.length > 0)) && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {m.badge === "catalog" && <span className="text-[10px] uppercase tracking-wider rounded-full border border-orange-400/30 px-2 py-0.5 text-orange-200">Prices from catalog</span>}
                              {m.badge === "general" && <span className="text-[10px] uppercase tracking-wider rounded-full border border-white/15 px-2 py-0.5 text-zinc-400">General answer</span>}
                              {(m.citations || []).map((c) => <span key={c} className="text-[10px] rounded-full border border-white/10 px-2 py-0.5 text-zinc-400">From {c}</span>)}
                            </div>
                          )}
                        </>
                      ) : sending ? (
                        <span className="inline-flex items-center gap-2 text-zinc-400 text-xs"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking</span>
                      ) : null
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                    {m.error && <button type="button" className="mt-2 text-xs inline-flex items-center gap-1" onClick={() => void send(lastUser?.content)}><RefreshCw className="w-3 h-3" /> Retry</button>}
                    {m.role === "assistant" && m.content && !m.error && (
                      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-zinc-500">
                        <button type="button" className="inline-flex items-center gap-1 hover:text-zinc-200" onClick={async () => { await navigator.clipboard.writeText(m.content); setCopiedId(m.id); }}>{copiedId === m.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy</button>
                        <button type="button" className="inline-flex items-center gap-1 hover:text-zinc-200" onClick={() => speak(m.content)}><Volume2 className="w-3 h-3" /> {speaking ? "Stop" : "Listen"}</button>
                        <button type="button" className="inline-flex items-center gap-1 hover:text-zinc-200" onClick={() => setInput(`Regarding this:\n"""${m.content.slice(0, 600)}"""\n\n`)}><Quote className="w-3 h-3" /> Ask about this</button>
                        {i === (active.messages.length - 1) && (
                          <>
                            <button type="button" onClick={() => void send(lastUser?.content || m.content, { suffix: "Rewrite shorter. Keep facts." })}>Shorter</button>
                            <button type="button" onClick={() => void send(lastUser?.content || m.content, { suffix: "Rewrite more technical. Keep facts." })}>More technical</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {m.role === "user" && <span className="hidden sm:inline-flex"><SenderFace /></span>}
                </div>
              ))}
              {!sending && lastAssistant && (
                <div className="flex flex-wrap gap-2 pl-0 sm:pl-11">
                  {followUps(lastAssistant.content).map((q) => (
                    <button key={q} type="button" onClick={() => void send(q)} className="text-[11px] rounded-full border border-white/12 px-3 py-1.5 hover:border-orange-400/50">{q}</button>
                  ))}
                  <button type="button" onClick={() => void openTicket()} className="text-[11px] rounded-full border border-white/12 px-3 py-1.5">{ticketOk ? "Ticket sent" : "Talk to a human"}</button>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-white/8 bg-black/35 backdrop-blur-xl">
            <div className="w-full max-w-[48rem] mx-auto px-3 sm:px-6 pt-2 sm:pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {showLead && !leadOk && (
                <form onSubmit={(e) => { e.preventDefault(); void submitLead(); }} className="mb-3 flex flex-col sm:flex-row gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
                  <p className="sm:sr-only text-[11px] text-zinc-400">Optional follow-up.</p>
                  <input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Name" className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" />
                  <input value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="Email" type="email" className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" />
                  <button type="submit" disabled={leadBusy} className="h-10 px-4 rounded-full bg-[#E8651C] text-[11px] font-bold uppercase tracking-wider text-white disabled:opacity-50">{leadBusy ? "Saving" : "Send"}</button>
                  <button type="button" onClick={() => setShowLead(false)} className="h-10 px-3 text-[11px] uppercase tracking-wider text-zinc-400">Not now</button>
                </form>
              )}
              {leadOk && showLead === false && (active?.messages.length ?? 0) > 0 && (
                <p className="mb-2 text-[11px] text-zinc-500">Details received. We follow up within 24 hours.</p>
              )}
              {showDemo && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-xs">
                  <span>Ready for a scoped demo? We do not invent prices on a call.</span>
                  <Link href="/free-demo" className="shrink-0 rounded-full bg-[#E8651C] px-3 py-1.5 font-bold text-white uppercase tracking-wider text-[10px]">Book demo</Link>
                </div>
              )}
              {attach && (
                <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Attached: {attach.name}{ /pdf/i.test(attach.type || attach.name) ? " · first ~20 pages" : ""}</span>
                  <button type="button" onClick={() => setAttach(null)}>Remove</button>
                </div>
              )}
              {attachError && <p className="mb-2 text-[11px] text-red-300">{attachError}</p>}
              <form onSubmit={onSubmit} className="flex items-center gap-1.5 rounded-2xl border border-white/12 bg-black/50 px-1.5 py-1.5 focus-within:border-orange-400/35 min-w-0">
                <input ref={fileRef} type="file" accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf" className="hidden" onChange={(e) => void onPickFile(e.target.files?.[0])} />
                <button type="button" className="h-11 w-11 shrink-0 grid place-items-center text-zinc-300 hover:text-white" onClick={() => fileRef.current?.click()} aria-label="Attach"><Paperclip className="w-5 h-5" /></button>
                <button type="button" className={`h-11 w-11 shrink-0 grid place-items-center ${listening ? "text-orange-400" : "text-zinc-300 hover:text-white"}`} onClick={toggleMic} aria-label="Voice"><Mic className="w-5 h-5" /></button>
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} rows={1} placeholder={listening ? "Listening…" : "Message Logic AI"} className="flex-1 bg-transparent resize-none text-base sm:text-[15px] py-2.5 outline-none max-h-32 min-w-0" />
                {sending ? (
                  <button type="button" onClick={() => abortRef.current?.abort()} className="h-11 w-11 shrink-0 rounded-full border border-white/25 grid place-items-center text-white" aria-label="Stop"><Square className="w-3.5 h-3.5" /></button>
                ) : (
                  <button type="submit" disabled={!input.trim() && !attach} className="h-11 w-11 shrink-0 rounded-full bg-[#E8651C] text-white grid place-items-center disabled:opacity-70" aria-label="Send"><ArrowUp className="w-5 h-5" /></button>
                )}
              </form>
              <div className="md:hidden mt-2 flex items-stretch gap-2 w-full">
                <button type="button" className={`flex-1 h-11 rounded-full text-[11px] font-bold uppercase tracking-wider ${mode === "company" ? "bg-[#E8651C] text-white" : "border border-white/15 text-white"}`} onClick={() => setMode("company")}>COMPANY</button>
                <button type="button" className={`flex-1 h-11 rounded-full text-[11px] font-bold uppercase tracking-wider ${mode === "general" ? "bg-[#E8651C] text-white" : "border border-white/15 text-white"}`} onClick={() => setMode("general")}>GENERAL</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
