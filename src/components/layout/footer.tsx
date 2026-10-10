"use client";
import { Mail, Phone, Send, ArrowRight } from "lucide-react";
import Link from "next/link";
import { COMPANY } from "@/config/company";
import { useState } from "react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);

const TwitterXIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.004 2C6.48 2 2 6.48 2 12s4.48 10 10.004 10c2.87 0 5.48-1.22 7.33-3.17l-1.92-1.63c-1.4 1.48-3.37 2.4-5.41 2.4-4.2 0-7.6-3.41-7.6-7.6s3.4-7.6 7.6-7.6c3.84 0 7.02 2.85 7.53 6.55H12v2.4h9.94c-.58 5.74-5.38 10.05-11.19 9.84-5.46-.2-9.75-4.83-9.75-10.39C1 6.38 6.38 1 12.004 1c3.08 0 5.86 1.25 7.86 3.26l-1.89 1.88C16.48 4.67 14.34 3.75 12.004 3.75z" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const socialLinks = [
  { icon: LinkedinIcon, label: "LINKEDIN", href: COMPANY.linkedinUrl, hoverColor: "group-hover:text-[#0a66c2]" },
  { icon: TwitterXIcon, label: "X (TWITTER)", href: COMPANY.twitterUrl, hoverColor: "group-hover:text-primary" },
  { icon: InstagramIcon, label: "INSTAGRAM", href: COMPANY.instagramUrl, hoverColor: "group-hover:text-primary" },
  { icon: YoutubeIcon, label: "YOUTUBE", href: COMPANY.youtubeUrl, hoverColor: "group-hover:text-[#ff0000]" },
  { icon: FacebookIcon, label: "FACEBOOK", href: COMPANY.facebookUrl, hoverColor: "group-hover:text-[#1877f2]" },
  { icon: ThreadsIcon, label: "THREADS", href: COMPANY.threadsUrl, hoverColor: "group-hover:text-white" },
  { icon: WhatsappIcon, label: "WHATSAPP", href: COMPANY.whatsappGroupUrl, hoverColor: "group-hover:text-[#25d366]" },
  { icon: TelegramIcon, label: "TELEGRAM", href: COMPANY.telegramBotUrl, hoverColor: "group-hover:text-[#0088cc]" },
  { icon: GithubIcon, label: "GITHUB", href: COMPANY.githubUrl, hoverColor: "group-hover:text-white" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        signal: AbortSignal.timeout(20000),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Subscription failed. Please try again.");
      }
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to subscribe right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#0A1530] pt-20 pb-10 border-t border-white/[0.06] relative overflow-hidden">

      <div aria-hidden className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.5] bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(8,148,222,0.10),transparent_70%)]" />

      <div className="mx-auto max-w-[1400px] px-6 lg:px-8 relative z-10">

        {/* Main Grid: Custom column widths for better proportion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 mb-14">

          {/* Column 1: Brand */}
          <div className="flex flex-col gap-8 overflow-hidden lg:col-span-3">
            <Link href="/" className="flex items-center gap-3 group w-full">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center overflow-hidden ring-1 ring-white/15 shrink-0">
                <div className="w-full h-full bg-[#0A1530] rounded-full flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={COMPANY.logoIconPath}
                    alt="Logo"
                    className="w-full h-full object-cover "
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = '<span class="font-bold text-white">LIT</span>';
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center min-w-0">
                <span className="text-[10px] lg:text-[11px] xl:text-xs font-bold text-white tracking-widest leading-tight uppercase">
                  LOGIC INTELLIGENCE TECHNOLOGIES
                </span>
              </div>
            </Link>

            <ul className="flex flex-col gap-3 mt-2">
              {[
                "LIT HEALTHCARE PLATFORM",
                "INTELLIGENT AI PRODUCTS",
                "AUTOMATION SOLUTIONS",
                "VOICE-FIRST AI & ASSISTANTS",
                "ENTERPRISE AI ARCHITECTURE"
              ].map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs xl:text-sm text-zinc-400 leading-relaxed font-medium uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Products */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <h3 className="text-primary font-semibold text-[11px] uppercase tracking-[0.2em]">
              PRODUCTS
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'LIT HEALTHCARE', href: '/healthcare' },
                { label: 'HEALTHCARE PLANS', href: '/healthcare/plans' },
                { label: 'LOGIC VOICE', href: '/products/logic-voice' },
                { label: 'ALL PRODUCTS', href: '/products' },
                { label: 'AI ASSISTANT', href: '/ai' },
                { label: 'PRICING', href: '/pricing' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-zinc-400 hover:text-white text-xs xl:text-[13px] uppercase tracking-[0.1em] font-medium flex items-center gap-3 group transition-colors truncate">
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-7 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary shrink-0" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300 truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <h3 className="text-primary font-semibold text-[11px] uppercase tracking-[0.2em]">
              SOLUTIONS
            </h3>
            <ul className="flex flex-col gap-2.5">
              {['AI INTEGRATION', 'WEB DEVELOPMENT', 'MOBILE APPS', 'UI/UX DESIGN', 'CUSTOM SOFTWARE'].map((item) => (
                <li key={item}>
                  <Link href="/services" className="text-zinc-400 hover:text-white text-xs xl:text-[13px] uppercase tracking-[0.1em] font-medium flex items-center gap-3 group transition-colors truncate">
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-7 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 shrink-0" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300 truncate">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <h3 className="text-primary font-semibold text-[11px] uppercase tracking-[0.2em]">
              COMPANY
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: 'ABOUT US', href: '/about' },
                { label: 'FOUNDER', href: '/about/founder' },
                { label: 'OUR WORK', href: '/work' },
                { label: 'CAREERS', href: '/careers' },
                { label: 'CONTACT', href: '/contact' },
                { label: 'TERMS OF SERVICE', href: '/terms' },
                { label: 'PRIVACY POLICY', href: '/privacy' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-zinc-400 hover:text-white text-xs xl:text-[13px] uppercase tracking-[0.1em] font-medium flex items-center gap-3 group transition-colors truncate">
                    <ArrowRight className="w-4 h-4 opacity-0 -ml-7 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary shrink-0" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300 truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Stay Connected & Newsletter */}
          <div className="flex flex-col gap-8 overflow-hidden lg:col-span-3">
            <h3 className="text-primary font-semibold text-[11px] uppercase tracking-[0.2em]">
              STAY CONNECTED
            </h3>
            <p className="text-xs xl:text-sm text-zinc-400 leading-relaxed uppercase tracking-wider">
              SUBSCRIBE TO OUR NEWSLETTER FOR THE LATEST UPDATES ON AI AND DEVELOPMENT.
            </p>

            <form onSubmit={handleSubscribe} className="relative mt-1 w-full" noValidate={false}>
              <input
                type="email"
                aria-label="Email address"
                autoComplete="email"
                placeholder="ENTER YOUR EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0D1B3E] border border-white/15 rounded-[10px] px-4 min-h-[44px] text-xs xl:text-sm text-white placeholder:text-zinc-500 placeholder:uppercase placeholder:tracking-widest focus-visible:outline-2 focus-visible:outline-primary focus:border-primary/60 transition-colors pr-14"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1 top-1 bottom-1 w-11 bg-primary rounded-lg flex items-center justify-center text-[#0D1B3E] hover:bg-[#6DE6E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Subscribe"
                aria-label="Subscribe to newsletter"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
            {subscribed && (
              <p role="status" className="text-xs text-primary font-bold uppercase tracking-widest">THANK YOU FOR SUBSCRIBING!</p>
            )}
            {error && (
              <p role="alert" className="text-xs text-red-400 font-bold uppercase tracking-widest">{error}</p>
            )}

            <div className="flex items-center gap-2.5 mt-2 flex-wrap">
              {socialLinks.map(({ icon: Icon, label, href, hoverColor }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 transition-colors hover:bg-white/10 hover:border-primary/40 group shrink-0"
                  title={label}
                >
                  <Icon className={`w-4 h-4 transition-colors ${hoverColor}`} aria-hidden />
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Contact Info Row Centered under Solutions & Company */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 mb-10 pt-8 border-t border-white/[0.07] w-full">
          <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-3 text-sm xl:text-base text-zinc-400 hover:text-white transition-colors group tracking-wide"><div className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:text-primary transition-colors shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <span className="lowercase">{COMPANY.email}</span>
          </a>
          <a href={`tel:${COMPANY.phone}`} className="flex items-center gap-3 text-sm xl:text-base text-zinc-400 hover:text-white transition-colors group tracking-wide"><div className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:text-primary transition-colors shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <span>{COMPANY.phone}</span>
          </a>
        </div>

        {/* Bottom Banner */}
        <div className="pt-8 pb-20 md:pb-16 md:px-16 border-t border-white/[0.07] flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/status" className="flex items-center gap-3 min-h-[44px] text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white transition-colors">
             <span aria-hidden className="w-2 h-2 rounded-full bg-primary" />
             System status
          </Link>

          <p className="text-[10px] sm:text-xs text-zinc-400 text-center md:text-right uppercase tracking-widest leading-relaxed">
            © {new Date().getFullYear()} {COMPANY.legalName}. ALL RIGHTS RESERVED.<br className="md:hidden" />

          </p>
        </div>

      </div>
    </footer>
  );
}
