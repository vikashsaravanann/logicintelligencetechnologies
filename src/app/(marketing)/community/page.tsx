import React from "react";
import { Users2, MessageSquare, Terminal, Heart, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Community | Logic Intelligence Technologies",
  description: "Peer-to-peer discussions, architect forums, and developer community for Logic Intelligence Technologies.",
};

export default function CommunityPage() {
  const topics = [
    { title: "Optimizing VoiceShield latency on edge networks", author: "j.smith_arch", replies: 24, icon: Terminal },
    { title: "Best practices for RAG with 10M+ documents", author: "data_engineer_99", replies: 18, icon: MessageSquare },
    { title: "Handling webhook retry logic safely", author: "sysadmin_alex", replies: 8, icon: Terminal },
    { title: "Voice spoofing dataset sharing request", author: "researcher_phd", replies: 42, icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 pt-32 pb-24">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_right,_rgba(16,185,129,0.05),_transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-xl mb-4">
            <Users2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-[0.12em] text-white uppercase">
            Architect Community
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Join the conversation. Connect with our core engineering team, share deployment strategies, and discuss the future of AI security with enterprise architects globally.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Forum View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-sm font-mono font-bold tracking-widest text-emerald-400 uppercase">
                Trending Discussions
              </h2>
              <button className="text-[10px] font-mono font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
                View All
              </button>
            </div>

            <div className="space-y-4">
              {topics.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl hover:border-emerald-500/30 transition-colors group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">
                      <topic.icon className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">{topic.title}</h3>
                      <p className="text-[11px] font-mono text-slate-500">Posted by @{topic.author}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-center ml-4">
                    <div className="text-lg font-mono font-bold text-emerald-400">{topic.replies}</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-500">Replies</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Join CTA */}
            <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/10 backdrop-blur-xl p-6 shadow-xl">
              <h3 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-4">
                Join the Network
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Create an account to post questions, share your code, and interact with the engineers building VoiceShield.
              </p>
              <button className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-[10px] tracking-widest uppercase transition-colors">
                Sign Up / Login
              </button>
            </div>

            {/* Top Contributors */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl">
              <h3 className="text-sm font-mono font-bold tracking-widest text-white uppercase mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                Top Contributors
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-emerald-500/30">
                      <span className="text-[10px] font-bold text-emerald-400">AM</span>
                    </div>
                    <span className="text-xs font-mono text-slate-300">alex_m</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">2.4k pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-400">DR</span>
                    </div>
                    <span className="text-xs font-mono text-slate-300">d.reynolds</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">1.1k pts</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
