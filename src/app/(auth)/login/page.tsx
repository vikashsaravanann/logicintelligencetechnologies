"use client";

import { useState, useEffect, Suspense } from "react";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield, User, CheckCircle2, Zap, Cpu, FolderOpen, Bot } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Outfit } from "next/font/google";
import { COMPANY } from "@/config/company";
import WebGLParticles from "@/components/motion/webgl-particles";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";

const display = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type Mode = "signin" | "signup" | "forgot";

const TICKER_UNIT = "LOGIC INTELLIGENCE TECHNOLOGIES  ·  WHERE LOGIC MEETS INNOVATION  ·  ";
const TICKER = Array.from({ length: 8 }, () => TICKER_UNIT).join("");

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
    const html = document.documentElement.style.overflow;
    const body = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = html;
      document.body.style.overflow = body;
    };
  }, []);

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
    "w-full pl-11 pr-4 py-2.5 bg-white/[0.06] backdrop-blur-md border border-sky-200/20 rounded-2xl text-[14px] text-white placeholder:text-sky-100/40 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-sky-300/70 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]";

  const busy = isLoading || Boolean(oauthBusy);

  const heading =
    mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Sign in";
  const sub =
    mode === "signup"
      ? "Verify your email, then track projects, files, and support in one portal."
      : mode === "forgot"
        ? "Enter the work email on the account. We will send a secure reset link."
        : "Access the Logic Intelligence Technologies client portal.";

  const swapped = mode === "signup";
  const swapSpring = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <main
      className={`${display.className} h-[100dvh] max-h-[100dvh] w-full max-w-[100vw] text-white relative overflow-hidden`}
      style={{
        background:
          "radial-gradient(ellipse 55% 45% at 12% 18%, rgba(56,189,248,0.32), transparent 58%), radial-gradient(ellipse 48% 50% at 92% 8%, rgba(139,92,246,0.36), transparent 52%), radial-gradient(ellipse 70% 42% at 70% 108%, rgba(212,175,55,0.28), transparent 55%), #07102a",
      }}
    >
      <WebGLParticles className="z-[1]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] bg-gradient-to-t from-violet-700/25 via-sky-500/10 to-transparent blur-2xl z-[1]" />
      <div className="pointer-events-none absolute -top-24 left-1/4 w-[420px] h-[420px] rounded-full bg-sky-400/15 blur-[120px] z-[1]" />
      <div className="pointer-events-none absolute top-10 right-[12%] w-[280px] h-[280px] rounded-full bg-amber-400/12 blur-[100px] z-[1]" />

      <div className="relative z-10 h-[100dvh] max-h-[100dvh] overflow-hidden flex">
        <motion.section
          initial={false}
          animate={{ x: wide && swapped ? "100%" : 0 }}
          transition={swapSpring}
          className="w-full lg:w-1/2 h-full min-w-0 overflow-hidden flex flex-col justify-center px-4 sm:px-7 py-4"
        >
          <div className="w-full max-w-[440px] mx-auto rounded-3xl border border-white/12 login-glass p-4 sm:p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <Link href="/" className="flex items-center gap-3 mb-4 group min-w-0">
              <span className="relative shrink-0">
                <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-sky-400/60 via-amber-300/40 to-violet-500/50 blur-sm" />
                <span className="relative block w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-white">
                  <img
                    src={COMPANY.logoIconPath}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                </span>
              </span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap uppercase text-[11px] sm:text-[12.5px] font-semibold tracking-[0.16em] text-white group-hover:text-sky-200 transition-colors">
                  {COMPANY.displayName}
                </span>
                <span className="block whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.28em] text-amber-200/90 mt-1">
                  {COMPANY.tagline}
                </span>
              </span>
            </Link>

            <div className="relative rounded-[24px] border border-white/20 bg-white/[0.07] backdrop-blur-[28px] backdrop-saturate-150 p-4 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-sky-300/10 via-transparent to-violet-500/10" />
              <div className="relative">
              <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-100 mb-2.5 px-3 py-1 rounded-full border border-amber-200/25 bg-sky-400/10 backdrop-blur-md">
                Secure client portal
              </p>
              <h1 className="text-[1.65rem] sm:text-[2rem] font-semibold tracking-[-0.045em] leading-[1.05] mb-1.5">
                {heading}
              </h1>
              <p className="text-zinc-300/85 text-[13px] leading-snug mb-4 line-clamp-2">{sub}</p>

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
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin("google")}
                      disabled={busy}
                      className="flex items-center justify-center gap-2.5 min-h-10 rounded-2xl text-[13px] font-semibold bg-white hover:bg-[#f8f9fa] text-[#3c4043] disabled:opacity-50"
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
                      className="flex items-center justify-center gap-2.5 min-h-10 rounded-2xl text-[13px] font-semibold bg-[#24292f] hover:bg-[#1b1f23] text-white disabled:opacity-50"
                    >
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                      </svg>
                      {oauthBusy === "github" ? "Connecting…" : "GitHub"}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                      or work email
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                </>
              )}

              <form onSubmit={mode === "forgot" ? handleForgot : handleSubmit} noValidate className="space-y-2.5">
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
                          className="text-xs font-semibold text-sky-300 hover:text-amber-200"
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
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-sm text-[#07102a] bg-gradient-to-r from-sky-300 via-amber-200 to-violet-300 hover:brightness-110 transition-all disabled:opacity-50 mt-2 shadow-[0_10px_40px_rgba(56,189,248,0.28)]"
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

              <p className="mt-3 text-center text-sm text-zinc-500">
                {mode === "signin" && (
                  <>
                    New to the studio?{" "}
                    <button
                      type="button"
                      className="text-sky-300 font-semibold hover:text-amber-200"
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
                      className="text-sky-300 font-semibold hover:text-amber-200"
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
            </div>

            <p className="mt-3 text-[10px] text-zinc-600 text-center leading-snug">
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
        </motion.section>

        <motion.aside
          initial={false}
          animate={{ x: wide && swapped ? "-100%" : 0 }}
          transition={swapSpring}
          className={`hidden lg:flex relative w-1/2 h-full min-w-0 overflow-hidden ${swapped ? "border-r border-white/5" : "border-l border-white/10"}`}
        >
          <div className="relative h-full w-full flex flex-col justify-between px-8 xl:px-11 py-7 pb-14 overflow-hidden">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-300">
                {COMPANY.entityLabel.toUpperCase()} · COIMBATORE
              </p>
              <h2 className="mt-2.5 text-[2rem] xl:text-[2.4rem] font-semibold leading-[1.08] tracking-[-0.04em]">
                Production software.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-amber-200 to-violet-300 mt-1">
                  Practical AI.
                </span>
              </h2>
              <p className="mt-3 text-zinc-200 text-[13.5px] leading-relaxed">
                LOGIC INTELLIGENCE TECHNOLOGIES builds websites, custom systems, and private
                knowledge assistants for Indian SMBs. Sign in to the client portal — the same
                desk that runs your project, invoices, files, and Logic AI.
              </p>
              <p className="mt-2 text-zinc-400 text-[12.5px] leading-relaxed">
                Demo first. 31-point scoping so the brief does not drift. Source code is yours
                on full payment. No visiting-card titles. No unpaid “partnerships.”
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 my-4">
              {[
                { src: "/assets/jobs/ceo-desk.jpg", cap: "Studio" },
                { src: "/assets/jobs/apply-pane.jpg", cap: "Delivery" },
                { src: "/assets/briefings/knowledge-assistant.jpg", cap: "Logic AI" },
              ].map((p) => (
                <div key={p.cap} className="relative h-[88px] rounded-2xl overflow-hidden border border-white/15">
                  <Image src={p.src} alt={p.cap} fill sizes="16vw" quality={55} className="object-cover" />
                  <span className="absolute bottom-1.5 left-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white drop-shadow">
                    {p.cap}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { k: "Launch from", v: "₹8,999" },
                { k: "Pro from", v: "₹18,999" },
                { k: "Custom from", v: "₹50,000" },
                { k: "HQ", v: "Coimbatore" },
                { k: "Demo", v: "Free" },
                { k: "Source", v: "Yours" },
              ].map((s) => (
                <div
                  key={s.k}
                  className="rounded-2xl border border-white/15 login-glass-card px-2.5 py-3 text-center"
                >
                  <p className="text-[15px] xl:text-base font-black tracking-tight">{s.v}</p>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-400 mt-1">{s.k}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 my-4">
              {[
                { icon: FolderOpen, t: "After you sign in", d: "Projects, invoices, files, and tickets in one profile — not a shared inbox." },
                { icon: Bot, t: "Logic AI on your work", d: "Ask prices, RAG over our catalog, or hand off to WhatsApp with context." },
                { icon: Cpu, t: "Stack we ship on", d: "Next.js · FastAPI · Grok · pgvector. Production, not a student demo." },
                { icon: Zap, t: "How we take work", d: "31-point scope. Free demo. Pay after you see the build. Source on close." },
              ].map((b) => (
                <div key={b.t} className="rounded-2xl border border-white/12 login-glass-card p-3 flex gap-2.5">
                  <b.icon className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white">{b.t}</p>
                    <p className="text-[11.5px] text-zinc-300 mt-0.5 leading-snug">{b.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12.5px] text-zinc-300 mb-4">
              {[
                "Google or GitHub — official OAuth",
                "Staff dashboard for LIT email",
                "Encrypted session, Coimbatore HQ",
                "WhatsApp +91 93428 77474",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-300 mt-0.5 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-white/12 bg-black/40 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
              <a href={COMPANY.websiteUrl} className="hover:text-amber-200">Website</a>
              <a href={COMPANY.linkedinUrl} className="hover:text-sky-300">LinkedIn</a>
              <a href={COMPANY.telegramBotUrl} className="hover:text-violet-300">Telegram</a>
              <a href={COMPANY.instagramUrl} className="hover:text-amber-200">Instagram</a>
              <a href={`https://wa.me/${COMPANY.whatsappNumber}`} className="hover:text-sky-300">WhatsApp</a>
            </div>
          </div>
        </motion.aside>
      </div>
      <div className="absolute bottom-4 inset-x-0 z-20 overflow-hidden pointer-events-none">
        <div className="lit-ticker flex w-max">
          <p className="lit-ticker-text whitespace-nowrap text-[11px] sm:text-[13px] tracking-[0.14em] sm:tracking-[0.18em] uppercase text-sky-100/80 pr-16">{TICKER}</p>
          <p className="lit-ticker-text whitespace-nowrap text-[11px] sm:text-[13px] tracking-[0.14em] sm:tracking-[0.18em] uppercase text-sky-100/80 pr-16" aria-hidden>{TICKER}</p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[100dvh] overflow-hidden bg-[#050814] flex items-center justify-center text-zinc-400 text-sm">
          Loading portal…
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
