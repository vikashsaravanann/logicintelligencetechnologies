"use client";

import React, { useState } from "react";
import { Briefcase } from "lucide-react";
import AssignProjectsModal, { EngagementItem } from "./AssignProjectsModal";

interface AssignProjectsButtonProps {
  workspaceId: string;
  staffUserId: string;
  staffEmail?: string | null;
  staffName?: string | null;
  initialEngagements?: EngagementItem[];
  variant?: "primary" | "secondary" | "header";
  className?: string;
  label?: string;
}

export default function AssignProjectsButton({
  workspaceId,
  staffUserId,
  staffEmail,
  staffName,
  initialEngagements,
  variant = "primary",
  className,
  label = "Assign Projects",
}: AssignProjectsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const baseClass =
    variant === "header"
      ? "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
      : variant === "secondary"
      ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[var(--lit-border-light,#DFE7EF)] text-indigo-700 text-xs font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
      : "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-2xs cursor-pointer";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || baseClass}
      >
        <Briefcase className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>

      <AssignProjectsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        workspaceId={workspaceId}
        staffUserId={staffUserId}
        staffEmail={staffEmail}
        staffName={staffName}
        initialEngagements={initialEngagements}
        onAssignmentUpdated={() => {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      />
    </>
  );
}
