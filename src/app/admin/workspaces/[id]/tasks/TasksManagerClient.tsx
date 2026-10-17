"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Loader2,
  ArrowRight,
  MoreVertical,
  Check,
} from "lucide-react";
import { StaffTaskDTO } from "@/lib/workspaces/types";

interface Props {
  workspaceId: string;
  initialTasks: StaffTaskDTO[];
}

export default function TasksManagerClient({ workspaceId, initialTasks }: Props) {
  const [tasks, setTasks] = useState<StaffTaskDTO[]>(initialTasks);
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // New task form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (stateFilter !== "all" && t.state !== stateFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/workspaces/${workspaceId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          priority: newPriority,
          dueAt: newDueDate ? new Date(newDueDate).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.task) {
        throw new Error(data.error || "Failed to create task");
      }

      setTasks((prev) => [
        {
          id: data.task.id,
          title: data.task.title,
          description: data.task.description_safe,
          priority: data.task.priority,
          state: data.task.state,
          dueAt: data.task.due_at,
          projectId: data.task.project_id,
        },
        ...prev,
      ]);

      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
      setNewDueDate("");
      setShowAddModal(false);
    } catch (err: any) {
      setError(err?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskState = async (
    taskId: string,
    newState: "todo" | "in_progress" | "review" | "completed" | "blocked"
  ) => {
    setUpdatingTaskId(taskId);
    try {
      const res = await fetch(`/api/admin/workspaces/${workspaceId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, state: newState }),
      });

      const data = await res.json();
      if (!res.ok || !data.task) {
        throw new Error(data.error || "Failed to update task state");
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, state: newState } : t))
      );
    } catch (err: any) {
      console.error("Task state update failed:", err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-400" /> Task Management
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Track technical responsibilities, architecture milestones, and delivery tickets.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mr-2">
            Status:
          </span>
          {[
            { id: "all", label: "All" },
            { id: "todo", label: "To Do" },
            { id: "in_progress", label: "In Progress" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStateFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                stateFilter === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-black/30 text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Priority:
          </span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-neutral-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-12 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No tasks matching current filter</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Try switching filters or click &apos;Add Task&apos; to create a new delivery task.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isUpdating = updatingTaskId === task.id;
            const isCompleted = task.state === "completed";

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? "bg-black/20 border-white/5 opacity-75"
                    : "bg-neutral-900/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() =>
                        handleUpdateTaskState(
                          task.id,
                          isCompleted ? "todo" : "completed"
                        )
                      }
                      disabled={isUpdating}
                      title={isCompleted ? "Mark incomplete" : "Mark completed"}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-white/20 bg-black/40 hover:border-white/40 text-transparent"
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <p
                        className={`text-sm font-bold ${
                          isCompleted ? "text-neutral-400 line-through" : "text-white"
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-neutral-400 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      {task.dueAt && (
                        <p className="text-[11px] text-neutral-500 flex items-center gap-1 font-mono pt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {new Date(task.dueAt).toLocaleDateString()}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        task.priority === "urgent"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : task.priority === "high"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {task.priority}
                    </span>

                    <select
                      value={task.state}
                      disabled={isUpdating}
                      onChange={(e) =>
                        handleUpdateTaskState(task.id, e.target.value as any)
                      }
                      className="bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-neutral-300 focus:outline-none capitalize"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" /> Create Delivery Task
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl border border-red-500/30 bg-red-950/20 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                  Task Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct Stage 8 technical architecture review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                  Description / Technical Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Details, acceptance criteria, or relevant file links..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow-md"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
