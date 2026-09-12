import { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/config/company";
import { Download, FileText, Mail, Newspaper, ArrowRight, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Media, News & Official Press Kit | Logic Intelligence Technologies",
  description: "Official press releases, media resources, brand assets, logos, and executive bios for journalists and publications.",
  alternates: {
    canonical: "/press",
  },
};

export default function PressPage() {
  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Newsroom & Media Assets</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 uppercase">
            PRESS & <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">MEDIA HUB</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
            Everything journalists, industry analysts, and partners need to report on Logic Intelligence Technologies.
          </p>
        </div>

        {/* Company Overview & Quick Facts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">
              About Logic Intelligence Technologies
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              Logic Intelligence Technologies (LIT) is a premier full-stack software architecture and artificial intelligence engineering company based in Coimbatore, India. Founded with the mission to merge rigorous algorithmic logic with production-ready AI, the company specializes in enterprise platforms, autonomous agent systems, high-throughput cloud infrastructure, and custom business automation.
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              LIT operates as an engineering-led organization serving corporate clients globally, helping enterprises modernize legacy workflows and launch high-performance digital products with uncompromising reliability.
            </p>
          </div>

          <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
                Fast Facts
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-500 font-bold uppercase block">Legal Name</span>
                  <span className="text-white font-semibold">{COMPANY.legalName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold uppercase block">Headquarters</span>
                  <span className="text-white font-semibold">{COMPANY.address}</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold uppercase block">Focus Areas</span>
                  <span className="text-white font-semibold">Full-Stack Web, AI Systems, Enterprise ERP</span>
                </div>
                <div>
                  <span className="text-zinc-500 font-bold uppercase block">Official Website</span>
                  <span className="text-primary font-semibold">{COMPANY.websiteUrl}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <a
                href="/resources/press-kit.pdf"
                download="press-kit.pdf"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,191,255,0.3)]"
              >
                <Download className="w-4 h-4" />
                <span>Download Press Kit (PDF)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Media Contact Box */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.02] to-primary/5 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Media Inquiries & Interview Requests</h3>
            <p className="text-xs text-zinc-400">Our press team responds to accredited journalists within 24 business hours.</p>
          </div>
          <a
            href={`mailto:${COMPANY.email}?subject=Media%20Inquiry%20-%20Logic%20Intelligence%20Technologies`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all shrink-0"
          >
            <Mail className="w-4 h-4 text-primary" />
            <span>Contact Press Desk</span>
          </a>
        </div>
      </div>
    </div>
  );
}
