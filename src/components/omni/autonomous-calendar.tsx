"use client";

/**
 * Agent 1 — Autonomous Content Calendar (month view)
 * Next.js + Tailwind. Drag-and-drop queued posts; 8-channel toggles.
 */

import { useCallback, useMemo, useState } from "react";

export type OmniChannel =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "x"
  | "telegram"
  | "threads"
  | "discord"
  | "website";

export interface CalendarPost {
  id: string;
  title: string;
  status: "queued" | "published" | "manual" | "failed";
  executeAt: string; // ISO
  channels: OmniChannel[];
}

const CHANNELS: { id: OmniChannel; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "telegram", label: "Telegram" },
  { id: "threads", label: "Threads" },
  { id: "discord", label: "Discord" },
  { id: "website", label: "Website CMS" },
];

const STATUS_STYLES: Record<CalendarPost["status"], string> = {
  queued: "border-cyan-500/40 bg-cyan-500/10 text-cyan-100",
  published: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  manual: "border-violet-500/40 bg-violet-500/10 text-violet-100",
  failed: "border-rose-500/40 bg-rose-500/10 text-rose-100",
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface Props {
  initialPosts?: CalendarPost[];
  onReschedule?: (postId: string, isoDate: string) => void;
  onToggleChannel?: (channel: OmniChannel, enabled: boolean) => void;
  enabledChannels?: OmniChannel[];
}

export default function AutonomousCalendar({
  initialPosts = [],
  onReschedule,
  onToggleChannel,
  enabledChannels = CHANNELS.map((c) => c.id),
}: Props) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [posts, setPosts] = useState<CalendarPost[]>(initialPosts);
  const [dragId, setDragId] = useState<string | null>(null);
  const [activeChannels, setActiveChannels] = useState<Set<OmniChannel>>(
    () => new Set(enabledChannels)
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = startOfMonth(cursor).getDay();
  const totalDays = daysInMonth(cursor);

  const postsByDay = useMemo(() => {
    const map = new Map<number, CalendarPost[]>();
    for (const p of posts) {
      const d = new Date(p.executeAt);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const day = d.getDate();
      const arr = map.get(day) ?? [];
      arr.push(p);
      map.set(day, arr);
    }
    return map;
  }, [posts, year, month]);

  const cells = useMemo(() => {
    const out: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) out.push(null);
    for (let d = 1; d <= totalDays; d++) out.push(d);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [firstDow, totalDays]);

  const toggleChannel = useCallback(
    (ch: OmniChannel) => {
      setActiveChannels((prev) => {
        const next = new Set(prev);
        if (next.has(ch)) next.delete(ch);
        else next.add(ch);
        onToggleChannel?.(ch, next.has(ch));
        return next;
      });
    },
    [onToggleChannel]
  );

  const onDropDay = (day: number) => {
    if (!dragId) return;
    const iso = `${year}-${pad(month + 1)}-${pad(day)}T10:00:00.000Z`;
    setPosts((prev) =>
      prev.map((p) => (p.id === dragId ? { ...p, executeAt: iso, status: "queued" } : p))
    );
    onReschedule?.(dragId, iso);
    setDragId(null);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0A0F1E] text-white shadow-xl">
      {/* Channel toggles */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 p-4">
        {CHANNELS.map((ch) => {
          const on = activeChannels.has(ch.id);
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => toggleChannel(ch.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                on
                  ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/40"
                  : "bg-white/5 text-zinc-400 border border-white/10"
              }`}
            >
              {ch.label}
            </button>
          );
        })}
      </div>

      {/* Month header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 cursor-pointer"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          ←
        </button>
        <h2 className="text-lg font-bold tracking-tight">
          {cursor.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 cursor-pointer"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/10 border-t border-white/10">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-[#0A0F1E] px-2 py-2 text-center text-[11px] font-bold uppercase text-zinc-500">
            {d}
          </div>
        ))}
        {cells.map((day, idx) => (
          <div
            key={idx}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => day && onDropDay(day)}
            className="min-h-[100px] bg-[#0B1220] p-1.5 align-top"
          >
            {day && (
              <>
                <div className="mb-1 text-[11px] font-semibold text-zinc-500">{day}</div>
                <div className="flex flex-col gap-1">
                  {(postsByDay.get(day) ?? []).map((p) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={() => setDragId(p.id)}
                      className={`cursor-grab rounded-md border px-1.5 py-1 text-[10px] leading-tight ${STATUS_STYLES[p.status]}`}
                      title={p.channels.join(", ")}
                    >
                      <div className="font-semibold truncate">{p.title}</div>
                      <div className="opacity-70 truncate">
                        {p.channels.length} ch · {p.status}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
