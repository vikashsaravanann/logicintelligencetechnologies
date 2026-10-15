"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  ShieldCheck,
  UserCheck,
  FileCheck,
  ArrowRight,
  Filter,
} from "lucide-react";

interface ActionItem {
  id: string;
  engagementRef: string;
  clientEmail: string;
  title: string;
  description?: string | null;
  category: "decision" | "approval" | "review" | "submission" | "meeting" | "payment";
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_review" | "completed" | "cancelled";
  dueAt?: string | null;
  assignedTo: "client" | "lit_team";
  actionUrl?: string | null;
  completedAt?: string | null;
  completedBy?: string | null;
  createdAt: string;
}

export default function ClientActionsPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [activeTab, setActiveTab] = useState<"client" | "lit" | "completed">("client");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchActions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/client/actions");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setActionItems(data.actionItems || []);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch action items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleComplete = async (id: string) => {
    if (updatingId) return;
    setUpdatingId(id);
    try {
      const res = await fetch("/api/client/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: id, status: "completed" }),
      });
      if (res.ok) {
        setActionItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: "completed", completedAt: new Date().toISOString() }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Failed to complete action item:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingClientItems = actionItems.filter(
    (a) => a.assignedTo === "client" && a.status !== "completed" && a.status !== "cancelled"
  );
  const awaitingLITItems = actionItems.filter(
    (a) => a.assignedTo === "lit_team" && a.status !== "completed" && a.status !== "cancelled"
  );
  const completedItems = actionItems.filter((a) => a.status === "completed");

  const currentList =
    activeTab === "client"
      ? pendingClientItems
      : activeTab === "lit"
      ? awaitingLITItems
      : completedItems;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-50 text-red-700 border border-red-200">
            Critical Priority
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
            High Priority
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            Standard
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-50 text-slate-600 border border-slate-200">
            Routine
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lit-border-light,#DFE7EF)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--lit-teal,#1FA9A2)] border border-teal-200 font-mono">
              Action Registry
            </span>
            {pendingClientItems.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 font-mono">
                {pendingClientItems.length} awaiting your action
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
            Approvals &amp; Tasks
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mt-1">
            Centralized decision inbox, document sign-offs, and technical milestone sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/engagement"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] text-xs font-semibold shadow-2xs transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5 text-teal-600" />
            <span>Visit 13-Stage Timeline</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[var(--lit-border-light,#DFE7EF)] pb-3">
        <button
          onClick={() => setActiveTab("client")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "client"
              ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
              : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-white"
          }`}
        >
          <span>Requires My Decision</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "client" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {pendingClientItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("lit")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "lit"
              ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
              : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-white"
          }`}
        >
          <span>Awaiting LIT Team</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "lit" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {awaitingLITItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "completed"
              ? "bg-[var(--lit-navy,#0B2545)] text-white shadow-2xs"
              : "text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] hover:bg-white"
          }`}
        >
          <span>Completed</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeTab === "completed" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {completedItems.length}
          </span>
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[var(--lit-text-muted,#52677C)]">
          <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-3" />
          <span>Synchronizing tasks and approvals...</span>
        </div>
      ) : currentList.length === 0 ? (
        <div className="p-12 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-center mx-auto text-slate-400">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
            {activeTab === "client"
              ? "No pending approvals requiring your decision"
              : activeTab === "lit"
              ? "No pending items currently with the LIT squad"
              : "No completed action items recorded yet"}
          </h3>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-sm mx-auto">
            {activeTab === "client"
              ? "All active stage prerequisites, SOW executions, and review requests have been addressed."
              : "As deliverables advance, verified sign-offs and checklist items will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-2xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getPriorityBadge(item.priority)}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Ref: {item.engagementRef}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--lit-text-muted,#52677C)]">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--lit-navy,#0B2545)] font-poppins">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-[var(--lit-text-muted,#52677C)] max-w-2xl leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.dueAt && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Due: {new Date(item.dueAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                  {item.actionUrl && (
                    <Link
                      href={item.actionUrl}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-navy,#0B2545)]/90 text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <span>Review &amp; Act</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
                    </Link>
                  )}
                  {activeTab === "client" && (
                    <button
                      onClick={() => handleComplete(item.id)}
                      disabled={updatingId === item.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-navy,#0B2545)] text-xs font-semibold transition-colors disabled:opacity-50"
                      title="Mark as completed"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{updatingId === item.id ? "Saving..." : "Mark Done"}</span>
                    </button>
                  )}
                  {item.status === "completed" && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
