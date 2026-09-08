import { Metadata } from "next";
import Image from "next/image";
import BackToHome from "@/components/ui/back-to-home";
import { COMPANY } from "@/config/company";
import JobsClient from "./jobs-client";

export const metadata: Metadata = {
  title: "Leadership Jobs — CEO and Directors",
  description:
    "Join Logic Intelligence Technologies in Coimbatore. Open CEO and Director seats. Employment offers and letters of intent — not a partnership programme.",
};

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white">
      <BackToHome />
      <section className="relative min-h-[70vh] sm:min-h-[78vh] flex items-end overflow-hidden pt-24">
        <Image
          src="/assets/jobs/studio-hero.jpg"
          alt="Logic Intelligence Technologies studio"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/70 to-[#0A0F1E]/25" />
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-14 sm:pb-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300 mb-4">
            {COMPANY.displayName.toUpperCase()} · COIMBATORE · 2026
          </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] max-w-3xl mb-5 uppercase">
            Own a function.
            <span className="block text-zinc-300 font-semibold text-xl sm:text-2xl mt-3 tracking-tight uppercase">Not a title you buy.</span>
          </h1>
          <p className="text-zinc-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Four leadership seats are open next to the founder. Bootstrapped studio shipping
            production web, mobile, and Logic AI. Modest cash until revenue. Real equity after the entity.
            If you need a cheque for a visiting card, this page is not for you.
          </p>
        </div>
      </section>
      <JobsClient />
    </main>
  );
}
