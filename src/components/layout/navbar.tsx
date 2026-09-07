"use client";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPANY } from "@/config/company";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
const PRIMARY_NAV: Array<{ href: string; label: string }> = [
  { href: "/", label: "HOME" },
  { href: "/ai", label: "AI" },
  { href: "/#services", label: "SERVICES" },
  { href: "/work", label: "WORK" },
  { href: "/packages", label: "PACKAGES" },
  { href: "/about", label: "ABOUT" },
  { href: "/blog", label: "BLOG" },
  { href: "/jobs", label: "JOBS" },
];

const MORE_NAV: Array<{ href: string; label: string }> = [
  { href: "/checklist", label: "CHECKLIST" },
  { href: "/discovery", label: "DISCOVERY" },
  { href: "/free-demo", label: "FREE DEMO" },
];

const NavLink = ({ href, children, onHover }: { href: string; children: React.ReactNode; onHover?: () => void }) => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <Link 
      href={href} 
      className={`text-[10px] xl:text-[11px] 2xl:text-[12px] font-semibold tracking-[0.12em] transition-colors relative py-2 flex items-center gap-1 whitespace-nowrap shrink-0 px-1 ${isActive(href) ? "text-primary" : "text-zinc-300 hover:text-primary"}`}
      onMouseEnter={onHover}
    >
      {children}
      {isActive(href) && (
        <motion.div layoutId="activeNav" className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const supabase = createClientComponentClient({
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
    
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isOpen ? "hidden" : prev || "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const handleMouseEnter = (menu: string) => {
    if (window.innerWidth > 1024) setActiveDropdown(menu);
  };
  const handleMouseLeave = () => {
    if (window.innerWidth > 1024) setActiveDropdown(null);
  };

  return (
    <>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[60] shadow-[0_0_10px_rgba(0,191,255,0.8)] origin-left"
        style={{ scaleX }}
      />
      
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-[rgba(10,15,30,0.85)] backdrop-blur-[20px] saturate-180 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.3)] py-4" : "bg-transparent py-6"}`}>
        <div className="mx-auto w-full max-w-[1680px] px-4 lg:px-6 relative z-50">
          <div className="flex items-center gap-4 w-full min-w-0">
            
            {/* Logo Animation */}
            <Link href="/" className="flex items-center gap-2.5 group relative z-50 shrink-0">
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_15px_rgba(0,191,255,0.4)] animate-neon-pulse bg-gradient-to-tr from-primary to-accent"
              >
                <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="font-bold text-lg text-white">LIT</span>'; }} />
              </motion.div>
              <span className="text-[11px] font-bold text-white tracking-wide leading-none whitespace-nowrap hidden xl:inline">
                {COMPANY.displayName.toUpperCase()}
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex flex-1 items-center justify-center gap-3 min-w-0">
              <NavLink href="/">HOME</NavLink>
              <NavLink href="/ai">AI</NavLink>
              <NavLink href="/#services">SERVICES</NavLink>
              <NavLink href="/work">WORK</NavLink>
              
              {/* Packages Dropdown */}
              <div className="relative group" onMouseEnter={() => handleMouseEnter('packages')} onMouseLeave={handleMouseLeave}>
                <NavLink href="/packages" onHover={() => handleMouseEnter('packages')}>
                  PACKAGES <ChevronDown className="w-4 h-4" />
                </NavLink>
                <AnimatePresence>
                  {activeDropdown === 'packages' && (
                    <motion.div 
                      initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0 }} style={{ transformOrigin: "top center" }}
                      className="absolute top-[100%] left-1/2 -translate-x-1/2 w-[250px] bg-[rgba(10,15,30,0.98)] backdrop-blur-[30px] border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(0,191,255,0.1)] p-4 flex flex-col space-y-2"
                    >
                      <Link href="/packages/digital-launch-pack" className="flex justify-between items-center text-[13px] font-medium text-zinc-300 hover:text-white p-2 hover:bg-[rgba(0,191,255,0.08)] rounded-lg transition-colors group/link">Digital Launch Pack <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover/link:opacity-100 transition-opacity" /></Link>
                      <Link href="/packages/business-pro-pack" className="flex justify-between items-center text-[13px] font-medium text-zinc-300 hover:text-white p-2 hover:bg-[rgba(0,191,255,0.08)] rounded-lg transition-colors group/link">Business Pro Pack <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover/link:opacity-100 transition-opacity" /></Link>
                      <Link href="/packages/enterprise-pack" className="flex justify-between items-center text-[13px] font-medium text-zinc-300 hover:text-white p-2 hover:bg-[rgba(0,191,255,0.08)] rounded-lg transition-colors group/link">Enterprise Pack <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover/link:opacity-100 transition-opacity" /></Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink href="/about">ABOUT</NavLink>
              <NavLink href="/blog">BLOG</NavLink>
              <NavLink href="/jobs">JOBS</NavLink>
              <NavLink href="/checklist">CHECKLIST</NavLink>
            </div>

            {/* CTA & Mobile Toggle */}
            <div className="flex items-center justify-end gap-3 shrink-0 relative z-20">
              
              {session ? (
                <div className="hidden lg:flex relative group" onMouseEnter={() => handleMouseEnter('user')} onMouseLeave={handleMouseLeave}>
                  <button type="button" className="flex items-center gap-2 h-10 px-2.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors shrink-0" aria-label="Account menu">
                    {session.user?.user_metadata?.avatar_url ? (
                      <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {session.user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="hidden 2xl:inline text-xs font-bold text-white max-w-[120px] truncate">
                      {session.user?.user_metadata?.full_name || session.user?.email}
                    </span>
                    <ChevronDown className="w-3 h-3 text-white hidden 2xl:block" />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'user' && (
                      <motion.div 
                        initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0 }} style={{ transformOrigin: "top right" }}
                        className="absolute top-[100%] right-0 mt-2 w-[200px] bg-[rgba(10,15,30,0.98)] backdrop-blur-[30px] border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(0,191,255,0.1)] p-2 flex flex-col space-y-1 z-[100]"
                      >
                        <Link href="/profile" className="flex items-center text-sm font-medium text-zinc-300 hover:text-white p-2 hover:bg-[rgba(0,191,255,0.08)] rounded-lg transition-colors">
                          My Profile
                        </Link>
                        {session.user?.email?.endsWith('@logicintelligencetechnologies.in') && (
                          <Link href="/dashboard" className="flex items-center text-sm font-medium text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                            Admin Dashboard
                          </Link>
                        )}
                        <form action="/auth/signout" method="post">
                          <button type="submit" className="w-full flex items-center text-sm font-medium text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                            Sign Out
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className="hidden lg:inline-flex items-center justify-center h-10 px-5 rounded-full text-[11px] font-black text-black uppercase tracking-[0.2em] bg-white hover:bg-gray-200 transition-all shadow-lg whitespace-nowrap shrink-0">
                  Sign In
                </Link>
              )}
              <Link href="/contact" className="hidden lg:inline-flex shrink-0 relative group h-10 px-5 rounded-full overflow-hidden items-center justify-center shadow-[0_0_20px_rgba(0,191,255,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                <span className="relative z-10 text-[11px] font-bold text-white tracking-widest uppercase whitespace-nowrap">
                  Start Project
                </span>
              </Link>
              
              <ThemeToggle className="hidden lg:grid" />
              <button type="button" className="lg:hidden text-white relative z-50 p-2 min-h-[44px] min-w-[44px]" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? "Close menu" : "Open menu"}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Floating AI Pill (Home Page Only) */}
        <AnimatePresence>
          {pathname === "/" && !scrolled && (
            <motion.div 
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, pointerEvents: "none" }}
              transition={{ duration: 0.3 }}
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 md:mt-4 z-40"
            >
              <Link 
                href="/ai" 
                className="group flex items-center gap-3 bg-[rgba(10,15,30,0.8)] backdrop-blur-md border border-white/10 hover:border-cyan-500/40 px-6 py-2 rounded-full transition-all duration-300 shadow-xl hover:shadow-[0_0_20px_rgba(0,191,255,0.15)]"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.8)]"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-zinc-300 group-hover:text-white transition-colors whitespace-nowrap">
                  EXPLORE OUR ENTERPRISE AI ASSISTANT
                </span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ type: "tween", duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }} className="fixed top-0 right-0 w-[min(85vw,360px)] h-[100dvh] bg-[rgba(10,15,30,0.98)] backdrop-blur-2xl border-l border-white/10 lg:hidden shadow-2xl z-40 overflow-y-auto pb-safe">
              <div className="flex flex-col px-6 py-16 md:py-24 space-y-3">
                {[...PRIMARY_NAV, ...MORE_NAV].map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="py-3 text-base font-bold tracking-[0.16em] uppercase text-zinc-300 hover:text-white min-h-[44px] flex items-center">
                    {item.label}
                  </Link>
                ))}
                
                <div className="mt-auto pt-8 flex flex-col space-y-4">
                  {session ? (
                    <div className="flex flex-col gap-2">
                      <Link href="/profile" onClick={() => setIsOpen(false)} className="px-6 py-4 text-center rounded-xl text-base font-bold text-white border border-primary/50 bg-primary/10 hover:bg-primary/20 w-full transition-colors flex items-center justify-center gap-2">
                        {session.user?.user_metadata?.avatar_url && (
                          <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full" />
                        )}
                        Go to Profile
                      </Link>
                      {session.user?.email?.endsWith('@logicintelligencetechnologies.in') && (
                        <Link href="/dashboard" onClick={() => setIsOpen(false)} className="px-6 py-3 text-center rounded-xl text-sm font-bold text-white border border-red-500/50 bg-red-500/20 hover:bg-red-500/30 w-full transition-colors flex items-center justify-center gap-2">
                          Admin Dashboard
                        </Link>
                      )}
                    </div>
                  ) : (
                    <Link href="/login" onClick={() => setIsOpen(false)} className="px-6 py-4 text-center rounded-xl text-base font-black text-black bg-white hover:bg-gray-200 w-full transition-all shadow-lg">
                      Sign In
                    </Link>
                  )}
                  <ThemeToggle variant="pill" className="w-full justify-center whitespace-nowrap" />
                  <Link href="/contact" onClick={() => setIsOpen(false)} className="relative group px-6 py-4 text-center rounded-xl overflow-hidden w-full flex items-center justify-center shadow-[0_0_20px_rgba(0,191,255,0.3)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 opacity-90 transition-opacity duration-300"></div>
                    <span className="relative z-10 text-base font-bold text-white tracking-widest uppercase">
                      Start Project
                    </span>
                  </Link>
                  <a href="https://wa.me/919342877474" target="_blank" rel="noopener noreferrer" className="px-6 py-4 text-center rounded-xl text-base font-bold text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] w-full flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 448 512"
                    >
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 415.2c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 334.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 186.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-12.5 2.8-3.7 5.6-14.3 17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                    </svg>
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            />
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
