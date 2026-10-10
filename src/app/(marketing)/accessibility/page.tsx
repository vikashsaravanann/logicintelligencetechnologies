import { Metadata } from "next";
import PageShell from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import { companyConfig, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { CheckCircle2, ShieldCheck, Eye, Keyboard, Sparkles, Monitor, Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Accessibility Statement | Logic Intelligence Technologies",
  description:
    "Our commitment to digital accessibility, WCAG 2.2 AA conformance, keyboard navigation, and inclusive engineering standards.",
  alternates: {
    canonical: "/accessibility",
  },
};

const ACCESSIBILITY_FEATURES = [
  {
    title: "Semantic HTML5 Architecture",
    description: "Strict structural hierarchy using native landmarks (<main>, <nav>, <header>, <footer>, <section>, <article>) for intuitive screen reader navigation and predictable tree traversal.",
  },
  {
    title: "Full Keyboard Operability & Focus Traps",
    description: "All interactive controls, modals, and drawers support Tab, Shift+Tab, and Escape key navigation with high-visibility cyan focus indicators and zero focus traps.",
  },
  {
    title: "Accessible ARIA & Live Regions",
    description: "Dynamic content updates (such as form submission validation, search filters, and asynchronous state changes) utilize polite ARIA live regions and explicit role definitions.",
  },
  {
    title: "Calculated Contrast Ratios",
    description: "Color tokens strictly enforce WCAG 2.2 AA contrast ratios exceeding 4.5:1 for body copy and 3.0:1 for elevated UI surfaces and iconography against dark backgrounds.",
  },
  {
    title: "Reduced Motion & Fluid Typography",
    description: "Respects prefers-reduced-motion system preferences across all Framer Motion components, paired with fluid clamp() typography that scales up to 200% without horizontal clipping.",
  },
  {
    title: "Screen Reader & Assistive Tech Verification",
    description: "Tested and audited against modern assistive technologies including NVDA, JAWS, macOS/iOS VoiceOver, and Android TalkBack across Chrome, Safari, and Firefox.",
  },
];

export default function AccessibilityPage() {
  return (
    <PageShell>
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <BackToHome href="/" label="Back to Home" />

          {/* Header */}
          <div className="mt-8 mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              WCAG 2.2 Level AA Conformance
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mb-4">
              ACCESSIBILITY STATEMENT
            </h1>
            <p className="text-sm text-zinc-400">
              Last updated: {LEGAL_LAST_UPDATED} &bull; Universal accessibility charter for {companyConfig.legalName}
            </p>
          </div>

          {/* Intro Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] mb-12">
            <p className="text-base sm:text-lg text-zinc-200 leading-relaxed">
              At <span className="text-white font-medium">{companyConfig.legalName}</span>, we are committed to ensuring digital accessibility for all users regardless of ability, neurodiversity, or assistive device. We design and test our digital properties to conform with the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.
            </p>
          </div>

          {/* Core Measures Grid */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Keyboard className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Implemented Engineering Standards
              </h2>
            </div>

            <div className="grid gap-4">
              {ACCESSIBILITY_FEATURES.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-xl border border-white/10 bg-[#10131A] flex items-start gap-4 hover:border-cyan-500/30 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white text-base mb-1">{feat.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assistive Tech Compatibility Matrix */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Monitor className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Assistive Technology Environments Tested
              </h3>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              Our frontends are periodically verified across various assistive setups and input modalities:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm font-mono">
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 text-zinc-300">
                <span className="text-cyan-400 font-semibold">Desktop:</span> NVDA (Chrome / Firefox) &bull; JAWS &bull; Apple VoiceOver (macOS Safari)
              </div>
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 text-zinc-300">
                <span className="text-cyan-400 font-semibold">Mobile:</span> iOS VoiceOver (Mobile Safari) &bull; Android TalkBack (Chrome Mobile)
              </div>
            </div>
          </div>

          {/* Coordinator Support Desk */}
          <div className="mt-8 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#151922]">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Accessibility Coordinator Support Desk
            </h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              If you encounter an accessibility barrier or require an alternate document format, please reach out to our team. We remediate identified accessibility tickets promptly.
            </p>
            <div className="space-y-3 text-sm text-zinc-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong className="text-white">Email:</strong>{" "}
                  <a href={`mailto:${companyConfig.email}?subject=Accessibility%20Barrier%20Report`} className="text-cyan-400 hover:underline">
                    {companyConfig.email}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong className="text-white">Phone:</strong>{" "}
                  <a href={`tel:${companyConfig.phone}`} className="text-zinc-300 hover:text-white">
                    {companyConfig.phone}
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong className="text-white">Office:</strong> {companyConfig.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PageHelpBar title="Encountered an accessibility barrier?" text="Report an issue to our engineering team for immediate review." />
    </PageShell>
  );
}
