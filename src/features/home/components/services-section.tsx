"use client";
import { motion } from "framer-motion";
import { Monitor, Code, ArrowRight, Brain, Shield, Mic, Bot, Sparkles, Activity, Target, Zap, Clock, Users, Database } from "lucide-react";
import Link from "next/link";

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-24 md:py-32 bg-transparent overflow-hidden border-t border-white/5">
      {/* Background Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="h-px w-8 bg-white/20" />
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">Core AI Products</span>
            <span className="h-px w-8 bg-white/20" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-8"
          >
            Next-Generation <br />
            <span className="text-white opacity-90 font-light">Intelligent Systems</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Explore our flagship AI products designed to automate communication, secure interactions, and drive unprecedented business growth. Engineered for scale and precision.
          </motion.p>
        </div>

        {/* 3-Column Vertical Rectangle Layout (Like Packages) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* 1. VoiceShield */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className="group relative rounded-3xl p-8 lg:p-10 flex flex-col h-full bg-[#04120a] border border-emerald-900/50 shadow-[0_0_40px_rgba(4,30,15,0.8)] overflow-hidden hover:-translate-y-2 transition-transform duration-500"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-[#04120a] to-[#04120a] pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10 flex-grow">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-xl bg-emerald-950 border border-emerald-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Shield className="w-7 h-7 text-emerald-400" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-800/50 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                  Enterprise Security
                </span>
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight font-sans drop-shadow-md">
                VoiceShield
              </h3>
              <p className="text-sm text-emerald-100/60 leading-relaxed mb-8 font-medium">
                AI-Powered Voice Security & Compliance Intelligence. Defend against deepfakes, synthetic voices, and spoofing attacks in real-time.
              </p>

              {/* Informative Stats Block */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-lg p-3">
                  <div className="text-emerald-400 font-bold text-lg">99.9%</div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-100/50 mt-1">Detection Rate</div>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-900/50 rounded-lg p-3">
                  <div className="text-emerald-400 font-bold text-lg">&lt;200ms</div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-100/50 mt-1">Processing Latency</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4">Core Capabilities</h4>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <Activity className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-emerald-50/80">Real-time deepfake & AI voice detection via PCM streaming</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Code className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-emerald-50/80">Acoustic fingerprinting and anti-spoofing countermeasures</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Shield className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-emerald-50/80">Zero-trust architecture with complete data isolation</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Best Suited For</h4>
                <p className="text-xs text-emerald-100/50 font-medium">Call centers, Financial institutions, Identity verification platforms, and high-security enterprise networks.</p>
              </div>
            </div>

            <div className="relative z-10 mt-10 pt-6 border-t border-emerald-900/50">
              <Link href="/voice-shield" className="inline-flex items-center justify-center w-full gap-2 text-sm font-bold text-emerald-50 bg-emerald-600/20 border border-emerald-500/30 rounded-xl py-4 group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-400 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                Explore VoiceShield
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* 2. AI Website Agent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative rounded-3xl p-8 lg:p-10 flex flex-col h-full bg-[#050B14] border border-blue-900/50 shadow-[0_0_40px_rgba(5,15,40,0.8)] overflow-hidden hover:-translate-y-2 transition-transform duration-500"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-[#050B14] to-[#050B14] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-cyan-500/20 transition-colors duration-700" />
            <div className="absolute top-0 right-0 w-full h-full bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10 flex-grow">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-xl bg-blue-950/50 border border-blue-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <Monitor className="w-7 h-7 text-cyan-400" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-900/40 border border-blue-800/50 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  Lead Conversion
                </span>
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                AI Website Agent
              </h3>
              <p className="text-sm text-blue-100/60 leading-relaxed mb-8 font-medium">
                Turn website visitors into conversations, automatically qualify leads, and drive sales 24/7 without human intervention.
              </p>

              {/* Informative Stats Block */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3">
                  <div className="text-cyan-400 font-bold text-lg">3x</div>
                  <div className="text-[10px] uppercase tracking-wider text-blue-100/50 mt-1">Lead Capture Rate</div>
                </div>
                <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3">
                  <div className="text-cyan-400 font-bold text-lg">24/7</div>
                  <div className="text-[10px] uppercase tracking-wider text-blue-100/50 mt-1">Autonomous Support</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4">Core Capabilities</h4>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <Bot className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-blue-50/80">Intelligent context-aware conversation engine with RAG memory</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-blue-50/80">Automated lead qualification and direct CRM pipeline entry</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Database className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-blue-50/80">Multi-language support trained directly on your business data</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-3">Best Suited For</h4>
                <p className="text-xs text-blue-100/50 font-medium">B2B SaaS companies, Real Estate agencies, E-commerce storefronts, and High-ticket service providers.</p>
              </div>
            </div>

            <div className="relative z-10 mt-10 pt-6 border-t border-blue-900/50">
              <Link href="/products/ai-website-agents" className="inline-flex items-center justify-center w-full gap-2 text-sm font-bold text-blue-50 bg-blue-600/20 border border-blue-500/30 rounded-xl py-4 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                Deploy Website Agent
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* 3. AI Voice Agent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative rounded-3xl p-8 lg:p-10 flex flex-col h-full bg-[#0D0514] border border-purple-900/50 shadow-[0_0_40px_rgba(20,5,35,0.8)] overflow-hidden hover:-translate-y-2 transition-transform duration-500"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0D0514] to-[#0D0514] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-600/10 blur-[90px] rounded-full pointer-events-none group-hover:bg-fuchsia-600/20 transition-colors duration-700" />
            <div className="absolute top-0 right-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10 flex-grow">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-xl bg-purple-950/50 border border-purple-800/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Mic className="w-7 h-7 text-fuchsia-400" />
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-900/40 border border-purple-800/50 text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest">
                  Audio Intelligence
                </span>
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                AI Voice Agent
              </h3>
              <p className="text-sm text-purple-100/60 leading-relaxed mb-8 font-medium">
                Your AI-powered front desk for calls, inbound enquiries, and calendar scheduling over the phone.
              </p>

              {/* Informative Stats Block */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-purple-950/30 border border-purple-900/50 rounded-lg p-3">
                  <div className="text-fuchsia-400 font-bold text-lg">&lt;800ms</div>
                  <div className="text-[10px] uppercase tracking-wider text-purple-100/50 mt-1">Response Latency</div>
                </div>
                <div className="bg-purple-950/30 border border-purple-900/50 rounded-lg p-3">
                  <div className="text-fuchsia-400 font-bold text-lg">∞</div>
                  <div className="text-[10px] uppercase tracking-wider text-purple-100/50 mt-1">Concurrent Calls</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest mb-4">Core Capabilities</h4>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <Brain className="w-4 h-4 text-fuchsia-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-purple-50/80">Human-like conversational AI with intent classification</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Mic className="w-4 h-4 text-fuchsia-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-purple-50/80">Ultra-low latency WebSocket streaming & SIP trunking</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Clock className="w-4 h-4 text-fuchsia-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-purple-50/80">Live calendar booking and real-time CRM integrations</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-fuchsia-500 uppercase tracking-widest mb-3">Best Suited For</h4>
                <p className="text-xs text-purple-100/50 font-medium">Customer support lines, Outbound sales teams, Healthcare front-desks, and appointment routing.</p>
              </div>
            </div>

            <div className="relative z-10 mt-10 pt-6 border-t border-purple-900/50">
              <Link href="/products/ai-voice-agents" className="inline-flex items-center justify-center w-full gap-2 text-sm font-bold text-purple-50 bg-purple-600/20 border border-purple-500/30 rounded-xl py-4 group-hover:bg-fuchsia-500 group-hover:text-white group-hover:border-fuchsia-400 transition-all duration-300 shadow-[0_0_15px_rgba(217,70,239,0.15)] group-hover:shadow-[0_0_25px_rgba(217,70,239,0.4)]">
                Start Voice Agent
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
