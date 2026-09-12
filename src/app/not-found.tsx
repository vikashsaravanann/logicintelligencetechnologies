import Link from "next/link";
import { ArrowLeft, Home, Compass, MessageSquare } from "lucide-react";
import { COMPANY } from "@/config/company";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white flex flex-col items-center justify-center relative overflow-hidden px-6 py-24 selection:bg-primary/30">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Background subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-xl text-center flex flex-col items-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-primary/10 border border-primary/20 text-primary mb-6">
          Error 404 • Page Not Found
        </span>

        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 tracking-tight mb-4">
          404
        </h1>

        <p className="text-xl sm:text-2xl font-bold text-white mb-3">
          Lost in the Digital Architecture?
        </p>

        <p className="text-sm sm:text-base text-zinc-400 mb-10 leading-relaxed max-w-md">
          The page or asset you are looking for has been relocated, refactored, or does not exist on {COMPANY.displayName}.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-black bg-primary hover:bg-primary/90 transition-all neon-btn shadow-[0_0_20px_rgba(0,191,255,0.3)]"
          >
            <Home className="w-4 h-4" />
            Back to Homepage
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Explore Services
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white bg-transparent border border-white/10 hover:border-white/20 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
