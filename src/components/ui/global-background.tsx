"use client";

import { usePathname } from "next/navigation";
import { useMemo, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Site-wide ambient background.
 * - Shows an image background by default for all pages
 * - Shows video background for Voice Shield and AI/AI Agent pages
 */
const VIDEOS = [
  "/assets/backdrops/bg-vid-1.mp4",
  "/assets/backdrops/bg-vid-2.mp4",
  "/assets/backdrops/bg-vid-3.mp4",
  "/assets/backdrops/bg-vid-4.mp4",
  "/assets/backdrops/bg-vid-5.mp4",
];

const POSTERS = [
  "/bg-vid-1.mp4.jpg",
  "/bg-vid-2.mp4.jpg",
  "/bg-vid-3.mp4.jpg",
  "/bg-vid-4.mp4.jpg",
  "/bg-vid-5.mp4.jpg",
];

export default function GlobalBackground() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const activeIndex = useMemo(() => {
    if (!pathname || pathname === "/") return 0;
    let hash = 0;
    for (let i = 0; i < pathname.length; i++) {
      hash = pathname.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 5;
  }, [pathname]);

  const isVoiceShieldPage = useMemo(() => {
    return pathname?.startsWith("/voice-shield");
  }, [pathname]);

  const isVideoPage = useMemo(() => {
    if (!pathname) return false;
    return (
      pathname.startsWith("/products/ai-voice-agents") ||
      pathname.startsWith("/products/ai-website-agents") ||
      pathname === "/ai" ||
      pathname.startsWith("/ai/")
    );
  }, [pathname]);

  useEffect(() => {
    if (!isVideoPage) return;
    
    const v = videoRef.current;
    if (!v || reduced) return;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    const play = () => {
      v.play().catch(() => {});
    };
    if (v.readyState >= 2) play();
    else v.addEventListener("loadeddata", play, { once: true });
  }, [reduced, activeIndex, isVideoPage]);

  if (!mounted) {
    return (
      <div
        className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none bg-[#0A0F1E] max-w-[100vw]"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[-50] overflow-hidden pointer-events-none bg-[#0A0F1E] max-w-[100vw]"
      aria-hidden
    >
      {isVideoPage ? (
        <>
          {!reduced && (
            <AnimatePresence mode="popLayout">
              <motion.video
                key={VIDEOS[activeIndex]}
                ref={videoRef}
                src={VIDEOS[activeIndex]}
                poster={POSTERS[activeIndex]}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0 h-full w-full object-cover object-center"
                style={{
                  filter: "blur(4px) brightness(0.85)",
                  WebkitFilter: "blur(4px) brightness(0.85)",
                  transform: "scale(1.04)",
                }}
              />
            </AnimatePresence>
          )}
          <div className="absolute inset-0 bg-[#0A0F1E]/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/20 via-transparent to-[#0A0F1E]/65" />
        </>
      ) : isVoiceShieldPage ? (
        <>
          <div className="absolute inset-0 bg-[#020617]" />
          <div className="absolute inset-0 bg-[url('/company-bg.png')] bg-cover bg-center mix-blend-overlay opacity-30 brightness-50" />
          <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.15)_0%,_rgba(2,6,23,1)_70%)]" />
          {/* Subtle shield-like radar rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-cyan-500/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-cyan-500/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[100px]" />
        </>
      ) : (
        <>
          <Image
            src="/company-bg.png"
            alt="Company Background"
            fill
            priority
            className="object-cover object-center brightness-[0.7]"
            quality={100}
          />
          <div className="absolute inset-0 bg-[#0A0F1E]/30" />
        </>
      )}
    </div>
  );
}
