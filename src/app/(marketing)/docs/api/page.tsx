import React from "react";
import { Terminal, Key, Webhook, FileJson, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";

export const metadata: Metadata = {
  title: "Developer API Documentation | Logic Intelligence Technologies",
  description: "Integrate enterprise AI endpoints, real-time voice intelligence, and platform services with Logic Intelligence Technologies REST APIs.",
  alternates: {
    canonical: "/docs/api",
  },
};

export default function ApiDocsPage() {
  const codeSnippet = `curl -X POST https://api.logicintelligencetechnologies.in/v1/voice/analyze \\
  -H "Authorization: Bearer lit_live_YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "audio=@/path/to/stream.wav" \\
  -F "webhook_url=https://your-server.com/hooks/lit-ai"`;

  const jsonResponse = `{
  "id": "req_8f73b2a",
  "status": "completed",
  "verdict": "VERIFIED",
  "confidence": 0.984,
  "latency_ms": 42
}`;

  return (
    <div className="min-h-screen bg-[#07090D] text-slate-100 selection:bg-primary selection:text-slate-950 pt-32 pb-24 overflow-x-hidden">
      <BackToHome href="/products" label="Back to Products" />
      
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_top,_rgba(69,217,210,0.1),_transparent_70%)] blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-primary uppercase">
              Developer Reference v1.2
            </span>
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-tight text-white uppercase leading-[1.05]">
            Platform APIs
          </h1>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light">
            Embed real-time machine intelligence directly into your infrastructure stack. 
            Connect via secure REST or streaming WebSockets to receive instant structured classifications and entity payloads.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Endpoints & Authentication */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Auth Section */}
            <div className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-8 space-y-4">
              <h2 className="text-xs font-mono font-bold tracking-widest text-white uppercase flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                <span>Authentication</span>
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Authenticate your API requests using your secret key in the <code className="text-primary bg-[#151922] px-2 py-0.5 rounded font-mono text-xs border border-white/10">Authorization</code> header. Keys are issued following enterprise security verification.
              </p>
            </div>

            {/* Analysis Endpoint */}
            <div className="rounded-3xl border border-primary/30 bg-[#10131A] p-6 sm:p-8 space-y-4">
              <h2 className="text-xs font-mono font-bold tracking-widest text-white uppercase flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span>Analyze Audio Stream</span>
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-primary/20 text-primary rounded-md border border-primary/30">POST</span>
                <code className="text-xs text-slate-300 font-mono">/v1/voice/analyze</code>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Uploads an audio buffer for immediate DNN inference. Supports PCM, WAV, and MP3 acoustic formats. Max duration per synchronous payload is 60 seconds.
              </p>
            </div>

            {/* Webhooks Endpoint */}
            <div className="rounded-3xl border border-white/10 bg-[#10131A] p-6 sm:p-8 space-y-4">
              <h2 className="text-xs font-mono font-bold tracking-widest text-white uppercase flex items-center gap-2">
                <Webhook className="w-4 h-4 text-primary" />
                <span>Asynchronous Webhooks</span>
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Register a validated TLS webhook URL to receive asynchronous status updates and completed transcription payloads with HMAC signature verification.
              </p>
            </div>

          </div>

          {/* Right Column: Code Snippets */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Request Snippet */}
            <div className="rounded-3xl border border-white/10 bg-[#10131A] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 bg-[#151922] border-b border-white/10">
                <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">Request Example</span>
                <span className="text-[11px] font-mono text-primary font-bold">cURL</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                  <code>{codeSnippet}</code>
                </pre>
              </div>
            </div>

            {/* Response Snippet */}
            <div className="rounded-3xl border border-white/10 bg-[#10131A] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 bg-[#151922] border-b border-white/10">
                <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase flex items-center gap-2">
                  <FileJson className="w-3.5 h-3.5 text-primary" /> 
                  <span>Response Payload</span>
                </span>
                <span className="text-[11px] font-mono text-primary font-bold">200 OK</span>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-xs font-mono text-primary/90 leading-relaxed">
                  <code>{jsonResponse}</code>
                </pre>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Strict Rate Limiting &amp; TLS 1.3 Mandate</span>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary hover:bg-[#6DE6E0] text-slate-950 font-bold text-xs uppercase tracking-wider transition-all min-h-[44px]"
              >
                <span>Request API Credentials</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
