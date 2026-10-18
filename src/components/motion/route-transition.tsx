"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

/**
 * Smooth client-side navigation feedback for the entire site.
 * - Instant top progress bar on route change (never hangs)
 * - Brief branded pulse overlay matching company loader aesthetics
 * - Auto-dismisses as soon as the new route settles
 */
export default function RouteTransition() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const first = useRef(true);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    clearTimers();
    setActive(true);
    setProgress(12);

    // Smooth progress toward ~90% while the next segment resolves
    timers.current.push(
      window.setTimeout(() => setProgress(40), 40),
      window.setTimeout(() => setProgress(68), 120),
      window.setTimeout(() => setProgress(86), 220)
    );

    // Complete and hide — keep short so navigations never feel stuck
    const finish = window.setTimeout(() => {
      setProgress(100);
      window.setTimeout(() => {
        setActive(false);
        setProgress(0);
      }, 180);
    }, 320);
    timers.current.push(finish);

    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  if (!active) return null;

  return (
    <>
      {/* Top progress bar — always visible, non-blocking */}
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[1000000] h-[2px] bg-transparent"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Page loading"
      >
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.55)] transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Soft brand pulse — short-lived, does not block interaction after start */}
      {progress < 100 ? (
        <div
          className="pointer-events-none fixed inset-0 z-[999998] flex items-center justify-center bg-[#050608]/55 backdrop-blur-[1px] transition-opacity duration-200"
          aria-hidden
        >
          <div className="flex flex-col items-center px-4">
            <div className="relative mb-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-cyan-500/30 bg-[#070b16] p-1 shadow-[0_0_20px_rgba(6,182,212,0.2)] sm:h-14 sm:w-14">
              <Image
                src="/assets/logo-icon.webp"
                alt=""
                width={48}
                height={48}
                className="h-full w-full rounded-lg object-cover"
                priority
              />
            </div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white/90 sm:text-[10px]">
              Logic Intelligence Technologies
            </p>
            <div className="relative mt-3 h-[2px] w-20 overflow-hidden rounded-full bg-white/10">
              <div className="lit-loader-bar h-full w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
