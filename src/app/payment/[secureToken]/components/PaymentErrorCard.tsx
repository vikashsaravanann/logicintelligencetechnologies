"use client";

import Link from "next/link";
import { ShieldAlert, ArrowRight, Mail, Home } from "lucide-react";
import { COMPANY } from "@/config/company";

interface Props {
  reason: "not_found" | "expired" | "invalid_token";
  token?: string;
}

export function PaymentErrorCard({ reason, token }: Props) {
  const isExpired = reason === "expired";

  return (
    <main className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
        {/* Subtle top brand accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--lit-blue,#1565C0)] via-[var(--lit-teal,#1FA9A2)] to-[var(--lit-navy,#0B2545)]" />

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <span className="text-xs font-mono font-bold text-[var(--lit-blue,#1565C0)] uppercase tracking-wider block mb-2">
          LOGIC INTELLIGENCE TECHNOLOGIES · PAYMENT GATEWAY
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--lit-navy,#0B2545)] font-poppins tracking-tight">
          {isExpired ? "Payment Link Has Expired" : "Invalid or Expired Payment Link"}
        </h1>

        <p className="mt-4 text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-sans">
          {isExpired
            ? "This milestone payment session has expired in accordance with LIT financial security policies. Please request an updated payment authorization link from our accounts team."
            : "The requested payment authorization token could not be verified, has been superseded, or does not exist. Please ensure you are using the exact link provided in your verified Statement of Work."}
        </p>

        {token && (
          <div className="mt-6 p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] font-mono text-xs text-[var(--lit-text-muted,#52677C)] break-all">
            Token reference: {token.slice(0, 16)}…
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`mailto:${COMPANY.email}?subject=Payment%20Link%20Inquiry%20${encodeURIComponent(token || "")}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--lit-navy,#0B2545)] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[#123663] transition-all"
          >
            <Mail className="h-4 w-4" />
            <span>Contact Accounts Team</span>
          </a>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[var(--lit-ink,#121826)] hover:bg-[var(--lit-cloud,#F7F9FC)] transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
