import { Metadata } from "next";
import { BackButton } from "@/components/navigation/back-button";
import FloatingElements from "@/components/motion/floating-elements";
import { FOUNDER } from "@/config/founder";
import { SafeImage } from "@/components/ui/safe-image";
import { Award, ShieldCheck } from "lucide-react";

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
    <main className="min-h-screen bg-transparent text-white pt-28 sm:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8">
        <BackButton fallbackHref="/about" label="Back to About" inline />
      </div>
      
      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 max-w-7xl mx-auto mb-16 text-center z-10">
        <span className="inline-flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-5 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10">
          <ShieldCheck className="w-4 h-4" />
          Verified Credentials
        </span>
        <h1 className="uppercase text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
          Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Certifications</span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          A comprehensive log of verified technical credentials, advanced engineering accreditations, and continuous learning achievements that drive our production standards.
        </p>
      </section>

      {/* Certifications Grid */}
      <section className="px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {certifications.map((cert) => (
            <div 
              key={cert.title}
              className="group rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] transition-all hover:border-primary/30 hover:shadow-[0_0_30px_rgba(0,191,255,0.1)] flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full bg-[#070b16] border-b border-white/10 overflow-hidden p-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {cert.image ? (
                  <div className="relative w-full h-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <SafeImage
                      src={cert.image}
                      alt={`${cert.title} certification from ${cert.issuingOrganization}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <Award className="w-16 h-16 text-zinc-700" />
                )}
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                  {cert.title}
                </h3>
                <p className="text-zinc-400 text-sm font-medium mt-auto">
                  Issued by <span className="text-zinc-200">{cert.issuingOrganization}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FloatingElements />
    </main>
  );
}
