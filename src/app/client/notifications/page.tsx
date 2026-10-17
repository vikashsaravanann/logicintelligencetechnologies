"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Sliders,
  X,
  Mail,
  ShieldCheck,
  Loader2,
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

interface NotificationPreferences {
  emailCriticalAlerts: boolean;
  emailStageMilestones: boolean;
  emailMessages: boolean;
  emailWeeklyDigest: boolean;
  updatedAt?: string;
}

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Preferences modal state
  const [isPrefsOpen, setIsPrefsOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    emailCriticalAlerts: true,
    emailStageMilestones: true,
    emailMessages: true,
    emailWeeklyDigest: false,
  });
  const [isLoadingPrefs, setIsLoadingPrefs] = useState<boolean>(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState<boolean>(false);
  const [prefsSuccess, setPrefsSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isPrefsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPrefsOpen]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const ref = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") : null;
      const url = ref ? `/api/client/notifications?ref=${encodeURIComponent(ref)}` : "/api/client/notifications";
      const res = await fetch(url);
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

  const fetchPreferences = async () => {
    try {
      setIsLoadingPrefs(true);
      const res = await fetch("/api/client/notification-preferences");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.preferences) {
          setPrefs({
            emailCriticalAlerts: data.preferences.emailCriticalAlerts,
            emailStageMilestones: data.preferences.emailStageMilestones,
            emailMessages: data.preferences.emailMessages,
            emailWeeklyDigest: data.preferences.emailWeeklyDigest,
            updatedAt: data.preferences.updatedAt,
          });
        }
      }
    } catch (err) {
      console.warn("Failed to fetch notification preferences:", err);
    } finally {
      setIsLoadingPrefs(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSavingPrefs(true);
      setPrefsSuccess(null);
      const res = await fetch("/api/client/notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPrefsSuccess("Preferences successfully updated.");
          setTimeout(() => setPrefsSuccess(null), 3000);
        }
      }
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleOpenPrefs = () => {
    setIsPrefsOpen(true);
    fetchPreferences();
  };

  const handleMarkRead = async (id: string) => {
    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      const res = await fetch("/api/client/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", notificationId: id }),
      });
      if (!res.ok) {
        // Rollback on server error
        setNotifications(prevNotifications);
        setUnreadCount(prevUnreadCount);
      }
    } catch (err) {
      console.error("Mark read error:", err);
      // Rollback on network failure
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);

    const prevNotifications = [...notifications];
    const prevUnreadCount = unreadCount;
    const now = new Date().toISOString();

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || now })));
    setUnreadCount(0);

    try {
      const res = await fetch("/api/client/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      if (res.ok) {
        setFeedback("All notifications marked as read.");
        setTimeout(() => setFeedback(null), 3000);
      } else {
        // Rollback on server error
        setNotifications(prevNotifications);
        setUnreadCount(prevUnreadCount);
      }
    } catch (err) {
      console.error("Mark all read error:", err);
      // Rollback on network failure
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
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

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleOpenPrefs}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] text-xs font-semibold shadow-2xs transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--lit-teal,#1FA9A2)]" />
            <span>Preferences</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>{isMarkingAll ? "Updating..." : "Mark All Read"}</span>
            </button>
          )}
          <Link
            href="/client/actions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>Tasks &amp; Approvals</span>
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

      {/* Preferences Slide-over / Modal */}
      {isPrefsOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setIsPrefsOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[90vh] text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Decorative Banner */}
            <div className="relative bg-gradient-to-r from-[#0B2545] via-[#123663] to-[#1565C0] px-6 py-5 sm:px-7 sm:py-6 text-white shrink-0">
              <button
                type="button"
                onClick={() => setIsPrefsOpen(false)}
                disabled={isSavingPrefs}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Communications Governance
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  Client Alert Dispatch
                </span>
              </div>

              <h3 className="text-xl font-bold font-poppins text-white tracking-tight">
                Notification Preferences
              </h3>
              <p className="text-xs text-slate-200/90 mt-1 leading-relaxed">
                Control verified email delivery channels for milestone advances, critical blocker alerts, and team communications.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-4 overflow-y-auto flex-1">
              {isLoadingPrefs ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2.5 text-[#1565C0]" />
                  Loading your workspace notification settings...
                </div>
              ) : (
                <>
                  {prefsSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{prefsSuccess}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Item 1: Critical Alerts */}
                    <label className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 to-[#F0F7FF] hover:border-slate-300 transition-all cursor-pointer">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0B2545]">
                            Critical Actions &amp; Blocker Alerts
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                            High Priority
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Immediate email notifications when client approval or signatory action is required to avoid project hold.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefs.emailCriticalAlerts}
                        onChange={(e) =>
                          setPrefs((prev) => ({ ...prev, emailCriticalAlerts: e.target.checked }))
                        }
                        className="w-4 h-4 mt-1 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0] cursor-pointer shrink-0"
                      />
                    </label>

                    {/* Item 2: Stage Milestones */}
                    <label className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 to-[#F0F7FF] hover:border-slate-300 transition-all cursor-pointer">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0B2545]">
                            Lifecycle &amp; Milestone Advances
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            Automated
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Receive verification emails when engagement stages complete, test runs finish, or deliverables are deployed.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefs.emailStageMilestones}
                        onChange={(e) =>
                          setPrefs((prev) => ({ ...prev, emailStageMilestones: e.target.checked }))
                        }
                        className="w-4 h-4 mt-1 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0] cursor-pointer shrink-0"
                      />
                    </label>

                    {/* Item 3: Messages */}
                    <label className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 to-[#F0F7FF] hover:border-slate-300 transition-all cursor-pointer">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#0B2545] block">
                          Team Messages &amp; Clarifications
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Direct replies from LIT lead engineers and project directors on active threads and revision requests.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefs.emailMessages}
                        onChange={(e) =>
                          setPrefs((prev) => ({ ...prev, emailMessages: e.target.checked }))
                        }
                        className="w-4 h-4 mt-1 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0] cursor-pointer shrink-0"
                      />
                    </label>

                    {/* Item 4: Weekly Digest */}
                    <label className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 to-[#F0F7FF] hover:border-slate-300 transition-all cursor-pointer">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#0B2545] block">
                          Weekly Workspace Digest
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Every Monday 09:00 IST executive summary of project momentum, milestone targets, and velocity.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefs.emailWeeklyDigest}
                        onChange={(e) =>
                          setPrefs((prev) => ({ ...prev, emailWeeklyDigest: e.target.checked }))
                        }
                        className="w-4 h-4 mt-1 text-[#1565C0] rounded border-slate-300 focus:ring-[#1565C0] cursor-pointer shrink-0"
                      />
                    </label>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1565C0] shrink-0" />
                    <span>Statutory legal contracts, GST tax invoices, and payment receipts are always delivered immediately.</span>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70">
              <button
                type="button"
                onClick={() => setIsPrefsOpen(false)}
                disabled={isSavingPrefs}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={isSavingPrefs || isLoadingPrefs}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0B2545] to-[#1565C0] hover:from-[#123663] hover:to-[#1976D2] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSavingPrefs && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSavingPrefs ? "Saving Settings..." : "Save Preferences"}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
