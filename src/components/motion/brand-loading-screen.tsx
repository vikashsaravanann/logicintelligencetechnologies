import React from "react";
import Image from "next/image";

export interface BrandLoadingScreenProps {
  isFixed?: boolean;
  className?: string;
}

/**
 * BrandLoadingScreen
 *
 * Universal, high-performance branded loading screen matching the opening page animation.
 * Can be used as a Server Component in Next.js `loading.tsx` or as a Client Component.
 */
export default function BrandLoadingScreen({
  isFixed = true,
  className = "",
}: BrandLoadingScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[999999] w-screen h-screen h-[100dvh] min-h-[100dvh] flex flex-col items-center justify-center bg-[#050608] text-white select-none ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Logic Intelligence Technologies"
    >
      <div className="relative flex flex-col items-center px-4 max-w-full">
        {/* LIT Brand Mark Container */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#070b16] mb-5 p-1.5 flex items-center justify-center shadow-[0_0_24px_rgba(6,182,212,0.18)]">
          <Image
            src="/assets/logo-icon.webp"
            alt="Logic Intelligence Technologies"
            width={72}
            height={72}
            priority
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        {/* Brand Title: single unbreakable line across desktop, tablet, and mobile */}
        <div className="text-center w-full flex justify-center">
          <h2 className="text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.12em] min-[360px]:tracking-[0.16em] sm:tracking-[0.2em] uppercase text-white font-mono whitespace-nowrap">
            LOGIC INTELLIGENCE TECHNOLOGIES
          </h2>
        </div>

        {/* Micro Progress Pulse Bar */}
        <div className="w-24 h-[2px] bg-white/10 rounded-full mt-5 overflow-hidden relative">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent lit-loader-bar" />
        </div>
      </div>

      <span className="sr-only">Loading Logic Intelligence Technologies…</span>
    </div>
  );
}
