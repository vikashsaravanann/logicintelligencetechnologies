"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  CheckCheck,
  AlertCircle,
  FileText,
  Receipt,
  GitBranch,
  MessageSquare,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface NotificationItem {
  id: string;
  clientEmail: string;
  engagementRef?: string | null;
  title: string;
  message: string;
  category: "action_required" | "milestone" | "document" | "payment" | "system" | "message";
  actionUrl?: string | null;
  actionLabel?: string | null;
  readAt?: string | null;
  createdAt: string;
  formattedDate: string;
}

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/client/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch("/api/client/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      const res = await fetch("/api/client/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      if (res.ok) {
        const now = new Date().toISOString();
        setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || now })));
        setUnreadCount(0);
        setFeedback("All notifications marked as read.");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error("Mark all read error:", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.readAt;
    if (activeFilter === "action_required") return n.category === "action_required";
    if (activeFilter === "milestone") return n.category === "milestone";
    if (activeFilter === "payment") return n.category === "payment";
    if (activeFilter === "document") return n.category === "document";
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "action_required":
        return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
      case "milestone":
        return <GitBranch className="w-4 h-4 text-indigo-500 shrink-0" />;
      case "document":
        return <FileText className="w-4 h-4 text-cyan-600 shrink-0" />;
      case "payment":
        return <Receipt className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 font-mono">
              Real-Time Feed
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 font-mono">
                {unreadCount} unread
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Authoritative timeline updates, required approvals, and delivery milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>{isMarkingAll ? "Updating..." : "Mark All as Read"}</span>
            </button>
          )}
          <Link
            href="/client/actions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>View Tasks &amp; Approvals</span>
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--lit-border-light,#DFE7EF)] text-xs font-semibold">
        {[
          { key: "all", label: "All Updates" },
          { key: "unread", label: "Unread" },
          { key: "action_required", label: "Action Required" },
          { key: "milestone", label: "Milestones" },
          { key: "payment", label: "Billing & Receipts" },
          { key: "document", label: "Documents" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeFilter === tab.key
                ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
                : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[var(--lit-text-muted,#52677C)]">
          <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-3" />
          <span>Synchronizing notifications...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-12 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-center mx-auto text-slate-400">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
            No notifications in this view
          </h3>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-sm mx-auto">
            You are completely up to date. Relevant stage transitions, verified invoices, and action requests will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isUnread = !notif.readAt;
            return (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isUnread
                    ? "bg-white border-teal-200/80 shadow-xs"
                    : "bg-white/70 border-[var(--lit-border-light,#DFE7EF)]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      {getCategoryIcon(notif.category)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
                        )}
                        {notif.engagementRef && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {notif.engagementRef}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--lit-ink,#121826)] leading-relaxed max-w-2xl">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-[var(--lit-text-muted,#52677C)]">
                        <Clock className="w-3 h-3" />
                        <span>{notif.formattedDate || new Date(notif.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--lit-cloud,#F7F9FC)] hover:bg-slate-100 border border-[var(--lit-border-light,#DFE7EF)] text-[var(--lit-navy,#0B2545)] text-xs font-semibold transition-colors"
                      >
                        <span>{notif.actionLabel || "View"}</span>
                        <ExternalLink className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
                      </Link>
                    )}
                    {isUnread && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-text-muted,#52677C)] hover:text-teal-600 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
