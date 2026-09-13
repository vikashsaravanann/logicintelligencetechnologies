"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Accessible route change announcer for screen readers.
 * Notifies assistive technologies whenever page navigation occurs.
 */
export function RouteAnnouncer() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      // Determine page title or descriptive label
      const title = document.title || pathname.replace(/^\//, "").replace(/-/g, " ") || "Home";
      setAnnouncement(`Navigated to ${title}`);

      // Manage focus to main heading or main content region
      const mainHeading = document.querySelector<HTMLElement>("main h1, h1, [role='main']");
      if (mainHeading) {
        if (!mainHeading.getAttribute("tabIndex")) {
          mainHeading.setAttribute("tabIndex", "-1");
        }
        mainHeading.focus({ preventScroll: true });
      }
    });

    return () => cancelAnimationFrame(handle);
  }, [pathname]);

  return (
    <div
      aria-live="assertive"
      aria-atomic="true"
      className="sr-only"
      id="route-announcer"
    >
      {announcement}
    </div>
  );
}

export default RouteAnnouncer;
