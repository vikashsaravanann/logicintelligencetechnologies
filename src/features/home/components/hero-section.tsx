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
      id="home"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-[#0A0F1E] pt-28 md:pt-36 pb-16"
    >
      <div className="absolute inset-0 z-0">
        <PageBackdrop src="/assets/backdrops/home-hero.jpg" />
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">
        <div className="max-w-4xl flex flex-col items-center mt-4">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_rgba(0,191,255,0.3)] bg-black">
              <picture>
                <source srcSet="/assets/logo-icon.webp 128w, /assets/logo-icon-256.webp 256w" type="image/webp" sizes="(max-width: 640px) 96px, 112px" />
                <img
                  src="/assets/logo-icon.jpg"
                  alt="Logic Intelligence Technologies"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </picture>
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 bg-white/5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-white">
                {COMPANY.legalName}
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            {COMPANY.tagline.split(" ").slice(0, 3).join(" ")}{" "}
            <br className="hidden sm:block" />
            <span className="inline-block text-white pb-2">
              {COMPANY.tagline.split(" ").slice(3).join(" ")}
            </span>
          </h1>

          <h2 className="text-xl md:text-3xl font-bold text-white mb-6">
            Web &amp; AI development for Coimbatore businesses.
          </h2>

          <p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto leading-relaxed mb-10">
            Founded by an AI &amp; Data Science specialist, we build custom websites, e-commerce
            stores, and software with transparent pricing — and a free demo before you pay anything.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto relative z-30 mb-16">
            <a
              href="#services"
              className="bg-white text-black px-8 py-3.5 rounded-xl text-sm font-bold w-full sm:w-auto text-center flex items-center justify-center gap-2 group hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
            >
              View Our Services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-[#04120a] bg-[#25D366] hover:bg-[#20bd5c] transition-colors w-full sm:w-auto cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 448 512" aria-hidden>
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 415.2c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 334.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 186.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 17.6-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
              WhatsApp Us Now
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 mb-16">
            <a href={COMPANY.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-zinc-400 hover:text-[#0a66c2] transition-colors"><LinkedinIcon className="w-5 h-5" /></a>
            <a href={COMPANY.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-zinc-400 hover:text-[#e1306c] transition-colors"><InstagramIcon className="w-5 h-5" /></a>
            <a href={COMPANY.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-zinc-400 hover:text-[#1877f2] transition-colors"><FacebookIcon className="w-5 h-5" /></a>
            <a href={COMPANY.telegramBotUrl} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-zinc-400 hover:text-[#2aabee] transition-colors"><Send className="w-5 h-5" /></a>
          </div>

          <div className="w-full max-w-5xl">
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {[
                { kicker: "Scope", stat: "31 points", body: "Every paid project is written down before a rupee moves." },
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
