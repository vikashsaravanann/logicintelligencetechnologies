"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileEdit } from "lucide-react";

interface SuperAdminInspectButtonProps {
  href: string;
  initialIsSuperAdmin?: boolean;
  label?: string;
  title?: string;
  className?: string;
  showBadge?: boolean;
  target?: string;
}

/**
 * Renders an Inspect button styled identically to the proposal creation Inspect button.
 * STRICTLY VISIBLE ONLY TO SUPER ADMINS.
 * If the current viewer is not a Super Admin, this component renders nothing (null).
 */
export function SuperAdminInspectButton({
  href,
  initialIsSuperAdmin,
  label = "Inspect",
  title = "Super Admin: Inspect in Admin Control Center",
  className = "",
  showBadge = false,
  target,
}: SuperAdminInspectButtonProps) {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(initialIsSuperAdmin ?? false);

  useEffect(() => {
    // If not already explicitly known from server, query the session check endpoint
    if (initialIsSuperAdmin === undefined) {
      let active = true;
      fetch("/api/auth/is-super-admin")
        .then((res) => (res.ok ? res.json() : { isSuperAdmin: false }))
        .then((data) => {
          if (active && typeof data.isSuperAdmin === "boolean") {
            setIsSuperAdmin(data.isSuperAdmin);
          }
        })
        .catch(() => {
          if (active) setIsSuperAdmin(false);
        });
      return () => {
        active = false;
      };
    }
  }, [initialIsSuperAdmin]);

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Link
      href={href}
      target={target}
      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] hover:border-[var(--lit-teal,#1FA9A2)] text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs group ${className}`}
      title={title}
    >
      <FileEdit className="w-3 h-3 text-[var(--lit-teal,#1FA9A2)] group-hover:rotate-6 transition-transform" />
      <span>{label}</span>
      {showBadge && (
        <span className="ml-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Admin
        </span>
      )}
    </Link>
  );
}

export default SuperAdminInspectButton;
