"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  User,
  CheckCircle2,
} from "lucide-react";
import { COMPANY } from "@/config/company";
import { getClientSupabase } from "@/lib/supabase/client";
import BackToHome from "@/components/ui/back-to-home";

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
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "Email or password is incorrect.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox for the verification link.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Sign in instead.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Wait a minute and try again.";
  return message || "Authentication failed.";
}

function safeNextPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n && n.startsWith("/") && !n.startsWith("//") && !n.includes("\\") && !n.includes("://")) {
      return n;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return getClientSupabase();
    } catch {
      return null;
    }
  }, []);

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    if (!supabase) {
      setServerError("Auth is temporarily unavailable. Please refresh the page.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!cancelled && session) {
          router.replace(safeNextPath() || "/");
        }
      } catch {
        /* stay on login */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  const callbackUrl = () => {
    const next = safeNextPath() || "/";
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    if (!supabase) return;
    try {
      setOauthBusy(provider);
      setServerError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl(),
          queryParams:
            provider === "google"
              ? { access_type: "offline", prompt: "consent" }
              : undefined,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : `Could not continue with ${provider}.`;
      setServerError(friendlyAuthError(message));
      setOauthBusy(null);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
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
      setServerSuccess(
        "If that email is registered, a reset link is on its way. Check inbox and spam."
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not send reset email.";
      setServerError(friendlyAuthError(message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
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
            emailRedirectTo: callbackUrl(),
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
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        fetch("/api/auth/login-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            screenSize:
              typeof window !== "undefined"
                ? `${window.screen.width}x${window.screen.height}`
                : undefined,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        }).catch(() => {});
        router.push(safeNextPath() || "/");
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
    "w-full min-h-11 pl-11 pr-4 py-3 bg-white/[0.06] border border-white/15 rounded-2xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/35 focus:border-cyan-300/50 transition-all";
  const busy = isLoading || Boolean(oauthBusy);
  const heading =
    mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Sign in";
  const sub =
    mode === "signup"
      ? "Verify your email, then continue to the page you requested."
      : mode === "forgot"
        ? "Enter the email on the account. We will send a secure reset link."
        : "Continue to Logic Intelligence Technologies with Google or email.";

  if (!ready) {
    return (
      <div className="min-h-[100dvh] bg-[#050814] flex items-center justify-center text-zinc-400 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <main className="h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] bg-[#050814] text-white relative overflow-x-hidden overflow-y-auto overscroll-none">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute top-[-12%] left-[10%] w-[min(420px,90vw)] h-[min(420px,90vw)] rounded-full bg-cyan-500/12 blur-[100px]" />
        <div className="absolute bottom-[-8%] right-[-5%] w-[min(380px,85vw)] h-[min(380px,85vw)] rounded-full bg-blue-700/20 blur-[90px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-8 lg:py-12 min-h-full flex flex-col justify-center">
        <div className="shrink-0 mb-2 sm:mb-4">
          <BackToHome href="/" label="Back to Home" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl sm:rounded-3xl border border-white/15 bg-white/[0.05] backdrop-blur-xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          <aside className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-cyan-500/15 via-transparent to-blue-900/40 border-r border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="relative block w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-white shrink-0">
                  <img src={COMPANY.logoIconPath} alt="" className="w-full h-full object-cover" />
                </span>
                <div>
                  <p className="uppercase text-xs font-semibold tracking-[0.14em]">{COMPANY.displayName}</p>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400/85 mt-0.5">
                    {COMPANY.tagline}
                  </p>
                </div>
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-4">
                Where logic meets innovation.
              </h2>
              <p className="text-zinc-300 text-sm leading-relaxed">
                Sign in to open services, industries, proposals, and the AI workspace. Your
                destination is restored after login.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                Google sign-in for a one-tap return
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                Client portal, support, and project tracking
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                Full AI workspace after authentication
              </li>
            </ul>
          </aside>

          <section className="p-4 sm:p-8 lg:p-10">
            <div className="lg:hidden flex items-center gap-2.5 mb-3 sm:mb-6">
              <span className="relative block w-11 h-11 rounded-full overflow-hidden border border-white/20 bg-white shrink-0">
                <img src={COMPANY.logoIconPath} alt="" className="w-full h-full object-cover" />
              </span>
              <span className="uppercase text-[11px] font-semibold tracking-[0.14em]">{COMPANY.displayName}</span>
            </div>

            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200 mb-3 px-3 py-1 rounded-full border border-white/15 bg-white/10">
              Secure access
            </p>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight mb-1">{heading}</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mb-3 sm:mb-6 leading-snug">{sub}</p>

            {serverError && (
              <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex gap-3">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{serverError}</p>
              </div>
            )}
            {serverSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm flex gap-3">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{serverSuccess}</p>
              </div>
            )}

            {mode !== "forgot" && (
              <>
                <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={busy}
                    className="min-h-11 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/15 bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("github")}
                    disabled={busy}
                    className="min-h-11 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/15 bg-[#24292f] text-white text-sm font-semibold hover:bg-[#2f363d] disabled:opacity-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 .5C5.73.5.75 5.48.75 11.76c0 4.97 3.22 9.18 7.69 10.66.56.1.77-.24.77-.54v-1.9c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.72 2.84 3.82 2.04.12-.79.4-1.33.72-1.64-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.42.1-2.96 0 0 .95-.3 3.1 1.15a10.7 10.7 0 0 1 5.64 0c2.14-1.45 3.09-1.15 3.09-1.15.6 1.54.22 2.68.11 2.96.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.27-5.15 5.55.41.36.77 1.06.77 2.14v3.17c0 .3.2.65.78.54A11.02 11.02 0 0 0 23.25 11.76C23.25 5.48 18.27.5 12 .5z" />
                    </svg>
                    GitHub
                  </button>
                </div>
                <div className="relative my-3 sm:my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                    <span className="px-3 bg-transparent text-zinc-500">or continue with email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={mode === "forgot" ? handleForgot : handleSubmit} className="space-y-2.5 sm:space-y-3.5">
              {mode === "signup" && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputBase}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                  {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputBase}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
              </div>

              {mode !== "forgot" && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputBase + " pr-11"}
                      placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white min-h-11 min-w-11"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
                  )}
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={inputBase + " pr-11"}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  {fieldErrors.confirm && (
                    <p className="mt-1 text-xs text-red-400">{fieldErrors.confirm}</p>
                  )}
                </div>
              )}

              {mode === "signin" && (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setServerError(null);
                      setServerSuccess(null);
                    }}
                    className="text-xs text-cyan-300 hover:text-cyan-200 min-h-11"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full mt-2 min-h-11 inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-black font-bold text-sm uppercase tracking-wide hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Please wait…" : mode === "forgot" ? "Send reset link" : heading}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center text-sm text-zinc-400">
              {mode === "signin" && (
                <>
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setServerError(null);
                    }}
                    className="text-cyan-300 font-semibold hover:text-cyan-200"
                  >
                    Create one
                  </button>
                </>
              )}
              {mode === "signup" && (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setServerError(null);
                    }}
                    className="text-cyan-300 font-semibold hover:text-cyan-200"
                  >
                    Sign in
                  </button>
                </>
              )}
              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setServerError(null);
                    setServerSuccess(null);
                  }}
                  className="text-cyan-300 font-semibold hover:text-cyan-200"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
