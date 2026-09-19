import React from "react";
import VoiceShieldNavbar from "@/components/voice-shield/navbar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";

const ibm = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jetbrains",
});

export default function VoiceShieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className={`min-h-screen bg-[#030712] selection:bg-cyan-500/30 selection:text-cyan-50 ${ibm.variable} ${jetbrains.variable}`}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --font-ibm: ${ibm.style.fontFamily};
          --font-jetbrains: ${jetbrains.style.fontFamily};
        }
        body, .font-sans {
          font-family: var(--font-ibm), sans-serif !important;
        }
        .font-mono {
          font-family: var(--font-jetbrains), monospace !important;
        }
      `}} />
      <VoiceShieldNavbar />
      {children}
    </div>
  );
}
