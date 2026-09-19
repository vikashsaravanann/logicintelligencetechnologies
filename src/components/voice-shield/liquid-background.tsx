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
      <div className="absolute inset-0 bg-[#050A15]" />
      
      {/* Animated Liquid Orbs (Emerald / Green / Cyan Theme) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[50vw] rounded-[40%_60%_70%_30%] bg-emerald-500/40 blur-[100px] mix-blend-normal animate-[spin_20s_linear_infinite]" />
      <div className="absolute top-[20%] right-[-15%] w-[50vw] h-[60vw] rounded-[60%_40%_30%_70%] bg-cyan-500/30 blur-[90px] mix-blend-normal animate-[spin_25s_linear_infinite_reverse]" />
      <div className="absolute bottom-[-20%] left-[15%] w-[55vw] h-[45vw] rounded-[50%_50%_60%_40%] bg-teal-400/30 blur-[120px] mix-blend-normal animate-[spin_30s_linear_infinite]" />
      
      {/* Noise Overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
    </div>
  );
}
