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
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none z-[-1]", className)}>

      {/* Animated Liquid Orbs (Emerald / Green / Cyan Theme) — clamped to viewport */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-[5%] left-[5%] w-[50vw] h-[45vw] rounded-[40%_60%_70%_30%] bg-emerald-500/60 blur-[80px] animate-[spin_20s_linear_infinite] mix-blend-screen will-change-transform transform-gpu" />
        <div className="absolute top-[20%] right-[5%] w-[45vw] h-[55vw] rounded-[60%_40%_30%_70%] bg-cyan-500/50 blur-[70px] animate-[spin_25s_linear_infinite_reverse] mix-blend-screen will-change-transform transform-gpu" />
        <div className="absolute bottom-[5%] left-[20%] w-[50vw] h-[40vw] rounded-[50%_50%_60%_40%] bg-teal-400/50 blur-[90px] animate-[spin_30s_linear_infinite] mix-blend-screen will-change-transform transform-gpu" />
      </div>
      
      {/* Noise Overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
    </div>
  );
}
