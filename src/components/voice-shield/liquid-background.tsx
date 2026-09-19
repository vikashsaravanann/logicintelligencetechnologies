"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function LiquidBackground({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none -z-10", className)}>
      {/* Dark Base */}
      <div className="absolute inset-0 bg-[#030712]" />
      
      {/* Animated Liquid Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/30 blur-[120px] mix-blend-screen animate-[spin_20s_linear_infinite]" />
      <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-violet-600/30 blur-[100px] mix-blend-screen animate-[spin_25s_linear_infinite_reverse]" />
      <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-blue-600/20 blur-[140px] mix-blend-screen animate-[spin_30s_linear_infinite]" />
      
      {/* Noise Overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
    </div>
  );
}
