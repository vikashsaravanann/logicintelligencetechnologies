import { Metadata } from "next";
import FloatingElements from "@/components/motion/floating-elements";
import BackToHome from "@/components/ui/back-to-home";
import { companyConfig, LEGAL_LAST_UPDATED } from "@/config/company";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Understand our milestone-based refund and cancellation policy for custom web development, e-commerce, and software projects.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0A0D1A] text-white pt-24 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[800px] h-[600px] bg-red-500/5 blur-[150px] rounded-full pointer-events-none" />
      <BackToHome />
      <section className="py-20 px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <h1 className="uppercase text-3xl md:text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight">REFUND POLICY</h1>
        <p className="text-zinc-400 mb-12">Last updated: {LEGAL_LAST_UPDATED}</p>
        
        <div className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary/80">
          <p className="text-lg text-zinc-300 leading-relaxed mb-8">
            At {companyConfig.legalName}, we strive to ensure absolute satisfaction for all our clients through clear communication, defined milestones, and high-quality deliverables. Due to the custom nature of software development and digital design services, our refund policy is structured as follows.
          </p>
          
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Custom Software & Web Development
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                Projects are typically divided into milestones (e.g., Discovery, Design, Development, Deployment). Payments are tied to the approval of these milestones.
              </p>
              <ul className="list-disc pl-6 text-zinc-400 space-y-2">
                <li><strong>Initial Deposits:</strong> Initial deposits are generally non-refundable once the discovery or design phase has commenced, as they cover the immediate allocation of resources and preliminary consulting work.</li>
                <li><strong>Milestone Payments:</strong> Once a milestone is approved by the client and payment is processed, it is non-refundable. If you wish to cancel a project mid-development, you will only be billed for the work completed up to the date of cancellation.</li>
                <li><strong>Final Delivery:</strong> Upon final deployment and source code handover, no refunds will be issued. We provide a standard bug-fixing warranty period post-launch to ensure the product meets the agreed-upon specifications.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Retainer and Maintenance Contracts
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                For ongoing monthly maintenance or retainer agreements, you may cancel the service with a 30-day written notice. You will be billed for the current month, and the cancellation will take effect at the end of the billing cycle. Partial month refunds are not provided for retainer services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Digital Products & Templates
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                If {companyConfig.displayName} sells any pre-packaged digital goods, templates, or downloadable assets, these are considered final sale. Because digital items cannot be returned, we do not offer refunds on these purchases unless the file is proven to be corrupted or defective, and our team cannot resolve the issue.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Exceptions & Dispute Resolution
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                We evaluate exceptional circumstances on a case-by-case basis. If you believe there has been a fundamental breach of contract or severe failure to deliver according to the SOW, please contact management immediately. We prioritize finding an equitable resolution, which may include partial refunds, credit towards future work, or immediate remediation of the issue.
              </p>
            </section>

            <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-xl">
              <h4 className="text-xl font-bold text-white mb-2">Request a Project Audit</h4>
              <p className="text-zinc-400">
                If you have concerns about an ongoing project or wish to discuss cancellation, please email our project management team at <a href={`mailto:${companyConfig.email}`} className="text-primary hover:underline">{companyConfig.email}</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
      <FloatingElements />
    </main>
  );
}
