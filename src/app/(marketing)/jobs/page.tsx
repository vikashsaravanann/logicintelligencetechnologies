import { Metadata } from "next";
import BackToHome from "@/components/ui/back-to-home";
import JobsClient from "./jobs-client";

export const metadata: Metadata = {
  title: "Leadership Jobs — CEO and Directors",
  description:
    "LOGIC INTELLIGENCE TECHNOLOGIES employment offers and letters of intent. Not a partnership program. Not a cheque-for-title.",
};

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white pt-24 sm:pt-28">
      <BackToHome />
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center pb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-4">
          LOGIC INTELLIGENCE TECHNOLOGIES
        </p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-5">
          Leadership Roles
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Coimbatore, 2026. Employment offers and letters of intent.
          Own an outcome — or do not take the seat.
        </p>
      </section>
      <JobsClient />
    </main>
  );
}
