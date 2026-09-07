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
  "w-full bg-white/[0.05] border border-white/12 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all";

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
    <div className="rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl p-5 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white tracking-tight">Personal details</h2>
          <p className="text-xs text-zinc-400 mt-1">Name, company, and phone save to your portal profile. Email is locked to the sign-in account.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> Full name
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
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Mail size={14} /> Email
            </label>
            <input type="email" defaultValue={email} disabled className={`${fieldClass} opacity-60 cursor-not-allowed`} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Building size={14} /> Company / college
            </label>
            <input
              type="text"
              name="companyName"
              defaultValue={initialCompanyName}
              placeholder="Company or college"
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Phone size={14} /> Phone
            </label>
            <input
              type="tel"
              name="phoneNumber"
              defaultValue={initialPhoneNumber}
              placeholder="+91 93428 77474"
              className={fieldClass}
            />
          </div>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-sm font-medium flex items-center gap-3 ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-t border-white/10">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 min-h-11 px-6 rounded-xl font-bold text-sm text-[#041018] bg-gradient-to-r from-cyan-300 to-sky-400 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isLoading ? "Saving…" : "Save changes"}
          </button>
          <button
            form="signout-form"
            type="submit"
            className="flex-1 min-h-11 px-6 rounded-xl font-bold text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 flex items-center justify-center gap-2"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </form>
      <form id="signout-form" action="/auth/signout" method="POST" className="hidden" />
    </div>
  );
}
