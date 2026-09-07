"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
import { COMPANY } from "@/config/company";

export default function ResetPasswordPage() {
  const supabase = createClientComponentClient({
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: updErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    router.push("/profile");
    router.refresh();
  };

  return (
    <main className="min-h-[100dvh] bg-[#0A0F1E] text-white flex items-center justify-center px-5">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
        <Link href="/" className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white">
          {COMPANY.displayName}
        </Link>
        <h1 className="text-3xl font-black tracking-tight">Set a new password</h1>
        <p className="text-sm text-zinc-400">Choose a password you have not used on this portal before.</p>
        {error && (
          <p className="text-sm text-red-300 flex gap-2">
            <Shield className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </p>
        )}
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-11 pr-11 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm"
          />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <input
          type={show ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-black bg-primary disabled:opacity-50"
        >
          {loading ? "Saving…" : "Update password"}
          <ArrowRight className="w-4 h-4" />
        </button>
        <Link href="/login" className="block text-center text-sm text-zinc-500 hover:text-white">
          Back to sign in
        </Link>
      </form>
    </main>
  );
}
