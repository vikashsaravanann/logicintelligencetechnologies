"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUp, Check, Copy, Loader2, Menu, Mic, Paperclip, Quote, RefreshCw, Search, Share2, Sparkles, Trash2, Volume2, WifiOff, X } from "lucide-react";
import { getClientSupabase } from "@/lib/supabase/client";
import { COMPANY } from "@/config/company";
import { env } from "@/config/env";
import { MarkdownMessage } from "@/components/ai/markdown-message";
import { InChatPackageCards } from "@/components/ai/package-cards";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

type Role = "user" | "assistant";
type Mode = "company" | "general";
type ChatMessage = { id: string; role: Role; content: string; createdAt: number; provider?: string; error?: boolean; citations?: string[]; badge?: string; image?: string };
type ChatSession = { id: string; title: string; messages: ChatMessage[]; updatedAt: number; remote?: boolean };
type AttachFile = { name: string; type: string; data: string; kind?: "file" | "image" };
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
    const isImg = /^image\//.test(file.type) || /\.(png|jpe?g|gif|webp)$/i.test(file.name);
    const ok = isImg || /^(text\/|application\/pdf|application\/json)/.test(file.type) || /\.(txt|md|pdf|json)$/i.test(file.name);
    if (!ok) {
      reject(new Error("Use .txt, .md, .pdf, or an image."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => resolve({ name: file.name, type: file.type || "text/plain", data: String(reader.result || ""), kind: isImg ? "image" : "file" });
    if (isImg || file.type === "application/pdf" || /\.pdf$/i.test(file.name)) reader.readAsDataURL(file);
    else reader.readAsText(file);
  });
}

export const dynamic = "force-dynamic";

export default function AiChatPage() {
  const router = useRouter();
  const [landed, setLanded] = useState(true);
  const [comingSoonNote, setComingSoonNote] = useState(false);
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
  const [kbPad, setKbPad] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sessionsRef = useRef<ChatSession[]>([]);
  const activeIdRef = useRef<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recRef = useRef<BrowserSpeechRec | null>(null);
  const supabase = typeof window !== "undefined" ? getClientSupabase() : null as unknown as ReturnType<typeof getClientSupabase>;

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    const handle = requestAnimationFrame(() => setOnline(navigator.onLine));
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    const vv = window.visualViewport;
    const applyKb = () => {
      if (!vv) return setKbPad(0);
      setKbPad(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    };
    applyKb();
    vv?.addEventListener("resize", applyKb);
    vv?.addEventListener("scroll", applyKb);
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (error) return;
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
    }).catch(() => {
      /* guest / missing env — landing still renders */
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
      vv?.removeEventListener("resize", applyKb);
      vv?.removeEventListener("scroll", applyKb);
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
    if ((!raw && !attach) || sending) return;
    if (!navigator.onLine) { setOnline(false); return; }
    const lower = raw.toLowerCase();
    if (lower === "talk on whatsapp" || lower === "/wa") {
      window.open(waTranscript(sessions.find((x) => x.id === activeId)?.messages || []), "_blank");
      return;
    }
    if (lower === "/demo") { window.location.href = "/free-demo"; return; }
    if (lower === "/price") { return void send("What packages do you offer and starting prices?"); }
    if (lower === "/human") { void openTicket(); return; }
    const filePayload = attach;
    const content = opts?.suffix ? `${raw}\n\n${opts.suffix}` : (raw || (filePayload?.kind === "image" ? "Sent an image." : `Please review ${filePayload?.name || "this file"}.`));
    if (DEMO_RE.test(raw)) setShowDemo(true);
    let sessionId = activeId;
    if (!sessionId) {
      sessionId = userId ? crypto.randomUUID() : uid();
      setSessions((prev) => [{ id: sessionId!, title: (raw || filePayload?.name || "New chat").slice(0, 48), messages: [], updatedAt: Date.now(), remote: Boolean(userId) }, ...prev]);
      setActiveId(sessionId);
    }
    const assistantId = uid();
    setInput("");
    setAttach(null);
    setSending(true);
    setLanded(false);
    setSessions((prev) => prev.map((s) => s.id === sessionId ? {
      ...s,
      title: s.messages.length === 0 ? (raw || filePayload?.name || s.title).slice(0, 48) : s.title,
      messages: [...s.messages, { id: uid(), role: "user", content: filePayload && filePayload.kind !== "image" ? `${content}\n\n[Attached: ${filePayload.name}]` : content, createdAt: Date.now(), image: filePayload?.kind === "image" ? filePayload.data : undefined }, { id: assistantId, role: "assistant", content: "", createdAt: Date.now() }],
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
          file: filePayload?.kind === "image" ? null : filePayload,
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
      <div className="min-h-[100dvh] text-[var(--lit-ink,#121826)] bg-[var(--lit-cloud,#F7F9FC)] relative overflow-hidden flex flex-col justify-between">
        <style>{`@keyframes lit-marquee{from{transform:translate3d(-50%,0,0)}to{transform:translate3d(0,0,0)}}.lit-ticker{animation:lit-marquee 80s linear infinite;will-change:transform}@media (prefers-reduced-motion:reduce){.lit-ticker{animation:lit-marquee 80s linear infinite}}`}</style>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(31,169,162,0.08),transparent_70%),radial-gradient(ellipse_60%_40%_at_50%_110%,rgba(21,101,192,0.06),transparent_60%)]" />
        
        <header className="relative z-30 max-w-7xl w-full mx-auto px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <Image src={COMPANY.logoIconPath} alt="Logic Intelligence Technologies" width={28} height={28} className="rounded-full object-cover border border-[var(--lit-border-light,#DFE7EF)] shrink-0 shadow-xs" />
            <span className="text-xs sm:text-sm font-bold tracking-[0.08em] uppercase truncate text-[var(--lit-navy,#0B2545)] font-display">LOGIC INTELLIGENCE TECHNOLOGIES</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white/90 px-3 py-1.5 shadow-xs backdrop-blur-md">
            {LAND_NAV.filter(([, href]) => href !== "/contact").map(([label, href]) => (
              <Link key={href} href={href} className="px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] transition-colors">{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link href="/contact" className="hidden md:inline-flex rounded-full bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 px-4 py-2 text-xs font-semibold tracking-wider uppercase text-white shadow-xs transition-colors">CONTACT US</Link>
            <button type="button" onClick={() => setLandMenu((v) => !v)} className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] shadow-xs" aria-expanded={landMenu} aria-label={landMenu ? "Close menu" : "Open menu"}>
              {landMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {landMenu && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" onClick={() => setLandMenu(false)}>
            <div className="absolute top-20 left-4 right-4 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3 shadow-xl" onClick={(e) => e.stopPropagation()}>
              {LAND_NAV.map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setLandMenu(false)} className="block rounded-xl px-4 py-3 text-xs font-semibold tracking-wider uppercase text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)]">{label}</Link>
              ))}
            </div>
          </div>
        )}

        <main id="main-content" tabIndex={-1} className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-20 max-w-5xl mx-auto w-full">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--lit-teal,#1FA9A2)]/25 bg-[var(--lit-teal,#1FA9A2)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--lit-teal,#1FA9A2)] mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" /> Logic AI Studio
          </p>
          <h1 className="max-w-4xl font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl leading-[1.12] tracking-tight text-[var(--lit-navy,#0B2545)]">
            The fastest way<br /> to Build and <span className="font-editorial italic font-normal text-[var(--lit-blue,#1565C0)]">Grow</span><br /> your Website.
          </h1>
          <p className="mt-5 sm:mt-6 max-w-2xl text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] leading-relaxed px-1">
            Logic Intelligence Technologies helps businesses build stunning websites and scale their online presence with AI-powered tools for design, automation, and growth.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row w-full max-w-sm sm:max-w-none items-stretch sm:items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setLanded(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition-colors"
            >
              Enter Workspace
            </button>
            <button
              type="button"
              onClick={() => setComingSoonNote(true)}
              aria-label="Coming Soon - AI Workspace not yet publicly available"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] shadow-xs transition-colors"
            >
              Coming Soon
            </button>
            <Link
              href="/ai-assistant"
              className="inline-flex items-center justify-center rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] px-6 py-3.5 text-sm font-semibold text-center text-[var(--lit-navy,#0B2545)] shadow-xs transition-colors"
            >
              Learn More
            </Link>
          </div>
          {comingSoonNote ? (
            <p
              role="status"
              className="mt-6 max-w-md mx-auto text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-md p-4"
            >
              <span className="block text-[var(--lit-navy,#0B2545)] font-semibold mb-1">AI Workspace</span>
              Coming soon - we are preparing the next generation of the Logic Intelligence Technologies AI experience.
            </p>
          ) : null}
        </main>

        <div className="relative z-10 w-full overflow-hidden border-t border-[var(--lit-border-light,#DFE7EF)] bg-white/70 py-3 backdrop-blur-xs">
          <div className="lit-ticker flex w-max">
            <p className="lit-ticker-text whitespace-nowrap text-[11px] sm:text-xs tracking-[0.16em] uppercase text-[var(--lit-text-muted,#52677C)] font-semibold pr-16">{TICKER}</p>
            <p className="lit-ticker-text whitespace-nowrap text-[11px] sm:text-xs tracking-[0.16em] uppercase text-[var(--lit-text-muted,#52677C)] font-semibold pr-16" aria-hidden>{TICKER}</p>
          </div>
        </div>
      </div>
    );
  }

  const iconBtn = "h-9 w-9 grid place-items-center rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] disabled:opacity-40 shrink-0 transition-colors";
  const pillBtn = "inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[10px] font-bold uppercase tracking-[0.16em] hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] disabled:opacity-40 whitespace-nowrap transition-colors";
  const railSessions = sessions.filter((s) => !railQuery || s.title.toLowerCase().includes(railQuery.toLowerCase()) || s.messages.some((m) => m.content.toLowerCase().includes(railQuery.toLowerCase())));

  const renderHistory = (onPick?: () => void) => (
      <>
        <div className="flex items-center justify-between px-1 mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--lit-navy,#0B2545)]">History</p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--lit-text-muted,#52677C)]">{userId ? "Cloud · synced" : "This device"}</p>
          </div>
          <button type="button" onClick={newChat} className="h-8 px-3 rounded-full bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs transition-colors">New</button>
        </div>
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lit-text-muted,#52677C)]" />
          <input value={railQuery} onChange={(e) => setRailQuery(e.target.value)} placeholder="Search threads" className="w-full h-9 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-full pl-9 pr-3 text-xs text-[var(--lit-ink,#121826)] placeholder-[var(--lit-text-muted,#52677C)] outline-none focus:border-[var(--lit-teal,#1FA9A2)] transition-colors" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {railSessions.length === 0 && <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] px-2 py-6 text-center">No conversations yet.</p>}
          {railSessions.map((s) => (
            <div
              key={s.id}
              className={`group flex items-start gap-2 rounded-xl px-2.5 py-2.5 cursor-pointer transition-colors ${s.id === activeId ? "bg-[var(--lit-light-blue,#E7F3FF)] border border-[var(--lit-blue,#1565C0)]/20" : "border border-transparent hover:bg-[var(--lit-cloud,#F7F9FC)]"}`}
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
                  className="flex-1 min-w-0 bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded px-1.5 py-1 text-xs outline-none text-[var(--lit-ink,#121826)]"
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] leading-snug line-clamp-2 ${s.id === activeId ? "font-semibold text-[var(--lit-navy,#0B2545)]" : "text-[var(--lit-ink,#121826)]"}`} onDoubleClick={(e) => { e.stopPropagation(); setRenamingId(s.id); setRenameVal(s.title); }} title="Double-click to rename">{s.title}</p>
                  <p className="text-[10px] text-[var(--lit-text-muted,#52677C)] mt-1 uppercase tracking-wider">{timeAgo(s.updatedAt)}</p>
                </div>
              )}
              <button type="button" className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity" onClick={(e) => { e.stopPropagation(); void deleteChat(s.id); }} aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </>
    );

  return (
    <div className="min-h-[100dvh] text-[var(--lit-ink,#121826)] flex flex-col bg-[var(--lit-cloud,#F7F9FC)]">
      <header className="sticky top-0 z-30 border-b border-[var(--lit-border-light,#DFE7EF)] bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="h-12 sm:h-16 px-2 sm:px-5 flex items-center gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)] sm:gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button type="button" className="lg:hidden h-8 w-8 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] grid place-items-center shrink-0 text-[var(--lit-navy,#0B2545)]" onClick={() => setSidebarOpen(true)} aria-label="Open history"><Menu className="w-4 h-4" /></button>
            <Image src={COMPANY.logoIconPath} alt="Logic Intelligence Technologies" width={28} height={28} className="rounded-full object-cover border border-[var(--lit-border-light,#DFE7EF)] shrink-0 hidden sm:block shadow-xs" />
            <button type="button" onClick={() => setLanded(true)} className="text-left min-w-0 flex-1">
              <div className="text-[11px] sm:text-[13px] font-bold tracking-[0.12em] uppercase leading-none truncate text-[var(--lit-navy,#0B2545)] font-display">LOGIC AI</div>
              <div className="mt-1 text-[9px] sm:text-[10px] text-[var(--lit-text-muted,#52677C)] truncate uppercase tracking-[0.1em]">{sending ? "Thinking" : lastProvider ? `Ready · ${lastProvider}` : "Ready"}<span className="hidden sm:inline">{userEmail ? ` · ${userEmail}` : " · guest"}</span></div>
            </button>
          </div>
          <div className="hidden md:flex justify-self-center items-center rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-0.5">
            <button type="button" onClick={() => setMode("company")} className={`inline-flex items-center justify-center text-center h-8 min-w-[6.5rem] px-4 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] transition-all ${mode === "company" ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs" : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]"}`}>COMPANY</button>
            <button type="button" onClick={() => setMode("general")} className={`inline-flex items-center justify-center text-center h-8 min-w-[6.5rem] px-4 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] transition-all ${mode === "general" ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs" : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]"}`}>GENERAL</button>
          </div>
          <div className="flex items-center justify-end gap-1.5 shrink-0">
            <Link href="/" className="inline-flex items-center justify-center h-9 min-w-[3.25rem] px-3 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[10px] font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] shrink-0 transition-colors">HOME</Link>
            <button type="button" onClick={newChat} className="h-9 min-w-[3.25rem] px-3.5 rounded-full bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-[10px] font-bold uppercase tracking-wider text-white shrink-0 shadow-xs transition-colors">NEW</button>
            <span className="hidden sm:inline-flex"><ThemeToggle /></span>
            {userEmail ? (
              <>
                <Link
                  href="/profile"
                  title={userEmail}
                  className="shrink-0 hidden sm:flex"
                >
                  {userAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[var(--lit-border-light,#DFE7EF)] hover:ring-2 hover:ring-[var(--lit-teal,#1FA9A2)]/50" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-[var(--lit-navy,#0B2545)] text-white text-[11px] font-bold grid place-items-center border border-[var(--lit-border-light,#DFE7EF)] hover:ring-2 hover:ring-[var(--lit-teal,#1FA9A2)]/50">{initials(userEmail)}</span>
                  )}
                </Link>
                <button
                  type="button"
                  aria-label="Sign out"
                  title="Sign out"
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-text-muted,#52677C)] hover:text-red-600 hover:border-red-300 shrink-0 transition-colors"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/");
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            ) : (
              <Link href="/login?next=/ai" className="hidden sm:inline-flex h-9 px-3.5 rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[10px] font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-cloud,#F7F9FC)] items-center justify-center shrink-0 transition-colors">Sign In</Link>
            )}
          </div>
        </div>
        {!online && <div className="bg-amber-100 text-amber-800 text-xs px-4 py-2 flex items-center justify-center gap-2 uppercase tracking-wider border-b border-amber-200"><WifiOff className="w-3.5 h-3.5" /> Offline</div>}
      </header>

      <div className="flex-1 w-full grid lg:grid-cols-[280px_minmax(0,1fr)] min-h-0">
        <aside className="hidden lg:flex flex-col border-r border-[var(--lit-border-light,#DFE7EF)] bg-white py-4 px-3 max-h-[calc(100dvh-4rem)]">
          {renderHistory()}
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.button type="button" className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} />
              <motion.aside className="fixed left-0 top-0 bottom-0 z-50 w-[min(86vw,320px)] bg-white border-r border-[var(--lit-border-light,#DFE7EF)] p-4 flex flex-col lg:hidden shadow-2xl" initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}>
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
                <div className="text-center pt-6 sm:pt-8">
                  <Image src={COMPANY.logoIconPath} alt="Logic AI" width={72} height={72} className="mx-auto mb-4 h-[72px] w-[72px] rounded-full object-cover border border-[var(--lit-border-light,#DFE7EF)] shadow-xs" />
                  <p className="text-base sm:text-xl font-bold font-display tracking-tight text-[var(--lit-navy,#0B2545)] mb-1.5">How can Logic AI help?</p>
                  <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mb-6">Packages, architecture scoping, or engineering advisory.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STARTERS.map((q, i) => (
                      <button key={q} type="button" onClick={() => void send(q)} className="text-left rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-3.5 hover:border-[var(--lit-teal,#1FA9A2)] hover:shadow-xs min-h-[72px] transition-all">
                        <span className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-[var(--lit-light-blue,#E7F3FF)] text-[11px] font-bold text-[var(--lit-blue,#1565C0)]">{String(i + 1).padStart(2, "0")}</span>
                        <span className="block text-[13px] sm:text-sm leading-snug text-[var(--lit-navy,#0B2545)] font-medium">{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {active?.messages.map((m, i) => (
                <div key={m.id} className={`flex gap-2 sm:gap-3 items-end ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <Image src={COMPANY.logoIconPath} alt="Logic AI" width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-[var(--lit-border-light,#DFE7EF)] shrink-0 mb-1 shadow-xs" />
                  )}
                  <div className={`rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-[14px] sm:text-[15px] leading-relaxed min-w-0 ${m.role === "user" ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs max-w-[min(100%,34rem)]" : "bg-white border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-ink,#121826)] shadow-xs w-full"}`}>
                    {m.role === "assistant" ? (
                      m.content ? (
                        <>
                          <MarkdownMessage content={m.content} />
                          <InChatPackageCards text={m.content} />
                          {(m.badge || (m.citations && m.citations.length > 0)) && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {m.badge === "catalog" && <span className="text-[10px] uppercase tracking-wider rounded-full border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 px-2 py-0.5 text-[var(--lit-teal,#1FA9A2)] font-semibold">Prices from catalog</span>}
                              {m.badge === "general" && <span className="text-[10px] uppercase tracking-wider rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-2 py-0.5 text-[var(--lit-text-muted,#52677C)]">General answer</span>}
                              {(m.citations || []).map((c) => <span key={c} className="text-[10px] rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-2 py-0.5 text-[var(--lit-text-muted,#52677C)]">From {c}</span>)}
                            </div>
                          )}
                        </>
                      ) : sending ? (
                        <span className="inline-flex items-center gap-2 text-[var(--lit-text-muted,#52677C)] text-xs"><Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--lit-teal,#1FA9A2)]" /> Thinking</span>
                      ) : null
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                    {m.role === "user" && m.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image} alt="" className="mt-2 max-h-48 w-auto rounded-xl border border-white/20" />
                    )}
                    {m.role === "user" && !m.image && /https?:\/\/\S+\.(png|jpe?g|gif|webp)/i.test(m.content) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.content.match(/https?:\/\/\S+\.(png|jpe?g|gif|webp)/i)?.[0]} alt="" className="mt-2 max-h-48 w-auto rounded-xl" />
                    )}
                    {m.error && <button type="button" className="mt-2 text-xs inline-flex items-center gap-1 text-red-600 hover:text-red-800" onClick={() => void send(lastUser?.content)}><RefreshCw className="w-3 h-3" /> Retry</button>}
                    {m.role === "assistant" && m.content && !m.error && (
                      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[var(--lit-text-muted,#52677C)] border-t border-[var(--lit-border-light,#DFE7EF)]/60 pt-2.5">
                        <button type="button" className="inline-flex items-center gap-1 hover:text-[var(--lit-navy,#0B2545)] transition-colors" onClick={async () => { await navigator.clipboard.writeText(m.content); setCopiedId(m.id); }}>{copiedId === m.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />} Copy</button>
                        <button type="button" className="inline-flex items-center gap-1 hover:text-[var(--lit-navy,#0B2545)] transition-colors" onClick={() => speak(m.content)}><Volume2 className="w-3 h-3" /> {speaking ? "Stop" : "Listen"}</button>
                        <button type="button" className="inline-flex items-center gap-1 hover:text-[var(--lit-navy,#0B2545)] transition-colors" onClick={() => setInput(`Regarding this:\n"""${m.content.slice(0, 600)}"""\n\n`)}><Quote className="w-3 h-3" /> Ask about this</button>
                        {i === (active.messages.length - 1) && (
                          <>
                            <button type="button" className="hover:text-[var(--lit-navy,#0B2545)] transition-colors" onClick={() => void send(lastUser?.content || m.content, { suffix: "Rewrite shorter. Keep facts." })}>Shorter</button>
                            <button type="button" className="hover:text-[var(--lit-navy,#0B2545)] transition-colors" onClick={() => void send(lastUser?.content || m.content, { suffix: "Rewrite more technical. Keep facts." })}>More technical</button>
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
                    <button key={q} type="button" onClick={() => void send(q)} className="text-[11px] rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:border-[var(--lit-teal,#1FA9A2)] text-[var(--lit-navy,#0B2545)] px-3 py-1.5 shadow-xs transition-colors">{q}</button>
                  ))}
                  <button type="button" onClick={() => void openTicket()} className="text-[11px] rounded-full border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:border-[var(--lit-teal,#1FA9A2)] text-[var(--lit-navy,#0B2545)] px-3 py-1.5 shadow-xs transition-colors">{ticketOk ? "Ticket sent" : "Talk to a human"}</button>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-[var(--lit-border-light,#DFE7EF)] bg-white/95 backdrop-blur-xl shadow-lg">
            <div className="w-full max-w-[48rem] mx-auto px-3 sm:px-6 pt-2 sm:pt-3" style={{ paddingBottom: `max(0.75rem, calc(env(safe-area-inset-bottom) + ${kbPad}px))` }}>
              {showLead && !leadOk && (
                <form onSubmit={(e) => { e.preventDefault(); void submitLead(); }} className="mb-3 flex flex-col sm:flex-row gap-2 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] px-3 py-2 shadow-xs">
                  <p className="sm:sr-only text-[11px] text-[var(--lit-text-muted,#52677C)]">Optional follow-up.</p>
                  <input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Name" className="flex-1 bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-lg px-3 py-2 text-sm text-[var(--lit-ink,#121826)] outline-none focus:border-[var(--lit-teal,#1FA9A2)]" />
                  <input value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="Email" type="email" className="flex-1 bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-lg px-3 py-2 text-sm text-[var(--lit-ink,#121826)] outline-none focus:border-[var(--lit-teal,#1FA9A2)]" />
                  <button type="submit" disabled={leadBusy} className="h-10 px-4 rounded-full bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-[11px] font-bold uppercase tracking-wider text-white disabled:opacity-50 shadow-xs transition-colors">{leadBusy ? "Saving" : "Send"}</button>
                  <button type="button" onClick={() => setShowLead(false)} className="h-10 px-3 text-[11px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]">Not now</button>
                </form>
              )}
              {leadOk && showLead === false && (active?.messages.length ?? 0) > 0 && (
                <p className="mb-2 text-[11px] text-[var(--lit-text-muted,#52677C)]">Details received. We follow up within 24 hours.</p>
              )}
              {showDemo && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-[var(--lit-teal,#1FA9A2)]/30 bg-[var(--lit-teal,#1FA9A2)]/10 px-3.5 py-2 text-xs text-[var(--lit-navy,#0B2545)]">
                  <span>Ready for a scoped demo? We do not invent prices on a call.</span>
                  <Link href="/free-demo" className="shrink-0 rounded-full bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 px-3 py-1.5 font-bold text-white uppercase tracking-wider text-[10px] shadow-xs transition-colors">Book demo</Link>
                </div>
              )}
              {attachError && <p className="mb-2 text-[11px] text-red-500 font-medium">{attachError}</p>}
              <form
                onSubmit={onSubmit}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); void onPickFile(e.dataTransfer.files?.[0]); }}
                className={`rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)] p-1.5 focus-within:border-[var(--lit-teal,#1FA9A2)] focus-within:bg-white shadow-xs transition-all ${dragging ? "ring-2 ring-[var(--lit-teal,#1FA9A2)]" : ""}`}
              >
                <input ref={fileRef} type="file" accept=".txt,.md,.pdf,image/png,image/jpeg,image/webp,image/gif,text/plain,text/markdown,application/pdf" className="hidden" onChange={(e) => void onPickFile(e.target.files?.[0])} />
                {dragging && <p className="text-center text-[10px] uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)] pb-1 font-semibold">Drop a PDF or image here</p>}
                {attach && (
                  <div className="mb-1.5 flex items-center gap-2 border border-[var(--lit-border-light,#DFE7EF)] bg-white rounded-lg px-2 py-1 shadow-2xs">
                    {attach.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={attach.data} alt="" className="h-8 w-8 rounded-md object-cover border border-[var(--lit-border-light,#DFE7EF)]" />
                    ) : (
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] text-[9px] font-bold">PDF</span>
                    )}
                    <span className="flex-1 min-w-0 truncate text-[11px] text-[var(--lit-ink,#121826)] font-medium">{attach.name}</span>
                    <button type="button" className="h-8 px-2 text-[10px] uppercase tracking-wider text-[var(--lit-text-muted,#52677C)] hover:text-red-500" onClick={() => setAttach(null)}>Remove</button>
                  </div>
                )}
                {listening && (
                  <div className="mb-1 flex items-center gap-2 px-1 text-[10px] uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)] font-semibold">
                    <span className="lit-wave" aria-hidden><span /><span /><span /><span /><span /></span>
                    Listening
                  </div>
                )}
                <div className="flex items-center gap-1 min-w-0">
                  <button type="button" className="h-9 w-9 shrink-0 grid place-items-center text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] transition-colors" onClick={() => fileRef.current?.click()} aria-label="Attach"><Paperclip className="w-4 h-4" /></button>
                  <button type="button" className={`h-9 w-9 shrink-0 grid place-items-center transition-colors ${listening ? "text-[var(--lit-teal,#1FA9A2)]" : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)]"}`} onClick={toggleMic} aria-label="Voice"><Mic className="w-4 h-4" /></button>
                  <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} rows={1} placeholder={listening ? "Listening…" : "Message Logic AI"} className="flex-1 bg-transparent resize-none text-[14px] text-[var(--lit-ink,#121826)] placeholder-[var(--lit-text-muted,#52677C)] px-2 py-1.5 outline-none max-h-24 min-h-[36px] min-w-0 leading-5" />
                  <a href={waTranscript(active?.messages || [])} target="_blank" rel="noopener noreferrer" className="h-9 px-2.5 shrink-0 rounded-[10px] border border-[var(--lit-border-light,#DFE7EF)] bg-white grid place-items-center text-[10px] font-bold uppercase tracking-wider text-[#25D366] hover:bg-[#25D366]/10 transition-colors" aria-label="WhatsApp with transcript">WA</a>
                  {sending ? (
                    <button type="button" onClick={() => abortRef.current?.abort()} className="rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 font-bold text-xs uppercase tracking-wider transition-colors" aria-label="Stop">STOP</button>
                  ) : (
                    <button type="submit" disabled={!input.trim() && !attach} className="rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white px-3.5 py-2 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-40" aria-label="Send">SEND <ArrowUp className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </form>
              <p className="mt-1.5 text-center text-[10px] text-[var(--lit-text-muted,#52677C)] tracking-wide">/price · /demo · /wa — last 6 turns go to WhatsApp</p>
              <div className="sm:hidden mt-2 flex items-stretch gap-2 w-full">
                <button type="button" className={`flex-1 h-9 rounded-full text-[10px] font-bold uppercase tracking-wider text-center transition-colors ${mode === "company" ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs" : "border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)]"}`} onClick={() => setMode("company")}>COMPANY</button>
                <button type="button" className={`flex-1 h-9 rounded-full text-[10px] font-bold uppercase tracking-wider text-center transition-colors ${mode === "general" ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-xs" : "border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)]"}`} onClick={() => setMode("general")}>GENERAL</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
