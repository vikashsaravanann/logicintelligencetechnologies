import Link from "next/link";
import { ArrowRight, Send, ChevronDown, Mic, Shield } from "lucide-react";
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
    { kicker: "Flagship Products", stat: "2 Launched", body: "Logic Voice & VoiceShield." },
    { kicker: "Company", stat: COMPANY.entityType, body: "Logic Intelligence Technologies" },
    { kicker: "Headquarters", stat: "Coimbatore", body: "Tamil Nadu, India." },
    { kicker: "Leadership", stat: "Vikash Saravanan", body: "Founder & CEO." },
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
            <div className="lit-rise flex items-center gap-3 mb-7">
              <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20 bg-[#0A1530]">
                <picture>
                  <source srcSet="/assets/logo-icon.webp 128w, /assets/logo-icon-256.webp 256w" type="image/webp" sizes="56px" />
                  <img
                    src="/assets/logo-icon.jpg"
                    alt="Logic Intelligence Technologies logo"
                    width={56}
                    height={56}
                    fetchPriority="high"
                    className="h-full w-full object-cover"
                    decoding="async"
                  />
                </picture>
              </div>
              <span className="lit-eyebrow">Logic Intelligence Technologies</span>
            </div>

            <h1 className="lit-rise lit-rise-1 font-display text-[clamp(2.25rem,1.4rem+4.6vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.025em] text-white mb-6">
              WHERE LOGIC MEETS<br className="hidden sm:block" /> INNOVATION
            </h1>

            <p className="lit-rise lit-rise-2 text-lg sm:text-xl text-white font-medium mb-4 max-w-xl">
              AI Technology Company &amp; Automation Solutions
            </p>

            <p className="lit-rise lit-rise-2 text-base text-zinc-300 leading-relaxed mb-9 max-w-xl">
              Logic Intelligence Technologies develops intelligent AI products and automation solutions.
              Creators of Logic Voice and VoiceShield.
            </p>

            <div className="lit-rise lit-rise-3 flex w-full flex-col sm:w-auto sm:flex-row items-stretch sm:items-center gap-3 mb-9">
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

            <ul className="lit-rise lit-rise-4 flex items-center gap-1" aria-label="Social profiles">
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
                    className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-primary"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Parent-first product architecture: Logic Intelligence Technologies governs both products */}
          <div className="lg:col-span-5 lit-rise lit-rise-2">
            <figure
              className="relative mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#0A1530]/80 p-5 sm:p-6 shadow-[0_30px_70px_-30px_rgba(2,8,24,0.9)]"
              aria-label="Logic Intelligence Technologies and its products Logic Voice and VoiceShield"
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(69,217,210,0.10),transparent_70%)]" />
              <div className="relative flex items-center gap-3 rounded-xl border border-primary/30 bg-[#0D1B3E] p-4">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
                  <img src="/assets/logo-icon.jpg" alt="" width={44} height={44} className="h-full w-full object-cover" decoding="async" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-white">Logic Intelligence Technologies</p>
                  <p className="text-xs text-zinc-400">Where Logic Meets Innovation</p>
                </div>
              </div>

              <svg aria-hidden viewBox="0 0 200 36" className="relative mx-auto block h-9 w-full max-w-[220px] text-primary/60" fill="none" stroke="currentColor" strokeWidth="1.25">
                <path d="M100 0 V12 M100 12 H40 V36 M100 12 H160 V36" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <div className="relative grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-[#0D1B3E] p-4">
                  <Mic className="mb-3 h-5 w-5 text-primary" aria-hidden />
                  <p className="font-display text-sm font-bold text-white">Logic Voice</p>
                  <p className="mt-1 text-xs leading-snug text-zinc-400">AI Voice Assistant</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0D1B3E] p-4">
                  <Shield className="mb-3 h-5 w-5 text-[#3DB1EA]" aria-hidden />
                  <p className="font-display text-sm font-bold text-white">VoiceShield</p>
                  <p className="mt-1 text-xs leading-snug text-zinc-400">Voice Security &amp; Risk</p>
                </div>
              </div>
            </figure>
          </div>
        </div>

        <dl className="lit-rise lit-rise-4 mt-14 lg:mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
          {facts.map((item) => (
            <div key={item.kicker} className="bg-[#0B1735] px-4 py-5 sm:px-6 sm:py-6">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary mb-2">{item.kicker}</dt>
              <dd className="font-display text-lg sm:text-xl font-bold tracking-tight text-white mb-1 break-words">{item.stat}</dd>
              <p className="text-xs sm:text-[13px] text-zinc-400 leading-snug">{item.body}</p>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex justify-center">
          <a href="#products" className="inline-flex min-h-[44px] flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white transition-colors">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Scroll to Products</span>
            <ChevronDown className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
