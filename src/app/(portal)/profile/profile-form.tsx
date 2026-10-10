"use client";

import { User, Building, Phone, Mail, LogOut, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { updateProfile } from "./actions";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialFullName: string;
  email: string;
  initialCompanyName?: string;
  initialPhoneNumber?: string;
}

const fieldClass =
  "w-full bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] rounded-xl px-4 py-3 text-sm text-[var(--lit-ink,#121826)] placeholder-[var(--lit-text-muted,#52677C)] focus:outline-none focus:border-[var(--lit-teal,#1FA9A2)] focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 transition-all";

export default function ProfileForm({
  initialFullName,
  email,
  initialCompanyName = "",
  initialPhoneNumber = "",
}: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateProfile(formData);

      if (result.success) {
        setMessage({ type: "success", text: "Profile saved. Your details are up to date." });
        router.refresh();
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update profile. Please try again." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white p-6 sm:p-8 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="pb-4 border-b border-[var(--lit-border-light,#DFE7EF)]">
          <h2 className="text-xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">Personal Details</h2>
          <p className="text-xs text-[var(--lit-text-muted,#52677C)] mt-1">Name, company, and phone save to your portal profile. Email is locked to the authenticated account.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider flex items-center gap-2">
              <User size={14} className="text-[var(--lit-teal,#1FA9A2)]" /> Full Name
            </label>
            <input
              type="text"
              name="fullName"
              defaultValue={initialFullName}
              placeholder="Your name"
              required
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider flex items-center gap-2">
              <Mail size={14} className="text-[var(--lit-text-muted,#52677C)]" /> Email (Locked)
            </label>
            <input type="email" defaultValue={email} disabled className={`${fieldClass} opacity-70 bg-zinc-100 cursor-not-allowed`} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider flex items-center gap-2">
              <Building size={14} className="text-[var(--lit-teal,#1FA9A2)]" /> Company / Organization
            </label>
            <input
              type="text"
              name="companyName"
              defaultValue={initialCompanyName}
              placeholder="Company or organization"
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--lit-navy,#0B2545)] uppercase tracking-wider flex items-center gap-2">
              <Phone size={14} className="text-[var(--lit-teal,#1FA9A2)]" /> Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              defaultValue={initialPhoneNumber}
              placeholder="+91 75500 67712"
              className={fieldClass}
            />
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-rose-600" />}
            {message.text}
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t border-[var(--lit-border-light,#DFE7EF)]">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 min-h-12 px-6 rounded-xl font-bold text-sm text-white bg-[var(--lit-navy,#0B2545)] hover:bg-[var(--lit-blue,#1565C0)] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isLoading ? "Saving…" : "Save Changes"}
          </button>
          <button
            form="signout-form"
            type="submit"
            className="flex-1 min-h-12 px-6 rounded-xl font-bold text-sm text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </form>
      <form id="signout-form" action="/auth/signout" method="POST" className="hidden" />
    </div>
  );
}
