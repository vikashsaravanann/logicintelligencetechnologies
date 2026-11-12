"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientSupabase } from "@/lib/supabase/client";

type VerifiedFactor = { id: string; friendly_name?: string };

function safeStaffDestination(): string {
  if (typeof window === "undefined") return "/staff/dashboard";
  const value = new URLSearchParams(window.location.search).get("next");
  if (!value || !value.startsWith("/staff/") || value.startsWith("//") ||
      value.includes("\\") || value.includes("\r") || value.includes("\n")) {
    return "/staff/dashboard";
  }
  if (value.startsWith("/staff/mfa/challenge") || value.startsWith("/staff/setup-password")) {
    return "/staff/dashboard";
  }
  return value;
}

export function MfaChallengeClient() {
  const router = useRouter();
  const supabase = useMemo(() => getClientSupabase(), []);
  const [factors, setFactors] = useState<VerifiedFactor[]>([]);
  const [selectedFactor, setSelectedFactor] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (cancelled) return;
      if (assurance.error) {
        setError("Unable to check your authenticator. Please retry.");
        setLoading(false);
        return;
      }
      if (assurance.data.currentLevel === "aal2") {
        router.replace(safeStaffDestination());
        router.refresh();
        return;
      }
      const { data, error: factorError } = await supabase.auth.mfa.listFactors();
      if (cancelled) return;
      if (factorError) {
        setError("Unable to load enrolled authenticators.");
      } else {
        const verified = (data?.totp || []).filter((factor) => factor.status === "verified");
        setFactors(verified);
        setSelectedFactor(verified[0]?.id || "");
      }
      setLoading(false);
    })().catch(() => {
      if (!cancelled) {
        setError("Unable to load authentication status.");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [router, supabase]);

  async function verify() {
    if (!selectedFactor || !/^\d{6}$/.test(code.trim())) {
      setError("Choose an authenticator and enter its six-digit code.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: selectedFactor,
        code: code.trim(),
      });
      if (verifyError) {
        setError("Unable to verify the code. Please check your authenticator and try again.");
        return;
      }
      const { data: level, error: levelError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (levelError || level.currentLevel !== "aal2") {
        setError("Verification completed, but the new secure session is not ready. Try again.");
        return;
      }
      router.replace(safeStaffDestination());
      router.refresh();
    } catch {
      setError("Authentication request failed. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p role="status" className="text-sm text-slate-600">Checking authenticator…</p>;

  return (
    <div className="space-y-4">
      {factors.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No verified authenticator is available for this account.{" "}
          <Link className="font-semibold underline" href="/staff/settings/security/mfa">
            Enroll an authenticator
          </Link>
        </div>
      ) : (
        <>
          {factors.length > 1 ? (
            <label className="block text-sm font-semibold text-slate-800">
              Authenticator
              <select value={selectedFactor} onChange={(e) => setSelectedFactor(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-3">
                {factors.map((factor) => (
                  <option key={factor.id} value={factor.id}>
                    {factor.friendly_name || "Authenticator"}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="block text-sm font-semibold text-slate-800">
            Six-digit authenticator code
            <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}"
              maxLength={6} value={code} onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-base"
              placeholder="000000" aria-label="Authenticator code" />
          </label>
          <button type="button" onClick={verify} disabled={busy}
            className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "Verifying…" : "Verify and continue"}
          </button>
        </>
      )}
      {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
      <p className="text-xs text-slate-600">
        Lost access to your authenticator? Contact your authorized LIT account administrator.
        Do not share codes with anyone.
      </p>
    </div>
  );
}
