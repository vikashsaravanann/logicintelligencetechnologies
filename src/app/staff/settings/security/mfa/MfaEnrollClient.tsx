"use client";

import { useEffect, useState } from "react";
import { getClientSupabase } from "@/lib/supabase/client";

type Factor = { id: string; friendly_name?: string; factor_type: string; status: string };

export function MfaEnrollClient() {
  const supabase = getClientSupabase();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const { data, error: listErr } = await supabase.auth.mfa.listFactors();
    if (listErr) {
      setError(listErr.message);
      return;
    }
    const all = [...(data?.totp || []), ...(data?.all || [])].filter(
      (f, i, arr) => arr.findIndex((x) => x.id === f.id) === i
    );
    setFactors(all as Factor[]);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEnroll() {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "LIT Authenticator",
      });
      if (enrollErr) {
        setError(enrollErr.message);
        return;
      }
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (e: any) {
      setError(e?.message || "Enrollment failed");
    } finally {
      setBusy(false);
    }
  }

  async function verifyEnroll() {
    if (!factorId || code.length < 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        setError(challenge.error.message);
        return;
      }
      const verified = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: code.trim(),
      });
      if (verified.error) {
        setError(verified.error.message);
        return;
      }
      setOk("Authenticator enrolled successfully.");
      setQr(null);
      setSecret(null);
      setFactorId(null);
      setCode("");
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  async function unenroll(id: string) {
    if (!confirm("Remove this authenticator factor?")) return;
    setBusy(true);
    setError(null);
    try {
      const { error: uErr } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (uErr) setError(uErr.message);
      else {
        setOk("Factor removed.");
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Enrollment status</h2>
        <p className="mt-1 text-sm text-slate-600">
          {verified.length > 0
            ? `${verified.length} verified authenticator factor(s).`
            : "No verified authenticator enrolled."}
        </p>
        {verified.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {verified.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <span>
                  {f.friendly_name || "Authenticator"} · {f.factor_type} · {f.status}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => unenroll(f.id)}
                  className="text-xs font-medium text-rose-700 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!qr ? (
        <button
          type="button"
          disabled={busy}
          onClick={startEnroll}
          className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Starting…" : "Enroll authenticator app"}
        </button>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Scan QR code</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="TOTP QR code" className="h-48 w-48 rounded-lg border border-slate-200 bg-white" />
          {secret ? (
            <p className="break-all font-mono text-xs text-slate-600">
              Manual key: {secret}
            </p>
          ) : null}
          <label className="block text-xs font-medium text-slate-700">
            Verification code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="mt-1 w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="6-digit code"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={verifyEnroll}
            className="rounded-lg bg-[var(--lit-teal,#1FA9A2)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Verifying…" : "Verify and enable"}
          </button>
        </section>
      )}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}
      {ok ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{ok}</p>
      ) : null}
    </div>
  );
}
