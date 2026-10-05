import Link from "next/link";
import { Home, Compass, MessageSquare } from "lucide-react";
import { COMPANY } from "@/config/company";

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center relative overflow-hidden px-6 py-24 ">
      <div className="relative z-10 max-w-xl text-center flex flex-col items-center">
        <span className="lit-eyebrow mb-6">
          Error 404 • Page Not Found
        </span>

        <h1 className="font-display text-7xl sm:text-8xl md:text-9xl font-bold text-white tracking-tight mb-4">
          404
        </h1>

        <p className="text-xl sm:text-2xl font-bold text-white mb-3">
          Lost in the Digital Architecture?
        </p>

        <p className="text-sm sm:text-base text-zinc-400 mb-10 leading-relaxed max-w-md">
          The page or asset you are looking for has been relocated, refactored, or does not exist on {COMPANY.displayName}.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          <Link
            href="/"
            className="lit-btn lit-btn-primary "
          >
            <Home className="w-4 h-4" />
            Back to Homepage
          </Link>
          <Link
            href="/services"
            className="lit-btn lit-btn--secondary"
          >
            <Compass className="w-4 h-4" />
            Explore Services
          </Link>
          <Link
            href="/contact"
            className="lit-btn lit-btn--ghost"
          >
            <MessageSquare className="w-4 h-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
