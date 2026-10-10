import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Send, ChevronDown, Mic, Sparkles } from "lucide-react";
import { COMPANY } from "@/config/company";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
);

/** Hero has no opacity:0 entrances, so first paint is never blank during hydration. */
export default function HeroSection() {
  const wa = `https://wa.me/${COMPANY.whatsappNumber.replace(/\D/g, "")}`;

  const facts = [
    { kicker: "Flagship Products", stat: "Enterprise Ecosystem", body: "LIT Healthcare, Logic Voice & OmniPublisher AI." },
    { kicker: "Enterprise Entity", stat: COMPANY.entityType, body: "Logic Intelligence Technologies" },
    { kicker: "Headquarters", stat: "Coimbatore", body: "Tamil Nadu, India." },
    { kicker: "Founder & Lead", stat: "Vikash Saravanan", body: "Systems & AI Engineering." },
  ];

  return (
    <section
      id="hero"
      aria-label="Logic Intelligence Technologies - Where Logic Meets Innovation"
      className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-14 lg:pb-20"
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="lit-rise flex items-center gap-3 mb-6">
              <div className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15 bg-[#10131A] p-1.5 shadow-[0_0_20px_rgba(69,217,210,0.15)]">
                <picture>
                  <source srcSet="/assets/logo-icon.webp 128w, /assets/logo-icon-256.webp 256w" type="image/webp" sizes="48px" />
                  <img
                    src="/assets/logo-icon.jpg"
                    alt="Logic Intelligence Technologies logo"
                    width={48}
                    height={48}
                    fetchPriority="high"
                    className="h-full w-full object-cover rounded-lg"
                    decoding="async"
                  />
                </picture>
              </div>
              <span className="lit-eyebrow">Logic Intelligence Technologies</span>
            </div>

            <h1 className="lit-rise lit-rise-1 font-display text-[clamp(2.25rem,1.4rem+4.6vw,4.5rem)] font-bold leading-[1.03] tracking-[-0.025em] text-white mb-6">
              WHERE LOGIC MEETS<br className="hidden sm:block" />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#45D9D2]">
                INNOVATION
              </span>
            </h1>

            <p className="lit-rise lit-rise-2 text-lg sm:text-xl text-[#F8FAFC] font-medium mb-3 max-w-xl">
              AI Technology Company &amp; Intelligent Automation Systems
            </p>

            <p className="lit-rise lit-rise-2 text-base text-[#B5BECC] leading-relaxed mb-8 max-w-xl">
              Logic Intelligence Technologies develops intelligent AI products, connected digital infrastructure, and enterprise automation solutions.
              Architects and creators of LIT Healthcare, Logic Voice, and enterprise AI platforms.
            </p>

            <div className="lit-rise lit-rise-3 flex w-full flex-col sm:w-auto sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              <Link href="#products" className="lit-btn lit-btn-lg lit-btn-primary">
                Explore Products
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="lit-btn lit-btn-lg lit-btn--secondary"
              >
                WhatsApp Us
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>

            <ul className="lit-rise lit-rise-4 flex items-center gap-1.5" aria-label="Social profiles">
              {[
                { href: COMPANY.linkedinUrl, label: "LinkedIn", icon: LinkedinIcon },
                { href: COMPANY.instagramUrl, label: "Instagram", icon: InstagramIcon },
                { href: COMPANY.xUrl, label: "X / Twitter", icon: XIcon },
                { href: COMPANY.facebookUrl, label: "Facebook", icon: FacebookIcon },
                { href: COMPANY.telegramBotUrl, label: "Telegram", icon: Send },
              ].map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#10131A] text-[#B5BECC] transition-all hover:border-[#45D9D2]/40 hover:text-[#45D9D2] hover:bg-[#151922]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Parent-first product architecture: Logic Intelligence Technologies governs all flagship products */}
          <div className="lg:col-span-5 lit-rise lit-rise-2">
            <figure
              className="relative mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#10131A]/90 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              aria-label="Logic Intelligence Technologies and its products LIT Healthcare, Logic Voice, and OmniPublisher AI"
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(69,217,210,0.12),transparent_70%)]" />
              
              <div className="relative flex items-center gap-3 rounded-xl border border-[#45D9D2]/30 bg-[#151922] p-4 shadow-[0_0_20px_rgba(69,217,210,0.08)]">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-[#45D9D2]/30 bg-[#07090D] p-1">
                  <Image src="/assets/logo-icon.jpg" alt="" width={44} height={44} className="h-full w-full object-cover rounded-lg" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-white tracking-wide">Logic Intelligence Technologies</p>
                  <p className="text-xs text-[#45D9D2] font-mono">Core Enterprise Architecture</p>
                </div>
              </div>

              <svg aria-hidden viewBox="0 0 240 36" className="relative mx-auto block h-9 w-full max-w-[240px] text-[#45D9D2]/60" fill="none" stroke="currentColor" strokeWidth="1.25">
                <path d="M120 0 V12 M120 12 H30 V36 M120 12 H120 V36 M120 12 H210 V36" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <div className="relative grid grid-cols-3 gap-2.5">
                <div className="rounded-xl border border-white/10 bg-[#151922] p-3 text-center transition-colors hover:border-[#45D9D2]/40">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#45D9D2]/10 text-[#45D9D2]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </div>
                  <p className="font-display text-xs font-bold text-white">Healthcare</p>
                  <p className="mt-0.5 text-[10px] text-[#B5BECC] leading-tight">Smart Hospital</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#151922] p-3 text-center transition-colors hover:border-[#45D9D2]/40">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#45D9D2]/10 text-[#45D9D2]">
                    <Mic className="h-4 w-4" aria-hidden />
                  </div>
                  <p className="font-display text-xs font-bold text-white">Logic Voice</p>
                  <p className="mt-0.5 text-[10px] text-[#B5BECC] leading-tight">AI Assistant</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#151922] p-3 text-center transition-colors hover:border-[#45D9D2]/40">
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#45D9D2]/10 text-[#45D9D2]">
                    <Sparkles className="h-4 w-4" aria-hidden />
                  </div>
                  <p className="font-display text-xs font-bold text-white">OmniPublisher</p>
                  <p className="mt-0.5 text-[10px] text-[#B5BECC] leading-tight">Content AI</p>
                </div>
              </div>
            </figure>
          </div>
        </div>

        <dl className="lit-rise lit-rise-4 mt-14 lg:mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
          {facts.map((item) => (
            <div key={item.kicker} className="bg-[#10131A] px-4 py-5 sm:px-6 sm:py-6 transition-colors hover:bg-[#151922]">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#45D9D2] mb-1.5">{item.kicker}</dt>
              <dd className="font-display text-lg sm:text-xl font-bold tracking-tight text-white mb-1 break-words">{item.stat}</dd>
              <p className="text-xs sm:text-[13px] text-[#B5BECC] leading-snug">{item.body}</p>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex justify-center">
          <a href="#products" className="inline-flex min-h-[44px] flex-col items-center justify-center gap-1 text-[#B5BECC] hover:text-white transition-colors">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Scroll to Ecosystem</span>
            <ChevronDown className="h-4 w-4 animate-bounce text-[#45D9D2]" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
