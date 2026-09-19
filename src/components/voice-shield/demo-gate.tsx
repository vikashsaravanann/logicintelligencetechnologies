"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Wifi, WifiOff, Mail, ArrowLeft } from "lucide-react";
import { GlassSurface } from "@/components/ui/glass-surface";

interface VoiceShieldDemoGateProps {
  /** Whether FASTAPI_INFERENCE_URL is configured on the server */
  backendConfigured: boolean;
  /** The backend API URL — only passed when configured */
  apiUrl: string | null;
  companyEmail: string;
}

/**
 * Demo Gate Component.
 *
 * When the VoiceShield FastAPI backend is configured and reachable, this
 * component provides a launch point for the live demo.
 *
 * When it is NOT configured, it honestly communicates the status and
 * provides a path for the user to request a demo session.
 *
 * Architecture note: The live WebSocket audio demo cannot run inside this
 * component because it requires the full AudioStreamer / AudioWorklet pipeline
 * from the VoiceShield repository (imported separately). For now this gate
 * correctly communicates status without faking a demo.
 */
export default function VoiceShieldDemoGate({
  backendConfigured,
  apiUrl,
  companyEmail,
}: VoiceShieldDemoGateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-500/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Back link */}
        <Link
          href="/voice-shield"
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-10 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Back to VoiceShield
        </Link>

        {/* Product badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold tracking-[0.16em] uppercase mb-8">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
          VoiceShield Live Demo
        </div>

        <GlassSurface variant="prominent" className="p-8 text-left">
          {backendConfigured && apiUrl ? (
            /* Backend configured — show launch state */
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-emerald-400" aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Backend Connected</div>
                  <div className="text-xs text-zinc-500">VoiceShield API configured</div>
                </div>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                The VoiceShield backend is configured. The full interactive demo
                requires microphone permissions. Click below to launch the live
                AASIST-powered voice detection session.
              </p>

              <a
                href={`${apiUrl.replace(/\/$/, "")}/demo`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-[0_0_24px_rgba(6,182,212,0.25)]"
              >
                Launch Live Demo
              </a>

              <p className="mt-4 text-[11px] text-zinc-600 text-center">
                Microphone access is required. Audio is processed in real time
                and not stored by default.
              </p>
            </>
          ) : (
            /* Backend not configured — honest status */
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <WifiOff className="w-5 h-5 text-amber-400" aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    Backend Configuration Pending
                  </div>
                  <div className="text-xs text-zinc-500">
                    FASTAPI_INFERENCE_URL not configured
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                The VoiceShield real-time demo requires a dedicated FastAPI
                backend with the AASIST model loaded. This backend must run on a
                persistent server — it cannot run on Vercel serverless.
              </p>

              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                The backend has not yet been configured for this deployment. To
                experience a live demonstration, please contact the Logic
                Intelligence Technologies team.
              </p>

              <div className="space-y-3">
                <Link
                  href="/voice-shield#request-demo"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all"
                >
                  Request a Demo Session
                </Link>

                <a
                  href={`mailto:${companyEmail}?subject=VoiceShield%20Live%20Demo%20Request`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-sm font-semibold transition-all"
                >
                  <Mail className="w-4 h-4" aria-hidden />
                  Email Our Team
                </a>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[11px] text-zinc-600 font-mono">
                  <span className="text-zinc-500">Status:</span>{" "}
                  <span className="text-amber-500">PENDING_CONFIGURATION</span>
                  <br />
                  <span className="text-zinc-500">Required:</span>{" "}
                  <span className="text-zinc-400">FASTAPI_INFERENCE_URL</span>
                  <br />
                  <span className="text-zinc-500">Runtime:</span>{" "}
                  <span className="text-zinc-400">Dedicated server (Railway / Render / VPS)</span>
                </p>
              </div>
            </>
          )}
        </GlassSurface>
      </div>
    </div>
  );
}
