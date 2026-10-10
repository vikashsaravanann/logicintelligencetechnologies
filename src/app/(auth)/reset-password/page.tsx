"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, Shield, KeyRound, CheckCircle2 } from "lucide-react";
import { BackButton } from "@/components/navigation/back-button";
import { getClientSupabase } from "@/lib/supabase/client";
import { COMPANY } from "@/config/company";

export default function ResetPasswordPage() {
  const supabase = getClientSupabase();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) {
        setError(updErr.message);
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const isMinLength = password.length >= 8;
  const isMatch = Boolean(confirm && password === confirm);

  return (
    <main className="min-h-screen w-full bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6">
          <BackButton fallbackHref="/login" label="Sign In" inline />
        </div>

        <div className="bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-3xl p-7 sm:p-10 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="relative block w-10 h-10 rounded-xl overflow-hidden border border-[var(--lit-border-light,#DFE7EF)] bg-white shrink-0">
              <Image
                src={COMPANY.logoIconPath}
                alt=""
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase font-mono text-[var(--lit-navy,#0B2545)]">
                {COMPANY.displayName}
              </p>
              <p className="text-[10px] text-[var(--lit-text-muted,#52677C)]">
                Secure Account Services
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-[var(--lit-light-blue,#E7F3FF)] text-[var(--lit-blue,#1565C0)] border border-blue-200 mb-3">
            <KeyRound className="w-3.5 h-3.5" />
            Credential Update
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-heading mb-2">
            Set a new <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">password</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] mb-6 leading-relaxed">
            Choose a strong password that you have not used on this enterprise portal previously.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex gap-3 items-start">
              <Shield className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <p className="leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5 font-mono">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--lit-text-muted,#52677C)]" />
                <input
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-11 pl-11 pr-11 py-2.5 bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 focus:border-[var(--lit-teal,#1FA9A2)] transition-all shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] min-h-8 min-w-8 flex items-center justify-center"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5 font-mono">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--lit-text-muted,#52677C)]" />
                <input
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full min-h-11 pl-11 pr-11 py-2.5 bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 focus:border-[var(--lit-teal,#1FA9A2)] transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Checklist */}
            <div className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] space-y-1.5 text-xs text-[var(--lit-text-muted,#52677C)]">
              <div className={`flex items-center gap-2 ${isMinLength ? "text-emerald-700 font-medium" : ""}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${isMinLength ? "text-emerald-600" : "text-zinc-400"}`} />
                <span>At least 8 characters long</span>
              </div>
              <div className={`flex items-center gap-2 ${isMatch ? "text-emerald-700 font-medium" : ""}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${isMatch ? "text-emerald-600" : "text-zinc-400"}`} />
                <span>Both passwords match</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isMinLength || !isMatch}
              className="w-full min-h-11 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-semibold text-sm hover:bg-[var(--lit-teal,#1FA9A2)] disabled:opacity-40 transition-colors shadow-xs"
            >
              {loading ? "Updating credentials…" : "Update Password"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--lit-border-light,#DFE7EF)] text-center">
            <Link
              href="/login"
              className="text-xs text-[var(--lit-blue,#1565C0)] font-semibold hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
