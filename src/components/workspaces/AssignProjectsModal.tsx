"use client";

import React, { useState, useEffect, useId, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  UserMinus,
  ArrowRightLeft,
  X,
  Loader2,
  Lock,
} from "lucide-react";
import { AssignmentRole } from "@/lib/support/staff-support";

export interface EngagementItem {
  id: string;
  company_name?: string;
  companyName?: string;
  project_title?: string;
  projectTitle?: string;
  engagement_ref?: string;
  engagementRef?: string;
  status: string;
  client_id?: string;
  clientId?: string;
}

export interface AssignmentItem {
  id: string;
  staff_user_id: string;
  client_id: string | null;
  engagement_id: string | null;
  assignment_role: AssignmentRole;
  status: "active" | "expired" | "revoked";
  can_view_technical_stages: boolean;
  can_prepare_technical_quotation: boolean;
  can_prepare_invoice_request: boolean;
  can_invite_collaborators?: boolean;
  assignment_reason: string;
  expires_at: string | null;
}

export interface AssignProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  staffUserId: string;
  staffEmail?: string | null;
  staffName?: string | null;
  initialEngagements?: EngagementItem[];
  onAssignmentUpdated?: () => void;
}

export default function AssignProjectsModal({
  isOpen,
  onClose,
  workspaceId,
  staffUserId,
  staffEmail,
  staffName,
  initialEngagements,
  onAssignmentUpdated,
}: AssignProjectsModalProps) {
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [engagements, setEngagements] = useState<EngagementItem[]>(initialEngagements || []);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sub-view: null = list, "add" | "edit" | "reassign" | "revoke"
  const [activeAction, setActiveAction] = useState<"add" | "edit" | "reassign" | "revoke" | null>(null);
  const [selectedEngagement, setSelectedEngagement] = useState<EngagementItem | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem | null>(null);

  // Form Fields
  const [role, setRole] = useState<AssignmentRole>("delivery_engineer");
  const [canViewTechnicalStages, setCanViewTechnicalStages] = useState(true);
  const [canPrepareTechnicalQuotation, setCanPrepareTechnicalQuotation] = useState(false);
  const [canPrepareInvoiceRequest, setCanPrepareInvoiceRequest] = useState(false);
  const [canInviteCollaborators, setCanInviteCollaborators] = useState(false);
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [reassignTargetEngagementId, setReassignTargetEngagementId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch real engagements if not provided
      if (!initialEngagements || initialEngagements.length === 0) {
        const engRes = await fetch("/api/engagements");
        const engData = await engRes.json();
        if (engData.success && Array.isArray(engData.engagements)) {
          setEngagements(engData.engagements);
        }
      }

      // 2. Fetch staff assignments
      const assignRes = await fetch(`/api/admin/staff-assignments?staffUserId=${staffUserId}`);
      const assignData = await assignRes.json();
      if (assignData.ok && Array.isArray(assignData.assignments)) {
        setAssignments(assignData.assignments);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load project assignment data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [initialEngagements, staffUserId]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setActiveAction(null);
      setError(null);
      setSuccessMessage(null);
      // Auto-focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, fetchData]);

  // Keyboard navigation & Focus trap handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (activeAction) {
          setActiveAction(null);
        } else {
          onClose();
        }
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeAction, onClose]);

  if (!isOpen) return null;

  // Filtered engagements
  const filteredEngagements = engagements.filter((eng) => {
    const company = (eng.company_name || eng.companyName || "").toLowerCase();
    const title = (eng.project_title || eng.projectTitle || "").toLowerCase();
    const ref = (eng.engagement_ref || eng.engagementRef || "").toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return company.includes(q) || title.includes(q) || ref.includes(q);
  });

  const getActiveAssignmentForEngagement = (engId: string): AssignmentItem | undefined => {
    return assignments.find((a) => a.engagement_id === engId && a.status === "active");
  };

  const handleStartAdd = (eng: EngagementItem) => {
    setSelectedEngagement(eng);
    setSelectedAssignment(null);
    setRole("delivery_engineer");
    setCanViewTechnicalStages(true);
    setCanPrepareTechnicalQuotation(false);
    setCanPrepareInvoiceRequest(false);
    setCanInviteCollaborators(false);
    setReason(`Assigned ${staffName || "staff member"} to ${eng.company_name || eng.companyName || "client engagement"}`);
    setExpiresAt("");
    setActiveAction("add");
    setError(null);
  };

  const handleStartEdit = (eng: EngagementItem, assign: AssignmentItem) => {
    setSelectedEngagement(eng);
    setSelectedAssignment(assign);
    setRole(assign.assignment_role);
    setCanViewTechnicalStages(assign.can_view_technical_stages);
    setCanPrepareTechnicalQuotation(assign.can_prepare_technical_quotation);
    setCanPrepareInvoiceRequest(assign.can_prepare_invoice_request);
    setCanInviteCollaborators(Boolean(assign.can_invite_collaborators));
    setReason(assign.assignment_reason || "");
    setExpiresAt(assign.expires_at ? assign.expires_at.split("T")[0] : "");
    setActiveAction("edit");
    setError(null);
  };

  const handleStartReassign = (eng: EngagementItem, assign: AssignmentItem) => {
    setSelectedEngagement(eng);
    setSelectedAssignment(assign);
    setReassignTargetEngagementId("");
    setReason(`Reassigning from ${eng.company_name || eng.companyName || "engagement"} due to resource reallocation`);
    setActiveAction("reassign");
    setError(null);
  };

  const handleStartRevoke = (eng: EngagementItem, assign: AssignmentItem) => {
    setSelectedEngagement(eng);
    setSelectedAssignment(assign);
    setReason(`Assignment concluded / revoked by Super Admin`);
    setActiveAction("revoke");
    setError(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      setError("Please provide a valid assignment reason (minimum 5 characters).");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (activeAction === "add" && selectedEngagement) {
        const res = await fetch("/api/admin/staff-assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staffUserId,
            staffEmail: staffEmail || undefined,
            clientId: selectedEngagement.client_id || selectedEngagement.clientId,
            engagementId: selectedEngagement.id,
            assignmentRole: role,
            canViewTechnicalStages,
            canPrepareTechnicalQuotation,
            canPrepareInvoiceRequest,
            canInviteCollaborators,
            assignmentReason: reason.trim(),
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to create project assignment");
        }
        setSuccessMessage(`Successfully assigned to ${selectedEngagement.company_name || selectedEngagement.companyName}`);
      } else if (activeAction === "edit" && selectedAssignment) {
        const res = await fetch(`/api/admin/staff-assignments/${selectedAssignment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            canViewTechnicalStages,
            canPrepareTechnicalQuotation,
            canPrepareInvoiceRequest,
            canInviteCollaborators,
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to update project assignment");
        }
        setSuccessMessage("Assignment permissions updated successfully");
      } else if (activeAction === "revoke" && selectedAssignment) {
        const res = await fetch(`/api/admin/staff-assignments/${selectedAssignment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "revoked" }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to revoke project assignment");
        }
        setSuccessMessage("Assignment revoked successfully");
      } else if (activeAction === "reassign" && selectedAssignment && reassignTargetEngagementId) {
        const targetEng = engagements.find((e) => e.id === reassignTargetEngagementId);
        if (!targetEng) {
          throw new Error("Target destination project not found.");
        }

        // 1. Revoke old assignment
        const revokeRes = await fetch(`/api/admin/staff-assignments/${selectedAssignment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "revoked" }),
        });
        const revokeData = await revokeRes.json();
        if (!revokeRes.ok || !revokeData.ok) {
          throw new Error(revokeData.error || "Failed to revoke existing assignment during reassignment");
        }

        // 2. Create new assignment
        const createRes = await fetch("/api/admin/staff-assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staffUserId,
            staffEmail: staffEmail || undefined,
            clientId: targetEng.client_id || targetEng.clientId,
            engagementId: targetEng.id,
            assignmentRole: selectedAssignment.assignment_role,
            canViewTechnicalStages: selectedAssignment.can_view_technical_stages,
            canPrepareTechnicalQuotation: selectedAssignment.can_prepare_technical_quotation,
            canPrepareInvoiceRequest: selectedAssignment.can_prepare_invoice_request,
            canInviteCollaborators: selectedAssignment.can_invite_collaborators,
            assignmentReason: reason.trim(),
            expiresAt: selectedAssignment.expires_at,
          }),
        });
        const createData = await createRes.json();
        if (!createRes.ok || !createData.ok) {
          throw new Error(createData.error || "Failed to create new reassigned project assignment");
        }

        setSuccessMessage(`Reassigned successfully to ${targetEng.company_name || targetEng.companyName}`);
      }

      await fetchData();
      setActiveAction(null);
      if (onAssignmentUpdated) onAssignmentUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-3xl rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 space-y-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4 shrink-0">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-[var(--lit-navy,#0B2545)] flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[var(--lit-teal,#1FA9A2)]" />
              <span>Assign Client Projects to Staff</span>
            </h2>
            <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-0.5">
              Super Admin project allocation for {staffName || "Employee"} ({staffEmail || staffUserId}).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--lit-navy,#0B2545)] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* SUB-VIEW: ADD / EDIT / REASSIGN / REVOKE FORM */}
        {activeAction ? (
          <form onSubmit={handleSubmitForm} className="space-y-4 overflow-y-auto p-1 flex-1">
            <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)]">
                {activeAction === "add" && "New Project Assignment"}
                {activeAction === "edit" && "Edit Assignment Permissions"}
                {activeAction === "reassign" && "Reassign to Different Project"}
                {activeAction === "revoke" && "Confirm Assignment Revocation"}
              </span>
              <h4 className="text-sm font-bold text-[var(--lit-navy,#0B2545)]">
                {selectedEngagement?.company_name || selectedEngagement?.companyName} —{" "}
                {selectedEngagement?.project_title || selectedEngagement?.projectTitle}
              </h4>
            </div>

            {activeAction === "reassign" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                  Destination Project Target *
                </label>
                <select
                  required
                  value={reassignTargetEngagementId}
                  onChange={(e) => setReassignTargetEngagementId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-2.5 text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs cursor-pointer"
                >
                  <option value="">Select target client engagement...</option>
                  {engagements
                    .filter((e) => e.id !== selectedEngagement?.id)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.company_name || e.companyName} — {e.project_title || e.projectTitle} ({e.status})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {(activeAction === "add" || activeAction === "edit") && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                    Technical Assignment Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as AssignmentRole)}
                    className="w-full text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-2.5 text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs cursor-pointer"
                  >
                    <option value="delivery_engineer">Delivery Engineer (Implementation)</option>
                    <option value="technical_support">Technical Support (Client SLA Owner)</option>
                    <option value="project_coordinator">Project Coordinator (Milestones)</option>
                    <option value="operations_prep">Operations Prep (Infrastructure & Security)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                    Allowed Technical Permissions
                  </span>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={canViewTechnicalStages}
                      onChange={(e) => setCanViewTechnicalStages(e.target.checked)}
                      className="rounded text-[var(--lit-teal,#1FA9A2)] focus:ring-[var(--lit-teal,#1FA9A2)]"
                    />
                    <div>
                      <p className="font-bold text-[var(--lit-navy,#0B2545)]">Inspect Technical Lifecycle Stages</p>
                      <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">View deliverables and specifications (financial stages remain redacted)</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={canPrepareTechnicalQuotation}
                      onChange={(e) => setCanPrepareTechnicalQuotation(e.target.checked)}
                      className="rounded text-[var(--lit-teal,#1FA9A2)] focus:ring-[var(--lit-teal,#1FA9A2)]"
                    />
                    <div>
                      <p className="font-bold text-[var(--lit-navy,#0B2545)]">Draft Technical Scope for Quotations</p>
                      <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">Prepare non-monetary technical scope line items for Founder commercial pricing</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={canPrepareInvoiceRequest}
                      onChange={(e) => setCanPrepareInvoiceRequest(e.target.checked)}
                      className="rounded text-[var(--lit-teal,#1FA9A2)] focus:ring-[var(--lit-teal,#1FA9A2)]"
                    />
                    <div>
                      <p className="font-bold text-[var(--lit-navy,#0B2545)]">Submit Milestone Completion Invoice Requests</p>
                      <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">Request milestone invoice preparation upon technical deliverables completion</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={canInviteCollaborators}
                      onChange={(e) => setCanInviteCollaborators(e.target.checked)}
                      className="rounded text-[var(--lit-teal,#1FA9A2)] focus:ring-[var(--lit-teal,#1FA9A2)]"
                    />
                    <div>
                      <p className="font-bold text-[var(--lit-navy,#0B2545)]">Invite Internal Engineering Collaborators</p>
                      <p className="text-[11px] text-[var(--lit-text-muted,#52677C)]">Allow inviting internal colleagues to join the project workspace delivery team</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                    Optional Expiration Date
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-2.5 text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5">
                Assignment Operational Reason *
              </label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Required operational justification for this assignment change..."
                className="w-full text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-2.5 text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] resize-none shadow-2xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--lit-border-light,#DFE7EF)]">
              <button
                type="button"
                onClick={() => setActiveAction(null)}
                className="px-4 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] cursor-pointer shadow-2xs"
              >
                Back to List
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer shadow-2xs"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {activeAction === "add" && "Confirm Assignment"}
                  {activeAction === "edit" && "Save Changes"}
                  {activeAction === "reassign" && "Confirm Reassignment"}
                  {activeAction === "revoke" && "Confirm Revoke"}
                </span>
              </button>
            </div>
          </form>
        ) : (
          /* MAIN LIST VIEW */
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Search Bar */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real client engagements by company or title..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-ink,#121826)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] shadow-2xs"
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--lit-teal,#1FA9A2)]" />
                  <p className="text-xs">Loading client engagements...</p>
                </div>
              ) : filteredEngagements.length === 0 ? (
                <div className="py-10 px-4 text-center border border-dashed border-[var(--lit-border-light,#DFE7EF)] rounded-xl space-y-2">
                  <p className="text-sm font-semibold text-[var(--lit-navy,#0B2545)]">
                    No client engagements available for assignment.
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {engagements.length === 0
                      ? "Create or verify a real client engagement before assigning staff to a project. Demonstration projects cannot be assigned."
                      : "No client engagements match your search."}
                  </p>
                  {engagements.length === 0 ? (
                    <Link
                      href="/admin/engagements"
                      className="inline-flex mt-2 text-xs font-semibold text-[var(--lit-teal,#1FA9A2)] hover:underline"
                    >
                      Open engagement management →
                    </Link>
                  ) : null}
                </div>
              ) : (
                filteredEngagements.map((eng) => {
                  const company = eng.company_name || eng.companyName || "Client";
                  const title = eng.project_title || eng.projectTitle || "Architecture Project";
                  const ref = eng.engagement_ref || eng.engagementRef || eng.id.slice(0, 8);
                  const activeAssign = getActiveAssignmentForEngagement(eng.id);

                  return (
                    <div
                      key={eng.id}
                      className="p-4 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:border-[var(--lit-teal,#1FA9A2)]/40 transition-all space-y-2 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[var(--lit-navy,#0B2545)] truncate">
                              {company}
                            </h4>
                            <span className="text-[10px] font-mono text-[var(--lit-text-muted,#52677C)]">
                              ({ref})
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] truncate">
                            {title}
                          </p>
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0 flex items-center gap-2">
                          {activeAssign ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Assigned ({activeAssign.assignment_role.replace("_", " ")})</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                              Not Assigned
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-end gap-2 text-xs">
                        {activeAssign ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(eng, activeAssign)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[11px] font-bold text-[var(--lit-navy,#0B2545)] cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)]" />
                              <span>Edit Permissions</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartReassign(eng, activeAssign)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-[11px] font-bold text-indigo-700 cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Reassign</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStartRevoke(eng, activeAssign)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-rose-700 cursor-pointer"
                            >
                              <UserMinus className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartAdd(eng)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--lit-teal,#1FA9A2)] hover:bg-[var(--lit-teal,#1FA9A2)]/90 text-[11px] font-bold text-white uppercase tracking-wider cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Assign to Staff</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[var(--lit-border-light,#DFE7EF)] flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)] shrink-0">
              <span>{assignments.filter((a) => a.status === "active").length} active project assignments</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:bg-[var(--lit-cloud,#F7F9FC)] text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
