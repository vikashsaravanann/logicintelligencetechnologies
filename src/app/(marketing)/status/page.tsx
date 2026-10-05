import React from "react";
import { Activity, CheckCircle2, AlertTriangle, XCircle, HelpCircle, Mail } from "lucide-react";
import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import {
  checkAllServices,
  overallState,
  SLOW_RESPONSE_MS,
  type ServiceState,
} from "@/lib/status/service-checks";

export const metadata: Metadata = {
  title: "System Status | Logic Intelligence Technologies",
  description:
    "Live reachability checks for Logic Intelligence Technologies services: the corporate website, VoiceShield and Logic Voice.",
};

// Re-check at most once a minute; visitors never trigger extra probes.
export const revalidate = 60;

const STATE_STYLE: Record<ServiceState, { label: string; text: string; ring: string; Icon: typeof CheckCircle2 }> = {
  OPERATIONAL: { label: "Operational", text: "text-emerald-400", ring: "border-emerald-500/30 bg-emerald-500/10", Icon: CheckCircle2 },
  DEGRADED: { label: "Degraded", text: "text-amber-400", ring: "border-amber-500/30 bg-amber-500/10", Icon: AlertTriangle },
  OUTAGE: { label: "Not responding", text: "text-rose-400", ring: "border-rose-500/30 bg-rose-500/10", Icon: XCircle },
  UNKNOWN: { label: "Unknown", text: "text-slate-400", ring: "border-slate-600/40 bg-slate-800/40", Icon: HelpCircle },
};

function formatIst(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function StatusPage() {
  const results = await checkAllServices();
  const overall = overallState(results);
  const overallStyle = STATE_STYLE[overall.state];
  const checkedAt = results[0]?.checkedAt ?? new Date().toISOString();

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-primary selection:text-slate-950 pt-32 pb-24">
      <BackToHome />
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-800 bg-slate-900/50 mb-2">
            <Activity aria-hidden className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[0.12em] text-white uppercase">System Status</h1>

          <div className={`max-w-xl mx-auto rounded-xl border p-4 ${overallStyle.ring}`} role="status">
            <h2 className={`text-lg font-mono font-bold tracking-widest uppercase ${overallStyle.text}`}>{overall.label}</h2>
            <p className="text-xs font-mono text-slate-300 mt-1">
              Last checked {formatIst(checkedAt)} IST · refreshed every 60 seconds
            </p>
          </div>
        </div>

        <section aria-labelledby="service-health" className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-800 bg-[#0a0e17]">
            <h3 id="service-health" className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              Service health
            </h3>
          </div>
          <ul className="divide-y divide-slate-800/50">
            {results.map((r) => {
              const s = STATE_STYLE[r.state];
              return (
                <li key={r.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">{r.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 break-words">{r.description}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-1">
                      {r.detail}
                      {r.latencyMs !== null && ` · ${r.latencyMs} ms`}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 shrink-0 ${s.text}`}>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest">{s.label}</span>
                    <s.Icon aria-hidden className="w-4 h-4" />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-3 text-sm text-slate-300 leading-relaxed">
          <h3 className="text-sm font-mono font-bold tracking-widest text-slate-400 uppercase">How this page works</h3>
          <p>
            Each service is checked from our servers with a single request. A service shows as operational only when it
            responds successfully; responses slower than {SLOW_RESPONSE_MS / 1000} seconds are shown as degraded. This
            page does not keep uptime history, so it reports the latest check only.
          </p>
          <p className="flex flex-wrap items-center gap-2">
            <Mail aria-hidden className="w-4 h-4 text-primary" />
            Seeing a problem this page does not show? Email{" "}
            <a className="text-primary underline underline-offset-4" href={`mailto:${COMPANY.supportEmail}`}>
              {COMPANY.supportEmail}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
