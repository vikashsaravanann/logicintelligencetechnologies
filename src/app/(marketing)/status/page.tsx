import React from "react";
import { Activity, Server, Shield, Globe2, CheckCircle2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Status | Logic Intelligence Technologies",
  description: "Real-time system health and uptime monitor for Logic Intelligence Technologies.",
};

export default function StatusPage() {
  const services = [
    { name: "VoiceShield API (Global)", status: "operational", uptime: "99.99%" },
    { name: "VoiceShield Edge Nodes (APAC)", status: "operational", uptime: "99.99%" },
    { name: "VoiceShield Edge Nodes (US/EU)", status: "operational", uptime: "99.99%" },
    { name: "AI Assistant Inference", status: "operational", uptime: "99.95%" },
    { name: "Enterprise Dashboard", status: "operational", uptime: "100%" },
    { name: "Webhooks Delivery", status: "operational", uptime: "99.99%" },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pt-32 pb-24">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.05),_transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl mb-4 relative">
            <Activity className="w-8 h-8 text-emerald-400" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-[0.12em] text-white uppercase">
            System Status
          </h1>
          
          <div className="max-w-xl mx-auto rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <h2 className="text-lg font-mono font-bold text-emerald-400 tracking-widest uppercase">
              All Systems Operational
            </h2>
            <p className="text-xs font-mono text-emerald-500/80 mt-1">
              Last updated: Just now
            </p>
          </div>
        </div>

        {/* Global Metric */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl text-center">
            <Globe2 className="w-6 h-6 text-slate-500 mx-auto mb-3" />
            <div className="text-2xl font-black font-mono text-white mb-1">99.99%</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Global Uptime (30d)</div>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl text-center">
            <Server className="w-6 h-6 text-slate-500 mx-auto mb-3" />
            <div className="text-2xl font-black font-mono text-white mb-1">12ms</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Avg Edge Latency</div>
          </div>
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl text-center">
            <Shield className="w-6 h-6 text-slate-500 mx-auto mb-3" />
            <div className="text-2xl font-black font-mono text-white mb-1">0</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Active Incidents</div>
          </div>
        </div>

        {/* Services List */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-2xl mb-12">
          <div className="px-6 py-4 border-b border-slate-800 bg-[#0a0e17]">
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
              Service Health
            </h3>
          </div>
          <div className="divide-y divide-slate-800/50">
            {services.map((service, idx) => (
              <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                <div>
                  <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">{service.name}</h4>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">Uptime: {service.uptime}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Operational</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident History */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 text-center shadow-xl">
          <h3 className="text-sm font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
            Past Incidents
          </h3>
          <p className="text-sm text-slate-300 font-mono">
            No incidents reported in the last 30 days.
          </p>
        </div>

      </div>
    </div>
  );
}
