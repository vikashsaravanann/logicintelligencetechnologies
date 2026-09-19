"use client";

import { ArrowRight, Send, ChevronDown } from "lucide-react";
import { COMPANY } from "@/config/company";
import PageBackdrop from "@/components/ui/page-backdrop";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

/** Hero has no opacity:0 entrances — avoids blank first paint on hydration lag. */
export default function HeroSection() {
  const wa = `https://wa.me/${COMPANY.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <section
      id="hero"
      aria-label="Logic Intelligence Technologies - Where Logic Meets Innovation"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-transparent pt-28 md:pt-36 pb-16"
    >
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">
        <div className="max-w-4xl flex flex-col items-center mt-4">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_rgba(0,191,255,0.3)] bg-black">
              <picture>
                <source srcSet="/assets/logo-icon.webp 128w, /assets/logo-icon-256.webp 256w" type="image/webp" sizes="(max-width: 640px) 96px, 112px" />
                <img
                  src="/assets/logo-icon.jpg"
                  alt="Logic Intelligence Technologies logo"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  decoding="async"
                />
              </picture>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-300 uppercase">Logic Intelligence Technologies</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] mb-6">
            WHERE LOGIC MEETS<br className="hidden sm:block" /> INNOVATION
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white font-medium mb-4 max-w-2xl">
            Web &amp; AI development for Coimbatore businesses.
          </p>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-10 max-w-2xl">
            Founded by an AI &amp; Data Science specialist, we build custom websites, e-commerce
            stores, and software with transparent pricing — and a free demo before you pay
            anything.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-10">
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-100 transition-colors"
            >
              Explore Solutions
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white text-sm font-bold hover:bg-[#1ebe57] transition-colors"
            >
              WhatsApp Us Now
            </a>
          </div>

          <div className="flex items-center gap-5 mb-12">
            <a href={COMPANY.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-zinc-400 hover:text-[#0a66c2] transition-colors"><LinkedinIcon className="w-5 h-5" /></a>
            <a href={COMPANY.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-zinc-400 hover:text-[#e1306c] transition-colors"><InstagramIcon className="w-5 h-5" /></a>
            <a href={COMPANY.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-zinc-400 hover:text-[#1877f2] transition-colors"><FacebookIcon className="w-5 h-5" /></a>
            <a href={COMPANY.telegramBotUrl} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-zinc-400 hover:text-[#2aabee] transition-colors"><Send className="w-5 h-5" /></a>
          </div>

          <div className="w-full max-w-5xl">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              {[
                { kicker: "Scope", stat: "50 points", body: "Every paid project is written down before a rupee moves." },
                { kicker: "Floor", stat: "₹8,999", body: "Digital Launch pack. Published price. Never invented on a call." },
                { kicker: "Proof", stat: "Free demo", body: "You see a working prototype before you pay anything." },
                { kicker: "Studio", stat: "Coimbatore", body: "Local team. Clear English. On-site when the work needs it." },
              ].map((item) => (
                <div
                  key={item.kicker}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 sm:px-5 py-5 sm:py-6 hover:border-cyan-400/35 hover:bg-white/[0.06] transition-colors"
                >
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300 mb-2">{item.kicker}</dt>
                  <dd className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5 whitespace-nowrap">{item.stat}</dd>
                  <p className="text-[12px] sm:text-sm text-zinc-400 leading-snug">{item.body}</p>
                </div>
              ))}
            </dl>
            <a href="#services" className="mt-10 inline-flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors">
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase">Scroll</span>
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
