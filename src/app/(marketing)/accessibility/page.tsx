import { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/config/company";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Accessibility Statement | Logic Intelligence Technologies",
  description: "Our commitment to digital accessibility, WCAG 2.2 AA conformance, keyboard navigation, and inclusive design standards.",
  alternates: {
    canonical: "/accessibility",
  },
};

export default function AccessibilityPage() {
  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">
            Accessibility Statement
          </h1>
          <p className="text-sm text-zinc-400">
            Last Updated: March 2026 | Standard: WCAG 2.2 Level AA
          </p>
        </div>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">
              Our Commitment
            </h2>
            <p>
              Logic Intelligence Technologies is dedicated to ensuring digital accessibility for people of all abilities. We continuously apply relevant accessibility standards to improve the user experience for everyone, striving for conformance with the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">
              Measures Taken
            </h2>
            <div className="space-y-3">
              {[
                "Semantic HTML5 hierarchy across all pages (<main>, <nav>, <header>, <footer>, <article>)",
                "Full keyboard navigation support with visible focus outlines and no keyboard traps",
                "ARIA attributes applied to dynamic dialogs, drawers, and form validation states",
                "Color contrast ratios exceeding 4.5:1 for normal text and 3:1 for large text / UI controls",
                "Text resizing support without loss of content or broken horizontal scrolling",
                "Reduced motion preferences respected via CSS media queries for animations",
                "Form inputs accompanied by explicit <label> associations and programmatic error descriptions",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">
              Compatibility & Assistive Technologies
            </h2>
            <p>
              The platform is tested and optimized for modern screen readers including NVDA, JAWS, VoiceOver (iOS/macOS), and TalkBack (Android) in combination with Google Chrome, Safari, and Mozilla Firefox.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">
              Feedback & Accessibility Assistance
            </h2>
            <p className="mb-4">
              We welcome your feedback on the accessibility of the Logic Intelligence Technologies website. If you encounter accessibility barriers, please contact our accessibility coordinator:
            </p>
            <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
              <p className="font-bold text-white mb-1">Accessibility Support Desk</p>
              <p className="text-zinc-400">Email: <a href={`mailto:${COMPANY.email}?subject=Accessibility%20Issue`} className="text-primary hover:underline">{COMPANY.email}</a></p>
              <p className="text-zinc-400">Phone: {COMPANY.phone}</p>
              <p className="text-zinc-400">Address: {COMPANY.address.street}, {COMPANY.address.city}, {COMPANY.address.state} {COMPANY.address.postalCode}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
