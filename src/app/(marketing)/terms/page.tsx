import { Metadata } from "next";
import FloatingElements from "@/components/motion/floating-elements";
import BackToHome from "@/components/ui/back-to-home";
import { companyConfig, LEGAL_LAST_UPDATED } from "@/config/company";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms and conditions governing use of Logic Intelligence Technologies' website and services. Please read carefully before engaging our services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0D1A] text-white pt-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      <BackToHome />
      <section className="py-20 px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <h1 className="uppercase text-3xl md:text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight">TERMS OF SERVICE</h1>
        <p className="text-zinc-400 mb-12">Last updated: {LEGAL_LAST_UPDATED}</p>
        
        <div className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary/80">
          <p className="text-lg text-zinc-300 leading-relaxed mb-8">
            Welcome to {companyConfig.legalName}. By accessing our website, using our services, or interacting with our digital properties, you agree to comply with and be bound by the following Terms of Service. Please review them carefully.
          </p>
          
          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">1</span>
                Acceptance of Terms
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                By accessing this website, we assume you accept these terms and conditions. Do not continue to use {companyConfig.displayName} if you do not agree to take all of the terms and conditions stated on this page. Our services are available only to, and may only be used by, individuals who can form legally binding contracts under applicable law.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">2</span>
                Description of Services
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                {companyConfig.displayName} provides custom software development, web applications, UI/UX design, mobile app development, and related consulting services. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time, including the availability of any feature, database, or content.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">3</span>
                Intellectual Property Rights
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Unless otherwise stated, {companyConfig.legalName} and/or its licensors own the intellectual property rights for all material on the website. All intellectual property rights are reserved. 
                <br /><br />
                For custom development projects, the transfer of Intellectual Property (IP) will be governed by the specific Statement of Work (SOW) or Master Services Agreement (MSA) signed between you and {companyConfig.displayName}. Generally, upon full payment, the client receives full ownership of the final deliverables.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">4</span>
                Payments and Billing
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                Payment terms, milestones, and billing structures are detailed in your individual project proposal. We standardly require an initial deposit before commencing any work. All payments are non-refundable except as explicitly stated in our Refund Policy. If an invoice remains unpaid past its due date, we reserve the right to pause ongoing work until the balance is cleared.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">5</span>
                Client Responsibilities
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                To ensure timely delivery, clients are expected to provide necessary feedback, assets, and approvals within the agreed-upon timeframes. Delays in client communication may result in corresponding delays to the project timeline. {companyConfig.displayName} is not responsible for missed deadlines caused by a lack of client responsiveness.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">6</span>
                Limitation of Liability
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                In no event shall {companyConfig.legalName}, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website or our services, whether such liability is under contract. {companyConfig.displayName} shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of our services.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm">7</span>
                Governing Law & Jurisdiction
              </h3>
              <p className="text-zinc-400 leading-relaxed">
                These terms will be governed by and interpreted in accordance with the laws of India, specifically within the jurisdiction of Tamil Nadu. You submit to the non-exclusive jurisdiction of the state and federal courts located in Coimbatore for the resolution of any disputes.
              </p>
            </div>

            <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="text-xl font-bold text-white mb-2">Questions regarding these terms?</h4>
              <p className="text-zinc-400">
                Please contact our legal team at <a href={`mailto:${companyConfig.email}`} className="text-primary hover:underline">{companyConfig.email}</a> or call us at {companyConfig.phone}.
              </p>
            </div>
          </div>
        </div>
      </section>
      <FloatingElements />
    </main>
  );
}
