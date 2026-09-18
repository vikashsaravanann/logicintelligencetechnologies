"use client";

import { useEffect, useRef, useState } from "react";
import WebGLParticles from "@/components/motion/webgl-particles";

/**
 * Site-wide tech ambient layer (no opacity blend on the video).
 * Full-opacity loop + light navy scrim so UI text stays readable.
 * Mobile: playsInline + muted for autoplay; respects reduced-motion.
 */
export default function AmbientTechBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduced) return;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    const play = () => {
      v.play().then(() => setReady(true)).catch(() => setReady(false));
    };
    if (v.readyState >= 2) play();
    else v.addEventListener("loadeddata", play, { once: true });
  }, [reduced]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#0A0F1E]" />

      {!reduced && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: ready ? 1 : 0,
            transition: "opacity 1s ease",
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/banner.jpg"
        >
          <source src="/assets/ambient/tech-loop.webm" type="video/webm" />
          <source src="/assets/ambient/tech-loop.mp4" type="video/mp4" />
        </video>
      )}

      {!reduced && (
        <div className="absolute inset-0 opacity-30">
          <WebGLParticles className="h-full w-full" />
        </div>
      )}

      <div className="absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-primary/10 blur-[90px] sm:h-72 sm:w-72" />
      <div className="absolute top-1/3 right-0 h-64 w-64 rounded-full bg-accent/10 blur-[100px] sm:h-80 sm:w-80" />

      {/* Light scrim only — video remains fully visible; text still readable */}
      <div className="absolute inset-0 bg-[#0A0F1E]/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/25 via-transparent to-[#0A0F1E]/70" />
    </div>
  );
}
