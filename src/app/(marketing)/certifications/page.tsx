import { Metadata } from "next";
import { BackButton } from "@/components/navigation/back-button";
import FloatingElements from "@/components/motion/floating-elements";
import { FOUNDER } from "@/config/founder";
import { SafeImage } from "@/components/ui/safe-image";
import { Award, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import CTASection from "@/components/ui/cta-section";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Professional Certifications | Logic Intelligence Technologies",
  description:
    "Verified professional credentials, certifications, and technical accreditations for the engineering leadership at Logic Intelligence Technologies.",
  openGraph: {
    title: "Professional Certifications — Logic Intelligence Technologies",
    description:
      "Explore the verified professional credentials and technical accreditations held by our engineering leadership.",
    images: [
      {
        url: "/api/og?title=Professional%20Certifications&category=Logic%20Intelligence%20Technologies",
        width: 1200,
        height: 630,
        alt: "Logic Intelligence Technologies Certifications",
      },
    ],
  },
};

type CredentialWithImage = (typeof FOUNDER.credentials)[number] & { image: string };

function hasImage(c: (typeof FOUNDER.credentials)[number]): c is CredentialWithImage {
  return c.type === "Certification" && "image" in c && typeof (c as { image?: unknown }).image === "string";
}

export default function CertificationsPage() {
  const certifications = FOUNDER.credentials.filter(hasImage);
  
  return (
    <div className="min-h-screen bg-[#07090D] text-white pt-28 sm:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <BackButton fallbackHref="/about" label="Back to About" inline />
      </div>
      
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-16 text-center z-10">
        <div className="inline-flex items-center gap-2 text-[#45D9D2] font-semibold tracking-widest uppercase text-xs mb-5 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10">
          <ShieldCheck className="w-3.5 h-3.5" />
          Authentic Engineering Credentials
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.08] tracking-tight">
          Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#45D9D2] via-teal-200 to-white">Certifications</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          A verifiable public index of technical certifications, machine learning accreditations, and engineering qualifications held by company leadership.
        </p>

        {/* Verification Summary Badge */}
        <div className="mt-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#10131A] border border-white/10 text-xs text-slate-300 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-[#45D9D2]" />
          <span>{certifications.length} Verified Credentials with Public Issuing Authorities</span>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {certifications.map((cert) => (
            <div 
              key={cert.title}
              className="group rounded-2xl border border-white/10 bg-[#10131A] hover:bg-[#151922] overflow-hidden transition-all duration-300 hover:border-cyan-500/30 flex flex-col shadow-xl"
            >
              <div className="relative aspect-[4/3] w-full bg-[#151922] border-b border-white/10 overflow-hidden p-5 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {cert.image ? (
                  <div className="relative w-full h-full shadow-[0_10px_30px_rgba(0,0,0,0.6)] rounded-lg overflow-hidden group-hover:scale-[1.03] transition-transform duration-500">
                    <SafeImage
                      src={cert.image}
                      alt={`${cert.title} certification from ${cert.issuingOrganization}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <Award className="w-16 h-16 text-slate-600" />
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-[#45D9D2] uppercase tracking-wider mb-2">
                    Verified Credential
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-[#45D9D2] transition-colors">
                    {cert.title}
                  </h3>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Issued by <strong className="text-slate-200">{cert.issuingOrganization}</strong></span>
                  <ShieldCheck className="w-4 h-4 text-[#45D9D2]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership Profile Bridge */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 mb-20">
        <div className="p-8 sm:p-10 rounded-2xl border border-white/10 bg-[#10131A] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Learn more about our Founder & Leadership
            </h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Discover the background, patents, systems architecture, and engineering principles driving Logic Intelligence Technologies.
            </p>
          </div>
          <Link
            href="/about/founder"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#45D9D2] text-[#07090D] font-bold text-sm hover:bg-[#45D9D2]/90 transition-all shrink-0 shadow-lg"
          >
            <span>Executive Biography</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <CTASection
        title="Put this expertise to work"
        subtitle="Book a consultation with the founder or see the projects these skills have shipped."
        primaryCta={{ label: "Book a consultation", href: "/book-consultation" }}
        secondaryCta={{ label: "See our work", href: "/work" }}
      />

      <FloatingElements />
    </div>
  );
}
