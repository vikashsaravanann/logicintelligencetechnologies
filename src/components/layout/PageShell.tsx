import React from "react";
import { cn } from "@/lib/utils";
import RouteAnnouncer from "@/components/navigation/RouteAnnouncer";

export interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  withBackdropGlow?: boolean;
}

export function PageShell({
  children,
  className,
  withBackdropGlow = true,
}: PageShellProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-[#050814] text-white relative overflow-x-hidden",
        className
      )}
    >
      <RouteAnnouncer />

      {withBackdropGlow && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[520px] h-[520px] rounded-full bg-cyan-500/10 blur-[140px]" />
          <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full bg-blue-700/10 blur-[160px]" />
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </main>
  );
}

export default PageShell;
