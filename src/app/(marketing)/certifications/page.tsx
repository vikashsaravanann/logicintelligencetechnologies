import { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  BookOpen,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { BackButton } from "@/components/navigation/back-button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumb } from "@/lib/seo/schema";
import { FOUNDER } from "@/config/founder";
import { SafeImage } from "@/components/ui/safe-image";
import CTASection from "@/components/ui/cta-section";

export const metadata: Metadata = {
  title: "Professional Certifications | Logic Intelligence Technologies",
  description:
    "Verified professional credentials, technical certifications, and engineering accreditations held by company leadership at Logic Intelligence Technologies.",
  openGraph: {
    title: "Professional Certifications — Logic Intelligence Technologies",
    description:
      "Explore the verified professional credentials, machine learning accreditations, and engineering qualifications held by company leadership.",
    type: "website",
    url: "https://www.logicintelligencetechnologies.in/certifications",
  },
};

type CredentialWithImage = (typeof FOUNDER.credentials)[number] & { image: string };

function hasImage(c: (typeof FOUNDER.credentials)[number]): c is CredentialWithImage {
  return (
    c.type === "Certification" &&
    "image" in c &&
    typeof (c as { image?: unknown }).image === "string"
  );
}

export default function CertificationsPage() {
  const certifications = FOUNDER.credentials.filter(hasImage);

  const breadcrumbs = breadcrumb([
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Professional Certifications", path: "/certifications" },
  ]);

  return (
    <PageShell>
      <JsonLd data={breadcrumbs} />

      <main className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] pt-24 sm:pt-28 pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <BackButton fallbackHref="/about" label="Back to About" inline />
          </div>

          {/* Hero Section */}
          <div className="text-center space-y-5 mb-14 pt-2 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F2F1] border border-[#80CBC4] text-[#00796B] text-xs font-mono uppercase tracking-widest shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1FA9A2]" />
              <span>Authentic Engineering Accreditations</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-poppins font-bold tracking-tight text-[var(--lit-navy,#0B2545)] leading-tight">
              Professional <br />
              <span className="font-serif italic font-normal text-[var(--lit-teal,#1FA9A2)]">
                Certifications
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed max-w-2xl mx-auto font-light">
              A verifiable public index of technical certifications, machine learning accreditations, and engineering qualifications held by company leadership.
            </p>

            {/* Verification Summary Badge */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-[var(--lit-border-light,#DFE7EF)] text-xs text-[var(--lit-navy,#0B2545)] font-semibold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)]" />
                <span>
                  {certifications.length} Verified Credentials with Public Issuing Authorities
                </span>
              </div>
            </div>
          </div>

          {/* Certifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
            {certifications.map((cert) => (
              <div
                key={cert.title}
                className="group rounded-2xl border border-[var(--lit-border-light,#DFE7EF)] bg-white hover:border-[var(--lit-teal,#1FA9A2)]/50 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Certificate Image Canvas */}
                <div className="relative aspect-[4/3] w-full bg-[var(--lit-cloud,#F7F9FC)] border-b border-[var(--lit-border-light,#DFE7EF)] overflow-hidden p-5 flex items-center justify-center">
                  {cert.image ? (
                    <div className="relative w-full h-full shadow-xs rounded-lg overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                      <SafeImage
                        src={cert.image}
                        alt={`${cert.title} certification issued by ${cert.issuingOrganization}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <Award className="w-16 h-16 text-slate-300" />
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#E0F2F1] border border-[#80CBC4] text-[10px] font-semibold text-[#00796B] uppercase tracking-wider mb-2.5">
                      Verified Credential
                    </div>
                    <h3 className="text-base font-poppins font-bold text-[var(--lit-navy,#0B2545)] mb-2 leading-snug group-hover:text-[var(--lit-teal,#1FA9A2)] transition-colors">
                      {cert.title}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-[var(--lit-border-light,#DFE7EF)]/70 flex items-center justify-between text-xs text-[var(--lit-text-muted,#52677C)]">
                    <span>
                      Issued by{" "}
                      <strong className="text-[var(--lit-navy,#0B2545)] font-semibold">
                        {cert.issuingOrganization}
                      </strong>
                    </span>
                    <ShieldCheck className="w-4 h-4 text-[var(--lit-teal,#1FA9A2)] shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Leadership Profile Bridge */}
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-xs mb-20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--lit-teal,#1FA9A2)]">
                <UserCheck className="w-4 h-4" />
                <span>Executive Leadership</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-poppins font-bold text-[var(--lit-navy,#0B2545)]">
                Learn More About Our Founder & Engineering Desk
              </h2>
              <p className="text-xs sm:text-sm text-[var(--lit-text-muted,#52677C)] max-w-xl font-light">
                Discover the engineering background, open architecture RFCs, systems design philosophy, and verified client outcomes behind Logic Intelligence Technologies.
              </p>
            </div>
            <Link
              href="/about/founder"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider transition-all shrink-0 shadow-md"
            >
              <span>Executive Biography</span>
              <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
            </Link>
          </div>

          {/* Canonical CTA */}
          <CTASection
            title="Put This Verified Expertise to Work"
            subtitle="Book a consultation with our Chief Architect or explore the production systems these skills have shipped."
            primaryCta={{ label: "Book Consultation", href: "/book-consultation" }}
            secondaryCta={{ label: "See Our Work", href: "/work" }}
          />
        </div>
      </main>
    </PageShell>
  );
}
