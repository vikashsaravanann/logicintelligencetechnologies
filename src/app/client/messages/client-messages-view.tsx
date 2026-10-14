"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Headphones,
  User,
  AlertCircle,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import type { ClientChatMessage } from "@/lib/client-portal/messages";

interface Props {
  userEmail: string;
  initialMessages?: ClientChatMessage[];
}

const PROMPT_SUGGESTIONS = [
  "What is the current status of Milestone M2?",
  "Can we schedule an architecture review call?",
  "When is the next staging preview deployment?",
  "Where can I review the database migration plan?",
];

export default function ClientMessagesView({ userEmail, initialMessages = [] }: Props) {
  const [messages, setMessages] = useState<ClientChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const refreshMessages = async () => {
    setIsRefreshing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/client/messages");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.warn("Failed to refresh client messages:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isSending) return;

    setIsSending(true);
    setErrorMsg(null);
    setFeedback(null);

    try {
      const res = await fetch("/api/client/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: text,
          senderName: userEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to deliver message to engineering dispatch");
      }

      setMessages((prev) => [...prev, data.message]);
      setInput("");
      setFeedback("Message dispatched to engineering lead.");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error("Message send error:", err);
      setErrorMsg(err.message || "Failed to send message. Please retry.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Architect Presence & SLA Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 flex items-center justify-center font-bold text-sm">
                LIT
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                  Dedicated Solutions Lead
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Engineering Desk
                </span>
              </div>
              <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
                Principal Architect &amp; Solutions Engineering Squad
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-[11px] font-mono uppercase text-[var(--lit-text-muted,#52677C)] block">
              Response SLA
            </span>
            <span className="text-xs font-bold text-[var(--lit-navy,#0B2545)] font-mono">
              Next Business Day
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-[var(--lit-text-muted,#52677C)] block">
              Channel Security
            </span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS 1.3 / E2E Logged</span>
            </span>
          </div>
          <Link
            href="/book-consultation"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white font-semibold text-xs shadow-2xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-300" />
            <span>Book Call</span>
          </Link>
        </div>
      </div>

      {/* Main Chat Thread Card */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Chat Thread Header */}
        <div className="p-4 sm:px-6 border-b border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] font-mono">
              Engineering Stream
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refreshMessages}
              disabled={isRefreshing}
              className="text-xs text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] flex items-center gap-1 font-mono transition-colors"
              title="Refresh messages"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-teal-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <span className="text-[11px] text-[var(--lit-text-muted,#52677C)] font-mono">
              Asynchronous Channel
            </span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--lit-text-muted,#52677C)] space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-semibold text-[var(--lit-navy,#0B2545)]">
                No messages yet in this channel
              </p>
              <p className="text-[11px] max-w-sm">
                Leave a question or note below to begin the conversation with your engineering lead.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isTeam = m.sender === "team" || m.sender === "system";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isTeam ? "" : "flex-row-reverse"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isTeam
                        ? "bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200"
                        : "bg-slate-100 text-[var(--lit-navy,#0B2545)] border border-slate-300"
                    }`}
                  >
                    {isTeam ? "LIT" : <User className="w-4 h-4 text-[var(--lit-navy,#0B2545)]" />}
                  </div>

                  <div
                    className={`max-w-lg space-y-1 ${
                      isTeam ? "items-start" : "items-end text-right"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-[var(--lit-text-muted,#52677C)]">
                      <span className="font-bold text-[var(--lit-navy,#0B2545)]">
                        {m.senderName}
                      </span>
                      {m.role && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                          {m.role}
                        </span>
                      )}
                      <span className="text-[10px] font-mono">{m.timestamp}</span>
                      {m.status && !isTeam && (
                        <span className="text-[9px] font-mono text-emerald-600 uppercase">
                          ✓ {m.status}
                        </span>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed text-left ${
                        isTeam
                          ? "bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-ink,#121826)] shadow-2xs"
                          : "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Prompt Suggestions Bar */}
        <div className="px-5 py-2.5 border-t border-[var(--lit-border-light,#DFE7EF)] bg-[var(--lit-cloud,#F7F9FC)]/40 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono font-bold text-[var(--lit-text-muted,#52677C)] shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            <span>Quick Prompts:</span>
          </span>
          {PROMPT_SUGGESTIONS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              disabled={isSending}
              className="px-2.5 py-1 rounded-lg bg-white border border-[var(--lit-border-light,#DFE7EF)] hover:border-teal-300 text-[11px] text-[var(--lit-navy,#0B2545)] whitespace-nowrap transition-colors shadow-2xs disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input & Dispatch Strip */}
        <div className="p-4 border-t border-[var(--lit-border-light,#DFE7EF)] bg-white space-y-2">
          {feedback && (
            <p className="text-[11px] text-teal-700 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>{feedback}</span>
            </p>
          )}

          {errorMsg && (
            <p className="text-[11px] text-red-600 font-mono flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span>{errorMsg}</span>
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or architectural question for the solutions engineer..."
              className="flex-1 bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)] focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 disabled:opacity-50 text-white font-semibold text-xs tracking-wide shadow-2xs transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-cyan-300" />
              <span>{isSending ? "Sending..." : "Send"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* SLA & Support Escalation Notice */}
      <div className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
              Need Formal Ticket Escalation or Severity-1 Support?
            </h4>
          </div>
          <p className="text-[var(--lit-text-muted,#52677C)]">
            For production regressions, formal change requests, or contractual SLA tracking, please open an issue in the Support Desk.
          </p>
        </div>
        <Link
          href="/client/support"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--lit-teal,#1FA9A2)] hover:text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors shrink-0"
        >
          <span>Open Support Desk</span>
        </Link>
      </div>
    </div>
  );
}
