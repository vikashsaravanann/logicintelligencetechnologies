import { Metadata } from "next";
import Link from "next/link";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: "Cookie Policy | Logic Intelligence Technologies",
  description: "Learn how Logic Intelligence Technologies uses cookies, analytics trackers, and browser storage to optimize user experience.",
  alternates: {
    canonical: "/cookie-policy",
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="relative min-h-screen bg-[#060B18] text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-sm text-zinc-400">
            Last Updated: March 2026
          </p>
        </div>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">
              1. What Are Cookies
            </h2>
            <p>
              Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, remember user preferences, and provide analytical telemetry to site operators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">
              2. How We Use Cookies
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <h3 className="font-bold text-white mb-1 text-base">Essential & Authentication Cookies</h3>
                <p className="text-xs text-zinc-400">
                  Required for core platform functionality, including secure session management via Supabase Auth, CSRF protection, and theme preferences (dark/light mode). These cannot be deactivated without impairing site operation.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <h3 className="font-bold text-white mb-1 text-base">Performance & Analytics Cookies</h3>
                <p className="text-xs text-zinc-400">
                  Powered by Vercel Speed Insights and Vercel Analytics. Collects anonymized telemetry on page load speeds, Core Web Vitals (LCP, FID, CLS), and traffic distribution to help us optimize server and front-end performance.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <h3 className="font-bold text-white mb-1 text-base">Functional Cookies</h3>
                <p className="text-xs text-zinc-400">
                  Used to remember inputs across multi-step tools such as the Website Checklist and Resource Download drawers so you do not have to re-enter your details repeatedly.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">
              3. Managing Your Cookie Preferences
            </h2>
            <p>
              Most web browsers allow you to control cookies through their browser settings. You can configure your browser to reject all cookies or notify you when a cookie is placed. For more information, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.aboutcookies.org</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">
              4. Contact Us
            </h2>
            <p>
              If you have any questions regarding our Cookie Policy, please reach out to us at <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">{COMPANY.email}</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
