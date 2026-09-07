"use client";

import { useState, useEffect, Suspense } from "react";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { COMPANY } from "@/config/company";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";

type Mode = "signin" | "signup" | "forgot";

function validateEmail(email: string) {
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address.";
  return undefined;
}

function validatePassword(password: string, isSignUp: boolean) {
  if (!password) return "Password is required.";
  if (isSignUp && password.length < 8) return "Use at least 8 characters.";
  return undefined;
}

function friendlyAuthError(message: string) {
  const m = (message || "").toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Email or password is incorrect.";
  }
  if (m.includes("email not confirmed")) {
    return "Please confirm your email first — check your inbox for the verification link.";
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  return message || "Authentication failed.";
}

function postLoginPath(email: string | undefined) {
  if (email?.endsWith("@logicintelligencetechnologies.in")) return "/dashboard";
  return "/profile";
}

function AuthContent() {
  const supabase = createClientComponentClient({
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  useEffect(() => {
    const errorDescription = searchParams.get("error_description");
    const errorParam = searchParams.get("error");
    if (errorDescription) setServerError(decodeURIComponent(errorDescription));
    else if (errorParam) setServerError(decodeURIComponent(errorParam));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled && session) {
        router.replace(postLoginPath(session.user.email));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, supabase.auth]);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setOauthBusy(provider);
      setServerError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams:
            provider === "google" ? { access_type: "offline", prompt: "consent" } : undefined,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Could not continue with ${provider}.`;
      setServerError(friendlyAuthError(message));
      setOauthBusy(null);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    if (eErr) {
      setFieldErrors({ email: eErr });
      return;
    }
    setFieldErrors({});
    setIsLoading(true);
    setServerError(null);
    setServerSuccess(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) throw error;
      setServerSuccess("If that email is registered, a reset link is on its way. Check inbox and spam.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not send reset email.";
      setServerError(friendlyAuthError(message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSignUp = mode === "signup";
    const eErr = validateEmail(email);
    const pErr = validatePassword(password, isSignUp);
    const nErr = isSignUp && !name.trim() ? "Name is required." : undefined;
    const cErr = isSignUp && password !== confirm ? "Passwords do not match." : undefined;
    if (eErr || pErr || nErr || cErr) {
      setFieldErrors({ email: eErr, password: pErr, name: nErr, confirm: cErr });
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    setServerError(null);
    setServerSuccess(null);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { full_name: name.trim() },
          },
        });
        if (error) throw error;
        fetch("/api/auth/send-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data?.user?.id, email: email.trim() }),
        }).catch(() => {});
        setServerSuccess("Account created. Check your email to verify, then sign in.");
        setMode("signin");
        setPassword("");
        setConfirm("");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        fetch("/api/auth/login-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            screenSize:
              typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : undefined,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        }).catch(() => {});
        router.push(postLoginPath(data.user?.email));
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed.";
      setServerError(friendlyAuthError(message));
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    "w-full pl-11 pr-4 py-3.5 bg-[#070b16] border border-white/10 rounded-2xl text-[14px] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/70 transition-all";

  const busy = isLoading || Boolean(oauthBusy);

  const heading =
    mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Sign in";
  const sub =
    mode === "signup"
      ? "Verify your email, then track projects, files, and support in one portal."
      : mode === "forgot"
        ? "Enter the work email on the account. We will send a secure reset link."
        : "Access the Logic Intelligence Technologies client portal.";

  return (
    <main className="min-h-[100dvh] bg-[#050814] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 w-[520px] h-[520px] rounded-full bg-cyan-500/12 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[480px] h-[480px] rounded-full bg-blue-700/20 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(14,165,233,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.07) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 min-h-[100dvh] grid lg:grid-cols-2">
        <section className="flex flex-col justify-center px-5 sm:px-8 py-10 lg:py-16">
          <div className="w-full max-w-[460px] mx-auto">
            <Link href="/" className="flex items-center gap-3.5 mb-8 group min-w-0">
              <span className="relative shrink-0">
                <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-400/50 to-transparent blur-sm" />
                <span className="relative block w-[58px] h-[58px] rounded-full overflow-hidden border border-white/20 bg-white">
                  <img
                    src={COMPANY.logoIconPath}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                </span>
              </span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap uppercase text-[11px] sm:text-[13px] font-black tracking-[0.12em] text-white group-hover:text-cyan-300 transition-colors">
                  {COMPANY.displayName}
                </span>
                <span className="block whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400/80 mt-1">
                  {COMPANY.tagline}
                </span>
              </span>
            </Link>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] backdrop-blur-xl p-6 sm:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400 mb-3">
                Secure client portal
              </p>
              <h1 className="text-[1.85rem] sm:text-[2.15rem] font-black tracking-tight leading-none mb-2">
                {heading}
              </h1>
              <p className="text-zinc-400 text-sm leading-relaxed mb-7">{sub}</p>

              {serverError && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex gap-3">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{serverError}</p>
                </div>
              )}
              {serverSuccess && (
                <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex gap-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{serverSuccess}</p>
                </div>
              )}

              {mode !== "forgot" && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin("google")}
                      disabled={busy}
                      className="flex items-center justify-center gap-2.5 min-h-12 rounded-2xl text-[13px] font-semibold bg-white hover:bg-[#f8f9fa] text-[#3c4043] disabled:opacity-50"
                    >
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden>
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      {oauthBusy === "google" ? "Connecting…" : "Google"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin("github")}
                      disabled={busy}
                      className="flex items-center justify-center gap-2.5 min-h-12 rounded-2xl text-[13px] font-semibold bg-[#24292f] hover:bg-[#1b1f23] text-white disabled:opacity-50"
                    >
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                      {oauthBusy === "github" ? "Connecting…" : "GitHub"}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                      or work email
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                </>
              )}

              <form onSubmit={mode === "forgot" ? handleForgot : handleSubmit} noValidate className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        autoComplete="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`${inputBase} ${fieldErrors.name ? "border-red-400" : ""}`}
                      />
                    </div>
                    {fieldErrors.name && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.name}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      autoComplete="username"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${inputBase} ${fieldErrors.email ? "border-red-400" : ""}`}
                    />
                  </div>
                  {fieldErrors.email && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>}
                </div>

                {mode !== "forgot" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                        Password
                      </label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode("forgot");
                            setServerError(null);
                            setServerSuccess(null);
                          }}
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type={showPass ? "text" : "password"}
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputBase} pr-11 ${fieldErrors.password ? "border-red-400" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        aria-label={showPass ? "Hide password" : "Show password"}
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p>}
                  </div>
                )}

                {mode === "signup" && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type={showPass ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={`${inputBase} ${fieldErrors.confirm ? "border-red-400" : ""}`}
                      />
                    </div>
                    {fieldErrors.confirm && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.confirm}</p>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-[#041018] bg-gradient-to-r from-cyan-300 to-sky-400 hover:from-cyan-200 hover:to-sky-300 transition-all disabled:opacity-50 mt-2 shadow-[0_10px_40px_rgba(14,165,233,0.25)]"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "forgot" ? "Send reset link" : mode === "signup" ? "Create account" : "Enter portal"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-500">
                {mode === "signin" && (
                  <>
                    New to the studio?{" "}
                    <button
                      type="button"
                      className="text-cyan-400 font-semibold hover:text-cyan-300"
                      onClick={() => {
                        setMode("signup");
                        setServerError(null);
                        setServerSuccess(null);
                      }}
                    >
                      Create an account
                    </button>
                  </>
                )}
                {mode === "signup" && (
                  <>
                    Already registered?{" "}
                    <button
                      type="button"
                      className="text-cyan-400 font-semibold hover:text-cyan-300"
                      onClick={() => {
                        setMode("signin");
                        setServerError(null);
                        setServerSuccess(null);
                      }}
                    >
                      Sign in
                    </button>
                  </>
                )}
                {mode === "forgot" && (
                  <button
                    type="button"
                    className="text-cyan-400 font-semibold hover:text-cyan-300"
                    onClick={() => {
                      setMode("signin");
                      setServerError(null);
                      setServerSuccess(null);
                    }}
                  >
                    Back to sign in
                  </button>
                )}
              </p>
            </div>

            <p className="mt-6 text-[11px] text-zinc-600 text-center leading-relaxed">
              By continuing you agree to the{" "}
              <Link href="/terms" className="underline hover:text-zinc-400">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-zinc-400">
                Privacy Policy
              </Link>
              . Encrypted session · {COMPANY.address}.
            </p>
          </div>
        </section>

        <aside className="hidden lg:flex relative items-center justify-center p-12 xl:p-16 border-l border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-indigo-600/10" />
          <div className="relative max-w-lg">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-400 mb-5">
              {COMPANY.entityLabel.toUpperCase()} · COIMBATORE
            </p>
            <h2 className="text-4xl xl:text-5xl font-black leading-[1.08] tracking-tight mb-6 uppercase">
              Production software.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-200 mt-2">
                Practical AI.
              </span>
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-10 text-[15px]">
              LOGIC INTELLIGENCE TECHNOLOGIES builds websites, custom systems, and private
              knowledge assistants for Indian SMBs. Demo first. Transparent packs from ₹8,999.
              Source on full payment.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-10">
              {[
                { k: "HQ", v: "CBE" },
                { k: "Demo", v: "Free" },
                { k: "From", v: "₹8,999" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center">
                  <p className="text-lg font-black tracking-tight">{s.v}</p>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{s.k}</p>
                </div>
              ))}
            </div>
            <ul className="space-y-3 text-sm text-zinc-300">
              {[
                "Projects, files, and support in one portal",
                "Google or GitHub — official brand buttons",
                "Staff dashboard · client profile after sign-in",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#050814] flex items-center justify-center text-zinc-400 text-sm">
          Loading portal…
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
