"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  User,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { COMPANY } from "@/config/company";
import { getClientSupabase } from "@/lib/supabase/client";
import { BackButton } from "@/components/navigation/back-button";

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

  // Allow links such as /login?mode=signup to open the sign-up form directly.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("mode");
    if (requested === "signup" || requested === "forgot") setMode(requested);
  }, []);

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
        if (cancelled || !session) return;
        // An unconfirmed account would bounce between here and the protected
        // page forever: explain instead of redirecting.
        const unconfirmed =
          !session.user.email_confirmed_at ||
          new URLSearchParams(window.location.search).get("reason") === "confirm-email";
        if (unconfirmed) {
          setServerError(
            `${session.user.email ?? "This account"} has not confirmed its email address yet. Open the confirmation link we emailed you, then sign in again.`
          );
          return;
        }
        router.replace(safeNextPath() || "/");
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
          body: JSON.stringify({
            userId: data?.user?.id,
            email: email.trim(),
            fullName: name.trim() || data?.user?.user_metadata?.full_name || null,
          }),
        }).catch(() => {});
        setServerSuccess("Account created. Check your email to verify, then sign in.");
        setMode("signin");
        setPassword("");
        setConfirm("");
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // Idempotent: covers users who signed up while SMTP was failing (no welcome ever sent)
        fetch("/api/auth/send-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: signInData?.user?.id,
            email: email.trim(),
            fullName:
              (signInData?.user?.user_metadata?.full_name as string | undefined) ||
              (signInData?.user?.user_metadata?.name as string | undefined) ||
              null,
          }),
        }).catch(() => {});
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
    "w-full min-h-11 pl-11 pr-4 py-2.5 bg-white border border-[var(--lit-border-light,#DFE7EF)] rounded-xl text-sm text-[var(--lit-ink,#121826)] placeholder:text-[var(--lit-text-muted,#52677C)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--lit-teal,#1FA9A2)]/20 focus:border-[var(--lit-teal,#1FA9A2)] transition-all shadow-2xs";
  const busy = isLoading || Boolean(oauthBusy);
  const heading =
    mode === "signup" ? "Create an account" : mode === "forgot" ? "Reset password" : "Sign in to portal";
  const sub =
    mode === "signup"
      ? "Enter your details to create a secure enterprise account."
      : mode === "forgot"
        ? "Enter your registered email address to receive a secure password reset link."
        : "Access your client project deliverables, invoices, and AI workspace.";

  if (!ready) {
    return (
      <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] flex items-center justify-center text-[var(--lit-text-muted,#52677C)] text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[var(--lit-teal,#1FA9A2)] border-t-transparent rounded-full animate-spin" />
          <span>Verifying session…</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] relative flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-6">
          <BackButton fallbackHref="/" label="Home" inline />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] bg-white shadow-sm overflow-hidden">
          {/* Left Editorial Panel */}
          <aside className="lg:col-span-5 bg-[var(--lit-navy,#0B2545)] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[var(--lit-teal,#1FA9A2)]/10 blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="relative block w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-white shrink-0">
                  <Image
                    src={COMPANY.logoIconPath}
                    alt=""
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase font-mono text-white">
                    {COMPANY.displayName}
                  </p>
                  <p className="text-[10px] tracking-wide text-cyan-300">
                    {COMPANY.tagline}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-white/10 text-cyan-300 border border-white/15 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Enterprise Portal
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 font-heading leading-tight">
                Where logic meets <span className="font-serif italic font-normal text-cyan-300">intelligence</span>.
              </h2>
              <p className="text-zinc-300 text-sm leading-relaxed mb-8">
                Sign in to view engineering sprints, download milestone documents, inspect cloud architecture, and utilize the AI workspace.
              </p>

              <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                  <span>One-tap federated sign-in via Google Workspace</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                  <span>Real-time milestone tracking and invoice vault</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                  <span>High-assurance cryptographic session tokens</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Encrypted SSL • DPDPA / GDPR</span>
              <Link href="/security" className="text-cyan-300 hover:underline">
                Security Charter
              </Link>
            </div>
          </aside>

          {/* Right Form Panel */}
          <section className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--lit-navy,#0B2545)] font-heading mb-1.5">
                {heading}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)]">
                {sub}
              </p>
            </div>

            {serverError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex gap-3 items-start">
                <Shield className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <p className="leading-snug">{serverError}</p>
              </div>
            )}
            {serverSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex gap-3 items-start">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <p className="leading-snug">{serverSuccess}</p>
              </div>
            )}

            {mode !== "forgot" && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={busy}
                    className="min-h-11 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-white text-[var(--lit-navy,#0B2545)] text-xs sm:text-sm font-semibold hover:bg-[var(--lit-cloud,#F7F9FC)] disabled:opacity-50 transition-colors shadow-2xs"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin("github")}
                    disabled={busy}
                    className="min-h-11 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[var(--lit-border-light,#DFE7EF)] bg-[#24292f] text-white text-xs sm:text-sm font-semibold hover:bg-[#2f363d] disabled:opacity-50 transition-colors shadow-2xs"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 .5C5.73.5.75 5.48.75 11.76c0 4.97 3.22 9.18 7.69 10.66.56.1.77-.24.77-.54v-1.9c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 .1.72 2.84 3.82 2.04.12-.79.4-1.33.72-1.64-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.42.1-2.96 0 0 .95-.3 3.1 1.15a10.7 10.7 0 0 1 5.64 0c2.14-1.45 3.09-1.15 3.09-1.15.6 1.54.22 2.68.11 2.96.72.79 1.16 1.79 1.16 3.02 0 4.32-2.64 5.27-5.15 5.55.41.36.77 1.06.77 2.14v3.17c0 .3.2.65.78.54A11.02 11.02 0 0 0 23.25 11.76C23.25 5.48 18.27.5 12 .5z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--lit-border-light,#DFE7EF)]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-wider font-mono">
                    <span className="px-3 bg-white text-[var(--lit-text-muted,#52677C)]">or continue with email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={mode === "forgot" ? handleForgot : handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5 font-mono">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--lit-text-muted,#52677C)]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputBase}
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </div>
                  {fieldErrors.name && <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.name}</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5 font-mono">
                  Corporate email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--lit-text-muted,#52677C)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputBase}
                    placeholder="name@company.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {fieldErrors.email && <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>}
              </div>

              {mode !== "forgot" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5 font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--lit-text-muted,#52677C)]" />
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] min-h-8 min-w-8 flex items-center justify-center"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
                  )}
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--lit-navy,#0B2545)] mb-1.5 font-mono">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--lit-text-muted,#52677C)]" />
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
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.confirm}</p>
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
                    className="text-xs text-[var(--lit-blue,#1565C0)] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full mt-2 min-h-11 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-semibold text-sm hover:bg-[var(--lit-teal,#1FA9A2)] disabled:opacity-50 transition-colors shadow-xs"
              >
                {isLoading ? "Authenticating…" : mode === "forgot" ? "Send Reset Link" : heading}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[var(--lit-text-muted,#52677C)]">
              {mode === "signin" && (
                <>
                  Need an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setServerError(null);
                    }}
                    className="text-[var(--lit-blue,#1565C0)] font-semibold hover:underline"
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
                    className="text-[var(--lit-blue,#1565C0)] font-semibold hover:underline"
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
                  className="text-[var(--lit-blue,#1565C0)] font-semibold hover:underline"
                >
                  Return to sign in
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
