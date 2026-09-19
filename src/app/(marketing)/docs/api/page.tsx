import React from "react";
import { Terminal, Key, Webhook, FileJson, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "VoiceShield API Documentation | Logic Intelligence Technologies",
  description: "Integrate real-time synthetic voice detection into your SIP/VoIP infrastructure or web application with the VoiceShield REST API.",
};

export default function ApiDocsPage() {
  const codeSnippet = `curl -X POST https://api.logicintelligencetechnologies.in/v1/voice/analyze \\
  -H "Authorization: Bearer vs_live_YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "audio=@/path/to/caller_stream.wav" \\
  -F "webhook_url=https://your-server.com/hooks/voice-shield"`;

  const jsonResponse = `{
  "id": "req_8f73b2a",
  "status": "completed",
  "risk_score": 98.5,
  "verdict": "SYNTHETIC",
  "flags": [
    "deepfake_model_elevenlabs",
    "unnatural_phase_perturbation"
  ],
  "latency_ms": 42
}`;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pt-32 pb-24">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.1),_transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">
              API Reference v1.2
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-[0.12em] text-white uppercase">
            VoiceShield API
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Embed real-time voice anti-spoofing directly into your telephony stack. 
            Send audio buffers via REST or gRPC and receive instant risk verdicts.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Endpoints & Explanations */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Auth Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl">
              <h2 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-4 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Authentication
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Authenticate your API requests using your secret key in the <code className="text-emerald-400 bg-slate-800/50 px-1 py-0.5 rounded">Authorization</code> header. Do not share this key in client-side code.
              </p>
            </div>

            {/* Analysis Endpoint */}
            <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/10 backdrop-blur-xl p-6 shadow-xl">
              <h2 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Analyze Stream
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-mono font-bold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">POST</span>
                <code className="text-xs text-slate-300 font-mono">/v1/voice/analyze</code>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Uploads an audio buffer for immediate DNN inference. Supports PCM, WAV, and MP3 formats. Max duration per request is 60 seconds.
              </p>
            </div>

            {/* Webhooks Endpoint */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl">
              <h2 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-4 flex items-center gap-2">
                <Webhook className="w-4 h-4 text-emerald-400" />
                Webhooks
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Register a webhook URL to receive asynchronous alerts when a continuous SIP stream crosses your configured risk threshold.
              </p>
            </div>

          </div>

          {/* Right Column: Code Snippets */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Request Snippet */}
            <div className="rounded-2xl border border-slate-800 bg-[#0a0e17] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Request Example</span>
                <span className="text-[10px] font-mono text-slate-500">cURL</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                  <code>{codeSnippet}</code>
                </pre>
              </div>
            </div>

            {/* Response Snippet */}
            <div className="rounded-2xl border border-slate-800 bg-[#0a0e17] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase flex items-center gap-2">
                  <FileJson className="w-3 h-3" /> Response
                </span>
                <span className="text-[10px] font-mono text-emerald-400">200 OK</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-300/80 leading-relaxed">
                  <code>{jsonResponse}</code>
                </pre>
              </div>
            </div>

            <div className="pt-6 text-right">
              <Link
                href="/voice-shield"
                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs tracking-[0.15em] uppercase transition-all"
              >
                Generate API Key <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
