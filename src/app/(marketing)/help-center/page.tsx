import React from "react";
import { LifeBuoy, FileText, Wrench, Search, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enterprise Help Center | Logic Intelligence Technologies",
  description: "Support dashboard, FAQs, and troubleshooting guides for Logic Intelligence Technologies clients.",
};

export default function HelpCenterPage() {
  const faqs = [
    {
      q: "How do I cycle my API keys?",
      a: "Navigate to your enterprise dashboard under Settings > Security. Click 'Generate New Key' and update your `.env` securely.",
    },
    {
      q: "What is the SLA for VoiceShield?",
      a: "Enterprise tier includes a 99.99% uptime guarantee with sub-50ms latency. See the Status page for real-time monitoring.",
    },
    {
      q: "Can I deploy the AI models on-premise?",
      a: "Yes. For maximum privacy and zero latency, we offer bare-metal Docker container deployments for enterprise clients.",
    },
    {
      q: "Who do I contact for an emergency?",
      a: "Tier 1 customers receive a dedicated 24/7 hotline and a private Slack/Teams channel directly to our Site Reliability Engineers.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pt-32 pb-24">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.05),_transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl mb-4">
            <LifeBuoy className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-[0.12em] text-white uppercase">
            Enterprise Support
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Find answers to technical questions, troubleshooting guides, or submit a priority support ticket to our engineering team.
          </p>

          <div className="max-w-xl mx-auto relative mt-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-emerald-500/50" />
            </div>
            <input
              type="text"
              placeholder="Search guides, error codes, and FAQs..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-colors shadow-2xl"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content: FAQs */}
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-lg font-mono font-bold tracking-widest text-white uppercase flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6">
                  <h3 className="text-sm font-mono font-bold text-white mb-3">{faq.q}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Ticket Box */}
            <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/10 backdrop-blur-xl p-6 shadow-xl">
              <Wrench className="w-6 h-6 text-emerald-400 mb-4" />
              <h3 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-2">
                Submit a Ticket
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Encountering an issue? Submit a priority ticket directly to our L3 support engineers.
              </p>
              <Link
                href="/support"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-[10px] tracking-widest uppercase transition-colors"
              >
                Open Ticket <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Documentation Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl">
              <FileText className="w-6 h-6 text-slate-400 mb-4" />
              <h3 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-2">
                Developer Docs
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Read the API reference for integration guides and webhook specifications.
              </p>
              <Link
                href="/docs/api"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 font-mono font-bold text-[10px] tracking-widest uppercase transition-colors"
              >
                View API Docs
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
