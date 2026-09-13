"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AutonomousCalendar, {
  type CalendarPost,
  type OmniChannel,
} from "@/components/omni/autonomous-calendar";

const ALL_CHANNELS: OmniChannel[] = [
  "instagram",
  "facebook",
  "linkedin",
  "x",
  "telegram",
  "threads",
  "discord",
  "website",
];

export default function OmniPublisherPage() {
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [rootText, setRootText] = useState("");
  const [title, setTitle] = useState("");
  const [channels, setChannels] = useState<OmniChannel[]>(["website", "telegram", "discord"]);
  const [executeAt, setExecuteAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/omni/posts");
    const data = await res.json();
    if (!data.success) return;
    const mapped: CalendarPost[] = (data.posts || []).map(
      (p: {
        id: string;
        title: string | null;
        root_text: string;
        status: string;
        execute_at: string | null;
        channels: string[];
      }) => ({
        id: p.id,
        title: p.title || p.root_text.slice(0, 48) || "Untitled",
        status:
          p.status === "published"
            ? "published"
            : p.status === "failed"
              ? "failed"
              : p.status === "draft"
                ? "manual"
                : "queued",
        executeAt: p.execute_at || new Date().toISOString(),
        channels: (p.channels || []) as OmniChannel[],
      })
    );
    setPosts(mapped);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (ch: OmniChannel) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/omni/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          root_text: rootText,
          title: title || undefined,
          channels,
          execute_at: executeAt || undefined,
          schedule_mode: "manual",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage(data.message || "Failed");
      } else {
        setMessage(`Queued ${data.jobs_enqueued} channel job(s)`);
        setRootText("");
        await load();
      }
    } catch {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Omni Publisher
            </p>
            <h1 className="text-2xl md:text-3xl font-black">
              Autonomous multi-channel calendar
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              One post → Website, Telegram, Discord, X, Meta, LinkedIn (MCP-backed workers).
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-[#0A0F1E] p-5 space-y-4">
            <h2 className="font-bold text-lg">Compose</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (website)"
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-cyan-500/50"
            />
            <textarea
              value={rootText}
              onChange={(e) => setRootText(e.target.value)}
              placeholder="Root message — reformatted per channel"
              rows={6}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-cyan-500/50 resize-y"
            />
            <input
              type="datetime-local"
              value={executeAt}
              onChange={(e) => setExecuteAt(e.target.value)}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none"
            />
            <div className="flex flex-wrap gap-2">
              {ALL_CHANNELS.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggle(ch)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold border cursor-pointer ${
                    channels.includes(ch)
                      ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-100"
                      : "border-white/10 bg-white/5 text-zinc-400"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={loading || !rootText.trim() || channels.length === 0}
              onClick={submit}
              className="w-full rounded-xl bg-cyan-500 text-black font-bold py-2.5 text-sm disabled:opacity-40 cursor-pointer"
            >
              {loading ? "Queueing…" : "Queue to channels"}
            </button>
            {message && <p className="text-sm text-zinc-300">{message}</p>}
          </div>

          <div className="lg:col-span-2">
            <AutonomousCalendar initialPosts={posts} />
          </div>
        </div>
      </div>
    </div>
  );
}
