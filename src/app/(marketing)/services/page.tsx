import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import Link from "next/link";
import { servicesData, getServiceVisual } from "@/data/servicesData";
import { ArrowRight, CheckCircle2, Sparkles, Layers, ShieldCheck, Zap, Code, Hotel, Plane, Terminal, Gamepad, ShoppingCart, Smartphone, Search, Palette, Brush, Layout, UploadCloud, Building, Users, GraduationCap, Receipt, CodeSquare, Cloud, Cpu } from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import PageHero from "@/components/ui/page-hero";
import BrandMesh from "@/components/ui/brand-mesh";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Enterprise Engineering & AI Solutions | Logic Intelligence Technologies",
  description: "Comprehensive software engineering services: Full-Stack Web Development, Autonomous AI, Cloud Systems, Custom ERP, and Real-Time Systems.",
  openGraph: {
    title: "Enterprise Technology Services | Logic Intelligence Technologies",
    description: "Custom web development, AI solutions, e-commerce, and enterprise software engineered for production scale.",
    images: [{ url: "/api/og?title=Enterprise+Technology+Services&category=18+Core+Capabilities", width: 1200, height: 630, alt: "LIT Services" }],
  },
};

const SERVICE_ACCENT: Record<string, string> = {
  "full-stack-development":     "#45D9D2",
  "hotel-website":              "#F59E0B",
  "travel-agency-website":      "#10B981",
  "ecommerce-website":          "#8B5CF6",
  "software-development":       "#10B981",
  "game-development":           "#EC4899",
  "mobile-app-development":     "#3B82F6",
  "seo-optimization":           "#22C55E",
  "ui-ux-design":               "#F472B6",
  "logo-branding":              "#F97316",
  "web-designing":              "#6366F1",
  "web-deployment":             "#0EA5E9",
  "business-website":           "#45D9D2",
  "crm-software":               "#10B981",
  "school-management-software": "#84CC16",
  "billing-software":           "#F59E0B",
  "api-development":            "#45D9D2",
  "cloud-deployment":           "#0EA5E9",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code, Hotel, Plane, Terminal, Gamepad, ShoppingCart,
  Smartphone, Search, Palette, Brush, Layout, UploadCloud,
  Building, Users, GraduationCap, Receipt, CodeSquare, Cloud,
};

export default function ServicesPage() {
  return (
    <div className="relative min-h-screen bg-[#07090D] text-white pt-28 pb-20 overflow-hidden">
      <BackToHome href="/" label="Back to Home" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <PageHero
          eyebrow="18 Production Engineering Disciplines"
          eyebrowIcon={<Sparkles className="w-3.5 h-3.5" />}
          title={
            <>
              ENGINEERING EXCELLENCE FOR{" "}
              <span className="bg-gradient-to-r from-[#45D9D2] via-teal-200 to-white bg-clip-text text-transparent">
                ENTERPRISE SCALE
              </span>
            </>
          }
          description="From bespoke full-stack applications and autonomous AI systems to high-throughput cloud infrastructure — we architect software that scales deterministically."
          primaryCta={{ label: "Initiate project", href: "/contact" }}
          secondaryCta={{ label: "View pricing packages", href: "/packages" }}
          visual={<BrandMesh seed="services" label="Services" />}
        />

        {/* Services Grid (18 Disciplines) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-12 mb-20">
          {servicesData.map((svc) => {
            const accent = SERVICE_ACCENT[svc.slug] ?? "#45D9D2";
            const Icon = iconMap[svc.icon] ?? Layers;
            return (
              <div
                key={svc.slug}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] transition-all duration-300 hover:border-cyan-500/40 shadow-xl overflow-hidden"
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#151922]">
                  <SafeImage
                    src={getServiceVisual(svc.slug)}
                    alt={`${svc.title} Visual Architecture`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10131A] via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 left-3 z-10">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg"
                      style={{ background: "rgba(7, 9, 13, 0.85)", border: `1px solid ${accent}55`, color: accent }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1.5 group-hover:text-[#45D9D2] transition-colors leading-snug">
                      {svc.title}
                    </h3>
                    <p className="text-[11px] font-semibold mb-3 tracking-wider uppercase font-mono" style={{ color: accent }}>
                      {svc.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                      {svc.description}
                    </p>

                    {svc.whatWeBuild && svc.whatWeBuild.length > 0 && (
                      <div className="space-y-2 mb-6 pt-4 border-t border-white/5">
                        {svc.whatWeBuild.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <Link
                      href={`/services/${svc.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#45D9D2] transition-colors"
                    >
                      <span>Explore Architecture</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                      href="/book-consultation"
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Consultation →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Architecture Banner */}
        <div className="rounded-2xl border border-white/10 bg-[#10131A] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[#45D9D2] text-xs font-semibold tracking-widest uppercase mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Custom Architecture Engineering
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Need a Bespoke Architecture or High-Volume Pipeline?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Schedule a technical discovery session with our systems architects. We analyze your requirements and deliver a complete technical specification and working prototype.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/book-consultation"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#45D9D2] text-[#07090D] font-bold text-sm hover:bg-[#45D9D2]/90 transition-all shadow-lg"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all"
            >
              <span>Contact Engineering</span>
            </Link>
          </div>
        </div>

        <CTASection
          title="Ready to Build Your System?"
          subtitle="Explore our transparent pricing tiers or request a zero-obligation working prototype."
          primaryCta={{ label: "View Packages", href: "/packages" }}
          secondaryCta={{ label: "Request Free Demo", href: "/free-demo" }}
        />
      </div>
    </div>
  );
}
