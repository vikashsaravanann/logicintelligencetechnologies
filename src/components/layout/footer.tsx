"use client";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const footerlessRouteRoots = [
  "/admin",
  "/staff",
  "/client",
  "/quotation",
  "/proposal",
  "/engagement",
  "/payment",
  "/handover",
  "/onboard",
  "/onboarding",
];

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);

  const normalizedPath = pathname?.toLowerCase() ?? "";
  const isFooterlessRoute = footerlessRouteRoots.some(
    (routeRoot) => normalizedPath === routeRoot || normalizedPath.startsWith(`${routeRoot}/`)
  );
  if (isFooterlessRoute) {
    return null;
  }

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

  const menuLinks = [
    { label: "Products", href: "/products" },
    { label: "Services", href: "/services" },
    { label: "Our work", href: "/work" },
    { label: "About us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Investors", href: "/investors" },
  ];
  const supportLinks = [
    { label: "Contact", href: "/contact" },
    { label: "Book a consultation", href: "/book-consultation" },
    { label: "Help center", href: "/help-center" },
    { label: "Resources", href: "/resources" },
    { label: "System status", href: "/status" },
    { label: "Privacy & terms", href: "/privacy" },
  ];

  return (
    <footer className="relative overflow-hidden bg-white px-4 pt-8 sm:px-6 sm:pt-12">
      <section aria-labelledby="footer-newsletter-title" className="relative mx-auto mb-6 flex min-h-[360px] w-full max-w-[1400px] items-center justify-center overflow-hidden rounded-[28px] border border-[#d9ceff] bg-[linear-gradient(118deg,#bca2f6_0%,#6f37f7_50%,#3c08ef_100%)] px-5 py-14 text-center shadow-[0_20px_60px_rgba(73,43,175,.16)] sm:min-h-[400px] sm:rounded-[32px] sm:px-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <svg className="absolute -bottom-8 -left-12 h-44 w-64 rotate-[-12deg] opacity-85 sm:h-56 sm:w-80" viewBox="0 0 400 260" fill="none">
            <path d="M18 69 185 11c15-5 31 0 41 11l151 153c14 14 8 38-12 44L198 274c-15 5-32 0-43-12L7 110c-12-12-7-35 11-41Z" fill="#fff"/>
            <path d="m11 93 135 83 49-65 180 97M13 97l-3 14 145 151 43-86" stroke="#eee9ff" strokeWidth="7"/>
          </svg>
          <svg className="absolute -bottom-8 -right-12 h-44 w-64 rotate-[12deg] opacity-85 sm:h-56 sm:w-80" viewBox="0 0 400 260" fill="none">
            <path d="M18 69 185 11c15-5 31 0 41 11l151 153c14 14 8 38-12 44L198 274c-15 5-32 0-43-12L7 110c-12-12-7-35 11-41Z" fill="#fff"/>
            <path d="m11 93 135 83 49-65 180 97M13 97l-3 14 145 151 43-86" stroke="#eee9ff" strokeWidth="7"/>
          </svg>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-3xl">
          <h2 id="footer-newsletter-title" className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-.045em] text-white">
            Join Our Newsletter<br />and <span className="font-serif font-normal italic">Stay Updated</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
            Get the latest insights, updates, and strategies delivered to your inbox.
          </p>
          {!showSubscribeForm ? (
            <button type="button" onClick={() => setShowSubscribeForm(true)} className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#111111] px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#282828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#5830dd]">
              Join Newsletter <ArrowUpRight className="h-4 w-4" />
            </button>
          ) : (
            <form onSubmit={handleSubscribe} className="mx-auto mt-7 flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-white/50 bg-white/95 p-2 sm:flex-row" noValidate={false}>
              <input
                type="email"
                aria-label="Email address for newsletter"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="min-h-11 min-w-0 flex-1 rounded-xl bg-transparent px-4 text-sm text-[#25231f] outline-none placeholder:text-[#8b8981] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#9bd8f5]"
              />
              <button type="submit" disabled={loading} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-[#282828] disabled:opacity-50">
                {loading ? "Joining…" : "Join Newsletter"} <ArrowUpRight className="h-4 w-4" />
              </button>
            </form>
          )}
          {subscribed && <p role="status" className="mt-3 text-sm font-medium text-white">You’re on the list. Thank you for subscribing.</p>}
          {error && <p role="alert" className="mt-3 text-sm font-medium text-white">{error}</p>}
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-[1400px] overflow-hidden rounded-[22px] border border-black/10 bg-[#fffefa] shadow-[0_18px_55px_rgba(33,24,20,.08)]">
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 px-5 py-8 sm:gap-8 sm:px-10 sm:py-12 lg:grid-cols-[1.25fr_.7fr_.7fr] lg:gap-16 lg:px-14 lg:py-14">
          <div className="col-span-full max-w-lg lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 text-[#171714]" aria-label={`${COMPANY.displayName} home`}>
              <span className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={COMPANY.logoIconPath} alt="" className="h-full w-full rounded-full object-cover" />
              </span>
              <span className="whitespace-nowrap text-[clamp(8px,2.7vw,11px)] font-semibold uppercase tracking-[.1em] sm:text-[11px]">Logic Intelligence Technologies</span>
            </Link>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-[#77756e]">Thoughtful technology, built around the people and systems that matter.</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#5e5c55]">
              Logic Intelligence Technologies is a Coimbatore-based software engineering company building practical AI products, healthcare systems, and secure voice technology.
            </p>
          </div>

          <nav aria-label="Footer menu" className="min-w-0">
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[.18em] text-[#77756e]">Menu</h3>
            <ul className="space-y-3">
              {menuLinks.map((item) => <li key={item.label}><Link href={item.href} className="text-sm text-[#25231f] transition-colors hover:text-[#315f9c]">{item.label}</Link></li>)}
            </ul>
          </nav>

          <nav aria-label="Footer support" className="min-w-0">
            <h3 className="mb-5 text-[11px] font-semibold uppercase tracking-[.18em] text-[#77756e]">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((item) => <li key={item.label}><Link href={item.href} className="text-sm text-[#25231f] transition-colors hover:text-[#315f9c]">{item.label}</Link></li>)}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-5 border-t border-black/10 px-6 py-5 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-14">
          <div className="grid w-full grid-cols-1 gap-2 text-xs text-[#5e5c55] sm:grid-cols-2 sm:gap-x-5 md:max-w-2xl">
            <a href={`mailto:${COMPANY.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-[#315f9c]"><Mail className="h-3.5 w-3.5" />{COMPANY.email}</a>
            <a href={`tel:${COMPANY.phone}`} className="inline-flex items-center gap-2 transition-colors hover:text-[#315f9c]"><Phone className="h-3.5 w-3.5" />{COMPANY.phone}</a>
          </div>
          <div className="flex flex-wrap items-center gap-2" aria-label="Social media">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 text-[#25231f] transition hover:border-black/30 hover:bg-black/5">
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>
      </div>

      <Link href="/" aria-label={`${COMPANY.displayName} home`} className="mx-auto mt-5 flex max-w-[1400px] items-center justify-between gap-2 overflow-hidden rounded-[18px] border border-[#e6e8eb] bg-[#f4f5f6] px-3 py-4 text-[#151411] sm:gap-4 sm:py-7 sm:pl-9 sm:pr-8">
        <span className="block min-w-0 whitespace-nowrap font-serif text-[clamp(3.75rem,20.5vw,18rem)] font-semibold uppercase leading-[.72] tracking-[-.09em]">Logic</span>
        {/* Render the supplied circular artwork in full; contain preserves its original framing. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logos/circular/lit-company-footer.png" alt="Logic Intelligence Technologies" className="h-28 w-28 shrink-0 object-contain sm:h-36 sm:w-36" />
      </Link>

      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-2 py-6 text-center text-[10px] font-medium uppercase tracking-[.12em] text-[#25231f] sm:flex-row sm:text-left">
        <Link href="/status" className="inline-flex items-center gap-2 transition hover:text-black"><span aria-hidden className="h-2 w-2 rounded-full bg-emerald-700" />System status: Operational</Link>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end">
          <span>© {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.</span>
          <span>Designed &amp; engineered in Coimbatore, India</span>
        </div>
      </div>
    </footer>
  );
}
