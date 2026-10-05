import React from 'react';
import { Metadata } from 'next';
import BackToHome from "@/components/ui/back-to-home";
import PageHelpBar from "@/components/ui/page-help-bar";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: 'Security | Logic Intelligence Technologies',
  description: 'Security policies and practices at Logic Intelligence Technologies',
};

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
      <BackToHome />
      <h1 className="text-4xl font-bold mb-8">Security Practices</h1>
      <ul className="list-disc list-outside pl-5 space-y-4 text-base sm:text-lg text-zinc-300 leading-relaxed">
        <li>All traffic to our websites and APIs is encrypted in transit with HTTPS (TLS).</li>
        <li>Client data is stored in a managed database that encrypts data at rest, and each client account can see only its own records.</li>
        <li>Administrative areas and actions are checked on the server for every request, not only in the browser.</li>
        <li>Forms and downloads are rate-limited to reduce abuse.</li>
        <li>Secrets and service keys stay on the server and are never sent to browsers.</li>
        <li>
          Report security issues privately to{" "}
          <a className="text-primary underline underline-offset-4" href={`mailto:${COMPANY.adminEmail}`}>
            {COMPANY.adminEmail}
          </a>
          . We investigate every report.
        </li>
      </ul>
      <PageHelpBar title="Found a security issue?" text="Report it privately by email; please do not post it publicly." primary={{ label: "Report an issue", href: `mailto:${COMPANY.adminEmail}` }} secondary={{ label: "Contact us", href: "/contact" }} />
    </div>
  );
}
