"use client";

import { useEffect, useRef, useState } from "react";
import WebGLParticles from "@/components/motion/webgl-particles";

/**
 * Site-wide tech ambient layer:
 * - looping muted video at 30% opacity
 * - dark navy scrim so text never washes out
 * - WebGL particle field as secondary motion
 * - respects prefers-reduced-motion
 */
export default function AmbientTechBackground({
  opacity = 0.3,
}: {
  opacity?: number;
}) {
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
    v.playsInline = true;
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
          style={{ opacity: ready ? opacity : 0, transition: "opacity 1.2s ease" }}
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
        <div className="absolute inset-0 opacity-40">
          <WebGLParticles className="h-full w-full" />
        </div>
      )}

      <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-primary/5 blur-[90px]" />

      <div className="absolute inset-0 bg-[#0A0F1E]/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E]/45 via-[#0A0F1E]/50 to-[#0A0F1E]/85" />
    </div>
  );
}
