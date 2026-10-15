"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  Share2,
  Copy,
  Check,
  Building2,
  User,
  ArrowRight,
  ExternalLink,
  FileText,
  AlertCircle,
  FileSignature,
  Loader2,
  X,
  FileEdit,
} from "lucide-react";
import { formatIST } from "@/lib/format/datetime";

interface ChecklistInvitationRow {
  id: string;
  recipient_name: string;
  recipient_email: string;
  recipient_company?: string | null;
  status: string;
  expires_at: string;
  sent_at?: string | null;
  sent_count: number;
  viewed_at?: string | null;
  submitted_at?: string | null;
  created_at: string;
  proposal_id?: string | null;
  enterprise_checklist_responses?: {
    id: string;
    confirmation_reference: string;
    selected_count: number;
    submitted_at: string;
    client_notes?: string | null;
  } | null;
}

interface Props {
  initialInvitations: ChecklistInvitationRow[];
}

export default function ChecklistInvitationsClient({ initialInvitations }: Props) {
  const [invitations, setInvitations] = useState<ChecklistInvitationRow[]>(initialInvitations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New invitation form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [ttlDays, setTtlDays] = useState(30);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Sending state
  const [sendingId, setSendingId] = useState<string | null>(null);

  const filtered = invitations.filter((inv) => {
    const matchesFilter =
      statusFilter === "ALL" || inv.status.toLowerCase() === statusFilter.toLowerCase();
    if (!matchesFilter) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inv.recipient_name.toLowerCase().includes(q) ||
      inv.recipient_email.toLowerCase().includes(q) ||
      (inv.recipient_company && inv.recipient_company.toLowerCase().includes(q)) ||
      (inv.enterprise_checklist_responses?.confirmation_reference &&
        inv.enterprise_checklist_responses.confirmation_reference.toLowerCase().includes(q))
    );
  });

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      setCreateError("Name and email are required.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/admin/enterprise-checklists/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: newName.trim(),
          recipientEmail: newEmail.trim(),
          recipientCompany: newCompany.trim() || undefined,
          notes: newNotes.trim() || undefined,
          ttlDays,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to create invitation.");
      }

      // Add fresh record to UI
      const created = data.invitation;
      const emailSent = created?.emailDispatched === true;
      const newRow: ChecklistInvitationRow = {
        id: created.invitationId,
        recipient_name: newName.trim(),
        recipient_email: newEmail.trim(),
        recipient_company: newCompany.trim() || null,
        status: emailSent ? "sent" : "issued",
        expires_at: created.expiresAt,
        sent_count: emailSent ? 1 : 0,
        sent_at: emailSent ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString(),
      };

      setInvitations([newRow, ...invitations]);
      setShowCreateModal(false);
      setNewName("");
      setNewEmail("");
      setNewCompany("");
      setNewNotes("");
    } catch (err: any) {
      setCreateError(err.message || "Could not create invitation.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendEmail = async (id: string) => {
    setSendingId(id);
    try {
      const res = await fetch(`/api/admin/enterprise-checklists/invitations/${id}/send`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setInvitations((prev) =>
          prev.map((inv) =>
            inv.id === id
              ? {
                  ...inv,
                  status: inv.status === "draft" || inv.status === "issued" ? "sent" : inv.status,
                  sent_count: (inv.sent_count || 0) + 1,
                  sent_at: new Date().toISOString(),
                }
              : inv
          )
        );
      } else {
        alert(data.error || "Failed to send email.");
      }
    } catch {
      alert("Error sending invitation email.");
    } finally {
      setSendingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return "border-emerald-200 bg-emerald-50 text-emerald-800";
      case "reviewed":
        return "border-teal-200 bg-teal-50 text-teal-800";
      case "proposal_prepared":
      case "proposal_sent":
        return "border-purple-200 bg-purple-50 text-purple-800";
      case "viewed":
        return "border-blue-200 bg-blue-50 text-blue-800";
      case "sent":
        return "border-amber-200 bg-amber-50 text-amber-800";
      case "expired":
        return "border-rose-200 bg-rose-50 text-rose-800";
      default:
        return "border-slate-200 bg-slate-50 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client, company, email, or ref..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="issued">Issued</option>
            <option value="sent">Sent</option>
            <option value="viewed">Viewed</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="proposal_prepared">Proposal Prepared</option>
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lit-blue,#1565C0)] hover:bg-[#1255A3] text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Issue Invitation
          </button>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No checklist invitations found. Click &quot;Issue Invitation&quot; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase font-mono text-[10px]">
                  <th className="py-3 px-4 font-semibold">Client / Company</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Checkpoints</th>
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">Timeline</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inv) => {
                  const resp = inv.enterprise_checklist_responses;
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{inv.recipient_name}</div>
                        <div className="text-[11px] text-slate-500">{inv.recipient_email}</div>
                        {inv.recipient_company && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {inv.recipient_company}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getStatusBadge(
                            inv.status
                          )}`}
                        >
                          {inv.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {resp ? (
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            {resp.selected_count} / 50 Selected
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Pending Selection</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                        {resp?.confirmation_reference || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        <div>Created: {formatIST(inv.created_at)}</div>
                        {inv.submitted_at && (
                          <div className="text-emerald-700">
                            Submitted: {formatIST(inv.submitted_at)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/checklist-invitations/${inv.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs"
                            title="Inspect Checklist Details"
                          >
                            <FileEdit className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
                            <span>Inspect</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleSendEmail(inv.id)}
                            disabled={sendingId === inv.id || inv.sent_count > 0}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs ${
                              inv.sent_count > 0
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] disabled:opacity-50"
                            }`}
                            title="Dispatch invitation email to client"
                          >
                            {sendingId === inv.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : inv.sent_count > 0 ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Send className="w-3 h-3 text-[var(--lit-blue,#1565C0)]" />
                            )}
                            <span>
                              {sendingId === inv.id ? "Sending…" : inv.sent_count > 0 ? "Dispatched" : "Dispatch"}
                            </span>
                          </button>

                          <Link
                            href={`/enterprise-checklist/${inv.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--lit-teal,#1FA9A2)] hover:text-[var(--lit-navy,#0B2545)] transition-colors ml-1"
                            title="Open Public Client View"
                          >
                            <span>Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Issue New Invitation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-poppins text-lg font-bold text-[var(--lit-navy,#0B2545)]">
                  Issue Checklist Invitation
                </h3>
                <p className="text-xs text-slate-500">
                  Generate a private, cryptographically secure 50-point checklist link.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvitation} className="p-6 space-y-4 text-xs">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)]"
                  placeholder="e.g. Dr. Rajesh Kumar"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)]"
                  placeholder="e.g. rajesh@apexhealth.in"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Client / Organization Name
                </label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--lit-blue,#1565C0)]"
                  placeholder="e.g. Apex Hospital Group"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Link Validity (Days)
                </label>
                <select
                  value={ttlDays}
                  onChange={(e) => setTtlDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
                >
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days (Recommended)</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Internal Notes (Optional)
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
                  placeholder="Internal comments for technical or sales team..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-[var(--lit-blue,#1565C0)] hover:bg-[#1255A3] disabled:bg-slate-300 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Generate Invitation
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
