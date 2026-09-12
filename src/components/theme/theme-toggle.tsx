"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

type ThemeToggleProps = {
  className?: string;
  /** Icon-only circular control (chat header) vs labeled pill (site nav). */
  variant?: "icon" | "pill";
};

export function ThemeToggle({ className = "", variant = "icon" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const dark = mounted && resolvedTheme !== "light";

  function toggle() {
    setTheme(dark ? "light" : "dark");
  }

  const label = dark ? "Switch to light mode" : "Switch to dark mode";

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        title={label}
        className={`inline-flex flex-row items-center justify-center gap-2 h-10 px-4 rounded-full border border-white/15 bg-white/[0.06] text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-200 hover:bg-white/10 whitespace-nowrap shrink-0 ${className}`}
      >
        {mounted ? dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 opacity-40" />}
        <span className="leading-none">{mounted ? (dark ? "Light" : "Dark") : "Theme"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`h-8 w-8 shrink-0 grid place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white hover:bg-white/10 ${className}`}
    >
      {mounted ? (
        dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />
      ) : (
        <Sun className="w-3.5 h-3.5 opacity-40" />
      )}
    </button>
  );
}
