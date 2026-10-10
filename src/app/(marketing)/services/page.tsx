import { Metadata } from "next";
import Link from "next/link";
import BackToHome from "@/components/ui/back-to-home";
import { servicesData, getServiceVisual } from "@/data/servicesData";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Cpu,
  Code,
  Hotel,
  Plane,
  Terminal,
  Gamepad,
  ShoppingCart,
  Smartphone,
  Search,
  Palette,
  Brush,
  Layout,
  UploadCloud,
  Building,
  Users,
  GraduationCap,
  Receipt,
  CodeSquare,
  Cloud,
} from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Enterprise Engineering & AI Solutions | Logic Intelligence Technologies",
  description:
    "Comprehensive software engineering services: Full-Stack Web Development, Autonomous AI, Cloud Systems, Custom ERP, and Real-Time Systems.",
  openGraph: {
    title: "Enterprise Technology Services | Logic Intelligence Technologies",
    description:
      "Custom web development, AI solutions, e-commerce, and enterprise software engineered for production scale.",
    images: [
      {
        url: "/api/og?title=Enterprise+Technology+Services&category=18+Core+Capabilities",
        width: 1200,
        height: 630,
        alt: "LIT Services",
      },
    ],
  },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Hotel,
  Plane,
  Terminal,
  Gamepad,
  ShoppingCart,
  Smartphone,
  Search,
  Palette,
  Brush,
  Layout,
  UploadCloud,
  Building,
  Users,
  GraduationCap,
  Receipt,
  CodeSquare,
  Cloud,
};

const SERVICE_TAGS: Record<string, string> = {
  "full-stack-development": "Core Architecture",
  "hotel-website": "Hospitality & Bookings",
  "travel-agency-website": "Tourism & Portals",
  "ecommerce-website": "Commerce & Payments",
  "software-development": "Custom Platforms",
  "game-development": "Interactive & WebGL",
  "mobile-app-development": "Cross-Platform",
  "seo-optimization": "Search Performance",
  "ui-ux-design": "Design Systems",
  "logo-branding": "Brand Identity",
  "web-designing": "Responsive Interfaces",
  "web-deployment": "Production Hosting",
  "business-website": "Enterprise Presence",
  "crm-software": "Workforce & Operations",
  "school-management-software": "Campus ERP",
  "billing-software": "Invoicing & GST",
  "api-development": "Microservices & Integrations",
  "cloud-deployment": "DevOps & Reliability",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0]">
      <BackToHome href="/" label="Back to Home" />

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-20 px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#F0F7FF] via-[#FAFBFF] to-[#FFFFFF] border-b border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.16em] bg-[#1FA9A2]/10 text-[#0E7A74] border border-[#1FA9A2]/25 mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1FA9A2]" />
            <span>18 Production Engineering Disciplines</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[var(--lit-navy,#0B2545)] mb-6 leading-[1.12] tracking-tight">
            Engineering Excellence For{" "}
            <span className="font-serif italic font-normal text-[var(--lit-blue,#1565C0)]">
              Enterprise Scale
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] max-w-3xl mx-auto leading-relaxed mb-8">
            From bespoke full-stack applications and autonomous AI systems to high-throughput cloud infrastructure — we architect software that scales deterministically.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-[#133966] text-white font-semibold text-sm transition-all shadow-xs"
            >
              <span>Initiate Project</span>
              <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
            </Link>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-[#F7F9FC] border border-[#DFE7EF] text-[var(--lit-navy,#0B2545)] font-semibold text-sm transition-all shadow-2xs"
            >
              <span>View Pricing Packages</span>
            </Link>
            <Link
              href="/book-consultation"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1FA9A2]/10 hover:bg-[#1FA9A2]/20 border border-[#1FA9A2]/30 text-[#0E7A74] font-semibold text-sm transition-all"
            >
              <span>Book Consultation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Reassurance Metrics Strip */}
      <section className="py-8 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Engineering Disciplines", value: "18 Specializations", note: "Web, AI, Cloud & ERP" },
            { label: "Delivery Model", value: "Fixed Scope", note: "Zero Hidden Invoices" },
            { label: "Code Ownership", value: "100% Client Owned", note: "IP Transferred on Completion" },
            { label: "Warranty Support", value: "30 Days Included", note: "Post-Launch Assurance" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-[#DFE7EF] bg-white p-5 sm:p-6 text-center shadow-xs hover:shadow-md hover:border-[#1FA9A2]/40 transition-all duration-200"
            >
              <p className="text-xl sm:text-2xl font-display font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
                {metric.value}
              </p>
              <p className="text-[11px] sm:text-xs font-mono text-[var(--lit-blue,#1565C0)] uppercase tracking-wider mt-1 font-semibold">
                {metric.label}
              </p>
              <p className="text-[11px] text-[var(--lit-text-muted,#52677C)] mt-1 hidden sm:block">
                {metric.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid (18 Disciplines) */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto py-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-mono font-semibold uppercase tracking-[0.16em] text-[#1FA9A2] mb-2">
            Service Catalog
          </p>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-[var(--lit-navy,#0B2545)]">
            Explore All 18 Capabilities
          </h2>
          <p className="text-sm text-[var(--lit-text-muted,#52677C)] mt-2">
            Every service is backed by production architecture documentation, structured milestone delivery, and transparent pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {servicesData.map((svc) => {
            const Icon = iconMap[svc.icon] ?? Layers;
            const categoryTag = SERVICE_TAGS[svc.slug] ?? "Specialized Service";
            return (
              <div
                key={svc.slug}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#DFE7EF] bg-white hover:border-[#1FA9A2]/40 hover:shadow-md transition-all duration-300 shadow-xs overflow-hidden"
              >
                {/* Visual Thumbnail */}
                <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-[#DFE7EF] bg-[#F7F9FC]">
                  <SafeImage
                    src={getServiceVisual(svc.slug)}
                    alt={`${svc.title} Visual Architecture`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-3 left-3 z-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/95 backdrop-blur-md shadow-xs border border-[#DFE7EF] text-[var(--lit-navy,#0B2545)] group-hover:text-[#1FA9A2] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-white/90 text-[var(--lit-navy,#0B2545)] backdrop-blur-md border border-[#DFE7EF] px-2.5 py-1 rounded-md shadow-2xs">
                      {categoryTag}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-display text-[var(--lit-navy,#0B2545)] mb-1.5 group-hover:text-[var(--lit-blue,#1565C0)] transition-colors leading-snug">
                      {svc.title}
                    </h3>
                    <p className="text-[11px] font-semibold mb-3 tracking-wider uppercase font-mono text-[#1FA9A2]">
                      {svc.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] line-clamp-3 mb-6 leading-relaxed">
                      {svc.description}
                    </p>

                    {svc.whatWeBuild && svc.whatWeBuild.length > 0 && (
                      <div className="space-y-2 mb-6 pt-4 border-t border-[#DFE7EF]">
                        {svc.whatWeBuild.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[var(--lit-ink,#121826)]">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#1FA9A2]" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-[#DFE7EF] flex items-center justify-between mt-auto">
                    <Link
                      href={`/services/${svc.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--lit-navy,#0B2545)] group-hover:text-[var(--lit-blue,#1565C0)] transition-colors"
                    >
                      <span>Explore Architecture</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#1FA9A2]" />
                    </Link>
                    <Link
                      href="/book-consultation"
                      className="text-xs text-[var(--lit-text-muted,#52677C)] hover:text-[var(--lit-navy,#0B2545)] font-medium transition-colors"
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
        <div className="rounded-3xl border border-[#DFE7EF] bg-white p-8 sm:p-12 text-center relative overflow-hidden shadow-xs mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 text-[#0E7A74] text-xs font-mono font-semibold tracking-wider uppercase mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Custom Architecture Engineering</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-[var(--lit-navy,#0B2545)] tracking-tight mb-4">
            Need a Bespoke Architecture or High-Volume Pipeline?
          </h2>
          <p className="text-[var(--lit-text-muted,#52677C)] max-w-2xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Schedule a technical discovery session with our systems architects. We analyze your requirements and deliver a complete technical specification and working prototype.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/book-consultation"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-semibold text-sm hover:bg-[#133966] transition-all shadow-xs"
            >
              <span>Schedule Architecture Review</span>
              <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#F7F9FC] hover:bg-[#F1ECFF]/50 border border-[#DFE7EF] text-sm font-semibold text-[var(--lit-navy,#0B2545)] transition-all"
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
      </section>
    </div>
  );
}
