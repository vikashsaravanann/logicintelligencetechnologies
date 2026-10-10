import { Metadata } from "next";
import PageShell from "@/components/layout/page-shell";
import BackToHome from "@/components/ui/back-to-home";
import { companyConfig, LEGAL_LAST_UPDATED } from "@/config/company";
import PageHelpBar from "@/components/ui/page-help-bar";
import { Cookie, ShieldCheck, Activity, Settings2, ExternalLink, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Cookie Policy | Logic Intelligence Technologies",
  description:
    "Learn how Logic Intelligence Technologies uses cookies, session tokens, and performance observability telemetry.",
  alternates: {
    canonical: "/cookie-policy",
  },
};

const COOKIE_CATEGORIES = [
  {
    icon: ShieldCheck,
    title: "Essential & Authentication Storage",
    badge: "Strictly Required",
    description:
      "Essential for platform security, cross-site request forgery (CSRF) protection, and secure enterprise session state. These tokens operate strictly in-memory or via secure HTTP-only cookies and cannot be deactivated without compromising site security.",
    items: [
      { name: "sb-auth-token", purpose: "Encrypted JWT session state for authenticated portal access", duration: "Session / 30 Days" },
      { name: "lit-theme-pref", purpose: "Retains system dark luxury interface preference", duration: "1 Year" },
    ],
  },
  {
    icon: Activity,
    title: "Performance & Telemetry Observability",
    badge: "Anonymized Analytics",
    description:
      "Anonymized telemetry monitoring Real User Monitoring (RUM), Core Web Vitals (LCP, FID, CLS), and edge latency. We do not correlate telemetry with personal identities.",
    items: [
      { name: "_vercel_speed_insights", purpose: "Aggregated performance metrics and edge routing diagnostics", duration: "Session" },
      { name: "_vercel_analytics", purpose: "Anonymized page journey counts and viewport resolution statistics", duration: "Session" },
    ],
  },
  {
    icon: Settings2,
    title: "Functional & Questionnaire Preferences",
    badge: "Experience Enhancement",
    description:
      "Remembers transient form inputs across multi-step tools such as the Architecture Checklist and Discovery Questionnaire so technical progress is preserved during your browser session.",
    items: [
      { name: "lit-discovery-state", purpose: "Caches draft questionnaire responses locally to prevent data loss", duration: "Local Session" },
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <PageShell>
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <BackToHome href="/" label="Back to Home" />

          {/* Header */}
          <div className="mt-8 mb-12 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
              <Cookie className="w-3.5 h-3.5" />
              Telemetry & Local Storage
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white mb-4">
              COOKIE POLICY
            </h1>
            <p className="text-sm text-zinc-400">
              Last updated: {LEGAL_LAST_UPDATED} &bull; Privacy-first telemetry guidelines for {companyConfig.legalName}
            </p>
          </div>

          {/* Intro Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] mb-12">
            <p className="text-base sm:text-lg text-zinc-200 leading-relaxed">
              At <span className="text-white font-medium">{companyConfig.displayName}</span>, we believe in radical transparency regarding user telemetry. We do not deploy third-party advertising trackers, cross-site profiling pixels, or intrusive commercial cookies.
            </p>
          </div>

          {/* Cookie Categories */}
          <div className="space-y-8">
            {COOKIE_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <section
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A] transition-colors hover:border-cyan-500/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {cat.title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md self-start sm:self-auto">
                      {cat.badge}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
                    {cat.description}
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-zinc-400 font-mono">
                          <th className="py-2.5 pr-4 font-semibold">Identifier</th>
                          <th className="py-2.5 pr-4 font-semibold">Purpose</th>
                          <th className="py-2.5 font-semibold">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300">
                        {cat.items.map((item, itemIdx) => (
                          <tr key={itemIdx}>
                            <td className="py-2.5 pr-4 font-mono text-cyan-400 font-medium whitespace-nowrap">
                              {item.name}
                            </td>
                            <td className="py-2.5 pr-4 text-zinc-400">{item.purpose}</td>
                            <td className="py-2.5 text-zinc-400 whitespace-nowrap font-mono text-xs">
                              {item.duration}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>

          {/* Browser Control Section */}
          <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#10131A]">
            <h3 className="text-xl font-bold text-white mb-3">Managing Your Preferences</h3>
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              All modern web browsers enable you to inspect, manage, and delete stored cookies and localStorage records. You can configure your browser preferences to reject non-essential tokens or prompt for permission prior to placement.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="https://www.aboutcookies.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Comprehensive Cookie Guide (AboutCookies.org)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Inquiries */}
          <div className="mt-8 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#151922] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                Data Protection Inquiries
              </h3>
              <p className="text-sm text-zinc-400">
                For questions regarding tracking policies or telemetry security, contact our privacy desk at{" "}
                <a href={`mailto:${companyConfig.email}`} className="text-cyan-400 hover:underline">
                  {companyConfig.email}
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
      <PageHelpBar title="Questions about cookies or telemetry?" />
    </PageShell>
  );
}
